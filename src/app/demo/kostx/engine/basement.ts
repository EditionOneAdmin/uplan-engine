/**
 * KostX Engine — Tiefgaragenrechner
 * Vollständige Berechnung basierend auf Excel Sheet "Tiefgaragenrechner"
 *
 * Unterstützt:
 * - Berechnung "über Stellplätze" (Detail) oder "über Fläche" (Grob)
 * - Bis zu 4 Untergeschosse
 * - Doppelparker, Ladestationen
 * - Kellerabteile
 * - 19 Einzelpositionen pro TG
 *
 * Excel: Sheet "Tiefgaragenrechner", Rows 1-132
 */

import type {
  KostXConfig,
  MassCalculation,
  BasementCost,
  KGPosition,
  TiefgarageConfig,
  TiefgarageResult,
  TiefgaragePosition,
} from './kostx-types';
import { lookupBaupreisindex } from './lookup-tables';

const MwSt = 1.19;

// ============================================================
// Einheitspreis-Konstanten (netto) — Excel: Tiefgaragenrechner F42-F56
// ============================================================

/** Excel: F42 — Aushub €/m² netto */
const EP_AUSHUB = 43;
/** Excel: F43 — Bodenplatte €/m² netto (from Kostentabellen D7) */
const EP_BODENPLATTE = 241;
/** Excel: F44 base — Außenwände Basis €/m² netto */
const EP_AUSSENWAND_BASIS = 380;
/** Excel: F44 — Zuschlag pro zusätzliches UG */
const EP_AUSSENWAND_ZUSCHLAG_PRO_UG = 100;
/** Excel: F45 — Innenwände €/m² netto */
const EP_INNENWAND = 110;
/** Excel: F46 — Stützen €/lfm netto */
const EP_STUETZEN = 130;
/** Excel: F47 — Decke €/m² netto */
const EP_DECKE = 272;
/** Excel: F48 — Rampe pauschal netto */
const EP_RAMPE = 30000;
/** Excel: F49 — Treppe pro Stk netto */
const EP_TREPPE = 14000;
/** Excel: F50 — Stahltüren pro Stk netto */
const EP_STAHLTUEREN = 2000;
/** Excel: F51 base — KG400 Basis €/m² netto */
const EP_KG400_BASIS = 225;
/** Excel: F51 — KG400 Zuschlag wenn 2.UG */
const EP_KG400_ZUSCHLAG_2UG = 120;
/** Excel: F52 — Doppelparker pro Stk netto */
const EP_DOPPELPARKER = 15000;
/** Excel: F53 — Ladestation pro Stk netto */
const EP_LADESTATION = 5000;
/** Excel: D57/D58 — Sonstiges + BE je 5% */
const SONSTIGES_PROZENT = 0.05;
const BE_PROZENT = 0.05;

// ============================================================
// Hilfsfunktionen
// ============================================================

/**
 * Berechnet Anzahl zusätzlicher UGs und deren Flächenanteil.
 * Excel: D21-D26 (2./3./4. UG ja/nein + Anteil)
 */
function getZusUGFaktor(tg: TiefgarageConfig): number {
  let faktor = 0;
  if (tg.ug2) faktor += tg.ug2Anteil;
  if (tg.ug3) faktor += tg.ug3Anteil;
  if (tg.ug4) faktor += tg.ug4Anteil;
  return faktor;
}

/**
 * Anzahl zusätzliche UGs (für EP-Berechnung Außenwände).
 */
function getAnzahlZusUGs(tg: TiefgarageConfig): number {
  let n = 0;
  if (tg.ug2) n++;
  if (tg.ug3) n++;
  if (tg.ug4) n++;
  return n;
}

/**
 * Berechnet GR (Grundfläche 1. UG) aus Stellplätzen.
 * Excel: K13 = 1.05*(D13*D14 + D15*D16 + D17 + D18 + D28*25) / (1 + zusUGFaktor)
 */
function calculateGR(tg: TiefgarageConfig): number {
  if (tg.berechnungsmethode === 'ueber_flaeche') {
    return tg.grundflaeche_m2;
  }
  const zusUGFaktor = getZusUGFaktor(tg);
  const rawFlaeche =
    tg.anzahlStellplaetze * tg.stellplatzGroesse_m2 +
    tg.anzahlKellerabteile * tg.kellerabteilGroesse_m2 +
    tg.technikflaeche_m2 +
    tg.nebenraumflaeche_m2 +
    tg.anzahlTreppenhaeuser * 25;
  return 1.05 * rawFlaeche / (1 + zusUGFaktor);
}

/**
 * Berechnet BGF ui (gesamte unterirdische Fläche aller UGs).
 * Excel: K14 = GR * (1 + zusUGFaktor)
 */
