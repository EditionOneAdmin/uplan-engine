import type { BuildingModule, Baufeld, Filters } from "./types";

export interface MatchResult {
  score: number;
  maxScore: number;
  criteria: MatchCriterion[];
}

export interface MatchCriterion {
  name: string;
  label: string;
  points: number;
  maxPoints: number;
  status: "pass" | "warn" | "fail";
  detail: string;
}

export function calculateMatch(
  building: BuildingModule,
  baufeld: Baufeld,
  filters: Filters,
  geschosse: number
): MatchResult {
  const criteria: MatchCriterion[] = [];

  // 1. Geschosse (2 points)
  const diff = geschosse - baufeld.maxGeschosse;
  if (diff <= 0) {
    criteria.push({ name: "geschosse", label: "Geschosse", points: 2, maxPoints: 2, status: "pass", detail: `${geschosse} ≤ ${baufeld.maxGeschosse} max` });
  } else if (diff === 1) {
    criteria.push({ name: "geschosse", label: "Geschosse", points: 1, maxPoints: 2, status: "warn", detail: `${geschosse} (max ${baufeld.maxGeschosse}, +1)` });
  } else {
    criteria.push({ name: "geschosse", label: "Geschosse", points: 0, maxPoints: 2, status: "fail", detail: `${geschosse} > ${baufeld.maxGeschosse} max (+${diff})` });
  }

  // 2. GRZ (2 points)
  const footprintArea = building.footprint.width * building.footprint.depth;
  const actualGRZ = footprintArea / baufeld.grundstuecksflaecheM2;
  const grzRatio = actualGRZ / baufeld.maxGRZ;
  if (grzRatio <= 1) {
    criteria.push({ name: "grz", label: "GRZ", points: 2, maxPoints: 2, status: "pass", detail: `${actualGRZ.toFixed(2)} ≤ ${baufeld.maxGRZ.toFixed(2)} max` });
  } else if (grzRatio <= 1.1) {
    criteria.push({ name: "grz", label: "GRZ", points: 1, maxPoints: 2, status: "warn", detail: `${actualGRZ.toFixed(2)} (max ${baufeld.maxGRZ.toFixed(2)}, +${((grzRatio - 1) * 100).toFixed(0)}%)` });
  } else {
    criteria.push({ name: "grz", label: "GRZ", points: 0, maxPoints: 2, status: "fail", detail: `${actualGRZ.toFixed(2)} > ${baufeld.maxGRZ.toFixed(2)} max` });
  }

  // 3. Dachform (2 points)
  const roofFilterMap: Record<string, string> = { kfw40: "flat", passivhaus: "flat", geg: "any" };
  // Use efficiency filter as proxy for roof requirement
  const requiredRoof = filters.efficiency === "passivhaus" ? "flat" : null;
  if (!requiredRoof) {
    criteria.push({ name: "dach", label: "Dach", points: 2, maxPoints: 2, status: "pass", detail: "Keine Vorgabe" });
  } else if (building.roofOptions.includes(requiredRoof as any)) {
    criteria.push({ name: "dach", label: "Dach", points: 2, maxPoints: 2, status: "pass", detail: `Flachdach ✓` });
  } else {
    criteria.push({ name: "dach", label: "Dach", points: 0, maxPoints: 2, status: "fail", detail: `Kein Flachdach (B-Plan: Flachdach)` });
  }

  // 4. Energiestandard (2 points)
  if (filters.efficiency === "kfw40" || filters.efficiency === "passivhaus") {
    if (building.energyRating === "A+" || building.energyRating === "A") {
      criteria.push({ name: "energie", label: "Energie", points: 2, maxPoints: 2, status: "pass", detail: `${building.energyRating} (KfW40 ✓)` });
    } else if (building.energyRating === "B") {
      criteria.push({ name: "energie", label: "Energie", points: 1, maxPoints: 2, status: "warn", detail: `${building.energyRating} (KfW40 ⚠)` });
    } else {
      criteria.push({ name: "energie", label: "Energie", points: 0, maxPoints: 2, status: "fail", detail: `${building.energyRating} (KfW40 ✗)` });
    }
  } else {
    criteria.push({ name: "energie", label: "Energie", points: 2, maxPoints: 2, status: "pass", detail: `${building.energyRating} (GEG ✓)` });
  }

  // 5. Nutzungstyp (2 points)
  const bfType = baufeld.type;
  const tags = building.tags;
  if (bfType === "WA") {
    const hasWohnen = tags.some(t => ["wohnen", "barrierefrei", "eigentum", "reihenbau", "innenhof"].includes(t));
    if (hasWohnen) {
      criteria.push({ name: "nutzung", label: "Nutzung", points: 2, maxPoints: 2, status: "pass", detail: `Wohnen (WA ✓)` });
    } else {
      // Default: residential buildings are fine for WA
      criteria.push({ name: "nutzung", label: "Nutzung", points: 2, maxPoints: 2, status: "pass", detail: `Wohnen (WA ✓)` });
    }
  } else if (bfType === "MI") {
    criteria.push({ name: "nutzung", label: "Nutzung", points: 1, maxPoints: 2, status: "warn", detail: `Mischgebiet (MI)` });
  } else if (bfType === "GE") {
    const hasGewerbe = tags.some(t => ["gewerbe", "stahl", "modulbau", "systembau"].includes(t));
    if (hasGewerbe) {
      criteria.push({ name: "nutzung", label: "Nutzung", points: 2, maxPoints: 2, status: "pass", detail: `Gewerbe (GE ✓)` });
    } else {
      criteria.push({ name: "nutzung", label: "Nutzung", points: 0, maxPoints: 2, status: "fail", detail: `Kein Gewerbe (GE ✗)` });
    }
  } else {
    criteria.push({ name: "nutzung", label: "Nutzung", points: 1, maxPoints: 2, status: "warn", detail: `Sondergebiet (SO)` });
  }

  const score = criteria.reduce((s, c) => s + c.points, 0);
  return { score, maxScore: 10, criteria };
}

export function getScoreColor(score: number): string {
  if (score >= 8) return "#22C55E";
  if (score >= 5) return "#EAB308";
  return "#EF4444";
}

export function getScoreIcon(score: number): string {
  if (score >= 8) return "✓";
  if (score >= 5) return "⚠";
  return "✗";
}

export function getCriterionIcon(status: "pass" | "warn" | "fail"): string {
  if (status === "pass") return "✓";
  if (status === "warn") return "⚠";
  return "✗";
}

export function getCriterionColor(status: "pass" | "warn" | "fail"): string {
  if (status === "pass") return "#22C55E";
  if (status === "warn") return "#EAB308";
  return "#EF4444";
}
