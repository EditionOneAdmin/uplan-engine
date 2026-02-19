/**
 * KostX Engine — Honorarrechner (HOAI-basiert)
 * Berechnet KG 700 Planungsleistungen nach HOAI 2021
 *
 * Excel: Honorarrechner Sheet + Honorartabellen Sheet
 * Zielwert: ~613 €/m² NUF brutto (910.987 € absolut)
 */

import type { KostXConfig, MassCalculation } from './kostx-types';
import {
  HOAI_OBJEKTPLANUNG,
  HOAI_TRAGWERK,
  HOAI_TGA,
  HOAI_FREIANLAGEN,
  HOAI_WAERMESCHUTZ,
  HOAI_VERMESSUNG_ENTWURF,
  HOAI_VERMESSUNG_BAU,
  TGA_AG_SPLIT,
} from './lookup-tables';

const MwSt = 1.19;

// ============================================================
// Interfaces
// ============================================================

export interface HonorarGewerkResult {
  name: string;
  anrechenbareKosten: number;
  honorar100Pct_netto: number;
  honorar_netto: number;
  honorar_brutto: number;
  lpSumme: number; // Sum of LP percentages applied
  enabled: boolean;
}

export interface HonorarResult {
  /** Gesamthonorar brutto (€) — Excel D21 */
  total_brutto: number;
  /** Gesamthonorar €/m² NUF brutto — Excel E21 */
  total_eurM2NUF: number;
  /** Aufschlüsselung nach Gewerk */
  gewerke: HonorarGewerkResult[];
  /** Anteil an KG 300-500 — Excel F21 */
  anteilKG300_500: number;
}

// ============================================================
// LP-Anteile pro Gewerk (Excel: Honorarrechner E-Spalte)
// ============================================================

/** Objektplanung §33: LP1-9 Anteile. Excel rows 40-51 */
const LP_OBJEKTPLANUNG = [0.02, 0.07, 0.15, 0.03, 0.25, 0.10, 0.04, 0.32, 0.00];
// Sum = 0.98

/** Tragwerksplanung §49: LP1-9. Excel rows 68-79 */
const LP_TRAGWERK = [0.03, 0.10, 0.15, 0.30, 0.40, 0.02, 0.00, 0.00, 0.00];
// Sum = 1.00

/** TGA §53: LP1-9. Excel rows 109-120 */
const LP_TGA = [0.02, 0.09, 0.17, 0.02, 0.22, 0.07, 0.05, 0.35, 0.00];
// Sum = 0.99

/** Freianlagen §40: LP1-9. Excel rows 139-150 */
const LP_FREIANLAGEN = [0.03, 0.10, 0.16, 0.04, 0.25, 0.07, 0.03, 0.30, 0.00];
// Sum = 0.98

/** Wärmeschutz: LP1-9. Excel rows 192-203 */
const LP_WAERMESCHUTZ = [0.03, 0.20, 0.40, 0.06, 0.27, 0.02, 0.02, 0.00, 0.00];
// Sum = 1.00

/** Bauakustik: LP1-9. Same as Wärmeschutz. Excel rows 221-232 */
const LP_BAUAKUSTIK = [0.03, 0.20, 0.40, 0.06, 0.27, 0.02, 0.02, 0.00, 0.00];

/** Brandschutz: LP1-9. Excel rows 280-291 */
const LP_BRANDSCHUTZ = [0.01, 0.15, 0.19, 0.15, 0.18, 0.00, 0.00, 0.32, 0.00];
// Sum = 1.00

/** Entwurfsvermessung: LP1+2 only. Excel rows 250-251 */
const LP_ENTWURFSVERMESSUNG = [0.18, 0.82, 0, 0, 0, 0, 0, 0, 0];

/** Bauvermessung: LP5+8 only. Excel rows 267-268 */
const LP_BAUVERMESSUNG = [0, 0, 0, 0, 0.02, 0, 0, 0.98, 0];

// ============================================================
// HOAI Linear Interpolation (FORECAST equivalent)
// ============================================================

