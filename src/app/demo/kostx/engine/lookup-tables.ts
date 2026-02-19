/**
 * KostX Engine — Lookup-Tabellen
 * Extrahiert aus plan.xlsm Sheets: Kostentabellen + Kostenmodell
 */

// ============================================================
// Bodenplatte nach Geschossen (Kostentabellen A4:D12)
// ============================================================

export interface BodenplatteLookup {
  geschosse: number;
  staerke_cm: number;
  bewehrung_kgM3: number;
  preisNetto_eurM2: number;
}

export const BODENPLATTE_LOOKUP: BodenplatteLookup[] = [
  { geschosse: 1, staerke_cm: 20, bewehrung_kgM3: 130, preisNetto_eurM2: 100 },
  { geschosse: 2, staerke_cm: 25, bewehrung_kgM3: 140, preisNetto_eurM2: 130 },
  { geschosse: 3, staerke_cm: 30, bewehrung_kgM3: 150, preisNetto_eurM2: 176.51 },
  { geschosse: 4, staerke_cm: 40, bewehrung_kgM3: 160, preisNetto_eurM2: 241 },
  { geschosse: 5, staerke_cm: 50, bewehrung_kgM3: 160, preisNetto_eurM2: 299.72 },
  { geschosse: 6, staerke_cm: 50, bewehrung_kgM3: 170, preisNetto_eurM2: 310.39 },
  { geschosse: 7, staerke_cm: 60, bewehrung_kgM3: 180, preisNetto_eurM2: 383 },
  { geschosse: 8, staerke_cm: 70, bewehrung_kgM3: 190, preisNetto_eurM2: 457 },
  { geschosse: 9, staerke_cm: 80, bewehrung_kgM3: 200, preisNetto_eurM2: 535 },
];

/** Bodenplattenpreis per VLOOKUP — bei >9 Geschosse: 9er-Wert */
export function lookupBodenplatte(geschosse: number): BodenplatteLookup {
  const capped = Math.min(geschosse, 9);
  return BODENPLATTE_LOOKUP.find(b => b.geschosse === capped) ?? BODENPLATTE_LOOKUP[BODENPLATTE_LOOKUP.length - 1];
}

// ============================================================
// IW-Faktor nach Ø WE-Größe (Kostentabellen A15:D80)
// ============================================================

export interface IWFaktorLookup {
  weGroesse_m2: number;
  faktor: number;
  zusKG400_eur: number;
  anzahlTueren: number | null;
}

