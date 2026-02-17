"use client";

import { motion } from "framer-motion";
import { Home, Building2, Banknote, TrendingUp, Users, DollarSign, Percent, BarChart3, Shield, CalendarCheck, CreditCard, PiggyBank } from "lucide-react";
import { fmtArea, fmtCurrency, fmtPercent, renditeColor, dscrColor } from "@/lib/pipeline-kpis";

interface Props {
  baufelderCount: number;
  variantenCount: number;
  gesamtBGF: number;
  gesamtInvestment: number;
  avgRendite: number;
  gesamtWF?: number;
  gesamtWE?: number;
  gesamtCashflow?: number;
  // New optional aggregated KPIs
  gesamtEK?: number;
  gesamtFK?: number;
  avgEKQuote?: number;
  avgIRR?: number;
  avgDSCR?: number;
  gesamtAnnuitaet?: number;
  avgBreakEven?: number;
}

function KPICell({ icon: Icon, label, value, primary, colorClass }: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string;
  primary?: boolean;
  colorClass?: string;
}) {
  return (
    <div className={`rounded-xl border p-3 shadow-sm ${
      primary ? "border-accent/30 bg-accent/5" : "border-gray-border bg-white"
    }`}>
      <div className="flex items-center gap-1.5 text-[10px] text-slate-text/50 mb-0.5">
        <Icon className={`h-3 w-3 ${primary ? "text-accent" : ""}`} /> {label}
      </div>
      <div className={`text-sm font-bold ${colorClass || (primary ? "text-accent" : "text-primary")}`}>{value}</div>
    </div>
  );
}

export default function KPIBar({
  baufelderCount, variantenCount, gesamtBGF, gesamtInvestment, avgRendite,
  gesamtWF, gesamtWE, gesamtCashflow,
  gesamtEK, gesamtFK, avgEKQuote, avgIRR, avgDSCR, gesamtAnnuitaet, avgBreakEven,
}: Props) {
  const row1 = [
    { icon: Home, label: "Gesamt-WF", value: (gesamtWF ?? 0) > 0 ? fmtArea(gesamtWF ?? 0) : "—", primary: true },
    { icon: Building2, label: "BGF", value: gesamtBGF > 0 ? fmtArea(gesamtBGF) : "—" },
    { icon: Users, label: "WE", value: (gesamtWE ?? 0) > 0 ? (gesamtWE ?? 0).toString() : `${baufelderCount} BF / ${variantenCount} Var.` },
    { icon: Banknote, label: "Gesamt-Investment", value: gesamtInvestment > 0 ? fmtCurrency(gesamtInvestment) : "—" },
    { icon: PiggyBank, label: "EK-Bedarf", value: (gesamtEK ?? 0) > 0 ? fmtCurrency(gesamtEK!) : "—" },
    { icon: CreditCard, label: "FK-Volumen", value: (gesamtFK ?? 0) > 0 ? fmtCurrency(gesamtFK!) : "—" },
  ];

  const row2 = [
    { icon: Percent, label: "EK-Quote", value: avgEKQuote != null ? fmtPercent(avgEKQuote) : "—", colorClass: "" },
    { icon: TrendingUp, label: "Ø IRR", value: avgIRR != null ? fmtPercent(avgIRR) : avgRendite > 0 ? fmtPercent(avgRendite) : "—", colorClass: renditeColor(avgIRR ?? avgRendite ?? null) },
    { icon: Shield, label: "Ø DSCR", value: avgDSCR != null ? avgDSCR.toLocaleString("de-DE", { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : "—", colorClass: dscrColor(avgDSCR ?? null) },
    { icon: DollarSign, label: "Cashflow/Jahr", value: (gesamtCashflow ?? 0) > 0 ? fmtCurrency(gesamtCashflow ?? 0) : "—", colorClass: "" },
    { icon: BarChart3, label: "Annuität p.a.", value: (gesamtAnnuitaet ?? 0) > 0 ? fmtCurrency(gesamtAnnuitaet!) : "—", colorClass: "" },
    { icon: CalendarCheck, label: "Break-Even", value: avgBreakEven != null ? `Monat ${Math.round(avgBreakEven)}` : "—", colorClass: "" },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-3"
    >
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-6">
        {row1.map(k => (
          <KPICell key={k.label} icon={k.icon} label={k.label} value={k.value} primary={k.primary} />
        ))}
      </div>
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-6">
        {row2.map(k => (
          <KPICell key={k.label} icon={k.icon} label={k.label} value={k.value} colorClass={k.colorClass} />
        ))}
      </div>
    </motion.div>
  );
}
