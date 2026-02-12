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
  const [bauweise, setBauweise] = useState<"seriell" | "konventionell">("seriell");
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
  const [vermarktungszeit, setVermarktungszeit] = useState(6);

  const calc = useMemo(() => {
    // KG 300+400: Baukosten
    const kg300 = placedUnits.reduce((sum, u) => {
      const b = buildings.find((bb) => bb.id === u.buildingId);
      if (!b) return sum;
      return sum + b.pricePerSqm * u.area;
    }, 0);

    // Total BGF
    const totalBGF = placedUnits.reduce((s, u) => s + u.area, 0);

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
    const bauzeit = bauweise === "seriell" ? 6 : 15;
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
    const jahresmiete = mieteProM2 * totalBGF * 12;

    const defaultVerkauf = totalBGF > 0 ? (kg300 * 1.35) / totalBGF : 4500;
    const verkaufProM2 = verkaufOverride ?? defaultVerkauf;
    const verkaufserloes = verkaufProM2 * totalBGF;

    // KPIs
    const niy = gesamtkosten > 0 ? (jahresmiete / gesamtkosten) * 100 : 0;
    const marge = gesamtkosten > 0 ? ((verkaufserloes - gesamtkosten) / gesamtkosten) * 100 : 0;

    // Cash-on-Cash (Hold + Finanzierung)
    const coc = finanzierungAktiv && ekBedarf > 0
      ? ((jahresmiete - annuitaetJahr) / ekBedarf) * 100
      : null;

    // EK-Rendite Sell
    const ekRenditeSell = finanzierungAktiv && ekBedarf > 0
      ? ((verkaufserloes - gesamtkosten) / ekBedarf) * 100
      : null;

    // IRR
    const gesamtlaufzeitMonate = bauzeit + vermarktungszeit;
    const irrSell = (() => {
      if (finanzierungAktiv && ekRenditeSell !== null) {
        if (gesamtlaufzeitMonate <= 0) return 0;
        return (Math.pow(1 + ekRenditeSell / 100, 12 / gesamtlaufzeitMonate) - 1) * 100;
      }
      const totalMonths = bauzeit + 6;
      const years = totalMonths / 12;
      if (years <= 0 || gesamtkosten <= 0) return 0;
      return (Math.pow(1 + marge / 100, 1 / years) - 1) * 100;
    })();

    const irrHold = (() => {
      if (gesamtkosten <= 0) return 0;
      const vacancyMonths = bauzeit;
      const firstYearRent = jahresmiete * ((12 - Math.min(vacancyMonths, 12)) / 12);
      return (firstYearRent / gesamtkosten) * 100;
    })();

    // DSCR
    const dscr = finanzierungAktiv && annuitaetJahr > 0
      ? jahresmiete / annuitaetJahr
      : null;

    const grundstuecksanteil = gesamtkosten > 0 ? (kg100 / gesamtkosten) * 100 : 0;
    const baukostenProM2 = totalBGF > 0 ? kg300 / totalBGF : 0;

    return {
      kg100, kg200, kg300, kg500, kg700, kg700BasePct,
      sumKG, gesamtkosten, totalBGF, bauzeit,
      // Finanzierung
      fkVolumen, ekBedarf, bauzinsen,
      bereitstellungszinsen: bereitstellungszinsenVal,
      finKostenBau, annuitaetJahr, monatlicheRate,
      // Erlöse
      defaultMiete, mieteProM2, jahresmiete,
      defaultVerkauf, verkaufProM2, verkaufserloes,
      // KPIs
      niy, marge, irrSell, irrHold,
      coc, ekRenditeSell, dscr,
      gesamtlaufzeitMonate,
      grundstuecksanteil, baukostenProM2,
    };
  }, [baufelder, placedUnits, buildings, kg200Pct, kg500Pct, kg700Pct, zinssatz, tilgung, bereitstellungszins, bauweise, vermarktungszeit, matchScore, kg100On, kg200On, kg300On, kg500On, kg700On, finanzierungAktiv, ekQuote, mietOverride, verkaufOverride]);

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
      });
    }
  }, [calc, onCalcUpdate, baufelder.length, placedUnits.length, zinssatz, tilgung, ekQuote, strategy]);

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
          <div className="text-[10px] text-white/30">{placedUnits.length} Gebäude · {calc.totalBGF.toLocaleString("de-DE")} m² BGF</div>
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
              <div className="flex items-center justify-between">
                <span className="text-xs text-white/70">Bauzeit</span>
                <div className="flex rounded-md overflow-hidden border border-white/10">
                  {(["seriell", "konventionell"] as const).map(b => (
                    <button
                      key={b}
                      onClick={() => setBauweise(b)}
                      className={`px-2 py-0.5 text-[10px] transition-colors ${
                        bauweise === b ? "bg-teal-600 text-white" : "bg-white/5 text-white/40 hover:bg-white/10"
                      }`}
                    >
                      {b === "seriell" ? "Seriell (6M)" : "Konv. (15M)"}
                    </button>
                  ))}
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-white/70">Vermarktungszeit</span>
                <NumInput value={vermarktungszeit} onChange={setVermarktungszeit} suffix="Monate" step={1} min={0} />
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
              <span className="text-xs text-white/70">Miete €/m²/Monat</span>
              <NumInput
                value={mietOverride ?? calc.defaultMiete}
                onChange={(v) => setMietOverride(v)}
                suffix="€/m²"
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
              <span className="text-xs text-white/70">Verkaufspreis €/m²</span>
              <NumInput
                value={Math.round(verkaufOverride ?? calc.defaultVerkauf)}
                onChange={(v) => setVerkaufOverride(v)}
                suffix="€/m²"
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
