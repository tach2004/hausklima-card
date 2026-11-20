# AGENTS.md

HausKlima Card ist eine eigenständige Home-Assistant-Dashboardkarte für HACS. Diese Regeln gelten für Codex und alle Mitwirkenden.

## Zusammenarbeit und Prüfungen

- Arbeite im freigegebenen Umfang auf einem separaten Branch vom aktuellen `main`. Bereite Änderungen zur Begutachtung vor. Kläre oder dokumentiere offene Anforderungen und Unsicherheiten zu Entitäts-IDs, Messwerten und unterstützten Gerätefunktionen. Verwende im Kartenbetrieb belegte Angaben.
- Erhalte bestehendes Verhalten, freigegebenes Layout, Abwärtskompatibilität und Tests im Rahmen des Auftrags. Vermeide überraschende Änderungen und wiederholt fehlerhafte Zwischencommits. Schwäche Tests nicht ab, um ein bestandenes Prüfergebnis zu erzwingen.
- Führe vor einem Push die für die Änderung vorgesehenen Prüfungen aus. Prüfe Darstellungsänderungen auf Desktop und Mobilgeräten. Berichte, welche Prüfungen tatsächlich liefen, welche bestanden oder fehlschlugen und was an einer echten Home-Assistant-Installation oder auf realen Mobilgeräten offenbleibt. Kennzeichne simulierte Prüfungen als solche.

## Datenschutz

- Behandle private Bilder, Screenshots, Konfigurationen, Logs, Prompts, Anhänge und Referenzen vertraulich. Nutze sie ausschließlich in ausdrücklich autorisierten privaten Aufgaben. Halte sie aus dem Repository, der Git-Historie, öffentlichen PRs und Issues, Demos, Testdaten, Screenshots, GitHub-Actions-Artefakten und Releases heraus.
- Erstelle öffentliche Grafiken eigenständig und generisch. Verwende synthetische Geräte, Entitäten und Messwerte sowie neutrale Geräte- und Quellennamen. Kennzeichne Demowerte. Zeichne keine reale Grundstücksgeometrie nach. Aus private Bildern erzeugte Ausschnitte, Nachzeichnungen und stilistische Bearbeitungen bleiben vertraulich.
- Veröffentliche keine identifizierbaren Grundstücksgeometrien, Luftbilder, Screenshots aus Nutzerinstallationen, Adressen, Koordinaten, Personennamen, privaten Kontaktdaten, privaten IP-Adressen, Hostnamen oder MAC-Adressen, Zugangsdaten, Kontodaten, installationsspezifischen Sensor-, Geräte- oder Entitäts-IDs und vertraulichen Prüfbefunde.

## Prüfung vor Veröffentlichung

- Prüfe vor Push, PR, Merge oder Release den vollständigen Diff, gestagte Dateien und jeden Commit, der dadurch öffentlich erreichbar wird. Prüfe auch Zwischencommits, deren Inhalte später geändert oder gelöscht wurden. Kontrolliere Dateinamen, Dokumentation, Codekommentare, Testdaten, UI-Beispiele, Bilder, Build- und Release-Artefakte sowie PR- und Release-Texte.
- Prüfe die tatsächlichen Git-Metadaten. Dazu gehören Autor- und Committername, beide E-Mail-Adressen, Zeitstempel und Zeitzonen, Commit-Nachrichten und Einträge wie `Co-authored-by` und `Signed-off-by`. Prüfe bei Tags auch Namen, Nachrichten und gegebenenfalls Tagger-Daten. Verwende als Autor und Committer den vorgesehenen öffentlichen Accountnamen oder ein freigegebenes Pseudonym und eine `noreply`-Adresse. Private Namen und E-Mail-Adressen gehören auch dann nicht in Commits, wenn GitHub sie in der Oberfläche ausblendet.
- Prüfe Branch-Namen und eingebettete Dateimetadaten wie EXIF- und GPS-Daten, Dokumentautor, lokale Dateipfade und Angaben in Source Maps. Lies Texte und sichte jedes Bild zusätzlich zu den automatischen Prüfungen manuell. Behalte Datenschutzmaßnahmen auch bei fehlgeschlagener CI bei.
- Stoppe die Veröffentlichung bei einem Datenschutzfund. Melde private Daten in bereits öffentlichen Commits vertraulich. Beschreibe die Entfernung öffentlich mit neutralen Begriffen, damit Dateinamen oder Kennungen nicht erneut offengelegt werden. Frühere Commits, Forks und Caches können die Daten weiterhin enthalten.

## HausKlima Card

- Verfasse Berichte und PR-Beschreibungen auf Deutsch. Merge und Release übernimmt der Projektinhaber.
- Beschränke die README auf Beschreibung, Beispielbild und Einrichtung. Verwende neutrale Geräte- und Quellennamen in öffentlichen Texten, Standardbeschriftungen, Testdaten und Bildern. Raumbezeichnungen wie „Schlafzimmer“ sind zulässig.
- Erhalte die Grafikdateien unter `src/assets/` bytegenau. Stelle Messwerte und Beschriftungen als separate Overlays dar.
- Erhalte gespeicherte Raum-IDs, Sensorzuordnungen, Namen, Sichtbarkeit und Positionen. Geräte und Sensoren werden im grafischen Editor eingerichtet. Zeige in der installierten Karte nur tatsächliche Messwerte. Verwende getrennte, gekennzeichnete Demodaten für Vorschauen und Screenshots.
- Der Build erzeugt `dist/hausklima-card.js`. Halte das Bundle mit dem Quellcode synchron und erhalte die Lizenzhinweise.
- Prüfe Darstellungsänderungen auf Desktop und Mobilgeräten jeweils in heller und dunkler Ansicht.
