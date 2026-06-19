# NFC-Brücke (RFID-Login für die Demo)

Der Browser kann einen PC/SC-NFC-Leser (z. B. ACS ACR1252U) nicht direkt
ansprechen. Diese kleine lokale Brücke liest die Karten-UID per `pyscard` und
schickt sie über einen lokalen WebSocket an die Web-Demo, die dann den passenden
Benutzer einloggt.

## Ablauf

```text
[NFC-Leser] --PC/SC--> [nfc_bridge.py] --ws://127.0.0.1:8765--> [Web-Demo (?nfc)]
```

## Einrichten

1. Leser-Treiber installieren (PC/SC), Leser anstecken.
2. Abhängigkeiten installieren:
   ```bash
   pip install pyscard websockets
   ```
3. Brücke starten:
   ```bash
   python nfc_bridge.py
   ```
   Ausgabe: `NFC bridge running on ws://127.0.0.1:8765`
4. UIDs in `features/pos-demo/data/user.ini` hinterlegen, z. B.:
   ```ini
   [Admin]
   uid = ["9B 96 31 16", "C1 BF E7 F4"]
   ```
5. Demo **einmal** mit `?nfc` öffnen: `…/demo/?nfc` (anderer Port: `?nfc=8765`).
   Die Aktivierung wird im Browser gemerkt - danach bleibt der RFID-Login auch
   ohne `?nfc` aktiv. Abschalten mit `?nfc=off`.
6. Karte an den Leser halten -> der zugehörige Benutzer wird angemeldet.

## Hinweise

- Ohne `?nfc` in der URL ist der RFID-Login aus (öffentliche Besucher sind nie
  betroffen).
- Die UID-Schreibweise ist egal (Leerzeichen/Groß-/Kleinschreibung werden beim
  Vergleich normalisiert).
- Eine HTTPS-Seite darf sich mit `ws://127.0.0.1` verbinden (localhost gilt als
  vertrauenswürdig). Falls ein Browser blockt, die Brücke mit TLS betreiben.
