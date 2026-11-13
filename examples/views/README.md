# Dashboard-Ansichten für HausKlima

Empfehlung: **Panel**, damit das Gebäude auf großen Displays möglichst viel Breite erhält. Alternative: **Sections** für Dashboards mit mehreren Karten. Eine Sections-Sektion ist oft deutlich schmaler; die Hausgrafik muss trotzdem responsiv sein.

## Ohne YAML (empfohlen)
1. Karte über HACS installieren und sicherstellen, dass die Dashboard-JavaScript-Ressource geladen ist.
2. Ein **eigenes, bearbeitbares Dashboard** öffnen (nicht eines der fest eingebauten systemverwalteten Dashboards).
3. **Bearbeiten → Ansicht hinzufügen**; Ansichtstyp **Panel** auswählen.
4. **HausKlima Card** als einzige Karte dieser Ansicht hinzufügen.
5. Ab Phase 2 Räume und Sensoren im **grafischen Karteneditor** zuordnen.

## Mit YAML
- [panel.yaml](panel.yaml) ist ein vollständiges **Ansichtsobjekt** für **Ansicht bearbeiten → YAML**; nicht in den Karten-YAML-Editor kopieren.
- [sections.yaml](sections.yaml) ist ein alternatives Ansichtsobjekt mit `sections:` und `grid_options:`. Die volle Panel-Breite ist in Sections **nicht garantiert**.
- Wenn das **gesamte Dashboard** als YAML gepflegt wird, muss die Ansichtsstruktur unter `views:` als Listeneintrag stehen, mit passender Einrückung.
- Die minimalste **Kartenkonfiguration** ist unabhängig von der Ansicht:

```yaml
type: custom:hausklima-card
```

**Nicht möglich durch bloße HACS-Installation:** automatisch eine neue Home-Assistant-Ansicht anlegen. Eine spätere optionale geführte Einrichtung ist denkbar, steht aber nicht im Arbeitsumfang der Phase 2. Der mobile Aufbau erfolgt durch Responsive-Design in **derselben Karte**, ohne separates YAML fürs iPhone.

Quellen: https://www.home-assistant.io/dashboards/views/ und https://www.home-assistant.io/dashboards/panel/ und https://www.home-assistant.io/dashboards/sections/.
