import {test} from 'node:test';
import assert from 'node:assert/strict';
import {dispatch,save,restore,trainingOptions,availableOrders,summonTraining,expansionRelics,demonStats,currentShop,warbandCapacity,shopServiceCost,campHealAmount,treasureOptions,expansionRelicPool,type State,type DemonKind,type Unit} from './index';
import {relicHook,type ExpansionHooks} from './expansion';
import {type CardId} from '../content/index';
function summonCard(s:State,id:CardId){s.hand=[{uid:s.nextId++,id}];s.mana=20;s.corpses=20;s.cinders=20;return dispatch(s,{type:'play',uid:s.hand[0].uid,target:s.enemies.find(e=>e.hp>0)!.id});}
function unit(s:State,kind:DemonKind):Unit{const stats=demonStats[kind],u:Unit={...stats,kind,id:s.nextId++,maxHp:stats.hp,guard:0,order:'attack'};s.units.push(u);return u;}
test('all summon kinds have two learnable orders and permanent type-wide training is atomic',()=>{
 let s=battle();s.phase='shop';s.gold=500;s.acquiredSummons=Object.keys(demonStats) as DemonKind[];assert.equal(trainingOptions(s).length,22);
 for(const kind of Object.keys(demonStats) as DemonKind[]){assert.equal(summonTraining[kind].tiers.length,2);const actor=unit(s,kind);assert.equal(availableOrders(s,actor).length,1);}
 s=dispatch(s,{type:'train-summon',kind:'imp'});assert.equal(s.trainingLevels!.imp,1);assert.equal(s.gold,440);s=dispatch(s,{type:'train-summon',kind:'imp'});assert.equal(s.gold,340);assert.equal(s.trainingLevels!.imp,2);
 const snapshot=structuredClone(s);assert.throws(()=>dispatch(s,{type:'train-summon',kind:'imp'}));assert.deepEqual(s,snapshot);assert.equal(availableOrders(s,s.units.find(u=>u.kind==='imp')!).length,3);
 s.units=[];s.phase='combat';s=summonCard(s,'summon-imp');s=summonCard(s,'summon-imp');assert.equal(s.units.length,2);assert.ok(s.units.every(u=>availableOrders(s,u).length===3));
});
test('sticky ally orders cost no Mana and commands do not repeat the selected utility',()=>{
 let s=battle();s.units=[];s.trainingLevels={'soul-leech':2};const healer=unit(s,'soul-leech'),ally=unit(s,'hellhound');ally.hp=1;s.hp=s.maxHp-20;const mana=s.mana;
 s=dispatch(s,{type:'set-order',unit:healer.id,order:'soul-mend',target:ally.id});assert.equal(s.mana,mana);s.hand=[{id:'hellish-command',uid:s.nextId++}];s.mana=9;s=dispatch(s,{type:'play',uid:s.hand[0].uid,unit:healer.id});assert.equal(s.units.find(u=>u.id===ally.id)!.hp,1);assert.equal(s.units.find(u=>u.id===healer.id)!.order,'soul-mend');
 s.enemies.forEach(e=>e.moves=[{name:'Wait',damage:0,targeting:'hero'}]);s=dispatch(s,{type:'end'});assert.equal(s.units.find(u=>u.id===ally.id)!.hp,5);
});
test('utility actions suffer Rot, fallen ally targets fall back, and dead attack targets retarget',()=>{
 let s=battle();s.units=[];s.trainingLevels={'frost-thrall':2};const actor=unit(s,'frost-thrall');actor.rot=2;const ally=unit(s,'hellhound');s=dispatch(s,{type:'set-order',unit:actor.id,order:'frost-shell',target:ally.id});s.enemies.forEach(e=>{e.hp=e.maxHp=1000;e.moves=[{name:'Wait',damage:0,targeting:'hero'}];});s=dispatch(s,{type:'end'});const a=s.units.find(u=>u.id===actor.id)!;assert.equal(a.hp,actor.hp-2);assert.equal(a.rot,3);assert.ok(s.events.some(e=>e.type==='order'));
 s.units=s.units.filter(u=>u.id!==ally.id);s=dispatch(s,{type:'end'});assert.ok(s.events.some(e=>e.type==='muster'&&e.actor===actor.id));assert.equal(s.units.find(u=>u.id===actor.id)!.rot,4);
});
test('chosen Hellgate requires three channeling Maledictors, is once per turn and reinforcements wait',()=>{
 let s=battle();s.units=[];s.trainingLevels={maledictor:2};for(let i=0;i<3;i++)unit(s,'maledictor');s.enemies.forEach(e=>{e.hp=e.maxHp=1000;e.moves=[{name:'Wait',damage:0,targeting:'hero'}];});const first=s.units[0].id;s=dispatch(s,{type:'set-order',unit:first,order:'hellgate-channel',allOfKind:true});s=dispatch(s,{type:'end'});assert.equal(s.events.filter(e=>e.type==='hellgate').length,1);const imp=s.units.find(u=>u.kind==='imp')!;assert.ok(imp);assert.equal(s.events.filter(e=>e.type==='muster'&&e.actor===imp.id).length,0);assert.ok(s.units.length<=warbandCapacity(s));
 let passive=battle();passive.units=[];for(let i=0;i<3;i++)unit(passive,'maledictor');passive=dispatch(passive,{type:'end'});assert.equal(passive.events.filter(e=>e.type==='hellgate').length,0);
});
test('mastered Gorthak reinforcement charge is shared across kind and cannot overflow capacity',()=>{
 let s=battle();s.units=[];s.trainingLevels={gorthak:2};const g=unit(s,'gorthak');s=dispatch(s,{type:'set-order',unit:g.id,order:'dominion'});s.enemies.forEach(e=>{e.hp=e.maxHp=1000;e.moves=[{name:'Wait',damage:0,targeting:'hero'}];});s=dispatch(s,{type:'end'});assert.equal(s.units.filter(u=>u.kind==='pit-brute').length,1);s=dispatch(s,{type:'end'});assert.equal(s.units.filter(u=>u.kind==='pit-brute').length,1);assert.equal(s.orderCharges!['gorthak:dominion'],1);
});
test('thirty modest relics execute their declared hooks without recursion and respect caps',()=>{
 assert.equal(Object.keys(expansionRelics).length,30);
 for(const [id,definition] of Object.entries(expansionRelics)){const s=battle();s.relics=[id as keyof typeof expansionRelics];s.hp=10;s.gold=100;s.units=[];s.trainingLevels={imp:1};const actor=unit(s,'imp');actor.defender=true;if(definition.condition==='empty-warband')s.units=[];s.enemies[0].scorch=2;s.enemies[0].chill=2;let triggers=0;const h:ExpansionHooks={guard:n=>{s.guard+=n;},draw:n=>{s.mana+=n;},damage:(e,n)=>{e.hp-=n;},scorch:(e,n)=>{e.scorch+=n;},chill:(e,n)=>{e.chill=(e.chill||0)+n;},summon:()=>{},hellgate:()=>{},emit:()=>{triggers++;}};
 if(definition.effect==='discount'){assert.ok(shopServiceCost(s,60)<60);assert.equal(shopServiceCost(s,1),1);continue;}relicHook(s,definition.hook,h,actor);assert.equal(triggers,1,id);relicHook(s,definition.hook,h,actor);assert.equal(triggers,1,`${id} cap`);
 }
 const s=battle();s.relics=Object.keys(expansionRelics) as (keyof typeof expansionRelics)[];assert.equal(s.relics.length,30);assert.equal(new Set(expansionRelicPool(s)).size,expansionRelicPool(s).length);
});
test('camp offers mutually exclusive rest, upgrade and training; treasure offers unique relic gold or training',()=>{
 for(const choice of ['rest','upgrade','train'] as const){let s=battle();makeCamp(s);s.hp=1;const oldLevel=s.deckLevels![0],oldHp=s.hp;s=dispatch(s,{type:'camp-choice',choice,index:0,kind:'imp'});assert.notEqual(s.phase,'camp');assert.equal(s.deckLevels![0],oldLevel+(choice==='upgrade'?1:0));assert.equal(s.trainingLevels!.imp||0,choice==='train'?1:0);if(choice==='rest')assert.equal(s.hp,oldHp+campHealAmount(s));assert.throws(()=>dispatch(s,{type:'camp-choice',choice:'rest'}));}
 for(const choice of ['relic','gold','train'] as const){let s=battle();s.phase='treasure';const info=treasureOptions(s),gold=s.gold;s=dispatch(s,{type:'claim-treasure',choice,kind:'imp'});assert.equal(s.phase,'loot');if(choice==='relic')assert.ok(s.relics.includes(info.relic!));if(choice==='gold')assert.equal(s.gold,gold+info.gold);if(choice==='train')assert.equal(s.trainingLevels!.imp,1);assert.throws(()=>dispatch(s,{type:'claim-treasure'}));}
});
test('new and historical expansion versions replay initial legal combat exactly',()=>{let s=battle();s=dispatch(s,{type:'end'});assert.deepEqual(restore(save(s)),s);const old=JSON.parse(save(fresh()));delete old.expansionVersion;assert.equal(restore(JSON.stringify(old)).expansionVersion,1);old.expansionVersion=8;assert.throws(()=>restore(JSON.stringify(old)),/expansion/);});
import {newRoguelikeRun,routeChoices,realmStartRoom,selectedRoomKind} from './index';
const fresh=()=>newRoguelikeRun(29);
const battle=fresh;
function makeCamp(s:State){s.phase='camp';}
test('three seeded choices persist through replay, start normal, end boss, mystery favors treasure',()=>{
 const s=fresh();assert.equal(selectedRoomKind(s),'combat');s.phase='route-choice';assert.equal(routeChoices(s).length,3);assert.deepEqual(routeChoices(s),routeChoices(structuredClone(s)));assert.throws(()=>dispatch(s,{type:'choose-room',id:'invalid'}));const next=dispatch(s,{type:'choose-room',id:routeChoices(s)[0].id});assert.equal(next.room,1);assert.equal(next.phase,'combat');s.room=7;assert.deepEqual(routeChoices(s).map(c=>c.kind),['boss']);
});