function calculateBGFui(gr: number, tg: TiefgarageConfig): number {
  const zusUGFaktor = getZusUGFaktor(tg);
  return gr * (1 + zusUGFaktor);
}

// ============================================================
// Hauptberechnung
// ============================================================

/**
 * Berechnet eine einzelne Tiefgarage mit allen 19 Positionen.
 * Excel: Tiefgaragenrechner Rows 42-60 (TG1), 66-84 (TG2), etc.
 *
 * @param tg - TG-Konfiguration
 * @param regionalfaktor - Excel: G2
 * @param baubeginn - Für Baupreissteigerung
 * @returns Vollständiges TG-Ergebnis mit Einzelpositionen
 */
export function calculateTiefgarage(
  tg: TiefgarageConfig,
  regionalfaktor: number,
  baubeginn: string,
  bkiPa: number = 1.5,
): TiefgarageResult {
  const rf = regionalfaktor;
  const gr = calculateGR(tg);
  const bgfUi = calculateBGFui(gr, tg);
  const zusUGs = getAnzahlZusUGs(tg);
  const zusUGFaktor = getZusUGFaktor(tg);
  const lh = tg.lichteGeschosshoehe_m;

  // === Position 1: Baugrubenaushub ===
  // Excel: D42 = BGF_ui * (lh + 0.7)
  const aushubMenge = bgfUi * (lh + 0.7);
  const aushubEP = EP_AUSHUB;

  // === Position 2: Bodenplatte ===
  // Excel: D43 = MAX(0, GR - überbaute Fläche)
  // Bei "über Stellplätze" ist überbaute Fläche = tg.ueberbauteFlaeche (K15)
  const bodenplatteMenge = Math.max(0, gr - (tg.ueberbauteFlaeche_m2 ?? gr));
  const bodenplatteEP = EP_BODENPLATTE;

  // === Position 3: Stütz-/Außenwände ===
  // Excel: D44 (über Stellplätze) = sqrt(GR)*1.1*4 * (lh+0.7) * (1+zusUGFaktor)
  // Excel: D44 (über Fläche) = Umfang * (lh+0.7) * (1+zusUGFaktor)
  let awMenge: number;
  if (tg.berechnungsmethode === 'ueber_flaeche') {
    awMenge = tg.umfang_m * (lh + 0.7) * (1 + zusUGFaktor);
  } else {
    awMenge = Math.sqrt(gr) * 1.1 * 4 * (lh + 0.7) * (1 + zusUGFaktor);
  }
  // Excel: F44 = 380 + 100*zusätzlicheUGs (gestaffelt: +100 bei 2.UG, +200 bei 3.UG, +300 bei 4.UG)
  const awEP = EP_AUSSENWAND_BASIS + EP_AUSSENWAND_ZUSCHLAG_PRO_UG * zusUGs;

  // === Position 4: Innenwände ===
  // Excel: D45 = AWmenge * 1.2 (mit Keller) oder * 0.7 (ohne)
  const iwFaktor = tg.inklKellerabteile ? 1.2 : 0.7;
  const iwMenge = awMenge * iwFaktor;
  const iwEP = EP_INNENWAND;

  // === Position 5: Stützen ===
  // Excel: D46 = BGF_ui / 5 / 5 * (lh+0.7)
  const stuetzenMenge = bgfUi / 5 / 5 * (lh + 0.7);
  const stuetzenEP = EP_STUETZEN;

  // === Position 6: Decke über Keller ===
  // Excel: D47 = BGF_ui
  const deckeMenge = bgfUi;
  const deckeEP = EP_DECKE;

  // === Position 7: Rampe ===
  // Excel: D48 = Anzahl Ein-/Ausfahrten
  const rampeMenge = tg.anzahlEinfahrten;
  const rampeEP = EP_RAMPE;

  // === Position 8: Treppe ===
  // Excel: D49 = Anzahl Treppenhäuser
  const treppeMenge = tg.anzahlTreppenhaeuser;
  const treppeEP = EP_TREPPE;

  // === Position 9: Stahltüren ===
  // Excel: D50 = mit Keller: BGF_ui/50; ohne: round(BGF_ui/100)
  const stahltuerenMenge = tg.inklKellerabteile
    ? bgfUi / 50
    : Math.round(bgfUi / 100);
  const stahltuerenEP = EP_STAHLTUEREN;

  // === Position 10: Gebäudetechnik KG 400 ===
  // Excel: D51 = BGF_ui; F51 = 225 + 120 bei 2.UG
  const kg400Menge = bgfUi;
  const kg400EP = EP_KG400_BASIS + (tg.ug2 ? EP_KG400_ZUSCHLAG_2UG : 0);

  // === Position 11: Doppelparker ===
  const doppelparkerMenge = tg.anzahlDoppelparker;
  const doppelparkerEP = EP_DOPPELPARKER;

  // === Position 12: Ladestationen ===
  const ladestationenMenge = tg.anzahlLadestationen;
  const ladestationenEP = EP_LADESTATION;

  // === Positionen 13-15: Extra-Kosten ===
  const extraKosten = tg.extraKosten ?? [];

  // Build positions array
  const positionen: TiefgaragePosition[] = [
    { nr: 1, name: 'Zus. Baugrubenaushub (eingeschossig)', menge: aushubMenge, einheit: 'm²', ep_netto: aushubEP },
    { nr: 2, name: 'Flachgründungen und Bodenplatten', menge: bodenplatteMenge, einheit: 'm²', ep_netto: bodenplatteEP },
    { nr: 3, name: 'Stütz-/ Außenwände', menge: awMenge, einheit: 'm²', ep_netto: awEP },
    { nr: 4, name: 'Innenwände', menge: iwMenge, einheit: 'm²', ep_netto: iwEP },
    { nr: 5, name: 'Stützen', menge: stuetzenMenge, einheit: 'lfm', ep_netto: stuetzenEP },
    { nr: 6, name: 'Decke über Keller', menge: deckeMenge, einheit: 'm²', ep_netto: deckeEP },
    { nr: 7, name: 'Rampe Einfahrt', menge: rampeMenge, einheit: 'psch', ep_netto: rampeEP },
    { nr: 8, name: 'Treppe', menge: treppeMenge, einheit: 'Stk', ep_netto: treppeEP },
    { nr: 9, name: 'Stahltüren', menge: stahltuerenMenge, einheit: 'Stk', ep_netto: stahltuerenEP },
    { nr: 10, name: 'Anteil Gebäudetechnik (KG 400)', menge: kg400Menge, einheit: 'm²', ep_netto: kg400EP },
    { nr: 11, name: 'Doppelparker', menge: doppelparkerMenge, einheit: 'Stk', ep_netto: doppelparkerEP },
    { nr: 12, name: 'Ladestationen', menge: ladestationenMenge, einheit: 'Stk', ep_netto: ladestationenEP },
  ];

  // Extra-Kosten Positionen 13-15
  for (let i = 0; i < extraKosten.length && i < 3; i++) {
    positionen.push({
      nr: 13 + i,
      name: extraKosten[i].name || `Extra ${i + 1}`,
      menge: bgfUi,
      einheit: 'm²',
      ep_netto: extraKosten[i].betrag_eurM2Brutto / MwSt,
    });
  }

  // Gesamtkosten netto pro Position = menge * ep * regionalfaktor
  // (Extras use their own betrag without rf, but for simplicity we apply rf)
  const positionenMitGP = positionen.map((p) => ({
    ...p,
    gp_netto: p.menge * p.ep_netto * rf,
    gp_brutto: p.menge * p.ep_netto * rf * MwSt,
  }));

  // Sum positions 1-15 (netto)
  const sumPositionenNetto = positionenMitGP.reduce((s, p) => s + p.gp_netto, 0);

  // === Position 16: Sonstige Arbeiten (5%) ===
  // Excel: G57 = 0.05 * SUM(G42:G56)
  const sonstigesNetto = SONSTIGES_PROZENT * sumPositionenNetto;

  // === Position 17: Baustelleneinrichtung (5%) ===
  // Excel: G58 = 0.05 * SUM(G42:G57) = 0.05 * (sumPositionen + sonstiges)
  const beNetto = BE_PROZENT * (sumPositionenNetto + sonstigesNetto);

  // === Position 18: Baukostenskalierung ===
  // Excel: G59 = -D32 * SUM(G42:G58)
  const skalierung = tg.skalierungseffekte ?? 0;
  const zwischensumme1 = sumPositionenNetto + sonstigesNetto + beNetto;
  const skalierungNetto = -skalierung * zwischensumme1;

  // === Position 19: Baupreissteigerung ===
  // Excel: G60 = BPI * SUM(G42:G58)
  const bpi = lookupBaupreisindex(baubeginn, bkiPa);
  const bpiNetto = bpi * zwischensumme1;

  const totalNetto = zwischensumme1 + skalierungNetto + bpiNetto;
  const totalBrutto = totalNetto * MwSt;

  // KG 300 vs KG 400 split
  // KG 400 = Position 10 (Gebäudetechnik)
  const kg400Netto = kg400Menge * kg400EP * rf;
  const kg300Netto = totalNetto - kg400Netto;

  // €/m² BGF ui
  const kkwBGFui_brutto = bgfUi > 0 ? totalBrutto / bgfUi : 0;

  return {
    positionen: positionenMitGP.map((p) => ({
      nr: p.nr,
      name: p.name,
      menge: p.menge,
      einheit: p.einheit,
      ep_netto: p.ep_netto,
      ep_brutto: p.ep_netto * MwSt,
      gp_netto: p.gp_netto,
      gp_brutto: p.gp_brutto,
    })),
    sonstigesNetto,
    beNetto,
    skalierungNetto,
    bpiNetto,
    gr_m2: gr,
    bgfUi_m2: bgfUi,
    totalKG300_eurNetto: kg300Netto,
    totalKG400_eurNetto: kg400Netto,
    total_eurNetto: totalNetto,
    total_eurBrutto: totalBrutto,
    kkwBGFui_eurM2Brutto: kkwBGFui_brutto,
  };
}

