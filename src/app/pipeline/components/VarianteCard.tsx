"use client";

import { motion } from "framer-motion";
import { Star, Trash2, MapPin } from "lucide-react";
import type { Variante } from "@/types/pipeline";

interface Props {
  variante: Variante;
  onSetFavorite: () => void;
  onDelete: () => void;
}

export default function VarianteCard({ variante, onSetFavorite, onDelete }: Props) {
  const w = variante.wirtschaftlichkeit as Record<string, number> | null;
  const bgf = w?.bgf || w?.BGF;
  const investment = w?.investment || w?.Investment;
  const rendite = w?.rendite || w?.Rendite;

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className={`relative rounded-xl border p-4 transition ${
        variante.is_favorite
          ? "border-amber-300 bg-amber-50/50 shadow-sm"
          : "border-gray-border bg-white hover:shadow-sm"
      }`}
    >
      {variante.is_favorite && (
        <span className="absolute -top-2 -right-2 flex h-6 w-6 items-center justify-center rounded-full bg-amber-400 text-white text-xs shadow">
          ⭐
        </span>
      )}

      <div className="flex items-start gap-3">
        {/* Map thumbnail */}
        <div className="h-16 w-16 shrink-0 rounded-lg bg-gray-bg flex items-center justify-center overflow-hidden">
          {variante.map_snapshot_url ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={variante.map_snapshot_url} alt="" className="h-full w-full object-cover" />
          ) : (
            <MapPin className="h-5 w-5 text-slate-text/30" />
          )}
        </div>

        <div className="flex-1 min-w-0">
          <h4 className="text-sm font-semibold text-primary truncate">{variante.name}</h4>
          <div className="mt-1 flex flex-wrap gap-x-4 gap-y-1 text-xs text-slate-text/50">
            {bgf != null && <span>BGF: {Number(bgf).toLocaleString("de-DE")} m²</span>}
            {investment != null && <span>Invest: {Number(investment).toLocaleString("de-DE")} €</span>}
            {rendite != null && <span>Rendite: {Number(rendite).toFixed(1)}%</span>}
          </div>
        </div>
      </div>

      <div className="mt-3 flex items-center gap-2">
        {!variante.is_favorite && (
          <button
            onClick={onSetFavorite}
            className="flex items-center gap-1 rounded-lg border border-gray-border px-2.5 py-1.5 text-xs text-slate-text/60 hover:border-amber-300 hover:text-amber-600 transition"
          >
            <Star className="h-3 w-3" /> Als Favorit
          </button>
        )}
        <button
          onClick={onDelete}
          className="flex items-center gap-1 rounded-lg border border-gray-border px-2.5 py-1.5 text-xs text-red-500/70 hover:border-red-300 hover:text-red-600 transition ml-auto"
        >
          <Trash2 className="h-3 w-3" />
        </button>
      </div>
    </motion.div>
  );
}
