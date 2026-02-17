export interface Project {
  id: string
  name: string
  description: string | null
  status: 'active' | 'planning' | 'favorite_chosen' | 'completed'
  created_at: string
  updated_at: string
}

export interface Baufeld {
  id: string
  project_id: string
  name: string
  flurstueck_info: Record<string, unknown> | null
  location: { lat: number; lng: number } | null
  region: string | null
  created_at: string
  updated_at: string
}

export interface Variante {
  id: string
  baufeld_id: string
  name: string
  is_favorite: boolean
  bauplan_config: Record<string, unknown> | null
  gebaeude_config: Record<string, unknown> | null
  wirtschaftlichkeit: Record<string, unknown> | null
  map_snapshot_url: string | null
  status: 'draft' | 'favorite' | 'archived'
  created_at: string
  updated_at: string
}

export interface ProjectOverview extends Project {
  baufelder_count: number
  varianten_count: number
  favorite_count: number
}

export type CreateProject = Pick<Project, 'name'> & Partial<Pick<Project, 'description' | 'status'>>
export type UpdateProject = Partial<Pick<Project, 'name' | 'description' | 'status'>>

export type CreateBaufeld = Pick<Baufeld, 'project_id' | 'name'> & Partial<Pick<Baufeld, 'flurstueck_info' | 'location' | 'region'>>
export type UpdateBaufeld = Partial<Pick<Baufeld, 'name' | 'flurstueck_info' | 'location' | 'region'>>

export type CreateVariante = Pick<Variante, 'baufeld_id' | 'name'> & Partial<Pick<Variante, 'bauplan_config' | 'gebaeude_config' | 'wirtschaftlichkeit' | 'map_snapshot_url' | 'status'>>
export type UpdateVariante = Partial<Pick<Variante, 'name' | 'is_favorite' | 'bauplan_config' | 'gebaeude_config' | 'wirtschaftlichkeit' | 'map_snapshot_url' | 'status'>>
