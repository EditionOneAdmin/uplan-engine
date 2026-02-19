/**
 * KostX Engine — KG 300 Baukonstruktion
 * Alle Formeln aus KOSTX_PLANUNG.md Abschnitt A.4
 * Excel: Kostenmodell Rows 82–221
 */

import type { KostXConfig, MassCalculation, KGGruppe, KGPosition, CostBreakdown } from './kostx-types';
import {
  lookupBodenplatte,
  lookupIWFaktor,
  lookupBaupreisindex,
  lookupGebaeudeklasseZuschlag,
  lookupSkalierung,
  BAUWEISE_KOSTEN,
  ENERGIESTANDARD_ZUSCHLAEGE,
  SONNENSCHUTZ_PREISE,
  GRUENDACH_ZUSCHLAEGE,
  KLINKER_ZUSCHLAG_NETTO_EURM2,
  KUECHEN_PREISE_BRUTTO,
  DACHFORM_ZUSCHLAG,
  EP,
} from './lookup-tables';

const MwSt = 1.19;

function pos(kg: string, bezeichnung: string, menge: number, einheit: string, ep_netto: number, rf: number): KGPosition {
  const gNetto = rf * ep_netto * menge;
  return {
    kg, bezeichnung, menge, einheit,
    einheitspreis_eurNetto: ep_netto,
    gesamtkosten_eurNetto: gNetto,
    gesamtkosten_eurBrutto: gNetto * MwSt,
  };
}

function sumGruppe(kg: string, bezeichnung: string, positionen: KGPosition[]): KGGruppe {
  const total_eurNetto = positionen.reduce((s, p) => s + p.gesamtkosten_eurNetto, 0);
  return { kg, bezeichnung, positionen, total_eurNetto, total_eurBrutto: total_eurNetto * MwSt };
}

// ============================================================
// KG 310 — Baugrube / Erdbau
// Excel: Rows 82-87
// ============================================================

export function calculateKG310(config: KostXConfig, masses: MassCalculation): KGGruppe {
  const rf = config.regionalfaktor;
  const positionen: KGPosition[] = [
    pos('311', 'Herstellung', masses.gr_m2, 'm²', EP.herstellung_eurM2, rf),
  ];
  return sumGruppe('310', 'Baugrube / Erdbau', positionen);
}

// ============================================================
// KG 320 — Gründung
// Excel: Rows 88-109
// ============================================================

