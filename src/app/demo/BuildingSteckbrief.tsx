"use client";

import { X } from "lucide-react";
import type { BuildingModule, RoofType, FacadeType, BuildingShape } from "./types";
import { MANUFACTURERS } from "./data";

interface SteckbriefProps {
  building: BuildingModule;
  geschosse: number;
  roofType: RoofType;
  facade: FacadeType;
  energy: string;
  efficiency: string;
  onClose: () => void;
}

// ── Labels ──

const ROOF_LABELS: Record<RoofType, string> = {
  flat: "Flachdach",
  saddle: "Satteldach",
  pult: "Pultdach",
};

const FACADE_LABELS: Record<FacadeType, string> = {
  putz: "Putz",
  klinker: "Klinker",
  holz: "Holz",
  metall: "Metall",
};

const ENERGY_LABELS: Record<string, string> = {
  fernwaerme: "Fernwärme",
  waermepumpe: "Wärmepumpe",
  gas: "Gas",
};

const EFFICIENCY_LABELS: Record<string, string> = {
  geg: "GEG Standard",
  kfw40: "KfW 40",
  passivhaus: "Passivhaus",
};

const ENERGY_RATING_CONFIG: Record<string, { percent: number; color: string }> = {
  "A+": { percent: 100, color: "#22C55E" },
  A: { percent: 80, color: "#4ADE80" },
  B: { percent: 60, color: "#FBBF24" },
  C: { percent: 40, color: "#F87171" },
};

// ── Wohnungsmix ──

interface AptType {
  label: string;
  size: number;
  count: number;
}

function getWohnungsmix(wePerGeschoss: number): AptType[] {
  if (wePerGeschoss <= 2) return [{ label: "Standard", size: 65, count: 1 }, { label: "Family", size: 85, count: 1 }];
  if (wePerGeschoss <= 4) return [{ label: "Studio", size: 35, count: 1 }, { label: "Compact", size: 45, count: 1 }, { label: "Standard", size: 65, count: 1 }, { label: "Family", size: 85, count: 1 }];
  if (wePerGeschoss <= 6) return [{ label: "Studio", size: 35, count: 2 }, { label: "Compact", size: 45, count: 2 }, { label: "Standard", size: 65, count: 1 }, { label: "Family", size: 85, count: 1 }];
  return [{ label: "Studio", size: 35, count: 2 }, { label: "Compact", size: 45, count: 2 }, { label: "Standard", size: 65, count: 2 }, { label: "Family", size: 85, count: 2 }];
}

// ── Building SVG ──

