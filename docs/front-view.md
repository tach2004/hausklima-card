# Entwicklung der Vorderansicht

Dieser Entwicklungszweig basiert auf der unveränderten stabilen Rückansicht.
Der Knopf **Vorderansicht** oben links dreht zur neuen Hausseite, der Knopf
**Rückansicht** dreht zurück. Beim Öffnen ist immer die Rückansicht aktiv.

## Raumstruktur und Datentrennung

Die Vorderansicht enthält ausschließlich Erd- und Dachgeschoss:
Gästezimmer (ca. 3,51 m), Badezimmer EG (2,16 m), Treppenhaus/Haustür
(2,39 m), Wohnzimmer (2,76 m), Büro DG (3,6 m), Bad DG (2,5 m),
Heizungsraum (1,0 m), Treppenhaus DG (1,0 m) und Balkon (2,7 m).
Alle Maße sind angenähert und werden **nicht** als geprüfte Bauzeichnung ausgegeben.
Die Treppenhauskästchen haben eine vertikal ausgerichtete Bildmitte;
das Dachfenster liegt in der Illustration über dem Dachgeschossbad.

Alle Vorderseitenräume haben eigene `front_...`-IDs und individuelle Entitäten,
Gruppen, Sichtbarkeiten und Desktop-/Handy-Kästchenpositionen.
Die vorhandenen Kellerräume bleiben ausschließlich Teil der Rückansicht.

Garage, Schaltschrank, Pylontech, LiTime und Außenmessorte werden aus
`building.rooms` auf **beiden Seiten gemeinsam** verwendet – dieselben
Sensor-Entitäten müssen daher nur einmal konfiguriert werden.
Garage, Batterien, Schaltschrank und Außenmessorte verwenden außerdem **dieselben
Desktop- und Handy-Kästchenpositionen auf beiden Hausseiten** (`badge_positions`).
Gesonderte `front_badge_positions` gelten nur für die neun Vorderseitenräume.
Vorherige gesonderte Vorderseiten-Positionen gemeinsamer Messorte werden
nicht mehr angewendet; die Rückseiten-Positionen bleiben die Referenz.

Die Vorderansicht verwendet die genehmigte Hausfront und den bestehenden
Garagenbereich rechts aus der ursprünglichen Rückseiten-Illustration
als zwei lokal zusammengesetzte Bildschichten. Der Umschaltbutton bleibt auf
Desktop und Handy innerhalb des Bildrahmens. Der Positionseditor zeigt die
gleiche Zusammensetzung.

Die Hausgrafiken werden lokal als WebP im ausgelieferten JavaScript eingebettet.
Externe Bild- oder Entitätsdienste sind nicht erforderlich. Die bisherige
Rückseitenillustration wird nicht bearbeitet.

## HACS-Test ohne Änderung an main

In einer vorhandenen HACS-Installation kann die öffentliche Branch-Version
über Home Assistants Aktion `update.install` mit dem Versionsfeld
`Vorderansicht` installiert werden. Dazu als Ziel die zu dieser Karte gehörende
Update-Entität auswählen. Die angebotene Versionsauswahl der normalen
HACS-Redownload-Oberfläche zeigt gewöhnlich Releases und den Default-Branch,
nicht unbedingt alle weiteren Branches.

Der GitHub-Default-Branch **muss nicht verändert werden**.
Eine Branch-Installation ersetzt allerdings die derzeit installierte
`hausklima-card.js` im Home Assistant; sie ist **keine parallele zweite Karte**.
Die Dashboardkonfiguration vorher sichern. Zur Rückkehr die zuvor verwendete stabile Release-Version über dieselbe Aktion installieren und den
Browsercache der Karte neu laden. Für unabhängige Paralleltests ist eine
separate HA-Testinstanz der sicherere Weg.

Diese Entwicklung wird zunächst nur über den PR nach `main` vorbereitet.
Ohne ausdrücklich bestätigten Merge gibt es kein stabiles Release.
