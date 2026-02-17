-- U-Plan Engine Pipeline Management Schema
-- Run this in Supabase SQL Editor

-- Projects
CREATE TABLE projects (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'planning', 'favorite_chosen', 'completed')),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Baufelder
CREATE TABLE baufelder (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  flurstueck_info JSONB,
  location JSONB,
  region TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Varianten
CREATE TABLE varianten (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  baufeld_id UUID REFERENCES baufelder(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  is_favorite BOOLEAN DEFAULT false,
  bauplan_config JSONB,
  gebaeude_config JSONB,
  wirtschaftlichkeit JSONB,
  map_snapshot_url TEXT,
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'favorite', 'archived')),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Indexes
CREATE INDEX idx_baufelder_project ON baufelder(project_id);
CREATE INDEX idx_varianten_baufeld ON varianten(baufeld_id);

-- Updated_at trigger
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER projects_updated_at BEFORE UPDATE ON projects FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER baufelder_updated_at BEFORE UPDATE ON baufelder FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER varianten_updated_at BEFORE UPDATE ON varianten FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- RLS (permissive for MVP — single user)
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE baufelder ENABLE ROW LEVEL SECURITY;
ALTER TABLE varianten ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow all on projects" ON projects FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all on baufelder" ON baufelder FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all on varianten" ON varianten FOR ALL USING (true) WITH CHECK (true);
