import fs from 'node:fs';import path from 'node:path';import assert from 'node:assert/strict';import {pathToFileURL} from 'node:url';
const roots=['C:/Users/wilsh/Projects/runelord','C:/Users/wilsh/Projects/runelord-roguelike-pages-recovery'];const runs:any[]=[];
for(const [index,root] of roots.entries()){ if(index!==0)continue;
 const e=await import(pathToFileURL(path.join(root,'packages/engine/index.ts')).href),c=await import(pathToFileURL(path.join(root,'packages/content/index.ts')).href);
 for(const deck of ['fire','warband','hellbound','gravehost','rimebound','runewarden']){
  let s=index?e.newRoguelikeRun(42,deck):e.newInfernalRun(42,deck);let steps=0,replays=0;const phases=new Set<string>(),realms=new Set<string>();const record:any={mode:index?'demo':'conquer',deck,seed:42};
  try{
   while(!['won','lost'].includes(s.phase)&&steps<1500){
    phases.add(s.phase);realms.add(e.currentRealm(s));let a:any;
    if(s.phase==='combat'){
     if(s.turn>80)throw Error('Stalled beyond 80 turns in one combat');
     if(s.hp<s.maxHp*.55&&s.inventory.includes('healing-draught'))a={type:'item',item:'healing-draught'};
     else if(s.hp<s.maxHp*.55&&s.potion)a={type:'potion'};
     else {
      const ranked=s.hand.filter((v:any)=>e.playable(s,v)).sort((x:any,y:any)=>Number(y.id.startsWith('summon-')||['muster-legion','pike-detail'].includes(y.id))-Number(x.id.startsWith('summon-')||['muster-legion','pike-detail'].includes(x.id)));
      outer:for(const card of ranked){if((card.id.startsWith('summon-')&&s.units.length>=e.warbandCapacity(s)))continue;
       const enemies=s.enemies.filter((x:any)=>x.hp>0).sort((x:any,y:any)=>x.hp-y.hp);
       for(const target of enemies.map((x:any)=>x.id))for(const unit of [...s.units.map((x:any)=>x.id),undefined]){
        const next={type:'play',uid:card.uid,target,...(unit===undefined?{}:{unit})};try{e.dispatch(s,next);a=next;break outer;}catch{}
       }
      }
      a??={type:'end'};
     }
    }else if(s.phase==='map'){
     const available=e.mapDestinations(s);const n=available.find((x:any)=>!s.journey.completed.includes(x.id))??available[0];if(!n)throw Error('No map destination');a={type:'arrive',node:n.id};
     s=e.dispatch(s,a);steps++;a={type:'enter-location'};
    }else if(s.phase==='route-choice'){
     const options=e.routeChoices(s);const n=options.find((x:any)=>x.kind==='camp')??options.find((x:any)=>x.kind==='treasure')??options.find((x:any)=>x.kind==='shop')??options.find((x:any)=>x.kind==='mystery')??options[0];a={type:'choose-room',id:n.id};
    }else if(s.phase==='reward'){
     const choice=s.rewards.find((id:any)=>(c.cards[id].type==='Power'||id.startsWith('summon-'))&&e.canAddCard(s,id));a={type:'reward',card:choice??null};
    }else if(s.phase==='loot')a={type:'continue'};
    else if(s.phase==='shop'){
     const stock=e.currentShop(s),relic=stock.relics.findIndex((v:any)=>!v.sold&&!s.relics.includes(v.id)&&s.gold>=e.expansionPrice(s,v.price));
     const offer=stock.upgrades.find((v:any)=>!v.sold&&s.gold>=e.expansionPrice(s,e.upgradeCost(v.level))&&v.level<3);
     if(relic>=0)a={type:'shop-buy',kind:'relic',index:relic};else if(offer)a={type:'shop-upgrade',index:offer.index};else a={type:'leave-shop'};
    }else if(s.phase==='treasure')a={type:'claim-treasure',choice:'relic'};
    else if(s.phase==='camp')a={type:'camp-choice',choice:'rest'};
    else throw Error(`Unknown phase ${s.phase}`);
    const priorPhase=s.phase;s=e.dispatch(s,a);steps++;
    assert.ok(s.hp>=0&&s.mana>=0&&s.gold>=0);assert.ok(s.units.length<=10);
    if(steps%100===0){assert.deepEqual(e.restore(e.save(s)),s);replays++;}
   }
   if(!['won','lost'].includes(s.phase))throw Error('Action limit reached');assert.deepEqual(e.restore(e.save(s)),s);record.result=s.phase;record.status='terminated-with-replay';
  }catch(error){record.status='error';record.error=String(error);record.result=s.phase;}
  Object.assign(record,{steps,replays,room:s.room,turn:s.turn,hp:s.hp,phases:[...phases],realms:[...realms]});runs.push(record);
  fs.writeFileSync(new URL(`./current-earned-${index?'demo':'conquer'}-${deck}.json`,import.meta.url),e.save(s));
  fs.writeFileSync(new URL('./current-earned-results.json',import.meta.url),JSON.stringify({timestamp:new Date().toISOString(),runs,limitations:'Heuristic bot, not a balance certification; no state or resource cheats. Lost runs remain losses.'},null,2));console.log(JSON.stringify(record));
 }
}
if(runs.some(r=>r.status==='error'))process.exitCode=1;

