"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import {
  MapContainer,
  TileLayer,
  WMSTileLayer,
  Polygon,
  Polyline,
  CircleMarker,
  Popup,
  ScaleControl,
  useMap,
  useMapEvents,
  LayersControl,
} from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import type { Baufeld, PlacedUnit } from "./types";
import { BUILDINGS } from "./data";
import PlacedBuildings, { GhostPolygon } from "./PlacedBuildings";

delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

/* ── Helpers ──────────────────────────────────────────────── */

const BAUFELD_TYPE_CONFIG: Record<string, { label: string; color: string; fillColor: string }> = {
  WA: { label: "Allg. Wohngebiet", color: "#EF4444", fillColor: "#EF4444" },
  MI: { label: "Mischgebiet", color: "#F59E0B", fillColor: "#F59E0B" },
  GE: { label: "Gewerbegebiet", color: "#3B82F6", fillColor: "#3B82F6" },
  SO: { label: "Sondergebiet", color: "#8B5CF6", fillColor: "#8B5CF6" },
};

/** Calculate polygon area in m² using Shoelace on lat/lng (approximate via cos correction) */
function calcAreaM2(coords: [number, number][]): number {
  if (coords.length < 3) return 0;
  const toRad = (d: number) => (d * Math.PI) / 180;
  const R = 6371000;
  const avgLat = coords.reduce((s, c) => s + c[0], 0) / coords.length;
  const cosLat = Math.cos(toRad(avgLat));

  // Convert to meters relative to first point
  const ref = coords[0];
  const pts = coords.map((c) => [
    (c[0] - ref[0]) * toRad(1) * R,
    (c[1] - ref[1]) * toRad(1) * R * cosLat,
  ]);

  let area = 0;
  for (let i = 0; i < pts.length; i++) {
    const j = (i + 1) % pts.length;
    area += pts[i][0] * pts[j][1];
    area -= pts[j][0] * pts[i][1];
  }
  return Math.abs(area / 2);
}

/* ── Export map instance to window for PDF export ──────────── */
function MapInstanceExporter() {
  const map = useMap();
  useEffect(() => {
    (window as any).__bplanMap = map;
    return () => { (window as any).__bplanMap = null; };
  }, [map]);
  return null;
}

/* ── Address Search ───────────────────────────────────────── */

