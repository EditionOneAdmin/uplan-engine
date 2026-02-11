"use client";

import { useState, useCallback, useMemo } from "react";
import dynamic from "next/dynamic";
import { FloorplanCatalog } from "./FloorplanCatalog";
import { FilterPanel } from "./FilterPanel";
import { BottomBar } from "./BottomBar";
import { DemoHeader } from "./DemoHeader";
import type { Baufeld, PlacedUnit, Filters } from "./types";
import { FLOORPLANS } from "./data";

const MapPanel = dynamic(() => import("./MapPanel"), { ssr: false });

export default function DemoApp() {
  const [drawing, setDrawing] = useState(false);
  const [baufelder, setBaufelder] = useState<Baufeld[]>([]);
  const [selectedBaufeld, setSelectedBaufeld] = useState<string | null>(null);
  const [selectedFloorplan, setSelectedFloorplan] = useState<string | null>(null);
  const [placedUnits, setPlacedUnits] = useState<PlacedUnit[]>([]);
  const [filters, setFilters] = useState<Filters>({
    minArea: 35,
    maxArea: 140,
    strategy: "hold",
    roofType: "flat",
    energy: "fernwaerme",
    efficiency: "geg",
  });

  const handleBaufeldClick = useCallback(
    (baufeldId: string) => {
      if (selectedFloorplan) {
        const bf = baufelder.find((b) => b.id === baufeldId);
        const fp = FLOORPLANS.find((f) => f.id === selectedFloorplan);
        if (!bf || !fp) return;
        setPlacedUnits((prev) => [
          ...prev,
          {
            id: `${Date.now()}`,
            baufeldId,
            floorplanId: selectedFloorplan,
            area: fp.area,
            rooms: fp.rooms,
          },
        ]);
        setSelectedFloorplan(null);
      } else {
        setSelectedBaufeld((prev) => (prev === baufeldId ? null : baufeldId));
      }
    },
    [selectedFloorplan, baufelder]
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

  const filteredFloorplans = useMemo(
    () =>
      FLOORPLANS.map((fp) => ({
        ...fp,
        disabled: fp.area < filters.minArea || fp.area > filters.maxArea,
      })),
    [filters.minArea, filters.maxArea]
  );

  const metrics = useMemo(() => {
    const totalBGF = placedUnits.reduce((s, u) => s + u.area, 0);
    const totalUnits = placedUnits.length;
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

    const grzUsage = maxGrundfläche > 0 ? (bfBGF * 0.4) / maxGrundfläche : 0;
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
            selectedFloorplan={selectedFloorplan}
            placedUnits={placedUnits}
            onBaufeldClick={handleBaufeldClick}
            onAddBaufeld={handleAddBaufeld}
            onDeleteBaufeld={handleDeleteBaufeld}
            activeBaufeld={activeBaufeld}
            drawing={drawing}
            onDrawingChange={setDrawing}
          />
        </div>
        <div className="lg:w-[40%] flex flex-col min-h-0 border-l border-white/10">
          <div className="flex-1 min-h-0 overflow-y-auto bg-[#1E293B] p-4">
            <FloorplanCatalog
              floorplans={filteredFloorplans}
              selectedId={selectedFloorplan}
              onSelect={setSelectedFloorplan}
              placedUnits={placedUnits}
              onRemoveUnit={handleRemoveUnit}
            />
          </div>
          <div className="bg-[#1E293B] border-t border-white/10 p-4">
            <FilterPanel filters={filters} onChange={setFilters} />
          </div>
        </div>
      </div>
      <BottomBar metrics={metrics} drawing={drawing} onToggleDraw={() => setDrawing(d => !d)} />
    </div>
  );
}
