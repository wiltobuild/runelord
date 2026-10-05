import test from 'node:test';
import assert from 'node:assert/strict';
import {newRoguelikeRun,dispatch,manaCost,cinderCost,playable,save,restore,type State} from './index';
import type {CardId} from '../content/index';
function setup(id:CardId,upgraded=false,level=0){const s=newRoguelikeRun(1);s.hand=[{id,uid:900,upgraded,level}];s.mana=10;s.cinders=10;s.enemies.forEach(e=>{e.hp=e.maxHp=1000;});return s;}
const play=(s:State)=>dispatch(s,{type:'play',uid:900});
test('lesser summon upgrades use catalog resource discounts and drain power',()=>{
 let s=setup('summon-gloomstalker',true);assert.equal(cinderCost(s.hand[0]),1);assert.equal(play(s).cinders,9);
 s=setup('summon-pyre-warden',true);assert.equal(manaCost(s,s.hand[0]),1);assert.equal(play(s).mana,9);
 s=setup('summon-soul-leech',true);assert.equal(play(s).units[0].power,6);
});
test('arch summon levels scale stats but leave arrival Mana and Guard passives fixed',()=>{
 let s=play(setup('summon-nightmaw',false,2));assert.equal(s.units[0].maxHp,26);assert.equal(s.mana,8);
 s=play(setup('summon-pyre-colossus',false,2));assert.equal(s.units[0].maxHp,35);assert.equal(s.guard,12);
});
test('unaffordable upgraded summon does not spend either resource',()=>{
 const s=setup('summon-gloomstalker',true);s.cinders=0;const before=structuredClone(s);assert.equal(playable(s,s.hand[0]),false);assert.throws(()=>play(s));assert.deepEqual(s,before);
});
test('schema8 rejects invalid summon and shield activation boundaries',()=>{
 const data=JSON.parse(save(newRoguelikeRun(12)));for(const key of ['summonRulesFrom','monsterShieldRulesFrom'])for(const bad of [-1,.5,1,null])assert.throws(()=>restore(JSON.stringify({...data,[key]:bad})),/history/);
 assert.deepEqual(restore(JSON.stringify(data)),newRoguelikeRun(12));
});
