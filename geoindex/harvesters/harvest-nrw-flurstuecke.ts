/**
 * NRW ALKIS Flurstücke Harvester (Phase 4 prep)
 *
 * WFS Endpoint: https://www.wfs.nrw.de/geobasis/wfs_nw_alkis_vereinfacht
 * FeatureType:  ave:Flurstueck
 * License:      Datenlizenz Deutschland – Zero (dl-de/zero-2-0)
 * CRS:          EPSG:25832 (native), EPSG:4326 (requested)
 *
 * ⚠️  NRW hat ~17 Mio Flurstücke. Dieses Script paginiert in Batches.
 *     NICHT ohne Kontrolle auf die gesamte DB loslassen!
 *
 * Usage:
 *   npx tsx geoindex/harvesters/harvest-nrw-flurstuecke.ts [--gemeinde <gmdschl>] [--limit <n>] [--dry-run]
 */

import { createClient } from "@supabase/supabase-js";
import { XMLParser } from "fast-xml-parser";

// ---------------------------------------------------------------------------
// Config
// ---------------------------------------------------------------------------

const WFS_BASE =
  "https://www.wfs.nrw.de/geobasis/wfs_nw_alkis_vereinfacht";
const FEATURE_TYPE = "ave:Flurstueck";
const PAGE_SIZE = 1000; // WFS server may cap this
const SUPABASE_URL =
  process.env.SUPABASE_URL ??
  process.env.NEXT_PUBLIC_SUPABASE_URL ??
  "https://jkcnvuyklczouglhcoih.supabase.co";
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY ?? "";
const TABLE = "geo_fluerstuecke";

// ---------------------------------------------------------------------------
// CLI args
// ---------------------------------------------------------------------------

function parseArgs() {
  const args = process.argv.slice(2);
  let gemeinde: string | undefined;
  let limit = Infinity;
  let dryRun = false;

  for (let i = 0; i < args.length; i++) {
    if (args[i] === "--gemeinde" && args[i + 1]) gemeinde = args[++i];
    if (args[i] === "--limit" && args[i + 1]) limit = Number(args[++i]);
    if (args[i] === "--dry-run") dryRun = true;
  }
  return { gemeinde, limit, dryRun };
}

// ---------------------------------------------------------------------------
// WFS fetcher
// ---------------------------------------------------------------------------

function buildUrl(startIndex: number, gemeinde?: string): string {
  const params = new URLSearchParams({
    SERVICE: "WFS",
    VERSION: "2.0.0",
    REQUEST: "GetFeature",
    TYPENAMES: FEATURE_TYPE,
    COUNT: String(PAGE_SIZE),
    STARTINDEX: String(startIndex),
    SRSNAME: "EPSG:4326",
  });

  // Optional spatial/attribute filter for a single Gemeinde
  if (gemeinde) {
    // CQL filter on gmdschl (8-digit Gemeindeschlüssel)
    params.set(
      "CQL_FILTER",
      `gmdschl='${gemeinde}'`
    );
  }

  return `${WFS_BASE}?${params.toString()}`;
}

interface FlurstueckRaw {
  idflurst: string;
  flstkennz: string;
  land: string;
  gemarkung: string;
  gemaschl: string;
  flur: string;
  flurschl: string;
  flstnrzae: string;
  flstnrnen?: string;
  regbezirk: string;
  kreis: string;
  kreisschl: string;
  gemeinde: string;
  gmdschl: string;
  aktualit: string;
  flaeche: number;
  lagebeztxt?: string;
  tntxt?: string;
  geometrie: any;
}

/**
 * Extract a GeoJSON polygon from the GML geometry.
 * The WFS returns gml:MultiSurface → gml:surfaceMember → gml:Polygon → gml:exterior → gml:LinearRing → gml:posList
 * posList is "lat lon lat lon ..." when EPSG:4326 (axis order!)
 */
function gmlToGeoJSON(geometrie: any): GeoJSON.Geometry | null {
  try {
    // Navigate the parsed XML structure
    const multiSurface =
      geometrie?.["gml:MultiSurface"] ?? geometrie;
    const surfaceMember = multiSurface?.["gml:surfaceMember"];
    const members = Array.isArray(surfaceMember)
      ? surfaceMember
      : [surfaceMember];

    const polygons: number[][][] = [];

    for (const member of members) {
      const polygon = member?.["gml:Polygon"];
      if (!polygon) continue;

      const exterior = polygon["gml:exterior"];
      const ring = exterior?.["gml:LinearRing"];
      const posList: string = ring?.["gml:posList"];
      if (!posList) continue;

      const coords = posList.trim().split(/\s+/).map(Number);
      const lngLat: number[][] = [];
      // GML with EPSG:4326 uses lat,lon order
      for (let i = 0; i < coords.length; i += 2) {
        lngLat.push([coords[i + 1], coords[i]]); // [lng, lat]
      }
      polygons.push(lngLat);
    }

    if (polygons.length === 0) return null;
    if (polygons.length === 1) {
      return { type: "Polygon", coordinates: [polygons[0]] };
    }
    return {
      type: "MultiPolygon",
      coordinates: polygons.map((p) => [p]),
    };
  } catch {
    return null;
  }
}

