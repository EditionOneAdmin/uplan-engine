"use client";

import { motion } from "framer-motion";
import { FolderOpen, Plus } from "lucide-react";

export default function EmptyState({ onCreateClick }: { onCreateClick: () => void }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col items-center justify-center py-24 text-center"
    >
      <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-accent/10 mb-6">
        <FolderOpen className="h-10 w-10 text-accent" />
      </div>
      <h3 className="text-xl font-bold text-primary">Noch keine Projekte</h3>
      <p className="mt-2 max-w-sm text-sm text-slate-text/60">
        Erstellen Sie Ihr erstes Projekt, um Baufelder und Varianten zu verwalten.
      </p>
      <button
        onClick={onCreateClick}
        className="mt-6 inline-flex items-center gap-2 rounded-xl bg-accent px-6 py-3 text-sm font-semibold text-white transition hover:bg-accent-light"
      >
        <Plus className="h-4 w-4" /> Erstes Projekt erstellen
      </button>
    </motion.div>
  );
}
