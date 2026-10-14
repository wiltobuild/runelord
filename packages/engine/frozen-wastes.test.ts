// Preserve this pre-expansion regression suite; expansion behavior has dedicated coverage.
const newRoguelikeRun=(...args:Parameters<typeof currentRoguelikeRun>)=>{args[7]??=1;return currentRoguelikeRun(...args);};
import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {frozenWastesEncounters,FROZEN_WASTES_ENEMY_IDS,dispatch,save,restore,intent,resolveTargets,type State} from './index';
function win(s:State):State {s.enemies.forEach(e=>{e.hp=1;e.scorch=0;});s.reserves=[];s.hand=[{uid:999999,id:'conflagrate',level:20}];s.mana=20;s.cinders=20;s=dispatch(s,{type:'play',uid:999999});if(s.phase==='reward')s=dispatch(s,{type:'reward',card:null});return dispatch(s,{type:'continue'});}
test('Frozen Wastes roster is twelve authored battles, existing ice actors, elites and an Avalanche Sovereign',()=>{
 assert.equal(frozenWastesEncounters.length,12);const used=new Set<string>();
 for(const encounter of frozenWastesEncounters){assert.ok(['frozen-wastes','frozen-heart'].includes(encounter.background));for(const e of [...encounter.enemies,...encounter.reserves||[]]){used.add(e.art);assert.ok((FROZEN_WASTES_ENEMY_IDS as readonly string[]).includes(e.art));assert.ok(e.moves.every(m=>m.targeting&&m.kind!=='summon'));}}
 assert.equal(used.size,14);assert.ok(!used.has('splinterhost'));
 const boss=frozenWastesEncounters[11].enemies[0];assert.equal(boss.art,'avalanche-colossus');assert.equal(boss.boss,'frozen-sovereign');assert.equal(boss.hp,340);assert.ok(boss.moves.some(m=>m.targeting==='sweep'));
});
test('new save version round-trips and rejects unknown rules',()=>{assert.deepEqual(restore(save(fresh())),fresh());const data=JSON.parse(save(fresh()));data.frozenWastesVersion=99;assert.throws(()=>restore(JSON.stringify(data)));});
import {newRoguelikeRun as currentRoguelikeRun,newRun,currentRealm,encounterCount,realmEncounterNumber,activeEncounter,currentShop} from './index';
const fresh=()=>newRoguelikeRun(29);
const fixture=()=>JSON.parse(readFileSync(new URL('./fixtures/forest-roguelike-complete.json',import.meta.url),'utf8'));
function entry(){return restore(JSON.stringify({...fixture(),frozenWastesVersion:2}));}
test('new demo is 33 linear encounters; old saves still finish after Forest',()=>{
 const s=fresh();assert.equal(encounterCount(s),33);assert.equal(encounterCount(newRun()),9);assert.ok(!('journey' in s));for(let i=0;i<12;i++){s.room=21+i;assert.equal(currentRealm(s),'frozen-wastes');assert.equal(realmEncounterNumber(s),i+1);assert.equal(activeEncounter(s),frozenWastesEncounters[i]);}
 const old=restore(JSON.stringify(fixture()));assert.equal(old.phase,'won');assert.equal(encounterCount(old),21);
});
test('earned Forest replay enters first ice fight with permanent upgrades and deterministic save',()=>{const old=restore(JSON.stringify(fixture())),s=entry();assert.equal(currentRealm(s),'frozen-wastes');assert.equal(s.room,21);assert.equal(s.phase,'combat');for(const key of ['deck','deckLevels','relics','inventory','gold','maxHp','seed','starterDeck','potion'] as const)assert.deepEqual(s[key],old[key],key);assert.deepEqual(restore(save(s)),s);});
test('ice progression fights twelve battles with four shops, then wins',()=>{let s=entry(),battles=0,shops=0;while(s.phase!=='won'){if(s.phase==='shop'){shops++;assert.ok(currentShop(s));s=dispatch(s,{type:'leave-shop'});}else{assert.equal(s.phase,'combat');assert.equal(currentRealm(s),'frozen-wastes');battles++;s=win(s);}assert.ok(battles<=12&&shops<=4);}assert.equal(battles,12);assert.equal(shops,4);assert.equal(s.room,32);assert.equal(s.relics.filter(id=>id==='demon-lord-crown').length,1);});

