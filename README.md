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

## Statistiken (GoatCounter)

Datenschutzfreundliche Reichweitenmessung - cookiefrei, ohne IP-Speicherung, kein
Consent-Banner nötig.

**Werte ansehen:**

- Dashboard (Login nötig): <https://timounger.goatcounter.com>
- Direkt auf der Seite (nur für dich): <https://timounger.github.io/?stats> - zeigt
  die Gesamt-Aufrufe oben im Header neben dem Logo. Ohne `?stats` ist der Zähler
  unsichtbar (normale Besucher sehen nichts).
- Als JSON abfragen (z. B. für eigene Skripte): <https://timounger.goatcounter.com/counter/TOTAL.json>
  liefert `{"count":"…","count_unique":"…"}` für die gesamte Seite. Für eine einzelne
  Seite den Pfad einsetzen, z. B. `…/counter/demo.json`. (Erfordert die unten genannte
  Endpoint-Freigabe.)

**Einrichten (einmalig):**

1. Auf <https://www.goatcounter.com> registrieren und einen Code/Subdomain wählen
   (aktuell: `timounger` → Dashboard `https://timounger.goatcounter.com`).
2. Repo-Variable setzen: **Settings → Secrets and variables → Actions → Reiter
   „Variables"** → `NEXT_PUBLIC_GOATCOUNTER` = `timounger`. Der Wert wird beim Build
   eingebettet - nach einer Änderung neu nach `working` pushen (Deploy baut neu).
3. Für den `?stats`-Zähler in GoatCounter **Settings → „Allow adding visitor counts
   to your website"** aktivieren (schaltet den öffentlichen `counter`-Endpoint frei).

**Was gemessen wird:** Seitenaufrufe, Herkunft (Referrer), Land, Browser/System -
anonym, ohne Cookies. Zusätzlich das Event **„Anfrage abgeschickt"** (Buchungsformular)
als Conversion (im Dashboard unter Events).

Ohne gesetzte Variable ist das Tracking aus (z. B. lokal). Hinweise zur Verarbeitung
stehen in der [Datenschutzerklärung](https://timounger.github.io/datenschutz).

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
