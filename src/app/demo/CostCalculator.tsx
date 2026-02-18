"use client";

import { useState, useMemo, useEffect } from "react";
import { ChevronDown, ChevronRight } from "lucide-react";
import type { CostData } from "./exportPDF";
import type { Baufeld, PlacedUnit, BuildingModule, Filters } from "./types";
import { InfoTooltip } from "./InfoTooltip";

/* ── Mietspiegel Data ─────────────────────────────────────── */

const MIETSPIEGEL_NEUBAU: Record<string, { bis90: [number, number, number] }> = {
  einfach: { bis90: [9.52, 10.89, 12.26] },
  mittel:  { bis90: [10.48, 12.41, 14.34] },
  gut:     { bis90: [11.94, 14.57, 17.20] },
};

/* ── Helpers ───────────────────────────────────────────────── */

function fmtEur(n: number): string {
  if (Math.abs(n) >= 1_000_000) {
    return `${(n / 1_000_000).toLocaleString("de-DE", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} Mio. €`;
  }
  return `${Math.round(n).toLocaleString("de-DE")} €`;
}

function fmtPct(n: number): string {
  return `${n.toFixed(1)}%`;
}

function betaCurve(t: number, alpha = 2, beta = 3): number {
  return Math.pow(t, alpha - 1) * Math.pow(1 - t, beta - 1);
}

/* ── Collapsible Section ──────────────────────────────────── */

function Section({
  title,
  color,
  children,
  defaultOpen = true,
}: {
  title: string;
  color: string;
  children: React.ReactNode;
  defaultOpen?: boolean;
}) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="border border-white/10 rounded-lg overflow-hidden mb-2">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center gap-2 px-3 py-2 text-xs font-semibold hover:bg-white/5 transition-colors"
        style={{ color }}
      >
        {open ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
        {title}
      </button>
      {open && <div className="px-3 pb-3">{children}</div>}
    </div>
  );
}

/* ── Editable Number Input ────────────────────────────────── */

function NumInput({
  value,
  onChange,
  suffix,
  min = 0,
  step = 0.1,
  className = "",
}: {
  value: number;
  onChange: (v: number) => void;
  suffix?: string;
  min?: number;
  step?: number;
  className?: string;
}) {
  return (
    <div className={`flex items-center gap-1 ${className}`}>
      <input
        type="number"
        value={value}
        onChange={(e) => onChange(parseFloat(e.target.value) || 0)}
        min={min}
        step={step}
        className="w-16 bg-white/5 border border-white/10 rounded px-1.5 py-0.5 text-xs text-white text-right outline-none focus:border-teal-500"
      />
      {suffix && <span className="text-[10px] text-white/40">{suffix}</span>}
    </div>
  );
}

/* ── Toggle ───────────────────────────────────────────────── */

function Toggle({
  enabled,
  onChange,
}: {
  enabled: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <button
      onClick={() => onChange(!enabled)}
      className={`w-8 h-4 rounded-full transition-colors relative ${
        enabled ? "bg-teal-500" : "bg-white/20"
      }`}
    >
      <div
        className={`w-3 h-3 rounded-full bg-white absolute top-0.5 transition-all`}
        style={{ left: enabled ? "17px" : "2px" }}
      />
    </button>
  );
}

/* ── Big Toggle Switch ────────────────────────────────────── */

function BigToggle({
  enabled,
  onChange,
}: {
  enabled: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <button
      onClick={() => onChange(!enabled)}
      className={`w-11 h-6 rounded-full transition-colors relative ${
        enabled ? "bg-teal-500" : "bg-white/20"
      }`}
    >
      <div
        className={`w-5 h-5 rounded-full bg-white absolute top-0.5 transition-all`}
        style={{ left: enabled ? "22px" : "2px" }}
      />
    </button>
  );
}

/* ── Cost Row ─────────────────────────────────────────────── */

function CostRow({
  label,
  value,
  enabled,
  onToggle,
  children,
  color = "text-white",
}: {
  label: React.ReactNode;
  value: number;
  enabled: boolean;
  onToggle: (v: boolean) => void;
  children?: React.ReactNode;
  color?: string;
}) {
  return (
    <div className="flex items-start gap-2 py-1.5">
      <Toggle enabled={enabled} onChange={onToggle} />
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between">
          <span className="text-xs text-white/70">{label}</span>
          <span className={`text-xs font-medium ${enabled ? color : "text-white/30 line-through"}`}>
            {fmtEur(value)}
          </span>
        </div>
        {children && <div className="mt-1">{children}</div>}
      </div>
    </div>
  );
}

/* ── KPI Card ─────────────────────────────────────────────── */

function KPICard({ label, value, unit, color, info }: { label: string; value: string; unit?: string; color: string; info?: { definition: string; formula?: string } }) {
  return (
    <div className="bg-[#0F172A] rounded-lg p-3 border border-white/5 text-center">
      <div className="text-lg font-bold" style={{ color }}>{value}{unit && <span className="text-sm ml-0.5">{unit}</span>}</div>
      <div className="text-[10px] text-white/40 uppercase tracking-wider mt-0.5">
        {label}
        {info && <InfoTooltip term={label} definition={info.definition} formula={info.formula} />}
      </div>
    </div>
  );
}

/* ── Cashflow Chart (SVG) ─────────────────────────────────── */

function CashflowChart({
  cashflows,
  breakEvenMonth,
  planungStart,
  planungEnde,
  baustart,
  bauende,
}: {
  cashflows: { month: number; cashOut: number; cashIn: number; cumulative: number }[];
  breakEvenMonth: number | null;
  planungStart: number;
  planungEnde: number;
  baustart: number;
  bauende: number;
}) {
  const [hoverIdx, setHoverIdx] = useState<number | null>(null);
  if (cashflows.length === 0) return null;

  const W = 600;
  const H = 150;
  const PAD_L = 30;
  const PAD_R = 10;
  const PAD_T = 10;
  const PAD_B = 20;
  const chartW = W - PAD_L - PAD_R;
  const chartH = H - PAD_T - PAD_B;

  const maxOut = Math.max(...cashflows.map(c => Math.abs(c.cashOut)), 1);
  const maxIn = Math.max(...cashflows.map(c => c.cashIn), 1);
  const maxVal = Math.max(maxOut, maxIn);
  const maxCum = Math.max(...cashflows.map(c => Math.abs(c.cumulative)), 1);

  const n = cashflows.length;
  const barW = Math.max(2, (chartW / n) * 0.7);
  const gap = chartW / n;
  const midY = PAD_T + chartH * 0.5;

  // Cumulative line points
  const cumPoints = cashflows.map((c, i) => {
    const x = PAD_L + i * gap + gap * 0.5;
    const y = midY - (c.cumulative / maxCum) * (chartH * 0.45);
    return `${x},${y}`;
  }).join(" ");

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full" style={{ height: 150 }}>
      {/* Zero line */}
      <line x1={PAD_L} y1={midY} x2={W - PAD_R} y2={midY} stroke="white" strokeOpacity={0.15} strokeWidth={0.5} />

      {/* Bars */}
      {cashflows.map((c, i) => {
        const x = PAD_L + i * gap + (gap - barW) * 0.5;
        const outH = (Math.abs(c.cashOut) / maxVal) * (chartH * 0.45);
        const inH = (c.cashIn / maxVal) * (chartH * 0.45);
        const isHovered = hoverIdx === i;
        return (
          <g key={i}>
            {/* Hover area (invisible, full height) */}
            <rect
              x={PAD_L + i * gap} y={PAD_T} width={gap} height={chartH}
              fill="transparent"
              onMouseEnter={() => setHoverIdx(i)}
              onMouseLeave={() => setHoverIdx(null)}
              style={{ cursor: "crosshair" }}
            />
            {/* Expense bar (down) */}
            {c.cashOut !== 0 && (
              <rect x={x} y={midY} width={barW} height={outH} fill="#EF4444" opacity={isHovered ? 0.9 : 0.6} rx={1} />
            )}
            {/* Income bar (up) */}
            {c.cashIn > 0 && (
              <rect x={x} y={midY - inH} width={barW} height={inH} fill="#22C55E" opacity={isHovered ? 0.9 : 0.6} rx={1} />
            )}
          </g>
        );
      })}

      {/* Hover Tooltip */}
      {hoverIdx !== null && (() => {
        const c = cashflows[hoverIdx];
        const x = Math.min(Math.max(PAD_L + hoverIdx * gap + gap * 0.5, 100), W - 120);
        const m = c.month;
        const phase = m >= planungStart && m < planungEnde ? "Planung" : m >= baustart && m < bauende ? "Bau" : "Vertrieb";
        return (
          <g>
            {/* Vertical line */}
            <line x1={PAD_L + hoverIdx * gap + gap * 0.5} y1={PAD_T} x2={PAD_L + hoverIdx * gap + gap * 0.5} y2={H - PAD_B} stroke="white" strokeOpacity={0.3} strokeWidth={0.5} strokeDasharray="2 2" />
            {/* Tooltip bg */}
            <rect x={x - 80} y={4} width={160} height={52} rx={4} fill="#0F172A" stroke="white" strokeOpacity={0.2} strokeWidth={0.5} />
            <text x={x} y={16} textAnchor="middle" fill="white" fontSize={8} fontWeight="bold">
              Monat {m} · {phase}
            </text>
            <text x={x - 72} y={28} fill="#EF4444" fontSize={7}>
              Ausgaben: {Math.round(c.cashOut).toLocaleString("de-DE")} €
            </text>
            <text x={x - 72} y={38} fill="#22C55E" fontSize={7}>
              Einnahmen: {Math.round(c.cashIn).toLocaleString("de-DE")} €
            </text>
            <text x={x - 72} y={48} fill="#94A3B8" fontSize={7}>
              Kumuliert: {Math.round(c.cumulative).toLocaleString("de-DE")} €
            </text>
          </g>
        );
      })()}

      {/* Cumulative line */}
      <polyline points={cumPoints} fill="none" stroke="#94A3B8" strokeWidth={1.5} strokeDasharray="4 2" opacity={0.7} />

      {/* Break-even marker */}
      {breakEvenMonth !== null && breakEvenMonth < n && (() => {
        const x = PAD_L + breakEvenMonth * gap + gap * 0.5;
        return (
          <g>
            <circle cx={x} cy={midY} r={4} fill="#22C55E" />
            <text x={x} y={midY - 8} textAnchor="middle" fill="#22C55E" fontSize={8} fontWeight="bold">BE</text>
          </g>
        );
      })()}

      {/* X-axis labels */}
      {cashflows.filter((_, i) => i % 6 === 0 || i === n - 1).map((c, _, arr) => {
        const i = cashflows.indexOf(c);
        const x = PAD_L + i * gap + gap * 0.5;
        return (
          <text key={i} x={x} y={H - 4} textAnchor="middle" fill="white" fillOpacity={0.3} fontSize={8}>
            {c.month}
          </text>
        );
      })}

      {/* Y labels */}
      <text x={PAD_L - 4} y={PAD_T + 8} textAnchor="end" fill="white" fillOpacity={0.2} fontSize={7}>+</text>
      <text x={PAD_L - 4} y={H - PAD_B - 2} textAnchor="end" fill="white" fillOpacity={0.2} fontSize={7}>−</text>
    </svg>
  );
}

