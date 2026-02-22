"use client";
import React, { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import QualityHeatmap from "./QualityHeatmap";

interface GeoJob {
  id: string;
  type: string;
  status: string;
  created_at: string;
  updated_at: string;
  meta?: Record<string, unknown>;
}

interface Stats {
  flurstuecke: number;
  bplaene: number;
  boris: number;
  mietspiegel: number;
  lbo_rules: number;
}

export default function GeoIndexPage() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [jobs, setJobs] = useState<GeoJob[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const counts = await Promise.all([
          supabase.from("flurstuecke").select("id", { count: "exact", head: true }),
          supabase.from("bplaene").select("id", { count: "exact", head: true }),
          supabase.from("boris_zones").select("id", { count: "exact", head: true }),
          supabase.from("mietspiegel").select("id", { count: "exact", head: true }),
          supabase.from("lbo_rules").select("id", { count: "exact", head: true }),
        ]);
        setStats({
          flurstuecke: counts[0].count ?? 0,
          bplaene: counts[1].count ?? 0,
          boris: counts[2].count ?? 0,
          mietspiegel: counts[3].count ?? 0,
          lbo_rules: counts[4].count ?? 0,
        });

        const { data } = await supabase
          .from("geo_jobs")
          .select("*")
          .order("created_at", { ascending: false })
          .limit(10);
        setJobs(data ?? []);
      } catch (e) {
        console.error("GeoIndex load error", e);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const statCards = stats
    ? [
        { label: "Flurstücke", value: stats.flurstuecke, color: "text-emerald-400" },
        { label: "B-Pläne", value: stats.bplaene, color: "text-blue-400" },
        { label: "BORIS-Zonen", value: stats.boris, color: "text-amber-400" },
        { label: "Mietspiegel", value: stats.mietspiegel, color: "text-purple-400" },
        { label: "LBO Rules", value: stats.lbo_rules, color: "text-rose-400" },
      ]
    : [];

  const qualityCards = [
    { label: "B-Pläne mit PDF", value: 2822, color: "text-blue-400" },
    { label: "PDFs extrahiert", value: 0, color: "text-yellow-400" },
    { label: "PDFs in Storage", value: 2527, color: "text-green-400" },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin h-8 w-8 border-2 border-blue-400 border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <h1 className="text-2xl font-bold text-white">GeoIndex Dashboard</h1>

      {/* Stats */}
      <section>
        <h2 className="text-lg font-semibold text-zinc-300 mb-3">Datenbestand</h2>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          {statCards.map((c) => (
            <div key={c.label} className="bg-zinc-800 rounded-xl p-4 border border-zinc-700">
              <p className="text-sm text-zinc-400">{c.label}</p>
              <p className={`text-2xl font-bold ${c.color}`}>{c.value.toLocaleString("de-DE")}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Quality */}
      <section>
        <h2 className="text-lg font-semibold text-zinc-300 mb-3">Qualitäts-Übersicht</h2>
        <div className="grid grid-cols-3 gap-4">
          {qualityCards.map((c) => (
            <div key={c.label} className="bg-zinc-800 rounded-xl p-4 border border-zinc-700">
              <p className="text-sm text-zinc-400">{c.label}</p>
              <p className={`text-2xl font-bold ${c.color}`}>{c.value.toLocaleString("de-DE")}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Quality Heatmap */}
      <section>
        <h2 className="text-lg font-semibold text-zinc-300 mb-3">Qualitäts-Heatmap nach Gemeinde</h2>
        <QualityHeatmap />
      </section>

      {/* Jobs */}
      <section>
        <h2 className="text-lg font-semibold text-zinc-300 mb-3">Harvester Jobs</h2>
        {jobs.length === 0 ? (
          <div className="bg-zinc-800 rounded-xl p-6 border border-zinc-700 text-zinc-400 text-center">
            Keine aktiven Jobs
          </div>
        ) : (
          <div className="overflow-x-auto rounded-xl border border-zinc-700">
            <table className="w-full text-sm text-left text-zinc-300">
              <thead className="bg-zinc-800 text-zinc-400 uppercase text-xs">
                <tr>
                  <th className="px-4 py-3">ID</th>
                  <th className="px-4 py-3">Typ</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Erstellt</th>
                  <th className="px-4 py-3">Aktualisiert</th>
                </tr>
              </thead>
              <tbody>
                {jobs.map((j) => (
                  <tr key={j.id} className="border-t border-zinc-700 hover:bg-zinc-800/50">
                    <td className="px-4 py-2 font-mono text-xs">{j.id.slice(0, 8)}</td>
                    <td className="px-4 py-2">{j.type}</td>
                    <td className="px-4 py-2">
                      <span
                        className={`px-2 py-0.5 rounded text-xs font-medium ${
                          j.status === "done"
                            ? "bg-green-900 text-green-300"
                            : j.status === "running"
                            ? "bg-blue-900 text-blue-300"
                            : j.status === "error"
                            ? "bg-red-900 text-red-300"
                            : "bg-zinc-700 text-zinc-300"
                        }`}
                      >
                        {j.status}
                      </span>
                    </td>
                    <td className="px-4 py-2 text-xs">{new Date(j.created_at).toLocaleString("de-DE")}</td>
                    <td className="px-4 py-2 text-xs">{new Date(j.updated_at).toLocaleString("de-DE")}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}
