import { readFileSync } from 'fs'
import postgres from 'postgres'

// Supabase direct Postgres connection
// Format: postgresql://postgres.[project-ref]:[password]@aws-0-[region].pooler.supabase.com:6543/postgres
const sql = postgres(`postgresql://postgres.jkcnvuyklczouglhcoih:${process.env.SUPABASE_DB_PASSWORD}@aws-0-eu-central-1.pooler.supabase.com:6543/postgres`, {
  ssl: 'require',
})

const migration = readFileSync(new URL('../supabase/migrations/001_pipeline_tables.sql', import.meta.url), 'utf-8')

console.log('Running migration...')
try {
  await sql.unsafe(migration)
  console.log('✅ Migration completed successfully!')
  
  // Verify
  const projects = await sql`SELECT count(*) FROM projects`
  console.log('Projects table exists, count:', projects[0].count)
  
  const baufelder = await sql`SELECT count(*) FROM baufelder`
  console.log('Baufelder table exists, count:', baufelder[0].count)
  
  const varianten = await sql`SELECT count(*) FROM varianten`
  console.log('Varianten table exists, count:', varianten[0].count)
} catch (e) {
  console.error('❌ Migration failed:', e.message)
  process.exit(1)
} finally {
  await sql.end()
}
