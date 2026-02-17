"use client";

import { motion } from "framer-motion";
import { TableProperties } from "lucide-react";
import type { Baufeld, Variante } from "@/types/pipeline";
import { extractKPIs, fmtArea, fmtCurrency, fmtPercent, fmtEuroM2, type ExtractedKPIs } from "@/lib/pipeline-kpis";

interface Props {
  baufelder: Baufeld[];
  variantenMap: Record<string, Variante[]>;
}

interface RowData {
  bf: Baufeld;
  fav: Variante | undefined;
  k: ExtractedKPIs | null;
  bauzeit: number | null;
  irr: number | null;
  cashflowJ: number | null;
  ampel: "🟢" | "🟡" | "🔴" | "—";
}

function safeNum(val: unknown): number | null {
  if (val === null || val === undefined) return null;
  const n = Number(val);
  return isNaN(n) ? null : n;
}

function getBauzeit(v: Variante | undefined): number | null {
  if (!v) return null;
  const w = v.wirtschaftlichkeit as Record<string, unknown> | undefined;
  if (!w) return null;
  const cd = w.costData as Record<string, unknown> | undefined;
  return safeNum(cd?.bauzeit) ?? safeNum(w.bauzeit) ?? null;
}

function getIRR(k: ExtractedKPIs): number | null {
  if (k.strategy === "sell") return k.irrSell;
  if (k.strategy === "hold") return k.irrHold;
  return k.irrHold ?? k.irrSell ?? null;
}

function getCashflowJ(k: ExtractedKPIs, v: Variante | undefined): number | null {
  if (k.strategy === "sell" && k.verkaufserloes) return k.verkaufserloes;
  return k.jahresmiete ?? null;
}

function getAmpel(irr: number | null, dscr: number | null, compliant: boolean | null): "🟢" | "🟡" | "🔴" | "—" {
  if (irr === null && dscr === null) return "—";
  const notCompliant = compliant === false;
  if ((irr !== null && irr < 4) || (dscr !== null && dscr < 1.0) || notCompliant) return "🔴";
  if ((irr !== null && irr > 8) && (dscr !== null && dscr > 1.3) && !notCompliant) return "🟢";
  return "🟡";
}

type ColDef = {
  key: string;
  label: string;
  align: "left" | "right" | "center";
  getValue: (r: RowData) => number | null | string;
  format: (v: number | null | string) => string;
  higher?: boolean; // for best-highlight: true = higher better, false = lower better, undefined = no highlight
  sumMode?: "sum" | "avg" | "none";
};

const cols: ColDef[] = [
  { key: "baufeld", label: "Baufeld", align: "left", getValue: r => r.bf.name, format: v => String(v), sumMode: "none" },
  { key: "favorit", label: "Favorit", align: "left", getValue: r => r.fav?.name ?? "—", format: v => String(v), sumMode: "none" },
  { key: "wf", label: "WF", align: "right", getValue: r => r.k?.wohnflaeche ?? null, format: v => fmtArea(v as number | null), higher: true, sumMode: "sum" },
  { key: "bgf", label: "BGF", align: "right", getValue: r => r.k?.bgf ?? null, format: v => fmtArea(v as number | null), higher: true, sumMode: "sum" },
  { key: "we", label: "WE", align: "right", getValue: r => r.k?.units ?? null, format: v => v !== null ? String(v) : "—", higher: true, sumMode: "sum" },
  { key: "invest", label: "Investment", align: "right", getValue: r => r.k?.gesamtinvestition ?? null, format: v => fmtCurrency(v as number | null), higher: false, sumMode: "sum" },
  { key: "ek", label: "EK-Bedarf", align: "right", getValue: r => r.k?.ekBedarf ?? null, format: v => fmtCurrency(v as number | null), higher: false, sumMode: "sum" },
  { key: "eurom2", label: "€/m² WF", align: "right", getValue: r => r.k?.euroProM2WF ?? null, format: v => fmtEuroM2(v as number | null), higher: false, sumMode: "avg" },
  { key: "irr", label: "IRR", align: "right", getValue: r => r.irr, format: v => fmtPercent(v as number | null), higher: true, sumMode: "avg" },
  { key: "dscr", label: "DSCR", align: "right", getValue: r => r.k?.dscr ?? null, format: v => v !== null ? (v as number).toLocaleString("de-DE", { minimumFractionDigits: 2 }) : "—", higher: true, sumMode: "avg" },
  { key: "cashflow", label: "Cashflow/J", align: "right", getValue: r => r.cashflowJ, format: v => fmtCurrency(v as number | null), higher: true, sumMode: "sum" },
  { key: "bauzeit", label: "Bauzeit", align: "right", getValue: r => r.bauzeit, format: v => v !== null ? `${v} Mo.` : "—", higher: false, sumMode: "none" },
  { key: "grz", label: "GRZ", align: "right", getValue: r => r.k?.grzUsage ?? null, format: v => v !== null ? `${(v as number).toLocaleString("de-DE", { maximumFractionDigits: 2 })}` : "—", higher: false, sumMode: "avg" },
  { key: "ampel", label: "Ampel", align: "center", getValue: r => r.ampel, format: v => String(v), sumMode: "none" },
];