/* ── Restschuld Chart (SVG) ────────────────────────────────── */

function RestschuldChart({
  restschuldVerlauf,
  fkVolumen,
  bauende,
}: {
  restschuldVerlauf: number[];
  fkVolumen: number;
  bauende: number;
}) {
  const [hoverIdx, setHoverIdx] = useState<number | null>(null);
  if (restschuldVerlauf.length === 0 || fkVolumen <= 0) return null;

  const W = 600;
  const H = 120;
  const PAD_L = 30;
  const PAD_R = 10;
  const PAD_T = 10;
  const PAD_B = 20;
  const chartW = W - PAD_L - PAD_R;
  const chartH = H - PAD_T - PAD_B;

  const n = restschuldVerlauf.length;
  const gap = chartW / Math.max(n - 1, 1);

  // Area fill: Restschuld (red, top) + Equity (green, bottom)
  const restPoints = restschuldVerlauf.map((rs, i) => {
    const x = PAD_L + i * gap;
    const y = PAD_T + (1 - rs / fkVolumen) * chartH;
    return `${x},${y}`;
  });

  // Equity area (filled from bottom)
  const equityPath = [
    `M ${PAD_L},${PAD_T + chartH}`,
    ...restschuldVerlauf.map((rs, i) => {
      const x = PAD_L + i * gap;
      const y = PAD_T + (rs / fkVolumen) * chartH;
      return `L ${x},${y}`;
    }),
    `L ${PAD_L + (n - 1) * gap},${PAD_T + chartH}`,
    "Z",
  ].join(" ");

  // Restschuld area (filled from top)
  const restPath = [
    `M ${PAD_L},${PAD_T}`,
    ...restschuldVerlauf.map((rs, i) => {
      const x = PAD_L + i * gap;
      const y = PAD_T + (1 - rs / fkVolumen) * chartH;
      return `L ${x},${y}`;
    }),
    `L ${PAD_L + (n - 1) * gap},${PAD_T}`,
    "Z",
  ].join(" ");

  // Year markers
  const yearMarkers: { month: number; label: string }[] = [];
  for (let m = 0; m < n; m += 12) {
    yearMarkers.push({ month: m, label: `${Math.round(m / 12)}J` });
  }

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full" style={{ height: 120 }}>
      {/* Equity area (green) */}
      <path d={equityPath} fill="#22C55E" opacity={0.2} />
      {/* Restschuld area (red/amber) */}
      <path d={restPath} fill="#F59E0B" opacity={0.15} />

      {/* Restschuld line */}
      <polyline points={restPoints.join(" ")} fill="none" stroke="#F59E0B" strokeWidth={2} opacity={0.8} />

      {/* Hover areas */}
      {restschuldVerlauf.map((_, i) => (
        <rect
          key={i}
          x={PAD_L + (i - 0.5) * gap} y={PAD_T} width={gap} height={chartH}
          fill="transparent"
          onMouseEnter={() => setHoverIdx(i)}
          onMouseLeave={() => setHoverIdx(null)}
          style={{ cursor: "crosshair" }}
        />
      ))}

      {/* Hover tooltip */}
      {hoverIdx !== null && (() => {
        const rs = restschuldVerlauf[hoverIdx];
        const eq = fkVolumen - rs;
        const x = Math.min(Math.max(PAD_L + hoverIdx * gap, 90), W - 100);
        const lineX = PAD_L + hoverIdx * gap;
        return (
          <g>
            <line x1={lineX} y1={PAD_T} x2={lineX} y2={PAD_T + chartH} stroke="white" strokeOpacity={0.3} strokeWidth={0.5} strokeDasharray="2 2" />
            <rect x={x - 70} y={4} width={140} height={42} rx={4} fill="#0F172A" stroke="white" strokeOpacity={0.2} strokeWidth={0.5} />
            <text x={x} y={16} textAnchor="middle" fill="white" fontSize={8} fontWeight="bold">
              Monat {hoverIdx} ({(hoverIdx / 12).toFixed(1)} J.)
            </text>
            <text x={x - 62} y={28} fill="#F59E0B" fontSize={7}>
              Restschuld: {Math.round(rs).toLocaleString("de-DE")} €
            </text>
            <text x={x - 62} y={38} fill="#22C55E" fontSize={7}>
              Equity: {Math.round(eq).toLocaleString("de-DE")} €
            </text>
          </g>
        );
      })()}

      {/* X-axis year labels */}
      {yearMarkers.map(({ month, label }) => (
        <text key={month} x={PAD_L + month * gap} y={H - 4} textAnchor="middle" fill="white" fillOpacity={0.3} fontSize={8}>
          {label}
        </text>
      ))}

      {/* Y labels */}
      <text x={PAD_L - 4} y={PAD_T + 8} textAnchor="end" fill="#22C55E" fillOpacity={0.4} fontSize={6}>EQ</text>
      <text x={PAD_L - 4} y={H - PAD_B - 2} textAnchor="end" fill="#F59E0B" fillOpacity={0.4} fontSize={6}>RS</text>
    </svg>
  );
}

/* ── Dual Range Slider ────────────────────────────────────── */

function DualRangeSlider({
  min,
  max,
  valueLow,
  valueHigh,
  onChangeLow,
  onChangeHigh,
  color,
}: {
  min: number;
  max: number;
  valueLow: number;
  valueHigh: number;
  onChangeLow: (v: number) => void;
  onChangeHigh: (v: number) => void;
  color: string;
}) {
  const lowPct = ((valueLow - min) / (max - min)) * 100;
  const highPct = ((valueHigh - min) / (max - min)) * 100;

  return (
    <div className="relative h-6">
      {/* Track background */}
      <div className="absolute top-2.5 left-0 right-0 h-1.5 rounded-full bg-white/10" />
      {/* Filled track */}
      <div
        className="absolute top-2.5 h-1.5 rounded-full"
        style={{
          left: `${lowPct}%`,
          width: `${highPct - lowPct}%`,
          backgroundColor: color,
        }}
      />
      {/* Low thumb label */}
      <div
        className="absolute top-[-2px] text-[9px] text-white/60 font-medium pointer-events-none"
        style={{ left: `${lowPct}%`, transform: "translateX(-50%)" }}
      >
        {valueLow}
      </div>
      {/* High thumb label */}
      <div
        className="absolute top-[-2px] text-[9px] text-white/60 font-medium pointer-events-none"
        style={{ left: `${highPct}%`, transform: "translateX(-50%)" }}
      >
        {valueHigh}
      </div>
      {/* Low range input */}
      <input
        type="range"
        min={min}
        max={max}
        value={valueLow}
        onChange={(e) => {
          const v = parseInt(e.target.value);
          if (v <= valueHigh) onChangeLow(v);
        }}
        className="absolute top-0 left-0 w-full h-6 appearance-none bg-transparent pointer-events-none [&::-webkit-slider-thumb]:pointer-events-auto [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3.5 [&::-webkit-slider-thumb]:h-3.5 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:cursor-pointer [&::-webkit-slider-thumb]:relative [&::-webkit-slider-thumb]:z-20 [&::-moz-range-thumb]:pointer-events-auto [&::-moz-range-thumb]:appearance-none [&::-moz-range-thumb]:w-3.5 [&::-moz-range-thumb]:h-3.5 [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:bg-white [&::-moz-range-thumb]:border-2 [&::-moz-range-thumb]:cursor-pointer [&::-moz-range-thumb]:relative [&::-moz-range-thumb]:z-20"
        style={{ ["--tw-border-opacity" as string]: 1, borderColor: color } as React.CSSProperties}
      />
      {/* High range input */}
      <input
        type="range"
        min={min}
        max={max}
        value={valueHigh}
        onChange={(e) => {
          const v = parseInt(e.target.value);
          if (v >= valueLow) onChangeHigh(v);
        }}
        className="absolute top-0 left-0 w-full h-6 appearance-none bg-transparent pointer-events-none [&::-webkit-slider-thumb]:pointer-events-auto [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3.5 [&::-webkit-slider-thumb]:h-3.5 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:cursor-pointer [&::-webkit-slider-thumb]:relative [&::-webkit-slider-thumb]:z-20 [&::-moz-range-thumb]:pointer-events-auto [&::-moz-range-thumb]:appearance-none [&::-moz-range-thumb]:w-3.5 [&::-moz-range-thumb]:h-3.5 [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:bg-white [&::-moz-range-thumb]:border-2 [&::-moz-range-thumb]:cursor-pointer [&::-moz-range-thumb]:relative [&::-moz-range-thumb]:z-20"
        style={{ ["--tw-border-opacity" as string]: 1, borderColor: color } as React.CSSProperties}
      />
    </div>
  );
}

/* ── Main Component ───────────────────────────────────────── */

interface Props {
  baufelder: Baufeld[];
  placedUnits: PlacedUnit[];
  buildings: BuildingModule[];
  filters: Filters;
  matchScore?: number;
  onCalcUpdate?: (data: CostData) => void;
  fullWidth?: boolean;
  hideKpi?: boolean;
}

