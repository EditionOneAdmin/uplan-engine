-- Create geo_hochwasser table for flood risk zone data
-- Sources: Berlin WFS (gdi.berlin.de), NRW OpenGeodata Shapefiles

CREATE TABLE IF NOT EXISTS geo_hochwasser (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  geometry GEOMETRY(Geometry, 4326),
  risikozone TEXT NOT NULL,
  wassertiefe TEXT,
  ueberflutungsschutz TEXT,
  bundesland TEXT NOT NULL,
  gemeinde TEXT,
  quelle_url TEXT NOT NULL,
  raw_data JSONB,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_geo_hochwasser_geometry ON geo_hochwasser USING GIST (geometry);
CREATE INDEX IF NOT EXISTS idx_geo_hochwasser_land_zone ON geo_hochwasser (bundesland, risikozone);

ALTER TABLE geo_hochwasser ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'geo_hochwasser' AND policyname = 'geo_hochwasser_public_read') THEN
    CREATE POLICY "geo_hochwasser_public_read" ON geo_hochwasser FOR SELECT TO anon, authenticated USING (true);
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'geo_hochwasser' AND policyname = 'geo_hochwasser_service_write') THEN
    CREATE POLICY "geo_hochwasser_service_write" ON geo_hochwasser FOR ALL TO service_role USING (true) WITH CHECK (true);
  END IF;
END $$;
