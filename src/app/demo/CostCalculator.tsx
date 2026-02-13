"use client";

import { useState, useMemo, useEffect } from "react";
import { ChevronDown, ChevronRight } from "lucide-react";
import type { CostData } from "./exportPDF";
import type { Baufeld, PlacedUnit, BuildingModule, Filters } from "./types";

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
  label: string;
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

function KPICard({ label, value, unit, color }: { label: string; value: string; unit?: string; color: string }) {
  return (
    <div className="bg-[#0F172A] rounded-lg p-3 border border-white/5 text-center">
      <div className="text-lg font-bold" style={{ color }}>{value}{unit && <span className="text-sm ml-0.5">{unit}</span>}</div>
      <div className="text-[10px] text-white/40 uppercase tracking-wider mt-0.5">{label}</div>
    </div>
  );
}

/* ── Cashflow Chart (SVG) ─────────────────────────────────── */

function CashflowChart({
  cashflows,
  breakEvenMonth,
}: {
  cashflows: { month: number; cashOut: number; cashIn: number; cumulative: number }[];
  breakEvenMonth: number | null;
}) {
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
        return (
          <g key={i}>
            {/* Expense bar (down) */}
            {c.cashOut !== 0 && (
              <rect x={x} y={midY} width={barW} height={outH} fill="#EF4444" opacity={0.6} rx={1} />
            )}
            {/* Income bar (up) */}
            {c.cashIn > 0 && (
              <rect x={x} y={midY - inH} width={barW} height={inH} fill="#22C55E" opacity={0.6} rx={1} />
            )}
          </g>
        );
      })}

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
}

