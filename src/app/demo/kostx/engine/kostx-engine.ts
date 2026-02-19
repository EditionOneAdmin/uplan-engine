/**
 * KostX Engine — Haupt-Orchestrierung
 * Berechnet alle Kosten aus einer KostXConfig.
 * Pure function, keine Side-Effects.
 *
 * Excel: Kostenmodell (gesamtes Sheet)
 */

import type { KostXConfig, KostXResult, ZuschlagItem, BasementCost } from './kostx-types';
import { calculateMasses } from './masses';
import { calculateKG300 } from './kg300';
import { calculateKG400 } from './kg400';
import { calculateGIK, calculateEconomics } from './economics';
import {
  lookupBaupreisindex,
  lookupBodenplatte,
  lookupGebaeudeklasseZuschlag,
  GRUENDACH_ZUSCHLAEGE,
  SONNENSCHUTZ_PREISE,
  ENERGIESTANDARD_ZUSCHLAEGE,
  EP,
} from './lookup-tables';

const MwSt = 1.19;

/**
 * Berechnet Untergeschoss-Kosten (Keller / TG einzeln).
 * Excel: Kostenmodell Rows 225-238
 */
function calculateBasement(config: KostXConfig, masses: import('./kostx-types').MassCalculation): BasementCost | null {
  if (config.untergeschoss === 'nein' || config.untergeschoss === 'keine Angabe') return null;

  const rf = config.regionalfaktor;
  const isTG = config.untergeschoss === 'Tiefgarage (einzeln)';
  const bgfUi = masses.bgfRui_m2;
  const erloes = masses.erloesflaecheWarm_m2;

  if (bgfUi <= 0) return null;

  const bp = lookupBodenplatte(config.geschosse);
  const umfang = masses.umfang_m;
  const geschosshoehe = 3.2; // Standard UG-Höhe

  // Positionen
  const aushub = { netto: bgfUi * EP.ugAushub_eurM2 * rf };
  const bodenplatte = { netto: Math.max(0, bgfUi - masses.gr_m2) * bp.preisNetto_eurM2 * rf };
  const aussenwand = { netto: umfang * geschosshoehe * EP.ugAussenwand_eurM2 * rf };
  const innenwand = { netto: umfang * geschosshoehe * EP.ugInnenwand_eurM2 * rf * 0.5 }; // ~50% der AW
  const stuetzen = { netto: (bgfUi / 25) * 3 * EP.ugStuetzen_eurLfm * rf };
  const decke = { netto: bgfUi * EP.ugDecke_eurM2 * rf };
  const rampe = { netto: isTG ? EP.ugRampe_eurPsch * rf : 0 };
  const treppe = { netto: EP.ugTreppe_eurStk * rf };
  const stahltueren = { netto: Math.round(bgfUi / 50) * EP.ugStahltuer_eurStk * rf };

  const kg300Positionen = aushub.netto + bodenplatte.netto + aussenwand.netto
    + innenwand.netto + stuetzen.netto + decke.netto + rampe.netto + treppe.netto + stahltueren.netto;

  // KG 400 UG
  const kg400Rate = isTG ? EP.ugKG400TG_eurM2 : EP.ugKG400Keller_eurM2;
  const kg400Netto = bgfUi * kg400Rate * rf;

  // Sonstige + BE
  const sonstiges = EP.ugSonstigesProzent * kg300Positionen;
  const be = EP.ugBEProzent * kg300Positionen;

  // Baupreissteigerung
  const bpi = lookupBaupreisindex(config.baubeginn);
  const bpiKosten = bpi * (kg300Positionen + sonstiges + be + kg400Netto);

  const totalNetto = kg300Positionen + sonstiges + be + kg400Netto + bpiKosten;

  return {
    positionen: [], // Simplified for MVP
    totalKG300_eurNetto: kg300Positionen + sonstiges + be,
    totalKG400_eurNetto: kg400Netto,
    total_eurNetto: totalNetto,
    total_eurBrutto: totalNetto * MwSt,
    kkwKG300_eurM2Brutto: erloes > 0 ? (kg300Positionen + sonstiges + be) * MwSt / erloes : 0,
    kkwKG400_eurM2Brutto: erloes > 0 ? kg400Netto * MwSt / erloes : 0,
  };
}

