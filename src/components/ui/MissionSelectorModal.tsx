import React from 'react';
import { Cpu, FlaskConical, Star, X } from 'lucide-react';
import { MISSIONS } from '../../engine/missions';
import { t } from '../../i18n/translations';
import { useGameStore } from '../../store/useGameStore';

export const MissionSelectorModal: React.FC = () => {
  const open = useGameStore((s) => s.missionSelectorOpen);
  const setOpen = useGameStore((s) => s.setMissionSelectorOpen);
  const activeMissionId = useGameStore((s) => s.activeMissionId);
  const selectMission = useGameStore((s) => s.selectMission);
  const completedStars = useGameStore((s) => s.completedStars);
  const language = useGameStore((s) => s.language);

  if (!open) return null;

  return (
    <div className="pointer-events-auto fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="w-full max-w-3xl max-h-[86vh] rounded-xl bg-[#141c22] border border-slate-700 shadow-2xl flex flex-col overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-700/80 flex items-center justify-between bg-slate-900/75">
          <div className="flex items-center gap-2.5">
            <Cpu className="w-5 h-5 text-amber-400" />
            <div>
              <h2 className="text-sm font-bold text-slate-100">
                {language === 'bm'
                  ? 'Pilih Misi KSSM RBT atau Mod Kotak Pasir'
                  : 'Select KSSM RBT Mission or Open Sandbox'}
              </h2>
              <p className="text-[11px] font-mono text-slate-400">
                Form 2 (Bab 2.3 &amp; 2.4) • Form 3 (Bab 2.1 Mechatronics)
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

        <div className="p-5 overflow-y-auto grid grid-cols-1 md:grid-cols-2 gap-3">
          {MISSIONS.map((mission) => {
            const isActive = mission.id === activeMissionId;
            const stars = completedStars[mission.id] ?? 0;
            const isSandbox = mission.formLevel === 'Sandbox';

            return (
              <button
                key={mission.id}
                onClick={() => selectMission(mission.id)}
                className={`text-left p-4 rounded-lg border transition flex flex-col justify-between ${
                  isSandbox ? 'md:col-span-2' : ''
                } ${
                  isActive
                    ? 'bg-amber-500/15 border-amber-400'
                    : 'bg-slate-900/80 border-slate-700/80 hover:border-amber-400/60 hover:bg-slate-800/90'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between gap-2">
                    <span
                      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-mono font-semibold ${
                        isSandbox
                          ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                          : mission.formLevel === 'Form 3'
                            ? 'bg-sky-500/20 text-sky-300 border border-sky-500/40'
                            : 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                      }`}
                    >
                      {isSandbox && <FlaskConical className="w-3 h-3" />}
                      {mission.kssmRef}
                    </span>

                    {!isSandbox && (
                      <div className="flex items-center gap-0.5">
                        {[1, 2, 3].map((n) => (
                          <Star
                            key={n}
                            className={`w-3.5 h-3.5 ${
                              n <= stars ? 'text-amber-400 fill-amber-400' : 'text-slate-700'
                            }`}
                          />
                        ))}
                      </div>
                    )}
                  </div>

                  <h3 className="mt-2 text-sm font-bold text-slate-100">
                    {mission.number > 0 ? `Mission ${mission.number}: ` : ''}
                    {language === 'bm' ? mission.titleBm : mission.title}
                  </h3>
                  <p className="mt-1 text-xs text-slate-400 leading-relaxed line-clamp-2">
                    {language === 'bm' ? mission.descriptionBm : mission.description}
                  </p>
                </div>

                <div className="mt-3 pt-2 border-t border-slate-800 flex items-center justify-between text-[11px] font-mono">
                  <span className="text-emerald-300">
                    {t(language, 'budget')}:{' '}
                    {mission.budget === Infinity ? t(language, 'unlimited') : `RM ${mission.budget}`}
                  </span>
                  <span className="text-slate-400">
                    {mission.requiresCoding ? 'Wiring + Block Code' : 'Direct Electrical'}
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
