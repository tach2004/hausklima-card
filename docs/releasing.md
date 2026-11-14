# Automatische Versionsnummern und Releases

Nach dem Merge eines Pull Requests in `main` löst `.github/workflows/release.yml` automatisch eine GitHub Action aus. **Keine automatische Veröffentlichung vor dem Merge.**

1. Arbeitskopie auf den neuesten `main`-Stand aktualisieren und Tags laden.
2. `npm ci`, `npm run check`, `npm test` und zusätzliche Versionstests.
3. SemVer-Version aus letztem `vX.Y.Z`-Tag bestimmen; ohne bisherigen Tag das vorhandene `package.json`-Feld (aktuell `0.1.0`) verwenden.
4. Standardmäßig **Patch** (+0.0.1) pro weiterem PR. Optional über **genau ein** PR-Label `release:minor` oder `release:major` erhöhen; `release:patch` ist ebenfalls möglich.
5. `package.json`, `package-lock.json` und die mit neuer Banner-Versionsnummer gebaute `dist/hausklima-card.js` aktualisieren und ggf. den Release-Commit nach `main` pushen.
6. Neues annotiertes Git-Tag `vX.Y.Z` erzeugen.
7. GitHub Release mit automatisch erzeugten Notes und der gebauten `hausklima-card.js` als Asset erstellen. HACS kann daraus Versionen anbieten.

**Wichtige Bedingungen:** GitHub Actions benötigt `contents: write`. Wenn Branch-Protection oder Rulesets automatisierte Pushes auf `main` untersagen, scheitert der Workflow: die Branch-Regeln müssen dann gezielt berücksichtigt werden; bitte **keinen** unsicheren globalen Schutz-Bypass einrichten.

Wenn Tests, Versionsberechnung oder Build fehlschlagen, wird kein Release veröffentlicht. Bei Problemen **nach** dem Versions-Commit oder Tag kann eine manuelle Prüfung nötig werden; die Action verspricht keine vollständige Transaktionssicherheit oder automatische Rückabwicklung.

Das Verhalten wird erst **nach dem Merge und einem folgenden Merge-Event** live verifiziert. Der automatisierte Token-Push startet normalerweise keine weiteren Push-Workflows (GitHub schützt so vor Rekursion). Deshalb laufen die Tests direkt innerhalb der Release-Action.

**Absichtliche Konsequenz:** Auch ein reiner Dokumentations-PR erzeugt nach dem Merge eine neue Version. Später können wir bei Bedarf ein Label `release:skip` ergänzen, dies ist bisher **nicht** eingerichtet.

Referenzen:
- https://docs.github.com/en/actions/reference/workflows-and-actions/workflow-syntax
- https://docs.github.com/en/actions/concepts/security/github_token
- https://www.hacs.xyz/docs/publish/plugin/
