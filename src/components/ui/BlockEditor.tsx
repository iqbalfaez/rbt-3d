import React from 'react';
import {
  ChevronLeft,
  ChevronRight,
  Code2,
  Plus,
  Trash2,
  Zap,
} from 'lucide-react';
import { getMissionById } from '../../engine/missions';
import { t } from '../../i18n/translations';
import { useGameStore } from '../../store/useGameStore';
import type { BlockAction, ComparisonOperator, LogicBlockRule } from '../../types/game';

const SENSOR_PINS = ['A0', 'A1', 'A2', 'D2', 'D3', 'D4', 'D5', 'D6', 'D7'];
const OUTPUT_PINS = ['D2', 'D3', 'D4', 'D5', 'D6', 'D7'];
const OPERATORS: ComparisonOperator[] = ['<', '>', '=', '<=', '>='];

export const BlockEditor: React.FC = () => {
  const language = useGameStore((s) => s.language);
  const activeMissionId = useGameStore((s) => s.activeMissionId);
  const open = useGameStore((s) => s.blockDrawerOpen);
  const toggleOpen = useGameStore((s) => s.toggleBlockDrawer);
  const rules = useGameStore((s) => s.rules);
  const addRule = useGameStore((s) => s.addRule);
  const updateRule = useGameStore((s) => s.updateRule);
  const deleteRule = useGameStore((s) => s.deleteRule);
  const sensorReadings = useGameStore((s) => s.simOutputs.sensorReadings);
  const isSimulating = useGameStore((s) => s.isSimulating);

  const mission = getMissionById(activeMissionId);

  const updateActionList = (
    rule: LogicBlockRule,
    branch: 'thenActions' | 'elseActions',
    idx: number,
    patch: Partial<BlockAction>
  ) => {
    const list = rule[branch].map((a, i) => (i === idx ? { ...a, ...patch } : a));
    updateRule(rule.id, { [branch]: list });
  };

  const addActionToBranch = (rule: LogicBlockRule, branch: 'thenActions' | 'elseActions') => {
    const nextPin = OUTPUT_PINS.find((p) => !rule[branch].some((a) => a.outputPin === p)) ?? 'D7';
    const nextList: BlockAction[] = [
      ...rule[branch],
      { outputPin: nextPin, mode: 'DIGITAL', value: branch === 'thenActions' ? 1 : 0 },
    ];
    updateRule(rule.id, { [branch]: nextList });
  };

  const removeActionFromBranch = (
    rule: LogicBlockRule,
    branch: 'thenActions' | 'elseActions',
    idx: number
  ) => {
    if (rule[branch].length <= 1) return;
    updateRule(rule.id, { [branch]: rule[branch].filter((_, i) => i !== idx) });
  };

  if (!open) {
    return (
      <button
        onClick={toggleOpen}
        className="pointer-events-auto absolute top-16 right-3 z-20 flex items-center gap-1.5 px-2.5 py-2 rounded bg-[#141c22]/95 border border-slate-700/80 text-xs font-medium text-slate-200 hover:border-amber-400/60 shadow-lg"
      >
        <ChevronLeft className="w-3.5 h-3.5 text-slate-400" />
        <Code2 className="w-3.5 h-3.5 text-sky-400" />
        <span>{t(language, 'blockCoding')}</span>
        {rules.length > 0 && (
          <span className="px-1.5 py-0.2 rounded-full bg-sky-500/20 text-sky-300 font-mono text-[10px]">
            {rules.length}
          </span>
        )}
      </button>
    );
  }

  return (
    <aside className="pointer-events-auto absolute top-16 right-3 bottom-[118px] w-80 z-20 bg-[#131b20]/94 border border-slate-700/75 rounded-lg shadow-2xl backdrop-blur flex flex-col overflow-hidden">
      <div className="px-3 py-2.5 border-b border-slate-700/70 flex items-center justify-between bg-slate-900/60">
        <div className="flex items-center gap-2">
          <Code2 className="w-4 h-4 text-sky-400" />
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-200">
            {t(language, 'blockCoding')}
          </span>
        </div>
        <button
          onClick={toggleOpen}
          className="p-1 rounded hover:bg-slate-800 text-slate-400 hover:text-slate-100"
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>

      <div className="p-3 overflow-y-auto flex-1 space-y-3">
        {!mission.requiresCoding ? (
          <div className="p-3 rounded-lg bg-amber-950/35 border border-amber-500/40 text-xs space-y-1.5">
            <div className="flex items-center gap-1.5 font-semibold text-amber-300">
              <Zap className="w-4 h-4" />
              <span>{t(language, 'noCodingNeededTitle')}</span>
            </div>
            <p className="text-slate-300 leading-relaxed">
              {t(language, 'noCodingNeededDesc')}
            </p>
          </div>
        ) : (
          <>
            {/* Top Scratch/mBlock Hat Block */}
            <div className="px-3 py-1.5 rounded-t-lg rounded-b bg-amber-600/90 text-slate-950 font-mono text-xs font-bold flex items-center justify-between shadow">
              <span>{t(language, 'whenStart')}</span>
              <span className="text-[10px] opacity-80">30 Hz</span>
            </div>

            {rules.length === 0 && (
              <div className="p-4 rounded border border-dashed border-slate-700 text-center text-xs text-slate-400">
                {language === 'bm'
                  ? 'Tiada blok logik lagi. Klik butang di bawah untuk membina peraturan IF / THEN / ELSE.'
                  : 'No logic blocks yet. Click below to assemble an IF / THEN / ELSE rule.'}
              </div>
            )}

            {rules.map((rule, rIdx) => {
              const liveVal = sensorReadings[rule.sensorPin];

              return (
                <div
                  key={rule.id}
                  className="rounded-lg border border-sky-500/40 bg-slate-900/90 overflow-hidden shadow"
                >
                  {/* IF Header */}
                  <div className="px-2.5 py-2 bg-sky-900/40 border-b border-sky-500/30 flex items-center justify-between gap-1.5">
                    <div className="flex items-center gap-1 flex-wrap">
                      <span className="text-[10px] font-mono font-bold text-sky-300 mr-0.5">
                        #{rIdx + 1} {t(language, 'ifLabel')}
                      </span>
                      <select
                        value={rule.sensorPin}
                        onChange={(e) => updateRule(rule.id, { sensorPin: e.target.value })}
                        className="bg-slate-950 border border-slate-700 rounded px-1.5 py-0.5 text-xs font-mono text-amber-300"
                      >
                        {SENSOR_PINS.map((pin) => (
                          <option key={pin} value={pin}>
                            {pin}
                          </option>
                        ))}
                      </select>

                      <select
                        value={rule.operator}
                        onChange={(e) =>
                          updateRule(rule.id, { operator: e.target.value as ComparisonOperator })
                        }
                        className="bg-slate-950 border border-slate-700 rounded px-1 py-0.5 text-xs font-mono text-slate-100"
                      >
                        {OPERATORS.map((op) => (
                          <option key={op} value={op}>
                            {op}
                          </option>
                        ))}
                      </select>

                      <input
                        type="number"
                        value={rule.threshold}
                        onChange={(e) =>
                          updateRule(rule.id, { threshold: Number(e.target.value) })
                        }
                        className="w-14 bg-slate-950 border border-slate-700 rounded px-1.5 py-0.5 text-xs font-mono text-emerald-300"
                      />
                    </div>

                    <button
                      onClick={() => deleteRule(rule.id)}
                      className="p-1 rounded text-slate-400 hover:text-rose-400 hover:bg-slate-800"
                      title="Delete Rule"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  {/* Live Sensor Reading Tag during Simulation */}
                  {isSimulating && (
                    <div className="px-2.5 py-1 bg-slate-950/70 border-b border-slate-800 text-[10px] font-mono flex items-center justify-between">
                      <span className="text-slate-400">Live {rule.sensorPin}:</span>
                      <span className={liveVal !== undefined ? 'text-emerald-300' : 'text-rose-400'}>
                        {liveVal !== undefined ? liveVal : 'Unwired / No Power'}
                      </span>
                    </div>
                  )}

                  {/* THEN Actions */}
                  <div className="p-2 space-y-1.5 border-b border-slate-800">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-mono font-bold text-emerald-400">
                        {t(language, 'thenLabel')}
                      </span>
                      <button
                        onClick={() => addActionToBranch(rule, 'thenActions')}
                        className="text-[10px] font-mono text-emerald-300 hover:underline"
                      >
                        {t(language, 'addAction')}
                      </button>
                    </div>
                    {rule.thenActions.map((act, idx) => (
                      <ActionRow
                        key={idx}
                        action={act}
                        canRemove={rule.thenActions.length > 1}
                        onChange={(patch) => updateActionList(rule, 'thenActions', idx, patch)}
                        onRemove={() => removeActionFromBranch(rule, 'thenActions', idx)}
                      />
                    ))}
                  </div>

                  {/* ELSE Actions */}
                  <div className="p-2 space-y-1.5 border-b border-slate-800 bg-slate-900/50">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-mono font-bold text-amber-400">
                        {t(language, 'elseLabel')}
                      </span>
                      <button
                        onClick={() => addActionToBranch(rule, 'elseActions')}
                        className="text-[10px] font-mono text-amber-300 hover:underline"
                      >
                        {t(language, 'addAction')}
                      </button>
                    </div>
                    {rule.elseActions.map((act, idx) => (
                      <ActionRow
                        key={idx}
                        action={act}
                        canRemove={rule.elseActions.length > 1}
                        onChange={(patch) => updateActionList(rule, 'elseActions', idx, patch)}
                        onRemove={() => removeActionFromBranch(rule, 'elseActions', idx)}
                      />
                    ))}
                  </div>

                  {/* Optional WAIT Delay */}
                  <div className="px-2.5 py-1.5 flex items-center justify-between text-[11px] bg-slate-950/60">
                    <span className="font-mono text-slate-400">{t(language, 'waitLabel')}</span>
                    <div className="flex items-center gap-1">
                      <input
                        type="number"
                        min={0}
                        max={10}
                        step={0.5}
                        value={rule.waitSeconds}
                        onChange={(e) =>
                          updateRule(rule.id, { waitSeconds: Math.max(0, Number(e.target.value)) })
                        }
                        className="w-12 bg-slate-900 border border-slate-700 rounded px-1.5 py-0.5 text-xs font-mono text-slate-200 text-right"
                      />
                      <span className="text-slate-400 font-mono">{t(language, 'seconds')}</span>
                    </div>
                  </div>
                </div>
              );
            })}

            <button
              onClick={addRule}
              className="w-full flex items-center justify-center gap-1.5 py-2 rounded bg-sky-600 hover:bg-sky-500 text-white text-xs font-semibold transition"
            >
              <Plus className="w-4 h-4" />
              <span>{t(language, 'addRule')}</span>
            </button>
          </>
        )}
      </div>
    </aside>
  );
};

