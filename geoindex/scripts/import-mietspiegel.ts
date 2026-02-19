/**
 * Import Mietspiegel — Standalone Script (npx tsx)
 * Reads demographic data and upserts estimated rent data to Supabase geo_mietspiegel
 */
import { readFileSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const projectRoot = resolve(__dirname, '../..');

// Load env
function loadEnv(): { url: string; key: string } {
  for (const f of ['.env.supabase', '.env.local']) {
    try {
      const content = readFileSync(resolve(projectRoot, f), 'utf-8');
      const url = content.match(/NEXT_PUBLIC_SUPABASE_URL=(.+)/)?.[1]?.trim();
      const key = content.match(/SUPABASE_SERVICE_ROLE_KEY=(.+)/)?.[1]?.trim()
        || content.match(/NEXT_PUBLIC_SUPABASE_ANON_KEY=(.+)/)?.[1]?.trim();
      if (url && key) return { url, key };
    } catch {}
  }
  throw new Error('Supabase credentials not found in .env.supabase or .env.local');
}

// Import demographic data dynamically
async function loadDemographics() {
  const mod = await import(resolve(projectRoot, 'src/app/demo/demographicData.ts'));
  return { berlin: mod.BERLIN_DEMOGRAPHICS, nrw: mod.NRW_DEMOGRAPHICS };
}

// Estimate average rent from Kaufkraftindex (rough Berlin/NRW heuristic)
function estimateRent(kaufkraftindex: number, land: 'berlin' | 'nrw'): number {
  const base = land === 'berlin' ? 12.5 : 9.0;
  return Math.round((base * (kaufkraftindex / 100)) * 100) / 100;
}

interface MietspiegelRow {
  bezirk: string;
  land: string;
  miete_kalt_pro_qm: number;
  kaufkraftindex: number;
  quelle: string;
  stand: string;
}

async function main() {
  const { url, key } = loadEnv();
  const data = await loadDemographics();
  const rows: MietspiegelRow[] = [];

  for (const [name, profile] of Object.entries(data.berlin) as [string, any][]) {
    rows.push({
      bezirk: name, land: 'berlin',
      miete_kalt_pro_qm: estimateRent(profile.kaufkraftindex, 'berlin'),
      kaufkraftindex: profile.kaufkraftindex,
      quelle: 'demographicData.ts (geschätzt)', stand: '2024',
    });
  }
  for (const [name, profile] of Object.entries(data.nrw) as [string, any][]) {
    rows.push({
      bezirk: name, land: 'nrw',
      miete_kalt_pro_qm: estimateRent(profile.kaufkraftindex, 'nrw'),
      kaufkraftindex: profile.kaufkraftindex,
      quelle: 'demographicData.ts (geschätzt)', stand: '2024',
    });
  }

  console.log(`Upserting ${rows.length} Mietspiegel rows...`);

  // Upsert via Supabase REST API (no SDK needed)
  const res = await fetch(`${url}/rest/v1/geo_mietspiegel`, {
    method: 'POST',
    headers: {
      'apikey': key,
      'Authorization': `Bearer ${key}`,
      'Content-Type': 'application/json',
      'Prefer': 'resolution=merge-duplicates',
    },
    body: JSON.stringify(rows),
  });

  if (!res.ok) {
    const body = await res.text();
    console.error(`Error ${res.status}: ${body}`);
    process.exit(1);
  }

  console.log(`✅ ${rows.length} rows upserted to geo_mietspiegel`);
}

main().catch(e => { console.error(e); process.exit(1); });
