"use client";

import { X, Copy, ArrowRight } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import type { Variante } from "@/types/pipeline";
import { extractKPIs, fmtArea, fmtNum, fmtCurrency, fmtPercent } from "@/lib/pipeline-kpis";

interface Props {
  open: boolean;
  varianten: Variante[];
  baufeldName: string;
  onSelect: (varianteId: string) => void;
  onBlank: () => void;
  onClose: () => void;
}

export default function SelectTemplateModal({ open, varianten, baufeldName, onSelect, onBlank, onClose }: Props) {
  if (!open) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="w-full max-w-lg rounded-2xl bg-white shadow-2xl overflow-hidden"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex items-center justify-between border-b border-gray-border px-6 py-4">
            <div>
              <h2 className="text-lg font-bold text-primary">Neue Variante erstellen</h2>
              <p className="text-xs text-slate-text/50 mt-0.5">{baufeldName}</p>
            </div>
            <button onClick={onClose} className="flex h-8 w-8 items-center justify-center rounded-lg hover:bg-gray-bg transition">
              <X className="h-4 w-4 text-slate-text/50" />
            </button>
          </div>

          <div className="px-6 py-4 max-h-[60vh] overflow-y-auto">
            <p className="text-sm text-slate-text/60 mb-4">
              Wählen Sie eine bestehende Variante als Vorlage oder starten Sie von null.
            </p>

            <button
              onClick={onBlank}
              className="w-full flex items-center gap-3 rounded-xl border border-dashed border-gray-border p-4 mb-3 hover:border-accent hover:bg-accent/5 transition text-left group"
            >
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-gray-bg">
                <ArrowRight className="h-5 w-5 text-slate-text/40 group-hover:text-accent transition" />
              </div>
              <div>
                <div className="text-sm font-semibold text-primary">Leere Variante</div>
                <div className="text-xs text-slate-text/50">Von null starten in der Demo</div>
              </div>
            </button>

            {varianten.map((v) => {
              const kpis = extractKPIs(v);
              return (
                <button
                  key={v.id}
                  onClick={() => onSelect(v.id)}
                  className="w-full flex items-center gap-3 rounded-xl border border-gray-border p-4 mb-3 hover:border-accent hover:bg-accent/5 transition text-left group"
                >
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-accent/10">
                    <Copy className="h-5 w-5 text-accent" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-semibold text-primary">{v.name}</span>
                      {v.is_favorite && <span className="text-[10px] bg-yellow-100 text-yellow-700 px-1.5 py-0.5 rounded-full font-semibold">⭐ Favorit</span>}
                    </div>
                    <div className="flex items-center gap-3 text-xs text-slate-text/50 mt-1">
                      {kpis.wohnflaeche != null && <span>WF {fmtArea(kpis.wohnflaeche)}</span>}
                      {kpis.bgf != null && <span>BGF {fmtArea(kpis.bgf)}</span>}
                      {kpis.units != null && <span>{fmtNum(kpis.units)} WE</span>}
                      {kpis.gesamtinvestition != null && <span>{fmtCurrency(kpis.gesamtinvestition)}</span>}
                      {kpis.rendite != null && (
                        <span className={kpis.rendite >= 0 ? "text-green-600" : "text-red-500"}>
                          {fmtPercent(kpis.rendite)}
                        </span>
                      )}
                    </div>
                  </div>
                  <ArrowRight className="h-4 w-4 text-slate-text/30 group-hover:text-accent transition shrink-0" />
                </button>
              );
            })}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
