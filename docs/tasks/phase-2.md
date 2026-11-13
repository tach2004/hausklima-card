# Phase 2 — HausKlima: Design B + nutzbarer Sensor-Editor

Status: **durch Projektinhaber für die Implementierung freigegeben**, aber **erst starten, wenn diese Aufgabenbeschreibung samt Designreferenzen auf `main` gemergt wurde**. Stand 2026-11-13.

## Ausgangslage
PR #1 (`feat/phase-1-foundation`) ist gemergt. Das Grundgerüst und Sensordatenmodell existieren, aber die aktuelle UI zeigt eine schraffierte, technische Zeichnung ohne nützliche Klimawerte, mit übergroßem Header und horizontal abgeschnittener Garage. `src/hausklima-card-editor.ts` bietet bisher nur Titel-/Beschriftungs-/Maß-Toggles. Diese Probleme sind der Anlass für Phase 2.

## Vorher lesen
1. `AGENTS.md`
2. `docs/design/README.md`
3. **Alle vier Bildreferenzen tatsächlich visuell betrachten:** `docs/design/design-b-selected-photo.webp` (gewählter hochwertiger Bildstil), `docs/design/design-b-dark-chip.webp` (dunkles Messwertfeld), sowie `docs/design/design-b-desktop.svg` und `docs/design/design-b-mobile.svg` (editierbare Desktop-/Mobil-Kompositionsvorlagen). Nicht nur SVG-Quelltext lesen.
4. `docs/architecture.md`, `README.md`, `src/types.ts`, `src/config.ts`, `src/hausklima-card-editor.ts`
5. `examples/views/panel.yaml` und `examples/views/sections.yaml`

## Ziel / Abnahmeprinzip
Erstmals eine **wirklich benutzbare und schöne Hausklima-Übersicht** liefern. Das Projekt darf nach Phase 2 **kein reiner geometrischer Platzhalter mehr** sein: Sensoren müssen vollständig über den Lovelace-GUI-Editor zuweisbar sein und echte HA-Zustände müssen in der Haus-/Raumansicht erscheinen. Die SVG-Designreferenzen sind verbindliche **gestalterische Zielbilder**, nicht als statisches Hintergrundbild einzubauen.

## A. Gestalterische Überarbeitung — höchste Priorität
- Vom Nutzer ausgewählt: **Design B (räumlicher Architektur-Cutaway)**, aber **dunkle, kontrastreiche, gut lesbare Messwert-Kästchen** statt der weißen, halbtransparenten Demo-Karten.
- Dezente perspektivische Tiefe, Dachtextur, warme Raumfarben, vereinfachte Raum-Ausstattung/Einrichtung, dünne Konturen, angenehme Schatten. Perfektion nicht mit Performance oder Lesbarkeit verwechseln.
- Das Wohnhaus und die freistehende Garage rechts müssen in der Desktop-Panelansicht **vollständig** im sichtbaren Bereich liegen. Kein abgeschnittenes Gebäude und keine aufwendige waagerechte Scrollleiste als Standard. Bei begrenztem Platz lieber eine bewusst andere Anordnung wählen (z.B. Außen-/Garagenblock unter statt neben dem Haus).
- Header maximal kompakt: kein übergroßes Branding, keine sinnlosen Metazeilen, keine Schraffur-Erklärung in der Hauptansicht. Maße/technische Hinweise nur optional in Details/Einstellungen.
- Temperatur und relative Feuchte als primäre Werte direkt in den Räumen; optional absoluter Feuchtewert, CO₂ und VOC im Raum, wenn explizit aktiviert oder in Raumdetails.
- Dunkle Panels: **leicht transparente schwarze/anthrazitfarbene Hintergrundfläche** (Anfangswert etwa `rgba(22,26,30,0.82)` als justierbarer Designvorschlag), sodass man den Raum dezent dahinter erkennt. **Nicht das gesamte Panel per `opacity` transparent machen**: Schrift, Zahlen und Icons müssen voll deckend und gut kontrastiert bleiben. Falls sinnvoll leichtes Backdrop-Blur mit WebKit/Safari-Fallback. Ausreichende Abstände, visuelle Hierarchie und saubere Zahlen-/Einheitendarstellung. Farben sind nicht alleiniger Informationsträger.
- Die 12-m-**Traufseite** ist sichtbar, der Dachfirst parallel dazu! Die Visual-Mockups können rein illustrativ Details zeigen: **keinen frontalen Giebel auf die 12-m-Seite übertragen**. Das Dach bleibt eine plausible, schematische Cutaway-Grafik ohne erfundene reale Dachneigung.
- Keine reale Fotografie oder extern nachgeladenen Bilder, Fonts oder APIs nötig. Design-Mockups dienen nur der Zielabstimmung und dürfen **nicht** als starres Hintergrund-Screenshot in der produktiven Card verwendet werden.
- Die Garage ist ein eigenständiger Klima-Messort; Außenmesswerte bekommen einen separaten Bereich. Echte konfigurierbare Räume bleiben in der Übersicht vollständig erreichbar.

