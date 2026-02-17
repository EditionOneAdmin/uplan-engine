import { supabase } from './supabase'
import type { Project, Baufeld, Variante, ProjectOverview } from '@/types/pipeline'

// ─── Projects ─────────────────────────────────────────

export async function getProjects(): Promise<Project[]> {
  const { data, error } = await supabase
    .from('projects')
    .select('*')
    .order('updated_at', { ascending: false })
  if (error) throw error
  return data ?? []
}

export async function getProject(id: string): Promise<Project | null> {
  const { data, error } = await supabase
    .from('projects')
    .select('*')
    .eq('id', id)
    .single()
  if (error) throw error
  return data
}

export async function createProject(name: string, description?: string): Promise<Project> {
  const { data, error } = await supabase
    .from('projects')
    .insert({ name, description })
    .select()
    .single()
  if (error) throw error
  return data
}

export async function updateProject(id: string, updates: Partial<Pick<Project, 'name' | 'description' | 'status'>>): Promise<Project> {
  const { data, error } = await supabase
    .from('projects')
    .update(updates)
    .eq('id', id)
    .select()
    .single()
  if (error) throw error
  return data
}

export async function deleteProject(id: string): Promise<void> {
  const { error } = await supabase.from('projects').delete().eq('id', id)
  if (error) throw error
}

// ─── Baufelder ────────────────────────────────────────

export async function getBaufelder(projectId: string): Promise<Baufeld[]> {
  const { data, error } = await supabase
    .from('baufelder')
    .select('*')
    .eq('project_id', projectId)
    .order('created_at', { ascending: true })
  if (error) throw error
  return data ?? []
}

export async function createBaufeld(projectId: string, name: string, opts?: { flurstueck_info?: Record<string, unknown>; location?: { lat: number; lng: number }; region?: string }): Promise<Baufeld> {
  const { data, error } = await supabase
    .from('baufelder')
    .insert({ project_id: projectId, name, ...opts })
    .select()
    .single()
  if (error) throw error
  return data
}

export async function updateBaufeld(id: string, updates: Partial<Pick<Baufeld, 'name' | 'flurstueck_info' | 'location' | 'region'>>): Promise<Baufeld> {
  const { data, error } = await supabase
    .from('baufelder')
    .update(updates)
    .eq('id', id)
    .select()
    .single()
  if (error) throw error
  return data
}

export async function deleteBaufeld(id: string): Promise<void> {
  const { error } = await supabase.from('baufelder').delete().eq('id', id)
  if (error) throw error
}

// ─── Varianten ────────────────────────────────────────

export async function getVarianten(baufeldId: string): Promise<Variante[]> {
  const { data, error } = await supabase
    .from('varianten')
    .select('*')
    .eq('baufeld_id', baufeldId)
    .order('created_at', { ascending: true })
  if (error) throw error
  return data ?? []
}

export async function createVariante(baufeldId: string, name: string, config: {
  bauplan_config?: Record<string, unknown>
  gebaeude_config?: Record<string, unknown>
  wirtschaftlichkeit?: Record<string, unknown>
  map_snapshot_url?: string
}): Promise<Variante> {
  const { data, error } = await supabase
    .from('varianten')
    .insert({ baufeld_id: baufeldId, name, ...config })
    .select()
    .single()
  if (error) throw error
  return data
}

export async function updateVariante(id: string, updates: Partial<Omit<Variante, 'id' | 'baufeld_id' | 'created_at' | 'updated_at'>>): Promise<Variante> {
  const { data, error } = await supabase
    .from('varianten')
    .update(updates)
    .eq('id', id)
    .select()
    .single()
  if (error) throw error
  return data
}

export async function deleteVariante(id: string): Promise<void> {
  const { error } = await supabase.from('varianten').delete().eq('id', id)
  if (error) throw error
}

export async function setFavorite(baufeldId: string, varianteId: string): Promise<void> {
  // Unfavorite all in this baufeld first
  await supabase
    .from('varianten')
    .update({ is_favorite: false, status: 'draft' })
    .eq('baufeld_id', baufeldId)

  // Set the chosen one
  await supabase
    .from('varianten')
    .update({ is_favorite: true, status: 'favorite' })
    .eq('id', varianteId)
}

// ─── Project Overview ─────────────────────────────────

export async function getProjectOverview(projectId: string): Promise<ProjectOverview | null> {
  const project = await getProject(projectId)
  if (!project) return null

  const baufelder = await getBaufelder(projectId)

  let varianten_count = 0
  let total_bgf = 0
  let total_investment = 0
  let rendite_sum = 0
  let rendite_count = 0

  for (const bf of baufelder) {
    const varianten = await getVarianten(bf.id)
    varianten_count += varianten.length

    // Aggregate from favorite or first variante
    const chosen = varianten.find(v => v.is_favorite) ?? varianten[0]
    if (chosen?.wirtschaftlichkeit) {
      const w = chosen.wirtschaftlichkeit as Record<string, number>
      if (w.total_bgf) total_bgf += w.total_bgf
      if (w.total_investment) total_investment += w.total_investment
      if (w.rendite != null) {
        rendite_sum += w.rendite
        rendite_count++
      }
    }
  }

  return {
    ...project,
    baufelder_count: baufelder.length,
    varianten_count,
    total_bgf: total_bgf || undefined,
    total_investment: total_investment || undefined,
    avg_rendite: rendite_count > 0 ? rendite_sum / rendite_count : undefined,
  }
}
