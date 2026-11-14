# Unveränderte Illustration und dynamische Klima-Overlays

Die vom Projektinhaber freigegebene Architekturillustration ist `src/assets/hausklima-cutaway.webp`. Sie ist eine lokale, illustrative 2,5D-Szene, kein Foto des tatsächlichen Hauses und kein vermessener Bauplan. Die früheren SVG-Hausentwürfe wurden abgelehnt und sind keine Stilvorlagen für diese Umsetzung.

**Diese Bilddatei bleibt auch bei der Überarbeitung der Sensorgruppen bitidentisch.** Keine Neugenerierung, Bearbeitung, Farb-, Textur-, Ausschnitt- oder Detailänderung. Anpassungen betreffen ausschließlich getrennte HTML-/CSS-Overlays, deren Logik und die proportionale Skalierung der gesamten Bildfläche.

## Trennung von Bild und Daten

`src/scene-photo.ts` bindet das WebP ein; esbuild bettet es als `dataurl` in `dist/hausklima-card.js` ein. HACS benötigt weiterhin nur diese JavaScript-Datei. Die Bilddatei enthält keine fest eingebauten Messwerte oder Raumnamen. `src/photo-view.ts` legt dynamische Messwertflächen und Touch-Ziele darüber. Die Werte stammen ausschließlich aus den tatsächlich konfigurierten HA-Entitäten.

Die Bildschirmpositionen beschreiben sichtbare Objekte dieser Illustration und keine neuen Hausmaße. Die vorhandene Szene wurde vor Festlegung der Geräte-Anker grafisch betrachtet: Schaltschrank links im Garagenraum, Pylontech links neben der rechten LiTime-Batterie; Garagenluft ist ein eigenständiger Messort. Die Sensorzuordnungen und Anzeigenamen dieser vier stabilen IDs bleiben unabhängig:

- `garage`: Garagenluft
- `garage_cabinet`: Schaltschrank
- `garage_battery_pylontech`: Pylontech
- `garage_battery_litime`: LiTime

Kein Messort erhält erfundene Entitäten. Die einmalige Migration für bestehende Konfigurationen verwendet weiterhin `garage_components_initialized`; bewusst gelöschte Geräte werden nicht bei jedem Laden erneut hinzugefügt.

## Anzeige und Bedienung

Alle sieben Messarten sind optional: Temperatur, relative und absolute Feuchte, CO₂, VOC sowie relativer und absoluter Luftdruck. Ein Panel zeigt alle für die Hauptanzeige ausgewählten Quellen aktiver Messarten samt tatsächlicher Einheit. Auf Messartebene blenden `visible:false` oder `show_in_overview:false` deren Übersichtswerte aus. Der optionale Sensor-Haken `show_in_overview` steuert einzelne Quellen; ohne Angabe bleibt die bisherige Primärquelle sichtbar. Sämtliche Zuordnungen bleiben in den Details erhalten. Ohne sichtbare Hauptwerte entsteht kein schwarzer Kasten. Ein Raumname beziehungsweise eine neutrale Navigation kann erhalten bleiben.

Die Kästchen wachsen mit ihrem Inhalt statt feste Prozentbreiten zu belegen. Innenräume mit höchstens einer ausgewählten Temperaturquelle zeigen ihre Messarten wie bisher untereinander, auch wenn ein Gruppenname gesetzt ist. Mehrere ausgewählte Quellen können über den freien Sensor-Gruppennamen `overview_group` gegliedert werden: Unter dem Hauptmessort **Außen** steht dann beispielsweise je eine Zeile **Homematic**, **Ecowitt** und **Vitodens** mit den zugehörigen Werten. Dort sowie in Innenräumen mit mehreren ausgewählten Temperaturquellen können die Werte je benannter Gruppe horizontal umbrechen. Derselbe Gruppenname verbindet Messarten desselben Messorts. Ohne Gruppennamen bleiben gleichzeitig ausgewählte Quellen derselben Messart über ihre Anzeigenamen unterscheidbar. Die Gruppierung gilt für alle Messorte, einschließlich Innenräumen und Geräten.

Thermometer-, Feuchte-, Luftqualitäts- und Drucksymbole stehen vor den Messwerten; passende Raumsymbole ergänzen die Namen, etwa Bett, Sofa, Werkzeug oder Batterie. Die Symbole sind lokal gebündelt. Die ergänzten Icons übernehmen keine hellen Kästchen oder Hintergrundfarben aus den Nutzerreferenzen: die leicht transparente schwarze Gestaltung bleibt erhalten.

