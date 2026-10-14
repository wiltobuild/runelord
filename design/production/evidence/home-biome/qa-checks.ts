import fs from 'node:fs';import path from 'node:path';import assert from 'node:assert/strict';import {pathToFileURL} from 'node:url';import {createHash} from 'node:crypto';
const roots=['C:/Users/wilsh/Projects/runelord','C:/Users/wilsh/Projects/runelord-roguelike-pages-recovery'];
const baseline=JSON.parse(fs.readFileSync(new URL('./baseline-saves.json',import.meta.url),'utf8'));
const out:any={timestamp:new Date().toISOString(),seed:42,node:process.version,checks:[],hashes:[]};
for(const [index,root] of roots.entries()){
 const e=await import(pathToFileURL(path.join(root,'packages/engine/index.ts')).href), content=await import(pathToFileURL(path.join(root,'packages/content/index.ts')).href);
 const mode=index?'demo':'conquer',realm=(s:any)=>index?e.currentRealm(s):s.journey.realm??'infernal';
 const check=(name:string,fn:()=>any)=>{try{out.checks.push({mode,name,status:'pass',details:fn()});}catch(err){out.checks.push({mode,name,status:'fail',error:String(err)});}};
 for(const deck of ['gravehost','rimebound','runewarden','warband']){
  const fresh=()=>index?e.newRoguelikeRun(42,deck):e.newInfernalRun(42,deck);
  check(`${deck} new home + seeded save replay`,()=>{let s=fresh();assert.equal(realm(s),deck==='warband'?'infernal':'frozen-wastes');assert.deepEqual(e.restore(e.save(s)),s);if(!index){const n=e.mapDestinations(s)[0];s=e.dispatch(e.dispatch(s,{type:'arrive',node:n.id}),{type:'enter-location'});}s=e.dispatch(s,{type:'end'});assert.deepEqual(e.restore(e.save(s)),s);});
  check(`${deck} captured pre-change save preserves original state`,()=>{const b=baseline.find((b:any)=>b.root===root&&b.deck===deck),s=e.restore(JSON.stringify(b.save));assert.equal(realm(s),'infernal');const copy=structuredClone(s);delete copy.heroRouteVersion;assert.deepEqual(JSON.parse(JSON.stringify(copy)),b.state);assert.deepEqual(e.restore(e.save(s)),s);});
  if(deck==='warband')continue;
  check(`${deck} controlled route boundaries, formulas, persistence, terminal`,()=>{
   let s=fresh();s.deckLevels[0]=2;s.gold=777;s.inventory=['mana-potion'];s.corpses=7;
   const initialDeck=[...s.deck],initialLevels=[...s.deckLevels],visited:string[]=[],fights:Record<string,number>={},shops:Record<string,number>={},camps:Record<string,number>={};let steps=0;
   while(s.phase!=='won'){
    assert.ok(++steps<250,'route did not terminate');const r=realm(s);if(visited.at(-1)!==r)visited.push(r);
    if(s.phase==='map'){
     if(r==='infernal'){
      // Existing Conquer topology is unchanged; isolate its final boss acknowledgement.
      const boss=s.journey.nodes.find((n:any)=>n.kind==='boss');s.journey.current=boss.id;s.room=boss.encounterIndex;s.phase='loot';s.pendingLoot={gold:150,items:[],final:true};s=e.dispatch(s,{type:'continue'});continue;
     }
     const n=e.mapDestinations(s).find((n:any)=>!s.journey.completed.includes(n.id));assert.ok(n);s=e.dispatch(e.dispatch(s,{type:'arrive',node:n.id}),{type:'enter-location'});
    }else if(s.phase==='combat'){
     fights[r]=(fights[r]||0)+1;const local=index?e.realmEncounterNumber(s):Number(s.journey.current.split('-').at(-1));
     if(index)assert.equal(e.activeEncounter(s).background,r==='infernal'?content.encounters[local-1].background:r==='forest'?local<=6?'forest':'forest-heart':local<=6?'frozen-wastes':'frozen-heart');
     s.enemies.forEach((a:any)=>a.hp=0);s.reserves=[];s=e.dispatch(s,{type:'end'});
     if(index){const expected=r==='infernal'?25+(local-1)*10:local===12?200:[5,8,11].includes(local)?90:45+(local-1)*4;assert.equal(s.pendingLoot.gold,expected,`${r} fight ${local} gold`);if(r==='infernal'&&local===1)assert.deepEqual(s.pendingLoot.items,['mana-potion']);}
    }else if(s.phase==='reward')s=e.dispatch(s,{type:'reward',card:null});
    else if(s.phase==='loot')s=e.dispatch(s,{type:'continue'});
    else if(s.phase==='shop'){
     shops[r]=(shops[r]||0)+1;const stock=e.currentShop(s);assert.ok(stock);assert.ok(stock.cards.every((c:any)=>content.cardsForHero('runeblade').includes(c.id)),'foreign hero card in shop');
     const a=e.dispatch(s,{type:'leave-shop'}),b=e.dispatch(structuredClone(s),{type:'leave-shop'});assert.deepEqual(a,b,'boundary deterministic clone replay');s=a;
    }else if(s.phase==='camp'){camps[r]=(camps[r]||0)+1;s=e.dispatch(s,{type:'camp'});}
    else assert.fail(`Unexpected ${s.phase}`);
   }
   assert.deepEqual(visited,['frozen-wastes','forest','infernal']);assert.equal(fights['frozen-wastes'],12);assert.equal(fights.forest,12);assert.equal(shops['frozen-wastes'],4);assert.equal(shops.forest,4);
   assert.equal(camps['frozen-wastes']||0,0);assert.equal(camps.forest||0,0);if(index){assert.equal(fights.infernal,9);assert.equal(shops.infernal,3);assert.equal(camps.infernal,4);}
   assert.deepEqual(s.deck,initialDeck);assert.deepEqual(s.deckLevels,initialLevels);assert.ok(s.inventory.includes('mana-potion'));assert.throws(()=>e.dispatch(s,{type:'continue'}));return {visited,fights,shops,camps};
  });
 }
 for(const rel of ['packages/engine/index.ts','packages/engine/frozenWastes.ts','packages/engine/forest.ts','apps/web/src/main.tsx'])out.hashes.push({root,path:rel,sha256:createHash('sha256').update(fs.readFileSync(path.join(root,rel))).digest('hex')});
}
fs.writeFileSync(new URL('./results.json',import.meta.url),JSON.stringify(out,null,2));console.log(JSON.stringify(out.checks,null,2));if(out.checks.some((c:any)=>c.status==='fail'))process.exitCode=1;