/**
 * HOAI-Honorar-Lookup mit linearer Interpolation.
 * Entspricht Excel FORECAST() zwischen den zwei nächsten Tabellenzeilen.
 *
 * @param anrechenbareKosten - Anrechenbare Kosten in €
 * @param table - HOAI-Tabelle [[kosten, honorar], ...]
 * @returns Interpoliertes Honorar
 *
 * Excel: FORECAST(x, OFFSET(col, MATCH(x, costs, 1)-1, 0, 2), OFFSET(costs, MATCH(x, costs, 1)-1, 0, 2))
 */
function hoaiLookup(anrechenbareKosten: number, table: number[][]): number {
  if (table.length === 0) return 0;
  if (anrechenbareKosten <= table[0][0]) return table[0][1];
  if (anrechenbareKosten >= table[table.length - 1][0]) return table[table.length - 1][1];

  // Find bracket (MATCH with 1 = less than or equal)
  let idx = 0;
  for (let i = 0; i < table.length - 1; i++) {
    if (table[i][0] <= anrechenbareKosten) idx = i;
    else break;
  }

  const x0 = table[idx][0];
  const x1 = table[idx + 1][0];
  const y0 = table[idx][1];
  const y1 = table[idx + 1][1];

  // Linear interpolation (FORECAST)
  if (x1 === x0) return y0;
  return y0 + (y1 - y0) * (anrechenbareKosten - x0) / (x1 - x0);
}

/**
 * Berechnet Honorar für ein Gewerk.
 * 100% Honorar × Summe LP-Anteile = angepasstes Honorar
 */
function calcGewerkHonorar(
  name: string,
  anrechenbareKosten: number,
  table: number[][],
  lpAnteile: number[],
  enabled: boolean,
  umbauzuschlag: number = 0,
): HonorarGewerkResult {
  if (!enabled || anrechenbareKosten <= 0) {
    return { name, anrechenbareKosten, honorar100Pct_netto: 0, honorar_netto: 0, honorar_brutto: 0, lpSumme: 0, enabled };
  }

  const honorar100 = hoaiLookup(anrechenbareKosten, table) * (1 + umbauzuschlag);
  const lpSumme = lpAnteile.reduce((s, v) => s + v, 0);
  const honorarNetto = honorar100 * lpSumme;

  return {
    name,
    anrechenbareKosten,
    honorar100Pct_netto: honorar100,
    honorar_netto: honorarNetto,
    honorar_brutto: honorarNetto * MwSt,
    lpSumme,
    enabled,
  };
}

// ============================================================
// Anrechenbare Kosten Berechnung
// ============================================================

/**
 * Objektplanung §33 — Anrechenbare Kosten.
 * Excel: C37 = D31 + D32 + D33
 *   D31 = KG300 netto
 *   D32 = min(KG400 netto, 25% of KG300)
 *   D33 = max(0, (KG400 - D32) / 2)
 *
 * Excel: Honorarrechner C31-C33
 */
function calcAnrechenbareKostenObjekt(kg300netto: number, kg400netto: number): number {
  const d31 = kg300netto;
  const d32 = Math.min(kg400netto, kg300netto * 0.25);
  const d33 = Math.max(0, (kg400netto - d32) / 2);
  return d31 + d32 + d33;
}

/**
 * Tragwerksplanung §49 — Anrechenbare Kosten.
 * Excel: C65 = D60 + D61
 *   D60 = KG300 × 55%
 *   D61 = KG400 × 10%
 */
function calcAnrechenbareKostenTragwerk(kg300netto: number, kg400netto: number): number {
  return kg300netto * 0.55 + kg400netto * 0.10;
}

/**
 * TGA §53 — Anrechenbare Kosten pro Anlagengruppe.
 * TGA wird getrennt nach AG berechnet (höheres Honorar durch Degression).
 * Excel: Rows 96-103 — AG splits applied to KG400 netto
 *
 * Default split (sonstige Industrie):
 *   AG 1-3: 57%, AG 4-5: 34%, AG 6: 7%, AG 7-8: 2%
 */
function calcTGAHonorarSplit(
  kg400netto: number,
  table: number[][],
  umbauzuschlag: number = 0,
): number {
  let totalHonorar = 0;
  for (const ag of TGA_AG_SPLIT) {
    const agKosten = kg400netto * ag.anteil;
    if (agKosten > 0) {
      totalHonorar += hoaiLookup(agKosten, table);
    }
  }
  return totalHonorar * (1 + umbauzuschlag);
}