function AddressSearch() {
  const map = useMap();
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);

  const search = useCallback(async () => {
    if (!query.trim()) return;
    setLoading(true);
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query + ", Berlin")}&limit=1`
      );
      const data = await res.json();
      if (data.length > 0) {
        const { lat, lon } = data[0];
        map.flyTo([parseFloat(lat), parseFloat(lon)], 17, { duration: 1.5 });
      }
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  }, [query, map]);

  return (
    <div className="leaflet-top leaflet-left" style={{ top: 10, left: 60, position: "absolute", zIndex: 1000 }}>
      <div style={{ display: "flex", gap: 4 }}>
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && search()}
          placeholder="Adresse suchen…"
          style={{
            padding: "6px 10px",
            borderRadius: 6,
            border: "1px solid rgba(255,255,255,0.2)",
            background: "rgba(15,23,42,0.9)",
            color: "#fff",
            fontSize: 13,
            width: 220,
            outline: "none",
          }}
        />
        <button
          onClick={search}
          disabled={loading}
          style={{
            padding: "6px 12px",
            borderRadius: 6,
            background: "#0D9488",
            color: "#fff",
            fontSize: 13,
            border: "none",
            cursor: "pointer",
            opacity: loading ? 0.5 : 1,
          }}
        >
          {loading ? "…" : "🔍"}
        </button>
      </div>
    </div>
  );
}

/* ── Mietspiegel Neubau Lookup (Berlin 2024, Bezugsfertig ab 2010) ── */

const MIETSPIEGEL_NEUBAU: Record<string, { unter40: [number,number,number]; bis60: [number,number,number]; bis90: [number,number,number]; ueber90: [number,number,number] }> = {
  "einfach": { unter40: [11.08, 12.73, 14.38], bis60: [10.15, 11.94, 13.13], bis90: [9.52, 10.89, 12.26], ueber90: [8.97, 10.21, 11.45] },
  "mittel":  { unter40: [12.35, 14.52, 16.69], bis60: [11.22, 13.08, 15.34], bis90: [10.48, 12.41, 14.34], ueber90: [9.84, 11.63, 13.42] },
  "gut":     { unter40: [14.12, 17.43, 20.74], bis60: [12.89, 15.82, 18.75], bis90: [11.94, 14.57, 17.20], ueber90: [11.28, 13.86, 16.44] },
};

const fmtEur = (n: number) => n.toFixed(2).replace(".", ",");

/* ── GetFeatureInfo ───────────────────────────────────────── */

function ClickFeatureInfo({ enabled }: { enabled: boolean }) {
  const map = useMap();
  const activeLayersRef = useRef<Set<string>>(new Set());

  // Track which overlay layers are active
  useEffect(() => {
    const onAdd = (e: L.LayersControlEvent) => {
      activeLayersRef.current = new Set(activeLayersRef.current).add(e.name);
    };
    const onRemove = (e: L.LayersControlEvent) => {
      const next = new Set(activeLayersRef.current);
      next.delete(e.name);
      activeLayersRef.current = next;
    };
    map.on("overlayadd", onAdd as any);
    map.on("overlayremove", onRemove as any);
    return () => {
      map.off("overlayadd", onAdd as any);
      map.off("overlayremove", onRemove as any);
    };
  }, [map]);

  useMapEvents({
    click: async (e) => {
      if (!enabled) return;
      const { lat, lng } = e.latlng;
      const activeLayers = activeLayersRef.current;

      let content = `<div style="font-family:Inter,sans-serif;font-size:12px;max-height:400px;overflow-y:auto;">
        <div style="color:#94a3b8;margin-bottom:4px;">📍 ${lat.toFixed(6)}, ${lng.toFixed(6)}</div>`;

      // --- Flurstück (WFS) ---
      const d = 0.0002;
      const bbox = `${lat - d},${lng - d},${lat + d},${lng + d},urn:ogc:def:crs:EPSG::4326`;
      const flurParams = new URLSearchParams({
        SERVICE: "WFS", VERSION: "2.0.0", REQUEST: "GetFeature",
        TYPENAMES: "flurstuecke", COUNT: "1", BBOX: bbox, OUTPUTFORMAT: "application/json",
      });
      const flurUrl = `https://gdi.berlin.de/services/wfs/alkis_flurstuecke?${flurParams}`;

      // --- WMS GetFeatureInfo helper ---
      const buildGetFeatureInfoUrl = (baseUrl: string, layerName: string) => {
        const delta = 0.0005;
        const wmsBbox = `${lng - delta},${lat - delta},${lng + delta},${lat + delta}`;
        const params = new URLSearchParams({
          SERVICE: "WMS", VERSION: "1.1.1", REQUEST: "GetFeatureInfo",
          LAYERS: layerName, QUERY_LAYERS: layerName,
          INFO_FORMAT: "text/html",
          STYLES: "",
          WIDTH: "256", HEIGHT: "256",
          SRS: "EPSG:4326",
          BBOX: wmsBbox,
          X: "128", Y: "128",
        });
        return `${baseUrl}?${params}`;
      };

      // Parse HTML table response into key-value pairs
      const parseHtmlTable = (html: string): Record<string, string> => {
        const result: Record<string, string> = {};
        const parser = new DOMParser();
        const doc = parser.parseFromString(html, "text/html");
        const headers = Array.from(doc.querySelectorAll("th")).map(th => th.textContent?.trim() || "");
        const cells = Array.from(doc.querySelectorAll("td")).map(td => td.textContent?.trim() || "");
        headers.forEach((h, i) => { if (h && cells[i]) result[h] = cells[i]; });
        return result;
      };

      // Fire all requests in parallel
      const wohnlageActive = activeLayers.has("Wohnlagenkarte (Mietspiegel 2024)");
      const borisActive = activeLayers.has("Bodenrichtwerte 2025 (BORIS)");

      const promises: Promise<any>[] = [
        fetch(flurUrl).then(r => r.ok ? r.json() : null).catch(() => null),
      ];
      if (wohnlageActive) {
        promises.push(
          fetch(buildGetFeatureInfoUrl("https://gdi.berlin.de/services/wms/wohnlagenadr2024", "wohnlagenadr2024"))
            .then(r => r.ok ? r.text() : null).catch(() => null)
        );
      } else {
        promises.push(Promise.resolve(null));
      }
      if (borisActive) {
        promises.push(
          fetch(buildGetFeatureInfoUrl("https://gdi.berlin.de/services/wms/brw2025", "brw2025"))
            .then(r => r.ok ? r.text() : null).catch(() => null)
        );
      } else {
        promises.push(Promise.resolve(null));
      }

      const [flurData, wohnlageHtml, borisHtml] = await Promise.all(promises);

      // --- Render Flurstück ---
      if (flurData) {
        const features = flurData?.features || [];
        if (features.length > 0) {
          const props = features[0].properties || {};
          content += `<div style="margin-top:6px;border-top:1px solid rgba(255,255,255,0.1);padding-top:6px;">
            <div style="font-weight:600;margin-bottom:4px;color:#0D9488;">Flurstück-Info</div>`;
          const labelMap: Record<string, string> = {
            fsko: "Kennzeichen", gmk: "Gemarkung", namgmk: "Gemarkung (Name)",
            fln: "Flur", zae: "Zähler", nen: "Nenner", afl: "Fläche (m²)", namgem: "Gemeinde",
          };
          const keysToShow = Object.keys(labelMap).filter(k => props[k] != null && props[k] !== "");
          if (keysToShow.length > 0) {
            for (const key of keysToShow) {
              const val = key === "afl" ? Number(props[key]).toLocaleString("de-DE") : props[key];
              content += `<div><span style="color:#94a3b8;">${labelMap[key]}:</span> ${val}</div>`;
            }
          } else {
            for (const key of Object.keys(props).slice(0, 8)) {
              content += `<div><span style="color:#94a3b8;">${key}:</span> ${props[key]}</div>`;
            }
          }
          content += `</div>`;
        } else {
          content += `<div style="color:#64748b;margin-top:4px;font-style:italic;">Kein Flurstück gefunden</div>`;
        }
      }

      // --- Render Wohnlage (Mietspiegel) ---
      if (wohnlageActive && wohnlageHtml) {
        const props = parseHtmlTable(wohnlageHtml);
        const hasData = Object.keys(props).length > 0;
        if (hasData) {
          content += `<div style="margin-top:8px;border-top:1px solid rgba(255,255,255,0.1);padding-top:6px;">
            <div style="font-weight:600;margin-bottom:4px;color:#A78BFA;">🏠 Wohnlage (Mietspiegel 2024)</div>`;
          const showKeys = ["Wohnlage", "Bezirk", "Stadtteil", "Straßenname", "Hausnummer", "Postleitzahl", "LOR Planungsraum"];
          for (const key of showKeys) {
            if (props[key]) {
              content += `<div><span style="color:#94a3b8;">${key}:</span> ${props[key]}</div>`;
            }
          }
          // Mietspiegel Neubau lookup
          const wohnlage = (props["Wohnlage"] || "").toLowerCase().trim();
          const miet = MIETSPIEGEL_NEUBAU[wohnlage];
          if (miet) {
            const rows: [string, [number,number,number]][] = [
              ["&lt; 40 m²", miet.unter40],
              ["40–60 m²", miet.bis60],
              ["60–90 m²", miet.bis90],
              ["&gt; 90 m²", miet.ueber90],
            ];
            content += `<div style="margin-top:8px;border-top:1px solid rgba(255,255,255,0.1);padding-top:6px;">
              <div style="font-weight:600;margin-bottom:4px;color:#34D399;">💶 Neubau-Miete (nettokalt/m²)</div>`;
            for (const [label, [lo, mid, hi]] of rows) {
              content += `<div style="display:flex;justify-content:space-between;gap:8px;">
                <span style="color:#94a3b8;white-space:nowrap;">${label}</span>
                <span style="white-space:nowrap;">${fmtEur(lo)} – ${fmtEur(hi)} € <span style="color:#94a3b8;">(Ø ${fmtEur(mid)} €)</span></span>
              </div>`;
            }
            if (wohnlage === "gut") {
              content += `<div style="margin-top:4px;font-size:11px;color:#FBBF24;">⚠️ Neubau ab 2023: bis 24,74 €/m² möglich</div>`;
            }
            content += `</div>`;
          }
          content += `</div>`;
        } else {
          content += `<div style="margin-top:8px;border-top:1px solid rgba(255,255,255,0.1);padding-top:6px;">
            <div style="color:#64748b;font-style:italic;">🏠 Keine Wohnlage-Info gefunden</div></div>`;
        }
      }

      // --- Render Bodenrichtwert (BORIS) ---
      if (borisActive && borisHtml) {
        const props = parseHtmlTable(borisHtml);
        const hasData = Object.keys(props).length > 0;
        if (hasData) {
          content += `<div style="margin-top:8px;border-top:1px solid rgba(255,255,255,0.1);padding-top:6px;">
            <div style="font-weight:600;margin-bottom:4px;color:#FBBF24;">💰 Bodenrichtwert (BORIS 2025)</div>`;
          const showKeys = ["Bodenrichtwert (in EURO/m²)", "Bezirk", "Art der Nutzung", "Stichtag", "Wertrelevante Geschossfläche", "Beitragsrechtlicher Zustand"];
          for (const key of showKeys) {
            if (props[key]) {
              const val = key === "Bodenrichtwert (in EURO/m²)" 
                ? `${Number(props[key]).toLocaleString("de-DE")} €/m²` 
                : props[key];
              content += `<div><span style="color:#94a3b8;">${key === "Bodenrichtwert (in EURO/m²)" ? "Bodenrichtwert" : key}:</span> ${val}</div>`;
            }
          }
          content += `</div>`;
        } else {
          content += `<div style="margin-top:8px;border-top:1px solid rgba(255,255,255,0.1);padding-top:6px;">
            <div style="color:#64748b;font-style:italic;">💰 Kein Bodenrichtwert gefunden</div></div>`;
        }
      }

      content += `</div>`;
      L.popup({ maxWidth: 350, maxHeight: 450 }).setLatLng(e.latlng).setContent(content).openOn(map);
    },
  });

  return null;
}

