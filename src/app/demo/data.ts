import type { Baufeld, FloorplanType } from "./types";

// Baufelder start empty — users draw their own
export const BAUFELDER: Baufeld[] = [];

export const FLOORPLANS: FloorplanType[] = [
  { id: "a", name: "Typ A", label: "Studio", area: 35, rooms: 1 },
  { id: "b", name: "Typ B", label: "Compact", area: 45, rooms: 2 },
  { id: "c", name: "Typ C", label: "Standard", area: 65, rooms: 3 },
  { id: "d", name: "Typ D", label: "Family", area: 85, rooms: 4 },
  { id: "e", name: "Typ E", label: "Premium", area: 110, rooms: 4 },
  { id: "f", name: "Typ F", label: "Penthouse", area: 140, rooms: 5 },
];
