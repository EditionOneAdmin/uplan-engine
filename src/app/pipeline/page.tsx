"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { motion, useInView, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import {
  Plus, ChevronDown, ChevronRight, Menu, X,
} from "lucide-react";
import {
  getProjects, createProject, updateProject, deleteProject,
  getBaufelder, getVarianten,
} from "@/lib/pipeline-api";
import type { ProjectOverview } from "@/types/pipeline";
import ProjectCard from "./components/ProjectCard";
import CreateProjectModal from "./components/CreateProjectModal";
import EmptyState from "./components/EmptyState";

/* ─── Helpers ──────────────────────────────────────────── */

function FadeIn({ children, className = "", delay = 0 }: { children: React.ReactNode; className?: string; delay?: number }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });
  return (
    <motion.div ref={ref} initial={{ opacity: 0, y: 32 }} animate={inView ? { opacity: 1, y: 0 } : {}} transition={{ duration: 0.6, delay, ease: [0.25, 0.4, 0.25, 1] }} className={className}>
      {children}
    </motion.div>
  );
}

/* ─── Nav ──────────────────────────────────────────────── */

function Nav() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [ucOpen, setUcOpen] = useState(false);

  useEffect(() => {
    const handler = () => { if (window.innerWidth >= 768) setMobileOpen(false); };
    window.addEventListener("resize", handler);
    return () => window.removeEventListener("resize", handler);
  }, []);

  const useCaseLinks = [
    { href: "/uplan-engine/anwendungsfaelle/portfolio-rollout", label: "Portfolio-Rollout", sub: "50 Standorte parallel bewerten" },
    { href: "/uplan-engine/anwendungsfaelle/ankaufspruefung", label: "Ankaufsprüfung in 48h", sub: "Machbarkeit vor LOI prüfen" },
    { href: "/uplan-engine/anwendungsfaelle/serielle-planung", label: "Serielle Planung", sub: "Standards wiederverwenden" },
  ];

  return (
    <motion.header className="fixed top-0 right-0 left-0 z-50 border-b border-gray-border/60 bg-white/80 backdrop-blur-lg" initial={{ y: -80 }} animate={{ y: 0 }} transition={{ duration: 0.5 }}>
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-3">
        <a href="/uplan-engine/" className="flex items-center gap-2">
          <svg width="28" height="28" viewBox="0 0 32 32" fill="none"><rect width="32" height="32" rx="8" fill="#1E3A5F"/><path d="M8 10h6a4 4 0 0 1 0 8H8V10z" fill="white"/><path d="M17 14h7a4 4 0 0 1 0 8h-7V14z" fill="#0D9488"/></svg>
          <span className="text-lg font-bold text-primary">U-Plan Engine</span>
        </a>
        <nav className="hidden items-center gap-6 text-sm font-medium text-slate-text/60 md:flex">
          <a href="/uplan-engine/" className="transition hover:text-primary">Startseite</a>
          <a href="/uplan-engine/produkt" className="transition hover:text-primary">Produkt</a>
          <div className="relative" onMouseEnter={() => setUcOpen(true)} onMouseLeave={() => setUcOpen(false)}>
            <button className="flex items-center gap-1 transition hover:text-primary">Use Cases <ChevronDown className={`h-3.5 w-3.5 transition-transform ${ucOpen ? "rotate-180" : ""}`} /></button>
            <AnimatePresence>
              {ucOpen && (
                <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 8 }} transition={{ duration: 0.15 }} className="absolute left-1/2 -translate-x-1/2 top-full pt-2">
                  <div className="w-72 rounded-xl border border-gray-border bg-white p-2 shadow-xl">
                    {useCaseLinks.map((uc) => (
                      <a key={uc.href} href={uc.href} className="flex items-start gap-3 rounded-lg px-3 py-2.5 transition hover:bg-gray-bg group">
                        <ChevronRight className="mt-0.5 h-4 w-4 text-accent opacity-0 group-hover:opacity-100 transition shrink-0" />
                        <div><div className="text-sm font-semibold text-primary">{uc.label}</div><div className="text-xs text-slate-text/50">{uc.sub}</div></div>
                      </a>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
          <a href="/uplan-engine/technologie" className="transition hover:text-primary">Technologie</a>
          <a href="/uplan-engine/pipeline" className="font-semibold text-accent">Pipeline</a>
        </nav>
        <button className="md:hidden flex h-10 w-10 items-center justify-center rounded-lg hover:bg-gray-bg transition" onClick={() => setMobileOpen(!mobileOpen)}>
          {mobileOpen ? <X className="h-5 w-5 text-primary" /> : <Menu className="h-5 w-5 text-primary" />}
        </button>
      </div>
      <AnimatePresence>
        {mobileOpen && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.2 }} className="overflow-hidden border-t border-gray-border/40 md:hidden">
            <nav className="flex flex-col gap-1 px-6 py-4 bg-white">
              <a href="/uplan-engine/" className="rounded-lg px-3 py-2.5 text-sm font-medium text-primary hover:bg-gray-bg transition">Startseite</a>
              <a href="/uplan-engine/produkt" className="rounded-lg px-3 py-2.5 text-sm font-medium text-primary hover:bg-gray-bg transition">Produkt</a>
              <a href="/uplan-engine/technologie" className="rounded-lg px-3 py-2.5 text-sm font-medium text-primary hover:bg-gray-bg transition">Technologie</a>
              <a href="/uplan-engine/pipeline" className="rounded-lg px-3 py-2.5 text-sm font-semibold text-accent hover:bg-gray-bg transition">Pipeline</a>
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.header>
  );
}

/* ─── Toast ────────────────────────────────────────────── */

function Toast({ message, onDone }: { message: string; onDone: () => void }) {
  useEffect(() => { const t = setTimeout(onDone, 3000); return () => clearTimeout(t); }, [onDone]);
  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 40 }}
      className="fixed bottom-6 right-6 z-50 rounded-xl bg-primary px-5 py-3 text-sm font-medium text-white shadow-lg"
    >
      {message}
    </motion.div>
  );
}

