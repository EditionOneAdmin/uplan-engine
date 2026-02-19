"use client";

import React from 'react';
import type { FormXConfig } from './types';

interface Props {
  config: FormXConfig;
  onChange: (config: FormXConfig) => void;
}

function SliderRow({ label, value, min, max, step, unit, onChange }: {
  label: string; value: number; min: number; max: number; step: number; unit: string;
  onChange: (v: number) => void;
}) {
  return (
    <div className="space-y-1">
      <div className="flex justify-between text-sm">
        <span className="text-white/60">{label}</span>
        <span className="text-white font-mono">{value}{unit}</span>
      </div>
      <input type="range" min={min} max={max} step={step} value={value}
        onChange={e => onChange(parseFloat(e.target.value))}
        className="w-full h-1.5 bg-white/10 rounded-full appearance-none cursor-pointer accent-teal-500" />
    </div>
  );
}

export default function FormXConfigPanel({ config, onChange }: Props) {
  const update = (partial: Partial<FormXConfig>) => onChange({ ...config, ...partial });

  return (
    <div className="space-y-4">
      <h3 className="text-xs font-semibold text-white/40 uppercase tracking-wider">Konfiguration</h3>

      <SliderRow label="Geschosse" value={config.geschosse} min={1} max={30} step={1} unit=""
        onChange={v => update({ geschosse: v })} />

      <SliderRow label="Raumhöhe" value={config.raumhoehe} min={2.3} max={4.0} step={0.1} unit=" m"
        onChange={v => update({ raumhoehe: Math.round(v * 10) / 10 })} />

      <div className="space-y-1">
        <div className="flex justify-between text-sm">
          <span className="text-white/60">WE-Anzahl</span>
          <span className="text-white font-mono">{config.weAnzahl === 'auto' ? 'auto' : config.weAnzahl}</span>
        </div>
        <div className="flex gap-2">
          <button onClick={() => update({ weAnzahl: 'auto' })}
            className={`px-2 py-1 text-xs rounded ${config.weAnzahl === 'auto' ? 'bg-teal-600 text-white' : 'bg-white/10 text-white/60'}`}>
            Auto
          </button>
          <input type="number" min={1} max={500}
            value={config.weAnzahl === 'auto' ? '' : config.weAnzahl}
            placeholder="—"
            onChange={e => update({ weAnzahl: e.target.value ? parseInt(e.target.value) : 'auto' })}
            className="w-20 bg-white/10 text-white text-sm px-2 py-1 rounded border border-white/10" />
        </div>
      </div>

      <SliderRow label="NUF-Effizienz" value={Math.round(config.nufEffizienz * 100)} min={60} max={85} step={1} unit="%"
        onChange={v => update({ nufEffizienz: v / 100 })} />

      <SliderRow label="Fensteranteil" value={Math.round(config.fensteranteil * 100)} min={10} max={60} step={1} unit="%"
        onChange={v => update({ fensteranteil: v / 100 })} />

      <div className="space-y-1">
        <span className="text-sm text-white/60">Bauweise</span>
        <select value={config.bauweise} onChange={e => update({ bauweise: e.target.value as FormXConfig['bauweise'] })}
          className="w-full bg-white/10 text-white text-sm px-2 py-1.5 rounded border border-white/10">
          <option value="Mauerwerk">Mauerwerk</option>
          <option value="Stahlbeton">Stahlbeton</option>
        </select>
      </div>
    </div>
  );
}