## B. Grafik- und Bedienkonzept
- Raum anklicken/tippen → Details zu **allen zugeordneten Messwerten** inklusive Quelle, Anzeigename, aktuellem Status/Einheit, Hauptsensor und weiteren Sensoren derselben Messwertart.
- Temperatur-/Feuchtigkeits-Chips direkt in geeigneten Räumen platzieren, schmale Räume und sich überlagernde Chips mit sinnvoller responsiver Lösung behandeln.
- Konfiguriertes Messgerät `unavailable` / `unknown` / fehlend sichtbar als eigener Zustand, aber **nicht konfigurierte** Messart ganz ausblenden.
- Außenmessort: mehrere Temperatur- und Feuchtesensoren (Beispiel Homematic/Ecowitt), bevorzugten Hauptsensor und alle Einzelwerte in Details; nicht auf einen einzelnen Außensensor beschränken.
- Weitere/verdeckte Räume: **Variante A ist Bestandteil dieser Phase**: eigenständige nutzbare Raumübersicht, sodass Räume auch ohne festen Platz im Cutaway bedienbar sind. Architektur für Variante B ('Vorne/Hinten' bzw. Raumebenenumschalter) beibehalten, Umschaltung **erst in Phase 3**.
- Keine eingeschränkte feste Anzahl an Sensoren je Raum; flexible Listen.
- Raum- und Messwert-Kästchen dürfen sich nicht überlappen oder unlesbar werden. Bei Platzmangel auf kompakte Markierungen/Detailbereich ausweichen.

## C. Grafikfähiger Lovelace-Konfigurationseditor — zwingend in Phase 2
**Ohne YAML-Bearbeitung** müssen mindestens folgende Workflows im echten HA-Karteneditor möglich sein:
1. Bestehenden Raum (Werkstatt, Flur, Wohnzimmer etc.) auswählen; Garage ebenfalls.
2. Messart auswählen: Temperatur, relative Feuchte, absolute Feuchte, CO₂, VOC.
3. HA-Entity über einen geeigneten nativen Entity-Selector / `ha-selector` auswählen, nicht per erzwungener Freitexteingabe. Verhalten und API anhand aktueller Home-Assistant-Dokumentation bzw. vorhandener Frontend-Komponenten absichern.
4. Weitere Entity derselben Messart hinzufügen, umbenennen, entfernen und als **Hauptsensor** markieren.
5. Messart und Hauptanzeige individuell ein-/ausblenden; sekundäre Sensoren weiterhin in der Detailansicht auffindbar halten.
6. Außenmessort und weitere (nicht im Schnitt sichtbare) Räume hinzufügen/auswählen; Raumnamen bearbeiten; hinzufügen/löschen mit sicherer Validierung und nachvollziehbarem UI. Garage nicht unbeabsichtigt duplizieren.
7. Bei Editoränderungen korrekte `config-changed`-Events senden, die bestehende HA-Konfiguration und unbekannte Lovelace-Felder erhalten. Nach Speichern und Dashboard-Neuladen müssen sämtliche Zuordnungen erhalten bleiben.

Optional wenn robust und ohne Überfrachtung: Messwert-Chip-Position im Raum konfigurieren. Wenn das nicht sauber machbar ist, in einer dokumentierten nächsten Phase statt als fehlerhaftes Halbfertig-Feature.

