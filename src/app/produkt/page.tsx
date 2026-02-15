"use client";

import { useRef, useState } from "react";
import { motion, useInView } from "framer-motion";
import {
  ScanLine,
  BookOpen,
  Layers3,
  PackageCheck,
  MapPin,
  Ruler,
  Building2,
  FileText,
  CheckCircle2,
  ArrowRight,
  ArrowDown,
  Scale,
  Landmark,
  BarChart3,
  ShieldCheck,
  Download,
  ClipboardList,
  GitBranch,
  Zap,
  Search,
  Database,
  Box,
  FileOutput,
  ChevronRight,
} from "lucide-react";

/* ─── Helpers ──────────────────────────────────────────── */

function Section({
  children,
  className = "",
  id,
  gray = false,
}: {
  children: React.ReactNode;
  className?: string;
  id?: string;
  gray?: boolean;
}) {
  return (
    <section
      id={id}
      className={`py-24 md:py-32 ${gray ? "bg-gray-bg" : "bg-white"} ${className}`}
    >
      <div className="mx-auto max-w-6xl px-6">{children}</div>
    </section>
  );
}

function FadeIn({
  children,
  className = "",
  delay = 0,
}: {
  children: React.ReactNode;
  className?: string;
  delay?: number;
}) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });
  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 32 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.6, delay, ease: [0.25, 0.4, 0.25, 1] }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

function SectionHeading({
  title,
  subtitle,
}: {
  title: string;
  subtitle?: string;
}) {
  return (
    <FadeIn className="mb-16 text-center">
      <h2 className="text-3xl font-bold tracking-tight text-primary md:text-4xl lg:text-[2.75rem]">
        {title}
      </h2>
      {subtitle && (
        <p className="mx-auto mt-4 max-w-2xl text-lg text-slate-text/70">
          {subtitle}
        </p>
      )}
    </FadeIn>
  );
}

function ModuleBadge({ label, color }: { label: string; color: string }) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold tracking-wide uppercase ${color}`}
    >
      {label}
    </span>
  );
}

/* ─── NAV ──────────────────────────────────────────────── */

function Nav() {
  return (
    <motion.header
      className="fixed top-0 right-0 left-0 z-50 border-b border-gray-border/60 bg-white/80 backdrop-blur-lg"
      initial={{ y: -80 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-3">
        <a href="/uplan-engine/" className="flex items-center gap-2">
          <svg width="28" height="28" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
            <rect width="32" height="32" rx="8" fill="#1E3A5F" />
            <path d="M8 10h6a4 4 0 0 1 0 8H8V10z" fill="white" />
            <path d="M17 14h7a4 4 0 0 1 0 8h-7V14z" fill="#0D9488" />
          </svg>
          <span className="text-lg font-bold text-primary">U-Plan Engine</span>
        </a>
        <nav className="hidden gap-6 text-sm font-medium text-slate-text/60 md:flex">
          <a href="/uplan-engine/" className="transition hover:text-primary">Startseite</a>
          <a href="/uplan-engine/produkt" className="text-primary font-semibold">Produkt</a>
          <a href="/uplan-engine/#technologie" className="transition hover:text-primary">Technologie</a>
          <a href="/uplan-engine/#faq" className="transition hover:text-primary">FAQ</a>
        </nav>
        <a
          href="/uplan-engine/#kontakt"
          className="rounded-lg bg-accent px-5 py-2 text-sm font-semibold text-white transition hover:bg-accent-light"
        >
          Demo anfragen
        </a>
      </div>
    </motion.header>
  );
}

/* ─── HERO ─────────────────────────────────────────────── */

function Hero() {
  return (
    <section className="relative overflow-hidden bg-white pt-32 pb-20 md:pt-40 md:pb-28">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--color-primary)/4%,transparent_70%)]" />
      <div className="relative mx-auto max-w-6xl px-6 text-center">
        <FadeIn>
          <ModuleBadge label="Plattform" color="bg-primary/10 text-primary" />
        </FadeIn>
        <FadeIn delay={0.1}>
          <h1 className="mt-6 text-4xl font-bold tracking-tight text-primary md:text-5xl lg:text-6xl">
            Vier Module.{" "}
            <span className="text-accent">Eine Pipeline.</span>
          </h1>
        </FadeIn>
        <FadeIn delay={0.2}>
          <p className="mx-auto mt-6 max-w-2xl text-lg text-slate-text/70 md:text-xl">
            Von der Flurstücksnummer bis zum einreichungsfertigen Paket —
            U-Plan Engine verbindet vier spezialisierte Module zu einem
            durchgängigen, automatisierten Workflow.
          </p>
        </FadeIn>
        <FadeIn delay={0.3}>
          <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
            {[
              { icon: ScanLine, label: "SiteScan", color: "text-blue-600 bg-blue-50" },
              { icon: BookOpen, label: "RuleCompiler", color: "text-amber-600 bg-amber-50" },
              { icon: Layers3, label: "PlanGen", color: "text-emerald-600 bg-emerald-50" },
              { icon: PackageCheck, label: "SubmitPack", color: "text-violet-600 bg-violet-50" },
            ].map((m, i) => (
              <a
                key={m.label}
                href={`#${m.label.toLowerCase()}`}
                className="flex items-center gap-2 rounded-full border border-gray-border px-4 py-2 text-sm font-medium text-slate-text/80 transition hover:border-primary/30 hover:shadow-md"
              >
                <span className={`flex h-7 w-7 items-center justify-center rounded-full ${m.color}`}>
                  <m.icon className="h-3.5 w-3.5" />
                </span>
                {m.label}
              </a>
            ))}
          </div>
        </FadeIn>
      </div>
    </section>
  );
}

