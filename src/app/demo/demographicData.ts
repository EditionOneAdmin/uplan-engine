// Demografische Daten für Berlin-Bezirke und NRW-Kreise
// Quellen: Amt für Statistik Berlin-Brandenburg 2024, Zensus 2022, IT.NRW

export interface DemographicProfile {
  einwohner: number;
  durchschnittsalter: number;
  bevoelkerungsentwicklung: number; // % p.a.
  kaufkraftindex: number; // Deutschland = 100
  arbeitslosenquote: number; // %
  durchschnittsEinkommenMonat: number; // € brutto
  haushaltsgroesse: number; // Ø Personen
  anteilFamilien: number; // % Haushalte mit Kindern
  anteilSenioren: number; // % 65+
  anteilJunge: number; // % unter 30
  wanderungssaldo: number; // pro 1000 Einwohner p.a.
  wohnungsleerstand: number; // %
  wohnungsmixEmpfehlung: {
    einZimmer: number; // %
    zweiZimmer: number;
    dreiZimmer: number;
    vierPlusZimmer: number;
  };
  trend: "wachsend" | "stabil" | "schrumpfend";
  trendLabel: string;
}

// Berlin Bezirke
export const BERLIN_DEMOGRAPHICS: Record<string, DemographicProfile> = {
  "Mitte": {
    einwohner: 387000, durchschnittsalter: 39.7, bevoelkerungsentwicklung: 0.8,
    kaufkraftindex: 88, arbeitslosenquote: 10.2, durchschnittsEinkommenMonat: 3200,
    haushaltsgroesse: 1.7, anteilFamilien: 18, anteilSenioren: 14, anteilJunge: 38,
    wanderungssaldo: 8.5, wohnungsleerstand: 0.8,
    wohnungsmixEmpfehlung: { einZimmer: 25, zweiZimmer: 35, dreiZimmer: 28, vierPlusZimmer: 12 },
    trend: "wachsend", trendLabel: "Starkes Wachstum, jung & international"
  },
  "Friedrichshain-Kreuzberg": {
    einwohner: 291000, durchschnittsalter: 39.2, bevoelkerungsentwicklung: 0.5,
    kaufkraftindex: 86, arbeitslosenquote: 9.8, durchschnittsEinkommenMonat: 3100,
    haushaltsgroesse: 1.6, anteilFamilien: 16, anteilSenioren: 11, anteilJunge: 42,
    wanderungssaldo: 5.2, wohnungsleerstand: 0.5,
    wohnungsmixEmpfehlung: { einZimmer: 30, zweiZimmer: 35, dreiZimmer: 25, vierPlusZimmer: 10 },
    trend: "wachsend", trendLabel: "Jüngster Bezirk, hohe Nachfrage"
  },
  "Pankow": {
    einwohner: 422000, durchschnittsalter: 41.5, bevoelkerungsentwicklung: 1.2,
    kaufkraftindex: 98, arbeitslosenquote: 6.8, durchschnittsEinkommenMonat: 3800,
    haushaltsgroesse: 1.9, anteilFamilien: 24, anteilSenioren: 17, anteilJunge: 32,
    wanderungssaldo: 12.1, wohnungsleerstand: 0.4,
    wohnungsmixEmpfehlung: { einZimmer: 15, zweiZimmer: 30, dreiZimmer: 35, vierPlusZimmer: 20 },
    trend: "wachsend", trendLabel: "Stärkstes Wachstum, Familien-Hotspot"
  },
  "Charlottenburg-Wilmersdorf": {
    einwohner: 344000, durchschnittsalter: 44.2, bevoelkerungsentwicklung: 0.3,
    kaufkraftindex: 112, arbeitslosenquote: 7.1, durchschnittsEinkommenMonat: 4200,
    haushaltsgroesse: 1.7, anteilFamilien: 19, anteilSenioren: 22, anteilJunge: 28,
    wanderungssaldo: 3.8, wohnungsleerstand: 0.7,
    wohnungsmixEmpfehlung: { einZimmer: 20, zweiZimmer: 30, dreiZimmer: 30, vierPlusZimmer: 20 },
    trend: "stabil", trendLabel: "Etabliert, hohe Kaufkraft"
  },
  "Spandau": {
    einwohner: 252000, durchschnittsalter: 44.8, bevoelkerungsentwicklung: 0.6,
    kaufkraftindex: 85, arbeitslosenquote: 9.5, durchschnittsEinkommenMonat: 3000,
    haushaltsgroesse: 2.0, anteilFamilien: 23, anteilSenioren: 22, anteilJunge: 28,
    wanderungssaldo: 6.2, wohnungsleerstand: 1.2,
    wohnungsmixEmpfehlung: { einZimmer: 15, zweiZimmer: 25, dreiZimmer: 35, vierPlusZimmer: 25 },
    trend: "wachsend", trendLabel: "Preiswert, Familien-Zuzug"
  },
  "Steglitz-Zehlendorf": {
    einwohner: 310000, durchschnittsalter: 46.5, bevoelkerungsentwicklung: 0.1,
    kaufkraftindex: 118, arbeitslosenquote: 5.2, durchschnittsEinkommenMonat: 4500,
    haushaltsgroesse: 1.9, anteilFamilien: 22, anteilSenioren: 27, anteilJunge: 22,
    wanderungssaldo: 1.5, wohnungsleerstand: 0.6,
    wohnungsmixEmpfehlung: { einZimmer: 10, zweiZimmer: 25, dreiZimmer: 35, vierPlusZimmer: 30 },
    trend: "stabil", trendLabel: "Ältester Bezirk, höchste Kaufkraft"
  },
  "Tempelhof-Schöneberg": {
    einwohner: 352000, durchschnittsalter: 43.1, bevoelkerungsentwicklung: 0.4,
    kaufkraftindex: 96, arbeitslosenquote: 8.3, durchschnittsEinkommenMonat: 3500,
    haushaltsgroesse: 1.7, anteilFamilien: 18, anteilSenioren: 20, anteilJunge: 30,
    wanderungssaldo: 4.1, wohnungsleerstand: 0.7,
    wohnungsmixEmpfehlung: { einZimmer: 20, zweiZimmer: 35, dreiZimmer: 30, vierPlusZimmer: 15 },
    trend: "stabil", trendLabel: "Gemischte Struktur, solide Nachfrage"
  },
  "Neukölln": {
    einwohner: 330000, durchschnittsalter: 40.8, bevoelkerungsentwicklung: 0.7,
    kaufkraftindex: 78, arbeitslosenquote: 12.1, durchschnittsEinkommenMonat: 2800,
    haushaltsgroesse: 1.8, anteilFamilien: 20, anteilSenioren: 15, anteilJunge: 36,
    wanderungssaldo: 7.3, wohnungsleerstand: 0.6,
    wohnungsmixEmpfehlung: { einZimmer: 20, zweiZimmer: 35, dreiZimmer: 30, vierPlusZimmer: 15 },
    trend: "wachsend", trendLabel: "Jung, wachsend, gentrifizierend"
  },
  "Treptow-Köpenick": {
    einwohner: 284000, durchschnittsalter: 44.6, bevoelkerungsentwicklung: 1.0,
    kaufkraftindex: 94, arbeitslosenquote: 7.4, durchschnittsEinkommenMonat: 3400,
    haushaltsgroesse: 1.9, anteilFamilien: 21, anteilSenioren: 23, anteilJunge: 26,
    wanderungssaldo: 9.8, wohnungsleerstand: 0.9,
    wohnungsmixEmpfehlung: { einZimmer: 15, zweiZimmer: 25, dreiZimmer: 35, vierPlusZimmer: 25 },
    trend: "wachsend", trendLabel: "Starker Zuzug, Neubau-Hotspot"
  },
  "Marzahn-Hellersdorf": {
    einwohner: 280000, durchschnittsalter: 44.0, bevoelkerungsentwicklung: 0.9,
    kaufkraftindex: 82, arbeitslosenquote: 8.9, durchschnittsEinkommenMonat: 3000,
    haushaltsgroesse: 2.0, anteilFamilien: 24, anteilSenioren: 22, anteilJunge: 28,
    wanderungssaldo: 8.5, wohnungsleerstand: 1.5,
    wohnungsmixEmpfehlung: { einZimmer: 10, zweiZimmer: 25, dreiZimmer: 35, vierPlusZimmer: 30 },
    trend: "wachsend", trendLabel: "Familienfreundlich, preiswert"
  },
  "Lichtenberg": {
    einwohner: 304000, durchschnittsalter: 42.8, bevoelkerungsentwicklung: 0.8,
    kaufkraftindex: 84, arbeitslosenquote: 8.5, durchschnittsEinkommenMonat: 3100,
    haushaltsgroesse: 1.8, anteilFamilien: 20, anteilSenioren: 20, anteilJunge: 30,
    wanderungssaldo: 7.8, wohnungsleerstand: 1.1,
    wohnungsmixEmpfehlung: { einZimmer: 15, zweiZimmer: 30, dreiZimmer: 35, vierPlusZimmer: 20 },
    trend: "wachsend", trendLabel: "Wachsend, gute Anbindung"
  },
  "Reinickendorf": {
    einwohner: 268000, durchschnittsalter: 45.1, bevoelkerungsentwicklung: 0.3,
    kaufkraftindex: 90, arbeitslosenquote: 8.8, durchschnittsEinkommenMonat: 3200,
    haushaltsgroesse: 1.9, anteilFamilien: 22, anteilSenioren: 24, anteilJunge: 26,
    wanderungssaldo: 3.2, wohnungsleerstand: 1.0,
    wohnungsmixEmpfehlung: { einZimmer: 12, zweiZimmer: 28, dreiZimmer: 35, vierPlusZimmer: 25 },
    trend: "stabil", trendLabel: "Moderates Wachstum, familienfreundlich"
  },
};

