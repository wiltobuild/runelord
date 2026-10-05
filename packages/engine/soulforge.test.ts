import {test} from 'node:test';
import assert from 'node:assert/strict';
import {newRoguelikeRun,enterRoguelikeShop,currentShop,prepareShop,shopRerollCost,shopCanReroll,dispatch,save,restore,playable,upgradePreview,cardEffectText,cardPower,manaCost,infernalShopAppearance,type State} from './index';
import {implemented,neutralCards,cards,type CardId} from '../content/index';
function shop(seed=42,extra=0):State{const s=newRoguelikeRun(seed);s.room=2;s.gold=10000;for(let i=0;i<extra;i++){s.deck.push('neutral-strike');s.deckLevels!.push(0);}enterRoguelikeShop(s);return s;}
test('Soulforge offers two distinct mixed-pool cards, two eligible copies per service, five relics, read-only previews',()=>{
 const seen=new Set<string>();for(let seed=0;seed<80;seed++){const s=shop(seed,2),before=structuredClone(s),st=currentShop(s)!;assert.equal(st.cards.length,2);assert.equal(new Set(st.cards.map(c=>c.id)).size,2);for(const c of st.cards){assert.ok([...implemented,...neutralCards].includes(c.id));seen.add(c.id.startsWith('neutral-')?'neutral':'warlock');}assert.equal(st.relics.length,5);assert.equal(st.upgrades.length,2);assert.equal(st.removals.length,2);for(const list of [st.upgrades,st.removals]){assert.equal(new Set(list.map(o=>o.index)).size,2);for(const o of list)assert.equal(o.id,s.deck[o.index]);}assert.deepEqual(s,before);}assert.deepEqual([...seen].sort(),['neutral','warlock']);
});
test('three independent reroll prices double per shop and replace previous offers when alternatives exist',()=>{
 let s=shop(23,2);for(const kind of ['buy','upgrade','remove'] as const){assert.equal(shopRerollCost(s,kind),10);const old=currentShop(s)!;const previous=kind==='buy'?old.cards.map(o=>o.id):(kind==='upgrade'?old.upgrades:old.removals).map(o=>o.index);const deck=[...s.deck],levels=[...s.deckLevels!],gold=s.gold;s=dispatch(s,{type:'shop-reroll',kind});assert.equal(s.gold,gold-10);assert.equal(shopRerollCost(s,kind),20);assert.deepEqual(s.deck,deck);assert.deepEqual(s.deckLevels,levels);const st=currentShop(s)!;const next=kind==='buy'?st.cards.map(o=>o.id):(kind==='upgrade'?st.upgrades:st.removals).map(o=>o.index);assert.equal(next.length,2);for(const x of next)assert.ok(!(previous as (number|string)[]).includes(x));}s=dispatch(s,{type:'shop-reroll',kind:'buy'});assert.equal(shopRerollCost(s,'buy'),40);assert.equal(shopRerollCost(s,'upgrade'),20);assert.equal(shopRerollCost(s,'remove'),20);s.room=5;enterRoguelikeShop(s);assert.equal(shopRerollCost(s,'buy'),10);
});
test('reroll rejects no eligible copies, insufficient funds, invalid kind and unsafe exponential costs atomically',()=>{
 const ten=shop();assert.equal(shopCanReroll(ten,'remove'),false);assert.throws(()=>dispatch(ten,{type:'shop-reroll',kind:'remove'}));for(const mutate of [(s:State)=>s.gold=9,(s:State)=>currentShop(s)!.rerolls.buy=1000,(s:State)=>currentShop(s)!.rerolls.buy=-1]){const s=shop();mutate(s);const before=structuredClone(s);assert.throws(()=>dispatch(s,{type:'shop-reroll',kind:'buy'}));assert.deepEqual(s,before);}const s=shop(),before=structuredClone(s);assert.throws(()=>dispatch(s,{type:'shop-reroll',kind:'bogus'} as any));assert.deepEqual(s,before);
 const capped=shop();capped.deck=[...implemented,...neutralCards].flatMap(id=>Array(cards[id].rarity==='Rare'?2:3).fill(id));capped.deckLevels=capped.deck.map(()=>0);assert.equal(shopCanReroll(capped,'buy'),false);assert.throws(()=>dispatch(capped,{type:'shop-reroll',kind:'buy'}));
});
test('upgrades are offered-copy only, charged once, and preserve per-copy level/price effects',()=>{
 let s=shop(),st=currentShop(s)!,index=st.upgrades[0].index;const unoffered=s.deck.findIndex((_,i)=>!st.upgrades.some(o=>o.index===i));assert.throws(()=>dispatch(s,{type:'shop-upgrade',index:unoffered}),/offered/);s.deckLevels![index]=2;const preview=upgradePreview(s,index);assert.equal(preview.price,200);s=dispatch(s,{type:'shop-upgrade',index});assert.equal(s.gold,9800);assert.equal(s.deckLevels![index],3);assert.equal(currentShop(s)!.upgrades.find(o=>o.index===index)!.sold,true);assert.throws(()=>dispatch(s,{type:'shop-upgrade',index}),/offered/);
});
test('scarce reroll pools return the remaining distinct eligible offer and unsafe upgrade prices never charge',()=>{
 let s=shop();s.deck=[...implemented,...neutralCards].flatMap(id=>Array(cards[id].rarity==='Rare'?2:3).fill(id));s.deck.splice(s.deck.indexOf('neutral-strike'),1);s.deckLevels=s.deck.map(()=>0);s=dispatch(s,{type:'shop-reroll',kind:'buy'});assert.deepEqual(currentShop(s)!.cards.map(c=>c.id),['neutral-strike']);s=dispatch(s,{type:'shop-buy',kind:'card',index:0});const before=structuredClone(s);assert.throws(()=>dispatch(s,{type:'shop-reroll',kind:'buy'}));assert.deepEqual(s,before);
 const u=shop(),offered=currentShop(u)!.upgrades[0].index;u.deckLevels![offered]=1000;u.gold=Number.MAX_SAFE_INTEGER;const original=structuredClone(u);assert.throws(()=>dispatch(u,{type:'shop-upgrade',index:offered}));assert.deepEqual(u,original);
});
test('removing an offered copy remaps surviving offers in all shops and invalidates the deleted copy safely',()=>{
 let s=shop(9,3);const stock=s.shops!.stock[s.shops!.current!];stock.upgrades=[{index:4,id:s.deck[4],level:2,sold:false},{index:6,id:s.deck[6],level:5,sold:false}];stock.removals=[{index:4,id:s.deck[4],level:2,sold:false},{index:8,id:s.deck[8],level:0,sold:false}];s.deckLevels![4]=2;s.deckLevels![6]=5;const id=s.deck[6];s=dispatch(s,{type:'shop-remove',index:4});assert.equal(s.deck.length,12);assert.equal(s.gold,9990);const next=currentShop(s)!;assert.ok(next.upgrades.find(o=>o.index===-1&&o.sold));const moved=next.upgrades.find(o=>o.index===5)!;assert.equal(moved.id,id);assert.equal(moved.level,5);assert.equal(next.removals[1].index,7);s=dispatch(s,{type:'shop-upgrade',index:5});assert.equal(s.deckLevels![5],6);
});
test('buying above ten cards exposes removal options without deleting cards on reroll; floor ten still enforced',()=>{
 let s=shop();assert.equal(currentShop(s)!.removals.length,0);s=dispatch(s,{type:'shop-buy',kind:'card',index:0});assert.equal(s.deck.length,11);assert.equal(currentShop(s)!.removals.length,2);const first=currentShop(s)!.removals[0].index;s=dispatch(s,{type:'shop-remove',index:first});assert.equal(s.deck.length,10);assert.throws(()=>dispatch(s,{type:'shop-remove',index:currentShop(s)!.removals.find(o=>!o.sold)!.index}),/10/);
});
test('numerical upgrade previews match intrinsic scalar, summon and rounded effects rather than static base text',()=>{
 const s=shop();s.deck=['firebolt','neutral-insight','summon-imp','combust','blood-pact'];s.deckLevels=[0,1,2,0,0];assert.equal(upgradePreview(s,0).text,'Deal 6 damage.');assert.equal(upgradePreview(s,0).nextText,'Deal 7 damage.');assert.match(upgradePreview(s,1).text,/Draw 3 cards. Gain 4 Guard/);assert.match(upgradePreview(s,1).nextText,/Draw 4 cards. Gain 5 Guard/);assert.match(upgradePreview(s,2).nextText,/10 HP, 7 damage/);assert.match(upgradePreview(s,3).nextText,/At 10 Scorch: 24 damage/);assert.match(upgradePreview(s,4).nextText,/Lose 3 HP.*3 Cinders/);assert.match(cardEffectText('dread-aura',1),/2 Scorch/);assert.match(cardEffectText('infernal-pact',1),/6 damage to all enemies/);assert.equal(cardPower(1),1.2);
});

