import { create } from 'zustand';
import {
  HARDWARE_CATALOG,
  getAutoWireColor,
  getPinDef,
  makePinKey,
} from '../engine/catalog';
import { createRuleRuntimeState, evaluateSimulationStep } from '../engine/blockRunner';
import {
  DEFAULT_ENVIRONMENT,
  MISSIONS,
  calculateTotalCost,
  evaluateMission,
  getMissionById,
} from '../engine/missions';
import { audioEngine } from '../engine/sound';
import type {
  CircuitAnalysis,
  ComponentType,
  EnvironmentState,
  Language,
  LogicBlockRule,
  MissionEvaluation,
  MultimeterProbe,
  PlacedComponent,
  SandboxSaveFile,
  SimulationOutputs,
  ToolMode,
  WireConnection,
  WorkbenchSnapshot,
} from '../types/game';

interface HoveredPinInfo {
  componentId: string;
  pinId: string;
  label: string;
  componentName: string;
  worldPos: [number, number, number];
}

interface PendingWireStart {
  componentId: string;
  pinId: string;
}

interface GameState {
  language: Language;
  activeMissionId: string;
  toolMode: ToolMode;
  placingType: ComponentType | null;
  placementRotation: number;

  components: PlacedComponent[];
  wires: WireConnection[];
  rules: LogicBlockRule[];

  undoStack: WorkbenchSnapshot[];
  redoStack: WorkbenchSnapshot[];

  selectedComponentId: string | null;
  pendingWireStart: PendingWireStart | null;
  hoveredPin: HoveredPinInfo | null;

  isSimulating: boolean;
  xrayMode: boolean;
  environment: EnvironmentState;

  analysis: CircuitAnalysis;
  simOutputs: SimulationOutputs;

  // Modals & drawers
  missionPanelOpen: boolean;
  blockDrawerOpen: boolean;
  missionSelectorOpen: boolean;
  ipoModalOpen: boolean;
  hintDrawerOpen: boolean;
  multimeterOpen: boolean;
  probeA: MultimeterProbe | null;
  probeB: MultimeterProbe | null;

  hintsRevealed: number;
  evaluation: MissionEvaluation | null;
  completedStars: Record<string, number>;
  toastMessage: string | null;

  // Actions
  setLanguage: (lang: Language) => void;
  selectMission: (missionId: string) => void;
  resetMission: () => void;
  loadGuidedStarter: () => void;
  setToolMode: (mode: ToolMode) => void;
  startPlacing: (type: ComponentType | null) => void;
  rotatePlacementOrSelected: () => void;
  placeComponentAt: (x: number, z: number) => void;
  moveComponentTo: (id: string, x: number, z: number) => void;
  selectComponent: (id: string | null) => void;
  deleteComponent: (id: string) => void;
  clickPin: (componentId: string, pinId: string) => void;
  cancelActiveAction: () => void;
  deleteWire: (wireId: string) => void;
  clearWires: () => void;
  setHoveredPin: (info: HoveredPinInfo | null) => void;

  // Block coding
  addRule: () => void;
  updateRule: (ruleId: string, patch: Partial<LogicBlockRule>) => void;
  deleteRule: (ruleId: string) => void;

  // Simulation
  toggleSimulation: () => void;
  stopSimulation: () => void;
  tickSimulation: () => void;
  toggleXrayMode: () => void;
  setEnvironment: (patch: Partial<EnvironmentState>) => void;

  // Tools & UI
  toggleMissionPanel: () => void;
  toggleBlockDrawer: () => void;
  setMissionSelectorOpen: (open: boolean) => void;
  setIpoModalOpen: (open: boolean) => void;
  setHintDrawerOpen: (open: boolean) => void;
  revealNextHint: () => void;
  toggleMultimeter: () => void;
  clearMultimeterProbes: () => void;

  // Verification & Persistence
  verifyPrototype: () => void;
  closeEvaluation: () => void;
  undo: () => void;
  redo: () => void;
  exportSandboxJson: () => SandboxSaveFile;
  importSandboxJson: (data: SandboxSaveFile) => void;
  clearToast: () => void;
}

const STORAGE_KEY_STARS = 'rbt-workshop-3d-stars-v1';

function loadSavedStars(): Record<string, number> {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_STARS);
    return raw ? (JSON.parse(raw) as Record<string, number>) : {};
  } catch {
    return {};
  }
}

