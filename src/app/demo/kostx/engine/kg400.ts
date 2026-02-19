/**
 * KostX Engine — KG 400 Technische Gebäudeanlagen
 * Formeln aus KOSTX_PLANUNG.md Abschnitt A.5
 * Excel: Kostenmodell C17
 */

import type { KostXConfig, MassCalculation, KG400Result } from './kostx-types';
import {
  lookupBaupreisindex,
  lookupSanitaerkosten,
  lookupIWFaktor,
  lookupGebaeudeklasseZuschlag,
  EP,
} from './lookup-tables';

const MwSt = 1.19;

/**
 * Berechnet KG 400 (Technische Gebäudeanlagen) oberirdisch.
 *
 * Excel-Formel C17:
 * = (620
 *   + IF(nicht Fernwärme, 70, 0) × [2 bei Geo]
 *   + IF(innenliegend, 60, 0)
 *   + Extra-KG-400
 *   + (NUF - WE×7000 + WE × VLOOKUP(WE → Sanitär)) / NUF
 *   + IF(PV, 630 × Dachanteil × DAF / NUF)
 *  ) × RF × (1+GU) × (1+BPI)
 *   + IF(E-Mob, 70 × Ladestationen / WE)
 *   + VLOOKUP(WE-Größe → zusKG400)
 *   + 0.5 × Hochhaus-Zuschlag
 */
export function calculateKG400(config: KostXConfig, masses: MassCalculation): KG400Result {
  const erloes = masses.erloesflaecheWarm_m2;
  if (erloes <= 0) {
    return { basisKG400_eurM2Netto: 0, total_eurNetto: 0, total_eurBrutto: 0, kkw_eurM2Brutto: 0 };
  }

  // Basis 620 €/m² — this is already BRUTTO in Excel (Kostenmodell C17)
  let basis = EP.kg400Basis_eurM2;

  // Nicht-Fernwärme Zuschlag
  if (config.energieversorgung === 'Luftwasserwärmepumpe' || config.energieversorgung === 'Enercube') {
    basis += EP.kg400NichtFernwaerme_eurM2;
  } else if (config.energieversorgung === 'geothermische Wärmepumpe') {
    basis += EP.kg400NichtFernwaerme_eurM2 * 2;
  }

  // Innenliegende Bäder
  if (config.positionierungBaeder === 'innenliegend') {
    basis += EP.kg400InnenliegendeBaeder_eurM2;
  }

  // Extra-Kosten KG 400
  const extraKG400 = config.extraKosten
    .filter(e => e.kg === 'KG 400')
    .reduce((s, e) => s + e.betrag_eur / MwSt / erloes, 0);
  basis += extraKG400;

  // Sanitärkosten-Differenz: (NUF - WE*7000 + WE*SanitärLookup) / NUF
  const sanitaerProWE = lookupSanitaerkosten(config.anzahlWE);
  const sanitaerDiff = (masses.nufR_m2 - config.anzahlWE * EP.kg400SanitaerBasis_eurProWE + config.anzahlWE * sanitaerProWE) / erloes;
  basis += sanitaerDiff;

  // PV-Anlage
  if (config.pvAnlage) {
    basis += EP.kg400PV_eurM2 * config.pvDachanteil * masses.daf_m2 / erloes;
  }

  // Multiplikatoren
  const bpi = lookupBaupreisindex(config.baubeginn);
  // No MwSt multiplication — basis values (620 etc.) are already brutto in Excel
  let kg400_eurM2_brutto = basis * config.regionalfaktor * (1 + config.guZuschlag) * (1 + bpi);

  // E-Mobilität (bereits brutto-like, addiert als €/m² NUF)
  if (config.eMobilitaet) {
    kg400_eurM2_brutto += EP.kg400EMob_eurProLadestation * config.ladestationen / config.anzahlWE;
  }

  // IW-Faktor zusätzliche KG 400 Kosten
  const iwLookup = lookupIWFaktor(masses.avgWeGroesse_m2);
  kg400_eurM2_brutto += iwLookup.zusKG400_eur;

  // Hochhaus-Zuschlag (50%)
  const gkZuschlag = lookupGebaeudeklasseZuschlag(masses.gebaeudeklasse);
  kg400_eurM2_brutto += 0.5 * gkZuschlag;

  const total_eurBrutto = kg400_eurM2_brutto * erloes;
  const total_eurNetto = total_eurBrutto / MwSt;

  return {
    basisKG400_eurM2Netto: basis,
    total_eurNetto,
    total_eurBrutto,
    kkw_eurM2Brutto: kg400_eurM2_brutto,
  };
}
