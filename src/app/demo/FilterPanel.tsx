"use client";

import type { Filters } from "./types";

interface Props {
  filters: Filters;
  onChange: (f: Filters) => void;
}

/** Calculate max allowed construction cost per m² based on target revenue */
export function calcMaxBaukosten(filters: Filters): number | null {
  if (filters.targetMode === "off" || filters.targetValue <= 0) return null;
  if (filters.targetMode === "miete") {
    // Zielmiete €/m²/Monat → Jahresmiete × Vervielfältiger 20 = Gesamterlös → 65% für Bau
    const jahresmiete = filters.targetValue * 12;
    return jahresmiete * 20 * 0.65;
  }
  // Verkaufserlös €/m² → 65% davon sind max. Baukosten
  return filters.targetValue * 0.65;
}

export function FilterPanel({ filters, onChange }: Props) {
  const set = (partial: Partial<Filters>) => onChange({ ...filters, ...partial });

  const maxBaukosten = calcMaxBaukosten(filters);

  return (
    <div>
      <h2 className="text-xs font-semibold text-white/50 uppercase tracking-wider mb-3">
        ⚙️ Projektparameter
      </h2>
      <div className="space-y-3">
        {/* Strategy toggle */}
        <div>
          <label className="text-[11px] text-white/40 block mb-1">Verwertung</label>
          <div className="flex rounded-lg overflow-hidden border border-white/10">
            {(["hold", "sell"] as const).map((s) => (
              <button
                key={s}
                onClick={() => set({ strategy: s })}
                className={`flex-1 text-xs py-1.5 transition-colors ${
                  filters.strategy === s
                    ? "bg-[#0D9488] text-white"
                    : "bg-white/5 text-white/50 hover:bg-white/10"
                }`}
              >
                {s === "hold" ? "Bestandshaltung" : "Verkauf"}
              </button>
            ))}
          </div>
        </div>

        {/* Dropdowns row */}
        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className="text-[11px] text-white/40 block mb-1">Energie</label>
            <select
              value={filters.energy}
              onChange={(e) => set({ energy: e.target.value as Filters["energy"] })}
              className="w-full bg-white/5 border border-white/10 rounded px-2 py-1.5 text-xs text-white"
            >
              <option value="fernwaerme">Fernwärme</option>
              <option value="waermepumpe">Wärmepumpe</option>
              <option value="gas">Gas</option>
            </select>
          </div>
          <div>
            <label className="text-[11px] text-white/40 block mb-1">Standard</label>
            <select
              value={filters.efficiency}
              onChange={(e) => set({ efficiency: e.target.value as Filters["efficiency"] })}
              className="w-full bg-white/5 border border-white/10 rounded px-2 py-1.5 text-xs text-white"
            >
              <option value="geg">GEG 2024</option>
              <option value="kfw40">KfW 40</option>
              <option value="passivhaus">Passivhaus</option>
            </select>
          </div>
        </div>

        {/* Zielkosten-Rechner */}
        <div className="pt-2 border-t border-white/10">
          <label className="text-[11px] text-white/40 block mb-1.5">🎯 Zielkosten-Rechner</label>
          <div className="flex rounded-lg overflow-hidden border border-white/10 mb-2">
            {(["off", "miete", "verkauf"] as const).map((m) => (
              <button
                key={m}
                onClick={() => set({ targetMode: m, targetValue: m === "off" ? 0 : filters.targetValue || (m === "miete" ? 12 : 4500) })}
                className={`flex-1 text-[10px] py-1.5 transition-colors ${
                  filters.targetMode === m
                    ? "bg-[#0D9488] text-white"
                    : "bg-white/5 text-white/50 hover:bg-white/10"
                }`}
              >
                {m === "off" ? "Aus" : m === "miete" ? "Zielmiete" : "Verkaufserlös"}
              </button>
            ))}
          </div>
          {filters.targetMode !== "off" && (
            <div>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  value={filters.targetValue || ""}
                  onChange={(e) => set({ targetValue: parseFloat(e.target.value) || 0 })}
                  placeholder={filters.targetMode === "miete" ? "€/m²/Monat" : "€/m²"}
                  className="flex-1 bg-white/5 border border-white/10 rounded px-2 py-1.5 text-xs text-white outline-none focus:border-teal-500"
                  min={0}
                  step={filters.targetMode === "miete" ? 0.5 : 100}
                />
                <span className="text-[10px] text-white/40 whitespace-nowrap">
                  {filters.targetMode === "miete" ? "€/m²/Mo" : "€/m²"}
                </span>
              </div>
              {maxBaukosten !== null && (
                <div className="mt-2 bg-[#0F172A] rounded-lg p-2 border border-white/5">
                  <div className="text-[10px] text-white/40">Max. erlaubte Baukosten</div>
                  <div className="text-sm font-bold text-teal-400">
                    {Math.round(maxBaukosten).toLocaleString("de-DE")} €/m²
                  </div>
                  <div className="text-[9px] text-white/30 mt-0.5">
                    {filters.targetMode === "miete"
                      ? `${filters.targetValue} €/m²/Mo × 12 × 20 × 0,65`
                      : `${filters.targetValue} €/m² × 0,65`}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
