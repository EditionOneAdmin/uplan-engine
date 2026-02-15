"use client";

import { useRef } from "react";
import { motion, useInView } from "framer-motion";
import {
  Copy,
  ArrowRight,
  CheckCircle2,
  Clock,
  Building2,
  Layers3,
  Puzzle,
  Repeat,
  MapPin,
  Ruler,
  Zap,
  FileCheck,
  Quote,
  Grid3X3,
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
        <img src="/uplan-engine/images/usecase-seriell.jpg" alt="" className="h-full w-full object-cover" />
      </div>
      <div className="absolute inset-0 bg-gradient-to-b from-primary/80 to-primary" />
      <div className="relative mx-auto max-w-6xl px-6">
        <FadeIn>
          <span className="mb-4 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-1.5 text-sm font-medium text-white/80 backdrop-blur">
            <Copy className="h-4 w-4" /> Anwendungsfall
          </span>
          <h1 className="mb-6 max-w-3xl text-4xl leading-tight font-bold tracking-tight text-white md:text-6xl">
            Serielle Planung: <br className="hidden md:block" />
            <span className="text-accent-light">Ein Template, viele Standorte</span>
          </h1>
          <p className="mb-8 max-w-2xl text-lg leading-relaxed text-white/70">
            Standardisierte Gebäudetypen auf unterschiedliche Grundstücke anwenden — automatisch angepasst an lokale B-Plan Constraints. 60% weniger Planungsaufwand.
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
          <Repeat className="h-4 w-4" /> Das Problem
        </div>
        <h2 className="mb-6 text-3xl font-bold text-primary md:text-4xl">
          Jedes Mal von Null anfangen — bei identischen Gebäudetypen
        </h2>
        <p className="mb-12 max-w-3xl text-lg leading-relaxed text-slate-text/70">
          Sie haben ein bewährtes MFH-Konzept: 4 Geschosse, 12 Wohneinheiten, optimierte Grundrisse. Aber für jeden neuen Standort beginnt die Planung von vorne — weil die B-Plan Constraints anders sind. Die U-Plan Engine macht Schluss damit.
        </p>
      </FadeIn>
      <div className="grid gap-6 md:grid-cols-3">
        {[
          { icon: Clock, title: "Redundante Arbeit", desc: "Architekten entwerfen dasselbe Gebäude immer wieder neu — nur weil sich GRZ, Höhe oder Abstandsflächen unterscheiden." },
          { icon: Ruler, title: "Manuelle Anpassung", desc: "Jede Festsetzung muss einzeln geprüft und der Entwurf händisch angepasst werden." },
          { icon: FileCheck, title: "Langsame Freigaben", desc: "Ohne standardisierte Nachweise dauern Genehmigungsprozesse unnötig lang." },
        ].map((item, i) => (
          <FadeIn key={i} delay={i * 0.1}>
            <div className="rounded-2xl border border-gray-border bg-white p-8 shadow-sm">
              <item.icon className="mb-4 h-8 w-8 text-primary/40" />
              <h3 className="mb-2 text-lg font-bold text-primary">{item.title}</h3>
              <p className="text-sm leading-relaxed text-slate-text/60">{item.desc}</p>
            </div>
          </FadeIn>
        ))}
      </div>
    </Section>
  );
}

/* ─── Visualization: Template → Grundstücke → Varianten ── */

function TemplateFlow() {
  return (
    <Section gray>
      <FadeIn>
        <div className="mb-4 inline-flex items-center gap-2 text-sm font-semibold uppercase tracking-wider text-accent">
          <Puzzle className="h-4 w-4" /> So funktioniert es
        </div>
        <h2 className="mb-12 text-3xl font-bold text-primary md:text-4xl">
          Template → Grundstücke → angepasste Varianten
        </h2>
      </FadeIn>
      <div className="grid items-center gap-6 md:grid-cols-5">
        {/* Template */}
        <FadeIn delay={0.1} className="md:col-span-1">
          <div className="rounded-2xl border-2 border-accent/30 bg-white p-6 text-center">
            <Building2 className="mx-auto mb-3 h-10 w-10 text-accent" />
            <div className="text-sm font-bold text-primary">MFH-Standard</div>
            <div className="mt-1 text-xs text-slate-text/50">4 Geschosse · 12 WE</div>
            <div className="mt-1 text-xs text-slate-text/50">1.200 m² BGF</div>
          </div>
        </FadeIn>
        {/* Arrow */}
        <FadeIn delay={0.2} className="flex justify-center md:col-span-1">
          <ArrowRight className="h-8 w-8 text-accent/40 max-md:rotate-90" />
        </FadeIn>
        {/* Grundstücke */}
        <FadeIn delay={0.3} className="md:col-span-1">
          <div className="space-y-3">
            {["Berlin-Spandau", "Hamburg-Bergedorf", "Leipzig-Grünau"].map((loc, i) => (
              <div key={i} className="flex items-center gap-2 rounded-xl border border-gray-border bg-white px-4 py-2.5">
                <MapPin className="h-4 w-4 text-primary/40" />
                <span className="text-xs font-medium text-slate-text/70">{loc}</span>
              </div>
            ))}
            <div className="rounded-xl border border-dashed border-gray-border bg-white px-4 py-2.5 text-center text-xs text-slate-text/30">
              + 7 weitere …
            </div>
          </div>
        </FadeIn>
        {/* Arrow */}
        <FadeIn delay={0.4} className="flex justify-center md:col-span-1">
          <ArrowRight className="h-8 w-8 text-accent/40 max-md:rotate-90" />
        </FadeIn>
        {/* Varianten */}
        <FadeIn delay={0.5} className="md:col-span-1">
          <div className="space-y-3">
            {[
              { label: "Variante A", detail: "4 Gesch. · GRZ 0.4" },
              { label: "Variante B", detail: "3 Gesch. · GRZ 0.3" },
              { label: "Variante C", detail: "4 Gesch. · Staffel" },
            ].map((v, i) => (
              <div key={i} className="rounded-xl border border-accent/20 bg-accent/5 px-4 py-2.5">
                <div className="text-xs font-bold text-accent">{v.label}</div>
                <div className="text-xs text-slate-text/50">{v.detail}</div>
              </div>
            ))}
            <div className="rounded-xl border border-dashed border-accent/20 bg-accent/5 px-4 py-2.5 text-center text-xs text-accent/40">
              + 7 weitere …
            </div>
          </div>
        </FadeIn>
      </div>
    </Section>
  );
}

