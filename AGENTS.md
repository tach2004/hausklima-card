# AGENTS.md

HausKlima Card ist eine eigenständige Home-Assistant-Dashboardkarte für HACS. Verwende Deutsch für Berichte und PR-Beschreibungen.

- Arbeite auf Basis des aktuellen `main` und bereite Änderungen in einem separaten Branch vor. Merge und Release bleiben beim Projektinhaber.
- Halte die README auf Beschreibung, Beispielbild und Einrichtung beschränkt. Verwende in öffentlichen Texten, Standardbeschriftungen, Testdaten und Bildern neutrale Geräte- und Quellennamen. Raumbezeichnungen wie Schlafzimmer sind zulässig.
- Erhalte die Grafikdateien unter `src/assets/` bytegenau. Messwerte und Beschriftungen sind getrennte Overlays.
- Erhalte gespeicherte Raum-IDs, Sensorzuordnungen, Namen, Sichtbarkeit und Positionen. Geräte und Sensoren werden im grafischen Editor eingerichtet. Ergänze keine erfundenen Messwerte in der installierten Karte.
- Nutze getrennte, als Demowerte erkennbare Daten für Vorschau und Screenshots. Veröffentliche keine privaten Kontaktdaten, echten Sensor-IDs oder vertraulichen Prüfbefunde.
- Der Build erzeugt `dist/hausklima-card.js`. Halte Bundle und Quellcode in Einklang und erhalte die Lizenzhinweise.
- Führe die für Änderungen vorgesehenen Prüfungen aus. Bei Änderungen an der Darstellung prüfe Desktop und Handy in hellen und dunklen Ansichten. Nenne die tatsächlich durchgeführten Prüfungen.