export function calculateKG320(config: KostXConfig, masses: MassCalculation): KGGruppe {
  const rf = config.regionalfaktor;
  const bp = lookupBodenplatte(config.geschosse);

  // NUF-Effizienz für Bodenbeläge EG: Fläche = GR * (NUF/BGF)
  const bodenEGFlaeche_m2 = masses.gr_m2 * masses.nutzflaecheneffizienz;
  const allgemeinEGFlaeche_m2 = masses.gr_m2 - bodenEGFlaeche_m2 - masses.gr_m2 * masses.konstruktionsflaechenanteil;

  const parkettZuschlag = config.fussbodenbelag === 'Qualitätsniveau: Echtholzparkett' ? EP.parkettZuschlag_eurM2 : 0;
  const bodenbelagEP = EP.waermedaemmungEPS_eurM2 + EP.trittschalldaemmung_eurM2 + EP.trennschichtPE_eurM2
    + EP.heizestrich_eurM2 + EP.bodenbelag_eurM2 + parkettZuschlag;

  // Sockelleisten: Umfang pro WE * Anzahl EG-WE (≈ NUF-EG / avgWE * Umfang_pro_WE)
  // Excel: Row 99 uses a calculated length. Simplified: bodenEGFlaeche * 1.392 (aus Excel-Verhältnis)
  const sockelleisteLength = bodenEGFlaeche_m2 * (396.66 / 285); // Excel ratio
  const gefliesteBaederFlaeche_m2 = bodenEGFlaeche_m2 * 0.1; // ~10% Bäder

  const positionen: KGPosition[] = [
    pos('321', 'Baugrundverbesserung', masses.gr_m2, 'm²', EP.baugrundverbesserung_eurM2, rf),
    pos('322', 'Bodenplatte', masses.gr_m2, 'm²', bp.preisNetto_eurM2, rf),
    pos('323', 'Tiefgründung', config.tiefgruendung ? masses.gr_m2 : 0, 'm²', EP.tiefgruendung_eurM2, rf),
    pos('324', 'Bodenbeläge Wohnung EG', bodenEGFlaeche_m2, 'm²', bodenbelagEP, rf),
    pos('324', 'Sockelleisten EG', sockelleisteLength, 'lfm', EP.sockelleisten_eurLfm, rf),
    pos('324', 'Gefließte Bäder EG', gefliesteBaederFlaeche_m2, 'm²', EP.gefliesteBaeder_eurM2, rf),
    pos('324', 'Bodenbeläge Allgemein EG', Math.max(0, allgemeinEGFlaeche_m2), 'm²', EP.bodenbelagAllgemein_eurM2, rf),
    pos('325', 'Abdichtung W1.1-E', masses.gr_m2, 'm²', EP.abdichtungW11_eurM2, rf),
    pos('325', 'Sauberkeitsschicht', masses.gr_m2, 'm²', EP.sauberkeitsschicht_eurM2, rf),
    pos('325', 'Perimeterdämmung', masses.gr_m2, 'm²', EP.perimeterdaemmung_eurM2, rf),
    pos('325', 'Trennlage PE-Folie', masses.gr_m2, 'm²', EP.trennlagePE_eurM2, rf),
    pos('326', 'Frostschürze', masses.umfang_m, 'lfm', EP.frostschuerzePro_eurLfm, rf),
  ];
  return sumGruppe('320', 'Gründung, Unterbau', positionen);
}

// ============================================================
// KG 330 — Außenwände
// Excel: Rows 110-135
// ============================================================

export function calculateKG330(config: KostXConfig, masses: MassCalculation): KGGruppe {
  const rf = config.regionalfaktor;
  const ehZ = ENERGIESTANDARD_ZUSCHLAEGE[config.energiestandard];
  const awPreis = BAUWEISE_KOSTEN[config.bauweise].aussenwand_eurM2;
  const fassadeOhneFenster_m2 = masses.awf_m2 - masses.ff_m2;

  // Fenster // Excel: Row 114-117
  const fensterEP = EP.fenster_eurM2 + ehZ.fenster_eurM2
    + (config.fenstermaterial === 'Holz' ? EP.holzfensterZuschlag_eurM2 : 0);

  // WDVS // Excel: Row 119-126
  const wdvsEP = EP.wdvs_eurM2 + ehZ.aussenwand_eurM2;

  // Klinkerriemchen // Excel: Row 126
  const klinkerFlaeche_m2 = config.fassadengestaltung === 'WDVS mit Klinkerriemchen'
    ? fassadeOhneFenster_m2 * config.fassadenanteilKlinker
    : 0;

  // Balkone // Excel: Rows 131-133
  const balkonAnzahl = config.anzahlWE * config.balkoneAnteil;
  const balkonEP = EP.balkonBasis_eurStk + EP.balkonBasis_eurStk / 6 * (config.balkongroesse_m2 - 6) / 2;
  const balkonZuschlagHaengend = config.balkontyp === 'hängende Balkone' ? balkonEP * 0.3 : 0;
  const balkonZuschlagLoggien = config.balkontyp === 'Loggien' ? balkonEP * 0.65 : 0;

  // Sonnenschutz // Excel: Row 134
  const sonnenschutzFlaeche_m2 = masses.ff_m2 * config.sonnenschutzAnteil;
  const sonnenschutzEP = SONNENSCHUTZ_PREISE[config.sonnenschutz] ?? 0;

  const positionen: KGPosition[] = [
    pos('331', 'Tragende Außenwände', masses.awf_m2, 'm²', awPreis, rf),
    pos('334', 'Fenster', masses.ff_m2, 'm²', fensterEP, rf),
    pos('334', 'Haustür', 1, 'Stk', EP.hauseingangstuer_eurStk, rf),
    pos('335', 'WDVS Komplettsystem', fassadeOhneFenster_m2, 'm²', wdvsEP, rf),
    pos('335', 'Klinkerriemchen', klinkerFlaeche_m2, 'm²', KLINKER_ZUSCHLAG_NETTO_EURM2, rf),
    pos('336', 'Außenwandbekleidungen innen', fassadeOhneFenster_m2, 'm²', EP.putzInnen_eurM2 + EP.dispersionsfarbe_eurM2, rf),
    pos('337', 'Balkone', balkonAnzahl, 'Stk', balkonEP, rf),
    pos('337', 'Zuschlag hängende Balkone', balkonAnzahl, 'Stk', balkonZuschlagHaengend, rf),
    pos('337', 'Zuschlag Loggien', balkonAnzahl, 'Stk', balkonZuschlagLoggien, rf),
    pos('338', 'Sonnenschutz', sonnenschutzFlaeche_m2, 'm²', sonnenschutzEP, rf),
  ];
  return sumGruppe('330', 'Außenwände', positionen);
}

