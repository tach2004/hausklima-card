import { build } from 'esbuild';
import { readFile } from 'node:fs/promises';

export async function buildCard() {
  const { version } = JSON.parse(await readFile(new URL('../package.json', import.meta.url), 'utf8'));
  await build({
    entryPoints: ['src/index.ts'],
    outfile: 'dist/hausklima-card.js',
    bundle: true,
    format: 'esm',
    target: ['es2022'],
    minify: true,
    legalComments: 'inline',
    banner: { js: `/*! HausKlima Card v${version} | MIT License | https://github.com/tach2004/hausklima-card */` },
  });
}

if (process.argv[1] === import.meta.filename) await buildCard();
