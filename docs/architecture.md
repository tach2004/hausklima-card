# Architektur, Bildschicht und Klima-Overlays

## Laufzeit und Integration

Die Karte ist ein eigenständiges Lit Web Component mit einer unveränderten lokalen WebP-Architekturillustration und getrennten dynamischen HTML-/CSS-Overlays. Der Build bündelt die Laufzeitabhängigkeiten lokal in `dist/hausklima-card.js`. Es gibt keine API-Aufrufe, Cloudverbindung, externe Schriftart oder Voraussetzung für weitere Custom Cards. Home Assistant liefert aktuelle Zustände über `hass`; die Karte speichert keine Sensorhistorie.

Die öffentliche Integration folgt dem [Custom-Card-Vertrag von Home Assistant](https://contributors.home-assistant.io/frontend/custom-ui/card/): Konfiguration über `setConfig`, Zustand über `hass` und Größenhinweise für das Dashboard. Kartenregistrierung und grafischer Editor folgen der [offiziellen Editor-Schnittstelle](https://contributors.home-assistant.io/frontend/custom-ui/card-editor/). Editoränderungen werden als vollständige Konfiguration im Ereignis `config-changed` übergeben; das Ereignis überquert Shadow-DOM-Grenzen. Die gespeicherte Dashboard-Konfiguration enthält sämtliche Zuordnungen.

Die Implementierung trennt Karte, unveränderte Bilddatei (`src/assets/hausklima-cutaway.webp`), Einbindung und Bildschirm-Anker (`src/scene-photo.ts`), dynamische Overlays (`src/photo-view.ts`), Datenmodell/Validierung, Zustandsauflösung sowie Editoränderungen. Die Bilddatei wird im Bundle eingebettet und bleibt auch bei der Überarbeitung der Sensorgruppen bitidentisch. Die vorgegebenen Gebäude-/Raumdaten und stabilen IDs aus Phase 1 bleiben erhalten.

## Erweiterbares Modell

Variante A ist die Hauptlösung: Räume des sichtbaren Schnitts erscheinen im Gebäude, andere Räume bleiben in einer eigenständigen Raumübersicht bedienbar. `building.layers` bereitet Variante B mit alternativen Raumebenen vor; der Vorne-/Hinten-Umschalter ist Phase 3 vorbehalten. Es wird keine unbekannte Rückseitengeometrie abgeleitet.

| Feld | Bedeutung |
| --- | --- |
| `building.levels` | Ebenen mit stabiler ID, Namen, Gebäudezuordnung und bekannter lichter Höhe |
| `building.layers` | Vorbereitete alternative Raumebenen; die Vorgabe enthält `main` |
| `building.rooms` | Räume/Messorte mit `id`, `name`, `level_id`, optionaler `layer_id`, `visible`, `width_m` und optionalem `location` |
| `rooms[].location` | Optional `indoor` oder `outdoor`; fehlende Angabe bleibt mit Phase 1 kompatibel |
| `rooms[].measurements` | Optionale Einträge `temperature`, `relative_humidity`, `absolute_humidity`, `co2`, `voc`, `pressure_relative`, `pressure_absolute` |
| `measurements.<Messart>.sensors` | Flexible Liste von Zuordnungen mit `entity` und optionalem Anzeigenamen `name` |
| `sensors[].show_in_overview` | Optionaler Hauptanzeige-Haken je Quelle; ohne Angabe folgt die Quelle dem bisherigen Primärstatus |
| `sensors[].overview_group` | Optionaler freier Gruppenname; gleich benannte Quellen desselben Messorts werden messartübergreifend zusammen angezeigt |
| `measurements.<Messart>.primary` | Bisheriger Hauptsensor als Entity-ID; ohne Angabe dient der erste zugewiesene Sensor als Hauptsensor. Bestehende Konfigurationen behalten damit ihre Übersichtswerte |
| `measurements.<Messart>.visible` | Messart in den sichtbaren Übersichten aktiv; `false` entfernt keine Zuordnung aus den Raumdetails |
| `measurements.<Messart>.show_in_overview` | Hauptwert in der Übersicht zeigen; ohne Angabe für jede konfigurierte Messart aktiv |
| `measurements.<Messart>.position` | Vorbereitete relative Koordinaten zwischen 0 und 1; grafische Bearbeitung und freie Platzierung folgen später |

Für gültige Felder und die vollständige Struktur sind die TypeScript-Typen maßgeblich. Die Validierung prüft IDs, Referenzen, Namen, endliche Werte, Sensor-Duplikate und Hauptsensorzugehörigkeit. Konfigurationsänderungen erfolgen ohne Mutation des vom Dashboard übergebenen Objekts. Unbekannte Lovelace-Felder sowie vorhandene zusätzliche Konfigurationsfelder bleiben beim Bearbeiten erhalten.

Zusätzliche Räume und Außenmessorte erhalten eine eindeutige ID, `width_m: null` und keine erfundene Position im Schnitt. Ihre Ebenenzuordnung ist organisatorisch, keine Aussage über einen Außen-Grundriss. Die vorhandene Garage wird direkt konfiguriert; sie muss nicht erneut angelegt werden. Namen können im Editor geändert, Zuordnungen ergänzt/entfernt und Räume nach Bestätigung gelöscht werden. Beim Entfernen eines Hauptsensors wird der erste verbleibende Sensor zum Hauptsensor; die letzte Entfernung hinterlässt keinen ungültigen Primärverweis.

## Messwerte, Status und Sichtbarkeit

Alle sieben Messarten sind optional. Mehrere Entitäten derselben Art pro Raum, Gerät oder Außenmessort sind möglich. Die bisherige Primärquelle bleibt erhalten; zusätzlich kann jede Quelle explizit für die Hauptanzeige aktiviert oder deaktiviert werden. Ohne neue Sensorfelder liefert weiterhin die bisherige Primärquelle den Übersichtswert. Bei einer nicht verfügbaren ausgewählten Quelle findet kein stiller Ersatz durch eine andere Quelle statt.

`resolveMeasurements` unterscheidet Übersicht und Details. Die Übersicht zeigt nur aktive, für die Hauptanzeige freigegebene Messarten. `resolveOverviewGroups` bündelt deren ausgewählte Quellen anhand von `overview_group` innerhalb eines Messorts. So können unter **Außen** etwa die Gruppen **Homematic**, **Ecowitt** und **Vitodens** stehen. Derselbe Mechanismus gilt für Räume und Geräte. Innenräume mit höchstens einer ausgewählten Temperaturquelle zeigen die Messarten vertikal, auch bei benannten Gruppen; Außenmessorte und Innenräume mit mehreren ausgewählten Temperaturquellen können benannte Gruppen mit horizontal umbrechenden Werten darstellen. Bei mehreren ausgewählten Quellen derselben Messart ohne expliziten Gruppennamen werden die Quellen mit ihren Anzeigenamen getrennt zugeordnet. Die Details enthalten **alle** zugeordneten Quellen, auch wenn eine Quelle oder Messart in der Übersicht deaktiviert oder ausgeblendet wurde. Unkonfigurierte Messarten erzeugen keine leeren Felder.

Die Zustandsauflösung unterscheidet `available`, `unknown`, `unavailable` und eine fehlende Entität. Einheit und Quellenname stammen aus der tatsächlichen HA-Entität, sofern kein eigener Anzeigename gesetzt wurde. Fehlt eine Einheit, wird keine erfunden; insbesondere gibt es keine universelle VOC-Einheit. Zahlen werden anhand der HA-Sprache beziehungsweise Zahlenformat-Einstellung formatiert. `ResolvedSensor.metric_type` bestimmt die zentrale Formatierung durch `formatSensorValue`: Temperatur sowie relative und absolute Feuchte erhalten genau eine Nachkommastelle, CO₂, VOC und beide Druckarten keine. Das gilt für Bild-Overlays, Karten, Außenwerte sowie sämtliche Quellen in Details. Rohzustände und gespeicherte Daten bleiben unverändert. Lange Werte und Einheiten werden umgebrochen oder eindeutig angedockt und niemals durch `Details` ersetzt. Baumaße wie 3,51 m, Entity-IDs und Modell-/Versionstexte verwenden diese Sensorformatierung nicht. Einheiten werden nicht umgerechnet. Absolute Luftfeuchtigkeit und beide Luftdruckarten werden ausschließlich aus jeweils zugewiesenen Entitäten gelesen, nicht automatisch berechnet oder voneinander abgeleitet.

Die Auswahl einer Quelle in den Raumdetails löst das übliche Home-Assistant-Ereignis `hass-more-info` mit der Entity-ID aus. `hass`-Aktualisierungen aktualisieren die dargestellten Zustände; die Karte benötigt dafür keinen eigenen Netzwerkzugriff.

## Nativer Entity-Selector im Editor

Der Produktionseditor nutzt Home Assistants `ha-selector` mit einer Entity-Auswahl. Der Vertrag wurde anhand der aktuellen [Selector-Komponente](https://github.com/home-assistant/frontend/blob/dev/src/components/ha-selector/ha-selector.ts) und des [Entity-Selectors](https://github.com/home-assistant/frontend/blob/dev/src/components/ha-selector/ha-selector-entity.ts) geprüft: HA-Zustand über `.hass`, Auswahltyp über `.selector`, aktueller Wert über `.value`, Änderungen über `value-changed` mit `detail.value`.

Falls der native Selector noch nicht registriert ist, lädt der Editor die zugehörigen HA-Komponenten über den eingebauten [Lovelace-Kartenhelfer](https://github.com/home-assistant/frontend/blob/dev/src/panels/lovelace/custom-card-helpers.ts) und den Editor der Standard-Button-Karte nach. Dieser importiert `ha-form` und damit `ha-selector`. Es gibt keinen erzwungenen Freitext-Ersatz in der Produktionskarte. Die lokale Entwicklungsvorschau verwendet ausschließlich zum Testen eine getrennte Nachbildung des Selector-Vertrags; sie wird nicht in das HACS-Bundle eingebunden. Eine vollständige Prüfung im echten HA-Karteneditor bleibt von dieser isolierten Komponentenprüfung zu unterscheiden.

## Bildschicht, Anker und responsive Darstellung

Die aktuellen Vorgaben beziehen sich auf die bereits freigegebene Architekturillustration. Die alten, abgelehnten SVG-Hauszeichnungen sind keine Designreferenz. Möbel, Materialien und Raumdetails der vorhandenen Illustration werden nicht verändert. Die bekannten Bau- und Raummaße im Modell bleiben getrennt von dekorativen Bildkoordinaten und werden nicht aus Pixelabständen abgeleitet.

Ein sichtbarer Wohnraum erhält alle ausgewählten Hauptquellen aktiver Messarten samt HA-Einheit. `visible:false` beziehungsweise `show_in_overview:false` auf Messartebene blendet deren Übersichtswerte aus; der gleichnamige Sensor-Haken steuert einzelne Quellen. Ohne Hauptwerte erscheint kein dunkles Panel; Name und neutrale Navigation können erhalten bleiben. Die dunklen Flächen verwenden den Hintergrund `rgba(22,26,30,chip_opacity)`; Text, Zahlen und Symbole bleiben deckend. Ihre Breite folgt dem Inhalt statt festen Prozentanteilen der Bildbreite. Die Anordnung berücksichtigt die oben beschriebene Innenraum-Regel, damit einzelne Temperaturquellen kompakt bleiben. Lokal gebündelte Symbole vor Raumnamen und Messwerten erfordern weder zusätzliche Karten noch Netzwerkabfragen.

Die vier Garagenmessorte `garage`, `garage_cabinet`, `garage_battery_pylontech` und `garage_battery_litime` besitzen unabhängige Bildschirm-Anker an den tatsächlich sichtbaren Objekten und eigene Messwertbereiche. Der Schaltschrank liegt links, die Pylontech-Batterie links neben LiTime. Die tatsächlichen DOM-Größen werden nach Daten- und Größenänderungen gemessen. Bei dichter Belegung werden vollständige Panels kollisionsfrei versetzt oder im erweiterten `photo-stage` unter der unveränderten Bildfläche angedockt. Verbindungslinien und mindestens 44 CSS-Pixel große Objekt-Touch-Ziele halten die Beziehung eindeutig. Gerätekarten unter dem Bild bleiben zusätzlich bedienbar; sie ersetzen die zugeordneten Bild-Overlays nicht.

Außenmessorte verwenden einen eigenen Bereich über der Garage. Alle ausgewählten Quellen können dort in benannten Untergruppen erscheinen; die übrigen Sensoren bleiben in den Details erreichbar. Ein nativer Selector `#photo-outdoor-select` führt alle Orte mit aktiven Hauptwerten in gespeicherter Konfigurationsreihenfolge auf. Er startet mit dem ersten Ort; der gewählte Ort ist ausschließlich temporärer Darstellungszustand und wird nach Reload zurückgesetzt. Ein Ortswechsel öffnet keine Details von selbst, das aktive Panel öffnet ausschließlich die Quellen des zugehörigen Ortes. Verschiedene Orte und ihre Sensoren werden nicht vermischt.

`scene_max_width` ist ein optionales Konfigurationsfeld mit Standard 1400 und gültigem Bereich 900–3200 CSS-Pixel. Der Editor verändert es in Zehnerschritten per `input`-Ereignis, sendet die vollständige Konfiguration mit `config-changed` und erhält die anderen Felder, insbesondere `chip_opacity` und `garage_components_initialized`. Die Validierung akzeptiert ausschließlich endliche Zahlen innerhalb dieses Bereichs. Der höhere Grenzwert erlaubt mehr Platz auf breiten Desktop-Panels; auf kleineren Geräten begrenzt weiterhin der Container die tatsächliche Breite. Eine größere Maximalbreite überschreibt nicht die Grid-Breite einer HA-Sections-Karte.

Desktop-Panel, Sections und Smartphone verwenden dieselbe Konfiguration. Die vollständige Bildfläche bleibt proportional ohne Clipping oder Verzerrung. Bei Kartenbreiten bis 1000 CSS-Pixeln entfallen zu kleine Bild-Badges und Verbindungslinien; die großen Raum-, Außen- und Gerätekarten darunter zeigen automatisch sämtliche aktiven Hauptwerte ohne Zusatzklick; Quellenlisten und HA-More-Info bleiben per Tap erreichbar. Es gibt keine erzwungene horizontale Bildlaufleiste oder Informationsersatz durch einen `Details`-Text.

Die tatsächliche Umsetzung wird in [neuen Screenshots](screenshots/README.md) mit ausdrücklich als **DEMO-WERTE** gekennzeichneten Entwicklungsdaten dokumentiert. Frühere Screenshots sind historische Nachweise, keine neue visuelle Referenz. Das Produktionsgebäude enthält keine simulierten Sensorwerte. Die Bildintegrität wird zusätzlich per SHA-256 geprüft; siehe [Bildschicht-Dokumentation](design/scene-implementation.md).

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

Die organisatorische Raumübersicht verwendet weiterhin die bekannten Ebenen-IDs `basement`, `ground_floor`, `attic` und `garage` und die vorbereiteten Raumebenen. Die aktuelle Illustration verwendet getrennte Bildschirm-Anker für die bekannten Raum- und Geräte-IDs; sie rekonstruiert keine Wände oder Raumflächen aus den Modellbreiten. Zusätzliche Räume ohne Bild-Anker bleiben über die eigenständige Raumübersicht erreichbar. Unbekannte Breiten und Höhen werden weder aus Bildpixeln abgeleitet noch durch neue bauliche Angaben ergänzt.

Die gezeigten Wandlinien und perspektivischen Flächen der Illustration sind Präsentationsparameter. Die unbekannten Restbreiten werden nicht als nutzbare Räume ausgegeben. Bekannte Maße und offene Geometriehinweise stehen bei aktivierter Option in den aufklappbaren Gebäudedetails; sie dominieren nicht die Hauptansicht.

## Traufseite und Cutaway

Der First läuft parallel zur sichtbaren 12-m-Seite. Deshalb zeigt diese Fassade keinen dreieckigen Giebelquerschnitt. Die Cutaway-Ansicht öffnet die vordere Dachfläche und macht die Raumaufteilung im Dachgeschoss sichtbar.

Dachneigung, genaue Dachkonstruktion, Außenhöhen, Deckenstärken und die Lage des Schnitts in der 10-m-Gebäudetiefe sind nicht festgelegt. Aus Firsthöhe und Kniestock wird keine endgültige Dachneigung berechnet. Auch die genaue Innenwandlage entlang der Gebäudetiefe ist unbekannt. Die angepasste Anordnung von Haus und Garage auf schmalen Karten ist eine responsive Übersicht, kein maßstäblicher Lageplan.

## Nächste Phase

Offen bleiben die gemeinsam abzustimmenden Maßketten, eine optional frei editierbare Messwertpositionierung und Variante B mit Vorne-/Hinten-Umschalter. Automatische Feuchteberechnung, Rückseiten-3D-Modellierung und historische Charts sind nicht Teil von Phase 2.
