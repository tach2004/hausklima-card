# HausKlima Card

Eine eigenständige Custom Lovelace Card für Home Assistant mit einer schematischen Gebäudeansicht. TypeScript, Lit und SVG; ohne Cloudzugriff, externe Schriftarten oder Abhängigkeit von anderen Custom Cards.

**Stand: Phase 1.** Die Karte zeigt das Gebäude, einfache Raumdetails sowie eine Übersicht weiterer Räume. Ein grafischer Editor steuert Titel, Raumnamen und Maßangaben. Das erweiterbare Raum- und Sensormodell ist vorbereitet. Die vollständige grafische Raum- und Sensorverwaltung folgt in Phase 2.

## Installation

### Mit HACS

Nach Übernahme dieses Entwicklungsstands in den Standardbranch oder Veröffentlichung eines Releases:

1. In HACS im Menü **Benutzerdefinierte Repositories** `https://github.com/tach2004/hausklima-card` hinzufügen; Typ **Dashboard** wählen.
2. **HausKlima Card** herunterladen.
3. Unter **Einstellungen → Dashboards → Ressourcen** prüfen, ob `/hacsfiles/hausklima-card/hausklima-card.js` als **JavaScript-Modul** eingetragen ist; andernfalls hinzufügen.
4. Die Browserseite neu laden und im Dashboard eine Karte **HausKlima Card** hinzufügen.

