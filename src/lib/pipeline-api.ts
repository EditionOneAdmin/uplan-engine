import { supabase } from './supabase'
import type {
  Project, Baufeld, Variante, ProjectOverview,
  CreateProject, UpdateProject,
  CreateBaufeld, UpdateBaufeld,
  CreateVariante, UpdateVariante,
} from '@/types/pipeline'

// ─── Projects ────────────────────────────────────────────────────────────────

export async function getProjects(): Promise<Project[]> {
  const { data, error } = await supabase
    .from('projects')
    .select('*')
    .order('updated_at', { ascending: false })
  if (error) throw error
  return data as Project[]
}

export async function getProject(id: string): Promise<Project | null> {
  const { data, error } = await supabase
    .from('projects')
    .select('*')
    .eq('id', id)
    .single()
  if (error) return null
  return data as Project
}

export async function createProject(project: CreateProject): Promise<Project> {
  const { data, error } = await supabase
    .from('projects')
    .insert(project)
    .select()
    .single()
  if (error) throw error
  return data as Project
}

export async function updateProject(id: string, updates: UpdateProject): Promise<Project> {
  const { data, error } = await supabase
    .from('projects')
    .update(updates)
    .eq('id', id)
    .select()
    .single()
  if (error) throw error
  return data as Project
}

export async function deleteProject(id: string): Promise<void> {
  const { error } = await supabase.from('projects').delete().eq('id', id)
  if (error) throw error
}

// ─── Baufelder ───────────────────────────────────────────────────────────────

export async function getBaufelder(projectId: string): Promise<Baufeld[]> {
  const { data, error } = await supabase
    .from('baufelder')
    .select('*')
    .eq('project_id', projectId)
    .order('created_at', { ascending: false })
  if (error) throw error
  return data as Baufeld[]
}

export async function createBaufeld(baufeld: CreateBaufeld): Promise<Baufeld> {
  const { data, error } = await supabase
    .from('baufelder')
    .insert(baufeld)
    .select()
    .single()
  if (error) throw error
  return data as Baufeld
}

export async function updateBaufeld(id: string, updates: UpdateBaufeld): Promise<Baufeld> {
  const { data, error } = await supabase
    .from('baufelder')
    .update(updates)
    .eq('id', id)
    .select()
    .single()
  if (error) throw error
  return data as Baufeld
}

export async function deleteBaufeld(id: string): Promise<void> {
  const { error } = await supabase.from('baufelder').delete().eq('id', id)
  if (error) throw error
}

// ─── Varianten ───────────────────────────────────────────────────────────────

export async function getVarianten(baufeldId: string): Promise<Variante[]> {
  const { data, error } = await supabase
    .from('varianten')
    .select('*')
    .eq('baufeld_id', baufeldId)
    .order('created_at', { ascending: false })
  if (error) throw error
  return data as Variante[]
}

export async function createVariante(variante: CreateVariante): Promise<Variante> {
  const { data, error } = await supabase
    .from('varianten')
    .insert(variante)
    .select()
    .single()
  if (error) throw error
  return data as Variante
}

export async function updateVariante(id: string, updates: UpdateVariante): Promise<Variante> {
  const { data, error } = await supabase
    .from('varianten')
    .update(updates)
    .eq('id', id)
    .select()
    .single()
  if (error) throw error
  return data as Variante
}

export async function deleteVariante(id: string): Promise<void> {
  const { error } = await supabase.from('varianten').delete().eq('id', id)
  if (error) throw error
}

export async function setFavorite(baufeldId: string, varianteId: string): Promise<Variante> {
  // Clear existing favorites for this baufeld
  const { error: clearError } = await supabase
    .from('varianten')
    .update({ is_favorite: false, status: 'draft' as const })
    .eq('baufeld_id', baufeldId)
    .eq('is_favorite', true)
  if (clearError) throw clearError

  // Set new favorite
  const { data, error } = await supabase
    .from('varianten')
    .update({ is_favorite: true, status: 'favorite' as const })
    .eq('id', varianteId)
    .select()
    .single()
  if (error) throw error
  return data as Variante
}

// ─── Aggregated ──────────────────────────────────────────────────────────────

export async function getProjectOverview(projectId: string): Promise<ProjectOverview | null> {
  const project = await getProject(projectId)
  if (!project) return null

  const baufelder = await getBaufelder(projectId)

  let varianten_count = 0
  let favorite_count = 0

  for (const bf of baufelder) {
    const varianten = await getVarianten(bf.id)
    varianten_count += varianten.length
    favorite_count += varianten.filter(v => v.is_favorite).length
  }

  return {
    ...project,
    baufelder_count: baufelder.length,
    varianten_count,
    favorite_count,
  }
}
