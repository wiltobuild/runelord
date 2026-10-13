import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import test from 'node:test';
import assert from 'node:assert/strict';
const manifest=JSON.parse(fs.readFileSync('packages/assets/manifest.json','utf8'));
const kinds=['imp','dread-vanguard','maledictor','iron-legionary','ironhorn-bulwark','ash-pikeman'];
const hash=p=>crypto.createHash('sha256').update(fs.readFileSync(p)).digest('hex');
test('Hellbound actors retain authored states, fixed anchors and shipped frame hashes',()=>{
 for(const kind of kinds){
  const actor=manifest.actors[`summon-${kind}`];assert.ok(actor,kind);
  for(const state of ['idle','act','attack','cast','hit','wounded_idle','spawn','die'])assert.ok(actor.states[state],`${kind}/${state}`);
  assert.equal(actor.spawnReveal,'authored');assert.equal(actor.states.die.loop,false);assert.equal(actor.states.die.terminalHold,true);
  const sources=new Set(Object.values(actor.states).flatMap(c=>c.frames.map(f=>f.src)));
  for(const url of sources){const output=url.replace('/game-assets/',''),record=manifest.provenance.find(r=>r.output===output);assert.ok(record,url);assert.equal(hash(path.join('apps/web/public/game-assets',output)),record.outputSha256);assert.equal(hash(record.source),record.sha256);}
 }
});
test('Hellbound hierarchy keeps Vanguard 15% taller than Legionary and Imp only 10% taller than old flight',()=>{
 const height=kind=>{const a=manifest.actors[`summon-${kind}`];return(a.anchor[1]-a.geometry.layout_bounds_px[1])*200/a.geometry.source_pixels_per_world_unit;};
 assert.ok(Math.abs(height('dread-vanguard')/height('iron-legionary')-1.15)<.00001);
 const oldImp=(340-46)*200/(232/.45);assert.ok(Math.abs(height('imp')/oldImp-1.1)<.0001);
 assert.deepEqual(manifest.actors['summon-imp'],manifest.actors['summon-imp-flight']);
});
