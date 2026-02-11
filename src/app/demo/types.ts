export interface Baufeld {
  id: string;
  name: string;
  type: "WA" | "MI" | "GE" | "SO";
  typeLabel: string;
  color: string;
  fillColor: string;
  coordinates: [number, number][];
  maxGRZ: number;
  maxGFZ: number;
  maxGeschosse: number;
  nutzung: string;
  grundstuecksflaecheM2: number;
}

export interface FloorplanType {
  id: string;
  name: string;
  label: string;
  area: number;
  rooms: number;
  disabled?: boolean;
}

export interface PlacedUnit {
  id: string;
  baufeldId: string;
  floorplanId: string;
  area: number;
  rooms: number;
}

export interface Filters {
  minArea: number;
  maxArea: number;
  strategy: "hold" | "sell";
  roofType: "flat" | "saddle" | "pult";
  energy: "fernwaerme" | "waermepumpe" | "gas";
  efficiency: "geg" | "kfw40" | "passivhaus";
}

export interface Metrics {
  totalBGF: number;
  totalUnits: number;
  parkingNeeded: number;
  grzUsage: number;
  gfzUsage: number;
  compliant: boolean;
}
