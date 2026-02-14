"use client";
import { useState } from "react";
import { useAdminStore, ManufacturerEntry } from "../store";
import { Plus, Pencil, Trash2, X, Check } from "lucide-react";
import type { Manufacturer } from "../../demo/types";

export default function HerstellerPage() {
  const { manufacturers, buildings, addManufacturer, updateManufacturer, deleteManufacturer } = useAdminStore();
  const [editing, setEditing] = useState<Manufacturer | null>(null);
  const [creating, setCreating] = useState(false);
  const [form, setForm] = useState({ id: "", label: "", color: "#3B82F6", accent: "#60A5FA" });

  const startEdit = (m: ManufacturerEntry) => {
    setEditing(m.id);
    setForm({ id: m.id, label: m.label, color: m.color, accent: m.accent });
    setCreating(false);
  };

  const startCreate = () => {
    setCreating(true);
    setEditing(null);
    setForm({ id: "", label: "", color: "#3B82F6", accent: "#60A5FA" });
  };

  const save = () => {
    if (creating) {
      const id = form.label.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "") as Manufacturer;
      addManufacturer({ id, label: form.label, color: form.color, accent: form.accent });
    } else if (editing) {
      updateManufacturer(editing, { label: form.label, color: form.color, accent: form.accent });
    }
    setEditing(null);
    setCreating(false);
  };

  const cancel = () => { setEditing(null); setCreating(false); };

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold">Hersteller</h1>
          <p className="text-slate-500 text-sm mt-1">{manufacturers.length} Hersteller im Katalog</p>
        </div>
        <button
          onClick={startCreate}
          className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-500 text-white text-sm font-medium rounded-xl transition-all"
        >
          <Plus className="w-4 h-4" /> Neuer Hersteller
        </button>
      </div>

      <div className="bg-slate-900/50 border border-slate-800/60 rounded-xl overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-slate-800">
              <th className="text-left text-xs font-medium text-slate-500 uppercase tracking-wider px-6 py-3">Farbe</th>
              <th className="text-left text-xs font-medium text-slate-500 uppercase tracking-wider px-6 py-3">Name</th>
              <th className="text-left text-xs font-medium text-slate-500 uppercase tracking-wider px-6 py-3">ID</th>
              <th className="text-left text-xs font-medium text-slate-500 uppercase tracking-wider px-6 py-3">Module</th>
              <th className="text-right text-xs font-medium text-slate-500 uppercase tracking-wider px-6 py-3">Aktionen</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60">
            {creating && (
              <tr className="bg-blue-500/5">
                <td className="px-6 py-3">
                  <input type="color" value={form.color} onChange={(e) => setForm({ ...form, color: e.target.value })} className="w-8 h-8 rounded cursor-pointer bg-transparent border-0" />
                </td>
                <td className="px-6 py-3">
                  <input value={form.label} onChange={(e) => setForm({ ...form, label: e.target.value })} placeholder="Name..." className="bg-slate-800 border border-slate-700 rounded-lg px-3 py-1.5 text-sm text-white focus:outline-none focus:ring-2 focus:ring-blue-500/40 w-48" autoFocus />
                </td>
                <td className="px-6 py-3 text-sm text-slate-500">{form.label.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "") || "—"}</td>
                <td className="px-6 py-3 text-sm text-slate-500">0</td>
                <td className="px-6 py-3 text-right">
                  <div className="flex items-center justify-end gap-2">
                    <button onClick={save} disabled={!form.label} className="p-1.5 rounded-lg bg-green-500/20 text-green-400 hover:bg-green-500/30 transition-all disabled:opacity-30"><Check className="w-4 h-4" /></button>
                    <button onClick={cancel} className="p-1.5 rounded-lg bg-slate-700/50 text-slate-400 hover:bg-slate-700 transition-all"><X className="w-4 h-4" /></button>
                  </div>
                </td>
              </tr>
            )}
            {manufacturers.map((m) => {
              const count = buildings.filter((b) => b.manufacturer === m.id).length;
              const isEditing = editing === m.id;

              return (
                <tr key={m.id} className={isEditing ? "bg-blue-500/5" : "hover:bg-slate-800/30 transition-colors"}>
                  <td className="px-6 py-3">
                    {isEditing ? (
                      <input type="color" value={form.color} onChange={(e) => setForm({ ...form, color: e.target.value })} className="w-8 h-8 rounded cursor-pointer bg-transparent border-0" />
                    ) : (
                      <div className="flex items-center gap-2">
                        <div className="w-4 h-4 rounded-full" style={{ backgroundColor: m.color }} />
                        <div className="w-4 h-4 rounded-full" style={{ backgroundColor: m.accent }} />
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-3">
                    {isEditing ? (
                      <input value={form.label} onChange={(e) => setForm({ ...form, label: e.target.value })} className="bg-slate-800 border border-slate-700 rounded-lg px-3 py-1.5 text-sm text-white focus:outline-none focus:ring-2 focus:ring-blue-500/40 w-48" />
                    ) : (
                      <span className="text-sm font-medium text-white">{m.label}</span>
                    )}
                  </td>
                  <td className="px-6 py-3 text-sm text-slate-500 font-mono">{m.id}</td>
                  <td className="px-6 py-3">
                    <span className="text-sm text-slate-300 bg-slate-800 px-2.5 py-0.5 rounded-full">{count}</span>
                  </td>
                  <td className="px-6 py-3 text-right">
                    <div className="flex items-center justify-end gap-2">
                      {isEditing ? (
                        <>
                          <button onClick={save} className="p-1.5 rounded-lg bg-green-500/20 text-green-400 hover:bg-green-500/30 transition-all"><Check className="w-4 h-4" /></button>
                          <button onClick={cancel} className="p-1.5 rounded-lg bg-slate-700/50 text-slate-400 hover:bg-slate-700 transition-all"><X className="w-4 h-4" /></button>
                        </>
                      ) : (
                        <>
                          <button onClick={() => startEdit(m)} className="p-1.5 rounded-lg text-slate-400 hover:text-blue-400 hover:bg-blue-500/10 transition-all"><Pencil className="w-4 h-4" /></button>
                          <button onClick={() => { if (count === 0 && confirm(`"${m.label}" löschen?`)) deleteManufacturer(m.id); }} disabled={count > 0} className="p-1.5 rounded-lg text-slate-400 hover:text-red-400 hover:bg-red-500/10 transition-all disabled:opacity-20 disabled:cursor-not-allowed"><Trash2 className="w-4 h-4" /></button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
