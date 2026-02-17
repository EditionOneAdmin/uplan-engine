"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, MapPin, BarChart3 } from "lucide-react";
import type { Variante } from "@/types/pipeline";

interface Props {
  varianten: Variante[];
  baufeldName: string;
  onClose: () => void;
}

const kpiRows = [
  { key: "bgf", label: "BGF (m²)", alt: "BGF", higher: true },
  { key: "wohnflaeche", label: "Wohnfläche (m²)", alt: "Wohnflaeche", higher: true },
  { key: "investment", label: "Investment (€)", alt: "Investment", higher: false },
  { key: "rendite", label: "Rendite (%)", alt: "Rendite", higher: true },
  { key: "cashflow", label: "Cashflow (€)", alt: "Cashflow", higher: true },
  { key: "gfz", label: "GFZ", alt: "GFZ", higher: true },
  { key: "grz", label: "GRZ", alt: "GRZ", higher: false },
];

function getVal(v: Variante, key: string, alt: string): number | null {
  const w = v.wirtschaftlichkeit as Record<string, number> | null;
  if (!w) return null;
  return w[key] ?? w[alt] ?? null;
}

export default function VariantenVergleich({ varianten, baufeldName, onClose }: Props) {
  const [open] = useState(true);

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
            className="w-full max-w-4xl rounded-2xl border border-gray-border bg-white p-6 shadow-xl max-h-[90vh] overflow-auto"
            onClick={(e) => e.stopPropagation()}
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
            <div className="grid gap-4 mb-6" style={{ gridTemplateColumns: `repeat(${varianten.length}, 1fr)` }}>
              {varianten.map((v) => (
                <div key={v.id} className="rounded-xl border border-gray-border bg-gray-bg h-32 flex items-center justify-center overflow-hidden">
                  {v.map_snapshot_url ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={v.map_snapshot_url} alt="" className="h-full w-full object-cover" />
                  ) : (
                    <MapPin className="h-6 w-6 text-slate-text/20" />
                  )}
                </div>
              ))}
            </div>

            {/* Comparison table */}
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-border">
                    <th className="text-left py-2 pr-4 text-xs font-semibold text-slate-text/50 uppercase tracking-wider">Kennwert</th>
                    {varianten.map((v) => (
                      <th key={v.id} className="text-right py-2 px-3 text-xs font-semibold text-primary">
                        {v.name}
                        {v.is_favorite && <span className="ml-1">⭐</span>}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {kpiRows.map((row) => {
                    const vals = varianten.map((v) => getVal(v, row.key, row.alt));
                    const numVals = vals.filter((v) => v !== null) as number[];
                    const best = numVals.length > 0
                      ? (row.higher ? Math.max(...numVals) : Math.min(...numVals))
                      : null;

                    return (
                      <tr key={row.key} className="border-b border-gray-border/50">
                        <td className="py-2.5 pr-4 text-slate-text/70">{row.label}</td>
                        {vals.map((val, i) => (
                          <td
                            key={varianten[i].id}
                            className={`text-right py-2.5 px-3 font-medium ${
                              val !== null && val === best && numVals.length > 1
                                ? "text-green-600 font-bold"
                                : "text-primary"
                            }`}
                          >
                            {val !== null ? Number(val).toLocaleString("de-DE") : "—"}
                          </td>
                        ))}
                      </tr>
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
