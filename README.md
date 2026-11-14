# HausKlima Card

Eine eigenständige Home-Assistant-Karte für eine räumliche Hausklimaübersicht: eine lokal gebündelte, hochwertige Architekturillustration mit dunklen, leicht transparenten Messwertfeldern, freistehender Garage und einer eigenen Übersicht für Außenmessorte und weitere Räume. TypeScript und Lit; ohne Cloudzugriff, externe Schriftarten oder Abhängigkeit von anderen Custom Cards.

**Stand: adaptive Messwertfelder und Sensorgruppen auf Basis von v0.1.2.** Räume und Sensoren lassen sich im grafischen Lovelace-Karteneditor einrichten. Sieben optionale Messarten sind verfügbar: Temperatur, relative und absolute Luftfeuchtigkeit, CO₂, VOC sowie relativer und absoluter Luftdruck. Mehrere ausgewählte Quellen können gemeinsam in der Übersicht erscheinen; Raumdetails zeigen sämtliche zugeordneten Quellen. Die installierte Karte enthält keine erfundenen Sensoren oder Messwerte.

## Installation

### Mit HACS

1. In HACS unter **Benutzerdefinierte Repositories** `https://github.com/tach2004/hausklima-card` hinzufügen; Typ **Dashboard** wählen.
2. **HausKlima Card** herunterladen.
3. Unter **Einstellungen → Dashboards → Ressourcen** prüfen, ob `/hacsfiles/hausklima-card/hausklima-card.js` als **JavaScript-Modul** eingetragen ist; andernfalls hinzufügen.
4. Die Browserseite neu laden und **HausKlima Card** im Dashboard hinzufügen.

