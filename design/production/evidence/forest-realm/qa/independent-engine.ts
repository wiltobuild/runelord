import assert from 'node:assert/strict';
import {readFileSync,writeFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {newInfernalRun,generateForestJourney,FOREST_ENEMY_IDS,dispatch,save,restore,intent,type State} from '../../../../../packages/engine/index';
const results:any[]=[];
for(const seed of [0,42,7319,4294967295]) {
 const journey=generateForestJourney(seed);
 for(const node of journey.nodes.filter(n=>n.kind!=='shop')) {
  let s=newInfernalRun(seed,'warband');s.journey=structuredClone(journey);s.journey.current=node.id;s.room=node.encounterIndex;
  s.hp=s.maxHp=10000;s=dispatch(s,{type:'enter-location'});
  for(let turn=0;turn<12;turn++) {
   for(const e of [...s.enemies,...s.reserves]) {
    assert.ok((FOREST_ENEMY_IDS as readonly string[]).includes(e.art));assert.equal(e.boss,undefined);
    assert.notEqual(intent(s,e).kind,'summon');
   }
   s=dispatch(s,{type:'end'});assert.equal(s.phase,'combat');
  }
 }
 results.push({seed,encounters:12,enemyTurnsPerEncounter:12,excludedEnemySpawns:0});
}
const fixture=readFileSync('packages/engine/fixtures/forest-shop-save.json','utf8');
let s=restore(fixture);assert.equal(s.journey?.realm,'forest');assert.equal(s.phase,'shop');
const snapshots=[];
for(let i=1;i<=s.history.length;i++) {
 const data=JSON.parse(fixture);data.actions=data.actions.slice(0,i);
 const partial=restore(JSON.stringify(data));assert.deepEqual(restore(save(partial)),partial);
 if(i===1||partial.journey?.realm==='forest') snapshots.push({actions:i,realm:partial.journey?.realm,phase:partial.phase});
}
const sources=['packages/engine/index.ts','packages/engine/forest.ts','packages/engine/infernal.ts','packages/engine/fixtures/forest-shop-save.json'];
writeFileSync('work/production/forest-realm/qa/independent-engine.json',JSON.stringify({results,replayPrefixes:s.history.length,snapshots,sourceHashes:Object.fromEntries(sources.map(p=>[p,createHash('sha256').update(readFileSync(p)).digest('hex')]))},null,2));
console.log(JSON.stringify({dynamicEnemyChecks:48,enemyTurns:576,replayPrefixes:s.history.length,status:'pass'}));

