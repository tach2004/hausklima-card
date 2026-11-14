# Validierung – Overlay-Auftrag v0.1.2

Prüfstand vom 14. November 2026. Diese Überarbeitung folgt [docs/tasks/v0.1.2-overlays.md](tasks/v0.1.2-overlays.md) auf dem vorhandenen Branch `docs/task-v012-overlays` und aktualisiert ausschließlich den bestehenden PR #6. Ein neuer Pull Request oder ein Release wird nicht erstellt; der Merge bleibt beim Projektinhaber.

## Ausgangslage und Abnahme

Die freigegebene Hausillustration bleibt bitidentisch. Überarbeitet werden nur die dynamischen Overlays, ihre Anordnung, die zentrale Sensoranzeige und die konfigurierbare maximale Ansichtsbreite. Frühere primitive SVG-Zeichnungen und deren Screenshots sind keine Stilreferenz.

Ausgangspunkt ist Aufgabencommit `f243f31`. SHA-256 der Bilddatei vor Beginn:

```text
fc840fd3cdd7ec1ecbae75a475c14674eafa28e99d7c43888ce6ffef7cbbef98
```

Hash und Git-Diff wurden ausdrücklich mit diesem Stand verglichen: Das WebP ist **bitidentisch**, und der Diff für die Bilddatei ist leer.

## Ausgeführte lokale Prüfungen

| Prüfung | Ergebnis |
| --- | --- |
| `npm ci` | Installation aus dem Lockfile erfolgreich |
| `npm run check` | TypeScript-Prüfung erfolgreich |
| `npm test` | **126 Tests in sieben Dateien erfolgreich** |
| `node --test scripts/next-version.test.mjs` | **Fünf Release-Regeltests erfolgreich** |
| `npm run build` | Eigenständiges HACS-Bundle einschließlich der unveränderten Illustration erfolgreich gebaut |
| Bildintegrität gegen `f243f31` | Gleicher SHA-256, leerer Asset-Diff; auch das im Bundle eingebettete WebP hat denselben Hash |
| `UPDATE_SCREENSHOTS=1 npm run test:browser` | Finaler Chromium-Lauf vollständig erfolgreich; neun neue Screenshots erzeugt und grafisch geprüft |
| Responsive Ansichten | 16 Viewport-/Theme-Fälle erfolgreich, inklusive der geforderten Panel- und mobilen Breiten sowie iPhone-17-Hoch-/Querformat |
| Sections | Sechs Fälle mit schmalen und breiten Kartencontainern, jeweils hell/dunkel, erfolgreich |
| Lange Werte und Einheiten | Vier zusätzliche Browserfälle erfolgreich; vollständige Einheiten, eine Nachkommastelle, kein Wert-Ersatz durch `Details` und kein Überlauf |
| Zustände und Bedienung | Live-Updates, Leerzustände, fünf Messarten, vier unabhängige Garagen-Overlays samt Objekt-Touch-Zielen, zwei getrennte Außenmessorte und vollständige Details erfolgreich |
| GUI und Persistenz | Deckkraft, Breite 900/1400/1600, Haupt-/Nebensensoren und vorhandene Konfiguration nach Neuladen erfolgreich geprüft |
| Anordnung | Vollständige Messwertflächen ohne Kollisionen; drei normale Gerätepanels im Garagenvorplatz mit kurzen Zuordnungslinien |
| `git diff --check` | Erfolgreich |

Die abschließenden Prüfungen wurden nach dem letzten Layoutabgleich auf dem tatsächlich gebauten Bundle ausgeführt. Es gab keine JavaScript-Seitenfehler oder externen Laufzeitanfragen. Die Prüfung bestätigt sowohl die ursprünglichen Bildbytes als auch dieselben Bytes im ausgelieferten JavaScript-Bundle. Text und Symbole bleiben deckend; nur die Hintergründe verwenden die einstellbare Transparenz.

## Vorher-/Nachher-Vergleich

| Bestätigter Stand v0.1.1 | Überarbeitung v0.1.2 |
| --- | --- |
| Sensoranzeige mit bis zu 20 Nachkommastellen, etwa `16,8000011444092 °C` | Einheitlich eine angezeigte Nachkommastelle, etwa `16,8 °C`; Rohzustand unverändert |
| Ab mehr als neun Zeichen ersetzte `conciseValue` den Wert durch `Details`; lange Einheiten fehlten | Vollständiger formatierter Wert und HA-Einheit mit Umbruch und kollisionsfreier Zuordnung |
| Nur Garagenluft als Bild-Overlay, Gerätewerte nur in unteren Kacheln | Vier eigenständige Objektzuordnungen und Messwertflächen für Luft, Schrank und beide Batterien |
| Außenmesswerte ausschließlich unterhalb des Bildes | Zusätzlich eigener Bereich oberhalb der Garage mit klarer Auswahl mehrerer Orte |
| Starre Maximalbreite 1180 CSS-Pixel | Standard 1400, visueller Regler 900–1600; tatsächliche Breite bleibt durch Container/Grid begrenzt |
| Browserprüfungen nur manuell | Verbindlicher Chromium-Prüfschritt in normaler PR-CI, bestehende Checks bleiben erhalten |

