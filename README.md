# U-Plan Engine

Die **U-Plan Engine** ist ein browserbasierter Konfigurator für seriellen Wohnungsbau auf Bebauungsplan-Flächen in Berlin. Nutzer können Baufelder auf einer interaktiven Karte zeichnen, modulare Gebäude verschiedener Hersteller platzieren, Kosten nach DIN 276 kalkulieren und das Ergebnis als PDF-Projektplan exportieren — komplett ohne Backend, rein clientseitig.

## Features

- 🗺️ **Interaktive Karte** — Leaflet + WMS-Layer (Flurstücke, B-Pläne, Bodenrichtwerte, Wohnlagen) via Berliner Geodaten-Infrastruktur
- 🏗️ **Gebäudekatalog** — 15+ Module von 5 Herstellern (GROPYUS, Nokera, ALHO, Goldbeck, Max Bögl) in 6 Gebäudeformen
- 📐 **Baufeld-Editor** — Polygon-Zeichentool mit automatischer GRZ/GFZ-Berechnung und B-Plan-Compliance-Check
- 💰 **Kostenrechner** — DIN 276 Kostengruppen, Finanzierungsmodell, Wirtschaftlichkeitsanalyse, Mietspiegel-Integration
- 📄 **PDF-Export** — Modularer Projektplan mit Deckblatt, Lageplan, Gebäude-Steckbriefen und Kostenaufstellung
- ⚙️ **Admin-Bereich** — Hersteller und Gebäude-Module verwalten (Passwort: `Bau-Turbo`)
- 🎯 **Match-Score** — Automatische Bewertung der Gebäude-Eignung pro Baufeld

## Tech Stack

| Bereich | Technologie |
|---------|------------|
| Framework | Next.js 16 (App Router, Static Export) |
| UI | React 19, Tailwind CSS 4, Lucide Icons |
| Karte | Leaflet 1.9 + react-leaflet 5 |
| State | Zustand 5 |
| PDF | jsPDF + jspdf-autotable |
| Screenshots | html2canvas |
| Animationen | Framer Motion |
| Geodaten | WMS Services der GDI Berlin |
| Deploy | GitHub Pages (Static Export) |

## Setup & Run

```bash
# Abhängigkeiten installieren
npm install

# Development Server
npm run dev        # → http://localhost:3000/uplan-engine/

# Production Build (Static Export)
npm run build      # → Ausgabe in out/

# Lint
npm run lint
```

## Projekt-Struktur

```
website/
├── src/
│   ├── app/
│   │   ├── page.tsx                    # Landing Page
│   │   ├── layout.tsx                  # Root Layout
│   │   ├── demo/                       # Haupt-Konfigurator
│   │   │   ├── DemoApp.tsx             # App-Shell, State-Orchestrierung
│   │   │   ├── MapPanel.tsx            # Leaflet-Karte, WMS, Baufeld-Editor
│   │   │   ├── BuildingCatalog.tsx     # Gebäude-Auswahl + Konfigurator
│   │   │   ├── CostCalculator.tsx      # DIN 276 Kalkulation
│   │   │   ├── ExportModal.tsx         # PDF-Export Konfiguration
│   │   │   ├── exportPDF.ts            # PDF-Generierung (jsPDF)
│   │   │   ├── FilterPanel.tsx         # Filter & Strategie
│   │   │   ├── PlacedBuildings.tsx     # Platzierte Gebäude auf Karte
│   │   │   ├── BuildingSteckbrief.tsx  # Detail-Modal je Gebäude
│   │   │   ├── BottomBar.tsx           # Metriken-Leiste
│   │   │   ├── DemoHeader.tsx          # Header mit Actions
│   │   │   ├── types.ts               # TypeScript Interfaces
│   │   │   ├── data.ts                # Gebäude-/Hersteller-Daten
│   │   │   ├── catalogData.ts         # localStorage-Sync für Katalog
│   │   │   └── matchScore.ts          # Baufeld-Gebäude Matching
│   │   ├── admin/                      # Admin-Bereich
│   │   │   ├── store.ts               # Zustand Store (Admin)
│   │   │   ├── hersteller/            # Hersteller-Verwaltung
│   │   │   ├── module/                # Modul-Verwaltung
│   │   │   └── export/                # Daten-Export
│   │   ├── anwendungsfaelle/          # Use-Case Seiten
│   │   ├── produkt/                   # Produkt-Seite
│   │   ├── partner/                   # Partner-Seite
│   │   ├── technologie/              # Technologie-Seite
│   │   ├── impressum/                # Impressum
│   │   ├── datenschutz/              # Datenschutz
│   │   └── lizenzen/                 # Lizenzen
│   └── components/                    # Shared Landing-Page Komponenten
│       ├── Hero.tsx
│       ├── Navbar.tsx
│       ├── Footer.tsx
│       └── ...
├── docs/                              # Technische Dokumentation
├── public/                            # Statische Assets
├── next.config.ts                     # Next.js Konfiguration
└── package.json
```

## Deploy auf GitHub Pages

Die App wird als Static Export (`output: "export"`) gebaut und auf GitHub Pages deployed.

### Wichtige Konfiguration (`next.config.ts`)

```typescript
const nextConfig: NextConfig = {
  output: "export",
  basePath: "/uplan-engine",
  trailingSlash: true,       // ⚠️ PFLICHT für GitHub Pages!
  images: { unoptimized: true },
};
```

> **⚠️ `trailingSlash: true`** ist zwingend erforderlich. Ohne dieses Flag liefert GitHub Pages 404-Fehler für Unterseiten, da es Verzeichnisse mit `index.html` erwartet.

### Deploy-Workflow

```bash
npm run build          # Erzeugt out/ Verzeichnis
# out/ wird via GitHub Actions oder manuell auf gh-pages Branch gepusht
```

**Live:** [https://editiononeadmin.github.io/uplan-engine/demo](https://editiononeadmin.github.io/uplan-engine/demo)

## Lizenz

Proprietär — Edition One GmbH