// ============================================================
// KG 340 — Innenwände
// Excel: Rows 136-146
// ============================================================

export function calculateKG340(config: KostXConfig, masses: MassCalculation): KGGruppe {
  const rf = config.regionalfaktor;
  const bw = BAUWEISE_KOSTEN[config.bauweise];

  // Tragende IW (Wohnungstrennwände): 55% der IWF
  // EP = 174 + VLOOKUP(Bauweise, Wohnungstrennwand) - Mauerwerk-Basis(110)
  // Excel: Row 137
  const trennwandZuschlag = bw.wohnungstrennwand_eurM2 - BAUWEISE_KOSTEN.Mauerwerk.wohnungstrennwand_eurM2;
  const trennwandEP = EP.tragendeIWBasis_eurM2 + trennwandZuschlag;

  // Bei Stahlbeton: 25% der tragenden IW sind "in Wohnung"
  const tragendeGesamt = 0.55 * masses.iwf_m2;
  const tragendeInWohnung = config.bauweise === 'Stahlbeton' ? 0.25 * tragendeGesamt : 0;
  const tragendeWohnungstrennwand = tragendeGesamt - tragendeInWohnung;

  // Tragende IW in Wohnung EP
  const tragendeWandZuschlag = bw.tragendeWand_eurM2 - BAUWEISE_KOSTEN.Mauerwerk.tragendeWand_eurM2;
  const tragendeWandEP = EP.tragendeIWBasis_eurM2 + tragendeWandZuschlag;

  // Wohnungstüren // Excel: Row 141
  const wohnungstuerAnzahl = config.anzahlWE + 1 + (config.zusNebenraeumeOi_m2 > 0 ? 1 : 0);
  const wohnungstuerEP = config.erschliessungstyp === 'Laubengang'
    ? EP.wohnungstuerLG_eurStk : EP.wohnungstuerTH_eurStk;

  // Innentüren // Excel: Row 142
  const innentuerAnzahl = config.anzahlWE * 4.35;

  const positionen: KGPosition[] = [
    pos('341', 'Tragende IW (Wohnungstrennwände)', tragendeWohnungstrennwand, 'm²', trennwandEP, rf),
    pos('341', 'Tragende IW (in Wohnung)', tragendeInWohnung, 'm²', tragendeWandEP, rf),
    pos('342', 'Nichttragende Innenwände', 0.45 * masses.iwf_m2, 'm²', EP.nichttragIW_eurM2, rf),
    pos('344', 'Wohnungstüren', wohnungstuerAnzahl, 'Stk', wohnungstuerEP, rf),
    pos('344', 'Innentüren', innentuerAnzahl, 'Stk', EP.innentuer_eurStk, rf),
  ];
  return sumGruppe('340', 'Innenwände', positionen);
}

