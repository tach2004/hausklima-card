# Validierung – Phase 2

Prüfstand vom 14. November 2026. Die Phase-2-Implementierung wird gegen den aktuellen `main` mit der freigegebenen [Aufgabenbeschreibung](tasks/phase-2.md) und den [Designreferenzen](design/README.md) geprüft. Dieser Bericht unterscheidet ausgeführte Tests und verbleibende Integrationsprüfungen.

## Automatisierte Prüfungen

Alle folgenden lokalen Prüfungen wurden erfolgreich auf dem Feature-Branch `feat/phase-2` ausgeführt, ausgehend von `main` (`53b9a1b`):

| Prüfung | Ergebnis |
| --- | --- |
| `npm ci` | Installation aus dem Lockfile erfolgreich |
| `npm run check` | TypeScript-Prüfung ohne Fehler |
| `npm test` | 82 erfolgreiche Tests in sechs Dateien |
| `npm run build` | Eigenständiges ES-Modul, 85.074 Bytes inklusive Lit und Lizenzhinweisen |
| `UPDATE_SCREENSHOTS=1 npm run test:browser` | Vollständig erfolgreich in Chromium; acht tatsächliche Screenshots erzeugt |
| Responsive Browsermatrix | 16 Fälle: sechs Breiten plus iPhone-17-Hoch-/Querformat, jeweils hell/dunkel |
| Sections | Schmaler Kartencontainer bei 360, 480 und 1440 CSS-Pixeln Browserbreite erfolgreich |
| Quellen und Zustand | Live-Updates, Hauptsensor, mehrere Quellen, fehlend/`unknown`/`unavailable`, Entitätsdetails und ehrliche Leerzustände erfolgreich |
| Grafischer Editor | Sensorwahl, Alias, Hauptsensor, Sichtbarkeit, zusätzliche Räume/Außenmessorte, sichere Löschung, Duplikatprüfung und JSON-Neuladen erfolgreich |
| Lange Werte/Einheiten | Bei 390 und 1440 Pixeln ohne überstehende SVG-Werttexte; exakte Quellenpräzision und Originaleinheit in Details erhalten |
| `git diff --check` | Keine Whitespace-Fehler |

Die Modell-, Karten-, Szenen- und Editortests prüfen zusätzlich unveränderte bekannte Maße und IDs, vollständige Quellenlisten auch ausgeblendeter Messarten, unbekannte Konfigurationsfelder, Keyboardbedienung und den nativen Selector-Ladevertrag. Eine eigene Regression stellt sicher, dass ein abgelehnter Entity-Duplikatwechsel nicht als falsche Auswahl im Picker stehen bleibt.

Die Browsermatrix prüft alle elf Messorte der getrennten DEMO-WERTE-Konfiguration samt allen zugeordneten Quellen per Maus beziehungsweise Touch. Es gab keine JavaScript-Seitenfehler oder externen Laufzeitanfragen. Haus und Garage sind vollständig horizontal sichtbar, Raumkarten laufen nicht über, Messwertfelder überlagern sich nicht. Mobile Raumnummern sind sichtbar, stimmen mit den Raumkarten überein und behalten mindestens 11,5 CSS-Pixel tatsächliche Schriftgröße. Text, Werte und Symbole bleiben deckend; nur die Hintergründe der Messwertfelder sind transparent.

Die Beispielkonfigurationen wurden bereits erfolgreich als YAML eingelesen. Das Panel-Beispiel enthält genau eine `custom:hausklima-card`; die Sections-Datei enthält ein gültiges Ansichtsobjekt. Alle Installationsbeispiele kommen ohne erfundene Sensor-Entity-IDs aus.

## Nachweis der tatsächlichen Umsetzung

Die acht [Screenshots](screenshots/README.md) wurden aus dem tatsächlich gebauten JavaScript und der getrennten lokalen Vorschau erzeugt. Sie sind keine Aufnahmen der Design-Mockups. Die Entwicklungsdaten sind ausdrücklich als **DEMO-WERTE** gekennzeichnet und nicht in den Produktionsvorgaben enthalten.

Die verpflichtende Chromium-Matrix umfasst 360, 390, 430, 768, 1280 und 1440 CSS-Pixel Breite mit hellem und dunklem Theme sowie einen schmalen Sections-Container. Hinzu kommt Chromium-Geräteemulation mit dem tatsächlich verfügbaren Playwright-Profil **iPhone 17**: Hochformat 402 × 681 und Querformat 756 × 352 CSS-Pixel, mit Mobile-/Touch-Eigenschaften und dem Profil-User-Agent. Für reproduzierbare Screenshots wird der Device-Scale-Factor auf 1 gesetzt. Alle genannten Chromium-Fälle wurden erfolgreich ausgeführt. Desktop- sowie mobile Ansichten in hell/dunkel wurden zusätzlich grafisch kontrolliert.

## Reproduzierbare Prüfungen

```sh
npm ci
npm run check
npm test
npm run build
npm run test:browser
```

CI und Release-Workflow prüfen zusätzlich mit `git diff --exit-code -- dist`, ob das eingecheckte Bundle den aktuellen Quellen entspricht.

## Grenzen und gezielt versuchte Prüfungen

**WebKit/Safari wurde nicht ausgeführt.** Das WebKit-Binary war in der Umgebung nicht installiert. Der anschließende Installationsversuch über Playwright scheiterte an der Netzwerkrichtlinie: Die offiziellen Download-Domains `cdn.playwright.dev` und `playwright.download.prss.microsoft.com` wurden mit HTTP 403 (`Domain forbidden`) abgewiesen. Chromium-Geräteemulation ersetzt diese Engine-Prüfung nicht.

**Kein Test auf echtem iPhone und keine echte Home-Assistant-/HACS-Installation.** Die lokale Vorschau prüft die Karte, gespeicherte JSON-Konfigurationen, wechselnde HA-Zustände und den Komponentenvertrag des grafischen Editors. Ihr Entity-Selector ist eine getrennte Testnachbildung; sie weist keine Ausführung des echten Home-Assistant-Karteneditors nach. Der native Selector-Vertrag wurde anhand der offiziellen Frontend-Quellen abgesichert. Der Installationstest in Home Assistant, reale Safari-Darstellung und die Bedienung auf einem physischen iPhone bleiben zusätzliche Integrationsprüfungen.

Für HACS muss dieser Stand nach Freigabe über den Standardbranch oder ein Release verfügbar sein. Es wurde kein Release veröffentlicht und keine Änderung in die Home-Assistant-Installation des Projektinhabers ausgerollt. Die Repository-Beschreibung und Topics sind inzwischen vorhanden; der frühere Metadaten-Offenpunkt aus Phase 1 besteht nicht mehr.

Offene Maße bleiben ungeklärt. Erfolgreiche Tests bestätigen die Konfigurations- und Darstellungslogik, keine bauliche Genauigkeit. Die visuelle Abnahme und der Merge verbleiben beim Projektinhaber.