/**
 * Erzeugt Zuschlag-Waterfall-Daten für Visualisierung.
 */
function computeZuschlaege(config: KostXConfig, masses: import('./kostx-types').MassCalculation, basisHaus_eurM2: number): ZuschlagItem[] {
  const items: ZuschlagItem[] = [];
  const erloes = masses.erloesflaecheWarm_m2;

  items.push({ label: 'Basis Haus (KG 300+400)', wert_eurM2: basisHaus_eurM2, typ: 'basis' });

  // KG 100-700 Zuschläge
  items.push({ label: 'KG 100 Grundstück', wert_eurM2: config.kg100_eurM2, typ: 'zuschlag' });
  items.push({ label: 'KG 200 Erschließung', wert_eurM2: config.kg200_eurM2, typ: 'zuschlag' });
  items.push({ label: 'KG 500 Außenanlagen', wert_eurM2: config.kg500_eurM2, typ: 'zuschlag' });
  items.push({ label: 'KG 700 sonstige', wert_eurM2: config.kg700Sonstige_eurM2, typ: 'zuschlag' });

  // Interne Kosten
  const interneKostenBasis = config.kg100_eurM2 + config.kg500_eurM2 + config.kg200_eurM2
    + basisHaus_eurM2 + config.sonstigeKosten_eurM2;
  items.push({ label: 'Interne Kosten', wert_eurM2: interneKostenBasis * config.interneKostenProzent, typ: 'zuschlag' });

  // Baukostenreserve
  items.push({ label: 'Baukostenreserve', wert_eurM2: config.baukostenreserveProzent * basisHaus_eurM2, typ: 'zuschlag' });

  if (config.sonstigeKosten_eurM2 > 0) {
    items.push({ label: 'Sonstige Kosten', wert_eurM2: config.sonstigeKosten_eurM2, typ: 'zuschlag' });
  }

  if (config.foerderung_eurM2 > 0) {
    items.push({ label: 'Förderung', wert_eurM2: -config.foerderung_eurM2, typ: 'abzug' });
  }

  // Summe
  const gikM2 = items.reduce((s, i) => s + i.wert_eurM2, 0);
  items.push({ label: 'GIK gesamt', wert_eurM2: gikM2, typ: 'summe' });

  return items;
}

/**
 * Hauptfunktion: Berechnet alle KostX-Ergebnisse.
 *
 * @param config - Vollständige Gebäudekonfiguration
 * @returns Alle berechneten Ergebnisse
 */
export function calculateKostX(config: KostXConfig): KostXResult {
  // 1. Massen
  const masses = calculateMasses(config);

  // 2. KG 300
  const kg300 = calculateKG300(config, masses);

  // 3. KG 400
  const kg400 = calculateKG400(config, masses);

  // 4. Untergeschoss
  const basement = calculateBasement(config, masses);

  // 5. Basis Haus €/m² NUF brutto
  const erloes = masses.erloesflaecheWarm_m2;
  const basisHaus_eurM2 = erloes > 0
    ? (kg300.total_eurBrutto + kg400.total_eurBrutto) / erloes
    : 0;

  // 6. Waterfall
  const zuschlaege = computeZuschlaege(config, masses, basisHaus_eurM2);

  // 7. GIK
  const gik = calculateGIK(config, basisHaus_eurM2, masses);

  // 8. Economics
  const economics = calculateEconomics(config, gik, masses);

  return {
    masses,
    kg300,
    kg400,
    basement,
    basisHaus_eurM2,
    zuschlaege,
    gik,
    economics,
  };
}
