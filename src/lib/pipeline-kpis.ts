import type { Variante } from "@/types/pipeline";

export interface ExtractedKPIs {
  // Flächen & Gebäude
  wohnflaeche: number | null;
  bgf: number | null;
  units: number | null;
  grzUsage: number | null;
  gfzUsage: number | null;
  compliant: boolean | null;
  parkingNeeded: number | null;

  // Kosten
  grundstueckskosten: number | null;
  baukosten: number | null; // KG200-500
  gesamtinvestition: number | null;
  euroProM2BGF: number | null;
  euroProM2WF: number | null;
  ekBedarf: number | null;

  // Rendite & Cashflow
  strategy: "hold" | "sell" | null;
  niy: number | null;
  marge: number | null;
  cashOnCash: number | null;
  dscr: number | null;
  jahresmiete: number | null;
  mieteProM2: number | null;
  verkaufserloes: number | null;
  verkaufProM2: number | null;
  irrHold: number | null;
  irrSell: number | null;
  ekRenditeSell: number | null;
  breakEvenMonth: number | null;
  rendite: number | null;
}

function num(val: unknown): number | null {
  if (val === null || val === undefined) return null;
  const n = Number(val);
  return isNaN(n) ? null : n;
}

function str(val: unknown): string | null {
  if (typeof val === "string") return val;
  return null;
}

export function extractKPIs(variante: Variante): ExtractedKPIs {
  const w = (variante.wirtschaftlichkeit || {}) as Record<string, unknown>;
  const cd = (w.costData || {}) as Record<string, unknown>;
  const gc = (variante.gebaeude_config || {}) as Record<string, unknown>;

  // Helper: try wirtschaftlichkeit top-level, then costData, then gebaeude_config
  const get = (keys: string[]): unknown => {
    for (const k of keys) {
      if (w[k] !== undefined && w[k] !== null) return w[k];
      if (cd[k] !== undefined && cd[k] !== null) return cd[k];
      if (gc[k] !== undefined && gc[k] !== null) return gc[k];
    }
    return null;
  };

  const wf = num(get(["total_wohnflaeche", "totalWohnflaeche", "wohnflaeche", "Wohnflaeche"]));
  const bgf = num(get(["total_bgf", "totalBGF", "bgf", "BGF"]));
  const invest = num(get(["total_investment", "gesamtkosten", "investment", "Investment"]));

  const kg200 = num(get(["kg200"]));
  const kg300 = num(get(["kg300"]));
  const kg500 = num(get(["kg500"]));
  const baukosten = (kg200 !== null || kg300 !== null || kg500 !== null)
    ? (kg200 || 0) + (kg300 || 0) + (kg500 || 0)
    : null;

  return {
    wohnflaeche: wf,
    bgf,
    units: num(get(["total_units", "totalUnits", "units"])),
    grzUsage: num(get(["grzUsage"])),
    gfzUsage: num(get(["gfzUsage"])),
    compliant: w.compliant != null ? Boolean(w.compliant) : (gc.compliant != null ? Boolean(gc.compliant) : null),
    parkingNeeded: num(get(["parkingNeeded"])),

    grundstueckskosten: num(get(["kg100", "grundstuecksanteil"])),
    baukosten,
    gesamtinvestition: invest,
    euroProM2BGF: (invest && bgf && bgf > 0) ? invest / bgf : num(get(["baukostenProM2"])),
    euroProM2WF: (invest && wf && wf > 0) ? invest / wf : null,
    ekBedarf: num(get(["ekBedarf"])),

    strategy: (str(get(["strategy"])) as "hold" | "sell") || null,
    niy: num(get(["niy"])),
    marge: num(get(["marge"])),
    cashOnCash: num(get(["cashOnCash"])),
    dscr: num(get(["dscr"])),
    jahresmiete: num(get(["jahresmiete"])),
    mieteProM2: num(get(["mieteProM2"])),
    verkaufserloes: num(get(["verkaufserloes"])),
    verkaufProM2: num(get(["verkaufProM2"])),
    irrHold: num(get(["irrHold"])),
    irrSell: num(get(["irrSell"])),
    ekRenditeSell: num(get(["ekRenditeSell"])),
    breakEvenMonth: num(get(["breakEvenMonth"])),
    rendite: num(get(["rendite", "Rendite"])),
  };
}

// Formatting helpers
export function fmtNum(n: number | null, suffix = ""): string {
  if (n === null) return "—";
  return n.toLocaleString("de-DE", { maximumFractionDigits: 0 }) + (suffix ? ` ${suffix}` : "");
}

export function fmtCurrency(n: number | null): string {
  if (n === null) return "—";
  if (Math.abs(n) >= 1_000_000) return `${(n / 1_000_000).toLocaleString("de-DE", { minimumFractionDigits: 1, maximumFractionDigits: 1 })} Mio €`;
  if (Math.abs(n) >= 1_000) return `${(n / 1_000).toLocaleString("de-DE", { maximumFractionDigits: 0 })}k €`;
  return `${n.toLocaleString("de-DE")} €`;
}

export function fmtPercent(n: number | null, decimals = 1): string {
  if (n === null) return "—";
  return `${n.toLocaleString("de-DE", { minimumFractionDigits: decimals, maximumFractionDigits: decimals })}%`;
}

export function fmtArea(n: number | null): string {
  return fmtNum(n, "m²");
}

export function fmtEuroM2(n: number | null): string {
  if (n === null) return "—";
  return `${n.toLocaleString("de-DE", { maximumFractionDigits: 0 })} €/m²`;
}

// Color helpers
export function renditeColor(val: number | null): string {
  if (val === null) return "";
  if (val > 5) return "text-green-600";
  if (val > 2) return "text-yellow-600";
  return "text-red-600";
}

export function dscrColor(val: number | null): string {
  if (val === null) return "";
  if (val >= 1.2) return "text-green-600";
  if (val >= 1.0) return "text-yellow-600";
  return "text-red-600";
}

export function complianceBadge(val: number | null, compliant?: boolean | null): string {
  if (compliant === true) return "✅";
  if (compliant === false) return "⚠️";
  if (val === null) return "";
  return "";
}
