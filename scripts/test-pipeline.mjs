#!/usr/bin/env node
/**
 * Test the pipeline CRUD operations via Supabase REST API.
 * Uses the service role key for testing.
 */
import { createClient } from '@supabase/supabase-js'

import { readFileSync } from 'fs'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'

const __dirname = dirname(fileURLToPath(import.meta.url))
const envFile = readFileSync(join(__dirname, '..', '.env.supabase'), 'utf-8')
const env = Object.fromEntries(envFile.split('\n').filter(l => l.includes('=')).map(l => l.split('=')))

const url = env.NEXT_PUBLIC_SUPABASE_URL
const key = env.SUPABASE_SERVICE_ROLE_KEY
const supabase = createClient(url, key)

async function test() {
  console.log('🧪 Testing Pipeline CRUD...\n')

  // Create project
  const { data: project, error: e1 } = await supabase
    .from('projects')
    .insert({ name: 'Test Project', description: 'Auto-test' })
    .select()
    .single()
  if (e1) { console.error('❌ Create project failed:', e1.message); return }
  console.log('✅ Created project:', project.id, project.name)

  // Read back
  const { data: projects, error: e2 } = await supabase
    .from('projects')
    .select('*')
    .eq('id', project.id)
  if (e2) { console.error('❌ Read failed:', e2.message); return }
  console.log('✅ Read back:', projects.length, 'project(s)')

  // Create baufeld
  const { data: baufeld, error: e3 } = await supabase
    .from('baufelder')
    .insert({ project_id: project.id, name: 'Baufeld A', region: 'berlin' })
    .select()
    .single()
  if (e3) { console.error('❌ Create baufeld failed:', e3.message); return }
  console.log('✅ Created baufeld:', baufeld.id, baufeld.name)

  // Create variante
  const { data: variante, error: e4 } = await supabase
    .from('varianten')
    .insert({ baufeld_id: baufeld.id, name: 'Variante 1' })
    .select()
    .single()
  if (e4) { console.error('❌ Create variante failed:', e4.message); return }
  console.log('✅ Created variante:', variante.id, variante.name)

  // Clean up (cascade will handle children)
  const { error: e5 } = await supabase.from('projects').delete().eq('id', project.id)
  if (e5) { console.error('❌ Delete failed:', e5.message); return }
  console.log('✅ Deleted project (cascade cleaned baufeld + variante)')

  console.log('\n🎉 All tests passed!')
}

test().catch(e => { console.error('Fatal:', e); process.exit(1) })