## D. Mobile-First — iPhone 17
Das **iPhone 17** ist ein explizit unterstützter Haupt-Anwendungsfall, nicht eine später verkleinerte Desktopkopie.
- Hochformat und Querformat, Touch statt Hover; Touch-Ziele angemessen groß, kein abgeschnittener Text, keine horizontale Seitenlaufleiste.
- Auf schmalen Bildschirmen darf die Darstellung **bewusst umgebaut** werden: kompakte Gebäudegrafik/Etagen, klare Raumauswahl und große Messwerte in separaten Raumdetails oder Karten darunter. Der Zugang zu **allen** konfigurierten Räumen und Messwerten bleibt erhalten.
- Kein erzwungenes horizontal scrollendes SVG mit `min-width:670px`; diese bisherige Einschränkung beheben.
- Teste responsive Breiten wie 360 / 390 / 430 / 768 / 1280 / 1440 CSS-Pixel; zusätzlich Hoch-/Querformat in Browser-Emulation. Bei verfügbarer WebKit-Engine auch Safari/WebKit prüfen; **echter iPhone-Test ist davon zu unterscheiden**.
- Teste Light + Dark Theme; Kontrast und Lesbarkeit dürfen in beiden nicht verloren gehen. Keine Maus-only-Aktion.

## E. Dashboard-Einrichtung
- Erste Wahl: separate Home-Assistant-**Panel**-Ansicht mit **genau einer** `custom:hausklima-card`.
- Zweite Möglichkeit: **Sections** mit einer ausreichend breiten Sektion. In beiden muss die Karte angemessen responsiv sein.
- Halte die beiden Beispiel-View-YAMLs unter `examples/views/` aktuell, erkläre ihren Einfügekontext präzise: es sind **Ansichtsobjekte**, nicht nackte Karten-YAMLs und keine gesamten Dashboards.
- Visueller Karteneditor ist die Standard-Einrichtung; YAML-Dateien sind nur eine Bequemlichkeitsoption. Automatisches Anlegen einer Dashboard-Ansicht durch HACS ist **nicht** zugesichert oder Teil dieser Phase.

## F. Qualität und Kompatibilität
- Keine verpflichtenden weiteren HACS-Integrationen. Kein Aufruf externer Cloud-/Bild-URLs zur Laufzeit.
- Ältere Phase-1-Kartenkonfigurationen müssen weiter funktionieren. Voreingestellte Gebäude-/Raumdaten und stabile IDs unverändert lassen.
- Nutze Hausmaße aus `AGENTS.md` und `docs/architecture.md`; alle nicht geklärten Maße bleiben offen, werden nicht stillschweigend ausgeglichen oder als baulich exakt ausgegeben.
- Beispielzahlen dürfen in **separaten Designreferenzen/Tests** vorkommen, müssen dort ausdrücklich `DEMO-WERTE` heißen. In der tatsächlich installierten Karte **niemals erfundene Messwerte** anzeigen.
- Teste live wechselnde `hass.states`, mehrere Sensoren gleichen Typs, korrektes Primärsensorverhalten, Leerzustände, unbekannte Entität, `unknown`, `unavailable`, Dashboard-Reload, Editorkonfigurationspersistenz.
- Stelle nachvollziehbare Desktop-/Mobile-Screenshots des tatsächlich **implementierten** Codes bereit, nicht nur der Mockups.
- Führe `npm ci`, Typecheck, Tests, Build und wenn möglich Browser-Tests aus. Melde explizit, was mangels echter HA-Instanz / echtem iPhone **nicht** validiert wurde.

## G. Abgrenzung
**Nicht in Phase 2:** vollständige Rückseiten-3D-Modellierung, Vorder-/Rückseitenumschalter, individuelle exakte Gebäudedurchdringung, automatische absolute-Feuchteberechnung, umfangreiche historische Charts, fremde Dashboard-Integrationen, automatisch durch HACS erzeugte Dashboard-Views.

**Wichtig:** Das Ergebnis muss in der Nutzerinstallation einen echten Fortschritt darstellen: schöne Räume **und** per GUI konfigurierbare echte HA-Klimasensoren.

## Codex-Arbeitsablauf
1. Auf aktualisiertem `main` arbeiten; Repository `tach2004/hausklima-card` prüfen, keine fremden Projekte verändern.
2. Dokumente und SVG-Designvorlagen **ansehen und interpretieren**.
3. In kleinem, eigenen Feature-Branch implementieren.
4. Erforderliche Tests und Screenshots erzeugen, PR gegen `main`, niemals selbst mergen.
5. Im PR exakt beschreiben, welche Anforderungen erfüllt sind und welche offen bleiben.
