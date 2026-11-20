# Releases

Der Release-Workflow startet nach dem Merge eines Pull Requests in `main`. Er prüft den Code, bestimmt die nächste SemVer-Version und baut `dist/hausklima-card.js` mit dieser Versionsnummer.

Standardmäßig steigt die Patch-Version. Für einen anderen Versionssprung kann genau eines der Labels `release:minor`, `release:major` oder `release:patch` verwendet werden.

Der Workflow aktualisiert die Versionsdateien, erstellt einen Tag und veröffentlicht die gebaute JavaScript-Datei als Release-Asset für HACS. Auch ein reiner Dokumentations-PR löst diesen Ablauf nach dem Merge aus. Bei einem fehlgeschlagenen Lauf sollten Versionscommit, Tag und Release vor einem erneuten Start abgeglichen werden.

Details stehen im [Release-Workflow](../.github/workflows/release.yml).
