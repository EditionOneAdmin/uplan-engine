"use client";

import React, { useRef, useState, useCallback, useEffect, useMemo } from 'react';
import type { Point, FormXShape, ToolType } from './types';
import {
  snapToGrid, pointsToPathD, calcPolygonArea, getBoundingBox,
  getCentroid, createRectPoints, createLShapePoints, createUShapePoints,
  isPointInPolygon,
} from './geometry';

interface Props {
  shapes: FormXShape[];
  selectedShapeId: string | null;
  activeTool: ToolType;
  gridVisible: boolean;
  snapEnabled: boolean;
  zoom: number;
  panOffset: Point;
  onShapesChange: (shapes: FormXShape[]) => void;
  onSelectShape: (id: string | null) => void;
  onZoomChange: (zoom: number) => void;
  onPanChange: (offset: Point) => void;
}

let shapeCounter = 0;
function newId() {
  return `shape_${++shapeCounter}_${Date.now()}`;
}

export default function FormXCanvas({
  shapes, selectedShapeId, activeTool, gridVisible, snapEnabled,
  zoom, panOffset, onShapesChange, onSelectShape, onZoomChange, onPanChange,
}: Props) {
  const svgRef = useRef<SVGSVGElement>(null);
  const [drawing, setDrawing] = useState(false);
  const [drawStart, setDrawStart] = useState<Point | null>(null);
  const [drawCurrent, setDrawCurrent] = useState<Point | null>(null);
  const [panning, setPanning] = useState(false);
  const [panStart, setPanStart] = useState<Point | null>(null);
  const [draggingShape, setDraggingShape] = useState<string | null>(null);
  const [dragOffset, setDragOffset] = useState<Point>({ x: 0, y: 0 });
  const [polygonPoints, setPolygonPoints] = useState<Point[]>([]);
  const [spaceDown, setSpaceDown] = useState(false);

  const gridSize = 1;
  const snapSize = snapEnabled ? 0.5 : 0.01;

  const svgToWorld = useCallback((clientX: number, clientY: number): Point => {
    const svg = svgRef.current;
    if (!svg) return { x: 0, y: 0 };
    const rect = svg.getBoundingClientRect();
    const x = (clientX - rect.left - rect.width / 2) / zoom - panOffset.x;
    const y = (clientY - rect.top - rect.height / 2) / zoom - panOffset.y;
    return { x, y };
  }, [zoom, panOffset]);

  const snap = useCallback((p: Point): Point => {
    if (!snapEnabled) return p;
    return { x: snapToGrid(p.x, snapSize), y: snapToGrid(p.y, snapSize) };
  }, [snapEnabled, snapSize]);

  // Keyboard: space for panning
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'Space') { e.preventDefault(); setSpaceDown(true); }
    };
    const onKeyUp = (e: KeyboardEvent) => {
      if (e.code === 'Space') setSpaceDown(false);
    };
    window.addEventListener('keydown', onKeyDown);
    window.addEventListener('keyup', onKeyUp);
    return () => { window.removeEventListener('keydown', onKeyDown); window.removeEventListener('keyup', onKeyUp); };
  }, []);

  const handleMouseDown = useCallback((e: React.MouseEvent<SVGSVGElement>) => {
    if (e.button === 1 || (e.button === 0 && spaceDown)) {
      setPanning(true);
      setPanStart({ x: e.clientX, y: e.clientY });
      e.preventDefault();
      return;
    }
    if (e.button !== 0) return;
    const world = snap(svgToWorld(e.clientX, e.clientY));

    if (activeTool === 'select') {
      // Check if clicking on a shape
      let found: string | null = null;
      for (let i = shapes.length - 1; i >= 0; i--) {
        if (isPointInPolygon(world, shapes[i].points)) {
          found = shapes[i].id;
          break;
        }
      }
      onSelectShape(found);
      if (found) {
        setDraggingShape(found);
        const shape = shapes.find(s => s.id === found);
        if (shape) {
          const c = getCentroid(shape.points);
          setDragOffset({ x: world.x - c.x, y: world.y - c.y });
        }
      }
      return;
    }

    if (activeTool === 'polygon') {
      setPolygonPoints(prev => [...prev, world]);
      return;
    }

    // rect, lshape, ushape: start drawing
    setDrawing(true);
    setDrawStart(world);
    setDrawCurrent(world);
  }, [activeTool, snap, svgToWorld, shapes, onSelectShape, spaceDown]);

  const handleMouseMove = useCallback((e: React.MouseEvent<SVGSVGElement>) => {
    if (panning && panStart) {
      const dx = (e.clientX - panStart.x) / zoom;
      const dy = (e.clientY - panStart.y) / zoom;
      onPanChange({ x: panOffset.x + dx, y: panOffset.y + dy });
      setPanStart({ x: e.clientX, y: e.clientY });
      return;
    }

    if (draggingShape) {
      const world = snap(svgToWorld(e.clientX, e.clientY));
      const shape = shapes.find(s => s.id === draggingShape);
      if (shape) {
        const c = getCentroid(shape.points);
        const dx = world.x - dragOffset.x - c.x;
        const dy = world.y - dragOffset.y - c.y;
        const updated = shapes.map(s =>
          s.id === draggingShape
            ? { ...s, points: s.points.map(p => ({ x: snapToGrid(p.x + dx, snapSize), y: snapToGrid(p.y + dy, snapSize) })) }
            : s
        );
        onShapesChange(updated);
      }
      return;
    }

    if (drawing) {
      const world = snap(svgToWorld(e.clientX, e.clientY));
      setDrawCurrent(world);
    }
  }, [panning, panStart, zoom, panOffset, onPanChange, draggingShape, drawing, snap, svgToWorld, shapes, onShapesChange, dragOffset, snapSize]);

  const handleMouseUp = useCallback((e: React.MouseEvent<SVGSVGElement>) => {
    if (panning) {
      setPanning(false);
      setPanStart(null);
      return;
    }

    if (draggingShape) {
      setDraggingShape(null);
      return;
    }

    if (drawing && drawStart && drawCurrent) {
      const dx = Math.abs(drawCurrent.x - drawStart.x);
      const dy = Math.abs(drawCurrent.y - drawStart.y);
      if (dx > 0.5 && dy > 0.5) {
        let points: Point[];
        let type: FormXShape['type'] = 'rect';
        const minX = Math.min(drawStart.x, drawCurrent.x);
        const minY = Math.min(drawStart.y, drawCurrent.y);

        if (activeTool === 'rect') {
          points = createRectPoints(drawStart.x, drawStart.y, drawCurrent.x, drawCurrent.y);
        } else if (activeTool === 'lshape') {
          points = createLShapePoints(minX, minY, dx, dy);
          type = 'lshape';
        } else if (activeTool === 'ushape') {
          points = createUShapePoints(minX, minY, dx, dy);
          type = 'ushape';
        } else {
          points = createRectPoints(drawStart.x, drawStart.y, drawCurrent.x, drawCurrent.y);
        }

        const newShape: FormXShape = { id: newId(), type, points };
        onShapesChange([...shapes, newShape]);
        onSelectShape(newShape.id);
      }
      setDrawing(false);
      setDrawStart(null);
      setDrawCurrent(null);
    }
  }, [panning, draggingShape, drawing, drawStart, drawCurrent, activeTool, shapes, onShapesChange, onSelectShape]);

  const handleDoubleClick = useCallback((e: React.MouseEvent<SVGSVGElement>) => {
    if (activeTool === 'polygon' && polygonPoints.length >= 3) {
      const newShape: FormXShape = { id: newId(), type: 'polygon', points: [...polygonPoints] };
      onShapesChange([...shapes, newShape]);
      onSelectShape(newShape.id);
      setPolygonPoints([]);
    }
  }, [activeTool, polygonPoints, shapes, onShapesChange, onSelectShape]);

  const handleWheel = useCallback((e: React.WheelEvent<SVGSVGElement>) => {
    e.preventDefault();
    const factor = e.deltaY < 0 ? 1.1 : 0.9;
    const newZoom = Math.max(10, Math.min(200, zoom * factor));
    onZoomChange(newZoom);
  }, [zoom, onZoomChange]);

  // Preview shape while drawing
  const previewPath = useMemo(() => {
    if (!drawing || !drawStart || !drawCurrent) return null;
    const dx = Math.abs(drawCurrent.x - drawStart.x);
    const dy = Math.abs(drawCurrent.y - drawStart.y);
    if (dx < 0.1 && dy < 0.1) return null;
    const minX = Math.min(drawStart.x, drawCurrent.x);
    const minY = Math.min(drawStart.y, drawCurrent.y);
    let pts: Point[];
    if (activeTool === 'lshape') pts = createLShapePoints(minX, minY, dx, dy);
    else if (activeTool === 'ushape') pts = createUShapePoints(minX, minY, dx, dy);
    else pts = createRectPoints(drawStart.x, drawStart.y, drawCurrent.x, drawCurrent.y);
    return pts;
  }, [drawing, drawStart, drawCurrent, activeTool]);

  const viewBox = useMemo(() => {
    const svg = svgRef.current;
    const w = svg?.clientWidth || 800;
    const h = svg?.clientHeight || 600;
    const vw = w / zoom;
    const vh = h / zoom;
    return `${-vw / 2 - panOffset.x} ${-vh / 2 - panOffset.y} ${vw} ${vh}`;
  }, [zoom, panOffset]);

  // Grid lines
  const gridLines = useMemo(() => {
    if (!gridVisible) return null;
    const svg = svgRef.current;
    const w = (svg?.clientWidth || 800) / zoom;
    const h = (svg?.clientHeight || 600) / zoom;
    const cx = -panOffset.x;
    const cy = -panOffset.y;
    const startX = Math.floor((cx - w / 2) / gridSize) * gridSize;
    const endX = Math.ceil((cx + w / 2) / gridSize) * gridSize;
    const startY = Math.floor((cy - h / 2) / gridSize) * gridSize;
    const endY = Math.ceil((cy + h / 2) / gridSize) * gridSize;
    const lines: React.ReactNode[] = [];
    for (let x = startX; x <= endX; x += gridSize) {
      const is5 = x % 5 === 0;
      lines.push(
        <line key={`gx${x}`} x1={x} y1={startY} x2={x} y2={endY}
          stroke="white" strokeOpacity={is5 ? 0.08 : 0.04} strokeWidth={1 / zoom} />
      );
    }
    for (let y = startY; y <= endY; y += gridSize) {
      const is5 = y % 5 === 0;
      lines.push(
        <line key={`gy${y}`} x1={startX} y1={y} x2={endX} y2={y}
          stroke="white" strokeOpacity={is5 ? 0.08 : 0.04} strokeWidth={1 / zoom} />
      );
    }
    return lines;
  }, [gridVisible, zoom, panOffset]);

  const strokeW = 2 / zoom;
  const fontSize = 12 / zoom;
  const handleSize = 6 / zoom;

  return (
    <svg
      ref={svgRef}
      className="w-full h-full bg-[#0F172A] cursor-crosshair"
      viewBox={viewBox}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onDoubleClick={handleDoubleClick}
      onWheel={handleWheel}
      style={{ touchAction: 'none' }}
    >
      {/* Grid */}
      {gridLines}

      {/* Origin cross */}
      <line x1={-0.5} y1={0} x2={0.5} y2={0} stroke="white" strokeOpacity={0.2} strokeWidth={strokeW * 0.5} />
      <line x1={0} y1={-0.5} x2={0} y2={0.5} stroke="white" strokeOpacity={0.2} strokeWidth={strokeW * 0.5} />

      {/* Shapes */}
      {shapes.map(shape => {
        const isSelected = shape.id === selectedShapeId;
        const area = calcPolygonArea(shape.points);
        const centroid = getCentroid(shape.points);
        const bb = getBoundingBox(shape.points);

        return (
          <g key={shape.id}>
            <path
              d={pointsToPathD(shape.points)}
              fill="rgba(20, 184, 166, 0.2)"
              stroke={isSelected ? '#14B8A6' : 'white'}
              strokeWidth={strokeW}
            />
            {/* Area label */}
            <text x={centroid.x} y={centroid.y} textAnchor="middle" dominantBaseline="central"
              fill="white" fontSize={fontSize} fontFamily="monospace" style={{ pointerEvents: 'none' }}>
              {area.toFixed(0)} m²
            </text>
            {/* Dimension labels */}
            {shape.points.length >= 4 && (
              <>
                {/* Top: width */}
                <text x={(bb.minX + bb.maxX) / 2} y={bb.minY - fontSize * 0.8}
                  textAnchor="middle" fill="#F59E0B" fontSize={fontSize * 0.85} fontFamily="monospace"
                  style={{ pointerEvents: 'none' }}>
                  {bb.width.toFixed(2)} m
                </text>
                {/* Right: height */}
                <text x={bb.maxX + fontSize * 0.8} y={(bb.minY + bb.maxY) / 2}
                  textAnchor="start" dominantBaseline="central" fill="#F59E0B" fontSize={fontSize * 0.85}
                  fontFamily="monospace" style={{ pointerEvents: 'none' }}>
                  {bb.height.toFixed(2)} m
                </text>
                {/* Dimension lines */}
                <line x1={bb.minX} y1={bb.minY - fontSize * 0.3} x2={bb.maxX} y2={bb.minY - fontSize * 0.3}
                  stroke="#F59E0B" strokeWidth={strokeW * 0.5} strokeOpacity={0.6} />
                <line x1={bb.maxX + fontSize * 0.3} y1={bb.minY} x2={bb.maxX + fontSize * 0.3} y2={bb.maxY}
                  stroke="#F59E0B" strokeWidth={strokeW * 0.5} strokeOpacity={0.6} />
              </>
            )}
            {/* Selection handles */}
            {isSelected && shape.points.map((p, i) => (
              <rect key={i} x={p.x - handleSize / 2} y={p.y - handleSize / 2}
                width={handleSize} height={handleSize} fill="#14B8A6" stroke="white" strokeWidth={strokeW * 0.5} />
            ))}
          </g>
        );
      })}

      {/* Preview while drawing */}
      {previewPath && (
        <path d={pointsToPathD(previewPath)} fill="rgba(20, 184, 166, 0.1)"
          stroke="#14B8A6" strokeWidth={strokeW} strokeDasharray={`${strokeW * 4} ${strokeW * 2}`} />
      )}

      {/* Polygon in progress */}
      {polygonPoints.length > 0 && (
        <g>
          <polyline
            points={polygonPoints.map(p => `${p.x},${p.y}`).join(' ')}
            fill="none" stroke="#14B8A6" strokeWidth={strokeW} strokeDasharray={`${strokeW * 4} ${strokeW * 2}`}
          />
          {polygonPoints.map((p, i) => (
            <circle key={i} cx={p.x} cy={p.y} r={handleSize * 0.6} fill="#14B8A6" />
          ))}
        </g>
      )}
    </svg>
  );
}
