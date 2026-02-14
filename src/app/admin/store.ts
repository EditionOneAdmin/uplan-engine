"use client";
import { create } from "zustand";
import type { BuildingModule, Manufacturer } from "../demo/types";
import { BUILDINGS, MANUFACTURERS } from "../demo/data";

export interface ManufacturerData {
  id: Manufacturer;
  label: string;
  color: string;
  accent: string;
}

interface AdminState {
  authenticated: boolean;
  buildings: BuildingModule[];
  manufacturers: ManufacturerData[];
  login: (pw: string) => boolean;
  logout: () => void;
  setBuildings: (b: BuildingModule[]) => void;
  addBuilding: (b: BuildingModule) => void;
  updateBuilding: (id: string, b: BuildingModule) => void;
  deleteBuilding: (id: string) => void;
  setManufacturers: (m: ManufacturerData[]) => void;
  addManufacturer: (m: ManufacturerData) => void;
  updateManufacturer: (id: Manufacturer, m: ManufacturerData) => void;
  deleteManufacturer: (id: Manufacturer) => void;
  hydrate: () => void;
}

const STORAGE_KEY_B = "bpe-admin-buildings";
const STORAGE_KEY_M = "bpe-admin-manufacturers";
const AUTH_KEY = "bpe-admin-auth";

function loadJSON<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch { return fallback; }
}
function saveJSON(key: string, data: unknown) {
  if (typeof window !== "undefined") localStorage.setItem(key, JSON.stringify(data));
}

function defaultManufacturers(): ManufacturerData[] {
  return (Object.entries(MANUFACTURERS) as [Manufacturer, { label: string; color: string; accent: string }][]).map(
    ([id, v]) => ({ id, ...v })
  );
}

export const useAdminStore = create<AdminState>((set, get) => ({
  authenticated: false,
  buildings: [],
  manufacturers: [],
  login: (pw) => {
    if (pw === "Bau-Turbo") {
      localStorage.setItem(AUTH_KEY, "1");
      set({ authenticated: true });
      return true;
    }
    return false;
  },
  logout: () => { localStorage.removeItem(AUTH_KEY); set({ authenticated: false }); },
  setBuildings: (b) => { set({ buildings: b }); saveJSON(STORAGE_KEY_B, b); },
  addBuilding: (b) => { const n = [...get().buildings, b]; set({ buildings: n }); saveJSON(STORAGE_KEY_B, n); },
  updateBuilding: (id, b) => { const n = get().buildings.map((x) => x.id === id ? b : x); set({ buildings: n }); saveJSON(STORAGE_KEY_B, n); },
  deleteBuilding: (id) => { const n = get().buildings.filter((x) => x.id !== id); set({ buildings: n }); saveJSON(STORAGE_KEY_B, n); },
  setManufacturers: (m) => { set({ manufacturers: m }); saveJSON(STORAGE_KEY_M, m); },
  addManufacturer: (m) => { const n = [...get().manufacturers, m]; set({ manufacturers: n }); saveJSON(STORAGE_KEY_M, n); },
  updateManufacturer: (id, m) => { const n = get().manufacturers.map((x) => x.id === id ? m : x); set({ manufacturers: n }); saveJSON(STORAGE_KEY_M, n); },
  deleteManufacturer: (id) => { const n = get().manufacturers.filter((x) => x.id !== id); set({ manufacturers: n }); saveJSON(STORAGE_KEY_M, n); },
  hydrate: () => {
    const auth = typeof window !== "undefined" && localStorage.getItem(AUTH_KEY) === "1";
    set({
      authenticated: auth,
      buildings: loadJSON(STORAGE_KEY_B, BUILDINGS),
      manufacturers: loadJSON(STORAGE_KEY_M, defaultManufacturers()),
    });
  },
}));
