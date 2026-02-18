"use client";

import type { CostData } from "./exportPDF";
import { InfoTooltip } from "./InfoTooltip";

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

/* ── KPI Card ─────────────────────────────────────────────── */

function KPICard({ label, value, unit, color, info, compact }: { label: string; value: string; unit?: string; color: string; info?: { definition: string; formula?: string }; compact?: boolean }) {
  return (
    <div className={`bg-[#0F172A] rounded border border-white/5 text-center ${compact ? "px-1 py-1" : "p-3 rounded-lg"}`}>
      <div className={`${compact ? "text-xs" : "text-lg"} font-bold truncate`} style={{ color }}>{value}{unit && <span className={`${compact ? "text-[9px]" : "text-sm"} ml-0.5`}>{unit}</span>}</div>
      <div className={`${compact ? "text-[7px]" : "text-[10px]"} text-white/40 uppercase tracking-wider mt-0.5 leading-tight truncate`}>
        {label}
        {info && <InfoTooltip term={label} definition={info.definition} formula={info.formula} />}
      </div>
    </div>
  );
}

/* ── KpiDashboard ─────────────────────────────────────────── */

interface KpiDashboardProps {
  costData: CostData;
  fullWidth?: boolean;
}

export function KpiDashboard({ costData, fullWidth = false }: KpiDashboardProps) {
  const strategy = costData.strategy;
  const finanzierungAktiv = costData.finanzierungAktiv ?? true;

  if (strategy === "sell") {
    return (
      <div>
        <div className="text-[10px] text-teal-400 font-semibold uppercase tracking-wider mb-2">KPI-Dashboard</div>
        <div className={`grid ${fullWidth ? "grid-cols-6" : "grid-cols-2"} gap-1.5`}>
          <KPICard compact={fullWidth} label="Marge" value={fmtPct(costData.marge)} color={costData.marge > 0 ? "#22C55E" : "#EF4444"} info={{ definition: "Gewinnspanne bezogen auf die Gesamtkosten.", formula: "(Verkaufserlös − Gesamtkosten) ÷ Gesamtkosten" }} />
          <KPICard compact={fullWidth} label="IRR (ann.)" value={fmtPct(costData.irrSell)} color="#0D9488" info={{ definition: "Annualisierte Rendite des Verkaufsszenarios.", formula: "Annualisierte Marge über Projektlaufzeit" }} />
          {finanzierungAktiv && costData.ekRenditeSell !== null && costData.ekRenditeSell !== undefined && (
            <KPICard compact={fullWidth} label="EK-Rendite"
              value={fmtPct(costData.ekRenditeSell)}
              color={costData.ekRenditeSell > 0 ? "#22C55E" : "#EF4444"}
              info={{ definition: "Gewinn bezogen auf den Eigenkapitaleinsatz.", formula: "(Verkaufserlös − Gesamtkosten) ÷ EK" }}
            />
          )}
          <KPICard compact={fullWidth} label="Break-Even" value={costData.breakEvenMonth !== null && costData.breakEvenMonth !== undefined ? `${costData.breakEvenMonth}` : "—"} unit=" Mo." color="#22C55E" info={{ definition: "Monat, ab dem das Projekt kumuliert im Plus ist.", formula: "Erster Monat mit kumuliertem CF ≥ 0" }} />
          <KPICard compact={fullWidth} label="Max. Kapitalbedarf" value={fmtEur(Math.abs(costData.peakCapital ?? 0))} color="#EF4444" info={{ definition: "Höchster Punkt der negativen Cashflow-Kurve.", formula: "Min(kumulierter Cashflow)" }} />
          <KPICard compact={fullWidth} label="Grundstücksanteil" value={fmtPct(costData.grundstuecksanteil)} color="#FBBF24" info={{ definition: "Anteil der Grundstückskosten an den Gesamtkosten.", formula: "KG100 ÷ Gesamtkosten" }} />
          <KPICard compact={fullWidth} label="Baukosten/m²" value={`${Math.round(costData.baukostenProM2).toLocaleString("de-DE")}`} unit=" €" color="#A78BFA" info={{ definition: "Reine Baukosten (KG300) pro m² Bruttogrundfläche.", formula: "KG300 ÷ BGF" }} />
          <KPICard compact={fullWidth} label="Betrachtung" value={`${costData.gesamtlaufzeit}`} unit=" Mo." color="#94A3B8" info={{ definition: "Gesamter Analysezeitraum des Projekts in Monaten." }} />
          {finanzierungAktiv && (
            <KPICard compact={fullWidth} label="Monatl. Rate" value={fmtEur(costData.monatlicheRate)} color="#F59E0B" info={{ definition: "Monatliche Annuitätenrate (Zins + Tilgung).", formula: "FK × (Zinssatz + Tilgung) ÷ 12" }} />
          )}
        </div>
      </div>
    );
  }

  // Hold KPIs
  const irrLev = costData.irrHoldLevered;
  const irrUnlev = costData.irrHoldUnlevered;
  const moe = costData.multipleOnEquity ?? 0;
  const totalProfit = costData.totalProfitHold ?? 0;
  const avgCY = costData.avgCashYield ?? 0;
  const restschuld = costData.restschuldEnde ?? 0;
  const eqBuildup = costData.equityBuildup ?? 0;
  const nettomieteJahr = costData.nettomieteJahr ?? 0;
  const betrachtungJahre = costData.betrachtungJahre ?? 20;

  return (
    <div>
      <div className="text-[10px] text-teal-400 font-semibold uppercase tracking-wider mb-2">KPI-Dashboard</div>
      <div className={`grid ${fullWidth ? "grid-cols-6" : "grid-cols-2"} gap-1.5`}>
        <KPICard compact={fullWidth} label="IRR (levered)"
          value={irrLev !== null && irrLev !== undefined ? fmtPct(irrLev) : "—"}
          color={irrLev != null ? (irrLev > 8 ? "#22C55E" : irrLev >= 4 ? "#FBBF24" : "#EF4444") : "#94A3B8"}
          info={{ definition: "Interner Zinsfuß deiner EK-Cashflows inkl. Finanzierung und Exit-Erlös.", formula: "Newton-Raphson auf jährliche EK-Cashflows" }}
        />
        <KPICard compact={fullWidth} label="IRR (unlevered)"
          value={irrUnlev !== null && irrUnlev !== undefined ? fmtPct(irrUnlev) : "—"}
          color={irrUnlev != null ? (irrUnlev > 8 ? "#22C55E" : irrUnlev >= 4 ? "#FBBF24" : "#EF4444") : "#94A3B8"}
          info={{ definition: "Interner Zinsfuß ohne Finanzierung — zeigt die reine Objektqualität.", formula: "Newton-Raphson auf Gesamt-Cashflows" }}
        />
        <KPICard compact={fullWidth} label="Multiple on Equity"
          value={moe > 0 ? `${moe.toFixed(2)}` : "—"}
          unit="×"
          color={moe > 2 ? "#22C55E" : moe >= 1.5 ? "#FBBF24" : "#EF4444"}
          info={{ definition: "Wie oft bekommst du dein eingesetztes EK zurück?", formula: "Gesamtrückflüsse ÷ EK-Einsatz" }}
        />
        <KPICard compact={fullWidth} label="Total Profit" value={fmtEur(totalProfit)} color={totalProfit > 0 ? "#22C55E" : "#EF4444"} info={{ definition: "Absoluter Gewinn über die gesamte Haltedauer.", formula: "Summe aller Cashflows" }} />
        <KPICard compact={fullWidth} label="Avg. Cash Yield" value={fmtPct(avgCY)} color={avgCY > 8 ? "#22C55E" : avgCY >= 4 ? "#FBBF24" : "#EF4444"} info={{ definition: "Durchschnittlicher jährlicher Ertrag auf dein EK (ohne Exit).", formula: "Ø Jahres-Cashflow ÷ EK" }} />
        <KPICard compact={fullWidth} label="Nettoanfangsrendite" value={fmtPct(costData.niy)} color="#0D9488" info={{ definition: "Jährliche Nettomiete im Verhältnis zum Gesamtinvestment.", formula: "Nettomiete p.a. ÷ Investitionskosten" }} />
        {finanzierungAktiv && costData.cashOnCash !== null && costData.cashOnCash !== undefined && (
          <KPICard compact={fullWidth} label="Cash-on-Cash"
            value={fmtPct(costData.cashOnCash)}
            color={costData.cashOnCash > 8 ? "#22C55E" : costData.cashOnCash >= 4 ? "#FBBF24" : "#EF4444"}
            info={{ definition: "Jährlicher freier Cashflow bezogen auf deinen Eigenkapitaleinsatz.", formula: "(Nettomiete − Annuität) ÷ EK" }}
          />
        )}
        {finanzierungAktiv && costData.dscr !== null && costData.dscr !== undefined && (
          <KPICard compact={fullWidth} label="DSCR"
            value={costData.dscr.toFixed(2)}
            unit="×"
            color={costData.dscr > 1.3 ? "#22C55E" : costData.dscr >= 1.0 ? "#FBBF24" : "#EF4444"}
            info={{ definition: "Debt Service Coverage Ratio — kann die Miete den Kapitaldienst decken?", formula: "Nettomiete p.a. ÷ Annuität p.a." }}
          />
        )}
        {finanzierungAktiv && (
          <>
            <KPICard compact={fullWidth} label="Restschuld" value={fmtEur(restschuld)} color="#F59E0B" info={{ definition: "Verbleibende Kreditschuld am Ende des Betrachtungszeitraums.", formula: "FK − kumulierte Tilgung" }} />
            <KPICard compact={fullWidth} label="Equity Build-up" value={fmtEur(eqBuildup)} color="#22C55E" info={{ definition: "Durch Tilgung aufgebautes Eigenkapital im Objekt.", formula: "FK-Volumen − Restschuld" }} />
          </>
        )}
        <KPICard compact={fullWidth} label="Monatl. Rate" value={fmtEur(costData.monatlicheRate)} color="#F59E0B" info={{ definition: "Monatliche Annuitätenrate (Zins + Tilgung).", formula: "FK × (Zinssatz + Tilgung) ÷ 12" }} />
        <KPICard compact={fullWidth} label="Nettomiete/Mo." value={fmtEur(nettomieteJahr / 12)} color="#22C55E" info={{ definition: "Monatliche Mieteinnahme nach Bewirtschaftungskosten.", formula: "Jahresmiete × (1 − Bewirtschaftung%) ÷ 12" }} />
        <KPICard compact={fullWidth} label="Netto nach Rate"
          value={fmtEur(nettomieteJahr / 12 - costData.monatlicheRate)}
          color={(nettomieteJahr / 12 - costData.monatlicheRate) > 0 ? "#22C55E" : "#EF4444"}
          info={{ definition: "Was monatlich nach Kreditrate übrig bleibt.", formula: "Nettomiete/Mo. − Monatl. Rate" }}
        />
        <KPICard compact={fullWidth} label="Break-Even" value={costData.breakEvenMonth !== null && costData.breakEvenMonth !== undefined ? `${costData.breakEvenMonth}` : "—"} unit=" Mo." color="#22C55E" info={{ definition: "Monat, ab dem das Projekt kumuliert im Plus ist.", formula: "Erster Monat mit kumuliertem CF ≥ 0" }} />
        <KPICard compact={fullWidth} label="Max. Kapitalbedarf" value={fmtEur(Math.abs(costData.peakCapital ?? 0))} color="#EF4444" info={{ definition: "Höchster Punkt der negativen Cashflow-Kurve.", formula: "Min(kumulierter Cashflow)" }} />
        <KPICard compact={fullWidth} label="Grundstücksanteil" value={fmtPct(costData.grundstuecksanteil)} color="#FBBF24" info={{ definition: "Anteil der Grundstückskosten an den Gesamtkosten.", formula: "KG100 ÷ Gesamtkosten" }} />
        <KPICard compact={fullWidth} label="Baukosten/m²" value={`${Math.round(costData.baukostenProM2).toLocaleString("de-DE")}`} unit=" €" color="#A78BFA" info={{ definition: "Reine Baukosten (KG300) pro m² Bruttogrundfläche.", formula: "KG300 ÷ BGF" }} />
        <KPICard compact={fullWidth} label="Betrachtung" value={`${betrachtungJahre * 12}`} unit=" Mo." color="#94A3B8" info={{ definition: "Gesamter Analysezeitraum des Projekts in Monaten." }} />
      </div>
    </div>
  );
}
