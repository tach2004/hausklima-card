# Architektur und Geometrie – Phase 1

## Abgrenzung

Die Karte ist ein eigenständiges Lit Web Component mit einem SVG. Der Build bündelt die Laufzeitabhängigkeiten lokal. Es gibt keine API-Aufrufe, Cloudverbindung, externe Schriftart oder Voraussetzung für weitere Custom Cards. Home Assistant liefert den Zustand über `hass`; die Karte speichert keine Sensordaten außerhalb des Dashboards.

Die öffentliche Integration folgt dem [Custom-Card-Vertrag von Home Assistant](https://contributors.home-assistant.io/frontend/custom-ui/card/): Konfiguration über `setConfig`, Zustand über `hass` und Größenhinweise für das Dashboard. Die Registrierung im Kartenkatalog und der Editor folgen der [offiziellen Editor-Schnittstelle](https://contributors.home-assistant.io/frontend/custom-ui/card-editor/). Änderungen des Editors werden als vollständige Konfiguration im Ereignis `config-changed` übergeben.

## Erweiterbares Modell

Die Typdefinitionen in `src/types.ts` trennen Gebäude, Ebenen, Räume und Messwertzuordnungen von der SVG-Darstellung. Jeder Raum hat eine eindeutige ID und einen Namen. Zugehörigkeit, Sichtbarkeit und vorbereitete Darstellungsebenen erlauben weitere Räume, ohne sie in den aktuellen Schnitt hineinzuzwingen.

Variante A ist die Hauptlösung: Räume des sichtbaren Schnitts erscheinen im Gebäude, andere Räume sind über die einfache Übersicht **Weitere Räume** zugänglich. Die Datenstruktur bereitet Variante B mit alternativen Raumebenen vor; ein Ebenenumschalter wird in Phase 1 nicht umgesetzt.

Pro Raum sind Temperatur, relative Luftfeuchtigkeit, absolute Luftfeuchtigkeit, CO₂ und VOC optional. Eine Messart kann mehrere Entitäten und einen Hauptsensor enthalten. Position und Sichtbarkeit gehören zur Konfiguration, nicht zur Entität. Die Zustandsauflösung unterscheidet verfügbare, unbekannte, nicht verfügbare und fehlende Entitäten. Ohne konfigurierte Messart wird kein leerer Messwert erzeugt. Für VOC bleibt die Einheit des Sensors maßgeblich. Absolute Luftfeuchtigkeit wird nur aus einer zugewiesenen Entität gelesen und nicht berechnet.

Die Vorgaben enthalten keine erfundenen Entitäten. Ergänzungen und Änderungen sind im späteren Editor vorgesehen; Basisänderungen des Phase-1-Editors müssen bereits vorhandene Gebäudekonfigurationen erhalten.

| Feld | Bedeutung |
| --- | --- |
| `building.levels` | Gebäudeebenen mit stabiler ID, Namen, Gebäudezuordnung und bekannter lichter Höhe |
| `building.layers` | Alternative Raumebenen; die Vorgabe enthält `main` |
| `building.rooms` | Räume mit `id`, `name`, `level_id`, optionaler `layer_id`, `visible` und `width_m` |
| `rooms[].measurements` | Optionale Einträge `temperature`, `relative_humidity`, `absolute_humidity`, `co2`, `voc` |
| `measurements.<Messart>.sensors` | Liste von Sensorzuordnungen mit `entity` und optionalem Anzeigenamen |
| `measurements.<Messart>.primary` | Entity-ID des Hauptsensors; ohne Angabe wird der erste zugewiesene Sensor verwendet |
| `measurements.<Messart>.position` | Vorbereitete relative Koordinaten `x`, `y` zwischen 0 und 1 |

Unbekannte Raum- oder Ebenenmaße können `null` bleiben. Die bekannten 0,24 m stehen in `walls.stated_thickness_m`; `exterior_thickness_m` und `interior_thickness_m` bleiben `null`. `roof.pitch_degrees` bleibt ebenfalls `null`, und `garage.gap_is_approximate` kennzeichnet die Unsicherheit des Abstandes. Arrayreihenfolge erhält die Raumfolge von links nach rechts. Für die gültigen Felder und die vollständige Objektstruktur sind die TypeScript-Typen maßgeblich.

Die Phase-1-Projektion ist für die bekannten Ebenen-IDs `basement`, `ground_floor`, `attic` und `garage` ausgelegt und zeigt die erste konfigurierte Raumebene. Weitere Ebenen, unsichtbare Räume und Räume ohne belastbare Position landen in der separaten Übersicht. Ist eine Breite unbekannt oder reicht der verfügbare Platz nicht, werden auch die nachfolgenden Räume dieser Reihe nicht mit erfundenen Positionen gezeichnet. Bei Keller und Erdgeschoss wird keine unbekannte Höhe abgeleitet; das Dachgeschoss verwendet die bekannte innere Firsthöhe als schematische maximale Darstellungshöhe. Das Modell ist damit erweiterbar, während die erste Projektion bewusst das Vorgabegebäude abbildet.

## Vorgegebene Maße

Alle Angaben sind in Metern. Raumreihenfolge jeweils von links nach rechts:

| Ebene | Räume / lichte Breite | Lichte Höhe |
| --- | --- | --- |
| Keller | Werkstatt 4,00 · Flur 3,40 · Waschküche 3,50 | 2,50 |
| Erdgeschoss | Wohnzimmer 6,50 · Flur 0,90 · Küche 3,51 | 2,64 |
| Dachgeschoss | Schlafzimmer 7,60 · Abstellraum 3,60 | Kniestock 1,00; First innen 4,00 über DG-Boden |

Das Wohnhaus hat eine Grundfläche von 12 × 10 m. Die separate Garage rechts hat 6 × 6 m Grundfläche und 3 m Höhe; ihr Abstand zum Haus beträgt **ungefähr** 5 m.

## Keine automatische Maßkorrektur

Die Summe der lichten Raumbreiten ergibt im Keller 10,90 m, im Erdgeschoss 10,91 m und im Dachgeschoss 11,20 m. Bis zu den 12 m Außenbreite verbleiben damit 1,10 m, 1,09 m und 0,80 m. Diese Restbreiten sind **keine bestätigten Wandmaße**.

Die Angabe 0,24 m für eine Wandstärke ist bekannt; die Zuordnung zu Außen- und Innenwänden ist ungeklärt. Die Annahme gleicher Wandstärken für alle Wände ergäbe bei zwei Außen- und zwei Innenwänden im Keller 11,86 m und im Erdgeschoss 11,87 m; im DG mit zwei Außen- und einer Innenwand 11,92 m. Auch diese Ergebnisse erreichen 12 m nicht exakt. Deshalb werden die Raummaße nicht skaliert oder durch erfundene Bauteile ergänzt.

Wandlinien im SVG dienen der Lesbarkeit. Ungeklärte Restbreiten werden nicht als nutzbare Räume ausgegeben. Das Modell hält ungeklärte Geometrie ausdrücklich offen. Eine saubere Maßkette muss gemeinsam geklärt werden, bevor eine baulich genaue Ansicht entstehen kann.

## Traufseite und Cutaway

Der First läuft parallel zur sichtbaren 12-m-Seite. Deshalb zeigt diese Seite keinen Giebeldreieck-Querschnitt. Die schematische Cutaway-Ansicht öffnet die vordere Dachfläche und macht die Raumaufteilung im Dachgeschoss sichtbar. Hilfslinien oder grafische Tiefenversätze sind Präsentationsparameter und keine bestätigten Gebäudemaße.

Die Dachneigung, genaue Dachkonstruktion, Außenhöhen, Deckenstärken und die Lage des Schnitts in der 10-m-Gebäudetiefe sind nicht festgelegt. Aus Firsthöhe und Kniestock wird keine endgültige Dachneigung berechnet. Auch die genaue Position von Innenwänden entlang der Gebäudetiefe ist unbekannt.

## Sinnvolle Reihenfolge für Phase 2

1. Die offenen Maßketten, Wandstärken und Dachgeometrie abstimmen.
2. Räume und Ebenen im Editor verwalten; unabhängige Räume und Außenmessorte berücksichtigen.
3. Home-Assistant-Entity-Selektoren und Hauptsensorwahl ergänzen; weitere Sensoren in einer einfachen Detailansicht zugänglich machen.
4. Messwertpositionen und Beschriftungen grafisch bearbeiten, die Übersicht weiterer Räume ausbauen und alternative Raumebenen umschalten.
5. Die Installation in einer echten Home-Assistant-Instanz mit verschiedenen Themes und Dashboard-Layouts prüfen.
