// Preserve this pre-expansion regression suite; expansion behavior has dedicated coverage.
const newInfernalRun=(...args:Parameters<typeof currentInfernalRun>)=>{const originalLength=args.length;if(originalLength<6&&!args[2])args[5]=0;if(originalLength<7&&!args[2])args[6]=0;args[9]??=1;return currentInfernalRun(...args);};
import {test} from 'node:test';
import assert from 'node:assert/strict';
import {realmOrder,currentRealm,nextRealm,dispatch,save,restore,type State} from './index';
import {type StarterDeckId} from '../content/index';
test('all Runeblade starters begin at home; Warlock orders remain unchanged',()=>{
 for(const deck of ['gravehost','rimebound','runewarden','fire','warband','pact','hellbound'] as StarterDeckId[]){const s=fresh(deck),order=deck==='gravehost'||deck==='rimebound'||deck==='runewarden'?['frozen-wastes','forest','infernal']:['infernal','forest','frozen-wastes'];assert.deepEqual(realmOrder(s),order);assert.equal(currentRealm(s),order[0]);assert.equal(nextRealm(s),'forest');assert.deepEqual(restore(save(s)),s);}
});
test('historical missing route marker keeps Infernal-first and rejects unknown versions',()=>{const data=JSON.parse(save(fresh('gravehost')));delete data.heroRouteVersion;const old=restore(JSON.stringify(data));assert.equal(currentRealm(old),'infernal');assert.deepEqual(realmOrder(old),['infernal','forest','frozen-wastes']);assert.equal(old.heroRouteVersion,1);assert.deepEqual(restore(save(old)),old);data.heroRouteVersion=3;assert.throws(()=>restore(JSON.stringify(data)),/hero route/);});
import {newInfernalRun as currentInfernalRun,mapDestinations,activeEncounter} from './index';
const fresh=(deck:StarterDeckId)=>newInfernalRun(29,deck);
test('home-biome first battle and legal actions replay exactly',()=>{let s=fresh('gravehost');s=dispatch(s,{type:'travel',node:mapDestinations(s)[0].id});assert.equal(activeEncounter(s).background,'frozen-wastes');s=dispatch(s,{type:'end'});assert.deepEqual(restore(save(s)),s);});
function finishRealm(s:State){const boss=s.journey!.nodes.find(n=>n.kind==='boss')!;s.journey!.current=boss.id;s.phase='loot';s.pendingLoot={gold:200,items:[],final:true};s=dispatch(s,{type:'continue'});if(currentRealm(s)!=='infernal'&&s.phase==='map'&&s.journey!.current===boss.id){s=dispatch(s,{type:'travel',node:boss.next[0]});s=dispatch(s,{type:'leave-shop'});}return s;}
test('both complete biome sequences preserve progression and terminate at their own final Sovereign',()=>{for(const deck of ['gravehost','warband'] as StarterDeckId[]){let s=fresh(deck);s.deckLevels![0]=2;s.gold=321;s.hp=43;s.inventory=['mana-potion'];const order=realmOrder(s),deckBefore=[...s.deck];for(let i=0;i<order.length;i++){assert.equal(currentRealm(s),order[i]);assert.equal(nextRealm(s),order[i+1]);s=finishRealm(s);assert.deepEqual(s.deck,deckBefore);assert.equal(s.deckLevels![0],2);assert.equal(s.gold,321);assert.equal(s.hp,43);assert.deepEqual(s.inventory,['mana-potion']);assert.equal(s.phase,i===2?'won':'map');}}});
