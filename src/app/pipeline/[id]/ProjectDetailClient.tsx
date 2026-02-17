"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { motion, useInView, AnimatePresence } from "framer-motion";
import { useRouter, useParams } from "next/navigation";
import {
  ArrowLeft, Plus, ChevronDown, Menu, X, ChevronRight, Check,
} from "lucide-react";
import {
  getProject, updateProject,
  getBaufelder, createBaufeld, deleteBaufeld,
  getVarianten, createVariante, deleteVariante, setFavorite,
} from "@/lib/pipeline-api";
import type { Project, Baufeld, Variante } from "@/types/pipeline";
import BaufeldSection from "../components/BaufeldSection";
import CreateBaufeldModal from "../components/CreateBaufeldModal";
import KPIBar from "../components/KPIBar";

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
    <motion.div initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 40 }} className="fixed bottom-6 right-6 z-50 rounded-xl bg-primary px-5 py-3 text-sm font-medium text-white shadow-lg">
      {message}
    </motion.div>
  );
}

/* ─── Status selector ──────────────────────────────────── */

const statuses = [
  { value: "planning" as const, label: "Planung", color: "bg-blue-100 text-blue-700" },
  { value: "active" as const, label: "Aktiv", color: "bg-green-100 text-green-700" },
  { value: "favorite_chosen" as const, label: "Favorit gewählt", color: "bg-amber-100 text-amber-700" },
  { value: "completed" as const, label: "Abgeschlossen", color: "bg-slate-100 text-slate-600" },
];