/** Generiert aus Excel: WE-Größe 12–77 m², Faktor linear abnehmend */
export const IW_FAKTOR_LOOKUP: IWFaktorLookup[] = [
  { weGroesse_m2: 12, faktor: 3.070, zusKG400_eur: 116, anzahlTueren: null },
  { weGroesse_m2: 13, faktor: 3.055, zusKG400_eur: 114, anzahlTueren: null },
  { weGroesse_m2: 14, faktor: 3.040, zusKG400_eur: 112, anzahlTueren: null },
  { weGroesse_m2: 15, faktor: 3.025, zusKG400_eur: 110, anzahlTueren: null },
  { weGroesse_m2: 16, faktor: 3.010, zusKG400_eur: 108, anzahlTueren: null },
  { weGroesse_m2: 17, faktor: 2.995, zusKG400_eur: 106, anzahlTueren: null },
  { weGroesse_m2: 18, faktor: 2.980, zusKG400_eur: 104, anzahlTueren: null },
  { weGroesse_m2: 19, faktor: 2.965, zusKG400_eur: 102, anzahlTueren: null },
  { weGroesse_m2: 20, faktor: 2.950, zusKG400_eur: 100, anzahlTueren: null },
  { weGroesse_m2: 21, faktor: 2.935, zusKG400_eur: 98, anzahlTueren: null },
  { weGroesse_m2: 22, faktor: 2.920, zusKG400_eur: 96, anzahlTueren: null },
  { weGroesse_m2: 23, faktor: 2.905, zusKG400_eur: 94, anzahlTueren: null },
  { weGroesse_m2: 24, faktor: 2.890, zusKG400_eur: 92, anzahlTueren: null },
  { weGroesse_m2: 25, faktor: 2.875, zusKG400_eur: 90, anzahlTueren: null },
  { weGroesse_m2: 26, faktor: 2.860, zusKG400_eur: 88, anzahlTueren: null },
  { weGroesse_m2: 27, faktor: 2.845, zusKG400_eur: 86, anzahlTueren: null },
  { weGroesse_m2: 28, faktor: 2.830, zusKG400_eur: 84, anzahlTueren: null },
  { weGroesse_m2: 29, faktor: 2.815, zusKG400_eur: 82, anzahlTueren: null },
  { weGroesse_m2: 30, faktor: 2.800, zusKG400_eur: 80, anzahlTueren: null },
  { weGroesse_m2: 31, faktor: 2.785, zusKG400_eur: 78, anzahlTueren: null },
  { weGroesse_m2: 32, faktor: 2.770, zusKG400_eur: 76, anzahlTueren: null },
  { weGroesse_m2: 33, faktor: 2.755, zusKG400_eur: 74, anzahlTueren: null },
  { weGroesse_m2: 34, faktor: 2.740, zusKG400_eur: 72, anzahlTueren: null },
  { weGroesse_m2: 35, faktor: 2.725, zusKG400_eur: 70, anzahlTueren: null },
  { weGroesse_m2: 36, faktor: 2.710, zusKG400_eur: 68, anzahlTueren: null },
  { weGroesse_m2: 37, faktor: 2.695, zusKG400_eur: 66, anzahlTueren: null },
  { weGroesse_m2: 38, faktor: 2.680, zusKG400_eur: 64, anzahlTueren: null },
  { weGroesse_m2: 39, faktor: 2.665, zusKG400_eur: 62, anzahlTueren: null },
  { weGroesse_m2: 40, faktor: 2.650, zusKG400_eur: 60, anzahlTueren: null },
  { weGroesse_m2: 41, faktor: 2.635, zusKG400_eur: 58, anzahlTueren: null },
  { weGroesse_m2: 42, faktor: 2.620, zusKG400_eur: 56, anzahlTueren: null },
  { weGroesse_m2: 43, faktor: 2.605, zusKG400_eur: 54, anzahlTueren: null },
  { weGroesse_m2: 44, faktor: 2.590, zusKG400_eur: 52, anzahlTueren: null },
  { weGroesse_m2: 45, faktor: 2.575, zusKG400_eur: 50, anzahlTueren: null },
  { weGroesse_m2: 46, faktor: 2.560, zusKG400_eur: 48, anzahlTueren: null },
  { weGroesse_m2: 47, faktor: 2.545, zusKG400_eur: 46, anzahlTueren: null },
  { weGroesse_m2: 48, faktor: 2.530, zusKG400_eur: 44, anzahlTueren: null },
  { weGroesse_m2: 49, faktor: 2.515, zusKG400_eur: 42, anzahlTueren: null },
  { weGroesse_m2: 50, faktor: 2.500, zusKG400_eur: 40, anzahlTueren: null },
  { weGroesse_m2: 51, faktor: 2.485, zusKG400_eur: 38, anzahlTueren: null },
  { weGroesse_m2: 52, faktor: 2.470, zusKG400_eur: 36, anzahlTueren: null },
  { weGroesse_m2: 53, faktor: 2.455, zusKG400_eur: 34, anzahlTueren: null },
  { weGroesse_m2: 54, faktor: 2.440, zusKG400_eur: 32, anzahlTueren: null },
  { weGroesse_m2: 55, faktor: 2.425, zusKG400_eur: 30, anzahlTueren: null },
  { weGroesse_m2: 56, faktor: 2.410, zusKG400_eur: 28, anzahlTueren: null },
  { weGroesse_m2: 57, faktor: 2.395, zusKG400_eur: 26, anzahlTueren: null },
  { weGroesse_m2: 58, faktor: 2.380, zusKG400_eur: 24, anzahlTueren: null },
  { weGroesse_m2: 59, faktor: 2.365, zusKG400_eur: 22, anzahlTueren: null },
  { weGroesse_m2: 60, faktor: 2.350, zusKG400_eur: 20, anzahlTueren: null },
  { weGroesse_m2: 61, faktor: 2.335, zusKG400_eur: 18, anzahlTueren: null },
  { weGroesse_m2: 62, faktor: 2.320, zusKG400_eur: 16, anzahlTueren: null },
  { weGroesse_m2: 63, faktor: 2.305, zusKG400_eur: 14, anzahlTueren: null },
  { weGroesse_m2: 64, faktor: 2.290, zusKG400_eur: 12, anzahlTueren: null },
  { weGroesse_m2: 65, faktor: 2.275, zusKG400_eur: 10, anzahlTueren: null },
  { weGroesse_m2: 66, faktor: 2.260, zusKG400_eur: 8, anzahlTueren: null },
  { weGroesse_m2: 67, faktor: 2.245, zusKG400_eur: 6, anzahlTueren: null },
  { weGroesse_m2: 68, faktor: 2.230, zusKG400_eur: 4, anzahlTueren: null },
  { weGroesse_m2: 69, faktor: 2.215, zusKG400_eur: 2, anzahlTueren: null },
  { weGroesse_m2: 70, faktor: 2.200, zusKG400_eur: 0, anzahlTueren: 4.3 },
  { weGroesse_m2: 71, faktor: 2.185, zusKG400_eur: -2, anzahlTueren: null },
  { weGroesse_m2: 72, faktor: 2.170, zusKG400_eur: -4, anzahlTueren: null },
  { weGroesse_m2: 73, faktor: 2.155, zusKG400_eur: -6, anzahlTueren: null },
  { weGroesse_m2: 74, faktor: 2.140, zusKG400_eur: -8, anzahlTueren: null },
  { weGroesse_m2: 75, faktor: 2.125, zusKG400_eur: -10, anzahlTueren: null },
  { weGroesse_m2: 76, faktor: 2.110, zusKG400_eur: -12, anzahlTueren: null },
  { weGroesse_m2: 77, faktor: 2.095, zusKG400_eur: -14, anzahlTueren: null },
];

