import assert from 'node:assert/strict';
import {readFileSync,writeFileSync} from 'node:fs';
import {newRoguelikeRun,forestEncounters,FOREST_ENEMY_IDS,dispatch,save,restore,currentRealm,type State} from '../../../../../packages/engine/index';
const fixture=JSON.parse(readFileSync('packages/engine/fixtures/forest-roguelike-complete.json','utf8'));
let s=newRoguelikeRun(fixture.seed,fixture.starterDeck);const shops:number[]=[];const battles=new Set<number>();
for(const [index,action] of fixture.actions.entries()){
 const prior=s;s=dispatch(s,action);assert.equal('journey' in s,false);assert.ok(!['map','treasure'].includes(s.phase));
 if(s.phase==='combat')battles.add(s.room);
 if(s.phase==='shop'&&prior.phase!=='shop')shops.push(s.room+1);
 if(index%10===0||s.phase!==prior.phase||index===fixture.actions.length-1)assert.deepEqual(restore(save(s)),s);
}
assert.equal(s.phase,'won');assert.equal(currentRealm(s),'forest');assert.deepEqual(shops,[3,6,9,12,15,18,21]);
assert.equal(battles.size,21);
for(const e of forestEncounters.flatMap(x=>[...x.enemies,...x.reserves||[]])){assert.ok((FOREST_ENEMY_IDS as readonly string[]).includes(e.art));assert.equal(e.boss,undefined);assert.ok(e.moves.every(m=>m.kind!=='summon'));}
writeFileSync('work/production/roguelike-forest/qa/independent-engine.json',JSON.stringify({seed:fixture.seed,legalActions:fixture.actions.length,phase:s.phase,battles:battles.size,shops,checks:'No Conquer journey/map/treasure state; exact save/replay every10 actions and every phase transition; permitted forest enemies only',hp:s.hp},null,2));
console.log('Independent linear replay/exclusions passed');