function StatusSelector({ value, onChange }: { value: string; onChange: (v: Project["status"]) => void }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => { if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false); };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const current = statuses.find((s) => s.value === value) || statuses[0];

  return (
    <div ref={ref} className="relative">
      <button onClick={() => setOpen(!open)} className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold ${current.color} transition hover:opacity-80`}>
        {current.label} <ChevronDown className="h-3 w-3" />
      </button>
      {open && (
        <div className="absolute left-0 top-full mt-1 w-44 rounded-xl border border-gray-border bg-white py-1 shadow-xl z-10">
          {statuses.map((s) => (
            <button
              key={s.value}
              onClick={() => { onChange(s.value); setOpen(false); }}
              className="flex w-full items-center gap-2 px-4 py-2 text-sm text-primary hover:bg-gray-bg transition"
            >
              {s.value === value && <Check className="h-3.5 w-3.5 text-accent" />}
              <span className={s.value === value ? "font-semibold" : ""}>{s.label}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

/* ─── PAGE ─────────────────────────────────────────────── */

export default function ProjectDetailClient() {
  const router = useRouter();
  const params = useParams();
  const projectId = params.id as string;

  const [project, setProject] = useState<Project | null>(null);
  const [baufelder, setBaufelder] = useState<Baufeld[]>([]);
  const [variantenMap, setVariantenMap] = useState<Record<string, Variante[]>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showBaufeldModal, setShowBaufeldModal] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const [editingName, setEditingName] = useState(false);
  const [nameValue, setNameValue] = useState("");

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const proj = await getProject(projectId);
      if (!proj) { setError("Projekt nicht gefunden"); setLoading(false); return; }
      setProject(proj);
      setNameValue(proj.name);
      const bfs = await getBaufelder(projectId);
      setBaufelder(bfs);
      const vMap: Record<string, Variante[]> = {};
      for (const bf of bfs) {
        vMap[bf.id] = await getVarianten(bf.id);
      }
      setVariantenMap(vMap);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Fehler beim Laden");
    } finally {
      setLoading(false);
    }
  }, [projectId]);

  useEffect(() => { fetchData(); }, [fetchData]);

  // Aggregated KPIs
  const allVarianten = Object.values(variantenMap).flat();
  let gesamtBGF = 0, gesamtInvestment = 0, renditeSum = 0, renditeCount = 0;
  for (const v of allVarianten) {
    const w = v.wirtschaftlichkeit as Record<string, number> | null;
    if (w) {
      const bgf = w.bgf ?? w.BGF;
      const inv = w.investment ?? w.Investment;
      const ren = w.rendite ?? w.Rendite;
      if (bgf) gesamtBGF += Number(bgf);
      if (inv) gesamtInvestment += Number(inv);
      if (ren) { renditeSum += Number(ren); renditeCount++; }
    }
  }

  const handleStatusChange = async (status: Project["status"]) => {
    if (!project) return;
    await updateProject(project.id, { status });
    setProject({ ...project, status });
    setToast("Status aktualisiert");
  };

  const handleNameSave = async () => {
    if (!project || !nameValue.trim()) return;
    await updateProject(project.id, { name: nameValue.trim() });
    setProject({ ...project, name: nameValue.trim() });
    setEditingName(false);
    setToast("Name aktualisiert");
  };

  const handleCreateBaufeld = async (data: { name: string; region: string; flurstueck_info?: Record<string, unknown> }) => {
    await createBaufeld({ project_id: projectId, name: data.name, region: data.region, flurstueck_info: data.flurstueck_info || null });
    setToast("Baufeld hinzugefügt");
    await fetchData();
  };

  const handleDeleteBaufeld = async (id: string) => {
    await deleteBaufeld(id);
    setToast("Baufeld gelöscht");
    await fetchData();
  };

  const handleAddVariante = async (baufeldId: string) => {
    const existing = variantenMap[baufeldId] || [];
    const name = `Variante ${existing.length + 1}`;
    await createVariante({ baufeld_id: baufeldId, name });
    setToast("Variante hinzugefügt");
    await fetchData();
  };

  const handleDeleteVariante = async (id: string) => {
    await deleteVariante(id);
    setToast("Variante gelöscht");
    await fetchData();
  };

  const handleSetFavorite = async (baufeldId: string, varianteId: string) => {
    await setFavorite(baufeldId, varianteId);
    setToast("Favorit gesetzt");
    await fetchData();
  };

  if (loading) {
    return (
      <>
        <Nav />
        <main className="min-h-screen bg-gray-bg pt-24 pb-16">
          <div className="mx-auto max-w-6xl px-6">
            <div className="h-8 w-48 rounded-lg bg-white animate-pulse mb-4" />
            <div className="h-40 rounded-2xl bg-white animate-pulse mb-6" />
            <div className="space-y-4">{[1, 2].map(i => <div key={i} className="h-32 rounded-2xl bg-white animate-pulse" />)}</div>
          </div>
        </main>
      </>
    );
  }

  if (error || !project) {
    return (
      <>
        <Nav />
        <main className="min-h-screen bg-gray-bg pt-24 pb-16">
          <div className="mx-auto max-w-6xl px-6 text-center py-20">
            <p className="text-sm text-red-600 mb-4">{error || "Projekt nicht gefunden"}</p>
            <button onClick={() => router.push("/pipeline")} className="rounded-xl bg-accent px-5 py-2.5 text-sm font-semibold text-white hover:bg-accent-light transition">
              Zurück zur Übersicht
            </button>
          </div>
        </main>
      </>
    );
  }

  return (
    <>
      <Nav />
      <main className="min-h-screen bg-gray-bg pt-24 pb-16">
        <div className="mx-auto max-w-6xl px-6">
          <FadeIn>
            <button
              onClick={() => router.push("/pipeline")}
              className="mb-6 inline-flex items-center gap-1.5 text-sm text-slate-text/50 hover:text-primary transition"
            >
              <ArrowLeft className="h-4 w-4" /> Zurück zur Übersicht
            </button>
          </FadeIn>

          <FadeIn>
            <div className="rounded-2xl border border-gray-border bg-white p-6 shadow-sm mb-6">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex-1">
                  {editingName ? (
                    <div className="flex items-center gap-2">
                      <input
                        value={nameValue}
                        onChange={(e) => setNameValue(e.target.value)}
                        onKeyDown={(e) => { if (e.key === "Enter") handleNameSave(); if (e.key === "Escape") { setEditingName(false); setNameValue(project.name); } }}
                        className="text-2xl font-bold text-primary border-b-2 border-accent outline-none bg-transparent"
                        autoFocus
                      />
                      <button onClick={handleNameSave} className="text-xs text-accent font-semibold">Speichern</button>
                    </div>
                  ) : (
                    <h1
                      className="text-2xl font-bold text-primary cursor-pointer hover:text-accent transition"
                      onClick={() => setEditingName(true)}
                      title="Klicken zum Bearbeiten"
                    >
                      {project.name}
                    </h1>
                  )}
                  {project.description && <p className="mt-1 text-sm text-slate-text/60">{project.description}</p>}
                </div>
                <StatusSelector value={project.status} onChange={handleStatusChange} />
              </div>
            </div>
          </FadeIn>

          <FadeIn delay={0.1}>
            <div className="mb-6">
              <KPIBar
                baufelderCount={baufelder.length}
                variantenCount={allVarianten.length}
                gesamtBGF={gesamtBGF}
                gesamtInvestment={gesamtInvestment}
                avgRendite={renditeCount > 0 ? renditeSum / renditeCount : 0}
              />
            </div>
          </FadeIn>

          <FadeIn delay={0.15}>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-primary">Baufelder</h2>
              <button
                onClick={() => setShowBaufeldModal(true)}
                className="inline-flex items-center gap-1.5 rounded-xl bg-accent/10 px-4 py-2 text-sm font-semibold text-accent hover:bg-accent/20 transition"
              >
                <Plus className="h-4 w-4" /> Baufeld hinzufügen
              </button>
            </div>
          </FadeIn>

          <div className="space-y-4">
            {baufelder.length === 0 ? (
              <FadeIn>
                <div className="rounded-2xl border border-dashed border-gray-border bg-white/50 py-12 text-center">
                  <p className="text-sm text-slate-text/40">Noch keine Baufelder. Fügen Sie das erste hinzu.</p>
                </div>
              </FadeIn>
            ) : (
              baufelder.map((bf) => (
                <BaufeldSection
                  key={bf.id}
                  baufeld={bf}
                  varianten={variantenMap[bf.id] || []}
                  onAddVariante={() => handleAddVariante(bf.id)}
                  onSetFavorite={handleSetFavorite}
                  onDeleteVariante={handleDeleteVariante}
                  onDeleteBaufeld={() => handleDeleteBaufeld(bf.id)}
                />
              ))
            )}
          </div>
        </div>
      </main>

      <CreateBaufeldModal
        open={showBaufeldModal}
        onClose={() => setShowBaufeldModal(false)}
        onSubmit={handleCreateBaufeld}
      />

      <AnimatePresence>
        {toast && <Toast message={toast} onDone={() => setToast(null)} />}
      </AnimatePresence>
    </>
  );
}