const ActionRow: React.FC<{
  action: BlockAction;
  canRemove: boolean;
  onChange: (patch: Partial<BlockAction>) => void;
  onRemove: () => void;
}> = ({ action, canRemove, onChange, onRemove }) => {
  return (
    <div className="flex items-center gap-1 text-xs">
      <select
        value={action.outputPin}
        onChange={(e) => onChange({ outputPin: e.target.value })}
        className="bg-slate-950 border border-slate-700 rounded px-1.5 py-0.5 font-mono text-slate-100"
      >
        {OUTPUT_PINS.map((pin) => (
          <option key={pin} value={pin}>
            {pin}
          </option>
        ))}
      </select>

      <select
        value={action.mode}
        onChange={(e) => {
          const mode = e.target.value as 'DIGITAL' | 'PWM';
          onChange({ mode, value: mode === 'PWM' ? 90 : 1 });
        }}
        className="bg-slate-950 border border-slate-700 rounded px-1 py-0.5 font-mono text-[11px] text-slate-300"
      >
        <option value="DIGITAL">DIG</option>
        <option value="PWM">SERVO°</option>
      </select>

      {action.mode === 'DIGITAL' ? (
        <select
          value={action.value >= 1 ? 1 : 0}
          onChange={(e) => onChange({ value: Number(e.target.value) })}
          className={`flex-1 bg-slate-950 border border-slate-700 rounded px-1.5 py-0.5 font-mono font-semibold ${
            action.value >= 1 ? 'text-emerald-300' : 'text-slate-400'
          }`}
        >
          <option value={1}>HIGH (ON)</option>
          <option value={0}>LOW (OFF)</option>
        </select>
      ) : (
        <div className="flex-1 flex items-center gap-1">
          <input
            type="number"
            min={0}
            max={180}
            step={15}
            value={action.value}
            onChange={(e) => onChange({ value: Math.max(0, Math.min(180, Number(e.target.value))) })}
            className="w-full bg-slate-950 border border-slate-700 rounded px-1.5 py-0.5 font-mono text-amber-300"
          />
          <span className="text-[10px] text-slate-400">°</span>
        </div>
      )}

      {canRemove && (
        <button
          onClick={onRemove}
          className="p-0.5 text-slate-500 hover:text-rose-400"
          title="Remove Output"
        >
          ×
        </button>
      )}
    </div>
  );
};
