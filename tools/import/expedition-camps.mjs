import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import sharp from 'sharp';

const sha = file => crypto.createHash('sha256').update(fs.readFileSync(file)).digest('hex');
const read = file => JSON.parse(fs.readFileSync(file, 'utf8'));
const refs = { 'frozen-wastes': 'frostgrave-causeway', forest: 'thornroot-crossing', infernal: 'cinderforge-approach' };

/** Retain source masters, exact gallery decisions, and deterministic WebP derivatives. */
export async function integrateExpeditionCamps(manifest, { sourceRoot = process.cwd(), targetRoot = process.cwd() } = {}) {
  const sources = path.join(sourceRoot, 'assets/environments/expedition-camps/r1');
  const retained = path.join(targetRoot, 'packages/assets/expedition-camps.json');
  const publicRoot = path.join(targetRoot, 'apps/web/public/game-assets');
  let overlay;
  if (!fs.existsSync(path.join(sources, 'forest/source.png'))) {
    if (!fs.existsSync(retained)) throw Error('Expedition camp sources or retained derivative manifest are required.');
    overlay = read(retained);
    for (const record of overlay.provenance) {
      const output = path.join(publicRoot, record.output);
      if (!fs.existsSync(output) || sha(output) !== record.outputSha256) throw Error(`Missing or changed expedition camp: ${record.output}`);
    }
  } else {
    const ledger = read(path.join(sourceRoot, 'assets/approvals/decisions.json')).decisions;
    overlay = { images: {}, provenance: [], integration: { expeditionCamps: { revision: 'r1', authorization: 'User requested rendering new biome camp scenes and implementing the full expansion plan on 2026-10-14. Integration authorized; design approval remains pending.', generation: 'Built-in image generation, one distinct full scene per biome, no collage.', technicalReview: 'Three full scene outputs visually inspected for composition, environment identity, unobstructed UI space, no characters/text, no cropped essential focal point.', limitation: 'Static camp backgrounds; no ambient animation authored.' } } };
    for (const [realm, reference] of Object.entries(refs)) {
      const source = path.join(sources, realm, 'source.png');
      const prompt = path.join(sources, realm, 'prompt.txt');
      const sourceHash = sha(source);
      const decision = ledger[sourceHash];
      if (decision?.status === 'Needs revision') throw Error(`Camp source requests revision: ${realm}`);
      const referencePath = `assets/approvals/inbox/battle-map-${reference}/r1/${reference}-r1.png`;
      const referenceHash = sha(path.join(sourceRoot, referencePath));
      const referenceDecision = ledger[referenceHash];
      if (referenceDecision?.status !== 'Approved') throw Error(`Camp style reference is no longer approved: ${realm}`);
      const output = `expedition/camps/${realm}.webp`;
      const destination = path.join(publicRoot, output);
      fs.mkdirSync(path.dirname(destination), { recursive: true });
      const transform = { width: 1672, height: 941, fit: 'cover', position: 'centre', format: 'webp', quality: 90 };
      await sharp(source).resize(1672, 941, { fit: 'cover', position: 'centre' }).webp({ quality: 90 }).toFile(destination);
      const meta = await sharp(destination).metadata();
      if (meta.width !== 1672 || meta.height !== 941) throw Error(`Invalid camp canvas: ${realm}`);
      const record = { source: `assets/environments/expedition-camps/r1/${realm}/source.png`, sourceSha256: sourceHash, prompt: `assets/environments/expedition-camps/r1/${realm}/prompt.txt`, promptSha256: sha(prompt), status: decision?.status ?? 'Pending approval', evidenceId: decision?.evidenceId ?? null, reference: { path: referencePath, sha256: referenceHash, status: referenceDecision.status, evidenceId: referenceDecision.evidenceId }, output, outputSha256: sha(destination), transform, encodedBytes: fs.statSync(destination).size, decodedBytes: meta.width * meta.height * 4 };
      overlay.images[`camp-${realm}`] = `/game-assets/${output}`;
      overlay.provenance.push(record);
      fs.writeFileSync(path.join(sources, realm, 'manifest.json'), JSON.stringify(record, null, 2) + '\n');
    }
    fs.mkdirSync(path.dirname(retained), { recursive: true });
    fs.writeFileSync(retained, JSON.stringify(overlay, null, 2) + '\n');
    fs.writeFileSync(path.join(publicRoot, 'expedition/camps/manifest.json'), JSON.stringify({ images: overlay.images }, null, 2) + '\n');
  }
  manifest.images = { ...(manifest.images ?? {}), ...overlay.images };
  manifest.provenance = [...(manifest.provenance ?? []).filter(record => !record.output?.startsWith('expedition/camps/')), ...overlay.provenance];
  manifest.integration = { ...(manifest.integration ?? {}), ...overlay.integration };
  return overlay;
}