/* ── Draw Handler (useMapEvents) ──────────────────────────── */

function DrawHandler({
  drawing,
  points,
  setPoints,
  onComplete,
  mousePos,
  setMousePos,
}: {
  drawing: boolean;
  points: [number, number][];
  setPoints: React.Dispatch<React.SetStateAction<[number, number][]>>;
  onComplete: (coords: [number, number][]) => void;
  mousePos: [number, number] | null;
  setMousePos: React.Dispatch<React.SetStateAction<[number, number] | null>>;
}) {
  const map = useMap();

  useEffect(() => {
    const container = map.getContainer();
    if (drawing) {
      container.style.cursor = "crosshair";
      map.doubleClickZoom.disable();
    } else {
      container.style.cursor = "";
      map.doubleClickZoom.enable();
    }
    return () => {
      container.style.cursor = "";
      map.doubleClickZoom.enable();
    };
  }, [drawing, map]);

  useMapEvents({
    click: (e) => {
      if (!drawing) return;
      const pt: [number, number] = [e.latlng.lat, e.latlng.lng];

      // Close polygon if clicking near the first point (> 2 points)
      if (points.length >= 3) {
        const first = points[0];
        const pixFirst = map.latLngToContainerPoint(L.latLng(first[0], first[1]));
        const pixClick = map.latLngToContainerPoint(e.latlng);
        if (pixFirst.distanceTo(pixClick) < 15) {
          onComplete([...points]);
          return;
        }
      }

      setPoints((prev) => [...prev, pt]);
    },
    dblclick: (e) => {
      if (!drawing) return;
      L.DomEvent.stop(e.originalEvent);
      if (points.length >= 3) {
        onComplete([...points]);
      }
    },
    mousemove: (e) => {
      if (!drawing) return;
      setMousePos([e.latlng.lat, e.latlng.lng]);
    },
  });

  return null;
}

