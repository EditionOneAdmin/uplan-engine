'use client';

import type { KostXConfig } from '../engine/kostx-types';
import ParameterSlider from './ParameterSlider';

interface Props {
  config: KostXConfig;
  onChange: (patch: Partial<KostXConfig>) => void;
}

export default function EconomicsConfig({ config, onChange }: Props) {
  return (
    <div className="p-3">
      {[
        { label: 'KG 100 Grundstück', key: 'kg100_eurM2' as const, max: 1000 },
        { label: 'KG 200 Erschließung', key: 'kg200_eurM2' as const, max: 500 },
        { label: 'KG 500 Außenanlagen', key: 'kg500_eurM2' as const, max: 500 },
        { label: 'KG 700 Sonstiges', key: 'kg700Sonstige_eurM2' as const, max: 500 },
      ].map(({ label, key, max }) => (
        <div key={key} className="mb-3">
          <label className="block text-xs text-white/60 mb-1">{label}</label>
          <div className="flex items-center gap-1">
            <input
              type="number"
              min={0}
              max={max}
              value={config[key]}
              onChange={(e) => { const v = parseFloat(e.target.value); if (!isNaN(v) && v >= 0) onChange({ [key]: v }); }}
              className="w-full bg-white/10 border border-white/20 rounded px-2 py-1.5 text-xs text-white focus:outline-none focus:border-teal-400"
            />
            <span className="text-xs text-white/40 whitespace-nowrap">€/m²</span>
          </div>
        </div>
      ))}
      <ParameterSlider label="Interne Kosten" value={config.interneKostenProzent * 100} min={0} max={10} step={0.1} unit="%" formatValue={(v) => v.toFixed(1)} onChange={(v) => onChange({ interneKostenProzent: v / 100 })} />
      <ParameterSlider label="Baukostenreserve" value={config.baukostenreserveProzent * 100} min={0} max={15} step={0.5} unit="%" formatValue={(v) => v.toFixed(1)} onChange={(v) => onChange({ baukostenreserveProzent: v / 100 })} />
      <ParameterSlider label="Ziel-Rendite" value={config.zielRendite * 100} min={0} max={15} step={0.1} unit="%" formatValue={(v) => v.toFixed(1)} onChange={(v) => onChange({ zielRendite: v / 100 })} />
      <ParameterSlider label="Bewirtschaftung" value={config.bewirtschaftung * 100} min={0} max={15} step={0.1} unit="%" formatValue={(v) => v.toFixed(1)} onChange={(v) => onChange({ bewirtschaftung: v / 100 })} />
      <div className="mb-3">
        <label className="block text-xs text-white/60 mb-1">Multi Verkauf</label>
        <input
          type="number"
          min={1}
          max={50}
          value={config.multi}
          onChange={(e) => { const v = parseFloat(e.target.value); if (!isNaN(v) && v >= 1) onChange({ multi: v }); }}
          className="w-full bg-white/10 border border-white/20 rounded px-2 py-1.5 text-xs text-white focus:outline-none focus:border-teal-400"
        />
      </div>
    </div>
  );
}
