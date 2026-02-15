"use client";
import React, { useState, useMemo } from "react";
import { useAdminStore } from "../store";
import { SHAPE_OPTIONS } from "../constants";
import { Card, Button, Input, Select, ColorPicker, TagInput, ShapeSVG } from "../components";
import { Plus, Pencil, Trash2, X, Search } from "lucide-react";
import type { BuildingModule, BuildingShape, Manufacturer, RoofType, FacadeType, EnergyRating } from "../../demo/types";

const ROOF_TYPES: RoofType[] = ["flat", "saddle", "pult"];
const FACADE_TYPES: FacadeType[] = ["putz", "klinker", "holz", "metall"];
const ENERGY_RATINGS: EnergyRating[] = ["A+", "A", "B", "C"];

function emptyModule(): BuildingModule {
  return {
    id: "", name: "", manufacturer: "" as Manufacturer, manufacturerLabel: "",
    shape: "riegel", shapeLabel: "Riegel",
    footprint: { width: 12, depth: 24 },
    minGeschosse: 3, maxGeschosse: 6, defaultGeschosse: 4,
    wePerGeschoss: 4, bgfPerGeschoss: 288,
    roofOptions: ["flat"], facadeOptions: ["putz"],
    energyRating: "A", pricePerSqm: 1800, tags: [], color: "#3B82F6",
  };
}