/** VLOOKUP IW-Faktor by Ø WE-Größe (interpoliert/clamped) */
export function lookupIWFaktor(weGroesse_m2: number): IWFaktorLookup {
  const clamped = Math.max(12, Math.min(77, Math.round(weGroesse_m2)));
  return IW_FAKTOR_LOOKUP.find(e => e.weGroesse_m2 === clamped) ?? IW_FAKTOR_LOOKUP[IW_FAKTOR_LOOKUP.length - 1];
}

// ============================================================
// Baupreisindex (Kostentabellen F13:G52)
// ============================================================

export interface BaupreisIndex {
  quartal: string;
  faktor: number;
}

/** Baupreissteigerung relativ zu Q4 2025 (= 0), ca. 1.5% p.a. */
export const BAUPREIS_INDEX: BaupreisIndex[] = [
  { quartal: 'Q1 2025', faktor: -0.01125 },
  { quartal: 'Q2 2025', faktor: -0.0075 },
  { quartal: 'Q3 2025', faktor: -0.00375 },
  { quartal: 'Q4 2025', faktor: 0 },
  { quartal: 'Q1 2026', faktor: 0.00375 },
  { quartal: 'Q2 2026', faktor: 0.0075 },
  { quartal: 'Q3 2026', faktor: 0.01125 },
  { quartal: 'Q4 2026', faktor: 0.015 },
  { quartal: 'Q1 2027', faktor: 0.01875 },
  { quartal: 'Q2 2027', faktor: 0.0225 },
  { quartal: 'Q3 2027', faktor: 0.02625 },
  { quartal: 'Q4 2027', faktor: 0.03 },
  { quartal: 'Q1 2028', faktor: 0.03375 },
  { quartal: 'Q2 2028', faktor: 0.0375 },
  { quartal: 'Q3 2028', faktor: 0.04125 },
  { quartal: 'Q4 2028', faktor: 0.045 },
  { quartal: 'Q1 2029', faktor: 0.04875 },
  { quartal: 'Q2 2029', faktor: 0.0525 },
  { quartal: 'Q3 2029', faktor: 0.05625 },
  { quartal: 'Q4 2029', faktor: 0.06 },
  { quartal: 'Q1 2030', faktor: 0.06375 },
  { quartal: 'Q2 2030', faktor: 0.0675 },
  { quartal: 'Q3 2030', faktor: 0.07125 },
  { quartal: 'Q4 2030', faktor: 0.075 },
  { quartal: 'Q1 2031', faktor: 0.07875 },
  { quartal: 'Q2 2031', faktor: 0.0825 },
  { quartal: 'Q3 2031', faktor: 0.08625 },
  { quartal: 'Q4 2031', faktor: 0.09 },
  { quartal: 'Q1 2032', faktor: 0.09375 },
  { quartal: 'Q2 2032', faktor: 0.0975 },
  { quartal: 'Q3 2032', faktor: 0.10125 },
  { quartal: 'Q4 2032', faktor: 0.105 },
  { quartal: 'Q1 2033', faktor: 0.10875 },
  { quartal: 'Q2 2033', faktor: 0.1125 },
  { quartal: 'Q3 2033', faktor: 0.11625 },
  { quartal: 'Q4 2033', faktor: 0.12 },
  { quartal: 'Q1 2034', faktor: 0.12375 },
  { quartal: 'Q2 2034', faktor: 0.1275 },
  { quartal: 'Q3 2034', faktor: 0.13125 },
  { quartal: 'Q4 2034', faktor: 0.135 },
  { quartal: 'Q1 2035', faktor: 0.13875 },
  { quartal: 'Q2 2035', faktor: 0.1425 },
  { quartal: 'Q3 2035', faktor: 0.14625 },
  { quartal: 'Q4 2035', faktor: 0.15 },
];

