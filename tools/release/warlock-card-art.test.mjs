import fs from 'node:fs';
import crypto from 'node:crypto';
import test from 'node:test';
import assert from 'node:assert/strict';
const hash=p=>crypto.createHash('sha256').update(fs.readFileSync(p)).digest('hex');
test('Warlock card runtime uses the current illustrations and cache revisions',()=>{
 const inventory=JSON.parse(fs.readFileSync('assets/cards/infernal-soldiers-2026-10-13/manifest.json'));
 const source=JSON.parse(fs.readFileSync('packages/assets/manifest.json'));
 const runtime=JSON.parse(fs.readFileSync('apps/web/public/game-assets/manifest.json'));
 for(const card of inventory.cards){
  const digest=hash(card.output_path),output=`cards/${card.canonical_id}.webp`;
  assert.equal(digest,card.verification.output_sha256,`${card.canonical_id}: source changed`);
  const provenance=source.provenance.find(p=>p.output===output);
  assert.equal(provenance?.source,card.output_path,`${card.canonical_id}: stale illustration`);
  assert.equal(provenance.sha256,digest);
  assert.equal(hash(`apps/web/public/game-assets/${output}`),provenance.outputSha256);
  assert.equal(runtime.cards[card.canonical_id],`/game-assets/${output}?v=${digest.slice(0,12)}`);
  assert.equal(source.cards[card.canonical_id],runtime.cards[card.canonical_id]);
 }
});
