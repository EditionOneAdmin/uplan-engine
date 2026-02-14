"use client";
import React, { useState } from "react";
import { useAdminStore, type ManufacturerData } from "../store";
import { Card, Button, Input, ColorPicker } from "../components";
import { Plus, Pencil, Trash2, X } from "lucide-react";
import type { Manufacturer } from "../../demo/types";

const empty: ManufacturerData = { id: "" as Manufacturer, label: "", color: "#3B82F6", accent: "#60A5FA" };

export default function HerstellerPage() {
  const { manufacturers, buildings, addManufacturer, updateManufacturer, deleteManufacturer } = useAdminStore();
  const [editing, setEditing] = useState<ManufacturerData | null>(null);
  const [isNew, setIsNew] = useState(false);

  const startNew = () => { setEditing({ ...empty }); setIsNew(true); };
  const startEdit = (m: ManufacturerData) => { setEditing({ ...m }); setIsNew(false); };
  const cancel = () => { setEditing(null); setIsNew(false); };

  const save = () => {
    if (!editing || !editing.id || !editing.label) return;
    if (isNew) addManufacturer(editing);
    else updateManufacturer(editing.id, editing);
    cancel();
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-bold">Hersteller</h1>
        <Button onClick={startNew}><Plus size={16} className="mr-1 inline" /> Neu</Button>
      </div>

      {editing && (
        <Card className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold">{isNew ? "Neuer Hersteller" : "Bearbeiten"}</h2>
            <button onClick={cancel} className="text-slate-400 hover:text-white cursor-pointer"><X size={20} /></button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input label="ID (slug)" value={editing.id} onChange={(v) => setEditing({ ...editing, id: v as Manufacturer })} placeholder="z.B. my-company" />
            <Input label="Name" value={editing.label} onChange={(v) => setEditing({ ...editing, label: v })} />
            <ColorPicker label="Farbe" value={editing.color} onChange={(v) => setEditing({ ...editing, color: v })} />
            <ColorPicker label="Accent" value={editing.accent} onChange={(v) => setEditing({ ...editing, accent: v })} />
          </div>
          <div className="flex gap-2 mt-4">
            <Button onClick={save}>Speichern</Button>
            <Button variant="ghost" onClick={cancel}>Abbrechen</Button>
          </div>
        </Card>
      )}

      <Card>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-slate-400 border-b border-slate-700/50">
                <th className="pb-3 pr-4">Name</th>
                <th className="pb-3 pr-4">ID</th>
                <th className="pb-3 pr-4">Farbe</th>
                <th className="pb-3 pr-4">Accent</th>
                <th className="pb-3 pr-4">Module</th>
                <th className="pb-3">Aktionen</th>
              </tr>
            </thead>
            <tbody>
              {manufacturers.map((m) => {
                const count = buildings.filter((b) => b.manufacturer === m.id).length;
                return (
                  <tr key={m.id} className="border-b border-slate-800/50 hover:bg-slate-800/30 transition">
                    <td className="py-3 pr-4 font-medium">{m.label}</td>
                    <td className="py-3 pr-4 text-slate-400 font-mono text-xs">{m.id}</td>
                    <td className="py-3 pr-4">
                      <span className="inline-flex items-center gap-2">
                        <span className="w-4 h-4 rounded" style={{ backgroundColor: m.color }} />
                        <span className="font-mono text-xs text-slate-400">{m.color}</span>
                      </span>
                    </td>
                    <td className="py-3 pr-4">
                      <span className="inline-flex items-center gap-2">
                        <span className="w-4 h-4 rounded" style={{ backgroundColor: m.accent }} />
                        <span className="font-mono text-xs text-slate-400">{m.accent}</span>
                      </span>
                    </td>
                    <td className="py-3 pr-4">{count}</td>
                    <td className="py-3">
                      <div className="flex gap-1">
                        <button onClick={() => startEdit(m)} className="p-1.5 rounded hover:bg-slate-700 text-slate-400 hover:text-white transition cursor-pointer"><Pencil size={14} /></button>
                        <button onClick={() => { if (confirm(`"${m.label}" löschen?`)) deleteManufacturer(m.id); }}
                          className="p-1.5 rounded hover:bg-red-600/20 text-slate-400 hover:text-red-400 transition cursor-pointer"><Trash2 size={14} /></button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
