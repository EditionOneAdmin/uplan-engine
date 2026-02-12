import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import type { Baufeld, PlacedUnit, BuildingModule, Filters, Metrics } from "./types";
import { calculateMatch } from "./matchScore";
import { BUILDINGS, SHAPE_CONFIG } from "./data";
import type { ExportConfig } from "./ExportModal";

// ── Colors ──
const TEAL = [13, 148, 136] as const;
const DARK = [30, 41, 59] as const;
const LIGHT_LINE = [226, 232, 240] as const;
const WHITE = [255, 255, 255] as const;
const AMBER = [245, 158, 11] as const;
const GREEN = [34, 197, 94] as const;
const RED = [239, 68, 68] as const;

// ── Helpers ──
const fmtNum = (n: number) => n.toLocaleString("de-DE");
const fmtEur = (n: number) => {
  if (n >= 1_000_000) return `${(n / 1_000_000).toLocaleString("de-DE", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} Mio. €`;
  if (n >= 1_000) return `${Math.round(n).toLocaleString("de-DE")} €`;
  return `${n.toLocaleString("de-DE")} €`;
};
const fmtPct = (n: number) => `${n.toFixed(1)}%`;

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
  doc.text("B-Plan Engine v0.2 · Build 024 · Alle Angaben sind unverbindliche Richtwerte.", 20, h - 10);
  doc.text(`Seite ${page}`, w - 20, h - 10, { align: "right" });
}

// ── Cost data interface ──
export interface CostData {
  kg100: number; kg200: number; kg300: number; kg500: number; kg700: number;
  finanz: number; gesamtkosten: number;
  ekBedarf: number; fkVolumen: number;
  bauzinsen: number; bereitstellungszinsen: number;
  annuitaetJahr: number; monatlicheRate: number;
  zinssatz: number; tilgung: number; ekQuote: number;
  bauzeit: number; gesamtlaufzeit: number;
  jahresmiete: number; verkaufserloes: number;
  mieteProM2: number; verkaufProM2: number;
  strategy: "hold" | "sell";
  niy: number; marge: number; cashOnCash: number;
  ekRenditeSell: number; irrSell: number; irrHold: number;
  dscr: number | null;
  grundstuecksanteil: number; baukostenProM2: number;
}

// ── Main export interface ──
export interface ExportData {
  baufelder: Baufeld[];
  placedUnits: PlacedUnit[];
  buildings: BuildingModule[];
  filters: Filters;
  metrics: Metrics;
  config: ExportConfig;
  costData?: CostData;
}

// ── Image helpers ──

async function loadImageAsBase64(url: string): Promise<string | null> {
  try {
    const absoluteUrl = url.startsWith("http") ? url : `${window.location.origin}${url}`;
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
        } catch {
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
      img.onerror = () => resolve(null);
      img.src = absoluteUrl;
    });
  } catch { return null; }
}

async function captureMap(): Promise<string | null> {
  try {
    const html2canvas = (await import("html2canvas")).default;
    const mapEl = document.querySelector(".leaflet-container") as HTMLElement;
    if (!mapEl) return null;
    const tileImages = mapEl.querySelectorAll("img.leaflet-tile");
    const originalSrcs: Map<HTMLImageElement, string> = new Map();
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
          } catch {}
        })());
      }
    });
    await Promise.allSettled(proxyPromises);
    const canvas = await html2canvas(mapEl, { useCORS: true, allowTaint: false, scale: 2, logging: false });
    originalSrcs.forEach((src, img) => { img.src = src; });
    return canvas.toDataURL("image/jpeg", 0.85);
  } catch {
    try {
      const html2canvas = (await import("html2canvas")).default;
      const mapEl = document.querySelector(".leaflet-container") as HTMLElement;
      if (!mapEl) return null;
      const canvas = await html2canvas(mapEl, { useCORS: false, allowTaint: true, scale: 2, logging: false });
      return canvas.toDataURL("image/jpeg", 0.85);
    } catch { return null; }
  }
}

