"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { MapPin, Plus, BarChart3, Trash2, ChevronDown, ChevronRight } from "lucide-react";
import type { Baufeld, Variante } from "@/types/pipeline";
import VarianteCard from "./VarianteCard";
import VariantenVergleich from "./VariantenVergleich";
import SelectTemplateModal from "./SelectTemplateModal";

interface Props {
  baufeld: Baufeld;
  varianten: Variante[];
  projectId: string;
  onAddVariante: () => void;
  onAddVarianteFromTemplate: (varianteId: string) => void;
  onAddBlankVariante: () => void;
  onSetFavorite: (baufeldId: string, varianteId: string) => void;
  onDeleteVariante: (id: string) => void;
  onDeleteBaufeld: () => void;
}

export default function BaufeldSection({ baufeld, varianten, projectId, onAddVariante, onAddVarianteFromTemplate, onAddBlankVariante, onSetFavorite, onDeleteVariante, onDeleteBaufeld }: Props) {
  const [expanded, setExpanded] = useState(true);
  const [showVergleich, setShowVergleich] = useState(false);
  const [showTemplateModal, setShowTemplateModal] = useState(false);

  const handleAddClick = () => {
    if (varianten.length === 0) {
      onAddBlankVariante();
    } else {
      setShowTemplateModal(true);
    }
  };

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-2xl border border-gray-border bg-white shadow-sm overflow-hidden"
      >
        {/* Header */}
        <div
          className="flex items-center gap-3 px-5 py-4 cursor-pointer hover:bg-gray-bg/50 transition"
          onClick={() => setExpanded(!expanded)}
        >
          {expanded ? <ChevronDown className="h-4 w-4 text-slate-text/40" /> : <ChevronRight className="h-4 w-4 text-slate-text/40" />}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <h3 className="text-base font-bold text-primary">{baufeld.name}</h3>
              {varianten.some(v => v.is_favorite) ? (
                <span className="inline-block rounded-full bg-green-100 px-2 py-0.5 text-[10px] font-semibold text-green-700">Favorit gewählt</span>
              ) : varianten.length > 0 ? (
                <span className="inline-block rounded-full bg-yellow-100 px-2 py-0.5 text-[10px] font-semibold text-yellow-700">In Planung</span>
              ) : null}
            </div>
            <div className="flex items-center gap-3 text-xs text-slate-text/50 mt-0.5">
              {baufeld.region && (
                <span className="flex items-center gap-1"><MapPin className="h-3 w-3" /> {baufeld.region}</span>
              )}
              <span>{varianten.length} Variante{varianten.length !== 1 ? "n" : ""}</span>
            </div>
          </div>
          <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
            {varianten.length >= 2 && (
              <button
                onClick={() => setShowVergleich(true)}
                className="flex items-center gap-1 rounded-lg border border-gray-border px-3 py-1.5 text-xs font-medium text-primary hover:bg-gray-bg transition"
              >
                <BarChart3 className="h-3.5 w-3.5" /> Vergleichen
              </button>
            )}
            <button
              onClick={handleAddClick}
              className="flex items-center gap-1 rounded-lg bg-accent/10 px-3 py-1.5 text-xs font-medium text-accent hover:bg-accent/20 transition"
            >
              <Plus className="h-3.5 w-3.5" /> Variante
            </button>
            <button
              onClick={onDeleteBaufeld}
              className="flex h-7 w-7 items-center justify-center rounded-lg text-slate-text/30 hover:text-red-500 hover:bg-red-50 transition"
            >
              <Trash2 className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>

        {/* Varianten */}
        {expanded && (
          <div className="border-t border-gray-border/50 px-5 py-4">
            {varianten.length === 0 ? (
              <p className="text-sm text-slate-text/40 text-center py-4">
                Noch keine Varianten. Klicken Sie &quot;+ Variante&quot; um zu beginnen.
              </p>
            ) : (
              <div className="grid gap-3 sm:grid-cols-2">
                {varianten.map((v) => (
                  <VarianteCard
                    key={v.id}
                    variante={v}
                    onSetFavorite={() => onSetFavorite(baufeld.id, v.id)}
                    onDelete={() => onDeleteVariante(v.id)}
                  />
                ))}
              </div>
            )}
          </div>
        )}
      </motion.div>

      {showVergleich && (
        <VariantenVergleich
          varianten={varianten}
          baufeldName={baufeld.name}
          onClose={() => setShowVergleich(false)}
        />
      )}

      <SelectTemplateModal
        open={showTemplateModal}
        varianten={varianten}
        baufeldName={baufeld.name}
        onSelect={(varianteId) => {
          setShowTemplateModal(false);
          onAddVarianteFromTemplate(varianteId);
        }}
        onBlank={() => {
          setShowTemplateModal(false);
          onAddBlankVariante();
        }}
        onClose={() => setShowTemplateModal(false)}
      />
    </>
  );
}
