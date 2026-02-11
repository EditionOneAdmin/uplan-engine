"use client";

import { useState, useCallback, useMemo } from "react";
import dynamic from "next/dynamic";
import { BuildingCatalog } from "./BuildingCatalog";
import { FilterPanel } from "./FilterPanel";
import { BottomBar } from "./BottomBar";
import { DemoHeader } from "./DemoHeader";
import type { Baufeld, PlacedUnit, Filters, Manufacturer, BuildingShape, RoofType, FacadeType } from "./types";
import { BUILDINGS } from "./data";
import { calculateMatch } from "./matchScore";

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

  const handlePlace = useCallback(() => {
    setPlaceMode(true);
  }, []);

  const [filters, setFilters] = useState<Filters>({
    manufacturer: "all",
    shape: "all",
    minGeschosse: 1,
    maxGeschosse: 8,
    strategy: "hold",
    energy: "fernwaerme",
    efficiency: "geg",
  });

  const handleBaufeldClick = useCallback(
    (baufeldId: string) => {
      if (placeMode && selectedBuilding) {
        const bf = baufelder.find((b) => b.id === baufeldId);
        const building = BUILDINGS.find((b) => b.id === selectedBuilding);
        if (!bf || !building) return;

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
          />
          {placeMode && (
            <div className="absolute top-3 left-1/2 -translate-x-1/2 z-[1000] bg-[#0D9488] text-white px-4 py-2 rounded-lg text-xs font-bold shadow-lg shadow-[#0D9488]/30 animate-pulse">
              Klicke auf ein Baufeld um das Gebäude zu platzieren
            </div>
          )}
        </div>
        <div className="lg:w-[40%] flex flex-col min-h-0 border-l border-white/10">
          <div className="flex-1 min-h-0 overflow-y-auto bg-[#1E293B] p-4">
            <BuildingCatalog
              buildings={BUILDINGS}
              selectedId={selectedBuilding}
              onSelect={handleSelectBuilding}
              placedUnits={placedUnits}
              onRemoveUnit={handleRemoveUnit}
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
          </div>
          <div className="bg-[#1E293B] border-t border-white/10 p-4">
            <FilterPanel filters={filters} onChange={setFilters} />
          </div>
        </div>
      </div>
      <BottomBar
        metrics={metrics}
        drawing={drawing}
        onToggleDraw={() => setDrawing((d) => !d)}
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
    </div>
  );
}
