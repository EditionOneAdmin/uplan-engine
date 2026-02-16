"use client";

import { useRef, useState, useEffect } from "react";
import { motion, useInView, AnimatePresence } from "framer-motion";
import {
  ShieldCheck,
  Layers,
  Wallet,
  Check,
  ArrowRight,
  Mail,
  Building2,
  Wrench,
  Ruler,
  ChevronRight,
  ChevronDown,
  Menu,
  X,
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

/* ─── NAV ──────────────────────────────────────────────── */

function Nav() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [ucOpen, setUcOpen] = useState(false);

  useEffect(() => {
    const handler = () => { if (window.innerWidth >= 768) setMobileOpen(false); };
    window.addEventListener("resize", handler);
    return () => window.removeEventListener("resize", handler);
  }, []);

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
        <a href="/uplan-engine/" className="flex items-center gap-2">
          <svg width="28" height="28" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
            <rect width="32" height="32" rx="8" fill="#1E3A5F" />
            <path d="M8 10h6a4 4 0 0 1 0 8H8V10z" fill="white" />
            <path d="M17 14h7a4 4 0 0 1 0 8h-7V14z" fill="#0D9488" />
          </svg>
          <span className="text-lg font-bold text-primary">U-Plan Engine</span>
        </a>

        <nav className="hidden items-center gap-6 text-sm font-medium text-slate-text/60 md:flex">
          <a href="/uplan-engine/produkt" className="transition hover:text-primary">Produkt</a>
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
          <a href="/uplan-engine/technologie" className="transition hover:text-primary">Technologie</a>
          <a href="/uplan-engine/lizenzen" className="transition hover:text-primary">Pläne lizenzieren</a>
        </nav>

        <div className="flex items-center gap-3">
          <a href="/uplan-engine/demo" className="hidden rounded-lg bg-accent px-5 py-2 text-sm font-semibold text-white transition hover:bg-accent-light sm:inline-flex">
            Interaktive Demo
          </a>
          <button className="md:hidden flex h-10 w-10 items-center justify-center rounded-lg hover:bg-gray-bg transition" onClick={() => setMobileOpen(!mobileOpen)}>
            {mobileOpen ? <X className="h-5 w-5 text-primary" /> : <Menu className="h-5 w-5 text-primary" />}
          </button>
        </div>
      </div>

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
              <a href="/uplan-engine/lizenzen" className="rounded-lg px-3 py-2.5 text-sm font-medium text-primary hover:bg-gray-bg transition" onClick={() => setMobileOpen(false)}>Pläne lizenzieren</a>
              <a href="/uplan-engine/demo" className="mt-2 rounded-lg bg-accent px-4 py-2.5 text-center text-sm font-semibold text-white hover:bg-accent-light transition" onClick={() => setMobileOpen(false)}>Interaktive Demo</a>
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.header>
  );
}

/* ─── 1. HERO ──────────────────────────────────────────── */

function Hero() {
  return (
    <section className="relative overflow-hidden bg-white pt-28 pb-20 md:pt-36 md:pb-28">
      <div className="mx-auto max-w-6xl px-6">
        <div className="flex flex-col items-center gap-12 lg:flex-row lg:items-center lg:gap-16">
          <motion.div
            className="flex-1 text-center lg:text-left"
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: [0.25, 0.4, 0.25, 1] }}
          >
            <p className="mb-6 text-sm font-semibold tracking-widest text-accent uppercase">
              Für Architekten · Ingenieure · Planer
            </p>
            <h1 className="text-4xl font-extrabold leading-[1.1] tracking-tight text-primary sm:text-5xl md:text-6xl">
              Ihre Pläne.
              <br />
              Passives Einkommen.
            </h1>
            <p className="mt-6 max-w-xl text-lg leading-relaxed text-slate-text/70 md:text-xl">
              Lizenzieren Sie genehmigte Bauplanungen auf U-Plan Engine — und verdienen Sie jedes Mal, wenn jemand Ihr Konzept als Grundlage nutzt.
            </p>
            <div className="mt-10 flex flex-col gap-4 sm:flex-row sm:justify-center lg:justify-start">
              <a
                href="mailto:hello@uplan-engine.de"
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-accent px-8 py-4 text-base font-semibold text-white shadow-lg shadow-accent/20 transition hover:bg-accent-light hover:shadow-xl hover:shadow-accent/30"
              >
                <Mail className="h-5 w-5" /> Pläne einreichen
              </a>
              <a
                href="#prinzip"
                className="inline-flex items-center justify-center gap-2 rounded-xl border border-gray-border px-8 py-4 text-base font-semibold text-primary transition hover:border-primary/30 hover:bg-gray-bg"
              >
                Mehr erfahren <ArrowRight className="h-4 w-4" />
              </a>
            </div>
          </motion.div>
          <motion.div
            className="w-full max-w-lg flex-1 lg:max-w-none"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/uplan-engine/images/pages/optimized/lizenzen-hero.jpg"
              alt="Bauplanung lizenzieren"
              className="w-full rounded-2xl shadow-2xl"
              loading="lazy"
            />
          </motion.div>
        </div>
      </div>
      <div className="pointer-events-none absolute -top-40 right-0 h-[500px] w-[500px] rounded-full bg-accent/5 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-20 -left-20 h-[400px] w-[400px] rounded-full bg-primary/5 blur-3xl" />
    </section>
  );
}

