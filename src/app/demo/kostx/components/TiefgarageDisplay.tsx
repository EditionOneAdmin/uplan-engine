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

export default function TiefgarageDisplay({ result }: Props) {
  const [isOpen, setIsOpen] = useState(false);
  const tgResult = result.basement?.tiefgarageResult;

  if (!tgResult) return null;

  const nuf = result.masses.erloesflaecheWarm_m2;

  return (
    <div className="p-4">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center justify-between w-full text-left"
      >
        <h3 className="text-sm font-semibold text-white/90">
          {isOpen ? '▾' : '▸'} Tiefgarage
        </h3>
        <div className="flex gap-3 text-xs text-white/50">
          <span>{fmt(tgResult.total_eurBrutto)} € brutto</span>
          <span>{fmtDec(tgResult.kkwBGFui_eurM2Brutto, 0)} €/m² BGF ui</span>
        </div>
      </button>

      {isOpen && (
        <div className="mt-3 overflow-x-auto">
          {/* Kennwerte */}
          <div className="grid grid-cols-3 gap-2 mb-3">
            <div className="rounded-lg bg-white/5 p-2">
              <div className="text-[10px] text-white/40">GR 1. UG</div>
              <div className="text-xs font-semibold text-white/80">{fmt(tgResult.gr_m2)} m²</div>
            </div>
            <div className="rounded-lg bg-white/5 p-2">
              <div className="text-[10px] text-white/40">BGF ui gesamt</div>
              <div className="text-xs font-semibold text-white/80">{fmt(tgResult.bgfUi_m2)} m²</div>
            </div>
            <div className="rounded-lg bg-white/5 p-2">
              <div className="text-[10px] text-white/40">€/m² BGF ui</div>
              <div className="text-xs font-semibold text-white/80">{fmtDec(tgResult.kkwBGFui_eurM2Brutto, 0)} €</div>
            </div>
          </div>

          {/* Positionen */}
          <table className="w-full text-xs">
            <thead>
              <tr className="text-white/40 border-b border-white/10">
                <th className="text-left py-1.5 px-1 font-medium">#</th>
                <th className="text-left py-1.5 px-1 font-medium">Position</th>
                <th className="text-right py-1.5 px-1 font-medium">Menge</th>
                <th className="text-left py-1.5 px-1 font-medium">Einheit</th>
                <th className="text-right py-1.5 px-1 font-medium">EP netto</th>
                <th className="text-right py-1.5 px-1 font-medium">GP brutto</th>
              </tr>
            </thead>
            <tbody>
              {tgResult.positionen.map((p) => (
                <tr key={p.nr} className="border-b border-white/[0.03] text-white/70">
                  <td className="py-1 px-1 text-white/40">{p.nr}</td>
                  <td className="py-1 px-1">{p.name}</td>
                  <td className="text-right py-1 px-1">{fmtDec(p.menge)}</td>
                  <td className="py-1 px-1">{p.einheit}</td>
                  <td className="text-right py-1 px-1">{fmtDec(p.ep_netto)} €</td>
                  <td className="text-right py-1 px-1">{fmt(p.gp_brutto ?? 0)} €</td>
                </tr>
              ))}
              {/* Sonstiges, BE, Skalierung, BPI */}
              <tr className="border-b border-white/[0.03] text-white/50 italic">
                <td className="py-1 px-1">16</td>
                <td className="py-1 px-1">Sonstige Arbeiten (5%)</td>
                <td colSpan={3}></td>
                <td className="text-right py-1 px-1">{fmt(tgResult.sonstigesNetto * 1.19)} €</td>
              </tr>
              <tr className="border-b border-white/[0.03] text-white/50 italic">
                <td className="py-1 px-1">17</td>
                <td className="py-1 px-1">Baustelleneinrichtung (5%)</td>
                <td colSpan={3}></td>
                <td className="text-right py-1 px-1">{fmt(tgResult.beNetto * 1.19)} €</td>
              </tr>
              {tgResult.skalierungNetto !== 0 && (
                <tr className="border-b border-white/[0.03] text-white/50 italic">
                  <td className="py-1 px-1">18</td>
                  <td className="py-1 px-1">Skalierungseffekte</td>
                  <td colSpan={3}></td>
                  <td className="text-right py-1 px-1">{fmt(tgResult.skalierungNetto * 1.19)} €</td>
                </tr>
              )}
              {tgResult.bpiNetto !== 0 && (
                <tr className="border-b border-white/[0.03] text-white/50 italic">
                  <td className="py-1 px-1">19</td>
                  <td className="py-1 px-1">Baupreissteigerung</td>
                  <td colSpan={3}></td>
                  <td className="text-right py-1 px-1">{fmt(tgResult.bpiNetto * 1.19)} €</td>
                </tr>
              )}
            </tbody>
            <tfoot>
              <tr className="border-t border-white/10 font-semibold text-white/90">
                <td colSpan={5} className="py-1.5 px-1">Gesamt</td>
                <td className="text-right py-1.5 px-1">{fmt(tgResult.total_eurBrutto)} €</td>
              </tr>
              {nuf > 0 && (
                <tr className="text-white/50">
                  <td colSpan={5} className="py-1 px-1">€/m² NUF brutto</td>
                  <td className="text-right py-1 px-1">{fmtDec(tgResult.total_eurBrutto / nuf)} €/m²</td>
                </tr>
              )}
            </tfoot>
          </table>
        </div>
      )}
    </div>
  );
}
