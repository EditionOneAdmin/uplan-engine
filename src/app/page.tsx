"use client";

import { useRef, useState, useEffect } from "react";
import { motion, useInView, AnimatePresence } from "framer-motion";
import {
  ScanLine,
  BookOpen,
  Layers3,
  PackageCheck,
  Clock,
  ClipboardList,
  Coins,
  Building2,
  Ruler,
  Pencil,
  Wrench,
  ShieldCheck,
  Lock,
  GitBranch,
  Users,
  Link2,
  FileOutput,
  Landmark,
  ChevronDown,
  ArrowRight,
  CheckCircle2,
  BarChart3,
  AlertTriangle,
  FolderOpen,
  Mail,
  Menu,
  X,
  ChevronRight,
  MousePointerClick,
  Calculator,
  Zap,
  LayoutGrid,
  Timer,
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

/* ─── 1. HERO ──────────────────────────────────────────── */

function Hero() {
  return (
    <section className="relative overflow-hidden bg-white pt-20 pb-24 md:pt-32 md:pb-32">
      <div className="mx-auto flex max-w-6xl flex-col items-center px-6 text-center">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: [0.25, 0.4, 0.25, 1] }}
        >
          <p className="mb-6 text-sm font-semibold tracking-widest text-accent uppercase">
            Für Projektentwickler · Bauträger · Bestandshalter
          </p>
          <h1 className="text-4xl font-extrabold leading-[1.1] tracking-tight text-primary sm:text-5xl md:text-6xl lg:text-7xl">
            Vom Flürstück zur
            <br />
            Machbarkeitsentscheidung — in Minuten.
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-slate-text/70 md:text-xl">
            U-Plan Engine automatisiert die Machbarkeitsprüfung,
            Variantenplanung und Bauantragsaufbereitung — nachvollziehbar,
            versioniert und auditierbar.
          </p>
        </motion.div>

        <motion.div
          className="mt-10 flex flex-col gap-4 sm:flex-row"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
        >
          <a
            href="/uplan-engine/demo"
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-accent px-8 py-4 text-base font-semibold text-white shadow-lg shadow-accent/20 transition hover:bg-accent-light hover:shadow-xl hover:shadow-accent/30"
          >
            Interaktive Demo <ArrowRight className="h-4 w-4" />
          </a>
          <a
            href="#kontakt"
            className="inline-flex items-center justify-center gap-2 rounded-xl border border-gray-border px-8 py-4 text-base font-semibold text-primary transition hover:border-primary/30 hover:bg-gray-bg"
          >
            Demo anfragen
          </a>
        </motion.div>

        {/* Hero video */}
        <motion.div
          className="mt-16 w-full max-w-4xl"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
        >
          <div className="relative overflow-hidden rounded-2xl shadow-2xl">
            <video
              autoPlay
              loop
              muted
              playsInline
              className="w-full"
              poster="/uplan-engine/images/hero-cityscape.jpg"
            >
              <source src="/uplan-engine/videos/hero-planning.mp4" type="video/mp4" />
            </video>
            <div className="absolute bottom-4 left-4 rounded-lg bg-black/50 px-3 py-1.5 text-xs font-medium text-white/80 backdrop-blur-sm">
              Von der digitalen Planung zum fertigen Haus
            </div>
          </div>
        </motion.div>

        {/* Decorative gradient blob */}
        <div className="pointer-events-none absolute -top-40 right-0 h-[500px] w-[500px] rounded-full bg-accent/5 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-20 -left-20 h-[400px] w-[400px] rounded-full bg-primary/5 blur-3xl" />
      </div>
    </section>
  );
}

/* ─── 2. PROBLEM ───────────────────────────────────────── */

const problems = [
  {
    icon: Layers3,
    stat: "2+ Regionen",
    highlight: "400+ Datenquellen",
    desc: "Flurstücke, B-Pläne, Bodenrichtwerte, Mietspiegel, Orthophotos — live auf einer Karte.",
  },
  {
    icon: Clock,
    stat: "Minuten",
    highlight: "statt Wochen",
    desc: "Vollständige Grundstücksanalyse mit Wirtschaftlichkeitsabschätzung — ohne Excel, ohne Portal-Hopping, ohne Wartezeit.",
  },
  {
    icon: ScanLine,
    stat: "Ein Klick",
    highlight: "Alle Daten",
    desc: "Flurstück anklicken — sofort Fläche, Bodenrichtwert, Mietspiegel, Bebauungsplan. Keine manuellen Recherchen mehr.",
  },
];

