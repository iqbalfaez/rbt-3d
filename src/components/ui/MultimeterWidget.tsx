import React from 'react';
import { Gauge, RotateCcw, X } from 'lucide-react';
import { measureMultimeter } from '../../engine/circuitGraph';
import { makePinKey } from '../../engine/catalog';
import { t } from '../../i18n/translations';
import { useGameStore } from '../../store/useGameStore';

export const MultimeterWidget: React.FC = () => {
  const open = useGameStore((s) => s.multimeterOpen);
  const toggleMultimeter = useGameStore((s) => s.toggleMultimeter);
  const clearProbes = useGameStore((s) => s.clearMultimeterProbes);
  const probeA = useGameStore((s) => s.probeA);
  const probeB = useGameStore((s) => s.probeB);
  const analysis = useGameStore((s) => s.analysis);
  const language = useGameStore((s) => s.language);

  if (!open) return null;

  const keyA = probeA ? makePinKey(probeA.componentId, probeA.pinId) : null;
  const keyB = probeB ? makePinKey(probeB.componentId, probeB.pinId) : null;
  const reading = measureMultimeter(analysis, keyA, keyB);

  return (
    <div className="pointer-events-auto absolute top-16 left-1/2 -translate-x-1/2 z-30 w-72 rounded-lg bg-[#1c2328]/96 border-2 border-amber-500/70 shadow-2xl overflow-hidden">
      <div className="px-3 py-1.5 bg-amber-500 text-slate-950 flex items-center justify-between">
        <div className="flex items-center gap-1.5 font-mono text-xs font-bold uppercase tracking-wide">
          <Gauge className="w-4 h-4" />
          <span>{t(language, 'multimeter')}</span>
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={clearProbes}
            className="p-1 rounded hover:bg-amber-600/40"
            title="Clear Probes"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={toggleMultimeter}
            className="p-1 rounded hover:bg-amber-600/40"
            title={t(language, 'close')}
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* LCD Screen */}
      <div className="p-3 space-y-2.5">
        <div className="rounded bg-[#0d1f18] border border-emerald-700/60 px-3 py-2.5 font-mono shadow-inner">
          <div className="flex items-baseline justify-between">
            <span className="text-2xl font-bold tracking-wider text-emerald-300">
              {reading.ready ? `${reading.voltage.toFixed(2)} V` : '--.-- V'}
            </span>
            <span
              className={`px-1.5 py-0.5 rounded text-[10px] font-bold uppercase ${
                !reading.ready
                  ? 'bg-slate-800 text-slate-400'
                  : reading.continuity
                    ? 'bg-emerald-500/25 text-emerald-300 border border-emerald-400/50'
                    : 'bg-slate-800/80 text-slate-300'
              }`}
            >
              {!reading.ready ? 'WAIT' : reading.continuity ? 'CONT ✓' : 'OPEN'}
            </span>
          </div>
          <div className="mt-1 text-[10px] text-emerald-500/80">
            DC VOLTS · CONTINUITY TEST
          </div>
        </div>

        {/* Probe Status */}
        <div className="space-y-1.5 text-[11px] font-mono">
          <div className="flex items-center justify-between px-2 py-1 rounded bg-slate-900/90 border border-slate-700/70">
            <span className="text-rose-400 font-semibold">● Probe A (+)</span>
            <span className="text-slate-200 truncate max-w-[140px]">
              {probeA ? probeA.label : 'Click pin...'}
            </span>
          </div>
          <div className="flex items-center justify-between px-2 py-1 rounded bg-slate-900/90 border border-slate-700/70">
            <span className="text-slate-400 font-semibold">● Probe B (−)</span>
            <span className="text-slate-200 truncate max-w-[140px]">
              {probeB ? probeB.label : 'Click pin...'}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