export default function ProjektZusammenfassung({ baufelder, variantenMap }: Props) {
  if (baufelder.length === 0) return null;

  const rows: RowData[] = baufelder.map(bf => {
    const varianten = variantenMap[bf.id] || [];
    const fav = varianten.find(v => v.is_favorite) || varianten[0];
    const k = fav ? extractKPIs(fav) : null;
    const irr = k ? getIRR(k) : null;
    const bauzeit = getBauzeit(fav);
    const cashflowJ = k ? getCashflowJ(k, fav) : null;
    const ampel = k ? getAmpel(irr, k.dscr, k.compliant) : "—" as const;
    return { bf, fav, k, bauzeit, irr, cashflowJ, ampel };
  });

  // Compute best values per column (only numeric cols with higher defined)
  const bestPerCol: Record<string, number | null> = {};
  for (const col of cols) {
    if (col.higher === undefined || col.sumMode === "none") continue;
    const numVals = rows.map(r => col.getValue(r)).filter((v): v is number => typeof v === "number");
    if (numVals.length < 2) { bestPerCol[col.key] = null; continue; }
    bestPerCol[col.key] = col.higher ? Math.max(...numVals) : Math.min(...numVals);
  }

  // Gesamt row
  const gesamtValues: Record<string, string> = {};
  for (const col of cols) {
    if (col.sumMode === "none" || !col.sumMode) { gesamtValues[col.key] = ""; continue; }
    const numVals = rows.map(r => col.getValue(r)).filter((v): v is number => typeof v === "number");
    if (numVals.length === 0) { gesamtValues[col.key] = "—"; continue; }
    const result = col.sumMode === "sum" ? numVals.reduce((a, b) => a + b, 0) : numVals.reduce((a, b) => a + b, 0) / numVals.length;
    gesamtValues[col.key] = col.format(result);
  }

  const thCls = "py-2.5 px-3 text-xs font-semibold text-slate-text/50 uppercase tracking-wider whitespace-nowrap";

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
              {cols.map(col => (
                <th key={col.key} className={`${col.align === "left" ? "text-left" : col.align === "center" ? "text-center" : "text-right"} ${thCls} ${col.key === "baufeld" ? "pl-4" : ""} ${col.key === "ampel" ? "pr-4" : ""}`}>
                  {col.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.bf.id} className="border-b border-gray-border/30 hover:bg-gray-bg/30 transition-colors">
                {cols.map(col => {
                  const val = col.getValue(row);
                  const isBest = col.higher !== undefined && typeof val === "number" && bestPerCol[col.key] !== null && val === bestPerCol[col.key];
                  const formatted = col.format(val);
                  return (
                    <td
                      key={col.key}
                      className={`py-2.5 px-3 text-xs ${col.align === "left" ? "text-left" : col.align === "center" ? "text-center" : "text-right"} ${col.key === "baufeld" ? "pl-4 font-medium text-primary" : ""} ${col.key === "favorit" ? "text-slate-text/60" : ""} ${col.key === "ampel" ? "pr-4 text-base" : ""} ${isBest ? "font-bold text-green-600" : ""}`}
                    >
                      {formatted}
                    </td>
                  );
                })}
              </tr>
            ))}
            {/* Gesamt row */}
            <tr className="bg-primary/5 font-bold">
              {cols.map(col => (
                <td key={col.key} className={`py-3 px-3 text-xs ${col.align === "left" ? "text-left" : col.align === "center" ? "text-center" : "text-right"} ${col.key === "baufeld" ? "pl-4 text-primary" : ""}`}>
                  {col.key === "baufeld" ? "Gesamt" : gesamtValues[col.key]}
                </td>
              ))}
            </tr>
          </tbody>
        </table>
      </div>
    </motion.div>
  );
}
