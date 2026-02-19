/**
 * GeoIndex Validator — Standalone Script (npx tsx)
 * Validates all geo_* tables for plausibility
 */
import { readFileSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const projectRoot = resolve(__dirname, '../..');

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
  throw new Error('Supabase credentials not found');
}

async function query(url: string, key: string, table: string, select = '*', limit = 1000): Promise<any[]> {
  const res = await fetch(`${url}/rest/v1/${table}?select=${select}&limit=${limit}`, {
    headers: { 'apikey': key, 'Authorization': `Bearer ${key}` },
  });
  if (!res.ok) return [];
  return res.json();
}

interface ValidationResult {
  table: string;
  total: number;
  errors: string[];
  valid: number;
  invalid: number;
}

async function validateBoris(url: string, key: string): Promise<ValidationResult> {
  const rows = await query(url, key, 'geo_boris');
  const errors: string[] = [];
  for (const r of rows) {
    const brw = r.brw ?? r.bodenrichtwert ?? r.value;
    if (brw != null && (brw < 0 || brw > 5000)) {
      errors.push(`BRW ${brw} außerhalb 0-5000 EUR/m² (id: ${r.id})`);
    }
  }
  return { table: 'geo_boris', total: rows.length, errors, valid: rows.length - errors.length, invalid: errors.length };
}

async function validateFlurstuecke(url: string, key: string): Promise<ValidationResult> {
  const rows = await query(url, key, 'geo_flurstuecke');
  const errors: string[] = [];
  for (const r of rows) {
    const flaeche = r.flaeche ?? r.area ?? r.flaeche_qm;
    if (flaeche != null && flaeche <= 0) {
      errors.push(`Fläche ≤ 0 (id: ${r.id})`);
    }
  }
  return { table: 'geo_flurstuecke', total: rows.length, errors, valid: rows.length - errors.length, invalid: errors.length };
}

async function validateMietspiegel(url: string, key: string): Promise<ValidationResult> {
  const rows = await query(url, key, 'geo_mietspiegel');
  const errors: string[] = [];
  for (const r of rows) {
    const miete = r.miete_kalt_pro_qm ?? r.miete;
    if (miete != null && (miete < 3 || miete > 30)) {
      errors.push(`Miete ${miete} EUR/m² außerhalb 3-30 (bezirk: ${r.bezirk})`);
    }
  }
  return { table: 'geo_mietspiegel', total: rows.length, errors, valid: rows.length - errors.length, invalid: errors.length };
}

async function validateBplaene(url: string, key: string): Promise<ValidationResult> {
  const validStatus = ['festgesetzt', 'entwurf', 'aufstellung', 'aufgehoben', 'im_verfahren', 'rechtsverbindlich', 'fruehzeitig'];
  const rows = await query(url, key, 'geo_bplaene');
  const errors: string[] = [];
  for (const r of rows) {
    const status = (r.status ?? r.planstatus ?? '').toLowerCase();
    if (status && !validStatus.includes(status)) {
      errors.push(`Unbekannter Status "${status}" (id: ${r.id})`);
    }
  }
  return { table: 'geo_bplaene', total: rows.length, errors, valid: rows.length - errors.length, invalid: errors.length };
}

async function main() {
  const { url, key } = loadEnv();
  console.log('🔍 Validating geo_* tables...\n');

  const results = await Promise.all([
    validateBoris(url, key),
    validateFlurstuecke(url, key),
    validateMietspiegel(url, key),
    validateBplaene(url, key),
  ]);

  const report = {
    timestamp: new Date().toISOString(),
    summary: {
      tables: results.length,
      totalRows: results.reduce((s, r) => s + r.total, 0),
      totalErrors: results.reduce((s, r) => s + r.invalid, 0),
    },
    results,
  };

  console.log(JSON.stringify(report, null, 2));

  if (report.summary.totalErrors > 0) {
    console.log(`\n⚠️  ${report.summary.totalErrors} validation errors found`);
    process.exit(1);
  } else {
    console.log(`\n✅ All ${report.summary.totalRows} rows valid`);
  }
}

main().catch(e => { console.error(e); process.exit(1); });
