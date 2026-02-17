"use client";

import { useState, useEffect, useCallback } from "react";
import { X, ChevronRight, Check, Plus, FolderOpen, MapPin, Tag } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import {
  getProjects,
  createProject,
  getBaufelder,
  createBaufeld,
  getVarianten,
  createVariante,
} from "@/lib/pipeline-api";
import type {
  Project,
  Baufeld as PipelineBaufeld,
} from "@/types/pipeline";
import type { Baufeld, PlacedUnit, Filters, Metrics } from "./types";
import type { CostData } from "./exportPDF";

interface Props {
  open: boolean;
  onClose: () => void;
  selectedRegion: string;
  baufelder: Baufeld[];
  placedUnits: PlacedUnit[];
  costData?: CostData;
  filters: Filters;
  metrics: Metrics;
  preselectedProjectId?: string | null;
  preselectedBaufeldId?: string | null;
}

type Step = 1 | 2 | 3 | 4; // 4 = success

export function AddToProjectModal({
  open,
  onClose,
  selectedRegion,
  baufelder,
  placedUnits,
  costData,
  filters,
  metrics,
  preselectedProjectId,
  preselectedBaufeldId,
}: Props) {
  const [step, setStep] = useState<Step>(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Step 1: Project
  const [projects, setProjects] = useState<Project[]>([]);
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);
  const [createNew, setCreateNew] = useState(false);
  const [newProjectName, setNewProjectName] = useState("");
  const [newProjectDesc, setNewProjectDesc] = useState("");

  // Step 2: Baufeld
  const [pipelineBaufelder, setPipelineBaufelder] = useState<PipelineBaufeld[]>([]);
  const [selectedBaufeldId, setSelectedBaufeldId] = useState<string | null>(null);
  const [createNewBaufeld, setCreateNewBaufeld] = useState(false);
  const [newBaufeldName, setNewBaufeldName] = useState("");

  // Step 3: Variante
  const [varianteName, setVarianteName] = useState("Variante 1");

  // Step 4: Success
  const [savedProjectId, setSavedProjectId] = useState<string | null>(null);
  const [savedVarianteName, setSavedVarianteName] = useState("");

  // Load projects on open
  useEffect(() => {
    if (open) {
      setError(null);
      setCreateNew(false);
      setNewProjectName("");
      setNewProjectDesc("");

      if (preselectedProjectId && preselectedBaufeldId) {
        // Skip steps 1 & 2 — go directly to naming
        setSelectedProjectId(preselectedProjectId);
        setSelectedBaufeldId(preselectedBaufeldId);
        setStep(3);
        // Auto-suggest name
        getVarianten(preselectedBaufeldId)
          .then((v) => setVarianteName(`Variante ${v.length + 1}`))
          .catch(() => setVarianteName("Variante 1"));
      } else {
        setStep(1);
        setSelectedProjectId(null);
        getProjects().then(setProjects).catch(() => setProjects([]));
      }
    }
  }, [open, preselectedProjectId, preselectedBaufeldId]);

  // Load baufelder when project selected
  useEffect(() => {
    if (selectedProjectId) {
      setSelectedBaufeldId(null);
      setCreateNewBaufeld(false);
      setNewBaufeldName(baufelder[0]?.name || "");
      getBaufelder(selectedProjectId).then(setPipelineBaufelder).catch(() => setPipelineBaufelder([]));
    }
  }, [selectedProjectId, baufelder]);

  // Auto-suggest variante name
  useEffect(() => {
    if (selectedBaufeldId && step === 3) {
      getVarianten(selectedBaufeldId)
        .then((v) => setVarianteName(`Variante ${v.length + 1}`))
        .catch(() => setVarianteName("Variante 1"));
    }
  }, [selectedBaufeldId, step]);

  const handleNext1 = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      if (createNew) {
        if (!newProjectName.trim()) { setError("Projektname erforderlich"); setLoading(false); return; }
        const p = await createProject({ name: newProjectName.trim(), description: newProjectDesc.trim() || null });
        setSelectedProjectId(p.id);
        setProjects((prev) => [p, ...prev]);
      }
      if (!selectedProjectId && !createNew) { setError("Bitte Projekt auswählen"); setLoading(false); return; }
      setStep(2);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Fehler beim Erstellen");
    } finally {
      setLoading(false);
    }
  }, [createNew, newProjectName, newProjectDesc, selectedProjectId]);

  const handleNext2 = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const projectId = selectedProjectId!;
      if (createNewBaufeld) {
        if (!newBaufeldName.trim()) { setError("Baufeldname erforderlich"); setLoading(false); return; }
        const centroid = baufelder.length > 0 && baufelder[0].coordinates.length > 0
          ? {
              lat: baufelder[0].coordinates.reduce((s, c) => s + c[0], 0) / baufelder[0].coordinates.length,
              lng: baufelder[0].coordinates.reduce((s, c) => s + c[1], 0) / baufelder[0].coordinates.length,
            }
          : null;
        const bf = await createBaufeld({
          project_id: projectId,
          name: newBaufeldName.trim(),
          region: selectedRegion,
          location: centroid,
          flurstueck_info: { demoBaufelder: baufelder },
        });
        setSelectedBaufeldId(bf.id);
        setPipelineBaufelder((prev) => [bf, ...prev]);
      }
      if (!selectedBaufeldId && !createNewBaufeld) { setError("Bitte Baufeld auswählen"); setLoading(false); return; }
      setStep(3);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Fehler beim Erstellen");
    } finally {
      setLoading(false);
    }
  }, [createNewBaufeld, newBaufeldName, selectedProjectId, selectedBaufeldId, baufelder, selectedRegion]);

  const handleSave = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const baufeldId = selectedBaufeldId!;

      const bauplanConfig = {
        region: selectedRegion,
        baufelder: baufelder,
      };

      const gebaeudeConfig = {
        placedUnits: placedUnits,
      };

      const wirtschaftlichkeit = {
        ...(costData || {}),
        total_bgf: metrics.totalBGF,
        total_units: metrics.totalUnits,
        total_wohnflaeche: metrics.totalWohnflaeche,
        total_investment: costData?.gesamtkosten,
        rendite: costData?.strategy === "hold" ? costData?.niy : costData?.marge,
        filters: filters,
      };

      await createVariante({
        baufeld_id: baufeldId,
        name: varianteName.trim() || "Variante",
        bauplan_config: bauplanConfig,
        gebaeude_config: gebaeudeConfig,
        wirtschaftlichkeit: wirtschaftlichkeit,
        status: "draft",
      });

      setSavedProjectId(selectedProjectId);
      setSavedVarianteName(varianteName);
      setStep(4);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Fehler beim Speichern");
    } finally {
      setLoading(false);
    }
  }, [selectedBaufeldId, selectedProjectId, selectedRegion, baufelder, placedUnits, costData, filters, metrics, varianteName]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />

      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="relative bg-[#1E293B] border border-white/10 rounded-2xl shadow-2xl w-[480px] max-h-[85vh] flex flex-col overflow-hidden"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/10">
          <div>
            <h2 className="text-lg font-bold text-white">
              {step === 4 ? "✅ Gespeichert" : "📂 Zu Projekt hinzufügen"}
            </h2>
            {step < 4 && (
              <p className="text-xs text-white/40 mt-0.5">Schritt {step} von 3</p>
            )}
          </div>
          <button onClick={onClose} className="text-white/40 hover:text-white transition-colors">
            <X size={20} />
          </button>
        </div>

        {/* Progress bar */}
        {step < 4 && (
          <div className="h-1 bg-white/5">
            <div
              className="h-full bg-teal-500 transition-all duration-300"
              style={{ width: `${(step / 3) * 100}%` }}
            />
          </div>
        )}

        {/* Body */}
        <div className="flex-1 overflow-y-auto px-6 py-4">
          {error && (
            <div className="mb-3 p-2 rounded-lg bg-red-500/10 border border-red-500/20 text-xs text-red-400">
              {error}
            </div>
          )}

          <AnimatePresence mode="wait">
            {step === 1 && (
              <motion.div key="step1" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-3">
                <label className="text-xs text-white/50 uppercase tracking-wider font-semibold block">
                  Projekt wählen
                </label>

                {/* Existing projects */}
                <div className="space-y-1 max-h-[200px] overflow-y-auto">
                  {projects.map((p) => (
                    <button
                      key={p.id}
                      onClick={() => { setSelectedProjectId(p.id); setCreateNew(false); }}
                      className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all text-left ${
                        selectedProjectId === p.id && !createNew
                          ? "bg-teal-500/10 border border-teal-500/30"
                          : "bg-white/5 border border-transparent hover:bg-white/10"
                      }`}
                    >
                      <FolderOpen size={16} className="text-white/40 shrink-0" />
                      <div className="flex-1 min-w-0">
                        <div className="text-sm text-white truncate">{p.name}</div>
                        {p.description && <div className="text-[10px] text-white/30 truncate">{p.description}</div>}
                      </div>
                      {selectedProjectId === p.id && !createNew && (
                        <Check size={16} className="text-teal-400 shrink-0" />
                      )}
                    </button>
                  ))}
                </div>

                {/* Create new */}
                <button
                  onClick={() => { setCreateNew(true); setSelectedProjectId(null); }}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all text-left ${
                    createNew
                      ? "bg-teal-500/10 border border-teal-500/30"
                      : "bg-white/5 border border-dashed border-white/20 hover:bg-white/10"
                  }`}
                >
                  <Plus size={16} className="text-teal-400 shrink-0" />
                  <span className="text-sm text-teal-400">Neues Projekt erstellen</span>
                </button>

                {createNew && (
                  <div className="space-y-2 pl-4 border-l-2 border-teal-500/30">
                    <input
                      type="text"
                      value={newProjectName}
                      onChange={(e) => setNewProjectName(e.target.value)}
                      placeholder="Projektname"
                      className="w-full bg-[#0F172A] border border-white/10 rounded-lg px-3 py-2 text-sm text-white outline-none focus:border-teal-500 transition-colors"
                      autoFocus
                    />
                    <input
                      type="text"
                      value={newProjectDesc}
                      onChange={(e) => setNewProjectDesc(e.target.value)}
                      placeholder="Beschreibung (optional)"
                      className="w-full bg-[#0F172A] border border-white/10 rounded-lg px-3 py-2 text-sm text-white outline-none focus:border-teal-500 transition-colors"
                    />
                  </div>
                )}
              </motion.div>
            )}

            {step === 2 && (
              <motion.div key="step2" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-3">
                <label className="text-xs text-white/50 uppercase tracking-wider font-semibold block">
                  Baufeld wählen
                </label>

                <div className="space-y-1 max-h-[200px] overflow-y-auto">
                  {pipelineBaufelder.map((bf) => (
                    <button
                      key={bf.id}
                      onClick={() => { setSelectedBaufeldId(bf.id); setCreateNewBaufeld(false); }}
                      className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all text-left ${
                        selectedBaufeldId === bf.id && !createNewBaufeld
                          ? "bg-teal-500/10 border border-teal-500/30"
                          : "bg-white/5 border border-transparent hover:bg-white/10"
                      }`}
                    >
                      <MapPin size={16} className="text-white/40 shrink-0" />
                      <div className="flex-1 min-w-0">
                        <div className="text-sm text-white truncate">{bf.name}</div>
                        {bf.region && <div className="text-[10px] text-white/30">{bf.region}</div>}
                      </div>
                      {selectedBaufeldId === bf.id && !createNewBaufeld && (
                        <Check size={16} className="text-teal-400 shrink-0" />
                      )}
                    </button>
                  ))}
                </div>

                <button
                  onClick={() => { setCreateNewBaufeld(true); setSelectedBaufeldId(null); }}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all text-left ${
                    createNewBaufeld
                      ? "bg-teal-500/10 border border-teal-500/30"
                      : "bg-white/5 border border-dashed border-white/20 hover:bg-white/10"
                  }`}
                >
                  <Plus size={16} className="text-teal-400 shrink-0" />
                  <span className="text-sm text-teal-400">Neues Baufeld erstellen</span>
                </button>

                {createNewBaufeld && (
                  <div className="pl-4 border-l-2 border-teal-500/30">
                    <input
                      type="text"
                      value={newBaufeldName}
                      onChange={(e) => setNewBaufeldName(e.target.value)}
                      placeholder="Baufeldname"
                      className="w-full bg-[#0F172A] border border-white/10 rounded-lg px-3 py-2 text-sm text-white outline-none focus:border-teal-500 transition-colors"
                      autoFocus
                    />
                  </div>
                )}
              </motion.div>
            )}

            {step === 3 && (
              <motion.div key="step3" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-4">
                <div>
                  <label className="text-xs text-white/50 uppercase tracking-wider font-semibold mb-1.5 block">
                    Variante benennen
                  </label>
                  <input
                    type="text"
                    value={varianteName}
                    onChange={(e) => setVarianteName(e.target.value)}
                    className="w-full bg-[#0F172A] border border-white/10 rounded-lg px-3 py-2 text-sm text-white outline-none focus:border-teal-500 transition-colors"
                    autoFocus
                  />
                </div>

                {/* Preview */}
                <div className="bg-[#0F172A] rounded-lg p-4 border border-white/5 space-y-2">
                  <div className="text-xs text-white/50 uppercase tracking-wider font-semibold mb-2">
                    Zusammenfassung
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div className="flex items-center gap-2">
                      <span className="text-white/30 text-xs">Region:</span>
                      <span className="text-white text-xs font-medium">{selectedRegion === "berlin" ? "Berlin" : "NRW"}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-white/30 text-xs">Gebäude:</span>
                      <span className="text-white text-xs font-medium">{placedUnits.length}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-white/30 text-xs">WE:</span>
                      <span className="text-white text-xs font-medium">{metrics.totalUnits}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-white/30 text-xs">BGF:</span>
                      <span className="text-white text-xs font-medium">{metrics.totalBGF.toLocaleString("de-DE")} m²</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-white/30 text-xs">Wohnfläche:</span>
                      <span className="text-white text-xs font-medium">{metrics.totalWohnflaeche.toLocaleString("de-DE")} m²</span>
                    </div>
                    {costData?.gesamtkosten && (
                      <div className="flex items-center gap-2">
                        <span className="text-white/30 text-xs">Invest:</span>
                        <span className="text-white text-xs font-medium">
                          {(costData.gesamtkosten / 1_000_000).toFixed(2)} Mio. €
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            )}

            {step === 4 && (
              <motion.div key="step4" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="flex flex-col items-center text-center py-6 space-y-4">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", stiffness: 200, damping: 15 }}
                  className="w-16 h-16 rounded-full bg-green-500/20 flex items-center justify-center"
                >
                  <Check size={32} className="text-green-400" />
                </motion.div>
                <div>
                  <p className="text-white font-semibold">
                    Variante &quot;{savedVarianteName}&quot; wurde gespeichert
                  </p>
                  <p className="text-white/40 text-sm mt-1">
                    Die Konzeptvariante ist jetzt im Projekt verfügbar.
                  </p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-white/10 bg-[#0F172A]/50">
          {step === 4 ? (
            <>
              <button
                onClick={onClose}
                className="px-4 py-2 rounded-lg text-sm text-white/60 hover:text-white hover:bg-white/10 transition-all"
              >
                Weitere Variante erstellen
              </button>
              <a
                href={`/pipeline/${savedProjectId}`}
                className="flex items-center gap-2 px-5 py-2 rounded-lg text-sm font-semibold bg-teal-600 text-white hover:bg-teal-500 shadow-lg shadow-teal-600/20 transition-all"
              >
                Zum Projekt <ChevronRight size={16} />
              </a>
            </>
          ) : (
            <>
              <button
                onClick={step === 1 ? onClose : () => setStep((s) => (s - 1) as Step)}
                className="px-4 py-2 rounded-lg text-sm text-white/60 hover:text-white hover:bg-white/10 transition-all"
              >
                {step === 1 ? "Abbrechen" : "Zurück"}
              </button>
              <button
                onClick={step === 1 ? handleNext1 : step === 2 ? handleNext2 : handleSave}
                disabled={loading}
                className={`flex items-center gap-2 px-5 py-2 rounded-lg text-sm font-semibold transition-all ${
                  loading
                    ? "bg-teal-600/50 text-white/50 cursor-wait"
                    : "bg-teal-600 text-white hover:bg-teal-500 shadow-lg shadow-teal-600/20"
                }`}
              >
                {loading ? (
                  <><span className="animate-spin">⏳</span> Laden…</>
                ) : step === 3 ? (
                  <>💾 Speichern</>
                ) : (
                  <>Weiter <ChevronRight size={16} /></>
                )}
              </button>
            </>
          )}
        </div>
      </motion.div>
    </div>
  );
}
