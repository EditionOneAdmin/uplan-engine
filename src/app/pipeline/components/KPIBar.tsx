"use client";

import { motion } from "framer-motion";
import { Grid3X3, Layers, Building2, Banknote, TrendingUp } from "lucide-react";

interface Props {
  baufelderCount: number;
  variantenCount: number;
  gesamtBGF: number;
  gesamtInvestment: number;
  avgRendite: number;
}

function formatNumber(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)} Mio`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(0)}k`;
  return n.toFixed(0);
}

export default function KPIBar({ baufelderCount, variantenCount, gesamtBGF, gesamtInvestment, avgRendite }: Props) {
  const kpis = [
    { icon: Grid3X3, label: "Baufelder", value: baufelderCount.toString() },
    { icon: Layers, label: "Varianten", value: variantenCount.toString() },
    { icon: Building2, label: "Gesamt-BGF", value: gesamtBGF > 0 ? `${formatNumber(gesamtBGF)} m²` : "—" },
    { icon: Banknote, label: "Investment", value: gesamtInvestment > 0 ? `${formatNumber(gesamtInvestment)} €` : "—" },
    { icon: TrendingUp, label: "Ø Rendite", value: avgRendite > 0 ? `${avgRendite.toFixed(1)}%` : "—" },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5"
    >
      {kpis.map((k) => (
        <div key={k.label} className="rounded-xl border border-gray-border bg-white p-4 shadow-sm">
          <div className="flex items-center gap-2 text-xs text-slate-text/50 mb-1">
            <k.icon className="h-3.5 w-3.5" /> {k.label}
          </div>
          <div className="text-xl font-bold text-primary">{k.value}</div>
        </div>
      ))}
    </motion.div>
  );
}
