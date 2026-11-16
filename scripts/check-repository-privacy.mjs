import { execFileSync } from 'node:child_process';
import { readFileSync } from 'node:fs';

const paths = execFileSync('git', ['ls-files', '-z']).toString('utf8').split('\0').filter(Boolean);
const patterns = [
  ['private key', /-----BEGIN (?:RSA |EC |OPENSSH |DSA |ENCRYPTED )?PRIVATE KEY-----/g],
  ['GitHub access token', /(?:ghp_|gho_|ghu_|ghs_|ghr_|github_pat_)[a-zA-Z0-9_]{20,}/g],
  ['AWS access key', /(?:AKIA|ASIA)[A-Z0-9]{16}/g],
  ['Stripe secret key', /sk_(?:live|test)_[A-Za-z0-9]{16,}/g],
  ['password assignment', /\b(?:password|api_key|access_token|client_secret)\s*[:=]\s*["'](?!EXAMPLE|PLACEHOLDER|YOUR_)[^"']{10,}["']/gi],
];
const allowedEmailDomains = new Set(['users.noreply.github.com', 'github.com', 'example.com', 'example.org', 'example.net', 'localhost', 'invalid']);
const findings = [];
for (const path of paths) {
  if (/\.(?:png|jpe?g|webp|gif|ico|pdf|woff2?|ttf|otf)$/i.test(path)) continue;
  const content = readFileSync(path);
  if (content.includes(0)) continue;
  const source = content.toString('utf8');
  for (const [description, regex] of patterns) {
    regex.lastIndex = 0;
    for (const match of source.matchAll(regex)) {
      const line = source.slice(0, match.index).split('\n').length;
      findings.push(`${path}:${line}: possible ${description}`);
    }
  }
  const emailRegex = /[A-Z0-9._%+-]+@(?:[A-Z0-9-]+\.)+[A-Z]{2,}/gi;
  for (const match of source.matchAll(emailRegex)) {
    const domain = match[0].split('@')[1].toLowerCase();
    if (!allowedEmailDomains.has(domain)) {
      const line = source.slice(0, match.index).split('\n').length;
      findings.push(`${path}:${line}: non-example email address`);
    }
  }
}
if (findings.length) {
  for (const finding of findings) console.error(`::error::${finding}`);
  process.exitCode = 1;
} else {
  console.log(`Checked ${paths.length} tracked files: no matching secrets or personal email patterns.`);
}