HACS lädt den verfügbaren Stand des Standardbranches beziehungsweise eines Releases. Änderungen eines offenen Pull Requests werden dadurch noch nicht installiert. Das Repository ist für die Installation als benutzerdefiniertes HACS-Repository eingerichtet; die Aufnahme in den HACS-Standardkatalog ist ein separater Vorgang. Siehe die [offiziellen Dashboard-Anforderungen](https://www.hacs.xyz/docs/publish/plugin/).

### Manuell

1. `dist/hausklima-card.js` aus dem gewünschten Repository-Stand oder `hausklima-card.js` aus einem Release herunterladen.
2. Als `<HA-Konfigurationsverzeichnis>/www/hausklima-card.js` ablegen. Wurde `www` neu angelegt, Home Assistant einmal neu starten.
3. Die Ressource `/local/hausklima-card.js` als **JavaScript-Modul** registrieren und den Browser neu laden.

Die [Home-Assistant-Dokumentation zur Ressourcenregistrierung](https://contributors.home-assistant.io/frontend/custom-ui/resources/) beschreibt auch die Verwaltung über YAML. Nach Aktualisierungen kann eine Versionskennung in der Ressourcen-URL den Browsercache erneuern.

## Einrichtung im grafischen Editor

Empfohlen ist eine eigene **Panel-Ansicht mit genau einer HausKlima Card**. So erhält die Hausgrafik am Desktop ausreichend Platz. Die Karte passt sich auch schmalen Sections-Karten an. [Ansichten einrichten](examples/views/README.md)

1. Im bearbeitbaren Dashboard eine Panel-Ansicht anlegen und die Karte **HausKlima Card** hinzufügen.
2. Im grafischen Karteneditor unter **Raum auswählen** einen vorhandenen Raum wählen, etwa Wohnzimmer, Werkstatt oder Garage.
3. Unter **Messart** Temperatur, relative Feuchte, absolute Feuchte, CO₂, VOC, relativen oder absoluten Luftdruck wählen. Druckwerte werden aus getrennten HA-Entitäten gelesen, nicht ineinander umgerechnet.
4. Die gewünschte HA-Entität über **Sensor auswählen** beziehungsweise **Weiteren Sensor auswählen** zuordnen. Weitere Sensoren derselben Messart können ergänzt, benannt und entfernt werden. Mit **Haupt – in Übersicht** wählst du einzeln aus, welche Quellen direkt am Messort erscheinen. Mehrere Haken sind möglich. Im optionalen Feld **Gruppe in der Übersicht** lassen sich beispielsweise Temperatur und Feuchte von **Homematic** in einer Zeile und **Ecowitt** in einer weiteren Zeile unter **Außen** bündeln. Verwende dafür bei den zugehörigen Sensoren denselben Gruppennamen. Das funktioniert auch für Innenräume und Geräte. Die bisherige Hauptsensorwahl heißt nun **Standardquelle**; ohne explizite Haupt-Haken bleibt ihre Anzeige erhalten. Ein gesetzter oder entfernter Haupt-Haken überschreibt für diese Quelle die Standardauswahl.
5. Im Abschnitt **Darstellung** kannst du die Deckkraft der dunklen Messwert-Kästchen stufenlos zwischen 35 und 100 % einstellen (Standard 72 %). Nur der Hintergrund wird transparenter, nicht der Text. Der zusätzliche Breitenregler **Maximale Breite der Gebäudeansicht** verändert die Vorschau unmittelbar und wird zusammen mit der Deckkraft gespeichert. Die Schalter **Messart in Übersichten aktiv** und **Hauptwert im Raum anzeigen** nach Bedarf einstellen. Alle konfigurierten Messarten erscheinen standardmäßig in der Übersicht, sofern sie nicht ausdrücklich mit **Hauptwert im Raum anzeigen** ausgeblendet werden. Ausgeblendete Zuordnungen bleiben in den Raumdetails erreichbar.
6. Bei Bedarf **Raum oder Außenmessort hinzufügen** öffnen, Art, Name und für Innenräume die Gebäudeebene wählen; dann **Messort hinzufügen** betätigen. Zusätzliche Räume erhalten keine erfundene Position im Gebäude und bleiben über die Raumübersicht erreichbar. Die Garage ist bereits ein eigener Messort und wird über die vorhandene Raumwahl eingerichtet.
7. Zum Löschen eines Messorts **Raum entfernen** wählen und die Nachfrage mit **Entfernen bestätigen** bestätigen; **Abbrechen** erhält ihn. Anschließend Änderungen im Dashboard speichern. Zuordnungen, Anzeigenamen und Hauptsensorwahl gehören zur Kartenkonfiguration und bleiben nach erneutem Laden erhalten.

Auf einen Raum in der Grafik oder in der Raumübersicht tippen beziehungsweise klicken, um seine Details zu öffnen. Dort sind alle zugeordneten Sensoren mit Anzeigename, Entity-ID, Hauptsensor-Kennzeichnung, Status, Wert und tatsächlicher Einheit aufgeführt. Die Auswahl einer Quelle öffnet Home Assistants übliche Entitätsdetails. Die Raumwahl funktioniert auch per Tastatur.

Nicht konfigurierte Messarten erzeugen keine leeren Werte. Eine konfigurierte fehlende Entität, `unknown` und `unavailable` bleiben als unterscheidbare Zustände sichtbar. Fällt eine ausgewählte Quelle aus, wird sie entsprechend gekennzeichnet; die Karte ersetzt sie nicht stillschweigend durch eine andere Quelle. **Temperatur sowie relative und absolute Luftfeuchte haben genau eine Nachkommastelle**, etwa `16.8000011444092 → 16,8` und `5 → 5,0`. **CO₂, VOC und beide Luftdruckarten werden als ganze Zahlen angezeigt**, etwa `745 → 745`. Das HA-Zahlenformat gilt für Übersicht und Details gleichermaßen. Nur die Anzeige wird gerundet; HA-Zustände und gespeicherte Daten bleiben unverändert. Nicht-numerische Werte bleiben Text. Baumaße, Entity-IDs und Versionen fallen nicht unter diese Regel. Es werden keine Einheiten umgerechnet oder gekürzt und keine absoluten Feuchte- oder Druckwerte berechnet.

## Darstellung auf Desktop und Smartphone

Die Hauptansicht verwendet die freigegebene, unveränderte lokale Architekturillustration `src/assets/hausklima-cutaway.webp`. Räume, Möbel, Materialeffekte und perspektivische Tiefe sind dekorativ, keine bestätigte Ausstattung oder baulich genaue Konstruktion. Nur dynamische HTML-/CSS-Overlays mit tatsächlichen HA-Werten liegen über dem Bild. Das vollständige Bild wird proportional skaliert und weder zugeschnitten noch verzerrt.

Auf breiten Karten stehen Haus und freistehende Garage vollständig im sichtbaren Bereich. Bei weniger Platz wird die Anordnung umgebaut: eine kompakte Gebäudeansicht dient der Raumauswahl, große Raumkarten und Details zeigen die lesbaren Werte darunter. Garage, Außenmessorte und verdeckte Räume bleiben erreichbar. Es ist keine andere YAML-Konfiguration für das Smartphone nötig; eine erzwungene horizontale Bildlaufleiste entfällt.

Die dunklen Messwertfelder passen ihre Breite an Namen, Werte und Einheiten an. Innenräume mit höchstens einer ausgewählten Temperaturquelle bleiben schmal: ihre Messarten stehen untereinander, auch wenn ein Gruppenname gesetzt ist. Außen und bei mehreren ausgewählten Temperaturquellen im Innenraum erhalten benannte Sensorgruppen je eine Unterzeile mit nebeneinander angeordneten, bei Bedarf umbrechenden Werten. Symbole kennzeichnen Messarten sowie Räume und Geräte; die schwarze Gestaltung bleibt erhalten. Nur die Hintergründe haben die konfigurierbare Transparenz (standardmäßig 72 % Deckkraft), Beschriftungen, Werte und Symbole bleiben deckend. **Ohne konfigurierte Hauptwerte erscheint kein schwarzer Kasten**, nur der Raumname als unaufdringliche Beschriftung bzw. der Raum bleibt über die Raumübersicht auswählbar. Light- und Dark-Theme werden unterstützt. Lange Werte und Einheiten werden umgebrochen; die Anordnung misst die tatsächliche Größe bei Zustands- und Breitenänderungen. Passt eine Messwertfläche nicht kollisionsfrei an ihren Bild-Anker, dockt dieselbe vollständige Fläche im erweiterten Bildbereich unter der unveränderten Illustration an. Verbindungslinien und eigene Touch-Ziele an den Objekten erhalten die eindeutige Zuordnung. Werte werden nie durch einen `Details`-Platzhalter ersetzt. Bei Kartenbreiten bis 1000 CSS-Pixeln werden zu kleine Bild-Badges und Verbindungslinien ausgeblendet; die darunterliegenden Raum-, Außen- und Gerätekarten zeigen dann automatisch alle ausgewählten Hauptquellen ohne Zusatzklick.

[Tatsächliche Desktop- und Mobile-Screenshots](docs/screenshots/README.md) zeigen die implementierte Karte. Werte in diesen Entwicklungsscreenshots sind ausdrücklich **DEMO-WERTE** aus getrennten Testdaten; sie sind kein Bestandteil der Produktionsvorgaben und keine echten HA-Messungen.

## Optionale YAML-Konfiguration

Der grafische Editor ist der normale Einrichtungsweg. Diese minimale **Kartenkonfiguration** funktioniert ohne Sensoren:

```yaml
type: custom:hausklima-card
title: HausKlima
show_dimensions: false
show_room_names: true
```

| Option | Standard | Bedeutung |
| --- | --- | --- |
| `type` | erforderlich | `custom:hausklima-card` |
| `title` | `HausKlima` | Kompakter Kartentitel |
| `show_dimensions` | `true` | Aufklappbare Gebäudedetails mit bekannten Maßen und offenen Punkten anbieten |
| `show_room_names` | `true` | Raumnamen in der Gebäudeansicht anzeigen |
| `chip_opacity` | `0.72` | Deckkraft aller schwarzen Messwertflächen von `0.35` bis `1` (auch im visuellen Editor) |
| `scene_max_width` | `1400` | Maximale Breite der vollständigen Gebäudeansicht in CSS-Pixeln, gültig von `900` bis `3200` |
| `building` | Vorgabegebäude | Gebäudemodell einschließlich der im Editor gespeicherten Raum- und Sensorzuordnungen |

Ältere Phase-1-Konfigurationen bleiben gültig. Die bekannten Gebäude- und Raumvorgaben mit ihren stabilen IDs bleiben erhalten. Die [minimale Karten-YAML](examples/basic.yaml) enthält keine Sensor-Entity-IDs. Die Beispiele [Panel](examples/views/panel.yaml) und [Sections](examples/views/sections.yaml) sind dagegen jeweils **ein Ansichtsobjekt**: in den YAML-Editor einer Ansicht oder als eingerücktes Listenelement unter `views:` einfügen, nicht in den Karten-YAML-Editor und nicht als vollständiges Dashboard. HACS legt keine Dashboard-Ansicht automatisch an.

## Gebäude und offene Maße

Die lichte Raumfolge und sämtliche bestätigten Maße bleiben unverändert. Die verbleibenden Breiten bis 12 m werden nicht als neue Räume ausgegeben und nicht stillschweigend durch angepasste Raum- oder Wandmaße aufgefüllt. Wandzuordnung, Dachneigung, Deckendicken und endgültige Schnittgeometrie sind weiterhin offen. Die Garage steht schematisch rechts mit ungefähr 5 m Abstand und hat keine bauliche Verbindung zum Haus. [Architektur und Maßprüfung](docs/architecture.md)


## Unverändertes Hausbild und getrennte Garagen-Klimamessstellen

Die **freigegebene lokale Hausillustration** `src/assets/hausklima-cutaway.webp` wird unverändert zusammen mit dem Kartencode ausgeliefert. Über der Illustration zeigt die Karte **dynamische, leicht transparente Messwert-Panels** aus den tatsächlich konfigurierten Home-Assistant-Sensoren. Die Illustration enthält **keine** vorgegebenen Sensorwerte. Möbel, Fenster und Dachdetails sind gestalterisch, nicht als maßstäbliche reale Hauseigenschaften zu verstehen.

Für die Garage gibt es nun vier unabhängige Messorte im visuellen Editor:

- **Garage** – allgemeine Raumluft der Garage
- **Pylontech** – erste Batterie
- **LiTime** – zweite Batterie
- **Schaltschrank** – elektrische Ausrüstung

Jeder Messort unterstützt die sieben optionalen Messarten. **Nur tatsächlich zugewiesene Messwerte** werden angezeigt. Garage, Schaltschrank und beide Batterien haben jeweils eigene, zu den sichtbaren Objekten zugeordnete Messwertflächen und Touch-Ziele auf beziehungsweise am Bild. Bei Platzmangel halten versetzte oder angedockte Karten die Werte getrennt lesbar. Die Gerätekarten darunter bleiben eine zusätzliche Bedienmöglichkeit. Unkonfigurierte Einträge bleiben neutral; es erscheinen keine leeren schwarzen Kästchen. Die angezeigten Namen sind über den GUI-Editor änderbar, ebenso können mehrere Sensoren einer Messart zugeordnet und in der Hauptanzeige gruppiert werden. Die neuen Messorte werden einmalig zu älteren gespeicherten Konfigurationen hinzugefügt, ohne deren vorhandene Sensor-Entity-IDs zu ersetzen.

Die Architekturillustration ist auf Desktop/Panel zentriert und standardmäßig **maximal 1400 CSS-Pixel breit**. Im grafischen Editor bestimmt **Maximale Breite der Gebäudeansicht** (`scene_max_width`) die Obergrenze zwischen **900 und 3200 Pixeln in Zehnerschritten**, mit sofortiger Vorschau. Damit kann ein großer Desktop-Panel mehr als 1600 Pixel nutzen. Der Wert ist eine Obergrenze: Auf kleineren Geräten passt sich die Karte automatisch dem verfügbaren Platz an. Auf iPhone 17 (Hoch-/Querformat) wird dieselbe vollständige Gesamtansicht zur Orientierung verwendet; darunter sind die ausgewählten Hauptquellen in großen Raum-/Gerätekarten unmittelbar lesbar. Eine zweite YAML-Konfiguration fürs iPhone ist nicht nötig.

In **Sections** bleibt die vom Home-Assistant-Grid bereitgestellte Breite maßgeblich. Eine größere Obergrenze macht eine schmale Sektion nicht automatisch breiter. Bei Bedarf Karte über `grid_options: { columns: full, rows: auto }` auf volle verfügbare Breite setzen und die Sektion im HA-Editor verbreitern; siehe [Ansichtsbeispiele](examples/views/README.md).

Außenmessorte mit ausgewählten Hauptquellen erscheinen zusätzlich in einem eigenen dunklen Panel oberhalb der Garage. Unter dem Ortsnamen können mehrere benannte Gruppen wie Homematic, Ecowitt und Vitodens stehen, jeweils mit ihren eigenen ausgewählten Messwerten. Relative und absolute Luftdruckmessungen bleiben getrennt erkennbar. Bei mehreren Orten bietet **Außenmessort im Bild** alle aktiven Orte in ihrer gespeicherten Konfigurationsreihenfolge an. Anfangs wird der erste angezeigt; die Auswahl betrifft nur diese Ansicht und beginnt nach Neuladen wieder beim ersten Ort. Ein Klick auf das Panel öffnet genau dessen Quellen. Sensoren verschiedener Orte sowie Garage und Außenmessort bleiben getrennt. Orte ohne aktive Hauptwerte erzeugen kein schwarzes Panel und bleiben in der normalen Außenübersicht erreichbar.

**Hinweis zur Installation:** Die Bilddatei wird über esbuild in `dist/hausklima-card.js` eingebettet; die übliche einzelne HACS-JavaScript-Datei genügt. Beim ersten Öffnen nach einem Update eventuell den Browsercache aktualisieren.

## Entwicklung und Prüfung

Voraussetzung: Node.js ab Version 22 und npm; die CI verwendet Node.js 24. Das Home-Assistant-System benötigt keinen eigenen Node.js-Build.

```sh
npm ci
npm run check
npm test
npm run build
npm run test:browser
npm run dev
```

`npm run build` erzeugt die eigenständig installierbare Datei `dist/hausklima-card.js` einschließlich Lit und Lizenzhinweisen. Das Bundle wird mitversioniert. CI und Release-Workflow prüfen Typen, Tests, Build und die Übereinstimmung des eingecheckten Bundles mit den Quellen. Die normale PR-CI führt zusätzlich verbindlich die Chromium-Browserprüfungen aus; ein Fehler lässt den Check fehlschlagen.

`npm run dev` startet die lokale Vorschau unter `http://127.0.0.1:4173`. Ohne zusätzliche Auswahl bleibt sie ohne Sensorzuordnungen. Getrennte, ausdrücklich als **DEMO-WERTE** gekennzeichnete Entwicklungsdaten sind über `?demo=1` verfügbar; `?layout=sections` prüft einen schmalen Kartencontainer. Der native HA-Entity-Selector wird ausschließlich in der lokalen Vorschau durch eine Testkomponente nachgebildet. Die Produktionskarte verwendet die Home-Assistant-Komponente und enthält diesen Ersatz nicht.

Die Browserprüfungen benötigen eine Playwright-Engine oder einen vorhandenen Chromium-Pfad über `CHROMIUM_PATH`. Fehlende Browser können mit `npx playwright install chromium` beziehungsweise `npx playwright install webkit` installiert werden; Systemabhängigkeiten können je nach Plattform zusätzlich nötig sein. Screenshots und Prüfgrenzen sind unter [Validierung](docs/validation.md) dokumentiert.

| Bereich | Dateien |
| --- | --- |
| Karte, unveränderte Illustration und dynamische Overlays | `src/hausklima-card.ts`, `src/photo-view.ts`, `src/scene-photo.ts`, `src/styles.ts` |
| Visueller Editor und unveränderliche Konfigurationsänderungen | `src/hausklima-card-editor.ts`, `src/editor-model.ts` |
| Modell, Vorgaben, Validierung | `src/types.ts`, `src/defaults.ts`, `src/config.ts` |
| Messwertauflösung und Formatierung | `src/metrics.ts` |
| Tests und getrennte Entwicklungsvorschau | `tests/`, `scripts/browser-test.mjs`, `dev/` |
| HACS und Auslieferung | `hacs.json`, `dist/`, `.github/workflows/` |

Der Release-Workflow erzeugt nach dem Merge eines PRs in `main` automatisch eine passende SemVer-Version, ein Git-Tag und ein GitHub Release mit der gebauten HACS-JavaScript-Datei, sofern die Prüfungen erfolgreich sind. Einzelheiten: [Release-Automatisierung](docs/releasing.md).

## Grenzen und nächste Phase

Die [Validierung](docs/validation.md) unterscheidet lokale Tests, Browser-Emulation und echte Home-Assistant-/iPhone-Prüfungen. Visuelle Abnahme und Merge bleiben beim Projektinhaber.

Für Phase 3 sind ein optionaler Vorne-/Hinten-Umschalter, eine abgestimmte Verfeinerung der offenen Gebäudegeometrie und eine grafische Messwertpositionierung vorgesehen. Automatische Feuchteberechnung, historische Charts und automatische Dashboard-Erstellung sind nicht Bestandteil dieser Phase.

## Offizielle Grundlagen

- [Home Assistant: Custom cards](https://contributors.home-assistant.io/frontend/custom-ui/card/)
- [Home Assistant: Card editor and picker](https://contributors.home-assistant.io/frontend/custom-ui/card-editor/)
- [Home Assistant: Register resources](https://contributors.home-assistant.io/frontend/custom-ui/resources/)
- [Home Assistant Frontend: native Selector-Komponente](https://github.com/home-assistant/frontend/blob/dev/src/components/ha-selector/ha-selector.ts)
- [Home Assistant Frontend: Entity-Selector](https://github.com/home-assistant/frontend/blob/dev/src/components/ha-selector/ha-selector-entity.ts)
- [HACS: Dashboard repositories](https://www.hacs.xyz/docs/publish/plugin/)
- [HACS: Repository manifest und allgemeine Anforderungen](https://www.hacs.xyz/docs/publish/start/)

## Lizenz

[MIT](LICENSE), Copyright © 2026 tach2004. Die vorhandene Projektlizenz bleibt erhalten; gebündelte Bibliotheken behalten ihre eigenen Lizenzhinweise.