/* ─── 2. DAS PRINZIP ───────────────────────────────────── */

const prinzipSteps = [
  { num: 1, title: "Ihr Gebäude", sub: "Geplant, gebaut & genehmigt" },
  { num: 2, title: "Auf der Plattform", sub: "Digitalisiert & lizenziert" },
  { num: 3, title: "Entwickler nutzt es", sub: "Als Grundlage für neues Projekt" },
  { num: 4, title: "Sie verdienen", sub: "Lizenzgebühr pro Nutzung" },
];

function Prinzip() {
  return (
    <section id="prinzip" className="bg-gray-bg py-24 md:py-32">
      <div className="mx-auto max-w-6xl px-6">
        <SectionHeading title="Das Prinzip." subtitle="In vier Schritten vom genehmigten Plan zum passiven Einkommen." />

        <div className="grid grid-cols-1 gap-6 md:grid-cols-7 md:items-start">
          {prinzipSteps.map((s, i) => (
            <FadeIn key={i} delay={i * 0.12} className={i < prinzipSteps.length - 1 ? "md:col-span-1 flex flex-col items-center text-center" : "md:col-span-1 flex flex-col items-center text-center"}>
              <>
                <div className="flex flex-col items-center text-center">
                  <div className="flex h-14 w-14 items-center justify-center rounded-full bg-accent text-xl font-bold text-white shadow-md">
                    {s.num}
                  </div>
                  <h3 className="mt-4 text-base font-bold text-primary">{s.title}</h3>
                  <p className="mt-1 text-sm text-slate-text/60">{s.sub}</p>
                </div>
                {i < prinzipSteps.length - 1 && (
                  <>
                    <div className="my-3 text-2xl text-accent/40 md:hidden">↓</div>
                  </>
                )}
              </>
            </FadeIn>
          )).reduce<React.ReactNode[]>((acc, el, i) => {
            acc.push(<div key={`step-${i}`} className="md:col-span-1 flex flex-col items-center">{el}</div>);
            if (i < prinzipSteps.length - 1) {
              acc.push(
                <div key={`arrow-${i}`} className="hidden md:flex md:col-span-1 items-center justify-center pt-4">
                  <ArrowRight className="h-6 w-6 text-accent/40" />
                </div>
              );
            }
            return acc;
          }, [])}
        </div>

        <FadeIn delay={0.5} className="mt-16">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/uplan-engine/images/pages/optimized/lizenzen-replicate.jpg"
            alt="Gebäude an mehreren Standorten"
            className="w-full rounded-2xl shadow-lg"
            loading="lazy"
          />
        </FadeIn>
      </div>
    </section>
  );
}

/* ─── 3. WARUM DAS FUNKTIONIERT ────────────────────────── */

const argumente = [
  {
    icon: ShieldCheck,
    title: "Bereits genehmigt = weniger Risiko",
    desc: "Ein Gebäude, das schon einmal genehmigt wurde, hat es beim nächsten Mal deutlich leichter. Projektentwickler lieben erprobte Konzepte — sie sparen Zeit und minimieren Genehmigungsrisiken.",
  },
  {
    icon: Layers,
    title: "Serielle Wiederverwendung",
    desc: "Warum jedes Mal von null planen? Ihr Entwurf kann an 50 Standorten stehen — mit standortspezifischen Anpassungen, die U-Plan Engine automatisiert. Einmal planen, vielfach verdienen.",
  },
  {
    icon: Wallet,
    title: "Fair vergütet",
    desc: "Transparentes Lizenzmodell: Sie verdienen bei jeder Nutzung. Je häufiger Ihr Entwurf eingesetzt wird, desto mehr. Volle Kontrolle über Ihre Konditionen.",
  },
];

