import React, { useState } from 'react';
import { COMPONENT_LIST } from '../../engine/catalog';
import { calculateTotalCost, getMissionById } from '../../engine/missions';
import { t } from '../../i18n/translations';
import { useGameStore } from '../../store/useGameStore';
import type { ComponentCategory } from '../../types/game';

const CATEGORIES: { key: 'all' | ComponentCategory; labelKey: 'catCore' | 'catPower' | 'catSensor' | 'catActuator' | 'catPassive' | null; fallback: string }[] = [
  { key: 'all', labelKey: null, fallback: 'All' },
  { key: 'core', labelKey: 'catCore', fallback: 'Core' },
  { key: 'power', labelKey: 'catPower', fallback: 'Power' },
  { key: 'sensor', labelKey: 'catSensor', fallback: 'Sensors' },
  { key: 'actuator', labelKey: 'catActuator', fallback: 'Actuators' },
  { key: 'passive', labelKey: 'catPassive', fallback: 'Passive' },
];

const CAT_BADGE: Record<ComponentCategory, string> = {
  core: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40',
  power: 'bg-rose-500/20 text-rose-300 border-rose-500/40',
  sensor: 'bg-sky-500/20 text-sky-300 border-sky-500/40',
  actuator: 'bg-amber-500/20 text-amber-300 border-amber-500/40',
  passive: 'bg-slate-600/30 text-slate-300 border-slate-500/40',
};

export const ComponentDock: React.FC = () => {
  const [activeCat, setActiveCat] = useState<'all' | ComponentCategory>('all');
  const language = useGameStore((s) => s.language);
  const placingType = useGameStore((s) => s.placingType);
  const startPlacing = useGameStore((s) => s.startPlacing);
  const activeMissionId = useGameStore((s) => s.activeMissionId);
  const components = useGameStore((s) => s.components);

  const mission = getMissionById(activeMissionId);
  const spent = calculateTotalCost(components);
  const remaining = mission.budget === Infinity ? Infinity : mission.budget - spent;

  const filtered =
    activeCat === 'all'
      ? COMPONENT_LIST
      : COMPONENT_LIST.filter((c) => c.category === activeCat);

  return (
    <div className="pointer-events-auto absolute bottom-2.5 left-3 right-3 z-20 bg-[#12191e]/95 border border-slate-700/80 rounded-lg shadow-2xl backdrop-blur px-3 py-2">
      <div className="flex items-center justify-between gap-2 mb-1.5">
        <div className="flex items-center gap-1.5 overflow-x-auto">
          <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400 mr-1 shrink-0">
            {t(language, 'componentDock')}
          </span>
          {CATEGORIES.map((cat) => (
            <button
              key={cat.key}
              onClick={() => setActiveCat(cat.key)}
              className={`px-2 py-0.5 rounded text-[11px] font-medium transition shrink-0 ${
                activeCat === cat.key
                  ? 'bg-amber-500 text-slate-950 font-semibold'
                  : 'bg-slate-800/80 text-slate-300 hover:bg-slate-700'
              }`}
            >
              {cat.labelKey ? t(language, cat.labelKey) : language === 'bm' ? 'Semua' : cat.fallback}
            </button>
          ))}
        </div>

        <span className="hidden md:inline text-[11px] font-mono text-slate-400 shrink-0">
          1 cm grid · Click part → Place · Right-click to delete
        </span>
      </div>

      <div className="flex items-stretch gap-2 overflow-x-auto pb-0.5">
        {filtered.map((item) => {
          const isPlacing = placingType === item.type;
          const unaffordable = remaining < item.cost;

          return (
            <button
              key={item.type}
              onClick={() => startPlacing(isPlacing ? null : item.type)}
              disabled={unaffordable && !isPlacing}
              title={language === 'bm' ? item.descriptionBm : item.description}
              className={`shrink-0 w-40 text-left px-2.5 py-1.5 rounded border transition flex flex-col justify-between ${
                isPlacing
                  ? 'bg-amber-500/20 border-amber-400 ring-1 ring-amber-400/50'
                  : unaffordable
                    ? 'bg-slate-900/50 border-slate-800 opacity-45 cursor-not-allowed'
                    : 'bg-slate-900/85 border-slate-700/80 hover:border-amber-400/60 hover:bg-slate-800/90'
              }`}
            >
              <div className="flex items-center justify-between gap-1">
                <span
                  className={`px-1.5 py-0.2 rounded border text-[9px] font-mono uppercase ${CAT_BADGE[item.category]}`}
                >
                  {item.category}
                </span>
                <span className="text-[11px] font-mono font-semibold text-emerald-300">
                  RM {item.cost}
                </span>
              </div>
              <div className="mt-1 text-xs font-semibold text-slate-100 truncate">
                {language === 'bm' ? item.nameBm : item.name}
              </div>
              <div className="text-[10px] font-mono text-slate-400 truncate">
                {item.kssmTag}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};
