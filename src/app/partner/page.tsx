"use client";

import { useRef } from "react";
import { motion, useInView } from "framer-motion";
import {
  Upload,
  Search,
  ShoppingBag,
  BarChart3,
  Target,
  Zap,
  Box,
  Check,
  ArrowRight,
  Mail,
} from "lucide-react";

/* ─── Helpers ──────────────────────────────────────────── */

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
        <nav className="hidden items-center gap-6 text-sm font-medium text-slate-text/60 md:flex">
          <a href="/uplan-engine/" className="transition hover:text-primary">Startseite</a>
          <a href="/uplan-engine/produkt" className="transition hover:text-primary">Produkt</a>
          <a href="/uplan-engine/partner" className="font-semibold text-primary">Partner</a>
        </nav>
        <a
          href="mailto:hello@uplan-engine.de"
          className="hidden rounded-lg bg-accent px-5 py-2 text-sm font-semibold text-white transition hover:bg-accent-light sm:inline-flex"
        >
          Partner werden
        </a>
      </div>
    </motion.header>
  );
}

/* ─── 1. HERO ──────────────────────────────────────────── */

function Hero() {
  return (
    <section className="relative overflow-hidden bg-white pt-24 pb-20 md:pt-36 md:pb-28">
      <div className="mx-auto max-w-6xl px-6">
        <div className="grid items-center gap-12 lg:grid-cols-2">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: [0.25, 0.4, 0.25, 1] }}
          >
            <p className="mb-4 text-sm font-semibold tracking-widest text-accent uppercase">
              Für Modulhersteller & Systembauer
            </p>
            <h1 className="text-4xl font-extrabold leading-[1.1] tracking-tight text-primary sm:text-5xl lg:text-6xl">
              Ihre Gebäude.
              <br />
              Tausende Projekte.
            </h1>
            <p className="mt-6 max-w-lg text-lg leading-relaxed text-slate-text/70">
              Integrieren Sie Ihre seriellen Module in U-Plan Engine und werden
              Sie zur ersten Wahl bei der Konzepterstellung.
            </p>
            <div className="mt-8 flex flex-col gap-4 sm:flex-row">
              <a
                href="mailto:hello@uplan-engine.de"
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-accent px-8 py-4 text-base font-semibold text-white shadow-lg shadow-accent/20 transition hover:bg-accent-light hover:shadow-xl hover:shadow-accent/30"
              >
                <Mail className="h-4 w-4" /> Partner werden
              </a>
              <a
                href="/uplan-engine/demo"
                className="inline-flex items-center justify-center gap-2 rounded-xl border border-gray-border px-8 py-4 text-base font-semibold text-primary transition hover:border-primary/30 hover:bg-gray-bg"
              >
                Demo ansehen <ArrowRight className="h-4 w-4" />
              </a>
            </div>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/uplan-engine/images/pages/optimized/partner-hero.jpg"
              alt="Partner Hero — Modulare Gebäude"
              className="w-full rounded-2xl shadow-2xl"
              loading="lazy"
            />
          </motion.div>
        </div>
      </div>
      <div className="pointer-events-none absolute -top-40 right-0 h-[500px] w-[500px] rounded-full bg-accent/5 blur-3xl" />
    </section>
  );
}

/* ─── 2. SO FUNKTIONIERT'S ─────────────────────────────── */

const steps = [
  {
    num: "01",
    icon: Upload,
    title: "Katalog hochladen",
    desc: "Laden Sie Ihre Gebäudemodule mit Grundrissen, technischen Daten und Preisen hoch. Wir digitalisieren und integrieren.",
  },
  {
    num: "02",
    icon: Search,
    title: "Planer entdecken Sie",
    desc: "Projektentwickler sehen Ihre Module in der Konzeptstudie — mit Match-Score zur B-Plan-Kompatibilität.",
  },
  {
    num: "03",
    icon: ShoppingBag,
    title: "Aufträge erhalten",
    desc: "Wird Ihr Modul gewählt, erhalten Sie den Auftrag direkt. Vom Konzept zum Deal in Tagen.",
  },
];