test('Brace counters once and coordinated thrust scales only other selected Pikemen',()=>{
 let s=battle();s.units=[];s.trainingLevels={'ash-pikeman':2};const p=unit(s,'ash-pikeman');p.hp=p.maxHp=100;s.enemies=s.enemies.slice(0,1);s.enemies[0].hp=s.enemies[0].maxHp=500;s.enemies[0].moves=[{name:'Strike',damage:8,targeting:'front'}];s=dispatch(s,{type:'set-order',unit:p.id,order:'brace'});s=dispatch(s,{type:'end'});assert.equal(s.events.filter(e=>e.type==='counter').length,1);assert.equal(s.enemies[0].hp,496);
 s.enemies[0].moves=[{name:'Wait',damage:0,targeting:'hero'}];s.units=[];for(let i=0;i<5;i++)unit(s,'ash-pikeman');s=dispatch(s,{type:'set-order',unit:s.units[0].id,order:'coordinated-thrust',target:s.enemies[0].id,allOfKind:true});s=dispatch(s,{type:'end'});assert.equal(s.events.filter(e=>e.type==='order').length,5);assert.ok(s.events.some(e=>e.type==='damage'&&e.amount===13));
});
test('training and removal charge displayed discounted cost exactly once',()=>{let s=battle();s.phase='shop';s.relics=['merchants-mark','hardship-voucher'];s.hp=1;s.gold=55;assert.equal(trainingOptions(s).find(o=>o.kind==='imp')!.cost,55);s=dispatch(s,{type:'train-summon',kind:'imp'});assert.equal(s.gold,0);});

