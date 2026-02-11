import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import type { Baufeld, PlacedUnit, BuildingModule, Filters, Metrics } from "./types";
import { calculateMatch } from "./matchScore";
import { BUILDINGS, SHAPE_CONFIG } from "./data";

// ── Colors ──
const TEAL = [13, 148, 136] as const;       // #0D9488
const DARK = [30, 41, 59] as const;          // #1E293B
const LIGHT_LINE = [226, 232, 240] as const; // #E2E8F0
const WHITE = [255, 255, 255] as const;

// ── Helpers ──
const fmtNum = (n: number) => n.toLocaleString("de-DE");
const fmtEur = (n: number) => {
  if (n >= 1_000_000) return `€${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `€${(n / 1_000).toFixed(0)}k`;
  return `€${n}`;
};
const fmtEurFull = (n: number) => `€${n.toLocaleString("de-DE")}`;
const fmtPct = (n: number) => `${(n * 100).toFixed(0)}%`;

const roofLabel: Record<string, string> = { flat: "Flachdach", saddle: "Satteldach", pult: "Pultdach" };
const facadeLabel: Record<string, string> = { putz: "Putz", klinker: "Klinker", holz: "Holz", metall: "Metall" };
const effLabel: Record<string, string> = { geg: "GEG", kfw40: "KfW 40", passivhaus: "Passivhaus" };

function dateStamp() {
  const now = new Date();
  const d = now.toLocaleDateString("de-DE", { day: "2-digit", month: "2-digit", year: "numeric" });
  const t = now.toLocaleTimeString("de-DE", { hour: "2-digit", minute: "2-digit" });
  return { dateStr: d, timeStr: t, full: `${d} ${t}` };
}

function drawTealLine(doc: jsPDF, y: number) {
  const w = doc.internal.pageSize.getWidth();
  doc.setDrawColor(...TEAL);
  doc.setLineWidth(0.8);
  doc.line(20, y, w - 20, y);
}

function drawFooter(doc: jsPDF) {
  const h = doc.internal.pageSize.getHeight();
  const w = doc.internal.pageSize.getWidth();
  const page = (doc as any).internal.getCurrentPageInfo().pageNumber;
  doc.setFontSize(7);
  doc.setTextColor(...LIGHT_LINE);
  doc.text("Generiert mit B-Plan Engine v0.1 · Alle Angaben sind unverbindliche Richtwerte.", 20, h - 10);
  doc.text(`Seite ${page}`, w - 20, h - 10, { align: "right" });
}

// ── Main export interface ──
export interface ExportData {
  baufelder: Baufeld[];
  placedUnits: PlacedUnit[];
  buildings: BuildingModule[];
  filters: Filters;
  metrics: Metrics;
}

// ── Image helpers ──

async function loadImageAsBase64(url: string): Promise<string | null> {
  try {
    const absoluteUrl = url.startsWith("http") ? url : `${window.location.origin}${url}`;
    // Use Image element + canvas to get base64 (more reliable than fetch for CORS)
    return new Promise((resolve) => {
      const img = new Image();
      img.crossOrigin = "anonymous";
      img.onload = () => {
        try {
          const canvas = document.createElement("canvas");
          canvas.width = img.naturalWidth;
          canvas.height = img.naturalHeight;
          const ctx = canvas.getContext("2d");
          if (!ctx) { resolve(null); return; }
          ctx.drawImage(img, 0, 0);
          resolve(canvas.toDataURL("image/jpeg", 0.9));
        } catch(e) {
          console.warn("canvas export failed, trying fetch:", url, e);
          // Fallback to fetch
          fetch(absoluteUrl)
            .then(r => r.blob())
            .then(blob => {
              const reader = new FileReader();
              reader.onloadend = () => resolve(reader.result as string);
              reader.onerror = () => resolve(null);
              reader.readAsDataURL(blob);
            })
            .catch(() => resolve(null));
        }
      };
      img.onerror = () => {
        console.warn("Image load failed:", absoluteUrl);
        resolve(null);
      };
      img.src = absoluteUrl;
    });
  } catch(e) { console.warn("loadImageAsBase64 failed:", url, e); return null; }
}

async function captureMap(): Promise<string | null> {
  try {
    const html2canvas = (await import("html2canvas")).default;
    const mapEl = document.querySelector(".leaflet-container") as HTMLElement;
    if (!mapEl) return null;
    
    // Strategy: Use proxy for tile images by converting them to inline data first
    // First, try to pre-load all tile images as base64
    const tileImages = mapEl.querySelectorAll("img.leaflet-tile");
    const originalSrcs: Map<HTMLImageElement, string> = new Map();
    
    // Replace tile srcs with data URLs where possible
    const proxyPromises: Promise<void>[] = [];
    tileImages.forEach((tile) => {
      const img = tile as HTMLImageElement;
      if (img.complete && img.naturalWidth > 0) {
        proxyPromises.push((async () => {
          try {
            const resp = await fetch(img.src);
            const blob = await resp.blob();
            const dataUrl = await new Promise<string>((resolve) => {
              const reader = new FileReader();
              reader.onloadend = () => resolve(reader.result as string);
              reader.readAsDataURL(blob);
            });
            originalSrcs.set(img, img.src);
            img.src = dataUrl;
          } catch {
            // Skip tiles that can't be fetched (CORS)
          }
        })());
      }
    });
    
    await Promise.allSettled(proxyPromises);
    console.log("[PDF Export] Proxied", originalSrcs.size, "of", tileImages.length, "tile images");
    
    const canvas = await html2canvas(mapEl, {
      useCORS: true,
      allowTaint: false,
      scale: 2,
      logging: false,
    });
    
    // Restore original tile srcs
    originalSrcs.forEach((src, img) => { img.src = src; });
    
    const dataUrl = canvas.toDataURL("image/jpeg", 0.85);
    console.log("[PDF Export] Map captured:", dataUrl.length, "bytes");
    return dataUrl;
  } catch(e) { 
    console.warn("captureMap failed:", e);
    // Fallback: try with allowTaint (produces image but can't export as clean data url on some browsers)
    try {
      const html2canvas = (await import("html2canvas")).default;
      const mapEl = document.querySelector(".leaflet-container") as HTMLElement;
      if (!mapEl) return null;
      const canvas = await html2canvas(mapEl, {
        useCORS: false,
        allowTaint: true,
        scale: 2,
        logging: false,
      });
      return canvas.toDataURL("image/jpeg", 0.85);
    } catch(e2) {
      console.warn("captureMap fallback also failed:", e2);
      return null;
    }
  }
}

export async function exportProjectPlan(data: ExportData): Promise<void> {
  const { baufelder, placedUnits, buildings, filters, metrics } = data;
  const { dateStr, full } = dateStamp();

  // Pre-load images
  console.log("[PDF Export] Starting image preload...");
  const mapImage = await captureMap();
  console.log("[PDF Export] Map capture:", mapImage ? `${mapImage.length} bytes` : "FAILED");
  
  const renderingImages: Record<string, string> = {};
  const seenIds = new Set<string>();
  for (const unit of placedUnits) {
    if (seenIds.has(unit.buildingId)) continue;
    seenIds.add(unit.buildingId);
    const building = buildings.find(b => b.id === unit.buildingId);
    console.log("[PDF Export] Building:", building?.id, "rendering:", building?.rendering);
    if (building?.rendering) {
      const img = await loadImageAsBase64(building.rendering);
      console.log("[PDF Export] Loaded:", building.id, img ? `${img.length} bytes` : "FAILED");
      if (img) renderingImages[building.id] = img;
    }
  }
  console.log("[PDF Export] Loaded renderings:", Object.keys(renderingImages).length, "of", seenIds.size);

  const doc = new jsPDF({ orientation: "landscape", unit: "mm", format: "a4" });
  const W = doc.internal.pageSize.getWidth();
  const pageH = doc.internal.pageSize.getHeight();

  // ════════════════════════════════════════════════════════════════
  // PAGE 1 — Cover + Overview
  // ════════════════════════════════════════════════════════════════

  // Header
  doc.setFontSize(22);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(...DARK);
  doc.text("B-Plan Engine", 20, 25);
  doc.setFontSize(14);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(...TEAL);
  doc.text("Projektplan", W - 20, 25, { align: "right" });

  drawTealLine(doc, 30);

  // Projektübersicht
  let y = 40;
  doc.setFontSize(14);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(...DARK);
  doc.text("PROJEKTÜBERSICHT", 20, y);
  y += 10;

  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  const totalCost = placedUnits.reduce((s, u) => {
    const b = buildings.find(bb => bb.id === u.buildingId);
    return s + (b ? b.pricePerSqm * u.area : 0);
  }, 0);

  const overviewItems = [
    ["Erstellt:", dateStr],
    ["Baufelder:", `${baufelder.length}`],
    ["Gebäude:", `${placedUnits.length}`],
    ["Wohneinheiten:", `${metrics.totalUnits}`],
  ];
  for (const [label, val] of overviewItems) {
    doc.setFont("helvetica", "normal");
    doc.setTextColor(100, 116, 139);
    doc.text(label, 25, y);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(...DARK);
    doc.text(val, 70, y);
    y += 7;
  }

  // Gesamtkennzahlen
  y += 5;
  doc.setFontSize(14);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(...DARK);
  doc.text("GESAMTKENNZAHLEN", 20, y);
  y += 4;

  autoTable(doc, {
    startY: y,
    margin: { left: 20, right: 20 },
    theme: "grid",
    styles: { fontSize: 10, cellPadding: 4, textColor: DARK as any, lineColor: LIGHT_LINE as any, lineWidth: 0.3 },
    headStyles: { fillColor: TEAL as any, textColor: WHITE as any, fontStyle: "bold", fontSize: 9 },
    head: [["BGF", "GRZ", "GFZ", "Stellplätze", "Wohneinh.", "Kosten", "Konformität"]],
    body: [[
      `${fmtNum(metrics.totalBGF)} m²`,
      fmtPct(metrics.grzUsage),
      fmtPct(metrics.gfzUsage),
      `${metrics.parkingNeeded}`,
      `${metrics.totalUnits}`,
      totalCost >= 1_000_000 ? `~€${(totalCost / 1_000_000).toFixed(1)} Mio` : fmtEurFull(totalCost),
      metrics.compliant ? "✓ Konform" : "✗ Überschreitung",
    ]],
    didParseCell(data) {
      if (data.section === "body" && data.column.index === 6) {
        data.cell.styles.textColor = metrics.compliant ? [34, 197, 94] : [239, 68, 68];
        data.cell.styles.fontStyle = "bold";
      }
    },
  });

  y = (doc as any).lastAutoTable.finalY + 12;

  // Baufeld-Übersicht
  doc.setFontSize(14);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(...DARK);
  doc.text("BAUFELD-ÜBERSICHT", 20, y);
  y += 4;

  const bfRows = baufelder.map((bf, i) => {
    const bfUnits = placedUnits.filter(u => u.baufeldId === bf.id);
    const bfBGF = bfUnits.reduce((s, u) => s + u.area, 0);
    const bfGF = bfUnits.reduce((s, u) => {
      const b = buildings.find(bb => bb.id === u.buildingId);
      return s + (b ? b.footprint.width * b.footprint.depth : 0);
    }, 0);
    const grz = bf.grundstuecksflaecheM2 > 0 ? bfGF / bf.grundstuecksflaecheM2 : 0;
    const gfz = bf.grundstuecksflaecheM2 > 0 ? bfBGF / bf.grundstuecksflaecheM2 : 0;
    return [
      `${i + 1}`,
      bf.name,
      bf.type,
      `${fmtNum(bf.grundstuecksflaecheM2)}`,
      grz.toFixed(2),
      gfz.toFixed(2),
      `${bfUnits.length}`,
    ];
  });

  if (bfRows.length > 0) {
    autoTable(doc, {
      startY: y,
      margin: { left: 20, right: 20 },
      theme: "grid",
      styles: { fontSize: 9, cellPadding: 3, textColor: DARK as any, lineColor: LIGHT_LINE as any, lineWidth: 0.3 },
      headStyles: { fillColor: TEAL as any, textColor: WHITE as any, fontStyle: "bold", fontSize: 9 },
      head: [["Nr", "Name", "Typ", "m²", "GRZ", "GFZ", "Gebäude"]],
      body: bfRows,
      columnStyles: {
        0: { cellWidth: 15, halign: "center" },
        2: { cellWidth: 18, halign: "center" },
        3: { cellWidth: 25, halign: "right" },
        4: { cellWidth: 20, halign: "right" },
        5: { cellWidth: 20, halign: "right" },
        6: { cellWidth: 22, halign: "center" },
      },
    });
  } else {
    doc.setFontSize(10);
    doc.setFont("helvetica", "italic");
    doc.setTextColor(100, 116, 139);
    doc.text("Keine Baufelder definiert.", 25, y + 6);
  }

  // Map screenshot
  if (mapImage) {
    const mapY = bfRows.length > 0 ? (doc as any).lastAutoTable.finalY + 10 : y + 16;
    const mapW = W - 40;
    const mapH = Math.min(100, pageH - mapY - 25);
    if (mapH > 30) {
      try {
        doc.addImage(mapImage, "JPEG", 20, mapY, mapW, mapH);
        doc.setFontSize(7);
        doc.setTextColor(100, 116, 139);
        doc.text("Lageplan — Vorschau", 20, mapY + mapH + 4);
      } catch { /* skip if image fails */ }
    }
  }

  drawFooter(doc);

  // ════════════════════════════════════════════════════════════════
  // PAGE 2 — Gebäude-Details
  // ════════════════════════════════════════════════════════════════
  doc.addPage();
  y = 20;

  doc.setFontSize(14);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(...DARK);
  doc.text("GEBÄUDE-DETAILS", 20, y);
  y += 4;

  const gebRows = placedUnits.map((u, i) => {
    const b = buildings.find(bb => bb.id === u.buildingId);
    if (!b) return [`${i + 1}`, "?", "", "", "", "", "", ""];
    const cost = b.pricePerSqm * u.area;
    const shape = SHAPE_CONFIG[b.shape]?.icon || "";
    return [
      `${i + 1}`,
      `${b.manufacturerLabel} ${b.name}`,
      b.manufacturerLabel,
      shape,
      `${u.geschosse}`,
      `${u.units}`,
      fmtNum(u.area),
      fmtEur(cost),
    ];
  });

  // Summary row
  const totalBGFAll = placedUnits.reduce((s, u) => s + u.area, 0);
  const totalUnitsAll = placedUnits.reduce((s, u) => s + u.units, 0);
  gebRows.push(["", "GESAMT", "", "", "", `${totalUnitsAll}`, fmtNum(totalBGFAll), fmtEur(totalCost)]);

  if (placedUnits.length > 0) {
    autoTable(doc, {
      startY: y,
      margin: { left: 20, right: 20 },
      theme: "grid",
      styles: { fontSize: 9, cellPadding: 3, textColor: DARK as any, lineColor: LIGHT_LINE as any, lineWidth: 0.3 },
      headStyles: { fillColor: TEAL as any, textColor: WHITE as any, fontStyle: "bold", fontSize: 9 },
      head: [["Nr", "Gebäude", "Hersteller", "Form", "G", "WE", "BGF m²", "Kosten"]],
      body: gebRows,
      columnStyles: {
        0: { cellWidth: 12, halign: "center" },
        3: { cellWidth: 15, halign: "center" },
        4: { cellWidth: 12, halign: "center" },
        5: { cellWidth: 15, halign: "right" },
        6: { cellWidth: 25, halign: "right" },
        7: { cellWidth: 25, halign: "right" },
      },
      didParseCell(data) {
        // Bold last row (GESAMT)
        if (data.section === "body" && data.row.index === gebRows.length - 1) {
          data.cell.styles.fontStyle = "bold";
          data.cell.styles.fillColor = [241, 245, 249];
        }
      },
    });

    y = (doc as any).lastAutoTable.finalY + 10;
  } else {
    doc.setFontSize(10);
    doc.setFont("helvetica", "italic");
    doc.setTextColor(100, 116, 139);
    doc.text("Keine Gebäude platziert.", 25, y + 6);
    y += 16;
  }

  // Technische Details pro Gebäude

  doc.setFontSize(12);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(...DARK);
  doc.text("TECHNISCHE DETAILS PRO GEBÄUDE", 20, y);
  y += 8;

  for (let i = 0; i < placedUnits.length; i++) {
    const u = placedUnits[i];
    const b = buildings.find(bb => bb.id === u.buildingId);
    if (!b) continue;

    const bf = baufelder.find(bff => bff.id === u.baufeldId);
    const match = bf ? calculateMatch(b, bf, filters, u.geschosse) : null;

    // Check page space (need more if rendering present)
    const hasRendering = !!renderingImages[b.id];
    const neededSpace = hasRendering ? 65 : 45;
    if (y > pageH - neededSpace) {
      drawFooter(doc);
      doc.addPage();
      y = 20;
    }

    doc.setFontSize(10);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(...TEAL);
    doc.text(`Gebäude ${i + 1}: ${b.manufacturerLabel} ${b.name}`, 25, y);
    y += 5;

    // Rendering image
    const renderingStartY = y;
    if (hasRendering) {
      try {
        doc.addImage(renderingImages[b.id], "JPEG", 25, y, 60, 40);
        doc.setFontSize(6);
        doc.setTextColor(150, 150, 150);
        doc.text("Vorschau", 25, y + 43);
      } catch { /* skip */ }
    }

    const detailX = hasRendering ? 95 : 30;

    doc.setFontSize(8);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(...DARK);

    const bfLabel = bf ? `${bf.name} (${bf.type})` : "—";
    doc.text(`Baufeld: ${bfLabel}  │  Geschosse: ${u.geschosse}  │  Rotation: ${u.rotation}°`, detailX, y);
    y += 4;
    doc.text(`Footprint: ${b.footprint.width} × ${b.footprint.depth} m  │  Grundfläche: ${b.footprint.width * b.footprint.depth} m²`, detailX, y);
    y += 4;
    doc.text(`Dach: ${roofLabel[u.roofType] || u.roofType}  │  Fassade: ${facadeLabel[u.facade] || u.facade}  │  Energie: ${b.energyRating}  │  Standard: ${effLabel[filters.efficiency] || filters.efficiency}`, detailX, y);
    y += 4;

    if (match) {
      doc.text(`Kompatibilität: ${match.score}/${match.maxScore}`, detailX, y);
      y += 4;
      const criteriaLine = match.criteria.map(c => {
        const icon = c.status === "pass" ? "✓" : c.status === "warn" ? "⚠" : "✗";
        return `${icon} ${c.label}`;
      }).join("  ");
      doc.setFontSize(7);
      doc.text(criteriaLine, detailX + 5, y);
      y += 3;
    }

    // Ensure y advances past the rendering image if present
    if (hasRendering) y = Math.max(y, renderingStartY + 46);
    y += 4;
  }

  drawFooter(doc);

  // ════════════════════════════════════════════════════════════════
  // PAGE 3 — Kostenübersicht + Hinweise
  // ════════════════════════════════════════════════════════════════
  doc.addPage();
  y = 20;

  doc.setFontSize(14);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(...DARK);
  doc.text("KOSTENÜBERSICHT", 20, y);
  y += 3;

  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(100, 116, 139);
  doc.text("Baukosten (Richtwerte)", 20, y + 5);
  y += 9;

  const costRows = placedUnits.map((u, i) => {
    const b = buildings.find(bb => bb.id === u.buildingId);
    if (!b) return [`${i + 1}`, "?", "", "", ""];
    const cost = b.pricePerSqm * u.area;
    return [
      `${i + 1}`,
      `${b.manufacturerLabel} ${b.name}`,
      fmtNum(b.pricePerSqm),
      fmtNum(u.area),
      fmtEurFull(cost),
    ];
  });
  costRows.push(["", "GESAMT", "", fmtNum(totalBGFAll), fmtEurFull(totalCost)]);

  if (placedUnits.length > 0) {
    autoTable(doc, {
      startY: y,
      margin: { left: 20, right: 20 },
      theme: "grid",
      styles: { fontSize: 9, cellPadding: 3, textColor: DARK as any, lineColor: LIGHT_LINE as any, lineWidth: 0.3 },
      headStyles: { fillColor: TEAL as any, textColor: WHITE as any, fontStyle: "bold", fontSize: 9 },
      head: [["Nr", "Gebäude", "€/m² BGF", "BGF m²", "Kosten"]],
      body: costRows,
      columnStyles: {
        0: { cellWidth: 15, halign: "center" },
        2: { cellWidth: 30, halign: "right" },
        3: { cellWidth: 30, halign: "right" },
        4: { cellWidth: 40, halign: "right" },
      },
      didParseCell(data) {
        if (data.section === "body" && data.row.index === costRows.length - 1) {
          data.cell.styles.fontStyle = "bold";
          data.cell.styles.fillColor = [241, 245, 249];
        }
      },
    });

    y = (doc as any).lastAutoTable.finalY + 8;
  }

  // Stellplätze
  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(...DARK);
  doc.text(`Stellplätze: ${metrics.parkingNeeded} benötigt (0.8 × ${metrics.totalUnits} WE)`, 20, y);
  y += 14;

  // Hinweise & Empfehlungen
  doc.setFontSize(14);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(...DARK);
  doc.text("HINWEISE & EMPFEHLUNGEN", 20, y);
  y += 8;

  doc.setFontSize(9);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(71, 85, 105);

  const hints: string[] = [];

  // Generate hints from match scores
  let perfectCount = 0;
  let roofIssues = 0;
  for (const u of placedUnits) {
    const b = buildings.find(bb => bb.id === u.buildingId);
    const bf = baufelder.find(bff => bff.id === u.baufeldId);
    if (!b || !bf) continue;
    const match = calculateMatch(b, bf, filters, u.geschosse);
    if (match.score === 10) perfectCount++;
    const roofC = match.criteria.find(c => c.name === "dach");
    if (roofC && roofC.status === "fail") roofIssues++;
  }

  if (roofIssues > 0) hints.push(`${roofIssues} Gebäude haben eine Dachform-Abweichung vom B-Plan`);
  if (perfectCount > 0) hints.push(`${perfectCount} Gebäude mit optimaler Kompatibilität (10/10)`);

  // GRZ warnings per baufeld
  for (const bf of baufelder) {
    const bfUnits = placedUnits.filter(u => u.baufeldId === bf.id);
    const bfGF = bfUnits.reduce((s, u) => {
      const b = buildings.find(bb => bb.id === u.buildingId);
      return s + (b ? b.footprint.width * b.footprint.depth : 0);
    }, 0);
    const maxGF = bf.maxGRZ * bf.grundstuecksflaecheM2;
    if (maxGF > 0) {
      const usage = bfGF / maxGF;
      if (usage > 0.85) hints.push(`${bf.name}: GRZ-Auslastung bei ${(usage * 100).toFixed(0)}% — wenig Spielraum`);
    }
  }

  if (!metrics.compliant) hints.push("⚠ Aktuelle Planung überschreitet zulässige GRZ/GFZ-Werte!");
  if (hints.length === 0) hints.push("Keine besonderen Hinweise — Planung innerhalb aller Parameter.");

  for (const h of hints) {
    doc.text(`•  ${h}`, 25, y);
    y += 6;
  }

  // Footer line
  y = pageH - 25;
  drawTealLine(doc, y);
  y += 6;
  doc.setFontSize(8);
  doc.setTextColor(100, 116, 139);
  doc.text("Generiert mit B-Plan Engine v0.1", 20, y);
  doc.text("Alle Angaben sind unverbindliche Richtwerte.", 20, y + 4);
  doc.text(`Datum: ${full}`, 20, y + 8);

  drawFooter(doc);

  // Save
  doc.save(`BPlan-Projektplan_${dateStamp().dateStr.replace(/\./g, "-")}.pdf`);
}
