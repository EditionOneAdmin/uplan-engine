'use client';

import { motion } from 'framer-motion';

interface CashflowEntry {
  month: number;
  cashOut: number;
  cashIn: number;
  cumulative: number;
}

interface Props {
  cashflows: CashflowEntry[] | null;
  breakEvenMonth?: number | null;
  peakCapital?: number | null;
  width?: number;
  height?: number;
}

const fmt = (v: number) =>
  new Intl.NumberFormat('de-DE', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(v);

export default function CashflowSparkline({
  cashflows,
  breakEvenMonth,
  width = 120,
  height = 40,
}: Props) {
  if (!cashflows || cashflows.length === 0) {
    return (
      <span className="text-xs text-gray-400 inline-block" style={{ width, height, lineHeight: `${height}px`, textAlign: 'center' }}>
        —
      </span>
    );
  }

  const pad = 2;
  const vals = cashflows.map((c) => c.cumulative);
  const minV = Math.min(...vals);
  const maxV = Math.max(...vals);
  const range = maxV - minV || 1;

  const toX = (i: number) => pad + ((width - 2 * pad) * i) / (cashflows.length - 1 || 1);
  const toY = (v: number) => pad + (height - 2 * pad) * (1 - (v - minV) / range);

  // Build segments colored by sign
  const segments: { d: string; color: string }[] = [];
  for (let i = 0; i < cashflows.length - 1; i++) {
    const x1 = toX(i), y1 = toY(vals[i]);
    const x2 = toX(i + 1), y2 = toY(vals[i + 1]);
    const neg = vals[i] < 0 && vals[i + 1] < 0;
    const pos = vals[i] >= 0 && vals[i + 1] >= 0;
    const color = neg ? '#dc2626' : pos ? '#16a34a' : '#ca8a04';
    segments.push({ d: `M${x1},${y1} L${x2},${y2}`, color });
  }

  // Break-even point
  let beDot: { cx: number; cy: number } | null = null;
  if (breakEvenMonth != null) {
    const idx = cashflows.findIndex((c) => c.month === breakEvenMonth);
    if (idx >= 0) {
      beDot = { cx: toX(idx), cy: toY(vals[idx]) };
    }
  }

  return (
    <motion.svg
      width={width}
      height={height}
      viewBox={`0 0 ${width} ${height}`}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="inline-block"
    >
      {/* zero line */}
      {minV < 0 && maxV > 0 && (
        <line x1={pad} x2={width - pad} y1={toY(0)} y2={toY(0)} stroke="#e5e7eb" strokeWidth={0.5} />
      )}
      {segments.map((s, i) => (
        <path key={i} d={s.d} stroke={s.color} strokeWidth={1.5} fill="none">
          <title>{`M${cashflows[i].month}: ${fmt(vals[i])}`}</title>
        </path>
      ))}
      {beDot && <circle cx={beDot.cx} cy={beDot.cy} r={2.5} fill="#16a34a" stroke="#fff" strokeWidth={0.5} />}
    </motion.svg>
  );
}
