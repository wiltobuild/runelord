import test from 'node:test';
import assert from 'node:assert/strict';
import {newRoguelikeRun,dispatch,playable,cardPayment,currentShop,save,restore,canAddCard,shopCanReroll,type Action} from './index';
import {runebladeDecks,runebladeImplemented,runebladeRelicPool,cards,cardTargetsUnit} from '../content/index';

// Independent legal-action audit of the deployed demo route. No state/resource overrides.
for(const deck of runebladeDecks) test(`Pages fixed-route independent audit: ${deck.id}`,()=>{
 let totalActions=0,deaths=0,corpsePayments=0,shops=0,purchases=0,rerolls=0,wins=0,forestRuns=0;
 for(let seed=1;seed<=12;seed++){
  let s=newRoguelikeRun(seed,deck.id),steps=0,forest=false;
  const visited=new Set<string>();
  while(s.phase!=='lost'&&s.phase!=='won'&&steps<2000){
   assert.ok(!('journey' in s)); assert.equal(s.hero,'runeblade');
   if(s.room>=9)forest=true;
   let action:Action;
   if(s.phase==='reward'){
    assert.ok(s.rewards.every(id=>runebladeImplemented.some(c=>c===id)));
    action={type:'reward',card:s.rewards.find(id=>canAddCard(s,id))??null};
   }else if(s.phase==='loot')action={type:'continue'};
   else if(s.phase==='camp')action={type:'camp'};
   else if(s.phase==='shop'){
    assert.equal((s.room+1)%3,0);const key=s.shops!.current!;
    const stock=currentShop(s)!;
    assert.ok(stock.cards.every(c=>runebladeImplemented.some(id=>c.id===id)));
    assert.ok(stock.relics.every(c=>runebladeRelicPool.some(id=>c.id===id)));
    if(!visited.has(key)&&shopCanReroll(s,'buy')) {visited.add(key);shops++;rerolls++;action={type:'shop-reroll',kind:'buy'};}
    else {
     const relic=stock.relics.findIndex(c=>!c.sold&&!s.relics.includes(c.id)&&s.gold>=c.price);
     const card=stock.cards.findIndex(c=>!c.sold&&s.gold>=c.price&&canAddCard(s,c.id));
     if(relic>=0){purchases++;action={type:'shop-buy',kind:'relic',index:relic};}
     else if(card>=0){purchases++;action={type:'shop-buy',kind:'card',index:card};}
     else action={type:'leave-shop'};
    }
   }else if(s.hp<=35&&s.potion)action={type:'potion'};
   else {
    assert.equal(s.phase,'combat');
    const c=s.hand.filter(c=>playable(s,c)&&!(cards[c.id].type==='Summon'&&s.units.length>=5))
     .sort((a,b)=>(cards[b.id].type==='Summon'?20:0)-(cards[a.id].type==='Summon'?20:0))[0];
    action=c?{type:'play',uid:c.uid,...(cardTargetsUnit(c.id)?{unit:s.units[0].id}:{target:s.enemies.filter(e=>e.hp>0).sort((a,b)=>a.hp-b.hp)[0].id})}:{type:'end'};
   }
   const before=s;s=dispatch(s,action);steps++;
   assert.ok(s.hp>=0&&s.hp<=s.maxHp&&s.mana>=0&&s.corpses>=0&&Number.isInteger(s.corpses)&&s.units.length<=5);
   if(before.phase==='combat'){
    const count=s.events.filter(e=>['kill','unit-death','defeat'].includes(e.type)).length;
    assert.equal(s.events.filter(e=>e.type==='corpse').length,count,`deaths ${seed}/${steps}`);deaths+=count;
    const payment=action.type==='play'?cardPayment(before,before.hand.find(c=>c.uid===action.uid)!):null;
    if(payment?.resource==='corpses')corpsePayments++;
    const created=s.events.filter(e=>e.type==='corpse-generation'||e.type==='corpse-conversion').reduce((n,e)=>n+(e.amount||0),0);
    assert.equal(s.corpses,before.corpses+count+created-(payment?.resource==='corpses'?payment.amount:0));
   }
   if(seed===1&&['reward','shop'].includes(s.phase))assert.deepEqual(restore(save(s)),s);
  }
  assert.ok(steps<2000,`softlock ${seed}`);assert.deepEqual(restore(save(s)),s);totalActions+=steps;
  if(s.phase==='won')wins++;if(forest)forestRuns++;
 }
 assert.ok(corpsePayments>0);assert.ok(shops>0);assert.ok(purchases>0);assert.ok(forestRuns>0);
 console.log(JSON.stringify({audit:deck.id,seeds:12,totalActions,deaths,corpsePayments,shops,purchases,rerolls,wins,forestRuns}));
});