function WarumFunktioniert() {
  return (
    <section className="bg-white py-24 md:py-32">
      <div className="mx-auto max-w-6xl px-6">
        <SectionHeading title="Warum das funktioniert." />
        <div className="space-y-8">
          {argumente.map((a, i) => (
            <FadeIn key={i} delay={i * 0.12}>
              <div className="flex flex-col gap-6 rounded-2xl border border-gray-border bg-white p-8 shadow-sm md:flex-row md:items-center">
                <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-accent/10">
                  <a.icon className="h-8 w-8 text-accent" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-primary">{a.title}</h3>
                  <p className="mt-2 leading-relaxed text-slate-text/70">{a.desc}</p>
                </div>
              </div>
            </FadeIn>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ─── 4. WAS SIE EINREICHEN KÖNNEN ────────────────────── */

const planunterlagen = [
  "Genehmigte Bauanträge",
  "Ausführungspläne",
  "Grundrisse aller Geschosse",
  "Schnitte & Ansichten",
];

const dokumentation = [
  "Statik & Tragwerk",
  "Brandschutzkonzept",
  "Energienachweis (EnEV/GEG)",
  "Baugenehmigung als Nachweis",
  "Optional: 3D/BIM-Modell",
];

function Checklist() {
  return (
    <section className="bg-gray-bg py-24 md:py-32">
      <div className="mx-auto max-w-6xl px-6">
        <SectionHeading title="Was Sie einreichen können." />
        <FadeIn>
          <div className="grid gap-8 md:grid-cols-2">
            <div className="rounded-2xl border border-gray-border bg-white p-8 shadow-sm">
              <h3 className="mb-6 text-lg font-bold text-primary">Planunterlagen</h3>
              <ul className="space-y-3">
                {planunterlagen.map((item, i) => (
                  <li key={i} className="flex items-center gap-3 text-slate-text/70">
                    <Check className="h-5 w-5 shrink-0 text-accent" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
            <div className="rounded-2xl border border-gray-border bg-white p-8 shadow-sm">
              <h3 className="mb-6 text-lg font-bold text-primary">Dokumentation</h3>
              <ul className="space-y-3">
                {dokumentation.map((item, i) => (
                  <li key={i} className="flex items-center gap-3 text-slate-text/70">
                    <Check className="h-5 w-5 shrink-0 text-accent" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </FadeIn>
        <FadeIn delay={0.2} className="mt-10 text-center">
          <p className="text-slate-text/60">
            Wir prüfen, digitalisieren und stellen Ihre Pläne qualitätsgesichert bereit.
          </p>
        </FadeIn>
      </div>
    </section>
  );
}

/* ─── 5. IHR VERDIENST ─────────────────────────────────── */

const tiers = [
  {
    name: "Konzeptstudie",
    badge: null,
    desc: "Ihr Entwurf als Planungsgrundlage",
    features: ["Lizenzgebühr pro Nutzung"],
    price: "Individuell",
  },
  {
    name: "Mit Ausführungsplanung",
    badge: "⭐ Empfohlen",
    desc: "Komplette Planungsunterlagen für Nachbau",
    features: ["Höhere Lizenzgebühr + Planungshonorar"],
    price: "Individuell",
  },
  {
    name: "Exklusivlizenz",
    badge: null,
    desc: "Alleinige Nutzungsrechte pro Region",
    features: ["Individuelle Vergütung"],
    price: "Auf Anfrage",
  },
];

function Pricing() {
  return (
    <section className="bg-white py-24 md:py-32">
      <div className="mx-auto max-w-6xl px-6">
        <SectionHeading title="Ihr Verdienst." subtitle="Drei Modelle — ein Ziel: faire Vergütung für Ihre Arbeit." />
        <div className="grid gap-8 md:grid-cols-3">
          {tiers.map((t, i) => (
            <FadeIn key={i} delay={i * 0.12}>
              <div className={`relative flex flex-col rounded-2xl border p-8 shadow-sm transition hover:shadow-md ${t.badge ? "border-accent bg-accent/5 ring-2 ring-accent/20" : "border-gray-border bg-white"}`}>
                {t.badge && (
                  <span className="absolute -top-3 left-6 rounded-full bg-accent px-3 py-1 text-xs font-bold text-white shadow">
                    {t.badge}
                  </span>
                )}
                <h3 className="text-lg font-bold text-primary">{t.name}</h3>
                <p className="mt-2 text-sm text-slate-text/60">{t.desc}</p>
                <ul className="mt-6 space-y-2 flex-1">
                  {t.features.map((f, fi) => (
                    <li key={fi} className="flex items-center gap-2 text-sm text-slate-text/70">
                      <Check className="h-4 w-4 text-accent" /> {f}
                    </li>
                  ))}
                </ul>
                <div className="mt-6 pt-6 border-t border-gray-border">
                  <span className="text-2xl font-extrabold text-primary">{t.price}</span>
                </div>
              </div>
            </FadeIn>
          ))}
        </div>
        <FadeIn delay={0.4} className="mt-8 text-center">
          <p className="text-sm text-slate-text/50">
            Konditionen werden individuell im Partnervertrag festgelegt.
          </p>
        </FadeIn>
      </div>
    </section>
  );
}

/* ─── 6. FÜR WEN IST DAS? ─────────────────────────────── */

const personas = [
  {
    icon: Building2,
    emoji: "🏗️",
    title: "Architekturbüros",
    desc: "Sie haben innovative Entwürfe, die mehr als einmal gebaut werden sollten. Verdienen Sie an jedem Nachbau.",
  },
  {
    icon: Wrench,
    emoji: "⚙️",
    title: "Ingenieursbüros",
    desc: "Ihre technischen Lösungen als wiederverwendbare Templates: Tragwerk, TGA, Brandschutz.",
  },
  {
    icon: Ruler,
    emoji: "📐",
    title: "Generalplaner",
    desc: "Komplette Planungspakete — von der Konzeptstudie bis zur Ausführung — als schlüsselfertige Vorlage.",
  },
];

function Personas() {
  return (
    <section className="bg-gray-bg py-24 md:py-32">
      <div className="mx-auto max-w-6xl px-6">
        <SectionHeading title="Für wen ist das?" />
        <div className="grid gap-8 md:grid-cols-3">
          {personas.map((p, i) => (
            <FadeIn key={i} delay={i * 0.12}>
              <div className="rounded-2xl border border-gray-border bg-white p-8 text-center shadow-sm">
                <span className="text-4xl">{p.emoji}</span>
                <h3 className="mt-4 text-lg font-bold text-primary">{p.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-slate-text/70">{p.desc}</p>
              </div>
            </FadeIn>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ─── 7. CTA ───────────────────────────────────────────── */

function CTA() {
  return (
    <section className="relative overflow-hidden py-24 md:py-32">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src="/uplan-engine/images/pages/optimized/lizenzen-skyline.jpg"
        alt=""
        className="absolute inset-0 w-full h-full object-cover"
        loading="lazy"
      />
      <div className="absolute inset-0 bg-primary/80" />
      <div className="relative z-10 mx-auto max-w-6xl px-6 text-center">
        <FadeIn>
          <h2 className="text-3xl font-bold tracking-tight text-white md:text-4xl lg:text-5xl">
            Reichen Sie Ihre Pläne ein
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-lg text-white/70">
            Wir melden uns innerhalb von 48 Stunden.
          </p>
          <div className="mt-10 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
            <a
              href="mailto:hello@uplan-engine.de"
              className="inline-flex items-center gap-2 rounded-xl bg-accent px-8 py-4 text-base font-semibold text-white shadow-lg shadow-accent/20 transition hover:bg-accent-light hover:shadow-xl hover:shadow-accent/30"
            >
              <Mail className="h-5 w-5" /> Jetzt einreichen
            </a>
            <a
              href="#faq"
              className="inline-flex items-center gap-2 rounded-xl border border-white/30 px-8 py-4 text-base font-semibold text-white transition hover:border-white/60 hover:bg-white/10"
            >
              FAQ lesen
            </a>
          </div>
        </FadeIn>
      </div>
    </section>
  );
}

/* ─── 8. FOOTER ────────────────────────────────────────── */

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
        <p className="text-sm text-slate-text/50">Vom Flurstück zur Machbarkeitsentscheidung — in Minuten.</p>
        <nav className="flex flex-wrap justify-center gap-x-6 gap-y-2 text-sm text-slate-text/50">
          <a href="/uplan-engine/produkt" className="transition hover:text-primary">Produkt</a>
          <a href="/uplan-engine/anwendungsfaelle/portfolio-rollout" className="transition hover:text-primary">Portfolio-Rollout</a>
          <a href="/uplan-engine/anwendungsfaelle/ankaufspruefung" className="transition hover:text-primary">Ankaufsprüfung</a>
          <a href="/uplan-engine/anwendungsfaelle/serielle-planung" className="transition hover:text-primary">Serielle Planung</a>
          <a href="/uplan-engine/technologie" className="transition hover:text-primary">Technologie</a>
          <a href="/uplan-engine/lizenzen" className="transition hover:text-primary">Lizenzen</a>
          <a href="#kontakt" className="transition hover:text-primary">Kontakt</a>
        </nav>
        <p className="text-xs text-slate-text/30">© 2026 U-Plan Engine · Impressum · Datenschutz</p>
      </div>
    </footer>
  );
}

/* ─── PAGE ─────────────────────────────────────────────── */

export default function LizenzenPage() {
  return (
    <>
      <Nav />
      <main>
        <Hero />
        <Prinzip />
        <WarumFunktioniert />
        <Checklist />
        <Pricing />
        <Personas />
        <CTA />
      </main>
      <Footer />
    </>
  );
}
