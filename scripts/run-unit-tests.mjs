import { build } from 'esbuild';
import { readdir, rm, mkdir } from 'node:fs/promises';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { resolve } from 'node:path';

const output = resolve('.unit-tests');
await rm(output, { recursive: true, force: true });
await mkdir(output, { recursive: true });
const entryPoints = (await readdir('tests')).filter((file) => file.endsWith('.test.ts'))
  .map((file) => `tests/${file}`);
if (!entryPoints.length) throw new Error('No unit tests discovered');
await build({
  entryPoints, outdir: output, outbase: 'tests',
  platform: 'node', format: 'esm', target: 'node24', bundle: true,
  packages: 'external', outExtension: { '.js': '.mjs' },
  loader: { '.webp': 'dataurl' }, logLevel: 'warning',
});
const preload = fileURLToPath(new URL('./unit-test-dom.mjs', import.meta.url));
const cli = resolve('node_modules/@playwright/test/cli.js');
const proc = spawnSync(process.execPath, [cli, 'test', '--config=scripts/playwright.unit.config.mjs'], {
  stdio: 'inherit', env: { ...process.env,
    NODE_OPTIONS: [process.env.NODE_OPTIONS, `--import=${preload}`].filter(Boolean).join(' '),
  },
});
await rm(output, { recursive: true, force: true });
if (proc.error) throw proc.error;
process.exitCode = proc.status ?? 1;
