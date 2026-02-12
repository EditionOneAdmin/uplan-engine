"use client";

import { useState } from "react";
import { X } from "lucide-react";

export interface ExportConfig {
  projektname: string;
  deckblatt: boolean;
  lageplan: boolean;
  baufeldDetails: boolean;
  mietspiegel: boolean;
  gebaeudeSteckbriefe: boolean;
  kostenaufstellung: boolean;
  finanzierung: boolean;
  wirtschaftlichkeit: boolean;
  hinweise: boolean;
}

const DEFAULT_CONFIG: ExportConfig = {
  projektname: "Projektplan",
  deckblatt: true,
  lageplan: true,
  baufeldDetails: true,
  mietspiegel: true,
  gebaeudeSteckbriefe: true,
  kostenaufstellung: true,
  finanzierung: true,
  wirtschaftlichkeit: true,
  hinweise: true,
};

const MODULE_LABELS: { key: keyof Omit<ExportConfig, "projektname">; label: string; icon: string }[] = [
  { key: "deckblatt", label: "Deckblatt & Übersicht", icon: "📋" },
  { key: "lageplan", label: "Lageplan (Karte)", icon: "🗺️" },
  { key: "baufeldDetails", label: "Baufeld-Details", icon: "📐" },
  { key: "mietspiegel", label: "Mietspiegel & Bodenrichtwerte", icon: "💶" },
  { key: "gebaeudeSteckbriefe", label: "Gebäude-Steckbriefe", icon: "🏗️" },
  { key: "kostenaufstellung", label: "Kostenaufstellung DIN 276", icon: "📊" },
  { key: "finanzierung", label: "Finanzierungsmodell", icon: "🏦" },
  { key: "wirtschaftlichkeit", label: "Wirtschaftlichkeit & KPIs", icon: "📈" },
  { key: "hinweise", label: "Hinweise & Disclaimer", icon: "⚠️" },
];

interface Props {
  open: boolean;
  onClose: () => void;
  onExport: (config: ExportConfig) => void;
  exporting?: boolean;
}

export function ExportModal({ open, onClose, onExport, exporting }: Props) {
  const [config, setConfig] = useState<ExportConfig>({ ...DEFAULT_CONFIG });

  if (!open) return null;

  const toggle = (key: keyof ExportConfig) => {
    setConfig((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const activeCount = MODULE_LABELS.filter((m) => config[m.key]).length;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />

      {/* Modal */}
      <div className="relative bg-[#1E293B] border border-white/10 rounded-2xl shadow-2xl w-[440px] max-h-[85vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/10">
          <div>
            <h2 className="text-lg font-bold text-white">PDF-Export</h2>
            <p className="text-xs text-white/40 mt-0.5">{activeCount} Module ausgewählt</p>
          </div>
          <button onClick={onClose} className="text-white/40 hover:text-white transition-colors">
            <X size={20} />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
          {/* Projektname */}
          <div>
            <label className="text-xs text-white/50 uppercase tracking-wider font-semibold mb-1.5 block">
              Projektname
            </label>
            <input
              type="text"
              value={config.projektname}
              onChange={(e) => setConfig((prev) => ({ ...prev, projektname: e.target.value }))}
              className="w-full bg-[#0F172A] border border-white/10 rounded-lg px-3 py-2 text-sm text-white outline-none focus:border-teal-500 transition-colors"
              placeholder="Projektplan"
            />
          </div>

          {/* Module toggles */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs text-white/50 uppercase tracking-wider font-semibold">
                Module
              </label>
              <button
                onClick={() => {
                  const allOn = MODULE_LABELS.every((m) => config[m.key]);
                  const next = { ...config };
                  MODULE_LABELS.forEach((m) => { (next as any)[m.key] = !allOn; });
                  setConfig(next);
                }}
                className="text-[10px] text-teal-400 hover:text-teal-300 transition-colors"
              >
                {MODULE_LABELS.every((m) => config[m.key]) ? "Alle abwählen" : "Alle auswählen"}
              </button>
            </div>
            <div className="space-y-1">
              {MODULE_LABELS.map((m) => (
                <button
                  key={m.key}
                  onClick={() => toggle(m.key)}
                  className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-all text-left ${
                    config[m.key]
                      ? "bg-teal-500/10 border border-teal-500/30"
                      : "bg-white/5 border border-transparent hover:bg-white/10"
                  }`}
                >
                  <div
                    className={`w-5 h-5 rounded flex items-center justify-center text-xs shrink-0 transition-colors ${
                      config[m.key] ? "bg-teal-500 text-white" : "bg-white/10 text-white/30"
                    }`}
                  >
                    {config[m.key] ? "✓" : ""}
                  </div>
                  <span className="text-sm">{m.icon}</span>
                  <span className={`text-sm ${config[m.key] ? "text-white" : "text-white/40"}`}>
                    {m.label}
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-white/10 bg-[#0F172A]/50">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg text-sm text-white/60 hover:text-white hover:bg-white/10 transition-all"
          >
            Abbrechen
          </button>
          <button
            onClick={() => onExport(config)}
            disabled={exporting || activeCount === 0}
            className={`flex items-center gap-2 px-5 py-2 rounded-lg text-sm font-semibold transition-all ${
              exporting
                ? "bg-teal-600/50 text-white/50 cursor-wait"
                : "bg-teal-600 text-white hover:bg-teal-500 shadow-lg shadow-teal-600/20"
            }`}
          >
            {exporting ? (
              <>
                <span className="animate-spin">⏳</span> Generiere PDF…
              </>
            ) : (
              <>📥 Exportieren</>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
