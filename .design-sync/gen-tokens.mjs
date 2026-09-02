// Generates the synthetic tokens package the converter copies into ds-bundle/tokens/.
// Source of truth stays theme/colors.ts + theme/layout.ts - this only transcribes
// them to CSS custom properties so designs built with the DS can reference them.
//
// It type-strips both files and imports the result, rather than reading them with
// a regex: the scale in theme/layout.ts is nested objects now, and a regex that
// stops matching produces zero tokens and a green build. The floor check at the
// bottom is the second half of that guard.
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { join } from 'node:path';

const root = new URL('..', import.meta.url).pathname;
const out = join(root, '.design-sync/.cache/nm-scratch/node_modules/wardrobe-tokens');
const notesPath = join(root, '.design-sync/NOTES.md');

// `typescript` is a tracked devDependency of this repo, so `npm ci` provisions it
// and it is pure JS - no platform-specific binary to go missing on another OS.
// Resolution starts at the repo root on purpose, not at .design-sync/, whose
// node_modules is a symlink into the gitignored .ds-sync toolkit.
const ts = createRequire(new URL('../package.json', import.meta.url))('typescript');

const kebab = (s) => s.replace(/([a-z0-9])([A-Z])/g, '$1-$2').toLowerCase();

// theme/layout.ts group -> token prefix, where the two differ.
const GROUP_PREFIX = { typography: 'type' };
// theme/layout.ts typography sub-key -> token suffix.
const SUB_KEY = { fontSize: 'size', fontWeight: 'weight', lineHeight: 'line-height' };

// Type-strip to ESM and import from a data: URL. The theme files carry only
// type-only imports, so nothing needs resolving; if that ever stops being true
// the check below fails loudly instead of importing a half-built module.
const load = async (src) => {
  const { outputText } = ts.transpileModule(readFileSync(join(root, src), 'utf8'), {
    fileName: src,
    compilerOptions: { module: ts.ModuleKind.ESNext, target: ts.ScriptTarget.ESNext },
  });
  if (/^\s*(?:import|export)\b[^\n]*\bfrom\b/m.test(outputText)) {
    throw new Error(`${src} has a runtime import; theme files must stay dependency-free`);
  }
  return import(`data:text/javascript,${encodeURIComponent(outputText)}`);
};

const { colors } = await load('theme/colors.ts');
const layout = await load('theme/layout.ts');

const pairs = [];
const seen = new Set();
const push = (name, value) => {
  if (seen.has(name)) throw new Error(`duplicate token ${name}`);
  seen.add(name);
  pairs.push([name, value]);
};
const render = (value) => {
  if (typeof value === 'number') return `${value}px`;
  if (typeof value === 'string') return value;
  throw new Error(`unsupported token value ${String(value)}`);
};

// theme/colors.ts is the flat, unprefixed namespace: --wa-background, --wa-brand.
for (const [key, value] of Object.entries(colors)) push(`--wa-${kebab(key)}`, render(value));

// theme/layout.ts: a bare export keeps its own name (--wa-page-inline-intent),
// a grouped one becomes --wa-<group>-<key>, and typography flattens one level
// further into --wa-type-<role>-size / -weight / -line-height.
for (const [name, value] of Object.entries(layout)) {
  if (typeof value !== 'object' || value === null) {
    push(`--wa-${kebab(name)}`, render(value));
    continue;
  }
  const group = kebab(GROUP_PREFIX[name] ?? name);
  for (const [key, entry] of Object.entries(value)) {
    if (typeof entry !== 'object' || entry === null) {
      push(`--wa-${group}-${kebab(key)}`, render(entry));
      continue;
    }
    for (const [subKey, subValue] of Object.entries(entry)) {
      push(`--wa-${group}-${kebab(key)}-${SUB_KEY[subKey] ?? kebab(subKey)}`, render(subValue));
    }
  }
}

mkdirSync(out, { recursive: true });
writeFileSync(join(out, 'package.json'), JSON.stringify({ name: 'wardrobe-tokens', version: '1.0.0', private: true }, null, 2) + '\n');
writeFileSync(
  join(out, 'tokens.css'),
  `/* Generated from theme/colors.ts + theme/layout.ts by .design-sync/gen-tokens.mjs. */\n:root {\n${pairs
    .map(([k, v]) => `  ${k}: ${v};`)
    .join('\n')}\n}\n`,
);
console.log(`wrote ${pairs.length} tokens`);

// Floor check. NOTES.md records what the last good run emitted; emitting fewer
// means a theme export stopped being walked, which is otherwise silent.
const expected = Number(readFileSync(notesPath, 'utf8').match(/expected token count:\s*(\d+)/i)?.[1]);
if (!Number.isFinite(expected)) {
  console.error('gen-tokens: NOTES.md records no "expected token count" - cannot verify this run.');
  process.exit(1);
}
if (pairs.length < expected) {
  console.error(`gen-tokens: emitted ${pairs.length} tokens, NOTES.md expects at least ${expected}.`);
  process.exit(1);
}
