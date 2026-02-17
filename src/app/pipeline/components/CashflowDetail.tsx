'use client';

import { useRef, useState, useEffect } from 'react';
import { motion } from 'framer-motion';

interface CashflowEntry {
  month: number;
  cashOut: number;
  cashIn: number;
  cumulative: number;
}

interface Props {
  cashflows: CashflowEntry[];
  baustart?: number;
  bauende?: number;
  vertriebsstart?: number;
  vertriebsende?: number;
  breakEvenMonth?: number | null;
  peakCapital?: number | null;
}

const fmtEur = (v: number) =>
  new Intl.NumberFormat('de-DE', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(v);

const fmtK = (v: number) => {
  if (Math.abs(v) >= 1_000_000) return `${(v / 1_000_000).toFixed(1)}M`;
  if (Math.abs(v) >= 1_000) return `${(v / 1_000).toFixed(0)}k`;
  return v.toFixed(0);
};

export default function CashflowDetail({
  cashflows,
  baustart,
  bauende,
  vertriebsstart,
  vertriebsende,
  breakEvenMonth,
  peakCapital,
}: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [svgWidth, setSvgWidth] = useState(600);
  const svgHeight = 200;
  const pad = { top: 20, right: 16, bottom: 28, left: 50 };

  useEffect(() => {
    if (!containerRef.current) return;
    const obs = new ResizeObserver((entries) => {
      for (const e of entries) setSvgWidth(e.contentRect.width);
    });
    obs.observe(containerRef.current);
    return () => obs.disconnect();
  }, []);

  if (!cashflows || cashflows.length === 0) {
    return <div className="text-xs text-gray-400 italic py-4 text-center">Keine Cashflow-Daten</div>;
  }

  const w = svgWidth - pad.left - pad.right;
  const h = svgHeight - pad.top - pad.bottom;

  const allVals = cashflows.flatMap((c) => [-c.cashOut, c.cashIn, c.cumulative]);
  const minV = Math.min(...allVals);
  const maxV = Math.max(...allVals);
  const range = maxV - minV || 1;

  const toX = (i: number) => pad.left + (w * i) / (cashflows.length - 1 || 1);
  const toY = (v: number) => pad.top + h * (1 - (v - minV) / range);
  const zeroY = toY(0);

  // Area paths
  const cashOutPath = cashflows
    .map((c, i) => `${i === 0 ? 'M' : 'L'}${toX(i)},${toY(-c.cashOut)}`)
    .join(' ') + ` L${toX(cashflows.length - 1)},${zeroY} L${toX(0)},${zeroY} Z`;

  const cashInPath = cashflows
    .map((c, i) => `${i === 0 ? 'M' : 'L'}${toX(i)},${toY(c.cashIn)}`)
    .join(' ') + ` L${toX(cashflows.length - 1)},${zeroY} L${toX(0)},${zeroY} Z`;

  const cumLine = cashflows
    .map((c, i) => `${i === 0 ? 'M' : 'L'}${toX(i)},${toY(c.cumulative)}`)
    .join(' ');

  // Phase bands helper
  const band = (start: number | undefined, end: number | undefined, color: string) => {
    if (start == null || end == null) return null;
    const si = cashflows.findIndex((c) => c.month >= start);
    const ei = cashflows.findIndex((c) => c.month >= end);
    if (si < 0) return null;
    const eiSafe = ei < 0 ? cashflows.length - 1 : ei;
    return (
      <rect
        key={`${start}-${end}`}
        x={toX(si)}
        y={pad.top}
        width={toX(eiSafe) - toX(si)}
        height={h}
        fill={color}
        opacity={0.08}
      />
    );
  };

  // Break-even line
  const beIdx = breakEvenMonth != null ? cashflows.findIndex((c) => c.month === breakEvenMonth) : -1;

  // Peak capital annotation
  const peakIdx = peakCapital != null
    ? cashflows.findIndex((c) => Math.abs(c.cumulative - peakCapital!) < 1)
    : -1;

  // X-axis labels (show every N months)
  const step = Math.max(1, Math.floor(cashflows.length / 8));
  const xLabels = cashflows.filter((_, i) => i % step === 0 || i === cashflows.length - 1);

  // Y-axis ticks
  const yTicks = [minV, minV + range * 0.25, minV + range * 0.5, minV + range * 0.75, maxV];

  // Summary stats
  const totalOut = cashflows.reduce((s, c) => s + c.cashOut, 0);
  const totalIn = cashflows.reduce((s, c) => s + c.cashIn, 0);

  return (
    <motion.div
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: 'auto' }}
      exit={{ opacity: 0, height: 0 }}
      className="w-full"
    >
      <div ref={containerRef} className="w-full">
        <svg width={svgWidth} height={svgHeight} viewBox={`0 0 ${svgWidth} ${svgHeight}`}>
          {/* Phase bands */}
          {band(baustart, bauende, '#9ca3af')}
          {band(vertriebsstart, vertriebsende, '#0D9488')}

          {/* Zero line */}
          <line x1={pad.left} x2={svgWidth - pad.right} y1={zeroY} y2={zeroY} stroke="#d1d5db" strokeWidth={0.5} />

          {/* Areas */}
          <path d={cashOutPath} fill="#dc2626" opacity={0.15} />
          <path d={cashInPath} fill="#16a34a" opacity={0.15} />

          {/* Cumulative line */}
          <path d={cumLine} fill="none" stroke="#1E3A5F" strokeWidth={2} />

          {/* Break-even */}
          {beIdx >= 0 && (
            <>
              <line
                x1={toX(beIdx)}
                x2={toX(beIdx)}
                y1={pad.top}
                y2={svgHeight - pad.bottom}
                stroke="#16a34a"
                strokeWidth={1}
                strokeDasharray="4 2"
              />
              <circle cx={toX(beIdx)} cy={toY(cashflows[beIdx].cumulative)} r={3} fill="#16a34a" />
            </>
          )}

          {/* Peak capital */}
          {peakIdx >= 0 && peakCapital != null && (
            <>
              <circle cx={toX(peakIdx)} cy={toY(peakCapital)} r={3} fill="#dc2626" />
              <text
                x={toX(peakIdx)}
                y={toY(peakCapital) - 8}
                textAnchor="middle"
                className="text-[9px] fill-red-600"
              >
                {fmtK(peakCapital)} €
              </text>
            </>
          )}

          {/* Y-axis */}
          {yTicks.map((v) => (
            <g key={v}>
              <line x1={pad.left} x2={svgWidth - pad.right} y1={toY(v)} y2={toY(v)} stroke="#f3f4f6" strokeWidth={0.5} />
              <text x={pad.left - 4} y={toY(v) + 3} textAnchor="end" className="text-[9px] fill-gray-400">
                {fmtK(v)}
              </text>
            </g>
          ))}

          {/* X-axis */}
          {xLabels.map((c) => {
            const i = cashflows.indexOf(c);
            return (
              <text
                key={c.month}
                x={toX(i)}
                y={svgHeight - pad.bottom + 14}
                textAnchor="middle"
                className="text-[9px] fill-gray-400"
              >
                M{c.month}
              </text>
            );
          })}

          {/* Phase labels */}
          {baustart != null && bauende != null && (() => {
            const si = cashflows.findIndex((c) => c.month >= baustart);
            const ei = cashflows.findIndex((c) => c.month >= bauende);
            if (si < 0) return null;
            const eiSafe = ei < 0 ? cashflows.length - 1 : ei;
            const mx = (toX(si) + toX(eiSafe)) / 2;
            return (
              <text x={mx} y={pad.top + 12} textAnchor="middle" className="text-[9px] fill-gray-500 font-medium">
                Bauphase
              </text>
            );
          })()}
          {vertriebsstart != null && vertriebsende != null && (() => {
            const si = cashflows.findIndex((c) => c.month >= vertriebsstart);
            const ei = cashflows.findIndex((c) => c.month >= vertriebsende);
            if (si < 0) return null;
            const eiSafe = ei < 0 ? cashflows.length - 1 : ei;
            const mx = (toX(si) + toX(eiSafe)) / 2;
            return (
              <text x={mx} y={pad.top + 12} textAnchor="middle" className="text-[9px] fill-teal-600 font-medium">
                Vertrieb
              </text>
            );
          })()}
        </svg>
      </div>

      {/* Summary stats */}
      <div className="grid grid-cols-4 gap-2 mt-2 text-xs">
        {[
          { label: 'Peak Capital', value: peakCapital != null ? fmtEur(peakCapital) : '—', color: 'text-red-600' },
          { label: 'Break-Even', value: breakEvenMonth != null ? `Monat ${breakEvenMonth}` : '—', color: 'text-green-600' },
          { label: 'Σ CashOut', value: fmtEur(totalOut), color: 'text-gray-700' },
          { label: 'Σ CashIn', value: fmtEur(totalIn), color: 'text-gray-700' },
        ].map((s) => (
          <div key={s.label} className="text-center">
            <div className="text-gray-400">{s.label}</div>
            <div className={`font-semibold tabular-nums ${s.color}`}>{s.value}</div>
          </div>
        ))}
      </div>
    </motion.div>
  );
}
