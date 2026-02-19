'use client';

import { useState, useMemo } from 'react';
import type { KostXResult, ZuschlagItem } from '../engine/kostx-types';

interface Props {
  result: KostXResult;
}

function fmt(v: number): string {
  return v.toLocaleString('de-DE', { maximumFractionDigits: 0 });
}

function fmtDec(v: number, d = 2): string {
  return v.toLocaleString('de-DE', { minimumFractionDigits: d, maximumFractionDigits: d });
}

type Kategorie = 'basis' | 'zuschlag' | 'abzug' | 'summe';

const KATEGORIE_COLORS: Record<Kategorie, string> = {
  basis: 'bg-blue-500/10 border-blue-500/20 text-blue-400',
  zuschlag: 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400',
  abzug: 'bg-red-500/10 border-red-500/20 text-red-400',
  summe: 'bg-indigo-500/10 border-indigo-500/20 text-indigo-400',
};

const KATEGORIE_LABELS: Record<Kategorie, string> = {
  basis: 'Basis',
  zuschlag: 'Zuschlag',
  abzug: 'Abzug',
  summe: 'Summe',
};

export default function KostenaufstellungView({ result }: Props) {
  const [isOpen, setIsOpen] = useState(false);
  const items = result.zuschlaege;

  const grouped = useMemo(() => {
    const basis = items.filter(i => i.typ === 'basis');
    const zuschlaege = items.filter(i => i.typ === 'zuschlag');
    const abzuege = items.filter(i => i.typ === 'abzug');
    const summen = items.filter(i => i.typ === 'summe');
    const zuschlagTotal = zuschlaege.reduce((s, i) => s + i.wert_eurM2, 0);
    const abzugTotal = abzuege.reduce((s, i) => s + i.wert_eurM2, 0);
    return { basis, zuschlaege, abzuege, summen, zuschlagTotal, abzugTotal };
  }, [items]);

  if (items.length === 0) return null;

  return (
    <div className="p-4">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center justify-between w-full text-left"
      >
        <h3 className="text-sm font-semibold text-white/90">
          {isOpen ? '▾' : '▸'} Kostenaufstellung (Zuschlag-System)
        </h3>
        <div className="flex gap-3 text-xs text-white/50">
          <span>{items.length - 1} Positionen</span>
          <span>{fmt(result.gik.gik_eurM2)} €/m² GIK</span>
        </div>
      </button>

      {isOpen && (
        <div className="mt-3">
          {/* Summary tiles */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-4">
            <div className="rounded-lg bg-blue-500/5 border border-blue-500/20 p-2">
              <div className="text-[10px] text-white/40">Basis KG 300+400</div>
              <div className="text-sm font-bold text-blue-400">{fmt(grouped.basis[0]?.wert_eurM2 ?? 0)} €/m²</div>
            </div>
            <div className="rounded-lg bg-emerald-500/5 border border-emerald-500/20 p-2">
              <div className="text-[10px] text-white/40">Zuschläge</div>
              <div className="text-sm font-bold text-emerald-400">+{fmt(grouped.zuschlagTotal)} €/m²</div>
            </div>
            <div className="rounded-lg bg-red-500/5 border border-red-500/20 p-2">
              <div className="text-[10px] text-white/40">Abzüge</div>
              <div className="text-sm font-bold text-red-400">{fmt(grouped.abzugTotal)} €/m²</div>
            </div>
            <div className="rounded-lg bg-indigo-500/5 border border-indigo-500/20 p-2">
              <div className="text-[10px] text-white/40">GIK gesamt</div>
              <div className="text-sm font-bold text-indigo-400">{fmt(grouped.summen[0]?.wert_eurM2 ?? 0)} €/m²</div>
            </div>
          </div>

          {/* Detail table */}
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="text-white/40 border-b border-white/10">
                  <th className="text-left py-1.5 px-1 font-medium">Position</th>
                  <th className="text-right py-1.5 px-1 font-medium">€/m² NUF</th>
                  <th className="text-left py-1.5 px-1 font-medium w-16">Typ</th>
                  <th className="text-left py-1.5 px-1 font-medium w-24">Anteil</th>
                </tr>
              </thead>
              <tbody>
                {items.map((item, i) => {
                  const cat = item.typ as Kategorie;
                  const isSum = cat === 'summe';
                  const gikM2 = grouped.summen[0]?.wert_eurM2 ?? 1;
                  const pct = gikM2 > 0 ? (Math.abs(item.wert_eurM2) / gikM2) * 100 : 0;
                  return (
                    <tr key={i} className={`border-b border-white/[0.03] ${isSum ? 'font-semibold text-white/90 bg-white/[0.02]' : 'text-white/70'}`}>
                      <td className="py-1.5 px-1">{item.label}</td>
                      <td className={`text-right py-1.5 px-1 ${item.wert_eurM2 < 0 ? 'text-red-400' : ''}`}>
                        {item.wert_eurM2 < 0 ? '' : '+'}{fmt(item.wert_eurM2)} €
                      </td>
                      <td className="py-1.5 px-1">
                        <span className={`inline-block text-[9px] px-1.5 py-0.5 rounded border ${KATEGORIE_COLORS[cat]}`}>
                          {KATEGORIE_LABELS[cat]}
                        </span>
                      </td>
                      <td className="py-1.5 px-1">
                        {!isSum && (
                          <div className="flex items-center gap-1">
                            <div className="flex-1 h-1.5 bg-white/5 rounded-full overflow-hidden">
                              <div
                                className={`h-full rounded-full ${cat === 'abzug' ? 'bg-red-500' : cat === 'basis' ? 'bg-blue-500' : 'bg-emerald-500'}`}
                                style={{ width: `${Math.min(pct, 100)}%` }}
                              />
                            </div>
                            <span className="text-[10px] text-white/30 w-8 text-right">{pct.toFixed(0)}%</span>
                          </div>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
