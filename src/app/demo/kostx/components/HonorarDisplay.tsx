'use client';

import { useState } from 'react';
import type { KostXResult } from '../engine/kostx-types';

interface Props {
  result: KostXResult;
}

function fmt(v: number): string {
  return v.toLocaleString('de-DE', { maximumFractionDigits: 0 });
}

function fmtDec(v: number, d = 2): string {
  return v.toLocaleString('de-DE', { minimumFractionDigits: d, maximumFractionDigits: d });
}

export default function HonorarDisplay({ result }: Props) {
  const [isOpen, setIsOpen] = useState(false);
  const { honorar } = result;
  const nuf = result.masses.erloesflaecheWarm_m2;
  const enabledGewerke = honorar.gewerke.filter(g => g.enabled);

  return (
    <div className="p-4">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center justify-between w-full text-left"
      >
        <h3 className="text-sm font-semibold text-white/90">
          {isOpen ? '▾' : '▸'} KG 700 Honorare (HOAI)
        </h3>
        <div className="flex gap-3 text-xs text-white/50">
          <span>{fmt(honorar.total_brutto)} € brutto</span>
          <span>{fmtDec(honorar.total_eurM2NUF, 0)} €/m²</span>
        </div>
      </button>

      {isOpen && (
        <div className="mt-3 overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="text-white/40 border-b border-white/10">
                <th className="text-left py-1.5 px-1 font-medium">Gewerk</th>
                <th className="text-right py-1.5 px-1 font-medium">Anr. Kosten</th>
                <th className="text-right py-1.5 px-1 font-medium">LP-Summe</th>
                <th className="text-right py-1.5 px-1 font-medium">Honorar brutto</th>
                <th className="text-right py-1.5 px-1 font-medium">€/m² NUF</th>
              </tr>
            </thead>
            <tbody>
              {enabledGewerke.map((g, i) => (
                <tr key={i} className="border-b border-white/[0.03] text-white/70">
                  <td className="py-1.5 px-1">{g.name}</td>
                  <td className="text-right py-1.5 px-1">{fmt(g.anrechenbareKosten)} €</td>
                  <td className="text-right py-1.5 px-1">{(g.lpSumme * 100).toFixed(0)}%</td>
                  <td className="text-right py-1.5 px-1">{fmt(g.honorar_brutto)} €</td>
                  <td className="text-right py-1.5 px-1">{nuf > 0 ? fmtDec(g.honorar_brutto / nuf) : '—'}</td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr className="border-t border-white/10 font-semibold text-white/90">
                <td className="py-1.5 px-1">Gesamt</td>
                <td className="text-right py-1.5 px-1">—</td>
                <td className="text-right py-1.5 px-1">—</td>
                <td className="text-right py-1.5 px-1">{fmt(honorar.total_brutto)} €</td>
                <td className="text-right py-1.5 px-1">{fmtDec(honorar.total_eurM2NUF)}</td>
              </tr>
            </tfoot>
          </table>
          <div className="mt-2 text-[10px] text-white/30">
            Anteil an KG 300–500: {(honorar.anteilKG300_500 * 100).toFixed(1)}%
          </div>
        </div>
      )}
    </div>
  );
}
