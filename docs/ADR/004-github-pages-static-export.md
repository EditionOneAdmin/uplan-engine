# ADR-004: GitHub Pages mit Static Export

**Status:** Accepted

## Kontext

Die Anwendung muss öffentlich zugänglich gehostet werden. Es gibt kein Backend und keine server-seitigen Anforderungen.

## Entscheidung

Wir deployen als **Next.js Static Export** (`output: "export"`) auf **GitHub Pages**.

**Gründe:**

1. **Kostenlos:** GitHub Pages ist kostenlos für öffentliche Repos.
2. **Kein Server-Management:** Kein Hosting, keine Container, kein CI/CD-Server nötig.
3. **Next.js Kompatibilität:** `output: "export"` generiert ein `out/`-Verzeichnis mit reinem HTML/CSS/JS. Kein Node.js Server zur Runtime.
4. **Versioniert:** Deploy ist ein Git Push. Rollback = alter Commit.
5. **Custom Domain möglich:** Falls später eine eigene Domain gewünscht ist.

**Konfiguration:**

```typescript
// next.config.ts
{
  output: "export",
  basePath: "/uplan-engine",
  trailingSlash: true,        // PFLICHT für GitHub Pages
  images: { unoptimized: true } // Kein Image Optimization ohne Server
}
```

## Konsequenzen

- ✅ Kein Hosting-Kosten, kein Server-Management
- ✅ Automatisches HTTPS
- ✅ Git-basiertes Deployment
- ⚠️ `basePath` muss bei allen internen Links beachtet werden (Next.js handelt das meist automatisch)
- ⚠️ `trailingSlash: true` ist zwingend (siehe GOTCHAS.md)
- ⚠️ Keine API Routes, keine Server Components, kein ISR
- ⚠️ Keine Image Optimization (alle Bilder `unoptimized: true`)
