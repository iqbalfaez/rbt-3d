import React, { useState } from 'react';
import {
  Award,
  CheckCircle2,
  Download,
  ShieldCheck,
  Star,
  Wallet,
  X,
  XCircle,
} from 'lucide-react';
import { HARDWARE_CATALOG } from '../../engine/catalog';
import { MISSIONS, getMissionById } from '../../engine/missions';
import { t } from '../../i18n/translations';
import { useGameStore } from '../../store/useGameStore';

export const EvaluationModal: React.FC = () => {
  const [studentName, setStudentName] = useState('');
  const [studentClass, setStudentClass] = useState('');

  const evaluation = useGameStore((s) => s.evaluation);
  const closeEvaluation = useGameStore((s) => s.closeEvaluation);
  const selectMission = useGameStore((s) => s.selectMission);
  const components = useGameStore((s) => s.components);
  const wires = useGameStore((s) => s.wires);
  const rules = useGameStore((s) => s.rules);
  const language = useGameStore((s) => s.language);

  if (!evaluation) return null;

  const mission = getMissionById(evaluation.missionId);
  const nextMission = MISSIONS.find((m) => m.number === mission.number + 1);

  const handleDownloadReport = () => {
    const canvas = document.querySelector('#rbt-canvas-container canvas') as HTMLCanvasElement | null;
    let snapshotDataUrl = '';
    try {
      if (canvas) snapshotDataUrl = canvas.toDataURL('image/png');
    } catch {
      snapshotDataUrl = '';
    }

    const partRows = components
      .map((c) => {
        const def = HARDWARE_CATALOG[c.type];
        return `<tr><td>${def.name} (${def.nameBm})</td><td>${def.kssmTag}</td><td style="text-align:right">RM ${def.cost}</td></tr>`;
      })
      .join('');

    const html = `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8" />
<title>RBT Workshop 3D — Student Report Card</title>
<style>
  body { font-family: 'Segoe UI', system-ui, sans-serif; color: #1e293b; max-width: 820px; margin: 28px auto; padding: 0 20px; }
  h1 { margin: 0; font-size: 22px; color: #0f172a; }
  .sub { color: #475569; font-size: 13px; margin-top: 4px; }
  .grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 12px; margin: 18px 0; }
  .card { border: 1px solid #cbd5e1; border-radius: 8px; padding: 12px; background: #f8fafc; }
  .label { font-size: 11px; text-transform: uppercase; color: #64748b; }
  .val { font-size: 16px; font-weight: 700; margin-top: 4px; }
  table { width: 100%; border-collapse: collapse; margin-top: 12px; font-size: 13px; }
  th, td { border: 1px solid #cbd5e1; padding: 8px; text-align: left; }
  th { background: #f1f5f9; }
  img { width: 100%; border-radius: 8px; border: 1px solid #cbd5e1; margin-top: 12px; }
</style>
</head>
<body>
  <h1>RBT Workshop 3D — KSSM Prototype Report Card</h1>
  <div class="sub">${mission.kssmRef} · ${mission.title} (${mission.titleBm})</div>
  <div class="sub">Generated: ${new Date().toLocaleString()}</div>

  <div class="grid">
    <div class="card"><div class="label">Student Name</div><div class="val">${studentName || '—'}</div></div>
    <div class="card"><div class="label">Class</div><div class="val">${studentClass || '—'}</div></div>
    <div class="card"><div class="label">Rating &amp; PBD Reference</div><div class="val">${'★'.repeat(evaluation.stars)}${'☆'.repeat(3 - evaluation.stars)} · ${evaluation.tpLevel}</div></div>
  </div>

  <div class="grid">
    <div class="card"><div class="label">Functionality</div><div class="val">${evaluation.functionalityOk ? 'PASS' : 'NEEDS WORK'}</div></div>
    <div class="card"><div class="label">Safety &amp; Wiring</div><div class="val">${evaluation.safetyOk ? 'ZERO FAULTS' : 'FAULT DETECTED'}</div></div>
    <div class="card"><div class="label">Budget / Hints</div><div class="val">RM ${evaluation.totalCost} / ${evaluation.budgetLimit === Infinity ? '∞' : `RM ${evaluation.budgetLimit}`} · ${evaluation.hintsUsed} hints</div></div>
  </div>

  ${snapshotDataUrl ? `<h3>3D Workbench Prototype Snapshot</h3><img src="${snapshotDataUrl}" alt="3D Prototype Snapshot" />` : ''}

  <h3>Bill of Materials (${components.length} Parts, ${wires.length} Wires, ${rules.length} Logic Blocks)</h3>
  <table>
    <thead><tr><th>Component</th><th>KSSM Tag</th><th style="text-align:right">Cost</th></tr></thead>
    <tbody>${partRows || '<tr><td colspan="3">No parts placed</td></tr>'}</tbody>
  </table>
</body>
</html>`;

    const blob = new Blob([html], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `rbt-report-${mission.id}.html`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="pointer-events-auto fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="w-full max-w-xl rounded-xl bg-[#141c22] border border-slate-700 shadow-2xl overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-700/80 flex items-center justify-between bg-slate-900/75">
          <div className="flex items-center gap-2.5">
            <Award className={`w-6 h-6 ${evaluation.passed ? 'text-amber-400' : 'text-slate-400'}`} />
            <div>
              <h2 className="text-base font-bold text-slate-100">{t(language, 'reportCard')}</h2>
              <p className="text-[11px] font-mono text-slate-400">
                {mission.kssmRef} · {evaluation.tpLevel}
              </p>
            </div>
          </div>
          <button
            onClick={closeEvaluation}
            className="p-1.5 rounded hover:bg-slate-800 text-slate-400 hover:text-slate-100"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-5 space-y-4">
          {/* 3-Star Banner */}
          <div className="flex flex-col items-center py-3 rounded-lg bg-slate-900/85 border border-slate-800">
            <div className="flex items-center gap-2">
              {[1, 2, 3].map((n) => (
                <Star
                  key={n}
                  className={`w-9 h-9 ${
                    n <= evaluation.stars
                      ? 'text-amber-400 fill-amber-400 drop-shadow'
                      : 'text-slate-700'
                  }`}
                />
              ))}
            </div>
            <div className="mt-2 text-sm font-bold text-slate-100">
              {evaluation.passed
                ? language === 'bm'
                  ? 'Tahniah! Prototaip Lulus Pengesahan KSSM'
                  : 'Prototype Passed KSSM Verification!'
                : language === 'bm'
                  ? 'Prototaip Belum Lengkap — Semak Keputusan Ujian'
                  : 'Prototype Needs Adjustment — Review Test Results'}
            </div>
          </div>

          {/* Criteria Cards */}
          <div className="grid grid-cols-3 gap-2.5 text-xs">
            <div className="p-2.5 rounded-lg bg-slate-900/90 border border-slate-800">
              <div className="flex items-center gap-1 text-slate-400 mb-1">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                <span>{t(language, 'functionality')}</span>
              </div>
              <div className={`font-mono font-bold ${evaluation.functionalityOk ? 'text-emerald-300' : 'text-rose-400'}`}>
                {evaluation.functionalityOk ? 'PASS' : 'FAIL'}
              </div>
            </div>

            <div className="p-2.5 rounded-lg bg-slate-900/90 border border-slate-800">
              <div className="flex items-center gap-1 text-slate-400 mb-1">
                <ShieldCheck className="w-3.5 h-3.5 text-sky-400" />
                <span>{t(language, 'safetyWiring')}</span>
              </div>
              <div className={`font-mono font-bold ${evaluation.safetyOk ? 'text-emerald-300' : 'text-rose-400'}`}>
                {evaluation.safetyOk ? 'SAFE' : 'FAULT'}
              </div>
            </div>

            <div className="p-2.5 rounded-lg bg-slate-900/90 border border-slate-800">
              <div className="flex items-center gap-1 text-slate-400 mb-1">
                <Wallet className="w-3.5 h-3.5 text-amber-400" />
                <span>{t(language, 'budgetEfficiency')}</span>
              </div>
              <div className={`font-mono font-bold ${evaluation.budgetOk ? 'text-emerald-300' : 'text-rose-400'}`}>
                RM {evaluation.totalCost} / {evaluation.budgetLimit}
              </div>
            </div>
          </div>

          {/* Automated Multi-State Test Case Breakdown */}
          <div className="space-y-1.5">
            {mission.testCases.map((tc) => {
              const ok = evaluation.passedTestIds.includes(tc.id);
              return (
                <div
                  key={tc.id}
                  className={`flex items-center gap-2 px-3 py-2 rounded border text-xs ${
                    ok
                      ? 'bg-emerald-950/30 border-emerald-500/35 text-emerald-200'
                      : 'bg-rose-950/30 border-rose-500/35 text-rose-200'
                  }`}
                >
                  {ok ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  ) : (
                    <XCircle className="w-4 h-4 text-rose-400 shrink-0" />
                  )}
                  <span>{language === 'bm' ? tc.labelBm : tc.label}</span>
                </div>
              );
            })}
          </div>

          {/* Student Info for PBD Printable Export */}
          <div className="grid grid-cols-2 gap-2 pt-1">
            <input
              type="text"
              placeholder={t(language, 'studentName')}
              value={studentName}
              onChange={(e) => setStudentName(e.target.value)}
              className="px-2.5 py-1.5 rounded bg-slate-900 border border-slate-700 text-xs text-slate-100 placeholder:text-slate-500"
            />
            <input
              type="text"
              placeholder={t(language, 'studentClass')}
              value={studentClass}
              onChange={(e) => setStudentClass(e.target.value)}
              className="px-2.5 py-1.5 rounded bg-slate-900 border border-slate-700 text-xs text-slate-100 placeholder:text-slate-500"
            />
          </div>

          {/* Footer Buttons */}
          <div className="flex items-center justify-between gap-2 pt-2 border-t border-slate-800">
            <button
              onClick={handleDownloadReport}
              className="flex items-center gap-1.5 px-3 py-2 rounded bg-slate-800 hover:bg-slate-700 border border-slate-600 text-xs font-semibold text-slate-100 transition"
            >
              <Download className="w-3.5 h-3.5 text-amber-400" />
              <span>{t(language, 'downloadReport')}</span>
            </button>

            <div className="flex items-center gap-2">
              <button
                onClick={closeEvaluation}
                className="px-3.5 py-2 rounded bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-200"
              >
                {t(language, 'retry')}
              </button>
              {evaluation.passed && nextMission && (
                <button
                  onClick={() => selectMission(nextMission.id)}
                  className="px-4 py-2 rounded bg-emerald-600 hover:bg-emerald-500 text-xs font-semibold text-white"
                >
                  {t(language, 'nextMission')} →
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
