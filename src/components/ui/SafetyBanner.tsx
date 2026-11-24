import React from 'react';
import { AlertTriangle, Info, Zap } from 'lucide-react';
import { t } from '../../i18n/translations';
import { useGameStore } from '../../store/useGameStore';

export const SafetyBanner: React.FC = () => {
  const language = useGameStore((s) => s.language);
  const faults = useGameStore((s) => s.analysis.faults);
  const placingType = useGameStore((s) => s.placingType);
  const pendingWireStart = useGameStore((s) => s.pendingWireStart);
  const multimeterOpen = useGameStore((s) => s.multimeterOpen);
  const toastMessage = useGameStore((s) => s.toastMessage);

  return (
    <div className="pointer-events-none absolute top-16 left-1/2 -translate-x-1/2 z-25 flex flex-col items-center gap-2 w-[min(92vw,540px)]">
      {/* Critical / Warning Safety Diagnostics */}
      {faults.slice(0, 2).map((fault) => (
        <div
          key={fault.id}
          className={`pointer-events-auto w-full px-3.5 py-2.5 rounded-lg border shadow-xl flex items-start gap-2.5 text-xs ${
            fault.severity === 'critical'
              ? 'bg-rose-950/95 border-rose-500 text-rose-100'
              : 'bg-amber-950/95 border-amber-500/80 text-amber-100'
          }`}
        >
          <AlertTriangle
            className={`w-4 h-4 shrink-0 mt-0.5 ${
              fault.severity === 'critical' ? 'text-rose-400' : 'text-amber-400'
            }`}
          />
          <div>
            <div className="font-bold">
              {language === 'bm' ? fault.titleBm : fault.title}
            </div>
            <div className="opacity-90 mt-0.5 leading-snug">
              {language === 'bm' ? fault.messageBm : fault.message}
            </div>
          </div>
        </div>
      ))}

      {/* Active Mode Prompt Pill */}
      {placingType && (
        <div className="px-3 py-1.5 rounded-full bg-amber-500/95 text-slate-950 font-mono text-xs font-semibold shadow-lg flex items-center gap-1.5">
          <Info className="w-3.5 h-3.5" />
          <span>{t(language, 'placementHint')}</span>
        </div>
      )}

      {pendingWireStart && !placingType && (
        <div className="px-3 py-1.5 rounded-full bg-sky-500/95 text-slate-950 font-mono text-xs font-semibold shadow-lg flex items-center gap-1.5">
          <Zap className="w-3.5 h-3.5" />
          <span>{t(language, 'wiringHint')}</span>
        </div>
      )}

      {multimeterOpen && !placingType && !pendingWireStart && (
        <div className="mt-40 px-3 py-1 rounded-full bg-slate-900/90 border border-amber-500/50 text-amber-200 font-mono text-[11px] shadow">
          {t(language, 'meterHint')}
        </div>
      )}

      {/* Ephemeral Toast Notification */}
      {toastMessage && (
        <div className="px-3.5 py-1.5 rounded bg-slate-900/95 border border-slate-600 text-slate-100 text-xs font-medium shadow-xl">
          {toastMessage}
        </div>
      )}
    </div>
  );
};
