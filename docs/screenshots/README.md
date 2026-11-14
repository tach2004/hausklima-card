# Screenshots der Phase-2-Umsetzung

Die Aufnahmen zeigen den tatsächlich implementierten, lokal gebauten Code von HausKlima Card, nicht die Design-Mockups. Sie verwenden getrennte Entwicklungs- und Testdaten, sichtbar als **DEMO-WERTE** gekennzeichnet. Diese Werte sind erfunden und dienen ausschließlich der Darstellung und Prüfung; die installierte Karte enthält keine solchen Vorgaben.

| Ansicht | Helles Theme | Dunkles Theme |
| --- | --- | --- |
| Desktop, 1440 CSS-Pixel | [Desktop hell](phase-2/desktop-light.png) | [Desktop dunkel](phase-2/desktop-dark.png) |
| Smartphone-Übersicht, 390 CSS-Pixel | [Mobilübersicht hell](phase-2/mobile-overview-light.png) | [Mobilübersicht dunkel](phase-2/mobile-overview-dark.png) |
| Smartphone mit geöffneten Raumdetails, 390 CSS-Pixel | [Mobil hell](phase-2/mobile-light.png) | [Mobil dunkel](phase-2/mobile-dark.png) |
| iPhone-17-Querformat in Chromium-Geräteemulation | [Querformat](phase-2/iphone-landscape.png) | — |
| Grafischer Editor, 390 CSS-Pixel | [Editor mobil](phase-2/editor-mobile.png) | — |

Die acht vollständigen Seitenaufnahmen entstehen aus dem gebündelten JavaScript:

```sh
npm run build
UPDATE_SCREENSHOTS=1 npm run test:browser
```

Ohne `UPDATE_SCREENSHOTS=1` schreibt der Browserlauf seine Aufnahmen nach `work/screenshots/phase-2/`; die versionierten Nachweise bleiben dann unverändert. Die Browserprüfung verwendet die getrennte lokale Vorschau; der Test-Entity-Selector bildet dort nur den nativen HA-Komponentenvertrag nach. Die Aufnahmen sind deshalb keine Behauptung eines Tests innerhalb einer echten Home-Assistant-Installation oder auf einem echten iPhone.

Prüfmatrix, Ergebnisse und Grenzen stehen in [../validation.md](../validation.md).
