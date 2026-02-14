"use client";
import React from "react";
import { useAdminStore } from "./store";
import { SHAPE_OPTIONS } from "./constants";
import { Card } from "./components";
import { Building2, Factory, Shapes, ArrowRight } from "lucide-react";
import { useRouter } from "next/navigation";

export default function DashboardPage() {
  const { buildings, manufacturers } = useAdminStore();
  const router = useRouter();
  const shapes = new Set(buildings.map((b) => b.shape));

  const stats = [
    { label: "Gebäude-Module", value: buildings.length, icon: Building2, color: "blue", href: "/admin/module" },
    { label: "Hersteller", value: manufacturers.length, icon: Factory, color: "cyan", href: "/admin/hersteller" },
    { label: "Gebäudeformen", value: shapes.size, icon: Shapes, color: "purple", href: "" },
  ];

  const colorMap: Record<string, string> = {
    blue: "from-blue-500 to-blue-600 shadow-blue-600/30",
    cyan: "from-cyan-500 to-cyan-600 shadow-cyan-600/30",
    purple: "from-purple-500 to-purple-600 shadow-purple-600/30",
  };

  return (
    <div>
      <h1 className="text-2xl font-bold mb-8">Dashboard</h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
        {stats.map((s) => (
          <Card key={s.label} className="group hover:border-slate-600/50 transition-all cursor-pointer" >
            <div className="flex items-start justify-between">
              <div>
                <p className="text-slate-400 text-sm">{s.label}</p>
                <p className="text-4xl font-bold mt-2">{s.value}</p>
              </div>
              <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${colorMap[s.color]} shadow-lg flex items-center justify-center`}>
                <s.icon size={22} className="text-white" />
              </div>
            </div>
            {s.href && (
              <button
                onClick={() => router.push(`/bplan-engine${s.href}`)}
                className="mt-4 text-sm text-blue-400 hover:text-blue-300 flex items-center gap-1 group/btn cursor-pointer"
              >
                Verwalten <ArrowRight size={14} className="group-hover/btn:translate-x-1 transition-transform" />
              </button>
            )}
          </Card>
        ))}
      </div>

      {/* Shape overview */}
      <Card>
        <h2 className="text-lg font-semibold mb-4">Formen-Übersicht</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {(Object.entries(SHAPE_OPTIONS) as [string, { label: string; icon: string }][]).map(([key, s]) => {
            const count = buildings.filter((b) => b.shape === key).length;
            return (
              <div key={key} className="bg-slate-900/50 rounded-lg p-4 text-center border border-slate-800/50">
                <div className="text-3xl mb-2">{s.icon}</div>
                <p className="text-sm font-medium">{s.label}</p>
                <p className="text-xs text-slate-500 mt-1">{count} Module</p>
              </div>
            );
          })}
        </div>
      </Card>

      {/* Manufacturer breakdown */}
      <Card className="mt-6">
        <h2 className="text-lg font-semibold mb-4">Module pro Hersteller</h2>
        <div className="space-y-3">
          {manufacturers.map((m) => {
            const count = buildings.filter((b) => b.manufacturer === m.id).length;
            const pct = buildings.length > 0 ? (count / buildings.length) * 100 : 0;
            return (
              <div key={m.id} className="flex items-center gap-4">
                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: m.color }} />
                <span className="w-28 text-sm">{m.label}</span>
                <div className="flex-1 h-2 bg-slate-800 rounded-full overflow-hidden">
                  <div className="h-full rounded-full transition-all" style={{ width: `${pct}%`, backgroundColor: m.color }} />
                </div>
                <span className="text-sm text-slate-400 w-8 text-right">{count}</span>
              </div>
            );
          })}
        </div>
      </Card>
    </div>
  );
}
