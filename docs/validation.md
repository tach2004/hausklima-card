# Validierung – adaptive Messwertfelder und Sensorgruppen

Diese Nachbesserung basiert auf dem aktuellen `main` nach dem Merge von PR #6 und dem automatischen Release v0.1.2 (`e440ce1`). Der Arbeitsbranch ist `feat/adaptive-sensor-groups`. Ein Merge oder Release wird nicht selbstständig ausgelöst.

## Umfang und Bildintegrität

Die Nachbesserung betrifft inhaltsabhängige schwarze Messwertfelder, lokale Messart- und Raumsymbole, mehrere ausgewählte Hauptquellen mit freien Gruppennamen, beide Luftdruckarten und die einstellbare maximale Ansichtsbreite bis 3200 CSS-Pixel. Temperatur und beide Feuchtearten erhalten eine Nachkommastelle, CO₂, VOC und beide Druckarten keine. Alle Werte und Einheiten stammen weiter aus konfigurierten HA-Entitäten.

Die freigegebene Hausillustration wird nicht bearbeitet oder ersetzt. Referenz-SHA-256 von `src/assets/hausklima-cutaway.webp`:

```text
fc840fd3cdd7ec1ecbae75a475c14674eafa28e99d7c43888ce6ffef7cbbef98
```

Der Abschlussvergleich bestätigt denselben SHA-256 für die Quelldatei und das im JavaScript-Bundle eingebettete Bild. Der Asset-Diff gegen `e440ce1` ist leer. Die Bildfläche bleibt vollständig und proportional; ausschließlich die HTML-/CSS-Overlays und die Gesamtgröße ändern sich.

## Abschlussprotokoll

| Prüfung | Ergebnis |
| --- | --- |
| `npm ci` | Installation aus dem Lockfile erfolgreich |
| `npm run check` | TypeScript-Prüfung erfolgreich |
| `npm test` | **148 Tests in sieben Dateien erfolgreich** |
| `node --test scripts/next-version.test.mjs` | **Fünf Release-Regeltests erfolgreich** |
| `npm run build` | Eigenständiges HACS-Bundle mit 202565 Bytes erfolgreich erzeugt |
| Bildintegrität | Quell- und Bundle-Bild haben den unveränderten SHA-256; leerer Asset-Diff gegen `e440ce1` |
| `UPDATE_SCREENSHOTS=1 npm run test:browser` | Finaler Chromium-Lauf vollständig erfolgreich, ohne JavaScript-Seitenfehler oder externe Laufzeitanfragen |
| Responsive Grundmatrix | 16 Viewport-/Theme-Fälle: 360/390/430/1280/1440/1920 Pixel sowie iPhone 17 hoch/quer, jeweils hell/dunkel |
| Sections | Sechs Fälle mit schmalen und breiten Kartencontainern, jeweils hell/dunkel; eine 480-Pixel-Sektion bleibt trotz höherer Maximalbreite schmal |
| Lange Werte und Einheiten | Vier Fälle mit 390/1280/1440/1920 Pixeln erfolgreich; vollständige Zahlen, Einheiten und Statuswerte ohne Überlauf |
| Hauptquellen und Gruppen | Auf 390 und 1440 Pixeln alle sieben ausgewählten Außenquellen in drei Gruppen; freie Umbenennung und Reload; abgewählte Quellen verschwinden aus der Übersicht und bleiben in Details |
| Druck und Icons | Getrennte Druckwerte `1013` und `999` samt tatsächlichen Einheiten und sieben Messart-Symbolen erfolgreich geprüft |
| Kompakte Innenräume | Einfaches Badge bei 2400-Pixel-Szenenbreite unter 180 Pixel breit; alle fünf vorhandenen Messarten untereinander |
| Breitenregler | Unmittelbare Vorschau und Persistenz mit 900/1600/2560/3200/1400 Pixeln bei 3440-Pixel-Viewport erfolgreich |
| Bestehende Bedienung | Live-Zustände, Leer-/Fehlzustände, Garage und Objektziele, Außenortwechsel, Editor, Deckkraft und vollständige Quellenlisten weiterhin erfolgreich |
| `git diff --check` | Erfolgreich |

Der Browserlauf prüft die tatsächlich gebündelte Karte. Alle zehn neuen Screenshots wurden grafisch geöffnet und kontrolliert. Im 1100-Pixel-Sections-Beispiel dockt die Pylontech-Fläche bei der dichten Belegung unter dem Bild an; die Verbindungslinie hält die Zuordnung eindeutig, sämtliche Werte bleiben sichtbar.

## Abgedecktes Verhalten