function BuildingSVGLarge({
  shape,
  geschosse,
  color,
  roofType,
}: {
  shape: BuildingShape;
  geschosse: number;
  color: string;
  roofType: RoofType;
}) {
  const roofH = roofType === "flat" ? 0 : 15;
  const bodyTop = 10 + roofH;
  const bodyH = 120 - roofH;
  const floorH = bodyH / geschosse;

  // Shape outlines (x, y, w, h regions for the body)
  const shapeOutlines: Record<BuildingShape, { path: string; windows: { x: number; y: number }[] }> = {
    riegel: (() => {
      const x = 30, y = bodyTop, w = 140, h = bodyH;
      const wins: { x: number; y: number }[] = [];
      for (let g = 0; g < geschosse; g++) {
        const fy = y + g * floorH + floorH * 0.3;
        for (let i = 0; i < 7; i++) wins.push({ x: x + 8 + i * 19, y: fy });
      }
      return { path: `M${x},${y} h${w} v${h} h-${w} Z`, windows: wins };
    })(),
    punkthaus: (() => {
      const x = 55, y = bodyTop, w = 90, h = bodyH;
      const wins: { x: number; y: number }[] = [];
      for (let g = 0; g < geschosse; g++) {
        const fy = y + g * floorH + floorH * 0.3;
        for (let i = 0; i < 4; i++) wins.push({ x: x + 8 + i * 21, y: fy });
      }
      return { path: `M${x},${y} h${w} v${h} h-${w} Z`, windows: wins };
    })(),
    "l-winkel": (() => {
      const x = 35, y = bodyTop, w = 130, h = bodyH, hw = 65, hh = bodyH * 0.5;
      const wins: { x: number; y: number }[] = [];
      for (let g = 0; g < geschosse; g++) {
        const fy = y + g * floorH + floorH * 0.3;
        for (let i = 0; i < 3; i++) wins.push({ x: x + 8 + i * 19, y: fy });
        if (g * floorH < hh) for (let i = 0; i < 3; i++) wins.push({ x: x + hw + 8 + i * 19, y: fy });
      }
      return { path: `M${x},${y} h${w} v${hh} h-${hw} v${h - hh} h-${hw} Z`, windows: wins };
    })(),
    "u-form": (() => {
      const x = 30, y = bodyTop, w = 140, h = bodyH, gap = 50, armW = 45;
      const wins: { x: number; y: number }[] = [];
      for (let g = 0; g < geschosse; g++) {
        const fy = y + g * floorH + floorH * 0.3;
        for (let i = 0; i < 2; i++) wins.push({ x: x + 6 + i * 14, y: fy });
        for (let i = 0; i < 2; i++) wins.push({ x: x + w - armW + 6 + i * 14, y: fy });
      }
      const innerH = h * 0.6;
      return { path: `M${x},${y} h${w} v${h} h-${armW} v-${innerH} h-${gap} v${innerH} h-${armW} Z`, windows: wins };
    })(),
    "t-form": (() => {
      const x = 30, y = bodyTop, topW = 140, stemW = 50, topH = bodyH * 0.4, stemH = bodyH * 0.6;
      const stemX = x + (topW - stemW) / 2;
      const wins: { x: number; y: number }[] = [];
      for (let g = 0; g < geschosse; g++) {
        const fy = y + g * floorH + floorH * 0.3;
        if (fy < y + topH) for (let i = 0; i < 6; i++) wins.push({ x: x + 8 + i * 22, y: fy });
        else for (let i = 0; i < 2; i++) wins.push({ x: stemX + 8 + i * 18, y: fy });
      }
      return { path: `M${x},${y} h${topW} v${topH} h-${(topW - stemW) / 2} v${stemH} h-${stemW} v-${stemH} h-${(topW - stemW) / 2} Z`, windows: wins };
    })(),
    doppelhaus: (() => {
      const x = 40, y = bodyTop, w = 55, gap = 6, h = bodyH;
      const wins: { x: number; y: number }[] = [];
      for (let g = 0; g < geschosse; g++) {
        const fy = y + g * floorH + floorH * 0.3;
        for (let i = 0; i < 2; i++) wins.push({ x: x + 10 + i * 18, y: fy });
        for (let i = 0; i < 2; i++) wins.push({ x: x + w + gap + 10 + i * 18, y: fy });
      }
      return {
        path: `M${x},${y} h${w} v${h} h-${w} Z M${x + w + gap},${y} h${w} v${h} h-${w} Z`,
        windows: wins,
      };
    })(),
  };

  const { path, windows } = shapeOutlines[shape];

  // Roof path
  let roofPath = "";
  if (roofType === "saddle") {
    roofPath = `M30,${bodyTop} L100,${bodyTop - roofH} L170,${bodyTop}`;
  } else if (roofType === "pult") {
    roofPath = `M30,${bodyTop} L170,${bodyTop - roofH}`;
  }

  // Floor lines
  const floorLines: number[] = [];
  for (let i = 1; i < geschosse; i++) floorLines.push(bodyTop + i * floorH);

  return (
    <svg viewBox="0 0 200 150" className="w-full h-full" fill="none">
      {/* Building body */}
      <path d={path} fill={color} fillOpacity={0.15} stroke={color} strokeWidth={1.5} fillRule="evenodd" />
      {/* Floor lines */}
      {floorLines.map((fy, i) => (
        <line key={i} x1={20} y1={fy} x2={180} y2={fy} stroke={color} strokeOpacity={0.25} strokeWidth={0.5} strokeDasharray="3,3" />
      ))}
      {/* Windows */}
      {windows.map((w, i) => (
        <rect key={i} x={w.x} y={w.y} width={8} height={6} rx={1} fill={color} fillOpacity={0.35} />
      ))}
      {/* Roof */}
      {roofPath && <path d={roofPath} stroke={color} strokeWidth={2} fill="none" />}
      {/* Ground line */}
      <line x1={20} y1={bodyTop + bodyH} x2={180} y2={bodyTop + bodyH} stroke={color} strokeWidth={2} />
    </svg>
  );
}

// ── Format helpers ──

function fmtNum(n: number): string {
  return n.toLocaleString("de-DE");
}

function fmtPrice(n: number): string {
  if (n >= 1_000_000) return `~€${(n / 1_000_000).toFixed(2)} Mio`;
  return `~€${fmtNum(Math.round(n))}`;
}

// ── Main Component ──