/* ── Drawing Preview Layer ────────────────────────────────── */

function DrawPreview({
  points,
  mousePos,
}: {
  points: [number, number][];
  mousePos: [number, number] | null;
}) {
  if (points.length === 0) return null;

  const allPts = mousePos ? [...points, mousePos] : points;

  return (
    <>
      {/* Lines */}
      <Polyline
        positions={allPts}
        pathOptions={{ color: "#0D9488", weight: 2, dashArray: "8 4", opacity: 0.9 }}
      />
      {/* Closing line preview */}
      {points.length >= 3 && mousePos && (
        <Polyline
          positions={[mousePos, points[0]]}
          pathOptions={{ color: "white", weight: 1, dashArray: "4 4", opacity: 0.4 }}
        />
      )}
      {/* Vertex circles */}
      {points.map((p, i) => (
        <CircleMarker
          key={i}
          center={p}
          radius={i === 0 && points.length >= 3 ? 7 : 4}
          pathOptions={{
            color: i === 0 ? "#0D9488" : "white",
            fillColor: i === 0 ? "#0D9488" : "white",
            fillOpacity: 1,
            weight: i === 0 && points.length >= 3 ? 2 : 1,
          }}
        />
      ))}
    </>
  );
}

/* ── Area Label (floating near cursor) ────────────────────── */

function AreaLabel({ points, mousePos }: { points: [number, number][]; mousePos: [number, number] | null }) {
  const map = useMap();
  const labelRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!labelRef.current) {
      const div = L.DomUtil.create("div");
      div.style.cssText =
        "position:absolute;z-index:1000;pointer-events:none;background:rgba(15,23,42,0.9);color:#0D9488;font-size:12px;font-weight:600;padding:3px 8px;border-radius:4px;border:1px solid rgba(13,148,136,0.3);font-family:Inter,sans-serif;display:none;";
      map.getContainer().appendChild(div);
      labelRef.current = div;
    }
    return () => {
      if (labelRef.current) {
        labelRef.current.remove();
        labelRef.current = null;
      }
    };
  }, [map]);

  useEffect(() => {
    if (!labelRef.current) return;
    const allPts = mousePos ? [...points, mousePos] : points;
    if (allPts.length < 3 || !mousePos) {
      labelRef.current.style.display = "none";
      return;
    }
    const area = calcAreaM2(allPts);
    const px = map.latLngToContainerPoint(L.latLng(mousePos[0], mousePos[1]));
    labelRef.current.style.display = "block";
    labelRef.current.style.left = `${px.x + 18}px`;
    labelRef.current.style.top = `${px.y - 12}px`;
    labelRef.current.textContent = `${Math.round(area).toLocaleString("de-DE")} m²`;
  }, [points, mousePos, map]);

  return null;
}

/* ── Baufeld Config Modal ─────────────────────────────────── */