function persistStars(stars: Record<string, number>) {
  try {
    localStorage.setItem(STORAGE_KEY_STARS, JSON.stringify(stars));
  } catch {
    // ignore storage quota errors
  }
}

function makeId(prefix: string): string {
  return `${prefix}-${Math.random().toString(36).slice(2, 8)}`;
}

const ruleRuntime = createRuleRuntimeState();

const initialMission = MISSIONS[0];
const initialComponents: PlacedComponent[] = structuredClone(
  initialMission.starterComponents ?? []
);
const initialEval = evaluateSimulationStep(
  initialComponents,
  [],
  [],
  DEFAULT_ENVIRONMENT
);

function recompute(
  components: PlacedComponent[],
  wires: WireConnection[],
  rules: LogicBlockRule[],
  env: EnvironmentState,
  isSimulating: boolean
) {
  if (!isSimulating) {
    const step = evaluateSimulationStep(components, wires, [], env);
    return {
      analysis: step.analysis,
      simOutputs: { mcuPinOutputs: {}, actuatorStates: {}, sensorReadings: {} },
    };
  }
  const step = evaluateSimulationStep(components, wires, rules, env, ruleRuntime, Date.now());
  return { analysis: step.analysis, simOutputs: step.outputs };
}

export const useGameStore = create<GameState>((set, get) => {
  const pushUndo = (): WorkbenchSnapshot[] => {
    const { components, wires, rules, undoStack } = get();
    const snap: WorkbenchSnapshot = {
      components: structuredClone(components),
      wires: structuredClone(wires),
      rules: structuredClone(rules),
    };
    return [...undoStack.slice(-24), snap];
  };

  const showToast = (msg: string) => {
    set({ toastMessage: msg });
    window.setTimeout(() => {
      if (get().toastMessage === msg) set({ toastMessage: null });
    }, 3200);
  };

  return {
    language: 'en',
    activeMissionId: initialMission.id,
    toolMode: 'select',
    placingType: null,
    placementRotation: 0,

    components: initialComponents,
    wires: [],
    rules: [],

    undoStack: [],
    redoStack: [],

    selectedComponentId: null,
    pendingWireStart: null,
    hoveredPin: null,

    isSimulating: false,
    xrayMode: false,
    environment: { ...DEFAULT_ENVIRONMENT },

    analysis: initialEval.analysis,
    simOutputs: { mcuPinOutputs: {}, actuatorStates: {}, sensorReadings: {} },

    missionPanelOpen: true,
    blockDrawerOpen: false,
    missionSelectorOpen: false,
    ipoModalOpen: false,
    hintDrawerOpen: false,
    multimeterOpen: false,
    probeA: null,
    probeB: null,

    hintsRevealed: 0,
    evaluation: null,
    completedStars: loadSavedStars(),
    toastMessage: null,

    setLanguage: (language) => set({ language }),

    selectMission: (missionId) => {
      const mission = getMissionById(missionId);
      audioEngine.setBuzzerActive(false);
      ruleRuntime.holdUntilMs = {};
      ruleRuntime.heldOutputs = {};
      const starterComponents = structuredClone(mission.starterComponents ?? []);
      const starterWires = structuredClone(mission.starterWires ?? []);
      const starterRules = structuredClone(mission.starterRules ?? []);
      const env = { ...DEFAULT_ENVIRONMENT };
      const { analysis, simOutputs } = recompute(
        starterComponents,
        starterWires,
        starterRules,
        env,
        false
      );
      set({
        activeMissionId: mission.id,
        components: starterComponents,
        wires: starterWires,
        rules: starterRules,
        undoStack: [],
        redoStack: [],
        placingType: null,
        pendingWireStart: null,
        selectedComponentId: null,
        isSimulating: false,
        xrayMode: false,
        environment: env,
        analysis,
        simOutputs,
        hintsRevealed: 0,
        evaluation: null,
        probeA: null,
        probeB: null,
        blockDrawerOpen: mission.requiresCoding,
        missionSelectorOpen: false,
      });
    },

    resetMission: () => {
      const { activeMissionId } = get();
      audioEngine.setBuzzerActive(false);
      ruleRuntime.holdUntilMs = {};
      ruleRuntime.heldOutputs = {};
      const env = { ...DEFAULT_ENVIRONMENT };
      const { analysis, simOutputs } = recompute([], [], [], env, false);
      set({
        components: [],
        wires: [],
        rules: [],
        undoStack: [],
        redoStack: [],
        placingType: null,
        pendingWireStart: null,
        selectedComponentId: null,
        isSimulating: false,
        environment: env,
        analysis,
        simOutputs,
        evaluation: null,
        probeA: null,
        probeB: null,
      });
      showToast(
        get().language === 'bm'
          ? `Meja kerja dikosongkan (${getMissionById(activeMissionId).titleBm})`
          : `Workbench cleared (${getMissionById(activeMissionId).title})`
      );
    },

    loadGuidedStarter: () => {
      const mission = getMissionById(get().activeMissionId);
      const nextUndo = pushUndo();
      const components = structuredClone(mission.starterComponents ?? []);
      const wires = structuredClone(mission.starterWires ?? []);
      const rules = structuredClone(mission.starterRules ?? []);
      const { analysis, simOutputs } = recompute(
        components,
        wires,
        rules,
        get().environment,
        false
      );
      audioEngine.playSnap();
      set({
        components,
        wires,
        rules,
        undoStack: nextUndo,
        redoStack: [],
        isSimulating: false,
        pendingWireStart: null,
        analysis,
        simOutputs,
      });
    },

    setToolMode: (toolMode) =>
      set({
        toolMode,
        placingType: null,
        pendingWireStart: null,
        multimeterOpen: toolMode === 'multimeter' ? true : get().multimeterOpen,
      }),

    startPlacing: (type) => {
      if (!type) {
        set({ placingType: null });
        return;
      }
      const mission = getMissionById(get().activeMissionId);
      const currentCost = calculateTotalCost(get().components);
      const partCost = HARDWARE_CATALOG[type].cost;
      if (mission.budget !== Infinity && currentCost + partCost > mission.budget) {
        showToast(
          get().language === 'bm'
            ? `Bajet tidak mencukupi (RM ${partCost} diperlukan)`
            : `Insufficient budget (RM ${partCost} required)`
        );
        return;
      }
      set({
        placingType: type,
        placementRotation: 0,
        pendingWireStart: null,
        toolMode: 'select',
      });
    },

    rotatePlacementOrSelected: () => {
      const { placingType, placementRotation, selectedComponentId, components, wires, rules, environment, isSimulating } = get();
      if (placingType) {
        audioEngine.playSnap();
        set({ placementRotation: (placementRotation + Math.PI / 2) % (Math.PI * 2) });
        return;
      }
      if (selectedComponentId) {
        const nextUndo = pushUndo();
        const nextComponents = components.map((c) =>
          c.id === selectedComponentId
            ? { ...c, rotation: (c.rotation + Math.PI / 2) % (Math.PI * 2) }
            : c
        );
        const { analysis, simOutputs } = recompute(nextComponents, wires, rules, environment, isSimulating);
        audioEngine.playSnap();
        set({ components: nextComponents, undoStack: nextUndo, redoStack: [], analysis, simOutputs });
      }
    },

    placeComponentAt: (x, z) => {
      const { placingType, placementRotation, components, wires, rules, environment, isSimulating, activeMissionId } = get();
      if (!placingType) return;
      const mission = getMissionById(activeMissionId);
      const currentCost = calculateTotalCost(components);
      const partCost = HARDWARE_CATALOG[placingType].cost;
      if (mission.budget !== Infinity && currentCost + partCost > mission.budget) {
        showToast(
          get().language === 'bm'
            ? 'Bajet RM misi telah penuh!'
            : 'Mission RM budget limit reached!'
        );
        set({ placingType: null });
        return;
      }
      const snappedX = Math.round(x);
      const snappedZ = Math.round(z);
      const newComp: PlacedComponent = {
        id: makeId(placingType.slice(0, 4)),
        type: placingType,
        position: [snappedX, 0, snappedZ],
        rotation: placementRotation,
      };
      const nextUndo = pushUndo();
      const nextComponents = [...components, newComp];
      const { analysis, simOutputs } = recompute(nextComponents, wires, rules, environment, isSimulating);
      audioEngine.playSnap();
      set({
        components: nextComponents,
        undoStack: nextUndo,
        redoStack: [],
        placingType: null,
        selectedComponentId: newComp.id,
        analysis,
        simOutputs,
      });
    },

    moveComponentTo: (id, x, z) => {
      const { components, wires, rules, environment, isSimulating } = get();
      const snappedX = Math.max(-13, Math.min(13, Math.round(x)));
      const snappedZ = Math.max(-8, Math.min(8, Math.round(z)));
      const nextComponents = components.map((c) =>
        c.id === id ? { ...c, position: [snappedX, 0, snappedZ] as [number, number, number] } : c
      );
      const { analysis, simOutputs } = recompute(nextComponents, wires, rules, environment, isSimulating);
      audioEngine.playSnap();
      set({ components: nextComponents, analysis, simOutputs });
    },

    selectComponent: (id) => {
      const { toolMode } = get();
      if (id && toolMode === 'delete') {
        get().deleteComponent(id);
        return;
      }
      set({ selectedComponentId: id });
    },

    deleteComponent: (id) => {
      const { components, wires, rules, environment, isSimulating } = get();
      const nextUndo = pushUndo();
      const nextComponents = components.filter((c) => c.id !== id);
      const nextWires = wires.filter((w) => w.fromComponentId !== id && w.toComponentId !== id);
      const { analysis, simOutputs } = recompute(nextComponents, nextWires, rules, environment, isSimulating);
      audioEngine.playSnap();
      set({
        components: nextComponents,
        wires: nextWires,
        undoStack: nextUndo,
        redoStack: [],
        selectedComponentId: null,
        pendingWireStart: null,
        analysis,
        simOutputs,
      });
    },

    clickPin: (componentId, pinId) => {
      const {
        toolMode,
        multimeterOpen,
        probeA,
        pendingWireStart,
        components,
        wires,
        rules,
        environment,
        isSimulating,
      } = get();

      const comp = components.find((c) => c.id === componentId);
      if (!comp) return;
      const pinDef = getPinDef(comp.type, pinId);

      // Multimeter probing mode
      if (toolMode === 'multimeter' || (multimeterOpen && !pendingWireStart && toolMode !== 'wire')) {
        const probe: MultimeterProbe = {
          componentId,
          pinId,
          label: `${HARDWARE_CATALOG[comp.type].name.split(' ')[0]} · ${pinDef?.label ?? pinId}`,
        };
        audioEngine.playWireClick();
        if (!probeA || (get().probeA && get().probeB)) {
          set({ probeA: probe, probeB: null });
        } else {
          set({ probeB: probe });
        }
        return;
      }

      // Wire creation mode
      if (!pendingWireStart) {
        audioEngine.playWireClick();
        set({ pendingWireStart: { componentId, pinId }, placingType: null });
        return;
      }

      // Clicking the same pin cancels
      if (pendingWireStart.componentId === componentId && pendingWireStart.pinId === pinId) {
        set({ pendingWireStart: null });
        return;
      }

      // Prevent exact duplicate wire
      const duplicate = wires.some(
        (w) =>
          (w.fromComponentId === pendingWireStart.componentId &&
            w.fromPinId === pendingWireStart.pinId &&
            w.toComponentId === componentId &&
            w.toPinId === pinId) ||
          (w.toComponentId === pendingWireStart.componentId &&
            w.toPinId === pendingWireStart.pinId &&
            w.fromComponentId === componentId &&
            w.fromPinId === pinId)
      );

      if (duplicate) {
        set({ pendingWireStart: null });
        return;
      }

      const startComp = components.find((c) => c.id === pendingWireStart.componentId);
      const startPinDef = startComp ? getPinDef(startComp.type, pendingWireStart.pinId) : undefined;
      const color = getAutoWireColor(startPinDef, pinDef);

      const newWire: WireConnection = {
        id: makeId('wire'),
        fromComponentId: pendingWireStart.componentId,
        fromPinId: pendingWireStart.pinId,
        toComponentId: componentId,
        toPinId: pinId,
        color,
      };

      const nextUndo = pushUndo();
      const nextWires = [...wires, newWire];
      const { analysis, simOutputs } = recompute(components, nextWires, rules, environment, isSimulating);

      if (analysis.faults.some((f) => f.severity === 'critical')) {
        audioEngine.playFaultZap();
      } else {
        audioEngine.playWireClick();
      }

      set({
        wires: nextWires,
        undoStack: nextUndo,
        redoStack: [],
        pendingWireStart: null,
        analysis,
        simOutputs,
      });
    },

    cancelActiveAction: () =>
      set({
        placingType: null,
        pendingWireStart: null,
        selectedComponentId: null,
      }),

    deleteWire: (wireId) => {
      const { components, wires, rules, environment, isSimulating } = get();
      const nextUndo = pushUndo();
      const nextWires = wires.filter((w) => w.id !== wireId);
      const { analysis, simOutputs } = recompute(components, nextWires, rules, environment, isSimulating);
      audioEngine.playSnap();
      set({ wires: nextWires, undoStack: nextUndo, redoStack: [], analysis, simOutputs });
    },

    clearWires: () => {
      const { components, rules, environment, isSimulating } = get();
      const nextUndo = pushUndo();
      const { analysis, simOutputs } = recompute(components, [], rules, environment, isSimulating);
      audioEngine.playSnap();
      set({
        wires: [],
        undoStack: nextUndo,
        redoStack: [],
        pendingWireStart: null,
        analysis,
        simOutputs,
      });
    },

    setHoveredPin: (hoveredPin) => set({ hoveredPin }),

    addRule: () => {
      const { rules, components, wires, environment, isSimulating, analysis } = get();
      const defaultSensorPin = analysis.connectedSensors[0]?.mcuPin ?? 'A0';
      const firstOut = analysis.connectedOutputs[0];
      const defaultOutputPin = firstOut?.mcuPin ?? 'D4';
      const isServo = firstOut?.type === 'servo_motor';

      const newRule: LogicBlockRule = {
        id: makeId('rule'),
        sensorPin: defaultSensorPin,
        operator: '<',
        threshold: defaultSensorPin.startsWith('A') ? 40 : 25,
        thenActions: [
          {
            outputPin: defaultOutputPin,
            mode: isServo ? 'PWM' : 'DIGITAL',
            value: isServo ? 90 : 1,
          },
        ],
        elseActions: [
          {
            outputPin: defaultOutputPin,
            mode: isServo ? 'PWM' : 'DIGITAL',
            value: 0,
          },
        ],
        waitSeconds: 0,
        enabled: true,
      };
      const nextUndo = pushUndo();
      const nextRules = [...rules, newRule];
      const result = recompute(components, wires, nextRules, environment, isSimulating);
      set({ rules: nextRules, undoStack: nextUndo, redoStack: [], ...result });
    },

    updateRule: (ruleId, patch) => {
      const { rules, components, wires, environment, isSimulating } = get();
      const nextRules = rules.map((r) => (r.id === ruleId ? { ...r, ...patch } : r));
      const result = recompute(components, wires, nextRules, environment, isSimulating);
      set({ rules: nextRules, ...result });
    },

    deleteRule: (ruleId) => {
      const { rules, components, wires, environment, isSimulating } = get();
      const nextUndo = pushUndo();
      const nextRules = rules.filter((r) => r.id !== ruleId);
      const result = recompute(components, wires, nextRules, environment, isSimulating);
      set({ rules: nextRules, undoStack: nextUndo, redoStack: [], ...result });
    },

    toggleSimulation: () => {
      const { isSimulating, components, wires, rules, environment } = get();
      const nextSim = !isSimulating;
      ruleRuntime.holdUntilMs = {};
      ruleRuntime.heldOutputs = {};

      if (!nextSim) {
        audioEngine.setBuzzerActive(false);
        const result = recompute(components, wires, rules, environment, false);
        set({ isSimulating: false, ...result });
        return;
      }

      const result = recompute(components, wires, rules, environment, true);
      if (result.analysis.faults.some((f) => f.severity === 'critical')) {
        audioEngine.playFaultZap();
      } else {
        audioEngine.playSnap();
      }
      set({ isSimulating: true, pendingWireStart: null, placingType: null, ...result });
    },

    stopSimulation: () => {
      audioEngine.setBuzzerActive(false);
      const { components, wires, rules, environment } = get();
      const result = recompute(components, wires, rules, environment, false);
      set({ isSimulating: false, ...result });
    },

    tickSimulation: () => {
      const { isSimulating, components, wires, rules, environment } = get();
      if (!isSimulating) return;
      const result = recompute(components, wires, rules, environment, true);

      // Drive live buzzer audio
      const anyBuzzerOn = components.some(
        (c) => c.type === 'buzzer' && (result.simOutputs.actuatorStates[c.id] ?? 0) >= 0.5
      );
      audioEngine.setBuzzerActive(anyBuzzerOn);
      set({ analysis: result.analysis, simOutputs: result.simOutputs });
    },

    toggleXrayMode: () => set((s) => ({ xrayMode: !s.xrayMode })),

    setEnvironment: (patch) => {
      const nextEnv = { ...get().environment, ...patch };
      const { components, wires, rules, isSimulating } = get();
      const result = recompute(components, wires, rules, nextEnv, isSimulating);
      set({ environment: nextEnv, ...result });
    },

    toggleMissionPanel: () => set((s) => ({ missionPanelOpen: !s.missionPanelOpen })),
    toggleBlockDrawer: () => set((s) => ({ blockDrawerOpen: !s.blockDrawerOpen })),
    setMissionSelectorOpen: (missionSelectorOpen) => set({ missionSelectorOpen }),
    setIpoModalOpen: (ipoModalOpen) => set({ ipoModalOpen }),
    setHintDrawerOpen: (hintDrawerOpen) => set({ hintDrawerOpen }),

    revealNextHint: () =>
      set((s) => ({ hintsRevealed: Math.min(3, s.hintsRevealed + 1) })),

    toggleMultimeter: () =>
      set((s) => {
        const nextOpen = !s.multimeterOpen;
        return {
          multimeterOpen: nextOpen,
          toolMode: nextOpen ? 'multimeter' : s.toolMode === 'multimeter' ? 'select' : s.toolMode,
          probeA: nextOpen ? s.probeA : null,
          probeB: nextOpen ? s.probeB : null,
        };
      }),

    clearMultimeterProbes: () => set({ probeA: null, probeB: null }),

    verifyPrototype: () => {
      const { activeMissionId, components, wires, rules, hintsRevealed, completedStars } = get();
      const mission = getMissionById(activeMissionId);
      const evaluation = evaluateMission(mission, components, wires, rules, hintsRevealed);

      if (evaluation.passed) {
        audioEngine.playVictory();
        const best = Math.max(completedStars[mission.id] ?? 0, evaluation.stars);
        const updated = { ...completedStars, [mission.id]: best };
        persistStars(updated);
        set({ evaluation, completedStars: updated });
      } else {
        if (!evaluation.safetyOk) audioEngine.playFaultZap();
        set({ evaluation });
      }
    },

    closeEvaluation: () => set({ evaluation: null }),

    undo: () => {
      const { undoStack, redoStack, components, wires, rules, environment, isSimulating } = get();
      if (undoStack.length === 0) return;
      const prev = undoStack[undoStack.length - 1];
      const currentSnap: WorkbenchSnapshot = {
        components: structuredClone(components),
        wires: structuredClone(wires),
        rules: structuredClone(rules),
      };
      const result = recompute(prev.components, prev.wires, prev.rules, environment, isSimulating);
      set({
        components: prev.components,
        wires: prev.wires,
        rules: prev.rules,
        undoStack: undoStack.slice(0, -1),
        redoStack: [...redoStack.slice(-24), currentSnap],
        ...result,
      });
    },

    redo: () => {
      const { undoStack, redoStack, components, wires, rules, environment, isSimulating } = get();
      if (redoStack.length === 0) return;
      const next = redoStack[redoStack.length - 1];
      const currentSnap: WorkbenchSnapshot = {
        components: structuredClone(components),
        wires: structuredClone(wires),
        rules: structuredClone(rules),
      };
      const result = recompute(next.components, next.wires, next.rules, environment, isSimulating);
      set({
        components: next.components,
        wires: next.wires,
        rules: next.rules,
        undoStack: [...undoStack.slice(-24), currentSnap],
        redoStack: redoStack.slice(0, -1),
        ...result,
      });
    },

    exportSandboxJson: () => {
      const { activeMissionId, components, wires, rules } = get();
      return {
        version: 1,
        app: 'rbt-workshop-3d',
        savedAt: new Date().toISOString(),
        missionId: activeMissionId,
        components,
        wires,
        rules,
      };
    },

    importSandboxJson: (data) => {
      if (!data || data.app !== 'rbt-workshop-3d' || !Array.isArray(data.components)) {
        showToast(get().language === 'bm' ? 'Fail JSON tidak sah' : 'Invalid RBT Workshop JSON file');
        return;
      }
      const nextUndo = pushUndo();
      const result = recompute(data.components, data.wires ?? [], data.rules ?? [], get().environment, false);
      audioEngine.playSnap();
      set({
        components: data.components,
        wires: data.wires ?? [],
        rules: data.rules ?? [],
        undoStack: nextUndo,
        redoStack: [],
        isSimulating: false,
        ...result,
      });
      showToast(get().language === 'bm' ? 'Projek JSON berjaya dimuatkan!' : 'Project JSON loaded!');
    },

    clearToast: () => set({ toastMessage: null }),
  };
});

export { makePinKey };
