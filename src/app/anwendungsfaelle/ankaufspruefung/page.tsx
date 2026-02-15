"use client";

import { useRef } from "react";
import { motion, useInView } from "framer-motion";
import {
  Search,
  Clock,
  CheckCircle2,
  ArrowRight,
  AlertTriangle,
  ShieldCheck,
  FileCheck,
  CircleDollarSign,
  Building2,
  Car,
  Plug,
  Ruler,
  Quote,
  XCircle,
  HelpCircle,
  Handshake,
  Target,
  Brain,
  BarChart3,
} from "lucide-react";

/* ─── Helpers ──────────────────────────────────────────── */

function FadeIn({ children, className = "", delay = 0 }: { children: React.ReactNode; className?: string; delay?: number }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });
  return (
    <motion.div ref={ref} initial={{ opacity: 0, y: 32 }} animate={inView ? { opacity: 1, y: 0 } : {}} transition={{ duration: 0.6, delay, ease: [0.25, 0.4, 0.25, 1] }} className={className}>
      {children}
    </motion.div>
  );
}

function Section({ children, className = "", id, gray = false }: { children: React.ReactNode; className?: string; id?: string; gray?: boolean }) {
  return (
    <section id={id} className={`py-24 md:py-32 ${gray ? "bg-gray-bg" : "bg-white"} ${className}`}>
      <div className="mx-auto max-w-6xl px-6">{children}</div>
    </section>
  );
}

/* ─── Nav ──────────────────────────────────────────────── */

function Nav() {
  return (
    <motion.header className="fixed top-0 right-0 left-0 z-50 border-b border-gray-border/60 bg-white/80 backdrop-blur-lg" initial={{ y: -80 }} animate={{ y: 0 }} transition={{ duration: 0.5 }}>
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-3">
        <a href="/uplan-engine" className="flex items-center gap-2">
          <svg width="28" height="28" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
            <rect width="32" height="32" rx="8" fill="#1E3A5F" />
            <path d="M8 10h6a4 4 0 0 1 0 8H8V10z" fill="white" />
            <path d="M17 14h7a4 4 0 0 1 0 8h-7V14z" fill="#0D9488" />
          </svg>
          <span className="text-lg font-bold text-primary">U-Plan Engine</span>
        </a>
        <nav className="hidden gap-6 text-sm font-medium text-slate-text/60 md:flex">
          <a href="/uplan-engine/#pipeline" className="transition hover:text-primary">Pipeline</a>
          <a href="/uplan-engine/#produkt" className="transition hover:text-primary">Produkt</a>
          <a href="/uplan-engine/#technologie" className="transition hover:text-primary">Technologie</a>
          <a href="/uplan-engine/#faq" className="transition hover:text-primary">FAQ</a>
        </nav>
        <a href="/uplan-engine/#kontakt" className="rounded-lg bg-accent px-5 py-2 text-sm font-semibold text-white transition hover:bg-accent-light">
          Demo anfragen
        </a>
      </div>
    </motion.header>
  );
}

/* ─── Footer ───────────────────────────────────────────── */

function Footer() {
  return (
    <footer className="border-t border-gray-border bg-white py-12">
      <div className="mx-auto max-w-6xl px-6 text-center">
        <nav className="mb-4 flex flex-wrap justify-center gap-6 text-sm text-slate-text/50">
          <a href="/uplan-engine" className="transition hover:text-primary">Startseite</a>
          <a href="/uplan-engine/anwendungsfaelle/portfolio-rollout" className="transition hover:text-primary">Portfolio-Rollout</a>
          <a href="/uplan-engine/anwendungsfaelle/ankaufspruefung" className="transition hover:text-primary">Ankaufsprüfung</a>
          <a href="/uplan-engine/anwendungsfaelle/serielle-planung" className="transition hover:text-primary">Serielle Planung</a>
          <a href="/uplan-engine/#kontakt" className="transition hover:text-primary">Kontakt</a>
        </nav>
        <p className="text-xs text-slate-text/30">© 2026 U-Plan Engine · Impressum · Datenschutz</p>
      </div>
    </footer>
  );
}

