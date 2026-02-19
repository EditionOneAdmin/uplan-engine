'use client';

import type { KostXConfig } from '../engine/kostx-types';
import ParameterSlider from './ParameterSlider';
import ParameterSelect from './ParameterSelect';
import ToggleSwitch from './ToggleSwitch';

interface Props {
  config: KostXConfig;
  onChange: (patch: Partial<KostXConfig>) => void;
}

export default function TechConfig({ config, onChange }: Props) {
  return (
    <div className="p-3">
      <ParameterSelect label="Energieversorgung" value={config.energieversorgung} options={[
        { value: 'Fernwärme', label: 'Fernwärme' },
        { value: 'Luftwasserwärmepumpe', label: 'LWWP' },
        { value: 'geothermische Wärmepumpe', label: 'Geothermie' },
      ]} onChange={(v) => onChange({ energieversorgung: v as KostXConfig['energieversorgung'] })} />
      <ParameterSelect label="Bäder Lüftung" value={config.positionierungBaeder} options={[
        { value: 'an Außenwand', label: 'Ohne Lüftungsanlage (Außenwand)' },
        { value: 'innenliegend', label: 'Mit Lüftungsanlage (innenliegend)' },
      ]} onChange={(v) => onChange({ positionierungBaeder: v as KostXConfig['positionierungBaeder'] })} />
      <ToggleSwitch label="PV-Anlage" checked={config.pvAnlage} onChange={(v) => onChange({ pvAnlage: v })} />
      {config.pvAnlage && (
        <ParameterSlider label="PV Dachanteil" value={config.pvDachanteil * 100} min={10} max={100} step={5} unit="%" formatValue={(v) => v.toFixed(0)} onChange={(v) => onChange({ pvDachanteil: v / 100 })} />
      )}
      <ParameterSelect label="Küchen" value={config.kuechen} options={[
        { value: 'nein', label: 'Nein' },
        { value: 'Küche Ø 4500€', label: '4.500 €' },
        { value: 'Küche Ø 6000€', label: '6.000 €' },
        { value: 'Küche Ø 8000€', label: '8.000 €' },
        { value: 'Küche Ø 10000€', label: '10.000 €' },
      ]} onChange={(v) => onChange({ kuechen: v as KostXConfig['kuechen'] })} />
    </div>
  );
}
