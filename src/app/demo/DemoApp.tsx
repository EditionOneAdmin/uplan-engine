"use client";

import { useState, useCallback, useMemo } from "react";
import dynamic from "next/dynamic";
import { BuildingCatalog } from "./BuildingCatalog";
import { BuildingSteckbrief } from "./BuildingSteckbrief";
import { FilterPanel } from "./FilterPanel";
import { BottomBar } from "./BottomBar";
import { DemoHeader } from "./DemoHeader";
import { CostCalculator } from "./CostCalculator";
import { ExportModal } from "./ExportModal";
import type { ExportConfig } from "./ExportModal";
import type { Baufeld, PlacedUnit, Filters, Manufacturer, BuildingShape, RoofType, FacadeType } from "./types";
import { BUILDINGS } from "./data";
import { calculateMatch } from "./matchScore";
import { exportProjectPlan } from "./exportPDF";
import type { CostData } from "./exportPDF";

const MapPanel = dynamic(() => import("./MapPanel"), { ssr: false });

export default function DemoApp() {
  const [drawing, setDrawing] = useState(false);
  const [baufelder, setBaufelder] = useState<Baufeld[]>([]);
  const [selectedBaufeld, setSelectedBaufeld] = useState<string | null>(null);
  const [selectedBuilding, setSelectedBuilding] = useState<string | null>(null);
  const [placedUnits, setPlacedUnits] = useState<PlacedUnit[]>([]);

  // Configurator state
  const [configGeschosse, setConfigGeschosse] = useState(5);
  const [configRoof, setConfigRoof] = useState<RoofType>("flat");
  const [configFacade, setConfigFacade] = useState<FacadeType>("putz");

  // When selecting a building, reset configurator to its defaults
  const handleSelectBuilding = useCallback((id: string | null) => {
    setSelectedBuilding(id);
    if (id) {
      const b = BUILDINGS.find((bb) => bb.id === id);
      if (b) {
        setConfigGeschosse(b.defaultGeschosse);
        setConfigRoof(b.roofOptions[0]);
        setConfigFacade(b.facadeOptions[0]);
      }
    }
  }, []);

  // Place mode: user clicks "Auf Baufeld platzieren" then clicks a baufeld
  const [placeMode, setPlaceMode] = useState(false);
  // Steckbrief modal for placed units
  const [steckbriefUnit, setSteckbriefUnit] = useState<string | null>(null);
  // Tab state for right panel
  const [activeTab, setActiveTab] = useState<"katalog" | "wirtschaftlichkeit">("katalog");
  // Export modal
  const [showExportModal, setShowExportModal] = useState(false);
  const [exporting, setExporting] = useState(false);
  // Cost data from CostCalculator
  const [costData, setCostData] = useState<CostData | undefined>(undefined);

  const handlePlace = useCallback(() => {
    setPlaceMode(true);
  }, []);

  const handleMoveUnit = useCallback((unitId: string, position: [number, number]) => {
    setPlacedUnits(prev => prev.map(u => u.id === unitId ? { ...u, position } : u));
  }, []);

  const handleRotateUnit = useCallback((unitId: string, rotation: number) => {
    setPlacedUnits(prev => prev.map(u => u.id === unitId ? { ...u, rotation } : u));
  }, []);

  const handlePlaceOnMap = useCallback((position: [number, number], rotation: number) => {
    if (!selectedBuilding) return;
    const building = BUILDINGS.find((b) => b.id === selectedBuilding);
    if (!building) return;

    // Find which baufeld contains this position (or use first/selected)
    const baufeldId = selectedBaufeld || baufelder[0]?.id || "none";
    const bgf = building.bgfPerGeschoss * configGeschosse;
    const we = building.wePerGeschoss * configGeschosse;

    setPlacedUnits((prev) => [
      ...prev,
      {
        id: `${Date.now()}`,
        baufeldId,
        buildingId: selectedBuilding,
        geschosse: configGeschosse,
        roofType: configRoof,
        facade: configFacade,
        area: bgf,
        units: we,
        position,
        rotation,
      },
    ]);
    setPlaceMode(false);
    setSelectedBuilding(null);
  }, [selectedBuilding, selectedBaufeld, baufelder, configGeschosse, configRoof, configFacade]);

  const handleCancelPlace = useCallback(() => {
    setPlaceMode(false);
    setSelectedBuilding(null);
  }, []);

  const [filters, setFilters] = useState<Filters>({
    manufacturer: "all",
    shape: "all",
    minGeschosse: 1,
    maxGeschosse: 8,
    strategy: "hold",
    energy: "fernwaerme",
    efficiency: "geg",
    targetMode: "off",
    targetValue: 0,
  });

  const handleBaufeldClick = useCallback(
    (baufeldId: string) => {
      if (placeMode && selectedBuilding) {
        const bf = baufelder.find((b) => b.id === baufeldId);
        const building = BUILDINGS.find((b) => b.id === selectedBuilding);
        if (!bf || !building) return;

        const bgf = building.bgfPerGeschoss * configGeschosse;
        const we = building.wePerGeschoss * configGeschosse;

        const centerLat = bf.coordinates.reduce((s, c) => s + c[0], 0) / bf.coordinates.length;
        const centerLng = bf.coordinates.reduce((s, c) => s + c[1], 0) / bf.coordinates.length;

        setPlacedUnits((prev) => [
          ...prev,
          {
            id: `${Date.now()}`,
            baufeldId,
            buildingId: selectedBuilding,
            geschosse: configGeschosse,
            roofType: configRoof,
            facade: configFacade,
            area: bgf,
            units: we,
            position: [centerLat, centerLng],
            rotation: 0,
          },
        ]);
        setPlaceMode(false);
        setSelectedBuilding(null);
      } else {
        setSelectedBaufeld((prev) => (prev === baufeldId ? null : baufeldId));
      }
    },
    [placeMode, selectedBuilding, baufelder, configGeschosse, configRoof, configFacade]
  );

  const handleRemoveUnit = useCallback((unitId: string) => {
    setPlacedUnits((prev) => prev.filter((u) => u.id !== unitId));
  }, []);

  const handleAddBaufeld = useCallback((bf: Baufeld) => {
    setBaufelder((prev) => [...prev, bf]);
    // Fetch BORIS + Wohnlage for the new baufeld
    if (bf.coordinates.length > 0) {
      const centroidLat = bf.coordinates.reduce((s, c) => s + c[0], 0) / bf.coordinates.length;
      const centroidLng = bf.coordinates.reduce((s, c) => s + c[1], 0) / bf.coordinates.length;
      const delta = 0.0005;
      const wmsBbox = `${centroidLng - delta},${centroidLat - delta},${centroidLng + delta},${centroidLat + delta}`;
      // BORIS fetch
      const borisParams = new URLSearchParams({
        SERVICE: "WMS", VERSION: "1.1.1", REQUEST: "GetFeatureInfo",
        LAYERS: "brw2025", QUERY_LAYERS: "brw2025",
        INFO_FORMAT: "text/html", STYLES: "",
        WIDTH: "256", HEIGHT: "256", SRS: "EPSG:4326",
        BBOX: wmsBbox, X: "128", Y: "128",
      });
      fetch(`https://gdi.berlin.de/services/wms/brw2025?${borisParams}`)
        .then(r => r.ok ? r.text() : null)
        .then(html => {
          if (!html) return;
          const parser = new DOMParser();
          const doc = parser.parseFromString(html, "text/html");
          const headers = Array.from(doc.querySelectorAll("th")).map(th => th.textContent?.trim() || "");
          const cells = Array.from(doc.querySelectorAll("td")).map(td => td.textContent?.trim() || "");
          const props: Record<string, string> = {};
          headers.forEach((h, i) => { if (h && cells[i]) props[h] = cells[i]; });
          const brw = parseFloat(props["Bodenrichtwert (in EURO/m²)"] || "");
          if (!isNaN(brw)) {
            setBaufelder(prev => prev.map(b => b.id === bf.id ? { ...b, borisBodenrichtwert: brw } : b));
          }
        })
        .catch(() => {});
      // Wohnlage fetch
      const wlParams = new URLSearchParams({
        SERVICE: "WMS", VERSION: "1.1.1", REQUEST: "GetFeatureInfo",
        LAYERS: "wohnlagenadr2024", QUERY_LAYERS: "wohnlagenadr2024",
        INFO_FORMAT: "text/html", STYLES: "",
        WIDTH: "256", HEIGHT: "256", SRS: "EPSG:4326",
        BBOX: wmsBbox, X: "128", Y: "128",
      });
      fetch(`https://gdi.berlin.de/services/wms/wohnlagenadr2024?${wlParams}`)
        .then(r => r.ok ? r.text() : null)
        .then(html => {
          if (!html) return;
          const parser = new DOMParser();
          const doc = parser.parseFromString(html, "text/html");
          const headers = Array.from(doc.querySelectorAll("th")).map(th => th.textContent?.trim() || "");
          const cells = Array.from(doc.querySelectorAll("td")).map(td => td.textContent?.trim() || "");
          const props: Record<string, string> = {};
          headers.forEach((h, i) => { if (h && cells[i]) props[h] = cells[i]; });
          const wohnlage = props["Wohnlage"] || "";
          if (wohnlage) {
            setBaufelder(prev => prev.map(b => b.id === bf.id ? { ...b, wohnlage: wohnlage.toLowerCase().trim() } : b));
          }
        })
        .catch(() => {});
    }
  }, []);

  const handleDeleteBaufeld = useCallback((bfId: string) => {
    setBaufelder((prev) => prev.filter((b) => b.id !== bfId));
    setPlacedUnits((prev) => prev.filter((u) => u.baufeldId !== bfId));
    setSelectedBaufeld((prev) => (prev === bfId ? null : prev));
  }, []);

  const activeBaufeld = baufelder.find((b) => b.id === selectedBaufeld) || null;

  const metrics = useMemo(() => {
    const totalBGF = placedUnits.reduce((s, u) => s + u.area, 0);
    const totalUnits = placedUnits.reduce((s, u) => s + u.units, 0);
    const parkingNeeded = Math.ceil(totalUnits * 0.8);

    const bfForMetrics = activeBaufeld || baufelder[0];
    if (!bfForMetrics) {
      return { totalBGF, totalUnits, parkingNeeded, grzUsage: 0, gfzUsage: 0, compliant: true };
    }

    const maxGrundfläche = bfForMetrics.maxGRZ * bfForMetrics.grundstuecksflaecheM2;
    const maxGeschossflaeche = bfForMetrics.maxGFZ * bfForMetrics.grundstuecksflaecheM2;

    const bfUnits = activeBaufeld
      ? placedUnits.filter((u) => u.baufeldId === activeBaufeld.id)
      : placedUnits;
    const bfBGF = bfUnits.reduce((s, u) => s + u.area, 0);

    // GRZ: use footprint (GF) of placed buildings
    const bfGF = bfUnits.reduce((s, u) => {
      const b = BUILDINGS.find((bb) => bb.id === u.buildingId);
      return s + (b ? b.footprint.width * b.footprint.depth : 0);
    }, 0);

    const grzUsage = maxGrundfläche > 0 ? bfGF / maxGrundfläche : 0;
    const gfzUsage = maxGeschossflaeche > 0 ? bfBGF / maxGeschossflaeche : 0;
    const compliant = grzUsage <= 1 && gfzUsage <= 1;

    return { totalBGF, totalUnits, parkingNeeded, grzUsage, gfzUsage, compliant };
  }, [placedUnits, activeBaufeld, baufelder]);

  const handleOpenExport = useCallback(() => {
    setShowExportModal(true);
  }, []);

  const handleExport = useCallback(async (exportConfig: ExportConfig) => {
    setExporting(true);
    try {
      await exportProjectPlan({
        baufelder,
        placedUnits,
        buildings: BUILDINGS,
        filters,
        metrics,
        config: exportConfig,
        costData,
      });
    } finally {
      setExporting(false);
      setShowExportModal(false);
    }
  }, [baufelder, placedUnits, filters, metrics, costData]);

  return (
    <div className="h-screen flex flex-col bg-[#0F172A] text-white overflow-hidden">
      <DemoHeader />
      <div className="flex-1 flex flex-col lg:flex-row min-h-0">
        <div className="flex-1 lg:w-[60%] min-h-[300px] lg:min-h-0 relative">
          <MapPanel
            baufelder={baufelder}
            selectedBaufeld={selectedBaufeld}
            selectedFloorplan={placeMode ? selectedBuilding : null}
            placedUnits={placedUnits}
            onBaufeldClick={handleBaufeldClick}
            onAddBaufeld={handleAddBaufeld}
            onDeleteBaufeld={handleDeleteBaufeld}
            activeBaufeld={activeBaufeld}
            drawing={drawing}
            onDrawingChange={setDrawing}
            onMoveUnit={handleMoveUnit}
            onRotateUnit={handleRotateUnit}
            onViewUnit={setSteckbriefUnit}
            onPlaceOnMap={handlePlaceOnMap}
            onCancelPlace={handleCancelPlace}
          />
          {placeMode && (
            <div className="absolute top-3 left-1/2 -translate-x-1/2 z-[1000] bg-[#0D9488] text-white px-4 py-2 rounded-lg text-xs font-bold shadow-lg shadow-[#0D9488]/30 animate-pulse">
              Klicke auf die Karte um das Gebäude zu platzieren · R = Drehen · ESC = Abbrechen
            </div>
          )}
        </div>
        <div className="lg:w-[40%] flex flex-col min-h-0 border-l border-white/10">
          {/* Tab bar */}
          <div className="flex border-b border-white/10 bg-[#1E293B] shrink-0">
            {([["katalog", "🏗️ Katalog"], ["wirtschaftlichkeit", "📊 Wirtschaftlichkeit"]] as const).map(([key, label]) => (
              <button
                key={key}
                onClick={() => setActiveTab(key)}
                className={`flex-1 text-xs font-semibold py-2.5 transition-colors ${
                  activeTab === key
                    ? "text-teal-400 border-b-2 border-teal-400"
                    : "text-white/40 hover:text-white/60"
                }`}
              >
                {label}
              </button>
            ))}
          </div>
          <div className="flex-1 min-h-0 overflow-y-auto bg-[#1E293B] p-4">
            {activeTab === "wirtschaftlichkeit" ? (
              <CostCalculator
                baufelder={baufelder}
                placedUnits={placedUnits}
                buildings={BUILDINGS}
                filters={filters}
                onCalcUpdate={setCostData}
                matchScore={
                  selectedBuilding && activeBaufeld
                    ? calculateMatch(
                        BUILDINGS.find((b) => b.id === selectedBuilding)!,
                        activeBaufeld,
                        filters,
                        configGeschosse
                      ).score
                    : undefined
                }
              />
            ) : (
            <BuildingCatalog
              buildings={BUILDINGS}
              selectedId={selectedBuilding}
              onSelect={handleSelectBuilding}
              placedUnits={placedUnits}
              onRemoveUnit={handleRemoveUnit}
              onViewUnit={setSteckbriefUnit}
              manufacturerFilter={filters.manufacturer}
              onManufacturerFilter={(m) => setFilters((f) => ({ ...f, manufacturer: m }))}
              shapeFilter={filters.shape}
              onShapeFilter={(s) => setFilters((f) => ({ ...f, shape: s }))}
              geschosse={configGeschosse}
              setGeschosse={setConfigGeschosse}
              roofType={configRoof}
              setRoofType={setConfigRoof}
              facade={configFacade}
              setFacade={setConfigFacade}
              onPlace={handlePlace}
              activeBaufeld={activeBaufeld}
              filters={filters}
            />
            )}
          </div>
          {activeTab === "katalog" && (
          <div className="bg-[#1E293B] border-t border-white/10 p-4">
            <FilterPanel filters={filters} onChange={setFilters} />
          </div>
          )}
        </div>
      </div>
      <BottomBar
        metrics={metrics}
        drawing={drawing}
        onToggleDraw={() => setDrawing((d) => !d)}
        onExport={handleOpenExport}
        matchScore={
          selectedBuilding && activeBaufeld
            ? calculateMatch(
                BUILDINGS.find((b) => b.id === selectedBuilding)!,
                activeBaufeld,
                filters,
                configGeschosse
              ).score
            : undefined
        }
      />
      <ExportModal
        open={showExportModal}
        onClose={() => setShowExportModal(false)}
        onExport={handleExport}
        exporting={exporting}
      />
      {steckbriefUnit && (() => {
        const unit = placedUnits.find((u) => u.id === steckbriefUnit);
        const building = unit ? BUILDINGS.find((b) => b.id === unit.buildingId) : null;
        if (!unit || !building) return null;
        return (
          <BuildingSteckbrief
            building={building}
            geschosse={unit.geschosse}
            roofType={unit.roofType}
            facade={unit.facade}
            energy={filters.energy}
            efficiency={filters.efficiency}
            onClose={() => setSteckbriefUnit(null)}
          />
        );
      })()}
    </div>
  );
}
