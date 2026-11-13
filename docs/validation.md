# Validierung – Phase 1

Prüfstand vom 13. November 2026, Phase 1. Die folgenden lokalen Prüfungen wurden erfolgreich ausgeführt:

| Prüfung | Ergebnis |
| --- | --- |
| `npm ci` | Installation aus dem Lockfile erfolgreich |
| `npm run check` | TypeScript-Prüfung ohne Fehler |
| `npm test` | 43 erfolgreiche Tests in 4 Dateien |
| `npm run build` | Eigenständiges ES-Modul `dist/hausklima-card.js`, 45.791 Bytes einschließlich Lit und Lizenzhinweisen |
| `npm run test:browser` | Erfolgreich in Chromium bei 1280, 820 und 390 Pixeln Breite |
| `git diff --check` | Keine Whitespace-Fehler |
| GitHub Actions CI | Push- und Pull-Request-Prüfung für Implementierungscommit `8c62dae` erfolgreich ([CI-Lauf](https://github.com/tach2004/hausklima-card/actions/runs/43459882131)) |
| Workflow- und Beispieldateien | YAML erfolgreich eingelesen; Shell-Syntax der Workflow-Kommandos geprüft |

## Funktionsumfang der Prüfungen

Die Modelltests prüfen die unveränderten vorgegebenen Maße, unabhängige Konfigurationskopien, eindeutige IDs und gültige Referenzen, zusätzliche Räume und Raumebenen sowie Haupt- und weitere Sensoren. Fehlende, unbekannte und nicht verfügbare Sensoren bleiben unterscheidbar; unkonfigurierte und ausgeblendete Messarten erzeugen keine Platzhalter. VOC behält die Sensoreinheit, und es findet keine Feuchtigkeitsberechnung statt.

Die Karten- und Editortests prüfen Registrierung, Basiskonfiguration, grafischen Editor, `config-changed`, Raumwahl per Maus und Tastatur, weitere Räume, dynamische `hass`-Aktualisierungen sowie die Basisoptionen. Layouttests prüfen die nicht korrigierten Raumbreiten, offene Restbreiten, den freistehenden Garagenabstand und unbekannte beziehungsweise nicht passende Räume ohne erfundene Positionen.

Der Chromium-Test prüft Desktop, Tablet und Smartphone jeweils mit hellem und dunklem Theme. Geprüft werden SVG, Tastaturauswahl, Editoränderungen, fehlende und anschließend verfügbare Sensorzustände, ein fehlender weiterer Sensor und das Home-Assistant-Ereignis `hass-more-info`. Es traten keine JavaScript-Seitenfehler oder externen Laufzeitanfragen auf. Auf dem Smartphone scrollt nur der Zeichenbereich horizontal; die Seite selbst läuft nicht über. Screenshots wurden erstellt; Desktop hell und Smartphone dunkel wurden zusätzlich visuell geprüft.

## Reproduzierbare Prüfungen

```sh
npm ci
npm run check
npm test
npm run build
```

CI und Release-Workflow prüfen zusätzlich mit `git diff --exit-code -- dist`, ob das eingecheckte Bundle zum Quellcode passt.

## Grenzen

Eine lokale Vorschau und automatisierte DOM-/Browsertests prüfen die Karte und den Editor unabhängig von einer vollständigen Home-Assistant-Installation. Eine echte Home-Assistant- oder HACS-Installation wurde in dieser Umgebung nicht geprüft. Der HACS-Download dieses Entwicklungsstands setzt seine Verfügbarkeit im öffentlich zugänglichen Standardbranch oder in einem Release voraus. Die noch fehlende GitHub-Beschreibung und Topics müssen in den Repository-Einstellungen ergänzt werden; die verbundene Integration durfte diese Einstellung nicht schreiben (HTTP 403).

Die GitHub-CI hat Typprüfung, alle 43 Tests, Build und den Abgleich mit dem eingecheckten Bundle erfolgreich ausgeführt. Der Release-Workflow wurde auf YAML- und Shell-Syntax geprüft; die Veröffentlichung eines Release-Assets wurde nicht ausgeführt. Es wurde für Phase 1 kein Release veröffentlicht.

Offene Maße bleiben ungeklärt; Build und Tests bestätigen keine bauliche Genauigkeit.
