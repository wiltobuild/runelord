import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import sharp from 'sharp';

const sha = file => crypto.createHash('sha256').update(fs.readFileSync(file)).digest('hex');
const read = file => JSON.parse(fs.readFileSync(file, 'utf8'));
const realms = ['frozen-wastes', 'forest', 'infernal'];
const kinds = ['combat', 'mystery', 'treasure', 'shop', 'elite', 'camp', 'boss'];
const ui = [
  { id: 'card-frame', concept: 'encounter-choice', crop: [214,202,401,625], clear: [16,16,369,593], slice: 16 },
  { id: 'panel-frame', concept: 'camp', crop: [49,608,524,268], clear: [24,14,476,240], slice: 24 },
  { id: 'button', concept: 'encounter-choice', crop: [251,741,324,60], patch: [276,760,35,21], replace: [28,13,268,34] },
  { id: 'medallion-combat', concept: 'encounter-choice', crop: [359,487,107,110] },
  { id: 'medallion-mystery', concept: 'encounter-choice', crop: [782,488,108,109] },
  { id: 'medallion-treasure', concept: 'encounter-choice', crop: [1205,488,109,109] },
  { id: 'medallion-rest', concept: 'camp', crop: [100,632,136,130] },
  { id: 'medallion-refine', concept: 'camp', crop: [632,634,133,130] },
  { id: 'medallion-command', concept: 'camp', crop: [1151,632,135,132] },
  { id: 'medallion-gold', concept: 'treasure', crop: [785,456,103,101] },
  { id: 'reward-gold', concept: 'treasure', crop: [651,235,368,222] },
  { id: 'reward-tome', concept: 'treasure', crop: [1080,235,358,222] },
  { id: 'reward-relic', concept: 'treasure', crop: [237,235,356,222] },
  { id: 'basalt', concept: 'summon-training', crop: [350,150,200,60] },
  { id: 'ability-signature', concept: 'summon-training', crop: [758,401,81,82] },
  { id: 'ability-shield', concept: 'summon-training', crop: [758,522,81,81] },
  { id: 'ability-locked', concept: 'summon-training', crop: [758,644,81,81] },
];
const rectangle = ([left,top,width,height]) => ({left,top,width,height});
const owned = output => output?.startsWith('expedition/paths/') || output?.startsWith('expedition/ui/');

