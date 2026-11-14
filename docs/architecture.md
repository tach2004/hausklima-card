# Architektur und Geometrie – Phase 2

## Laufzeit und Integration

Die Karte ist ein eigenständiges Lit Web Component mit einer dynamischen SVG-Gebäudeansicht. Der Build bündelt die Laufzeitabhängigkeiten lokal in `dist/hausklima-card.js`. Es gibt keine API-Aufrufe, Cloudverbindung, externe Schriftart oder Voraussetzung für weitere Custom Cards. Home Assistant liefert aktuelle Zustände über `hass`; die Karte speichert keine Sensorhistorie.

Die öffentliche Integration folgt dem [Custom-Card-Vertrag von Home Assistant](https://contributors.home-assistant.io/frontend/custom-ui/card/): Konfiguration über `setConfig`, Zustand über `hass` und Größenhinweise für das Dashboard. Kartenregistrierung und grafischer Editor folgen der [offiziellen Editor-Schnittstelle](https://contributors.home-assistant.io/frontend/custom-ui/card-editor/). Editoränderungen werden als vollständige Konfiguration im Ereignis `config-changed` übergeben; das Ereignis überquert Shadow-DOM-Grenzen. Die gespeicherte Dashboard-Konfiguration enthält sämtliche Zuordnungen.

Die Implementierung trennt die Karte, die dekorative SVG-Szene, das Layout aus bestätigten Maßen, Datenmodell/Validierung, Zustandsauflösung sowie Editoränderungen. Die vorgegebenen Gebäude-/Raumdaten und stabilen IDs aus Phase 1 bleiben erhalten.

## Erweiterbares Modell

Variante A ist die Hauptlösung: Räume des sichtbaren Schnitts erscheinen im Gebäude, andere Räume bleiben in einer eigenständigen Raumübersicht bedienbar. `building.layers` bereitet Variante B mit alternativen Raumebenen vor; der Vorne-/Hinten-Umschalter ist Phase 3 vorbehalten. Es wird keine unbekannte Rückseitengeometrie abgeleitet.

| Feld | Bedeutung |
| --- | --- |
| `building.levels` | Ebenen mit stabiler ID, Namen, Gebäudezuordnung und bekannter lichter Höhe |
| `building.layers` | Vorbereitete alternative Raumebenen; die Vorgabe enthält `main` |
| `building.rooms` | Räume/Messorte mit `id`, `name`, `level_id`, optionaler `layer_id`, `visible`, `width_m` und optionalem `location` |
| `rooms[].location` | Optional `indoor` oder `outdoor`; fehlende Angabe bleibt mit Phase 1 kompatibel |
| `rooms[].measurements` | Optionale Einträge `temperature`, `relative_humidity`, `absolute_humidity`, `co2`, `voc` |
| `measurements.<Messart>.sensors` | Flexible Liste von Zuordnungen mit `entity` und optionalem Anzeigenamen `name` |
| `measurements.<Messart>.primary` | Hauptsensor als Entity-ID; ohne Angabe dient der erste zugewiesene Sensor als Hauptsensor |
| `measurements.<Messart>.visible` | Messart in den sichtbaren Übersichten aktiv; `false` entfernt keine Zuordnung aus den Raumdetails |
| `measurements.<Messart>.show_in_overview` | Hauptwert in der Übersicht zeigen; ohne Angabe für Temperatur/relative Feuchte aktiv, für weitere Typen inaktiv |
| `measurements.<Messart>.position` | Vorbereitete relative Koordinaten zwischen 0 und 1; grafische Bearbeitung und freie Platzierung folgen später |

Für gültige Felder und die vollständige Struktur sind die TypeScript-Typen maßgeblich. Die Validierung prüft IDs, Referenzen, Namen, endliche Werte, Sensor-Duplikate und Hauptsensorzugehörigkeit. Konfigurationsänderungen erfolgen ohne Mutation des vom Dashboard übergebenen Objekts. Unbekannte Lovelace-Felder sowie vorhandene zusätzliche Konfigurationsfelder bleiben beim Bearbeiten erhalten.

Zusätzliche Räume und Außenmessorte erhalten eine eindeutige ID, `width_m: null` und keine erfundene Position im Schnitt. Ihre Ebenenzuordnung ist organisatorisch, keine Aussage über einen Außen-Grundriss. Die vorhandene Garage wird direkt konfiguriert; sie muss nicht erneut angelegt werden. Namen können im Editor geändert, Zuordnungen ergänzt/entfernt und Räume nach Bestätigung gelöscht werden. Beim Entfernen eines Hauptsensors wird der erste verbleibende Sensor zum Hauptsensor; die letzte Entfernung hinterlässt keinen ungültigen Primärverweis.

## Messwerte, Status und Sichtbarkeit

Alle fünf Messarten sind optional. Mehrere Entitäten derselben Art pro Raum oder Außenmessort sind möglich; ein Hauptsensor liefert den Übersichtswert, die vollständige Quellenliste bleibt in den Raumdetails. Bei einem nicht verfügbaren Hauptsensor findet kein stiller Ersatz durch eine andere Quelle statt.

`resolveMeasurements` unterscheidet Übersicht und Details. Die Übersicht zeigt nur aktive, für die Hauptanzeige freigegebene Messarten. Die Details enthalten **alle** zugeordneten Quellen, auch wenn eine Messart in der Übersicht deaktiviert oder ausgeblendet wurde. Unkonfigurierte Messarten erzeugen keine leeren Felder.

Die Zustandsauflösung unterscheidet `available`, `unknown`, `unavailable` und eine fehlende Entität. Einheit und Quellenname stammen aus der tatsächlichen HA-Entität, sofern kein eigener Anzeigename gesetzt wurde. Fehlt eine Einheit, wird keine erfunden; insbesondere gibt es keine universelle VOC-Einheit. Zahlen werden anhand der HA-Sprache beziehungsweise Zahlenformat-Einstellung formatiert. Hohe Quellenpräzision und sehr kleine Werte bleiben ohne Rundung auf Null erhalten; zu lange Werte oder Einheiten weichen in der SVG-Übersicht auf einen Detailverweis aus, während die Details den vollständigen Wert anzeigen. Einheiten werden nicht umgerechnet. Absolute Luftfeuchtigkeit wird nur aus einer zugewiesenen Entität gelesen, nicht automatisch berechnet.

Die Auswahl einer Quelle in den Raumdetails löst das übliche Home-Assistant-Ereignis `hass-more-info` mit der Entity-ID aus. `hass`-Aktualisierungen aktualisieren die dargestellten Zustände; die Karte benötigt dafür keinen eigenen Netzwerkzugriff.

## Nativer Entity-Selector im Editor

Der Produktionseditor nutzt Home Assistants `ha-selector` mit einer Entity-Auswahl. Der Vertrag wurde anhand der aktuellen [Selector-Komponente](https://github.com/home-assistant/frontend/blob/dev/src/components/ha-selector/ha-selector.ts) und des [Entity-Selectors](https://github.com/home-assistant/frontend/blob/dev/src/components/ha-selector/ha-selector-entity.ts) geprüft: HA-Zustand über `.hass`, Auswahltyp über `.selector`, aktueller Wert über `.value`, Änderungen über `value-changed` mit `detail.value`.

Falls der native Selector noch nicht registriert ist, lädt der Editor die zugehörigen HA-Komponenten über den eingebauten [Lovelace-Kartenhelfer](https://github.com/home-assistant/frontend/blob/dev/src/panels/lovelace/custom-card-helpers.ts) und den Editor der Standard-Button-Karte nach. Dieser importiert `ha-form` und damit `ha-selector`. Es gibt keinen erzwungenen Freitext-Ersatz in der Produktionskarte. Die lokale Entwicklungsvorschau verwendet ausschließlich zum Testen eine getrennte Nachbildung des Selector-Vertrags; sie wird nicht in das HACS-Bundle eingebunden. Eine vollständige Prüfung im echten HA-Karteneditor bleibt von dieser isolierten Komponentenprüfung zu unterscheiden.

## Design B und responsive Darstellung

Alle vier [Designreferenzen](design/README.md) wurden vor dem Umbau grafisch betrachtet. Die Umsetzung zeichnet Räume, Konturen, Dachtextur, Möblierung und perspektivische Tiefe als SVG; keine Referenzdatei wird als starres Laufzeit-Hintergrundbild eingebaut. Möbel, Materialien, Licht und grafische Tiefenversätze sind dekorativ und bestätigen keine reale Ausstattung oder Konstruktion.

Dunkle Messwertfelder setzen leicht transparente Hintergrundflächen ein. Text, Zahlen und Symbole bleiben vollständig deckend. Temperatur und relative Feuchte sind primär; weitere Werte erscheinen in der Übersicht nur nach ausdrücklicher Freigabe. Zu schmale Räume erhalten eine kompakte Darstellung mit Zugang zu den vollständigen Details, statt überlagerter Messwertfelder.

Desktop-Panel, schmale Sections-Karten und Smartphone verwenden dieselbe Konfiguration. Bei wenig Platz werden Gebäudeansicht, große Raumkarten sowie Garage und Außenmessorte anders angeordnet. Die kompakte Hausgrafik dient dann der Navigation; lesbare Werte und alle Quellen sind über die Raumkarten und Details erreichbar. Es gibt keine erzwungene horizontale SVG-Mindestbreite.

Die tatsächliche Umsetzung wird in [Screenshots](screenshots/README.md) mit ausdrücklich als **DEMO-WERTE** gekennzeichneten Entwicklungsdaten dokumentiert. Das Produktionsgebäude enthält keine Sensor-Entity-IDs und keine simulierten Werte.

## Vorgegebene Maße

Alle Angaben sind in Metern. Raumreihenfolge jeweils von links nach rechts:

| Ebene | Räume / lichte Breite | Lichte Höhe |
| --- | --- | --- |
| Keller | Werkstatt 4,00 · Flur 3,40 · Waschküche 3,50 | 2,50 |
| Erdgeschoss | Wohnzimmer 6,50 · Flur 0,90 · Küche 3,51 | 2,64 |
| Dachgeschoss | Schlafzimmer 7,60 · Abstellraum 3,60 | Kniestock 1,00; First innen 4,00 über DG-Boden |

Das Wohnhaus hat eine Grundfläche von 12 × 10 m. Die separate Garage rechts hat 6 × 6 m Grundfläche und 3 m Höhe; ihr Abstand zum Haus beträgt **ungefähr** 5 m.

## Keine automatische Maßkorrektur

Die Summe der lichten Raumbreiten ergibt im Keller 10,90 m, im Erdgeschoss 10,91 m und im Dachgeschoss 11,20 m. Bis zu den 12 m Außenbreite verbleiben 1,10 m, 1,09 m und 0,80 m. Diese Restbreiten sind **keine bestätigten Wandmaße**.

Die Angabe 0,24 m für eine Wandstärke ist bekannt; ihre Zuordnung zu Außen- und Innenwänden ist ungeklärt. Die Annahme gleicher Wandstärken für alle Wände ergäbe bei zwei Außen- und zwei Innenwänden im Keller 11,86 m und im Erdgeschoss 11,87 m; im DG mit zwei Außen- und einer Innenwand 11,92 m. Auch diese Ergebnisse erreichen 12 m nicht exakt. Deshalb werden die Raummaße weder skaliert noch durch erfundene Bauteile ergänzt.

Unbekannte Raum- oder Ebenenmaße können `null` bleiben. Die bekannten 0,24 m stehen in `walls.stated_thickness_m`; `exterior_thickness_m` und `interior_thickness_m` bleiben `null`. `roof.pitch_degrees` bleibt `null`; `garage.gap_is_approximate` kennzeichnet die Unsicherheit des Abstandes. Arrayreihenfolge erhält die Raumfolge von links nach rechts.

Die Projektion verwendet die bekannten Ebenen-IDs `basement`, `ground_floor`, `attic` und `garage` sowie die erste konfigurierte Raumebene. Räume mit unbekannter Breite, ohne passende Ebene oder ohne belastbare Position bleiben in der Raumübersicht. Ist eine Breite unbekannt oder reicht der Platz nicht, werden auch nachfolgende Räume der Reihe nicht an erfundene Positionen verschoben. Bei Keller und Erdgeschoss wird keine unbekannte Höhe abgeleitet; im DG dient die bekannte innere Firsthöhe der schematischen maximalen Darstellungshöhe.

Wandlinien und perspektivische Flächen sind Präsentationsparameter. Die unbekannten Restbreiten werden nicht als nutzbare Räume ausgegeben. Bekannte Maße und offene Geometriehinweise stehen bei aktivierter Option in den aufklappbaren Gebäudedetails; sie dominieren nicht die Hauptansicht.

## Traufseite und Cutaway

Der First läuft parallel zur sichtbaren 12-m-Seite. Deshalb zeigt diese Fassade keinen dreieckigen Giebelquerschnitt. Die Cutaway-Ansicht öffnet die vordere Dachfläche und macht die Raumaufteilung im Dachgeschoss sichtbar.

Dachneigung, genaue Dachkonstruktion, Außenhöhen, Deckenstärken und die Lage des Schnitts in der 10-m-Gebäudetiefe sind nicht festgelegt. Aus Firsthöhe und Kniestock wird keine endgültige Dachneigung berechnet. Auch die genaue Innenwandlage entlang der Gebäudetiefe ist unbekannt. Die angepasste Anordnung von Haus und Garage auf schmalen Karten ist eine responsive Übersicht, kein maßstäblicher Lageplan.

## Nächste Phase

Offen bleiben die gemeinsam abzustimmenden Maßketten, eine optional frei editierbare Messwertpositionierung und Variante B mit Vorne-/Hinten-Umschalter. Automatische Feuchteberechnung, Rückseiten-3D-Modellierung und historische Charts sind nicht Teil von Phase 2.
