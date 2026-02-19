'use client';

import type { KostXConfig } from '../engine/kostx-types';
import ParameterSlider from './ParameterSlider';
import ParameterSelect from './ParameterSelect';

interface Props {
  config: KostXConfig;
  onChange: (patch: Partial<KostXConfig>) => void;
}

export default function RoofConfig({ config, onChange }: Props) {
  const hasStaffel = config.staffelgeschoss !== 'nein';
  return (
    <div className="p-3">
      <ParameterSelect label="Dachform" value={config.dachform} options={[
        { value: 'Flachdach', label: 'Flachdach' },
        { value: 'Satteldach', label: 'Satteldach' },
        { value: 'Walmdach', label: 'Walmdach' },
        { value: 'Pultdach', label: 'Pultdach' },
      ]} onChange={(v) => onChange({ dachform: v as KostXConfig['dachform'] })} />
      <ParameterSelect label="Staffelgeschoss" value={config.staffelgeschoss} options={[
        { value: 'nein', label: 'Nein' },
        { value: 'Ja, eine Staffel', label: '1 Staffel' },
        { value: 'Ja, zwei Staffeln', label: '2 Staffeln' },
      ]} onChange={(v) => onChange({ staffelgeschoss: v as KostXConfig['staffelgeschoss'] })} />
      {hasStaffel && (
        <ParameterSlider label="Staffel 1 %" value={config.staffel1Prozent * 100} min={30} max={100} step={5} unit="%" formatValue={(v) => v.toFixed(0)} onChange={(v) => onChange({ staffel1Prozent: v / 100 })} />
      )}
      {config.staffelgeschoss === 'Ja, zwei Staffeln' && (
        <ParameterSlider label="Staffel 2 %" value={config.staffel2Prozent * 100} min={30} max={100} step={5} unit="%" formatValue={(v) => v.toFixed(0)} onChange={(v) => onChange({ staffel2Prozent: v / 100 })} />
      )}
      <ParameterSelect label="Gründach" value={config.gruendach} options={[
        { value: 'nein', label: 'Nein' },
        { value: 'extensiv', label: 'Extensiv' },
        { value: 'extensiv, inkl. Retention', label: 'Extensiv + Retention' },
      ]} onChange={(v) => onChange({ gruendach: v as KostXConfig['gruendach'] })} />
    </div>
  );
}
