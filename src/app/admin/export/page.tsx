"use client";
import { useState, useRef } from "react";
import { useAdminStore } from "../store";
import { Download, Upload, Copy, Check, FileJson, AlertCircle } from "lucide-react";

export default function ExportPage() {
  const { buildings, manufacturers, importData } = useAdminStore();
  const [copied, setCopied] = useState(false);
  const [importPreview, setImportPreview] = useState<{ buildings: number; manufacturers: number } | null>(null);
  const [importError, setImportError] = useState<string | null>(null);
  const [pendingImport, setPendingImport] = useState<{ buildings: unknown[]; manufacturers: unknown[] } | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const exportJson = () => {
    const data = { buildings, manufacturers, exportedAt: new Date().toISOString(), version: 1 };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `bplan-katalog-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const copyAsTs = () => {
    const ts = `export const BUILDINGS: BuildingModule[] = ${JSON.stringify(buildings, null, 2)};`;
    navigator.clipboard.writeText(ts);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImportError(null);
    setImportPreview(null);
    setPendingImport(null);

    const reader = new FileReader();
    reader.onload = (ev) => {
      try {
        const data = JSON.parse(ev.target?.result as string);
        if (!data.buildings || !Array.isArray(data.buildings)) throw new Error("Keine 'buildings' Array gefunden");
        if (!data.manufacturers || !Array.isArray(data.manufacturers)) throw new Error("Keine 'manufacturers' Array gefunden");
        setImportPreview({ buildings: data.buildings.length, manufacturers: data.manufacturers.length });
        setPendingImport(data);
      } catch (err: unknown) {
        setImportError(err instanceof Error ? err.message : "Ungültiges JSON");
      }
    };
    reader.readAsText(file);
    if (fileRef.current) fileRef.current.value = "";
  };

  const confirmImport = () => {
    if (!pendingImport) return;
    importData(pendingImport.buildings as Parameters<typeof importData>[0], pendingImport.manufacturers as Parameters<typeof importData>[1]);
    setImportPreview(null);
    setPendingImport(null);
  };

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold">Export & Import</h1>
        <p className="text-slate-500 text-sm mt-1">Katalog-Daten exportieren oder importieren</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Export */}
        <div className="bg-slate-900/50 border border-slate-800/60 rounded-xl p-6 space-y-4">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-xl bg-blue-500/20 flex items-center justify-center">
              <Download className="w-5 h-5 text-blue-400" />
            </div>
            <div>
              <h2 className="font-semibold">Export</h2>
              <p className="text-xs text-slate-500">Katalog als JSON herunterladen</p>
            </div>
          </div>

          <div className="bg-slate-800/50 rounded-lg p-4 text-sm text-slate-400 space-y-1">
            <div className="flex justify-between"><span>Module</span><span className="text-white">{buildings.length}</span></div>
            <div className="flex justify-between"><span>Hersteller</span><span className="text-white">{manufacturers.length}</span></div>
          </div>

          <button onClick={exportJson} className="w-full py-2.5 bg-blue-600 hover:bg-blue-500 text-white text-sm font-medium rounded-xl transition-all flex items-center justify-center gap-2">
            <FileJson className="w-4 h-4" /> JSON exportieren
          </button>

          <button onClick={copyAsTs} className="w-full py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 text-sm rounded-xl transition-all flex items-center justify-center gap-2">
            {copied ? <><Check className="w-4 h-4 text-green-400" /> Kopiert!</> : <><Copy className="w-4 h-4" /> Als TypeScript kopieren</>}
          </button>
        </div>

        {/* Import */}
        <div className="bg-slate-900/50 border border-slate-800/60 rounded-xl p-6 space-y-4">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-xl bg-amber-500/20 flex items-center justify-center">
              <Upload className="w-5 h-5 text-amber-400" />
            </div>
            <div>
              <h2 className="font-semibold">Import</h2>
              <p className="text-xs text-slate-500">JSON-Datei importieren</p>
            </div>
          </div>

          <input ref={fileRef} type="file" accept=".json" onChange={handleFileUpload} className="hidden" />

          <button onClick={() => fileRef.current?.click()} className="w-full py-8 border-2 border-dashed border-slate-700 rounded-xl text-slate-500 hover:border-blue-500/40 hover:text-blue-400 transition-all text-sm">
            JSON-Datei auswählen oder hierher ziehen
          </button>

          {importError && (
            <div className="flex items-center gap-2 text-sm text-red-400 bg-red-500/10 rounded-lg p-3">
              <AlertCircle className="w-4 h-4 shrink-0" /> {importError}
            </div>
          )}

          {importPreview && (
            <div>
              <div className="bg-slate-800/50 rounded-lg p-4 text-sm text-slate-400 space-y-1 mb-3">
                <div className="flex justify-between"><span>Module</span><span className="text-white">{importPreview.buildings}</span></div>
                <div className="flex justify-between"><span>Hersteller</span><span className="text-white">{importPreview.manufacturers}</span></div>
              </div>
              <div className="flex gap-2">
                <button onClick={confirmImport} className="flex-1 py-2.5 bg-amber-600 hover:bg-amber-500 text-white text-sm font-medium rounded-xl transition-all">
                  Importieren (überschreibt alles)
                </button>
                <button onClick={() => { setImportPreview(null); setPendingImport(null); }} className="px-4 py-2.5 bg-slate-800 text-slate-400 text-sm rounded-xl hover:bg-slate-700 transition-all">
                  Abbrechen
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