// ============================================================
// KG 350 — Decken
// Excel: Rows 147-165
// ============================================================

export function calculateKG350(config: KostXConfig, masses: MassCalculation): KGGruppe {
  const rf = config.regionalfaktor;
  const parkettZuschlag = config.fussbodenbelag === 'Qualitätsniveau: Echtholzparkett' ? EP.parkettZuschlag_eurM2 : 0;
  const bodenbelagEP = EP.waermedaemmungEPS_eurM2 + EP.trittschalldaemmung_eurM2 + EP.trennschichtPE_eurM2
    + EP.heizestrich_eurM2 + EP.bodenbelag_eurM2 + parkettZuschlag;

  // Deckenbeläge Wohnen: DEF * NUF-Effizienz
  const deckWohnFlaeche_m2 = masses.def_m2 * masses.nutzflaecheneffizienz;
  const sockelleisteLength = deckWohnFlaeche_m2 * (396.66 / 285); // proportional wie EG
  const gefliesteBaeder_m2 = deckWohnFlaeche_m2 * 0.1;

  // Allgemeinfläche Decken
  const deckAllgemeinFlaeche_m2 = masses.def_m2 - deckWohnFlaeche_m2 - masses.def_m2 * masses.konstruktionsflaechenanteil;

  // Deckenbekleidungen: Wohn + Allgemein
  const deckenbekleidungFlaeche_m2 = deckWohnFlaeche_m2 + Math.max(0, deckAllgemeinFlaeche_m2);

  // Treppen // Excel: Row 165
  const treppenAnzahl = config.geschosse * masses.anzahlTH;

  const positionen: KGPosition[] = [
    pos('351', 'Deckenkonstruktionen', masses.def_m2, 'm²', EP.deckenkonstruktion_eurM2, rf),
    pos('353', 'Deckenbeläge Wohnen', deckWohnFlaeche_m2, 'm²', bodenbelagEP, rf),
    pos('353', 'Sockelleisten', sockelleisteLength, 'lfm', EP.sockelleisten_eurLfm, rf),
    pos('353', 'Gefließte Bäder', gefliesteBaeder_m2, 'm²', EP.gefliesteBaeder_eurM2, rf),
    pos('353', 'Deckenbeläge Allgemein', Math.max(0, deckAllgemeinFlaeche_m2), 'm²', EP.bodenbelagAllgemein_eurM2, rf),
    pos('354', 'Deckenbekleidungen', deckenbekleidungFlaeche_m2, 'm²', EP.deckenbekleidung_eurM2, rf),
    pos('355', 'Treppen inkl. Handlauf', treppenAnzahl, 'Stk', EP.treppe_eurStk, rf),
  ];
  return sumGruppe('350', 'Decken', positionen);
}

// ============================================================
// KG 360 — Dächer
// Excel: Rows 166-185
// ============================================================

export function calculateKG360(config: KostXConfig, masses: MassCalculation): KGGruppe {
  const rf = config.regionalfaktor;
  const ehZ = ENERGIESTANDARD_ZUSCHLAEGE[config.energiestandard];

  // Dachbeläge EP
  const dachbelaegeEP = EP.dampfsperre_eurM2 + EP.gefaelledaemmung_eurM2 + EP.dachabdichtung_eurM2 + ehZ.dach_eurM2;
  const gruendachZuschlag = GRUENDACH_ZUSCHLAEGE[config.gruendach] ?? 0;

  // Dachform-Zuschlag: % auf (Dachkonstruktion + Dachbeläge + Dachbekleidung) EP
  // Excel: Rows 168-170: =IF(Dachform, (E167+E172+E180)*factor, 0)
  const basisDachEP = EP.dachkonstruktion_eurM2 + dachbelaegeEP + EP.dachbekleidung_eurM2;
  const dachformZuschlagFaktor = DACHFORM_ZUSCHLAG[config.dachform] ?? 0;
  const dachformZuschlagEP = basisDachEP * dachformZuschlagFaktor;

  const positionen: KGPosition[] = [
    pos('361', 'Dachkonstruktionen', masses.daf_m2, 'm²', EP.dachkonstruktion_eurM2, rf),
    pos('361', 'Dachform-Zuschlag', masses.daf_m2, 'm²', dachformZuschlagEP, rf),
    pos('363', 'Dachbeläge', masses.daf_m2, 'm²', dachbelaegeEP, rf),
    pos('363', 'Gründach', masses.daf_m2, 'm²', gruendachZuschlag, rf),
    pos('364', 'Dachbekleidungen', masses.daf_m2, 'm²', EP.dachbekleidung_eurM2, rf),
  ];
  return sumGruppe('360', 'Dächer', positionen);
}

