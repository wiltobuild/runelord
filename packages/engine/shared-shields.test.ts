import test from 'node:test';
import assert from 'node:assert/strict';
import {newInfernalRun,dispatch,intent,save,restore,availableNodes,type State} from './index';
function shieldFight(maxHp=43):State {const initial=newInfernalRun(42),s=dispatch(initial,{type:'travel',node:availableNodes(initial)[0].id});s.enemies=[{id:800,name:'Shield bearer',art:'cairnback-hermit',hp:7,maxHp,guard:0,scorch:0,moves:[{name:'Shelter',damage:0,targeting:'hero',kind:'shield',guard:12},{name:'Wait',damage:0,targeting:'front'}]}];s.reserves=[];s.focus=800;return s;}
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
 let s=newInfernalRun(42);const boss=s.journey!.nodes.find(n=>n.kind==='boss')!;s.journey!.current=boss.id;s.room=boss.encounterIndex;s=dispatch(s,{type:'enter-location'});s.turn=3;
 const m=intent(s,s.enemies[0]);assert.equal(m.guard,75);assert.match(m.name,/75 Guard/);assert.equal(s.enemies[0].bossPhase,1);
 s=dispatch(s,{type:'end'});assert.equal(s.enemies[0].guard,75);assert.equal(s.enemies[0].bossPhase,1);
 s.enemies[0].guard=0;s.enemies[0].hp=76;s.hand=[{id:'firebolt',uid:991}];s=dispatch(s,{type:'play',uid:991});assert.equal(s.enemies[0].guard,8);assert.equal(s.enemies[0].bossPhase,2);
});

test('shield marker survives replay and old campaign saves keep historical capped shields',()=>{for(const modern of [false,true]){let s=newInfernalRun(42,'warband',false,'warlock',1,undefined,modern?0:undefined);const raw=JSON.parse(save(s));if(!modern)delete raw.monsterShieldRulesFrom;assert.deepEqual(restore(JSON.stringify(raw)),s);s=dispatch(s,{type:'travel',node:availableNodes(s)[0].id});s.enemies=shieldFight(150).enemies;s.enemies[0].guard=20;assert.equal(intent(s,s.enemies[0]).guard,modern?75:12);s=dispatch(s,{type:'end'});assert.equal(s.enemies[0].guard,modern?95:24);}const raw=JSON.parse(save(newInfernalRun()));for(const n of [-1,1,.5,null])assert.throws(()=>restore(JSON.stringify({...raw,monsterShieldRulesFrom:n})),/shield history/);});