/** Approved source extraction only; retained exports work without the large master library. */
export async function integrateExpeditionPaths(manifest, { sourceRoot = process.cwd(), targetRoot = process.cwd() } = {}) {
  const publicRoot = path.join(targetRoot, 'apps/web/public/game-assets');
  const retained = path.join(targetRoot, 'packages/assets/expedition-paths.json');
  const sourceFiles = realms.flatMap(realm => kinds.map(kind => `assets/environments/expedition-paths/r1/${realm}/${kind}/source.png`));
  sourceFiles.push(...[...new Set(ui.map(item => item.concept))].map(concept => `assets/ui/expedition-concepts/r1/${concept}/source.png`));
  const ledgerPath = path.join(sourceRoot, 'assets/approvals/decisions.json');
  const ledger = fs.existsSync(ledgerPath) ? read(ledgerPath).decisions : {};
  let overlay;
  if (!sourceFiles.every(file => fs.existsSync(path.join(sourceRoot, file)))) {
    if (!fs.existsSync(retained)) throw Error('All expedition masters or the retained approved export manifest are required.');
    overlay = read(retained);
    if (overlay.provenance.length !== 21 + ui.length || Object.keys(overlay.images).length !== 21 + ui.length) throw Error('Incomplete expedition retained export manifest.');
    for (const record of overlay.provenance) {
      if (record.status !== 'Approved' || !record.evidenceId) throw Error(`Unapproved retained source: ${record.source}`);
      const decision = ledger[record.sourceSha256];
      if (decision && decision.status !== 'Approved') throw Error(`Approval withdrawn: ${record.source}`);
      const output = path.join(publicRoot, record.output);
      if (!fs.existsSync(output) || sha(output) !== record.outputSha256) throw Error(`Missing or changed expedition export: ${record.output}`);
      const source = path.join(sourceRoot, record.source);
      if (fs.existsSync(source) && sha(source) !== record.sourceSha256) throw Error(`Changed expedition source: ${record.source}`);
    }
  } else {
    // Validate every source decision before writing any derived asset.
    for (const file of sourceFiles) if (ledger[sha(path.join(sourceRoot, file))]?.status !== 'Approved') throw Error(`Expedition source requires approval: ${file}`);
    overlay = { images: {}, provenance: [], integration: { expeditionPaths: { revision: 'r1', authorization: 'User approved all 25 exact path/UI concept images and explicitly requested implementation. Only deterministic approved-source exports; no new generated art.', sourceCount: 25, pathCount: 21, uiDerivativeCount: ui.length, mode: 'approved-source-derivatives' } } };
    async function emit(key, source, output, transform, buffer) {
      const input = path.join(sourceRoot, source), sourceSha256 = sha(input), decision = ledger[sourceSha256];
      const destination = path.join(publicRoot, output);
      fs.mkdirSync(path.dirname(destination), { recursive: true });
      await sharp(buffer ?? input).webp({ quality: 90, alphaQuality: 100 }).toFile(destination);
      const metadata = await sharp(destination).metadata();
      overlay.images[key] = `/game-assets/${output}`;
      overlay.provenance.push({ source, sourceSha256, status: decision.status, evidenceId: decision.evidenceId, output, outputSha256: sha(destination), width: metadata.width, height: metadata.height, encodedBytes: fs.statSync(destination).size, decodedBytes: metadata.width * metadata.height * 4, transform: { ...transform, format: 'webp', quality: 90, alphaQuality: 100 }, approvalBasis: 'Deterministic derivative of the exact approved source; does not assert separate gallery approval for changed bytes.' });
    }
    for (const realm of realms) for (const kind of kinds) await emit(`path-${realm}-${kind}`, `assets/environments/expedition-paths/r1/${realm}/${kind}/source.png`, `expedition/paths/${realm}/${kind}.webp`, { operation: 'encode-original-dimensions' });
    for (const item of ui) {
      const source = `assets/ui/expedition-concepts/r1/${item.concept}/source.png`, input = path.join(sourceRoot, source);
      let buffer = await sharp(input).extract(rectangle(item.crop)).ensureAlpha().png().toBuffer();
      if (item.clear) {
        const [x,y,w,h] = item.clear;
        const mask = Buffer.from(`<svg width="${item.crop[2]}" height="${item.crop[3]}"><rect x="${x}" y="${y}" width="${w}" height="${h}" fill="white"/></svg>`);
        buffer = await sharp(buffer).composite([{ input: mask, blend: 'dest-out' }]).png().toBuffer();
      }
      if (item.patch) {
        const patch = await sharp(input).extract(rectangle(item.patch)).resize(item.replace[2],item.replace[3],{fit:'fill'}).png().toBuffer();
        buffer = await sharp(buffer).composite([{input:patch,left:item.replace[0],top:item.replace[1]}]).png().toBuffer();
      }
      await emit(`expedition-ui-${item.id}`,source,`expedition/ui/${item.id}.webp`,{operation:'extract-approved-ui',crop:item.crop,...(item.clear?{clearInterior:item.clear,borderImageSlice:item.slice}:{}),...(item.patch?{textFreePatch:item.patch,replace:item.replace}:{})},buffer);
    }
    fs.mkdirSync(path.dirname(retained), { recursive: true });
    fs.writeFileSync(retained, JSON.stringify(overlay,null,2)+'\n');
  }
  manifest.images = {...(manifest.images??{}), ...overlay.images};
  manifest.provenance = [...(manifest.provenance??[]).filter(record=>!owned(record.output)),...overlay.provenance];
  manifest.integration = {...(manifest.integration??{}),...overlay.integration};
  return overlay;
}