/**
 * Compute centroid from coordinate rings (simple average).
 */
function centroid(geojson: GeoJSON.Geometry): [number, number] | null {
  let coords: number[][] = [];
  if (geojson.type === "Polygon") {
    coords = (geojson as GeoJSON.Polygon).coordinates[0];
  } else if (geojson.type === "MultiPolygon") {
    for (const poly of (geojson as GeoJSON.MultiPolygon).coordinates) {
      coords.push(...poly[0]);
    }
  }
  if (coords.length === 0) return null;
  const lng = coords.reduce((s, c) => s + c[0], 0) / coords.length;
  const lat = coords.reduce((s, c) => s + c[1], 0) / coords.length;
  return [lng, lat];
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

async function main() {
  const { gemeinde, limit, dryRun } = parseArgs();

  console.log("🌍 NRW ALKIS Flurstücke Harvester");
  console.log(`   WFS:      ${WFS_BASE}`);
  console.log(`   Feature:  ${FEATURE_TYPE}`);
  if (gemeinde) console.log(`   Gemeinde: ${gemeinde}`);
  if (limit < Infinity) console.log(`   Limit:    ${limit}`);
  if (dryRun) console.log("   🔸 DRY RUN — no database writes");
  console.log();

  const parser = new XMLParser({
    ignoreAttributes: false,
    attributeNamePrefix: "@_",
    removeNSPrefix: false,
  });

  let supabase: ReturnType<typeof createClient> | null = null;
  if (!dryRun) {
    if (!SUPABASE_KEY) {
      console.error("❌ SUPABASE_SERVICE_ROLE_KEY not set. Use --dry-run or set env var.");
      process.exit(1);
    }
    supabase = createClient(SUPABASE_URL, SUPABASE_KEY);
  }

  let startIndex = 0;
  let totalFetched = 0;

  while (totalFetched < limit) {
    const url = buildUrl(startIndex, gemeinde);
    console.log(`📥 Fetching startIndex=${startIndex} ...`);

    const res = await fetch(url);
    if (!res.ok) {
      console.error(`❌ HTTP ${res.status}: ${await res.text()}`);
      break;
    }

    const xml = await res.text();
    const parsed = parser.parse(xml);
    const collection =
      parsed["wfs:FeatureCollection"] ?? parsed["FeatureCollection"];
    if (!collection) {
      console.error("❌ Could not parse FeatureCollection");
      break;
    }

    const numberReturned = Number(
      collection["@_numberReturned"] ?? 0
    );

    if (numberReturned === 0) {
      console.log("✅ No more features.");
      break;
    }

    // Extract members
    let members = collection["wfs:member"];
    if (!Array.isArray(members)) members = [members];

    const rows: any[] = [];

    for (const member of members) {
      if (totalFetched >= limit) break;

      const f: FlurstueckRaw = member["Flurstueck"] ?? member["ave:Flurstueck"];
      if (!f) continue;

      const geojson = gmlToGeoJSON(f.geometrie ?? f["geometrie"]);
      const center = geojson ? centroid(geojson) : null;

      rows.push({
        gemeinde: String(f.gemeinde),
        gemarkung: String(f.gemarkung),
        flur: String(f.flur),
        zaehler: String(f.flstnrzae),
        nenner: f.flstnrnen ? String(f.flstnrnen) : null,
        bundesland: "nrw",
        kreis: String(f.kreis),
        nutzungsart: f.tntxt ?? null,
        flaeche_m2: Number(f.flaeche) || null,
        geometry: geojson
          ? geojson.type === "MultiPolygon"
            ? { type: "Polygon" as const, coordinates: (geojson as GeoJSON.MultiPolygon).coordinates[0] }
            : geojson
          : null,
        raw_data: {
          source_id: String(f.idflurst),
          flstkennz: String(f.flstkennz).trim(),
          gemaschl: String(f.gemaschl),
          gmdschl: String(f.gmdschl),
          kreisschl: String(f.kreisschl),
          lagebezeichnung: f.lagebeztxt ?? null,
          aktualitaet: f.aktualit ?? null,
          centroid_lng: center?.[0] ?? null,
          centroid_lat: center?.[1] ?? null,
          quelle: "wfs_nw_alkis_vereinfacht",
        },
      });

      totalFetched++;
    }

    console.log(
      `   → Parsed ${rows.length} features (total: ${totalFetched})`
    );

    // Upsert to Supabase
    if (supabase && rows.length > 0) {
      const { error } = await supabase
        .from(TABLE)
        .insert(rows);

      if (error) {
        console.error("❌ Supabase upsert error:", error.message);
      } else {
        console.log(`   ✅ Upserted ${rows.length} rows`);
      }
    }

    if (dryRun && rows.length > 0) {
      console.log("   📋 Sample:", JSON.stringify(rows[0], null, 2).slice(0, 500));
    }

    if (numberReturned < PAGE_SIZE) {
      console.log("✅ Last page reached.");
      break;
    }

    startIndex += PAGE_SIZE;
  }

  console.log(`\n🏁 Done. Total fetched: ${totalFetched}`);
}

main().catch((err) => {
  console.error("Fatal:", err);
  process.exit(1);
});