function BaufeldConfigModal({
  areaM2,
  baufeldCount,
  onConfirm,
  onCancel,
}: {
  areaM2: number;
  baufeldCount: number;
  onConfirm: (cfg: {
    name: string;
    type: "WA" | "MI" | "GE" | "SO";
    maxGRZ: number;
    maxGFZ: number;
    maxGeschosse: number;
    nutzung: string;
  }) => void;
  onCancel: () => void;
}) {
  const [name, setName] = useState(`Baufeld ${baufeldCount + 1}`);
  const [type, setType] = useState<"WA" | "MI" | "GE" | "SO">("WA");
  const [maxGRZ, setMaxGRZ] = useState(0.4);
  const [maxGFZ, setMaxGFZ] = useState(1.2);
  const [maxGeschosse, setMaxGeschosse] = useState(4);
  const [nutzung, setNutzung] = useState("Wohnen");

  const labelStyle = "text-xs text-gray-400 mb-1";
  const inputStyle =
    "w-full bg-[#0F172A] border border-white/10 rounded px-3 py-2 text-sm text-white outline-none focus:border-teal-500 transition-colors";

  return (
    <div
      className="fixed inset-0 z-[2000] flex items-center justify-center"
      style={{ background: "rgba(0,0,0,0.6)", backdropFilter: "blur(4px)" }}
    >
      <div
        className="bg-[#1E293B] border border-white/10 rounded-xl p-6 w-[420px] max-w-[95vw] shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <h3 className="text-lg font-bold mb-4 text-white flex items-center gap-2">
          <span className="text-2xl">🏗️</span> Baufeld konfigurieren
        </h3>

        <div className="space-y-3">
          <div>
            <div className={labelStyle}>Name</div>
            <input className={inputStyle} value={name} onChange={(e) => setName(e.target.value)} />
          </div>

          <div>
            <div className={labelStyle}>Gebietstyp</div>
            <select className={inputStyle} value={type} onChange={(e) => setType(e.target.value as any)}>
              <option value="WA">WA — Allg. Wohngebiet</option>
              <option value="MI">MI — Mischgebiet</option>
              <option value="GE">GE — Gewerbegebiet</option>
              <option value="SO">SO — Sondergebiet</option>
            </select>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <div className={labelStyle}>GRZ max</div>
              <input
                type="number"
                className={inputStyle}
                value={maxGRZ}
                min={0.1}
                max={1}
                step={0.1}
                onChange={(e) => setMaxGRZ(parseFloat(e.target.value) || 0)}
              />
            </div>
            <div>
              <div className={labelStyle}>GFZ max</div>
              <input
                type="number"
                className={inputStyle}
                value={maxGFZ}
                min={0.1}
                max={10}
                step={0.1}
                onChange={(e) => setMaxGFZ(parseFloat(e.target.value) || 0)}
              />
            </div>
            <div>
              <div className={labelStyle}>Max. Geschosse</div>
              <input
                type="number"
                className={inputStyle}
                value={maxGeschosse}
                min={1}
                max={30}
                step={1}
                onChange={(e) => setMaxGeschosse(parseInt(e.target.value) || 1)}
              />
            </div>
          </div>

          <div>
            <div className={labelStyle}>Nutzung</div>
            <input className={inputStyle} value={nutzung} onChange={(e) => setNutzung(e.target.value)} />
          </div>

          <div className="bg-[#0F172A] rounded-lg p-3 border border-white/5">
            <div className="text-xs text-gray-400 mb-1">Grundstücksfläche (berechnet)</div>
            <div className="text-xl font-bold text-teal-400">
              {Math.round(areaM2).toLocaleString("de-DE")} m²
            </div>
          </div>
        </div>

        <div className="flex gap-3 mt-5">
          <button
            onClick={onCancel}
            className="flex-1 px-4 py-2.5 rounded-lg border border-white/10 text-gray-300 hover:bg-white/5 transition-colors text-sm font-medium"
          >
            Abbrechen
          </button>
          <button
            onClick={() => onConfirm({ name, type, maxGRZ, maxGFZ, maxGeschosse, nutzung })}
            className="flex-1 px-4 py-2.5 rounded-lg bg-teal-600 hover:bg-teal-500 text-white transition-colors text-sm font-bold"
          >
            ✓ Bestätigen
          </button>
        </div>
      </div>
    </div>
  );
}

/* ── Baufeld Polygon ──────────────────────────────────────── */

