'use client';

import type { KostXResult, KGGruppe } from '../engine/kostx-types';

interface Props {
  result: KostXResult;
}

const KG_COLORS: Record<string, string> = {
  kg310: 'bg-blue-500', kg320: 'bg-sky-500', kg330: 'bg-cyan-500',
  kg340: 'bg-teal-500', kg350: 'bg-emerald-500', kg360: 'bg-green-500',
  kg380: 'bg-amber-500', kg390: 'bg-orange-500', kg3XX: 'bg-rose-500',
};

function fmt(v: number): string {
  return v.toLocaleString('de-DE', { maximumFractionDigits: 0 });
}

export default function CostBreakdown({ result }: Props) {
  const erloes = result.masses.erloesflaecheWarm_m2;
  const groups = Object.entries(result.kg300)
    .filter(([k]) => k.startsWith('kg3') && k !== 'kg3XX')
    .map(([key, grp]) => ({ key, grp: grp as KGGruppe }))
    .filter(({ grp }) => grp.total_eurBrutto > 0);

  const maxVal = Math.max(...groups.map(g => g.grp.total_eurBrutto));
  const total = result.kg300.total_eurBrutto;

  return (
    <div className="p-4">
      <h3 className="text-sm font-semibold text-white/90 mb-3">KG 300 Aufschlüsselung</h3>
      <div className="space-y-2">
        {groups.map(({ key, grp }) => {
          const pct = total > 0 ? (grp.total_eurBrutto / total) * 100 : 0;
          const barW = maxVal > 0 ? (grp.total_eurBrutto / maxVal) * 100 : 0;
          const m2 = erloes > 0 ? grp.total_eurBrutto / erloes : 0;
          return (
            <div key={key}>
              <div className="flex items-center justify-between text-xs mb-0.5">
                <span className="text-white/70 truncate flex-1">{grp.kg} {grp.bezeichnung}</span>
                <div className="flex gap-3 text-white/50 text-[10px] shrink-0 ml-2">
                  <span>{fmt(grp.total_eurBrutto)} €</span>
                  <span>{fmt(m2)} €/m²</span>
                  <span className="w-10 text-right">{pct.toFixed(1)}%</span>
                </div>
              </div>
              <div className="h-2 bg-white/5 rounded-full overflow-hidden">
                <div className={`h-full rounded-full ${KG_COLORS[key] || 'bg-slate-500'} transition-all duration-300`} style={{ width: `${barW}%` }} />
              </div>
            </div>
          );
        })}
      </div>
      <div className="mt-3 pt-2 border-t border-white/10 flex justify-between text-xs font-semibold">
        <span className="text-white/80">KG 300 Gesamt</span>
        <span className="text-white/90">{fmt(total)} € · {erloes > 0 ? fmt(total / erloes) : '—'} €/m²</span>
      </div>
    </div>
  );
}
