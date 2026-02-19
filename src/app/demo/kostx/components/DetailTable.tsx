'use client';

import { useState } from 'react';
import type { KostXResult, KGGruppe } from '../engine/kostx-types';

interface Props {
  result: KostXResult;
}

function fmt(v: number): string {
  return v.toLocaleString('de-DE', { maximumFractionDigits: 0 });
}

function fmtDec(v: number): string {
  return v.toLocaleString('de-DE', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

export default function DetailTable({ result }: Props) {
  const [open, setOpen] = useState<Record<string, boolean>>({});
  const erloes = result.masses.erloesflaecheWarm_m2;

  const groups = Object.entries(result.kg300)
    .filter(([k]) => k.startsWith('kg3'))
    .map(([key, grp]) => ({ key, grp: grp as KGGruppe }))
    .filter(({ grp }) => grp.total_eurBrutto > 0);

  const toggleKey = (key: string) => setOpen(p => ({ ...p, [key]: !p[key] }));

  return (
    <div className="p-4">
      <h3 className="text-sm font-semibold text-white/90 mb-3">Detailtabelle</h3>
      <div className="overflow-x-auto">
        <table className="w-full text-xs">
          <thead>
            <tr className="text-white/40 border-b border-white/10">
              <th className="text-left py-1.5 px-1 font-medium">KG</th>
              <th className="text-left py-1.5 px-1 font-medium">Bezeichnung</th>
              <th className="text-right py-1.5 px-1 font-medium">Menge</th>
              <th className="text-left py-1.5 px-1 font-medium">Einheit</th>
              <th className="text-right py-1.5 px-1 font-medium">EP netto</th>
              <th className="text-right py-1.5 px-1 font-medium">GP netto</th>
              <th className="text-right py-1.5 px-1 font-medium">KKW brutto</th>
            </tr>
          </thead>
          <tbody>
            {/* KG 300 */}
            {groups.map(({ key, grp }) => {
              const isOpen = open[key] ?? false;
              const kkw = erloes > 0 ? grp.total_eurBrutto / erloes : 0;
              return (
                <tbody key={key}>
                  <tr
                    className="border-b border-white/5 cursor-pointer hover:bg-white/5 font-semibold text-white/80"
                    onClick={() => toggleKey(key)}
                  >
                    <td className="py-1.5 px-1">{isOpen ? '▾' : '▸'} {grp.kg}</td>
                    <td className="py-1.5 px-1">{grp.bezeichnung}</td>
                    <td className="text-right py-1.5 px-1">—</td>
                    <td className="py-1.5 px-1">—</td>
                    <td className="text-right py-1.5 px-1">—</td>
                    <td className="text-right py-1.5 px-1">{fmt(grp.total_eurNetto)} €</td>
                    <td className="text-right py-1.5 px-1">{fmtDec(kkw)} €/m²</td>
                  </tr>
                  {isOpen && grp.positionen.map((pos, i) => (
                    <tr key={i} className="border-b border-white/[0.03] text-white/60">
                      <td className="py-1 px-1 pl-4">{pos.kg}</td>
                      <td className="py-1 px-1">{pos.bezeichnung}</td>
                      <td className="text-right py-1 px-1">{fmtDec(pos.menge)}</td>
                      <td className="py-1 px-1">{pos.einheit}</td>
                      <td className="text-right py-1 px-1">{fmtDec(pos.einheitspreis_eurNetto)} €</td>
                      <td className="text-right py-1 px-1">{fmt(pos.gesamtkosten_eurNetto)} €</td>
                      <td className="text-right py-1 px-1">{erloes > 0 ? fmtDec(pos.gesamtkosten_eurBrutto / erloes) : '—'} €/m²</td>
                    </tr>
                  ))}
                </tbody>
              );
            })}

            {/* UG / Tiefgarage Section */}
            {result.basement && result.basement.total_eurBrutto > 0 && (
              <tbody>
                <tr
                  className="border-b border-white/5 cursor-pointer hover:bg-white/5 font-semibold text-amber-400/80 bg-amber-500/[0.03]"
                  onClick={() => toggleKey('ug')}
                >
                  <td className="py-1.5 px-1">{open['ug'] ? '▾' : '▸'} UG</td>
                  <td className="py-1.5 px-1">{result.basement.tiefgarageResult ? 'Tiefgarage' : 'Keller'}</td>
                  <td className="text-right py-1.5 px-1">—</td>
                  <td className="py-1.5 px-1">—</td>
                  <td className="text-right py-1.5 px-1">—</td>
                  <td className="text-right py-1.5 px-1">{fmt(result.basement.total_eurNetto)} €</td>
                  <td className="text-right py-1.5 px-1">{erloes > 0 ? fmtDec(result.basement.total_eurBrutto / erloes) : '—'} €/m²</td>
                </tr>
                {open['ug'] && result.basement.positionen.map((pos, i) => (
                  <tr key={`ug-${i}`} className="border-b border-white/[0.03] text-white/60">
                    <td className="py-1 px-1 pl-4">{pos.kg}</td>
                    <td className="py-1 px-1">{pos.bezeichnung}</td>
                    <td className="text-right py-1 px-1">{fmtDec(pos.menge)}</td>
                    <td className="py-1 px-1">{pos.einheit}</td>
                    <td className="text-right py-1 px-1">{fmtDec(pos.einheitspreis_eurNetto)} €</td>
                    <td className="text-right py-1 px-1">{fmt(pos.gesamtkosten_eurNetto)} €</td>
                    <td className="text-right py-1 px-1">{erloes > 0 ? fmtDec(pos.gesamtkosten_eurBrutto / erloes) : '—'} €/m²</td>
                  </tr>
                ))}
              </tbody>
            )}

            {/* KG 700 Honorare Section */}
            {result.honorar.total_brutto > 0 && (
              <tbody>
                <tr
                  className="border-b border-white/5 cursor-pointer hover:bg-white/5 font-semibold text-purple-400/80 bg-purple-500/[0.03]"
                  onClick={() => toggleKey('kg700')}
                >
                  <td className="py-1.5 px-1">{open['kg700'] ? '▾' : '▸'} 700</td>
                  <td className="py-1.5 px-1">Honorare (HOAI)</td>
                  <td className="text-right py-1.5 px-1">—</td>
                  <td className="py-1.5 px-1">—</td>
                  <td className="text-right py-1.5 px-1">—</td>
                  <td className="text-right py-1.5 px-1">{fmt(result.honorar.total_brutto / 1.19)} €</td>
                  <td className="text-right py-1.5 px-1">{fmtDec(result.honorar.total_eurM2NUF)} €/m²</td>
                </tr>
                {open['kg700'] && result.honorar.gewerke.filter(g => g.enabled).map((g, i) => (
                  <tr key={`h-${i}`} className="border-b border-white/[0.03] text-white/60">
                    <td className="py-1 px-1 pl-4">700</td>
                    <td className="py-1 px-1">{g.name}</td>
                    <td className="text-right py-1 px-1">{fmtDec(g.anrechenbareKosten)}</td>
                    <td className="py-1 px-1">€ anr.</td>
                    <td className="text-right py-1 px-1">—</td>
                    <td className="text-right py-1 px-1">{fmt(g.honorar_netto)} €</td>
                    <td className="text-right py-1 px-1">{erloes > 0 ? fmtDec(g.honorar_brutto / erloes) : '—'} €/m²</td>
                  </tr>
                ))}
              </tbody>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
