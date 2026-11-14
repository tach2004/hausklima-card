# Screenshots der adaptiven Messwertfelder und Sensorgruppen

Die zehn neu erzeugten und grafisch geprüften Aufnahmen unter `adaptive-groups/` zeigen die tatsächlich gebaute Karte mit der **unveränderten freigegebenen Hausillustration**, inhaltsabhängig schmalen Messwertfeldern, Raum-/Messart-Icons und ausgewählten Sensorgruppen. Außen sind Homematic, Ecowitt und Vitodens getrennt sichtbar; Ecowitt enthält auch relativen und absoluten Luftdruck. Die Daten stammen ausschließlich aus der getrennten Entwicklungsvorschau und sind sichtbar als **DEMO-WERTE** gekennzeichnet. Es sind erfundene Testdaten, keine Messungen aus der Home-Assistant-Installation des Projektinhabers und keine Produktionsvorgaben.

| Ansicht | Helles Theme | Dunkles Theme |
| --- | --- | --- |
| Desktop Panel | [Panel hell](adaptive-groups/panel-light.png) | [Panel dunkel](adaptive-groups/panel-dark.png) |
| Desktop Sections | [Sections hell](adaptive-groups/sections-light.png) | [Sections dunkel](adaptive-groups/sections-dark.png) |
| iPhone Hochformat in Chromium-Emulation | [Hochformat hell](adaptive-groups/iphone-portrait-light.png) | [Hochformat dunkel](adaptive-groups/iphone-portrait-dark.png) |
| iPhone Querformat in Chromium-Emulation | [Querformat hell](adaptive-groups/iphone-landscape-light.png) | [Querformat dunkel](adaptive-groups/iphone-landscape-dark.png) |
| Grafischer Editor mit mehreren Hauptsensoren/Gruppennamen | [Editor mobil](adaptive-groups/editor-mobile.png) | — |
| Ultrawide Panel mit 2560 CSS-Pixel breiter Szene | [2560-px-Ansicht](adaptive-groups/panel-ultrawide.png) | — |

## Reproduktion

```sh
npm run build
UPDATE_SCREENSHOTS=1 npm run test:browser
```

Ohne `UPDATE_SCREENSHOTS=1` schreibt der Browserlauf nach `work/`; die versionierten Aufnahmen bleiben unverändert. Die lokale Vorschau bildet den nativen HA-Entity-Selector mit einer ausdrücklich getrennten Testkomponente nach. Diese Bilder belegen daher weder einen Test im echten Home Assistant noch auf einem physischen iPhone oder in Safari.

Die Browserprüfung muss künftig auch in der normalen PR-CI erfolgreich sein. Konkrete Ergebnisse und Integrationsgrenzen stehen in [Validierung](../validation.md); die bitidentisch erhaltene Bilddatei und die Trennung von Bild-/Sensorlogik sind unter [Bildschicht](../design/scene-implementation.md) dokumentiert.

## Historische Aufnahmen

`phase-2/` enthält die früheren, später abgelehnten SVG-Ansichten; sie sind **keine Designreferenz und kein Nachweis dieser Überarbeitung**. `phase-3/` hält den früheren Stand mit der bereits freigegebenen Illustration fest; `v0.1.2/` zeigt die vorherigen Overlays mit festen Breiten. Die neuen Aufnahmen unter `adaptive-groups/` ersetzen diese als aktueller technischer Umsetzungsnachweis. Die endgültige visuelle Abnahme bleibt beim Projektinhaber.
