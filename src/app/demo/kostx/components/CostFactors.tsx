'use client';

import type { KostXConfig } from '../engine/kostx-types';
import ParameterSlider from './ParameterSlider';
import ParameterSelect from './ParameterSelect';
import ToggleSwitch from './ToggleSwitch';

interface Props {
  config: KostXConfig;
  onChange: (patch: Partial<KostXConfig>) => void;
}

const QUARTERS: { value: string; label: string }[] = [];
for (let y = 2025; y <= 2035; y++) {
  for (let q = 1; q <= 4; q++) {
    QUARTERS.push({ value: `Q${q} ${y}`, label: `Q${q} ${y}` });
  }
}

export default function CostFactors({ config, onChange }: Props) {
  return (
    <div className="p-3">
      <ParameterSelect label="Baubeginn" value={config.baubeginn} options={QUARTERS} onChange={(v) => onChange({ baubeginn: v })} />
      <ParameterSlider label="BKI p.a." value={config.baukostenindexPa} min={0} max={8} step={0.1} unit="%" formatValue={(v) => v.toFixed(1)} onChange={(v) => onChange({ baukostenindexPa: v })} info="Jährliche Baupreissteigerung in %. Aktueller Baukostenindex: ~3%. Konservativ: 1.5%" />
      <ParameterSlider label="Regionalfaktor" value={config.regionalfaktor} min={0.5} max={2.0} step={0.05} formatValue={(v) => v.toFixed(2)} onChange={(v) => onChange({ regionalfaktor: v })} />
      <ParameterSlider label="GU-Zuschlag" value={config.guZuschlag * 100} min={0} max={30} step={1} unit="%" formatValue={(v) => v.toFixed(0)} onChange={(v) => onChange({ guZuschlag: v / 100 })} info="Generalunternehmer-Zuschlag auf die Baukosten." />
      <ParameterSelect
        label="Energiestandard"
        value={config.energiestandard}
        options={[
          { value: 'GEG', label: 'GEG' },
          { value: 'EH 55', label: 'EH 55' },
          { value: 'EH 40', label: 'EH 40' },
        ]}
        onChange={(v) => onChange({ energiestandard: v as KostXConfig['energiestandard'] })}
      />
      <ToggleSwitch label="Beengter Bauraum" checked={config.beengterBauraum} onChange={(v) => onChange({ beengterBauraum: v })} info="Pauschaler Zuschlag für erschwerte Baustellenbedingungen (z.B. Baulücke, kein Platz für Kran). Details folgen." />
      <ToggleSwitch label="Tiefgründung" checked={config.tiefgruendung} onChange={(v) => onChange({ tiefgruendung: v })} info="Zuschlag wenn Bodenverhältnisse eine Tiefgründung (Pfähle, Bohrpfähle) erfordern. Details folgen." />
    </div>
  );
}
