/**
 * LBO Calculators — Standalone Script (npx tsx)
 * Berechnet Abstandsflächen, Stellplätze, Gebäudeklassen nach LBO Berlin/NRW
 */
import { readFileSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));

type Land = 'berlin' | 'nrw';

interface LboData {
  abstandsflaechen: { faktor: number; minimum_m: number };
  stellplaetze: {
    pkw: { pflicht_pro_we: number };
    fahrrad: { pflicht_pro_we: number };
  };
  gebaeudeKlassen: { klasse: number; hoehe_max: number; beschreibung: string }[];
}

function loadLbo(land: Land): LboData {
  const path = resolve(__dirname, `../data/lbo-${land}.json`);
  return JSON.parse(readFileSync(path, 'utf-8'));
}

export function calculateAbstandsflaeche(hoehe: number, land: Land): number {
  const lbo = loadLbo(land);
  return Math.max(hoehe * lbo.abstandsflaechen.faktor, lbo.abstandsflaechen.minimum_m);
}

export function calculateStellplaetze(wohneinheiten: number, land: Land): { pkw: number; fahrrad: number } {
  const lbo = loadLbo(land);
  return {
    pkw: Math.ceil(wohneinheiten * lbo.stellplaetze.pkw.pflicht_pro_we),
    fahrrad: Math.ceil(wohneinheiten * lbo.stellplaetze.fahrrad.pflicht_pro_we),
  };
}

export function getGebaeudeKlasse(hoehe: number, flaeche: number, nutzungseinheiten: number): number {
  // Simplified classification based on height (primary) + NE count
  if (hoehe <= 7) {
    if (nutzungseinheiten <= 2) return flaeche > 0 ? 1 : 2; // freistehend heuristic
    return 3;
  }
  if (hoehe <= 13 && flaeche <= 400) return 4;
  if (hoehe <= 22) return 5;
  // Hochhaus — beyond GK5
  return 5;
}

// CLI mode
if (process.argv[1] && process.argv[1].includes('lbo-calculators')) {
  console.log('=== LBO Calculator Demo ===');
  for (const land of ['berlin', 'nrw'] as Land[]) {
    console.log(`\n--- ${land.toUpperCase()} ---`);
    console.log(`Abstandsfläche (H=12m): ${calculateAbstandsflaeche(12, land)}m`);
    console.log(`Stellplätze (10 WE):`, calculateStellplaetze(10, land));
  }
  console.log(`\nGebäudeklasse (H=10m, 300m², 5 NE): GK${getGebaeudeKlasse(10, 300, 5)}`);
}