/* ─── PAGE ─────────────────────────────────────────────── */

export default function PipelinePage() {
  const router = useRouter();
  const [projects, setProjects] = useState<ProjectOverview[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showCreate, setShowCreate] = useState(false);
  const [editProject, setEditProject] = useState<ProjectOverview | null>(null);
  const [toast, setToast] = useState<string | null>(null);

  const fetchProjects = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const projs = await getProjects();
      const overviews: ProjectOverview[] = await Promise.all(
        projs.map(async (p) => {
          const baufelder = await getBaufelder(p.id);
          let varianten_count = 0;
          let favorite_count = 0;
          for (const bf of baufelder) {
            const vars = await getVarianten(bf.id);
            varianten_count += vars.length;
            favorite_count += vars.filter((v) => v.is_favorite).length;
          }
          return { ...p, baufelder_count: baufelder.length, varianten_count, favorite_count };
        })
      );
      setProjects(overviews);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Fehler beim Laden");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchProjects(); }, [fetchProjects]);

  const handleCreate = async (data: { name: string; description: string }) => {
    await createProject({ name: data.name, description: data.description || null });
    setToast("Projekt erstellt");
    await fetchProjects();
  };

  const handleEdit = async (data: { name: string; description: string }) => {
    if (!editProject) return;
    await updateProject(editProject.id, { name: data.name, description: data.description || null });
    setEditProject(null);
    setToast("Projekt aktualisiert");
    await fetchProjects();
  };

  const handleDelete = async (id: string) => {
    await deleteProject(id);
    setToast("Projekt gelöscht");
    await fetchProjects();
  };

  return (
    <>
      <Nav />
      <main className="min-h-screen bg-gray-bg pt-24 pb-16">
        <div className="mx-auto max-w-6xl px-6">
          <FadeIn>
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between mb-8">
              <div>
                <h1 className="text-3xl font-bold tracking-tight text-primary">Pipeline Management</h1>
                <p className="mt-1 text-sm text-slate-text/60">Verwalten Sie Ihre Projekte, Baufelder und Varianten.</p>
              </div>
              <button
                onClick={() => setShowCreate(true)}
                className="inline-flex items-center gap-2 rounded-xl bg-accent px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-accent/20 transition hover:bg-accent-light self-start"
              >
                <Plus className="h-4 w-4" /> Neues Projekt
              </button>
            </div>
          </FadeIn>

          {loading ? (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-48 rounded-2xl border border-gray-border bg-white animate-pulse" />
              ))}
            </div>
          ) : error ? (
            <div className="flex flex-col items-center py-20 text-center">
              <p className="text-sm text-red-600 mb-4">{error}</p>
              <button onClick={fetchProjects} className="rounded-xl bg-accent px-5 py-2.5 text-sm font-semibold text-white hover:bg-accent-light transition">
                Erneut versuchen
              </button>
            </div>
          ) : projects.length === 0 ? (
            <EmptyState onCreateClick={() => setShowCreate(true)} />
          ) : (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {projects.map((p) => (
                <ProjectCard
                  key={p.id}
                  project={p}
                  onClick={() => router.push(`/pipeline/${p.id}`)}
                  onEdit={() => setEditProject(p)}
                  onDelete={() => handleDelete(p.id)}
                />
              ))}
            </div>
          )}
        </div>
      </main>

      <CreateProjectModal
        open={showCreate}
        onClose={() => setShowCreate(false)}
        onSubmit={handleCreate}
      />

      <CreateProjectModal
        open={!!editProject}
        onClose={() => setEditProject(null)}
        onSubmit={handleEdit}
        initial={editProject ? { name: editProject.name, description: editProject.description || "" } : undefined}
        mode="edit"
      />

      <AnimatePresence>
        {toast && <Toast message={toast} onDone={() => setToast(null)} />}
      </AnimatePresence>
    </>
  );
}