// NRW Großstädte/Kreise
export const NRW_DEMOGRAPHICS: Record<string, DemographicProfile> = {
  "Köln": {
    einwohner: 1084000, durchschnittsalter: 42.1, bevoelkerungsentwicklung: 0.4,
    kaufkraftindex: 102, arbeitslosenquote: 8.4, durchschnittsEinkommenMonat: 3600,
    haushaltsgroesse: 1.8, anteilFamilien: 19, anteilSenioren: 18, anteilJunge: 34,
    wanderungssaldo: 4.5, wohnungsleerstand: 0.8,
    wohnungsmixEmpfehlung: { einZimmer: 20, zweiZimmer: 35, dreiZimmer: 30, vierPlusZimmer: 15 },
    trend: "wachsend", trendLabel: "Größte Stadt NRW, starke Nachfrage"
  },
  "Düsseldorf": {
    einwohner: 625000, durchschnittsalter: 43.2, bevoelkerungsentwicklung: 0.5,
    kaufkraftindex: 115, arbeitslosenquote: 7.2, durchschnittsEinkommenMonat: 4200,
    haushaltsgroesse: 1.7, anteilFamilien: 17, anteilSenioren: 20, anteilJunge: 30,
    wanderungssaldo: 5.1, wohnungsleerstand: 0.6,
    wohnungsmixEmpfehlung: { einZimmer: 22, zweiZimmer: 33, dreiZimmer: 30, vierPlusZimmer: 15 },
    trend: "wachsend", trendLabel: "Hohe Kaufkraft, Business-Standort"
  },
  "Dortmund": {
    einwohner: 602000, durchschnittsalter: 43.5, bevoelkerungsentwicklung: 0.2,
    kaufkraftindex: 88, arbeitslosenquote: 10.5, durchschnittsEinkommenMonat: 3100,
    haushaltsgroesse: 1.9, anteilFamilien: 20, anteilSenioren: 21, anteilJunge: 30,
    wanderungssaldo: 2.8, wohnungsleerstand: 2.1,
    wohnungsmixEmpfehlung: { einZimmer: 18, zweiZimmer: 30, dreiZimmer: 32, vierPlusZimmer: 20 },
    trend: "stabil", trendLabel: "Strukturwandel, moderate Nachfrage"
  },
  "Essen": {
    einwohner: 584000, durchschnittsalter: 44.8, bevoelkerungsentwicklung: -0.1,
    kaufkraftindex: 91, arbeitslosenquote: 10.8, durchschnittsEinkommenMonat: 3200,
    haushaltsgroesse: 1.8, anteilFamilien: 18, anteilSenioren: 23, anteilJunge: 28,
    wanderungssaldo: 0.5, wohnungsleerstand: 2.5,
    wohnungsmixEmpfehlung: { einZimmer: 15, zweiZimmer: 30, dreiZimmer: 35, vierPlusZimmer: 20 },
    trend: "stabil", trendLabel: "Alternde Bevölkerung, Süd-Nord-Gefälle"
  },
  "Duisburg": {
    einwohner: 502000, durchschnittsalter: 44.2, bevoelkerungsentwicklung: -0.3,
    kaufkraftindex: 78, arbeitslosenquote: 12.4, durchschnittsEinkommenMonat: 2800,
    haushaltsgroesse: 2.0, anteilFamilien: 22, anteilSenioren: 22, anteilJunge: 30,
    wanderungssaldo: -1.2, wohnungsleerstand: 3.2,
    wohnungsmixEmpfehlung: { einZimmer: 12, zweiZimmer: 28, dreiZimmer: 35, vierPlusZimmer: 25 },
    trend: "schrumpfend", trendLabel: "⚠ Bevölkerungsrückgang, hoher Leerstand"
  },
  "Bonn": {
    einwohner: 336000, durchschnittsalter: 42.5, bevoelkerungsentwicklung: 0.6,
    kaufkraftindex: 108, arbeitslosenquote: 6.8, durchschnittsEinkommenMonat: 4000,
    haushaltsgroesse: 1.8, anteilFamilien: 20, anteilSenioren: 19, anteilJunge: 33,
    wanderungssaldo: 6.2, wohnungsleerstand: 0.7,
    wohnungsmixEmpfehlung: { einZimmer: 20, zweiZimmer: 30, dreiZimmer: 30, vierPlusZimmer: 20 },
    trend: "wachsend", trendLabel: "UN-Stadt, starke Nachfrage"
  },
  "Münster": {
    einwohner: 320000, durchschnittsalter: 41.0, bevoelkerungsentwicklung: 0.7,
    kaufkraftindex: 105, arbeitslosenquote: 5.4, durchschnittsEinkommenMonat: 3700,
    haushaltsgroesse: 1.8, anteilFamilien: 19, anteilSenioren: 17, anteilJunge: 38,
    wanderungssaldo: 7.5, wohnungsleerstand: 0.4,
    wohnungsmixEmpfehlung: { einZimmer: 25, zweiZimmer: 30, dreiZimmer: 28, vierPlusZimmer: 17 },
    trend: "wachsend", trendLabel: "Uni-Stadt, junge Bevölkerung"
  },
  "Aachen": {
    einwohner: 261000, durchschnittsalter: 41.5, bevoelkerungsentwicklung: 0.4,
    kaufkraftindex: 95, arbeitslosenquote: 7.5, durchschnittsEinkommenMonat: 3400,
    haushaltsgroesse: 1.8, anteilFamilien: 18, anteilSenioren: 18, anteilJunge: 36,
    wanderungssaldo: 4.8, wohnungsleerstand: 1.0,
    wohnungsmixEmpfehlung: { einZimmer: 22, zweiZimmer: 32, dreiZimmer: 28, vierPlusZimmer: 18 },
    trend: "wachsend", trendLabel: "RWTH-Stadt, Tech-Standort"
  },
};

/**
 * Find demographic profile by Bezirk/Stadt name (fuzzy match)
 */
export function findDemographicProfile(bezirkOrStadt: string): { profile: DemographicProfile; name: string } | null {
  const q = bezirkOrStadt.toLowerCase().trim();

  // Berlin Bezirke
  for (const [name, profile] of Object.entries(BERLIN_DEMOGRAPHICS)) {
    if (q.includes(name.toLowerCase()) || name.toLowerCase().includes(q)) {
      return { profile, name };
    }
  }

  // NRW Städte
  for (const [name, profile] of Object.entries(NRW_DEMOGRAPHICS)) {
    if (q.includes(name.toLowerCase()) || name.toLowerCase().includes(q)) {
      return { profile, name };
    }
  }

  return null;
}
