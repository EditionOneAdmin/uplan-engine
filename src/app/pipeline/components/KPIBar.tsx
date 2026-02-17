"use client";

import { motion } from "framer-motion";
import { Home, Building2, Banknote, TrendingUp, Users, DollarSign } from "lucide-react";
import { fmtArea, fmtCurrency, fmtPercent } from "@/lib/pipeline-kpis";

interface Props {
  baufelderCount: number;
  variantenCount: number;
  gesamtBGF: number;
  gesamtInvestment: number;
  avgRendite: number;
  gesamtWF?: number;
  gesamtWE?: number;
  gesamtCashflow?: number;
}

export default function KPIBar({ baufelderCount, variantenCount, gesamtBGF, gesamtInvestment, avgRendite, gesamtWF, gesamtWE, gesamtCashflow }: Props) {
  const kpis = [
    { icon: Home, label: "Gesamt-WF", value: (gesamtWF ?? 0) > 0 ? fmtArea(gesamtWF ?? 0) : "—", primary: true },
    { icon: Building2, label: "Gesamt-BGF", value: gesamtBGF > 0 ? fmtArea(gesamtBGF) : "—", primary: false },
    { icon: Users, label: "Wohneinheiten", value: (gesamtWE ?? 0) > 0 ? (gesamtWE ?? 0).toString() : `${baufelderCount} BF / ${variantenCount} Var.`, primary: false },
    { icon: Banknote, label: "Gesamt-Investment", value: gesamtInvestment > 0 ? fmtCurrency(gesamtInvestment) : "—", primary: false },
    { icon: TrendingUp, label: "Ø Rendite", value: avgRendite > 0 ? fmtPercent(avgRendite) : "—", primary: false },
    { icon: DollarSign, label: "Cashflow/Jahr", value: (gesamtCashflow ?? 0) > 0 ? fmtCurrency(gesamtCashflow ?? 0) : "—", primary: false },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6"
    >
      {kpis.map(k => (
        <div
          key={k.label}
          className={`rounded-xl border p-4 shadow-sm ${
            k.primary
              ? "border-accent/30 bg-accent/5"
              : "border-gray-border bg-white"
          }`}
        >
          <div className="flex items-center gap-2 text-xs text-slate-text/50 mb-1">
            <k.icon className={`h-3.5 w-3.5 ${k.primary ? "text-accent" : ""}`} /> {k.label}
          </div>
          <div className={`text-lg font-bold ${k.primary ? "text-accent" : "text-primary"}`}>{k.value}</div>
        </div>
      ))}
    </motion.div>
  );
}
