/**
 * KostX Engine — Default-Konfiguration
 * Entspricht exakt den Excel-Defaults aus plan.xlsm
 */

import type { KostXConfig, TiefgarageConfig } from './kostx-types';

/**
 * Default-Konfiguration für Tiefgarage 1.
 * Entspricht Excel: Tiefgaragenrechner Spalte D (TG1)
 */
export const TIEFGARAGE_DEFAULTS: TiefgarageConfig = {
  berechnungsmethode: 'ueber_stellplaetze',
  grundflaeche_m2: 375,
  umfang_m: 80,
  anzahlStellplaetze: 20,
  stellplatzGroesse_m2: 25,
  anzahlKellerabteile: 10,
  kellerabteilGroesse_m2: 10,
  technikflaeche_m2: 40,
  nebenraumflaeche_m2: 40,
  lichteGeschosshoehe_m: 2.6,
  ug2: true,
  ug2Anteil: 1.0,
  ug3: true,
  ug3Anteil: 1.0,
  ug4: false,
  ug4Anteil: 1.0,
  anzahlTreppenhaeuser: 1,
  anzahlEinfahrten: 1,
  anzahlDoppelparker: 0,
  anzahlLadestationen: 0,
  skalierungseffekte: 0,
  inklKellerabteile: true,
};

export const KOSTX_DEFAULTS: KostXConfig = {
  // A.1.1 Gebäudeparameter
  gebaeudeform: 'Rechteck',
  anzahlWE: 20,
  laenge_m: 25,
  breite_m: 15,
  geschosse: 5,
  raumhoehe_m: 2.6,
  bauweise: 'Mauerwerk',
  untergeschoss: 'nein',
  unterkellerungsanteil: 1.0,
  kkwMethode: 'Balkone zu 50 % berücksichtigt',

  // A.1.2 Kosteneinflüsse
  baubeginn: 'Q1 2026',
  baukostenindexPa: 1.5,
  regionalfaktor: 1.0,
  guZuschlag: 0,
  energiestandard: 'GEG',
  beengterBauraum: false,
  tiefgruendung: false,
  zusNebenraeumeOi_m2: 0,
  erschliessungstyp: 'Treppenhauskern',
  fussbodenbelag: 'Qualitätsniveau: Vinyl',

  // Dach
  dachform: 'Flachdach',
  staffelgeschoss: 'nein',
  staffel1Prozent: 0.75,
  staffel2Prozent: 0.75,
  gruendach: 'nein',

  // A.1.3 Fassade & Balkone
  fensteranteil: 0.20,
  fenstermaterial: 'Kunststoff',
  sonnenschutz: 'nein',
  sonnenschutzAnteil: 0.75,
  fassadengestaltung: 'WDVS',
  fassadenanteilKlinker: 0.30,
  balkoneAnteil: 1.0,
  balkontyp: 'vorgestellte Balkone',
  balkongroesse_m2: 6,

  // A.1.4 Gebäudetechnik
  energieversorgung: 'Fernwärme',
  positionierungBaeder: 'an Außenwand',
  pvAnlage: false,
  pvDachanteil: 0.5,
  eMobilitaet: false,
  ladestationen: 26,
  kuechen: 'nein',
  kunstAmBau: false,

  // A.1.5 Erweitert
  individuelleTH: false,
  anzahlTH: 3,
  anzahlSicherheitsTH: 0,
  detailberechnungVK: false,
  vkFlaecheProTH_m2: 25,
  baugleicheGebaeude: 1,
  mengenrabatt: 0,
  manuelleFlaechenI: false,
  manuelleFlaechenII: false,

  // Gewerbe
  gewerbeflaecheVollausbau_m2: 0,
  gewerbeflaecheRohbau_m2: 0,

  // A.1.6 Wirtschaftlichkeit
  zielRendite: 0.05,
  bewirtschaftung: 0.05,
  multi: 21,
  kg100_eurM2: 250,
  kg200_eurM2: 80,
  kg500_eurM2: 100,
  kg700Sonstige_eurM2: 50,
  interneKostenProzent: 0.023,
  baukostenreserveProzent: 0.03,
  sonstigeKosten_eurM2: 0,
  foerderung_eurM2: 0,

  // Extra-Kosten
  extraKosten: [],
};
