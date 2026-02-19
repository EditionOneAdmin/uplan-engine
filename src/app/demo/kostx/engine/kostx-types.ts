/**
 * KostX Engine — TypeScript Type Definitions
 * Abbildung aller Datenstrukturen aus plan.xlsm
 */

// ============================================================
// A.1 Eingabeparameter
// ============================================================

export type Gebaeudeform = 'Rechteck' | 'Individuell';
export type Bauweise = 'Mauerwerk' | 'Stahlbeton';
export type KKWMethode = 'konservativ' | 'Balkone zu 25 % berücksichtigt' | 'Balkone zu 50 % berücksichtigt';
export type Untergeschoss = 'nein' | 'keine Angabe' | 'Keller' | 'Tiefgarage (einzeln)';
export type Energiestandard = 'GEG' | 'EH 55' | 'EH 40';
export type Erschliessungstyp = 'Treppenhauskern' | 'Laubengang' | 'Mittelgang';
export type Fussbodenbelag = 'Qualitätsniveau: Vinyl' | 'Qualitätsniveau: Echtholzparkett';
export type Dachform = 'Flachdach' | 'Satteldach' | 'Walmdach' | 'Pultdach';
export type Staffelgeschoss = 'nein' | 'Ja, eine Staffel' | 'Ja, zwei Staffeln';
export type Gruendach = 'nein' | 'extensiv' | 'extensiv, inkl. Retention' | 'intensiv';
export type Fenstermaterial = 'Kunststoff' | 'Holz';
export type Sonnenschutz = 'nein' | 'Raffstore elektr.' | 'Rolladen elektr.' | 'Rolladen manuell' | 'Sonnenschutzverglasung';
export type Fassadengestaltung = 'WDVS' | 'WDVS mit Klinkerriemchen';
export type Balkontyp = 'vorgestellte Balkone' | 'hängende Balkone' | 'Loggien';
export type Energieversorgung = 'Fernwärme' | 'Luftwasserwärmepumpe' | 'Enercube' | 'geothermische Wärmepumpe';
export type PositionierungBaeder = 'an Außenwand' | 'innenliegend';
export type Kuechen = 'nein' | 'Küche Ø 4500€' | 'Küche Ø 6000€' | 'Küche Ø 8000€' | 'Küche Ø 10000€';
export type Gebaeueklasse = 3 | 4 | 5 | 'Hochhaus' | 'sehr hohes Hochhaus' | 'Wolkenkratzer';

export interface ExtraKosten {
  name: string;
  betrag_eur: number;
  kg: 'KG 300' | 'KG 400';
}

export interface KostXConfig {
  // A.1.1 Gebäudeparameter (Primary)
  gebaeudeform: Gebaeudeform;
  anzahlWE: number;
  laenge_m: number;           // Rechteck: Länge in m; Individuell: Grundfläche in m²
  breite_m: number;           // Rechteck: Breite in m; Individuell: Umfang in m
  geschosse: number;
  raumhoehe_m: number;        // lichte Raumhöhe oi
  bauweise: Bauweise;
  untergeschoss: Untergeschoss;
  unterkellerungsanteil: number; // 0.1–1.0
  kkwMethode: KKWMethode;

  // A.1.2 Kosteneinflüsse (Secondary)
  baubeginn: string;          // z.B. "Q1 2026"
  regionalfaktor: number;
  guZuschlag: number;         // 0–0.30
  energiestandard: Energiestandard;
  beengterBauraum: boolean;
  tiefgruendung: boolean;
  zusNebenraeumeOi_m2: number;
  erschliessungstyp: Erschliessungstyp;
  fussbodenbelag: Fussbodenbelag;

  // A.1.2 Dach
  dachform: Dachform;
  staffelgeschoss: Staffelgeschoss;
  staffel1Prozent: number;    // 0.3–1.0
  staffel2Prozent: number;    // 0.3–1.0
  gruendach: Gruendach;

  // A.1.3 Fassade & Balkone
  fensteranteil: number;      // 0.10–0.60
  fenstermaterial: Fenstermaterial;
  sonnenschutz: Sonnenschutz;
  sonnenschutzAnteil: number; // 0–1.0
  fassadengestaltung: Fassadengestaltung;
  fassadenanteilKlinker: number; // 0–1.0
  balkoneAnteil: number;      // 0–1.0
  balkontyp: Balkontyp;
  balkongroesse_m2: number;

  // A.1.4 Gebäudetechnik
  energieversorgung: Energieversorgung;
  positionierungBaeder: PositionierungBaeder;
  pvAnlage: boolean;
  pvDachanteil: number;       // 0–1.0
  eMobilitaet: boolean;
  ladestationen: number;
  kuechen: Kuechen;
  kunstAmBau: boolean;

  // A.1.5 Erweitert
  individuelleTH: boolean;
  anzahlTH: number;
  anzahlSicherheitsTH: number;
  detailberechnungVK: boolean;
  vkFlaecheProTH_m2: number;
  baugleicheGebaeude: number;
  mengenrabatt: number;       // 0–1.0
  manuelleFlaechenI: boolean;
  manuelleGR_m2?: number;
  manuelleBGFoi_m2?: number;
  manuelleBGFui_m2?: number;
  manuelleBGFS_m2?: number;
  manuelleNUF_m2?: number;
  manuelleFlaechenII: boolean;
  manuelleAWF_m2?: number;
  manuelleIWF_m2?: number;
  manuelleDEF_m2?: number;
  manuelleDAF_m2?: number;
  manuelleFF_m2?: number;

