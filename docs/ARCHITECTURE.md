# Architektur — U-Plan Engine

## Komponenten-Map

```
┌─────────────────────────────────────────────────────────┐
│  DemoApp.tsx  (Orchestrierung, State-Lifting)           │
├────────────┬──────────────┬─────────────┬───────────────┤
│ MapPanel   │ Building-    │ Cost-       │ ExportModal   │
│ (Leaflet)  │ Catalog      │ Calculator  │ + exportPDF   │
├────────────┤ + Konfig.    ├─────────────┤               │
│ Placed-    │ + Filter-    │ BottomBar   │               │
│ Buildings  │   Panel      │ (Metriken)  │               │
├────────────┼──────────────┴─────────────┴───────────────┤
│ WMS Layer  │ catalogData.ts  ←→  localStorage           │
│ (GDI Berlin)│ matchScore.ts   (Scoring)                 │
└────────────┴────────────────────────────────────────────┘

┌─────────────────────────────────────┐
│  Admin (separater Bereich)          │
│  store.ts (Zustand) ←→ localStorage│
│  /hersteller  /module  /export     │
└─────────────────────────────────────┘
```

### Komponenten im Detail

| Komponente | Datei | Aufgabe |
|-----------|-------|---------|
| **DemoApp** | `DemoApp.tsx` | Haupt-Shell. Verwaltet globalen State (Baufelder, platzierte Gebäude, Filter, Konfigurator-Einstellungen). Orchestriert alle Sub-Komponenten. |
| **MapPanel** | `MapPanel.tsx` | Leaflet-Karte mit WMS-Layern, Baufeld-Zeichentool (Polygon), Gebäude-Platzierung per Klick, Drag & Rotate, Adress-Suche, Flurstück-Abfrage via WFS. |
| **BuildingCatalog** | `BuildingCatalog.tsx` | Gebäude-Auswahl mit SVG-Vorschau, Filter nach Hersteller/Form, Match-Score-Anzeige, Konfigurator (Geschosse, Dach, Fassade). |
| **FilterPanel** | `FilterPanel.tsx` | Strategie-Filter (Halten/Verkaufen), Energieträger, Effizienzstandard, Zielmiete/-verkaufspreis. |
| **CostCalculator** | `CostCalculator.tsx` | DIN 276 Kostenberechnung, Finanzierungsmodell (EK/FK), Mietspiegel-Integration, Wirtschaftlichkeits-KPIs (Yield, Rendite). |
| **ExportModal** | `ExportModal.tsx` | Modul-Auswahl für PDF-Export (Deckblatt, Lageplan, Steckbriefe, Kosten etc.). |
| **exportPDF** | `exportPDF.ts` | PDF-Generierung mit jsPDF + autoTable. Erstellt mehrseitigen Projektplan. |
| **PlacedBuildings** | `PlacedBuildings.tsx` | Rendert platzierte Gebäude als Polygone auf der Karte, Ghost-Preview beim Platzieren. |
| **BuildingSteckbrief** | `BuildingSteckbrief.tsx` | Detail-Modal für ein platziertes Gebäude mit allen Kennwerten. |
| **BottomBar** | `BottomBar.tsx` | Zusammenfassung: Gesamt-BGF, WE, Stellplätze, GRZ/GFZ-Auslastung, Compliance. |
| **matchScore** | `matchScore.ts` | Berechnet Eignung eines Gebäudes für ein Baufeld (Geschosse, GRZ, GFZ, Kosten). |
| **catalogData** | `catalogData.ts` | Bridge zwischen Admin und Demo: Liest Gebäude/Hersteller aus localStorage, fällt auf Code-Defaults zurück. |
| **Admin Store** | `admin/store.ts` | Zustand Store für Admin-CRUD. Persistiert in localStorage. Enthält Gropius→GROPYUS Migration. |

## Datenfluss