/**
 * Wärmeschutz/Bauakustik — Anrechenbare Kosten.
 * Same as Objektplanung: KG300 + min(KG400, 25%×KG300) + 50%×excess
 * Excel: C189 = C183 + C184 + C185 (same formula as C37)
 */
function calcAnrechenbareKostenWaerme(kg300netto: number, kg400netto: number): number {
  return calcAnrechenbareKostenObjekt(kg300netto, kg400netto);
}

/**
 * Entwurfsvermessung — Anrechenbare Kosten.
 * Excel: C247 formula — degressive scaling of sum(D241:D243)
 *   D241-D243 = same as anr.Kosten Objekt structure
 * Then: if sum <= 511292: ×0.4; if <= 1022584: ×0.35; if <= 2556459: ×0.3; else: ×0.25
 */
function calcAnrechenbareKostenEntwurfsvermessung(kg300netto: number, kg400netto: number): number {
  const basis = calcAnrechenbareKostenObjekt(kg300netto, kg400netto);
  if (basis <= 511292) return basis * 0.4;
  if (basis <= 1022584) return basis * 0.35;
  if (basis <= 2556459) return basis * 0.3;
  return basis * 0.25;
}

/**
 * Bauvermessung — Anrechenbare Kosten.
 * Excel: C265 = (D259+D260+D261) × 0.8, capped at 10225000
 * D259-261 = same structure as anr.Kosten Objekt
 */
function calcAnrechenbareKostenBauvermessung(kg300netto: number, kg400netto: number): number {
  const basis = calcAnrechenbareKostenObjekt(kg300netto, kg400netto) * 0.8;
  return basis > 10225000 ? 0 : basis;
}

/**
 * Brandschutz — Pauschalhonorar (nicht HOAI-tabellenbasiert).
 * Excel: D278 = 2300 + 130 × (NUF × Faktor × (1+Sp) × (1+St))^0.61
 *
 * Für Default: Nutzung=Wohnen (Faktor=1), Fläche=1995m², Sp=0, St=0
 * → 2300 + 130 × 1995^0.61 = 15693.95
 */
function calcBrandschutzHonorar(nuf: number, nutzungsFaktor: number = 1): number {
  const flaeche = nuf * nutzungsFaktor;
  return 2300 + 130 * Math.pow(flaeche, 0.61);
}

// ============================================================
// Hauptfunktion
// ============================================================

/**
 * Berechnet alle Honorare (KG 700 Planungsleistungen).
 *
 * Excel: Honorarrechner Sheet
 * Zielwert Default: D21 = 910.987 € brutto = 613 €/m² NUF
 *
 * @param config - Gebäudekonfiguration
 * @param masses - Berechnete Massen
 * @param kg300brutto - KG 300 Baukonstruktion brutto (€)
 * @param kg400brutto - KG 400 Technische Anlagen brutto (€)
 */