Das Repository muss für HACS öffentlich zugänglich sein. Es ist als benutzerdefiniertes Repository vorbereitet; eine Aufnahme in den HACS-Standardkatalog erfolgt dadurch nicht automatisch. HACS berücksichtigt die gebaute Datei im `dist`-Verzeichnis beziehungsweise passende Release-Dateien. Siehe die [offiziellen Dashboard-Anforderungen](https://www.hacs.xyz/docs/publish/plugin/).

**Noch offene Repository-Einstellung:** Die [allgemeinen HACS-Anforderungen](https://www.hacs.xyz/docs/publish/start/) verlangen außerdem Beschreibung und Topics auf GitHub. Beide sind derzeit leer. Unter **About → Einstellungen** am Repository ergänzen, beispielsweise die Beschreibung „Eigenständige Home-Assistant-Dashboardkarte für eine räumliche Hausklimaübersicht.“ und die Topics `home-assistant`, `hacs`, `lovelace`, `custom-card`, `typescript`. Der Änderungsversuch über die verbundene GitHub-Integration wurde mit HTTP 403 (`Resource not accessible by integration`) abgelehnt; die Dateien und der Build sind davon unabhängig vorbereitet.

### Manuell

1. `dist/hausklima-card.js` aus dem Repository oder `hausklima-card.js` aus einem Release herunterladen.
2. Als `<HA-Konfigurationsverzeichnis>/www/hausklima-card.js` ablegen. Wurde `www` neu angelegt, Home Assistant einmal neu starten.
3. Die Ressource `/local/hausklima-card.js` als **JavaScript-Modul** registrieren und den Browser neu laden.

Die [Home-Assistant-Dokumentation zur Ressourcenregistrierung](https://contributors.home-assistant.io/frontend/custom-ui/resources/) beschreibt auch die Verwaltung über YAML. Nach Aktualisierungen kann eine Versionskennung in der Ressourcen-URL den Browsercache erneuern, beispielsweise `?v=0.1.0`.

## Konfiguration

Der grafische Karteneditor unterstützt in Phase 1 alle Basisoptionen. Eine Konfiguration ohne Sensoren ist vollständig lauffähig:

```yaml
type: custom:hausklima-card
title: HausKlima
show_dimensions: true
show_room_names: true
```

| Option | Standard | Bedeutung |
| --- | --- | --- |
| `type` | erforderlich | `custom:hausklima-card` |
| `title` | `HausKlima` | Titel der Karte |
| `show_dimensions` | `true` | Bekannte Maßangaben anzeigen |
| `show_room_names` | `true` | Raumnamen in der Gebäudeansicht anzeigen |
| `building` | Vorgabegebäude | Vollständiges Gebäudemodell für Entwicklung und spätere Editor-Erweiterungen |

Die [Beispielkonfiguration](examples/basic.yaml) enthält keine Sensor-Entity-IDs. Es werden keine Messwerte simuliert. Das Modell unterstützt optionale Messarten und mehrere Sensoren je Messart; die komfortable Auswahl über HA-Entity-Selektoren ist noch nicht Teil des Editors.

## Gebäude und offene Maße

Die Ansicht zeigt die **12 m breite Traufseite** eines Hauses mit 10 m Tiefe. Der First verläuft parallel dazu. Ein schematischer Dachausschnitt macht das Dachgeschoss sichtbar; ein dreieckiger Giebel auf dieser Seite wäre falsch.

Die vorgegebenen lichten Raumbreiten und Höhen bleiben unverändert gespeichert. Wandzuordnung und verbleibende Breiten werden nicht automatisch auf 12 m umgerechnet. Die Garage steht rechts mit einem ungefähren Abstand von 5 m. Dachneigung, Wandaufbau und endgültige Schnittgeometrie bleiben offen. Die Zeichnung ist eine Übersicht und kein Bauplan. Details und die Maßprüfung stehen in [docs/architecture.md](docs/architecture.md).

## Entwicklung

Voraussetzung: Node.js ab Version 22 und npm; die CI verwendet Node.js 24. Die Laufzeitkarte benötigt weder Node.js noch einen Build auf dem Home-Assistant-System.

```sh
npm ci
npm run check
npm test
npm run build
npm run dev
```

`npm run build` erzeugt die eigenständig installierbare Datei `dist/hausklima-card.js` einschließlich Lit. Diese Datei wird mitversioniert. Die lokale Vorschau dient der Entwicklung; sie ersetzt keine Home-Assistant-Installation. Die beim Build entstehenden Lizenzhinweise müssen zusammen mit dem Bundle ausgeliefert werden.

`npm run dev` startet den Vorschau-Server unter `http://127.0.0.1:4173`. Nach Quellcodeänderungen den Befehl erneut starten. `npm run test:browser` prüft die gebaute Karte in Chromium; zuerst `npm run build` ausführen. Falls Chromium fehlt, über `npx playwright install chromium` bereitstellen oder einen bestehenden Browserpfad mit `CHROMIUM_PATH` angeben. Screenshots liegen anschließend unter `work/screenshots/`.

| Bereich | Dateien |
| --- | --- |
| Karte und SVG | `src/hausklima-card.ts` und zugehörige Ansichtsdateien |
| Visueller Editor | `src/hausklima-card-editor.ts` |
| Modell, Vorgaben, Validierung | `src/types.ts`, `src/defaults.ts`, `src/config.ts` |
| Messwertauflösung | `src/metrics.ts` |
| Tests | `tests/` |
| HACS und Auslieferung | `hacs.json`, `dist/`, `.github/workflows/` |

Die CI führt Typprüfung, Tests und Build aus und prüft, ob das eingecheckte Bundle aktuell ist. Ein gepushter Tag `v*` startet den Release-Workflow: Er prüft dieselben Schritte und veröffentlicht das Bundle als GitHub-Release-Datei. Ein Tag allein ist laut [HACS-Versionsdokumentation](https://www.hacs.xyz/docs/publish/start/#versions) noch kein Release. Dieser Entwicklungsstand erstellt weder einen Release-Tag noch einen Release automatisch.

## Prüfstand und nächste Phase

Ausgeführte Prüfungen und Grenzen der Validierung werden in [docs/validation.md](docs/validation.md) festgehalten.

Für Phase 2 sind vorgesehen:

- Wandstärken und Dachgeometrie gemeinsam klären und die Gebäudeansicht verfeinern.
- Räume grafisch verwalten und Sensoren über Home-Assistant-Entity-Selektoren zuordnen.
- Hauptsensoren, weitere Sensoren, Messwertpositionen und Sichtbarkeit grafisch konfigurieren.
- Die vorhandene Übersicht weiterer Räume ausbauen und einen Umschalter für alternative Raumebenen ergänzen.

Komplexe Animationen, aufwendige Popups und automatische Berechnung der absoluten Luftfeuchtigkeit sind in Phase 1 nicht enthalten.

## Offizielle Grundlagen

- [Home Assistant: Custom cards](https://contributors.home-assistant.io/frontend/custom-ui/card/)
- [Home Assistant: Card editor and picker](https://contributors.home-assistant.io/frontend/custom-ui/card-editor/)
- [Home Assistant: Register resources](https://contributors.home-assistant.io/frontend/custom-ui/resources/)
- [HACS: Dashboard repositories](https://www.hacs.xyz/docs/publish/plugin/)
- [HACS: Repository manifest und allgemeine Anforderungen](https://www.hacs.xyz/docs/publish/start/)

Die Quellen wurden am 13. November 2026 geprüft. Die frühere Entwickler-URL für Custom Cards leitet auf die aktuelle Home-Assistant-Contributors-Dokumentation weiter.

## Lizenz

[MIT](LICENSE), Copyright © 2026 tach2004. Die vorhandene Projektlizenz bleibt erhalten; gebündelte Bibliotheken behalten ihre eigenen Lizenzhinweise.
