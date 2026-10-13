import {test} from 'node:test';
import assert from 'node:assert/strict';
import {newRun,dispatch,playable,warbandCapacity,save,restore,canBloodAscend,type State} from './index';
import {type CardId} from '../content/index';
function setup(){const s=newRun(818,'hellbound',3,undefined,2,2);s.enemies=[{...s.enemies[0],hp:5000,maxHp:5000,moves:[{name:'Wait',damage:0,targeting:'hero'}]}];s.mana=100;s.hand=[];s.draw=[];s.discard=[];return s;}
function play(s:State,id:CardId,unit?:number,sacrifice?:number){s.hand.push({uid:s.nextId++,id});s.mana=100;return dispatch(s,{type:'play',uid:s.hand.at(-1)!.uid,...(unit!==undefined?{unit}:{}),...(sacrifice!==undefined?{sacrifice}:{})});}
test('revision two fills ten slots and pair recruitment at nine spends nothing',()=>{
 let s=setup();for(let i=0;i<5;i++)s=play(s,'muster-legion');assert.equal(warbandCapacity(s),10);assert.equal(s.units.length,10);
 s.units.pop();s.hand=[{id:'muster-legion',uid:999}];const before=structuredClone(s);assert.equal(playable(s,s.hand[0]),false);assert.throws(()=>dispatch(s,{type:'play',uid:999}));assert.deepEqual(s,before);
 s=play(s,'summon-ash-pikeman');assert.equal(s.units.length,10);s.hand=[{id:'summon-ash-pikeman',uid:999}];assert.throws(()=>dispatch(s,{type:'play',uid:999}));
});
test('individual ranks are deposited on sacrifice and claimed once on the next summon',()=>{
 let s=play(setup(),'muster-legion');s=play(s,'field-promotion',s.units[0].id);s=play(s,'battlefield-commission',s.units[1].id);const first=s.units[0].id,second=s.units[1].id;
 s=play(s,'sacrificial-rite',first);s=play(s,'sacrificial-rite',second);assert.deepEqual(s.legionRanks?.['iron-legionary'],[2,1]);
 s=play(s,'muster-legion');assert.deepEqual(s.units.map(u=>u.promotionRank),[2,1]);assert.deepEqual(s.units.map(u=>u.hp),[22,20]);assert.deepEqual(s.legionRanks?.['iron-legionary'],[]);
 s=play(s,'summon-iron-legionary');assert.equal(s.units[2].promotionRank,0);
});
test('battle completion clears bodies without deaths, banks ranks, and the next battle starts empty',()=>{
 let s=play(setup(),'muster-legion');s=play(s,'field-promotion',s.units[0].id);s.units[0].hp=2;s.enemies[0].hp=1;const corruption=s.corruption;
 s=play(s,'firebolt');assert.equal(s.phase,'reward');assert.equal(s.units.length,0);assert.deepEqual(s.legionRanks?.['iron-legionary'],[1]);assert.equal(s.corruption,corruption);assert.equal(s.events.filter(e=>e.type==='unit-death').length,0);
 s=dispatch(s,{type:'reward',card:null});s=dispatch(s,{type:'continue'});assert.equal(s.units.length,0);s=play(s,'summon-iron-legionary');assert.equal(s.units[0].promotionRank,1);assert.equal(s.units[0].hp,20);
});
test('hostile death banks one rank record, subsequent recruitment preserves it without multiplying',()=>{
 let s=play(setup(),'summon-ash-pikeman');s=play(s,'battlefield-commission',s.units[0].id);s.enemies[0].moves=[{name:'Execute',damage:100,targeting:'front'}];s=dispatch(s,{type:'end'});assert.equal(s.units.length,0);assert.deepEqual(s.legionRanks?.['ash-pikeman'],[2]);s=play(s,'pike-detail');assert.deepEqual(s.units.map(u=>u.promotionRank),[2,0]);
});
test('Blood Ascension requires two explicit different living targets and rejects before payment',()=>{
 let s=play(setup(),'muster-legion');s.hand=[{id:'blood-ascension',uid:999}];assert.ok(canBloodAscend(s));const before=structuredClone(s);
 for(const action of [{sacrifice:s.units[0].id},{unit:s.units[0].id},{unit:s.units[0].id,sacrifice:s.units[0].id},{unit:s.units[0].id,sacrifice:-1},{unit:-1,sacrifice:s.units[1].id}]){assert.throws(()=>dispatch(s,{type:'play',uid:999,...action}));assert.deepEqual(s,before);}
 s.units.pop();assert.equal(canBloodAscend(s),false);assert.equal(playable(s,s.hand[0]),false);
});
test('Blood Ascension uses real sacrifice triggers, banks the victim rank, and grants exactly three ranks',()=>{
 let s=play(setup(),'muster-legion');s=play(s,'field-promotion',s.units[1].id);const target=s.units[0].id,victim=s.units[1].id;s.powers['demonic-resilience']=6;s=play(s,'blood-ascension',target,victim);assert.equal(s.mana,98);assert.equal(s.units.length,1);assert.equal(s.units[0].id,target);assert.deepEqual([s.units[0].promotionRank,s.units[0].armor,s.units[0].power,s.units[0].maxHp],[3,3,10,24]);assert.deepEqual(s.legionRanks?.['iron-legionary'],[1]);assert.equal(s.corruption,2);assert.equal(s.guard,6);assert.equal(s.events.filter(e=>e.type==='unit-death').length,1);
});
test('revision marker keeps historical five-slot starter and accepts modern Blood Ascension starter',()=>{
 const old=newRun(1,'hellbound'),current=newRun(1,'hellbound',3,undefined,2,2);assert.equal(warbandCapacity(old),5);assert.equal(warbandCapacity(current),10);assert.equal(old.deck.filter(id=>id==='field-promotion').length,2);assert.ok(!old.deck.includes('blood-ascension'));assert.ok(current.deck.includes('blood-ascension'));
 const oldRaw=JSON.parse(save(old));delete oldRaw.legionRules;assert.deepEqual(restore(JSON.stringify(oldRaw)),old);assert.deepEqual(restore(save(current)),current);
 for(const value of [0,3,-1,null,'2'])assert.throws(()=>restore(JSON.stringify({...oldRaw,legionRules:value})));
});