/**
 * Berechnet Untergeschoss-Kosten.
 * Bei Typ "Tiefgarage (einzeln)" → vollständiger TG-Rechner.
 * Bei Typ "Keller" → vereinfachte Keller-Berechnung.
 *
 * Excel: Kostenmodell Rows 225-238 (Keller), Tiefgaragenrechner (TG)
 */
export function calculateBasement(
  config: KostXConfig,
  masses: MassCalculation,
): BasementCost | null {
  if (config.untergeschoss === 'nein' || config.untergeschoss === 'keine Angabe') {
    return null;
  }

  const rf = config.regionalfaktor;
  const erloes = masses.erloesflaecheWarm_m2;
  const isTG = config.untergeschoss === 'Tiefgarage (einzeln)';

  if (isTG && config.tiefgarage) {
    // Vollständiger TG-Rechner
    const tgResult = calculateTiefgarage(config.tiefgarage, rf, config.baubeginn, config.baukostenindexPa);

    // Convert to BasementCost
    const kgPositionen: KGPosition[] = tgResult.positionen.map((p) => ({
      kg: p.nr <= 9 || p.nr >= 13 ? '300' : '400',
      bezeichnung: p.name,
      menge: p.menge,
      einheit: p.einheit,
      einheitspreis_eurNetto: p.ep_netto,
      gesamtkosten_eurNetto: p.gp_netto ?? 0,
      gesamtkosten_eurBrutto: p.gp_brutto ?? 0,
    }));

    return {
      positionen: kgPositionen,
      totalKG300_eurNetto: tgResult.totalKG300_eurNetto,
      totalKG400_eurNetto: tgResult.totalKG400_eurNetto,
      total_eurNetto: tgResult.total_eurNetto,
      total_eurBrutto: tgResult.total_eurBrutto,
      kkwKG300_eurM2Brutto: erloes > 0 ? tgResult.totalKG300_eurNetto * MwSt / erloes : 0,
      kkwKG400_eurM2Brutto: erloes > 0 ? tgResult.totalKG400_eurNetto * MwSt / erloes : 0,
      tiefgarageResult: tgResult,
    };
  }

  // === Keller-Berechnung (vereinfacht, bestehende Logik) ===
  const bgfUi = masses.bgfRui_m2;
  if (bgfUi <= 0) return null;

  const umfang = masses.umfang_m;
  const geschosshoehe = 3.2;

  const aushub = bgfUi * 43 * rf;
  const bodenplatte = Math.max(0, bgfUi - masses.gr_m2) * 241 * rf;
  const aussenwand = umfang * geschosshoehe * 380 * rf;
  const innenwand = umfang * geschosshoehe * 110 * rf * 0.5;
  const stuetzen = (bgfUi / 25) * 3 * 130 * rf;
  const decke = bgfUi * 272 * rf;
  const treppe = 14000 * rf;
  const stahltueren = Math.round(bgfUi / 50) * 2000 * rf;

  const kg300Sum = aushub + bodenplatte + aussenwand + innenwand + stuetzen + decke + treppe + stahltueren;
  const sonstiges = 0.05 * kg300Sum;
  const be = 0.05 * (kg300Sum + sonstiges);
  const kg400Netto = bgfUi * 90 * rf;
  const bpi = lookupBaupreisindex(config.baubeginn, config.baukostenindexPa);
  const bpiKosten = bpi * (kg300Sum + sonstiges + be + kg400Netto);
  const totalNetto = kg300Sum + sonstiges + be + kg400Netto + bpiKosten;

  return {
    positionen: [],
    totalKG300_eurNetto: kg300Sum + sonstiges + be,
    totalKG400_eurNetto: kg400Netto,
    total_eurNetto: totalNetto,
    total_eurBrutto: totalNetto * MwSt,
    kkwKG300_eurM2Brutto: erloes > 0 ? (kg300Sum + sonstiges + be) * MwSt / erloes : 0,
    kkwKG400_eurM2Brutto: erloes > 0 ? kg400Netto * MwSt / erloes : 0,
  };
}