function HowItWorks() {
  return (
    <section className="bg-gray-bg py-24 md:py-32">
      <div className="mx-auto max-w-6xl px-6">
        <FadeIn className="mb-16 text-center">
          <h2 className="text-3xl font-bold tracking-tight text-primary md:text-4xl lg:text-[2.75rem]">
            So funktioniert&apos;s
          </h2>
        </FadeIn>
        <div className="grid gap-8 md:grid-cols-3">
          {steps.map((s, i) => (
            <FadeIn key={i} delay={i * 0.15}>
              <div className="flex flex-col items-center text-center">
                <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-accent/10">
                  <s.icon className="h-8 w-8 text-accent" />
                </div>
                <span className="mt-2 text-xs font-bold text-accent/60">{s.num}</span>
                <h3 className="mt-3 text-lg font-bold text-primary">{s.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-slate-text/70">{s.desc}</p>
              </div>
            </FadeIn>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ─── 3. VORTEILE ──────────────────────────────────────── */

const benefits = [
  { icon: BarChart3, title: "Sichtbarkeit", desc: "Ihr Katalog vor tausenden Projektentwicklern in ganz Deutschland." },
  { icon: Target, title: "Qualifizierte Leads", desc: "Nur Anfragen von Projekten, die zu Ihren Modulen passen." },
  { icon: Zap, title: "Schnellere Deals", desc: "Vom Konzept zum Auftrag in Tagen statt Monaten." },
  { icon: Box, title: "Digitaler Zwilling", desc: "Ihre Module als konfigurierbare Modelle mit BIM-Daten." },
];

function Benefits() {
  return (
    <section className="bg-white py-24 md:py-32">
      <div className="mx-auto max-w-6xl px-6">
        <FadeIn className="mb-16 text-center">
          <h2 className="text-3xl font-bold tracking-tight text-primary md:text-4xl lg:text-[2.75rem]">
            Ihre Vorteile
          </h2>
        </FadeIn>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {benefits.map((b, i) => (
            <FadeIn key={i} delay={i * 0.1}>
              <div className="rounded-2xl border border-gray-border bg-white p-6 shadow-sm">
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-accent/10">
                  <b.icon className="h-6 w-6 text-accent" />
                </div>
                <h3 className="font-bold text-primary">{b.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-slate-text/70">{b.desc}</p>
              </div>
            </FadeIn>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ─── 4. PARTNER LOGOS ─────────────────────────────────── */

const partners = ["GROPYUS", "Nokera", "ALHO", "Goldbeck", "Max Bögl"];

function Partners() {
  return (
    <section className="bg-gray-bg py-20">
      <div className="mx-auto max-w-6xl px-6">
        <FadeIn className="mb-12 text-center">
          <h2 className="text-3xl font-bold tracking-tight text-primary md:text-4xl">
            Bereits auf der Plattform
          </h2>
        </FadeIn>
        <FadeIn delay={0.1}>
          <div className="flex flex-wrap items-center justify-center gap-4">
            {partners.map((name) => (
              <div
                key={name}
                className="flex h-16 w-36 items-center justify-center rounded-xl border border-gray-border bg-white text-sm font-semibold text-slate-text/40 shadow-sm"
              >
                {name}
              </div>
            ))}
          </div>
          <p className="mt-6 text-center text-sm text-slate-text/50">
            ...und weitere Partner folgen
          </p>
        </FadeIn>
      </div>
    </section>
  );
}

/* ─── 5. CHECKLIST ─────────────────────────────────────── */

const checklist = [
  "Gebäude-Grundrisse (DWG/PDF)",
  "Technische Daten (Geschosse, Flächen, Energie)",
  "Richtpreise (€/m²)",
  "Rendering oder Foto (optional)",
  "BIM-Datei (optional)",
];

function Checklist() {
  return (
    <section className="bg-white py-24 md:py-32">
      <div className="mx-auto max-w-6xl px-6">
        <FadeIn className="mb-16 text-center">
          <h2 className="text-3xl font-bold tracking-tight text-primary md:text-4xl lg:text-[2.75rem]">
            Was Sie bereitstellen
          </h2>
        </FadeIn>
        <div className="grid items-center gap-12 lg:grid-cols-2">
          <FadeIn>
            <ul className="space-y-4">
              {checklist.map((item, i) => (
                <li key={i} className="flex items-start gap-3">
                  <div className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-accent/10">
                    <Check className="h-4 w-4 text-accent" />
                  </div>
                  <span className="text-base text-primary">{item}</span>
                </li>
              ))}
            </ul>
            <p className="mt-8 text-sm leading-relaxed text-slate-text/70">
              Wir digitalisieren, integrieren und pflegen — Sie lehnen sich zurück.
            </p>
          </FadeIn>
          <FadeIn delay={0.15}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/uplan-engine/images/pages/optimized/partner-factory.jpg"
              alt="Modulare Fertigung"
              className="w-full rounded-2xl shadow-lg"
              loading="lazy"
            />
          </FadeIn>
        </div>
      </div>
    </section>
  );
}

/* ─── 6. CTA ───────────────────────────────────────────── */

function CTA() {
  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-primary/[0.03] to-accent/[0.06] py-24 md:py-32">
      <div className="mx-auto max-w-6xl px-6">
        <FadeIn className="text-center">
          <h2 className="text-3xl font-bold tracking-tight text-primary md:text-4xl lg:text-5xl">
            Werden Sie Partner
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-lg text-slate-text/70">
            In 2 Wochen live auf der Plattform.
          </p>
          <div className="mt-10">
            <a
              href="mailto:hello@uplan-engine.de"
              className="inline-flex items-center gap-2 rounded-xl bg-accent px-8 py-4 text-base font-semibold text-white shadow-lg shadow-accent/20 transition hover:bg-accent-light hover:shadow-xl hover:shadow-accent/30"
            >
              <Mail className="h-5 w-5" /> Jetzt Kontakt aufnehmen
            </a>
          </div>
        </FadeIn>
      </div>
    </section>
  );
}

/* ─── 7. FOOTER ────────────────────────────────────────── */

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
        <p className="text-sm text-slate-text/50">Vom Flürstück zur Genehmigungsreife.</p>
        <nav className="flex flex-wrap justify-center gap-x-6 gap-y-2 text-sm text-slate-text/50">
          <a href="/uplan-engine/" className="transition hover:text-primary">Startseite</a>
          <a href="/uplan-engine/produkt" className="transition hover:text-primary">Produkt</a>
          <a href="/uplan-engine/partner" className="transition hover:text-primary">Partner</a>
          <a href="/uplan-engine/technologie" className="transition hover:text-primary">Technologie</a>
          <a href="mailto:hello@uplan-engine.de" className="transition hover:text-primary">Kontakt</a>
        </nav>
        <p className="text-xs text-slate-text/30">© 2026 U-Plan Engine · Impressum · Datenschutz</p>
      </div>
    </footer>
  );
}

/* ─── PAGE ─────────────────────────────────────────────── */

export default function PartnerPage() {
  return (
    <>
      <Nav />
      <main>
        <Hero />
        <HowItWorks />
        <Benefits />
        {/* Partners section removed */}
        <Checklist />
        <CTA />
      </main>
      <Footer />
    </>
  );
}