/**
 * Dynamische BPI-Berechnung basierend auf Quartal-Differenz zu Q4 2025.
 * @param quartal - z.B. "Q1 2026"
 * @param bkiPa - Jährliche Baupreissteigerung in Prozent (z.B. 1.5)
 */
export function lookupBaupreisindex(quartal: string, bkiPa: number = 1.5): number {
  // Parse quartal string "Q1 2026" → quarter 1, year 2026
  const match = quartal.match(/Q(\d)\s+(\d{4})/);
  if (!match) return 0;
  const q = parseInt(match[1]);
  const y = parseInt(match[2]);
  // Q4 2025 = reference (quartal 0)
  const refQ = 4;
  const refY = 2025;
  const quartalsAbstand = (y - refY) * 4 + (q - refQ);
  return quartalsAbstand * (bkiPa / 100 / 4);
}

// ============================================================
// Konstruktionsflächenanteil (Kostentabellen I1:I4)
// ============================================================

import type { Gebaeueklasse } from './kostx-types';

export function lookupKonstruktionsflaechenanteil(klasse: Gebaeueklasse): number {
  if (klasse === 3 || klasse === 4 || klasse === 5) return 0.156;
  if (klasse === 'Hochhaus') return 0.17;
  if (klasse === 'sehr hohes Hochhaus') return 0.18;
  if (klasse === 'Wolkenkratzer') return 0.19;
  return 0.156;
}

// ============================================================
// Verkehrsflächengrößen (Kostentabellen L2:M13)
// ============================================================

/** m² pro TH pro Geschoss */
export const VERKEHRSFLAECHE = {
  basis_m2: 25,
  mittelgross_m2: 30,
  hochhaus_m2: 40,
  sehrHohesHochhaus_m2: 50,
  wolkenkratzer_m2: 60,
  thMittelgangLaubengang_m2: 20,
  fluchttreppenhausLG_m2: 16,
  fluchttreppenhaus_m2: 16,
  fluchtwegLaengeLG_m: 20,
  fluchtwegLaengeMG_m: 26,
};

/** Technikfläche pro TH */
export const TECHNIKFLAECHE = {
  ohneFernwaerme_m2: 40,   // Kostentabellen I6
  mitFernwaerme_m2: 32.5,  // Kostentabellen I7
};

// ============================================================
// Bauweise-Kosten (Kostentabellen S2:V4)
// ============================================================

export const BAUWEISE_KOSTEN = {
  Mauerwerk: {
    aussenwand_eurM2: 110,
    wohnungstrennwand_eurM2: 110,
    tragendeWand_eurM2: 110,
    wandstaerke_cm: 24,
  },
  Stahlbeton: {
    aussenwand_eurM2: 140,
    wohnungstrennwand_eurM2: 155,
    tragendeWand_eurM2: 135,
    wandstaerke_cm: 20,
  },
};

// ============================================================
// Energiestandard-Zuschläge (Kostentabellen K52:O54)
// ============================================================

export const ENERGIESTANDARD_ZUSCHLAEGE = {
  'GEG': { aussenwand_eurM2: 0, dach_eurM2: 0, fenster_eurM2: 0 },
  'EH 55': { aussenwand_eurM2: 8, dach_eurM2: 55, fenster_eurM2: 30 },
  'EH 40': { aussenwand_eurM2: 28, dach_eurM2: 75, fenster_eurM2: 50 },
};

// ============================================================
// Sanitärkosten nach WE-Anzahl (Kostentabellen P26:Q60)
// ============================================================