export function CostCalculator({ baufelder, placedUnits, buildings, filters, matchScore, onCalcUpdate }: Props) {
  // Editable parameters
  const [kg200Pct, setKg200Pct] = useState(5);
  const [kg500Pct, setKg500Pct] = useState(4);
  const [kg700Pct, setKg700Pct] = useState(20);
  const [strategy, setStrategy] = useState<"hold" | "sell">(filters.strategy);
  const [mietOverride, setMietOverride] = useState<number | null>(null);
  const [verkaufOverride, setVerkaufOverride] = useState<number | null>(null);

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
  const [baustart, setBaustart] = useState(0);
  const [bauende, setBauende] = useState(6);
  const [vertriebsstart, setVertriebsstart] = useState(3);
  const [vertriebsende, setVertriebsende] = useState(12);
  const [auszahlungskurve, setAuszahlungskurve] = useState<"s-kurve" | "linear">("s-kurve");

  // Preset handlers
  const handlePreset = (preset: "seriell" | "konventionell") => {
    setBauzeitPreset(preset);
    const dur = preset === "seriell" ? 6 : 15;
    setBauende(baustart + dur);
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

  const calc = useMemo(() => {
    // KG 300+400: Baukosten
    const kg300 = placedUnits.reduce((sum, u) => {
      const b = buildings.find((bb) => bb.id === u.buildingId);
      if (!b) return sum;
      return sum + b.pricePerSqm * u.area;
    }, 0);

    // Total BGF
    const totalBGF = placedUnits.reduce((s, u) => s + u.area, 0);
    const totalWohnflaeche = Math.round(totalBGF * 0.75);

    // KG 100: Grundstück
    const kg100 = baufelder.reduce((sum, bf) => {
      const brw = bf.borisBodenrichtwert || 0;
      return sum + brw * bf.grundstuecksflaecheM2;
    }, 0);

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
    const gesamtlaufzeitMonate = Math.max(bauende, vertriebsende);

    // ── Monthly Cashflows ──
    const totalMonths = gesamtlaufzeitMonate;
    const monthlyCashflows: { month: number; cashOut: number; cashIn: number; cumulative: number }[] = [];

    // Build cost distribution (KG200-700) over baustart..bauende
    const baukostenOhnGrund = (kg200On ? kg200 : 0) + (kg300On ? kg300 : 0) + (kg500On ? kg500 : 0) + (kg700On ? kg700 : 0);
    const finKostenMonatlich = finanzierungAktiv ? finKostenBau / Math.max(1, bauzeit) : 0;

    // Precompute distribution weights
    const weights: number[] = [];
    let weightSum = 0;
    for (let m = baustart; m < bauende; m++) {
      const t = bauzeit > 1 ? (m - baustart) / (bauzeit - 1) : 0.5;
      const w = auszahlungskurve === "s-kurve" ? betaCurve(t) : 1;
      weights.push(w);
      weightSum += w;
    }

    let cumulative = 0;
    for (let m = 0; m < totalMonths; m++) {
      let cashOut = 0;
      let cashIn = 0;

      // KG100 at baustart
      if (m === baustart && kg100On) {
        cashOut += kg100;
      }

      // Baukosten distributed
      if (m >= baustart && m < bauende) {
        const idx = m - baustart;
        const frac = weightSum > 0 ? weights[idx] / weightSum : 0;
        cashOut += baukostenOhnGrund * frac;
        cashOut += finKostenMonatlich;
      }

      // Income
      if (strategy === "hold") {
        // Linear ramp from vertriebsstart to vertriebsende (0%→100% occupancy)
        if (m >= vertriebsstart && m < vertriebsende) {
          const vertriebsDauer = Math.max(1, vertriebsende - vertriebsstart);
          const progress = (m - vertriebsstart + 1) / vertriebsDauer;
          cashIn += (jahresmiete / 12) * progress;
        } else if (m >= vertriebsende) {
          cashIn += jahresmiete / 12;
        }
      } else {
        // Sell: sigmoid distribution over vertriebsstart..vertriebsende
        if (m >= vertriebsstart && m < vertriebsende) {
          const vertriebsDauer = Math.max(1, vertriebsende - vertriebsstart);
          const t = vertriebsDauer > 1 ? (m - vertriebsstart) / (vertriebsDauer - 1) : 0.5;
          const w = betaCurve(t, 2, 2);
          // We need normalized weights for sell distribution
          let sellWeightSum = 0;
          for (let sm = vertriebsstart; sm < vertriebsende; sm++) {
            const st = vertriebsDauer > 1 ? (sm - vertriebsstart) / (vertriebsDauer - 1) : 0.5;
            sellWeightSum += betaCurve(st, 2, 2);
          }
          cashIn += sellWeightSum > 0 ? verkaufserloes * (w / sellWeightSum) : 0;
        }
      }

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

    // KPIs
    const niy = gesamtkosten > 0 ? (jahresmiete / gesamtkosten) * 100 : 0;
    const marge = gesamtkosten > 0 ? ((verkaufserloes - gesamtkosten) / gesamtkosten) * 100 : 0;

    const coc = finanzierungAktiv && ekBedarf > 0
      ? ((jahresmiete - annuitaetJahr) / ekBedarf) * 100
      : null;

    const ekRenditeSell = finanzierungAktiv && ekBedarf > 0
      ? ((verkaufserloes - gesamtkosten) / ekBedarf) * 100
      : null;

    const irrSell = (() => {
      if (finanzierungAktiv && ekRenditeSell !== null) {
        if (gesamtlaufzeitMonate <= 0) return 0;
        return (Math.pow(1 + ekRenditeSell / 100, 12 / gesamtlaufzeitMonate) - 1) * 100;
      }
      const totalM = bauzeit + 6;
      const years = totalM / 12;
      if (years <= 0 || gesamtkosten <= 0) return 0;
      return (Math.pow(1 + marge / 100, 1 / years) - 1) * 100;
    })();

    const irrHold = (() => {
      if (gesamtkosten <= 0) return 0;
      const vacancyMonths = bauzeit;
      const firstYearRent = jahresmiete * ((12 - Math.min(vacancyMonths, 12)) / 12);
      return (firstYearRent / gesamtkosten) * 100;
    })();

    const dscr = finanzierungAktiv && annuitaetJahr > 0
      ? jahresmiete / annuitaetJahr
      : null;

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
    };
  }, [baufelder, placedUnits, buildings, kg200Pct, kg500Pct, kg700Pct, zinssatz, tilgung, bereitstellungszins, baustart, bauende, vertriebsstart, vertriebsende, auszahlungskurve, matchScore, kg100On, kg200On, kg300On, kg500On, kg700On, finanzierungAktiv, ekQuote, mietOverride, verkaufOverride, strategy]);

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
      });
    }
  }, [calc, onCalcUpdate, baufelder.length, placedUnits.length, zinssatz, tilgung, ekQuote, strategy, baustart, bauende, vertriebsstart, vertriebsende]);

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

  return (
    <div className="space-y-3">
      <h2 className="text-xs font-semibold text-white/50 uppercase tracking-wider mb-3">
        📊 Wirtschaftlichkeit (DIN 276)
      </h2>

      {/* ── Kostengruppen ────────────────────────────────── */}
      <Section title="Kosten" color="#F59E0B">
        <CostRow label="KG 100 · Grundstück" value={calc.kg100} enabled={kg100On} onToggle={setKg100On}>
          <div className="text-[10px] text-white/30">
            {baufelder.map(bf => (
              <div key={bf.id}>
                {bf.name}: {(bf.borisBodenrichtwert || 0).toLocaleString("de-DE")} €/m² × {bf.grundstuecksflaecheM2.toLocaleString("de-DE")} m²
              </div>
            ))}
            {baufelder.some(bf => !bf.borisBodenrichtwert) && (
              <div className="text-amber-500/60">⚠ BORIS-Daten fehlen für einige Baufelder</div>
            )}
          </div>
        </CostRow>

        <CostRow label="KG 200 · Herrichten & Erschließen" value={calc.kg200} enabled={kg200On} onToggle={setKg200On}>
          <NumInput value={kg200Pct} onChange={setKg200Pct} suffix="% der Baukosten" step={1} />
        </CostRow>

        <CostRow label="KG 300+400 · Gebäude + Technik" value={calc.kg300} enabled={kg300On} onToggle={setKg300On}>
          <div className="text-[10px] text-white/30">{placedUnits.length} Gebäude · {calc.totalBGF.toLocaleString("de-DE")} m² BGF · {calc.totalWohnflaeche.toLocaleString("de-DE")} m² WF (75%)</div>
        </CostRow>

        <CostRow label="KG 500 · Außenanlagen" value={calc.kg500} enabled={kg500On} onToggle={setKg500On}>
          <NumInput value={kg500Pct} onChange={setKg500Pct} suffix="% der Baukosten" step={1} />
        </CostRow>

        <CostRow label="KG 700 · Baunebenkosten" value={calc.kg700} enabled={kg700On} onToggle={setKg700On}>
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
            <span className="text-sm font-bold text-amber-400">{fmtEur(calc.gesamtkosten)}</span>
          </div>
        </div>
      </Section>

      {/* ── Finanzierung ─────────────────────────────────── */}
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
                <span className="text-[10px] text-white/50">EK {ekQuote}% / FK {fkQuoteVal}%</span>
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

      {/* ── Zeitachse ────────────────────────────────────── */}
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
              {p === "seriell" ? "Seriell 6M" : p === "konventionell" ? "Konv. 15M" : "Custom"}
            </button>
          ))}
        </div>

        {/* Dual Range Sliders */}
        <div className="space-y-4">
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
          Bauzeit {calc.bauzeit} Mo. · Vertrieb {vertriebsDauer} Mo. · Gesamt {calc.gesamtlaufzeitMonate} Mo.
        </div>

        {/* Cashflow Chart */}
        <div className="mt-3 border border-white/5 rounded-lg overflow-hidden">
          <CashflowChart cashflows={calc.monthlyCashflows} breakEvenMonth={calc.breakEvenMonth} />
          <div className="flex justify-between px-2 pb-1.5">
            <span className="text-[9px] text-red-400/60">■ Ausgaben</span>
            <span className="text-[9px] text-white/30">┅ Kumuliert</span>
            <span className="text-[9px] text-green-400/60">■ Einnahmen</span>
          </div>
        </div>
      </Section>

      {/* ── Erlöse ───────────────────────────────────────── */}
      <Section title="Erlöse" color="#22C55E">
        <div className="flex rounded-lg overflow-hidden border border-white/10 mb-3">
          {(["hold", "sell"] as const).map(s => (
            <button
              key={s}
              onClick={() => setStrategy(s)}
              className={`flex-1 text-xs py-1.5 transition-colors ${
                strategy === s ? "bg-teal-600 text-white" : "bg-white/5 text-white/40 hover:bg-white/10"
              }`}
            >
              {s === "hold" ? "🏠 Hold / Miete" : "💰 Sell / Verkauf"}
            </button>
          ))}
        </div>

        {strategy === "hold" ? (
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs text-white/70">Miete €/m² WF/Monat</span>
              <NumInput
                value={mietOverride ?? calc.defaultMiete}
                onChange={(v) => setMietOverride(v)}
                suffix="€/m² WF"
                step={0.5}
              />
            </div>
            <div className="text-[10px] text-white/30">
              Default: Mietspiegel {baufelder[0]?.wohnlage || "mittel"} · 60-90m² · Mittelwert
            </div>
            <div className="flex justify-between items-center pt-2 border-t border-white/10">
              <span className="text-xs text-green-400 font-semibold">Jahresmiete</span>
              <span className="text-sm font-bold text-green-400">{fmtEur(calc.jahresmiete)}</span>
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
              <span className="text-sm font-bold text-green-400">{fmtEur(calc.verkaufserloes)}</span>
            </div>
          </div>
        )}
      </Section>

      {/* ── KPIs ─────────────────────────────────────────── */}
      <Section title="KPI-Dashboard" color="#0D9488">
        <div className="grid grid-cols-2 gap-2">
          {strategy === "hold" ? (
            <>
              <KPICard label="Net Initial Yield" value={fmtPct(calc.niy)} color="#0D9488" />
              <KPICard label="IRR (adj.)" value={fmtPct(calc.irrHold)} color="#0D9488" />
              {finanzierungAktiv && calc.coc !== null && (
                <KPICard
                  label="Cash-on-Cash"
                  value={fmtPct(calc.coc)}
                  color={calc.coc > 8 ? "#22C55E" : calc.coc >= 4 ? "#FBBF24" : "#EF4444"}
                />
              )}
              {finanzierungAktiv && calc.dscr !== null && (
                <KPICard
                  label="DSCR"
                  value={calc.dscr.toFixed(2)}
                  unit="×"
                  color={calc.dscr > 1.3 ? "#22C55E" : calc.dscr >= 1.0 ? "#FBBF24" : "#EF4444"}
                />
              )}
            </>
          ) : (
            <>
              <KPICard label="Marge" value={fmtPct(calc.marge)} color={calc.marge > 0 ? "#22C55E" : "#EF4444"} />
              <KPICard label="IRR (ann.)" value={fmtPct(calc.irrSell)} color="#0D9488" />
              {finanzierungAktiv && calc.ekRenditeSell !== null && (
                <KPICard
                  label="EK-Rendite"
                  value={fmtPct(calc.ekRenditeSell)}
                  color={calc.ekRenditeSell > 0 ? "#22C55E" : "#EF4444"}
                />
              )}
            </>
          )}
          <KPICard label="Break-Even" value={calc.breakEvenMonth !== null ? `${calc.breakEvenMonth}` : "—"} unit=" Mo." color="#22C55E" />
          <KPICard label="Max. Kapitalbedarf" value={fmtEur(Math.abs(calc.peakCapital))} color="#EF4444" />
          <KPICard label="Grundstücksanteil" value={fmtPct(calc.grundstuecksanteil)} color="#FBBF24" />
          <KPICard label="Baukosten/m²" value={`${Math.round(calc.baukostenProM2).toLocaleString("de-DE")}`} unit=" €" color="#A78BFA" />
          <KPICard label="Gesamtlaufzeit" value={`${calc.gesamtlaufzeitMonate}`} unit=" Mo." color="#94A3B8" />
          {finanzierungAktiv && (
            <KPICard label="Monatl. Rate" value={fmtEur(calc.monatlicheRate)} color="#F59E0B" />
          )}
        </div>
      </Section>
    </div>
  );
}
