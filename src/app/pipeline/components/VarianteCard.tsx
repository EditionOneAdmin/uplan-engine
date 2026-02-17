"use client";

import { motion } from "framer-motion";
import { Star, Trash2, MapPin, ExternalLink } from "lucide-react";
import type { Variante } from "@/types/pipeline";
import { extractKPIs, healthScore, fmtArea, fmtCurrency, fmtPercent, fmtEuroM2, renditeColor, dscrColor } from "@/lib/pipeline-kpis";

interface Props {
  variante: Variante;
  onSetFavorite: () => void;
  onDelete: () => void;
  isTopPerformer?: boolean;
}

function CompBadge({ val, compliant }: { val: number | null; compliant?: boolean | null }) {
  if (val === null) return <span className="text-slate-text/30">—</span>;
  const color = compliant === true ? "text-green-600" : compliant === false ? "text-red-600" : "text-primary";
  return <span className={color}>{val.toLocaleString("de-DE", { maximumFractionDigits: 2 })} {compliant === true ? "✅" : compliant === false ? "⚠️" : ""}</span>;
}

function KPIRow({ label, value, className = "" }: { label: string; value: string; className?: string }) {
  return (
    <div className="flex justify-between items-baseline gap-2">
      <span className="text-[11px] text-slate-text/50 truncate">{label}</span>
      <span className={`text-xs font-semibold text-right whitespace-nowrap ${className}`}>{value}</span>
    </div>
  );
}

function RenditeGrid({ items }: { items: { label: string; value: string; colorClass?: string }[] }) {
  return (
    <div className="grid grid-cols-2 gap-x-3 gap-y-1">
      {items.map(i => (
        <div key={i.label} className="flex justify-between items-baseline gap-1">
          <span className="text-[10px] text-slate-text/50 truncate">{i.label}</span>
          <span className={`text-[11px] font-semibold whitespace-nowrap ${i.colorClass || ""}`}>{i.value}</span>
        </div>
      ))}
    </div>
  );
}

const AMPEL = { green: "🟢", yellow: "🟡", red: "🔴" } as const;

