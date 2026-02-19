/**
 * KostX Engine — Wirtschaftlichkeitsberechnung
 * Formeln aus KOSTX_PLANUNG.md Abschnitt A.7
 * Excel: Kostenmodell F5–F32
 */

import type { KostXConfig, MassCalculation, GIKCalculation, EconomicsResult } from './kostx-types';

/**
 * Berechnet die Gesamt-Investitionskosten (GIK).
 *
 * Excel: F32 = F15 + F16 + F17 + F19 + F22 + C2 + F28 + F25 + F20 - F30
 *
 * @param basisHaus_eurM2 - KG 300+400 €/m² NUF (brutto) = C2
 */
export function calculateGIK(
  config: KostXConfig,
  basisHaus_eurM2: number,
  masses: MassCalculation
): GIKCalculation {
  const nuf = masses.erloesflaecheWarm_m2;

  const kg100_eur = config.kg100_eurM2 * nuf;
  const kg200_eur = config.kg200_eurM2 * nuf;
  const kg300_400_eur = basisHaus_eurM2 * nuf;
  const kg500_eur = config.kg500_eurM2 * nuf;

  // KG 700 Honorare: interneKosten% × (KG100 + KG500 + KG200 + Honorare + C2 + sonstige)
  // Excel F22 = (F15+F17+F16+F19+C2+F28) * F23
  // But F19 = Honorarrechner — we approximate as part of iterative calc
  // Simplified: kg700Honorare ≈ will be computed later

  // For now: placeholder honorare (from Excel: ~613 €/m²)
  // Actually the formula is: F19 = Honorarrechner!E21 which is external
  // We use a simple approximation: Honorare ≈ 0 for MVP (user enters kg700Sonstige)
  const kg700Honorare_eur = 0; // Phase 2: Honorarrechner integration

  const kg700Sonstige_eur = config.kg700Sonstige_eurM2 * nuf;

  // Interne Kosten: Excel F22 = (KG100+KG500+KG200+KG700Hon+BasisHaus+Sonstige) * %
  const interneKostenBasis = config.kg100_eurM2 + config.kg500_eurM2 + config.kg200_eurM2
    + kg700Honorare_eur / nuf + basisHaus_eurM2 + config.sonstigeKosten_eurM2;
  const interneKosten_eur = interneKostenBasis * config.interneKostenProzent * nuf;

  // Baukostenreserve: Excel F25 = F26 * C2
  const baukostenreserve_eur = config.baukostenreserveProzent * basisHaus_eurM2 * nuf;

  const sonstigeKosten_eur = config.sonstigeKosten_eurM2 * nuf;
  const foerderung_eur = config.foerderung_eurM2 * nuf;

  // GIK = Summe aller KG - Förderung
  const gik_eur = kg100_eur + kg200_eur + kg300_400_eur + kg500_eur
    + kg700Honorare_eur + kg700Sonstige_eur + interneKosten_eur
    + baukostenreserve_eur + sonstigeKosten_eur - foerderung_eur;

  const gik_eurM2 = nuf > 0 ? gik_eur / nuf : 0;

  return {
    kg100_eur, kg200_eur, kg300_400_eur, kg500_eur,
    kg700Honorare_eur, kg700Sonstige_eur,
    interneKosten_eur, baukostenreserve_eur,
    sonstigeKosten_eur, foerderung_eur,
    gik_eur, gik_eurM2,
  };
}

/**
 * Berechnet Rendite, Marge, Verkaufspreis.
 *
 * Excel:
 *   F7 (Miete)  = Rendite × GIK / (12 × (1 - Bewirtschaftung))
 *   F11 (Marge) = (Multi × Miete × NUF × 12) / (GIK × NUF) - 1
 *   F12 (VK)    = GIK × (1 + Marge)
 */
export function calculateEconomics(
  config: KostXConfig,
  gik: GIKCalculation,
  masses: MassCalculation
): EconomicsResult {
  const gikM2 = gik.gik_eurM2;

  // Mieteinnahmen €/m²/Monat = Rendite × GIK / (12 × (1 - Bewirtschaftung))
  const mieteinnahmen_eurM2Monat = gikM2 > 0
    ? config.zielRendite * gikM2 / (12 * (1 - config.bewirtschaftung))
    : 0;

  // GIK Marge = (Multi × Miete × 12) / GIK - 1
  const gikMarge = gikM2 > 0
    ? (config.multi * mieteinnahmen_eurM2Monat * 12) / gikM2 - 1
    : 0;

  // Verkaufspreis = GIK × (1 + Marge)
  const verkaufspreis_eurM2 = gikM2 * (1 + gikMarge);

  return {
    mieteinnahmen_eurM2Monat,
    nettorendite: config.zielRendite,
    gikMarge,
    verkaufspreis_eurM2,
  };
}
