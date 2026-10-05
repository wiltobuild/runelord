import { implemented, neutralCards, cards, relicPool, type CardId, type ItemId } from '../content/index';
import {eligibleCardReward, demonStats, type DemonKind, type State} from './index';
export type ShopRerollKind='buy'|'upgrade'|'remove';
export type OwnedShopOffer={index:number;id:CardId;level:number;sold:boolean};
export type ShopStock = { cards: {id:CardId;price:number;sold:boolean}[]; relics:{id:ItemId;price:number;sold:boolean}[]; upgrades:OwnedShopOffer[];removals:OwnedShopOffer[];rerolls:Record<ShopRerollKind,number>;servicesReady:boolean };
export type RoguelikeShops = {current:string|null;stock:Record<string,ShopStock>};
export const cardPower = (level:number) => 1.2 ** Math.max(0,level);
export const upgradeCost = (level:number) => 50 * 2 ** Math.max(0,level);
export const cardLevel = (s:State,index:number) => s.deckLevels?.[index] || 0;
export const copyLimit = (id:CardId) => cards[id].rarity === 'Rare' ? 2 : 3;
export const canAddCard = (s:State,id:CardId) => s.deck.filter(c=>c===id).length < copyLimit(id);
const allShopCards=[...new Set([...implemented.filter(id=>cards[id].rarity!=='Basic'),...neutralCards])];
const shopPool=(s:State)=>allShopCards.filter(id=>eligibleCardReward(s,id));
function sample<T extends string|number>(pool:readonly T[],seed:number,salt:string,previous:readonly T[]=[]):T[]{
 let rng=seed>>>0;for(const ch of salt)rng=Math.imul(rng^ch.charCodeAt(0),16777619)>>>0;
 const take=(input:T[])=>{const result:T[]=[];while(input.length){rng=(Math.imul(rng,1664525)+1013904223)>>>0;result.push(input.splice(Math.floor(rng/4294967296*input.length),1)[0]);}return result;};
 return [...take(pool.filter(v=>!previous.includes(v))),...take(pool.filter(v=>previous.includes(v)))].slice(0,2);
}
const eligibleCopies=(s:State,kind:'upgrade'|'remove')=>kind==='remove'&&s.deck.length<=10?[]:s.deck.map((_,i)=>i).filter(i=>kind==='remove'||Number.isSafeInteger(upgradeCost(cardLevel(s,i))));
function copyOffers(s:State,kind:'upgrade'|'remove',roll:number,previous:number[]=[]):OwnedShopOffer[]{return sample(eligibleCopies(s,kind),s.seed,`${s.shops!.current}:${kind}:${roll}`,previous).map(index=>({index,id:s.deck[index],level:cardLevel(s,index),sold:false}));}
export const currentShop = (s:State):ShopStock|undefined => {
 const stock=s.shops?.stock[s.shops.current||''];if(!stock)return;
 const view=stock.servicesReady?stock:{...stock,upgrades:copyOffers(s,'upgrade',0),removals:copyOffers(s,'remove',0)};
 const refresh=(offers:OwnedShopOffer[])=>offers.map(o=>o.sold?o:{...o,id:s.deck[o.index]??o.id,level:cardLevel(s,o.index)});
 return {...view,upgrades:refresh(view.upgrades),removals:refresh(view.removals)};
};
export function prepareShop(s:State){const stock=currentShop(s);if(stock&&!!s.shops)s.shops.stock[s.shops.current!]={...stock,servicesReady:true};}
export const shopRerollCost=(s:State,kind:ShopRerollKind)=>{const count=currentShop(s)?.rerolls[kind];const price=count===undefined||!Number.isSafeInteger(count)||count<0?Infinity:10*2**count;return Number.isSafeInteger(price)&&price>0?price:Infinity;};
export const shopCanReroll=(s:State,kind:ShopRerollKind)=>s.phase==='shop'&&!!s.shops&&s.gold>=shopRerollCost(s,kind)&&(kind==='buy'?shopPool(s).some(id=>canAddCard(s,id)):eligibleCopies(s,kind).length>0);
export function rerollShop(s:State,kind:ShopRerollKind){
 if(!(['buy','upgrade','remove'] as string[]).includes(kind))throw Error('Invalid reroll type.');
 if(!s.shops||s.phase!=='shop')throw Error('Visit a Soulforge shop first.');
 if(!shopCanReroll(s,kind))throw Error('Not enough Gold or no eligible cards to reroll.');
 prepareShop(s);const stock=s.shops.stock[s.shops.current!]!;const price=shopRerollCost(s,kind),roll=stock.rerolls[kind]+1;
 if(kind==='buy')stock.cards=sample(shopPool(s).filter(id=>canAddCard(s,id)),s.seed,`${s.shops.current}:buy:${roll}`,stock.cards.map(o=>o.id)).map(id=>({id,price:cards[id].rarity==='Rare'?90:45,sold:false}));
 else{const key=kind==='upgrade'?'upgrades':'removals';stock[key]=copyOffers(s,kind,roll,stock[key].map(o=>o.index));}
 s.gold-=price;stock.rerolls[kind]=roll;
}
export function remapShopCopies(s:State,removed:number){for(const stock of Object.values(s.shops?.stock||{}))for(const key of ['upgrades','removals'] as const)for(const o of stock[key]){if(o.index===removed){o.sold=true;o.index=-1;}else if(o.index>removed)o.index--;}}
export function refreshRemovalOffers(s:State){const stock=s.shops?.stock[s.shops.current||''];if(stock&&!!s.shops&&stock.removals.length===0&&s.deck.length>10)stock.removals=copyOffers(s,'remove',stock.rerolls.remove);}
/** Intrinsic effects only: relic, target and temporary battle modifiers are intentionally excluded. */
export function cardEffectText(id:CardId,level=0):string {
 if(id.startsWith('summon-')&&id.slice(7) in demonStats){const stats=demonStats[id.slice(7) as DemonKind];return cards[id].text+` Stats at level ${level}: ${Math.round(stats.hp*cardPower(level))} HP${stats.power?', '+Math.round(stats.power*cardPower(level))+' damage':''}. Upkeep ${stats.upkeep}.`;}
 const v=(n:number)=>level?Math.max(n+level,Math.round(n*cardPower(level))):n;
 const summon=(name:string,hp:number,power:number,rest:string)=>`Summon ${name}: ${Math.round(hp*cardPower(level))} HP, ${Math.round(power*cardPower(level))} damage. ${rest}`;
 const effects:Partial<Record<CardId,string>>={
 'neutral-strike':`Deal ${v(8)} damage.`, 'neutral-bulwark':`Gain ${v(13)} Guard.`, 'neutral-insight':`Draw ${v(2)} cards. Gain ${v(3)} Guard.`, 'neutral-renewal':`Restore ${v(6)} HP. Gain ${v(6)} Guard.`,
 'firebolt':`Deal ${v(6)} damage.`, 'ward-of-ash':`Gain ${v(5)} Guard.`, 'summon-imp':summon('an Imp',6,4,'Attacks immediately and applies 1 Scorch. Upkeep 0.'), 'summon-hellhound':summon('a Hellhound',14,6,'Upkeep 1.'), 'summon-pit-brute':summon('a Pit Brute',26,7,'Cleave all enemies. Defender. Upkeep 2.'),
 'blood-pact':`Lose 3 HP. Gain 3 Corruption, 1 Mana and ${v(2)} Cinders.`, 'feed-the-pit':`Lose 2 HP. Gain 2 Corruption and ${v(3)} Cinders.`, 'immolate':`Deal ${v(4)} damage. Apply ${v(4)} Scorch.`, 'smoldering-brand':`Deal ${v(3)} damage. Apply ${v(3)} Scorch.`, 'searing-lash':`Deal ${v(9)} damage. If the target was burning, gain 1 Cinder.`,
 'kindle':`Gain ${v(4)} Cinders. Draw 1 card.`, 'sinister-veil':`Gain ${v(8)} Guard. Each demon gains ${v(3)} Guard.`, 'ashen-ward':`Gain ${v(7)} Guard. Apply ${v(2)} Scorch to all enemies.`, 'conflagrate':`Deal ${v(8)} damage and apply ${v(2)} Scorch to all enemies.`,
 'hellish-command':level?`Chosen demon gains max(1, round(damage × ${(cardPower(level)-1).toFixed(3)})) temporary damage and acts immediately.`:'Chosen demon acts immediately.',
 'ritual-cut':`Lose 2 HP and gain 2 Corruption. Deal ${v(13)} damage.`, 'chain-of-flame':`Deal ${v(5)} damage. Copy the target's existing Scorch to another random enemy.`, 'dark-bargain':`Lose 4 HP and gain 4 Corruption. Draw ${v(3)} cards.`, 'fiendish-feast':`Sacrifice a demon. Heal half its current HP, rounded down. Gain ${v(3)} Cinders.`,
 'infernal-whip':`Deal ${v(7)} damage. Each demon deals ${v(3)} additional damage to the target.`, 'burning-hatred':`Deal ${v(15)} damage. Gain 2 Corruption.`, 'cinder-shield':`Gain ${v(7)} Guard; doubled at 5 or more Cinders.`, 'smoke-and-mirrors':`All enemies gain ${v(1)} Sapped. Each demon gains ${v(3)} Guard.`, 'hellfire':`Deal ${v(6)} damage to all enemies twice; apply 1 Scorch per hit.`,
 'infernal-pact':`Whenever you lose HP during your turn and survive, deal ${v(5)} damage to all enemies.`, 'masters-of-the-pit':`Your demons gain ${v(2)} damage, including future summons.`, 'burning-soul':`Reduce demon Upkeep by ${v(1)}, minimum 0.`, 'demonic-resilience':`Whenever a demon dies, gain ${v(6)} Guard and 2 Cinders.`, 'sacrificial-rite':`Sacrifice a demon. Gain 2 Mana and draw ${v(2)} cards.`, 'corrupting-touch':`Gain 3 Corruption. Apply ${v(2)} Exposed.`, 'fire-and-brimstone':`Deal ${v(10)} damage. Double the target's Scorch.`, 'ember-storm':`Apply ${v(3)} Scorch per Mana spent to all enemies.`,
 'unholy-frenzy':`Lose 3 HP and gain 3 Corruption. All demons act; damaging actions use ${Math.round(cardPower(level)*100)}% damage, rounded to whole numbers.`, 'pyroclasm':`At the start of your turn, apply ${v(3)} Scorch to all enemies.`, 'shadowflame-barrier':`Gain ${v(12)} Guard. When attacked this turn, apply ${v(3)} Scorch to the attacker.`, 'void-gaze':`Apply ${v(2)} Sapped. Gain 2 Corruption. Draw 1 card.`, 'rend-flesh':`Deal ${v(10)} damage; repeat in Demon Form.`,
 'combust':`Consume all Scorch. Deal ${level?`max(Scorch × 2 + ${level}, round(Scorch × ${(2*cardPower(level)).toFixed(3)}))`:'Scorch × 2'} damage (0 if no Scorch). At 10 Scorch: ${level?Math.max(20+level,Math.round(20*cardPower(level))):20} damage.`, 'blood-price':`Lose 2 HP and gain 2 Corruption. Deal ${v(6)} damage twice. On kill gain 4 Corruption.`, 'wreathed-in-flame':`Gain ${v(5)} Guard plus half the total enemy Scorch, rounded down.`, 'dread-aura':`Whenever a demon attacks, apply ${v(1)} Scorch to its target.`, 'feast-of-embers':`Heal a demon for ${v(8)} HP and grant it ${v(3)} damage.`, 'abyssal-gaze':`Gain 2 Corruption. Draw ${v(1)} cards.`, 'infernal-transformation':`Enter Demon Form for ${v(3)} turns.`};
 return effects[id]??cards[id].text;
}
export function upgradePreview(s:State,index:number){const id=s.deck[index];if(!id)throw Error('Choose a card in your deck.');const level=cardLevel(s,index),mana=(l:number)=>Math.max(cards[id].cost>0?1:0,cards[id].cost-Math.floor(l/3));return {id,level,nextLevel:level+1,power:cardPower(level),nextPower:cardPower(level+1),cost:mana(level),nextCost:mana(level+1),text:cardEffectText(id,level),nextText:cardEffectText(id,level+1),price:upgradeCost(level)};}

