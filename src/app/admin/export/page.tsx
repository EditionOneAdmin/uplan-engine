"use client";
import React, { useState, useRef } from "react";
import { useAdminStore, type ManufacturerData } from "../store";
import { Card, Button } from "../components";
import { Download, Upload, Copy, Check, FileJson } from "lucide-react";
import type { BuildingModule } from "../../demo/types";

function generateDataTS(buildings: BuildingModule[], manufacturers: ManufacturerData[]) {
  const mfrs = manufacturers.map((m) =>
    `  "${m.id}": { label: "${m.label}", color: "${m.color}", accent: "${m.accent}" },`
  ).join("\n");

  const blds = buildings.map((b) => `  {
    id: "${b.id}",
    name: "${b.name}",
    manufacturer: "${b.manufacturer}",
    manufacturerLabel: "${b.manufacturerLabel}",
    shape: "${b.shape}",
    shapeLabel: "${b.shapeLabel}",
    footprint: { width: ${b.footprint.width}, depth: ${b.footprint.depth} },
    minGeschosse: ${b.minGeschosse},
    maxGeschosse: ${b.maxGeschosse},
    defaultGeschosse: ${b.defaultGeschosse},
    wePerGeschoss: ${b.wePerGeschoss},
    bgfPerGeschoss: ${b.bgfPerGeschoss},
    roofOptions: [${b.roofOptions.map((r) => `"${r}"`).join(", ")}],
    facadeOptions: [${b.facadeOptions.map((f) => `"${f}"`).join(", ")}],
    energyRating: "${b.energyRating}",
    pricePerSqm: ${b.pricePerSqm},
    tags: [${b.tags.map((t) => `"${t}"`).join(", ")}],
    color: "${b.color}",${b.rendering ? `\n    rendering: "${b.rendering}",` : ""}
  }`).join(",\n");

  return `import type { Baufeld, BuildingModule, Manufacturer, BuildingShape } from "./types";

export const BAUFELDER: Baufeld[] = [];

export const MANUFACTURERS: Record<Manufacturer, { label: string; color: string; accent: string }> = {
${mfrs}
};

export const SHAPE_CONFIG: Record<BuildingShape, { label: string; icon: string }> = {
  "riegel": { label: "Riegel", icon: "▬" },
  "l-winkel": { label: "L-Winkel", icon: "⌐" },
  "u-form": { label: "U-Form", icon: "⊔" },
  "punkthaus": { label: "Punkthaus", icon: "■" },
  "t-form": { label: "T-Form", icon: "⊤" },
  "doppelhaus": { label: "Doppelhaus", icon: "⊞" },
};

export const BUILDINGS: BuildingModule[] = [
${blds},
];
`;
}

export default function ExportPage() {
  const { buildings, manufacturers, setBuildings, setManufacturers } = useAdminStore();
  const [copied, setCopied] = useState(false);
  const [importData, setImportData] = useState<{ buildings: BuildingModule[]; manufacturers: ManufacturerData[] } | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const exportCode = generateDataTS(buildings, manufacturers);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(exportCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const blob = new Blob([exportCode], { type: "text/typescript" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = "data.ts"; a.click();
    URL.revokeObjectURL(url);
  };

  const handleExportJSON = () => {
    const data = JSON.stringify({ buildings, manufacturers }, null, 2);
    const blob = new Blob([data], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = "uplan-data.json"; a.click();
    URL.revokeObjectURL(url);
  };

  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const data = JSON.parse(reader.result as string);
        if (data.buildings && data.manufacturers) {
          setImportData(data);
        } else {
          alert("Ungültiges Format. Erwartet: { buildings: [...], manufacturers: [...] }");
        }
      } catch { alert("JSON parse error"); }
    };
    reader.readAsText(file);
  };

  const applyImport = () => {
    if (!importData) return;
    setBuildings(importData.buildings);
    setManufacturers(importData.manufacturers);
    setImportData(null);
  };

  return (
    <div>
      <h1 className="text-2xl font-bold mb-8">Export / Import</h1>

      <Card className="mb-6">
        <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <Download size={20} /> Export
        </h2>
        <p className="text-sm text-slate-400 mb-4">
          {buildings.length} Module, {manufacturers.length} Hersteller
        </p>
        <div className="flex gap-3 mb-4">
          <Button onClick={handleDownload}>
            <FileJson size={16} className="mr-1 inline" /> data.ts
          </Button>
          <Button variant="ghost" onClick={handleExportJSON}>
            <Download size={16} className="mr-1 inline" /> JSON
          </Button>
          <Button variant="ghost" onClick={handleCopy}>
            {copied ? <Check size={16} className="mr-1 inline text-green-400" /> : <Copy size={16} className="mr-1 inline" />}
            {copied ? "Kopiert!" : "Kopieren"}
          </Button>
        </div>
        <div className="bg-slate-900/80 rounded-lg border border-slate-800 p-4 max-h-96 overflow-auto">
          <pre className="text-xs text-slate-400 font-mono whitespace-pre">{exportCode}</pre>
        </div>
      </Card>

      <Card>
        <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <Upload size={20} /> Import
        </h2>
        <p className="text-sm text-slate-400 mb-4">JSON-Datei mit buildings und manufacturers.</p>
        <input ref={fileRef} type="file" accept=".json" onChange={handleImport} className="hidden" />
        <Button variant="ghost" onClick={() => fileRef.current?.click()}>
          <Upload size={16} className="mr-1 inline" /> JSON auswählen
        </Button>

        {importData && (
          <div className="mt-4">
            <p className="text-sm text-slate-300 mb-3">
              {importData.buildings.length} Module, {importData.manufacturers.length} Hersteller
            </p>
            <div className="flex gap-2">
              <Button onClick={applyImport}>Import anwenden</Button>
              <Button variant="ghost" onClick={() => setImportData(null)}>Abbrechen</Button>
            </div>
          </div>
        )}
      </Card>
    </div>
  );
}
