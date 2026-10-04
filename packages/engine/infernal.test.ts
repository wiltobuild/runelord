import {test} from 'node:test';
import assert from 'node:assert/strict';
import {newInfernalRun,generateInfernalJourney,availableNodes,dispatch,currentShop,upgradeCost,cardPower,manaCost,playable,save,restore,newRun,type State} from './index';
import {relicPool,type CardId} from '../content/index';
function shop():State {const s=newInfernalRun(42,"warband",true);s.journey!.current=s.journey!.nodes.find(n=>n.kind==='shop')!.id;s.phase='shop';s.gold=10000;return s;}
function combat(id:CardId,level=0):State {let s=newInfernalRun(42);s=dispatch(s,{type:'travel',node:availableNodes(s)[0].id});s.hand=[{uid:999,id,level}];s.mana=20;s.cinders=20;s.enemies.forEach(e=>e.hp=e.maxHp=1000);return s;}
test('200 seeded zones have reachable boss and exactly two shops/two treasures on every possible path',()=>{
 for(let seed=0;seed<200;seed++){
  const {nodes}=generateInfernalJourney(seed);assert.equal(nodes.length,21);
  const budget=new Map<string,Set<string>>();
  for(const n of nodes){const incoming=n.row===0?new Set(['0,0']):new Set(nodes.filter(p=>p.next.includes(n.id)).flatMap(p=>[...budget.get(p.id)!]));assert.ok(incoming.size);const own=[+(n.kind==='shop'),+(n.kind==='treasure')];budget.set(n.id,new Set([...incoming].map(v=>v.split(',').map((x,i)=>+x+own[i]).join(','))));for(const id of n.next){const row=nodes.find(x=>x.id===id)!.row;assert.ok(row===n.row+1||(n.id==="infernal-v2-11-1"&&id==="infernal-v2-13-0"),"Unexpected non-adjacent row connection");}}
  assert.deepEqual([...budget.get('infernal-v2-13-0')!],['2,2']);
 }
 assert.deepEqual(generateInfernalJourney(123),generateInfernalJourney(123));assert.notDeepEqual(generateInfernalJourney(123),generateInfernalJourney(124));
});
test('travel cannot skip edges or retravel and schema4 reproduces seeded map and first fight',()=>{const s=newInfernalRun(7);assert.throws(()=>dispatch(s,{type:'travel',node:'infernal-4-1'}));const t=dispatch(s,{type:'travel',node:availableNodes(s)[1].id});assert.throws(()=>dispatch(t,{type:'travel',node:'infernal-0-1'}));assert.deepEqual(restore(save(t)),t);assert.deepEqual(restore(save(newRun(7))),newRun(7));});
test('shop inventory deterministic, finite; duplicates and owned relics rejected without changing source',()=>{let s=shop();const stock=currentShop(s)!;assert.equal(stock.relics.length,5);assert.equal(new Set(stock.relics.map(r=>r.id)).size,5);assert.equal(stock.cards.filter(c=>c.id.startsWith('neutral-')).length,3);const price=stock.cards[0].price;s=dispatch(s,{type:'shop-buy',kind:'card',index:0});assert.equal(s.gold,10000-price);assert.throws(()=>dispatch(s,{type:'shop-buy',kind:'card',index:0}));s=dispatch(s,{type:'shop-buy',kind:'relic',index:0});assert.ok(s.relics.includes(currentShop(s)!.relics[0].id));const before=structuredClone(s);assert.throws(()=>dispatch(s,{type:'shop-buy',kind:'card',index:NaN}));assert.deepEqual(s,before);});
test('per-copy upgrade levels charge50/100/200, scale effects, lower costly mana at level3',()=>{let s=shop();for(let i=0;i<3;i++)s=dispatch(s,{type:'shop-upgrade',index:0});assert.deepEqual(s.deckLevels!.slice(0,2),[3,0]);assert.equal(s.gold,9650);assert.equal(upgradeCost(3),400);assert.equal(cardPower(3),1.7279999999999998);assert.equal(manaCost(s,{uid:1,id:'neutral-bulwark',level:3}),1);assert.equal(manaCost(s,{uid:1,id:'neutral-bulwark',level:30}),1);for(const level of [0,1,2,3]){const c=combat('firebolt',level);const n=dispatch(c,{type:'play',uid:999});assert.equal(n.enemies[0].hp,1000-Math.round(6*cardPower(level)));const a=dispatch(combat('summon-hellhound',level),{type:'play',uid:999});assert.equal(a.units[0].power,Math.round(6*cardPower(level)));assert.equal(a.units[0].hp,Math.round(14*cardPower(level)));}});
test('removal enforces ten cards and updates aligned upgrade levels; acquisition enforces caps',()=>{let s=shop();assert.throws(()=>dispatch(s,{type:'shop-remove',index:0}),/10/);s.deck.push('neutral-strike');s.deckLevels!.push(2);s=dispatch(s,{type:'shop-remove',index:0});assert.equal(s.deck.length,10);assert.equal(s.deckLevels!.at(-1),2);assert.equal(s.gold,9990);const st=currentShop(s)!;st.cards[0]={id:'neutral-strike',price:1,sold:false};s.deck.push('neutral-strike','neutral-strike');assert.throws(()=>dispatch(s,{type:'shop-buy',kind:'card',index:0}),/limit/);st.cards[0]={id:'neutral-renewal',price:1,sold:false};s.deck.push('neutral-renewal','neutral-renewal');assert.throws(()=>dispatch(s,{type:'shop-buy',kind:'card',index:0}),/limit/);});
test('neutral cards resolve and all six shop relics produce functional combat benefits',()=>{for(const id of ['neutral-strike','neutral-bulwark','neutral-insight','neutral-renewal'] as CardId[]){const s=combat(id);s.hp=30;const n=dispatch(s,{type:'play',uid:999});assert.ok(n.hp>s.hp||n.guard>s.guard||n.enemies[0].hp<s.enemies[0].hp);}let s=newInfernalRun(19);s.relics=[...relicPool];s.hp=40;s=dispatch(s,{type:'travel',node:availableNodes(s)[0].id});assert.equal(s.hp,45);assert.equal(s.guard,3);assert.equal(s.cinders,4);assert.equal(s.hand.length,6);s.hand=[{uid:777,id:'summon-imp'},{uid:778,id:'firebolt'}];s.enemies[0].hp=100;const a=dispatch(s,{type:'play',uid:777});assert.equal(a.units[0].power,6);const b=dispatch(a,{type:'play',uid:778});assert.equal(a.enemies[0].hp-b.enemies[0].hp,7);});
test('treasure can be claimed once, acknowledgement returns map and all-owned fallback is gold',()=>{let s=newInfernalRun(42);s.journey!.current=s.journey!.nodes.find(n=>n.kind==='treasure')!.id;s.phase='treasure';s=dispatch(s,{type:'claim-treasure'});assert.equal(s.phase,'loot');assert.equal(s.relics.length,1);assert.throws(()=>dispatch(s,{type:'claim-treasure'}));s=dispatch(s,{type:'continue'});assert.equal(s.phase,'map');assert.equal(availableNodes(s).length>0,true);s.journey!.current=s.journey!.nodes.filter(n=>n.kind==='treasure').at(-1)!.id;s.phase='treasure';s.relics=[...relicPool];s=dispatch(s,{type:'claim-treasure'});assert.equal(s.gold,75);});