// ── Mietspiegel data (same as CostCalculator) ──
const MIETSPIEGEL_NEUBAU: Record<string, { bis90: [number, number, number] }> = {
  einfach: { bis90: [9.52, 10.89, 12.26] },
  mittel:  { bis90: [10.48, 12.41, 14.34] },
  gut:     { bis90: [11.94, 14.57, 17.20] },
};

// ── KG colors for cost bars ──
const KG_COLORS: Record<string, readonly [number, number, number]> = {
  "KG 100": [59, 130, 246],
  "KG 200": [168, 85, 247],
  "KG 300+400": [245, 158, 11],
  "KG 500": [34, 197, 94],
  "KG 700": [239, 68, 68],
  "Finanz.": [251, 191, 36],
};

export async function exportProjectPlan(data: ExportData): Promise<void> {
  const { baufelder, placedUnits, buildings, filters, metrics, config, costData } = data;
  const { dateStr, full } = dateStamp();

  // Pre-load images
  const mapImage = config.lageplan ? await captureMap() : null;
  const renderingImages: Record<string, string> = {};
  if (config.gebaeudeSteckbriefe) {
    const seenIds = new Set<string>();
    for (const unit of placedUnits) {
      if (seenIds.has(unit.buildingId)) continue;
      seenIds.add(unit.buildingId);
      const building = buildings.find(b => b.id === unit.buildingId);
      if (building?.rendering) {
        const img = await loadImageAsBase64(building.rendering);
        if (img) renderingImages[building.id] = img;
      }
    }
  }

  const doc = new jsPDF({ orientation: "landscape", unit: "mm", format: "a4" });
  const W = doc.internal.pageSize.getWidth();
  const pageH = doc.internal.pageSize.getHeight();

  const totalCost = placedUnits.reduce((s, u) => {
    const b = buildings.find(bb => bb.id === u.buildingId);
    return s + (b ? b.pricePerSqm * u.area : 0);
  }, 0);

  let isFirstPage = true;
  function newPage() {
    if (!isFirstPage) {
      drawFooter(doc);
      doc.addPage();
    }
    isFirstPage = false;
    return 20;
  }

  // ═══════════════════════════════════════════════════════════
  // MODUL 1: Deckblatt
  // ═══════════════════════════════════════════════════════════
  if (config.deckblatt) {
    let y = newPage();

    // Header
    doc.setFontSize(22);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(...DARK);
    doc.text("B-Plan Engine", 20, y + 5);
    doc.setFontSize(14);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(...TEAL);
    doc.text(config.projektname, W - 20, y + 5, { align: "right" });
    drawTealLine(doc, y + 10);
    y += 22;

    // Projektübersicht
    doc.setFontSize(14);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(...DARK);
    doc.text("PROJEKTÜBERSICHT", 20, y);
    y += 10;

    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    const overviewItems = [
      ["Erstellt:", dateStr],
      ["Baufelder:", `${baufelder.length}`],
      ["Gebäude:", `${placedUnits.length}`],
      ["Wohneinheiten:", `${metrics.totalUnits}`],
    ];
    for (const [label, val] of overviewItems) {
      doc.setTextColor(100, 116, 139);
      doc.text(label, 25, y);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(...DARK);
      doc.text(val, 70, y);
      doc.setFont("helvetica", "normal");
      y += 7;
    }

    // Executive Summary
    if (costData) {
      y += 5;
      doc.setFillColor(241, 245, 249);
      doc.roundedRect(20, y - 3, W - 40, 28, 3, 3, "F");
      doc.setFontSize(10);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(...TEAL);
      doc.text("EXECUTIVE SUMMARY", 25, y + 3);
      doc.setFontSize(9);
      doc.setFont("helvetica", "normal");
      doc.setTextColor(...DARK);
      doc.text(`Gesamtkosten: ${fmtEur(costData.gesamtkosten)}  ·  Strategie: ${costData.strategy === "hold" ? "Hold (Miete)" : "Sell (Verkauf)"}`, 25, y + 10);
      const kpiLine = costData.strategy === "hold"
        ? `NIY: ${fmtPct(costData.niy)}  ·  Cash-on-Cash: ${fmtPct(costData.cashOnCash)}  ·  DSCR: ${costData.dscr !== null ? costData.dscr.toFixed(2) + "×" : "—"}`
        : `Marge: ${fmtPct(costData.marge)}  ·  EK-Rendite: ${fmtPct(costData.ekRenditeSell)}  ·  IRR: ${fmtPct(costData.irrSell)}`;
      doc.text(kpiLine, 25, y + 17);
      y += 32;
    }

    // Gesamtkennzahlen
    y += 3;
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
        `${(metrics.grzUsage * 100).toFixed(0)}%`,
        `${(metrics.gfzUsage * 100).toFixed(0)}%`,
        `${metrics.parkingNeeded}`,
        `${metrics.totalUnits}`,
        costData ? fmtEur(costData.gesamtkosten) : (totalCost >= 1_000_000 ? `~${fmtEur(totalCost)}` : fmtEur(totalCost)),
        metrics.compliant ? "✓ Konform" : "✗ Überschreitung",
      ]],
      didParseCell(data) {
        if (data.section === "body" && data.column.index === 6) {
          data.cell.styles.textColor = metrics.compliant ? [34, 197, 94] : [239, 68, 68];
          data.cell.styles.fontStyle = "bold";
        }
      },
    });

    y = (doc as any).lastAutoTable.finalY + 10;

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
      return [`${i + 1}`, bf.name, bf.type, `${fmtNum(bf.grundstuecksflaecheM2)}`, grz.toFixed(2), gfz.toFixed(2), `${bfUnits.length}`];
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
    }

    drawFooter(doc);
  }

  // ═══════════════════════════════════════════════════════════
  // MODUL 2: Lageplan
  // ═══════════════════════════════════════════════════════════
  if (config.lageplan && mapImage) {
    let y = newPage();

    doc.setFontSize(14);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(...DARK);
    doc.text("LAGEPLAN", 20, y);
    y += 8;

    const mapW = W - 40;
    const mapH = pageH - y - 30;
    try {
      doc.addImage(mapImage, "JPEG", 20, y, mapW, mapH);
    } catch { /* skip */ }

    // Legende
    const legY = y + mapH + 4;
    doc.setFontSize(7);
    doc.setTextColor(100, 116, 139);
    doc.text(`Lageplan — Generiert am ${full}  ·  ${baufelder.length} Baufelder  ·  ${placedUnits.length} Gebäude`, 20, legY);

    drawFooter(doc);
  }

  // ═══════════════════════════════════════════════════════════
  // MODUL 3: Baufeld-Details
  // ═══════════════════════════════════════════════════════════
  if (config.baufeldDetails) {
    let y = newPage();

    doc.setFontSize(14);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(...DARK);
    doc.text("BAUFELD-DETAILS", 20, y);
    y += 4;

    const rows = baufelder.map((bf, i) => {
      const brw = bf.borisBodenrichtwert || 0;
      const grundPreis = brw * bf.grundstuecksflaecheM2;
      return [
        `${i + 1}`,
        bf.name,
        bf.type,
        `${fmtNum(bf.grundstuecksflaecheM2)} m²`,
        `${bf.maxGRZ} / ${bf.maxGFZ}`,
        `${bf.maxGeschosse}`,
        bf.nutzung,
        brw > 0 ? `${fmtNum(brw)} €/m²` : "—",
        grundPreis > 0 ? fmtEur(grundPreis) : "—",
      ];
    });

    if (rows.length > 0) {
      autoTable(doc, {
        startY: y,
        margin: { left: 20, right: 20 },
        theme: "grid",
        styles: { fontSize: 8, cellPadding: 3, textColor: DARK as any, lineColor: LIGHT_LINE as any, lineWidth: 0.3 },
        headStyles: { fillColor: TEAL as any, textColor: WHITE as any, fontStyle: "bold", fontSize: 8 },
        head: [["Nr", "Name", "Typ", "Fläche", "GRZ/GFZ", "Gesch.", "Nutzung", "BRW", "Grundst.preis"]],
        body: rows,
        columnStyles: {
          0: { cellWidth: 12, halign: "center" },
          2: { cellWidth: 14, halign: "center" },
          4: { cellWidth: 22, halign: "center" },
          5: { cellWidth: 14, halign: "center" },
          7: { cellWidth: 28, halign: "right" },
          8: { cellWidth: 30, halign: "right" },
        },
      });
      y = (doc as any).lastAutoTable.finalY + 10;
    }

    // Coordinates
    doc.setFontSize(10);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(...DARK);
    doc.text("KOORDINATEN", 20, y);
    y += 6;
    doc.setFontSize(8);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(100, 116, 139);
    for (const bf of baufelder) {
      if (bf.coordinates.length > 0) {
        const cLat = bf.coordinates.reduce((s, c) => s + c[0], 0) / bf.coordinates.length;
        const cLng = bf.coordinates.reduce((s, c) => s + c[1], 0) / bf.coordinates.length;
        doc.text(`${bf.name}: ${cLat.toFixed(6)}, ${cLng.toFixed(6)}`, 25, y);
        y += 5;
        if (y > pageH - 30) { drawFooter(doc); doc.addPage(); y = 20; }
      }
    }

    drawFooter(doc);
  }

  // ═══════════════════════════════════════════════════════════
  // MODUL 4: Mietspiegel
  // ═══════════════════════════════════════════════════════════
  if (config.mietspiegel) {
    let y = newPage();

    doc.setFontSize(14);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(...DARK);
    doc.text("MIETSPIEGEL NEUBAU (BERLIN)", 20, y);
    y += 4;

    doc.setFontSize(9);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(100, 116, 139);
    doc.text("Nettokaltmiete €/m²/Monat · Wohnungen bis 90 m² · Erstbezug ab 2019", 20, y + 4);
    y += 10;

    // Wohnlage per Baufeld
    const wohnlagen = baufelder.map(bf => ({
      name: bf.name,
      wohnlage: bf.wohnlage || "mittel",
      brw: bf.borisBodenrichtwert || 0,
    }));

    if (wohnlagen.length > 0) {
      doc.setFontSize(10);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(...DARK);
      doc.text("Wohnlagen der Baufelder:", 20, y);
      y += 6;
      doc.setFontSize(9);
      doc.setFont("helvetica", "normal");
      for (const w of wohnlagen) {
        doc.setTextColor(...DARK);
        doc.text(`${w.name}: ${w.wohnlage.charAt(0).toUpperCase() + w.wohnlage.slice(1)}`, 25, y);
        if (w.brw > 0) {
          doc.setTextColor(100, 116, 139);
          doc.text(`(BRW: ${fmtNum(w.brw)} €/m²)`, 90, y);
        }
        y += 6;
      }
      y += 4;
    }

    // Mietspiegel table
    autoTable(doc, {
      startY: y,
      margin: { left: 20, right: 20 },
      theme: "grid",
      styles: { fontSize: 9, cellPadding: 4, textColor: DARK as any, lineColor: LIGHT_LINE as any, lineWidth: 0.3 },
      headStyles: { fillColor: TEAL as any, textColor: WHITE as any, fontStyle: "bold", fontSize: 9 },
      head: [["Wohnlage", "Unterer Wert", "Mittelwert", "Oberer Wert"]],
      body: [
        ["Einfach", "9,52 €", "10,89 €", "12,26 €"],
        ["Mittel", "10,48 €", "12,41 €", "14,34 €"],
        ["Gut", "11,94 €", "14,57 €", "17,20 €"],
      ],
      columnStyles: {
        1: { halign: "right" },
        2: { halign: "right", fontStyle: "bold" },
        3: { halign: "right" },
      },
      didParseCell(data) {
        // Highlight the row matching primary baufeld wohnlage
        const primaryWl = (baufelder[0]?.wohnlage || "mittel").toLowerCase();
        const rowMap = ["einfach", "mittel", "gut"];
        if (data.section === "body" && rowMap[data.row.index] === primaryWl) {
          data.cell.styles.fillColor = [209, 250, 229];
        }
      },
    });

    y = (doc as any).lastAutoTable.finalY + 10;

    // Bodenrichtwert overview
    if (baufelder.some(bf => bf.borisBodenrichtwert)) {
      doc.setFontSize(12);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(...DARK);
      doc.text("BODENRICHTWERT-ÜBERSICHT", 20, y);
      y += 4;

      const brwRows = baufelder.filter(bf => bf.borisBodenrichtwert).map(bf => [
        bf.name,
        `${fmtNum(bf.borisBodenrichtwert!)} €/m²`,
        `${fmtNum(bf.grundstuecksflaecheM2)} m²`,
        fmtEur(bf.borisBodenrichtwert! * bf.grundstuecksflaecheM2),
      ]);

      autoTable(doc, {
        startY: y,
        margin: { left: 20, right: 20 },
        theme: "grid",
        styles: { fontSize: 9, cellPadding: 3, textColor: DARK as any, lineColor: LIGHT_LINE as any, lineWidth: 0.3 },
        headStyles: { fillColor: TEAL as any, textColor: WHITE as any, fontStyle: "bold", fontSize: 9 },
        head: [["Baufeld", "BRW €/m²", "Fläche", "Grundstückswert"]],
        body: brwRows,
        columnStyles: {
          1: { halign: "right" },
          2: { halign: "right" },
          3: { halign: "right", fontStyle: "bold" },
        },
      });
    }

    drawFooter(doc);
  }

  // ═══════════════════════════════════════════════════════════
  // MODUL 5: Gebäude-Steckbriefe
  // ═══════════════════════════════════════════════════════════
  if (config.gebaeudeSteckbriefe) {
    let y = newPage();

    doc.setFontSize(14);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(...DARK);
    doc.text("GEBÄUDE-DETAILS", 20, y);
    y += 4;

    // Summary table
    const totalBGFAll = placedUnits.reduce((s, u) => s + u.area, 0);
    const totalUnitsAll = placedUnits.reduce((s, u) => s + u.units, 0);

    const gebRows = placedUnits.map((u, i) => {
      const b = buildings.find(bb => bb.id === u.buildingId);
      if (!b) return [`${i + 1}`, "?", "", "", "", "", "", ""];
      const cost = b.pricePerSqm * u.area;
      const shape = SHAPE_CONFIG[b.shape]?.icon || "";
      return [`${i + 1}`, `${b.manufacturerLabel} ${b.name}`, b.manufacturerLabel, shape, `${u.geschosse}`, `${u.units}`, fmtNum(u.area), fmtEur(cost)];
    });
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
          if (data.section === "body" && data.row.index === gebRows.length - 1) {
            data.cell.styles.fontStyle = "bold";
            data.cell.styles.fillColor = [241, 245, 249];
          }
        },
      });
      y = (doc as any).lastAutoTable.finalY + 10;
    }

    // Per-building details with renderings
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
      const hasRendering = !!renderingImages[b.id];
      const neededSpace = hasRendering ? 65 : 45;
      if (y > pageH - neededSpace) { drawFooter(doc); doc.addPage(); y = 20; }

      doc.setFontSize(10);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(...TEAL);
      doc.text(`Gebäude ${i + 1}: ${b.manufacturerLabel} ${b.name}`, 25, y);
      y += 5;

      const renderingStartY = y;
      if (hasRendering) {
        try { doc.addImage(renderingImages[b.id], "JPEG", 25, y, 60, 40); } catch {}
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

      if (hasRendering) y = Math.max(y, renderingStartY + 46);
      y += 4;
    }

    drawFooter(doc);
  }

  // ═══════════════════════════════════════════════════════════
  // MODUL 6: Kostenaufstellung DIN 276
  // ═══════════════════════════════════════════════════════════
  if (config.kostenaufstellung && costData) {
    let y = newPage();

    doc.setFontSize(14);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(...DARK);
    doc.text("KOSTENAUFSTELLUNG (DIN 276)", 20, y);
    y += 4;

    const kgItems: [string, string, number][] = [
      ["KG 100", "Grundstück & Grunderwerb", costData.kg100],
      ["KG 200", "Herrichten & Erschließen", costData.kg200],
      ["KG 300+400", "Gebäude + Technische Anlagen", costData.kg300],
      ["KG 500", "Außenanlagen", costData.kg500],
      ["KG 700", "Baunebenkosten", costData.kg700],
      ["Finanz.", "Bauzeitfinanzierung", costData.finanz],
    ];

    const kgRows = kgItems.map(([kg, bez, val]) => [
      kg, bez, fmtEur(val), costData.gesamtkosten > 0 ? fmtPct((val / costData.gesamtkosten) * 100) : "—",
    ]);
    kgRows.push(["", "GESAMTKOSTEN", fmtEur(costData.gesamtkosten), "100,0%"]);

    autoTable(doc, {
      startY: y,
      margin: { left: 20, right: 20 },
      theme: "grid",
      styles: { fontSize: 10, cellPadding: 4, textColor: DARK as any, lineColor: LIGHT_LINE as any, lineWidth: 0.3 },
      headStyles: { fillColor: TEAL as any, textColor: WHITE as any, fontStyle: "bold", fontSize: 9 },
      head: [["KG", "Bezeichnung", "Betrag", "Anteil"]],
      body: kgRows,
      columnStyles: {
        0: { cellWidth: 25, halign: "center" },
        2: { cellWidth: 45, halign: "right" },
        3: { cellWidth: 25, halign: "right" },
      },
      didParseCell(data) {
        if (data.section === "body" && data.row.index === kgRows.length - 1) {
          data.cell.styles.fontStyle = "bold";
          data.cell.styles.fillColor = [241, 245, 249];
        }
      },
    });

    y = (doc as any).lastAutoTable.finalY + 12;

    // Visual cost bars
    doc.setFontSize(10);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(...DARK);
    doc.text("KOSTENVERTEILUNG", 20, y);
    y += 8;

    const barMaxW = W - 80;
    const maxVal = Math.max(...kgItems.map(k => k[2]));

    for (const [kg, , val] of kgItems) {
      if (val <= 0) continue;
      const barW = maxVal > 0 ? (val / maxVal) * barMaxW : 0;
      const color = KG_COLORS[kg] || TEAL;

      doc.setFontSize(8);
      doc.setFont("helvetica", "normal");
      doc.setTextColor(...DARK);
      doc.text(kg, 20, y + 3);

      doc.setFillColor(color[0], color[1], color[2]);
      doc.roundedRect(50, y - 1, barW, 5, 1, 1, "F");

      doc.setFontSize(7);
      doc.setTextColor(100, 116, 139);
      doc.text(fmtEur(val), 50 + barW + 3, y + 3);

      y += 9;
    }

    drawFooter(doc);
  }

  // ═══════════════════════════════════════════════════════════
  // MODUL 7: Finanzierungsmodell
  // ═══════════════════════════════════════════════════════════
  if (config.finanzierung && costData) {
    let y = newPage();

    doc.setFontSize(14);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(...DARK);
    doc.text("FINANZIERUNGSMODELL", 20, y);
    y += 4;

    // Parameters
    const paramRows = [
      ["Eigenkapitalquote", fmtPct(costData.ekQuote)],
      ["Fremdkapitalquote", fmtPct(100 - costData.ekQuote)],
      ["Zinssatz p.a.", fmtPct(costData.zinssatz)],
      ["Tilgung p.a.", fmtPct(costData.tilgung)],
      ["Bauzeit", `${costData.bauzeit} Monate`],
      ["Gesamtlaufzeit", `${costData.gesamtlaufzeit} Monate`],
    ];

    autoTable(doc, {
      startY: y,
      margin: { left: 20, right: W / 2 },
      theme: "grid",
      styles: { fontSize: 10, cellPadding: 4, textColor: DARK as any, lineColor: LIGHT_LINE as any, lineWidth: 0.3 },
      headStyles: { fillColor: AMBER as any, textColor: WHITE as any, fontStyle: "bold", fontSize: 9 },
      head: [["Parameter", "Wert"]],
      body: paramRows,
      columnStyles: { 1: { halign: "right", fontStyle: "bold" } },
    });

    // Calculations table on right side
    const calcRows = [
      ["EK-Bedarf", fmtEur(costData.ekBedarf)],
      ["FK-Volumen", fmtEur(costData.fkVolumen)],
      ["Bauzinsen", fmtEur(costData.bauzinsen)],
      ["Bereitstellungszinsen", fmtEur(costData.bereitstellungszinsen)],
      ["Finanzierungskosten Bau", fmtEur(costData.finanz)],
      ["Annuität / Jahr", fmtEur(costData.annuitaetJahr)],
      ["Monatliche Rate", fmtEur(costData.monatlicheRate)],
    ];

    const leftTableY = y;
    autoTable(doc, {
      startY: leftTableY,
      margin: { left: W / 2 + 5, right: 20 },
      theme: "grid",
      styles: { fontSize: 10, cellPadding: 4, textColor: DARK as any, lineColor: LIGHT_LINE as any, lineWidth: 0.3 },
      headStyles: { fillColor: TEAL as any, textColor: WHITE as any, fontStyle: "bold", fontSize: 9 },
      head: [["Berechnung", "Wert"]],
      body: calcRows,
      columnStyles: { 1: { halign: "right", fontStyle: "bold" } },
    });

    drawFooter(doc);
  }

  // ═══════════════════════════════════════════════════════════
  // MODUL 8: Wirtschaftlichkeit
  // ═══════════════════════════════════════════════════════════
  if (config.wirtschaftlichkeit && costData) {
    let y = newPage();

    doc.setFontSize(14);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(...DARK);
    doc.text("WIRTSCHAFTLICHKEITSANALYSE", 20, y);
    y += 10;

    const halfW = (W - 50) / 2;

    // Hold column
    doc.setFillColor(209, 250, 229);
    doc.roundedRect(20, y, halfW, 60, 3, 3, "F");
    doc.setFontSize(11);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(...DARK);
    doc.text("🏠 HOLD-SZENARIO (Miete)", 25, y + 8);
    doc.setFontSize(9);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(71, 85, 105);

    let hy = y + 16;
    const holdKPIs = [
      [`Net Initial Yield (NIY)`, fmtPct(costData.niy)],
      [`Cash-on-Cash`, fmtPct(costData.cashOnCash)],
      [`DSCR`, costData.dscr !== null ? `${costData.dscr.toFixed(2)}×` : "—"],
      [`IRR (adj.)`, fmtPct(costData.irrHold)],
      [`Jahresmiete`, fmtEur(costData.jahresmiete)],
      [`Miete/m²`, `${costData.mieteProM2.toFixed(2)} €/m²/Mo`],
    ];
    for (const [l, v] of holdKPIs) {
      doc.text(l, 25, hy);
      doc.setFont("helvetica", "bold");
      doc.text(v, 20 + halfW - 5, hy, { align: "right" });
      doc.setFont("helvetica", "normal");
      hy += 7;
    }

    // Sell column
    const sx = 20 + halfW + 10;
    doc.setFillColor(254, 243, 199);
    doc.roundedRect(sx, y, halfW, 60, 3, 3, "F");
    doc.setFontSize(11);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(...DARK);
    doc.text("💰 SELL-SZENARIO (Verkauf)", sx + 5, y + 8);
    doc.setFontSize(9);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(71, 85, 105);

    let sy = y + 16;
    const sellKPIs = [
      [`Marge`, fmtPct(costData.marge)],
      [`EK-Rendite`, fmtPct(costData.ekRenditeSell)],
      [`IRR (ann.)`, fmtPct(costData.irrSell)],
      [`Verkaufserlös`, fmtEur(costData.verkaufserloes)],
      [`Verkauf/m²`, `${Math.round(costData.verkaufProM2).toLocaleString("de-DE")} €/m²`],
    ];
    for (const [l, v] of sellKPIs) {
      doc.text(l, sx + 5, sy);
      doc.setFont("helvetica", "bold");
      doc.text(v, sx + halfW - 5, sy, { align: "right" });
      doc.setFont("helvetica", "normal");
      sy += 7;
    }

    y += 70;

    // Erlöse vs Kosten summary
    doc.setFontSize(12);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(...DARK);
    doc.text("ZUSAMMENFASSUNG", 20, y);
    y += 4;

    const summaryRows = [
      ["Gesamtkosten", fmtEur(costData.gesamtkosten)],
      ["Jahresmiete (Hold)", fmtEur(costData.jahresmiete)],
      ["Verkaufserlös (Sell)", fmtEur(costData.verkaufserloes)],
      ["Grundstücksanteil", fmtPct(costData.grundstuecksanteil)],
      ["Baukosten/m²", `${Math.round(costData.baukostenProM2).toLocaleString("de-DE")} €/m²`],
      ["Gewählte Strategie", costData.strategy === "hold" ? "Hold (Miete)" : "Sell (Verkauf)"],
    ];

    autoTable(doc, {
      startY: y,
      margin: { left: 20, right: 20 },
      theme: "grid",
      styles: { fontSize: 10, cellPadding: 4, textColor: DARK as any, lineColor: LIGHT_LINE as any, lineWidth: 0.3 },
      headStyles: { fillColor: TEAL as any, textColor: WHITE as any, fontStyle: "bold", fontSize: 9 },
      head: [["Kennzahl", "Wert"]],
      body: summaryRows,
      columnStyles: { 1: { halign: "right", fontStyle: "bold" } },
    });

    drawFooter(doc);
  }

  // ═══════════════════════════════════════════════════════════
  // MODUL 9: Hinweise
  // ═══════════════════════════════════════════════════════════
  if (config.hinweise) {
    let y = newPage();

    doc.setFontSize(14);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(...DARK);
    doc.text("HINWEISE & EMPFEHLUNGEN", 20, y);
    y += 8;

    doc.setFontSize(9);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(71, 85, 105);

    const hints: string[] = [];

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
      if (!bf.borisBodenrichtwert) hints.push(`${bf.name}: Kein BORIS-Bodenrichtwert verfügbar — Grundstückskosten ggf. unvollständig`);
    }

    if (!metrics.compliant) hints.push("⚠ Aktuelle Planung überschreitet zulässige GRZ/GFZ-Werte!");

    if (costData) {
      if (costData.dscr !== null && costData.dscr < 1.2) hints.push("⚠ DSCR unter 1,2 — Bankfinanzierung könnte schwierig werden");
      if (costData.niy < 3.5) hints.push("⚠ NIY unter 3,5% — geringe Mietrendite");
      if (costData.marge < 10) hints.push("⚠ Entwicklermarge unter 10% — geringer Verkaufspuffer");
    }

    if (hints.length === 0) hints.push("Keine besonderen Hinweise — Planung innerhalb aller Parameter.");

    for (const h of hints) {
      doc.text(`•  ${h}`, 25, y);
      y += 6;
    }

    // Disclaimer
    y += 10;
    drawTealLine(doc, y);
    y += 8;
    doc.setFontSize(8);
    doc.setTextColor(100, 116, 139);
    doc.text("HAFTUNGSAUSSCHLUSS", 20, y);
    y += 5;
    doc.setFontSize(7);
    const disclaimer = [
      "Dieses Dokument wurde automatisch mit der B-Plan Engine generiert und dient ausschließlich zu Planungszwecken.",
      "Alle Angaben zu Kosten, Mieten, Renditen und Bodenrichtwerten sind unverbindliche Richtwerte und Schätzungen.",
      "Die tatsächlichen Werte können erheblich abweichen. Für verbindliche Kalkulationen wenden Sie sich an einen Fachplaner.",
      "Mietspiegel-Daten basieren auf dem Berliner Mietspiegel für Neubauwohnungen (Erstbezug ab 2019).",
      "Bodenrichtwerte stammen aus dem BORIS-Berlin System und können sich ändern.",
    ];
    for (const line of disclaimer) {
      doc.text(line, 20, y);
      y += 4;
    }

    y += 6;
    doc.setFontSize(8);
    doc.text(`Generiert am ${full}  ·  B-Plan Engine v0.2 · Build 024`, 20, y);

    drawFooter(doc);
  }

  // Save
  const filename = `${config.projektname.replace(/[^a-zA-Z0-9äöüÄÖÜß\-_ ]/g, "").replace(/\s+/g, "-")}_${dateStamp().dateStr.replace(/\./g, "-")}.pdf`;
  doc.save(filename);
}
