'use client';

import type { KostXResult } from '../engine/kostx-types';

interface Props {
  result: KostXResult;
}

function fmt(v: number, d = 0): string {
  return v.toLocaleString('de-DE', { minimumFractionDigits: d, maximumFractionDigits: d });
}

export default function MassDisplay({ result }: Props) {
  const m = result.masses;
  const items: [string, string][] = [
    ['GR', `${fmt(m.gr_m2)} m²`],
    ['BGF oi', `${fmt(m.bgfRoi_m2)} m²`],
    ['NUF R', `${fmt(m.nufR_m2)} m²`],
    ['AWF', `${fmt(m.awf_m2)} m²`],
    ['IWF', `${fmt(m.iwf_m2)} m²`],
    ['DEF', `${fmt(m.def_m2)} m²`],
    ['DAF', `${fmt(m.daf_m2)} m²`],
    ['FF', `${fmt(m.ff_m2)} m²`],
    ['Gebäudehöhe', `${fmt(m.gebaeudehoehe_m, 1)} m`],
    ['Gebäudeklasse', `${m.gebaeudeklasse}`],
    ['NUF/BGF', `${fmt(m.nutzflaecheneffizienz * 100, 1)} %`],
    ['Ø WE', `${fmt(m.avgWeGroesse_m2, 1)} m²`],
  ];

  return (
    <div className="p-4">
      <h3 className="text-sm font-semibold text-white/90 mb-3">Gebäudekennwerte</h3>
      <div className="grid grid-cols-2 gap-x-4 gap-y-1.5">
        {items.map(([label, value]) => (
          <div key={label} className="flex justify-between text-xs">
            <span className="text-white/50">{label}</span>
            <span className="text-white/90 font-medium">{value}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