export function BuildingSteckbrief({
  building,
  geschosse,
  roofType,
  facade,
  energy,
  efficiency,
  onClose,
}: SteckbriefProps) {
  const mfr = MANUFACTURERS[building.manufacturer];
  const totalWE = building.wePerGeschoss * geschosse;
  const bgf = building.bgfPerGeschoss * geschosse;
  const bri = Math.round(bgf * 3.25);
  const gf = building.footprint.width * building.footprint.depth;
  const stellplaetze = Math.ceil(totalWE * 0.8);
  const kosten = bgf * building.pricePerSqm;
  const ratingCfg = ENERGY_RATING_CONFIG[building.energyRating] ?? ENERGY_RATING_CONFIG.B;
  const mix = getWohnungsmix(building.wePerGeschoss);

  return (
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 backdrop-blur-sm animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-[600px] max-h-[90vh] overflow-y-auto bg-[#0F172A] border border-white/10 rounded-2xl shadow-2xl text-white"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 pt-4 pb-2">
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-white/10 transition-colors"
          >
            <X size={18} className="text-white/60" />
          </button>
          <span className="text-sm font-medium" style={{ color: mfr.color }}>
            {mfr.label}
          </span>
        </div>

        {/* Building Visual */}
        <div className="px-5 pb-2">
          {building.rendering ? (
            <div>
              <div className="w-full h-48 rounded-xl overflow-hidden bg-white/5">
                <img
                  src={building.rendering}
                  alt={building.name}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="text-[10px] text-white/30 text-right mt-1 italic">Vorschau</div>
            </div>
          ) : (
            <div className="w-full h-[150px] flex items-center justify-center bg-white/[0.03] rounded-xl">
              <div className="w-[200px] h-[150px]">
                <BuildingSVGLarge
                  shape={building.shape}
                  geschosse={geschosse}
                  color={mfr.color}
                  roofType={roofType}
                />
              </div>
            </div>
          )}
        </div>

        {/* Name */}
        <div className="px-5 pb-3">
          <h2 className="text-xl font-bold">{building.name}</h2>
          <p className="text-sm text-white/50">
            <span style={{ color: mfr.color }}>{mfr.label}</span>
            {" · "}
            Serieller Modulbau
          </p>
        </div>

        {/* Key Stats */}
        <div className="px-5 pb-3">
          <div className="grid grid-cols-3 gap-2">
            {[
              { value: `${building.footprint.width} × ${building.footprint.depth}m`, label: "Footprint" },
              { value: `${geschosse} Gesch`, label: "Geschosse" },
              { value: `${totalWE} WE`, label: "Wohneinheiten" },
            ].map((s) => (
              <div key={s.label} className="bg-white/5 rounded-xl px-3 py-2.5 text-center">
                <div className="text-sm font-semibold">{s.value}</div>
                <div className="text-[11px] text-white/40">{s.label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Kennzahlen */}
        <Section title="Kennzahlen">
          <KVRow label="BGF" value={`${fmtNum(bgf)} m²`} />
          <KVRow label="BRI" value={`${fmtNum(bri)} m³`} />
          <KVRow label="Grundfläche" value={`${fmtNum(gf)} m²`} />
          <KVRow label="Stellplätze" value={`${stellplaetze}`} />
          <KVRow label="Richtpreis" value={fmtPrice(kosten)} />
        </Section>

        {/* Technische Daten */}
        <Section title="Technische Daten">
          <KVRow label="Dachform" value={ROOF_LABELS[roofType]} />
          <KVRow label="Fassade" value={FACADE_LABELS[facade]} />
          <div className="flex items-center justify-between py-1">
            <span className="text-xs text-white/50">Energie</span>
            <div className="flex items-center gap-2">
              <div className="w-24 h-2 bg-white/10 rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full transition-all"
                  style={{ width: `${ratingCfg.percent}%`, backgroundColor: ratingCfg.color }}
                />
              </div>
              <span className="text-xs font-medium" style={{ color: ratingCfg.color }}>
                {building.energyRating}
              </span>
            </div>
          </div>
          <KVRow label="Standard" value={EFFICIENCY_LABELS[efficiency] ?? efficiency} />
          <KVRow label="Heizung" value={ENERGY_LABELS[energy] ?? energy} />
          <KVRow label="Technikraum" value="Ja (UG)" />
        </Section>

        {/* Tags */}
        {building.tags.length > 0 && (
          <Section title="Tags">
            <div className="flex flex-wrap gap-1.5 pt-1">
              {building.tags.map((tag) => (
                <span
                  key={tag}
                  className="bg-white/10 rounded-full text-[11px] px-2 py-0.5 text-white/70"
                >
                  {tag}
                </span>
              ))}
            </div>
          </Section>
        )}

        {/* Wohnungsmix */}
        <Section title="Wohnungsmix (pro Geschoss)">
          {mix.map((apt) => (
            <div key={apt.label} className="text-xs text-white/70 py-0.5">
              {apt.count}× {apt.label} ({apt.size}m²)
            </div>
          ))}
        </Section>

        {/* Bottom padding */}
        <div className="h-4" />
      </div>
    </div>
  );
}

// ── Small helpers ──

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="px-5 py-3 border-t border-white/10">
      <h3 className="text-[11px] font-semibold text-white/30 uppercase tracking-wider mb-2">{title}</h3>
      {children}
    </div>
  );
}

function KVRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between py-1">
      <span className="text-xs text-white/50">{label}</span>
      <span className="text-xs font-medium text-white/90">{value}</span>
    </div>
  );
}