function Problem() {
  return (
    <Section id="problem" gray>
      <SectionHeading
        title="Alles was Sie für die Grundstücksanalyse brauchen."
        subtitle="Schluss mit Excel-Tabellen, manueller Recherche und dutzenden Portalen."
      />
      <div className="grid gap-8 md:grid-cols-3">
        {problems.map((p, i) => (
          <FadeIn key={i} delay={i * 0.12}>
            <div className="rounded-2xl border border-gray-border bg-white p-8 text-center shadow-sm transition hover:shadow-md">
              <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-xl bg-accent/10">
                <p.icon className="h-7 w-7 text-accent" />
              </div>
              <p className="text-3xl font-extrabold text-primary">{p.stat}</p>
              <p className="text-lg font-semibold text-accent">{p.highlight}</p>
              <p className="mt-3 text-sm leading-relaxed text-slate-text/70">
                {p.desc}
              </p>
            </div>
          </FadeIn>
        ))}
      </div>
    </Section>
  );
}

/* ─── 3. HOW IT WORKS ──────────────────────────────────── */

const steps = [
  {
    icon: ScanLine,
    title: "SiteScan",
    desc: "Grundstück & Kontext erfassen — Geometrie, Grenzen, Umfeld automatisch analysiert.",
  },
  {
    icon: BookOpen,
    title: "RuleCompiler",
    desc: "B-Plan, Satzungen & LBO in prüfbare Constraints übersetzen.",
  },
  {
    icon: Layers3,
    title: "PlanGen",
    desc: "Parametrische Varianten generieren — maximal, standard, risikoarm.",
  },
  {
    icon: PackageCheck,
    title: "SubmitPack",
    desc: "Dokumenten-Checkliste & Vollständigkeitsprüfung für die nächsten Schritte.",
  },
];

