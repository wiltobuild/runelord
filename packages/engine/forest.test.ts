// Preserve this pre-expansion regression suite; expansion behavior has dedicated coverage.
const newInfernalRun=(...args:Parameters<typeof currentInfernalRun>)=>{const originalLength=args.length;if(originalLength<6&&!args[2])args[5]=0;if(originalLength<7&&!args[2])args[6]=0;args[9]??=1;return currentInfernalRun(...args);};
import {readFileSync} from 'node:fs';
import {test} from 'node:test';
import assert from 'node:assert/strict';
import {newInfernalRun as currentInfernalRun,generateForestJourney,FOREST_ENEMY_IDS,dispatch,currentShop,upgradeCost,mapDestinations,resolveTargets,intent,save,restore,type State} from './index';

function crownLoot(legacy=false):State {
 const s=newInfernalRun(29,'warband',legacy);
 s.journey!.current=s.journey!.nodes.find(n=>n.kind==='boss')!.id;
 s.phase='loot';s.pendingLoot={gold:150,items:['demon-lord-crown'],final:true};
 s.deck.push('pyroclasm');s.deckLevels!.push(2);s.deckLevels![0]=3;
 s.relics=['demon-lord-crown','ember-heart','warband-fang'];s.inventory=['mana-potion'];s.gold=321;s.hp=43;s.maxHp=80;
 return s;
}
function enter(s:State,id:string):State {return dispatch(dispatch(s,{type:'arrive',node:id}),{type:'enter-location'});}
function win(s:State):State {
 s.enemies.forEach(e=>{e.hp=1;e.scorch=0;});s.reserves=[];
 s.hand=[{uid:999999,id:'conflagrate',level:20}];s.mana=20;s.cinders=20;
 s=dispatch(s,{type:'play',uid:999999});
 if(s.phase==='reward')s=dispatch(s,{type:'reward',card:null});
 return dispatch(s,{type:'continue'});
}
test('forest has twelve battles and a finite shop after every three with no excluded monsters',()=>{
 for(const seed of [0,1,29,7319,4294967295]) {
  const journey=generateForestJourney(seed);assert.equal(journey.realm,'forest');assert.equal(journey.nodes.length,16);
  assert.equal(journey.nodes.filter(n=>n.kind==='boss').length,1);
  assert.deepEqual(journey.nodes.filter(n=>n.kind==='shop').map(n=>n.id),[3,6,9,12].map(n=>`forest-shop-${n}`));
  for(const node of journey.nodes) {
   assert.ok(['forest','forest-heart'].includes(node.encounter.background));
   for(const e of [...node.encounter.enemies,...(node.encounter.reserves||[])]) {
    assert.ok((FOREST_ENEMY_IDS as readonly string[]).includes(e.art)||e.art==='forest-sovereign');assert.equal(e.boss,e.art==='forest-sovereign'?'forest-sovereign':undefined);
    assert.ok(!/fire|undead|suture|crucible|kiln|crownfire|hellhound|imp/i.test(e.art));
    assert.ok(e.moves.every(m=>m.targeting&&(m.kind!=='summon'||e.boss==='forest-sovereign')));
   }
  }
  assert.deepEqual(generateForestJourney(seed),journey);
 }
 assert.notDeepEqual(generateForestJourney(1).shops,generateForestJourney(2).shops);
});
test('infernal crown acknowledgement continues with every permanent gain intact, legacy still finishes',()=>{
 const before=crownLoot();const after=dispatch(before,{type:'continue'});
 assert.equal(after.phase,'map');assert.equal(after.journey!.realm,'forest');
 for(const key of ['deck','deckLevels','relics','inventory','gold','hp','maxHp','seed','rng','starterDeck','potion'] as const)assert.deepEqual(after[key],before[key],key);
 assert.equal(mapDestinations(after)[0].id,'forest-1');
 assert.equal(dispatch(crownLoot(true),{type:'continue'}).phase,'won');
 const battle=enter(after,'forest-1');assert.equal(battle.mana,4);assert.equal(battle.hp,48);
 assert.ok([...battle.hand,...battle.draw].some(c=>c.id==='pyroclasm'&&c.level===2));
 assert.ok([...battle.hand,...battle.draw].some(c=>c.level===3));
});
test('complete forest route reaches each encounter once, four shops, and wins only after final shop',()=>{
 let s=dispatch(crownLoot(),{type:'continue'});s.frozenWastesVersion=1;const visited:string[]=[];
 while(s.phase!=='won') {
  const destination=mapDestinations(s).find(n=>!s.journey!.completed.includes(n.id));assert.ok(destination);
  visited.push(destination.id);s=enter(s,destination.id);
  if(s.phase==='shop')s=dispatch(s,{type:'leave-shop'});else s=win(s);
  assert.ok(visited.length<=16);
 }
 assert.equal(visited.length,16);assert.equal(s.journey!.completed.length,16);assert.ok(s.relics.includes('demon-lord-crown'));
 assert.equal(s.relics.filter(id=>id==='demon-lord-crown').length,1);
 assert.throws(()=>dispatch(s,{type:'continue'}));
});
test('forest intents preserve Defender and sweep counterplay with zero, one and five allies',()=>{
 for(const count of [0,1,5]) {
  let s=enter(dispatch(crownLoot(),{type:'continue'}),'forest-1');
  s.units=Array.from({length:count},(_,i)=>({id:500+i,name:'Defender',kind:'pit-brute' as const,hp:26,maxHp:26,guard:0,power:10,upkeep:0,defender:i===0}));
  assert.equal(resolveTargets(s,'hero')[0],count?s.units[0]:'hero');assert.equal(resolveTargets(s,'sweep').length,count+1);
  s.guard=0;s.enemies.forEach(e=>{e.hp=e.maxHp=1000;});s.turn=2;assert.equal(intent(s,s.enemies[0]).targeting,'sweep');
  const n=dispatch(s,{type:'end'});assert.ok(n.hp<s.hp);assert.ok(n.phase!=='lost');
 }
});
test('forest budgets escalate against earned upgrades without scaling to player build',()=>{
 const battles=generateForestJourney(29).nodes.filter(n=>n.kind!=='shop');
 const hp=(n:typeof battles[number])=>[...n.encounter.enemies,...n.encounter.reserves||[]].reduce((sum,e)=>sum+e.hp,0);
 assert.equal(hp(battles[0]),84);assert.ok(hp(battles[9])>hp(battles[0])*2);assert.equal(hp(battles[11]),240);
 assert.ok(battles[11].encounter.enemies.some(e=>e.moves.some(m=>m.targeting==='sweep')));
 assert.deepEqual(restore(save(newInfernalRun(29))),newInfernalRun(29));
});