function BaufeldPolygon({
  bf,
  isSelected,
  isPlaceMode,
  unitCount,
  onClick,
  onDelete,
}: {
  bf: Baufeld;
  isSelected: boolean;
  isPlaceMode: boolean;
  unitCount: number;
  onClick: () => void;
  onDelete: () => void;
}) {
  const [borisData, setBorisData] = useState<{ brw: number; nutzung: string } | null>(null);
  const [borisLoading, setBorisLoading] = useState(false);
  const fetchedRef = useRef(false);

  // Fetch BORIS Bodenrichtwert for Baufeld centroid
  useEffect(() => {
    if (fetchedRef.current || bf.coordinates.length === 0) return;
    fetchedRef.current = true;
    setBorisLoading(true);

    const centroidLat = bf.coordinates.reduce((s, c) => s + c[0], 0) / bf.coordinates.length;
    const centroidLng = bf.coordinates.reduce((s, c) => s + c[1], 0) / bf.coordinates.length;
    const delta = 0.0005;
    const wmsBbox = `${centroidLng - delta},${centroidLat - delta},${centroidLng + delta},${centroidLat + delta}`;
    const params = new URLSearchParams({
      SERVICE: "WMS", VERSION: "1.1.1", REQUEST: "GetFeatureInfo",
      LAYERS: "brw2025", QUERY_LAYERS: "brw2025",
      INFO_FORMAT: "text/html", STYLES: "",
      WIDTH: "256", HEIGHT: "256", SRS: "EPSG:4326",
      BBOX: wmsBbox, X: "128", Y: "128",
    });

    fetch(`https://gdi.berlin.de/services/wms/brw2025?${params}`)
      .then(r => r.ok ? r.text() : null)
      .then(html => {
        if (!html) return;
        const parser = new DOMParser();
        const doc = parser.parseFromString(html, "text/html");
        const headers = Array.from(doc.querySelectorAll("th")).map(th => th.textContent?.trim() || "");
        const cells = Array.from(doc.querySelectorAll("td")).map(td => td.textContent?.trim() || "");
        const props: Record<string, string> = {};
        headers.forEach((h, i) => { if (h && cells[i]) props[h] = cells[i]; });
        const brwStr = props["Bodenrichtwert (in EURO/m²)"] || "";
        const brw = parseFloat(brwStr);
        if (!isNaN(brw)) {
          setBorisData({ brw, nutzung: props["Art der Nutzung"] || "" });
        }
      })
      .catch(() => {})
      .finally(() => setBorisLoading(false));
  }, [bf.coordinates]);

  const grundstueckspreis = borisData ? borisData.brw * bf.grundstuecksflaecheM2 : null;

  return (
    <Polygon
      positions={bf.coordinates}
      pathOptions={{
        color: isSelected ? "#0D9488" : bf.color,
        fillColor: bf.fillColor,
        fillOpacity: isSelected ? 0.5 : 0.3,
        weight: isSelected ? 3 : 2,
        dashArray: isPlaceMode ? "8 4" : undefined,
      }}
      eventHandlers={{ click: onClick }}
    >
      <Popup>
        <div className="text-sm min-w-[220px]">
          <div className="font-bold text-base mb-2" style={{ color: bf.color }}>
            {bf.name} — {bf.type}
          </div>
          <div className="text-gray-500 text-xs mb-2">{bf.typeLabel}</div>
          <table className="w-full text-xs">
            <tbody>
              <tr className="border-b"><td className="py-1 text-gray-500">GRZ max</td><td className="py-1 font-medium text-right">{bf.maxGRZ}</td></tr>
              <tr className="border-b"><td className="py-1 text-gray-500">GFZ max</td><td className="py-1 font-medium text-right">{bf.maxGFZ}</td></tr>
              <tr className="border-b"><td className="py-1 text-gray-500">Max. Geschosse</td><td className="py-1 font-medium text-right">{bf.maxGeschosse}</td></tr>
              <tr className="border-b"><td className="py-1 text-gray-500">Grundstück</td><td className="py-1 font-medium text-right">{bf.grundstuecksflaecheM2.toLocaleString("de-DE")} m²</td></tr>
              <tr className="border-b"><td className="py-1 text-gray-500">Nutzung</td><td className="py-1 font-medium text-right">{bf.nutzung}</td></tr>
            </tbody>
          </table>
          {/* BORIS Grundstückspreis */}
          {borisLoading && (
            <div className="mt-2 pt-2 border-t text-xs text-gray-400">💰 Bodenrichtwert wird geladen…</div>
          )}
          {borisData && grundstueckspreis != null && (
            <div className="mt-2 pt-2 border-t">
              <div className="text-xs font-semibold text-amber-400 mb-1">💰 Grundstückswert (BORIS 2025)</div>
              <table className="w-full text-xs">
                <tbody>
                  <tr className="border-b"><td className="py-1 text-gray-500">Bodenrichtwert</td><td className="py-1 font-medium text-right">{borisData.brw.toLocaleString("de-DE")} €/m²</td></tr>
                  <tr className="border-b"><td className="py-1 text-gray-500">Grundstück</td><td className="py-1 font-medium text-right">{bf.grundstuecksflaecheM2.toLocaleString("de-DE")} m²</td></tr>
                  <tr><td className="py-1 text-gray-500 font-semibold">Geschätzter Preis</td><td className="py-1 font-bold text-right text-amber-400">{grundstueckspreis.toLocaleString("de-DE", { maximumFractionDigits: 0 })} €</td></tr>
                </tbody>
              </table>
              {borisData.nutzung && <div className="text-xs text-gray-400 mt-1">{borisData.nutzung}</div>}
            </div>
          )}
          {unitCount > 0 && (
            <div className="mt-2 pt-2 border-t text-xs text-teal-600 font-medium">{unitCount} WE platziert</div>
          )}
          <button
            onClick={(e) => { e.stopPropagation(); onDelete(); }}
            className="mt-2 w-full text-xs text-red-400 hover:text-red-300 hover:bg-red-900/20 rounded py-1 transition-colors"
          >
            🗑️ Baufeld löschen
          </button>
        </div>
      </Popup>
    </Polygon>
  );
}

