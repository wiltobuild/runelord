import {test} from 'node:test';
import assert from 'node:assert/strict';
import {newInfernalRun,generateForestJourney,dispatch,intent,type State} from './index';
import {readFileSync,existsSync} from 'node:fs';
function fixture():State{
 let s=newInfernalRun(29,'warband');s.journey=generateForestJourney(29);s.journey.current='forest-12';s.phase='map';s.hp=s.maxHp=200;
 return dispatch(s,{type:'enter-location'});
}
test('forest finale is the Sovereign and Rootwake creates individually targetable roots that wait a turn',()=>{
 let s=fixture();assert.equal(s.enemies.length,1);assert.equal(s.enemies[0].boss,'forest-sovereign');assert.equal(intent(s,s.enemies[0]).spell,'rootwake');
 const hp=s.hp;s=dispatch(s,{type:'end'});assert.equal(s.enemies.length,3);assert.equal(s.hp,hp);
 const roots=s.enemies.filter(e=>e.art==='sovereign-root');assert.equal(roots.length,2);assert.equal(new Set(roots.map(e=>e.id)).size,2);assert.ok(roots.every(e=>e.summonedBy===s.enemies[0].id));
 s.hand=[{id:'firebolt',uid:99999}];s.mana=3;const other=roots[1].hp;
 s=dispatch(s,{type:'play',uid:99999,target:roots[0].id});assert.equal(s.enemies.find(e=>e.id===roots[0].id)!.hp,22);assert.equal(s.enemies.find(e=>e.id===roots[1].id)!.hp,other);
 const next=dispatch(s,{type:'end'});assert.equal(next.events.filter(e=>e.type==='enemy'&&roots.some(r=>r.id===e.actor)).length,2);assert.ok(next.events.some(e=>e.spell==='verdant_cyclone'));
});
test('root summon capacity is two living/four lifetime and deterministic',()=>{
 const original=fixture();assert.deepEqual(dispatch(original,{type:'end'}),dispatch(original,{type:'end'}));
 let s=dispatch(original,{type:'end'});s.turn=5;assert.equal(intent(s,s.enemies[0]).name,'Ancient Fist');
 s.enemies.slice(1).forEach(e=>e.hp=0);s=dispatch(s,{type:'end'});assert.equal(s.enemies[0].summonsMade,4);assert.equal(s.enemies.length,3);
 s.turn=9;s.enemies.slice(1).forEach(e=>e.hp=0);assert.equal(intent(s,s.enemies[0]).kind,undefined);assert.equal(dispatch(s,{type:'end'}).enemies[0].summonsMade,4);
});
test('Crownfall targets front while Cyclone sweeps and phase two is forest-specific',()=>{
 let s=fixture();s.turn=2;assert.equal(intent(s,s.enemies[0]).targeting,'sweep');s.turn=3;assert.equal(intent(s,s.enemies[0]).spell,'crownfall');assert.equal(intent(s,s.enemies[0]).targeting,'front');
 s.enemies[0].hp=121;s.hand=[{id:'firebolt',uid:9999}];s.mana=3;s=dispatch(s,{type:'play',uid:9999,target:s.enemies[0].id});
 assert.equal(s.enemies[0].bossPhase,2);assert.equal(intent(s,s.enemies[0]).damage,16);assert.match(s.events.find(e=>e.type==='boss-phase')!.message,/heartwood/);
});
test('killing the Sovereign withers every surviving root and awards final forest loot',()=>{
 let s=dispatch(fixture(),{type:'end'});s.enemies[0].hp=1;s.hand=[{id:'firebolt',uid:9999}];s.mana=3;
 s=dispatch(s,{type:'play',uid:9999,target:s.enemies[0].id});assert.ok(s.enemies.every(e=>e.hp===0));assert.equal(s.events.filter(e=>e.type==='kill'&&e.message.includes('withers')).length,2);assert.equal(s.phase,'loot');assert.equal(s.pendingLoot?.final,true);assert.equal(s.pendingLoot?.gold,200);
});
test('runtime includes 32 Sovereign frames, three root states, and a grounded Rootwake anchor',()=>{
 const m=JSON.parse(readFileSync('apps/web/public/game-assets/manifest.json','utf8'));
 const boss=m.actors['forest-sovereign'],root=m.actors['sovereign-root'];
 const distinct=new Set(Object.values(boss.states).flatMap((s:any)=>s.frames.map((f:any)=>f.src)));assert.equal(distinct.size,32);
 for(const state of ['idle','attack','die'])assert.ok(root.states[state]);assert.equal(root.states.die.loop,false);
 assert.deepEqual(m.forestSpells.rootwake.anchor,[320,450]);
 for(const actor of [boss,root])for(const s of Object.values(actor.states) as any[])for(const f of s.frames)assert.ok(existsSync('apps/web/public'+f.src));
});
