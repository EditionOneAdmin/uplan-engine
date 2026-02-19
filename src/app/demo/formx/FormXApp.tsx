"use client";

import React, { useState, useCallback, useMemo, useEffect } from 'react';
import { ArrowLeft, Building2, Download, ArrowRight } from 'lucide-react';
import FormXToolbar from './FormXToolbar';
import FormXCanvas from './FormXCanvas';
import FormXMetricsPanel from './FormXMetrics';
import FormXConfigPanel from './FormXConfigPanel';
import { calculateMetrics, getBoundingBox } from './geometry';
import { calculateKostX } from '../kostx/engine/kostx-engine';
import { KOSTX_DEFAULTS } from '../kostx/engine/kostx-defaults';
import type { FormXShape, FormXConfig, ToolType, Point } from './types';

const DEFAULT_CONFIG: FormXConfig = {
  geschosse: 5,
  raumhoehe: 2.6,
  weAnzahl: 'auto',
  nufEffizienz: 0.76,
  fensteranteil: 0.20,
  bauweise: 'Mauerwerk',
};

export default function FormXApp() {
  const [shapes, setShapes] = useState<FormXShape[]>([]);
  const [selectedShapeId, setSelectedShapeId] = useState<string | null>(null);
  const [activeTool, setActiveTool] = useState<ToolType>('rect');
  const [gridVisible, setGridVisible] = useState(true);
  const [snapEnabled, setSnapEnabled] = useState(true);
  const [zoom, setZoom] = useState(50);
  const [panOffset, setPanOffset] = useState<Point>({ x: 0, y: 0 });
  const [config, setConfig] = useState<FormXConfig>(DEFAULT_CONFIG);

  // History for undo/redo
  const [history, setHistory] = useState<FormXShape[][]>([[]]);
  const [historyIndex, setHistoryIndex] = useState(0);

  const pushHistory = useCallback((newShapes: FormXShape[]) => {
    setHistory(prev => {
      const truncated = prev.slice(0, historyIndex + 1);
      return [...truncated, newShapes];
    });
    setHistoryIndex(prev => prev + 1);
  }, [historyIndex]);

  const handleShapesChange = useCallback((newShapes: FormXShape[]) => {
    setShapes(newShapes);
    pushHistory(newShapes);
  }, [pushHistory]);

  const undo = useCallback(() => {
    if (historyIndex > 0) {
      const newIndex = historyIndex - 1;
      setHistoryIndex(newIndex);
      setShapes(history[newIndex]);
    }
  }, [historyIndex, history]);

  const redo = useCallback(() => {
    if (historyIndex < history.length - 1) {
      const newIndex = historyIndex + 1;
      setHistoryIndex(newIndex);
      setShapes(history[newIndex]);
    }
  }, [historyIndex, history]);

  // Metrics
  const metrics = useMemo(() => calculateMetrics(shapes, config), [shapes, config]);

  // KostX preview
  const kostenPreview = useMemo(() => {
    if (metrics.grundflaeche < 1) return null;
    try {
      const bb = shapes.length > 0 ? getBoundingBox(shapes[0].points) : null;
      const kostxConfig = {
        ...KOSTX_DEFAULTS,
        laenge_m: bb ? bb.width : Math.sqrt(metrics.grundflaeche),
        breite_m: bb ? bb.height : Math.sqrt(metrics.grundflaeche),
        geschosse: config.geschosse,
        raumhoehe_m: config.raumhoehe,
        bauweise: config.bauweise,
        anzahlWE: metrics.weAnzahl,
      };
      const result = calculateKostX(kostxConfig);
      return {
        kg300_400: result.basisHaus_eurM2,
        gik: result.gik.gik_eurM2,
      };
    } catch {
      return null;
    }
  }, [metrics, shapes, config]);

  // Keyboard shortcuts
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLSelectElement) return;
      if (e.ctrlKey || e.metaKey) {
        if (e.key === 'z' && !e.shiftKey) { e.preventDefault(); undo(); }
        if (e.key === 'z' && e.shiftKey) { e.preventDefault(); redo(); }
        if (e.key === 'Z') { e.preventDefault(); redo(); }
        return;
      }
      switch (e.key.toLowerCase()) {
        case 'r': setActiveTool('rect'); break;
        case 'l': setActiveTool('lshape'); break;
        case 'u': setActiveTool('ushape'); break;
        case 'p': setActiveTool('polygon'); break;
        case 'v': case 'escape': setActiveTool('select'); break;
        case 'g': setGridVisible(v => !v); break;
        case 's': setSnapEnabled(v => !v); break;
        case 'f': handleZoomFit(); break;
        case 'delete': case 'backspace':
          if (selectedShapeId) {
            const newShapes = shapes.filter(s => s.id !== selectedShapeId);
            handleShapesChange(newShapes);
            setSelectedShapeId(null);
          }
          break;
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [selectedShapeId, shapes, handleShapesChange, undo, redo]);

  const handleZoomFit = useCallback(() => {
    if (shapes.length === 0) {
      setZoom(50);
      setPanOffset({ x: 0, y: 0 });
      return;
    }
    const allPoints = shapes.flatMap(s => s.points);
    const bb = getBoundingBox(allPoints);
    const cx = (bb.minX + bb.maxX) / 2;
    const cy = (bb.minY + bb.maxY) / 2;
    setPanOffset({ x: -cx, y: -cy });
    setZoom(Math.max(20, Math.min(100, 400 / Math.max(bb.width, bb.height, 1))));
  }, [shapes]);

  const handleExportJSON = useCallback(() => {
    const data = { shapes, config, metrics };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'formx-export.json';
    a.click();
    URL.revokeObjectURL(url);
  }, [shapes, config, metrics]);

  const handleGoToKostX = useCallback(() => {
    const bb = shapes.length > 0 ? getBoundingBox(shapes[0].points) : null;
    const params = new URLSearchParams({
      laenge: (bb?.width ?? 25).toFixed(1),
      breite: (bb?.height ?? 15).toFixed(1),
      geschosse: config.geschosse.toString(),
      raumhoehe: config.raumhoehe.toString(),
      bauweise: config.bauweise,
      we: metrics.weAnzahl.toString(),
    });
    window.open(`/uplan-engine/demo/kostx?${params.toString()}`, '_blank');
  }, [shapes, config, metrics]);

  return (
    <div className="h-screen flex flex-col bg-[#0F172A] text-white overflow-hidden">
      {/* Header */}
      <header className="bg-[#1E3A5F] px-4 py-3 flex items-center justify-between border-b border-white/10 shrink-0">
        <div className="flex items-center gap-3">
          <a href="/uplan-engine/demo" className="flex items-center gap-2 text-white/70 hover:text-white transition-colors text-sm">
            <ArrowLeft size={16} />
            <span className="hidden sm:inline">Demo</span>
          </a>
          <div className="w-px h-6 bg-white/20" />
          <div className="flex items-center gap-2">
            <Building2 size={20} className="text-teal-500" />
            <h1 className="text-base sm:text-lg font-semibold">
              FormX <span className="text-white/50 font-normal">— Grundriss-Editor</span>
            </h1>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={handleExportJSON}
            className="flex items-center gap-1.5 px-3 py-1.5 text-sm bg-white/10 hover:bg-white/20 rounded-lg transition-colors">
            <Download size={14} /> Export
          </button>
          <button onClick={handleGoToKostX}
            className="flex items-center gap-1.5 px-3 py-1.5 text-sm bg-teal-600 hover:bg-teal-500 rounded-lg transition-colors">
            <ArrowRight size={14} /> KostX
          </button>
          <span className="text-xs text-white/40 hidden sm:inline ml-2">U-Plan Engine v0.2 · Build 035</span>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex flex-1 min-h-0">
        {/* Toolbar */}
        <FormXToolbar
          activeTool={activeTool}
          onToolChange={setActiveTool}
          gridVisible={gridVisible}
          onToggleGrid={() => setGridVisible(v => !v)}
          snapEnabled={snapEnabled}
          onToggleSnap={() => setSnapEnabled(v => !v)}
          onUndo={undo}
          onRedo={redo}
          canUndo={historyIndex > 0}
          canRedo={historyIndex < history.length - 1}
          onZoomFit={handleZoomFit}
        />

        {/* Canvas */}
        <div className="flex-1 relative min-w-0">
          <FormXCanvas
            shapes={shapes}
            selectedShapeId={selectedShapeId}
            activeTool={activeTool}
            gridVisible={gridVisible}
            snapEnabled={snapEnabled}
            zoom={zoom}
            panOffset={panOffset}
            onShapesChange={handleShapesChange}
            onSelectShape={setSelectedShapeId}
            onZoomChange={setZoom}
            onPanChange={setPanOffset}
          />
          {/* Status bar */}
          <div className="absolute bottom-2 left-2 flex gap-3 text-xs text-white/40 bg-black/40 px-2 py-1 rounded">
            <span>Grid: {gridVisible ? '1m' : 'Aus'}</span>
            <span>Snap: {snapEnabled ? 'An' : 'Aus'}</span>
            <span>Zoom: {zoom.toFixed(0)}x</span>
            <span>Formen: {shapes.length}</span>
          </div>
        </div>

        {/* Right Sidebar */}
        <div className="w-[280px] bg-gray-900/80 border-l border-white/10 overflow-y-auto shrink-0 p-4 space-y-6">
          <FormXMetricsPanel metrics={metrics} kostenPreview={kostenPreview} />
          <div className="h-px bg-white/10" />
          <FormXConfigPanel config={config} onChange={setConfig} />
        </div>
      </div>
    </div>
  );
}
