import {test} from 'node:test';
import assert from 'node:assert/strict';
import {newInfernalRun,availableNodes,dispatch,currentShop,prepareShop,save,restore,playable,type State} from './index';

test('entry is explicit, adjacency is bidirectional and a skipped branch remains explorable',()=>{
 let s=newInfernalRun(42);
 assert.deepEqual(availableNodes(s).map(n=>n.row),[0,0,0]);
 const [first,skipped]=availableNodes(s);
 const junction=s.journey!.nodes.find(n=>n.id===first.next[0])!;
 // Completed first battle and junction: return along its incoming edge to the skipped start.
 s.journey!.current=junction.id;s.journey!.completed=[first.id,junction.id];
 assert.ok(availableNodes(s).some(n=>n.id===first.id));
 assert.ok(availableNodes(s).some(n=>n.id===skipped.id));
 s=dispatch(s,{type:'travel',node:skipped.id});
 assert.equal(s.phase,'combat');assert.equal(s.journey!.current,skipped.id);
 assert.ok(s.enemies.length>0);
 assert.throws(()=>dispatch(s,{type:'travel',node:junction.id}),/connected/);
});

test('cleared battles are waypoints: no heal, resource reset, combat, random draw or rewards on revisits',()=>{
 let s=newInfernalRun(42);
 const first=s.journey!.nodes[0],junction=s.journey!.nodes.find(n=>n.id===first.next[0])!;
 s.journey!.current=junction.id;s.journey!.completed=[first.id,junction.id];
 s.hp=31;s.gold=91;s.cinders=7;s.relics=['ember-heart'];
 const before=structuredClone(s);
 s=dispatch(s,{type:'travel',node:first.id});
 assert.equal(s.phase,'map');assert.equal(s.hp,31);assert.equal(s.gold,91);
 assert.equal(s.cinders,7);assert.equal(s.rng,before.rng);
 assert.deepEqual(s.enemies,before.enemies);assert.deepEqual(s.hand,before.hand);
 assert.deepEqual(s.pendingLoot,before.pendingLoot);assert.deepEqual(s.rewards,before.rewards);
 s=dispatch(s,{type:'travel',node:junction.id});
 assert.deepEqual(s.journey!.completed,before.journey!.completed);
});

test('claimed treasure never grants a second relic or gold after walking away and back',()=>{
 let s=newInfernalRun(42);
 const treasure=s.journey!.nodes.find(n=>n.kind==='treasure')!;
 const neighbor=s.journey!.nodes.find(n=>n.next.includes(treasure.id))!;
 s.journey!.current=treasure.id;s.journey!.completed=[neighbor.id];s.phase='treasure';
 s=dispatch(s,{type:'claim-treasure'});s=dispatch(s,{type:'continue'});
 const relics=[...s.relics],gold=s.gold,rng=s.rng;
 s=dispatch(s,{type:'travel',node:neighbor.id});
 s=dispatch(s,{type:'travel',node:treasure.id});
 assert.equal(s.phase,'map');assert.deepEqual(s.relics,relics);assert.equal(s.gold,gold);assert.equal(s.rng,rng);
 assert.throws(()=>dispatch(s,{type:'claim-treasure'}),/No treasure/);
 assert.equal(s.journey!.completed.filter(id=>id===treasure.id).length,1);
});