/** Shop randomness is independent of combat draws. */
export function enterRoguelikeShop(s:State){
 if(!s.shops)throw Error('Shops are not enabled for this run.');
 const id=`roguelike-${s.room+1}`;s.shops.current=id;
 if(!s.shops.stock[id]){
  let rng=(s.seed ^ Math.imul(s.room+1,16777619))>>>0;
  const pool=[...relicPool];const relics:ShopStock['relics']=[];
  while(relics.length<5&&pool.length){rng=(Math.imul(rng,1664525)+1013904223)>>>0;const item=pool.splice(Math.floor(rng/4294967296*pool.length),1)[0];relics.push({id:item,price:120,sold:false});}
  s.shops.stock[id]={cards:sample(shopPool(s),s.seed,`${id}:buy:0`).map(id=>({id,price:cards[id].rarity==='Rare'?90:45,sold:false})),relics,upgrades:[],removals:[],rerolls:{buy:0,upgrade:0,remove:0},servicesReady:false};
 }
 s.phase='shop';prepareShop(s);
}
/** Appearance never consumes the encounter RNG: existing saves keep routes and stock unchanged. */
export function infernalShopAppearance(seed:number,nodeId:string|null) {
 const hash=(salt:string)=>{
  let value=(2166136261^(seed>>>0))>>>0;
  for(const ch of `${salt}:${nodeId ?? 'infernal-entry'}`) value=Math.imul(value^ch.charCodeAt(0),16777619)>>>0;
  value^=value>>>16;value=Math.imul(value,0x7feb352d);value^=value>>>15;
  return value>>>0;
 };
 const shop=(hash('shop')%3+1) as 1|2|3;
 const merchant=(hash('merchant')%3+1) as 1|2|3;
 const shopId=({1:'cinder-vault',2:'chain-bazaar',3:'infernal-scriptorium'} as const)[shop];
 return {shop,merchant,shopId};
}