/* ─── MODULE SECTIONS ──────────────────────────────────── */

/* -- SiteScan Mockup -- */
function SiteScanMockup() {
  return (
    <div className="rounded-xl border border-gray-border bg-white p-4 shadow-lg">
      <div className="flex items-center gap-2 border-b border-gray-border pb-3 mb-4">
        <div className="flex gap-1.5">
          <div className="h-3 w-3 rounded-full bg-red-400" />
          <div className="h-3 w-3 rounded-full bg-yellow-400" />
          <div className="h-3 w-3 rounded-full bg-green-400" />
        </div>
        <span className="text-xs font-medium text-slate-text/40">SiteScan — Standortanalyse</span>
      </div>
      <div className="flex gap-3 mb-4">
        <div className="flex-1 rounded-lg bg-gray-bg p-3">
          <div className="flex items-center gap-2 mb-2">
            <Search className="h-3.5 w-3.5 text-blue-500" />
            <span className="text-xs font-medium text-slate-text/70">Flurstück</span>
          </div>
          <div className="rounded bg-white border border-gray-border px-3 py-2 text-sm text-slate-text">
            12/345/67 · Berlin Mitte
          </div>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-2">
        <div className="rounded-lg bg-blue-50 p-3">
          <div className="text-[10px] uppercase tracking-wider text-blue-400 font-semibold">Fläche</div>
          <div className="mt-1 text-lg font-bold text-blue-700">1.247 m²</div>
        </div>
        <div className="rounded-lg bg-blue-50 p-3">
          <div className="text-[10px] uppercase tracking-wider text-blue-400 font-semibold">B-Plan</div>
          <div className="mt-1 text-lg font-bold text-blue-700">IV-201a</div>
        </div>
        <div className="rounded-lg bg-blue-50 p-3">
          <div className="text-[10px] uppercase tracking-wider text-blue-400 font-semibold">Baugebiet</div>
          <div className="mt-1 text-sm font-bold text-blue-700">WA (Allg. Wohn)</div>
        </div>
        <div className="rounded-lg bg-emerald-50 p-3">
          <div className="text-[10px] uppercase tracking-wider text-emerald-400 font-semibold">Status</div>
          <div className="mt-1 flex items-center gap-1 text-sm font-bold text-emerald-700">
            <CheckCircle2 className="h-3.5 w-3.5" /> Vollständig
          </div>
        </div>
      </div>
    </div>
  );
}

