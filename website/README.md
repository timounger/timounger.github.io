# BonPrinter Box Website

Statische Next.js-Website für die Wertmarkendrucker-Vermietung. Deploy auf GitHub Pages, Anfrage-Formular öffnet das Mail-Programm des Besuchers.

## Stack

- **Next.js 15** mit static export (`output: "export"`) → reines HTML+CSS+JS
- **TypeScript** mit strict mode
- **Tailwind CSS** für Styling
- **react-day-picker** für die Datumsauswahl
- **lucide-react** für Icons
- **mailto-Link** für Anfragen (kein Backend, kein Service nötig)
- Hosting: **GitHub Pages** (kostenlos)

## Erste Schritte

### Lokal starten

```powershell
cd website
npm install
npm run dev
```

Oder per `start.bat` (Doppelklick im Explorer).

Site läuft auf <http://localhost:3000>.

### Production-Build (statischer Export)

```powershell
npm run build
```

Erzeugt den fertigen statischen Output in `website/out/`. Dieser Ordner ist 1:1 das, was auf GitHub Pages deployed wird.

## Projektstruktur

```text
website/
├── app/                          # Next.js-Routen + Metadaten
│   ├── layout.tsx                # Root-Layout (SiteChrome + JSON-LD)
│   ├── page.tsx                  # Startseite (komponiert aus components/home/)
│   ├── globals.css               # Tailwind + DayPicker-Styling
│   ├── manifest.ts               # PWA-Manifest
│   ├── robots.ts                 # robots.txt
│   ├── sitemap.ts                # sitemap.xml (inkl. Image-Sitemap)
│   ├── about/page.tsx            # Über mich
│   ├── demo/page.tsx             # Live-Demo (Vollbild)
│   └── impressum/page.tsx        # Impressum & Datenschutz
│
├── components/                   # Website-Komponenten (gruppiert nach Aufgabe)
│   ├── home/                     # Startseiten-Sektionen
│   │   ├── hero.tsx
│   │   ├── hero-gallery.tsx
│   │   ├── features.tsx
│   │   ├── stats.tsx
│   │   ├── pricing.tsx
│   │   ├── booking-section.tsx
│   │   └── booking-form.tsx
│   ├── layout/                   # Seiten-Rahmen (Header, Footer, FAB, BG)
│   │   ├── header.tsx
│   │   ├── footer.tsx
│   │   ├── site-chrome.tsx       # Blendet Chrome auf /demo aus
│   │   ├── whatsapp-fab.tsx
│   │   └── animated-background.tsx
│   ├── theme/                    # Light/Dark-Mode
│   │   ├── theme-provider.tsx
│   │   └── theme-toggle.tsx
│   └── seo/
│       └── json-ld.tsx           # LocalBusiness + Service + Breadcrumb
│
├── features/                     # Eigenständige Module (extrahierbar)
│   └── pos-demo/                 # Live-Demo der Kassensoftware
│       ├── components/           # BonPrinterApp (App) + PosDemo (Seite)
│       ├── data/                 # articles.ini + Loader, LOGIN, Numpad
│       ├── i18n/                 # DE/EN-Übersetzungen
│       ├── lib/                  # euro(), grid-sort(), multiline()
│       ├── types.ts
│       ├── index.ts              # Barrel: `export { PosDemo }`
│       └── README.md             # Extraktions-Anleitung
│
├── public/
│   ├── img/                      # Produktbilder, Logos + App-Icon (app.png)
│   └── pos-demo/                 # POS-Demo-Icons (light/dark)
│
├── scripts/
│   ├── generate-thumbs.mjs       # Thumbnail-Generator (sharp)
│   └── open-docs.mjs             # öffnet die generierte API-Doku
│
└── package.json
```

Die Windows-Komfort-Launcher `install.bat` / `start.bat` liegen im Repo-Root (eine Ebene über `website/`).

### Konvention

- **`components/`** = Sachen, die nur diese Website nutzt
- **`features/`** = abgeschlossene Module mit eigener Public API, die später in ein anderes Projekt wandern könnten
- Imports nutzen den Alias `@/` (= Root). Beispiel: `@/components/home/hero`, `@/features/pos-demo`

## Anfrage-Workflow

1. Kunde wählt im Datepicker einen Zeitraum
2. Trägt Kontaktdaten ein
3. Klickt "Anfrage per E-Mail senden"
4. Browser öffnet das Mail-Programm des Kunden mit vorausgefüllter E-Mail
5. Kunde sendet die E-Mail selbst ab → Anfrage landet in deinem Postfach
6. Du prüfst manuell, ob frei → meldest dich beim Kunden zurück

