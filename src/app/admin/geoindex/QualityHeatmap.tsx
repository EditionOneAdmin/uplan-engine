"use client";
import React, { useEffect, useState, useMemo } from "react";
import { supabase } from "@/lib/supabase";

interface BezirkQuality {
  bezirk: string;
  total: number;
  borisMatch: number;
  bplanMatch: number;
  mietspiegelMatch: number;
}

function qualityColor(pct: number): string {
  if (pct >= 80) return "bg-emerald-600";
  if (pct >= 60) return "bg-emerald-700";
  if (pct >= 40) return "bg-yellow-600";
  if (pct >= 20) return "bg-orange-600";
  return "bg-red-700";
}

function pctBar(count: number, total: number) {
  const pct = total > 0 ? Math.round((count / total) * 100) : 0;
  return (
    <div className="flex items-center gap-2">
      <div className="w-20 h-3 bg-zinc-700 rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full ${qualityColor(pct)}`}
          style={{ width: `${pct}%` }}
        />
      </div>
      <span className="text-xs text-zinc-400 w-10 text-right">{pct}%</span>
    </div>
  );
}

export default function QualityHeatmap() {
  const [data, setData] = useState<BezirkQuality[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sortKey, setSortKey] = useState<"bezirk" | "total" | "boris" | "bplan" | "mietspiegel">("bezirk");
  const [sortAsc, setSortAsc] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        // Fetch all flurstuecke with gemeinde
        const { data: flurstuecke, error: fsErr } = await supabase
          .from("flurstuecke")
          .select("id,gemeinde");
        if (fsErr) throw fsErr;

        // Fetch boris zones with bezirk info
        const { data: boris, error: bErr } = await supabase
          .from("boris_zones")
          .select("id,gemeinde");
        if (bErr) throw bErr;

        // Fetch bplaene with gemeinde
        const { data: bplaene, error: bpErr } = await supabase
          .from("bplaene")
          .select("id,gemeinde");
        if (bpErr) throw bpErr;

        // Fetch mietspiegel with bezirk
        const { data: mietspiegel, error: mErr } = await supabase
          .from("mietspiegel")
          .select("id,bezirk");
        if (mErr) throw mErr;

        // Group flurstuecke by gemeinde
        const bezirkMap = new Map<string, BezirkQuality>();
        for (const fs of flurstuecke || []) {
          const bez = fs.gemeinde || "Unbekannt";
          if (!bezirkMap.has(bez)) {
            bezirkMap.set(bez, { bezirk: bez, total: 0, borisMatch: 0, bplanMatch: 0, mietspiegelMatch: 0 });
          }
          bezirkMap.get(bez)!.total++;
        }

        // Count boris zones per gemeinde
        const borisGemeinden = new Set((boris || []).map((b: Record<string, string | null>) => b.gemeinde).filter(Boolean));
        // Count bplaene per gemeinde
        const bplanGemeinden = new Set((bplaene || []).map((b: Record<string, string | null>) => b.gemeinde).filter(Boolean));
        // Count mietspiegel per bezirk
        const mietBezirke = new Set((mietspiegel || []).map((m: Record<string, string | null>) => m.bezirk).filter(Boolean));

        for (const [bez, q] of bezirkMap) {
          q.borisMatch = borisGemeinden.has(bez) ? 1 : 0;
          q.bplanMatch = bplanGemeinden.has(bez) ? 1 : 0;
          q.mietspiegelMatch = mietBezirke.has(bez) ? 1 : 0;
        }

        // Recalculate: count matching records per gemeinde
        const borisCount = new Map<string, number>();
        for (const b of boris || []) {
          const g = (b as Record<string, string | null>).gemeinde || "Unbekannt";
          borisCount.set(g, (borisCount.get(g) || 0) + 1);
        }
        const bplanCount = new Map<string, number>();
        for (const b of bplaene || []) {
          const g = (b as Record<string, string | null>).gemeinde || "Unbekannt";
          bplanCount.set(g, (bplanCount.get(g) || 0) + 1);
        }
        const mietCount = new Map<string, number>();
        for (const m of mietspiegel || []) {
          const g = (m as Record<string, string | null>).bezirk || "Unbekannt";
          mietCount.set(g, (mietCount.get(g) || 0) + 1);
        }

        for (const [bez, q] of bezirkMap) {
          q.borisMatch = borisCount.get(bez) || 0;
          q.bplanMatch = bplanCount.get(bez) || 0;
          q.mietspiegelMatch = mietCount.get(bez) || 0;
        }

        setData(Array.from(bezirkMap.values()));
      } catch (e) {
        console.error("QualityHeatmap error", e);
        setError(e instanceof Error ? e.message : "Fehler beim Laden");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const sorted = useMemo(() => {
    const arr = [...data];
    arr.sort((a, b) => {
      let cmp = 0;
      switch (sortKey) {
        case "bezirk": cmp = a.bezirk.localeCompare(b.bezirk); break;
        case "total": cmp = a.total - b.total; break;
        case "boris": cmp = a.borisMatch - b.borisMatch; break;
        case "bplan": cmp = a.bplanMatch - b.bplanMatch; break;
        case "mietspiegel": cmp = a.mietspiegelMatch - b.mietspiegelMatch; break;
      }
      return sortAsc ? cmp : -cmp;
    });
    return arr;
  }, [data, sortKey, sortAsc]);

  const totals = useMemo(() => {
    return data.reduce(
      (acc, d) => ({
        total: acc.total + d.total,
        boris: acc.boris + d.borisMatch,
        bplan: acc.bplan + d.bplanMatch,
        miet: acc.miet + d.mietspiegelMatch,
      }),
      { total: 0, boris: 0, bplan: 0, miet: 0 }
    );
  }, [data]);

  const handleSort = (key: typeof sortKey) => {
    if (sortKey === key) setSortAsc(!sortAsc);
    else { setSortKey(key); setSortAsc(true); }
  };

  const sortIcon = (key: typeof sortKey) =>
    sortKey === key ? (sortAsc ? " ↑" : " ↓") : "";

  if (loading) {
    return (
      <div className="bg-zinc-800 rounded-xl p-6 border border-zinc-700">
        <div className="flex items-center gap-3">
          <div className="animate-spin h-5 w-5 border-2 border-blue-400 border-t-transparent rounded-full" />
          <span className="text-zinc-400">Heatmap wird geladen…</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-zinc-800 rounded-xl p-6 border border-red-700 text-red-400">
        Fehler: {error}
      </div>
    );
  }

  if (data.length === 0) {
    return (
      <div className="bg-zinc-800 rounded-xl p-6 border border-zinc-700 text-zinc-400 text-center">
        Keine Daten für Heatmap verfügbar
      </div>
    );
  }

  // Overall quality score
  const overallScore = totals.total > 0
    ? Math.round(((totals.boris + totals.bplan + totals.miet) / (totals.total * 3)) * 100)
    : 0;

  return (
    <div className="space-y-4">
      {/* Summary */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-zinc-800 rounded-xl p-4 border border-zinc-700">
          <p className="text-sm text-zinc-400">Gemeinden/Bezirke</p>
          <p className="text-2xl font-bold text-white">{data.length}</p>
        </div>
        <div className="bg-zinc-800 rounded-xl p-4 border border-zinc-700">
          <p className="text-sm text-zinc-400">BORIS-Abdeckung</p>
          <p className="text-2xl font-bold text-amber-400">{totals.boris.toLocaleString("de-DE")}</p>
        </div>
        <div className="bg-zinc-800 rounded-xl p-4 border border-zinc-700">
          <p className="text-sm text-zinc-400">B-Plan-Abdeckung</p>
          <p className="text-2xl font-bold text-blue-400">{totals.bplan.toLocaleString("de-DE")}</p>
        </div>
        <div className="bg-zinc-800 rounded-xl p-4 border border-zinc-700">
          <p className="text-sm text-zinc-400">Gesamt-Qualität</p>
          <p className={`text-2xl font-bold ${overallScore >= 60 ? "text-emerald-400" : overallScore >= 30 ? "text-yellow-400" : "text-red-400"}`}>
            {overallScore}%
          </p>
        </div>
      </div>

      {/* Heatmap Table */}
      <div className="overflow-x-auto rounded-xl border border-zinc-700">
        <table className="w-full text-sm text-left text-zinc-300">
          <thead className="bg-zinc-800 text-zinc-400 uppercase text-xs">
            <tr>
              <th className="px-4 py-3 cursor-pointer hover:text-white" onClick={() => handleSort("bezirk")}>
                Gemeinde/Bezirk{sortIcon("bezirk")}
              </th>
              <th className="px-4 py-3 cursor-pointer hover:text-white text-right" onClick={() => handleSort("total")}>
                Flurstücke{sortIcon("total")}
              </th>
              <th className="px-4 py-3 cursor-pointer hover:text-white" onClick={() => handleSort("boris")}>
                BORIS{sortIcon("boris")}
              </th>
              <th className="px-4 py-3 cursor-pointer hover:text-white" onClick={() => handleSort("bplan")}>
                B-Pläne{sortIcon("bplan")}
              </th>
              <th className="px-4 py-3 cursor-pointer hover:text-white" onClick={() => handleSort("mietspiegel")}>
                Mietspiegel{sortIcon("mietspiegel")}
              </th>
              <th className="px-4 py-3">Qualität</th>
            </tr>
          </thead>
          <tbody>
            {sorted.map((row) => {
              const matches = (row.borisMatch > 0 ? 1 : 0) + (row.bplanMatch > 0 ? 1 : 0) + (row.mietspiegelMatch > 0 ? 1 : 0);
              const qualPct = Math.round((matches / 3) * 100);
              return (
                <tr key={row.bezirk} className="border-t border-zinc-700 hover:bg-zinc-800/50">
                  <td className="px-4 py-2 font-medium">{row.bezirk}</td>
                  <td className="px-4 py-2 text-right font-mono">{row.total.toLocaleString("de-DE")}</td>
                  <td className="px-4 py-2">
                    {row.borisMatch > 0
                      ? <span className="text-emerald-400">✓ {row.borisMatch}</span>
                      : <span className="text-red-400">✗</span>}
                  </td>
                  <td className="px-4 py-2">
                    {row.bplanMatch > 0
                      ? <span className="text-emerald-400">✓ {row.bplanMatch}</span>
                      : <span className="text-red-400">✗</span>}
                  </td>
                  <td className="px-4 py-2">
                    {row.mietspiegelMatch > 0
                      ? <span className="text-emerald-400">✓ {row.mietspiegelMatch}</span>
                      : <span className="text-red-400">✗</span>}
                  </td>
                  <td className="px-4 py-2">{pctBar(matches, 3)}</td>
                </tr>
              );
            })}
          </tbody>
          <tfoot className="bg-zinc-800/50 font-semibold">
            <tr className="border-t border-zinc-600">
              <td className="px-4 py-2">Gesamt</td>
              <td className="px-4 py-2 text-right font-mono">{totals.total.toLocaleString("de-DE")}</td>
              <td className="px-4 py-2 text-amber-400">{totals.boris}</td>
              <td className="px-4 py-2 text-blue-400">{totals.bplan}</td>
              <td className="px-4 py-2 text-purple-400">{totals.miet}</td>
              <td className="px-4 py-2">{pctBar(overallScore, 100)}</td>
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  );
}