/** Sanitärkosten pro WE (netto) – VLOOKUP nach Anzahl WE */
export function lookupSanitaerkosten(anzahlWE: number): number {
  if (anzahlWE <= 9) return 9000;
  if (anzahlWE <= 30) return 8500;
  return 8000;
}

// ============================================================
// Sonnenschutz-Preise (Kostenmodell W26:Y29)
// ============================================================

export const SONNENSCHUTZ_PREISE: Record<string, number> = {
  'nein': 0,
  'Sonnenschutzverglasung': 50,
  'Raffstore elektr.': 520,
  'Rolladen elektr.': 300,
  'Rolladen manuell': 170,
};

// ============================================================
// Gründach-Zuschläge (Kostenmodell Y19:Y22)
// ============================================================

export const GRUENDACH_ZUSCHLAEGE: Record<string, number> = {
  'nein': 0,
  'extensiv': 35,
  'extensiv, inkl. Retention': 112,
  'intensiv': 145,
};

// ============================================================
// Klinkerriemchen Zuschlag
// ============================================================

export const KLINKER_ZUSCHLAG_NETTO_EURM2 = 145;

// ============================================================
// Küchen-Preise (Kostenmodell X42:Y46, brutto!)
// ============================================================

export const KUECHEN_PREISE_BRUTTO: Record<string, number> = {
  'nein': 0,
  'Küche Ø 4500€': 4500,
  'Küche Ø 6000€': 6000,
  'Küche Ø 8000€': 8000,
  'Küche Ø 10000€': 10000,
};

// ============================================================
// Gebäudeklasse-Zuschläge (Kostenmodell Y10)
// Brutto-Werte pro m² NUF
// ============================================================

export function lookupGebaeudeklasseZuschlag(klasse: Gebaeueklasse): number {
  if (klasse === 'Wolkenkratzer') return 650;
  if (klasse === 'sehr hohes Hochhaus') return 450;
  if (klasse === 'Hochhaus') return 250;
  if (klasse === 5) return 60;
  return 0; // Klasse 3 + 4
}

// ============================================================
// Dachform-Zuschlagsfaktor (Kostenmodell rows 168-170)
// Prozent-Zuschlag auf (Dachkonstruktion + Dachbeläge + Dachbekleidung)
// ============================================================

export const DACHFORM_ZUSCHLAG: Record<string, number> = {
  'Flachdach': 0,
  'Satteldach': 0.4,
  'Walmdach': 0.5,
  'Pultdach': 0.2,
};

// ============================================================
// Skalierungseffekte bei baugleichen Gebäuden (Kostenmodell T22)
// ============================================================

export function lookupSkalierung(baugleicheGebaeude: number): number {
  if (baugleicheGebaeude <= 1) return 0;
  if (baugleicheGebaeude === 2) return 0.03;
  if (baugleicheGebaeude === 3) return 0.05;
  if (baugleicheGebaeude === 4) return 0.075;
  return 0.10;
}

// ============================================================
// Einheitspreise KG 300 (Kostenmodell)
// Alle Preise NETTO €/m² bzw. €/Stk
// ============================================================