**Keine Verfügbarkeitsprüfung im Code** - das machst du selbst über deinen Kalender.
**Kein Backend, kein externer Dienst, keine Konten zu pflegen.**

## Deployment

Über GitHub Actions (siehe `.github/workflows/github-ci.yml`) wird der Build bei jedem Push auf `working` automatisch nach GitHub Pages deployed.

Damit das Deployment funktioniert, muss im Repo unter **Settings → Pages → Source** der Eintrag **"GitHub Actions"** ausgewählt sein.

## Lokale Tools

Standard-Schnittstelle sind die npm-Skripte (bzw. die VS-Code-Tasks):

- `npm run dev` - Dev-Server starten (oder `start.bat` im Repo-Root als Windows-Doppelklick: killt Port 3000 und öffnet den Browser)
- `npm run format` / `npm run format:check` - Code mit Prettier formatieren / nur prüfen
- `npm run lint` / `npm run lint:fix` - ESLint (inkl. JSDoc-Doku-Pflicht)
- `npm run typecheck` - TypeScript ohne Build prüfen (`tsc --noEmit`)
- `npm run test` / `npm run test:watch` - Unit-Tests (Vitest)
- `npm run spell` - Rechtschreibprüfung (cSpell, DE+EN)
- `npm run knip` - ungenutzte Dependencies/Exports/Dateien finden
- `npm run check` - alles zusammen: lint + format:check + spell + typecheck + test
- `npm run deps:check` / `deps:update` / `deps:upgrade` - Pakete prüfen/aktualisieren
- `npm run docs` - API-Doku (TypeDoc) erzeugen und im Browser öffnen

Erstinstallation: `npm install` im `website/`-Ordner (oder `install.bat` im Repo-Root).
Dabei richtet `husky` automatisch einen **pre-commit-Hook** ein, der per `lint-staged`
ESLint + Prettier auf den geänderten Dateien ausführt.

### Automatik (CI & Hooks)

- **pre-commit** (husky + lint-staged): formatiert/lintet geänderte Dateien vor dem Commit.
- **CI** ([github-ci.yml](../.github/workflows/github-ci.yml)): lint + format:check + spell + typecheck + test vor Build & Deploy.
- **Lighthouse** ([lighthouse.yml](../.github/workflows/lighthouse.yml)): Performance/A11y/SEO-Audit bei Pull Requests.
- **Dependabot** ([dependabot.yml](../.github/dependabot.yml)): wöchentliche Update-PRs (Minor/Patch gruppiert, Major bleibt manuell).

Code-Konventionen siehe [../docs/coding-rules.md](../docs/coding-rules.md).

## Bilder hinzufügen (Hero-Galerie)

Die Galerie auf der Startseite zeigt das gewählte Bild groß und alle anderen klein als Thumbnails. Damit die Thumbnails klein (~5 KB statt ~50 KB) bleiben, gibt es zu jedem Galerie-Bild eine `_thumb.webp`-Version (200×200).

### Neues Bild hinzufügen

1. **Original ablegen** als WebP in `public/img/`, z.B. `neues_bild.webp`. Empfohlen: max. 1200-1600 px lange Seite, Q 80 (siehe [squoosh.app](https://squoosh.app))

2. **Thumbnail-Liste erweitern** in `scripts/generate-thumbs.mjs`:

   ```js
   const SOURCES = [
     "bonprinterbox_front.webp",
     "article_view.webp",
     // ...
     "neues_bild.webp", // ← hinzufügen
   ];
   ```

3. **Thumbnails generieren**:

   ```powershell
   npm run thumbs
   ```

   Erzeugt `neues_bild_thumb.webp` (200×200) in `public/img/`

4. **In Galerie eintragen** - `components/hero-gallery.tsx`, im `images`-Array:

   ```ts
   {
     src: "/img/neues_bild.webp",
     thumb: "/img/neues_bild_thumb.webp",
     alt: "Beschreibung",
     width: 1024,  // Originalbreite
     height: 676,  // Originalhöhe
   },
   ```

   Die Bildmaße kannst du in [squoosh.app](https://squoosh.app) ablesen (Datei reinziehen, oben links erscheint `WxH`).

### Auch in Sitemap eintragen (optional, hilft Google Images)

In `app/sitemap.ts` das `galleryImages`-Array um den neuen Pfad ergänzen - damit Google das Bild über die Sitemap findet, nicht erst beim Crawl der Seite.
