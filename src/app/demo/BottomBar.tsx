"use client";

import type { Metrics } from "./types";

function ProgressBar({ value, label, unit }: { value: number; label: string; unit?: string }) {
  const pct = Math.min(value * 100, 100);
  const color = pct > 90 ? "#EF4444" : pct > 70 ? "#EAB308" : "#0D9488";
  return (
    <div className="min-w-[140px]">
      <div className="flex justify-between text-[11px] mb-1">
        <span className="text-white/50">{label}</span>
        <span className="text-white font-medium">{(value * 100).toFixed(0)}%{unit}</span>
      </div>
      <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-500"
          style={{ width: `${pct}%`, backgroundColor: color }}
        />
      </div>
    </div>
  );
}

function Stat({ label, value, unit }: { label: string; value: string | number; unit?: string }) {
  return (
    <div className="text-center min-w-[80px]">
      <div className="text-lg font-bold text-white">{value}</div>
      <div className="text-[10px] text-white/40 uppercase tracking-wider">
        {label}
        {unit && <span className="ml-0.5">{unit}</span>}
      </div>
    </div>
  );
}

export function BottomBar({ metrics, drawing, onToggleDraw }: { metrics: Metrics; drawing?: boolean; onToggleDraw?: () => void }) {
  return (
    <div className="bg-[#1E293B] border-t border-white/10 px-4 py-3 flex items-center gap-6 overflow-x-auto shrink-0">
      {onToggleDraw && (
        <>
          <button
            onClick={onToggleDraw}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all whitespace-nowrap ${
              drawing
                ? "bg-orange-500 text-white shadow-lg shadow-orange-500/30"
                : "bg-[#0D9488] text-white hover:bg-[#0F766E]"
            }`}
          >
            {drawing ? "✏️ Zeichne…" : "🖊️ Baufeld zeichnen"}
          </button>
          <div className="w-px h-8 bg-white/10 shrink-0" />
        </>
      )}
      <div className="flex items-center gap-1 mr-2">
        <span className="text-xs text-white/40 uppercase tracking-wider font-semibold">📊</span>
      </div>
      <ProgressBar value={metrics.grzUsage} label="GRZ" />
      <ProgressBar value={metrics.gfzUsage} label="GFZ" />
      <div className="w-px h-8 bg-white/10 shrink-0" />
      <Stat label="Wohneinheiten" value={metrics.totalUnits} />
      <Stat label="BGF" value={metrics.totalBGF.toLocaleString("de-DE")} unit="m²" />
      <Stat label="Stellplätze" value={metrics.parkingNeeded} />
      <div className="w-px h-8 bg-white/10 shrink-0" />
      {/* Compliance traffic light */}
      <div className="flex items-center gap-2">
        <div
          className={`w-3 h-3 rounded-full ${
            metrics.compliant ? "bg-green-500" : "bg-red-500"
          } shadow-lg`}
          style={{
            boxShadow: metrics.compliant
              ? "0 0 8px rgba(34,197,94,.5)"
              : "0 0 8px rgba(239,68,68,.5)",
          }}
        />
        <span className="text-xs text-white/60">
          {metrics.compliant ? "Konform" : "Überschreitung"}
        </span>
      </div>
    </div>
  );
}
