import React, { useRef } from 'react';
import {
  ChevronLeft,
  ChevronRight,
  Download,
  FileText,
  Layers,
  Sparkles,
  Trash,
  Upload,
} from 'lucide-react';
import { getMissionById } from '../../engine/missions';
import { t } from '../../i18n/translations';
import { useGameStore } from '../../store/useGameStore';
import type { SandboxSaveFile } from '../../types/game';

export const MissionBriefPanel: React.FC = () => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const language = useGameStore((s) => s.language);
  const activeMissionId = useGameStore((s) => s.activeMissionId);
  const open = useGameStore((s) => s.missionPanelOpen);
  const toggleOpen = useGameStore((s) => s.toggleMissionPanel);
  const loadGuidedStarter = useGameStore((s) => s.loadGuidedStarter);
  const clearWires = useGameStore((s) => s.clearWires);
  const analysis = useGameStore((s) => s.analysis);
  const components = useGameStore((s) => s.components);
  const wires = useGameStore((s) => s.wires);
  const exportSandboxJson = useGameStore((s) => s.exportSandboxJson);
  const importSandboxJson = useGameStore((s) => s.importSandboxJson);

  const mission = getMissionById(activeMissionId);

  const handleSaveJson = () => {
    const payload = exportSandboxJson();
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `rbt-workshop-${mission.id}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleLoadJson = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const parsed = JSON.parse(String(reader.result)) as SandboxSaveFile;
        importSandboxJson(parsed);
      } catch {
        // handled by store toast if invalid
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  if (!open) {
    return (
      <button
        onClick={toggleOpen}
        className="pointer-events-auto absolute top-16 left-3 z-20 flex items-center gap-1.5 px-2.5 py-2 rounded bg-[#141c22]/95 border border-slate-700/80 text-xs font-medium text-slate-200 hover:border-amber-400/60 shadow-lg"
      >
        <FileText className="w-3.5 h-3.5 text-amber-400" />
        <span>{t(language, 'missionBrief')}</span>
        <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
      </button>
    );
  }

  return (
    <aside className="pointer-events-auto absolute top-16 left-3 bottom-[118px] w-72 z-20 bg-[#131b20]/94 border border-slate-700/75 rounded-lg shadow-2xl backdrop-blur flex flex-col overflow-hidden">
      <div className="px-3 py-2.5 border-b border-slate-700/70 flex items-center justify-between bg-slate-900/60">
        <div className="flex items-center gap-2 min-w-0">
          <FileText className="w-4 h-4 text-amber-400 shrink-0" />
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-200 truncate">
            {t(language, 'missionBrief')}
          </span>
        </div>
        <button
          onClick={toggleOpen}
          className="p-1 rounded hover:bg-slate-800 text-slate-400 hover:text-slate-100"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>
      </div>

      <div className="p-3 overflow-y-auto flex-1 space-y-3.5 text-xs">
        <div>
          <span className="inline-block px-2 py-0.5 rounded bg-amber-500/15 border border-amber-500/40 text-amber-300 font-mono text-[10px]">
            {mission.kssmRef}
          </span>
          <h2 className="mt-1.5 text-sm font-bold text-slate-100 leading-snug">
            {language === 'bm' ? mission.titleBm : mission.title}
          </h2>
          <p className="mt-1 text-slate-300 leading-relaxed">
            {language === 'bm' ? mission.descriptionBm : mission.description}
          </p>
        </div>

        <div className="border-t border-slate-800 pt-2.5">
          <h3 className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
            {t(language, 'objectives')}
          </h3>
          <ul className="space-y-1.5">
            {(language === 'bm' ? mission.objectivesBm : mission.objectives).map((obj, idx) => (
              <li key={idx} className="flex items-start gap-2 text-slate-200 leading-snug">
                <span className="w-4 h-4 rounded-full bg-slate-800 border border-slate-600 text-[10px] font-mono text-amber-300 flex items-center justify-center shrink-0 mt-0.5">
                  {idx + 1}
                </span>
                <span>{obj}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Live Circuit Telemetry */}
        <div className="rounded bg-slate-900/80 border border-slate-800 p-2.5 space-y-1.5 font-mono text-[11px]">
          <div className="flex items-center justify-between text-slate-400">
            <span className="flex items-center gap-1">
              <Layers className="w-3 h-3 text-emerald-400" /> Parts / Wires
            </span>
            <span className="text-slate-100">
              {components.length} / {wires.length}
            </span>
          </div>
          <div className="flex items-center justify-between text-slate-400">
            <span>MCU Sensors Wired</span>
            <span className="text-sky-300">{analysis.connectedSensors.length}</span>
          </div>
          <div className="flex items-center justify-between text-slate-400">
            <span>MCU Outputs Wired</span>
            <span className="text-amber-300">{analysis.connectedOutputs.length}</span>
          </div>
        </div>

        {/* Quick Workbench Actions */}
        <div className="space-y-1.5 pt-1">
          <button
            onClick={loadGuidedStarter}
            className="w-full flex items-center justify-center gap-1.5 px-2.5 py-1.5 rounded bg-slate-800 hover:bg-slate-700 border border-slate-600/70 text-slate-200 font-medium transition"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>{t(language, 'loadStarter')}</span>
          </button>

          <button
            onClick={clearWires}
            disabled={wires.length === 0}
            className="w-full flex items-center justify-center gap-1.5 px-2.5 py-1.5 rounded bg-slate-800/70 hover:bg-rose-950/60 border border-slate-700 hover:border-rose-500/50 text-slate-300 hover:text-rose-200 disabled:opacity-40 transition"
          >
            <Trash className="w-3.5 h-3.5" />
            <span>{t(language, 'clearWires')}</span>
          </button>

          <div className="grid grid-cols-2 gap-1.5 pt-1">
            <button
              onClick={handleSaveJson}
              className="flex items-center justify-center gap-1 px-2 py-1.5 rounded bg-slate-800/80 hover:bg-slate-700 border border-slate-700 text-slate-200 transition"
            >
              <Download className="w-3.5 h-3.5 text-emerald-400" />
              <span>{t(language, 'saveJson')}</span>
            </button>
            <button
              onClick={() => fileInputRef.current?.click()}
              className="flex items-center justify-center gap-1 px-2 py-1.5 rounded bg-slate-800/80 hover:bg-slate-700 border border-slate-700 text-slate-200 transition"
            >
              <Upload className="w-3.5 h-3.5 text-sky-400" />
              <span>{t(language, 'loadJson')}</span>
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept=".json,application/json"
              onChange={handleLoadJson}
              className="hidden"
            />
          </div>
        </div>
      </div>
    </aside>
  );
};