/* ─── Example ──────────────────────────────────────────── */

function Example() {
  return (
    <Section>
      <FadeIn>
        <div className="mb-4 inline-flex items-center gap-2 text-sm font-semibold uppercase tracking-wider text-accent">
          <Grid3X3 className="h-4 w-4" /> Praxisbeispiel
        </div>
        <h2 className="mb-6 text-3xl font-bold text-primary md:text-4xl">
          1 Template × 10 Grundstücke
        </h2>
        <p className="mb-12 max-w-3xl text-lg text-slate-text/60">
          Ein Wohnungsbauunternehmen appliziert sein MFH-Standard-Template auf 10 verschiedene Grundstücke. Die U-Plan Engine prüft automatisch, wo der Standard passt — und wo er angepasst werden muss.
        </p>
      </FadeIn>
      {/* Mini table */}
      <FadeIn delay={0.1}>
        <div className="overflow-hidden rounded-2xl border border-gray-border bg-white">
          <div className="grid grid-cols-4 gap-px bg-gray-border text-sm font-semibold text-primary">
            <div className="bg-gray-bg px-4 py-3">Standort</div>
            <div className="bg-gray-bg px-4 py-3">B-Plan Status</div>
            <div className="bg-gray-bg px-4 py-3">Anpassung</div>
            <div className="bg-gray-bg px-4 py-3">Ergebnis</div>
          </div>
          {[
            { loc: "Berlin-Spandau", status: "green", adj: "Keine", res: "Standard passt" },
            { loc: "Hamburg-Bergedorf", status: "yellow", adj: "3 → 4 Gesch. nicht zulässig", res: "3-Gesch. Variante" },
            { loc: "Leipzig-Grünau", status: "green", adj: "Keine", res: "Standard passt" },
            { loc: "München-Riem", status: "yellow", adj: "Staffelgeschoss nötig", res: "Staffel-Variante" },
            { loc: "Dresden-Pieschen", status: "red", adj: "GRZ zu niedrig", res: "Standort ungeeignet" },
          ].map((row, i) => (
            <div key={i} className="grid grid-cols-4 gap-px bg-gray-border text-sm">
              <div className="bg-white px-4 py-3 font-medium text-slate-text/80">{row.loc}</div>
              <div className="flex items-center gap-2 bg-white px-4 py-3">
                <span className={`h-2.5 w-2.5 rounded-full ${row.status === "green" ? "bg-green-500" : row.status === "yellow" ? "bg-yellow-500" : "bg-red-500"}`} />
                <span className="text-slate-text/60">{row.status === "green" ? "Konform" : row.status === "yellow" ? "Anpassbar" : "Nicht machbar"}</span>
              </div>
              <div className="bg-white px-4 py-3 text-slate-text/60">{row.adj}</div>
              <div className="bg-white px-4 py-3 text-slate-text/60">{row.res}</div>
            </div>
          ))}
        </div>
      </FadeIn>
    </Section>
  );
}

/* ─── Numbers ──────────────────────────────────────────── */

function Numbers() {
  return (
    <Section gray>
      <FadeIn>
        <div className="mb-12 text-center">
          <h2 className="mb-4 text-3xl font-bold text-primary md:text-4xl">Ergebnisse</h2>
          <p className="text-lg text-slate-text/60">Messbare Effizienzgewinne durch serielle Planung</p>
        </div>
      </FadeIn>
      <div className="grid gap-6 sm:grid-cols-3">
        {[
          { num: "60%", label: "weniger Planungsaufwand", icon: Zap },
          { num: "3×", label: "schnellere Freigaben", icon: FileCheck },
          { num: "10+", label: "Standorte parallel", icon: Layers3 },
        ].map((s, i) => (
          <FadeIn key={i} delay={i * 0.1}>
            <div className="rounded-2xl border border-gray-border bg-white p-10 text-center">
              <s.icon className="mx-auto mb-4 h-8 w-8 text-accent" />
              <div className="mb-2 text-5xl font-extrabold text-primary">{s.num}</div>
              <div className="text-sm font-medium text-slate-text/60">{s.label}</div>
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
            Serielle Planung starten
          </h2>
          <p className="mx-auto mb-8 max-w-xl text-lg text-white/60">
            Sehen Sie in einer Live-Demo, wie Ihr Gebäudetemplate automatisch auf verschiedene Standorte angepasst wird.
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

export default function SeriellePlanungPage() {
  return (
    <>
      <Nav />
      <main>
        <Hero />
        <Problem />
        <TemplateFlow />
        <Example />
        <Numbers />
        <CTA />
      </main>
      <Footer />
    </>
  );
}