test('ice intents respect Defender and sweep, and the Sovereign enrages without summoning infernal adds',()=>{
 let s=entry();s.phase='combat';s.hp=s.maxHp=300;s.units=[];s.reserves=[];s.turn=1;
 const def=frozenWastesEncounters[11].enemies[0];s.enemies=[{...structuredClone(def),id:9000,maxHp:def.hp,guard:0,scorch:0,bossPhase:1}];s.focus=9000;
 assert.equal(intent(s,s.enemies[0]).kind,'shield');
 s.hand=[{uid:9001,id:'firebolt',level:0}];s.mana=3;s.enemies[0].hp=171;
 s=dispatch(s,{type:'play',uid:9001,target:9000});assert.equal(s.enemies[0].bossPhase,2);assert.equal(s.enemies[0].guard,8);assert.ok(s.events.some(e=>e.type==='boss-phase'&&e.message.includes('Avalanche Colossus')));
 s.turn=3;assert.equal(intent(s,s.enemies[0]).targeting,'sweep');assert.equal(intent(s,s.enemies[0]).damage,15);
 for(const count of [0,1,5]){s.units=Array.from({length:count},(_,i)=>({id:9100+i,name:'Defender',kind:'pit-brute' as const,hp:40,maxHp:40,guard:0,power:1,upkeep:0,defender:i===0}));assert.equal(resolveTargets(s,'hero')[0],count?s.units[0]:'hero');assert.equal(resolveTargets(s,'sweep').length,count+1);}
 s.units=[];s=dispatch(s,{type:'end'});assert.equal(s.enemies.length,1);assert.ok(s.events.every(e=>!e.message.includes('Vhalzor')));
});

import {playable,warbandCapacity} from './index';
test('all twelve ice kits terminate under deterministic legal card play with an earned post-Forest deck',()=>{
 const base=entry();let wins=0,losses=0,totalActions=0;
 for(const [i,encounter] of frozenWastesEncounters.entries()){
  // Isolated mechanic smoke: retain earned deck/relics; refill HP for each independent fight.
  let s=structuredClone(base);s.phase='combat';s.monsterShieldRulesFrom=0;s.room=21+i;s.hp=s.maxHp;s.turn=1;s.units=[];s.guard=0;
  const makeEnemy=(e:typeof encounter.enemies[number])=>({...structuredClone(e),id:s.nextId++,maxHp:e.hp,guard:0,scorch:0,...(e.boss?{bossPhase:1 as const,summonsMade:0}:{})});
  s.enemies=encounter.enemies.map(makeEnemy);s.reserves=(encounter.reserves||[]).map(makeEnemy);s.focus=s.enemies[0].id;
  if(!s.hand.length){s.hand=s.deck.slice(0,5).map((id,j)=>({id,uid:s.nextId++,level:s.deckLevels?.[j]||0}));s.draw=s.deck.slice(5).map((id,j)=>({id,uid:s.nextId++,level:s.deckLevels?.[j+5]||0}));s.discard=[];s.mana=4;}
  let mirror=structuredClone(s),steps=0;
  while(s.phase==='combat'&&steps<1500){
   let next:State|undefined,action:Parameters<typeof dispatch>[1]={type:'end'};
   const ranked=s.hand.filter(c=>playable(s,c)&&!(c.id.startsWith('summon-')&&s.units.length>=warbandCapacity(s))).sort((a,b)=>Number(b.id.startsWith('summon-'))-Number(a.id.startsWith('summon-')));
   for(const c of ranked){const target=s.enemies.filter(e=>e.hp>0).sort((a,b)=>a.hp-b.hp)[0];for(const unit of [...s.units.map(u=>u.id),undefined]){const candidate={type:'play' as const,uid:c.uid,target:target.id,...(unit===undefined?{}:{unit})};try{next=dispatch(s,candidate);action=candidate;break;}catch{}}if(next)break;}
   next??=dispatch(s,action);mirror=dispatch(mirror,action);s=next;steps++;
  }
  assert.ok(s.phase!=='combat',`Encounter ${i+1} stalled after ${steps} actions`);assert.deepEqual(s,mirror);assert.ok(s.hp>=0&&s.mana>=0);totalActions+=steps;if(s.phase==='lost')losses++;else wins++;
 }
 console.log(JSON.stringify({iceKitSmoke:{wins,losses,totalActions,encounters:12,balanceCertification:false}}));
});
