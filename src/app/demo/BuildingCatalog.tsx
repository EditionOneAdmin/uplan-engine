"use client";

import { useState } from "react";
import { X } from "lucide-react";
import type { BuildingModule, BuildingShape, Manufacturer, PlacedUnit, RoofType, FacadeType, Baufeld, Filters } from "./types";
import { MANUFACTURERS, SHAPE_CONFIG } from "./data";
import { calculateMatch, getScoreColor, getScoreIcon, getCriterionIcon, getCriterionColor, type MatchResult } from "./matchScore";

/* ── SVG Building Shapes ──────────────────────────────────── */

function BuildingShapeSVG({ shape, color, size = 64 }: { shape: BuildingShape; color: string; size?: number }) {
  const fill = color + "33"; // 20% opacity
  const stroke = color;
  const sw = 1.5;
  const lineColor = color + "66";

  const shapes: Record<BuildingShape, React.ReactNode> = {
    riegel: (
      <svg width={size} height={size} viewBox="0 0 64 64">
        <rect x="6" y="20" width="52" height="24" rx="2" fill={fill} stroke={stroke} strokeWidth={sw} />
        <line x1="23" y1="20" x2="23" y2="44" stroke={lineColor} strokeWidth="1" />
        <line x1="40" y1="20" x2="40" y2="44" stroke={lineColor} strokeWidth="1" />
        <line x1="6" y1="32" x2="58" y2="32" stroke={lineColor} strokeWidth="0.7" />
      </svg>
    ),
    "l-winkel": (
      <svg width={size} height={size} viewBox="0 0 64 64">
        <path d="M8 8 H40 V28 H28 V56 H8 Z" fill={fill} stroke={stroke} strokeWidth={sw} strokeLinejoin="round" />
        <line x1="8" y1="28" x2="28" y2="28" stroke={lineColor} strokeWidth="0.7" />
        <line x1="20" y1="8" x2="20" y2="56" stroke={lineColor} strokeWidth="1" />
        <line x1="8" y1="42" x2="28" y2="42" stroke={lineColor} strokeWidth="0.7" />
      </svg>
    ),
    "u-form": (
      <svg width={size} height={size} viewBox="0 0 64 64">
        <path d="M6 12 H22 V44 H42 V12 H58 V52 H6 Z" fill={fill} stroke={stroke} strokeWidth={sw} strokeLinejoin="round" />
        <line x1="6" y1="32" x2="22" y2="32" stroke={lineColor} strokeWidth="0.7" />
        <line x1="42" y1="32" x2="58" y2="32" stroke={lineColor} strokeWidth="0.7" />
        <line x1="14" y1="12" x2="14" y2="52" stroke={lineColor} strokeWidth="1" />
        <line x1="50" y1="12" x2="50" y2="52" stroke={lineColor} strokeWidth="1" />
      </svg>
    ),
    punkthaus: (
      <svg width={size} height={size} viewBox="0 0 64 64">
        <rect x="12" y="12" width="40" height="40" rx="2" fill={fill} stroke={stroke} strokeWidth={sw} />
        <line x1="32" y1="12" x2="32" y2="52" stroke={lineColor} strokeWidth="1" />
        <line x1="12" y1="32" x2="52" y2="32" stroke={lineColor} strokeWidth="1" />
      </svg>
    ),
    "t-form": (
      <svg width={size} height={size} viewBox="0 0 64 64">
        <path d="M6 8 H58 V28 H42 V56 H22 V28 H6 Z" fill={fill} stroke={stroke} strokeWidth={sw} strokeLinejoin="round" />
        <line x1="6" y1="18" x2="58" y2="18" stroke={lineColor} strokeWidth="0.7" />
        <line x1="22" y1="42" x2="42" y2="42" stroke={lineColor} strokeWidth="0.7" />
        <line x1="32" y1="8" x2="32" y2="56" stroke={lineColor} strokeWidth="1" />
      </svg>
    ),
    doppelhaus: (
      <svg width={size} height={size} viewBox="0 0 64 64">
        <rect x="6" y="16" width="24" height="32" rx="2" fill={fill} stroke={stroke} strokeWidth={sw} />
        <rect x="34" y="16" width="24" height="32" rx="2" fill={fill} stroke={stroke} strokeWidth={sw} />
        <line x1="18" y1="16" x2="18" y2="48" stroke={lineColor} strokeWidth="1" />
        <line x1="46" y1="16" x2="46" y2="48" stroke={lineColor} strokeWidth="1" />
        <line x1="6" y1="32" x2="30" y2="32" stroke={lineColor} strokeWidth="0.7" />
        <line x1="34" y1="32" x2="58" y2="32" stroke={lineColor} strokeWidth="0.7" />
      </svg>
    ),
  };

  return <>{shapes[shape]}</>;
}