## Abgedeckte Prüfmatrix

| Bereich | Abgedeckter Nachweis |
| --- | --- |
| Installation, Typen, Unit-Tests und Bundle | `npm ci`, `npm run check`, `npm test`, `npm run build` |
| Einheitliche Sensoranzeige | Genau eine Nachkommastelle für lange Dezimalwerte, ganze/negative Zahlen und Null; HA-Zahlenformate; keine Änderung der Rohdaten |
| Ehrliche Quellen | Nicht-numerische Zustände, fehlend, `unknown`, `unavailable`, lange/fehlende Einheiten und Haupt-/Nebensensoren |
| Raum-Overlays | Alle fünf Messarten, kein `Details`-Wert-Ersatz, keine leeren dunklen Kästen, funktionsfähige Raumdetails und HA-More-Info |
| Garage und Außen | Garagenluft, Schaltschrank, Pylontech und LiTime separat; mehrere Außenmessorte und Quellen ohne Vermischung |
| Konfiguration | Breitenregler 900–1600, sofortige Vorschau, Deckkraft und vollständige JSON-Persistenz inklusive bestehender Zuordnungen/Migrationsmarker |
| Desktop | Panel 1280/1440/1920 CSS-Pixel; schmale und breite Sections-Container, jeweils hell/dunkel |
| Mobil | 360/390/430 CSS-Pixel sowie iPhone-17-Hoch-/Querformat in Browseremulation, jeweils hell/dunkel |
| Bildintegrität | Identischer SHA-256 und leerer Diff für `src/assets/hausklima-cutaway.webp` |
| Automatisierung | Normale PR-CI führt Chromium-Browserprüfungen verbindlich aus; bestehende Typ-, Unit- und Buildchecks bleiben erhalten |

## Screenshots der tatsächlichen Karte

Die neun [neuen Screenshots](screenshots/README.md) wurden aus dem tatsächlich gebauten Bundle erzeugt und alle grafisch geöffnet: Desktop Panel, Desktop Sections und iPhone-Hoch-/Querformat jeweils mit hellem/dunklem Theme sowie der mobile Editor. Testdaten sind ausdrücklich als **DEMO-WERTE** markiert und nicht in der installierten Karte vorgegeben. Alte Aufnahmen werden nicht als neuer Nachweis ausgegeben.

## Reproduktion

```sh
npm ci
npm run check
npm test
node --test scripts/next-version.test.mjs
npm run build
UPDATE_SCREENSHOTS=1 npm run test:browser
sha256sum src/assets/hausklima-cutaway.webp
git show f243f31:src/assets/hausklima-cutaway.webp | sha256sum
git diff f243f31 -- src/assets/hausklima-cutaway.webp
```

Die normale PR-CI enthält weiterhin Typprüfung, Unit-Tests, die fünf Release-Regeltests, Build und den Vergleich des eingecheckten Bundles mit den Quellen. Sie installiert Chromium mit seinen Systemabhängigkeiten und führt `npm run test:browser` verbindlich aus. Fehler werden nicht mit `continue-on-error` übergangen. Die CI setzt `SKIP_WEBKIT=1`, damit der verpflichtende Chromium-Lauf keine installierte Safari-Engine voraussetzt. Ein erfolgreicher lokaler Lauf ist von einem späteren GitHub-Actions-Ergebnis zu unterscheiden.

## Integrationsgrenzen

Lokale Browserprüfungen laufen auf der gebündelten Karte in der getrennten Entwicklungsvorschau. Die Vorschau bildet den nativen HA-Selector-Vertrag nach; sie ersetzt keinen Test in einer echten HA-/HACS-Installation. Auch Chromium-iPhone-Emulation ist kein Test auf einem physischen iPhone und keine Safari-/WebKit-Prüfung.

WebKit ist in der Arbeitsumgebung nicht installiert; der aktuelle Aufruf konnte deshalb keine WebKit-Engine starten. In früheren Durchläufen wurde der Installationsversuch von der Netzwerkpolicy für die offiziellen Playwright-CDNs mit HTTP 403 abgewiesen. Weder der fehlgeschlagene Start noch der frühere Downloadversuch ist ein Safari-/WebKit-Test. Die Chromium-Prüfung und deren iPhone-Emulation sind hiervon klar getrennt.

Es wird nichts in Home Assistant ausgerollt und kein Release manuell gestartet. Nach einem vom Projektinhaber genehmigten Merge übernimmt der vorhandene Release-Workflow die Versionsvergabe. Offene reale Gebäudemaße werden durch diese Overlay-Arbeiten nicht geklärt oder ergänzt. Technische Tests ersetzen keine visuelle Abnahme.
