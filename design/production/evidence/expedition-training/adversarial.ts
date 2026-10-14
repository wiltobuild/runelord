import fs from 'node:fs';import path from 'node:path';import assert from 'node:assert/strict';import {pathToFileURL} from 'node:url';import {createHash} from 'node:crypto';
const roots=['C:/Users/wilsh/Projects/runelord','C:/Users/wilsh/Projects/runelord-roguelike-pages-recovery'];const report:any={timestamp:new Date().toISOString(),checks:[],hashes:[]};
const baselines=JSON.parse(fs.readFileSync(new URL('../../home-biome/qa/baseline-saves.json',import.meta.url),'utf8'));
for(const [index,root] of roots.entries()){
 const e=await import(pathToFileURL(path.join(root,'packages/engine/index.ts')).href);const c=await import(pathToFileURL(path.join(root,'packages/content/index.ts')).href);const mode=index?'demo':'conquer';
 const test=(name:string,fn:()=>any)=>{try{report.checks.push({mode,name,status:'pass',details:fn()});}catch(err){report.checks.push({mode,name,status:'fail',error:String(err)});}};
 const fresh=(deck='warband')=>index?e.newRoguelikeRun(42,deck):e.newInfernalRun(42,deck);
 const unit=(s:any,kind:string)=>({...e.demonStats[kind],kind,id:s.nextId++,maxHp:e.demonStats[kind].hp,guard:0,order:'attack',...(kind in c.runebladeSummons?{rot:1}:{})});
 const battle=()=>{const s=fresh();s.phase='combat';s.units=[];s.enemies=[{id:999,name:'Test enemy',art:'goblin',hp:1000,maxHp:1000,guard:0,scorch:0,moves:[{name:'Wait',damage:0,targeting:'front'}]}];s.reserves=[];s.mana=10;s.cinders=20;s.relics=[];s.turn=1;return s;};
 const hooks=(s:any,events:string[]=[])=>({guard:(n:number)=>s.guard+=n,draw:(n:number)=>{s.qaDraw=(s.qaDraw||0)+n},scorch:(v:any,n:number)=>v.scorch+=n,chill:(v:any,n:number)=>v.chill=(v.chill||0)+n,damage:(v:any,n:number)=>v.hp-=n,summon:(kind:string)=>{s.units.push({...unit(s,kind),readyTurn:s.turn+1})},hellgate:()=>events.push('hellgate'),emit:(type:string)=>events.push(type)});
 test('eight old save snapshots preserve gameplay bytes',()=>{for(const b of baselines.filter((b:any)=>b.root===root)){const s=e.restore(JSON.stringify(b.save));const normalized=JSON.parse(JSON.stringify(s));delete normalized.heroRouteVersion;delete normalized.expansionVersion;assert.deepEqual(normalized,b.state,b.deck);assert.deepEqual(e.restore(e.save(s)),s);}});
 test('22 kinds: training shared by every copy and 3 orders; invalid payment atomic',()=>{
  assert.equal(Object.keys(e.summonTraining).length,22);for(const kind of Object.keys(e.summonTraining)){
   let s=battle();s.acquiredSummons=[kind];s.phase='shop';s.gold=200;s.units=[unit(s,kind),unit(s,kind)];
   s=e.dispatch(s,{type:'train-summon',kind});s=e.dispatch(s,{type:'train-summon',kind});assert.equal(s.gold,40);assert.equal(s.trainingLevels[kind],2);for(const u of s.units)assert.equal(e.availableOrders(s,u).length,3);assert.equal(e.availableOrders(s,unit(s,kind)).length,3);
   const before=structuredClone(s);assert.throws(()=>e.dispatch(s,{type:'train-summon',kind}));assert.deepEqual(s,before);
   s.trainingLevels[kind]=0;s.gold=0;const poor=structuredClone(s);assert.throws(()=>e.dispatch(s,{type:'train-summon',kind}));assert.deepEqual(s,poor);
  }
 });
 test('all utility/mastery entries execute without undefined effect; per-turn limit and dead ally fallback',()=>{
  for(const [kind,kit] of Object.entries(e.summonTraining) as any){for(const order of kit.tiers){const s=battle(),u=unit(s,kind);s.units=[u];s.trainingLevels[kind]=2;u.order=order.id;u.orderTarget=order.target==='enemy'?999:u.id;assert.equal(e.performOrder(s,u,hooks(s)),true,kind+':'+order.id);assert.equal(e.performOrder(s,u,hooks(s)),false);}}
  const s=battle(),u=unit(s,'hellhound');s.units=[u];s.trainingLevels.hellhound=1;u.order='pack-shelter';u.orderTarget=123456;assert.equal(e.performOrder(s,u,hooks(s)),false);assert.equal(u.utilityUsedTurn,undefined);
 });
 test('shared Gorthak charge and cap10 do not consume failed summon charge',()=>{const s=battle();s.trainingLevels.gorthak=2;const a=unit(s,'gorthak'),b=unit(s,'gorthak');s.units=[a,b];a.order=b.order='dominion';assert.equal(e.performOrder(s,a,hooks(s)),true);assert.equal(e.performOrder(s,b,hooks(s)),false);assert.equal(s.units.length,3);assert.equal(s.units[2].readyTurn,s.turn+1);const t=battle();t.trainingLevels.gorthak=2;const g=unit(t,'gorthak');g.order='dominion';t.units=[g,...Array.from({length:9},()=>unit(t,'imp'))];assert.equal(e.performOrder(t,g,hooks(t)),false);assert.equal(t.orderCharges?.['gorthak:dominion']||0,0);});
 test('coordinated thrust uses selected teammates and +6 cap',()=>{for(const count of [0,1,3,5]){const s=battle();s.trainingLevels['ash-pikeman']=2;const u=unit(s,'ash-pikeman');u.order='coordinated-thrust';u.orderTarget=999;s.units=[u,...Array.from({length:count},()=>({...unit(s,'ash-pikeman'),order:'coordinated-thrust'})),{...unit(s,'ash-pikeman'),order:'attack'}];e.performOrder(s,u,hooks(s));assert.equal(s.enemies[0].hp,1000-7-Math.min(6,count*2));}});
 test('commands use basic action without consuming utility; Rot applies after utility',()=>{
  let s=battle();const u=unit(s,'imp');s.units=[u];s.trainingLevels.imp=2;u.order='cinder-screen';s.hand=[{uid:900,id:'command',level:0}];
  // The actual targeted command card name is read from the content registry.
  const id='hellish-command';s.hand[0].id=id;
  s=e.dispatch(s,{type:'play',uid:900,unit:u.id,target:999});assert.ok(s.enemies[0].hp<1000);assert.equal(s.units[0].utilityUsedTurn,undefined);
  let r=battle();r.hero='runeblade';const thrall=unit(r,'bone-defender');r.units=[thrall];r.trainingLevels['bone-defender']=1;thrall.order='bone-wall';const hp=thrall.hp;r=e.dispatch(r,{type:'end'});assert.equal(r.units[0].hp,hp-1);assert.equal(r.units[0].rot,2);
 });
 test('unselected Legionaries must not disable another Defender',()=>{const s=battle();s.units=[unit(s,'iron-legionary'),unit(s,'iron-legionary'),unit(s,'pit-brute')];s.units[2].defender=true;assert.equal(e.resolveTargets(s,'hero')[0],s.units[2]);});
 test('selected Hellgate once; reinforcement skips action phase; two channels do not trigger',()=>{
  for(const count of [2,3]){let s=battle();s.trainingLevels.maledictor=2;s.units=Array.from({length:3},(_,i)=>({...unit(s,'maledictor'),order:i<count?'hellgate-channel':'attack'}));s=e.dispatch(s,{type:'end'});assert.equal(s.events.filter((v:any)=>v.type==='hellgate').length,count===3?1:0);const imp=s.units.find((u:any)=>u.kind==='imp');if(count===3){assert.ok(imp);assert.ok(!s.events.some((v:any)=>v.type==='muster'&&v.actor===imp.id));}}
 });
 test('Brace counters once against multiple attacks, and unit target fallback damages living enemy',()=>{
  let s=battle();s.trainingLevels['ash-pikeman']=1;const p=unit(s,'ash-pikeman');p.hp=p.maxHp=100;p.order='brace';s.units=[p];s.enemies[0].moves=[{name:'Strike',damage:8,targeting:'front'}];s.enemies.push({...structuredClone(s.enemies[0]),id:998});s=e.dispatch(s,{type:'end'});assert.equal(s.events.filter((v:any)=>v.type==='counter').length,1);
  let t=battle();const u=unit(t,'imp');u.orderTarget=12345;t.units=[u];t=e.dispatch(t,{type:'end'});assert.ok(t.enemies[0].hp<1000);
 });
 test('type-wide training applies to generated token source and both card copies',()=>{
  let s=battle();s.trainingLevels.imp=2;s.hand=[{uid:300,id:'summon-imp'},{uid:301,id:'summon-imp'}];s=e.dispatch(s,{type:'play',uid:300,target:999});s=e.dispatch(s,{type:'play',uid:301,target:999});assert.ok(s.units.every((u:any)=>e.availableOrders(s,u).length===3));
  s.units=[unit(s,'ignivar')];s=e.dispatch(s,{type:'end'});const imp=s.units.find((u:any)=>u.kind==='imp');assert.ok(imp);assert.equal(e.availableOrders(s,imp).length,3);
 });
 test('30 relics all effect hooks execute once at cap; additive discounts floor1; no collection cap',()=>{
  assert.equal(Object.keys(e.expansionRelics).length,30);
  for(const [id,r] of Object.entries(e.expansionRelics) as any){if(r.effect==='discount')continue;const s=battle(),u=unit(s,'pit-brute');s.units=r.condition==='empty-warband'?[]:[u];s.trainingLevels[u.kind]=2;u.defender=true;s.hp=10;s.relics=[id];s.enemies[0].scorch=1;s.enemies[0].chill=1;const events:string[]=[];e.relicHook(s,r.hook,hooks(s,events),u);const snapshot=JSON.stringify(s);assert.equal(events.filter(v=>v==='relic').length,1,id);e.relicHook(s,r.hook,hooks(s,events),u);assert.equal(JSON.stringify(s),snapshot,id+' cap');}
  const s=battle();s.relics=Object.keys(e.expansionRelics);s.hp=1;assert.equal(s.relics.length,30);assert.equal(e.expansionPrice(s,10),5);assert.equal(e.expansionPrice(s,3),1);
 });
 test('engine treasure collection can exceed30 unique relics and exhausted pool yields gold',()=>{let s=battle();s.relics=[];const count=e.expansionRelicPool(s).length;assert.ok(count>30);for(let i=0;i<count;i++){s.phase='treasure';s.room=i;s=e.dispatch(s,{type:'claim-treasure',choice:'relic'});assert.equal(s.relics.length,i+1);}assert.equal(new Set(s.relics).size,count);s.phase='treasure';const gold=s.gold;s=e.dispatch(s,{type:'claim-treasure',choice:'relic'});assert.equal(s.gold,gold+65);});
 test('discounted removal spends exactly5 and insufficient payment is atomic',()=>{let s=fresh();while(s.deck.length<11){s.deck.push('neutral-strike');s.deckLevels.push(0);}s.phase='shop';s.hp=1;s.relics=['merchants-mark','hardship-voucher'];s.gold=4;if(index)e.enterRoguelikeShop(s);else s.journey.current=s.journey.nodes.find((n:any)=>n.kind==='shop').id;const offer=e.currentShop(s).removals.find((o:any)=>!o.sold);assert.ok(offer);const before=structuredClone(s);assert.throws(()=>e.dispatch(s,{type:'shop-remove',index:offer.index}));assert.deepEqual(s,before);s.gold=5;const count=s.deck.length;s=e.dispatch(s,{type:'shop-remove',index:offer.index});assert.equal(s.gold,0);assert.equal(s.deck.length,count-1);});
 if(index)test('normal/elite roster normalization includes reserves and never normal bosses',()=>{
  const s=fresh('rimebound');s.room=7;s.roomKinds={7:'combat'};let a=e.activeEncounter(s);assert.equal(a.reserves[0].hp,93,'ordinary reserve HP');assert.ok([...a.enemies,...a.reserves].every((v:any)=>!v.boss));s.roomKinds[7]='elite';a=e.activeEncounter(s);assert.equal(a.reserves[0].hp,112,'selected elite reserve HP');
 });
 if(index)test('seeded 3-choice rooms fixed normal openings/boss endings; mysteries bounded and treasure weighted',()=>{
  const counts:Record<string,number>={};let mystery=0;for(let seed=0;seed<1000;seed++){const s=fresh();s.seed=seed;s.phase='route-choice';for(let room=0;room<32;room++){s.room=room;const opts=e.routeChoices(s);assert.deepEqual(opts,e.routeChoices(structuredClone(s)));const next={...s,room:room+1},local=e.realmEncounterNumber(next);if(local===1)assert.deepEqual(opts.map((o:any)=>o.kind),['combat']);else if(e.isRealmBoss(next))assert.deepEqual(opts.map((o:any)=>o.kind),['boss']);else {assert.equal(opts.length,3);assert.equal(new Set(opts.map((o:any)=>o.kind)).size,3,'distinct choices');}for(const o of opts)if(o.kind==='mystery'){const k=e.resolveRoomKind(s,o);assert.notEqual(k,'boss');counts[k]=(counts[k]||0)+1;mystery++;}}}
  assert.ok(counts.treasure/mystery>.55&&counts.treasure/mystery<.75);assert.ok(counts.elite/mystery<.1);return{mystery,counts};
 });
 for(const rel of ['packages/engine/index.ts','packages/engine/expansion.ts','packages/engine/expansionCatalog.ts'])report.hashes.push({root,path:rel,sha256:createHash('sha256').update(fs.readFileSync(path.join(root,rel))).digest('hex')});
}
fs.writeFileSync(new URL('./adversarial-results.json',import.meta.url),JSON.stringify(report,null,2));console.log(JSON.stringify(report.checks,null,2));if(report.checks.some((x:any)=>x.status==='fail'))process.exitCode=1;



