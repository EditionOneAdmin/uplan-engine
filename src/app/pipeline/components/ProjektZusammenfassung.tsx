"use client";

import { motion } from "framer-motion";
import { TableProperties } from "lucide-react";
import type { Baufeld, Variante } from "@/types/pipeline";
import { extractKPIs, fmtArea, fmtCurrency, fmtPercent } from "@/lib/pipeline-kpis";

interface Props {
  baufelder: Baufeld[];
  variantenMap: Record<string, Variante[]>;
}

export default function ProjektZusammenfassung({ baufelder, variantenMap }: Props) {
  if (baufelder.length === 0) return null;

  const rows = baufelder.map(bf => {
    const varianten = variantenMap[bf.id] || [];
    const fav = varianten.find(v => v.is_favorite) || varianten[0];
    const k = fav ? extractKPIs(fav) : null;
    return { bf, fav, k };
  });

  // Totals
  let totalWF = 0, totalBGF = 0, totalWE = 0, totalInvest = 0, renditeSum = 0, renditeCount = 0;
  for (const { k } of rows) {
    if (!k) continue;
    if (k.wohnflaeche) totalWF += k.wohnflaeche;
    if (k.bgf) totalBGF += k.bgf;
    if (k.units) totalWE += k.units;
    if (k.gesamtinvestition) totalInvest += k.gesamtinvestition;
    const r = k.niy ?? k.marge ?? k.rendite;
    if (r !== null) { renditeSum += r; renditeCount++; }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-2xl border border-gray-border bg-white shadow-sm overflow-hidden"
    >
      <div className="px-5 py-4 border-b border-gray-border/50">
        <h2 className="text-base font-bold text-primary flex items-center gap-2">
          <TableProperties className="h-4 w-4 text-accent" /> Projektübersicht
        </h2>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-border bg-gray-bg/50">
              <th className="text-left py-2.5 px-4 text-xs font-semibold text-slate-text/50 uppercase tracking-wider">Baufeld</th>
              <th className="text-left py-2.5 px-3 text-xs font-semibold text-slate-text/50 uppercase tracking-wider">Favorit</th>
              <th className="text-right py-2.5 px-3 text-xs font-semibold text-slate-text/50 uppercase tracking-wider">WF</th>
              <th className="text-right py-2.5 px-3 text-xs font-semibold text-slate-text/50 uppercase tracking-wider">BGF</th>
              <th className="text-right py-2.5 px-3 text-xs font-semibold text-slate-text/50 uppercase tracking-wider">WE</th>
              <th className="text-right py-2.5 px-3 text-xs font-semibold text-slate-text/50 uppercase tracking-wider">Investment</th>
              <th className="text-right py-2.5 px-3 text-xs font-semibold text-slate-text/50 uppercase tracking-wider">Rendite</th>
              <th className="text-right py-2.5 px-4 text-xs font-semibold text-slate-text/50 uppercase tracking-wider">GRZ</th>
            </tr>
          </thead>
          <tbody>
            {rows.map(({ bf, fav, k }) => (
              <tr key={bf.id} className="border-b border-gray-border/30 hover:bg-gray-bg/30 transition-colors">
                <td className="py-2.5 px-4 font-medium text-primary">{bf.name}</td>
                <td className="py-2.5 px-3 text-xs text-slate-text/60">{fav ? fav.name : "—"}</td>
                <td className="py-2.5 px-3 text-right text-xs font-semibold text-accent">{k ? fmtArea(k.wohnflaeche) : "—"}</td>
                <td className="py-2.5 px-3 text-right text-xs">{k ? fmtArea(k.bgf) : "—"}</td>
                <td className="py-2.5 px-3 text-right text-xs">{k?.units ?? "—"}</td>
                <td className="py-2.5 px-3 text-right text-xs">{k ? fmtCurrency(k.gesamtinvestition) : "—"}</td>
                <td className={`py-2.5 px-3 text-right text-xs font-semibold ${
                  k && (k.niy ?? k.marge ?? k.rendite) !== null && (k.niy ?? k.marge ?? k.rendite)! > 5 ? "text-green-600" :
                  k && (k.niy ?? k.marge ?? k.rendite) !== null && (k.niy ?? k.marge ?? k.rendite)! > 2 ? "text-yellow-600" :
                  k && (k.niy ?? k.marge ?? k.rendite) !== null ? "text-red-600" : ""
                }`}>
                  {k ? fmtPercent(k.niy ?? k.marge ?? k.rendite) : "—"}
                </td>
                <td className="py-2.5 px-4 text-right text-xs">
                  {k?.grzUsage !== null && k?.grzUsage !== undefined
                    ? `${k.grzUsage.toLocaleString("de-DE", { maximumFractionDigits: 2 })} ${k.compliant ? "✅" : "⚠️"}`
                    : "—"}
                </td>
              </tr>
            ))}
            {/* Totals row */}
            <tr className="bg-primary/5 font-bold">
              <td className="py-3 px-4 text-primary">Gesamt</td>
              <td className="py-3 px-3"></td>
              <td className="py-3 px-3 text-right text-xs text-accent">{fmtArea(totalWF || null)}</td>
              <td className="py-3 px-3 text-right text-xs">{fmtArea(totalBGF || null)}</td>
              <td className="py-3 px-3 text-right text-xs">{totalWE || "—"}</td>
              <td className="py-3 px-3 text-right text-xs">{fmtCurrency(totalInvest || null)}</td>
              <td className="py-3 px-3 text-right text-xs">{renditeCount > 0 ? fmtPercent(renditeSum / renditeCount) : "—"}</td>
              <td className="py-3 px-4"></td>
            </tr>
          </tbody>
        </table>
      </div>
    </motion.div>
  );
}