// ============================================================
// KG 380 — Baukonstruktive Einbauten
// Excel: Rows 186-194
// ============================================================

export function calculateKG380(config: KostXConfig, masses: MassCalculation): KGGruppe {
  const rf = config.regionalfaktor;

  // Küchen // Excel: Row 187, J187 = VLOOKUP(Küchenauswahl, Preise)
  const kuechenPreisBrutto = KUECHEN_PREISE_BRUTTO[config.kuechen] ?? 0;
  const kuechenPreisNetto = kuechenPreisBrutto / MwSt;

  // Laubengang // Excel: Row 188
  const laubengangFlaeche_m2 = config.erschliessungstyp === 'Laubengang'
    ? config.laenge_m * 1.5 * config.geschosse
    : 0;

  const positionen: KGPosition[] = [
    pos('381', 'Küchen', config.anzahlWE, 'Stk', kuechenPreisNetto, rf),
    pos('381', 'Laubengang', laubengangFlaeche_m2, 'm²', EP.laubengang_eurM2, rf),
  ];
  return sumGruppe('380', 'Baukonstruktive Einbauten', positionen);
}

// ============================================================
// KG 390 — Sonstige Maßnahmen
// Excel: Rows 195-207
// ============================================================

interface KG310to380 {
  kg310: KGGruppe;
  kg320: KGGruppe;
  kg330: KGGruppe;
  kg340: KGGruppe;
  kg350: KGGruppe;
  kg360: KGGruppe;
  kg380: KGGruppe;
}

