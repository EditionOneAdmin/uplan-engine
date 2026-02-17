"use client";

import { useState, useRef, useEffect } from "react";
import { motion } from "framer-motion";
import { MoreVertical, Pencil, Trash2, Layers, Grid3X3 } from "lucide-react";
import type { ProjectOverview } from "@/types/pipeline";

const statusColors: Record<string, { bg: string; text: string; label: string }> = {
  active: { bg: "bg-green-100", text: "text-green-700", label: "Aktiv" },
  planning: { bg: "bg-blue-100", text: "text-blue-700", label: "Planung" },
  favorite_chosen: { bg: "bg-amber-100", text: "text-amber-700", label: "Favorit gewählt" },
  completed: { bg: "bg-slate-100", text: "text-slate-600", label: "Abgeschlossen" },
};

interface Props {
  project: ProjectOverview;
  onClick: () => void;
  onEdit: () => void;
  onDelete: () => void;
}

export default function ProjectCard({ project, onClick, onEdit, onDelete }: Props) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
        setConfirmDelete(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const status = statusColors[project.status] || statusColors.planning;

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      className="group relative rounded-2xl border border-gray-border bg-white p-6 shadow-sm transition hover:shadow-md cursor-pointer"
      onClick={onClick}
    >
      {/* Three-dot menu */}
      <div className="absolute top-4 right-4" ref={menuRef}>
        <button
          onClick={(e) => { e.stopPropagation(); setMenuOpen(!menuOpen); setConfirmDelete(false); }}
          className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-text/40 hover:bg-gray-bg hover:text-primary transition"
        >
          <MoreVertical className="h-4 w-4" />
        </button>
        {menuOpen && (
          <div className="absolute right-0 top-full mt-1 w-44 rounded-xl border border-gray-border bg-white py-1 shadow-xl z-10">
            {!confirmDelete ? (
              <>
                <button
                  onClick={(e) => { e.stopPropagation(); setMenuOpen(false); onEdit(); }}
                  className="flex w-full items-center gap-2 px-4 py-2 text-sm text-primary hover:bg-gray-bg transition"
                >
                  <Pencil className="h-3.5 w-3.5" /> Bearbeiten
                </button>
                <button
                  onClick={(e) => { e.stopPropagation(); setConfirmDelete(true); }}
                  className="flex w-full items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition"
                >
                  <Trash2 className="h-3.5 w-3.5" /> Löschen
                </button>
              </>
            ) : (
              <div className="px-4 py-3">
                <p className="text-xs text-slate-text/70 mb-2">Projekt wirklich löschen?</p>
                <div className="flex gap-2">
                  <button
                    onClick={(e) => { e.stopPropagation(); setMenuOpen(false); setConfirmDelete(false); onDelete(); }}
                    className="rounded-lg bg-red-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-red-700 transition"
                  >
                    Ja, löschen
                  </button>
                  <button
                    onClick={(e) => { e.stopPropagation(); setConfirmDelete(false); }}
                    className="rounded-lg border border-gray-border px-3 py-1.5 text-xs text-slate-text/60 hover:bg-gray-bg transition"
                  >
                    Abbrechen
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Status badge */}
      <span className={`inline-block rounded-full px-3 py-1 text-xs font-semibold ${status.bg} ${status.text}`}>
        {status.label}
      </span>

      <h3 className="mt-3 text-lg font-bold text-primary pr-8">{project.name}</h3>
      {project.description && (
        <p className="mt-1 text-sm text-slate-text/60 line-clamp-2">{project.description}</p>
      )}

      <div className="mt-4 flex items-center gap-4 text-xs text-slate-text/50">
        <span className="flex items-center gap-1">
          <Grid3X3 className="h-3.5 w-3.5" /> {project.baufelder_count} Baufelder
        </span>
        <span className="flex items-center gap-1">
          <Layers className="h-3.5 w-3.5" /> {project.varianten_count} Varianten
        </span>
      </div>

      <p className="mt-3 text-xs text-slate-text/40">
        Erstellt am {new Date(project.created_at).toLocaleDateString("de-DE")}
      </p>
    </motion.div>
  );
}
