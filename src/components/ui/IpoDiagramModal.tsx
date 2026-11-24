import React from 'react';
import { ArrowRight, Workflow, X } from 'lucide-react';
import { getMissionById } from '../../engine/missions';
import { t } from '../../i18n/translations';
import { useGameStore } from '../../store/useGameStore';

export const IpoDiagramModal: React.FC = () => {
  const open = useGameStore((s) => s.ipoModalOpen);
  const setOpen = useGameStore((s) => s.setIpoModalOpen);
  const activeMissionId = useGameStore((s) => s.activeMissionId);
  const language = useGameStore((s) => s.language);

  if (!open) return null;

  const mission = getMissionById(activeMissionId);
  const inputs = language === 'bm' ? mission.ipo.inputBm : mission.ipo.input;
  const processes = language === 'bm' ? mission.ipo.processBm : mission.ipo.process;
  const outputs = language === 'bm' ? mission.ipo.outputBm : mission.ipo.output;

  return (
    <div className="pointer-events-auto fixed inset-0 z-50 bg-black/65 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="w-full max-w-3xl rounded-xl bg-[#141c22] border border-slate-700 shadow-2xl overflow-hidden">
        <div className="px-5 py-3.5 border-b border-slate-700/80 flex items-center justify-between bg-slate-900/70">
          <div className="flex items-center gap-2">
            <Workflow className="w-5 h-5 text-amber-400" />
            <div>
              <h2 className="text-sm font-bold text-slate-100">
                {language === 'bm'
                  ? 'Rajah Blok Input – Proses – Output (IPO) KSSM'
                  : 'KSSM Input – Process – Output (IPO) Block Diagram'}
              </h2>
              <p className="text-[11px] font-mono text-slate-400">
                {mission.kssmRef} · {language === 'bm' ? mission.titleBm : mission.title}
              </p>
            </div>
          </div>
          <button
            onClick={() => setOpen(false)}
            className="p-1.5 rounded hover:bg-slate-800 text-slate-400 hover:text-slate-100"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-[1fr_auto_1fr_auto_1fr] items-stretch gap-3">
            {/* INPUT */}
            <div className="rounded-lg border-2 border-sky-500/50 bg-sky-950/25 p-4 flex flex-col">
              <div className="text-xs font-mono font-bold uppercase tracking-wider text-sky-300 mb-2">
                {language === 'bm' ? '1. INPUT (Masukan)' : '1. INPUT'}
              </div>
              <ul className="space-y-2 text-xs text-slate-200 flex-1">
                {inputs.map((item, idx) => (
                  <li key={idx} className="p-2 rounded bg-slate-900/85 border border-sky-500/25">
                    {item}
                  </li>
                ))}
              </ul>
            </div>

            <div className="flex items-center justify-center text-slate-500">
              <ArrowRight className="w-6 h-6 rotate-90 md:rotate-0 text-amber-400" />
            </div>

            {/* PROCESS */}
            <div className="rounded-lg border-2 border-amber-500/50 bg-amber-950/25 p-4 flex flex-col">
              <div className="text-xs font-mono font-bold uppercase tracking-wider text-amber-300 mb-2">
                {language === 'bm' ? '2. PROSES (Kawalan)' : '2. PROCESS'}
              </div>
              <ul className="space-y-2 text-xs text-slate-200 flex-1">
                {processes.map((item, idx) => (
                  <li key={idx} className="p-2 rounded bg-slate-900/85 border border-amber-500/25">
                    {item}
                  </li>
                ))}
              </ul>
            </div>

            <div className="flex items-center justify-center text-slate-500">
              <ArrowRight className="w-6 h-6 rotate-90 md:rotate-0 text-amber-400" />
            </div>

            {/* OUTPUT */}
            <div className="rounded-lg border-2 border-emerald-500/50 bg-emerald-950/25 p-4 flex flex-col">
              <div className="text-xs font-mono font-bold uppercase tracking-wider text-emerald-300 mb-2">
                {language === 'bm' ? '3. OUTPUT (Keluaran)' : '3. OUTPUT'}
              </div>
              <ul className="space-y-2 text-xs text-slate-200 flex-1">
                {outputs.map((item, idx) => (
                  <li key={idx} className="p-2 rounded bg-slate-900/85 border border-emerald-500/25">
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div className="mt-5 flex justify-end">
            <button
              onClick={() => setOpen(false)}
              className="px-4 py-1.5 rounded bg-slate-800 hover:bg-slate-700 border border-slate-600 text-xs font-semibold text-slate-100"
            >
              {t(language, 'close')}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
