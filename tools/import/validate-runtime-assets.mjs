import { existsSync, readFileSync, statSync } from 'node:fs';
import { resolve, relative } from 'node:path';
import { fileURLToPath } from 'node:url';

const publicRoot = fileURLToPath(new URL('../../apps/web/public/', import.meta.url));
const manifest = JSON.parse(readFileSync(resolve(publicRoot, 'game-assets/manifest.json'), 'utf8'));
const paths = new Set();
function collect(value) {
  if (typeof value === 'string' && value.startsWith('/') && !value.startsWith('//')) paths.add(value);
  else if (value && typeof value === 'object') Object.values(value).forEach(collect);
}
collect(manifest);
const missing = [...paths].filter(url => {
  const path = resolve(publicRoot, url.slice(1));
  return relative(publicRoot, path).startsWith('..') || !existsSync(path) || !statSync(path).isFile();
});
if (missing.length) {
  console.error(`Runtime manifest references ${missing.length} missing assets:\n${missing.join('\n')}`);
  process.exitCode = 1;
} else {
  console.log(`Verified all ${paths.size} runtime manifest assets.`);
}
