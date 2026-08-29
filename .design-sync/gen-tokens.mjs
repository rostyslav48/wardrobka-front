// Generates the synthetic tokens package the converter copies into ds-bundle/tokens/.
// Source of truth stays theme/colors.ts + theme/layout.ts - this only transcribes
// them to CSS custom properties so designs built with the DS can reference them.
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

const root = new URL('..', import.meta.url).pathname;
const out = join(root, '.design-sync/.cache/nm-scratch/node_modules/wardrobe-tokens');
const kebab = (s) => s.replace(/([a-z0-9])([A-Z])/g, '$1-$2').toLowerCase();

const pairs = [];
for (const [, k, v] of readFileSync(join(root, 'theme/colors.ts'), 'utf8')
  .matchAll(/^\s*(\w+):\s*'([^']+)',/gm)) pairs.push([`--wa-${kebab(k)}`, v]);
for (const [, k, v] of readFileSync(join(root, 'theme/layout.ts'), 'utf8')
  .matchAll(/export const (\w+) = (\d+);/g)) pairs.push([`--wa-${kebab(k)}`, `${v}px`]);

mkdirSync(out, { recursive: true });
writeFileSync(join(out, 'package.json'), JSON.stringify({ name: 'wardrobe-tokens', version: '1.0.0', private: true }, null, 2) + '\n');
writeFileSync(
  join(out, 'tokens.css'),
  `/* Generated from theme/colors.ts + theme/layout.ts by .design-sync/gen-tokens.mjs. */\n:root {\n${pairs
    .map(([k, v]) => `  ${k}: ${v};`)
    .join('\n')}\n}\n`,
);
console.log(`wrote ${pairs.length} tokens`);