test('shop revisit preserves sold cards, relics, upgrades and reroll prices',()=>{
 let s=newInfernalRun(42);
 const shop=s.journey!.nodes.find(n=>n.kind==='shop')!;
 const neighbor=s.journey!.nodes.find(n=>n.next.includes(shop.id))!;
 s.journey!.current=shop.id;s.journey!.completed=[neighbor.id];s.phase='shop';s.gold=1000;
 prepareShop(s);
 s=dispatch(s,{type:'shop-reroll',kind:'buy'});
 s=dispatch(s,{type:'shop-buy',kind:'card',index:0});
 s=dispatch(s,{type:'shop-buy',kind:'relic',index:0});
 s=dispatch(s,{type:'shop-upgrade',index:currentShop(s)!.upgrades[0].index});
 const stock=structuredClone(currentShop(s)),gold=s.gold;
 s=dispatch(s,{type:'leave-shop'});s=dispatch(s,{type:'travel',node:neighbor.id});
 s=dispatch(s,{type:'travel',node:shop.id});
 assert.equal(s.phase,'shop');assert.equal(s.gold,gold);assert.deepEqual(currentShop(s),stock);
 assert.throws(()=>dispatch(s,{type:'shop-buy',kind:'card',index:0}),/Sold out/);
 s=dispatch(s,{type:'leave-shop'});
 assert.equal(s.journey!.completed.filter(id=>id===shop.id).length,1);
});

test('unconnected locations and the distant Sovereign remain inaccessible without changing state',()=>{
 const s=newInfernalRun(42),boss=s.journey!.nodes.find(n=>n.kind==='boss')!;
 const before=structuredClone(s);
 assert.throws(()=>dispatch(s,{type:'travel',node:boss.id}),/connected/);
 assert.deepEqual(s,before);
 s.journey!.current=s.journey!.nodes[0].id;
 assert.throws(()=>dispatch(s,{type:'travel',node:boss.id}),/connected/);
 assert.throws(()=>dispatch(s,{type:'travel',node:s.journey!.current!}),/connected/);
 s.journey!.current='missing-location';assert.deepEqual(availableNodes(s),[]);
});

test('acknowledging Sovereign loot marks its location completed and ends the journey',()=>{
 let s=newInfernalRun(42);
 const boss=s.journey!.nodes.find(n=>n.kind==='boss')!;
 s.journey!.current=boss.id;s.phase='loot';s.pendingLoot={gold:0,items:[],final:true};
 s=dispatch(s,{type:'continue'});
 assert.equal(s.phase,'won');assert.ok(s.journey!.completed.includes(boss.id));
 assert.deepEqual(availableNodes(s),[]);
});

function reachShop(seed:number,legacy:boolean):State {
 let s=newInfernalRun(seed,'warband',legacy);
 for(let i=0;i<400&&s.phase!=='shop'&&s.phase!=='lost';i++) {
  if(s.phase==='map')s=dispatch(s,{type:'travel',node:availableNodes(s)[0].id});
  else if(s.phase==='combat') {
   const card=s.hand.find(c=>playable(s,c)&&(!c.id.startsWith('summon-')||s.units.length<5));
   s=dispatch(s,card?{type:'play',uid:card.uid,target:s.enemies.find(e=>e.hp>0)!.id,...(s.units.length?{unit:s.units.at(-1)!.id}:{})}:{type:'end'});
  } else if(s.phase==='reward')s=dispatch(s,{type:'reward',card:null});
  else if(s.phase==='loot')s=dispatch(s,{type:'continue'});
  else if(s.phase==='treasure')s=dispatch(s,{type:'claim-treasure'});
 }
 return s;
}
test('schema4 and schema5 real histories restore backtracking and reopening the same shop',()=>{
 for(const legacy of [false,true]) {
  let s:State|undefined;
  for(let seed=0;seed<40;seed++){const candidate=reachShop(seed,legacy);if(candidate.phase==='shop'){s=candidate;break;}}
  assert.ok(s);const shopId=s.journey!.current!;
  const neighbor=s.journey!.nodes.find(n=>n.next.includes(shopId)&&s!.journey!.completed.includes(n.id))!;
  assert.ok(neighbor);s=dispatch(s,{type:'leave-shop'});
  s=dispatch(s,{type:'travel',node:neighbor.id});assert.equal(s.phase,'map');
  s=dispatch(s,{type:'travel',node:shopId});assert.equal(s.phase,'shop');
  assert.deepEqual(restore(save(s)),s);
 }
});
