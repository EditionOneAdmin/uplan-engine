"use client";

import React, { useRef, useState, useCallback, useEffect, useMemo } from 'react';
import type { Point, FormXShape, ToolType } from './types';
import {
  snapToGrid, pointsToPathD, calcPolygonArea, getBoundingBox,
  getCentroid, createRectPoints, createLShapePoints, createUShapePoints,
  isPointInPolygon, signedPolygonArea, pointToSegmentDist,
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

type DragMode = null | 'pan' | 'shape' | 'vertex' | 'edge' | 'draw';

interface EditingDim {
  shapeId: string;
  edgeIndex: number;
  worldX: number;
  worldY: number;
  currentLength: number;
}

export default function FormXCanvas({
  shapes, selectedShapeId, activeTool, gridVisible, snapEnabled,
  zoom, panOffset, onShapesChange, onSelectShape, onZoomChange, onPanChange,
}: Props) {
  const svgRef = useRef<SVGSVGElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const [dragMode, setDragMode] = useState<DragMode>(null);
  const [drawStart, setDrawStart] = useState<Point | null>(null);
  const [drawCurrent, setDrawCurrent] = useState<Point | null>(null);
  const [panStart, setPanStart] = useState<Point | null>(null);
  const [dragShapeId, setDragShapeId] = useState<string | null>(null);
  const [dragOffset, setDragOffset] = useState<Point>({ x: 0, y: 0 });
  const [dragVertexIdx, setDragVertexIdx] = useState<number>(-1);
  const [dragEdgeIdx, setDragEdgeIdx] = useState<number>(-1);
  const [dragEdgeStart, setDragEdgeStart] = useState<Point | null>(null);
  const [dragEdgeOrigPts, setDragEdgeOrigPts] = useState<Point[] | null>(null);
  const [polygonPoints, setPolygonPoints] = useState<Point[]>([]);
  const [spaceDown, setSpaceDown] = useState(false);
  const [hoveredEdge, setHoveredEdge] = useState<{ shapeId: string; idx: number } | null>(null);
  const [editingDim, setEditingDim] = useState<EditingDim | null>(null);
  const [editValue, setEditValue] = useState('');
  // Ghost points for visual feedback during vertex/edge drag
  const [ghostPoints, setGhostPoints] = useState<Point[] | null>(null);

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

  // Focus input when editing dimension
  useEffect(() => {
    if (editingDim && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [editingDim]);

  const handleMouseDown = useCallback((e: React.MouseEvent<SVGSVGElement>) => {
    if (editingDim) return; // don't start drag while editing

    if (e.button === 1 || (e.button === 0 && spaceDown)) {
      setDragMode('pan');
      setPanStart({ x: e.clientX, y: e.clientY });
      e.preventDefault();
      return;
    }
    if (e.button !== 0) return;
    const world = snap(svgToWorld(e.clientX, e.clientY));

    if (activeTool === 'select') {
      // Check vertex handles first (selected shape)
      if (selectedShapeId) {
        const shape = shapes.find(s => s.id === selectedShapeId);
        if (shape) {
          const hitR = 8 / zoom;
          for (let i = 0; i < shape.points.length; i++) {
            const p = shape.points[i];
            if (Math.abs(world.x - p.x) < hitR && Math.abs(world.y - p.y) < hitR) {
              setDragMode('vertex');
              setDragShapeId(shape.id);
              setDragVertexIdx(i);
              setGhostPoints([...shape.points]);
              e.stopPropagation();
              return;
            }
          }
          // Check midpoint handles (edge drag)
          for (let i = 0; i < shape.points.length; i++) {
            const j = (i + 1) % shape.points.length;
            const mx = (shape.points[i].x + shape.points[j].x) / 2;
            const my = (shape.points[i].y + shape.points[j].y) / 2;
            if (Math.abs(world.x - mx) < hitR && Math.abs(world.y - my) < hitR) {
              setDragMode('edge');
              setDragShapeId(shape.id);
              setDragEdgeIdx(i);
              setDragEdgeStart(world);
              setDragEdgeOrigPts([...shape.points]);
              setGhostPoints([...shape.points]);
              e.stopPropagation();
              return;
            }
          }
        }
      }

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
        setDragMode('shape');
        setDragShapeId(found);
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
    setDragMode('draw');
    setDrawStart(world);
    setDrawCurrent(world);
  }, [activeTool, snap, svgToWorld, shapes, selectedShapeId, onSelectShape, spaceDown, zoom, editingDim]);

  const handleMouseMove = useCallback((e: React.MouseEvent<SVGSVGElement>) => {
    const world = snap(svgToWorld(e.clientX, e.clientY));

    if (dragMode === 'pan' && panStart) {
      const dx = (e.clientX - panStart.x) / zoom;
      const dy = (e.clientY - panStart.y) / zoom;
      onPanChange({ x: panOffset.x + dx, y: panOffset.y + dy });
      setPanStart({ x: e.clientX, y: e.clientY });
      return;
    }

    if (dragMode === 'vertex' && dragShapeId !== null && dragVertexIdx >= 0) {
      const updated = shapes.map(s => {
        if (s.id !== dragShapeId) return s;
        const pts = [...s.points];
        pts[dragVertexIdx] = { x: snapToGrid(world.x, snapSize), y: snapToGrid(world.y, snapSize) };
        return { ...s, points: pts };
      });
      onShapesChange(updated);
      return;
    }

    if (dragMode === 'edge' && dragShapeId !== null && dragEdgeIdx >= 0 && dragEdgeStart && dragEdgeOrigPts) {
      const i = dragEdgeIdx;
      const j = (i + 1) % dragEdgeOrigPts.length;
      const p1 = dragEdgeOrigPts[i];
      const p2 = dragEdgeOrigPts[j];
      // Edge direction
      const edx = p2.x - p1.x;
      const edy = p2.y - p1.y;
      const len = Math.hypot(edx, edy);
      if (len < 0.001) return;
      // Normal (perpendicular)
      const nx = -edy / len;
      const ny = edx / len;
      // Project mouse delta onto normal
      const ddx = world.x - dragEdgeStart.x;
      const ddy = world.y - dragEdgeStart.y;
      const proj = ddx * nx + ddy * ny;
      const snappedProj = snapToGrid(proj, snapSize);
      const offX = nx * snappedProj;
      const offY = ny * snappedProj;

      const updated = shapes.map(s => {
        if (s.id !== dragShapeId) return s;
        const pts = [...dragEdgeOrigPts];
        pts[i] = { x: pts[i].x + offX, y: pts[i].y + offY };
        pts[j] = { x: pts[j].x + offX, y: pts[j].y + offY };
        return { ...s, points: pts };
      });
      onShapesChange(updated);
      return;
    }

    if (dragMode === 'shape' && dragShapeId) {
      const shape = shapes.find(s => s.id === dragShapeId);
      if (shape) {
        const c = getCentroid(shape.points);
        const dx = world.x - dragOffset.x - c.x;
        const dy = world.y - dragOffset.y - c.y;
        const updated = shapes.map(s =>
          s.id === dragShapeId
            ? { ...s, points: s.points.map(p => ({ x: snapToGrid(p.x + dx, snapSize), y: snapToGrid(p.y + dy, snapSize) })) }
            : s
        );
        onShapesChange(updated);
      }
      return;
    }

    if (dragMode === 'draw') {
      setDrawCurrent(world);
      return;
    }

    // Hover detection for edges (only in select mode with selected shape)
    if (activeTool === 'select' && selectedShapeId && !dragMode) {
      const shape = shapes.find(s => s.id === selectedShapeId);
      if (shape) {
        const hitR = 4 / zoom;
        let foundEdge: { shapeId: string; idx: number } | null = null;
        const rawWorld = svgToWorld(e.clientX, e.clientY);
        for (let i = 0; i < shape.points.length; i++) {
          const j = (i + 1) % shape.points.length;
          const { dist } = pointToSegmentDist(rawWorld.x, rawWorld.y, shape.points[i].x, shape.points[i].y, shape.points[j].x, shape.points[j].y);
          if (dist < hitR) {
            foundEdge = { shapeId: shape.id, idx: i };
            break;
          }
        }
        setHoveredEdge(foundEdge);
      }
    }
  }, [dragMode, panStart, zoom, panOffset, onPanChange, dragShapeId, dragVertexIdx, dragEdgeIdx, dragEdgeStart, dragEdgeOrigPts, shapes, onShapesChange, dragOffset, snapSize, snap, svgToWorld, activeTool, selectedShapeId]);

  const handleMouseUp = useCallback(() => {
    if (dragMode === 'pan') {
      setDragMode(null);
      setPanStart(null);
      return;
    }

    if (dragMode === 'vertex' || dragMode === 'edge') {
      setDragMode(null);
      setDragShapeId(null);
      setDragVertexIdx(-1);
      setDragEdgeIdx(-1);
      setDragEdgeStart(null);
      setDragEdgeOrigPts(null);
      setGhostPoints(null);
      return;
    }

    if (dragMode === 'shape') {
      setDragMode(null);
      setDragShapeId(null);
      return;
    }

    if (dragMode === 'draw' && drawStart && drawCurrent) {
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
      setDragMode(null);
      setDrawStart(null);
      setDrawCurrent(null);
    }
  }, [dragMode, drawStart, drawCurrent, activeTool, shapes, onShapesChange, onSelectShape]);

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

  // Dimension double-click handler
  const handleDimDoubleClick = useCallback((shapeId: string, edgeIndex: number, worldX: number, worldY: number, currentLength: number) => {
    setEditingDim({ shapeId, edgeIndex, worldX, worldY, currentLength });
    setEditValue(currentLength.toFixed(2));
  }, []);

  // Apply dimension edit
  const applyDimEdit = useCallback(() => {
    if (!editingDim) return;
    const newLen = parseFloat(editValue);
    if (isNaN(newLen) || newLen <= 0) {
      setEditingDim(null);
      return;
    }
    const shape = shapes.find(s => s.id === editingDim.shapeId);
    if (!shape) { setEditingDim(null); return; }

    const i = editingDim.edgeIndex;
    const j = (i + 1) % shape.points.length;
    const p1 = shape.points[i];
    const p2 = shape.points[j];
    const dx = p2.x - p1.x;
    const dy = p2.y - p1.y;
    const oldLen = Math.hypot(dx, dy);
    if (oldLen < 0.001) { setEditingDim(null); return; }

    const scale = newLen / oldLen;
    const newP2 = {
      x: snapToGrid(p1.x + dx * scale, snapSize),
      y: snapToGrid(p1.y + dy * scale, snapSize),
    };

    const updated = shapes.map(s => {
      if (s.id !== editingDim.shapeId) return s;
      const pts = [...s.points];
      pts[j] = newP2;
      return { ...s, points: pts };
    });
    onShapesChange(updated);
    setEditingDim(null);
  }, [editingDim, editValue, shapes, onShapesChange, snapSize]);

  // Preview shape while drawing
  const previewPath = useMemo(() => {
    if (dragMode !== 'draw' || !drawStart || !drawCurrent) return null;
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
  }, [dragMode, drawStart, drawCurrent, activeTool]);

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
  const handleSize = 8 / zoom;
  const midHandleSize = 6 / zoom;
  const dimOffset = 3; // meters outside polygon for dimension lines
  const dimFontSize = 10 / zoom;
  const dimLineW = 0.5 / zoom;

  // Render per-edge dimension chains for a shape
  const renderEdgeDimensions = useCallback((shape: FormXShape, isSelected: boolean) => {
    const pts = shape.points;
    if (pts.length < 3) return null;
    const sa = signedPolygonArea(pts);
    const cw = sa < 0; // true if clockwise
    const elements: React.ReactNode[] = [];

    for (let i = 0; i < pts.length; i++) {
      const j = (i + 1) % pts.length;
      const p1 = pts[i];
      const p2 = pts[j];
      const edx = p2.x - p1.x;
      const edy = p2.y - p1.y;
      const len = Math.hypot(edx, edy);
      if (len < 0.01) continue;

      // Outward normal: for CW winding, outward is to the left of edge direction
      // For CCW winding, outward is to the right
      let nx: number, ny: number;
      if (cw) {
        nx = edy / len;  // left normal
        ny = -edx / len;
      } else {
        nx = -edy / len; // right normal
        ny = edx / len;
      }

      const off = dimOffset;
      const mx = (p1.x + p2.x) / 2;
      const my = (p1.y + p2.y) / 2;

      // Extension lines from p1 and p2 outward
      const ext1x = p1.x + nx * (off + 0.5);
      const ext1y = p1.y + ny * (off + 0.5);
      const ext2x = p2.x + nx * (off + 0.5);
      const ext2y = p2.y + ny * (off + 0.5);

      // Dimension line endpoints (at offset distance)
      const d1x = p1.x + nx * off;
      const d1y = p1.y + ny * off;
      const d2x = p2.x + nx * off;
      const d2y = p2.y + ny * off;

      // Text position
      const tx = mx + nx * (off + 0.3);
      const ty = my + ny * (off + 0.3);

      // Angle for text rotation (align with edge)
      let angle = Math.atan2(edy, edx) * 180 / Math.PI;
      // Keep text readable (not upside down)
      if (angle > 90) angle -= 180;
      if (angle < -90) angle += 180;

      elements.push(
        <g key={`dim-${i}`}>
          {/* Extension lines */}
          <line x1={p1.x + nx * 0.3} y1={p1.y + ny * 0.3} x2={ext1x} y2={ext1y}
            stroke="#F59E0B" strokeWidth={dimLineW} strokeOpacity={0.5} />
          <line x1={p2.x + nx * 0.3} y1={p2.y + ny * 0.3} x2={ext2x} y2={ext2y}
            stroke="#F59E0B" strokeWidth={dimLineW} strokeOpacity={0.5} />
          {/* Dimension line */}
          <line x1={d1x} y1={d1y} x2={d2x} y2={d2y}
            stroke="#F59E0B" strokeWidth={dimLineW} strokeOpacity={0.8} />
          {/* Arrow ends */}
          {renderArrow(d1x, d1y, edx / len, edy / len, dimLineW * 4)}
          {renderArrow(d2x, d2y, -edx / len, -edy / len, dimLineW * 4)}
          {/* Text */}
          <text
            x={tx} y={ty}
            textAnchor="middle"
            dominantBaseline="central"
            fill="#F59E0B"
            fontSize={dimFontSize}
            fontFamily="monospace"
            transform={`rotate(${angle}, ${tx}, ${ty})`}
            style={{ pointerEvents: isSelected ? 'auto' : 'none', cursor: isSelected ? 'pointer' : 'default' }}
            onDoubleClick={(e) => {
              e.stopPropagation();
              handleDimDoubleClick(shape.id, i, tx, ty, len);
            }}
          >
            {len.toFixed(2)} m
          </text>
        </g>
      );
    }
    return elements;
  }, [dimFontSize, dimLineW, dimOffset, handleDimDoubleClick]);

  function renderArrow(x: number, y: number, dx: number, dy: number, size: number) {
    // Small triangle arrow
    const ax = x + dx * size;
    const ay = y + dy * size;
    const px1 = ax + (-dy * size * 0.5);
    const py1 = ay + (dx * size * 0.5);
    const px2 = ax + (dy * size * 0.5);
    const py2 = ay + (-dx * size * 0.5);
    return <polygon points={`${x},${y} ${px1},${py1} ${px2},${py2}`} fill="#F59E0B" fillOpacity={0.8} />;
  }

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
        const pts = shape.points;

        return (
          <g key={shape.id}>
            {/* Ghost outline during vertex/edge drag */}
            {isSelected && ghostPoints && (dragMode === 'vertex' || dragMode === 'edge') && (
              <path
                d={pointsToPathD(ghostPoints)}
                fill="none"
                stroke="white"
                strokeWidth={strokeW * 0.5}
                strokeOpacity={0.2}
                strokeDasharray={`${strokeW * 3} ${strokeW * 2}`}
                style={{ pointerEvents: 'none' }}
              />
            )}

            {/* Main shape polygon */}
            <path
              d={pointsToPathD(pts)}
              fill="rgba(20, 184, 166, 0.2)"
              stroke={isSelected ? '#14B8A6' : 'white'}
              strokeWidth={strokeW}
              style={{ pointerEvents: 'auto' }}
            />

            {/* Edge hover highlights */}
            {isSelected && pts.map((p, i) => {
              const j = (i + 1) % pts.length;
              const isHov = hoveredEdge?.shapeId === shape.id && hoveredEdge?.idx === i;
              if (!isHov) return null;
              return (
                <line key={`eh-${i}`}
                  x1={p.x} y1={p.y} x2={pts[j].x} y2={pts[j].y}
                  stroke="#F59E0B" strokeWidth={strokeW * 2} strokeOpacity={0.7}
                  style={{ pointerEvents: 'none' }}
                />
              );
            })}

            {/* Area label */}
            <text x={centroid.x} y={centroid.y} textAnchor="middle" dominantBaseline="central"
              fill="white" fontSize={fontSize} fontFamily="monospace" style={{ pointerEvents: 'none' }}>
              {area.toFixed(0)} m²
            </text>

            {/* Per-edge dimension chains */}
            {renderEdgeDimensions(shape, isSelected)}

            {/* Selection handles: vertices */}
            {isSelected && pts.map((p, i) => (
              <rect key={`vh-${i}`}
                x={p.x - handleSize / 2} y={p.y - handleSize / 2}
                width={handleSize} height={handleSize}
                fill={dragMode === 'vertex' && dragVertexIdx === i ? '#5EEAD4' : '#14B8A6'}
                stroke="white" strokeWidth={strokeW * 0.5}
                style={{ cursor: 'move', pointerEvents: 'auto' }}
              />
            ))}

            {/* Midpoint handles (diamonds) on edges */}
            {isSelected && pts.map((p, i) => {
              const j = (i + 1) % pts.length;
              const mx = (p.x + pts[j].x) / 2;
              const my = (p.y + pts[j].y) / 2;
              const s = midHandleSize / 2;
              const isHov = hoveredEdge?.shapeId === shape.id && hoveredEdge?.idx === i;
              return (
                <polygon key={`mh-${i}`}
                  points={`${mx},${my - s} ${mx + s},${my} ${mx},${my + s} ${mx - s},${my}`}
                  fill={isHov ? '#F59E0B' : '#14B8A6'}
                  stroke="white" strokeWidth={strokeW * 0.4}
                  style={{ cursor: 'move', pointerEvents: 'auto' }}
                />
              );
            })}
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

      {/* Inline dimension editing via foreignObject */}
      {editingDim && (
        <foreignObject
          x={editingDim.worldX - 3}
          y={editingDim.worldY - 0.8}
          width={6}
          height={1.6}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '100%', height: '100%' }}>
            <input
              ref={inputRef}
              type="text"
              value={editValue}
              onChange={e => setEditValue(e.target.value)}
              onKeyDown={e => {
                if (e.key === 'Enter') { applyDimEdit(); }
                if (e.key === 'Escape') { setEditingDim(null); }
                e.stopPropagation();
              }}
              onBlur={() => setEditingDim(null)}
              style={{
                width: '100%',
                background: '#1E293B',
                color: '#F59E0B',
                border: '1px solid #F59E0B',
                borderRadius: '2px',
                textAlign: 'center',
                fontSize: `${dimFontSize * zoom}px`,
                fontFamily: 'monospace',
                padding: '0 2px',
                outline: 'none',
              }}
            />
          </div>
        </foreignObject>
      )}
    </svg>
  );
}
