"use client";

import { useRef } from "react";
import { motion, useInView } from "framer-motion";
import {
  ArrowRight,
  Shield,
  Lock,
  Server,
  GitBranch,
  Users,
  Link2,
  Database,
  Gauge,
  CheckCircle2,
  Eye,
  FileText,
  Key,
  Building2,
  Globe,
  Webhook,
  FileCode2,
  FolderSync,
  Map,
  Scale,
  Layers3,
  Cpu,
  Activity,
  Zap,
  Cloud,
  HardDrive,
  Timer,
  TrendingUp,
  Mail,
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
          <svg
            width="28"
            height="28"
            viewBox="0 0 32 32"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <rect width="32" height="32" rx="8" fill="#1E3A5F" />
            <path d="M8 10h6a4 4 0 0 1 0 8H8V10z" fill="white" />
            <path d="M17 14h7a4 4 0 0 1 0 8h-7V14z" fill="#0D9488" />
          </svg>
          <span className="text-lg font-bold text-primary">U-Plan Engine</span>
        </a>
        <nav className="hidden gap-6 text-sm font-medium text-slate-text/60 md:flex">
          <a href="/uplan-engine/#pipeline" className="transition hover:text-primary">Pipeline</a>
          <a href="/uplan-engine/#produkt" className="transition hover:text-primary">Produkt</a>
          <a href="/uplan-engine/technologie" className="text-primary font-semibold">Technologie</a>
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

/* ─── FOOTER ───────────────────────────────────────────── */

function Footer() {
  return (
    <footer className="border-t border-gray-border bg-white py-12">
      <div className="mx-auto flex max-w-6xl flex-col items-center gap-4 px-6 text-sm text-slate-text/50">
        <nav className="flex gap-6">
          <a href="/uplan-engine/" className="transition hover:text-primary">Startseite</a>
          <a href="/uplan-engine/technologie" className="transition hover:text-primary">Technologie</a>
          <a href="/uplan-engine/#kontakt" className="transition hover:text-primary">Kontakt</a>
        </nav>
        <p className="text-xs text-slate-text/30">
          © 2026 U-Plan Engine · Impressum · Datenschutz
        </p>
      </div>
    </footer>
  );
}

/* ─── 1. HERO ──────────────────────────────────────────── */

function Hero() {
  return (
    <section className="relative overflow-hidden bg-white pt-28 pb-24 md:pt-40 md:pb-32">
      <div className="mx-auto flex max-w-6xl flex-col items-center px-6 text-center">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: [0.25, 0.4, 0.25, 1] }}
        >
          <p className="mb-6 text-sm font-semibold tracking-widest text-accent uppercase">
            Technologie & Architektur
          </p>
          <h1 className="text-4xl font-extrabold leading-[1.1] tracking-tight text-primary sm:text-5xl md:text-6xl lg:text-7xl">
            Enterprise-ready
            <br />
            Infrastruktur.
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-slate-text/70 md:text-xl">
            U-Plan Engine ist gebaut für Teams, die Compliance, Sicherheit
            und nahtlose Integration in bestehende Systeme brauchen.
          </p>
        </motion.div>

        <motion.div
          className="mt-10"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
        >
          <a
            href="/uplan-engine/#kontakt"
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-accent px-8 py-4 text-base font-semibold text-white shadow-lg shadow-accent/20 transition hover:bg-accent-light hover:shadow-xl hover:shadow-accent/30"
          >
            Engineering-Gespräch vereinbaren <ArrowRight className="h-4 w-4" />
          </a>
        </motion.div>
      </div>

      <div className="pointer-events-none absolute -top-40 right-0 h-[500px] w-[500px] rounded-full bg-accent/5 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-20 -left-20 h-[400px] w-[400px] rounded-full bg-primary/5 blur-3xl" />
    </section>
  );
}

/* ─── 2. ARCHITEKTUR ───────────────────────────────────── */

const modules = [
  { name: "Analyse-Engine", desc: "Flurstücksbewertung & Machbarkeit", icon: Cpu, color: "bg-primary" },
  { name: "Planungs-Modul", desc: "Varianten & GRZ/GFZ-Optimierung", icon: Layers3, color: "bg-accent" },
  { name: "Compliance-Service", desc: "Regelprüfung & Audit-Trail", icon: Shield, color: "bg-primary" },
  { name: "Export-Service", desc: "Reports, API & Integrationen", icon: FileCode2, color: "bg-accent" },
];

