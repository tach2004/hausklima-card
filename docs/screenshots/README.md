# Screenshots der aktuellen Overlay-Umsetzung

Die neun neu erzeugten und grafisch geprüften Aufnahmen unter `v0.1.2/` zeigen die tatsächlich gebaute Karte mit der **unveränderten freigegebenen Hausillustration** und den dynamischen Messwertflächen. Die Daten stammen ausschließlich aus der getrennten Entwicklungsvorschau und sind sichtbar als **DEMO-WERTE** gekennzeichnet. Es sind erfundene Testdaten, keine Messungen aus der Home-Assistant-Installation des Projektinhabers und keine Produktionsvorgaben.

| Ansicht | Helles Theme | Dunkles Theme |
| --- | --- | --- |
| Desktop Panel | [Panel hell](v0.1.2/panel-light.png) | [Panel dunkel](v0.1.2/panel-dark.png) |
| Desktop Sections | [Sections hell](v0.1.2/sections-light.png) | [Sections dunkel](v0.1.2/sections-dark.png) |
| iPhone Hochformat in Chromium-Emulation | [Hochformat hell](v0.1.2/iphone-portrait-light.png) | [Hochformat dunkel](v0.1.2/iphone-portrait-dark.png) |
| iPhone Querformat in Chromium-Emulation | [Querformat hell](v0.1.2/iphone-landscape-light.png) | [Querformat dunkel](v0.1.2/iphone-landscape-dark.png) |
| Grafischer Editor auf schmalem Bildschirm | [Editor mobil](v0.1.2/editor-mobile.png) | — |

## Reproduktion

```sh
npm run build
UPDATE_SCREENSHOTS=1 npm run test:browser
```

Ohne `UPDATE_SCREENSHOTS=1` schreibt der Browserlauf nach `work/`; die versionierten Aufnahmen bleiben unverändert. Die lokale Vorschau bildet den nativen HA-Entity-Selector mit einer ausdrücklich getrennten Testkomponente nach. Diese Bilder belegen daher weder einen Test im echten Home Assistant noch auf einem physischen iPhone oder in Safari.

Die Browserprüfung muss künftig auch in der normalen PR-CI erfolgreich sein. Konkrete Ergebnisse und Integrationsgrenzen stehen in [Validierung](../validation.md); die bitidentisch erhaltene Bilddatei und die Trennung von Bild-/Sensorlogik sind unter [Bildschicht](../design/scene-implementation.md) dokumentiert.

## Historische Aufnahmen

`phase-2/` enthält die früheren, später abgelehnten SVG-Ansichten; sie sind **keine Designreferenz und kein Nachweis dieser Überarbeitung**. `phase-3/` hält den früheren Stand mit der bereits freigegebenen Illustration fest. Die neuen Aufnahmen unter `v0.1.2/` ersetzen diese als aktueller technischer Umsetzungsnachweis. Die endgültige visuelle Abnahme bleibt beim Projektinhaber.
