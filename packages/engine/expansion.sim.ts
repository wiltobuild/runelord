import assert from "node:assert/strict";
import { newRun, dispatch, playable, save, restore, type State, type Action } from './index';
import { starterDecks, cards, cardTargetsUnit } from '../content/index';
function score(s:State) {
  if(s.phase==='lost') return -100000;
  return s.room*5000 + (s.phase==='reward'||s.phase==='camp'?3500:s.phase==='won'?100000:0) + s.hp*2.8 + s.guard*.8 + s.mana*1.6 + s.cinders*.4 + s.hand.length*1.1 + s.corruption*.3
   + s.units.reduce((a,u)=>a+u.hp*.4+u.power*2.6-u.upkeep,0) - s.enemies.reduce((a,e)=>a+Math.max(e.hp,0)*1.5-e.scorch*1.5,0) - s.reserves.reduce((a,e)=>a+e.hp*1.5,0)
   + Object.values(s.powers).reduce((a,p)=>a+(p||0)*3,0);
}
const results=[];
for(const rulesVersion of [2,3] as const) for(const deck of starterDecks) for(const seed of [1,2,3,4,5,7319]) {
 let s=newRun(seed,deck.id,rulesVersion), actions=0;
 while(!['won','lost'].includes(s.phase) && actions++<500) {
   if(s.phase==='reward') {
     const preferred=deck.id==='fire'?['hellfire','pyroclasm','fire-and-brimstone','conflagrate','smoldering-brand','immolate']:deck.id==='warband'?['masters-of-the-pit','burning-soul','summon-pit-brute','summon-hellhound','summon-imp']:['infernal-pact','demonic-resilience','infernal-transformation','shadowflame-barrier','blood-price'];
     s=dispatch(s,{type:'reward',card:s.rewards.find(id=>preferred.includes(id))||s.rewards[0]}); continue;
   }
   if(s.phase==='loot') {s=dispatch(s,{type:'continue'});continue;}
   if(s.phase==='camp') {s=dispatch(s,{type:'camp'});continue;}
   if(s.potion && s.hp<s.maxHp-14) {s=dispatch(s,{type:'potion'});continue;}
   const actionsAvailable:Action[]=[];
   for(const item of s.inventory) if(item!=='healing-draught'||s.hp<s.maxHp-14) actionsAvailable.push({type:'item',item});
   for(const c of s.hand.filter(c=>playable(s,c))) for(const enemy of s.enemies.filter(e=>e.hp>0)) {
     const targets=cardTargetsUnit(c.id)?s.units:[undefined];
     for(const unit of targets) actionsAvailable.push({type:'play',uid:c.uid,target:enemy.id,unit:unit?.id,dismiss:s.units.length>=5?s.units.reduce((a,b)=>a.hp<b.hp?a:b).id:undefined});
   }
   const candidates=actionsAvailable.map(action=>{try{return dispatch(s,action);}catch{return null;}}).filter((v):v is State=>!!v);
   const best=candidates.sort((a,b)=>score(b)-score(a))[0];
   if(best && score(best)>score(s)+.01) s=best; else s=dispatch(s,{type:'end'});
 }
 if(rulesVersion===3) assert.deepEqual(JSON.parse(JSON.stringify(restore(save(s)))), JSON.parse(JSON.stringify(s)), `Full run replay: ${deck.id}/${seed}`);
 else {
   let migrated=restore(JSON.stringify({schema:2,seed,starterDeck:deck.id,actions:s.history}));
   assert.equal(migrated.hp,s.hp); assert.equal(migrated.gold,s.gold); assert.equal(migrated.rng,s.rng); assert.deepEqual(migrated.deck,s.deck); assert.deepEqual(migrated.inventory,s.inventory);
   assert.deepEqual(restore(save(migrated)),migrated);
   if(s.phase==='won') {
     assert.equal(migrated.phase,'loot'); assert.equal(migrated.room,7);
     migrated=dispatch(migrated,{type:'continue'}); assert.equal(migrated.phase,'camp');
     migrated=dispatch(migrated,{type:'camp'}); assert.equal(migrated.room,8); assert.equal(migrated.enemies[0].boss,'demon-lord'); assert.equal(migrated.gold,s.gold);
     assert.deepEqual(restore(save(migrated)),migrated);
   }
 }
 results.push({rulesVersion,deck:deck.id,seed,phase:s.phase,room:s.room+1,hp:s.hp,actions});
}
console.log(JSON.stringify(results,null,2));
if(results.some(r=>r.actions>=500)) throw Error('Simulation softlock');

