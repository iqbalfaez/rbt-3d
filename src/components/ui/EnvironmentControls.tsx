import React from 'react';
import {
  Droplets,
  Hand,
  Power,
  Radar,
  ScanEye,
  SlidersHorizontal,
  Sun,
} from 'lucide-react';
import { t } from '../../i18n/translations';
import { useGameStore } from '../../store/useGameStore';

export const EnvironmentControls: React.FC = () => {
  const isSimulating = useGameStore((s) => s.isSimulating);
  const language = useGameStore((s) => s.language);
  const components = useGameStore((s) => s.components);
  const env = useGameStore((s) => s.environment);
  const setEnvironment = useGameStore((s) => s.setEnvironment);

  if (!isSimulating) return null;

  const has = (type: string) => components.some((c) => c.type === type);
  const showAll =
    !has('ldr_sensor') &&
    !has('soil_sensor') &&
    !has('ultrasonic_sensor') &&
    !has('ir_sensor') &&
    !has('push_button') &&
    !has('toggle_switch');

  return (
    <div className="pointer-events-auto absolute bottom-[126px] left-1/2 -translate-x-1/2 z-20 w-[min(92vw,540px)] bg-[#121a20]/95 border border-emerald-500/50 rounded-lg shadow-2xl backdrop-blur p-3">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-1.5 text-xs font-semibold text-emerald-300">
          <SlidersHorizontal className="w-3.5 h-3.5" />
          <span>{t(language, 'envControls')}</span>
        </div>
        <span className="text-[10px] font-mono text-emerald-400/80 uppercase">Live Input Feed</span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs">
        {(showAll || has('toggle_switch')) && (
          <div className="p-2 rounded bg-slate-900/90 border border-slate-800 flex items-center justify-between gap-2">
            <span className="flex items-center gap-1.5 text-slate-200 font-medium">
              <Power className="w-3.5 h-3.5 text-amber-400" />
              {t(language, 'toggleSwitch')}
            </span>
            <button
              onClick={() => setEnvironment({ toggleSwitchOn: !env.toggleSwitchOn })}
              className={`px-2.5 py-1 rounded font-mono text-[11px] font-semibold transition ${
                env.toggleSwitchOn
                  ? 'bg-emerald-600 text-white'
                  : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
              }`}
            >
              {env.toggleSwitchOn ? 'ON' : 'OFF'}
            </button>
          </div>
        )}

        {(showAll || has('push_button')) && (
          <div className="p-2 rounded bg-slate-900/90 border border-slate-800 flex items-center justify-between gap-2">
            <span className="flex items-center gap-1.5 text-slate-200 font-medium">
              <Hand className="w-3.5 h-3.5 text-rose-400" />
              {t(language, 'pushButton')}
            </span>
            <button
              onPointerDown={() => setEnvironment({ pushButtonPressed: true })}
              onPointerUp={() => setEnvironment({ pushButtonPressed: false })}
              onPointerLeave={() => setEnvironment({ pushButtonPressed: false })}
              className={`px-2.5 py-1 rounded font-mono text-[11px] font-semibold transition ${
                env.pushButtonPressed
                  ? 'bg-rose-600 text-white scale-95'
                  : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
              }`}
            >
              {env.pushButtonPressed ? 'PRESSED' : 'HOLD'}
            </button>
          </div>
        )}

        {(showAll || has('ldr_sensor')) && (
          <div className="p-2 rounded bg-slate-900/90 border border-slate-800 space-y-1">
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-1.5 text-slate-200">
                <Sun className="w-3.5 h-3.5 text-amber-400" />
                {t(language, 'ambientLight')}
              </span>
              <span className="font-mono text-amber-300 font-semibold">{env.lightLevel}%</span>
            </div>
            <input
              type="range"
              min={0}
              max={100}
              value={env.lightLevel}
              onChange={(e) => setEnvironment({ lightLevel: Number(e.target.value) })}
              className="w-full workshop-slider"
            />
          </div>
        )}

        {(showAll || has('soil_sensor')) && (
          <div className="p-2 rounded bg-slate-900/90 border border-slate-800 space-y-1">
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-1.5 text-slate-200">
                <Droplets className="w-3.5 h-3.5 text-sky-400" />
                {t(language, 'soilMoisture')}
              </span>
              <span className="font-mono text-sky-300 font-semibold">{env.soilMoisture}%</span>
            </div>
            <input
              type="range"
              min={0}
              max={100}
              value={env.soilMoisture}
              onChange={(e) => setEnvironment({ soilMoisture: Number(e.target.value) })}
              className="w-full workshop-slider"
            />
          </div>
        )}

        {(showAll || has('ultrasonic_sensor')) && (
          <div className="p-2 rounded bg-slate-900/90 border border-slate-800 space-y-1">
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-1.5 text-slate-200">
                <Radar className="w-3.5 h-3.5 text-cyan-400" />
                {t(language, 'obstacleDistance')}
              </span>
              <span className="font-mono text-cyan-300 font-semibold">{env.obstacleDistance} cm</span>
            </div>
            <input
              type="range"
              min={2}
              max={100}
              value={env.obstacleDistance}
              onChange={(e) => setEnvironment({ obstacleDistance: Number(e.target.value) })}
              className="w-full workshop-slider"
            />
          </div>
        )}

        {(showAll || has('ir_sensor')) && (
          <div className="p-2 rounded bg-slate-900/90 border border-slate-800 flex items-center justify-between gap-2">
            <span className="flex items-center gap-1.5 text-slate-200 font-medium">
              <ScanEye className="w-3.5 h-3.5 text-amber-400" />
              {t(language, 'irObject')}
            </span>
            <button
              onClick={() => setEnvironment({ irDetected: !env.irDetected })}
              className={`px-2.5 py-1 rounded font-mono text-[11px] font-semibold transition ${
                env.irDetected
                  ? 'bg-amber-500 text-slate-950'
                  : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
              }`}
            >
              {env.irDetected ? t(language, 'objectPresent') : t(language, 'pathClear')}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
