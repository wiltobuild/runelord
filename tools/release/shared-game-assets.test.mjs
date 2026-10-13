import assert from 'node:assert/strict';
import {readFileSync,existsSync} from 'node:fs';
import path from 'node:path';
import test from 'node:test';

const root=process.cwd();
const manifest=JSON.parse(readFileSync(path.join(root,'apps/web/public/game-assets/manifest.json'),'utf8'));
function* urls(value) {
  if(Array.isArray(value)) for(const child of value) yield* urls(child);
  else if(value && typeof value==='object') for(const child of Object.values(value)) yield* urls(child);
  else if(typeof value==='string' && /^\/(game-assets|opening-assets)\//.test(value)) yield value;
}
test('every selected runtime asset ships with the game',()=>{
  const {provenance,integration,...runtime}=manifest;
  for(const url of new Set(urls(runtime))) assert.ok(existsSync(path.join(root,'apps/web/public',url)),`Missing runtime file: ${url}`);
});
test('both cinematic summons retain all 32 authored frames and reveal metadata',()=>{
  for(const [id,revision] of [['hellhound','cinematic32-repair-r2'],['pit-brute','cinematic32-r1']]) {
    const actor=manifest.actors[`summon-${id}`];
    assert.equal(actor.spawnReveal,'authored');
    const frames=new Set();
    for(const state of ['idle','attack','hit','wounded_idle','spawn','die']) {
      assert.ok(actor.states[state]?.frames.length,`Missing ${id}/${state}`);
      for(const frame of actor.states[state].frames) {
        assert.ok(frame.src.includes('/'+revision+'/'),`Stale ${id}/${state} revision`);
        frames.add(frame.src);
      }
    }
    assert.equal(frames.size,32);
  }
});
test('Runeblade current cards, historical faces, relics and five animated summons ship together',()=>{
  for(const id of ['exhume','mass-exhumation','hew','brace','frostbite','rimecleave','bone-ward','rally-the-fallen','sweeping-hew'])
    assert.ok(manifest.cards[id]?.includes('/cards-r2/'),`Missing current face: ${id}`);
  for(const id of ['hew','brace','frostbite','rimecleave','bone-ward','rally-the-fallen','sweeping-hew'])
    assert.ok(manifest.legacyRunebladeCards?.[id],`Missing historical face: ${id}`);
  for(const id of ['gravekeepers-seal','gravebound-sigil','hoarfrost-whetstone','suture-standard','icebound-phylactery','gravewardens-bell','crown-of-rime'])
    assert.ok(manifest.images[`item-${id}`],`Missing relic: ${id}`);
  for(const id of ['frost-thrall','shattered-queen','rime-seer','rune-revenant','bone-defender']) {
    const actor=manifest.actors[`summon-${id}`];
    for(const state of ['idle','attack','hit','die']) assert.ok(actor?.states[state]?.frames.length,`Missing summon clip: ${id}/${state}`);
  }
});
test('all advanced demons and their current card faces are present',()=>{
  for(const id of ['gloomstalker','soul-leech','pyre-warden','ignivar','cerberax','nightmaw','gorthak','hollow-saint','pyre-colossus']) {
    assert.ok(manifest.actors[`summon-${id}`]?.states.attack,`Missing actor: ${id}`);
    assert.ok(manifest.cards[`summon-${id}`],`Missing card: ${id}`);
  }
  assert.ok(manifest.cards['empower-demon']);
});
