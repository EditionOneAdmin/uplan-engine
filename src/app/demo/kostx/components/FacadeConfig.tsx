'use client';

import type { KostXConfig } from '../engine/kostx-types';
import ParameterSlider from './ParameterSlider';
import ParameterSelect from './ParameterSelect';

interface Props {
  config: KostXConfig;
  onChange: (patch: Partial<KostXConfig>) => void;
}

export default function FacadeConfig({ config, onChange }: Props) {
  return (
    <div className="p-3">
      <ParameterSlider label="Fensterflächenanteil" value={config.fensteranteil * 100} min={10} max={60} step={1} unit="%" formatValue={(v) => v.toFixed(0)} onChange={(v) => onChange({ fensteranteil: v / 100 })} />
      <ParameterSelect label="Fenstermaterial" value={config.fenstermaterial} options={[{ value: 'Kunststoff', label: 'Kunststoff' }, { value: 'Holz', label: 'Holz' }]} onChange={(v) => onChange({ fenstermaterial: v as KostXConfig['fenstermaterial'] })} />
      <ParameterSelect label="Sonnenschutz" value={config.sonnenschutz} options={[
        { value: 'nein', label: 'Nein' },
        { value: 'Raffstore elektr.', label: 'Raffstore elektr.' },
        { value: 'Rolladen elektr.', label: 'Rolladen elektr.' },
        { value: 'Rolladen manuell', label: 'Rolladen manuell' },
        { value: 'Sonnenschutzverglasung', label: 'Sonnenschutzverglasung' },
      ]} onChange={(v) => onChange({ sonnenschutz: v as KostXConfig['sonnenschutz'] })} />
      <ParameterSelect label="Fassadengestaltung" value={config.fassadengestaltung} options={[
        { value: 'WDVS', label: 'WDVS' },
        { value: 'WDVS mit Klinkerriemchen', label: 'WDVS + Klinker' },
      ]} onChange={(v) => onChange({ fassadengestaltung: v as KostXConfig['fassadengestaltung'] })} />
      <ParameterSlider label="Anteil WE mit Balkon" value={config.balkoneAnteil * 100} min={0} max={100} step={5} unit="%" formatValue={(v) => v.toFixed(0)} onChange={(v) => onChange({ balkoneAnteil: v / 100 })} />
      <ParameterSelect label="Balkontyp" value={config.balkontyp} options={[
        { value: 'vorgestellte Balkone', label: 'Vorgestellt' },
        { value: 'hängende Balkone', label: 'Hängend' },
        { value: 'Loggien', label: 'Loggia' },
      ]} onChange={(v) => onChange({ balkontyp: v as KostXConfig['balkontyp'] })} />
      <ParameterSlider label="Balkongröße" value={config.balkongroesse_m2} min={3} max={20} step={0.5} unit="m²" onChange={(v) => onChange({ balkongroesse_m2: v })} />
    </div>
  );
}
