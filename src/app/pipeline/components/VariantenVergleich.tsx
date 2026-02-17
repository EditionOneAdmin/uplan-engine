"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, MapPin, BarChart3 } from "lucide-react";
import type { Variante } from "@/types/pipeline";
import { extractKPIs, fmtArea, fmtCurrency, fmtPercent, fmtEuroM2, fmtNum, type ExtractedKPIs } from "@/lib/pipeline-kpis";

interface Props {
  varianten: Variante[];
  baufeldName: string;
  onClose: () => void;
}

type KPIGetter = (k: ExtractedKPIs) => number | null;
type KPIFormatter = (val: number | null) => string;

interface KPIRowDef {
  label: string;
  get: KPIGetter;
  fmt: KPIFormatter;
  higher: boolean; // true = higher is better
  section?: string;
}

const kpiDefs: KPIRowDef[] = [
  // Flächen
  { section: "Flächen & Gebäude", label: "Wohnfläche", get: k => k.wohnflaeche, fmt: v => fmtArea(v), higher: true },
  { label: "BGF", get: k => k.bgf, fmt: v => fmtArea(v), higher: true },
  { label: "Wohneinheiten", get: k => k.units, fmt: v => fmtNum(v), higher: true },
  { label: "GRZ", get: k => k.grzUsage, fmt: v => v !== null ? v.toLocaleString("de-DE", { maximumFractionDigits: 2 }) : "—", higher: false },
  { label: "GFZ", get: k => k.gfzUsage, fmt: v => v !== null ? v.toLocaleString("de-DE", { maximumFractionDigits: 2 }) : "—", higher: true },
  { label: "Stellplätze", get: k => k.parkingNeeded, fmt: v => fmtNum(v), higher: false },
  // Kosten
  { section: "Kosten", label: "Gesamtinvestition", get: k => k.gesamtinvestition, fmt: v => fmtCurrency(v), higher: false },
  { label: "€/m² BGF", get: k => k.euroProM2BGF, fmt: v => fmtEuroM2(v), higher: false },
  { label: "€/m² WF", get: k => k.euroProM2WF, fmt: v => fmtEuroM2(v), higher: false },
  { label: "EK-Bedarf", get: k => k.ekBedarf, fmt: v => fmtCurrency(v), higher: false },
  { label: "Grundstück", get: k => k.grundstueckskosten, fmt: v => fmtCurrency(v), higher: false },
  { label: "Baukosten (KG 200-500)", get: k => k.baukosten, fmt: v => fmtCurrency(v), higher: false },
  // Rendite
  { section: "Rendite & Cashflow", label: "NIY", get: k => k.niy, fmt: v => fmtPercent(v), higher: true },
  { label: "Marge", get: k => k.marge, fmt: v => fmtPercent(v), higher: true },
  { label: "IRR (Hold)", get: k => k.irrHold, fmt: v => fmtPercent(v), higher: true },
  { label: "IRR (Sell)", get: k => k.irrSell, fmt: v => fmtPercent(v), higher: true },
  { label: "Cash-on-Cash", get: k => k.cashOnCash, fmt: v => fmtPercent(v), higher: true },
  { label: "EK-Rendite (Sell)", get: k => k.ekRenditeSell, fmt: v => fmtPercent(v), higher: true },
  { label: "DSCR", get: k => k.dscr, fmt: v => v !== null ? v.toLocaleString("de-DE", { minimumFractionDigits: 2 }) : "—", higher: true },
  { label: "Jahresmiete", get: k => k.jahresmiete, fmt: v => fmtCurrency(v), higher: true },
  { label: "Miete/m²", get: k => k.mieteProM2, fmt: v => fmtEuroM2(v), higher: true },
  { label: "Verkaufserlös", get: k => k.verkaufserloes, fmt: v => fmtCurrency(v), higher: true },
  { label: "Verkauf/m²", get: k => k.verkaufProM2, fmt: v => fmtEuroM2(v), higher: true },
  { label: "Break-Even", get: k => k.breakEvenMonth, fmt: v => v !== null ? `Monat ${v}` : "—", higher: false },
];

