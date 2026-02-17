"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";

interface Props {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: { name: string; description: string }) => Promise<void>;
  initial?: { name: string; description: string };
  mode?: "create" | "edit";
}

export default function CreateProjectModal({ open, onClose, onSubmit, initial, mode = "create" }: Props) {
  const [name, setName] = useState(initial?.name || "");
  const [description, setDescription] = useState(initial?.description || "");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (open) {
      setName(initial?.name || "");
      setDescription(initial?.description || "");
    }
  }, [open, initial?.name, initial?.description]);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    if (open) window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [open, onClose]);

  const handleSubmit = async () => {
    if (!name.trim()) return;
    setLoading(true);
    try {
      await onSubmit({ name: name.trim(), description: description.trim() });
      onClose();
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="w-full max-w-md rounded-2xl border border-gray-border bg-white p-6 shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-bold text-primary">
                {mode === "edit" ? "Projekt bearbeiten" : "Neues Projekt"}
              </h2>
              <button onClick={onClose} className="flex h-8 w-8 items-center justify-center rounded-lg hover:bg-gray-bg transition">
                <X className="h-4 w-4 text-slate-text/50" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-primary mb-1.5">Projektname *</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="z.B. Wohnquartier Berlin-Mitte"
                  className="w-full rounded-xl border border-gray-border px-4 py-2.5 text-sm text-primary placeholder:text-slate-text/30 focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/20 transition"
                  autoFocus
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-primary mb-1.5">Beschreibung</label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Optionale Projektbeschreibung..."
                  rows={3}
                  className="w-full rounded-xl border border-gray-border px-4 py-2.5 text-sm text-primary placeholder:text-slate-text/30 focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/20 transition resize-none"
                />
              </div>
            </div>

            <div className="mt-6 flex justify-end gap-3">
              <button
                onClick={onClose}
                className="rounded-xl border border-gray-border px-5 py-2.5 text-sm font-medium text-slate-text/60 hover:bg-gray-bg transition"
              >
                Abbrechen
              </button>
              <button
                onClick={handleSubmit}
                disabled={!name.trim() || loading}
                className="rounded-xl bg-accent px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-accent-light disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? "Speichern..." : mode === "edit" ? "Speichern" : "Erstellen"}
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