/* ── (PlacedUnitMarkers removed — now in PlacedBuildings.tsx) ── */

/* ── Draw Controls Toolbar ────────────────────────────────── */

function DrawToolbar({
  drawing,
  pointCount,
  onToggle,
  onUndo,
  onCancel,
}: {
  drawing: boolean;
  pointCount: number;
  onToggle: () => void;
  onUndo: () => void;
  onCancel: () => void;
}) {
  const btnBase = "px-3 py-1.5 rounded-md text-xs font-semibold border-none cursor-pointer transition-all";

  if (!drawing) return null;
  return (
    <div
      className="leaflet-top leaflet-left"
      style={{ top: 10, left: 310, position: "absolute", zIndex: 1000, display: "flex", gap: 4 }}
    >
      {pointCount > 0 && (
        <button onClick={onUndo} className={btnBase} style={{ background: "rgba(15,23,42,0.9)", color: "#94a3b8" }}>
          ↩ Undo
        </button>
      )}
      <button onClick={onCancel} className={btnBase} style={{ background: "rgba(15,23,42,0.9)", color: "#EF4444" }}>
        ✕ Abbrechen
      </button>
    </div>
  );
}

/* ── Main MapPanel ────────────────────────────────────────── */

interface Props {
  baufelder: Baufeld[];
  selectedBaufeld: string | null;
  selectedFloorplan: string | null;
  placedUnits: PlacedUnit[];
  onBaufeldClick: (id: string) => void;
  onAddBaufeld: (bf: Baufeld) => void;
  onDeleteBaufeld: (id: string) => void;
  activeBaufeld: Baufeld | null;
  onMoveUnit?: (id: string, position: [number, number]) => void;
  onRotateUnit?: (id: string, rotation: number) => void;
  onViewUnit?: (id: string) => void;
  onPlaceOnMap?: (position: [number, number], rotation: number) => void;
  onCancelPlace?: () => void;
}