function HowItWorks() {
  return (
    <Section id="pipeline">
      <SectionHeading title="Vier Schritte zur Machbarkeitsprüfung." />
      <div className="grid gap-8 md:grid-cols-4">
        {steps.map((s, i) => (
          <FadeIn key={i} delay={i * 0.15} className="relative">
            <div className="flex flex-col items-center text-center">
              <div className="relative z-10 flex h-16 w-16 items-center justify-center rounded-2xl bg-accent/10 ring-4 ring-white">
                <s.icon className="h-8 w-8 text-accent" />
              </div>
              {i < steps.length - 1 && (
                <div className="absolute top-8 left-[calc(50%+40px)] hidden h-px w-[calc(100%-80px)] bg-gray-border md:block" />
              )}
              <span className="mt-1 text-xs font-bold text-accent/60">
                0{i + 1}
              </span>
              <h3 className="mt-3 text-lg font-bold text-primary">{s.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-slate-text/70">
                {s.desc}
              </p>
            </div>
          </FadeIn>
        ))}
      </div>
      <FadeIn delay={0.5} className="mt-10 text-center">
        <a href="/uplan-engine/produkt" className="inline-flex items-center gap-2 text-sm font-semibold text-accent hover:text-accent-light transition">
          Alle Module im Detail <ArrowRight className="h-4 w-4" />
        </a>
      </FadeIn>
    </Section>
  );
}

/* ─── 3b. USP — Nicht bei null anfangen ────────────────── */

const uspFeatures = [
  { icon: Building2, title: "Katalog serieller Hersteller", desc: "GROPYUS, Nokera, ALHO, Goldbeck, Max Bögl — reale Gebäudemodule mit echten Grundrissen." },
  { icon: MousePointerClick, title: "Drag & Drop aufs Grundstück", desc: "Gebäude direkt auf das Flurstück platzieren. GRZ, GFZ, Abstandsflächen und Wohneinheiten sofort berechnet." },
  { icon: Calculator, title: "Sofortige Wirtschaftlichkeit", desc: "Baukosten, Mieteinnahmen und Rendite — kalkuliert auf Basis realer Herstellerpreise." },
  { icon: Zap, title: "Planung beschleunigt", desc: "Kein leeres Blatt Papier. Starten Sie mit erprobten Konzepten, die bereits gebaut wurden." },
];

function USPSection() {
  return (
    <Section id="usp" gray>
      <SectionHeading
        title="Nicht bei null anfangen."
        subtitle="Platzieren Sie real gebaute, seriell gefertigte Gebäude direkt auf Ihr Grundstück — mit echten Grundrissen, geprüften Maßen und kalkulierbaren Kosten."
      />
      <div className="grid gap-8 sm:grid-cols-2">
        {uspFeatures.map((f, i) => (
          <FadeIn key={i} delay={i * 0.1}>
            <div className="rounded-2xl border border-gray-border bg-white p-8 shadow-sm transition hover:shadow-md">
              <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-xl bg-accent/10">
                <f.icon className="h-7 w-7 text-accent" />
              </div>
              <h3 className="text-lg font-bold text-primary">{f.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-slate-text/70">{f.desc}</p>
            </div>
          </FadeIn>
        ))}
      </div>
      <FadeIn delay={0.5} className="mt-12">
        <div className="rounded-2xl border border-accent/20 bg-accent/5 p-8 text-center">
          <p className="text-lg font-semibold text-primary md:text-xl">
            &ldquo;Andere Tools zeigen Ihnen Daten. Wir zeigen Ihnen ein fertiges Konzept.&rdquo;
          </p>
        </div>
      </FadeIn>
    </Section>
  );
}

/* ─── 3c. PIPELINE DASHBOARD ──────────────────────────── */

const pipelineFeatures = [
  { icon: LayoutGrid, title: "Portfolio-Analyse", desc: "Vom Einzelgrundstück zur Gesamtbewertung. Alle Standorte auf einen Blick." },
  { icon: BarChart3, title: "Automatisches Ranking", desc: "Sortiert nach Score — die besten Grundstücke sofort identifiziert." },
  { icon: Timer, title: "Parallele Bewertung", desc: "Was einzeln Wochen dauert, erledigen Sie für Ihr gesamtes Portfolio in Minuten." },
];

function PipelineSection() {
  return (
    <Section id="pipeline-dashboard">
      <SectionHeading
        title="Ihre gesamte Pipeline. Ein Dashboard."
        subtitle="Bewerten Sie 50+ Standorte parallel — mit automatischem Ranking nach Machbarkeit, Wirtschaftlichkeit und Risiko."
      />
      <div className="grid gap-8 md:grid-cols-3">
        {pipelineFeatures.map((f, i) => (
          <FadeIn key={i} delay={i * 0.12}>
            <div className="rounded-2xl border border-gray-border bg-white p-8 text-center shadow-sm transition hover:shadow-md">
              <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-xl bg-accent/10">
                <f.icon className="h-7 w-7 text-accent" />
              </div>
              <h3 className="text-lg font-bold text-primary">{f.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-slate-text/70">{f.desc}</p>
            </div>
          </FadeIn>
        ))}
      </div>
    </Section>
  );
}

/* ─── 4. PRODUCT SHOWCASE ──────────────────────────────── */

function ProductShowcase() {
  return (
    <Section id="produkt" gray>
      <SectionHeading title="Was Sie erhalten." />
      <div className="grid gap-8 lg:grid-cols-3">
        {/* Variantenvergleich */}
        <FadeIn delay={0}>
          <div className="group rounded-2xl border border-gray-border bg-white p-8 shadow-sm transition hover:shadow-md">
            <div className="mb-6 flex items-center gap-3">
              <BarChart3 className="h-6 w-6 text-accent" />
              <span className="rounded-full bg-accent/10 px-3 py-1 text-xs font-semibold text-accent">
                Maximal / Standard / Risikoarm
              </span>
            </div>
            <h3 className="text-xl font-bold text-primary">Variantenvergleich</h3>
            <p className="mt-3 text-sm leading-relaxed text-slate-text/70">
              Drei Varianten nebeneinander — Geschosse, Wohneinheiten, GRZ/GFZ,
              Stellplätze auf einen Blick.
            </p>
            {/* Mini mockup */}
            <div className="mt-6 space-y-2">
              {["Variante A — Maximal", "Variante B — Standard", "Variante C — Risikoarm"].map(
                (v, i) => (
                  <div
                    key={i}
                    className="flex items-center justify-between rounded-lg bg-gray-bg px-4 py-2.5 text-xs"
                  >
                    <span className="font-medium text-primary">{v}</span>
                    <span className="text-slate-text/50">
                      {["GFZ 2.4", "GFZ 1.8", "GFZ 1.2"][i]}
                    </span>
                  </div>
                )
              )}
            </div>
          </div>
        </FadeIn>

        {/* Compliance Report */}
        <FadeIn delay={0.12}>
          <div className="group rounded-2xl border border-gray-border bg-white p-8 shadow-sm transition hover:shadow-md">
            <div className="mb-6 flex items-center gap-3">
              <ShieldCheck className="h-6 w-6 text-accent" />
              <span className="rounded-full bg-accent/10 px-3 py-1 text-xs font-semibold text-accent">
                Nachvollziehbar. Auditierbar.
              </span>
            </div>
            <h3 className="text-xl font-bold text-primary">Compliance Report</h3>
            <p className="mt-3 text-sm leading-relaxed text-slate-text/70">
              Ampel-System — jede Regel mit Quelle, Bewertung und Empfehlung.
            </p>
            <div className="mt-6 space-y-2">
              {[
                { color: "bg-emerald-500", rule: "GRZ ≤ 0.4", status: "Erfüllt" },
                { color: "bg-amber-400", rule: "Abstandsflächen", status: "Prüfen" },
                { color: "bg-emerald-500", rule: "Stellplatznachweis", status: "Erfüllt" },
              ].map((r, i) => (
                <div
                  key={i}
                  className="flex items-center gap-3 rounded-lg bg-gray-bg px-4 py-2.5 text-xs"
                >
                  <span className={`h-2.5 w-2.5 rounded-full ${r.color}`} />
                  <span className="flex-1 font-medium text-primary">{r.rule}</span>
                  <span className="text-slate-text/50">{r.status}</span>
                </div>
              ))}
            </div>
          </div>
        </FadeIn>

        {/* SubmitPack */}
        <FadeIn delay={0.24}>
          <div className="group rounded-2xl border border-gray-border bg-white p-8 shadow-sm transition hover:shadow-md">
            <div className="mb-6 flex items-center gap-3">
              <FolderOpen className="h-6 w-6 text-accent" />
              <span className="rounded-full bg-accent/10 px-3 py-1 text-xs font-semibold text-accent">
                Vollständig geprüft. Checkliste erstellt.
              </span>
            </div>
            <h3 className="text-xl font-bold text-primary">SubmitPack</h3>
            <p className="mt-3 text-sm leading-relaxed text-slate-text/70">
              Strukturierte Ordner, Checkliste je Kommune-Profil, Export als PDF,
              IFC & BCF.
            </p>
            <div className="mt-6 space-y-2">
              {[
                "📁 Erforderliche Unterlagen (Übersicht)",
                "📁 Lageplan & Berechnungen",
                "📁 Empfohlene Nachweise",
              ].map((f, i) => (
                <div
                  key={i}
                  className="flex items-center gap-2 rounded-lg bg-gray-bg px-4 py-2.5 text-xs font-medium text-primary"
                >
                  {f}
                  <CheckCircle2 className="ml-auto h-4 w-4 text-emerald-500" />
                </div>
              ))}
            </div>
          </div>
        </FadeIn>
      </div>
    </Section>
  );
}

/* ─── 5. USE CASES ─────────────────────────────────────── */

const useCases = [
  {
    title: "Portfolio-Rollout",
    desc: "Bewerten Sie 50 Standorte in der Zeit, die Sie heute für 5 brauchen. Gleiche Standards, konsistente Qualität.",
    image: "/uplan-engine/images/usecase-portfolio.jpg",
    href: "/uplan-engine/anwendungsfaelle/portfolio-rollout",
  },
  {
    title: "Ankaufsprüfung in 48h",
    desc: "Machbarkeit prüfen bevor der Letter of Intent unterschrieben ist. Fundierte Entscheidung statt Bauchgefühl.",
    image: "/uplan-engine/images/usecase-ankauf.jpg",
    href: "/uplan-engine/anwendungsfaelle/ankaufspruefung",
  },
  {
    title: "Serielle Planung mit Standards",
    desc: "Bewährte Gebäudestandards wiederverwenden. Weniger Entwurfsaufwand, schnellere Freigaben.",
    image: "/uplan-engine/images/usecase-seriell.jpg",
    href: "/uplan-engine/anwendungsfaelle/serielle-planung",
  },
];

function UseCases() {
  return (
    <Section id="usecases">
      <SectionHeading title="Für jeden Anwendungsfall." />
      <div className="space-y-8">
        {useCases.map((uc, i) => (
          <FadeIn key={i} delay={i * 0.1}>
            <div
              className={`overflow-hidden rounded-2xl border border-gray-border bg-white shadow-sm ${
                i % 2 === 1 ? "md:flex-row-reverse" : ""
              }`}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={uc.image} alt={uc.title} className="w-full h-48 object-cover" />
              <div className="flex flex-col gap-6 p-8 md:flex-row md:items-center">
                <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-accent/10">
                  <span className="text-2xl font-extrabold text-accent">
                    0{i + 1}
                  </span>
                </div>
                <div>
                  <h3 className="text-xl font-bold text-primary">{uc.title}</h3>
                  <p className="mt-2 leading-relaxed text-slate-text/70">{uc.desc}</p>
                  <a href={uc.href} className="mt-3 inline-flex items-center gap-1.5 text-sm font-semibold text-accent hover:text-accent-light transition">
                    Mehr erfahren <ArrowRight className="h-3.5 w-3.5" />
                  </a>
                </div>
              </div>
            </div>
          </FadeIn>
        ))}
      </div>
    </Section>
  );
}

/* ─── 6. ZIELGRUPPEN ───────────────────────────────────── */

const roles = [
  { icon: Building2, title: "Projektentwicklung", desc: "Machbarkeit & Risiko bewerten" },
  { icon: Ruler, title: "Projektleitung Planung", desc: "Vollständigkeit sicherstellen" },
  { icon: Pencil, title: "Entwurfsverfasser", desc: "Prüfen & Freigeben" },
  { icon: Wrench, title: "BIM / CAD", desc: "Standards verwalten" },
  { icon: ShieldCheck, title: "Compliance / Revision", desc: "Audit-Trail nutzen" },
];

function Audience() {
  return (
    <Section id="zielgruppen" gray>
      <SectionHeading title="Gebaut für Ihr Team." />
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-5">
        {roles.map((r, i) => (
          <FadeIn key={i} delay={i * 0.08}>
            <div className="rounded-2xl border border-gray-border bg-white p-6 text-center shadow-sm">
              <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-primary/5">
                <r.icon className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-sm font-bold text-primary">{r.title}</h3>
              <p className="mt-1 text-xs text-slate-text/60">{r.desc}</p>
            </div>
          </FadeIn>
        ))}
      </div>
    </Section>
  );
}

/* ─── 7. TECHNOLOGIE & SICHERHEIT ──────────────────────── */

const features = [
  { icon: Lock, title: "DSGVO-konform", desc: "Daten bleiben in Deutschland" },
  { icon: GitBranch, title: "Versionierung", desc: "Jede Änderung nachvollziehbar" },
  { icon: Users, title: "Rollen & Rechte", desc: "Granulare Zugriffskontrolle" },
  { icon: Link2, title: "API-first", desc: "Integration in bestehende Systeme" },
  { icon: FileOutput, title: "Strukturierte Exporte", desc: "PDF, IFC, BCF" },
  { icon: Landmark, title: "Audit-Trail", desc: "Compliance nachweisbar" },
];

function Technology() {
  return (
    <Section id="technologie">
      <SectionHeading title="Enterprise-ready. Von Tag eins." />
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {features.map((f, i) => (
          <FadeIn key={i} delay={i * 0.08}>
            <div className="flex items-start gap-4 rounded-2xl border border-gray-border bg-white p-6 shadow-sm">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-accent/10">
                <f.icon className="h-5 w-5 text-accent" />
              </div>
              <div>
                <h3 className="font-bold text-primary">{f.title}</h3>
                <p className="mt-1 text-sm text-slate-text/60">{f.desc}</p>
              </div>
            </div>
          </FadeIn>
        ))}
      </div>
      <FadeIn delay={0.5} className="mt-10 text-center">
        <a href="/uplan-engine/technologie" className="inline-flex items-center gap-2 text-sm font-semibold text-accent hover:text-accent-light transition">
          Architektur, Sicherheit & Integrationen im Detail <ArrowRight className="h-4 w-4" />
        </a>
      </FadeIn>
    </Section>
  );
}

/* ─── 8. FAQ ───────────────────────────────────────────── */

const faqs = [
  {
    q: "Garantiert U-Plan Engine eine Baugenehmigung?",
    a: "Nein. U-Plan Engine prüft systematisch die Übereinstimmung Ihres Vorhabens mit den geltenden planungsrechtlichen Vorgaben. Die finale Genehmigung erteilt die zuständige Behörde. Unser Ziel: eine fundierte Entscheidungsgrundlage für Ihre Projektentwicklung.",
  },
  {
    q: "Wer trägt die Verantwortung für den Bauantrag?",
    a: "Die Verantwortung bleibt beim Entwurfsverfasser und Bauherrn. U-Plan Engine ist ein Assistenzsystem, das die Machbarkeitsprüfung und Variantenanalyse systematisch unterstützt.",
  },
  {
    q: "Wie funktioniert der Rollout neuer Kommunen?",
    a: "Jede Kommune wird als eigenes Profil mit ihren spezifischen Satzungen, Festsetzungen und Verfahrensregeln modelliert. Neue Kommunen können innerhalb weniger Tage ongeboardet werden.",
  },
  {
    q: "Welche Outputs liefert die Plattform?",
    a: "Variantenvergleiche, Compliance Reports mit Ampel-System, strukturierte Dokumenten-Checklisten (SubmitPack) sowie strukturierte Exporte in PDF, IFC und BCF.",
  },
  {
    q: "Wie integriert sich U-Plan Engine in bestehende Prozesse?",
    a: "Über eine REST-API, standardisierte Exporte und optionale Webhooks. Integration in BIM-Systeme, DMS und Projektmanagement-Tools ist vorgesehen.",
  },
];

function FAQ() {
  const [open, setOpen] = useState<number | null>(null);
  return (
    <Section id="faq" gray>
      <SectionHeading title="Häufige Fragen." />
      <div className="mx-auto max-w-3xl space-y-3">
        {faqs.map((f, i) => (
          <FadeIn key={i} delay={i * 0.06}>
            <div className="rounded-xl border border-gray-border bg-white shadow-sm">
              <button
                className="flex w-full items-center justify-between px-6 py-5 text-left"
                onClick={() => setOpen(open === i ? null : i)}
              >
                <span className="pr-4 font-semibold text-primary">{f.q}</span>
                <ChevronDown
                  className={`h-5 w-5 shrink-0 text-slate-text/40 transition-transform ${
                    open === i ? "rotate-180" : ""
                  }`}
                />
              </button>
              <motion.div
                initial={false}
                animate={{
                  height: open === i ? "auto" : 0,
                  opacity: open === i ? 1 : 0,
                }}
                transition={{ duration: 0.3 }}
                className="overflow-hidden"
              >
                <p className="px-6 pb-5 text-sm leading-relaxed text-slate-text/70">
                  {f.a}
                </p>
              </motion.div>
            </div>
          </FadeIn>
        ))}
      </div>
    </Section>
  );
}

/* ─── 9. CTA ───────────────────────────────────────────── */

function CTA() {
  return (
    <Section id="kontakt" className="relative overflow-hidden">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src="/uplan-engine/images/cta-background.jpg" alt="" className="absolute inset-0 w-full h-full object-cover opacity-10 pointer-events-none" />
      <FadeIn className="text-center relative z-10">
        <h2 className="text-3xl font-bold tracking-tight text-primary md:text-4xl lg:text-5xl">
          Bereit für schnellere Machbarkeitsprüfungen?
        </h2>
        <p className="mx-auto mt-4 max-w-xl text-lg text-slate-text/70">
          Vereinbaren Sie eine Demo und sehen Sie U-Plan Engine mit Ihren
          eigenen Projekten.
        </p>
        <div className="mt-10 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
          <a
            href="/uplan-engine/demo"
            className="inline-flex items-center gap-2 rounded-xl bg-accent px-8 py-4 text-base font-semibold text-white shadow-lg shadow-accent/20 transition hover:bg-accent-light hover:shadow-xl hover:shadow-accent/30"
          >
            <ArrowRight className="h-5 w-5" /> Interaktive Demo starten
          </a>
          <a
            href="mailto:hello@uplan-engine.de"
            className="inline-flex items-center gap-2 rounded-xl border border-gray-border px-8 py-4 text-base font-semibold text-primary transition hover:border-primary/30 hover:bg-gray-bg"
          >
            <Mail className="h-5 w-5" /> Kontakt aufnehmen
          </a>
        </div>
      </FadeIn>
    </Section>
  );
}

/* ─── 10. FOOTER ───────────────────────────────────────── */

function Footer() {
  return (
    <footer className="border-t border-gray-border bg-white py-12">
      <div className="mx-auto flex max-w-6xl flex-col items-center gap-6 px-6 text-center">
        <div className="flex items-center gap-2">
          <svg
            width="28"
            height="28"
            viewBox="0 0 32 32"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <rect width="32" height="32" rx="8" fill="#1E3A5F" />
            <path
              d="M8 10h6a4 4 0 0 1 0 8H8V10z"
              fill="white"
            />
            <path
              d="M17 14h7a4 4 0 0 1 0 8h-7V14z"
              fill="#0D9488"
            />
          </svg>
          <span className="text-lg font-bold text-primary">U-Plan Engine</span>
        </div>
        <p className="text-sm text-slate-text/50">
          Vom Flurstück zur Machbarkeitsentscheidung — in Minuten.
        </p>
        <nav className="flex flex-wrap justify-center gap-x-6 gap-y-2 text-sm text-slate-text/50">
          <a href="/uplan-engine/produkt" className="transition hover:text-primary">Produkt</a>
          <a href="/uplan-engine/anwendungsfaelle/portfolio-rollout" className="transition hover:text-primary">Portfolio-Rollout</a>
          <a href="/uplan-engine/anwendungsfaelle/ankaufspruefung" className="transition hover:text-primary">Ankaufsprüfung</a>
          <a href="/uplan-engine/anwendungsfaelle/serielle-planung" className="transition hover:text-primary">Serielle Planung</a>
          <a href="/uplan-engine/partner" className="transition hover:text-primary">Partner</a>
          <a href="/uplan-engine/technologie" className="transition hover:text-primary">Technologie</a>
          <a href="/uplan-engine/lizenzen" className="transition hover:text-primary">Lizenzen</a>
          <a href="#faq" className="transition hover:text-primary">FAQ</a>
          <a href="#kontakt" className="transition hover:text-primary">Kontakt</a>
        </nav>
        <p className="text-xs text-slate-text/30">
          © 2026 U-Plan Engine · Impressum · Datenschutz
        </p>
      </div>
    </footer>
  );
}

/* ─── NAV ──────────────────────────────────────────────── */

function Nav() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [ucOpen, setUcOpen] = useState(false);

  // close mobile menu on resize
  useEffect(() => {
    const handler = () => { if (window.innerWidth >= 768) setMobileOpen(false); };
    window.addEventListener("resize", handler);
    return () => window.removeEventListener("resize", handler);
  }, []);

  const Logo = () => (
    <a href="/uplan-engine/" className="flex items-center gap-2">
      <svg width="28" height="28" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect width="32" height="32" rx="8" fill="#1E3A5F" />
        <path d="M8 10h6a4 4 0 0 1 0 8H8V10z" fill="white" />
        <path d="M17 14h7a4 4 0 0 1 0 8h-7V14z" fill="#0D9488" />
      </svg>
      <span className="text-lg font-bold text-primary">U-Plan Engine</span>
    </a>
  );

  const useCaseLinks = [
    { href: "/uplan-engine/anwendungsfaelle/portfolio-rollout", label: "Portfolio-Rollout", sub: "50 Standorte parallel bewerten" },
    { href: "/uplan-engine/anwendungsfaelle/ankaufspruefung", label: "Ankaufsprüfung in 48h", sub: "Machbarkeit vor LOI prüfen" },
    { href: "/uplan-engine/anwendungsfaelle/serielle-planung", label: "Serielle Planung", sub: "Standards wiederverwenden" },
  ];

  return (
    <motion.header
      className="fixed top-0 right-0 left-0 z-50 border-b border-gray-border/60 bg-white/80 backdrop-blur-lg"
      initial={{ y: -80 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-3">
        <Logo />

        {/* Desktop Nav */}
        <nav className="hidden items-center gap-6 text-sm font-medium text-slate-text/60 md:flex">
          <a href="/uplan-engine/produkt" className="transition hover:text-primary">Produkt</a>

          {/* Use Cases Dropdown */}
          <div className="relative" onMouseEnter={() => setUcOpen(true)} onMouseLeave={() => setUcOpen(false)}>
            <button className="flex items-center gap-1 transition hover:text-primary">
              Use Cases
              <ChevronDown className={`h-3.5 w-3.5 transition-transform ${ucOpen ? "rotate-180" : ""}`} />
            </button>
            <AnimatePresence>
              {ucOpen && (
                <motion.div
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 8 }}
                  transition={{ duration: 0.15 }}
                  className="absolute left-1/2 -translate-x-1/2 top-full pt-2"
                >
                  <div className="w-72 rounded-xl border border-gray-border bg-white p-2 shadow-xl">
                    {useCaseLinks.map((uc) => (
                      <a key={uc.href} href={uc.href} className="flex items-start gap-3 rounded-lg px-3 py-2.5 transition hover:bg-gray-bg group">
                        <ChevronRight className="mt-0.5 h-4 w-4 text-accent opacity-0 group-hover:opacity-100 transition shrink-0" />
                        <div>
                          <div className="text-sm font-semibold text-primary">{uc.label}</div>
                          <div className="text-xs text-slate-text/50">{uc.sub}</div>
                        </div>
                      </a>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <a href="/uplan-engine/partner" className="transition hover:text-primary">Partner</a>
          <a href="/uplan-engine/technologie" className="transition hover:text-primary">Technologie</a>
          <a href="/uplan-engine/lizenzen" className="transition hover:text-primary">Pläne lizenzieren</a>
          <a href="#faq" className="transition hover:text-primary">FAQ</a>
        </nav>

        <div className="flex items-center gap-3">
          <a
            href="/uplan-engine/demo"
            className="hidden rounded-lg bg-accent px-5 py-2 text-sm font-semibold text-white transition hover:bg-accent-light sm:inline-flex"
          >
            Interaktive Demo
          </a>

          {/* Mobile Hamburger */}
          <button className="md:hidden flex h-10 w-10 items-center justify-center rounded-lg hover:bg-gray-bg transition" onClick={() => setMobileOpen(!mobileOpen)}>
            {mobileOpen ? <X className="h-5 w-5 text-primary" /> : <Menu className="h-5 w-5 text-primary" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden border-t border-gray-border/40 md:hidden"
          >
            <nav className="flex flex-col gap-1 px-6 py-4 bg-white">
              <a href="/uplan-engine/produkt" className="rounded-lg px-3 py-2.5 text-sm font-medium text-primary hover:bg-gray-bg transition" onClick={() => setMobileOpen(false)}>Produkt</a>
              <div className="px-3 pt-3 pb-1 text-xs font-semibold uppercase tracking-wider text-slate-text/40">Use Cases</div>
              {useCaseLinks.map((uc) => (
                <a key={uc.href} href={uc.href} className="rounded-lg px-3 py-2.5 pl-6 text-sm text-slate-text/80 hover:bg-gray-bg hover:text-primary transition" onClick={() => setMobileOpen(false)}>
                  {uc.label}
                </a>
              ))}
              <a href="/uplan-engine/technologie" className="rounded-lg px-3 py-2.5 text-sm font-medium text-primary hover:bg-gray-bg transition" onClick={() => setMobileOpen(false)}>Technologie</a>
              <a href="/uplan-engine/partner" className="rounded-lg px-3 py-2.5 text-sm font-medium text-primary hover:bg-gray-bg transition" onClick={() => setMobileOpen(false)}>Partner werden</a>
              <a href="/uplan-engine/lizenzen" className="rounded-lg px-3 py-2.5 text-sm font-medium text-primary hover:bg-gray-bg transition" onClick={() => setMobileOpen(false)}>Pläne lizenzieren</a>
              <a href="#faq" className="rounded-lg px-3 py-2.5 text-sm font-medium text-primary hover:bg-gray-bg transition" onClick={() => setMobileOpen(false)}>FAQ</a>
              <a href="/uplan-engine/demo" className="mt-2 rounded-lg bg-accent px-4 py-2.5 text-center text-sm font-semibold text-white hover:bg-accent-light transition" onClick={() => setMobileOpen(false)}>Interaktive Demo</a>
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.header>
  );
}

/* ─── PAGE ─────────────────────────────────────────────── */

export default function Home() {
  return (
    <>
      <Nav />
      <main>
        <Hero />
        <Problem />
        <HowItWorks />
        <USPSection />
        <PipelineSection />
        <ProductShowcase />
        <UseCases />
        <Audience />
        <Technology />
        <FAQ />
        <CTA />
      </main>
      <Footer />
    </>
  );
}