test('real combat-to-shop play history restores purchases and per-copy upgrades exactly',()=>{
 let s=newInfernalRun(12,'warband',true);
 for(let i=0;i<200&&s.phase!=='shop'&&s.phase!=='lost';i++) {
  if(s.phase==='map')s=dispatch(s,{type:'travel',node:availableNodes(s)[0].id});
  else if(s.phase==='combat'){const c=s.hand.find(c=>playable(s,c)&&(!c.id.startsWith('summon-')||s.units.length<5));s=dispatch(s,c?{type:'play',uid:c.uid,target:s.enemies.find(e=>e.hp>0)!.id,...(s.units.length?{unit:s.units.at(-1)!.id}:{})}:{type:'end'});}
  else if(s.phase==='reward')s=dispatch(s,{type:'reward',card:null});
  else if(s.phase==='loot')s=dispatch(s,{type:'continue'});
  else if(s.phase==='treasure')s=dispatch(s,{type:'claim-treasure'});
 }
 assert.equal(s.phase,'shop');s=dispatch(s,{type:'shop-upgrade',index:0});
 const index=currentShop(s)!.cards.findIndex(c=>c.id.startsWith('neutral-')&&c.price<=s.gold);
 assert.ok(index>=0);s=dispatch(s,{type:'shop-buy',kind:'card',index});
 assert.deepEqual(restore(save(s)),s);
 s=dispatch(s,{type:'leave-shop'});s=dispatch(s,{type:'travel',node:availableNodes(s)[0].id});
 assert.deepEqual(restore(save(s)),s);
 assert.ok([...s.hand,...s.draw].some(c=>c.level===1));
});

test('small whole-number effects improve at each paid level; Combust scales final damage',()=>{
 for(const level of [1,2,3]){
  let s=combat('blood-pact',level);s.cinders=0;assert.equal(dispatch(s,{type:'play',uid:999}).cinders,1+Math.max(2+level,Math.round(2*cardPower(level))));
  for(const id of ['burning-soul','dread-aura','masters-of-the-pit'] as CardId[]){const base=id==='masters-of-the-pit'?2:1;const n=dispatch(combat(id,level),{type:'play',uid:999});assert.equal(n.powers[id],Math.max(base+level,Math.round(base*cardPower(level))));}
  s=combat('combust',level);s.enemies[0].scorch=10;assert.equal(dispatch(s,{type:'play',uid:999}).enemies[0].hp,1000-Math.max(20+level,Math.round(20*cardPower(level))));
 }
});

test('historical map connections vary by seed while generation is repeatable',()=>{const topology=(seed:number)=>generateInfernalJourney(seed,true).nodes.map(n=>n.next);assert.deepEqual(topology(55),topology(55));assert.notDeepEqual(topology(55),topology(56));});