export const EP = {
  // KG 310
  herstellung_eurM2: 70,          // Row 83
  
  // KG 320
  baugrundverbesserung_eurM2: 25, // Row 89
  // Bodenplatte: via VLOOKUP
  tiefgruendung_eurM2: 220,       // Row 91
  
  // KG 324 Bodenbeläge (pro m² NUF-Fläche)
  waermedaemmungEPS_eurM2: 10,    // Row 93
  trittschalldaemmung_eurM2: 8,   // Row 94
  trennschichtPE_eurM2: 3,        // Row 95
  heizestrich_eurM2: 30,          // Row 96
  bodenbelag_eurM2: 35,           // Row 97
  parkettZuschlag_eurM2: 15,      // Row 98: 15€ bei Echtholzparkett (0 bei Vinyl)
  sockelleisten_eurLfm: 25,       // Row 99
  gefliesteBaeder_eurM2: 40,      // Row 100
  bodenbelagAllgemein_eurM2: 100, // Row 101
  
  // KG 325 Abdichtungen
  abdichtungW11_eurM2: 19,        // Row 103
  sauberkeitsschicht_eurM2: 13,   // Row 104
  perimeterdaemmung_eurM2: 48,    // Row 105
  trennlagePE_eurM2: 2.5,         // Row 106
  frostschuerzePro_eurLfm: 100,   // Row 107
  
  // KG 330
  fenster_eurM2: 450,             // Row 114
  holzfensterZuschlag_eurM2: 55,  // Doc: +55 bei Holz (in Excel: separate line)
  hauseingangstuer_eurStk: 5000,  // Row 118
  wdvs_eurM2: 110,               // Row 120
  putzInnen_eurM2: 16,            // Row 128
  dispersionsfarbe_eurM2: 13,     // Row 129
  
  // KG 337 Balkone
  balkonBasis_eurStk: 7000,       // Row 131: base price
  
  // KG 340
  tragendeIWBasis_eurM2: 174,     // Row 137: basis
  nichttragIW_eurM2: 119,         // Row 139
  innenstuetzen_eurLfm: 120,      // Row 140
  wohnungstuerTH_eurStk: 1500,    // Row 141: Treppenhauskern
  wohnungstuerLG_eurStk: 2200,    // Row 141: Laubengang
  innentuer_eurStk: 550,          // Row 142
  
  // KG 350
  deckenkonstruktion_eurM2: 117,  // Row 148
  deckenbekleidung_eurM2: 20,     // Row 160/162
  treppe_eurStk: 14000,           // Row 165
  
  // KG 360
  dachkonstruktion_eurM2: 119,    // Row 167: 44+14+34+27
  dampfsperre_eurM2: 15,          // Row 173
  gefaelledaemmung_eurM2: 95,     // Row 175
  dachabdichtung_eurM2: 39,       // Row 178
  dachbekleidung_eurM2: 20,       // Row 180
  
  // KG 380
  laubengang_eurM2: 400,          // Row 188
  
  // KG 390
  beProzent: 0.08,                // Row 196
  kleinteileMauerwerk: 0.144,     // Row 204
  kleinteileStahlbeton: 0.16,     // Row 204
  
  // KG 3XX
  staffelgeschossEineStaffel_brutto: 20, // Y17 formula result when eine Staffel
  staffelgeschossZweiStaffeln_brutto: 30,
  beengterBauraum_brutto: 25,     // Y12
  eh40Materialzuschlag_eurM2: 50, // Row 213
  
  // Untergeschoss
  ugAushub_eurM2: 140,            // Row 226
  ugAussenwand_eurM2: 380,        // Row 228
  ugInnenwand_eurM2: 110,         // Row 229
  ugStuetzen_eurLfm: 130,         // Row 230
  ugDecke_eurM2: 272,             // Row 231
  ugRampe_eurPsch: 30000,         // Row 232
  ugTreppe_eurStk: 14000,         // Row 233
  ugStahltuer_eurStk: 2000,       // Row 234
  ugKG400TG_eurM2: 225,           // Row 235 (TG)
  ugKG400Keller_eurM2: 90,        // Row 235 (Keller)
  ugSonstigesProzent: 0.05,       // Row 236
  ugBEProzent: 0.05,              // Row 237
  
  // KG 400
  kg400Basis_eurM2: 620,          // Kostenmodell C17 formula
  kg400NichtFernwaerme_eurM2: 70, // Y37
  kg400InnenliegendeBaeder_eurM2: 60, // Y38
  kg400PV_eurM2: 630,             // Y39
  kg400EMob_eurProLadestation: 70, // Y47 = 70*N20/C5
  kg400SanitaerBasis_eurProWE: 7000, // aus Formel: C25 - WE*7000
  
  // Kunst am Bau
  kunstAmBauBasis: 10000,         // Row 207: 10000 * NUF/1432
  kunstAmBauRefNUF: 1432,
};

// ============================================================
// HOAI 2021 Honorartabellen
// Extrahiert aus plan.xlsm Sheet "Honorartabellen"
// Format: [anrechenbare Kosten €, Honorar € Zone III Mindestsatz]
// Zone III Mindestsatz = Spalte M (Index 11) in der Excel
// ============================================================

/**
 * Objektplanung Gebäude §33 HOAI
 * Excel: Honorartabellen B16:M52
 */
