# Dashboard-Ansichten für HausKlima

Empfehlung ist eine eigene **Panel-Ansicht mit genau einer HausKlima Card**. Die Karte erhält dort am Desktop ausreichend Breite. Eine **Sections**-Ansicht ist die Alternative, etwa neben weiteren Karten; auch in einer schmalen Sektion passt die Karte ihre Anordnung an.

## Einrichtung ohne YAML (empfohlen)

1. HausKlima Card über HACS installieren und sicherstellen, dass die Dashboard-JavaScript-Ressource geladen ist.
2. Ein eigenes, bearbeitbares Dashboard öffnen.
3. **Bearbeiten → Ansicht hinzufügen**; den Ansichtstyp **Panel** auswählen.
4. **HausKlima Card** als einzige Karte dieser Ansicht hinzufügen.
5. Im grafischen **Karteneditor** Räume beziehungsweise Garage auswählen und die Sensoren über die native Home-Assistant-Entity-Auswahl zuordnen. Hauptsensoren, Anzeigenamen und Sichtbarkeit lassen sich dort ebenfalls bearbeiten.
6. Die Dashboard-Änderungen speichern.

Weitere Räume und Außenmessorte werden ebenfalls im Karteneditor hinzugefügt. HACS legt durch die Installation keine neue Dashboard-Ansicht an. Smartphone und Desktop verwenden dieselbe Kartenkonfiguration; die responsive Anordnung erfolgt automatisch.

## Einfügekontext der YAML-Dateien

| Datei | Inhalt | Einfügen |
| --- | --- | --- |
| [panel.yaml](panel.yaml) | Ein vollständiges **Ansichtsobjekt**, genau eine HausKlima Card | YAML-Editor einer Ansicht; bei vollständiger Dashboard-YAML als eingerücktes Listenelement unter `views:` |
| [sections.yaml](sections.yaml) | Ein alternatives **Ansichtsobjekt** mit `sections:` und einer HausKlima Card | Derselbe Ansichtskontext; nicht in den Karten-YAML-Editor |
| [../basic.yaml](../basic.yaml) | Nur die **Kartenkonfiguration** | YAML-Editor einer einzelnen Karte |

Die beiden View-Dateien sind **weder nackte Karten-YAMLs noch vollständige Dashboards**. Werden sie in eine gesamte Dashboard-Datei eingefügt, gehören sie unter `views:`; dort ist die komplette Struktur als Listenelement entsprechend einzurücken. Ihre obersten Felder wie `title`, `path` und `type` beschreiben eine Ansicht.

Die Sections-Datei nutzt eine Karte mit voller verfügbarer Breite in ihrer Sektion. Das garantiert keine Panel-Breite: Die Sektion lässt sich je nach HA-Layout in der Dashboard-Oberfläche verbreitern. Die Karte zeigt bei weniger Platz eine kompakte Gebäudeansicht mit lesbaren Raumkarten und Details darunter.

Sensorzuordnungen werden nach dem Einfügen **im grafischen Karteneditor** vorgenommen. Die Beispiele enthalten keine erfundenen Sensor-IDs oder Messwerte.

Offizielle Grundlagen: [Ansichten](https://www.home-assistant.io/dashboards/views/), [Panel](https://www.home-assistant.io/dashboards/panel/) und [Sections](https://www.home-assistant.io/dashboards/sections/).