export default function VarianteCard({ variante, onSetFavorite, onDelete, isTopPerformer }: Props) {
  const k = extractKPIs(variante);
  const isHold = k.strategy === "hold";
  const isSell = k.strategy === "sell";
  const health = healthScore(k);

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className={`relative rounded-xl border p-4 transition ${
        variante.is_favorite
          ? "border-amber-300 bg-amber-50/50 shadow-sm"
          : "border-gray-border bg-white hover:shadow-sm"
      }`}
    >
      {variante.is_favorite && (
        <span className="absolute -top-2 -right-2 flex h-6 w-6 items-center justify-center rounded-full bg-amber-400 text-white text-xs shadow">⭐</span>
      )}
      {isTopPerformer && (
        <span className="absolute -top-2 -left-2 flex h-6 items-center justify-center rounded-full bg-green-500 text-white text-[10px] font-bold px-1.5 shadow">🏆 Best</span>
      )}

      {/* Header */}
      <div className="flex items-start gap-3 mb-3">
        <div className="h-14 w-14 shrink-0 rounded-lg bg-gray-bg flex items-center justify-center overflow-hidden">
          {variante.map_snapshot_url ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={variante.map_snapshot_url} alt="" className="h-full w-full object-cover" />
          ) : (
            <MapPin className="h-5 w-5 text-slate-text/30" />
          )}
        </div>
        <div className="flex-1 min-w-0">
          <h4 className="text-sm font-semibold text-primary truncate">
            {AMPEL[health]} {variante.name}
          </h4>
          <div className="flex items-center gap-2 mt-0.5">
            {k.strategy && (
              <span className={`inline-block rounded-full px-2 py-0.5 text-[10px] font-bold ${
                isHold ? "bg-blue-100 text-blue-700" : "bg-purple-100 text-purple-700"
              }`}>
                {isHold ? "Hold" : "Sell"}
              </span>
            )}
            {k.wohnflaeche !== null && (
              <span className="text-sm font-bold text-accent">{fmtArea(k.wohnflaeche)}</span>
            )}
          </div>
        </div>
      </div>

      {/* KPI Grid */}
      <div className="space-y-2">
        {/* Flächen */}
        <div className="rounded-lg bg-gray-bg/60 px-3 py-2 space-y-1">
          <div className="text-[10px] font-bold text-slate-text/40 uppercase tracking-wider mb-0.5">Flächen</div>
          <KPIRow label="BGF" value={fmtArea(k.bgf)} />
          <KPIRow label="Wohneinheiten" value={k.units !== null ? k.units.toString() : "—"} />
          {k.grzUsage !== null && (
            <div className="flex justify-between items-baseline gap-2">
              <span className="text-[11px] text-slate-text/50">GRZ</span>
              <CompBadge val={k.grzUsage} compliant={k.compliant} />
            </div>
          )}
          {k.gfzUsage !== null && (
            <div className="flex justify-between items-baseline gap-2">
              <span className="text-[11px] text-slate-text/50">GFZ</span>
              <CompBadge val={k.gfzUsage} compliant={k.compliant} />
            </div>
          )}
          {k.parkingNeeded !== null && (
            <KPIRow label="Stellplätze" value={k.parkingNeeded.toString()} />
          )}
        </div>

        {/* Kosten */}
        <div className="rounded-lg bg-gray-bg/60 px-3 py-2 space-y-1">
          <div className="text-[10px] font-bold text-slate-text/40 uppercase tracking-wider mb-0.5">Kosten</div>
          <KPIRow label="Gesamtinvestition" value={fmtCurrency(k.gesamtinvestition)} />
          {k.grundstueckskosten !== null && <KPIRow label="Grundstück" value={fmtCurrency(k.grundstueckskosten)} />}
          {k.baukosten !== null && <KPIRow label="Baukosten (KG 200-500)" value={fmtCurrency(k.baukosten)} />}
          <KPIRow label="€/m² BGF" value={fmtEuroM2(k.euroProM2BGF)} />
          <KPIRow label="€/m² WF" value={fmtEuroM2(k.euroProM2WF)} />
          <KPIRow label="EK-Bedarf" value={fmtCurrency(k.ekBedarf)} />
          {k.ekQuote !== null && <KPIRow label="EK-Quote" value={fmtPercent(k.ekQuote)} />}
          {k.fkVolumen !== null && <KPIRow label="FK-Volumen" value={fmtCurrency(k.fkVolumen)} />}
          {k.annuitaetJahr !== null && <KPIRow label="Annuität p.a." value={fmtCurrency(k.annuitaetJahr)} />}
        </div>

        {/* Rendite */}
        <div className="rounded-lg bg-gray-bg/60 px-3 py-2 space-y-1">
          <div className="text-[10px] font-bold text-slate-text/40 uppercase tracking-wider mb-0.5">Rendite</div>
          {isHold ? (
            <>
              <RenditeGrid items={[
                { label: "NIY", value: fmtPercent(k.niy), colorClass: renditeColor(k.niy) },
                { label: "IRR", value: fmtPercent(k.irrHold), colorClass: renditeColor(k.irrHold) },
                { label: "CoC", value: fmtPercent(k.cashOnCash), colorClass: renditeColor(k.cashOnCash) },
                { label: "DSCR", value: k.dscr !== null ? k.dscr.toLocaleString("de-DE", { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : "—", colorClass: dscrColor(k.dscr) },
              ]} />
              <KPIRow label="Jahresmiete" value={fmtCurrency(k.jahresmiete)} />
              <KPIRow label="Miete/m²" value={fmtEuroM2(k.mieteProM2)} />
              {k.ekMultiplikator !== null && <KPIRow label="EK-Multiplikator" value={`${k.ekMultiplikator.toLocaleString("de-DE", { maximumFractionDigits: 2 })}x`} />}
            </>
          ) : isSell ? (
            <>
              <RenditeGrid items={[
                { label: "Marge", value: fmtPercent(k.marge), colorClass: renditeColor(k.marge) },
                { label: "EK-Rendite", value: fmtPercent(k.ekRenditeSell), colorClass: renditeColor(k.ekRenditeSell) },
                { label: "IRR (Sell)", value: fmtPercent(k.irrSell), colorClass: renditeColor(k.irrSell) },
                { label: "EK-Multipl.", value: k.ekMultiplikator !== null ? `${k.ekMultiplikator.toLocaleString("de-DE", { maximumFractionDigits: 2 })}x` : "—" },
              ]} />
              <KPIRow label="Verkaufserlös" value={fmtCurrency(k.verkaufserloes)} />
              <KPIRow label="Verkauf/m²" value={fmtEuroM2(k.verkaufProM2)} />
            </>
          ) : (
            <>
              {k.rendite !== null && <KPIRow label="Rendite" value={fmtPercent(k.rendite)} className={renditeColor(k.rendite)} />}
            </>
          )}
          {k.breakEvenMonth !== null && <KPIRow label="Break-Even" value={`Monat ${k.breakEvenMonth}`} />}
        </div>
      </div>

      {/* Actions */}
      <div className="mt-3 flex items-center gap-2">
        {!variante.is_favorite && (
          <button onClick={onSetFavorite} className="flex items-center gap-1 rounded-lg border border-gray-border px-2.5 py-1.5 text-xs text-slate-text/60 hover:border-amber-300 hover:text-amber-600 transition">
            <Star className="h-3 w-3" /> Als Favorit
          </button>
        )}
        <a
          href={`/uplan-engine/demo/?loadVariante=${variante.id}`}
          className="flex items-center gap-1 rounded-lg border border-gray-border px-2.5 py-1.5 text-xs text-accent hover:border-accent hover:bg-accent/5 transition"
        >
          <ExternalLink className="h-3 w-3" /> In Demo öffnen
        </a>
        <button onClick={onDelete} className="flex items-center gap-1 rounded-lg border border-gray-border px-2.5 py-1.5 text-xs text-red-500/70 hover:border-red-300 hover:text-red-600 transition ml-auto">
          <Trash2 className="h-3 w-3" />
        </button>
      </div>
    </motion.div>
  );
}