export function calculateKG390(
  config: KostXConfig, masses: MassCalculation, subs: KG310to380
): KGGruppe {
  const rf = config.regionalfaktor;
  const erloes = masses.erloesflaecheWarm_m2;

  // Summe KG 310-380 netto
  const summe310_380 = subs.kg310.total_eurNetto + subs.kg320.total_eurNetto
    + subs.kg330.total_eurNetto + subs.kg340.total_eurNetto + subs.kg350.total_eurNetto
    + subs.kg360.total_eurNetto + subs.kg380.total_eurNetto;

  // BE 8% // Excel: Row 196
  const beProzent = EP.beProzent;
  const beNetto = beProzent * summe310_380;

  // Kleinteile 14.4% / 16% // Excel: Row 204
  const kleinteileProzent = config.bauweise === 'Stahlbeton' ? EP.kleinteileStahlbeton : EP.kleinteileMauerwerk;
  const kleinteileNetto = kleinteileProzent * summe310_380;

  // Skalierung baugleiche Gebäude // Excel: Row 205
  const skalierungProzent = lookupSkalierung(config.baugleicheGebaeude);
  // Bezugsbasis: KG 310-380 + KG400 anteilig. Vereinfacht: auf Summe
  const skalierungAbzug = skalierungProzent > 0 ? -skalierungProzent * summe310_380 : 0;

  // Mengenrabatt // Excel: Row 206
  const mengenrabattAbzug = config.mengenrabatt > 0 ? -config.mengenrabatt * summe310_380 : 0;

  // Kunst am Bau // Excel: Row 207
  const kunstAmBau = config.kunstAmBau
    ? rf * EP.kunstAmBauBasis * erloes / EP.kunstAmBauRefNUF
    : 0;

  const positionen: KGPosition[] = [
    { kg: '391', bezeichnung: 'Baustelleneinrichtung', menge: beProzent, einheit: '%',
      einheitspreis_eurNetto: 0, gesamtkosten_eurNetto: beNetto, gesamtkosten_eurBrutto: beNetto * MwSt },
    { kg: '399', bezeichnung: 'Kleinteile', menge: kleinteileProzent, einheit: '%',
      einheitspreis_eurNetto: 0, gesamtkosten_eurNetto: kleinteileNetto, gesamtkosten_eurBrutto: kleinteileNetto * MwSt },
    { kg: '399', bezeichnung: 'Skalierung baugleiche Gebäude', menge: skalierungProzent, einheit: '%',
      einheitspreis_eurNetto: 0, gesamtkosten_eurNetto: skalierungAbzug, gesamtkosten_eurBrutto: skalierungAbzug * MwSt },
    { kg: '399', bezeichnung: 'Mengenrabatt', menge: config.mengenrabatt, einheit: '%',
      einheitspreis_eurNetto: 0, gesamtkosten_eurNetto: mengenrabattAbzug, gesamtkosten_eurBrutto: mengenrabattAbzug * MwSt },
    { kg: '399', bezeichnung: 'Kunst am Bau', menge: config.kunstAmBau ? 1 : 0, einheit: 'psch',
      einheitspreis_eurNetto: kunstAmBau, gesamtkosten_eurNetto: kunstAmBau, gesamtkosten_eurBrutto: kunstAmBau * MwSt },
  ];
  return sumGruppe('390', 'Sonstige Maßnahmen', positionen);
}

// ============================================================
// KG 3XX — Zusätzliche Kosten (Zuschläge)
// Excel: Rows 208-221
// ============================================================