/* ─── Hero ─────────────────────────────────────────────── */

function Hero() {
  return (
    <section className="relative overflow-hidden bg-primary pt-28 pb-20 md:pt-36 md:pb-28">
      <div className="absolute inset-0 opacity-20">
        <img src="/uplan-engine/images/usecase-ankauf.jpg" alt="" className="h-full w-full object-cover" />
      </div>
      <div className="absolute inset-0 bg-gradient-to-b from-primary/80 to-primary" />
      <div className="relative mx-auto max-w-6xl px-6">
        <FadeIn>
          <span className="mb-4 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-1.5 text-sm font-medium text-white/80 backdrop-blur">
            <Search className="h-4 w-4" /> Anwendungsfall
          </span>
          <h1 className="mb-6 max-w-3xl text-4xl leading-tight font-bold tracking-tight text-white md:text-6xl">
            Ankaufsprüfung: <br className="hidden md:block" />
            <span className="text-accent-light">48h Machbarkeitscheck</span>
          </h1>
          <p className="mb-8 max-w-2xl text-lg leading-relaxed text-white/70">
            Vor dem LOI wissen, ob das Grundstück funktioniert. Die U-Plan Engine liefert eine datenbasierte Entscheidungsgrundlage — in 48 Stunden statt Wochen.
          </p>
          <a href="/uplan-engine/#kontakt" className="inline-flex items-center gap-2 rounded-lg bg-accent px-6 py-3 text-sm font-semibold text-white transition hover:bg-accent-light">
            Demo anfragen <ArrowRight className="h-4 w-4" />
          </a>
        </FadeIn>
      </div>
    </section>
  );
}

/* ─── Problem ──────────────────────────────────────────── */

function Problem() {
  return (
    <Section>
      <FadeIn>
        <div className="mb-4 inline-flex items-center gap-2 text-sm font-semibold uppercase tracking-wider text-accent">
          <AlertTriangle className="h-4 w-4" /> Das Problem
        </div>
        <h2 className="mb-6 text-3xl font-bold text-primary md:text-4xl">
          Deal-Fenster schließen sich. Ihre Due Diligence nicht.
        </h2>
        <p className="mb-12 max-w-3xl text-lg leading-relaxed text-slate-text/70">
          Beim Grundstückskauf entscheiden Tage. Während Sie noch manuell B-Pläne sichten, hat ein Wettbewerber bereits zugeschlagen. Oder schlimmer: Sie kaufen blind — und entdecken die Risiken erst nach dem Notartermin.
        </p>
      </FadeIn>
      <div className="grid gap-6 md:grid-cols-2">
        <FadeIn delay={0.1}>
          <div className="rounded-2xl border-2 border-red-200 bg-red-50/30 p-8">
            <Brain className="mb-4 h-8 w-8 text-red-400" />
            <h3 className="mb-2 text-lg font-bold text-primary">Bauchgefühl</h3>
            <ul className="space-y-2 text-sm text-slate-text/60">
              <li className="flex items-start gap-2"><XCircle className="mt-0.5 h-4 w-4 shrink-0 text-red-400" /> &ldquo;Sieht nach einem guten Grundstück aus&rdquo;</li>
              <li className="flex items-start gap-2"><XCircle className="mt-0.5 h-4 w-4 shrink-0 text-red-400" /> GRZ/GFZ im Kopf überschlagen</li>
              <li className="flex items-start gap-2"><XCircle className="mt-0.5 h-4 w-4 shrink-0 text-red-400" /> Risikofaktoren erst spät erkannt</li>
              <li className="flex items-start gap-2"><XCircle className="mt-0.5 h-4 w-4 shrink-0 text-red-400" /> Stellplätze vergessen? Kommt schon hin.</li>
            </ul>
          </div>
        </FadeIn>
        <FadeIn delay={0.2}>
          <div className="rounded-2xl border-2 border-accent/30 bg-accent/5 p-8">
            <Target className="mb-4 h-8 w-8 text-accent" />
            <h3 className="mb-2 text-lg font-bold text-primary">Datenbasiert</h3>
            <ul className="space-y-2 text-sm text-slate-text/60">
              <li className="flex items-start gap-2"><CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-accent" /> Vollständige B-Plan Konformitätsprüfung</li>
              <li className="flex items-start gap-2"><CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-accent" /> Maximale Bebaubarkeit berechnet</li>
              <li className="flex items-start gap-2"><CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-accent" /> Alle Risikofaktoren identifiziert</li>
              <li className="flex items-start gap-2"><CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-accent" /> Stellplätze, Erschließung, Abstandsflächen</li>
            </ul>
          </div>
        </FadeIn>
      </div>
    </Section>
  );
}

