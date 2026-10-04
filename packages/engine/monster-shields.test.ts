import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {newRun,newRoguelikeRun,dispatch,intent,restore,save,usesPersistentMonsterShields,type State} from './index';
function shieldFight(maxHp=43):State {
 const s=newRoguelikeRun(42);s.enemies=[{id:800,name:'Shield bearer',art:'cairnback-hermit',hp:7,maxHp,guard:0,scorch:0,moves:[{name:'Shelter',damage:0,targeting:'hero',kind:'shield',guard:12},{name:'Wait',damage:0,targeting:'front'}]}];s.reserves=[];s.focus=800;return s;
}
test('every monster shield grants rounded half max HP, independent of wounds and old content guard',()=>{
 for(const maxHp of [1,42,43,150,190]) {
  let s=shieldFight(maxHp);s.enemies[0].hp=Math.min(7,maxHp);s.enemies[0].guard=19;
  const gain=Math.round(maxHp/2);assert.equal(intent(s,s.enemies[0]).guard,gain);
  s=dispatch(s,{type:'end'});assert.equal(s.enemies[0].guard,19+gain);
  assert.equal(s.events.find(e=>e.type==='enemy-shield')!.amount,gain);
  assert.deepEqual(s.events.find(e=>e.type==='enemy')!.targets,[]);assert.equal(s.hp,72);
 }
});
test('shield Guard persists across rounds and later shield actions add to the unspent balance without cap',()=>{
 let s=shieldFight(150);s.enemies[0].hp=150;
 s=dispatch(s,{type:'end'});assert.equal(s.enemies[0].guard,75);
 s=dispatch(s,{type:'end'});assert.equal(s.enemies[0].guard,75);
 s=dispatch(s,{type:'end'});assert.equal(s.enemies[0].guard,150);
});
test('attacks and Scorch consume shield Guard normally with only overflow damaging HP',()=>{
 let s=shieldFight(42);s.enemies[0].hp=42;s=dispatch(s,{type:'end'});assert.equal(s.enemies[0].guard,21);
 s.hand=[{id:'firebolt',uid:991}];s.mana=3;s=dispatch(s,{type:'play',uid:991,target:800});assert.equal(s.enemies[0].guard,15);assert.equal(s.enemies[0].hp,42);
 s.enemies[0].scorch=20;s=dispatch(s,{type:'end'});assert.equal(s.enemies[0].guard,0);assert.equal(s.enemies[0].hp,37);
});
test('hero and Warband Guard still expire while monster shields persist',()=>{
 let s=shieldFight();s.guard=17;s.units=[{id:900,name:'Test ally',kind:'imp',hp:6,maxHp:6,guard:13,power:0,upkeep:0,defender:false}];
 // Imp attacks apply Scorch even at zero damage: use a Hellhound to isolate expiration.
 s.units[0].kind='hellhound';s=dispatch(s,{type:'end'});assert.equal(s.guard,0);assert.equal(s.units[0].guard,0);assert.equal(s.enemies[0].guard,22);
});
test('Infernal boss intent advertises its actual 75 Guard; enrage bonus remains separate',()=>{
 let s=newRoguelikeRun(42);s.room=7;s.phase='camp';s=dispatch(s,{type:'camp'});s.turn=3;
 const m=intent(s,s.enemies[0]);assert.equal(m.guard,75);assert.match(m.name,/75 Guard/);assert.equal(s.enemies[0].bossPhase,1);
 s=dispatch(s,{type:'end'});assert.equal(s.enemies[0].guard,75);assert.equal(s.enemies[0].bossPhase,1);
 s.enemies[0].guard=0;s.enemies[0].hp=76;s.hand=[{id:'firebolt',uid:991}];s=dispatch(s,{type:'play',uid:991});assert.equal(s.enemies[0].guard,8);assert.equal(s.enemies[0].bossPhase,2);
});
test('schema7 records new rules; schema6 replays old prefix then uses half-HP shields for new actions',()=>{
 const raw=readFileSync(new URL('./fixtures/forest-roguelike-shop.json',import.meta.url),'utf8');const old=JSON.parse(raw);
 let s=restore(raw);assert.equal(s.monsterShieldRulesFrom,old.actions.length);assert.equal(usesPersistentMonsterShields(s),true);
 assert.deepEqual(restore(save(s)),s);assert.equal(JSON.parse(save(s)).schema,7);
 s=dispatch(s,{type:'leave-shop'});const gain=Math.round(s.enemies[0].maxHp/2);assert.equal(intent(s,s.enemies[0]).guard,gain);
 s=dispatch(s,{type:'end'});assert.equal(s.enemies[0].guard,gain);assert.deepEqual(restore(save(s)),s);
 const fresh=newRoguelikeRun(42);assert.equal(fresh.monsterShieldRulesFrom,0);assert.deepEqual(restore(save(fresh)),fresh);
 for(const prefix of [-1,0.5,old.actions.length+1,null])assert.throws(()=>restore(JSON.stringify({...old,schema:7,monsterShieldRulesFrom:prefix})),/shield history/);
});
test('historical fixed demos keep their capped shield rules and save schema',()=>{
 const s=newRun();s.enemies=shieldFight(150).enemies;s.enemies[0].guard=20;
 assert.equal(intent(s,s.enemies[0]).guard,12);assert.equal(dispatch(s,{type:'end'}).enemies[0].guard,24);assert.equal(JSON.parse(save(s)).schema,3);
});

test('a full newly started schema7 run wins and replays under half-HP monster shields',()=>{
 const raw=readFileSync(new URL('./fixtures/monster-shields-victory.json',import.meta.url),'utf8');
 const data=JSON.parse(raw);assert.equal(data.schema,7);assert.equal(data.monsterShieldRulesFrom,0);
 const s=restore(raw);assert.equal(s.phase,'won');assert.equal(s.room,20);assert.equal(s.hp,9);assert.deepEqual(restore(save(s)),s);
});