import {playable,type Action} from './index';
test('earned encounters, training, chosen orders and service outcomes replay without fixture overrides',()=>{
 let success=false;
 for(let seed=1;seed<=8&&!success;seed++){
  let s=newRoguelikeRun(seed),steps=0,ordered=false,executed=false;
  while(s.phase!=='lost'&&s.phase!=='won'&&steps<600&&!executed){
   let action:Action|undefined;
   if(s.phase==='route-choice'){const options=routeChoices(s);action={type:'choose-room',id:(options.find(c=>c.kind==='camp'||c.kind==='treasure'||c.kind==='shop')||options[0]).id};}
   if(!action&&s.phase==='shop'){const option=trainingOptions(s).find(o=>o.kind==='imp'&&o.level===0&&o.canTrain);action=option?{type:'train-summon',kind:option.kind}:{type:'leave-shop'};}
   if(!action&&s.phase==='camp')action=(s.trainingLevels?.imp||0)===0?{type:'camp-choice',choice:'train',kind:'imp'}:{type:'camp-choice',choice:'rest'};
   if(!action&&s.phase==='treasure')action=(s.trainingLevels?.imp||0)===0?{type:'claim-treasure',choice:'train',kind:'imp'}:{type:'claim-treasure',choice:'relic'};
   if(!action&&s.phase==='reward')action={type:'reward',card:null};
   if(!action&&s.phase==='loot')action={type:'continue'};
   if(!action&&s.phase==='combat'){
    const imp=s.units.find(u=>u.kind==='imp'&&u.order!=='cinder-screen');
    if((s.trainingLevels?.imp||0)>0&&imp){action={type:'set-order',unit:imp.id,order:'cinder-screen'};ordered=true;}
    else if(s.hp<s.maxHp/2&&s.potion)action={type:'potion'};
    else{for(const c of [...s.hand].filter(c=>playable(s,c)&&!(c.id.startsWith('summon-')&&s.units.length>=warbandCapacity(s))).sort((a,b)=>Number(b.id.startsWith('summon-'))-Number(a.id.startsWith('summon-')))){const candidate:Action={type:'play',uid:c.uid,target:s.enemies.filter(e=>e.hp>0).sort((a,b)=>a.hp-b.hp)[0].id,...(s.units.length?{unit:s.units[0].id}:{})};try{dispatch(s,candidate);action=candidate;break;}catch{}}action??={type:'end'};}
   }
   assert.ok(action,`Unhandled phase ${s.phase}`);s=dispatch(s,action);steps++;executed=ordered&&s.events.some(e=>e.type==='order');
  }
  assert.ok(steps<600,`Seed ${seed} stalled`);assert.deepEqual(restore(save(s)),s);if(executed){success=true;console.log(JSON.stringify({earnedExpansionReplay:{seed,actions:s.history.length,training:s.trainingLevels}}));}
 }
 assert.ok(success,'No seeded run reached and executed learned training');
});