```
┌──────────────────────────────────────────────────────────┐
│                      localStorage                        │
│  ┌──────────────────┐  ┌──────────────────────────────┐  │
│  │ bpe-admin-buildings│  │ bpe-admin-manufacturers    │  │
│  │ (BuildingModule[]) │  │ (ManufacturerData[])       │  │
│  └────────┬───────────┘  └────────┬───────────────────┘  │
│           │                       │                      │
│  ┌────────┴───────────────────────┴───────────────────┐  │
│  │              Admin Store (Zustand)                 │  │
│  │         hydrate() → Read from localStorage         │  │
│  │  setBuildings() / addBuilding() → Write to LS      │  │
│  └────────────────────────────────────────────────────┘  │
│           │                                              │
│  ┌────────┴───────────────────────────────────────────┐  │
│  │           catalogData.ts (Demo Reader)             │  │
│  │     getBuildings() → Read LS → Fallback defaults   │  │
│  └────────────────────────────────────────────────────┘  │
└──────────────────────────────────────────────────────────┘
```

**Sync-Mechanismus:** Admin schreibt → localStorage → Demo liest beim nächsten Laden. Kein Echtzeit-Sync, sondern Page-Reload-basiert.

## Data Schema

### Hersteller

| ID | Label | Bauweise |
|----|-------|----------|
| `gropyus` | GROPYUS | Holzmodulbau |
| `nokera` | Nokera | Holzmodulbau |
| `alho` | ALHO | Stahlmodulbau |
| `goldbeck` | Goldbeck | Systembau |
| `max-boegl` | Max Bögl | Betonfertigteile |

### Gebäude-Module (`BuildingModule`)

```typescript
{
  id: string;              // z.B. "gropyus-riegel-36"
  name: string;            // z.B. "Riegel R-36"
  manufacturer: Manufacturer;
  shape: BuildingShape;    // riegel | l-winkel | u-form | punkthaus | t-form | doppelhaus
  footprint: { width, depth };  // Meter
  minGeschosse / maxGeschosse / defaultGeschosse: number;
  wePerGeschoss: number;   // Wohneinheiten pro Geschoss
  bgfPerGeschoss: number;  // Bruttogrundfläche m²
  roofOptions: RoofType[]; // flat | saddle | pult
  facadeOptions: FacadeType[]; // putz | klinker | holz | metall
  energyRating: "A+" | "A" | "B" | "C";
  pricePerSqm: number;    // €/m² BGF
  tags: string[];
}
```

### Baufeld (`Baufeld`)

```typescript
{
  id: string;
  name: string;
  type: "WA" | "MI" | "GE" | "SO";  // Gebietstyp
  coordinates: [lat, lng][];          // Polygon
  maxGRZ / maxGFZ / maxGeschosse: number;
  grundstuecksflaecheM2: number;
  borisBodenrichtwert?: number;       // Auto-fetch via WMS
  wohnlage?: string;                  // Auto-fetch via WMS
}
```

### Kostengruppen (DIN 276)

Der CostCalculator berechnet Kosten nach DIN 276 Struktur:

| KG | Bezeichnung | Berechnung |
|----|------------|------------|
| 100 | Grundstück | Fläche × Bodenrichtwert |
| 200 | Vorbereitende Maßnahmen | Pauschale |
| 300 | Bauwerk – Baukonstruktion | BGF × Herstellerpreis/m² |
| 400 | Bauwerk – Technische Anlagen | Anteil an KG 300 |
| 500 | Außenanlagen | Anteil an Gesamtkosten |
| 600 | Ausstattung | Pauschale |
| 700 | Baunebenkosten | % der KG 300-500 |

## WMS Integration

Alle Kartenlayer kommen von der **Geodateninfrastruktur Berlin** (GDI Berlin).

| Layer | WMS URL | Layer-Name |
|-------|---------|------------|
| Flurstücke (ALKIS) | `https://gdi.berlin.de/services/wms/alkis_flurstuecke` | `alkis_flurstuecke` |
| Bebauungspläne | `https://gdi.berlin.de/services/wms/bplan` | `bplan` |
| Wohnlagen | `https://gdi.berlin.de/services/wms/wohnlagenadr2024` | `wohnlagenadr2024` |
| Bodenrichtwerte | `https://gdi.berlin.de/services/wms/brw2025` | `brw2025` |

**Wichtig:** Siehe [GOTCHAS.md](./GOTCHAS.md) für WMS-spezifische Fallstricke.

Zusätzlich wird **WFS** für Flurstück-Geometrien genutzt:
- `https://gdi.berlin.de/services/wfs/alkis_flurstuecke`

**GetFeatureInfo** wird verwendet um Bodenrichtwerte und Wohnlagen automatisch beim Baufeld-Zeichnen abzufragen.
