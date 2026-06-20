# Excel-Bericht (PrintReport.xlsx)

Erzeugt aus der `PrintLog.csv` einen Excel-Bericht - nach dem Vorbild von
`excel_print_report.py` im Referenzprojekt (openpyxl). Wird in der Desktop-App
(BonPrinter.exe) beim **Bericht erstellen** automatisch aufgerufen und im
Berichtsordner abgelegt.

## Tabs

- **Druckprotokoll** - alle Druckzeilen als Tabelle (mit Einzelpreis-Formel)
- **Übersicht** - Gesamtsumme, Summe je Benutzer (inkl. Beteiligung/Auszahlung),
  Artikelmengen je Gruppe, Gratis-Artikel
- **Artikel** - Balkendiagramm der gedruckten Artikel (Menge)
- **Kassenbericht** - Bargeldzählung + Brutto/Netto/Steuer je Gruppe
- **ToolInfo** (ausgeblendet)

Steuersätze und Beteiligung werden aus der `[Tax]`-Sektion der `articles.ini`
gelesen (`group1/2/3`, `user`). Storno-Zeilen (negativer Betrag) werden
verrechnet.

## Manuell ausführen

```bash
pip install openpyxl
python excel_report.py <PrintLog.csv> <PrintReport.xlsx> <articles.ini>
```

> Hinweis: Zeit-/Tagesstatistik-Diagramme aus dem Referenzprojekt sind hier
> (noch) nicht enthalten.