/* ── Energy Rating Bar ────────────────────────────────────── */

function EnergyBar({ rating }: { rating: string }) {
  const levels: Record<string, number> = { "A+": 95, "A": 80, "B": 60, "C": 40 };
  const pct = levels[rating] || 50;
  const clr = pct >= 80 ? "#22C55E" : pct >= 60 ? "#EAB308" : "#EF4444";
  return (
    <div className="flex items-center gap-1.5">
      <div className="flex-1 h-1.5 bg-white/10 rounded-full overflow-hidden">
        <div className="h-full rounded-full" style={{ width: `${pct}%`, backgroundColor: clr }} />
      </div>
      <span className="text-[10px] font-bold" style={{ color: clr }}>{rating}</span>
    </div>
  );
}

/* ── Score Components ─────────────────────────────────────── */

function ScoreRing({ score, maxScore = 10, size = 40 }: { score: number; maxScore?: number; size?: number }) {
  const color = getScoreColor(score);
  const r = (size - 6) / 2;
  const c = Math.PI * 2 * r;
  const pct = score / maxScore;
  return (
    <svg width={size} height={size} className="shrink-0">
      <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="white" strokeOpacity={0.1} strokeWidth={3} />
      <circle cx={size/2} cy={size/2} r={r} fill="none" stroke={color} strokeWidth={3}
        strokeDasharray={`${c * pct} ${c * (1 - pct)}`}
        strokeLinecap="round" transform={`rotate(-90 ${size/2} ${size/2})`} />
      <text x={size/2} y={size/2} textAnchor="middle" dominantBaseline="central"
        fill={color} fontSize={size * 0.28} fontWeight="bold">{score}</text>
    </svg>
  );
}

function ScoreBadge({ score }: { score: number }) {
  const color = getScoreColor(score);
  const icon = getScoreIcon(score);
  return (
    <span
      className="absolute top-1.5 right-1.5 z-10 flex items-center gap-0.5 px-1.5 py-0.5 rounded-full text-[9px] font-bold leading-none"
      style={{ backgroundColor: color + "22", color, border: `1px solid ${color}44` }}
    >
      {icon} {score}/10
    </span>
  );
}

function MatchBreakdown({ result }: { result: MatchResult }) {
  return (
    <div className="mt-2 space-y-1">
      {result.criteria.map((c) => (
        <div key={c.name} className="flex items-center gap-1.5 text-[11px]">
          <span style={{ color: getCriterionColor(c.status) }}>{getCriterionIcon(c.status)}</span>
          <span className="text-white/60 font-medium">{c.label}:</span>
          <span className="text-white/40">{c.detail}</span>
        </div>
      ))}
    </div>
  );
}

/* ── Configurator ─────────────────────────────────────────── */

