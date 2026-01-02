# POS Demo

Eigenständiges Modul für die Wertmarkendrucker-Kassensoftware-Simulation. Wird aktuell auf der `/demo`-Seite der BonPrinter-Box-Website eingebunden, ist aber so strukturiert, dass es jederzeit in ein eigenes Projekt extrahiert werden kann.

## Struktur

```text
pos-demo/
├── components/
│   ├── bon-printer-app.tsx # die App selbst (weisser Kasten): UI + gesamte Logik
│   └── pos-demo.tsx        # Demo-Seite: rendert <BonPrinterApp/> + Erklaertexte
├── data/
│   ├── articles.ini        # Artikel-Konfiguration (Name, Preis, Steuer, Farben, Pfand)
│   ├── load-articles.ts    # liest articles.ini zur Build-Zeit (Server, fs)
│   ├── user.ini            # Benutzer/Logins (Passwort, Name)
│   ├── load-users.ts       # liest user.ini zur Build-Zeit (Server, fs)
│   ├── login.ts            # LOGIN-Raster (Bediener, Admin, Host, …)
│   └── numpad.ts           # numpadCells() Ziffernblock-Layout
├── i18n/
│   ├── de.json             # deutsche UI-Strings
│   ├── en.json             # englische UI-Strings
│   └── translations.ts     # bindet de/en typsicher als T ein
├── lib/
│   ├── euro.ts             # euro() Preisformatierung
│   ├── grid-sort.ts        # buildArticleRank() + sortByGrid() + gridNumberAt()
│   └── multiline.tsx       # multiline() JSX-Helper für \n-Umbrüche
├── *.test.ts               # Unit-Tests (Vitest) für die reinen Helfer/Parser
├── types.ts                # Article, ArticleGrid, OrderLine, Lang, NumpadMode, LoginCell, User, UserConfig
├── index.ts                # Public API: `export { PosDemo }`
└── README.md
```

## Verwendung in dieser Website

Artikel **und** Benutzer werden zur Build-Zeit aus den INI-Dateien gelesen
(Dateisystem-Zugriff, daher in einer Server-Komponente) und als Props in die
Demo gereicht:

```tsx
import { PosDemo } from "@/features/pos-demo";
import { loadArticleGrid } from "@/features/pos-demo/data/load-articles";
import { loadUsers } from "@/features/pos-demo/data/load-users";

export default function DemoPage() {
  const articles = loadArticleGrid();
  const users = loadUsers();
  return <PosDemo articles={articles} users={users} />;
}
```

`PosDemo` (Demo-Seite) umschliesst `BonPrinterApp` (die eigentliche Anwendung) und
zeigt darunter die Erklaertexte. Die App meldet ihren Kontext (Login-Status,
Sprache, Theme) per `onContext`-Callback nach oben.

## Artikel konfigurieren (articles.ini)

Alle Artikel und Preise stehen in `data/articles.ini` - Code muss dafür nicht
angefasst werden. Die Abschnittsnummer `[n]` ist die Artikelnummer wie in der
Kasse (spaltenweise von unten-links nach oben, festes 6x5-Raster).

```ini
[1]
name = Cola-Mix
price = 3.50
tax_group = 1
bg = #55ff7f
fg = #000000
mark = true
deposit = 2.00
```

| Schlüssel   | Pflicht | Bedeutung                                                                        |
| ----------- | ------- | -------------------------------------------------------------------------------- |
| `name`      | ja      | Anzeigename; `\n` setzt einen Umbruch (kein Leerzeichen)                         |
| `price`     | ja      | Bruttopreis pro Stück (Punkt oder Komma als Dezimaltrennzeichen)                 |
| `tax_group` | ja      | 1 = Getränke, 2 = Essen - für gruppierte Summen in Zwischenstand und Bericht     |
| `bg`        | nein    | Hintergrundfarbe des Buttons (Hex `#rrggbb` oder CSS-Name wie `orange`)          |
| `fg`        | nein    | Text-/Vordergrundfarbe des Buttons                                               |
| `mark`      | nein    | `true` = Artikel startet orange markiert (wie nach Long-Press)                   |
| `deposit`   | nein    | Pfand pro Stück in Euro; fügt eine rote `PFAND (x €)`-Zeile zur Bestellung hinzu |

- Leere Zelle: `name` leer lassen.
- Ein Leerzeichen vor `\n` trennt die Wörter auch einzeilig (z. B. `Currywurst \nSpezial`).

## Benutzer konfigurieren (user.ini)

Logins stehen in `data/user.ini`. Jeder Abschnitt ist ein Benutzer (`[Admin]`,
`[Local]`, `[B1]` …). Pro Benutzer:

```ini
[B1]
name = Anna
pw = 1234
```

| Schlüssel | Bedeutung                                                                                                                              |
| --------- | -------------------------------------------------------------------------------------------------------------------------------------- |
| `pw`      | **leer** = direkter Login · **numerisch** = PIN-Eingabe am Ziffernblock · sonst = gesperrt (ausgegraut, nicht wählbar, z. B. `Locked`) |
| `name`    | optionaler Anzeigename - **nur für Bediener B1-B15**                                                                                   |

- **PIN-Login:** Nach Antippen des Benutzers werden die Zifferntasten aktiv. Die
  Eingabe wird maskiert (•) angezeigt; bei korrekter PIN in voller Länge erfolgt
  der Login. Eine Stelle zu viel startet die Eingabe neu, `Entf` löscht die letzte
  Stelle.
