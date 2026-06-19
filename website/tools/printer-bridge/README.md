# Drucker-Brücke (ESC/POS-Thermodrucker für die App)

Der Browser kann einen seriellen Drucker (z. B. Epson TM-T20III) nicht direkt
ansprechen. Diese kleine lokale Brücke empfängt Druckaufträge über einen lokalen
WebSocket und druckt **einen Bon pro Stückzahl** in einem Hintergrund-Thread mit
0,75 s Pause zwischen den Bons (verhindert einen Puffer-Überlauf des Druckers,
gleiches Vorgehen wie in der Referenz `printer.py`). Sie kann auch die
Kassenlade öffnen.

## Ablauf

```text
[Web-App] --ws://127.0.0.1:8766--> [printer_bridge.py] --COMx--> [ESC/POS-Drucker]
```

## Einrichten

1. Drucker an einem COM-Port anschließen (USB-seriell oder echtes COMx).
2. Abhängigkeiten installieren:
   ```bash
   pip install python-escpos pyserial websockets
   ```
3. Brücke starten:
   ```bash
   python printer_bridge.py
   ```
   Ausgabe: `Printer bridge running on ws://127.0.0.1:8766`
4. In der App unter **Konfiguration → Drucker COM-Port** den richtigen Port
   wählen (z. B. `COM3`) und ggf. die **Papierbreite** (58/80 mm).
5. Drucken: Die App schickt den aktuellen Warenkorb an die Brücke; je Artikel und
   Stückzahl wird ein Einzelbon gedruckt. Die **ÖFFNEN**-Taste löst die
   Kassenlade aus.

## Nachrichten-Protokoll (JSON über WebSocket)

- `{"type":"port","port":"COM3"}` - COM-Port setzen (`null` = Drucken aus)
- `{"type":"width","width":80}` - Papierbreite (58 oder 80 mm)
- `{"type":"print","user":"Local","date":"…","lines":[{"name":"…","price":2.5,"qty":2,"showPrice":true}]}`
- `{"type":"drawer"}` - Kassenlade öffnen

## Aus der Website-Demo drucken

Wie beim RFID-Login (`?nfc`) ist das Drucken auf der Website **per Opt-in**:

1. Brücke lokal starten (`python printer_bridge.py` oder die gebündelte exe).
2. Demo **einmal** mit `?print` öffnen: `…/demo/?print` (anderer Port:
   `?print=8766`). Die Aktivierung wird im Browser gemerkt - danach bleibt das
   Drucken auch ohne `?print` aktiv. Abschalten mit `?print=off`.
3. Als **Admin** anmelden -> **Konfiguration -> Drucker COM-Port** den richtigen
   Port wählen (es werden die tatsächlich verfügbaren Ports angezeigt).
4. Drucken/ÖFFNEN funktioniert dann wie in der Desktop-App.

## Hinweise

- In der Desktop-App (BonPrinter.exe) wird die Brücke automatisch gestartet (dort
  ist kein `?print` nötig).
- Ist kein COM-Port gesetzt, werden Druckaufträge verworfen (kein Fehler).
- Eine HTTPS-Seite darf sich mit `ws://127.0.0.1` verbinden (localhost gilt als
  vertrauenswürdig).
