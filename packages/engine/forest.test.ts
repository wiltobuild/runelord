import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {newRoguelikeRun,newRun,forestEncounters,FOREST_ENEMY_IDS,activeEncounter,currentRealm,encounterCount,realmEncounterNumber,realmEncounterCount,isRealmBoss,dispatch,currentShop,upgradeCost,canAddCard,resolveTargets,intent,save,restore,type State} from './index';
import {encounters} from '../content/index';
const fixture=(name:string)=>readFileSync(new URL(`./fixtures/forest-roguelike-${name}.json`,import.meta.url),'utf8');
function crown():State {
 const s=newRoguelikeRun(29);s.room=8;s.phase='loot';s.pendingLoot={gold:105,items:['demon-lord-crown'],final:true};
 s.deck.push('pyroclasm');s.deckLevels!.push(2);s.deckLevels![0]=3;
 s.relics=['demon-lord-crown','ember-heart','warband-fang'];s.inventory=['mana-potion'];s.gold=321;s.hp=43;s.maxHp=80;
 return s;
}
function firstForest():State {return dispatch(dispatch(crown(),{type:'continue'}),{type:'leave-shop'});}
test('linear roguelike keeps nine infernal fights and appends twelve forest fights without campaign state',()=>{
 const s=newRoguelikeRun();assert.equal(encounters.length,9);assert.equal(encounterCount(s),21);assert.equal(encounterCount(newRun()),9);
 assert.equal(forestEncounters.length,12);assert.ok(!('journey' in s));
 for(let room=0;room<21;room++) {
  s.room=room;assert.equal(currentRealm(s),room<9?'infernal':'forest');assert.equal(realmEncounterNumber(s),room<9?room+1:room-8);
  assert.equal(realmEncounterCount(s),room<9?9:12);assert.equal(isRealmBoss(s),room===8||room===20);
  assert.equal(activeEncounter(s),room<9?encounters[room]:forestEncounters[room-9]);
 }
});
test('forest roster uses only selected animated creatures and excludes fire, undead, standard and infernal summons',()=>{
 for(const encounter of forestEncounters) {
  assert.ok(['forest','forest-heart'].includes(encounter.background));
  for(const e of [...encounter.enemies,...encounter.reserves||[]]) {
   assert.ok((FOREST_ENEMY_IDS as readonly string[]).includes(e.art));assert.equal(e.boss,undefined);
   assert.ok(!/fire|undead|suture|crucible|kiln|crownfire|hellhound|imp/i.test(e.art));
   assert.ok(e.moves.every(m=>m.targeting&&m.kind!=='summon'));
  }
 }
 const hp=(i:number)=>[...forestEncounters[i].enemies,...forestEncounters[i].reserves||[]].reduce((sum,e)=>sum+e.hp,0);
 assert.equal(hp(0),84);assert.ok(hp(9)>hp(0)*2);assert.equal(hp(11),320);
 assert.ok(forestEncounters[11].enemies.some(e=>e.moves.some(m=>m.targeting==='sweep')));
});
test('crown loot opens the third shop then forest with permanent progression intact and crown effects active',()=>{
 const before=crown();const shop=dispatch(before,{type:'continue'});
 assert.equal(shop.phase,'shop');assert.equal(shop.shops!.current,'roguelike-9');assert.equal(currentRealm(shop),'infernal');
 for(const key of ['deck','deckLevels','relics','inventory','gold','hp','maxHp','rng','starterDeck','potion'] as const)assert.deepEqual(shop[key],before[key],key);
 const battle=dispatch(shop,{type:'leave-shop'});assert.equal(battle.phase,'combat');assert.equal(battle.room,9);assert.equal(currentRealm(battle),'forest');
 assert.equal(battle.mana,4);assert.equal(battle.hp,48);assert.ok([...battle.hand,...battle.draw].some(c=>c.id==='pyroclasm'&&c.level===2));
 assert.ok(battle.events.some(e=>e.type==='realm'));assert.equal(battle.relics.filter(id=>id==='demon-lord-crown').length,1);
});
test('forest intents retain zero, one and five-unit targeting, Defender and unavoidable sweep',()=>{
 for(const count of [0,1,5]) {
  let s=firstForest();s.units=Array.from({length:count},(_,i)=>({id:500+i,name:'Defender',kind:'pit-brute' as const,hp:26,maxHp:26,guard:0,power:10,upkeep:0,defender:i===0}));
  assert.equal(resolveTargets(s,'hero')[0],count?s.units[0]:'hero');assert.equal(resolveTargets(s,'sweep').length,count+1);
  s.guard=0;s.enemies.forEach(e=>{e.hp=e.maxHp=1000;});s.turn=2;assert.equal(intent(s,s.enemies[0]).targeting,'sweep');
  const n=dispatch(s,{type:'end'});assert.ok(n.hp<s.hp);assert.notEqual(n.phase,'lost');
 }
});
test('real schema6 history crosses realms and preserves forest purchases, upgrades and seeded next combat',()=>{
 let s=restore(fixture('shop'));assert.equal(s.room,11);assert.equal(s.phase,'shop');assert.equal(currentRealm(s),'forest');assert.deepEqual(restore(save(s)),s);
 const offer=currentShop(s)!.upgrades.find(o=>!o.sold&&upgradeCost(o.level)<=s.gold);assert.ok(offer);const level=s.deckLevels![offer.index];
 s=dispatch(s,{type:'shop-upgrade',index:offer.index});assert.equal(s.deckLevels![offer.index],level+1);
 const buy=currentShop(s)!.cards.findIndex(c=>!c.sold&&c.price<=s.gold&&canAddCard(s,c.id));assert.ok(buy>=0);
 s=dispatch(s,{type:'shop-buy',kind:'card',index:buy});assert.deepEqual(restore(save(s)),s);
 s=dispatch(s,{type:'leave-shop'});assert.equal(s.room,12);assert.deepEqual(restore(save(s)),s);
});
test('full legal run replays all twenty-one victories, seven shops, and final victory exactly',()=>{
 const s=restore(fixture('complete'));assert.equal(s.phase,'won');assert.equal(s.room,20);assert.equal(currentRealm(s),'forest');
 assert.deepEqual(Object.keys(s.shops!.stock),[3,6,9,12,15,18,21].map(n=>`roguelike-${n}`));assert.deepEqual(restore(save(s)),s);
 const history=JSON.parse(fixture('complete'));let replay=newRoguelikeRun(history.seed,history.starterDeck,history.actions.length,history.actions.length);let crownIndex=-1;
 for(let i=0;i<history.actions.length;i++) {
  if(replay.room===8&&replay.phase==='loot')crownIndex=i;
  replay=dispatch(replay,history.actions[i]);
  if(replay.room===20&&replay.phase==='shop')assert.notEqual(replay.phase,'won');
 }
 assert.ok(crownIndex>=0);
 // An old completed schema6 save ends with crown acknowledgement: now it resumes at the border shop.
 const migrated=restore(JSON.stringify({...history,actions:history.actions.slice(0,crownIndex+1)}));assert.equal(migrated.phase,'shop');assert.equal(migrated.room,8);assert.equal(migrated.shops!.current,'roguelike-9');
 assert.throws(()=>dispatch(s,{type:'continue'}));
});
