import test from 'node:test';
import assert from 'node:assert/strict';
import { applyDebugAction as edit, debugRealms, debugEnemies, debugSummons, debugCards } from './debugState';
import { newRoguelikeRun, currentRealm, realmEncounterNumber, activeEncounter } from '../../../packages/engine/index';
const run=()=>newRoguelikeRun(42,'rimebound');
test('navigation enters every biome and location with valid encounter data without mutating original',()=>{
 for(const deck of ['rimebound','hellbound'] as const)for(const realm of debugRealms)for(const kind of ['combat','elite','boss','shop','camp','treasure','route-choice'] as const){
  const original=newRoguelikeRun(42,deck), snapshot=structuredClone(original);
  const s=edit(original,{type:'navigate',realm:realm.id,encounter:2,kind});
  assert.deepEqual(original,snapshot);assert.equal(currentRealm(kind==='route-choice'?{...s,room:s.room+1}:s),realm.id);
  assert.equal(s.phase,['boss','elite'].includes(kind)?'combat':kind);
  if(kind!=='route-choice'){assert.ok(activeEncounter(s));assert.equal(realmEncounterNumber(s),kind==='boss'?realm.encounters.length:2);}
  if(kind==='boss')assert.ok(s.enemies.some(e=>e.boss));
  if(kind==='shop')assert.ok(s.shops?.current);
 }
});
test('previous and next cross biome boundaries and clamp at the start/end',()=>{
 let s=edit(run(),{type:'navigate',realm:'forest',encounter:1,kind:'combat'});
 s=edit(s,{type:'step',delta:-1});assert.equal(currentRealm(s),'frozen-wastes');assert.equal(realmEncounterNumber(s),12);
 s=edit(s,{type:'step',delta:1});assert.equal(currentRealm(s),'forest');assert.equal(realmEncounterNumber(s),1);
 s=edit(s,{type:'navigate',realm:'frozen-wastes',encounter:1,kind:'route-choice'});assert.equal(s.room,-1);
 s=edit(s,{type:'restart'});assert.equal(s.room,0);s=edit(s,{type:'step',delta:-1});assert.equal(s.room,0);
});
test('all summon and enemy templates spawn with unique IDs, cloned moves, and valid focus',()=>{
 let s=edit(run(),{type:'clear',target:'units'});
 for(const summon of debugSummons){s=edit(s,{type:'clear',target:'units'});s=edit(s,{type:'spawn-summon',kind:summon.id,count:2});assert.equal(s.units.length,2);assert.equal(s.units[0].maxHp,summon.hp);assert.notEqual(s.units[0].id,s.units[1].id);}
 for(const enemy of debugEnemies){s=edit(s,{type:'clear',target:'enemies'});s=edit(s,{type:'spawn-enemy',template:enemy.id});assert.equal(s.enemies[0].name,enemy.name);assert.equal(s.focus,s.enemies[0].id);assert.notEqual(s.enemies[0].moves,enemy.template.moves);}
 const ids=[...s.units,...s.enemies,...s.reserves].map(x=>x.id).concat([...s.hand,...s.draw,...s.discard].map(x=>x.uid));assert.equal(new Set(ids).size,ids.length);
});
test('debug summons bypass normal warband capacity and all implemented cards can be added',()=>{
 let s=edit(run(),{type:'spawn-summon',kind:'imp',count:15});assert.equal(s.units.length,15);
 for(const card of debugCards)s=edit(s,{type:'add-card',card:card.id,zone:'hand',level:2});
 assert.equal(s.hand.length,debugCards.length+5);assert.equal(new Set(s.hand.map(c=>c.uid)).size,s.hand.length);
 s=edit(s,{type:'add-card',card:'firebolt',zone:'deck',level:3,count:2});assert.equal(s.deckLevels?.at(-1),3);
});
test('resources, items and training respect state invariants',()=>{
 const original=run();let s=edit(original,{type:'resources',values:{maxHp:100,hp:1000,gold:999,cinders:99,corruption:99}});
 assert.equal(s.hp,100);assert.equal(s.cinders,20);assert.equal(s.corruption,10);assert.equal(original.gold,0);
 s=edit(s,{type:'grant-item',item:'first-muster-seal'});s=edit(s,{type:'grant-item',item:'first-muster-seal'});assert.equal(s.relics.filter(x=>x==='first-muster-seal').length,1);
 s=edit(s,{type:'set-training',kind:'bone-defender',level:2});assert.equal(s.trainingLevels?.['bone-defender'],2);assert.ok(s.acquiredSummons?.includes('bone-defender'));
 assert.throws(()=>edit(s,{type:'resources',values:{mana:NaN}}),/finite/);
});
test('instant win uses normal rewards without consuming or adding inventory',()=>{
 const s=run(), inventory=structuredClone(s.inventory), history=structuredClone(s.history);
 const won=edit(s,{type:'win'});assert.equal(won.phase,'reward');assert.deepEqual(won.inventory,inventory);assert.deepEqual(won.history,history);assert.ok(won.pendingLoot);
});
test('restart clears stale fight state while preserving run inventory and deck',()=>{
 let s=edit(run(),{type:'spawn-summon',kind:'imp'});s=edit(s,{type:'grant-item',item:'mana-potion'});const deck=[...s.deck];s=edit(s,{type:'restart'});
 assert.equal(s.phase,'combat');assert.equal(s.units.length,0);assert.ok(s.inventory.includes('mana-potion'));assert.deepEqual(s.deck,deck);assert.equal(s.turn,1);
});
test('end turn advances engine instantly and snapshots remain isolated',()=>{
 const before=run();const after=edit(before,{type:'end-turn'});assert.equal(after.turn,2);assert.equal(before.turn,1);assert.deepEqual(after.history,before.history);
});