export function CostCalculator({ baufelder, placedUnits, buildings, filters, matchScore, onCalcUpdate, fullWidth = false, hideKpi = false }: Props) {
  // Editable parameters
  const [kg200Pct, setKg200Pct] = useState(5);
  const [kg500Pct, setKg500Pct] = useState(4);
  const [kg700Pct, setKg700Pct] = useState(20);
  const [strategy, setStrategy] = useState<"hold" | "sell">(filters.strategy);
  const [mietOverride, setMietOverride] = useState<number | null>(null);
  const [verkaufOverride, setVerkaufOverride] = useState<number | null>(null);

  // Hold-spezifisch
  const [betrachtungJahre, setBetrachtungJahre] = useState(20);
  const [bewirtschaftungPct, setBewirtschaftungPct] = useState(18);
  const [mietsteigerungPa, setMietsteigerungPa] = useState(1.5);
  const [grundstueckspreisPerSqm, setGrundstueckspreisPerSqm] = useState<number | null>(null);
  const [grundstueckspreisGesamt, setGrundstueckspreisGesamt] = useState<number | null>(null);
  const [grundstueckspreisMode, setGrundstueckspreisMode] = useState<"boris" | "sqm" | "total">("boris");

  // Toggles for cost groups
  const [kg100On, setKg100On] = useState(true);
  const [kg200On, setKg200On] = useState(true);
  const [kg300On, setKg300On] = useState(true);
  const [kg500On, setKg500On] = useState(true);
  const [kg700On, setKg700On] = useState(true);

  // Finanzierung
  const [finanzierungAktiv, setFinanzierungAktiv] = useState(true);
  const [ekQuote, setEkQuote] = useState(20);
  const [zinssatz, setZinssatz] = useState(4.0);
  const [tilgung, setTilgung] = useState(2.0);
  const [bereitstellungszins, setBereitstellungszins] = useState(0.25);

  // Zeitachse (replaces bauweise + vermarktungszeit)
  const [bauzeitPreset, setBauzeitPreset] = useState<"seriell" | "konventionell" | "custom">("seriell");
  const [planungStart, setPlanungStart] = useState(0);
  const [planungEnde, setPlanungEnde] = useState(3);
  const [baustart, setBaustart] = useState(3);
  const [bauende, setBauende] = useState(9);
  const [vertriebsstart, setVertriebsstart] = useState(6);
  const [vertriebsende, setVertriebsende] = useState(15);
  const [auszahlungskurve, setAuszahlungskurve] = useState<"s-kurve" | "linear">("s-kurve");
  const [costSensitivity, setCostSensitivity] = useState(0);
  const [priceSensitivity, setPriceSensitivity] = useState(0);

  // Exit-Szenario (Hold)
  const [exitJahre, setExitJahre] = useState(20);
  const [exitRestwertPct, setExitRestwertPct] = useState(100);
  const [exitWertsteigerungPa, setExitWertsteigerungPa] = useState(1.5);
  const [exitRestwertMode, setExitRestwertMode] = useState<"auto"|"manual">("auto");
  const [exitVerkaufsNK, setExitVerkaufsNK] = useState(5);

  // Preset handlers
  const handlePreset = (preset: "seriell" | "konventionell") => {
    setBauzeitPreset(preset);
    if (preset === "seriell") {
      setPlanungStart(0); setPlanungEnde(3);
      setBaustart(3); setBauende(9);
      setVertriebsstart(6); setVertriebsende(15);
    } else {
      setPlanungStart(0); setPlanungEnde(9);
      setBaustart(9); setBauende(24);
      setVertriebsstart(18); setVertriebsende(30);
    }
  };

  const handleBaustartChange = (v: number) => {
    setBaustart(v);
    if (bauzeitPreset !== "custom") {
      const dur = bauzeitPreset === "seriell" ? 6 : 15;
      setBauende(v + dur);
    }
    setBauzeitPreset("custom");
  };

  const handleBauendeChange = (v: number) => {
    setBauende(v);
    setBauzeitPreset("custom");
  };

  // IRR solver (Newton-Raphson with bisection fallback)
  function computeIRR(cashflows: number[], guess = 0.1, maxIter = 100, tol = 1e-7): number | null {
    let rate = guess;
    for (let i = 0; i < maxIter; i++) {
      let npv = 0, dnpv = 0;
      for (let t = 0; t < cashflows.length; t++) {
        const disc = Math.pow(1 + rate, t);
        npv += cashflows[t] / disc;
        dnpv -= t * cashflows[t] / Math.pow(1 + rate, t + 1);
      }
      if (Math.abs(dnpv) < 1e-12) break;
      const newRate = rate - npv / dnpv;
      if (Math.abs(newRate - rate) < tol) return newRate * 100;
      rate = newRate;
    }
    let lo = -0.5, hi = 5.0;
    for (let i = 0; i < 200; i++) {
      const mid = (lo + hi) / 2;
      let npv = 0;
      for (let t = 0; t < cashflows.length; t++) npv += cashflows[t] / Math.pow(1 + mid, t);
      if (npv > 0) lo = mid; else hi = mid;
      if (hi - lo < tol) return mid * 100;
    }
    return null;
  }

  const calc = useMemo(() => {
    // KG 300+400: Baukosten
    const kg300 = placedUnits.reduce((sum, u) => {
      const b = buildings.find((bb) => bb.id === u.buildingId);
      if (!b) return sum;
      return sum + b.pricePerSqm * u.area;
    }, 0);

    // Total BGF
    const totalBGF = placedUnits.reduce((s, u) => s + u.area, 0);
    const totalWohnflaeche = placedUnits.reduce((s, u) => s + Math.round(u.area * (u.wfEffizienz || 75) / 100), 0);

    // KG 100: Grundstück
    const totalGrundstuecksflaeche = baufelder.reduce((s, bf) => s + bf.grundstuecksflaecheM2, 0);
    let kg100: number;
    if (grundstueckspreisMode === "total" && grundstueckspreisGesamt !== null) {
      kg100 = grundstueckspreisGesamt;
    } else if (grundstueckspreisMode === "sqm" && grundstueckspreisPerSqm !== null) {
      kg100 = grundstueckspreisPerSqm * totalGrundstuecksflaeche;
    } else {
      kg100 = baufelder.reduce((sum, bf) => {
        return sum + (bf.borisBodenrichtwert || 0) * bf.grundstuecksflaecheM2;
      }, 0);
    }
    const effectivePerSqm = totalGrundstuecksflaeche > 0 ? kg100 / totalGrundstuecksflaeche : 0;

    // KG 200
    const kg200 = kg300 * (kg200Pct / 100);

    // KG 500
    const kg500 = kg300 * (kg500Pct / 100);

    // KG 700 with match score adjustment
    let kg700BasePct = kg700Pct;
    if (matchScore !== undefined) {
      if (matchScore < 5) kg700BasePct += 10;
      else if (matchScore < 7) kg700BasePct += 5;
    }
    const kg700 = kg300 * (kg700BasePct / 100);

    // Sum KGs (ohne Finanzierung)
    const sumKG =
      (kg100On ? kg100 : 0) +
      (kg200On ? kg200 : 0) +
      (kg300On ? kg300 : 0) +
      (kg500On ? kg500 : 0) +
      (kg700On ? kg700 : 0);

    // Finanzierung
    const bauzeit = Math.max(1, bauende - baustart);
    const fkQuote = (100 - ekQuote) / 100;
    const ekQuoteDec = ekQuote / 100;
    const fkVolumen = sumKG * fkQuote;
    const ekBedarf = sumKG * ekQuoteDec;

    // Bauzeitfinanzierung
    const bauzinsen = fkVolumen * 0.5 * (zinssatz / 100) * (bauzeit / 12);
    const bereitstellungszinsenVal = fkVolumen * 0.5 * (bereitstellungszins / 100) * bauzeit;
    const finKostenBau = bauzinsen + bereitstellungszinsenVal;

    // Annuität
    const annuitaetJahr = fkVolumen * ((zinssatz + tilgung) / 100);
    const monatlicheRate = annuitaetJahr / 12;

    const gesamtkosten = sumKG + (finanzierungAktiv ? finKostenBau : 0);

    // Erlöse
    const defaultMiete = (() => {
      const wl = baufelder[0]?.wohnlage?.toLowerCase().trim();
      const m = wl ? MIETSPIEGEL_NEUBAU[wl] : null;
      return m ? m.bis90[1] : 12.41;
    })();

    const mieteProM2 = mietOverride ?? defaultMiete;
    const jahresmiete = mieteProM2 * totalWohnflaeche * 12;

    const defaultVerkauf = totalWohnflaeche > 0 ? (kg300 * 1.35) / totalWohnflaeche : 4500;
    const verkaufProM2 = verkaufOverride ?? defaultVerkauf;
    const verkaufserloes = verkaufProM2 * totalWohnflaeche;

    // Gesamtlaufzeit
    const gesamtlaufzeitMonate = strategy === "hold"
      ? Math.max(bauende, vertriebsende, planungStart + betrachtungJahre * 12)
      : Math.max(bauende, vertriebsende);

    // Planungshonorare: 60% von KG700 in Planungsphase, 40% in Bauphase
    const planungsDauer = Math.max(1, planungEnde - planungStart);
    const kg700Planung = kg700 * 0.6;
    const kg700Bau = kg700 * 0.4;

    // Bewirtschaftungskosten (Hold)
    const bewirtschaftungMonatlich = jahresmiete * (bewirtschaftungPct / 100) / 12;

    // ── Monthly Cashflows ──
    const totalMonths = gesamtlaufzeitMonate;
    const monthlyCashflows: { month: number; cashOut: number; cashIn: number; cumulative: number }[] = [];

    // Build cost distribution (KG200-500 + 40% KG700) over baustart..bauende
    const baukostenOhnGrund = (kg200On ? kg200 : 0) + (kg300On ? kg300 : 0) + (kg500On ? kg500 : 0) + (kg700On ? kg700Bau : 0);
    const finKostenMonatlich = finanzierungAktiv ? finKostenBau / Math.max(1, bauzeit) : 0;

    // Precompute distribution weights for Bauphase
    const weights: number[] = [];
    let weightSum = 0;
    for (let m = baustart; m < bauende; m++) {
      const t = bauzeit > 1 ? (m - baustart) / (bauzeit - 1) : 0.5;
      const w = auszahlungskurve === "s-kurve" ? betaCurve(t) : 1;
      weights.push(w);
      weightSum += w;
    }

    // Restschuld-Tracking (Hold)
    let restschuld = fkVolumen;
    const restschuldVerlauf: number[] = [];

    let cumulative = 0;
    for (let m = 0; m < totalMonths; m++) {
      let cashOut = 0;
      let cashIn = 0;

      // KG100 (Grundstück) at planungStart
      if (m === planungStart && kg100On) {
        cashOut += kg100;
      }

      // Planungshonorare (60% KG700) distributed over Planungsphase
      if (kg700On && m >= planungStart && m < planungEnde) {
        cashOut += kg700Planung / planungsDauer;
      }

      // Baukosten distributed over Bauphase
      if (m >= baustart && m < bauende) {
        const idx = m - baustart;
        const frac = weightSum > 0 ? weights[idx] / weightSum : 0;
        cashOut += baukostenOhnGrund * frac;
        cashOut += finKostenMonatlich;
      }

      if (strategy === "hold") {
        // Mietsteigerung: jährlich ab Vertriebsende
        const yearsAfterStart = m >= vertriebsende ? Math.floor((m - vertriebsende) / 12) : 0;
        const steigerungsFaktor = Math.pow(1 + mietsteigerungPa / 100, yearsAfterStart);
        const aktuelleMieteMonat = (jahresmiete / 12) * steigerungsFaktor;

        // Vermietungsphase: lineare Vermietung
        if (m >= vertriebsstart && m < vertriebsende) {
          const vertriebsDauer = Math.max(1, vertriebsende - vertriebsstart);
          const progress = (m - vertriebsstart + 1) / vertriebsDauer;
          cashIn += aktuelleMieteMonat * progress;
          // Bewirtschaftung proportional zur Belegung
          cashOut += bewirtschaftungMonatlich * progress * steigerungsFaktor;
        } else if (m >= vertriebsende) {
          cashIn += aktuelleMieteMonat;
          cashOut += bewirtschaftungMonatlich * steigerungsFaktor;
        }

        // Laufende Annuität ab Bauende (Kredit läuft weiter!)
        if (finanzierungAktiv && m >= bauende && restschuld > 0) {
          const monatszins = zinssatz / 100 / 12;
          const zinsanteil = restschuld * monatszins;
          const tilgungsanteil = Math.min(monatlicheRate - zinsanteil, restschuld);
          cashOut += monatlicheRate;
          restschuld = Math.max(0, restschuld - tilgungsanteil);
        }
      } else {
        // Sell: sigmoid distribution over vertriebsstart..vertriebsende
        if (m >= vertriebsstart && m < vertriebsende) {
          const vertriebsDauer = Math.max(1, vertriebsende - vertriebsstart);
          const t = vertriebsDauer > 1 ? (m - vertriebsstart) / (vertriebsDauer - 1) : 0.5;
          const w = betaCurve(t, 2, 2);
          let sellWeightSum = 0;
          for (let sm = vertriebsstart; sm < vertriebsende; sm++) {
            const st = vertriebsDauer > 1 ? (sm - vertriebsstart) / (vertriebsDauer - 1) : 0.5;
            sellWeightSum += betaCurve(st, 2, 2);
          }
          cashIn += sellWeightSum > 0 ? verkaufserloes * (w / sellWeightSum) : 0;
        }
      }

      restschuldVerlauf.push(restschuld);
      cumulative += cashIn - cashOut;
      monthlyCashflows.push({ month: m, cashOut, cashIn, cumulative });
    }

    // Break-even & peak capital
    let breakEvenMonth: number | null = null;
    let peakCapital = 0;
    for (const cf of monthlyCashflows) {
      if (cf.cumulative < peakCapital) peakCapital = cf.cumulative;
      if (breakEvenMonth === null && cf.cumulative >= 0 && cf.month > baustart) {
        breakEvenMonth = cf.month;
      }
    }

    // Restschuld am Ende
    const restschuldEnde = restschuldVerlauf.length > 0 ? restschuldVerlauf[restschuldVerlauf.length - 1] : fkVolumen;
    const equityBuildup = fkVolumen - restschuldEnde;

    // ── KPIs ──

    // Hold KPIs
    const nettomieteJahr = jahresmiete * (1 - bewirtschaftungPct / 100);
    const niy = sumKG > 0 ? (nettomieteJahr / sumKG) * 100 : 0; // NIY auf Investitionskosten (ohne Finanzierung)

    const coc = finanzierungAktiv && ekBedarf > 0
      ? ((nettomieteJahr - annuitaetJahr) / ekBedarf) * 100
      : (ekBedarf > 0 ? (nettomieteJahr / ekBedarf) * 100 : null);

    const dscr = finanzierungAktiv && annuitaetJahr > 0
      ? nettomieteJahr / annuitaetJahr
      : null;

    const irrHold = (() => {
      if (sumKG <= 0) return 0;
      return (nettomieteJahr / sumKG) * 100;
    })();

    // Exit value at end of Exit-Zeitraum
    const exitWert = exitRestwertMode === "auto"
      ? gesamtkosten * Math.pow(1 + exitWertsteigerungPa / 100, exitJahre)
      : gesamtkosten * (exitRestwertPct / 100);
    const exitNK = exitWert * (exitVerkaufsNK / 100);
    const exitErloes = exitWert - exitNK;

    // Build annual cashflows for IRR (levered)
    const annualCashflowsHold: number[] = [];
    annualCashflowsHold.push(-ekBedarf);
    for (let y = 1; y <= exitJahre; y++) {
      const steigerung = Math.pow(1 + mietsteigerungPa / 100, y - 1);
      const nettoMiete = nettomieteJahr * steigerung;
      let cf = finanzierungAktiv ? nettoMiete - annuitaetJahr : nettoMiete;
      if (y === exitJahre) {
        let rs = fkVolumen;
        for (let m = 0; m < y * 12; m++) {
          const monatszins = zinssatz / 100 / 12;
          const zinsanteil = rs * monatszins;
          const tilgungsanteil = Math.min(monatlicheRate - zinsanteil, rs);
          rs = Math.max(0, rs - tilgungsanteil);
        }
        cf += exitErloes - (finanzierungAktiv ? rs : 0);
      }
      annualCashflowsHold.push(cf);
    }
    const irrHoldLevered = computeIRR(annualCashflowsHold);

    // Unlevered IRR
    const annualCashflowsUnlevered: number[] = [-sumKG];
    for (let y = 1; y <= exitJahre; y++) {
      const steigerung = Math.pow(1 + mietsteigerungPa / 100, y - 1);
      let cf = nettomieteJahr * steigerung;
      if (y === exitJahre) cf += exitErloes;
      annualCashflowsUnlevered.push(cf);
    }
    const irrHoldUnlevered = computeIRR(annualCashflowsUnlevered);

    // Multiple on Equity
    const totalCashflowsHold = annualCashflowsHold.reduce((s, v) => s + v, 0);
    const multipleOnEquity = ekBedarf > 0 ? (totalCashflowsHold + ekBedarf) / ekBedarf : 0;
    // Total Profit
    const totalProfitHold = annualCashflowsHold.reduce((s, v) => s + v, 0);
    // Avg Cash Yield
    const avgCashYield = ekBedarf > 0 && exitJahre > 0
      ? (annualCashflowsHold.slice(1, -1).reduce((s,v) => s+v, 0) / Math.max(1, exitJahre - 1)) / ekBedarf * 100
      : 0;

    // Sell KPIs
    const marge = gesamtkosten > 0 ? ((verkaufserloes - gesamtkosten) / gesamtkosten) * 100 : 0;

    const ekRenditeSell = finanzierungAktiv && ekBedarf > 0
      ? ((verkaufserloes - gesamtkosten) / ekBedarf) * 100
      : null;

    const irrSell = (() => {
      const sellLaufzeit = Math.max(bauende, vertriebsende);
      if (finanzierungAktiv && ekRenditeSell !== null) {
        if (sellLaufzeit <= 0) return 0;
        return (Math.pow(1 + ekRenditeSell / 100, 12 / sellLaufzeit) - 1) * 100;
      }
      const years = sellLaufzeit / 12;
      if (years <= 0 || gesamtkosten <= 0) return 0;
      return (Math.pow(1 + marge / 100, 1 / years) - 1) * 100;
    })();

    const grundstuecksanteil = gesamtkosten > 0 ? (kg100 / gesamtkosten) * 100 : 0;
    const baukostenProM2 = totalBGF > 0 ? kg300 / totalBGF : 0;

    return {
      kg100, kg200, kg300, kg500, kg700, kg700BasePct,
      sumKG, gesamtkosten, totalBGF, totalWohnflaeche, bauzeit,
      fkVolumen, ekBedarf, bauzinsen,
      bereitstellungszinsen: bereitstellungszinsenVal,
      finKostenBau, annuitaetJahr, monatlicheRate,
      defaultMiete, mieteProM2, jahresmiete,
      defaultVerkauf, verkaufProM2, verkaufserloes,
      niy, marge, irrSell, irrHold,
      coc, ekRenditeSell, dscr,
      gesamtlaufzeitMonate,
      grundstuecksanteil, baukostenProM2,
      monthlyCashflows, breakEvenMonth, peakCapital,
      effectivePerSqm, totalGrundstuecksflaeche,
      restschuldEnde, equityBuildup, nettomieteJahr, restschuldVerlauf,
      exitWert, exitNK, exitErloes,
      irrHoldLevered, irrHoldUnlevered, multipleOnEquity, totalProfitHold, avgCashYield,
    };
  }, [baufelder, placedUnits, buildings, kg200Pct, kg500Pct, kg700Pct, zinssatz, tilgung, bereitstellungszins, planungStart, planungEnde, baustart, bauende, vertriebsstart, vertriebsende, auszahlungskurve, matchScore, kg100On, kg200On, kg300On, kg500On, kg700On, finanzierungAktiv, ekQuote, mietOverride, verkaufOverride, strategy, grundstueckspreisPerSqm, grundstueckspreisGesamt, grundstueckspreisMode, betrachtungJahre, bewirtschaftungPct, mietsteigerungPa, exitRestwertPct, exitWertsteigerungPa, exitRestwertMode, exitVerkaufsNK, exitJahre]);

  // Push calc data to parent
  useEffect(() => {
    if (onCalcUpdate && (baufelder.length > 0 || placedUnits.length > 0)) {
      onCalcUpdate({
        kg100: calc.kg100,
        kg200: calc.kg200,
        kg300: calc.kg300,
        kg500: calc.kg500,
        kg700: calc.kg700,
        finanz: calc.finKostenBau,
        gesamtkosten: calc.gesamtkosten,
        ekBedarf: calc.ekBedarf,
        fkVolumen: calc.fkVolumen,
        bauzinsen: calc.bauzinsen,
        bereitstellungszinsen: calc.bereitstellungszinsen,
        annuitaetJahr: calc.annuitaetJahr,
        monatlicheRate: calc.monatlicheRate,
        zinssatz: zinssatz,
        tilgung: tilgung,
        ekQuote: ekQuote,
        bauzeit: calc.bauzeit,
        gesamtlaufzeit: calc.gesamtlaufzeitMonate,
        jahresmiete: calc.jahresmiete,
        verkaufserloes: calc.verkaufserloes,
        mieteProM2: calc.mieteProM2,
        verkaufProM2: calc.verkaufProM2,
        strategy: strategy,
        niy: calc.niy,
        marge: calc.marge,
        cashOnCash: calc.coc ?? 0,
        ekRenditeSell: calc.ekRenditeSell ?? 0,
        irrSell: calc.irrSell,
        irrHold: calc.irrHold,
        dscr: calc.dscr,
        grundstuecksanteil: calc.grundstuecksanteil,
        baukostenProM2: calc.baukostenProM2,
        monthlyCashflows: calc.monthlyCashflows,
        breakEvenMonth: calc.breakEvenMonth,
        peakCapital: calc.peakCapital,
        baustart,
        bauende,
        vertriebsstart,
        vertriebsende,
        irrHoldLevered: calc.irrHoldLevered,
        irrHoldUnlevered: calc.irrHoldUnlevered,
        multipleOnEquity: calc.multipleOnEquity,
        totalProfitHold: calc.totalProfitHold,
        avgCashYield: calc.avgCashYield,
        restschuldEnde: calc.restschuldEnde,
        equityBuildup: calc.equityBuildup,
        nettomieteJahr: calc.nettomieteJahr,
        exitWert: calc.exitWert,
        exitErloes: calc.exitErloes,
        bewirtschaftungPct,
        betrachtungJahre,
        finanzierungAktiv,
      });
    }
  }, [calc, onCalcUpdate, baufelder.length, placedUnits.length, zinssatz, tilgung, ekQuote, strategy, baustart, bauende, vertriebsstart, vertriebsende, bewirtschaftungPct, betrachtungJahre, finanzierungAktiv]);

  if (baufelder.length === 0 && placedUnits.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-center px-4 py-12">
        <div className="text-4xl mb-3">📊</div>
        <div className="text-sm text-white/50">Zeichne ein Baufeld und platziere Gebäude,</div>
        <div className="text-sm text-white/50">um die Wirtschaftlichkeit zu berechnen.</div>
      </div>
    );
  }

  const fkQuoteVal = 100 - ekQuote;
  const vertriebsDauer = Math.max(0, vertriebsende - vertriebsstart);

  /* ── Section Variables for fullWidth 2-column layout ── */

  const kostengruppenSection = (
    <Section title="Kosten" color="#F59E0B">
        <CostRow label={<>KG 100 · Grundstück<InfoTooltip term="KG100" definition="Kostengruppe 100 — Grundstück (nach DIN 276)." /></>} value={calc.kg100} enabled={kg100On} onToggle={setKg100On}>
          <div className="space-y-2">
            {/* Zwei editierbare Felder: €/m² und Gesamtpreis */}
            <div className="grid grid-cols-2 gap-2">
              <div>
                <div className="text-[9px] text-white/40 mb-0.5">€/m²</div>
                <input
                  type="number"
                  value={grundstueckspreisMode === "sqm" && grundstueckspreisPerSqm !== null ? grundstueckspreisPerSqm : grundstueckspreisMode === "boris" ? "" : ""}
                  placeholder={`${Math.round(calc.effectivePerSqm).toLocaleString("de-DE")}`}
                  onChange={(e) => {
                    if (e.target.value) {
                      setGrundstueckspreisPerSqm(Number(e.target.value));
                      setGrundstueckspreisMode("sqm");
                      setGrundstueckspreisGesamt(null);
                    } else {
                      setGrundstueckspreisPerSqm(null);
                      setGrundstueckspreisMode("boris");
                    }
                  }}
                  className="w-full bg-white/10 border border-white/20 rounded px-2 py-1 text-[11px] text-white placeholder-white/30 focus:border-teal-500/50 focus:outline-none"
                />
              </div>
              <div>
                <div className="text-[9px] text-white/40 mb-0.5">Kaufpreis gesamt</div>
                <input
                  type="number"
                  value={grundstueckspreisMode === "total" && grundstueckspreisGesamt !== null ? grundstueckspreisGesamt : ""}
                  placeholder={`${Math.round(calc.kg100).toLocaleString("de-DE")}`}
                  onChange={(e) => {
                    if (e.target.value) {
                      setGrundstueckspreisGesamt(Number(e.target.value));
                      setGrundstueckspreisMode("total");
                      setGrundstueckspreisPerSqm(null);
                    } else {
                      setGrundstueckspreisGesamt(null);
                      setGrundstueckspreisMode("boris");
                    }
                  }}
                  className="w-full bg-white/10 border border-white/20 rounded px-2 py-1 text-[11px] text-white placeholder-white/30 focus:border-teal-500/50 focus:outline-none"
                />
              </div>
            </div>
            <div className="flex items-center justify-between text-[10px]">
              <span className="text-white/30">
                {calc.totalGrundstuecksflaeche.toLocaleString("de-DE")} m² · {Math.round(calc.effectivePerSqm).toLocaleString("de-DE")} €/m²
                {grundstueckspreisMode === "boris" ? " (BORIS)" : " (manuell)"}
              </span>
              {grundstueckspreisMode !== "boris" && (
                <button
                  onClick={() => { setGrundstueckspreisMode("boris"); setGrundstueckspreisPerSqm(null); setGrundstueckspreisGesamt(null); }}
                  className="text-[9px] text-teal-400/60 hover:text-teal-400"
                >
                  ↺ BORIS
                </button>
              )}
            </div>
          </div>
        </CostRow>

        <CostRow label={<>KG 200 · Herrichten &amp; Erschließen<InfoTooltip term="KG200" definition="Kostengruppe 200 — Vorbereitende Maßnahmen, Herrichten, Erschließen." /></>} value={calc.kg200} enabled={kg200On} onToggle={setKg200On}>
          <NumInput value={kg200Pct} onChange={setKg200Pct} suffix="% der Baukosten" step={1} />
        </CostRow>

        <CostRow label={<>KG 300+400 · Gebäude + Technik<InfoTooltip term="KG300" definition="Kostengruppe 300 — Bauwerk / Baukonstruktionen (Rohbau + Ausbau)." /></>} value={calc.kg300} enabled={kg300On} onToggle={setKg300On}>
          <div className="text-[10px] text-white/30">{placedUnits.length} Gebäude · {calc.totalBGF.toLocaleString("de-DE")} m² BGF<InfoTooltip term="BGF" definition="Bruttogrundfläche — gesamte Geschossfläche inkl. Wände, Treppenhäuser, Technik." /> · {calc.totalWohnflaeche.toLocaleString("de-DE")} m² WF<InfoTooltip term="WF" definition="Wohnfläche — nutzbare Wohnfläche (ca. 75% der BGF bei Wohnbau)." /> (75%)</div>
        </CostRow>

        <CostRow label={<>KG 500 · Außenanlagen<InfoTooltip term="KG500" definition="Kostengruppe 500 — Außenanlagen." /></>} value={calc.kg500} enabled={kg500On} onToggle={setKg500On}>
          <NumInput value={kg500Pct} onChange={setKg500Pct} suffix="% der Baukosten" step={1} />
        </CostRow>

        <CostRow label={<>KG 700 · Baunebenkosten<InfoTooltip term="KG700" definition="Kostengruppe 700 — Baunebenkosten (Planung, Honorare, Genehmigungen)." /></>} value={calc.kg700} enabled={kg700On} onToggle={setKg700On}>
          <div className="flex items-center gap-2">
            <NumInput value={kg700Pct} onChange={setKg700Pct} suffix="%" step={1} />
            {matchScore !== undefined && calc.kg700BasePct > kg700Pct && (
              <span className="text-[10px] text-amber-400">+{calc.kg700BasePct - kg700Pct}% Match-Zuschlag</span>
            )}
          </div>
        </CostRow>

        {/* Zwischensumme KG */}
        <div className="border-t border-white/10 pt-2 mt-2">
          <div className="flex justify-between items-center">
            <span className="text-xs text-white/50">Σ Kostengruppen</span>
            <span className="text-xs font-medium text-white/70">{fmtEur(calc.sumKG)}</span>
          </div>
        </div>

        {/* Finanzierungskosten Bau (wenn aktiv) */}
        {finanzierungAktiv && (
          <div className="mt-1">
            <div className="flex justify-between items-center">
              <span className="text-xs text-white/50">+ Finanzierungskosten Bau</span>
              <span className="text-xs font-medium text-amber-400">{fmtEur(calc.finKostenBau)}</span>
            </div>
          </div>
        )}

        {/* Gesamtkosten */}
        <div className="mt-3 p-3 bg-[#0F172A] rounded-lg border border-amber-500/20">
          <div className="flex justify-between items-center">
            <span className="text-xs font-bold text-amber-400">Gesamtkosten</span>
            <span className="text-sm font-bold text-amber-400">
              {costSensitivity !== 0 && strategy === "sell" ? (
                <>{fmtEur(calc.gesamtkosten * (1 + costSensitivity / 100))} <span className="text-[9px] text-white/40">({costSensitivity > 0 ? "+" : ""}{costSensitivity}%)</span></>
              ) : fmtEur(calc.gesamtkosten)}
            </span>
          </div>
        </div>
    </Section>
  );

  const finanzierungSection = (
    <div className="border border-white/10 rounded-lg overflow-hidden mb-2">
        <div className="flex items-center justify-between px-3 py-2">
          <span className="text-xs font-semibold" style={{ color: "#FBBF24" }}>
            🏦 Finanzierung{!finanzierungAktiv && ": Aus"}
          </span>
          <BigToggle enabled={finanzierungAktiv} onChange={setFinanzierungAktiv} />
        </div>

        {finanzierungAktiv && (
          <div className="px-3 pb-3 space-y-3">
            {/* EK/FK Bar */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <span className="text-[10px] text-white/50">EK<InfoTooltip term="EK" definition="Eigenkapital — dein eigener Kapitaleinsatz." /> {ekQuote}% / FK<InfoTooltip term="FK" definition="Fremdkapital — Kreditfinanzierung." /> {fkQuoteVal}%</span>
              </div>
              <div className="flex h-3 rounded-full overflow-hidden">
                <div className="bg-teal-500 transition-all" style={{ width: `${ekQuote}%` }} />
                <div className="bg-amber-500 transition-all" style={{ width: `${fkQuoteVal}%` }} />
              </div>
              <div className="flex justify-between mt-1">
                <span className="text-[10px] text-teal-400">{fmtEur(calc.ekBedarf)}</span>
                <span className="text-[10px] text-amber-400">{fmtEur(calc.fkVolumen)}</span>
              </div>
            </div>

            {/* Inputs */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs text-white/70">Eigenkapitalquote</span>
                <NumInput value={ekQuote} onChange={(v) => setEkQuote(Math.max(5, Math.min(100, v)))} suffix="%" step={5} min={5} />
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-white/70">Zinssatz p.a.</span>
                <NumInput value={zinssatz} onChange={setZinssatz} suffix="%" step={0.25} />
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-white/70">Tilgung p.a.</span>
                <NumInput value={tilgung} onChange={setTilgung} suffix="%" step={0.5} />
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-white/70">Bereitstellungszins</span>
                <NumInput value={bereitstellungszins} onChange={setBereitstellungszins} suffix="%/Mo" step={0.05} />
              </div>
            </div>

            {/* Berechnete Werte */}
            <div className="bg-white/5 rounded-lg p-2.5 space-y-1.5">
              <div className="text-[10px] text-white/40 uppercase tracking-wider mb-1">Berechnete Werte</div>
              <div className="flex justify-between">
                <span className="text-[10px] text-white/50">Bauzinsen</span>
                <span className="text-[10px] text-white/80">{fmtEur(calc.bauzinsen)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[10px] text-white/50">Bereitstellungszinsen</span>
                <span className="text-[10px] text-white/80">{fmtEur(calc.bereitstellungszinsen)}</span>
              </div>
              <div className="flex justify-between border-t border-white/10 pt-1">
                <span className="text-[10px] text-amber-400 font-semibold">Finanzierungskosten Bau</span>
                <span className="text-[10px] text-amber-400 font-semibold">{fmtEur(calc.finKostenBau)}</span>
              </div>
              <div className="flex justify-between border-t border-white/10 pt-1 mt-1">
                <span className="text-[10px] text-white/50">Annuität / Jahr</span>
                <span className="text-[10px] text-white/80">{fmtEur(calc.annuitaetJahr)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[10px] text-white/50">Monatliche Rate</span>
                <span className="text-[10px] text-white/80">{fmtEur(calc.monatlicheRate)}</span>
              </div>
            </div>
          </div>
        )}
    </div>
  );

  const zeitachseSection = (
    <Section title="📅 Zeitachse" color="#0D9488">
        {/* Preset buttons */}
        <div className="flex gap-1 mb-3">
          {(["seriell", "konventionell", "custom"] as const).map(p => (
            <button
              key={p}
              onClick={() => p !== "custom" ? handlePreset(p) : setBauzeitPreset("custom")}
              className={`px-2.5 py-1 text-[10px] rounded-md transition-colors ${
                bauzeitPreset === p ? "bg-teal-600 text-white" : "bg-white/5 text-white/40 hover:bg-white/10"
              }`}
            >
              {p === "seriell" ? "Seriell (3+6M)" : p === "konventionell" ? "Konv. (9+15M)" : "Custom"}
            </button>
          ))}
        </div>

        {/* Dual Range Sliders */}
        <div className="space-y-4">
          {/* Planung Range Slider */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-[10px] text-white/50 font-semibold">📐 Planung</span>
              <span className="text-[10px] text-white/70">{planungStart} – {planungEnde} Mo.</span>
            </div>
            <DualRangeSlider
              min={0} max={48}
              valueLow={planungStart} valueHigh={planungEnde}
              onChangeLow={(v) => { setPlanungStart(v); setBauzeitPreset("custom"); }}
              onChangeHigh={(v) => { setPlanungEnde(v); setBauzeitPreset("custom"); }}
              color="#8B5CF6"
            />
          </div>

          {/* Bau Range Slider */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-[10px] text-white/50 font-semibold">🏗 Bau</span>
              <span className="text-[10px] text-white/70">{baustart} – {bauende} Mo.</span>
            </div>
            <DualRangeSlider
              min={0} max={48}
              valueLow={baustart} valueHigh={bauende}
              onChangeLow={handleBaustartChange} onChangeHigh={handleBauendeChange}
              color="#0D9488"
            />
          </div>

          {/* Vertrieb Range Slider */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-[10px] text-white/50 font-semibold">📢 Vertrieb</span>
              <span className="text-[10px] text-white/70">{vertriebsstart} – {vertriebsende} Mo.</span>
            </div>
            <DualRangeSlider
              min={0} max={48}
              valueLow={vertriebsstart} valueHigh={vertriebsende}
              onChangeLow={setVertriebsstart} onChangeHigh={setVertriebsende}
              color="#22C55E"
            />
          </div>
        </div>

        {/* Mini Timeline (Gantt) */}
        <div className="mt-4 bg-white/5 rounded-lg p-3">
          <div className="text-[10px] text-white/40 uppercase tracking-wider mb-2">Timeline</div>
          <div className="space-y-1.5">
            {/* Planung bar */}
            <div className="flex items-center gap-2">
              <span className="text-[10px] text-white/50 w-12 shrink-0">Planung</span>
              <div className="flex-1 h-5 relative bg-white/5 rounded">
                <div
                  className="absolute top-0 h-full rounded"
                  style={{
                    left: `${(planungStart / 48) * 100}%`,
                    width: `${((planungEnde - planungStart) / 48) * 100}%`,
                    backgroundColor: "#8B5CF6",
                    opacity: 0.8,
                  }}
                />
              </div>
            </div>
            {/* Bau bar */}
            <div className="flex items-center gap-2">
              <span className="text-[10px] text-white/50 w-12 shrink-0">Bau</span>
              <div className="flex-1 h-5 relative bg-white/5 rounded">
                <div
                  className="absolute top-0 h-full rounded"
                  style={{
                    left: `${(baustart / 48) * 100}%`,
                    width: `${((bauende - baustart) / 48) * 100}%`,
                    backgroundColor: "#0D9488",
                    opacity: 0.8,
                  }}
                />
              </div>
            </div>
            {/* Vertrieb bar */}
            <div className="flex items-center gap-2">
              <span className="text-[10px] text-white/50 w-12 shrink-0">Vertrieb</span>
              <div className="flex-1 h-5 relative bg-white/5 rounded">
                <div
                  className="absolute top-0 h-full rounded"
                  style={{
                    left: `${(vertriebsstart / 48) * 100}%`,
                    width: `${((vertriebsende - vertriebsstart) / 48) * 100}%`,
                    backgroundColor: "#22C55E",
                    opacity: 0.8,
                  }}
                />
              </div>
            </div>
            {/* Overlap bar */}
            {(() => {
              const oStart = Math.max(baustart, vertriebsstart);
              const oEnd = Math.min(bauende, vertriebsende);
              if (oEnd <= oStart) return null;
              return (
                <div className="flex items-center gap-2">
                  <span className="text-[10px] text-white/30 w-12 shrink-0">Overlap</span>
                  <div className="flex-1 h-5 relative bg-white/5 rounded">
                    <div
                      className="absolute top-0 h-full rounded"
                      style={{
                        left: `${(oStart / 48) * 100}%`,
                        width: `${((oEnd - oStart) / 48) * 100}%`,
                        background: "repeating-linear-gradient(45deg, #0D9488, #0D9488 4px, #22C55E 4px, #22C55E 8px)",
                        opacity: 0.6,
                      }}
                    />
                  </div>
                </div>
              );
            })()}
          </div>
          {/* X-axis labels */}
          <div className="flex items-center gap-2 mt-1">
            <div className="w-12 shrink-0" />
            <div className="flex-1 flex justify-between">
              {[0, 6, 12, 18, 24, 30, 36, 42, 48].map(m => (
                <span key={m} className="text-[8px] text-white/30">{m}</span>
              ))}
            </div>
          </div>
        </div>

        {/* Ausgaben-Kurve */}
        <div className="flex items-center gap-2 mt-3 mb-2">
          <span className="text-[10px] text-white/50">Ausgaben-Kurve:</span>
          <div className="flex rounded-md overflow-hidden border border-white/10">
            {(["s-kurve", "linear"] as const).map(k => (
              <button
                key={k}
                onClick={() => setAuszahlungskurve(k)}
                className={`px-2 py-0.5 text-[10px] transition-colors ${
                  auszahlungskurve === k ? "bg-teal-600 text-white" : "bg-white/5 text-white/40 hover:bg-white/10"
                }`}
              >
                {k === "s-kurve" ? "S-Kurve" : "Linear"}
              </button>
            ))}
          </div>
        </div>

        {/* Summary */}
        <div className="text-[10px] text-white/40 mt-2">
          Bauzeit {calc.bauzeit} Mo. · {strategy === "hold" ? `Betrachtung ${betrachtungJahre} J.` : `Vertrieb ${vertriebsDauer} Mo.`} · Gesamt {calc.gesamtlaufzeitMonate} Mo.
        </div>

        {/* Cashflow Chart */}
        <div className="mt-3 border border-white/5 rounded-lg overflow-hidden">
          <CashflowChart cashflows={calc.monthlyCashflows} breakEvenMonth={calc.breakEvenMonth} planungStart={planungStart} planungEnde={planungEnde} baustart={baustart} bauende={bauende} />
          <div className="flex justify-between px-2 pb-1.5">
            <span className="text-[9px] text-red-400/60">■ Ausgaben</span>
            <span className="text-[9px] text-white/30">┅ Kumuliert</span>
            <span className="text-[9px] text-green-400/60">■ Einnahmen</span>
          </div>
        </div>

        {/* Restschuld-Chart (nur im Hold-Modus mit Finanzierung) */}
        {strategy === "hold" && finanzierungAktiv && calc.fkVolumen > 0 && (
          <div className="mt-3">
            <div className="text-[10px] text-white/40 uppercase tracking-wider mb-1">Kredit & Equity</div>
            <div className="border border-white/5 rounded-lg overflow-hidden">
              <RestschuldChart restschuldVerlauf={calc.restschuldVerlauf} fkVolumen={calc.fkVolumen} bauende={bauende} />
              <div className="flex justify-between px-2 pb-1.5">
                <span className="text-[9px] text-amber-400/60">━ Restschuld</span>
                <span className="text-[9px] text-green-400/40">▓ Equity</span>
              </div>
            </div>
          </div>
        )}
    </Section>
  );

  const strategieTabsSection = (
    <div className="flex rounded-lg overflow-hidden border border-white/10 mb-2">
        {(["hold", "sell"] as const).map(s => (
          <button
            key={s}
            onClick={() => setStrategy(s)}
            className={`flex-1 text-xs py-2 font-semibold transition-colors ${
              strategy === s ? "bg-teal-600 text-white" : "bg-white/5 text-white/40 hover:bg-white/10"
            }`}
          >
            {s === "hold" ? "🏠 Hold / Miete" : "💰 Sell / Verkauf"}
          </button>
        ))}
    </div>
  );

  const erloesSection = (
    <Section title={strategy === "hold" ? "Mieteinnahmen" : "Verkaufserlöse"} color="#22C55E">
        {strategy === "hold" ? (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs text-white/70">Miete €/m² WF/Mo.</span>
              <NumInput
                value={mietOverride ?? calc.defaultMiete}
                onChange={(v) => setMietOverride(v)}
                suffix="€/m²"
                step={0.5}
              />
            </div>
            <div className="flex items-center justify-between">
              <span className="text-xs text-white/70">Mietsteigerung p.a.</span>
              <NumInput value={mietsteigerungPa} onChange={setMietsteigerungPa} suffix="%" step={0.5} />
            </div>
            <div className="flex items-center justify-between">
              <span className="text-xs text-white/70">Bewirtschaftung</span>
              <NumInput value={bewirtschaftungPct} onChange={setBewirtschaftungPct} suffix="%" step={1} />
            </div>
            <div className="text-[10px] text-white/30">
              Bewirtschaftung: Verwaltung, Instandhaltung, Leerstandsrisiko
            </div>
            <div className="flex items-center justify-between">
              <span className="text-xs text-white/70">Betrachtungszeitraum</span>
              <div className="flex gap-1">
                {[10, 15, 20, 30].map(y => (
                  <button
                    key={y}
                    onClick={() => setBetrachtungJahre(y)}
                    className={`px-2 py-0.5 text-[10px] rounded ${
                      betrachtungJahre === y ? "bg-teal-600 text-white" : "bg-white/5 text-white/40 hover:bg-white/10"
                    }`}
                  >
                    {y}J
                  </button>
                ))}
              </div>
            </div>
            <div className="space-y-1 pt-2 border-t border-white/10">
              <div className="flex justify-between">
                <span className="text-xs text-white/50">Bruttomiete/Jahr</span>
                <span className="text-xs text-white/70">{fmtEur(calc.jahresmiete)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-xs text-white/50">– Bewirtschaftung ({bewirtschaftungPct}%)</span>
                <span className="text-xs text-red-400/70">−{fmtEur(calc.jahresmiete * bewirtschaftungPct / 100)}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-xs text-green-400 font-semibold">Nettomiete/Jahr</span>
                <span className="text-sm font-bold text-green-400">{fmtEur(calc.nettomieteJahr)}</span>
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs text-white/70">Verkaufspreis €/m² WF</span>
              <NumInput
                value={Math.round(verkaufOverride ?? calc.defaultVerkauf)}
                onChange={(v) => setVerkaufOverride(v)}
                suffix="€/m² WF"
                step={100}
              />
            </div>
            <div className="text-[10px] text-white/30">
              Default: Baukosten × 1,35 (35% Developer-Marge)
            </div>
            <div className="flex justify-between items-center pt-2 border-t border-white/10">
              <span className="text-xs text-green-400 font-semibold">Verkaufserlös</span>
              <span className="text-sm font-bold text-green-400">
                {priceSensitivity !== 0 ? (
                  <>{fmtEur(calc.verkaufserloes * (1 + priceSensitivity / 100))} <span className="text-[9px] text-white/40">({priceSensitivity > 0 ? "+" : ""}{priceSensitivity}%)</span></>
                ) : fmtEur(calc.verkaufserloes)}
              </span>
            </div>
          </div>
        )}
    </Section>
  );

  const sensitivitaetSlidersSection = strategy === "sell" ? (() => {
        const hasSens = costSensitivity !== 0 || priceSensitivity !== 0;
        const adjGesamtkosten = calc.gesamtkosten * (1 + costSensitivity / 100);
        const adjVerkaufserloes = calc.verkaufserloes * (1 + priceSensitivity / 100);

        return (
            <Section title="🔀 Sensitivität" color="#0D9488">
              <div className="space-y-3">
                <div>
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-xs text-white/60">Gesamtkosten</span>
                    <span className="text-xs font-mono" style={{ color: costSensitivity > 0 ? "#EF4444" : costSensitivity < 0 ? "#22C55E" : "#94A3B8" }}>
                      {costSensitivity > 0 ? "+" : ""}{costSensitivity}% → {fmtEur(adjGesamtkosten)}
                    </span>
                  </div>
                  <input
                    type="range" min={-30} max={30} step={1} value={costSensitivity}
                    onChange={(e) => setCostSensitivity(Number(e.target.value))}
                    className="w-full h-1.5 rounded-full appearance-none cursor-pointer"
                    style={{ background: `linear-gradient(to right, #0D9488, #0D9488 ${(costSensitivity + 30) / 60 * 100}%, #374151 ${(costSensitivity + 30) / 60 * 100}%, #374151)` }}
                  />
                </div>
                <div>
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-xs text-white/60">Verkaufspreis</span>
                    <span className="text-xs font-mono" style={{ color: priceSensitivity > 0 ? "#22C55E" : priceSensitivity < 0 ? "#EF4444" : "#94A3B8" }}>
                      {priceSensitivity > 0 ? "+" : ""}{priceSensitivity}% → {fmtEur(adjVerkaufserloes)}
                    </span>
                  </div>
                  <input
                    type="range" min={-30} max={30} step={1} value={priceSensitivity}
                    onChange={(e) => setPriceSensitivity(Number(e.target.value))}
                    className="w-full h-1.5 rounded-full appearance-none cursor-pointer"
                    style={{ background: `linear-gradient(to right, #0D9488, #0D9488 ${(priceSensitivity + 30) / 60 * 100}%, #374151 ${(priceSensitivity + 30) / 60 * 100}%, #374151)` }}
                  />
                </div>
                {hasSens && (
                  <button
                    onClick={() => { setCostSensitivity(0); setPriceSensitivity(0); }}
                    className="text-[10px] text-teal-400 hover:text-teal-300 underline"
                  >
                    ↺ Reset
                  </button>
                )}
              </div>
            </Section>
        );
  })() : null;

  const sellKpiSection = strategy === "sell" ? (() => {
        const hasSens = costSensitivity !== 0 || priceSensitivity !== 0;
        const adjGesamtkosten = calc.gesamtkosten * (1 + costSensitivity / 100);
        const adjVerkaufserloes = calc.verkaufserloes * (1 + priceSensitivity / 100);
        const adjMarge = adjGesamtkosten > 0 ? ((adjVerkaufserloes - adjGesamtkosten) / adjGesamtkosten) * 100 : 0;
        const adjEkRendite = finanzierungAktiv && calc.ekBedarf > 0
          ? ((adjVerkaufserloes - adjGesamtkosten) / calc.ekBedarf) * 100
          : null;
        const sellLaufzeit = Math.max(bauende, vertriebsende);
        const adjIrr = (() => {
          if (finanzierungAktiv && adjEkRendite !== null) {
            if (sellLaufzeit <= 0) return 0;
            return (Math.pow(1 + adjEkRendite / 100, 12 / sellLaufzeit) - 1) * 100;
          }
          const years = sellLaufzeit / 12;
          if (years <= 0 || adjGesamtkosten <= 0) return 0;
          return (Math.pow(1 + adjMarge / 100, 1 / years) - 1) * 100;
        })();
        const adjGrundstuecksanteil = adjGesamtkosten > 0 ? (calc.kg100 / adjGesamtkosten) * 100 : 0;

        return (
            <Section title="KPI-Dashboard" color="#0D9488">
              <div className={`grid ${fullWidth ? "grid-cols-4" : "grid-cols-2"} gap-2`}>
                <KPICard label="Marge" value={fmtPct(hasSens ? adjMarge : calc.marge)} color={(hasSens ? adjMarge : calc.marge) > 0 ? "#22C55E" : "#EF4444"} info={{ definition: "Gewinnspanne bezogen auf die Gesamtkosten.", formula: "(Verkaufserlös − Gesamtkosten) ÷ Gesamtkosten" }} />
                <KPICard label="IRR (ann.)" value={fmtPct(hasSens ? adjIrr : calc.irrSell)} color="#0D9488" info={{ definition: "Annualisierte Rendite des Verkaufsszenarios.", formula: "Annualisierte Marge über Projektlaufzeit" }} />
                {finanzierungAktiv && (hasSens ? adjEkRendite : calc.ekRenditeSell) !== null && (
                  <KPICard
                    label="EK-Rendite"
                    value={fmtPct((hasSens ? adjEkRendite : calc.ekRenditeSell)!)}
                    color={(hasSens ? adjEkRendite! : calc.ekRenditeSell!) > 0 ? "#22C55E" : "#EF4444"}
                    info={{ definition: "Gewinn bezogen auf den Eigenkapitaleinsatz.", formula: "(Verkaufserlös − Gesamtkosten) ÷ EK" }}
                  />
                )}
                <KPICard label="Break-Even" value={calc.breakEvenMonth !== null ? `${calc.breakEvenMonth}` : "—"} unit=" Mo." color="#22C55E" info={{ definition: "Monat, ab dem das Projekt kumuliert im Plus ist.", formula: "Erster Monat mit kumuliertem CF ≥ 0" }} />
                <KPICard label="Max. Kapitalbedarf" value={fmtEur(Math.abs(calc.peakCapital))} color="#EF4444" info={{ definition: "Höchster Punkt der negativen Cashflow-Kurve — so viel Kapital brauchst du mindestens.", formula: "Min(kumulierter Cashflow)" }} />
                <KPICard label="Grundstücksanteil" value={fmtPct(hasSens ? adjGrundstuecksanteil : calc.grundstuecksanteil)} color="#FBBF24" info={{ definition: "Anteil der Grundstückskosten an den Gesamtkosten.", formula: "KG100 ÷ Gesamtkosten" }} />
                <KPICard label="Baukosten/m²" value={`${Math.round(calc.baukostenProM2).toLocaleString("de-DE")}`} unit=" €" color="#A78BFA" info={{ definition: "Reine Baukosten (KG300) pro m² Bruttogrundfläche.", formula: "KG300 ÷ BGF" }} />
                <KPICard label="Betrachtung" value={`${calc.gesamtlaufzeitMonate}`} unit=" Mo." color="#94A3B8" info={{ definition: "Gesamter Analysezeitraum des Projekts in Monaten." }} />
                {finanzierungAktiv && (
                  <KPICard label="Monatl. Rate" value={fmtEur(calc.monatlicheRate)} color="#F59E0B" info={{ definition: "Monatliche Annuitätenrate (Zins + Tilgung).", formula: "FK × (Zinssatz + Tilgung) ÷ 12" }} />
                )}
              </div>
            </Section>
        );
  })() : null;

  const exitSection = strategy === "hold" ? (
    <Section title="🚪 Exit-Szenario" color="#F59E0B">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs text-white/70">Haltedauer / Exit nach</span>
              <div className="flex items-center gap-2">
                <input
                  type="range"
                  min={5} max={30} step={1}
                  value={exitJahre}
                  onChange={e => setExitJahre(Number(e.target.value))}
                  className="w-20 accent-amber-500"
                />
                <span className="text-xs text-white font-mono w-10 text-right">{exitJahre} J</span>
              </div>
            </div>

            <div className="flex rounded-lg overflow-hidden border border-white/10">
              <button onClick={() => setExitRestwertMode("auto")}
                className={`flex-1 text-[10px] py-1.5 font-semibold ${exitRestwertMode === "auto" ? "bg-amber-600 text-white" : "bg-white/5 text-white/40"}`}>
                📈 Wertsteigerung
              </button>
              <button onClick={() => setExitRestwertMode("manual")}
                className={`flex-1 text-[10px] py-1.5 font-semibold ${exitRestwertMode === "manual" ? "bg-amber-600 text-white" : "bg-white/5 text-white/40"}`}>
                ✏️ Manuell
              </button>
            </div>

            {exitRestwertMode === "auto" ? (
              <div className="flex items-center justify-between">
                <span className="text-xs text-white/70">Wertsteigerung p.a.</span>
                <NumInput value={exitWertsteigerungPa} onChange={setExitWertsteigerungPa} suffix="%" step={0.5} />
              </div>
            ) : (
              <div className="flex items-center justify-between">
                <span className="text-xs text-white/70">Restwert (% der Gesamtkosten)</span>
                <NumInput value={exitRestwertPct} onChange={setExitRestwertPct} suffix="%" step={5} />
              </div>
            )}

            <div className="flex items-center justify-between">
              <span className="text-xs text-white/70">Verkaufs-NK (Makler etc.)</span>
              <NumInput value={exitVerkaufsNK} onChange={setExitVerkaufsNK} suffix="%" step={1} />
            </div>

            <div className="space-y-1 pt-2 border-t border-white/10">
              <div className="flex justify-between">
                <span className="text-xs text-white/50">Exit-Wert (nach {exitJahre}J)</span>
                <span className="text-xs text-white/70">{fmtEur(calc.exitWert)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-xs text-white/50">– Verkaufs-NK ({exitVerkaufsNK}%)</span>
                <span className="text-xs text-red-400/70">−{fmtEur(calc.exitNK)}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-xs text-amber-400 font-semibold">Netto Exit-Erlös</span>
                <span className="text-sm font-bold text-amber-400">{fmtEur(calc.exitErloes)}</span>
              </div>
            </div>
          </div>
    </Section>
  ) : null;

  const kpiSection = strategy === "hold" ? (
    <Section title="KPI-Dashboard" color="#0D9488">
      <div className={`grid ${fullWidth ? "grid-cols-4" : "grid-cols-2"} gap-2`}>
              <KPICard
                label="IRR (levered)"
                value={calc.irrHoldLevered !== null ? fmtPct(calc.irrHoldLevered) : "—"}
                color={calc.irrHoldLevered !== null ? (calc.irrHoldLevered > 8 ? "#22C55E" : calc.irrHoldLevered >= 4 ? "#FBBF24" : "#EF4444") : "#94A3B8"}
                info={{ definition: "Interner Zinsfuß deiner EK-Cashflows inkl. Finanzierung und Exit-Erlös.", formula: "Newton-Raphson auf jährliche EK-Cashflows" }}
              />
              <KPICard
                label="IRR (unlevered)"
                value={calc.irrHoldUnlevered !== null ? fmtPct(calc.irrHoldUnlevered) : "—"}
                color={calc.irrHoldUnlevered !== null ? (calc.irrHoldUnlevered > 8 ? "#22C55E" : calc.irrHoldUnlevered >= 4 ? "#FBBF24" : "#EF4444") : "#94A3B8"}
                info={{ definition: "Interner Zinsfuß ohne Finanzierung — zeigt die reine Objektqualität.", formula: "Newton-Raphson auf Gesamt-Cashflows" }}
              />
              <KPICard
                label="Multiple on Equity"
                value={calc.multipleOnEquity > 0 ? `${calc.multipleOnEquity.toFixed(2)}` : "—"}
                unit="×"
                color={calc.multipleOnEquity > 2 ? "#22C55E" : calc.multipleOnEquity >= 1.5 ? "#FBBF24" : "#EF4444"}
                info={{ definition: "Wie oft bekommst du dein eingesetztes EK zurück?", formula: "Gesamtrückflüsse ÷ EK-Einsatz" }}
              />
              <KPICard label="Total Profit" value={fmtEur(calc.totalProfitHold)} color={calc.totalProfitHold > 0 ? "#22C55E" : "#EF4444"} info={{ definition: "Absoluter Gewinn über die gesamte Haltedauer.", formula: "Summe aller Cashflows" }} />
              <KPICard label="Avg. Cash Yield" value={fmtPct(calc.avgCashYield)} color={calc.avgCashYield > 8 ? "#22C55E" : calc.avgCashYield >= 4 ? "#FBBF24" : "#EF4444"} info={{ definition: "Durchschnittlicher jährlicher Ertrag auf dein EK (ohne Exit).", formula: "Ø Jahres-Cashflow ÷ EK" }} />
              <KPICard label="Nettoanfangsrendite" value={fmtPct(calc.niy)} color="#0D9488" info={{ definition: "Jährliche Nettomiete im Verhältnis zum Gesamtinvestment. Zeigt die ungehebelte Objektrendite.", formula: "Nettomiete p.a. ÷ Investitionskosten" }} />
              {finanzierungAktiv && calc.coc !== null && (
                <KPICard
                  label="Cash-on-Cash"
                  value={fmtPct(calc.coc)}
                  color={calc.coc > 8 ? "#22C55E" : calc.coc >= 4 ? "#FBBF24" : "#EF4444"}
                  info={{ definition: "Jährlicher freier Cashflow bezogen auf deinen Eigenkapitaleinsatz.", formula: "(Nettomiete − Annuität) ÷ EK" }}
                />
              )}
              {finanzierungAktiv && calc.dscr !== null && (
                <KPICard
                  label="DSCR"
                  value={calc.dscr.toFixed(2)}
                  unit="×"
                  color={calc.dscr > 1.3 ? "#22C55E" : calc.dscr >= 1.0 ? "#FBBF24" : "#EF4444"}
                  info={{ definition: "Debt Service Coverage Ratio — kann die Miete den Kapitaldienst decken?", formula: "Nettomiete p.a. ÷ Annuität p.a." }}
                />
              )}
              {finanzierungAktiv && (
                <>
                  <KPICard label="Restschuld" value={fmtEur(calc.restschuldEnde)} color="#F59E0B" info={{ definition: "Verbleibende Kreditschuld am Ende des Betrachtungszeitraums.", formula: "FK − kumulierte Tilgung" }} />
                  <KPICard label="Equity Build-up" value={fmtEur(calc.equityBuildup)} color="#22C55E" info={{ definition: "Durch Tilgung aufgebautes Eigenkapital im Objekt.", formula: "FK-Volumen − Restschuld" }} />
                </>
              )}
              <KPICard label="Monatl. Rate" value={fmtEur(calc.monatlicheRate)} color="#F59E0B" info={{ definition: "Monatliche Annuitätenrate (Zins + Tilgung).", formula: "FK × (Zinssatz + Tilgung) ÷ 12" }} />
              <KPICard label="Nettomiete/Mo." value={fmtEur(calc.nettomieteJahr / 12)} color="#22C55E" info={{ definition: "Monatliche Mieteinnahme nach Bewirtschaftungskosten.", formula: "Jahresmiete × (1 − Bewirtschaftung%) ÷ 12" }} />
              <KPICard
                label="Netto nach Rate"
                value={fmtEur(calc.nettomieteJahr / 12 - calc.monatlicheRate)}
                color={(calc.nettomieteJahr / 12 - calc.monatlicheRate) > 0 ? "#22C55E" : "#EF4444"}
                info={{ definition: "Was monatlich nach Kreditrate übrig bleibt.", formula: "Nettomiete/Mo. − Monatl. Rate" }}
              />
          <KPICard label="Break-Even" value={calc.breakEvenMonth !== null ? `${calc.breakEvenMonth}` : "—"} unit=" Mo." color="#22C55E" info={{ definition: "Monat, ab dem das Projekt kumuliert im Plus ist.", formula: "Erster Monat mit kumuliertem CF ≥ 0" }} />
          <KPICard label="Max. Kapitalbedarf" value={fmtEur(Math.abs(calc.peakCapital))} color="#EF4444" info={{ definition: "Höchster Punkt der negativen Cashflow-Kurve — so viel Kapital brauchst du mindestens.", formula: "Min(kumulierter Cashflow)" }} />
          <KPICard label="Grundstücksanteil" value={fmtPct(calc.grundstuecksanteil)} color="#FBBF24" info={{ definition: "Anteil der Grundstückskosten an den Gesamtkosten.", formula: "KG100 ÷ Gesamtkosten" }} />
          <KPICard label="Baukosten/m²" value={`${Math.round(calc.baukostenProM2).toLocaleString("de-DE")}`} unit=" €" color="#A78BFA" info={{ definition: "Reine Baukosten (KG300) pro m² Bruttogrundfläche.", formula: "KG300 ÷ BGF" }} />
          <KPICard label="Betrachtung" value={`${betrachtungJahre * 12}`} unit=" Mo." color="#94A3B8" info={{ definition: "Gesamter Analysezeitraum des Projekts in Monaten." }} />
      </div>
    </Section>
  ) : null;

  return (
    <div className={fullWidth ? "space-y-4" : "space-y-3"}>
      <h2 className="text-xs font-semibold text-white/50 uppercase tracking-wider mb-3">
        📊 Wirtschaftlichkeit (DIN 276)
      </h2>

      {/* Strategie-Tabs — always full width */}
      {strategieTabsSection}

      <div className="space-y-2">
        {kostengruppenSection}
        {finanzierungSection}
        {zeitachseSection}
        {erloesSection}
        {sensitivitaetSlidersSection}
        {exitSection}
      </div>
      {!hideKpi && (
        <div className={fullWidth ? "sticky bottom-0 z-10 bg-[#1E293B] pt-3 -mx-4 px-4 pb-1 border-t border-white/10 shadow-[0_-4px_12px_rgba(0,0,0,0.3)]" : ""}>
          {kpiSection}
          {sellKpiSection}
        </div>
      )}
    </div>
  );
}
