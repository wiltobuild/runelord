import {newInfernalRun,dispatch,mapDestinations,playable,currentShop,upgradeCost,canAddCard,save,restore,type State} from '../../../../packages/engine/index';
import {cards,type CardId} from '../../../../packages/content/index';
import {writeFileSync} from 'node:fs';
const rank=(id:CardId)=>['summon-pit-brute','masters-of-the-pit','burning-soul','neutral-renewal','summon-hellhound','conflagrate','pyroclasm','hellfire'].indexOf(id);
for(let seed=0;seed<12;seed++){
 let s=newInfernalRun(seed,'warband');
 try{for(let step=0;step<2000&&s.phase!=='lost'&&s.phase!=='won';step++){
  
  if(s.phase==='map'){const n=mapDestinations(s).filter(n=>n.row>(s.journey!.nodes.find(x=>x.id===s.journey!.current)?.row??-1)).sort((a,b)=>a.encounter.enemies.reduce((sum,e)=>sum+e.hp,0)-b.encounter.enemies.reduce((sum,e)=>sum+e.hp,0))[0];if(!n)break;s=dispatch(s,{type:'travel',node:n.id});}
  else if(s.phase==='combat'){
   if(s.hp<50&&s.potion){s=dispatch(s,{type:'potion'});continue;}
   if(s.hp<55&&s.inventory.includes('healing-draught')){s=dispatch(s,{type:'item',item:'healing-draught'});continue;}
   const legal=s.hand.filter(c=>playable(s,c)&&(!c.id.startsWith('summon-')||s.units.length<5));
   const value=(id:CardId)=>id==='neutral-renewal'&&s.hp<60?110:id.startsWith('summon-')?100:cards[id].type==='Power'?90:id==='kindle'?80:cards[id].type==='Attack'?60:10;
   legal.sort((a,b)=>value(b.id)-value(a.id));const c=legal[0];s=dispatch(s,c?{type:'play',uid:c.uid,target:s.enemies.filter(e=>e.hp>0).sort((a,b)=>a.hp-b.hp)[0].id,...(s.units.length?{unit:s.units.at(-1)!.id}:{})}:{type:'end'});
  }else if(s.phase==='reward'){const r=s.rewards.filter(id=>rank(id)>=0&&canAddCard(s,id)).sort((a,b)=>rank(a)-rank(b))[0];s=dispatch(s,{type:'reward',card:r||null});}
  else if(s.phase==='loot')s=dispatch(s,{type:'continue'});
  else if(s.phase==='treasure')s=dispatch(s,{type:'claim-treasure'});
  else if(s.phase==='shop'){
   let stock=currentShop(s)!;const r=stock.relics.findIndex(r=>!r.sold&&!s.relics.includes(r.id)&&r.price<=s.gold&&['ember-heart','warband-fang','iron-sigil'].includes(r.id));
   if(r>=0){s=dispatch(s,{type:'shop-buy',kind:'relic',index:r});continue;}
   const c=stock.cards.findIndex(c=>!c.sold&&c.price<=s.gold&&rank(c.id)>=0&&canAddCard(s,c.id));if(c>=0){s=dispatch(s,{type:'shop-buy',kind:'card',index:c});continue;}
   const u=stock.upgrades.find(o=>!o.sold&&upgradeCost(o.level)<=s.gold&&o.id.startsWith('summon-'));if(u){s=dispatch(s,{type:'shop-upgrade',index:u.index});continue;}
   s=dispatch(s,{type:'leave-shop'});
  }
 }}catch(e){console.log('CRASH',seed,String(e));process.exit(1);}
 console.log(JSON.stringify({seed,outcome:s.phase,realm:s.journey?.realm,node:s.journey?.current,hp:s.hp,actions:s.history.length}));if(s.phase==='won')writeFileSync('work/forest-complete-save.json',save(s));
}