/* ─── What's Checked ───────────────────────────────────── */

function WhatWeCheck() {
  return (
    <Section gray>
      <FadeIn>
        <div className="mb-4 inline-flex items-center gap-2 text-sm font-semibold uppercase tracking-wider text-accent">
          <FileCheck className="h-4 w-4" /> Was geprüft wird
        </div>
        <h2 className="mb-12 text-3xl font-bold text-primary md:text-4xl">
          Umfassende Machbarkeitsprüfung
        </h2>
      </FadeIn>
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {[
          { icon: Ruler, title: "B-Plan Konformität", desc: "GRZ, GFZ, Bauweise, Dachform, Geschossigkeit — alles automatisch geprüft." },
          { icon: Building2, title: "Max. Bebaubarkeit", desc: "Wie viel BGF ist realistisch? Wir berechnen das Maximum innerhalb der Festsetzungen." },
          { icon: AlertTriangle, title: "Risikofaktoren", desc: "Altlasten-Hinweise, Denkmalschutz, Überschwemmungsgebiete, Leitungsrechte." },
          { icon: Car, title: "Stellplätze", desc: "Stellplatznachweis nach Landesbauordnung — automatisch berechnet." },
          { icon: Plug, title: "Erschließung", desc: "Anschluss an Straße, Wasser, Strom, Kanal — Verfügbarkeit und Aufwand." },
          { icon: ShieldCheck, title: "Handlungsempfehlung", desc: "Klare Empfehlung: Kaufen, verhandeln oder Finger weg." },
        ].map((item, i) => (
          <FadeIn key={i} delay={i * 0.08}>
            <div className="rounded-2xl border border-gray-border bg-white p-8 shadow-sm">
              <item.icon className="mb-4 h-8 w-8 text-accent" />
              <h3 className="mb-2 text-lg font-bold text-primary">{item.title}</h3>
              <p className="text-sm leading-relaxed text-slate-text/60">{item.desc}</p>
            </div>
          </FadeIn>
        ))}
      </div>
    </Section>
  );
}

/* ─── Ampel Report ─────────────────────────────────────── */

function AmpelReport() {
  return (
    <Section>
      <FadeIn>
        <div className="mb-4 inline-flex items-center gap-2 text-sm font-semibold uppercase tracking-wider text-accent">
          <BarChart3 className="h-4 w-4" /> Output
        </div>
        <h2 className="mb-4 text-3xl font-bold text-primary md:text-4xl">
          Der Ampel-Report
        </h2>
        <p className="mb-12 max-w-2xl text-lg text-slate-text/60">
          Auf einen Blick sehen, ob das Grundstück funktioniert. Grün, Gelb oder Rot — mit konkreter Handlungsempfehlung.
        </p>
      </FadeIn>
      {/* Mock Report */}
      <FadeIn delay={0.1}>
        <div className="mx-auto max-w-2xl overflow-hidden rounded-2xl border border-gray-border bg-white shadow-lg">
          {/* Header */}
          <div className="border-b border-gray-border bg-gray-bg px-6 py-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-xs font-medium text-slate-text/40">MACHBARKEITSPRÜFUNG</div>
                <div className="text-lg font-bold text-primary">Musterstraße 42, 10115 Berlin</div>
              </div>
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-green-100">
                <CheckCircle2 className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </div>
          {/* Items */}
          <div className="divide-y divide-gray-border">
            {[
              { label: "B-Plan Konformität", status: "green", text: "Vollständig konform" },
              { label: "Max. BGF", status: "green", text: "4.200 m² realisierbar" },
              { label: "Stellplätze", status: "yellow", text: "28 erforderlich, 24 darstellbar" },
              { label: "Erschließung", status: "green", text: "Vollerschlossen" },
              { label: "Risikofaktoren", status: "green", text: "Keine identifiziert" },
            ].map((item, i) => (
              <div key={i} className="flex items-center justify-between px-6 py-3">
                <span className="text-sm font-medium text-slate-text/70">{item.label}</span>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-slate-text/50">{item.text}</span>
                  <span className={`h-3 w-3 rounded-full ${item.status === "green" ? "bg-green-500" : item.status === "yellow" ? "bg-yellow-500" : "bg-red-500"}`} />
                </div>
              </div>
            ))}
          </div>
          {/* Footer */}
          <div className="border-t border-gray-border bg-green-50 px-6 py-4">
            <div className="flex items-center gap-3">
              <CheckCircle2 className="h-5 w-5 text-green-600" />
              <div>
                <div className="text-sm font-bold text-green-800">Empfehlung: Ankauf empfohlen</div>
                <div className="text-xs text-green-600">Stellplatz-Delta durch TG-Anpassung lösbar</div>
              </div>
            </div>
          </div>
        </div>
      </FadeIn>
    </Section>
  );
}