/* -- RuleCompiler Mockup -- */
function RuleCompilerMockup() {
  const rules = [
    { key: "GRZ", value: "0.4", source: "§ 17 BauNVO" },
    { key: "GFZ", value: "1.2", source: "B-Plan IV-201a" },
    { key: "Geschosse", value: "max. IV", source: "B-Plan IV-201a" },
    { key: "Abstand N", value: "≥ 3.0 m", source: "§ 6 BauO Bln" },
    { key: "Stellplätze", value: "1 / WE", source: "StellplVO Bln" },
  ];
  return (
    <div className="rounded-xl border border-gray-border bg-white p-4 shadow-lg">
      <div className="flex items-center gap-2 border-b border-gray-border pb-3 mb-4">
        <div className="flex gap-1.5">
          <div className="h-3 w-3 rounded-full bg-red-400" />
          <div className="h-3 w-3 rounded-full bg-yellow-400" />
          <div className="h-3 w-3 rounded-full bg-green-400" />
        </div>
        <span className="text-xs font-medium text-slate-text/40">RuleCompiler — Constraint-Set</span>
      </div>
      <div className="space-y-2">
        {rules.map((r) => (
          <div key={r.key} className="flex items-center justify-between rounded-lg bg-amber-50/60 px-3 py-2">
            <div className="flex items-center gap-2">
              <Scale className="h-3.5 w-3.5 text-amber-500" />
              <span className="text-sm font-semibold text-slate-text">{r.key}</span>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-sm font-bold text-amber-700">{r.value}</span>
              <span className="rounded bg-white px-2 py-0.5 text-[10px] text-slate-text/50 border border-gray-border">{r.source}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* -- PlanGen Mockup -- */
function PlanGenMockup() {
  const variants = [
    { name: "Maximal", score: 72, floors: "IV", units: 16, bgf: "2.496", risk: "Mittel", color: "text-orange-600" },
    { name: "Standard", score: 91, floors: "III", units: 12, bgf: "1.872", risk: "Gering", color: "text-emerald-600" },
    { name: "Risikoarm", score: 98, floors: "II", units: 8, bgf: "1.248", risk: "Minimal", color: "text-emerald-700" },
  ];
  return (
    <div className="rounded-xl border border-gray-border bg-white p-4 shadow-lg">
      <div className="flex items-center gap-2 border-b border-gray-border pb-3 mb-4">
        <div className="flex gap-1.5">
          <div className="h-3 w-3 rounded-full bg-red-400" />
          <div className="h-3 w-3 rounded-full bg-yellow-400" />
          <div className="h-3 w-3 rounded-full bg-green-400" />
        </div>
        <span className="text-xs font-medium text-slate-text/40">PlanGen — Variantenvergleich</span>
      </div>
      <div className="overflow-hidden rounded-lg border border-gray-border">
        <div className="grid grid-cols-4 bg-gray-bg text-[11px] font-semibold uppercase tracking-wider text-slate-text/50">
          <div className="px-3 py-2">Variante</div>
          <div className="px-3 py-2">Geschosse</div>
          <div className="px-3 py-2">WE</div>
          <div className="px-3 py-2">Score</div>
        </div>
        {variants.map((v) => (
          <div key={v.name} className="grid grid-cols-4 border-t border-gray-border text-sm">
            <div className="px-3 py-2.5 font-semibold text-slate-text">{v.name}</div>
            <div className="px-3 py-2.5 text-slate-text/70">{v.floors}</div>
            <div className="px-3 py-2.5 text-slate-text/70">{v.units}</div>
            <div className={`px-3 py-2.5 font-bold ${v.color}`}>{v.score}%</div>
          </div>
        ))}
      </div>
      <div className="mt-3 flex items-center gap-2 text-xs text-slate-text/50">
        <ShieldCheck className="h-3.5 w-3.5 text-emerald-500" />
        Compliance-Score basiert auf Constraint-Matching
      </div>
    </div>
  );
}

/* -- SubmitPack Mockup -- */
function SubmitPackMockup() {
  const docs = [
    { name: "Lageplan_1-500.pdf", status: "ready" },
    { name: "Bauzeichnungen.pdf", status: "ready" },
    { name: "Baubeschreibung.pdf", status: "ready" },
    { name: "Statik_Nachweis.pdf", status: "ready" },
    { name: "Stellplatznachweis.pdf", status: "ready" },
    { name: "Brandschutzkonzept.pdf", status: "pending" },
  ];
  return (
    <div className="rounded-xl border border-gray-border bg-white p-4 shadow-lg">
      <div className="flex items-center gap-2 border-b border-gray-border pb-3 mb-4">
        <div className="flex gap-1.5">
          <div className="h-3 w-3 rounded-full bg-red-400" />
          <div className="h-3 w-3 rounded-full bg-yellow-400" />
          <div className="h-3 w-3 rounded-full bg-green-400" />
        </div>
        <span className="text-xs font-medium text-slate-text/40">SubmitPack — Einreichung</span>
      </div>
      <div className="mb-3 flex items-center justify-between">
        <span className="text-xs font-semibold text-slate-text/60">Vollständigkeit</span>
        <span className="text-sm font-bold text-emerald-600">83%</span>
      </div>
      <div className="mb-4 h-2 rounded-full bg-gray-bg overflow-hidden">
        <div className="h-full w-[83%] rounded-full bg-gradient-to-r from-emerald-400 to-emerald-500" />
      </div>
      <div className="space-y-1.5">
        {docs.map((d) => (
          <div key={d.name} className="flex items-center justify-between rounded-lg bg-violet-50/50 px-3 py-2">
            <div className="flex items-center gap-2">
              <FileText className="h-3.5 w-3.5 text-violet-500" />
              <span className="text-xs font-medium text-slate-text">{d.name}</span>
            </div>
            {d.status === "ready" ? (
              <CheckCircle2 className="h-4 w-4 text-emerald-500" />
            ) : (
              <div className="h-4 w-4 rounded-full border-2 border-amber-400" />
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

/* -- Module Section Component -- */
function ModuleSection({
  id,
  index,
  icon: Icon,
  badge,
  badgeColor,
  title,
  subtitle,
  features,
  input,
  output,
  mockup,
  gray = false,
}: {
  id: string;
  index: number;
  icon: React.ElementType;
  badge: string;
  badgeColor: string;
  title: string;
  subtitle: string;
  features: { icon: React.ElementType; text: string }[];
  input: string;
  output: string;
  mockup: React.ReactNode;
  gray?: boolean;
}) {
  const isReversed = index % 2 === 1;
  return (
    <Section id={id} gray={gray}>
      <div className={`grid gap-12 lg:grid-cols-2 lg:gap-16 items-center ${isReversed ? "lg:[direction:rtl]" : ""}`}>
        <div className={isReversed ? "lg:[direction:ltr]" : ""}>
          <FadeIn>
            <ModuleBadge label={badge} color={badgeColor} />
            <h2 className="mt-4 text-3xl font-bold tracking-tight text-primary md:text-4xl">
              {title}
            </h2>
            <p className="mt-3 text-lg text-slate-text/70">{subtitle}</p>
          </FadeIn>
          <FadeIn delay={0.1}>
            <div className="mt-8 space-y-4">
              {features.map((f, i) => (
                <div key={i} className="flex items-start gap-3">
                  <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-gray-bg">
                    <f.icon className="h-4 w-4 text-primary" />
                  </span>
                  <span className="text-sm text-slate-text/80 leading-relaxed">{f.text}</span>
                </div>
              ))}
            </div>
          </FadeIn>
          <FadeIn delay={0.2}>
            <div className="mt-8 rounded-xl border border-gray-border bg-gray-bg/50 p-4">
              <div className="flex items-center gap-3 text-sm">
                <span className="rounded-md bg-primary/10 px-2.5 py-1 font-semibold text-primary text-xs">Input</span>
                <span className="text-slate-text/70">{input}</span>
              </div>
              <div className="my-2 flex justify-center">
                <ArrowDown className="h-4 w-4 text-accent" />
              </div>
              <div className="flex items-center gap-3 text-sm">
                <span className="rounded-md bg-accent/10 px-2.5 py-1 font-semibold text-accent text-xs">Output</span>
                <span className="text-slate-text/70">{output}</span>
              </div>
            </div>
          </FadeIn>
        </div>
        <FadeIn delay={0.15} className={isReversed ? "lg:[direction:ltr]" : ""}>
          {mockup}
        </FadeIn>
      </div>
    </Section>
  );
}

/* ─── INTEGRATION / FLOW ───────────────────────────────── */

function Integration() {
  const steps = [
    { icon: ScanLine, label: "SiteScan", desc: "Standort-Report", color: "bg-blue-500" },
    { icon: BookOpen, label: "RuleCompiler", desc: "Constraint-Set", color: "bg-amber-500" },
    { icon: Layers3, label: "PlanGen", desc: "Variantenvergleich", color: "bg-emerald-500" },
    { icon: PackageCheck, label: "SubmitPack", desc: "Einreichungspaket", color: "bg-violet-500" },
  ];
  return (
    <Section id="integration">
      <SectionHeading
        title="Nahtlose Pipeline"
        subtitle="Jedes Modul baut auf dem Output des vorherigen auf — vollständig automatisiert, durchgehend nachvollziehbar."
      />
      <FadeIn>
        <div className="flex flex-col items-center gap-0 md:flex-row md:gap-0 md:justify-center">
          {steps.map((s, i) => (
            <div key={s.label} className="flex flex-col items-center md:flex-row">
              <div className="flex flex-col items-center">
                <div className={`flex h-16 w-16 items-center justify-center rounded-2xl ${s.color} text-white shadow-lg`}>
                  <s.icon className="h-7 w-7" />
                </div>
                <span className="mt-3 text-sm font-bold text-slate-text">{s.label}</span>
                <span className="text-xs text-slate-text/50">{s.desc}</span>
              </div>
              {i < steps.length - 1 && (
                <>
                  <ArrowRight className="my-3 h-6 w-6 text-gray-border hidden md:block md:mx-6" />
                  <ArrowDown className="my-3 h-6 w-6 text-gray-border md:hidden" />
                </>
              )}
            </div>
          ))}
        </div>
      </FadeIn>
      <FadeIn delay={0.2}>
        <div className="mt-16 grid gap-6 md:grid-cols-3">
          {[
            { icon: Zap, title: "Automatisiert", desc: "Kein manueller Datentransfer zwischen den Modulen." },
            { icon: GitBranch, title: "Nachvollziehbar", desc: "Jede Entscheidung mit Quellenverweis dokumentiert." },
            { icon: Database, title: "Konsistent", desc: "Ein einheitliches Datenmodell von Anfang bis Ende." },
          ].map((f) => (
            <div key={f.title} className="rounded-xl border border-gray-border bg-gray-bg/50 p-6 text-center">
              <f.icon className="mx-auto h-6 w-6 text-accent" />
              <h3 className="mt-3 text-sm font-bold text-primary">{f.title}</h3>
              <p className="mt-1 text-sm text-slate-text/60">{f.desc}</p>
            </div>
          ))}
        </div>
      </FadeIn>
    </Section>
  );
}

/* ─── CTA ──────────────────────────────────────────────── */

function CTA() {
  return (
    <Section gray>
      <FadeIn className="text-center">
        <h2 className="text-3xl font-bold tracking-tight text-primary md:text-4xl">
          Erleben Sie die Pipeline in Aktion
        </h2>
        <p className="mx-auto mt-4 max-w-xl text-lg text-slate-text/70">
          Von der Adresse zum Einreichungspaket — in Minuten statt Wochen.
          Vereinbaren Sie eine persönliche Demo.
        </p>
        <a
          href="/uplan-engine/#kontakt"
          className="mt-8 inline-flex items-center gap-2 rounded-xl bg-accent px-8 py-4 text-base font-semibold text-white shadow-lg transition hover:bg-accent-light hover:shadow-xl"
        >
          Demo anfragen <ArrowRight className="h-4 w-4" />
        </a>
      </FadeIn>
    </Section>
  );
}

/* ─── FOOTER ───────────────────────────────────────────── */

function Footer() {
  return (
    <footer className="border-t border-gray-border bg-white py-12">
      <div className="mx-auto flex max-w-6xl flex-col items-center gap-6 px-6 text-center">
        <div className="flex items-center gap-2">
          <svg width="28" height="28" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
            <rect width="32" height="32" rx="8" fill="#1E3A5F" />
            <path d="M8 10h6a4 4 0 0 1 0 8H8V10z" fill="white" />
            <path d="M17 14h7a4 4 0 0 1 0 8h-7V14z" fill="#0D9488" />
          </svg>
          <span className="text-lg font-bold text-primary">U-Plan Engine</span>
        </div>
        <p className="text-sm text-slate-text/50">
          Vom Flurstück zur Genehmigungsreife.
        </p>
        <nav className="flex gap-6 text-sm text-slate-text/50">
          <a href="/uplan-engine/" className="transition hover:text-primary">Startseite</a>
          <a href="/uplan-engine/produkt" className="transition hover:text-primary">Produkt</a>
          <a href="/uplan-engine/#faq" className="transition hover:text-primary">FAQ</a>
          <a href="/uplan-engine/#kontakt" className="transition hover:text-primary">Kontakt</a>
        </nav>
        <p className="text-xs text-slate-text/30">
          © 2026 U-Plan Engine · Impressum · Datenschutz
        </p>
      </div>
    </footer>
  );
}

/* ─── PAGE ─────────────────────────────────────────────── */

export default function ProduktPage() {
  return (
    <>
      <Nav />
      <main>
        <Hero />

        <ModuleSection
          id="sitescan"
          index={0}
          icon={ScanLine}
          badge="Modul 1"
          badgeColor="bg-blue-100 text-blue-700"
          title="SiteScan"
          subtitle="Automatische Grundstücksanalyse — vom Flurstück zum strukturierten Standort-Report."
          features={[
            { icon: MapPin, text: "Automatische Geometrie-Erfassung: Flurstück, Grenzen, Topografie aus amtlichen Quellen." },
            { icon: Building2, text: "Umfeldanalyse: Nachbarbebauung, Infrastruktur und Erschließungssituation." },
            { icon: FileText, text: "B-Plan-Zuordnung & Festsetzungen automatisch identifiziert und geparst." },
          ]}
          input="Flurstücksnummer oder Adresse"
          output="Strukturierter Standort-Report"
          mockup={<SiteScanMockup />}
        />

        <ModuleSection
          id="rulecompiler"
          index={1}
          icon={BookOpen}
          badge="Modul 2"
          badgeColor="bg-amber-100 text-amber-700"
          title="RuleCompiler"
          subtitle="Verwandelt Baurecht in maschinenlesbare Constraints — lückenlos und quellenreferenziert."
          features={[
            { icon: Scale, text: "B-Plan-Festsetzungen werden in maschinenlesbare Constraints übersetzt." },
            { icon: Landmark, text: "Landesbauordnung (LBO) pro Bundesland automatisch berücksichtigt." },
            { icon: ClipboardList, text: "Kommunale Satzungen und Gestaltungsrichtlinien integriert." },
            { icon: Ruler, text: "Abstandsflächen, GRZ/GFZ und Stellplatzverordnung vollautomatisch berechnet." },
          ]}
          input="Standort-Report"
          output="Constraint-Set mit Quellenverweis"
          mockup={<RuleCompilerMockup />}
          gray
        />

        <ModuleSection
          id="plangen"
          index={2}
          icon={Layers3}
          badge="Modul 3"
          badgeColor="bg-emerald-100 text-emerald-700"
          title="PlanGen"
          subtitle="Generiert parametrische Entwurfsvarianten — jede mit Compliance-Score und Vergleichswerten."
          features={[
            { icon: BarChart3, text: "Drei Varianten: Maximal, Standard und Risikoarm — automatisch konfiguriert." },
            { icon: Layers3, text: "Parametrisch berechnet: Geschosse, Wohneinheiten, BGF, Stellplätze." },
            { icon: ShieldCheck, text: "Jede Variante mit Compliance-Score gegen das vollständige Constraint-Set." },
            { icon: Box, text: "Übersichtlicher Variantenvergleich als Entscheidungsgrundlage." },
          ]}
          input="Constraint-Set"
          output="Variantenvergleich mit Compliance-Scores"
          mockup={<PlanGenMockup />}
        />

        <ModuleSection
          id="submitpack"
          index={3}
          icon={PackageCheck}
          badge="Modul 4"
          badgeColor="bg-violet-100 text-violet-700"
          title="SubmitPack"
          subtitle="Stellt das Einreichungspaket zusammen — kommune-spezifisch, vollständig geprüft, exportfertig."
          features={[
            { icon: ClipboardList, text: "Automatische Dokumentenzusammenstellung nach kommunalen Anforderungen." },
            { icon: CheckCircle2, text: "Kommune-spezifische Checklisten mit Vollständigkeitsprüfung." },
            { icon: FileOutput, text: "Export in allen gängigen Formaten: PDF, IFC, BCF." },
            { icon: Download, text: "Einreichungsfertiges Paket — bereit für die Bauaufsicht." },
          ]}
          input="Gewählte Variante"
          output="Einreichungsfertiges Dokumentenpaket"
          mockup={<SubmitPackMockup />}
          gray
        />

        <Integration />
        <CTA />
      </main>
      <Footer />
    </>
  );
}
