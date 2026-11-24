import { analyzeCircuit, getSensorNumericValue } from './circuitGraph';
import type {
  CircuitAnalysis,
  ComparisonOperator,
  EnvironmentState,
  LogicBlockRule,
  PlacedComponent,
  SimulationOutputs,
  WireConnection,
} from '../types/game';

export interface RuleRuntimeState {
  /** Timestamp (ms) until which the rule holds its last action due to WAIT */
  holdUntilMs: Record<string, number>;
  /** Cached actions per rule while holding */
  heldOutputs: Record<string, Record<string, number>>;
}

export function createRuleRuntimeState(): RuleRuntimeState {
  return { holdUntilMs: {}, heldOutputs: {} };
}

function compareValues(lhs: number, op: ComparisonOperator, rhs: number): boolean {
  switch (op) {
    case '<':
      return lhs < rhs;
    case '>':
      return lhs > rhs;
    case '=':
      return Math.abs(lhs - rhs) < 0.001;
    case '<=':
      return lhs <= rhs;
    case '>=':
      return lhs >= rhs;
    default:
      return false;
  }
}

export function evaluateSimulationStep(
  components: PlacedComponent[],
  wires: WireConnection[],
  rules: LogicBlockRule[],
  env: EnvironmentState,
  runtimeState?: RuleRuntimeState,
  nowMs = Date.now()
): { analysis: CircuitAnalysis; outputs: SimulationOutputs } {
  // Pass 1: Analyze circuit without relays energized to read powered sensors & MCU connections
  const baseAnalysis = analyzeCircuit(components, wires, env);
  const hasCriticalFault = baseAnalysis.faults.some((f) => f.severity === 'critical');

  const sensorReadings: Record<string, number> = {};
  const mcuPinOutputs: Record<string, number> = {};

  if (!hasCriticalFault) {
    // Map each powered connected sensor's reading to its MCU pin
    for (const sensor of baseAnalysis.connectedSensors) {
      if (sensor.powered) {
        sensorReadings[sensor.mcuPin] = getSensorNumericValue(sensor.type, env);
      }
    }

    // Evaluate LogicBlockRules
    for (const rule of rules) {
      if (!rule.enabled) continue;

      // Respect non-blocking WAIT timer if runtimeState is supplied
      if (runtimeState && runtimeState.holdUntilMs[rule.id] && nowMs < runtimeState.holdUntilMs[rule.id]) {
        const held = runtimeState.heldOutputs[rule.id];
        if (held) {
          Object.assign(mcuPinOutputs, held);
          continue;
        }
      }

      // Only evaluate sensor condition if a powered sensor is actually wired to rule.sensorPin
      if (!(rule.sensorPin in sensorReadings)) {
        continue;
      }

      const reading = sensorReadings[rule.sensorPin];
      const condTrue = compareValues(reading, rule.operator, rule.threshold);
      const actions = condTrue ? rule.thenActions : rule.elseActions;

      const applied: Record<string, number> = {};
      for (const act of actions) {
        mcuPinOutputs[act.outputPin] = act.value;
        applied[act.outputPin] = act.value;
      }

      if (runtimeState && condTrue && rule.waitSeconds > 0) {
        runtimeState.holdUntilMs[rule.id] = nowMs + rule.waitSeconds * 1000;
        runtimeState.heldOutputs[rule.id] = applied;
      }
    }
  }

  // Detect energized relays controlled by MCU pins
  const energizedRelays = new Set<string>();
  if (!hasCriticalFault) {
    for (const out of baseAnalysis.connectedOutputs) {
      if (out.type === 'relay' && out.powered && (mcuPinOutputs[out.mcuPin] ?? 0) > 0) {
        energizedRelays.add(out.componentId);
      }
    }
  }

  // Pass 2: Re-analyze with energized relays & live MCU outputs so switched loads (e.g., Relay -> Pump) energize cleanly
  const finalAnalysis = analyzeCircuit(components, wires, env, energizedRelays, mcuPinOutputs);
  const finalHasCriticalFault = finalAnalysis.faults.some((f) => f.severity === 'critical');

  const actuatorStates: Record<string, number> = {};

  if (!finalHasCriticalFault) {
    // 1. Direct electrical loads (Battery -> Switch -> Lamp/Fan, or Battery -> Relay COM/NO -> Water Pump)
    for (const [compId, active] of Object.entries(finalAnalysis.directPoweredOutputs)) {
      if (active) {
        actuatorStates[compId] = 1;
      }
    }

    // 2. MCU-driven outputs
    for (const out of finalAnalysis.connectedOutputs) {
      if (!out.powered) continue;
      const val = mcuPinOutputs[out.mcuPin] ?? 0;
      if (out.type === 'servo_motor') {
        actuatorStates[out.componentId] = Math.max(0, Math.min(180, val));
      } else if (val > 0) {
        actuatorStates[out.componentId] = 1;
      } else if (!(out.componentId in actuatorStates)) {
        actuatorStates[out.componentId] = 0;
      }
    }
  }

  return {
    analysis: finalAnalysis,
    outputs: {
      mcuPinOutputs,
      actuatorStates,
      sensorReadings,
    },
  };
}