function Architecture() {
  return (
    <Section id="architektur" gray>
      <SectionHeading
        title="Modulare Microservice-Architektur"
        subtitle="Vier spezialisierte Services, lose gekoppelt über Events — unabhängig skalierbar, unabhängig deploybar."
      />

      {/* Architecture Diagram */}
      <FadeIn className="mb-16">
        <div className="rounded-2xl border border-gray-border bg-white p-8 md:p-12 shadow-sm">
          {/* API Gateway */}
          <div className="mb-6 flex justify-center">
            <div className="rounded-xl border-2 border-primary bg-primary/5 px-8 py-4 text-center">
              <p className="text-xs font-semibold text-primary/60 uppercase tracking-wider">API Gateway</p>
              <p className="text-sm font-bold text-primary mt-1">REST + GraphQL · Rate Limiting · Auth</p>
            </div>
          </div>

          {/* Arrow down */}
          <div className="flex justify-center mb-6">
            <div className="h-8 w-px bg-gray-border relative">
              <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-0 h-0 border-l-[5px] border-r-[5px] border-t-[6px] border-l-transparent border-r-transparent border-t-gray-border" />
            </div>
          </div>

          {/* Event Bus */}
          <div className="mb-6 flex justify-center">
            <div className="rounded-lg border border-accent/30 bg-accent/5 px-12 py-3 text-center">
              <p className="text-xs font-semibold text-accent uppercase tracking-wider">Event Bus</p>
              <p className="text-xs text-accent/70 mt-0.5">Async Message Queue</p>
            </div>
          </div>

          {/* Arrows down */}
          <div className="flex justify-center mb-6">
            <div className="flex gap-24 md:gap-40">
              {[0, 1, 2, 3].map((i) => (
                <div key={i} className="h-8 w-px bg-gray-border relative">
                  <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-0 h-0 border-l-[5px] border-r-[5px] border-t-[6px] border-l-transparent border-r-transparent border-t-gray-border" />
                </div>
              ))}
            </div>
          </div>

          {/* Modules */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {modules.map((m, i) => (
              <div key={i} className="rounded-xl border border-gray-border p-5 text-center hover:shadow-md transition">
                <div className={`mx-auto mb-3 flex h-10 w-10 items-center justify-center rounded-lg ${m.color}/10`}>
                  <m.icon className={`h-5 w-5 ${m.color === "bg-primary" ? "text-primary" : "text-accent"}`} />
                </div>
                <p className="text-sm font-bold text-primary">{m.name}</p>
                <p className="text-xs text-slate-text/60 mt-1">{m.desc}</p>
              </div>
            ))}
          </div>

          {/* Arrows down */}
          <div className="flex justify-center my-6">
            <div className="h-8 w-px bg-gray-border relative">
              <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-0 h-0 border-l-[5px] border-r-[5px] border-t-[6px] border-l-transparent border-r-transparent border-t-gray-border" />
            </div>
          </div>

          {/* Data Layer */}
          <div className="flex justify-center">
            <div className="rounded-xl border border-gray-border bg-gray-bg px-8 py-4 text-center">
              <p className="text-xs font-semibold text-slate-text/50 uppercase tracking-wider">Datenschicht</p>
              <p className="text-sm font-bold text-primary mt-1">PostgreSQL · Redis · S3 · Elasticsearch</p>
            </div>
          </div>
        </div>
      </FadeIn>

      {/* Principles */}
      <div className="grid gap-6 md:grid-cols-3">
        {[
          { icon: Server, title: "API-first Design", desc: "Jede Funktion ist über eine dokumentierte REST-API erreichbar. OpenAPI 3.1 Spec inklusive." },
          { icon: Activity, title: "Event-driven", desc: "Services kommunizieren asynchron über Events — entkoppelt, resilient und auditierbar." },
          { icon: Zap, title: "Unabhängig deploybar", desc: "Jeder Service kann einzeln aktualisiert werden. Zero-Downtime Deployments via Blue-Green." },
        ].map((item, i) => (
          <FadeIn key={i} delay={i * 0.1}>
            <div className="rounded-2xl border border-gray-border bg-white p-8 shadow-sm">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-primary/5">
                <item.icon className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-lg font-bold text-primary">{item.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-slate-text/70">{item.desc}</p>
            </div>
          </FadeIn>
        ))}
      </div>
    </Section>
  );
}

/* ─── 3. SICHERHEIT & COMPLIANCE ───────────────────────── */

const securityItems = [
  { icon: Globe, title: "DSGVO-konform", desc: "Hosting ausschließlich in deutschen Rechenzentren (ISO 27001 zertifiziert)." },
  { icon: Lock, title: "Ende-zu-Ende Verschlüsselung", desc: "AES-256 at rest, TLS 1.3 in transit. Keine unverschlüsselten Daten." },
  { icon: Shield, title: "SOC 2 Type II", desc: "Zertifizierung auf der Roadmap für Q3 2026. Audit-Vorbereitung läuft." },
  { icon: Eye, title: "Penetration Tests", desc: "Vierteljährliche Pen-Tests durch unabhängige Sicherheitsfirmen." },
  { icon: HardDrive, title: "Mandanten-Isolation", desc: "Vollständige Datentrennung pro Mandant — auf Datenbank- und Infrastrukturebene." },
];

function Security() {
  return (
    <Section id="sicherheit">
      <SectionHeading
        title="Sicherheit & Compliance"
        subtitle="Enterprise-grade Sicherheitsarchitektur, die den Anforderungen regulierter Branchen gerecht wird."
      />
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {securityItems.map((item, i) => (
          <FadeIn key={i} delay={i * 0.08}>
            <div className="group rounded-2xl border border-gray-border bg-white p-8 shadow-sm transition hover:shadow-md hover:border-primary/20">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-accent/10">
                <item.icon className="h-6 w-6 text-accent" />
              </div>
              <h3 className="text-lg font-bold text-primary">{item.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-slate-text/70">{item.desc}</p>
            </div>
          </FadeIn>
        ))}
      </div>
    </Section>
  );
}

/* ─── 4. VERSIONIERUNG & AUDIT-TRAIL ──────────────────── */

function AuditTrail() {
  return (
    <Section id="audit" gray>
      <SectionHeading
        title="Versionierung & Audit-Trail"
        subtitle="Jede Änderung nachvollziehbar — wie Git für Ihre Bauprojekte."
      />
      <div className="grid gap-8 md:grid-cols-2">
        <FadeIn>
          <div className="rounded-2xl border border-gray-border bg-white p-8 shadow-sm">
            {/* Fake audit log */}
            <div className="space-y-4">
              {[
                { time: "14:32", user: "M. Weber", action: "GRZ-Wert angepasst", detail: "0.35 → 0.40", color: "bg-accent" },
                { time: "13:15", user: "S. Krause", action: "Variante B freigegeben", detail: "Prüfstatus: Bestanden", color: "bg-green-500" },
                { time: "11:48", user: "T. Fischer", action: "Stellplatznachweis hochgeladen", detail: "stellplatz_v3.pdf", color: "bg-primary" },
                { time: "09:20", user: "System", action: "Compliance-Check ausgeführt", detail: "12 Regeln geprüft, 0 Verstöße", color: "bg-accent" },
              ].map((entry, i) => (
                <div key={i} className="flex items-start gap-4">
                  <div className="flex flex-col items-center">
                    <div className={`h-3 w-3 rounded-full ${entry.color}`} />
                    {i < 3 && <div className="h-full w-px bg-gray-border mt-1" />}
                  </div>
                  <div className="flex-1 pb-2">
                    <div className="flex items-baseline justify-between">
                      <p className="text-sm font-semibold text-primary">{entry.action}</p>
                      <span className="text-xs text-slate-text/40">{entry.time}</span>
                    </div>
                    <p className="text-xs text-slate-text/60">{entry.user} · {entry.detail}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </FadeIn>
        <FadeIn delay={0.15}>
          <div className="space-y-6">
            {[
              { icon: GitBranch, title: "Git-like Versionierung", desc: "Jede Änderung erzeugt eine neue Version. Vergleichen, zurückrollen, branchen." },
              { icon: Users, title: "Wer, wann, was", desc: "Vollständige Nachvollziehbarkeit aller Aktionen — automatisch dokumentiert." },
              { icon: FileText, title: "Compliance-Nachweis", desc: "Generieren Sie Audit-Reports für Revisoren auf Knopfdruck." },
              { icon: FileCode2, title: "Export", desc: "Audit-Logs als CSV, JSON oder PDF exportierbar. SIEM-Integration möglich." },
            ].map((item, i) => (
              <div key={i} className="flex gap-4">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/5">
                  <item.icon className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-primary">{item.title}</h3>
                  <p className="mt-1 text-sm text-slate-text/70">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </FadeIn>
      </div>
    </Section>
  );
}

/* ─── 5. ROLLEN & RECHTE ──────────────────────────────── */

const roles = [
  { role: "Projektentwickler", permissions: ["Projekte erstellen", "Varianten vergleichen", "Reports exportieren"], icon: Building2 },
  { role: "Planer", permissions: ["Pläne bearbeiten", "Parameter ändern", "Dokumente hochladen"], icon: Layers3 },
  { role: "Prüfer", permissions: ["Compliance prüfen", "Freigaben erteilen", "Kommentare"], icon: CheckCircle2 },
  { role: "Admin", permissions: ["Nutzerverwaltung", "SSO-Konfiguration", "Audit-Logs"], icon: Key },
];

function RolesPermissions() {
  return (
    <Section id="rollen">
      <SectionHeading
        title="Rollen & Rechte"
        subtitle="Granulare Zugriffskontrolle für jedes Teammitglied — von der Projektanlage bis zur Freigabe."
      />
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {roles.map((r, i) => (
          <FadeIn key={i} delay={i * 0.1}>
            <div className="rounded-2xl border border-gray-border bg-white p-6 shadow-sm hover:shadow-md transition">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-primary/5">
                <r.icon className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-base font-bold text-primary mb-3">{r.role}</h3>
              <ul className="space-y-2">
                {r.permissions.map((p, j) => (
                  <li key={j} className="flex items-center gap-2 text-sm text-slate-text/70">
                    <CheckCircle2 className="h-3.5 w-3.5 text-accent shrink-0" />
                    {p}
                  </li>
                ))}
              </ul>
            </div>
          </FadeIn>
        ))}
      </div>
      <FadeIn delay={0.3} className="mt-10">
        <div className="flex flex-wrap justify-center gap-4">
          {["SSO (SAML 2.0 / OIDC)", "Multi-Tenancy", "IP-Whitelisting", "2-Faktor-Authentifizierung"].map((tag, i) => (
            <span key={i} className="rounded-full border border-gray-border bg-gray-bg px-4 py-2 text-sm font-medium text-primary">
              {tag}
            </span>
          ))}
        </div>
      </FadeIn>
    </Section>
  );
}

/* ─── 6. INTEGRATIONEN ─────────────────────────────────── */

const integrations = [
  { icon: FileCode2, name: "REST API", desc: "OpenAPI 3.1 Spec", status: "live" },
  { icon: Webhook, name: "Webhooks", desc: "Echtzeit-Events", status: "live" },
  { icon: Building2, name: "BIM / IFC", desc: "Import & Export", status: "live" },
  { icon: FolderSync, name: "SharePoint", desc: "DMS-Anbindung", status: "live" },
  { icon: FolderSync, name: "Doxis", desc: "DMS-Anbindung", status: "live" },
  { icon: Layers3, name: "CAD-Plugins", desc: "AutoCAD, Revit", status: "roadmap" },
];

function Integrations() {
  return (
    <Section id="integrationen" gray>
      <SectionHeading
        title="Integrationen"
        subtitle="U-Plan Engine fügt sich nahtlos in Ihre bestehende Systemlandschaft ein."
      />
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {integrations.map((item, i) => (
          <FadeIn key={i} delay={i * 0.08}>
            <div className="flex items-center gap-4 rounded-2xl border border-gray-border bg-white p-6 shadow-sm transition hover:shadow-md">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-accent/10">
                <item.icon className="h-6 w-6 text-accent" />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <h3 className="text-base font-bold text-primary">{item.name}</h3>
                  {item.status === "roadmap" && (
                    <span className="rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-semibold text-primary uppercase">Roadmap</span>
                  )}
                </div>
                <p className="text-sm text-slate-text/60">{item.desc}</p>
              </div>
            </div>
          </FadeIn>
        ))}
      </div>
    </Section>
  );
}

/* ─── 7. DATENQUELLEN ──────────────────────────────────── */

const dataSources = [
  { icon: Map, name: "ALKIS / ALB", desc: "Katasterdaten — Flurstücke, Eigentümer, Nutzungsarten" },
  { icon: FileText, name: "XPlanung", desc: "B-Pläne digital — standardisierter Datenaustausch" },
  { icon: Scale, name: "Landesbauordnungen", desc: "Alle 16 Bundesländer — automatisch aktualisiert" },
  { icon: Building2, name: "Kommunale Satzungen", desc: "Lokale Festsetzungen & Gestaltungssatzungen" },
  { icon: Globe, name: "OpenStreetMap", desc: "Umfeldanalyse — Infrastruktur, ÖPNV, Nahversorgung" },
];

function DataSources() {
  return (
    <Section id="datenquellen">
      <SectionHeading
        title="Datenquellen"
        subtitle="Automatisierte Integration amtlicher und offener Datenquellen — immer aktuell."
      />
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {dataSources.map((item, i) => (
          <FadeIn key={i} delay={i * 0.08}>
            <div className="rounded-2xl border border-gray-border bg-white p-8 shadow-sm hover:shadow-md transition">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-primary/5">
                <item.icon className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-base font-bold text-primary">{item.name}</h3>
              <p className="mt-2 text-sm leading-relaxed text-slate-text/70">{item.desc}</p>
            </div>
          </FadeIn>
        ))}
      </div>
    </Section>
  );
}

/* ─── 8. PERFORMANCE ───────────────────────────────────── */

const perfStats = [
  { value: "99.9%", label: "Uptime SLA", icon: Activity },
  { value: "< 2s", label: "Response Time", icon: Timer },
  { value: "10x", label: "Batch-Throughput", icon: TrendingUp },
  { value: "∞", label: "Horizontale Skalierung", icon: Cloud },
];

function Performance() {
  return (
    <Section id="performance" gray>
      <SectionHeading
        title="Performance & Skalierung"
        subtitle="Gebaut für Portfolio-Analysen mit hunderten Projekten gleichzeitig."
      />

      {/* Stats */}
      <div className="grid grid-cols-2 gap-6 md:grid-cols-4 mb-12">
        {perfStats.map((stat, i) => (
          <FadeIn key={i} delay={i * 0.1}>
            <div className="rounded-2xl border border-gray-border bg-white p-8 text-center shadow-sm">
              <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-accent/10">
                <stat.icon className="h-6 w-6 text-accent" />
              </div>
              <p className="text-3xl font-extrabold text-primary">{stat.value}</p>
              <p className="mt-1 text-sm text-slate-text/60">{stat.label}</p>
            </div>
          </FadeIn>
        ))}
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {[
          { icon: Gauge, title: "Batch-Processing", desc: "Analysieren Sie Ihr gesamtes Portfolio in einem Durchlauf. Parallele Verarbeitung mit automatischer Priorisierung." },
          { icon: Server, title: "Auto-Scaling", desc: "Infrastruktur skaliert automatisch mit der Last. Kubernetes-basiert mit Pod-Auto-Scaling und Load Balancing." },
        ].map((item, i) => (
          <FadeIn key={i} delay={i * 0.12}>
            <div className="rounded-2xl border border-gray-border bg-white p-8 shadow-sm">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-primary/5">
                <item.icon className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-lg font-bold text-primary">{item.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-slate-text/70">{item.desc}</p>
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
    <Section>
      <FadeIn>
        <div className="rounded-3xl bg-primary px-8 py-16 text-center md:px-16 md:py-20">
          <h2 className="text-3xl font-bold text-white md:text-4xl">
            Sprechen Sie mit unserem
            <br />
            Engineering-Team.
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-lg text-white/70">
            Wir zeigen Ihnen die Architektur im Detail, besprechen
            Integrations-Anforderungen und finden den besten Weg für Ihr Setup.
          </p>
          <a
            href="/uplan-engine/#kontakt"
            className="mt-8 inline-flex items-center gap-2 rounded-xl bg-accent px-8 py-4 text-base font-semibold text-white shadow-lg transition hover:bg-accent-light hover:shadow-xl"
          >
            Gespräch vereinbaren <ArrowRight className="h-4 w-4" />
          </a>
        </div>
      </FadeIn>
    </Section>
  );
}

/* ─── PAGE ─────────────────────────────────────────────── */

export default function TechnologiePage() {
  return (
    <>
      <Nav />
      <main>
        <Hero />
        <Architecture />
        <Security />
        <AuditTrail />
        <RolesPermissions />
        <Integrations />
        <DataSources />
        <Performance />
        <CTA />
      </main>
      <Footer />
    </>
  );
}