export const HOAI_OBJEKTPLANUNG: number[][] = [
  [25000, 4339],
  [35000, 5865],
  [50000, 8071],
  [75000, 11601],
  [100000, 15005],
  [150000, 21555],
  [200000, 27863],
  [300000, 39981],
  [500000, 62900],
  [750000, 89927],
  [1000000, 115675],
  [1500000, 165911],
  [2000000, 214108],
  [3000000, 306162],
  [5000000, 478207],
  [7500000, 686862],
  [10000000, 887604],
  [15000000, 1272601],
  [20000000, 1641513],
  [25000000, 1998153],
  [30000000, 2353717],
  [35000000, 2703303],
  [40000000, 3047856],
  [45000000, 3388070],
  [50000000, 3724479],
  [55000000, 4057502],
  [60000000, 4387478],
  [65000000, 4714689],
  [70000000, 5039369],
  [75000000, 5361717],
  [100000000, 6943780],
  [150000000, 9037748],
  [200000000, 11207179],
  [250000000, 13088326],
  [300000000, 14703322],
  [400000000, 17193924],
  [500000000, 18769845],
];

/**
 * Tragwerksplanung §49 HOAI
 * Excel: Honorartabellen B70:M110
 */
export const HOAI_TRAGWERK: number[][] = [
  [15000, 2841],
  [25000, 4247],
  [50000, 7327],
  [75000, 10080],
  [100000, 12639],
  [150000, 17380],
  [250000, 25951],
  [350000, 33776],
  [500000, 44633],
  [750000, 61401],
  [1000000, 76984],
  [1250000, 91740],
  [1500000, 105865],
  [2000000, 132684],
  [3000000, 182321],
  [5000000, 271781],
  [7500000, 373640],
  [10000000, 468166],
  [15000000, 642943],
  [20000000, 806479],
  [25000000, 961469],
  [30000000, 1109974],
  [35000000, 1253295],
  [40000000, 1392323],
  [45000000, 1527703],
  [50000000, 1659923],
  [55000000, 1789364],
  [60000000, 1916331],
  [65000000, 2076025],
  [70000000, 2235719],
  [75000000, 2395413],
  [100000000, 3193884],
  [150000000, 3634244],
  [200000000, 4384505],
  [250000000, 5011873],
  [300000000, 5537421],
  [400000000, 6366153],
  [500000000, 7055362],
];

/**
 * Technische Ausrüstung §53 HOAI (Zone III Mindestsatz)
 *
 * WICHTIG: Die Excel verwendet für TGA-AG-Lookup NICHT die TGA-Kostenspalte
 * als X-Achse, sondern die Objektplanung IV_Max-Werte (Named Range "tr").
 * Die Y-Werte kommen aus TGA Zone III Min (Named Range "klmr").
 * Beide sind zeilenweise aligned: Objektplanung Row 16 ↔ TGA Row 120.
 *
 * Excel: FORECAST(agKosten, OFFSET(klmr, MATCH(agKosten, tr)-1, 0, 2),
 *                           OFFSET(tr, MATCH(agKosten, tr)-1, 0, 2))
 *
 * Format: [Objektplanung_IV_Max (tr), TGA_Zone_III_Min (klmr)]
 */
export const HOAI_TGA: number[][] = [
  [6094, 0],
  [8237, 2990],
  [11336, 5174],
  [16293, 7131],
  [21074, 10681],
  [30274, 13934],
  [39134, 18465],
  [56153, 25418],
  [88343, 31872],
  [126301, 43800],
  [162464, 65418],
  [233022, 113168],
  [300714, 155836],
  [430003, 195448],
  [671640, 232891],
  [964694, 268660],
  [1246635, 336331],
  [1787360, 400650],
  [2305496, 462044],
  [2806395, 521052],
  [3305782, 578046],
  [3796774, 744745],
  [4280696, 902351],
  [4758526, 1053210],
  [5231009, 1198751],
  [5698738, 1431976],
  [6162189, 1655918],
  [6621754, 1906772],
  [7077765, 2179168],
  [7530501, 2451564],
  [9752500, 2723960],
  [12693466, 2795680],
  [15740421, 3144161],
  [18382480, 3478501],
  [20650733, 3800438],
  [24148769, 4111306],
  [26362142, 4412160],
];

/**
 * TGA Anlagengruppen-Aufteilung für "sonstige Industrie" (Default).
 * Excel: Honorartabellen K281-K289 + Honorarrechner rows 96-103
 */
export const TGA_AG_SPLIT = [
  { name: 'AG 1-3', anteil: 0.57 },
  { name: 'AG 4-5', anteil: 0.34 },
  { name: 'AG 6', anteil: 0.07 },
  { name: 'AG 7-8', anteil: 0.02 },
];

