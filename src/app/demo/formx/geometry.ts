import type { Point, FormXShape, FormXConfig, FormXMetrics } from './types';

export function calcPolygonArea(points: Point[]): number {
  if (points.length < 3) return 0;
  let area = 0;
  for (let i = 0; i < points.length; i++) {
    const j = (i + 1) % points.length;
    area += points[i].x * points[j].y;
    area -= points[j].x * points[i].y;
  }
  return Math.abs(area) / 2;
}

export function calcPolygonPerimeter(points: Point[]): number {
  if (points.length < 2) return 0;
  let perimeter = 0;
  for (let i = 0; i < points.length; i++) {
    const j = (i + 1) % points.length;
    const dx = points[j].x - points[i].x;
    const dy = points[j].y - points[i].y;
    perimeter += Math.sqrt(dx * dx + dy * dy);
  }
  return perimeter;
}

export function snapToGrid(value: number, gridSize: number): number {
  return Math.round(value / gridSize) * gridSize;
}

export function pointsToPathD(points: Point[]): string {
  if (points.length === 0) return '';
  return points.map((p, i) => `${i === 0 ? 'M' : 'L'}${p.x},${p.y}`).join(' ') + ' Z';
}

export function getBoundingBox(points: Point[]): { minX: number; minY: number; maxX: number; maxY: number; width: number; height: number } {
  const xs = points.map(p => p.x);
  const ys = points.map(p => p.y);
  const minX = Math.min(...xs);
  const minY = Math.min(...ys);
  const maxX = Math.max(...xs);
  const maxY = Math.max(...ys);
  return { minX, minY, maxX, maxY, width: maxX - minX, height: maxY - minY };
}

export function getCentroid(points: Point[]): Point {
  const n = points.length;
  if (n === 0) return { x: 0, y: 0 };
  const sum = points.reduce((acc, p) => ({ x: acc.x + p.x, y: acc.y + p.y }), { x: 0, y: 0 });
  return { x: sum.x / n, y: sum.y / n };
}

export function createRectPoints(x1: number, y1: number, x2: number, y2: number): Point[] {
  const minX = Math.min(x1, x2);
  const minY = Math.min(y1, y2);
  const maxX = Math.max(x1, x2);
  const maxY = Math.max(y1, y2);
  return [
    { x: minX, y: minY },
    { x: maxX, y: minY },
    { x: maxX, y: maxY },
    { x: minX, y: maxY },
  ];
}

export function createLShapePoints(x: number, y: number, w: number, h: number): Point[] {
  // L-shape: full width bottom, half width top
  const hw = w * 0.5;
  const hh = h * 0.5;
  return [
    { x, y },
    { x: x + hw, y },
    { x: x + hw, y: y + hh },
    { x: x + w, y: y + hh },
    { x: x + w, y: y + h },
    { x, y: y + h },
  ];
}

export function createUShapePoints(x: number, y: number, w: number, h: number): Point[] {
  // U-shape: three sides of a rectangle with inner courtyard
  const wallW = w * 0.25;
  const courtH = h * 0.5;
  return [
    { x, y },
    { x: x + w, y },
    { x: x + w, y: y + h },
    { x: x + w - wallW, y: y + h },
    { x: x + w - wallW, y: y + courtH },
    { x: x + wallW, y: y + courtH },
    { x: x + wallW, y: y + h },
    { x, y: y + h },
  ];
}

function getGebaeudeKlasse(hoehe: number): number | string {
  if (hoehe <= 7) return 1;
  if (hoehe <= 7) return 2;
  if (hoehe <= 7) return 3;
  if (hoehe <= 13) return 4;
  if (hoehe <= 22) return 5;
  return 'Hochhaus';
}

export function calculateMetrics(shapes: FormXShape[], config: FormXConfig): FormXMetrics {
  const grundflaeche = shapes.reduce((sum, s) => sum + calcPolygonArea(s.points), 0);
  const umfang = shapes.reduce((sum, s) => sum + calcPolygonPerimeter(s.points), 0);

  const hoehe = config.geschosse * (config.raumhoehe + 0.35);
  const bgf = grundflaeche * config.geschosse;
  const nuf = bgf * config.nufEffizienz;
  const awf = umfang * hoehe;
  const fensterflaeche = awf * config.fensteranteil;
  const dachflaeche = grundflaeche;
  const iwFaktor = config.bauweise === 'Mauerwerk' ? 0.15 : 0.12;
  const iwf = awf * iwFaktor;

  const volume = grundflaeche * hoehe;
  const avVerhaeltnis = volume > 0 ? (2 * grundflaeche + awf) / volume : 0;
  const kompaktheit = grundflaeche > 0 ? umfang / Math.sqrt(4 * Math.PI * grundflaeche) : 0;

  const weAnzahl = config.weAnzahl === 'auto' ? Math.max(1, Math.round(nuf / 71)) : config.weAnzahl;
  const weGroesse = weAnzahl > 0 ? nuf / weAnzahl : 0;
  const stellplaetze = Math.ceil(weAnzahl * 1.0);
  const fassadeNuf = nuf > 0 ? awf / nuf : 0;

  const gebaeudeKlasse = getGebaeudeKlasse(hoehe);

  return {
    grundflaeche,
    umfang,
    bgf,
    nuf,
    awf,
    hoehe,
    gebaeudeKlasse,
    avVerhaeltnis,
    kompaktheit,
    weAnzahl,
    weGroesse,
    stellplaetze,
    fassadeNuf,
    fensterflaeche,
    dachflaeche,
    iwf,
  };
}

export function isPointInPolygon(point: Point, polygon: Point[]): boolean {
  let inside = false;
  for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
    const xi = polygon[i].x, yi = polygon[i].y;
    const xj = polygon[j].x, yj = polygon[j].y;
    const intersect = ((yi > point.y) !== (yj > point.y)) &&
      (point.x < (xj - xi) * (point.y - yi) / (yj - yi) + xi);
    if (intersect) inside = !inside;
  }
  return inside;
}
