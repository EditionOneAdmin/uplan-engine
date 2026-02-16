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
  borisBodenrichtwert?: number;
  wohnlage?: string;
  bezirk?: string;
}

export type BuildingShape = "riegel" | "l-winkel" | "u-form" | "punkthaus" | "t-form" | "doppelhaus";
export type Manufacturer = "gropyus" | "nokera" | "alho" | "goldbeck" | "max-boegl";
export type RoofType = "flat" | "saddle" | "pult";
export type FacadeType = "putz" | "klinker" | "holz" | "metall";
export type EnergyRating = "A+" | "A" | "B" | "C";

export interface BuildingModule {
  id: string;
  name: string;
  manufacturer: Manufacturer;
  manufacturerLabel: string;
  shape: BuildingShape;
  shapeLabel: string;
  footprint: { width: number; depth: number };
  minGeschosse: number;
  maxGeschosse: number;
  defaultGeschosse: number;
  wePerGeschoss: number;
  bgfPerGeschoss: number;
  roofOptions: RoofType[];
  facadeOptions: FacadeType[];
  energyRating: EnergyRating;
  pricePerSqm: number;
  tags: string[];
  color: string;
  rendering?: string;
}

export interface PlacedUnit {
  id: string;
  baufeldId: string;
  buildingId: string;
  geschosse: number;
  roofType: RoofType;
  facade: FacadeType;
  area: number;
  units: number;
  position: [number, number];    // [lat, lng]
  rotation: number;              // degrees 0-360
  wfEffizienz: number;
}

export interface Filters {
  manufacturer: Manufacturer | "all";
  shape: BuildingShape | "all";
  minGeschosse: number;
  maxGeschosse: number;
  strategy: "hold" | "sell";
  energy: "fernwaerme" | "waermepumpe" | "gas";
  efficiency: "geg" | "kfw40" | "passivhaus";
  targetMode: "off" | "miete" | "verkauf";
  targetValue: number; // €/m² (Miete monatlich or Verkaufserlös)
}

export interface Metrics {
  totalBGF: number;
  totalUnits: number;
  parkingNeeded: number;
  grzUsage: number;
  gfzUsage: number;
  compliant: boolean;
  totalWohnflaeche: number;
}