/**
 * Freianlagen §40 HOAI (Zone III Mindestsatz)
 * Excel: Honorartabellen B181:M221
 */
export const HOAI_FREIANLAGEN: number[][] = [
  [20000, 5229],
  [25000, 6325],
  [30000, 7388],
  [35000, 8426],
  [40000, 9441],
  [50000, 11416],
  [60000, 13332],
  [75000, 16116],
  [100000, 20574],
  [125000, 24855],
  [150000, 28998],
  [200000, 36958],
  [250000, 44576],
  [350000, 59066],
  [500000, 79383],
  [650000, 99212],
  [800000, 118326],
  [1000000, 142942],
  [1250000, 172600],
  [1500000, 201261],
  [2000000, 257439],
  [2500000, 311614],
  [3000000, 364245],
  [3500000, 415627],
  [4000000, 465964],
  [4500000, 515405],
  [6000000, 659377],
  [10000000, 1021300],
  [15000000, 1445534],
  [20000000, 1796310],
  [25000000, 2157978],
  [30000000, 2503469],
  [35000000, 2835127],
  [40000000, 3154621],
  [45000000, 3463209],
  [50000000, 3761879],
  [75000000, 5130522],
  [100000000, 6333016],
  [150000000, 8379268],
  [200000000, 10096151],
  [250000000, 11615404],
];

/**
 * Wärmeschutz & Energiebilanzierung HOAI (Zone III Mindestsatz)
 * Also used for Bauakustik.
 * Excel: Honorartabellen C325:N358
 */
export const HOAI_WAERMESCHUTZ: number[][] = [
  [250000, 6137],
  [300000, 6211],
  [350000, 6285],
  [400000, 6359],
  [450000, 6433],
  [500000, 6507],
  [1000000, 7245],
  [1500000, 7984],
  [2000000, 8722],
  [2500000, 9460],
  [3000000, 10199],
  [3500000, 10937],
  [4000000, 11676],
  [4500000, 12414],
  [5000000, 13153],
  [10000000, 20537],
  [15000000, 27921],
  [20000000, 35305],
  [25000000, 42690],
  [30000000, 55324],
  [35000000, 63255],
  [40000000, 67330],
  [45000000, 74640],
  [50000000, 81868],
  [55000000, 89022],
  [60000000, 96110],
  [65000000, 103139],
  [70000000, 110112],
  [75000000, 117034],
  [80000000, 123909],
  [85000000, 130741],
  [90000000, 137532],
  [95000000, 144285],
  [100000000, 151001],
];

/**
 * Entwurfsvermessung (Zone III Mindestsatz)
 * Excel: Honorartabellen B425:M447
 */
export const HOAI_VERMESSUNG_ENTWURF: number[][] = [
  [51129, 2761],
  [100000, 3934],
  [150000, 5038],
  [200000, 5952],
  [250000, 6761],
  [300000, 7472],
  [350000, 8215],
  [400000, 8923],
  [450000, 9664],
  [500000, 10375],
  [750000, 12729],
  [1000000, 15029],
  [1500000, 19629],
  [2000000, 24229],
  [2500000, 28829],
  [3000000, 33429],
  [3500000, 38029],
  [4000000, 42629],
  [4500000, 47229],
  [5000000, 51829],
  [7500000, 74829],
  [10000000, 97829],
];

/**
 * Bauvermessung (Zone III Mindestsatz)
 * Excel: Honorartabellen B464:M500
 */
export const HOAI_VERMESSUNG_BAU: number[][] = [
  [250000, 2284],
  [275000, 2431],
  [300000, 2574],
  [350000, 2847],
  [400000, 3108],
  [500000, 3598],
  [600000, 4055],
  [750000, 4694],
  [1000000, 5669],
  [1250000, 6563],
  [1500000, 7397],
  [2000000, 8934],
  [2500000, 10343],
  [3500000, 12901],
  [5000000, 16307],
  [7500000, 21287],
  [10000000, 25719],
  [15000000, 33582],
  [20000000, 40583],
  [25000000, 47008],
  [30000000, 53007],
  [35000000, 58675],
  [40000000, 64075],
  [45000000, 69251],
  [50000000, 74235],
  [55000000, 79053],
  [60000000, 83726],
  [65000000, 88269],
  [70000000, 92695],
  [75000000, 97017],
  [80000000, 101242],
  [85000000, 105379],
  [90000000, 109435],
  [95000000, 113416],
  [100000000, 117328],
];
