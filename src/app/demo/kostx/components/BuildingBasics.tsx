'use client';

import type { KostXConfig } from '../engine/kostx-types';
import ParameterSlider from './ParameterSlider';
import ParameterSelect from './ParameterSelect';

interface Props {
  config: KostXConfig;
  onChange: (patch: Partial<KostXConfig>) => void;
}

export default function BuildingBasics({ config, onChange }: Props) {
  return (
    <div className="p-3">
      <h3 className="text-xs font-semibold text-teal-400 mb-3 flex items-center gap-1.5">
        <span>🏗️</span> Gebäude Grundlagen
      </h3>

      <div className="mb-3">
        <label className="block text-xs text-white/60 mb-1">Anzahl WE</label>
        <input
          type="number"
          min={1}
          max={500}
          value={config.anzahlWE}
          onChange={(e) => { const v = parseInt(e.target.value); if (!isNaN(v) && v >= 1 && v <= 500) onChange({ anzahlWE: v }); }}
          className="w-full bg-white/10 border border-white/20 rounded px-2 py-1.5 text-xs text-white focus:outline-none focus:border-teal-400"
        />
      </div>

      <ParameterSlider label="Länge Gebäude" value={config.laenge_m} min={5} max={200} step={1} unit="m" showInput onChange={(v) => onChange({ laenge_m: v })} />
      <ParameterSlider label="Breite Gebäude" value={config.breite_m} min={5} max={50} step={0.5} unit="m" showInput onChange={(v) => onChange({ breite_m: v })} />
      <ParameterSlider label="Geschosse" value={config.geschosse} min={1} max={30} step={1} unit="" showInput onChange={(v) => onChange({ geschosse: v })} />
      <ParameterSlider label="Lichte Raumhöhe" value={config.raumhoehe_m} min={2.3} max={4.0} step={0.1} unit="m" formatValue={(v) => v.toFixed(1)} onChange={(v) => onChange({ raumhoehe_m: v })} />

      <ParameterSelect
        label="Bauweise"
        value={config.bauweise}
        options={[
          { value: 'Mauerwerk', label: 'Mauerwerk' },
          { value: 'Stahlbeton', label: 'Stahlbeton' },
        ]}
        onChange={(v) => onChange({ bauweise: v as KostXConfig['bauweise'] })}
      />

      <ParameterSelect
        label="Untergeschoss"
        value={config.untergeschoss}
        options={[
          { value: 'nein', label: 'Nein' },
          { value: 'Keller', label: 'Keller' },
          { value: 'Tiefgarage (einzeln)', label: 'Tiefgarage' },
        ]}
        onChange={(v) => onChange({ untergeschoss: v as KostXConfig['untergeschoss'] })}
      />
    </div>
  );
}