function Configurator({
  building,
  geschosse,
  setGeschosse,
  roofType,
  setRoofType,
  facade,
  setFacade,
  onPlace,
  matchResult,
}: {
  building: BuildingModule;
  geschosse: number;
  setGeschosse: (n: number) => void;
  roofType: RoofType;
  setRoofType: (r: RoofType) => void;
  facade: FacadeType;
  setFacade: (f: FacadeType) => void;
  onPlace: () => void;
  matchResult: MatchResult | null;
}) {
  const bgf = building.bgfPerGeschoss * geschosse;
  const we = building.wePerGeschoss * geschosse;
  const gf = building.footprint.width * building.footprint.depth;
  const bri = bgf * 3.25;
  const stellpl = Math.ceil(we * 0.8);
  const kosten = bgf * building.pricePerSqm;

  const roofLabels: Record<RoofType, string> = { flat: "Flach", saddle: "Sattel", pult: "Pult" };
  const facadeLabels: Record<FacadeType, string> = { putz: "Putz", klinker: "Klinker", holz: "Holz", metall: "Metall" };

  const pill = (active: boolean, color?: string) =>
    `px-2.5 py-1 rounded-md text-[11px] font-medium transition-all cursor-pointer ${
      active
        ? "bg-[#0D9488] text-white shadow-sm"
        : "bg-white/5 text-white/50 hover:bg-white/10 hover:text-white/70"
    }`;

  const geschossRange: number[] = [];
  for (let i = building.minGeschosse; i <= building.maxGeschosse; i++) geschossRange.push(i);

  return (
    <div className="mt-3 p-3 bg-[#0F172A] rounded-xl border border-white/10">
      <div className="flex items-center gap-2 mb-3">
        <BuildingShapeSVG shape={building.shape} color={building.color} size={28} />
        <div>
          <div className="text-xs font-bold text-white">{building.manufacturerLabel} {building.name}</div>
          <div className="text-[10px] text-white/40">Konfiguration</div>
        </div>
      </div>

      {/* Geschosse */}
      <div className="mb-2.5">
        <div className="text-[10px] text-white/40 mb-1">Geschosse</div>
        <div className="flex gap-1 flex-wrap">
          {geschossRange.map((g) => (
            <button key={g} onClick={() => setGeschosse(g)} className={pill(geschosse === g)}>
              {g}
            </button>
          ))}
        </div>
      </div>

      {/* Dach */}
      <div className="mb-2.5">
        <div className="text-[10px] text-white/40 mb-1">Dach</div>
        <div className="flex gap-1">
          {building.roofOptions.map((r) => (
            <button key={r} onClick={() => setRoofType(r)} className={pill(roofType === r)}>
              {roofLabels[r]}
            </button>
          ))}
        </div>
      </div>

      {/* Fassade */}
      <div className="mb-3">
        <div className="text-[10px] text-white/40 mb-1">Fassade</div>
        <div className="flex gap-1 flex-wrap">
          {building.facadeOptions.map((f) => (
            <button key={f} onClick={() => setFacade(f)} className={pill(facade === f)}>
              {facadeLabels[f]}
            </button>
          ))}
        </div>
      </div>

      {/* Kennzahlen */}
      <div className="bg-[#1E293B] rounded-lg p-2.5 border border-white/5 mb-3">
        <div className="text-[10px] text-white/40 uppercase tracking-wider mb-2 font-semibold">Kennzahlen</div>
        <div className="grid grid-cols-2 gap-x-4 gap-y-1.5 text-xs">
          <div className="flex justify-between"><span className="text-white/50">BGF</span><span className="text-white font-medium">{bgf.toLocaleString("de-DE")} m²</span></div>
          <div className="flex justify-between"><span className="text-white/50">WE</span><span className="text-white font-medium">{we}</span></div>
          <div className="flex justify-between"><span className="text-white/50">GF</span><span className="text-white font-medium">{gf.toLocaleString("de-DE")} m²</span></div>
          <div className="flex justify-between"><span className="text-white/50">BRI</span><span className="text-white font-medium">{bri.toLocaleString("de-DE")} m³</span></div>
          <div className="flex justify-between"><span className="text-white/50">Stellpl.</span><span className="text-white font-medium">{stellpl}</span></div>
          <div className="flex justify-between"><span className="text-white/50">~Kosten</span><span className="text-white font-medium">€{(kosten / 1_000_000).toFixed(2)} Mio</span></div>
        </div>
        <div className="mt-2">
          <EnergyBar rating={building.energyRating} />
        </div>
      </div>

      {matchResult && (
        <div className="bg-[#1E293B] rounded-lg p-2.5 border border-white/5 mb-3">
          <div className="flex items-center gap-3 mb-2">
            <ScoreRing score={matchResult.score} size={48} />
            <div>
              <div className="text-xs font-bold text-white">Match-Score</div>
              <div className="text-[10px] text-white/40">{matchResult.score}/{matchResult.maxScore} Punkte</div>
            </div>
          </div>
          <MatchBreakdown result={matchResult} />
        </div>
      )}

      <button
        onClick={onPlace}
        className="w-full py-2 rounded-lg bg-[#0D9488] hover:bg-[#0F766E] text-white text-xs font-bold transition-all shadow-lg shadow-[#0D9488]/20"
      >
        🖱️ Auf Baufeld platzieren
      </button>
    </div>
  );
}

