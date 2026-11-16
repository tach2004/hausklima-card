# Sicherheit und Datenschutz

Dieses Repository ist öffentlich. Git-Commits enthalten Metadaten des Autors und Committers (Name **und E-Mail-Adresse**), unabhängig vom aktuellen Dateiinhalt.

## Vor dem Commit

Den öffentlichen Namen **Ta Ch** kann man beibehalten. Als E-Mail-Adresse bitte **ausschließlich die persönliche GitHub-`noreply`-Adresse** aus *GitHub → Settings → Emails* eintragen:

```sh
git config --local user.name "Ta Ch"
git config --local user.email "DEINE_EXAKTE_GITHUB_NOREPLY_ADRESSE"
git config --local --get user.name
git config --local --get user.email
```

Diese Einstellungen gelten für das **jeweilige Git-Repository bzw. die jeweilige Laufzeitumgebung**. Insbesondere bei Codex/ChatGPT, anderen Cloud-Workspaces und CI-Bots zusätzlich die dort verwendeten Commit-Metadaten prüfen. Im GitHub-Konto unter *Settings → Emails* die Funktion **Keep my email addresses private** aktivieren und, falls verfügbar, **Block command line pushes that expose my email**. Diese Optionen können andere Commit-Ersteller nicht in allen Fällen daran hindern, selbst private Metadaten zu setzen.

Die CI prüft in neuen PR-Commits beide Adressen (Autor und Committer). Der öffentliche Name bleibt frei wählbar. GitHub-`noreply` verhindert das erneute Offenlegen der privaten Kontaktadresse.

## Umgang mit vertraulichen Dateien

Keine echten Zugangsdaten, API-Token, Schlüssel, Heimnetzadressen, persönliche Kontaktdaten, produktiven Dashboard-Konfigurationen, persönlichen Fotos, Grundstückszeichnungen oder Home-Assistant-Screenshots in das öffentliche Repository aufnehmen. Vor dem Hochladen von Bildern auch sichtbare Details und Metadaten prüfen. In Beispielen nur klar als Testdaten markierte Werte verwenden.

`.gitignore` schützt nicht vor der Veröffentlichung **bereits getrackter** Dateien und nicht vor Git-Metadaten. CI prüft typische Secrets und E-Mail-Adressen in getrackten Textdateien, jedoch keine Binärbilder, seltenen Tokenformate oder sämtliche denkbaren vertraulichen Informationen. GitHubs Secret Scanning/Push Protection sind zusätzlich empfehlenswert.

## Historische Git-Metadaten

Ein normaler PR entfernt **keine** E-Mail-Adresse aus früheren Commits. Eine sichere Bereinigung ist ein eigener Prozess: vollständige Bestandsaufnahme über Tags/Branches/PRs, abgestimmtes Rewrite, Neubewertung von Releases und möglichen Caches/Forks. Wegen der bestehenden HACS-Releases wird hier **keine Git-Historie umgeschrieben und kein Force-Push** durchgeführt.

Offizielle Anleitung: https://docs.github.com/en/authentication/keeping-your-account-and-data-secure/removing-sensitive-data-from-a-repository

## Prüfung

Die PR-CI führt `npm ci`, `npm audit --audit-level=low`, die Datenschutzprüfung, TypeScript-Check, Unit-Tests, Bundle-Vergleich und Chromium-Browser-Tests aus. Grafik, UI, Sensoren, Home-Assistant-Verhalten, Hausbild und die versionierte HACS-JS-Datei werden bei dieser Änderung **nicht** verändert. Ein echter Home-Assistant-/iPhone-Test ist durch CI nicht ersetzt.
