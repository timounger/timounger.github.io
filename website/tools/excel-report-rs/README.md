# Excel-Bericht (Rust-Variante)

Rust-Port des Excel-Report-Tools (`tools/excel-report/excel_report.py`) auf Basis
von [`rust_xlsxwriter`](https://crates.io/crates/rust_xlsxwriter). Erzeugt die
gleiche `PrintReport.xlsx` (Druckprotokoll, Übersicht, Artikel-Diagramm,
Kassenbericht, ToolInfo), aber als **eine kleine eigenständige .exe (~0,8 MB,
keine Runtime)** statt der ~15 MB Python/PyInstaller-Variante.

## Python oder Rust wählen (Compiler-Flag)

Beide Varianten erzeugen dasselbe `electron/bin/excel_report.exe`; die App ruft
es unverändert auf. Umgeschaltet wird über die Umgebungsvariable `EXCEL_ENGINE`:

```bash
# Python (Standard)
npm run app:dist

# Rust
EXCEL_ENGINE=rust npm run app:dist      # bzw. unter Windows: build-exe-rust.bat
```

Der Build-Umschalter steckt in `scripts/build-excel-report.mjs`.

## Manuell bauen / ausführen

```bash
cargo build --release --manifest-path tools/excel-report-rs/Cargo.toml
target/release/excel_report.exe <PrintLog.csv> <PrintReport.xlsx> <articles.ini>
```

> Voraussetzung: Rust-Toolchain (cargo). Steuersätze/Beteiligung kommen aus der
> `[Tax]`-Sektion der `articles.ini`; Storno (negativer Betrag) wird verrechnet.
> Zeit-/Tagesstatistik-Diagramme sind (wie in der Python-Variante) nicht enthalten.