export function calculateKG3XX(config: KostXConfig, masses: MassCalculation, subs: KG310to380, kg390: KGGruppe): KGGruppe {
  const rf = config.regionalfaktor;
  const erloes = masses.erloesflaecheWarm_m2;

  // Summe KG 310-390 für Baupreissteigerung und GU
  const summeVorZuschlaege = subs.kg310.total_eurNetto + subs.kg320.total_eurNetto
    + subs.kg330.total_eurNetto + subs.kg340.total_eurNetto + subs.kg350.total_eurNetto
    + subs.kg360.total_eurNetto + subs.kg380.total_eurNetto + kg390.total_eurNetto;

  // Staffelgeschoss // Excel: Row 209
  const staffelBrutto = config.staffelgeschoss === 'Ja, eine Staffel' ? EP.staffelgeschossEineStaffel_brutto
    : config.staffelgeschoss === 'Ja, zwei Staffeln' ? EP.staffelgeschossZweiStaffeln_brutto : 0;
  const staffelNetto = staffelBrutto / MwSt;
  const staffelMenge = config.staffelgeschoss !== 'nein' ? masses.nufR_m2 : 0;

  // Beengter Bauraum // Excel: Row 210
  const beengterNetto = EP.beengterBauraum_brutto / MwSt;
  const beengterMenge = config.beengterBauraum ? masses.nufR_m2 : 0;

  // Gebäudeklasse // Excel: Row 211
  const gkZuschlagBrutto = lookupGebaeudeklasseZuschlag(masses.gebaeudeklasse);
  const gkNetto = gkZuschlagBrutto / MwSt;
  const gkMenge = masses.gebaeudeklasse === 3 || masses.gebaeudeklasse === 4 ? 0 : masses.nufR_m2;

  // Extra-Kosten KG 300 // Excel: Rows 215-218
  const extraKG300 = config.extraKosten.filter(e => e.kg === 'KG 300');

  // Summe der Zuschläge VOR Baupreissteigerung
  let zuschlaegeSumme = rf * staffelNetto * staffelMenge
    + rf * beengterNetto * beengterMenge
    + rf * gkNetto * gkMenge
    + extraKG300.reduce((s, e) => s + e.betrag_eur / MwSt, 0);

  // Baupreissteigerung // Excel: Row 212
  const bpi = lookupBaupreisindex(config.baubeginn, config.baukostenindexPa);
  const basisFuerBPI = summeVorZuschlaege + zuschlaegeSumme;
  const baupreisNetto = bpi * basisFuerBPI;

  // EH 40 Materialzuschlag // Excel: Row 213
  const eh40Netto = config.energiestandard === 'EH 40' ? EP.eh40Materialzuschlag_eurM2 * masses.nufR_m2 : 0;

  // GU-Zuschlag // Excel: Row 214
  const guBasis = summeVorZuschlaege + zuschlaegeSumme;
  const guNetto = config.guZuschlag * guBasis;

  const positionen: KGPosition[] = [
    pos('3XX', 'Staffelgeschoss', staffelMenge, 'm²', staffelNetto, rf),
    pos('3XX', 'Beengter Bauraum', beengterMenge, 'm²', beengterNetto, rf),
    pos('3XX', 'Gebäudeklasse', gkMenge, 'm²', gkNetto, rf),
    { kg: '3XX', bezeichnung: 'Baupreissteigerung', menge: bpi, einheit: '%',
      einheitspreis_eurNetto: 0, gesamtkosten_eurNetto: baupreisNetto, gesamtkosten_eurBrutto: baupreisNetto * MwSt },
    { kg: '3XX', bezeichnung: 'EH 40 Materialzuschlag', menge: masses.nufR_m2, einheit: 'm²',
      einheitspreis_eurNetto: config.energiestandard === 'EH 40' ? EP.eh40Materialzuschlag_eurM2 : 0,
      gesamtkosten_eurNetto: eh40Netto, gesamtkosten_eurBrutto: eh40Netto * MwSt },
    { kg: '3XX', bezeichnung: 'GU-Zuschlag', menge: config.guZuschlag, einheit: '%',
      einheitspreis_eurNetto: 0, gesamtkosten_eurNetto: guNetto, gesamtkosten_eurBrutto: guNetto * MwSt },
    ...extraKG300.map(e => ({
      kg: 'KG 300' as string, bezeichnung: e.name, menge: erloes, einheit: 'm²',
      einheitspreis_eurNetto: e.betrag_eur / MwSt / erloes,
      gesamtkosten_eurNetto: e.betrag_eur / MwSt,
      gesamtkosten_eurBrutto: e.betrag_eur,
    })),
  ];
  return sumGruppe('3XX', 'Zusätzliche Kosten', positionen);
}

// ============================================================
// Gesamt KG 300
// ============================================================

export function calculateKG300(config: KostXConfig, masses: MassCalculation): CostBreakdown {
  const kg310 = calculateKG310(config, masses);
  const kg320 = calculateKG320(config, masses);
  const kg330 = calculateKG330(config, masses);
  const kg340 = calculateKG340(config, masses);
  const kg350 = calculateKG350(config, masses);
  const kg360 = calculateKG360(config, masses);
  const kg380 = calculateKG380(config, masses);
  const subs = { kg310, kg320, kg330, kg340, kg350, kg360, kg380 };
  const kg390 = calculateKG390(config, masses, subs);
  const kg3XX = calculateKG3XX(config, masses, subs, kg390);

  const total_eurNetto = kg310.total_eurNetto + kg320.total_eurNetto + kg330.total_eurNetto
    + kg340.total_eurNetto + kg350.total_eurNetto + kg360.total_eurNetto
    + kg380.total_eurNetto + kg390.total_eurNetto + kg3XX.total_eurNetto;

  return {
    kg310, kg320, kg330, kg340, kg350, kg360, kg380, kg390, kg3XX,
    total_eurNetto,
    total_eurBrutto: total_eurNetto * MwSt,
  };
}
