import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';

const sha = file => crypto.createHash('sha256').update(fs.readFileSync(file)).digest('hex');
const read = file => JSON.parse(fs.readFileSync(file, 'utf8'));
const slash = value => value.replaceAll('\\', '/');
const relativeSource = value => slash(value).slice(slash(value).indexOf('assets/'));

/** Existing authored idle loops; all other states are explicitly presentation fallbacks. */
export async function integrateFrozenWastes(manifest, { sourceRoot = process.cwd(), targetRoot = process.cwd() } = {}) {
  const batchFile = path.join(sourceRoot, 'assets/characters/ice-idle-2026-10-13/batch-report.json');
  // Release checkouts retain the verified runtime derivatives without duplicating masters.
  if (!fs.existsSync(batchFile)) {
    const retained = path.join(targetRoot, 'packages/assets/frozen-wastes.json');
    if (!fs.existsSync(retained)) throw Error('Frozen Wastes source batch or retained integration manifest is required.');
    const overlay = read(retained);
    for (const record of overlay.provenance) {
      const output = path.join(targetRoot, 'apps/web/public/game-assets', record.output);
      if (!fs.existsSync(output) || sha(output) !== record.outputSha256) throw Error(`Frozen Wastes derivative missing or changed: ${record.output}`);
    }
    merge(manifest, overlay);
    return overlay;
  }
  const ledger = read(path.join(sourceRoot, 'assets/approvals/decisions.json')).decisions;
  const overlay = { images: {}, actors: {}, provenance: [], integration: { frozenWastes: {
    sourceRevision: 'ice-idle-2026-10-13 current package bytes',
    authorization: 'User requested existing ice animation integration for Frozen Wastes on 2026-10-14; pending design statuses retained.',
    limitation: 'Authored idle only. Attack, cast, guard, spawn and hit hold the first pose; wounded idle reuses idle; death is a derived opacity fade ending transparent. No authored combat poses are claimed.',
    excluded: ['splinterhost: failed transparency motion study'], actors: {},
  } } };
  const out = path.join(targetRoot, 'apps/web/public/game-assets');
  async function pack(source, output, width, transparent) {
    const sourceHash = sha(source), decision = ledger[sourceHash];
    if (decision?.status === 'Needs revision') throw Error(`Source requests revision: ${source}`);
    const destination = path.join(out, output);
    fs.mkdirSync(path.dirname(destination), { recursive: true });
    const transform = { width, withoutEnlargement: true, format: 'webp', quality: 88, alphaQuality: 100, lossless: transparent };
    await sharp(source).resize({ width, withoutEnlargement: true }).webp({ quality: 88, alphaQuality: 100, lossless: transparent }).toFile(destination);
    const meta = await sharp(destination).metadata();
    const stats = transparent ? await sharp(destination).stats() : null;
    if (transparent && (!meta.hasAlpha || stats.channels[3]?.min !== 0)) throw Error(`Missing transparency: ${output}`);
    overlay.provenance.push({ source: relativeSource(source), sha256: sourceHash, status: decision?.status ?? 'Unreviewed', evidenceId: decision?.evidenceId ?? null, output, outputSha256: sha(destination), transform, encodedBytes: fs.statSync(destination).size, decodedBytes: meta.width * meta.height * 4 });
    return `/game-assets/${output}`;
  }
  for (const item of read(batchFile)) {
    if (item.id === 'splinterhost') continue;
    const id = item.id === 'abomination-rime-hauler' ? 'rime-hauler' : item.id;
    const manifestPath = path.join(sourceRoot, relativeSource(item.manifest));
    const source = read(manifestPath), folder = path.dirname(manifestPath), revision = sha(manifestPath).slice(0, 12);
    const size = source.geometry?.frame_canvas ?? source.frameCanvas ?? source.canvas;
    const anchor = source.geometry?.ground_anchor ?? source.anchor;
    if (!size || !anchor) throw Error(`Missing geometry: ${id}`);
    const files = [];
    for (let index = 0; index < source.frames.length; index++) {
      const frame = source.frames[index], input = path.join(folder, frame.file);
      if (frame.sha256 && sha(input) !== frame.sha256) throw Error(`Frame source changed: ${input}`);
      const meta = await sharp(input).metadata();
      if (meta.width !== size[0] || meta.height !== size[1]) throw Error(`Inconsistent frame canvas: ${id}`);
      files.push(await pack(input, `frozen-wastes/actors/${id}/${revision}/${index}.webp`, Math.min(640, size[0]), true));
    }
    const sourceClip = source.animations?.idle;
    const sequence = sourceClip?.frames ?? source.sequence ?? source.frames.map((_, index) => index);
    let time = 0;
    const frames = sequence.map((index, step) => {
      const duration = sourceClip?.durations_ms?.[step] ?? source.frameDurationsMs?.[step] ?? source.frames[index]?.durationMs ?? source.frames[index]?.duration_ms;
      if (!(duration > 0) || !files[index]) throw Error(`Invalid frame timing: ${id}/${step}`);
      const frame = { time, src: files[index] }; time += duration; return frame;
    });
    const declaredDuration = sourceClip?.duration_ms ?? source.durationMs ?? source.duration_ms;
    if (declaredDuration !== time) throw Error(`Duration mismatch: ${id}, ${time} != ${declaredDuration}`);
    const idle = { duration: time, loop: true, impact: null, frames };
    const hold = (duration, impact = null) => ({ duration, loop: false, impact, frames: [{ time: 0, src: files[0] }] });
    const die = { duration: 600, loop: false, impact: null, frames: Array.from({ length: 7 }, (_, index) => ({ time: index * 100, src: files[0], opacity: 1 - index / 6 })) };
    const scale = Math.min(640, size[0]) / size[0];
    overlay.actors[id] = { size: size.map(n => Math.round(n * scale)), anchor: anchor.map(n => n * scale), states: { idle, wounded_idle: idle, attack: hold(650, 260), cast: hold(700, 300), hit: hold(280), guard: hold(600), spawn: hold(1200), die } };
    overlay.images[id] = files[0];
    const preview = typeof source.preview === 'string' ? source.preview : source.preview?.file;
    const previewPath = preview ? path.join(folder, preview) : null;
    const previewHash = previewPath && fs.existsSync(previewPath) ? sha(previewPath) : item.previewSha256 ?? null;
    overlay.integration.frozenWastes.actors[id] = { sourceId: item.id, manifest: relativeSource(manifestPath), manifestSha256: sha(manifestPath), authoredStates: ['idle'], derivedStates: ['wounded_idle', 'attack', 'cast', 'hit', 'guard', 'spawn', 'die'], durationMs: time, sourceCanvas: size, sourceAnchor: anchor, previewSha256: previewHash, previewDecision: ledger[previewHash]?.status ?? 'Pending approval' };
  }
  for (const [id, subject] of [['frozen-wastes', 'causeway'], ['frozen-heart', 'throne']]) {
    const source = path.join(sourceRoot, `assets/approvals/inbox/battle-map-frostgrave-${subject}/r1/frostgrave-${subject}-r1.png`);
    overlay.images[id] = await pack(source, `frozen-wastes/backgrounds/${id}-${sha(source).slice(0, 12)}.webp`, 1672, false);
  }
  fs.mkdirSync(path.join(targetRoot, 'packages/assets'), { recursive: true });
  fs.writeFileSync(path.join(targetRoot, 'packages/assets/frozen-wastes.json'), JSON.stringify(overlay, null, 2) + '\n');
  const { provenance, integration, ...runtime } = overlay;
  fs.writeFileSync(path.join(out, 'frozen-wastes/manifest.json'), JSON.stringify(runtime));
  merge(manifest, overlay);
  return overlay;
}

function merge(manifest, overlay) {
  Object.assign(manifest.images, overlay.images);
  Object.assign(manifest.actors, overlay.actors);
  manifest.provenance = [...(manifest.provenance ?? []).filter(record => !record.output.startsWith('frozen-wastes/')), ...overlay.provenance];
  manifest.integration = { ...manifest.integration, ...overlay.integration };
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const targetRoot = process.cwd(), sourceRoot = path.resolve(process.argv[2] ?? targetRoot);
  const file = path.join(targetRoot, 'packages/assets/manifest.json'), manifest = read(file);
  const overlay = await integrateFrozenWastes(manifest, { sourceRoot, targetRoot });
  fs.writeFileSync(file, JSON.stringify(manifest, null, 2) + '\n');
  const { provenance, integration, ...runtime } = manifest;
  fs.writeFileSync(path.join(targetRoot, 'apps/web/public/game-assets/manifest.json'), JSON.stringify(runtime));
  console.log(JSON.stringify({ actors: Object.keys(overlay.actors).length, images: Object.keys(overlay.images).length, encodedBytes: overlay.provenance.reduce((total, record) => total + record.encodedBytes, 0), decodedBytes: overlay.provenance.reduce((total, record) => total + record.decodedBytes, 0) }));
}
