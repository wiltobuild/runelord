import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import {pathToFileURL} from 'node:url';
import {createHash} from 'node:crypto';

const roots=['C:/Users/wilsh/Projects/runelord','C:/Users/wilsh/Projects/runelord-roguelike-pages-recovery'];
const report:any={timestamp:new Date().toISOString(),seed:42,environment:process.version,checks:[],limitations:['Controlled combat fixtures bypass combat difficulty; they verify route state changes only.','Browser, audio, visual playback and broad suites assigned to root; not performed here.']};
for(const [index,root] of roots.entries()){
 const e=await import(pathToFileURL(path.join(root,'packages/engine/index.ts')).href);
 const mode=index?'demo':'conquer';
 const check=(name:string,fn:()=>void)=>{try{fn();report.checks.push({mode,name,status:'pass'});}catch(error){report.checks.push({mode,name,status:'fail',error:String(error)});}};
 const fixture=JSON.parse(fs.readFileSync(path.join(root,'packages/engine/fixtures',index?'forest-roguelike-complete.json':'forest-complete-save.json'),'utf8'));
 check('historical earned completion remains won and round-trips',()=>{const old=e.restore(JSON.stringify(fixture));assert.equal(old.phase,'won');assert.equal(old.frozenWastesVersion,1);assert.deepEqual(e.restore(e.save(old)),old);});
 check('earned history with explicit new-realm gate carries inventory and round-trips after Forest',()=>{
  const input={...fixture,frozenWastesVersion:2};const prior=e.restore(JSON.stringify({...input,actions:input.actions.slice(0,-1)}));assert.equal(prior.phase,'shop');
  const next=e.restore(JSON.stringify(input));assert.equal(index?e.currentRealm(next):next.journey.realm,'frozen-wastes');assert.equal(next.phase,index?'combat':'map');
  for(const key of ['deck','deckLevels','inventory','relics','gold','maxHp','hero','starterDeck'])assert.deepEqual(next[key],prior[key],key);
  assert.deepEqual(e.restore(e.save(next)),next);
  if(!index){const node=e.mapDestinations(next)[0];const battle=e.dispatch(e.dispatch(next,{type:'arrive',node:node.id}),{type:'enter-location'});assert.equal(battle.enemies[0].art,'rimejaw-scavenger');assert.deepEqual(e.restore(e.save(battle)),battle);}
 });
 check('fixed 12 fights, 3 elites, 14 ice identities and two backgrounds',()=>{
  assert.equal(e.frozenWastesEncounters.length,12);assert.deepEqual(e.frozenWastesEliteRooms,[4,7,10]);
  const ids=new Set(e.frozenWastesEncounters.flatMap((c:any)=>[...c.enemies,...c.reserves||[]].map((a:any)=>a.art)));assert.equal(ids.size,14);assert.deepEqual([...ids].sort(),[...e.FROZEN_WASTES_ENEMY_IDS].sort());
  assert.deepEqual([...new Set(e.frozenWastesEncounters.map((c:any)=>c.background))],['frozen-wastes','frozen-heart']);
 });
 for(const deck of ['warband','rimebound'])check(`${deck}: controlled full Frozen route with permanent gains and four shops`,()=>{
  let s=index?e.newRoguelikeRun(42,deck):e.newInfernalRun(42,deck);s.deckLevels[0]=3;s.inventory=['mana-potion'];s.gold=777;s.hp=37;s.maxHp=80;s.corpses=7;
  if(index){s.room=20;s.phase='shop';s.shops.current='roguelike-21';}else{s.journey=e.generateForestJourney(42);s.journey.current='forest-shop-12';s.phase='shop';}
  const before=structuredClone(s);s=e.dispatch(s,{type:'leave-shop'});
  for(const key of ['deck','deckLevels','inventory','gold','maxHp','hero','starterDeck'])assert.deepEqual(s[key],before[key],key);
  assert.equal(s.corpses,before.corpses+(index&&s.hero==='runeblade'?(s.relics.includes('gravekeepers-seal')?1:0)+(s.relics.includes('gravebound-sigil')?2:0):0),'corpses plus documented battle-start relic grants');
  let fights=0,shops=0,loops=0;
  while(s.phase!=='won'){
   assert.ok(++loops<65);
   if(s.phase==='map'){const n=e.mapDestinations(s).find((n:any)=>!s.journey.completed.includes(n.id));assert.ok(n);s=e.dispatch(e.dispatch(s,{type:'arrive',node:n.id}),{type:'enter-location'});}
   else if(s.phase==='combat'){fights++;assert.ok(s.enemies.every((a:any)=>e.FROZEN_WASTES_ENEMY_IDS.includes(a.art)));s.enemies.forEach((a:any)=>{a.hp=0});s.reserves=[];s=e.dispatch(s,{type:'end'});}
   else if(s.phase==='reward')s=e.dispatch(s,{type:'reward',card:null});
   else if(s.phase==='loot')s=e.dispatch(s,{type:'continue'});
   else if(s.phase==='shop'){shops++;s=e.dispatch(s,{type:'leave-shop'});}
   else assert.fail(`Unexpected phase ${s.phase}`);
  }
  assert.equal(fights,12);assert.equal(shops,4);assert.deepEqual(s.deck,before.deck);assert.deepEqual(s.deckLevels,before.deckLevels);assert.ok(s.inventory.includes('mana-potion'));assert.throws(()=>e.dispatch(s,{type:'continue'}));
 });
 report[mode]={root,hashes:Object.fromEntries(['packages/engine/index.ts','packages/engine/frozenWastes.ts','packages/content/index.ts','apps/web/src/main.tsx','apps/web/public/game-assets/manifest.json'].map(file=>[file,createHash('sha256').update(fs.readFileSync(path.join(root,file))).digest('hex')]))};
}
fs.writeFileSync(new URL('./independent-results.json',import.meta.url),JSON.stringify(report,null,2));
console.log(JSON.stringify(report.checks,null,2));
if(report.checks.some((c:any)=>c.status==='fail'))process.exitCode=1;
