'use client';

import type { KostXResult } from '../engine/kostx-types';

interface Props {
  result: KostXResult;
}

function fmt(v: number, decimals = 0): string {
  return v.toLocaleString('de-DE', { minimumFractionDigits: decimals, maximumFractionDigits: decimals });
}

function KpiTile({ label, value, unit, good }: { label: string; value: string; unit: string; good: boolean }) {
  return (
    <div className={`rounded-xl p-3 border ${good ? 'border-emerald-500/30 bg-emerald-500/5' : 'border-red-500/30 bg-red-500/5'}`}>
      <div className="text-[10px] text-white/50 uppercase tracking-wider mb-1">{label}</div>
      <div className="flex items-baseline gap-1">
        <span className={`text-lg font-bold ${good ? 'text-emerald-400' : 'text-red-400'}`}>{value}</span>
        <span className="text-xs text-white/40">{unit}</span>
      </div>
    </div>
  );
}

export default function CostSummary({ result }: Props) {
  const basisM2 = result.basisHaus_eurM2;
  const gikM2 = result.gik.gik_eurM2;
  const rendite = result.economics.nettorendite * 100;
  const marge = result.economics.gikMarge * 100;
  const nuf = result.masses.erloesflaecheWarm_m2;
  const tgM2 = result.basement ? (nuf > 0 ? result.basement.total_eurBrutto / nuf : 0) : 0;
  const honorarM2 = result.honorar.total_eurM2NUF;

  return (
    <div className="sticky top-0 z-10 bg-white/[0.02] backdrop-blur-sm border-b border-white/10 p-4">
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
        <KpiTile label="KG 300+400" value={fmt(basisM2)} unit="€/m²" good={basisM2 < 3500} />
        <KpiTile label="Tiefgarage" value={result.basement ? fmt(tgM2) : '—'} unit={result.basement ? '€/m²' : ''} good={tgM2 < 800 || !result.basement} />
        <KpiTile label="Honorare" value={fmt(honorarM2)} unit="€/m²" good={honorarM2 < 800} />
        <KpiTile label="GIK" value={fmt(gikM2)} unit="€/m²" good={gikM2 < 5000} />
        <KpiTile label="Rendite" value={fmt(rendite, 1)} unit="%" good={rendite > 4} />
        <KpiTile label="Marge" value={fmt(marge, 1)} unit="%" good={marge > 10} />
      </div>
    </div>
  );
}
