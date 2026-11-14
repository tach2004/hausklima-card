# HausKlima – neue Bildschicht und dynamische HA-Werte

Der vorherige rechteckige SVG-Gebäudebaukasten wurde vom Benutzer nach zwei Versuchen abgelehnt. `src/assets/hausklima-cutaway.webp` ist eine **neu gestaltete, generische Architekturillustration** für eine deutlich hochwertigere 2,5D-Szene. Die Raumaufteilung folgt den bekannten Ebenen und der Raumreihenfolge grob, bildet aber **keinen gemessenen Gebäudequerschnitt** ab. Möbel, Fenster, Batteriemodelle und Dachdetails sind dekorativ, nicht als reale Beschaffenheit bestätigt.

**Wichtig:** Die Messwert-Karten sind keine festen Teile der Bilddatei. Sie werden von `hausklima-card.ts` aus konfigurierten HA-Entitäten als HTML-Overlay gerendert. Das Bild selbst enthält absichtlich keine Sensorzahlen oder Raumnamen.

- Panel/Dashboard: Szene zentriert, max. Breite ca. 1180px, kein 100%-Bildschirmformat und keine abgeschnittenen Gebäude.
- iPhone 17: gesamte Szene als Navigation/Bild, darunter große gut bedienbare Raum- und Geräte-Kacheln. Keine winzigen Overlay-Werte auf dem hochkant skalierten Gesamtbild.
- Messwert-Hintergründe: Standard `rgba(22,26,30,.72)`; über den Karteneditor per Deckkraftregler von 35–100 % einstellbar. **Nur der Hintergrund** wird transparent, Schrift und Symbole bleiben vollständig deckend.
- Der in der Grafik sichtbare Garagenschrank und die beiden generischen Batterien werden mit den unabhängigen Messorten `garage_cabinet`, `garage_battery_pylontech` und `garage_battery_litime` verbunden; die Garagenluft bleibt `garage`.
- Die drei zusätzlichen Messorte besitzen **keine** erfundenen Entitäten und können im grafischen Editor wie alle anderen Räume umbenannt und mit Messwerten bestückt werden.
- Bei hinzugefügten Räumen, die keinen Platz in der festen Illustration haben, statt eine Position zu erfinden die separate Raumübersicht verwenden.
- Die Bilddatei wird bei esbuild als `dataurl` in `dist/hausklima-card.js` gebündelt; HACS braucht keine zweite Netzwerkressource.

Ausstehend: Feinschliff der Illustrationsgeometrie, echte iPhone-Safari-Tests, optionale Rückseite mit bestätigter Raumaufteilung. Jede neue Visual-Version benötigt die explizite visuelle Freigabe des Nutzers.

## Dynamische Messwerte und Leerzustände

Alle fünf Messarten (Temperatur, relative/absolute Feuchte, CO₂ und VOC) sind pro Raum und pro Garagenmessstelle möglich und erscheinen bei Zuordnung standardmäßig in den Live-Kästchen; jede Messart kann über den Schalter `show_in_overview` einzeln ausgeblendet werden. Nicht zugewiesene Messarten erzeugen **keine** Leerzeilen. Räume ohne zugewiesene Hauptwerte erhalten **keine dunklen Kästchen**. Die Namen bleiben als unaufdringliche navigierbare Beschriftungen erhalten; sämtliche Räume und Geräte sind zusätzlich über die neutrale Übersicht erreichbar. Die Garage hat auf dem Bild ein dynamisches eigenes Klima-Overlay, die Batterie- und Schrankwerte stehen übersichtlich in ihren separaten Geräte-Karten darunter. Auf dem iPhone 17 erfolgt die Bedienung über diese Touch-Karten.
