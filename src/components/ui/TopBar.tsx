import React from 'react';
import {
  Activity,
  CheckCircle2,
  Cpu,
  Eye,
  FolderOpen,
  Gauge,
  HelpCircle,
  Layers,
  MousePointer2,
  Move,
  Play,
  Redo2,
  RotateCcw,
  RotateCw,
  Square,
  Trash2,
  Undo2,
  Workflow,
  Zap,
} from 'lucide-react';
import { calculateTotalCost, getMissionById } from '../../engine/missions';
import { t } from '../../i18n/translations';
import { useGameStore } from '../../store/useGameStore';
import type { ToolMode } from '../../types/game';

export const TopBar: React.FC = () => {
  const language = useGameStore((s) => s.language);
  const setLanguage = useGameStore((s) => s.setLanguage);
  const activeMissionId = useGameStore((s) => s.activeMissionId);
  const components = useGameStore((s) => s.components);
  const toolMode = useGameStore((s) => s.toolMode);
  const setToolMode = useGameStore((s) => s.setToolMode);
  const rotatePlacementOrSelected = useGameStore((s) => s.rotatePlacementOrSelected);
  const isSimulating = useGameStore((s) => s.isSimulating);
  const toggleSimulation = useGameStore((s) => s.toggleSimulation);
  const xrayMode = useGameStore((s) => s.xrayMode);
  const toggleXrayMode = useGameStore((s) => s.toggleXrayMode);
  const multimeterOpen = useGameStore((s) => s.multimeterOpen);
  const toggleMultimeter = useGameStore((s) => s.toggleMultimeter);
  const setMissionSelectorOpen = useGameStore((s) => s.setMissionSelectorOpen);
  const setIpoModalOpen = useGameStore((s) => s.setIpoModalOpen);
  const setHintDrawerOpen = useGameStore((s) => s.setHintDrawerOpen);
  const verifyPrototype = useGameStore((s) => s.verifyPrototype);
  const resetMission = useGameStore((s) => s.resetMission);
  const undo = useGameStore((s) => s.undo);
  const redo = useGameStore((s) => s.redo);
  const undoCount = useGameStore((s) => s.undoStack.length);
  const redoCount = useGameStore((s) => s.redoStack.length);

  const mission = getMissionById(activeMissionId);
  const spent = calculateTotalCost(components);
  const isUnlimited = mission.budget === Infinity;
  const remaining = isUnlimited ? Infinity : mission.budget - spent;
  const overBudget = !isUnlimited && remaining < 0;

  const tools: { mode: ToolMode; label: string; icon: React.ReactNode }[] = [
    { mode: 'select', label: t(language, 'toolSelect'), icon: <MousePointer2 className="w-3.5 h-3.5" /> },
    { mode: 'wire', label: t(language, 'toolWire'), icon: <Zap className="w-3.5 h-3.5" /> },
    { mode: 'move', label: t(language, 'toolMove'), icon: <Move className="w-3.5 h-3.5" /> },
    { mode: 'delete', label: t(language, 'toolDelete'), icon: <Trash2 className="w-3.5 h-3.5" /> },
  ];

  return (
    <header className="pointer-events-auto h-13 px-3 py-2 bg-[#12191e]/95 border-b border-slate-700/70 backdrop-blur flex items-center justify-between gap-2 z-30">
      {/* Left: Brand & Mission Selector */}
      <div className="flex items-center gap-2.5 min-w-0">
        <div className="flex items-center gap-2 pr-2.5 border-r border-slate-700/80 shrink-0">
          <div className="w-7 h-7 rounded bg-amber-500/15 border border-amber-500/50 flex items-center justify-center text-amber-400">
            <Cpu className="w-4 h-4" />
          </div>
          <div className="leading-tight hidden xl:block">
            <div className="text-xs font-bold tracking-wide text-slate-100 uppercase">
              {t(language, 'appName')}
            </div>
            <div className="text-[10px] text-slate-400 font-mono">KSSM F2–F3</div>
          </div>
        </div>

        <button
          onClick={() => setMissionSelectorOpen(true)}
          className="flex items-center gap-2 px-2.5 py-1.5 rounded bg-slate-800/80 hover:bg-slate-700/80 border border-slate-600/60 transition text-left min-w-0"
          title={t(language, 'missions')}
        >
          <FolderOpen className="w-3.5 h-3.5 text-amber-400 shrink-0" />
          <div className="truncate max-w-[210px]">
            <div className="text-xs font-semibold text-slate-100 truncate">
              {mission.number > 0 ? `M${mission.number}: ` : ''}
              {language === 'bm' ? mission.titleBm : mission.title}
            </div>
          </div>
        </button>

        {/* Budget Meter */}
        <div
          className={`hidden md:flex items-center gap-1.5 px-2.5 py-1 rounded border text-xs font-mono shrink-0 ${
            overBudget
              ? 'bg-red-950/70 border-red-500/60 text-red-300'
              : 'bg-slate-900/80 border-slate-700/80 text-emerald-300'
          }`}
        >
          <span className="text-slate-400 text-[10px] uppercase">{t(language, 'budget')}:</span>
          <span className="font-semibold">
            {isUnlimited ? `∞ ${t(language, 'unlimited')}` : `RM ${remaining} / ${mission.budget}`}
          </span>
        </div>
      </div>

      {/* Center: Workbench Tools */}
      <div className="hidden lg:flex items-center gap-1 bg-slate-900/90 border border-slate-700/70 rounded p-0.5">
        {tools.map((item) => (
          <button
            key={item.mode}
            onClick={() => setToolMode(item.mode)}
            className={`flex items-center gap-1 px-2 py-1 rounded text-xs font-medium transition ${
              toolMode === item.mode
                ? 'bg-amber-500 text-slate-950 font-semibold'
                : 'text-slate-300 hover:bg-slate-800'
            }`}
          >
            {item.icon}
            <span>{item.label}</span>
          </button>
        ))}

        <div className="w-px h-4 bg-slate-700 mx-0.5" />

        <button
          onClick={rotatePlacementOrSelected}
          className="p-1.5 rounded text-slate-300 hover:bg-slate-800 hover:text-amber-300 transition"
          title="Rotate Selected / Placing (R)"
        >
          <RotateCw className="w-3.5 h-3.5" />
        </button>
        <button
          onClick={undo}
          disabled={undoCount === 0}
          className="p-1.5 rounded text-slate-300 hover:bg-slate-800 disabled:opacity-35 transition"
          title={`${t(language, 'undo')} (Ctrl+Z)`}
        >
          <Undo2 className="w-3.5 h-3.5" />
        </button>
        <button
          onClick={redo}
          disabled={redoCount === 0}
          className="p-1.5 rounded text-slate-300 hover:bg-slate-800 disabled:opacity-35 transition"
          title={`${t(language, 'redo')} (Ctrl+Y)`}
        >
          <Redo2 className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Right: Simulation, Diagnostics & Syllabus Controls */}
      <div className="flex items-center gap-1.5 shrink-0">
        <button
          onClick={toggleSimulation}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded text-xs font-semibold transition border ${
            isSimulating
              ? 'bg-rose-600 hover:bg-rose-500 border-rose-400/50 text-white'
              : 'bg-emerald-600 hover:bg-emerald-500 border-emerald-400/50 text-white'
          }`}
        >
          {isSimulating ? <Square className="w-3.5 h-3.5 fill-current" /> : <Play className="w-3.5 h-3.5 fill-current" />}
          <span>{isSimulating ? t(language, 'stop') : t(language, 'run')}</span>
        </button>

        {mission.testCases.length > 0 && (
          <button
            onClick={verifyPrototype}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded text-xs font-semibold bg-amber-500 hover:bg-amber-400 text-slate-950 transition"
            title={t(language, 'verify')}
          >
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">{t(language, 'verify')}</span>
          </button>
        )}

        <button
          onClick={toggleXrayMode}
          className={`flex items-center gap-1 px-2 py-1.5 rounded text-xs border transition ${
            xrayMode
              ? 'bg-sky-500/20 border-sky-400 text-sky-300'
              : 'bg-slate-800/80 border-slate-700 text-slate-300 hover:bg-slate-700'
          }`}
          title={t(language, 'xray')}
        >
          <Eye className="w-3.5 h-3.5" />
          <span className="hidden xl:inline">{t(language, 'xray')}</span>
        </button>

        <button
          onClick={toggleMultimeter}
          className={`flex items-center gap-1 px-2 py-1.5 rounded text-xs border transition ${
            multimeterOpen
              ? 'bg-amber-500/20 border-amber-400 text-amber-300'
              : 'bg-slate-800/80 border-slate-700 text-slate-300 hover:bg-slate-700'
          }`}
          title={t(language, 'multimeter')}
        >
          <Gauge className="w-3.5 h-3.5" />
        </button>

        <button
          onClick={() => setIpoModalOpen(true)}
          className="flex items-center gap-1 px-2 py-1.5 rounded text-xs bg-slate-800/80 border border-slate-700 text-slate-300 hover:bg-slate-700 transition"
          title={t(language, 'ipo')}
        >
          <Workflow className="w-3.5 h-3.5" />
        </button>

        <button
          onClick={() => setHintDrawerOpen(true)}
          className="flex items-center gap-1 px-2 py-1.5 rounded text-xs bg-slate-800/80 border border-slate-700 text-slate-300 hover:bg-slate-700 transition"
          title={t(language, 'hints')}
        >
          <HelpCircle className="w-3.5 h-3.5" />
        </button>

        <button
          onClick={() => setLanguage(language === 'en' ? 'bm' : 'en')}
          className="px-2 py-1.5 rounded text-[11px] font-mono font-semibold bg-slate-800/80 border border-slate-700 text-amber-300 hover:bg-slate-700 transition"
          title="Switch Language (English / Bahasa Melayu)"
        >
          {language.toUpperCase()}
        </button>

        <button
          onClick={resetMission}
          className="p-1.5 rounded bg-slate-800/80 border border-slate-700 text-slate-400 hover:text-rose-300 hover:border-rose-500/50 transition"
          title={t(language, 'reset')}
        >
          <RotateCcw className="w-3.5 h-3.5" />
        </button>

        {/* Live simulation heartbeat pill */}
        {isSimulating && (
          <span className="hidden 2xl:flex items-center gap-1 px-2 py-1 rounded bg-emerald-950/80 border border-emerald-500/40 text-emerald-300 text-[10px] font-mono">
            <Activity className="w-3 h-3 animate-pulse" />
            30 TPS
          </span>
        )}
      </div>
    </header>
  );
};

export { Layers };