function reachShop(seed:number){let s=newRoguelikeRun(seed);for(let i=0;i<600&&s.phase!=='shop'&&s.phase!=='lost';i++){if(s.phase==='combat'){const c=s.hand.find(c=>playable(s,c)&&(!c.id.startsWith('summon-')||s.units.length<5));s=dispatch(s,c?{type:'play',uid:c.uid,target:s.enemies.find(e=>e.hp>0)!.id,...(s.units.length?{unit:s.units.at(-1)!.id}:{})}:{type:'end'});}else if(s.phase==='reward')s=dispatch(s,{type:'reward',card:null});else if(s.phase==='loot')s=dispatch(s,{type:'continue'});else if(s.phase==='camp')s=dispatch(s,{type:'camp'});}return s;}
test('schema7 earned-gold shop replays purchases, upgrades, rerolls and departure exactly',()=>{
 let s:State|undefined;for(let seed=0;seed<100;seed++){const candidate=reachShop(seed);if(candidate.phase==='shop'){s=candidate;break;}}assert.ok(s);assert.equal(s.room,2);assert.equal(s.gold,105);assert.deepEqual(restore(save(s)),s);
 const upgraded=dispatch(s,{type:'shop-upgrade',index:currentShop(s)!.upgrades[0].index});assert.deepEqual(restore(save(upgraded)),upgraded);
 s=dispatch(s,{type:'shop-reroll',kind:'buy'});s=dispatch(s,{type:'shop-reroll',kind:'upgrade'});const affordable=currentShop(s)!.cards.findIndex(c=>c.price<=s!.gold);assert.ok(affordable>=0);s=dispatch(s,{type:'shop-buy',kind:'card',index:affordable});assert.equal(JSON.parse(save(s)).schema,8);assert.deepEqual(restore(save(s)),s);s=dispatch(s,{type:'leave-shop'});assert.equal(s.room,3);assert.deepEqual(restore(save(s)),s);assert.throws(()=>dispatch(s!,{type:'leave-shop'}));
});
test('all nine infernal fights preserve rewards and loot, with a third shop before forest',()=>{
 let s=newRoguelikeRun(32,'fire');const shops:number[]=[];
 for(let room=0;room<9;room++){
  assert.equal(s.room,room);assert.equal(s.phase,'combat');
  for(let i=0;i<4&&s.phase==='combat';i++){s.enemies.forEach(e=>e.hp=1);s.mana=10;s.hand=[{id:'conflagrate',uid:99000}];s=dispatch(s,{type:'play',uid:99000,target:s.enemies.find(e=>e.hp>0)!.id});}
  assert.equal(s.phase,'reward');if(room===8)assert.ok(s.rewards.every(id=>id.startsWith('summon-')));s=dispatch(s,{type:'reward',card:null});
  assert.equal(s.phase,'loot');s=dispatch(s,{type:'continue'});
  if(s.phase==='shop'){shops.push(room+1);assert.equal(s.room,room);s=dispatch(s,{type:'leave-shop'});assert.throws(()=>dispatch(s,{type:'leave-shop'}));}
  if(s.phase==='camp')s=dispatch(s,{type:'camp'});
}
 assert.deepEqual(shops,[3,6,9]);assert.equal(s.phase,'combat');assert.equal(s.room,9);assert.equal(s.gold,585);
});