**Temperatur und beide Feuchtearten haben genau eine Nachkommastelle, CO₂, VOC und beide Druckarten keine.** Die zentrale Funktion `formatSensorValue` berücksichtigt die HA-Zahlenformate in Übersicht und Details. Sie rundet nur die Anzeige, weder `hass.states` noch gespeicherte Zuordnungen oder Statistiken. CO₂ erscheint beispielsweise als `745` statt `745,0`. Baumaße wie `3,51 m`, Entity-IDs und Versionsangaben gehören nicht zu dieser Regel. Einheiten werden nicht gekürzt, erfunden oder umgerechnet. Relativer und absoluter Luftdruck sind getrennte Sensoreingänge und werden nicht voneinander abgeleitet. Nicht-numerische Zustände sowie fehlende, unbekannte und nicht verfügbare Entitäten bleiben ehrliche Zustände.

Lange Zahlen und Einheiten werden nicht durch `Details` ersetzt. Die adaptive Anordnung misst die tatsächlichen DOM-Größen nach Zustands- und Breitenänderungen. Passt ein vollständiges Panel nicht ohne Überlappung an den Bild-Anker, wird dasselbe Panel innerhalb des erweiterten `photo-stage` unter der unveränderten Bildfläche angedockt. Verbindungslinien und eigene mindestens 44 CSS-Pixel große Touch-Ziele am zugehörigen Objekt erhalten den Bezug. Diese angedockten Bild-Overlays sind keine bloßen Ersatzkarten der darunterliegenden allgemeinen Geräteübersicht. Ein Klick oder Tap öffnet die vorhandene Raumdetailansicht mit Haupt- und Nebensensoren. Eine Quelle dort öffnet die üblichen HA-Entitätsdetails.

Außenmessorte mit `location:'outdoor'` und sichtbaren Hauptwerten haben einen eigenen Bereich oberhalb der Garage. Ein nativer Auswahlregler (`#photo-outdoor-select`) enthält alle aktiven Orte in der gespeicherten Konfigurationsreihenfolge. Beim Laden ist der erste Ort aktiv; die Auswahl ist vorübergehender Darstellungszustand und wird nicht persistiert. Nach Neuladen beginnt sie wieder beim ersten Ort. Ein Ortswechsel mischt keine Sensoren und öffnet nicht selbstständig Raumdetails; das zugehörige Panel öffnet die vollständigen Quellen genau dieses Ortes. Quellen verschiedener Messorte werden nicht zusammengeführt.

## Größe, Transparenz und schmale Ansichten

Die Gesamtansicht bleibt zentriert und proportional. `scene_max_width` setzt ihre maximale Breite auf standardmäßig **1400 CSS-Pixel**; der visuelle Editor bietet **900 bis 3200 Pixel in Zehnerschritten** mit unmittelbarer Vorschau. Der eingestellte Wert ist eine Obergrenze und keine erzwungene Mindestbreite. Breite Desktop-Panels können damit mehr als 1600 Pixel nutzen; schmale Geräte passen die Ansicht weiterhin an den Container an. In Sections begrenzt das Home-Assistant-Grid den tatsächlich verfügbaren Platz; die Karte überschreibt keine Sektionsbreite.

Die Deckkraft der dunklen Hintergründe bleibt über `chip_opacity` zwischen **0,35 und 1**, standardmäßig **0,72**, einstellbar. Nur der Hintergrund wird transparent; Text, Werte und Symbole bleiben vollständig deckend.

Bei Kartenbreiten bis 1000 CSS-Pixeln werden die zu kleinen Bild-Badges und Verbindungslinien ausgeblendet. Die vollständig sichtbare Gesamtillustration bleibt zur Orientierung erhalten; die darunterliegenden Raum-, Außen- und Gerätekarten zeigen automatisch **alle aktiven Hauptwerte ohne zusätzlichen Klick**. Die vollständigen Quellenlisten bleiben per Tap erreichbar. Das Bild wird weder verzerrt noch abgeschnitten; horizontales Seitenscrollen ist nicht Teil des Bedienkonzepts.

## Nachweis unveränderter Bilddaten

SHA-256 der Bilddatei auf dem Aufgabenbranch bei `f243f31`:

```text
fc840fd3cdd7ec1ecbae75a475c14674eafa28e99d7c43888ce6ffef7cbbef98
```

Der Vergleich erfolgt ausdrücklich mit den ursprünglichen Bytes, nicht mit einem erneut exportierten oder optisch ähnlichen Bild:

```sh
sha256sum src/assets/hausklima-cutaway.webp
git show f243f31:src/assets/hausklima-cutaway.webp | sha256sum
git diff f243f31 -- src/assets/hausklima-cutaway.webp
```

Prüfergebnisse, neue Umsetzungsscreenshots und Integrationsgrenzen stehen in [Validierung](../validation.md). Eine technische Prüfung ersetzt nicht die visuelle Abnahme durch den Projektinhaber. Offene Wand-/Dachmaße, eine optionale Rückseite und freie Messwertpositionierung werden durch diesen Overlay-Auftrag nicht neu festgelegt.