/* ── Main Catalog ─────────────────────────────────────────── */

interface Props {
  buildings: BuildingModule[];
  selectedId: string | null;
  onSelect: (id: string | null) => void;
  placedUnits: PlacedUnit[];
  onRemoveUnit: (id: string) => void;
  manufacturerFilter: Manufacturer | "all";
  onManufacturerFilter: (m: Manufacturer | "all") => void;
  shapeFilter: BuildingShape | "all";
  onShapeFilter: (s: BuildingShape | "all") => void;
  geschosse: number;
  setGeschosse: (n: number) => void;
  roofType: RoofType;
  setRoofType: (r: RoofType) => void;
  facade: FacadeType;
  setFacade: (f: FacadeType) => void;
  onPlace: () => void;
  activeBaufeld: Baufeld | null;
  filters: Filters;
}

export function BuildingCatalog({
  buildings,
  selectedId,
  onSelect,
  placedUnits,
  onRemoveUnit,
  manufacturerFilter,
  onManufacturerFilter,
  shapeFilter,
  onShapeFilter,
  geschosse,
  setGeschosse,
  roofType,
  setRoofType,
  facade,
  setFacade,
  onPlace,
  activeBaufeld,
  filters,
}: Props) {
  const selectedBuilding = buildings.find((b) => b.id === selectedId) || null;

  // Calculate match scores if baufeld is active
  const matchScores = new Map<string, MatchResult>();
  if (activeBaufeld) {
    buildings.forEach((b) => {
      matchScores.set(b.id, calculateMatch(b, activeBaufeld, filters, b.defaultGeschosse));
    });
  }

  const selectedMatchResult = selectedBuilding && activeBaufeld
    ? calculateMatch(selectedBuilding, activeBaufeld, filters, geschosse)
    : null;

  // Filter buildings
  let filtered = buildings.filter((b) => {
    if (manufacturerFilter !== "all" && b.manufacturer !== manufacturerFilter) return false;
    if (shapeFilter !== "all" && b.shape !== shapeFilter) return false;
    return true;
  });

  // Sort by match score (highest first) when baufeld active
  if (activeBaufeld) {
    filtered = [...filtered].sort((a, b) => {
      const sa = matchScores.get(a.id)?.score ?? 0;
      const sb = matchScores.get(b.id)?.score ?? 0;
      return sb - sa;
    });
  }

  return (
    <div>
      {/* Header */}
      <h2 className="text-xs font-semibold text-white/50 uppercase tracking-wider mb-3">
        🏗️ Gebäude-Katalog
      </h2>

      {/* Manufacturer filter pills */}
      <div className="flex flex-wrap gap-1 mb-2.5">
        <button
          onClick={() => onManufacturerFilter("all")}
          className={`px-2 py-1 rounded-md text-[10px] font-semibold transition-all ${
            manufacturerFilter === "all"
              ? "bg-white/20 text-white"
              : "bg-white/5 text-white/40 hover:bg-white/10"
          }`}
        >
          Alle
        </button>
        {(Object.entries(MANUFACTURERS) as [Manufacturer, { label: string; color: string }][]).map(([key, m]) => (
          <button
            key={key}
            onClick={() => onManufacturerFilter(key)}
            className={`px-2 py-1 rounded-md text-[10px] font-semibold transition-all ${
              manufacturerFilter === key
                ? "text-white shadow-sm"
                : "bg-white/5 text-white/40 hover:bg-white/10"
            }`}
            style={manufacturerFilter === key ? { backgroundColor: m.color + "40", color: m.color } : {}}
          >
            {m.label}
          </button>
        ))}
      </div>

      {/* Shape filter dropdown */}
      <div className="flex gap-2 mb-3">
        <select
          value={shapeFilter}
          onChange={(e) => onShapeFilter(e.target.value as BuildingShape | "all")}
          className="flex-1 bg-white/5 border border-white/10 rounded-md px-2 py-1 text-[11px] text-white"
        >
          <option value="all">Alle Formen</option>
          {(Object.entries(SHAPE_CONFIG) as [BuildingShape, { label: string; icon: string }][]).map(([key, s]) => (
            <option key={key} value={key}>{s.icon} {s.label}</option>
          ))}
        </select>
      </div>

      {/* Placement hint */}
      {selectedId && !selectedBuilding && (
        <div className="mb-3 px-3 py-2 bg-[#0D9488]/20 border border-[#0D9488]/40 rounded-lg text-xs text-[#0D9488]">
          Klicke auf ein Baufeld um das Gebäude zu platzieren
        </div>
      )}

      {/* Building Grid */}
      <div className="grid grid-cols-2 gap-2">
        {filtered.map((b) => {
          const isSelected = selectedId === b.id;
          const count = placedUnits.filter((u) => u.buildingId === b.id).length;
          const weMin = b.wePerGeschoss * b.minGeschosse;
          const weMax = b.wePerGeschoss * b.maxGeschosse;

          return (
            <button
              key={b.id}
              onClick={() => onSelect(isSelected ? null : b.id)}
              className={`relative text-left p-3 rounded-xl border transition-all ${
                isSelected
                  ? "bg-white/5 ring-1"
                  : "border-white/10 bg-white/[0.03] hover:bg-white/[0.06] hover:border-white/20 hover:scale-[1.02]"
              }`}
              style={isSelected ? { borderColor: b.color, boxShadow: `0 0 20px ${b.color}20` } : {}}
            >
              {activeBaufeld && matchScores.has(b.id) && (
                <ScoreBadge score={matchScores.get(b.id)!.score} />
              )}
              {count > 0 && (
                <span
                  className={`absolute ${activeBaufeld ? "top-7" : "top-2"} right-2 text-white text-[9px] font-bold rounded-full w-4 h-4 flex items-center justify-center`}
                  style={{ backgroundColor: b.color }}
                >
                  {count}
                </span>
              )}

              <div className="flex justify-center mb-2">
                <BuildingShapeSVG shape={b.shape} color={b.color} size={56} />
              </div>

              <div className="text-xs font-bold text-white leading-tight">{b.name}</div>
              <div className="flex items-center gap-1 mt-0.5">
                <span className="w-2 h-2 rounded-full inline-block" style={{ backgroundColor: b.color }} />
                <span className="text-[10px] text-white/50">{b.manufacturerLabel}</span>
              </div>

              <div className="mt-1.5 text-[10px] text-white/40 leading-relaxed">
                {b.footprint.width}×{b.footprint.depth}m · {b.minGeschosse}-{b.maxGeschosse} Gesch.
              </div>
              <div className="text-[10px] text-white/40">{weMin}-{weMax} WE</div>

              <div className="mt-1.5">
                <EnergyBar rating={b.energyRating} />
              </div>

              <div className="text-[10px] text-white/30 mt-1">
                ab €{b.pricePerSqm.toLocaleString("de-DE")}/m²
              </div>
            </button>
          );
        })}
      </div>

      {filtered.length === 0 && (
        <div className="text-center text-xs text-white/30 py-8">Keine Gebäude für diese Filter</div>
      )}

      {/* Configurator */}
      {selectedBuilding && (
        <Configurator
          building={selectedBuilding}
          geschosse={geschosse}
          setGeschosse={setGeschosse}
          roofType={roofType}
          setRoofType={setRoofType}
          facade={facade}
          setFacade={setFacade}
          onPlace={onPlace}
          matchResult={selectedMatchResult}
        />
      )}

      {/* Placed units summary */}
      {placedUnits.length > 0 && (
        <div className="mt-4 pt-3 border-t border-white/10">
          <h3 className="text-xs font-semibold text-white/50 uppercase tracking-wider mb-2">
            Platzierte Gebäude ({placedUnits.length})
          </h3>
          <div className="space-y-1 max-h-32 overflow-y-auto">
            {placedUnits.map((u) => {
              const b = buildings.find((bb) => bb.id === u.buildingId);
              return (
                <div
                  key={u.id}
                  className="flex items-center justify-between text-xs py-1.5 px-2 rounded-lg bg-white/5"
                >
                  <div className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full" style={{ backgroundColor: b?.color || "#888" }} />
                    <span className="text-white/70">
                      {b?.name || "?"} · {u.geschosse}G · {u.units} WE · {u.area.toLocaleString("de-DE")}m²
                    </span>
                  </div>
                  <button
                    onClick={(e) => { e.stopPropagation(); onRemoveUnit(u.id); }}
                    className="text-white/30 hover:text-red-400 transition-colors"
                  >
                    <X size={12} />
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