export default function ModulePage() {
  const { buildings, manufacturers, addBuilding, updateBuilding, deleteBuilding } = useAdminStore();
  const [editing, setEditing] = useState<BuildingModule | null>(null);
  const [isNew, setIsNew] = useState(false);
  const [filterMfr, setFilterMfr] = useState("all");
  const [filterShape, setFilterShape] = useState("all");
  const [search, setSearch] = useState("");
  const [sortKey, setSortKey] = useState<"name" | "manufacturer" | "pricePerSqm">("name");
  const [sortDir, setSortDir] = useState<1 | -1>(1);

  const filtered = useMemo(() => {
    let list = [...buildings];
    if (filterMfr !== "all") list = list.filter((b) => b.manufacturer === filterMfr);
    if (filterShape !== "all") list = list.filter((b) => b.shape === filterShape);
    if (search) list = list.filter((b) => b.name.toLowerCase().includes(search.toLowerCase()) || b.tags.some((t) => t.includes(search.toLowerCase())));
    list.sort((a, b) => {
      const av = a[sortKey], bv = b[sortKey];
      if (typeof av === "string") return av.localeCompare(bv as string) * sortDir;
      return ((av as number) - (bv as number)) * sortDir;
    });
    return list;
  }, [buildings, filterMfr, filterShape, search, sortKey, sortDir]);

  const toggleSort = (key: typeof sortKey) => {
    if (sortKey === key) setSortDir((d) => (d === 1 ? -1 : 1) as 1 | -1);
    else { setSortKey(key); setSortDir(1); }
  };

  const startNew = () => { setEditing(emptyModule()); setIsNew(true); };
  const startEdit = (b: BuildingModule) => { setEditing({ ...b, footprint: { ...b.footprint }, roofOptions: [...b.roofOptions], facadeOptions: [...b.facadeOptions], tags: [...b.tags] }); setIsNew(false); };
  const cancel = () => { setEditing(null); setIsNew(false); };

  const save = () => {
    if (!editing || !editing.id || !editing.name) return;
    const mfr = manufacturers.find((m) => m.id === editing.manufacturer);
    const shp = SHAPE_OPTIONS[editing.shape as BuildingShape];
    const mod: BuildingModule = {
      ...editing,
      manufacturerLabel: mfr?.label || editing.manufacturer,
      shapeLabel: shp?.label || editing.shape,
    };
    if (isNew) addBuilding(mod);
    else updateBuilding(mod.id, mod);
    cancel();
  };

  const toggleArr = <T extends string>(arr: T[], val: T): T[] =>
    arr.includes(val) ? arr.filter((x) => x !== val) : [...arr, val];

  const upd = (partial: Partial<BuildingModule>) => {
    if (editing) setEditing({ ...editing, ...partial });
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-bold">Gebäude-Module</h1>
        <Button onClick={startNew}><Plus size={16} className="mr-1 inline" /> Neues Modul</Button>
      </div>

      {editing && (
        <Card className="mb-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold">{isNew ? "Neues Modul" : `Bearbeiten: ${editing.name}`}</h2>
            <button onClick={cancel} className="text-slate-400 hover:text-white cursor-pointer"><X size={20} /></button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <Input label="ID (slug)" value={editing.id} onChange={(v) => upd({ id: v })} placeholder="hersteller-form-xx" />
            <Input label="Name" value={editing.name} onChange={(v) => upd({ name: v })} />
            <Select
              label="Hersteller"
              value={editing.manufacturer}
              onChange={(v) => upd({ manufacturer: v as Manufacturer })}
              options={manufacturers.map((m) => ({ value: m.id, label: m.label }))}
            />
            <div>
              <Select
                label="Form"
                value={editing.shape}
                onChange={(v) => upd({ shape: v as BuildingShape })}
                options={Object.entries(SHAPE_OPTIONS).map(([k, v]) => ({ value: k, label: `${v.icon} ${v.label}` }))}
              />
              <div className="mt-2 text-blue-400">
                <ShapeSVG shape={editing.shape} width={editing.footprint.width} depth={editing.footprint.depth} size={100} />
              </div>
            </div>

            <div>
              <label className="block text-sm text-slate-400 mb-1">Footprint</label>
              <div className="flex items-center gap-2">
                <input type="number" value={editing.footprint.width} onChange={(e) => upd({ footprint: { ...editing.footprint, width: +e.target.value } })}
                  className="w-20 bg-slate-900/50 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white outline-none" />
                <span className="text-slate-500">×</span>
                <input type="number" value={editing.footprint.depth} onChange={(e) => upd({ footprint: { ...editing.footprint, depth: +e.target.value } })}
                  className="w-20 bg-slate-900/50 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white outline-none" />
                <span className="text-slate-500 text-sm">m</span>
              </div>
            </div>

            <div>
              <label className="block text-sm text-slate-400 mb-1">Geschosse (Min / Max / Default)</label>
              <div className="flex gap-2">
                <input type="number" value={editing.minGeschosse} onChange={(e) => upd({ minGeschosse: +e.target.value })}
                  className="w-16 bg-slate-900/50 border border-slate-700 rounded-lg px-2 py-2 text-sm text-white outline-none text-center" />
                <input type="number" value={editing.maxGeschosse} onChange={(e) => upd({ maxGeschosse: +e.target.value })}
                  className="w-16 bg-slate-900/50 border border-slate-700 rounded-lg px-2 py-2 text-sm text-white outline-none text-center" />
                <input type="number" value={editing.defaultGeschosse} onChange={(e) => upd({ defaultGeschosse: +e.target.value })}
                  className="w-16 bg-slate-900/50 border border-slate-700 rounded-lg px-2 py-2 text-sm text-white outline-none text-center" />
              </div>
            </div>

            <Input label="WE/Geschoss" value={editing.wePerGeschoss} onChange={(v) => upd({ wePerGeschoss: +v })} type="number" />
            <Input label="BGF/Geschoss (m²)" value={editing.bgfPerGeschoss} onChange={(v) => upd({ bgfPerGeschoss: +v })} type="number" />
            <Input label="Preis €/m²" value={editing.pricePerSqm} onChange={(v) => upd({ pricePerSqm: +v })} type="number" />

            <Select label="Energieeffizienz" value={editing.energyRating} onChange={(v) => upd({ energyRating: v as EnergyRating })}
              options={ENERGY_RATINGS.map((r) => ({ value: r, label: r }))} />

            <div>
              <label className="block text-sm text-slate-400 mb-1">Dachtypen</label>
              <div className="flex gap-2 flex-wrap">
                {ROOF_TYPES.map((r) => (
                  <button key={r} onClick={() => upd({ roofOptions: toggleArr(editing.roofOptions, r) })}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium transition cursor-pointer ${
                      editing.roofOptions.includes(r)
                        ? "bg-blue-600/30 text-blue-400 border border-blue-600/40"
                        : "bg-slate-800 text-slate-400 border border-slate-700"
                    }`}>{r}</button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm text-slate-400 mb-1">Fassadentypen</label>
              <div className="flex gap-2 flex-wrap">
                {FACADE_TYPES.map((f) => (
                  <button key={f} onClick={() => upd({ facadeOptions: toggleArr(editing.facadeOptions, f) })}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium transition cursor-pointer ${
                      editing.facadeOptions.includes(f)
                        ? "bg-blue-600/30 text-blue-400 border border-blue-600/40"
                        : "bg-slate-800 text-slate-400 border border-slate-700"
                    }`}>{f}</button>
                ))}
              </div>
            </div>

            <Input label="Rendering URL" value={editing.rendering || ""} onChange={(v) => upd({ rendering: v || undefined })} placeholder="/uplan-engine/renderings/..." />
            <ColorPicker label="Farbe" value={editing.color} onChange={(v) => upd({ color: v })} />
          </div>

          <div className="mt-4">
            <TagInput tags={editing.tags} onChange={(t) => upd({ tags: t })} />
          </div>

          <div className="flex gap-2 mt-6">
            <Button onClick={save}>Speichern</Button>
            <Button variant="ghost" onClick={cancel}>Abbrechen</Button>
          </div>
        </Card>
      )}

      <Card className="mb-6">
        <div className="flex flex-wrap gap-4 items-end">
          <div className="relative flex-1 min-w-[200px]">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
            <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Suche..."
              className="w-full bg-slate-900/50 border border-slate-700 rounded-lg pl-9 pr-3 py-2 text-sm text-white placeholder-slate-500 outline-none" />
          </div>
          <Select value={filterMfr} onChange={setFilterMfr}
            options={[{ value: "all", label: "Alle Hersteller" }, ...manufacturers.map((m) => ({ value: m.id, label: m.label }))]} />
          <Select value={filterShape} onChange={setFilterShape}
            options={[{ value: "all", label: "Alle Formen" }, ...Object.entries(SHAPE_OPTIONS).map(([k, v]) => ({ value: k, label: v.label }))]} />
        </div>
      </Card>

      <Card>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-slate-400 border-b border-slate-700/50">
                <th className="pb-3 pr-3">Form</th>
                <th className="pb-3 pr-3 cursor-pointer hover:text-white" onClick={() => toggleSort("name")}>
                  Name {sortKey === "name" && (sortDir === 1 ? "↑" : "↓")}
                </th>
                <th className="pb-3 pr-3 cursor-pointer hover:text-white" onClick={() => toggleSort("manufacturer")}>
                  Hersteller {sortKey === "manufacturer" && (sortDir === 1 ? "↑" : "↓")}
                </th>
                <th className="pb-3 pr-3">Footprint</th>
                <th className="pb-3 pr-3">Geschosse</th>
                <th className="pb-3 pr-3">WE/G</th>
                <th className="pb-3 pr-3 cursor-pointer hover:text-white" onClick={() => toggleSort("pricePerSqm")}>
                  €/m² {sortKey === "pricePerSqm" && (sortDir === 1 ? "↑" : "↓")}
                </th>
                <th className="pb-3 pr-3">Energie</th>
                <th className="pb-3">Aktionen</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((b) => (
                <tr key={b.id} className="border-b border-slate-800/50 hover:bg-slate-800/30 transition">
                  <td className="py-2 pr-3 text-blue-400">
                    <ShapeSVG shape={b.shape} width={b.footprint.width} depth={b.footprint.depth} size={40} />
                  </td>
                  <td className="py-2 pr-3">
                    <div className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full" style={{ backgroundColor: b.color }} />
                      <span className="font-medium">{b.name}</span>
                    </div>
                  </td>
                  <td className="py-2 pr-3 text-slate-400">{b.manufacturerLabel}</td>
                  <td className="py-2 pr-3 font-mono text-xs text-slate-400">{b.footprint.width}×{b.footprint.depth}</td>
                  <td className="py-2 pr-3 text-slate-400">{b.minGeschosse}-{b.maxGeschosse}</td>
                  <td className="py-2 pr-3 text-slate-400">{b.wePerGeschoss}</td>
                  <td className="py-2 pr-3">{b.pricePerSqm.toLocaleString("de-DE")} €</td>
                  <td className="py-2 pr-3">
                    <span className={`text-xs px-2 py-0.5 rounded-full ${
                      b.energyRating === "A+" ? "bg-green-600/20 text-green-400" :
                      b.energyRating === "A" ? "bg-emerald-600/20 text-emerald-400" :
                      b.energyRating === "B" ? "bg-yellow-600/20 text-yellow-400" :
                      "bg-orange-600/20 text-orange-400"
                    }`}>{b.energyRating}</span>
                  </td>
                  <td className="py-2">
                    <div className="flex gap-1">
                      <button onClick={() => startEdit(b)} className="p-1.5 rounded hover:bg-slate-700 text-slate-400 hover:text-white transition cursor-pointer">
                        <Pencil size={14} />
                      </button>
                      <button onClick={() => { if (confirm(`"${b.name}" löschen?`)) deleteBuilding(b.id); }}
                        className="p-1.5 rounded hover:bg-red-600/20 text-slate-400 hover:text-red-400 transition cursor-pointer">
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filtered.length === 0 && (
            <p className="text-center text-slate-500 py-8">Keine Module gefunden</p>
          )}
        </div>
      </Card>
    </div>
  );
}