/* ─── ROI ──────────────────────────────────────────────── */

function ROI() {
  return (
    <Section gray>
      <FadeIn>
        <div className="mb-4 inline-flex items-center gap-2 text-sm font-semibold uppercase tracking-wider text-accent">
          <CircleDollarSign className="h-4 w-4" /> ROI
        </div>
        <h2 className="mb-12 text-3xl font-bold text-primary md:text-4xl">
          Eine verhinderte Fehlakquise reicht
        </h2>
      </FadeIn>
      <div className="grid gap-8 md:grid-cols-3">
        {[
          { num: "€200k+", label: "pro verhinderte Fehlakquise gespart", sub: "Kaufpreis, Gutachten, Planungskosten, Opportunitätskosten" },
          { num: "48h", label: "statt 3–4 Wochen Due Diligence", sub: "Vom Grundstückshinweis zum Ampel-Report" },
          { num: "1×", label: "reicht für den ROI", sub: "Eine einzige verhinderte Fehlakquise deckt die Lizenzkosten" },
        ].map((item, i) => (
          <FadeIn key={i} delay={i * 0.1}>
            <div className="rounded-2xl border border-gray-border bg-white p-10 text-center">
              <div className="mb-2 text-5xl font-extrabold text-primary">{item.num}</div>
              <div className="mb-2 text-sm font-semibold text-slate-text/80">{item.label}</div>
              <div className="text-xs text-slate-text/40">{item.sub}</div>
            </div>
          </FadeIn>
        ))}
      </div>
    </Section>
  );
}

/* ─── CTA ──────────────────────────────────────────────── */

function CTA() {
  return (
    <Section>
      <FadeIn>
        <div className="rounded-3xl bg-primary px-8 py-16 text-center md:px-16">
          <h2 className="mb-4 text-3xl font-bold text-white md:text-4xl">
            Nie wieder blind kaufen
          </h2>
          <p className="mx-auto mb-8 max-w-xl text-lg text-white/60">
            Sehen Sie in einer Live-Demo, wie der 48h-Machbarkeitscheck funktioniert — mit einem Ihrer echten Grundstücke.
          </p>
          <a href="/uplan-engine/#kontakt" className="inline-flex items-center gap-2 rounded-lg bg-accent px-8 py-4 text-base font-semibold text-white transition hover:bg-accent-light">
            Demo anfragen <ArrowRight className="h-5 w-5" />
          </a>
        </div>
      </FadeIn>
    </Section>
  );
}

/* ─── Page ─────────────────────────────────────────────── */

export default function AnkaufspruefungPage() {
  return (
    <>
      <Nav />
      <main>
        <Hero />
        <Problem />
        <WhatWeCheck />
        <AmpelReport />
        <ROI />
        <CTA />
      </main>
      <Footer />
    </>
  );
}