  // A.1.5 Gewerbe
  gewerbeflaecheVollausbau_m2: number;
  gewerbeflaecheRohbau_m2: number;

  // A.1.6 Wirtschaftlichkeit
  zielRendite: number;        // z.B. 0.05
  bewirtschaftung: number;    // z.B. 0.05
  multi: number;              // Vervielfältiger
  kg100_eurM2: number;        // €/m² NUF
  kg200_eurM2: number;
  kg500_eurM2: number;
  kg700Sonstige_eurM2: number;
  interneKostenProzent: number;
  baukostenreserveProzent: number;
  sonstigeKosten_eurM2: number;
  foerderung_eurM2: number;

  // Extra-Kosten
  extraKosten: ExtraKosten[];
}

// ============================================================
// A.2 Berechnete Massen
// ============================================================

export interface MassCalculation {
  gr_m2: number;                   // Grundfläche
  bgfRoi_m2: number;              // BGF R oberirdisch
  bgfS_m2: number;                // BGF S (Balkone + Laubengang)
  bgfRui_m2: number;              // BGF R unterirdisch
  nufR_m2: number;                // Nutzfläche R gesamt
  nufRW_m2: number;               // Nutzfläche R Wohnen
  nufSW_m2: number;               // Nutzfläche S Wohnen (Balkone×Faktor)
  nufGewerbe_m2: number;          // Nutzfläche Gewerbe
  vkTf_m2: number;                // Verkehrs- + Technikfläche
  awf_m2: number;                 // Außenwandfläche
  iwf_m2: number;                 // Innenwandfläche einseitig
  def_m2: number;                 // Deckenfläche
  daf_m2: number;                 // Dachfläche
  ff_m2: number;                  // Fensterfläche
  gebaeudehoehe_m: number;        // Gebäudehöhe
  gebaeudeklasse: Gebaeueklasse;
  avgWeGroesse_m2: number;        // Ø WE-Größe
  anzahlTH: number;               // Treppenhäuser
  anzahlSicherheitsTH: number;
  konstruktionsflaechenanteil: number;
  nutzflaecheneffizienz: number;  // NUF / BGF R oi
  fassadeneffizienz: number;      // AWF / NUF
  umfang_m: number;               // Gebäudeumfang
  staffelabzugBGF_m2: number;     // Staffelgeschoss-Abzug
  staffelabzugAWF_m2: number;
  /** Erlösfläche = NUF R + NUF S */
  erloesflaecheWarm_m2: number;
}

// ============================================================
// A.4 KG 300 Kostenaufschlüsselung
// ============================================================

export interface KGPosition {
  kg: string;
  bezeichnung: string;
  menge: number;
  einheit: string;
  einheitspreis_eurNetto: number;
  gesamtkosten_eurNetto: number;
  gesamtkosten_eurBrutto: number;
}

export interface KGGruppe {
  kg: string;
  bezeichnung: string;
  positionen: KGPosition[];
  total_eurNetto: number;
  total_eurBrutto: number;
}

export interface CostBreakdown {
  kg310: KGGruppe;
  kg320: KGGruppe;
  kg330: KGGruppe;
  kg340: KGGruppe;
  kg350: KGGruppe;
  kg360: KGGruppe;
  kg380: KGGruppe;
  kg390: KGGruppe;
  kg3XX: KGGruppe;
  total_eurNetto: number;
  total_eurBrutto: number;
}

// ============================================================
// A.5 KG 400
// ============================================================

export interface KG400Result {
  basisKG400_eurM2Netto: number;
  total_eurNetto: number;
  total_eurBrutto: number;
  /** €/m² NUF brutto */
  kkw_eurM2Brutto: number;
}

// ============================================================
// A.6 Untergeschoss
// ============================================================

export interface BasementCost {
  positionen: KGPosition[];
  totalKG300_eurNetto: number;
  totalKG400_eurNetto: number;
  total_eurNetto: number;
  total_eurBrutto: number;
  /** €/m² NUF brutto */
  kkwKG300_eurM2Brutto: number;
  kkwKG400_eurM2Brutto: number;
}

// ============================================================
// A.7 GIK & Economics
// ============================================================

export interface GIKCalculation {
  kg100_eur: number;
  kg200_eur: number;
  kg300_400_eur: number;
  kg500_eur: number;
  kg700Honorare_eur: number;
  kg700Sonstige_eur: number;
  interneKosten_eur: number;
  baukostenreserve_eur: number;
  sonstigeKosten_eur: number;
  foerderung_eur: number;
  gik_eur: number;
  /** €/m² NUF */
  gik_eurM2: number;
}

export interface EconomicsResult {
  mieteinnahmen_eurM2Monat: number;
  nettorendite: number;
  gikMarge: number;
  verkaufspreis_eurM2: number;
}

// ============================================================
// Waterfall / Zuschläge
// ============================================================

export interface ZuschlagItem {
  label: string;
  wert_eurM2: number;
  typ: 'basis' | 'zuschlag' | 'abzug' | 'summe';
}

// ============================================================
// Gesamtergebnis
// ============================================================

export interface KostXResult {
  masses: MassCalculation;
  kg300: CostBreakdown;
  kg400: KG400Result;
  basement: BasementCost | null;
  /** KG 300+400 €/m² NUF brutto */
  basisHaus_eurM2: number;
  zuschlaege: ZuschlagItem[];
  gik: GIKCalculation;
  economics: EconomicsResult;
}