- **Name bei Bedienern:** Ist ein `name` gesetzt, zeigt die Taste zweizeilig
  `B1` / `Anna`, und nach dem Login steht in der Statusleiste `B1 (Anna)`.

## Abhängigkeiten

Die App ist **nicht** an die Website gekoppelt - sie nutzt nur:

- `react`, `react-dom` - Standard
- `next-themes` - für `useTheme()` (Synchronisation mit System-Theme)
- `lucide-react` - für das `ChevronRight`-Icon
- Tailwind CSS - für das Styling (alle Klassen inline)
- Icons aus `public/pos-demo/` (lock, ec, sound, language, paper_change, status,
  report, cancellation, theme, app) sowie `public/img/app.png` (App-/Fenster-Icon)
- Sound-Effekte aus `public/pos-demo/*.wav` (touch, clear, cash, unlock) - optional,
  standardmäßig stumm; aktuell stille Platzhalter-Dateien

Die Loader `load-articles.ts` / `load-users.ts` nutzen das Node-Dateisystem (`fs`)
und dürfen nur aus Server-Komponenten importiert werden.

Die Tailwind-Konfiguration nutzt eine **scoped Dark-Mode-Variante** (`.pos-dark` / `.pos-light`), damit die Demo ihre eigene Light/Dark-Einstellung unabhängig von der Webseite haben kann. Siehe `tailwind.config.ts` der Website.

## Extraktion als eigenes Projekt

Wenn du die Demo in ein separates Projekt überführst:

1. **Ordner kopieren** - `features/pos-demo/` in das neue Projekt
2. **Icons mitnehmen** - `public/pos-demo/*.png` (+ `*.wav`) und `public/img/app.png` (oder die Pfade in `bon-printer-app.tsx` anpassen)
3. **articles.ini und user.ini** mitnehmen und sicherstellen, dass die Pfade in `load-articles.ts` / `load-users.ts` passen (lesen relativ zu `process.cwd()`)
4. **Tailwind-Config übernehmen**:
   - `darkMode: ["variant", "&:is(.dark *, .pos-dark *):not(.pos-light *)"]`
   - `content` muss die Demo-Pfade umfassen
5. **Dependencies** in `package.json`:
   ```json
   "next-themes": "^0.4.x",
   "lucide-react": "^0.469.x",
   "react": "^19.x",
   "tailwindcss": "^3.x"
   ```
6. **Theme-Provider** wrappen (falls die Host-App noch keinen hat):
   ```tsx
   <ThemeProvider attribute="class">
     <PosDemo articles={articles} users={users} />
   </ThemeProvider>
   ```

## Anpassen

| Was                            | Wo                                                             |
| ------------------------------ | -------------------------------------------------------------- |
| Artikel-Sortiment / Preise     | `data/articles.ini`                                            |
| Farben / Markierung / Pfand    | `data/articles.ini` → `bg`, `fg`, `mark`, `deposit`            |
| Steuergruppen (Getränke/Essen) | `data/articles.ini` → `tax_group`                              |
| Logins / PIN / Bediener-Namen  | `data/user.ini` → `pw`, `name`                                 |
| Bediener-Slots (B1-B15)        | `data/login.ts` → `LOGIN`                                      |
| Übersetzungen (DE/EN)          | `i18n/de.json` / `i18n/en.json`                                |
| Weitere Sprache hinzufügen     | `Lang`-Typ in `types.ts` + JSON + Eintrag in `translations.ts` |
| Währungsformat                 | `lib/euro.ts`                                                  |
| Tabellen-Sortierreihenfolge    | `lib/grid-sort.ts`                                             |

## Funktionsumfang

- Login per `user.ini`: ohne Passwort direkt, mit numerischem Passwort per PIN,
  nicht-numerisch = gesperrt; optionaler Bediener-Name (`B1 (Anna)`)
- Bediener (B1-B15) werden nach dem Druck automatisch abgemeldet; der letzte
  Ausdruck bleibt mit Summe sichtbar und lässt sich per `Entf` löschen
- `Host` und `Admin` teilen die Manager-Ansicht (kein Artikel-Raster, Bericht über
  alle Benutzer, Statistik zurücksetzbar)
- Artikel-Buchung mit Multiplikator (X-Taste)
- Pfand-System: `deposit` erzeugt rote `PFAND`-Zeilen, nach Betrag sortiert, einzeln
  löschbar, in der Live-Summe enthalten
- Artikel-Farben (`bg`/`fg`) und Vormarkierung (`mark`) aus der `articles.ini`
- Storno-Modus (rote Anzeige + Negativ-Buchung im Bericht)
- Rückgeld-Rechner (RCH)
- EC-Kartenzahlung nach Druck - wird im Bericht separat ausgewiesen (`inkl. EC`)
- Zwischenstand pro Nutzer / Bericht über alle Nutzer, Auflistung und Summe je Steuergruppe
- Mehrsprachigkeit DE/EN
- Light/Dark/Auto/Systemstandard-Theme (scoped)
- Konfigurations-Menü mit Sound, Sprache, Preise anzeigen, Papierstatus
- Long-Press auf Artikel markiert sie orange (z. B. „Sonderwarnung")
- Statuszeile zeigt aktuelle Aktion 3 s lang an
