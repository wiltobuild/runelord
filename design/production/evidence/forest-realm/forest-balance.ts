import {newInfernalRun,generateForestJourney,dispatch,playable,manaCost,type State} from '../../../../packages/engine/index';
import {cards,type CardId} from '../../../../packages/content/index';
import {writeFileSync} from 'node:fs';
const results:any[]=[];
for(const strategy of ['pressure','guard'])for(let seed=1;seed<=12;seed++)for(let encounter=1;encounter<=12;encounter++){
 let s=newInfernalRun(seed,'warband');s.journey=generateForestJourney(seed);s.journey.current=`forest-${encounter}`;
 s.deck.push('summon-pit-brute','masters-of-the-pit','burning-soul','conflagrate','neutral-renewal');s.deckLevels=s.deck.map(()=>encounter<=6?1:2);
 s.relics=['demon-lord-crown','ember-heart','iron-sigil','warband-fang'];s=dispatch(s,{type:'enter-location'});
 let outcome='timeout';try{for(let step=0;step<500;step++){
  if(s.phase!=='combat'){outcome=s.phase==='lost'?'loss':'win';break;}
  const legal=s.hand.filter(c=>playable(s,c)&&(!c.id.startsWith('summon-')||s.units.length<5));
  const rank=(id:CardId)=>id.startsWith('summon-')?100:cards[id].type==='Power'?90:id==='kindle'?80:strategy==='guard'&&(id.includes('ward')||id.includes('veil')||id.includes('renewal'))?70:cards[id].type==='Attack'?60:10;
  legal.sort((a,b)=>rank(b.id)-rank(a.id));const c=legal[0];
  s=dispatch(s,c?{type:'play',uid:c.uid,target:s.enemies.filter(e=>e.hp>0).sort((a,b)=>a.hp-b.hp)[0].id,...(s.units.length?{unit:s.units.at(-1)!.id}:{})}:{type:'end'});
 }}catch(e){outcome='crash';}
 results.push({seed,strategy,variant:`forest-${encounter}`,outcome,turns:s.turn,hpRemaining:s.hp});
}
writeFileSync('work/forest-balance-results.json',JSON.stringify(results,null,2));
for(const strategy of ['pressure','guard'])for(const group of [[1,6],[7,11],[12,12]]){const rows=results.filter(r=>r.strategy===strategy&&+r.variant.split('-')[1]>=group[0]&&+r.variant.split('-')[1]<=group[1]);console.log(strategy,group,JSON.stringify(rows.reduce((a,r)=>(a[r.outcome]=(a[r.outcome]||0)+1,a),{})), 'avg turns', rows.reduce((a,r)=>a+r.turns,0)/rows.length);}
