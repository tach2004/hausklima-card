# Aufbau der Karte

HausKlima Card ist eine Lit-Komponente für das Home-Assistant-Dashboard. Die Karte liest konfigurierte Entitäten aus `hass.states`. Der Karteneditor verwendet die native Entitätsauswahl von Home Assistant und gibt Konfigurationsänderungen als `config-changed` zurück.

Die lokal eingebetteten Hausgrafiken in `src/assets/` bilden Vorder- und Rückansicht. Die Kästchen liegen als getrennte HTML-Elemente darüber. Räume und Messorte können unabhängig von den vorgezeichneten Räumen hinzugefügt und auf dem Bild verschoben werden.

## Gespeicherte Konfiguration

- `building.rooms` enthält die Räume der Rückansicht und die gemeinsamen Garagen- und Außenmessorte. `front_rooms` enthält die Räume der Vorderansicht.
- `badge_positions` enthält die Positionen der Rückansicht und der gemeinsamen Messorte. Für Räume der Vorderansicht gilt `front_badge_positions`. Beide Felder speichern relative Bildkoordinaten getrennt nach Desktop und Handy.
- Jede Messart kann mehrere Entitäten haben. Sensorname, Gruppe und Sichtbarkeit sind pro Quelle konfigurierbar. Die Details bleiben über den jeweiligen Messort erreichbar.
- Ältere Gerätekennungen werden bei der Zuordnung zu Bildankern berücksichtigt. Bestehende Konfigurationen behalten ihre Kennungen, Anzeigenamen und Einstellungen.

Das HACS-Bundle `dist/hausklima-card.js` enthält die Karte einschließlich beider Hausgrafiken. Die lokale Vorschau nutzt separate Demodaten und eine Nachbildung der nativen Entitätsauswahl.