export default function MapPanel({
  baufelder,
  selectedBaufeld,
  selectedFloorplan,
  placedUnits,
  onBaufeldClick,
  onAddBaufeld,
  onDeleteBaufeld,
  activeBaufeld,
  drawing: drawingProp,
  onDrawingChange,
  onMoveUnit,
  onRotateUnit,
  onViewUnit,
  onPlaceOnMap,
  onCancelPlace,
}: Props & { drawing?: boolean; onDrawingChange?: (d: boolean) => void }) {
  const center: [number, number] = [52.52, 13.405];

  const [drawingInternal, setDrawingInternal] = useState(false);
  const drawing = drawingProp ?? drawingInternal;
  const setDrawing = onDrawingChange ?? setDrawingInternal;
  const [drawPoints, setDrawPoints] = useState<[number, number][]>([]);
  const [mousePos, setMousePos] = useState<[number, number] | null>(null);
  const [pendingCoords, setPendingCoords] = useState<[number, number][] | null>(null);

  const handleToggleDraw = useCallback(() => {
    setDrawing(!drawing);
    setDrawPoints([]);
    setMousePos(null);
  }, [drawing, setDrawing]);

  const handleCancelDraw = useCallback(() => {
    setDrawing(false);
    setDrawPoints([]);
    setMousePos(null);
  }, []);

  const handleUndo = useCallback(() => {
    setDrawPoints((prev) => prev.slice(0, -1));
  }, []);

  const handleDrawComplete = useCallback((coords: [number, number][]) => {
    setDrawing(false);
    setDrawPoints([]);
    setMousePos(null);
    setPendingCoords(coords);
  }, []);

  const handleConfirmBaufeld = useCallback(
    (cfg: { name: string; type: "WA" | "MI" | "GE" | "SO"; maxGRZ: number; maxGFZ: number; maxGeschosse: number; nutzung: string }) => {
      if (!pendingCoords) return;
      const tc = BAUFELD_TYPE_CONFIG[cfg.type];
      const bf: Baufeld = {
        id: `bf_${Date.now()}`,
        name: cfg.name,
        type: cfg.type,
        typeLabel: tc.label,
        color: tc.color,
        fillColor: tc.fillColor,
        coordinates: pendingCoords,
        maxGRZ: cfg.maxGRZ,
        maxGFZ: cfg.maxGFZ,
        maxGeschosse: cfg.maxGeschosse,
        nutzung: cfg.nutzung,
        grundstuecksflaecheM2: Math.round(calcAreaM2(pendingCoords)),
      };
      onAddBaufeld(bf);
      setPendingCoords(null);
    },
    [pendingCoords, onAddBaufeld]
  );

  const handleCancelBaufeld = useCallback(() => {
    setPendingCoords(null);
  }, []);

  return (
    <>
      <MapContainer center={center} zoom={16} className="w-full h-full" zoomControl={true} style={{ background: "#1a1a2e" }}>
        <MapInstanceExporter />
        <LayersControl position="topright">
          <LayersControl.BaseLayer checked name="Dark (Standard)">
            <TileLayer
              url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a>'
            />
          </LayersControl.BaseLayer>
          <LayersControl.BaseLayer name="Luftbild 2024 (TrueOrtho)">
            <WMSTileLayer
              url="https://gdi.berlin.de/services/wms/truedop_2024"
              layers="truedop_2024"
              styles=""
              format="image/png"
              transparent={false}
              version="1.1.1"
              attribution="© Berlin GDI – TrueOrthophoto 2024"
            />
          </LayersControl.BaseLayer>
          <LayersControl.Overlay checked name="Flurstücke (ALKIS)">
            <WMSTileLayer
              url="https://gdi.berlin.de/services/wms/alkis_flurstuecke"
              layers="flurstuecke"
              styles=""
              format="image/png"
              transparent={true}
              opacity={0.7}
              version="1.1.1"
              attribution="© Berlin GDI"
            />
          </LayersControl.Overlay>
          <LayersControl.Overlay checked name="Bebauungspläne">
            <WMSTileLayer
              url="https://gdi.berlin.de/services/wms/bplan"
              layers="b_bp_fs"
              styles=""
              format="image/png"
              transparent={true}
              opacity={0.6}
              version="1.1.1"
              attribution="© Berlin GDI"
            />
          </LayersControl.Overlay>
          <LayersControl.Overlay name="Wohnlagenkarte (Mietspiegel 2024)">
            <WMSTileLayer
              url="https://gdi.berlin.de/services/wms/wohnlagenadr2024"
              layers="wohnlagenadr2024"
              styles=""
              format="image/png"
              transparent={true}
              opacity={0.5}
              version="1.1.1"
              attribution="© Berlin GDI – Mietspiegel 2024"
            />
          </LayersControl.Overlay>
          <LayersControl.Overlay name="Bodenrichtwerte 2025 (BORIS)">
            <WMSTileLayer
              url="https://gdi.berlin.de/services/wms/brw2025"
              layers="brw2025"
              styles=""
              format="image/png"
              transparent={true}
              opacity={0.5}
              version="1.1.1"
              attribution="© Berlin GDI – BORIS 2025"
            />
          </LayersControl.Overlay>
        </LayersControl>

        <ScaleControl position="bottomleft" imperial={false} />
        <AddressSearch />
        <ClickFeatureInfo enabled={!drawing} />

        {/* Draw controls */}
        <DrawToolbar
          drawing={drawing}
          pointCount={drawPoints.length}
          onToggle={handleToggleDraw}
          onUndo={handleUndo}
          onCancel={handleCancelDraw}
        />

        {/* Draw handler */}
        <DrawHandler
          drawing={drawing}
          points={drawPoints}
          setPoints={setDrawPoints}
          onComplete={handleDrawComplete}
          mousePos={mousePos}
          setMousePos={setMousePos}
        />

        {/* Drawing preview */}
        {drawing && <DrawPreview points={drawPoints} mousePos={mousePos} />}
        {drawing && <AreaLabel points={drawPoints} mousePos={mousePos} />}

        {/* Baufelder */}
        {baufelder.map((bf) => {
          const unitCount = placedUnits.filter((u) => u.baufeldId === bf.id).length;
          return (
            <BaufeldPolygon
              key={bf.id}
              bf={bf}
              isSelected={selectedBaufeld === bf.id}
              isPlaceMode={!!selectedFloorplan}
              unitCount={unitCount}
              onClick={() => !drawing && onBaufeldClick(bf.id)}
              onDelete={() => onDeleteBaufeld(bf.id)}
            />
          );
        })}
        {onMoveUnit && onRotateUnit && (
          <PlacedBuildings
            placedUnits={placedUnits}
            onMoveUnit={onMoveUnit}
            onRotateUnit={onRotateUnit}
            onViewUnit={onViewUnit}
          />
        )}
        {selectedFloorplan && onPlaceOnMap && onCancelPlace && (
          <GhostPolygon
            buildingId={selectedFloorplan}
            onPlace={onPlaceOnMap}
            onCancel={onCancelPlace}
          />
        )}
      </MapContainer>

      {/* Config modal */}
      {pendingCoords && (
        <BaufeldConfigModal
          areaM2={calcAreaM2(pendingCoords)}
          baufeldCount={baufelder.length}
          onConfirm={handleConfirmBaufeld}
          onCancel={handleCancelBaufeld}
        />
      )}
    </>
  );
}
