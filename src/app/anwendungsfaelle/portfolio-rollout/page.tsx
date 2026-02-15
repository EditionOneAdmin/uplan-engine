"use client";

import { useRef } from "react";
import { motion, useInView } from "framer-motion";
import {
  Building2,
  Clock,
  CheckCircle2,
  ArrowRight,
  BarChart3,
  Layers3,
  Zap,
  TrendingUp,
  FolderOpen,
  ShieldCheck,
  Quote,
  MapPin,
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
        <img src="/uplan-engine/images/usecase-portfolio.jpg" alt="" className="h-full w-full object-cover" />
      </div>
      <div className="absolute inset-0 bg-gradient-to-b from-primary/80 to-primary" />
      <div className="relative mx-auto max-w-6xl px-6">
        <FadeIn>
          <span className="mb-4 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-1.5 text-sm font-medium text-white/80 backdrop-blur">
            <Building2 className="h-4 w-4" /> Anwendungsfall
          </span>
          <h1 className="mb-6 max-w-3xl text-4xl leading-tight font-bold tracking-tight text-white md:text-6xl">
            Portfolio-Rollout: <br className="hidden md:block" />
            <span className="text-accent-light">50+ Standorte</span> parallel analysieren
          </h1>
          <p className="mb-8 max-w-2xl text-lg leading-relaxed text-white/70">
            Projektentwickler mit großen Portfolios können nicht jeden Standort manuell prüfen. Die U-Plan Engine batch-analysiert alle Flurstücke parallel — in einem Bruchteil der Zeit.
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
          <Clock className="h-4 w-4" /> Das Problem
        </div>
        <h2 className="mb-6 text-3xl font-bold text-primary md:text-4xl">
          50+ Standorte. Ein Team. Unmöglich manuell.
        </h2>
        <p className="mb-12 max-w-3xl text-lg leading-relaxed text-slate-text/70">
          Große Projektentwickler und Wohnungsbaugesellschaften haben dutzende potenzielle Standorte im Portfolio. Jedes Flurstück einzeln gegen den B-Plan zu prüfen, kostet Wochen — und Fehler schleichen sich ein.
        </p>
      </FadeIn>
      <div className="grid gap-6 md:grid-cols-3">
        {[
          { icon: FolderOpen, title: "Fragmentierte Daten", desc: "Jeder Standort hat eigene B-Pläne, Festsetzungen, Auflagen. Alles manuell zusammensuchen." },
          { icon: Clock, title: "Wochen pro Standort", desc: "Manuelle Prüfung dauert 3–5 Tage pro Flurstück. Bei 50 Standorten wird das zum Flaschenhals." },
          { icon: ShieldCheck, title: "Inkonsistente Qualität", desc: "Verschiedene Bearbeiter, verschiedene Standards. Fehler werden erst spät entdeckt." },
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

/* ─── Before / After ───────────────────────────────────── */

function BeforeAfter() {
  return (
    <Section gray>
      <FadeIn>
        <div className="mb-4 inline-flex items-center gap-2 text-sm font-semibold uppercase tracking-wider text-accent">
          <BarChart3 className="h-4 w-4" /> Vorher vs. Nachher
        </div>
        <h2 className="mb-12 text-3xl font-bold text-primary md:text-4xl">
          Der Unterschied ist messbar
        </h2>
      </FadeIn>
      <div className="grid gap-8 md:grid-cols-2">
        {/* Before */}
        <FadeIn delay={0.1}>
          <div className="rounded-2xl border-2 border-red-200 bg-white p-8">
            <div className="mb-6 inline-flex items-center gap-2 rounded-full bg-red-50 px-3 py-1 text-sm font-semibold text-red-600">
              Manuell — Vorher
            </div>
            <ul className="space-y-4">
              {[
                "5 Standorte pro Monat geprüft",
                "3–5 Tage pro Flurstück",
                "Häufige Nachforderungen vom Amt",
                "Keine einheitlichen Standards",
                "Excel-Listen und E-Mail-Ping-Pong",
              ].map((t, i) => (
                <li key={i} className="flex items-start gap-3 text-sm text-slate-text/70">
                  <span className="mt-0.5 h-5 w-5 shrink-0 rounded-full bg-red-100 text-center text-xs leading-5 text-red-500">✕</span>
                  {t}
                </li>
              ))}
            </ul>
          </div>
        </FadeIn>
        {/* After */}
        <FadeIn delay={0.2}>
          <div className="rounded-2xl border-2 border-accent/30 bg-white p-8">
            <div className="mb-6 inline-flex items-center gap-2 rounded-full bg-accent/10 px-3 py-1 text-sm font-semibold text-accent">
              U-Plan Engine — Nachher
            </div>
            <ul className="space-y-4">
              {[
                "50 Standorte pro Woche analysiert",
                "Minuten statt Tage pro Flurstück",
                "90% weniger Nachforderungen",
                "Einheitliche Qualitätsstandards",
                "Zentrales Dashboard mit Status-Tracking",
              ].map((t, i) => (
                <li key={i} className="flex items-start gap-3 text-sm text-slate-text/70">
                  <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-accent" />
                  {t}
                </li>
              ))}
            </ul>
          </div>
        </FadeIn>
      </div>
    </Section>
  );
}

/* ─── Numbers ──────────────────────────────────────────── */

function Numbers() {
  return (
    <Section>
      <FadeIn>
        <div className="mb-12 text-center">
          <h2 className="mb-4 text-3xl font-bold text-primary md:text-4xl">In Zahlen</h2>
          <p className="text-lg text-slate-text/60">Messbare Ergebnisse für Ihr Portfolio</p>
        </div>
      </FadeIn>
      <div className="grid gap-6 sm:grid-cols-3">
        {[
          { num: "10×", label: "schnellere Analyse", icon: Zap },
          { num: "90%", label: "weniger Nachforderungen", icon: ShieldCheck },
          { num: "100%", label: "einheitliche Qualität", icon: Layers3 },
        ].map((s, i) => (
          <FadeIn key={i} delay={i * 0.1}>
            <div className="rounded-2xl border border-gray-border bg-gray-bg p-10 text-center">
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

/* ─── Timeline ─────────────────────────────────────────── */

function Timeline() {
  return (
    <Section gray>
      <FadeIn>
        <div className="mb-4 inline-flex items-center gap-2 text-sm font-semibold uppercase tracking-wider text-accent">
          <TrendingUp className="h-4 w-4" /> Timeline-Vergleich
        </div>
        <h2 className="mb-12 text-3xl font-bold text-primary md:text-4xl">
          6 Monate vs. 3 Wochen
        </h2>
      </FadeIn>
      <div className="space-y-8">
        {/* Manual */}
        <FadeIn delay={0.1}>
          <div className="rounded-2xl border border-gray-border bg-white p-6">
            <div className="mb-4 text-sm font-semibold text-red-500">Manueller Prozess</div>
            <div className="relative h-12 overflow-hidden rounded-xl bg-gray-bg">
              <motion.div className="absolute inset-y-0 left-0 flex items-center rounded-xl bg-red-100 px-4" initial={{ width: 0 }} whileInView={{ width: "100%" }} viewport={{ once: true }} transition={{ duration: 1.2, ease: "easeOut" }}>
                <span className="text-sm font-bold text-red-600">6 Monate</span>
              </motion.div>
            </div>
            <div className="mt-3 flex justify-between text-xs text-slate-text/40">
              <span>Start</span>
              <span>Datensammlung</span>
              <span>Prüfung</span>
              <span>Korrekturen</span>
              <span>Nachforderungen</span>
              <span>Fertig</span>
            </div>
          </div>
        </FadeIn>
        {/* Engine */}
        <FadeIn delay={0.2}>
          <div className="rounded-2xl border border-accent/20 bg-white p-6">
            <div className="mb-4 text-sm font-semibold text-accent">Mit U-Plan Engine</div>
            <div className="relative h-12 overflow-hidden rounded-xl bg-gray-bg">
              <motion.div className="absolute inset-y-0 left-0 flex items-center rounded-xl bg-accent/15 px-4" initial={{ width: 0 }} whileInView={{ width: "12.5%" }} viewport={{ once: true }} transition={{ duration: 0.8, ease: "easeOut" }}>
                <span className="whitespace-nowrap text-sm font-bold text-accent">3 Wochen</span>
              </motion.div>
            </div>
            <div className="mt-3 flex gap-8 text-xs text-slate-text/40">
              <span>Upload</span>
              <span>Analyse</span>
              <span>Report</span>
            </div>
          </div>
        </FadeIn>
      </div>
    </Section>
  );
}

/* ─── Quote ────────────────────────────────────────────── */

function TestimonialSection() {
  return (
    <Section>
      <FadeIn>
        <div className="mx-auto max-w-3xl text-center">
          <Quote className="mx-auto mb-6 h-10 w-10 text-accent/30" />
          <blockquote className="mb-6 text-2xl leading-relaxed font-medium text-primary md:text-3xl">
            &ldquo;Wir haben unser gesamtes Portfolio von 68 Standorten in unter einem Monat durchanalysiert. Manuell hätten wir ein Jahr gebraucht.&rdquo;
          </blockquote>
          <div className="text-sm text-slate-text/50">
            — Leitung Projektentwicklung, Wohnungsbaugesellschaft
          </div>
        </div>
      </FadeIn>
    </Section>
  );
}

/* ─── CTA ──────────────────────────────────────────────── */

function CTA() {
  return (
    <Section gray>
      <FadeIn>
        <div className="rounded-3xl bg-primary px-8 py-16 text-center md:px-16">
          <h2 className="mb-4 text-3xl font-bold text-white md:text-4xl">
            Bereit für den Portfolio-Rollout?
          </h2>
          <p className="mx-auto mb-8 max-w-xl text-lg text-white/60">
            Erfahren Sie in einer Live-Demo, wie die U-Plan Engine Ihr gesamtes Portfolio in Wochen statt Monaten analysiert.
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

export default function PortfolioRolloutPage() {
  return (
    <>
      <Nav />
      <main>
        <Hero />
        <Problem />
        <BeforeAfter />
        <Numbers />
        <Timeline />
        <TestimonialSection />
        <CTA />
      </main>
      <Footer />
    </>
  );
}
