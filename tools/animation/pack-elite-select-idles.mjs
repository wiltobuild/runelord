import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import sharp from 'sharp';

const CELL = 320;
const VISIBLE_HEIGHT = 280;
const hash = file => crypto.createHash('sha256').update(fs.readFileSync(file)).digest('hex');

async function alphaBounds(file) {
  const { data, info } = await sharp(file).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
  let left = info.width, top = info.height, right = -1, bottom = -1;
  for (let y = 0; y < info.height; y++) for (let x = 0; x < info.width; x++) {
    if (data[(y * info.width + x) * info.channels + 3] <= 0) continue;
    left = Math.min(left, x); right = Math.max(right, x);
    top = Math.min(top, y); bottom = Math.max(bottom, y);
  }
  if (right < 0) throw new Error(`Transparent frame: ${file}`);
  return { left, top, right, bottom };
}

for (const spec of [
  { hero: 'ranger', title: 'nightfang', state: 'idle', sequenceKey: 'sequence' },
  { hero: 'runesmith', title: 'storm-crown', state: 'select_idle', sequenceKey: 'sequence' },
]) {
  const root = `assets/heroes/animations/${spec.hero}/elite-select-idle-r1`;
  const manifestPath = `${root}/manifest.json`;
  if (!fs.existsSync(manifestPath)) continue;
  const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
  const state = manifest.states[spec.state];
  const index = JSON.parse(fs.readFileSync(`${root}/frames/index.json`, 'utf8'));
  const frames = Array.isArray(index) ? index : index.frames;
  const sequence = state[spec.sequenceKey];
  if (!Array.isArray(sequence) || !frames.length) throw new Error(`Missing indexed frames/sequence: ${root}`);

  const sources = await Promise.all(frames.map(async frame => {
    const file = path.join(root, frame.file);
    return { file, bounds: await alphaBounds(file) };
  }));
  const union = sources.reduce((all, frame) => ({
    left: Math.min(all.left, frame.bounds.left), top: Math.min(all.top, frame.bounds.top),
    right: Math.max(all.right, frame.bounds.right), bottom: Math.max(all.bottom, frame.bounds.bottom),
  }), { left: Infinity, top: Infinity, right: -Infinity, bottom: -Infinity });
  const crop = { left: union.left, top: union.top, width: union.right - union.left + 1, height: union.bottom - union.top + 1 };
  const scale = Math.min(VISIBLE_HEIGHT / crop.height, VISIBLE_HEIGHT / crop.width);
  const target = { width: Math.round(crop.width * scale), height: Math.round(crop.height * scale) };
  const left = Math.round((CELL - target.width) / 2);
  const top = CELL - 20 - target.height;
  const prepared = await Promise.all(sources.map(({ file }) => sharp(file).extract(crop).resize(target.width, target.height).png().toBuffer()));
  const atlas = await sharp({ create: { width: CELL * sequence.length, height: CELL, channels: 4, background: { r: 0, g: 0, b: 0, alpha: 0 } } })
    .composite(sequence.map((frameIndex, cell) => ({ input: prepared[frameIndex], left: cell * CELL + left, top })))
    .webp({ quality: 95, alphaQuality: 100 }).toBuffer();
  const output = `apps/web/public/opening-assets/hero-${spec.hero}-${spec.title}-idle-r1.webp`;
  fs.writeFileSync(output, atlas);
  const provenance = {
    sources: sources.map(({ file }) => ({ file, sha256: hash(file) })),
    manifest: manifestPath, manifestSha256: hash(manifestPath), frameCount: sequence.length, cellSize: CELL,
    commonAlphaBounds: union, visibleHeight: target.height, scale, translation: [left, top],
    transform: 'Numbered source frames packed with one union alpha crop, one uniform scale, and one shared translation; no per-frame recentering.',
    authorization: 'User explicitly approved the current middle-design Ranger and Runesmith idle-animation bytes for character selection (chat, 2026-10-04).',
    knownLimitation: spec.hero === 'runesmith' ? 'Independent review noted the apron variation; user accepted the current bytes. This export does not claim that variation was repaired.' : undefined,
  };
  fs.writeFileSync(output.replace('.webp', '.provenance.json'), `${JSON.stringify(provenance, null, 2)}\n`);
  console.log(`${spec.hero}: ${sequence.length} × ${CELL}px cells (${CELL * sequence.length}×${CELL})`);
}