export function calculateHonorar(
  config: KostXConfig,
  masses: MassCalculation,
  kg300brutto: number,
  kg400brutto: number,
): HonorarResult {
  const kg300netto = kg300brutto / MwSt;
  const kg400netto = kg400brutto / MwSt;
  const kg500netto = config.kg500_eurM2 * masses.erloesflaecheWarm_m2 / MwSt;
  const nuf = masses.erloesflaecheWarm_m2;

  // --- Objektplanung §33 (Excel rows 30-55) ---
  const objAnrKosten = calcAnrechenbareKostenObjekt(kg300netto, kg400netto);
  const objResult = calcGewerkHonorar(
    'Objektplanung', objAnrKosten, HOAI_OBJEKTPLANUNG, LP_OBJEKTPLANUNG, true
  );

  // --- Tragwerksplanung §49 (Excel rows 59-83) ---
  const twAnrKosten = calcAnrechenbareKostenTragwerk(kg300netto, kg400netto);
  const twResult = calcGewerkHonorar(
    'Tragwerksplanung', twAnrKosten, HOAI_TRAGWERK, LP_TRAGWERK, true
  );

  // --- TGA §53 (Excel rows 87-124) ---
  // TGA uses split calculation by Anlagengruppen
  const tga100 = calcTGAHonorarSplit(kg400netto, HOAI_TGA);
  const tgaLpSumme = LP_TGA.reduce((s, v) => s + v, 0);
  const tgaNetto = tga100 * tgaLpSumme;
  const tgaResult: HonorarGewerkResult = {
    name: 'TGA-Planung',
    anrechenbareKosten: kg400netto,
    honorar100Pct_netto: tga100,
    honorar_netto: tgaNetto,
    honorar_brutto: tgaNetto * MwSt,
    lpSumme: tgaLpSumme,
    enabled: true,
  };

  // --- Freianlagen §40 (Excel rows 133-154) ---
  // Default: disabled (E15=Nein), KG500 Freianlagen als anrechenbare Kosten
  const faEnabled = false; // Default: Nein
  const faResult = calcGewerkHonorar(
    'Außenanlagen', kg500netto, HOAI_FREIANLAGEN, LP_FREIANLAGEN, faEnabled
  );

  // --- Wärmeschutz (Excel rows 182-207) ---
  const wsAnrKosten = calcAnrechenbareKostenWaerme(kg300netto, kg400netto);
  const wsResult = calcGewerkHonorar(
    'Wärmeschutz', wsAnrKosten, HOAI_WAERMESCHUTZ, LP_WAERMESCHUTZ, true
  );

  // --- Bauakustik (Excel rows 211-236) ---
  // Default: disabled (E17=Nein)
  const akAnrKosten = calcAnrechenbareKostenWaerme(kg300netto, kg400netto);
  const akResult = calcGewerkHonorar(
    'Bauakustik', akAnrKosten, HOAI_WAERMESCHUTZ, LP_BAUAKUSTIK, false
  );

  // --- Brandschutz (Excel rows 276-295) ---
  // Uses special formula, not HOAI table
  // Excel D303 = Kostenmodell C22+C23+C24 = NUF Wohnen + VK/TF + UG ≈ erloesflaecheWarm
  // We use nufR + nufGewerbe + vkTf as best approximation of Excel's D303
  // Bezugsfläche = BGF oi + BGF S (nicht NUF!) — Excel: Honorarrechner Row 277
  const brandschutzFlaeche = masses.bgfOi_m2 + masses.bgfS_m2;
  const bsHonorar100 = calcBrandschutzHonorar(brandschutzFlaeche);
  const bsLpSumme = LP_BRANDSCHUTZ.reduce((s, v) => s + v, 0);
  const bsNetto = bsHonorar100 * bsLpSumme;
  const bsResult: HonorarGewerkResult = {
    name: 'Brandschutz',
    anrechenbareKosten: 0,
    honorar100Pct_netto: bsHonorar100,
    honorar_netto: bsNetto,
    honorar_brutto: bsNetto * MwSt,
    lpSumme: bsLpSumme,
    enabled: true,
  };

  // --- Entwurfsvermessung (Excel rows 240-254) ---
  // Default: disabled (E19=Nein)
  const evAnrKosten = calcAnrechenbareKostenEntwurfsvermessung(kg300netto, kg400netto);
  const evResult = calcGewerkHonorar(
    'Entwurfsvermessung', evAnrKosten, HOAI_VERMESSUNG_ENTWURF, LP_ENTWURFSVERMESSUNG, false
  );

  // --- Bauvermessung (Excel rows 258-271) ---
  // Default: disabled (E20=Nein)
  const bvAnrKosten = calcAnrechenbareKostenBauvermessung(kg300netto, kg400netto);
  const bvResult = calcGewerkHonorar(
    'Bauvermessung', bvAnrKosten, HOAI_VERMESSUNG_BAU, LP_BAUVERMESSUNG, false
  );

  // --- Gesamtsumme ---
  const gewerke = [objResult, twResult, tgaResult, faResult, wsResult, akResult, bsResult, evResult, bvResult];
  const totalBrutto = gewerke
    .filter(g => g.enabled)
    .reduce((sum, g) => sum + g.honorar_brutto, 0);

  const totalEurM2 = nuf > 0 ? totalBrutto / nuf : 0;

  // Anteil an KG 300-500
  const kg300_500 = kg300brutto + kg400brutto + config.kg500_eurM2 * nuf;
  const anteil = kg300_500 > 0 ? totalBrutto / kg300_500 : 0;

  return {
    total_brutto: totalBrutto,
    total_eurM2NUF: totalEurM2,
    gewerke,
    anteilKG300_500: anteil,
  };
}
