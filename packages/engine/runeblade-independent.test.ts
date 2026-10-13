import test from 'node:test';
import assert from 'node:assert/strict';
import {newInfernalRun,dispatch,playable,cardPayment,availableNodes,currentShop,save,restore,type Action} from './index';
import {runebladeDecks,runebladeImplemented,cards,cardTargetsUnit} from '../content/index';

// Independent legal-action route audit. No fixture HP, resource, inventory or RNG overrides.
for(const deck of runebladeDecks) test(`independent seeded campaign audit: ${deck.id}`,()=>{
 let totalActions=0,combatDeaths=0;
 for(let seed=1;seed<=12;seed++){
  let s=newInfernalRun(seed,deck.id,false,'runeblade',1),steps=0;
  while(s.phase!=='lost'&&s.phase!=='won'&&s.journey?.realm!=='forest'&&steps<1000){
   let action:Action;
   if(s.phase==='map'){
    const next=availableNodes(s).sort((a,b)=>b.row-a.row)[0];
    assert.ok(next,`no uncompleted destination ${seed}`);action={type:'travel',node:next.id};
   }else if(s.phase==='reward'){
    assert.ok(s.rewards.every(id=>runebladeImplemented.some(c=>c===id)));
    action={type:'reward',card:s.rewards[0]??null};
   }else if(s.phase==='loot')action={type:'continue'};
   else if(s.phase==='treasure')action={type:'claim-treasure'};
   else if(s.phase==='shop'){
    const stock=currentShop(s)!;assert.ok(stock.cards.every(c=>runebladeImplemented.some(id=>c.id===id)));
    const index=stock.relics.findIndex(c=>!c.sold&&!s.relics.includes(c.id)&&s.gold>=c.price);
    action=index>=0?{type:'shop-buy',kind:'relic',index}:{type:'leave-shop'};
   }else{
    assert.equal(s.phase,'combat');
    const c=s.hand.filter(c=>playable(s,c)&&!(cards[c.id].type==='Summon'&&s.units.length===5))
     .sort((a,b)=>(cards[b.id].type==='Summon'?20:0)-(cards[a.id].type==='Summon'?20:0))[0];
    action=c?{type:'play',uid:c.uid,...(cardTargetsUnit(c.id)?{unit:s.units[0].id}:{target:s.enemies.filter(e=>e.hp>0).sort((a,b)=>a.hp-b.hp)[0].id})}:{type:'end'};
   }
   const before=s; s=dispatch(s,action);steps++;
   assert.ok(s.hp>=0&&s.hp<=s.maxHp&&s.mana>=0&&s.corpses>=0&&Number.isInteger(s.corpses)&&s.units.length<=5);
   if(before.phase==='combat'){
    const deaths=s.events.filter(e=>['kill','unit-death','defeat'].includes(e.type)).length;
    const corpseEvents=s.events.filter(e=>e.type==='corpse').length;
    assert.equal(corpseEvents,deaths,`death mismatch ${seed}/${steps}`);combatDeaths+=deaths;
    const payment=action.type==='play'?cardPayment(before,before.hand.find(c=>c.uid===action.uid)!):null;
    assert.equal(s.corpses,before.corpses+deaths-(payment?.resource==='corpses'?payment.amount:0));
   }
   if(seed===1&&s.phase==='reward')assert.deepEqual(restore(save(s)),s,`replay ${seed}/${steps}`);
  }
  assert.ok(steps<1000,`softlock ${seed}`);assert.deepEqual(restore(save(s)),s);totalActions+=steps;console.log(deck.id,seed,steps,s.phase);
 }
 console.log(JSON.stringify({audit:deck.id,seeds:12,totalActions,combatDeaths}));
});





