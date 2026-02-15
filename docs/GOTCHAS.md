# Bekannte Fallstricke (Gotchas)

## 🖼️ html2canvas + Leaflet SVG

**Problem:** `html2canvas` kann Leaflet SVG-Overlays (Polygone, Polylines) **nicht** rendern. Die Overlays sind im Screenshot unsichtbar.

**Grund:** html2canvas rendert DOM-Elemente als Canvas, kann aber inline-SVGs in Leaflet-Panes nicht korrekt erfassen.

**Workaround:** Für den Karten-Export wird der Leaflet-eigene Export-Mechanismus genutzt statt html2canvas auf die Karte anzuwenden.

---

## 🔒 html2canvas `allowTaint: true` → SecurityError

**Problem:** Mit `allowTaint: true` rendert html2canvas Cross-Origin Bilder (z.B. WMS-Tiles), aber danach schlägt `canvas.toDataURL()` mit `SecurityError` fehl — "tainted canvas may not be exported".

**Lösung:** Entweder `useCORS: true` (wenn der Server CORS-Header setzt) oder auf den Canvas-Export verzichten und stattdessen einen Server-Side Screenshot nutzen.

---

## 📄 Next.js GitHub Pages: `trailingSlash: true` PFLICHT

**Problem:** Ohne `trailingSlash: true` liefert GitHub Pages 404-Fehler für alle Unterseiten.

**Grund:** GitHub Pages erwartet Verzeichnisse mit `index.html`. Ohne trailingSlash generiert Next.js Dateien wie `demo.html` statt `demo/index.html`.

```typescript
// next.config.ts
const nextConfig = {
  output: "export",
  trailingSlash: true, // ← NICHT VERGESSEN!
};
```

---

## 🔗 `router.push()` OHNE basePath

**Problem:** `router.push("/demo/")` funktioniert korrekt — Next.js fügt `basePath` automatisch hinzu.

**Falsch:** `router.push("/uplan-engine/demo/")` → wird zu `/uplan-engine/uplan-engine/demo/`

```typescript
// ✅ Richtig
router.push("/demo/");

// ❌ Falsch — basePath wird doppelt
router.push("/uplan-engine/demo/");
```

---

## 📍 `usePathname()` gibt Pfad OHNE basePath

**Problem:** `usePathname()` gibt z.B. `/demo/` zurück, nicht `/uplan-engine/demo/`.

**Beachten:** Wenn du Pfade vergleichst oder Links baust, berücksichtige dass basePath nicht enthalten ist.

---

## 🗺️ WMS URLs: `gdi.berlin.de` — NICHT `fbinter.stadt-berlin.de`

**Problem:** Die alten FIS-Broker URLs (`fbinter.stadt-berlin.de`) sind deprecated und funktionieren teilweise nicht mehr.

```
✅ https://gdi.berlin.de/services/wms/alkis_flurstuecke
❌ https://fbinter.stadt-berlin.de/fb/wms/...
```

---

## 🏷️ WMS Layer-Namen OHNE Workspace-Prefix

**Problem:** Layer-Namen dürfen keinen Workspace-Prefix haben.

```
✅ layers: "alkis_flurstuecke"
❌ layers: "fis:alkis_flurstuecke"
```

---

## 🎨 `styles=""` Parameter PFLICHT bei WMS

**Problem:** Ohne den `styles`-Parameter (auch als leerer String) liefern manche WMS-Server einen Fehler oder den falschen Style.

```typescript
<WMSTileLayer
  url="https://gdi.berlin.de/services/wms/bplan"
  layers="bplan"
  styles=""          // ← NICHT WEGLASSEN!
  format="image/png"
  transparent={true}
/>
```

---

## 🔄 Zustand Hydrate Pattern

**Problem:** Zustand Stores starten auf dem Server (und beim ersten Client-Render) mit leeren/Default-Werten. localStorage ist nur im Browser verfügbar.

**Pattern:** Store startet leer, `hydrate()` wird in `useEffect` aufgerufen:

```typescript
// Store Definition
const useStore = create((set) => ({
  buildings: [],  // Startet leer!
  hydrate: () => {
    const data = localStorage.getItem("key");
    set({ buildings: data ? JSON.parse(data) : DEFAULTS });
  },
}));

// Komponente
useEffect(() => {
  useStore.getState().hydrate();
}, []);
```

**Warum:** SSR/SSG hat kein `window`. Direkter localStorage-Zugriff im Store-Initializer verursacht `ReferenceError: window is not defined`.

---

## 🔀 localStorage Migration: Gropius → GROPYUS

**Problem:** Frühere Versionen speicherten "Gropius" als Hersteller-Label. Nach dem Rename zu "GROPYUS" müssen alte localStorage-Daten migriert werden.

**Lösung:** Beim `hydrate()` wird geprüft ob alte Daten existieren. Falls ja, wird localStorage gelöscht und auf Code-Defaults zurückgefallen:

```typescript
const hasOldGropius = buildings.some(b => b.manufacturerLabel === "Gropius");
if (hasOldGropius) {
  localStorage.removeItem(STORAGE_KEY_B);
  localStorage.removeItem(STORAGE_KEY_M);
  return DEFAULTS;
}
```

Diese Migration existiert sowohl in `admin/store.ts` als auch in `catalogData.ts`.
