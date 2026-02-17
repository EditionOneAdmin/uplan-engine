#!/usr/bin/env node
/**
 * Run migration against Supabase.
 * 
 * Usage:
 *   SUPABASE_DB_PASSWORD=<your-db-password> node scripts/run-migration.mjs
 * 
 * If you don't have the DB password, run the SQL manually:
 *   1. Go to https://supabase.com/dashboard/project/jkcnvuyklczouglhcoih/sql
 *   2. Paste contents of supabase/migrations/001_pipeline_tables.sql
 *   3. Click "Run"
 */
import { readFileSync } from 'fs'
import postgres from 'postgres'

const password = process.env.SUPABASE_DB_PASSWORD
if (!password) {
  console.error('❌ SUPABASE_DB_PASSWORD not set.')
  console.error('Run the migration SQL manually via Supabase Dashboard SQL Editor:')
  console.error('  https://supabase.com/dashboard/project/jkcnvuyklczouglhcoih/sql')
  console.error('  File: supabase/migrations/001_pipeline_tables.sql')
  process.exit(1)
}

const sql = postgres(`postgresql://postgres:${password}@db.jkcnvuyklczouglhcoih.supabase.co:5432/postgres?sslmode=require`)
const migration = readFileSync(new URL('../supabase/migrations/001_pipeline_tables.sql', import.meta.url), 'utf-8')

console.log('Running migration...')
try {
  await sql.unsafe(migration)
  console.log('✅ Migration completed!')
  const r = await sql`SELECT count(*) FROM projects`
  console.log('Verified: projects table exists')
} catch (e) {
  console.error('❌ Failed:', e.message)
  process.exit(1)
} finally {
  await sql.end()
}