test('levelled cards enter battle at their purchased level and all shop relic passives resolve',()=>{
 let s=shop(31);s.relics=['ember-heart','iron-sigil','warband-fang','cinder-charm','blood-ruby','scholar-seal'];s.hp=40;s.deckLevels=s.deck.map(()=>3);
 s=dispatch(s,{type:'leave-shop'});assert.equal(s.room,3);assert.equal(s.hp,45);assert.equal(s.guard,3);assert.equal(s.cinders,4);assert.equal(s.hand.length,6);assert.ok([...s.hand,...s.draw].every(c=>c.level===3));
 assert.equal(manaCost(s,{id:'summon-pit-brute',uid:99,level:3}),1);assert.equal(manaCost(s,{id:'firebolt',uid:99,level:6}),1);
 s.hand=[{id:'summon-imp',uid:900,level:1}];s.mana=3;const hp=s.enemies[0].hp;s=dispatch(s,{type:'play',uid:900,target:s.enemies[0].id});assert.equal(s.units[0].maxHp,7);assert.equal(s.units[0].power,7);assert.equal(s.enemies[0].hp,hp-7);
 s.hand=[{id:'neutral-strike',uid:901,level:1}];s.mana=3;const before=s.enemies[0].hp;s=dispatch(s,{type:'play',uid:901,target:s.enemies[0].id});assert.equal(s.enemies[0].hp,before-11);
});
test('all nine independent shopkeeper/background pairings are seeded and do not alter gameplay RNG',()=>{
 const seen=new Set();for(let seed=0;seed<200;seed++){const s=shop(seed),before=structuredClone(s);const a=infernalShopAppearance(seed,s.shops!.current);seen.add(`${a.shop}/${a.merchant}`);assert.deepEqual(a,infernalShopAppearance(seed,s.shops!.current));assert.deepEqual(s,before);}assert.equal(seen.size,9);
});

