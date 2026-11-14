// Compute the next release version. Called by GitHub Actions after a merged PR.
import { readFileSync } from 'node:fs';

const VERSION_RE = /^v?(\d+)\.(\d+)\.(\d+)$/;

export function parseVersion(value) {
  const match = VERSION_RE.exec(value);
  if (!match) throw new Error(`Ungültige SemVer-Version: ${value}`);
  return match.slice(1).map(Number);
}

export function nextVersion({ currentVersion, lastTag = '', labelNames = [] }) {
  // No release yet: publish the version declared in package.json without inventing a new baseline.
  if (!lastTag) {
    parseVersion(currentVersion);
    return currentVersion.replace(/^v/, '');
  }
  const [major, minor, patch] = parseVersion(lastTag);
  const bumps = ['release:major', 'release:minor', 'release:patch'].filter((label) => labelNames.includes(label));
  if (bumps.length > 1) throw new Error('Mehrere inkompatible Release-Labels gefunden.');
  if (bumps[0] === 'release:major') return `${major + 1}.0.0`;
  if (bumps[0] === 'release:minor') return `${major}.${minor + 1}.0`;
  return `${major}.${minor}.${patch + 1}`;
}

if (process.argv[1] && import.meta.url === new URL(`file://${process.argv[1]}`).href) {
  const pkg = JSON.parse(readFileSync(new URL('../package.json', import.meta.url), 'utf8'));
  const labels = JSON.parse(process.env.PR_LABELS_JSON || '[]').map((entry) => entry.name);
  process.stdout.write(nextVersion({ currentVersion: pkg.version, lastTag: process.env.LAST_RELEASE_TAG || '', labelNames: labels }));
}
