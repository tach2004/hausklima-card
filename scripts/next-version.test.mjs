import test from 'node:test';
import assert from 'node:assert/strict';
import { nextVersion } from './next-version.mjs';

test('first release uses existing package version', () => {
  assert.equal(nextVersion({ currentVersion: '0.1.0' }), '0.1.0');
});
test('without labels use patch increment', () => {
  assert.equal(nextVersion({ currentVersion: '0.1.0', lastTag: 'v0.1.0' }), '0.1.1');
});
test('explicit minor and major increments', () => {
  assert.equal(nextVersion({ currentVersion: '0.1.5', lastTag: 'v0.1.5', labelNames: ['release:minor'] }), '0.2.0');
  assert.equal(nextVersion({ currentVersion: '0.2.9', lastTag: 'v0.2.9', labelNames: ['release:major'] }), '1.0.0');
});
test('conflicting labels fail safely', () => {
  assert.throws(() => nextVersion({ currentVersion: '0.1.0', lastTag: 'v0.1.0', labelNames: ['release:major', 'release:patch'] }));
});
test('non SemVer input fails', () => {
  assert.throws(() => nextVersion({ currentVersion: 'dev' }));
});