| Bereich | Nachweis |
| --- | --- |
| Anzeigenformat | Temperatur/relative und absolute Feuchte mit genau einer Nachkommastelle; CO₂/VOC/relativer und absoluter Druck ganzzahlig; lange Werte, negative Zahlen, Null, Locale, fehlende/lange Einheiten und ehrliche Statuswerte |
| Hauptquellen | Mehrere unabhängig wählbare Haupt-Haken je Messart; deaktivierte Quellen und Messarten bleiben in Details erreichbar; kein stiller Fallback bei Ausfall |
| Gruppen | Frei benennbare, messartübergreifende Gruppen innerhalb eines Messorts; getrennte Quellen ohne Gruppennamen unterscheidbar; keine Vermischung verschiedener Orte |
| Kompatibilität | Alte `primary`-Konfigurationen liefern unverändert ihre Hauptquelle; neue Hauptauswahl und Gruppennamen bleiben bei Editoränderungen und Reload erhalten |
| Kompakte Anordnung | Innenräume mit höchstens einer ausgewählten Temperaturquelle auch bei benannten Gruppen vertikal und inhaltsbreit; Außen und Innenräume mit mehreren Temperaturquellen mit eigenen Gruppenzeilen und umbrechenden Werten; keine Kollisionen, abgeschnittenen Einheiten oder `Details`-Platzhalter |
| Symbole | Lokale Icons vor Messwerten und Raumnamen; schwarze transparente Gestaltung mit deckenden Texten und Icons |
| Garage und Außen | Vier unabhängige Garagenmessorte mit Objektzuordnung; mehrere Außenmessorte und alle ausgewählten Quellen in Bild und großen Kacheln |
| Größe | Breitenregler 900–3200 mit sofortiger Vorschau und Persistenz; breites Desktop-Panel nutzt mehr als 1600 Pixel; schmale Container und Sections begrenzen die tatsächliche Breite |
| Responsive | Panel 1280/1440/1920 sowie breiter Desktop, schmale/breite Sections, Mobil 360/390/430 und iPhone-17-Hoch-/Querformat, jeweils hell/dunkel |
| Bildintegrität | Identischer SHA-256 der Quelldatei und Bundle-Daten; leerer Asset-Diff |
| Automatisierung | Alle bisherigen Checks bleiben erhalten; Chromium-Browserprüfungen sind weiterhin verbindlich in der normalen PR-CI |

## Screenshots und Reproduktion

Zehn neue Aufnahmen der tatsächlich gebündelten Umsetzung liegen unter `docs/screenshots/adaptive-groups/` und sind im [Screenshot-Verzeichnis](screenshots/README.md) verlinkt: Panel, Sections und iPhone hoch/quer jeweils hell/dunkel, mobiler Editor und zusätzlich ein breites Desktop-Panel mit 2560-Pixel-Szene. Entwicklungssensoren und Werte sind ausdrücklich **DEMO-WERTE**, keine echten HA-Daten. Historische Screenshots bleiben als solche gekennzeichnet.

```sh
npm ci
npm run check
npm test
node --test scripts/next-version.test.mjs
npm run build
UPDATE_SCREENSHOTS=1 npm run test:browser
sha256sum src/assets/hausklima-cutaway.webp
git show e440ce1:src/assets/hausklima-cutaway.webp | sha256sum
git diff e440ce1 -- src/assets/hausklima-cutaway.webp
```

Die normale PR-CI prüft Typen, Unit-Tests, die Release-Regeltests, Build und Übereinstimmung des eingecheckten Bundles mit den Quellen. Sie installiert Chromium einschließlich Systemabhängigkeiten und führt `npm run test:browser` verbindlich aus. Fehler werden nicht mit `continue-on-error` übergangen. `SKIP_WEBKIT=1` hält die obligatorische Chromium-Prüfung unabhängig von einer zusätzlich verfügbaren WebKit-Engine. Lokale Resultate und GitHub-Actions-Ergebnisse werden getrennt angegeben.

## Integrationsgrenzen

Die lokale Browserprüfung verwendet die gebündelte Karte in der getrennten Entwicklungsvorschau. Deren Nachbildung des nativen HA-Selector-Vertrags ersetzt keinen Test in einer echten HA-/HACS-Installation. Chromium-iPhone-Emulation ist kein Test auf einem physischen iPhone und keine Safari-Prüfung.

WebKit konnte auch beim aktuellen Lauf wegen des fehlenden Browser-Binarys nicht starten und wurde entsprechend als nicht verfügbar gemeldet. Frühere offizielle Downloads scheiterten an der Netzwerkpolicy der Arbeitsumgebung mit HTTP 403. Die erfolgreiche Chromium-Prüfung ist davon getrennt; eine fehlende Engine ist kein bestandener Safari-/WebKit-Test.

Technische Prüfungen ersetzen nicht die visuelle Abnahme des Projektinhabers. Es wird nichts in Home Assistant ausgerollt. Nach einem genehmigten Merge übernimmt der vorhandene Release-Workflow die Versionsvergabe.
