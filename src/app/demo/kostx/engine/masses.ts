/**
 * KostX Engine — Massenermittlung
 * Alle Formeln aus KOSTX_PLANUNG.md Abschnitt A.2
 * Excel: Kostenmodell Rows 21-41
 */

import type { KostXConfig, MassCalculation, Gebaeueklasse } from './kostx-types';
import {
  lookupIWFaktor,
  lookupKonstruktionsflaechenanteil,
  VERKEHRSFLAECHE,
  TECHNIKFLAECHE,
} from './lookup-tables';

/**
 * Berechnet alle Massen und Kennwerte aus der Gebäudekonfiguration.
 * Excel: Kostenmodell C21–C41
 */
export function calculateMasses(config: KostXConfig): MassCalculation {
  // ── Grundfläche (GR) ── Excel: C21
  const gr_m2 = config.manuelleFlaechenI && config.manuelleGR_m2 != null
    ? config.manuelleGR_m2
    : config.gebaeudeform === 'Individuell'
      ? config.laenge_m  // Bei Individuell = direkte m² Eingabe
      : config.laenge_m * config.breite_m;

  // ── Umfang ──
  const umfang_m = config.gebaeudeform === 'Individuell'
    ? config.breite_m  // Bei Individuell = direkter Umfang
    : (config.laenge_m * 2 + config.breite_m * 2);

  // ── Staffelabzug BGF ── Excel: C22
  let staffelabzugBGF_m2 = 0;
  if (config.staffelgeschoss === 'Ja, eine Staffel') {
    staffelabzugBGF_m2 = gr_m2 * (1 - config.staffel1Prozent);
  } else if (config.staffelgeschoss === 'Ja, zwei Staffeln') {
    staffelabzugBGF_m2 = gr_m2 * (1 - config.staffel1Prozent + 1 - config.staffel2Prozent);
  }

  // ── BGF R oberirdisch ── Excel: C22
  const bgfRoi_m2 = config.manuelleFlaechenI && config.manuelleBGFoi_m2 != null
    ? config.manuelleBGFoi_m2
    : gr_m2 * config.geschosse - staffelabzugBGF_m2;

  // ── BGF S (Balkone + Laubengang) ── Excel: C23
  const laubengangFlaeche_m2 = config.erschliessungstyp === 'Laubengang'
    ? config.laenge_m * 1.5 * config.geschosse  // L15 * 1.5 * C8 (L15 = Länge bei LG)
    : 0;
  const bgfS_m2 = config.manuelleFlaechenI && config.manuelleBGFS_m2 != null
    ? config.manuelleBGFS_m2
    : config.balkongroesse_m2 * config.anzahlWE + laubengangFlaeche_m2;

  // ── BGF R unterirdisch ── Excel: C24
  const bgfRui_m2 = config.manuelleFlaechenI && config.manuelleBGFui_m2 != null
    ? config.manuelleBGFui_m2
    : (config.untergeschoss === 'nein' || config.untergeschoss === 'keine Angabe')
      ? 0
      : gr_m2 * config.unterkellerungsanteil;

  // ── Gebäudehöhe ── Excel: C37
  const gebaeudehoehe_m = config.geschosse * (config.raumhoehe_m + 0.35);

  // ── Gebäudeklasse ── Excel: C41
  // OKF = Gebäudehöhe - Raumhöhe - 0 (oberste Fußbodenoberkante ≈ Höhe - letztes Geschoss)
  const okf = gebaeudehoehe_m - config.raumhoehe_m - 0.35;
  let gebaeudeklasse: Gebaeueklasse;
  if (okf > 100) {
    gebaeudeklasse = 'Wolkenkratzer';
  } else if (okf > 60) {
    gebaeudeklasse = 'sehr hohes Hochhaus';
  } else if (okf > 22) {
    gebaeudeklasse = 'Hochhaus';
  } else if (okf > 13) {
    gebaeudeklasse = 5;
  } else {
    gebaeudeklasse = 4;
  }

  const konstruktionsflaechenanteil = lookupKonstruktionsflaechenanteil(gebaeudeklasse);

  // ── Anzahl Treppenhäuser ── Excel: C39
  let anzahlTH: number;
  if (config.individuelleTH) {
    anzahlTH = config.anzahlTH;
  } else if (config.geschosse === 1) {
    anzahlTH = 0;
  } else if (config.erschliessungstyp === 'Treppenhauskern') {
    anzahlTH = Math.ceil(gr_m2 / 400);
  } else if (config.erschliessungstyp === 'Laubengang') {
    anzahlTH = Math.ceil(config.laenge_m / (VERKEHRSFLAECHE.fluchtwegLaengeLG_m * 2));
  } else {
    // Mittelgang
    anzahlTH = Math.ceil(config.laenge_m / (VERKEHRSFLAECHE.fluchtwegLaengeMG_m * 2));
  }

  const anzahlSicherheitsTH = config.individuelleTH
    ? config.anzahlSicherheitsTH
    : (gebaeudeklasse === 'Hochhaus' || gebaeudeklasse === 'sehr hohes Hochhaus' || gebaeudeklasse === 'Wolkenkratzer')
      ? 1
      : 0;

  // ── Verkehrs- + Technikfläche ── Excel: C29 (complex)
  // VK+TF = BGF R oi - NUF R - Konstruktionsfläche*BGF
  // We compute NUF first then VK = BGF - NUF - KF

  // Technikfläche (pro TH)
  const hatKeller = config.untergeschoss !== 'nein' && config.untergeschoss !== 'keine Angabe';
  const technikflaecheProTH_m2 = hatKeller ? 0
    : (config.energieversorgung === 'Fernwärme' || config.energieversorgung === 'Enercube')
      ? TECHNIKFLAECHE.mitFernwaerme_m2
      : TECHNIKFLAECHE.ohneFernwaerme_m2;

  // VK-Fläche (TH-Größe × TH × Geschosse)
  let vkProTHProGeschoss_m2: number;
  if (config.detailberechnungVK) {
    vkProTHProGeschoss_m2 = config.vkFlaecheProTH_m2;
  } else if (config.erschliessungstyp === 'Treppenhauskern') {
    // Wenn >= 5 WE pro TH pro Geschoss: mittelgroß (30), sonst basis (25)
    const weProTHProGeschoss = config.anzahlWE / (config.geschosse * anzahlTH);
    vkProTHProGeschoss_m2 = weProTHProGeschoss >= 5
      ? VERKEHRSFLAECHE.mittelgross_m2
      : VERKEHRSFLAECHE.basis_m2;
  } else {
    vkProTHProGeschoss_m2 = VERKEHRSFLAECHE.thMittelgangLaubengang_m2;
  }

  // Hochhaus VK-Zuschlag
  if (gebaeudeklasse === 'Hochhaus') {
    vkProTHProGeschoss_m2 = Math.max(vkProTHProGeschoss_m2, VERKEHRSFLAECHE.hochhaus_m2);
  } else if (gebaeudeklasse === 'sehr hohes Hochhaus') {
    vkProTHProGeschoss_m2 = Math.max(vkProTHProGeschoss_m2, VERKEHRSFLAECHE.sehrHohesHochhaus_m2);
  } else if (gebaeudeklasse === 'Wolkenkratzer') {
    vkProTHProGeschoss_m2 = Math.max(vkProTHProGeschoss_m2, VERKEHRSFLAECHE.wolkenkratzer_m2);
  }

  // Laubengang/Mittelgang: add flur per Geschoss
  let flurFlaeche_m2 = 0;
  if (config.erschliessungstyp === 'Laubengang' || config.erschliessungstyp === 'Mittelgang') {
    // X54 = 1.2 * Länge - 4 * TH (Rechteck)
    flurFlaeche_m2 = config.gebaeudeform === 'Rechteck'
      ? (1.2 * config.laenge_m - 4 * anzahlTH) * config.geschosse
      : 0;
  }

  const totalVK_m2 = vkProTHProGeschoss_m2 * anzahlTH * config.geschosse
    + anzahlSicherheitsTH * VERKEHRSFLAECHE.fluchttreppenhaus_m2 * config.geschosse;
  const totalTechnik_m2 = technikflaecheProTH_m2 * anzahlTH;
  const konstruktionsflaeche_m2 = konstruktionsflaechenanteil * bgfRoi_m2;

  // ── Energiestandard Flächenabzug ──
  let ehFlaechenabzug_m2 = 0;
  if (config.energiestandard === 'EH 55') {
    ehFlaechenabzug_m2 = 0.02 * config.geschosse * (config.gebaeudeform === 'Rechteck' ? (config.laenge_m * 2 + config.breite_m * 2) : config.breite_m);
  } else if (config.energiestandard === 'EH 40') {
    ehFlaechenabzug_m2 = 0.09 * config.geschosse * (config.gebaeudeform === 'Rechteck' ? (config.laenge_m * 2 + config.breite_m * 2) : config.breite_m);
  }

  // ── NUF R ── Excel: C25 (complex array formula)
  const vkTf_m2 = totalVK_m2 + totalTechnik_m2 + flurFlaeche_m2;

  let nufR_m2: number;
  if (config.manuelleFlaechenI && config.manuelleNUF_m2 != null) {
    nufR_m2 = config.manuelleNUF_m2;
  } else {
    nufR_m2 = bgfRoi_m2 - konstruktionsflaeche_m2 - vkTf_m2 - ehFlaechenabzug_m2 - config.zusNebenraeumeOi_m2;
  }

  const nufGewerbe_m2 = config.gewerbeflaecheVollausbau_m2 + config.gewerbeflaecheRohbau_m2;
  const nufRW_m2 = nufR_m2 - nufGewerbe_m2;

  // ── NUF S (Balkone) ── Excel: C27
  const balkonFaktor = config.kkwMethode === 'Balkone zu 50 % berücksichtigt' ? 0.5
    : config.kkwMethode === 'Balkone zu 25 % berücksichtigt' ? 0.25
    : 0;
  const nufSW_m2 = bgfS_m2 * balkonFaktor;

  // ── Erlösfläche ──
  const erloesflaecheWarm_m2 = nufR_m2 + nufSW_m2;

  // ── Ø WE-Größe ── Excel: C38
  const avgWeGroesse_m2 = Math.round(nufRW_m2 / config.anzahlWE);

  // ── Außenwandfläche (AWF) ── Excel: C30
  let staffelabzugAWF_m2 = 0;
  if (config.staffelgeschoss === 'Ja, eine Staffel') {
    staffelabzugAWF_m2 = (umfang_m / 2) * (config.raumhoehe_m + 0.35) * (1 - config.staffel1Prozent);
  } else if (config.staffelgeschoss === 'Ja, zwei Staffeln') {
    staffelabzugAWF_m2 =
      (umfang_m / 2) * (config.raumhoehe_m + 0.35) * (1 - config.staffel1Prozent) +
      (umfang_m / 2) * (config.raumhoehe_m + 0.35) * (1 - config.staffel2Prozent);
  }

  const awf_m2 = config.manuelleFlaechenII && config.manuelleAWF_m2 != null
    ? config.manuelleAWF_m2
    : umfang_m * gebaeudehoehe_m - staffelabzugAWF_m2;

  // ── Innenwandfläche (IWF) ── Excel: C31
  const iwLookup = lookupIWFaktor(avgWeGroesse_m2);
  let iwf_m2: number;
  if (config.manuelleFlaechenII && config.manuelleIWF_m2 != null) {
    iwf_m2 = config.manuelleIWF_m2;
  } else {
    // IWF = AWF × IW-Faktor, minus Gewerbeanteil*0.3
    iwf_m2 = awf_m2 * iwLookup.faktor - awf_m2 * iwLookup.faktor * nufGewerbe_m2 / nufR_m2 * 0.3;
    if (!isFinite(iwf_m2)) iwf_m2 = awf_m2 * iwLookup.faktor;
  }

  // ── Deckenfläche (DEF) ── Excel: C32
  const def_m2 = config.manuelleFlaechenII && config.manuelleDEF_m2 != null
    ? config.manuelleDEF_m2
    : bgfRoi_m2 - gr_m2;

  // ── Dachfläche (DAF) ── Excel: C33
  const daf_m2 = config.manuelleFlaechenII && config.manuelleDAF_m2 != null
    ? config.manuelleDAF_m2
    : gr_m2;

  // ── Fensterfläche (FF) ── Excel: C34
  const ff_m2 = config.manuelleFlaechenII && config.manuelleFF_m2 != null
    ? config.manuelleFF_m2
    : awf_m2 * config.fensteranteil;

  // ── Effizienz-Kennwerte ──
  const nutzflaecheneffizienz = bgfRoi_m2 > 0 ? nufR_m2 / bgfRoi_m2 : 0;
  const fassadeneffizienz = nufR_m2 > 0 ? awf_m2 / nufR_m2 : 0;

  return {
    gr_m2,
    bgfRoi_m2,
    bgfS_m2,
    bgfRui_m2,
    nufR_m2,
    nufRW_m2,
    nufSW_m2,
    nufGewerbe_m2,
    vkTf_m2,
    awf_m2,
    iwf_m2,
    def_m2,
    daf_m2,
    ff_m2,
    gebaeudehoehe_m,
    gebaeudeklasse,
    avgWeGroesse_m2,
    anzahlTH,
    anzahlSicherheitsTH,
    konstruktionsflaechenanteil,
    nutzflaecheneffizienz,
    fassadeneffizienz,
    umfang_m,
    staffelabzugBGF_m2,
    staffelabzugAWF_m2,
    erloesflaecheWarm_m2,
  };
}
