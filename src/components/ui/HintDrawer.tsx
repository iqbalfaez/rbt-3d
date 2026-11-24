import React from 'react';
import { HelpCircle, Lightbulb, Lock, X } from 'lucide-react';
import { getMissionById } from '../../engine/missions';
import { t } from '../../i18n/translations';
import { useGameStore } from '../../store/useGameStore';

export const HintDrawer: React.FC = () => {
  const open = useGameStore((s) => s.hintDrawerOpen);
  const setOpen = useGameStore((s) => s.setHintDrawerOpen);
  const activeMissionId = useGameStore((s) => s.activeMissionId);
  const hintsRevealed = useGameStore((s) => s.hintsRevealed);
  const revealNextHint = useGameStore((s) => s.revealNextHint);
  const language = useGameStore((s) => s.language);

  if (!open) return null;

  const mission = getMissionById(activeMissionId);
  const hints = language === 'bm' ? mission.hintsBm : mission.hints;
  const tierLabels =
    language === 'bm'
      ? ['Tahap 1 — Semak Konsep IPO', 'Tahap 2 — Semak Pendawaian Pin', 'Tahap 3 — Semak Logik & Ambang']
      : ['Tier 1 — Check IPO Concept', 'Tier 2 — Check Pin Wiring', 'Tier 3 — Check Logic & Threshold'];

  return (
    <div className="pointer-events-auto fixed inset-0 z-50 bg-black/55 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="w-full max-w-lg rounded-xl bg-[#141c22] border border-slate-700 shadow-2xl overflow-hidden">
        <div className="px-5 py-3.5 border-b border-slate-700/80 flex items-center justify-between bg-slate-900/70">
          <div className="flex items-center gap-2">
            <HelpCircle className="w-5 h-5 text-amber-400" />
            <div>
              <h2 className="text-sm font-bold text-slate-100">
                {language === 'bm' ? 'Mentor Sokratik RBT' : 'Socratic RBT Mentor Hints'}
              </h2>
              <p className="text-[11px] font-mono text-slate-400">
                {t(language, 'hintsUsedLabel')}: {hintsRevealed} / 3
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

        <div className="p-5 space-y-3">
          <p className="text-xs text-slate-400">
            {language === 'bm'
              ? 'Buka petunjuk langkah demi langkah. Menggunakan kurang daripada 3 petunjuk membantu mengekalkan penarafan 3 bintang.'
              : 'Reveal progressive hints one step at a time. Using fewer than 3 hints preserves your full 3-star budget & mastery rating.'}
          </p>

          {hints.map((hint, idx) => {
            const unlocked = idx < hintsRevealed;
            return (
              <div
                key={idx}
                className={`p-3 rounded-lg border text-xs ${
                  unlocked
                    ? 'bg-amber-950/25 border-amber-500/40 text-slate-100'
                    : 'bg-slate-900/70 border-slate-800 text-slate-500'
                }`}
              >
                <div className="flex items-center gap-1.5 font-mono font-semibold text-[11px] mb-1">
                  {unlocked ? (
                    <Lightbulb className="w-3.5 h-3.5 text-amber-400" />
                  ) : (
                    <Lock className="w-3.5 h-3.5 text-slate-600" />
                  )}
                  <span className={unlocked ? 'text-amber-300' : 'text-slate-500'}>
                    {tierLabels[idx]}
                  </span>
                </div>
                <p className="leading-relaxed">
                  {unlocked
                    ? hint
                    : language === 'bm'
                      ? 'Terkunci — klik butang di bawah untuk membuka petunjuk ini.'
                      : 'Locked — click below to reveal this guided hint.'}
                </p>
              </div>
            );
          })}

          <div className="pt-2 flex items-center justify-between gap-2">
            {hintsRevealed < 3 ? (
              <button
                onClick={revealNextHint}
                className="px-3.5 py-2 rounded bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-semibold transition"
              >
                {language === 'bm'
                  ? `Buka Petunjuk ${hintsRevealed + 1}`
                  : `Reveal Hint ${hintsRevealed + 1}`}
              </button>
            ) : (
              <span className="text-xs font-mono text-slate-400">
                {language === 'bm' ? 'Semua petunjuk telah dibuka.' : 'All 3 mentor hints revealed.'}
              </span>
            )}

            <button
              onClick={() => setOpen(false)}
              className="px-3.5 py-2 rounded bg-slate-800 hover:bg-slate-700 border border-slate-600 text-xs font-semibold text-slate-200"
            >
              {t(language, 'close')}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