export default function VariantenVergleich({ varianten, baufeldName, onClose }: Props) {
  const [open] = useState(true);

  const allKPIs = varianten.map(v => extractKPIs(v));

  // Filter rows: only show rows where at least one variante has data
  const visibleRows = kpiDefs.filter(row =>
    allKPIs.some(k => row.get(k) !== null)
  );

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4 overflow-auto"
          onClick={onClose}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="w-full max-w-5xl rounded-2xl border border-gray-border bg-white p-6 shadow-xl max-h-[90vh] overflow-auto"
            onClick={e => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-lg font-bold text-primary flex items-center gap-2">
                  <BarChart3 className="h-5 w-5 text-accent" /> Varianten-Vergleich
                </h2>
                <p className="text-sm text-slate-text/50">{baufeldName}</p>
              </div>
              <button onClick={onClose} className="flex h-8 w-8 items-center justify-center rounded-lg hover:bg-gray-bg transition">
                <X className="h-4 w-4 text-slate-text/50" />
              </button>
            </div>

            {/* Map thumbnails */}
            <div className="grid gap-4 mb-6" style={{ gridTemplateColumns: `120px repeat(${varianten.length}, 1fr)` }}>
              <div />
              {varianten.map(v => (
                <div key={v.id} className="rounded-xl border border-gray-border bg-gray-bg h-24 flex items-center justify-center overflow-hidden">
                  {v.map_snapshot_url ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={v.map_snapshot_url} alt="" className="h-full w-full object-cover" />
                  ) : (
                    <MapPin className="h-5 w-5 text-slate-text/20" />
                  )}
                </div>
              ))}
            </div>

            {/* Comparison table */}
            <div className="overflow-x-auto -mx-6 px-6">
              <table className="w-full text-sm border-collapse">
                <thead>
                  <tr className="border-b-2 border-gray-border">
                    <th className="sticky left-0 bg-white text-left py-2 pr-4 text-xs font-semibold text-slate-text/50 uppercase tracking-wider min-w-[140px]">Kennwert</th>
                    {varianten.map(v => (
                      <th key={v.id} className="text-right py-2 px-3 text-xs font-semibold text-primary min-w-[120px]">
                        {v.name}
                        {v.is_favorite && <span className="ml-1">⭐</span>}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {visibleRows.map((row, idx) => {
                    const vals = allKPIs.map(k => row.get(k));
                    const numVals = vals.filter(v => v !== null) as number[];
                    const best = numVals.length > 1
                      ? (row.higher ? Math.max(...numVals) : Math.min(...numVals))
                      : null;
                    const worst = numVals.length > 1
                      ? (row.higher ? Math.min(...numVals) : Math.max(...numVals))
                      : null;

                    return (
                      <>
                        {row.section && (
                          <tr key={`section-${row.section}`}>
                            <td colSpan={varianten.length + 1} className="pt-4 pb-1 px-0">
                              <div className="text-[10px] font-bold text-slate-text/40 uppercase tracking-wider border-b border-gray-border/50 pb-1">
                                {row.section}
                              </div>
                            </td>
                          </tr>
                        )}
                        <tr key={`row-${idx}`} className="border-b border-gray-border/30 hover:bg-gray-bg/30 transition-colors">
                          <td className="sticky left-0 bg-white py-2 pr-4 text-xs text-slate-text/70 font-medium">{row.label}</td>
                          {vals.map((val, i) => {
                            const isBest = val !== null && best !== null && val === best && numVals.length > 1;
                            const isWorst = val !== null && worst !== null && val === worst && numVals.length > 1 && best !== worst;
                            return (
                              <td
                                key={varianten[i].id}
                                className={`text-right py-2 px-3 text-xs font-medium transition-colors ${
                                  isBest ? "text-green-700 font-bold bg-green-50/60" :
                                  isWorst ? "text-red-600/80 bg-red-50/40" :
                                  "text-primary"
                                }`}
                              >
                                {row.fmt(val)}
                              </td>
                            );
                          })}
                        </tr>
                      </>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
