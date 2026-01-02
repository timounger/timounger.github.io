# timounger.github.io

Mono-Repo für meine GitHub-Pages-Site und alles drumherum.

## Struktur

```text
timounger.github.io/
├── .github/workflows/   # CI: Build & Deploy nach GitHub Pages
├── website/             # Next.js-Website (BonPrinter Box)
│   └── features/
│       └── pos-demo/    # Live-Demo der Kassensoftware (extraction-ready)
├── docs/                # Coding-Regeln & Anleitungen
├── install.bat          # Windows-Doppelklick: Dependencies installieren
├── start.bat            # Windows-Doppelklick: Dev-Server starten
└── README.md            # ← du bist hier
```

Details zur Website: siehe [website/README.md](./website/README.md).
Details zur POS-Demo: siehe [website/features/pos-demo/README.md](./website/features/pos-demo/README.md).

## Schnellstart (Windows)

`install.bat` doppelklicken (einmalig), dann `start.bat` - öffnet den Dev-Server
im Browser. Plattformunabhängig: im `website/`-Ordner `npm install` und `npm run dev`.

## Live

- Production: <https://timounger.github.io/>

## Nützliche Tools

### Bilder für Web komprimieren

Format: **WebP** (Qualität ~80, max. 1200-1600 px lange Seite)

- <https://squoosh.app/editor>

Für Galerie-Bilder gibt es zusätzlich ein Script, das Thumbnails generiert:

```powershell
cd website
npm run thumbs
```

Siehe [website/README.md](./website/README.md#bilder-hinzufügen-hero-galerie).

### Performance & SEO prüfen

- <https://pagespeed.web.dev/> — Lighthouse-Score (Performance, SEO, A11y)
- <https://search.google.com/test/rich-results> — JSON-LD validieren
- <https://opengraph.xyz/> — Social-Sharing-Preview
- <https://validator.w3.org/> — HTML-Validierung
