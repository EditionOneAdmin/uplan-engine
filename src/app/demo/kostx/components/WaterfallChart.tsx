'use client';

import { useState } from 'react';
import type { KostXResult, ZuschlagItem } from '../engine/kostx-types';

interface Props {
  result: KostXResult;
}

function fmt(v: number): string {
  return v.toLocaleString('de-DE', { maximumFractionDigits: 0 });
}

export default function WaterfallChart({ result }: Props) {
  const [hover, setHover] = useState<number | null>(null);
  const items = result.zuschlaege;
  if (items.length === 0) return null;

  const maxVal = Math.max(...items.map(i => Math.abs(i.wert_eurM2)));
  const chartH = 200;
  const barW = 40;
  const gap = 8;
  const totalW = items.length * (barW + gap);
  const scale = maxVal > 0 ? (chartH * 0.7) / maxVal : 1;

  let running = 0;

  return (
    <div className="p-4">
      <h3 className="text-sm font-semibold text-white/90 mb-3">Kostenaufbau (€/m² NUF)</h3>
      <div className="overflow-x-auto">
        <svg width={Math.max(totalW, 300)} height={chartH + 50} className="text-white">
          {items.map((item, i) => {
            const x = i * (barW + gap) + gap;
            const h = Math.abs(item.wert_eurM2) * scale;
            const isSum = item.typ === 'summe';
            const isBasis = item.typ === 'basis';

            let y: number;
            if (isBasis || isSum) {
              y = chartH - h;
              if (isBasis) running = item.wert_eurM2;
            } else {
              y = chartH - running * scale - h;
              running += item.wert_eurM2;
            }

            const fill = isSum ? '#6366f1' : isBasis ? '#3b82f6' : item.typ === 'abzug' ? '#ef4444' : '#10b981';

            return (
              <g key={i} onMouseEnter={() => setHover(i)} onMouseLeave={() => setHover(null)}>
                <rect x={x} y={y} width={barW} height={Math.max(h, 1)} rx={2} fill={fill} opacity={hover === i ? 1 : 0.8} className="transition-opacity" />
                <text x={x + barW / 2} y={chartH + 12} textAnchor="middle" className="fill-white/40" fontSize={8}>
                  {item.label.length > 8 ? item.label.slice(0, 7) + '…' : item.label}
                </text>
                <text x={x + barW / 2} y={y - 4} textAnchor="middle" className="fill-white/60" fontSize={8}>
                  {fmt(item.wert_eurM2)}
                </text>
                {hover === i && (
                  <g>
                    <rect x={x - 20} y={y - 35} width={barW + 40} height={20} rx={4} fill="#1e293b" stroke="#334155" strokeWidth={1} />
                    <text x={x + barW / 2} y={y - 21} textAnchor="middle" className="fill-white" fontSize={9} fontWeight="bold">
                      {item.label}: {fmt(item.wert_eurM2)} €/m²
                    </text>
                  </g>
                )}
              </g>
            );
          })}
        </svg>
      </div>
    </div>
  );
}