// Seed 0, 228 legal actions: earned rewards, shop services, Sovereign crown, and three forest fights.
test('earned campaign history replays across realms and preserves forest stock and paid upgrades',()=>{
 const fixture=readFileSync(new URL('./fixtures/forest-shop-save.json',import.meta.url),'utf8');
 let s=restore(fixture);
 assert.equal(s.journey!.realm,'forest');assert.equal(s.journey!.current,'forest-shop-3');assert.equal(s.phase,'shop');
 assert.ok(s.relics.includes('demon-lord-crown'));assert.deepEqual(restore(save(s)),s);
 const offer=currentShop(s)!.upgrades.find(o=>!o.sold&&upgradeCost(o.level)<=s.gold);assert.ok(offer);
 const level=s.deckLevels![offer.index];s=dispatch(s,{type:'shop-upgrade',index:offer.index});assert.equal(s.deckLevels![offer.index],level+1);
 const buy=currentShop(s)!.cards.findIndex(c=>!c.sold&&c.price<=s.gold&&s.deck.filter(id=>id===c.id).length<(c.id==='neutral-renewal'?2:3));assert.ok(buy>=0);
 s=dispatch(s,{type:'shop-buy',kind:'card',index:buy});assert.deepEqual(restore(save(s)),s);
 s=dispatch(s,{type:'leave-shop'});s=dispatch(s,{type:'travel',node:'forest-4'});assert.deepEqual(restore(save(s)),s);
});

test('complete earned campaign replays twelve forest victories and all four shops through final victory',()=>{
 const s=restore(readFileSync(new URL('./fixtures/forest-complete-save.json',import.meta.url),'utf8'));
 assert.equal(s.phase,'won');assert.equal(s.journey!.realm,'forest');assert.equal(s.journey!.completed.length,16);
 assert.equal(s.journey!.current,'forest-shop-12');assert.deepEqual(restore(save(s)),s);
});
