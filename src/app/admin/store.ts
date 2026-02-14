"use client";
import { create } from "zustand";
import type { BuildingModule, Manufacturer, BuildingShape, RoofType, FacadeType, EnergyRating } from "../demo/types";
import { BUILDINGS, MANUFACTURERS } from "../demo/data";

export interface ManufacturerEntry {
  id: Manufacturer;
  label: string;
  color: string;
  accent: string;
}

interface AdminState {
  isAuthenticated: boolean;
  manufacturers: ManufacturerEntry[];
  buildings: BuildingModule[];
  login: (password: string) => boolean;
  logout: () => void;
  // Manufacturers
  addManufacturer: (m: ManufacturerEntry) => void;
  updateManufacturer: (id: Manufacturer, m: Partial<ManufacturerEntry>) => void;
  deleteManufacturer: (id: Manufacturer) => void;
  // Buildings
  addBuilding: (b: BuildingModule) => void;
  updateBuilding: (id: string, b: Partial<BuildingModule>) => void;
  deleteBuilding: (id: string) => void;
  // Import
  importData: (buildings: BuildingModule[], manufacturers: ManufacturerEntry[]) => void;
}

const STORAGE_KEY = "bplan-admin";
const AUTH_KEY = "bplan-admin-auth";
const PASSWORD = "Bau-Turbo";

function loadFromStorage(): { buildings: BuildingModule[]; manufacturers: ManufacturerEntry[] } | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch {}
  return null;
}

function saveToStorage(buildings: BuildingModule[], manufacturers: ManufacturerEntry[]) {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify({ buildings, manufacturers }));
}

function getDefaultManufacturers(): ManufacturerEntry[] {
  return (Object.entries(MANUFACTURERS) as [Manufacturer, { label: string; color: string; accent: string }][]).map(
    ([id, m]) => ({ id, label: m.label, color: m.color, accent: m.accent })
  );
}

function isAuth(): boolean {
  if (typeof window === "undefined") return false;
  return localStorage.getItem(AUTH_KEY) === "true";
}

export const useAdminStore = create<AdminState>((set, get) => {
  const stored = typeof window !== "undefined" ? loadFromStorage() : null;

  return {
    isAuthenticated: isAuth(),
    buildings: stored?.buildings ?? [...BUILDINGS],
    manufacturers: stored?.manufacturers ?? getDefaultManufacturers(),

    login: (password: string) => {
      if (password === PASSWORD) {
        localStorage.setItem(AUTH_KEY, "true");
        set({ isAuthenticated: true });
        return true;
      }
      return false;
    },
    logout: () => {
      localStorage.removeItem(AUTH_KEY);
      set({ isAuthenticated: false });
    },

    addManufacturer: (m) => {
      const manufacturers = [...get().manufacturers, m];
      set({ manufacturers });
      saveToStorage(get().buildings, manufacturers);
    },
    updateManufacturer: (id, updates) => {
      const manufacturers = get().manufacturers.map((m) => (m.id === id ? { ...m, ...updates } : m));
      set({ manufacturers });
      saveToStorage(get().buildings, manufacturers);
    },
    deleteManufacturer: (id) => {
      const manufacturers = get().manufacturers.filter((m) => m.id !== id);
      set({ manufacturers });
      saveToStorage(get().buildings, manufacturers);
    },

    addBuilding: (b) => {
      const buildings = [...get().buildings, b];
      set({ buildings });
      saveToStorage(buildings, get().manufacturers);
    },
    updateBuilding: (id, updates) => {
      const buildings = get().buildings.map((b) => (b.id === id ? { ...b, ...updates } : b));
      set({ buildings });
      saveToStorage(buildings, get().manufacturers);
    },
    deleteBuilding: (id) => {
      const buildings = get().buildings.filter((b) => b.id !== id);
      set({ buildings });
      saveToStorage(buildings, get().manufacturers);
    },

    importData: (buildings, manufacturers) => {
      set({ buildings, manufacturers });
      saveToStorage(buildings, manufacturers);
    },
  };
});
