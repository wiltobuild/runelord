import { legionSummons, isLegionKind, legionTargetCards, hellboundImplemented, modernWarlockDecks, type LegionKind } from '../content/index';
export { legionSummons, isLegionKind, legionRoles } from '../content/index';
import { currentShop, cardPower, cardLevel, upgradeCost, canAddCard, prepareShop, rerollShop, remapShopCopies, refreshRemovalOffers, enterRoguelikeShop, type ShopRerollKind, type RoguelikeShops } from "./shop";
export * from "./shop";
import { sovereignRoot } from "./forestSovereign";
import { forestSovereignEncounter } from "./forest";
import { forestEncounters, forestEliteRooms } from "./forest";
export * from "./forest";
import {
  legacyRunebladeSummons, legacyRunebladeDecks, cards, cardsForHero, relicsForHero, heroForDeck, runebladeSummons, type ThrallKind, type HeroId,
  relicPool, implemented, legacyImplemented, legacyStarterDecks, summonExpansion, archCards, starterDecks, cardTargetsUnit, items, rewardWeight,
  type StarterDeckId, type ItemId,
  starter,
  encounters,
  rewardSets,
  type CardId,
  type Move,
  type Targeting,
} from "../content/index";
/** Keep historical fixed demos intact; the shop-enabled roguelike continues into Thornroot. */
export const encounterCount=(s:State)=>encounters.length+(s.shops?forestEncounters.length:0);
export const currentRealm=(s:State):'infernal'|'forest'=>s.shops&&s.room>=encounters.length?'forest':'infernal';
export const realmEncounterNumber=(s:State)=>s.room-(currentRealm(s)==='forest'?encounters.length:0)+1;
export const realmEncounterCount=(s:State)=>currentRealm(s)==='forest'?forestEncounters.length:encounters.length;
export const isRealmBoss=(s:State)=>realmEncounterNumber(s)===realmEncounterCount(s);
export const activeEncounter=(s:State)=>currentRealm(s)==='forest'?(s.forestBossVersion===2&&s.room===encounters.length+11?forestSovereignEncounter:forestEncounters[s.room-encounters.length]):encounters[s.room];
export const demonStats = {
 ...runebladeSummons,
 ...legionSummons,
 imp:{name:'Imp',hp:6,power:4,upkeep:0,defender:false},
 hellhound:{name:'Hellhound',hp:14,power:6,upkeep:1,defender:false},
 'pit-brute':{name:'Pit Brute',hp:26,power:7,upkeep:2,defender:true},
 gloomstalker:{name:'Gloomstalker',hp:10,power:0,upkeep:1,defender:false,elusive:true},
 'soul-leech':{name:'Soul Leech',hp:8,power:4,upkeep:1,defender:false},
 'pyre-warden':{name:'Pyre Warden',hp:12,power:0,upkeep:1,defender:false},
 ignivar:{name:'Ignivar',hp:18,power:6,upkeep:0,defender:false},
 cerberax:{name:'Cerberax',hp:28,power:8,upkeep:0,defender:false},
 nightmaw:{name:'Nightmaw',hp:18,power:0,upkeep:0,defender:false,elusive:true},
 'hollow-saint':{name:'The Hollow Saint',hp:20,power:6,upkeep:0,defender:false},
 'pyre-colossus':{name:'Pyre Colossus',hp:24,power:0,upkeep:0,defender:false},
 gorthak:{name:'Gorthak',hp:40,power:9,upkeep:0,defender:true},
} as const;
export type DemonKind = keyof typeof demonStats;
export const archForms:Partial<Record<DemonKind,DemonKind>>={imp:'ignivar',hellhound:'cerberax','pit-brute':'gorthak',gloomstalker:'nightmaw','soul-leech':'hollow-saint','pyre-warden':'pyre-colossus'};
export const isArchDemon=(kind:DemonKind)=>!(kind in runebladeSummons)&&!isLegionKind(kind)&&!archForms[kind];
export const warbandCapacity=(s:Pick<State,'legionRules'>)=>s.legionRules===2?10:5;
export const usesSummonRules=(s:State)=>s.summonRulesFrom!==undefined&&s.history.length>=s.summonRulesFrom;
const hasArch=(s:State,kind:DemonKind)=>usesSummonRules(s)&&s.units.some(u=>u.kind===kind&&u.hp>0);
const isHound=(u:Unit)=>u.kind==='hellhound'||u.kind==='cerberax';
export const eligibleCardReward=(s:State,id:CardId)=> id==='blood-ascension'&&s.legionRules!==2 ? false : hellboundImplemented.includes(id as typeof hellboundImplemented[number]) ? s.starterDeck==='hellbound' : s.hero==='runeblade' ? cardsForHero('runeblade').includes(id) && (s.runebladeRules===2 || !['exhume','mass-exhumation'].includes(id)) : cardsForHero('runeblade').includes(id) ? false : usesSummonRules(s) ? (!archCards.includes(id as typeof archCards[number])||s.room>=encounters.length) && (id!=='empower-demon'||s.starterDeck==='warband'||s.room>=encounters.length) : !summonExpansion.includes(id as typeof summonExpansion[number]);
function gainGuard(s:State,n:number){const amount=n*(hasArch(s,'pyre-colossus')?2:1);s.guard+=amount;emit(s,'guard',`${s.hero==='runeblade'?'Runeblade':'Warlock'} gains ${amount} Guard.`,{amount});}

export type Unit = {
  id: number;
  kind: DemonKind;
  name: string;
  hp: number;
  maxHp: number;
  guard: number;
  power: number;
  upkeep: number;
  defender: boolean;
  promotionRank?: number;
  armor?: number;
  legionBaseHp?: number;
  legionBasePower?: number;
  promotedOnTurn?: number;
  temporaryPower?: number;
  elusive?: boolean;
  actionCount?: number;
  rot?: number;
};
export type Enemy = {
  id: number;
  name: string;
  art: string;
  hp: number;
  maxHp: number;
  guard: number;
  scorch: number;
  moves: Move[];
  boss?: "demon-lord" | "forest-sovereign";
  bossPhase?: 1 | 2;
  summonsMade?: number;
  summonedBy?: number;
  sapped?: number;
  exposed?: number;
  chill?: number;
  frozen?: boolean;
  freezeCount?: number;
};
export type CardInstance = { uid: number; id: CardId; upgraded?: boolean; level?: number };
export type GameEvent = {
  spell?: Move["spell"];
  type: string;
  message: string;
  actor?: number;
  target?: number;
  amount?: number;
  cause?: "scorch";
  targets?: (number | "hero")[];
  unit?: Unit;
  view?: CombatView;
};
export type CombatView = Pick<
  State,
  | "hp"
  | "guard"
  | "mana"
  | "corpses"
  | "cinders"
  | "corruption"
  | "demonTurns"
  | "units"
  | "enemies"
  | "hand"
  | "draw"
  | "discard"
>;
export type PendingLoot = { gold: number; items: ItemId[]; final: boolean };
export type State = {
  legionRules?: 1|2;
  legionRanks?: Partial<Record<LegionKind,number[]>>;
  hellgateTurn?: number;
  runebladeRules?:1|2;
  hero:HeroId;
  corpses:number;
 forestBossVersion?:1|2;
  /** Actions before this index retain historical shield grants when replaying an older save. */
  monsterShieldRulesFrom?: number;
  summonRulesFrom?: number;
  shops?: RoguelikeShops;
  deckLevels?: number[];
  version: 1;
  rulesVersion: 2 | 3;
  legacyActions: number | null;
  pendingLoot: PendingLoot | null;
  relics: ItemId[];
  starterDeck: StarterDeckId;
  gold: number;
  inventory: ItemId[];
  reserves: Enemy[];
  powers: Partial<Record<CardId, number>>;
  barrier: number;
  seed: number;
  rng: number;
  room: number;
  phase: "shop" | "combat" | "reward" | "loot" | "camp" | "won" | "lost";
  turn: number;
  hp: number;
  maxHp: number;
  guard: number;
  mana: number;
  cinders: number;
  corruption: number;
  demonTurns: number;
  spent: boolean;
  deck: CardId[];
  draw: CardInstance[];
  hand: CardInstance[];
  discard: CardInstance[];
  units: Unit[];
  enemies: Enemy[];
  focus: number;
  nextId: number;
  events: GameEvent[];
  history: Action[];
  rewards: CardId[];
  potion: boolean;
};
export type Action =
  | {type:"shop-buy";kind:"card"|"relic";index:number}
  | {type:"shop-upgrade";index:number}
  | {type:"shop-remove";index:number}
  | {type:"shop-reroll";kind:ShopRerollKind}
  | {type:"leave-shop"}
  | { type: "play"; uid: number; target?: number; dismiss?: number; unit?: number; sacrifice?: number }
  | { type: "item"; item: ItemId }
  | { type: "end" }
  | { type: "focus"; target: number }
  | { type: "reward"; card: CardId | null }
  | { type: "continue" }
  | { type: "camp" }
  | { type: "potion" };
const emit = (
  s: State,
  type: string,
  message: string,
  extra: Partial<GameEvent> = {},
) =>
  s.events.push({
    type,
    message,
    ...extra,
    view: structuredClone({
      hp: s.hp,
      guard: s.guard,
      mana: s.mana,
      corpses:s.corpses,
      cinders: s.cinders,
      corruption: s.corruption,
      demonTurns: s.demonTurns,
      units: s.units,
      enemies: s.enemies,
      hand: s.hand,
      draw: s.draw,
      discard: s.discard,
    }),
  });
const alive = (s: State) => s.enemies.filter((e) => e.hp > 0);
function random(s: State) {
  s.rng = (Math.imul(s.rng, 1664525) + 1013904223) >>> 0;
  return s.rng / 4294967296;
}
function shuffle<T>(s: State, a: T[]) {
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(random(s) * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}
function draw(s: State, n: number) {
  for (let i = 0; i < n; i++) {
    if (!s.draw.length) s.draw = shuffle(s, s.discard.splice(0));
    const c = s.draw.pop();
    if (c) s.hand.push(c);
  }
}
function cinders(s: State, n: number) {
  s.cinders = Math.min(20, s.cinders + n);
}
function loseHp(s: State, n: number, playerTurn: boolean) {
  if (n <= 0 || s.hp <= 0) return;
  const amount = Math.min(n, s.hp);
  s.hp -= amount;
  if (playerTurn && s.hero!=="runeblade") cinders(s, 1);
  emit(s, "hurt", `${s.hero==='runeblade'?'Runeblade':'Warlock'} loses ${amount} HP.`, { amount });
  if (s.hp === 0) {
    gainCorpse(s);
    s.phase = "lost";
    finishLegionBattle(s);
    emit(s, "defeat", "The Pit claims its price.");
  } else if (playerTurn && s.powers["infernal-pact"]) {
    for (const e of alive(s)) hitEnemy(s, e, s.powers["infernal-pact"]!);
  }
}
function gainCorpse(s:State) {
 if(s.hero!=='runeblade')return;
 s.corpses++;
 emit(s,'corpse','A death adds 1 Corpse.',{amount:1});
}
function chill(s:State,e:Enemy,n:number) {
 if(e.hp<=0 || n<=0)return;
 e.chill=(e.chill||0)+n;
 const threshold=10+((e.boss || (currentRealm(s)==='forest' && forestEliteRooms.includes(s.room-encounters.length)))?10*(e.freezeCount||0):0);
 if(!e.frozen && e.chill>=threshold){e.frozen=true;e.chill=0;e.freezeCount=(e.freezeCount||0)+1;}
 emit(s,'chill',`${e.name} gains ${n} Chill${e.frozen?' and is Frozen':''}.`,{target:e.id,amount:n});
}
function hitEnemy(s: State, e: Enemy, n: number, attack = false, cause?: GameEvent["cause"]) {
  if (attack && e.exposed) n = Math.floor(n * 1.5);
  if (e.hp <= 0) return;
  const blocked = Math.min(e.guard, n);
  e.guard -= blocked;
  const amount = Math.min(e.hp, n - blocked);
  e.hp -= amount;
  emit(s, "damage", `${e.name} takes ${amount} damage.`, {
    target: e.id,
    amount,
    ...(cause ? { cause } : {}),
  });
  if (e.boss && e.hp > 0 && e.hp <= e.maxHp / 2 && e.bossPhase !== 2) {
    e.bossPhase = 2;
    e.guard += 8;
    emit(s, "boss-phase", e.boss === "forest-sovereign" ? "The heartwood awakens: the Forest Sovereign gains 8 Guard and +2 attack damage." : "The crown erupts: Vhalzor gains 8 Guard and his damaging spells gain +2 damage.", { actor: e.id });
  }
  if (e.hp === 0) {
    gainCorpse(s);
    cinders(s, Math.floor(e.scorch / 2));
    emit(s, "kill", `${e.name} falls.`, { target: e.id });
  }
}
function scorch(s: State, e: Enemy, n: number) {
  if (e.hp > 0) {
    e.scorch += n;
    emit(s, "scorch", `${e.name} gains ${n} Scorch.`, {
      target: e.id,
      amount: n,
    });
  }
}
/** Seeded weighted draw without replacement; no card is guaranteed or excluded by affinity. */
export function rollRewards(s: State): CardId[] {
  const pool = [...cardsForHero(s.hero)].filter(id => cards[id].rarity !== "Basic" && eligibleCardReward(s,id) && (!s.shops || canAddCard(s,id)));
  const result: CardId[] = [];
  while (result.length < 3 && pool.length) {
    let ticket = random(s) * pool.reduce((total, id) => total + rewardWeight(s.starterDeck, id), 0);
    let index = pool.length - 1;
    for (let i = 0; i < pool.length; i++) { ticket -= rewardWeight(s.starterDeck, pool[i]); if (ticket < 0) { index = i; break; } }
    result.push(pool.splice(index, 1)[0]);
  }
  return result;
}
function checkWin(s: State) {
  const fallenLord = s.enemies.find(e => e.boss && e.hp <= 0);
  if (s.phase === "combat" && fallenLord) for (const add of alive(s).filter(e => e.summonedBy === fallenLord.id)) {
    add.hp = 0;
    gainCorpse(s);
    emit(s, "kill", add.art === 'sovereign-root' ? `${add.name} withers as its master falls.` : `${add.name} vanishes as its master's bond breaks.`, { target: add.id });
  }
  if (s.phase === "combat") for (let i = 0; i < s.enemies.length && s.reserves.length; i++) {
    const fallen = s.enemies[i];
    if (fallen.hp > 0) continue;
    const replacement = s.reserves.shift()!;
    s.enemies[i] = replacement;
    if (s.focus === fallen.id) s.focus = replacement.id;
    emit(s, "reserve", `${replacement.name} steps out of reserve.`, { target: fallen.id, actor: replacement.id });
  }
  if (s.phase === "combat" && !alive(s).length) {
    if(s.hero==='runeblade'&&s.runebladeRules===2){const survivors=s.units.filter(u=>u.hp>0);s.corpses+=survivors.length;s.units=[];if(survivors.length)emit(s,'corpse-conversion',`${survivors.length} surviving summons return as Corpses.`,{amount:survivors.length});}
    finishLegionBattle(s);
    const forest = currentRealm(s) === "forest";
    const final = s.rulesVersion === 2 ? s.room === 7 : isRealmBoss(s);
    s.phase = final ? (s.rulesVersion === 2 ? "won" : "loot") : "reward";
    const gold = forest ? (final ? 200 : forestEliteRooms.includes(s.room-encounters.length) ? 90 : 45+(s.room-encounters.length)*4) : 25 + s.room * 10;
    s.gold += gold;
    const drops: ItemId[] = ["mana-potion", "barkskin-tonic", "shrapnel-jar", "banner-draught", "bonesetters-salve", "warhorn-oil", "healing-draught", "healing-draught", "demon-lord-crown"];
    const relicPool=relicsForHero(s.hero);
    const item:ItemId|undefined = forest ? (final || forestEliteRooms.includes(s.room-encounters.length) ? relicPool.find(id=>!s.relics.includes(id)) || "healing-draught" : (s.room-encounters.length)%3===2 ? "healing-draught" : undefined) : s.hero==='runeblade' && final ? relicPool.find(id=>!s.relics.includes(id)) || 'healing-draught' : drops[s.room];
    if (item && items[item].passive) { if (!s.relics.includes(item)) s.relics.push(item); }
    else if(item) s.inventory.push(item);
    s.pendingLoot = s.rulesVersion === 3 ? { gold, items: item ? [item] : [], final } : null;
    emit(s, "loot", `Found ${gold} Gold${item ? ` and ${items[item].name}` : ""}.`);
    s.rewards = final ? [] : s.rulesVersion === 3 ? rollRewards(s) : s.starterDeck === "classic" && s.room < 2 ? [...rewardSets[s.room]] : shuffle(s, [...legacyImplemented].filter(id => cards[id].rarity !== "Basic")).slice(0, 3);
    if(s.hero!=='runeblade'&&usesSummonRules(s)&&s.room===encounters.length-1){s.rewards=shuffle(s,[...archCards].filter(id=>!s.shops||canAddCard(s,id))).slice(0,3);s.phase='reward';}
    emit(s, "victory", final ? (forest ? "The Living Orchard falls. Claim your spoils, then visit the final Woodland Exchange." : "The Infernal Sovereign falls. Claim his crown.") : "The path is yours. Choose a card.");
  }
}
/** A rank belongs to one recruit. Removal deposits it once; a later summon consumes it once. */
function bankLegionRank(s:State,u:Unit){
 if(s.legionRules!==2||!isLegionKind(u.kind)||(u.promotionRank||0)<=0)return;
 s.legionRanks??={};const bank=s.legionRanks[u.kind]??=[];bank.push(u.promotionRank!);bank.sort((a,b)=>b-a);
}
function finishLegionBattle(s:State){
 if(s.legionRules!==2||s.hero==='runeblade')return;
 for(const u of s.units)bankLegionRank(s,u);
 const count=s.units.length;s.units=[];
 if(count)emit(s,'warband-return','The warband returns to the Pit. Earned soldier ranks await their next summoning.',{amount:count});
}
export function canBloodAscend(s:State,beneficiary?:number,victim?:number){
 if(beneficiary===undefined)return legion(s).length>0&&s.units.filter(u=>u.hp>0).length>=2;
 const soldier=s.units.find(u=>u.id===beneficiary&&u.hp>0&&isLegionKind(u.kind));
 return !!soldier&&(victim===undefined?s.units.some(u=>u.id!==beneficiary&&u.hp>0):s.units.some(u=>u.id===victim&&u.id!==beneficiary&&u.hp>0));
}
function killUnit(s: State, u: Unit, dismissed=false) {
  if(!s.units.some(v=>v.id===u.id))return;
  bankLegionRank(s,u);
  if(s.hero==='runeblade' && dismissed){s.units=s.units.filter(v=>v.id!==u.id);emit(s,'dismiss',`${u.name} is dismissed. No Corpse is created.`,{actor:u.id,unit:structuredClone(u)});return;}
  gainCorpse(s);
  if(s.hero==='runeblade'&&s.relics.includes('gravewardens-bell'))s.hp=Math.min(s.maxHp,s.hp+2);
  const rebirth=!dismissed&&hasArch(s,'pyre-colossus');
  s.units = s.units.filter(v=>v.id!==u.id);
  if(s.hero!=='runeblade')s.corruption=Math.min(10,s.corruption+2);
  const resilience=s.powers['demonic-resilience']||0;
  if(resilience){gainGuard(s,resilience);cinders(s,2);}
  emit(s,'unit-death',`${u.name} falls.${s.hero==='runeblade'?'':' Gain 2 Corruption.'}`,{actor:u.id,unit:structuredClone(u)});
  if(rebirth&&random(s)<.5&&s.units.length<warbandCapacity(s))summon(s,'pyre-warden');
}
export const unitPower=(s:State,u:Unit)=>['gloomstalker','nightmaw','pyre-warden','pyre-colossus'].includes(u.kind)?0:u.power+(u.kind==='ash-pikeman'?2*s.units.filter(v=>v.kind==='ash-pikeman'&&v.id!==u.id&&v.hp>0).length:0)+(isHound(u)?2*s.units.filter(v=>isHound(v)&&v.id!==u.id).length:0)+(s.demonTurns>0?2:0)+(hasArch(s,'gorthak')?2:0);
export const unitScorch=(s:State,u:Unit)=>(u.kind==='maledictor'?2:u.kind==='imp'||u.kind==='ignivar'?1+(hasArch(s,'ignivar')?4:0):u.kind==='pyre-warden'?1:u.kind==='pyre-colossus'?2:0)+(['gloomstalker','nightmaw','pyre-warden','pyre-colossus'].includes(u.kind)?0:(s.powers['dread-aura']||0));
function promote(s:State,u:Unit,ranks=1){
 if(!isLegionKind(u.kind)||u.hp<=0)return;
 u.promotionRank=(u.promotionRank||0)+ranks;u.armor=(u.armor||0)+ranks;
 u.power+=2*ranks;u.maxHp+=2*ranks;u.hp+=2*ranks;
 emit(s,'promotion',`${u.name} reaches rank ${u.promotionRank}: +${2*ranks} Power, +${2*ranks} maximum HP, +${ranks} Armor.`,{actor:u.id,target:u.id,amount:ranks,unit:structuredClone(u)});
}
const legion=(s:State)=>s.units.filter(u=>isLegionKind(u.kind)&&u.hp>0);
const canHellgate=(s:State)=>s.units.filter(u=>u.kind==='maledictor'&&u.hp>0).length>=3&&s.hellgateTurn!==s.turn;
function openHellgate(s:State){
 if(!canHellgate(s))return;
 s.hellgateTurn=s.turn;
 emit(s,'hellgate','Three Maledictors open the Hellgate!',{targets:alive(s).map(e=>e.id),amount:6});
 for(const enemy of alive(s)){hitEnemy(s,enemy,6);scorch(s,enemy,2);}
 for(const soldier of legion(s))promote(s,soldier);
}
function unitAct(s:State,u:Unit){
 if(!s.units.some(v=>v.id===u.id))return;
 const e=alive(s).find(e=>e.id===s.focus)||alive(s)[0];if(!e)return;
 emit(s,'muster',`${u.name} acts.`,{actor:u.id,target:e.id,targets:((u.kind==='pit-brute'&&usesSummonRules(s))||['gorthak','hollow-saint','pyre-warden','pyre-colossus','dread-vanguard'].includes(u.kind)?alive(s):[e]).map(v=>v.id)});
 if(u.kind==='gloomstalker'||u.kind==='nightmaw'){
  if(u.kind==='nightmaw'||(u.actionCount||0)%2===0)e.sapped=(e.sapped||0)+2;
  if(u.kind==='nightmaw'||(u.actionCount||0)%2)e.exposed=(e.exposed||0)+2;
  u.actionCount=(u.actionCount||0)+1;emit(s,'passive',`${u.name} curses ${e.name}.`,{actor:u.id,target:e.id});return;
 }
 if(u.kind==='pyre-warden'||u.kind==='pyre-colossus'){for(const enemy of alive(s))scorch(s,enemy,u.kind==='pyre-warden'?1:2);return;}
 const damage=unitPower(s,u);
 if(u.kind in runebladeSummons){
  if(u.kind==='shattered-queen') {for(const enemy of alive(s)){hitEnemy(s,enemy,damage,true);chill(s,enemy,1);}}
  else {hitEnemy(s,e,damage,true);if(u.kind==='rune-revenant')hitEnemy(s,e,damage,true);if(u.kind==='frost-thrall')chill(s,e,1);if(u.kind==='rime-seer')chill(s,e,3);}
  if(u.rot!==undefined){const rot=u.rot;u.hp=Math.max(0,u.hp-rot);u.rot++;emit(s,'rot',`${u.name} loses ${rot} HP to Rot.`,{target:u.id,amount:rot});if(u.hp===0)killUnit(s,u);}

 return;
 }
 const targets=(u.kind==='pit-brute'&&usesSummonRules(s))||u.kind==='gorthak'||u.kind==='hollow-saint'||u.kind==='dread-vanguard'?alive(s):[e];
 let drained=0;
 for(const target of targets){const before=target.hp;hitEnemy(s,target,damage,true);drained+=before-target.hp;
  if(u.kind==='maledictor')scorch(s,target,2);
  if(u.kind==='dread-vanguard'&&before>0&&target.hp===0&&u.promotedOnTurn!==s.turn){u.promotedOnTurn=s.turn;promote(s,u);}
  if(s.powers['dread-aura'])scorch(s,target,s.powers['dread-aura']!);
  if(u.kind==='imp'||u.kind==='ignivar')scorch(s,target,1+(hasArch(s,'ignivar')&&damage>0?4:0));
 }
 if(u.kind==='soul-leech'||u.kind==='hollow-saint'){const healed=Math.min(s.maxHp-s.hp,drained);s.hp+=healed;emit(s,'heal',`${u.name} restores ${healed} HP.`,{actor:u.id,amount:healed});}
}
function summon(s:State,kind:DemonKind,dismiss?:number,upgraded=false,level=0){
 if(hasArch(s,'gorthak')&&!isArchDemon(kind)&&!isLegionKind(kind))kind='pit-brute';
 if(isArchDemon(kind)&&s.units.some(u=>u.kind===kind))throw Error('Only one living copy of each Archdemon is allowed.');
 if(s.units.length>=warbandCapacity(s)){const unit=s.units.find(u=>u.id===dismiss);if(!unit)throw Error('Choose a demon to dismiss: your Warband is full.');killUnit(s,unit,true);}
 const stats=kind in legacyRunebladeSummons&&s.runebladeRules!==2?legacyRunebladeSummons[kind as ThrallKind]:demonStats[kind];const u:Unit={...stats,maxHp:stats.hp,kind,id:s.nextId++,guard:0};
 if(kind==='pit-brute'&&!usesSummonRules(s))u.power=10;
 if(level){u.power=Math.round(u.power*cardPower(level));u.hp=Math.round(u.hp*cardPower(level));u.maxHp=u.hp;}
 if(upgraded){if(kind==='imp'||kind==='soul-leech')u.power+=2;else if(isArchDemon(kind)){u.power=Math.round(u.power*1.2);u.hp=Math.round(u.hp*1.2);u.maxHp=u.hp;}}
 if(isLegionKind(kind)){u.promotionRank=s.legionRules===2?(s.legionRanks?.[kind]?.shift()??0):0;u.armor=u.promotionRank;u.legionBaseHp=u.maxHp;u.legionBasePower=u.power;u.power+=2*u.promotionRank;u.maxHp+=2*u.promotionRank;u.hp=u.maxHp;}
 if(kind in runebladeSummons){u.rot=1;u.power+=s.powers['unholy-vigor']||0;if(s.relics.includes('suture-standard')){u.power++;u.hp+=4;u.maxHp+=4;}}
 u.power+=(s.powers['masters-of-the-pit']||0)+(s.relics.includes('warband-fang')?2:0);
 u.upkeep=Math.max(0,u.upkeep-(s.powers['burning-soul']||0));s.units.push(u);
 emit(s,'summon',`${u.name} joins the Warband.`,{actor:u.id,unit:structuredClone(u)});
 if(kind==='pyre-warden'||kind==='pyre-colossus')gainGuard(s,6);
 if(kind==='nightmaw'){s.mana++;draw(s,1);emit(s,'passive','Nightmaw grants 1 Mana and 1 card.',{actor:u.id});}
 if(kind==='imp')unitAct(s,u);
}
function empower(s:State,u:Unit,level:number){
 const kind=archForms[u.kind];if(!kind||s.units.some(v=>v.kind===kind))throw Error('Choose a lesser demon whose Arch-form is not already alive.');
 const stats=demonStats[kind],old=demonStats[u.kind],fraction=u.hp/u.maxHp;
 const maxHp=Math.round(stats.hp*cardPower(level))+Math.max(0,u.maxHp-old.hp);
 Object.assign(u,stats,{kind,maxHp,hp:Math.max(1,Math.ceil(maxHp*fraction)),power:Math.round(stats.power*cardPower(level))+u.power-old.power,guard:u.guard,elusive:'elusive' in stats?stats.elusive:false});
 emit(s,'transform',`${u.name} is empowered.`,{actor:u.id,unit:structuredClone(u)});
 if(kind==='pyre-colossus')gainGuard(s,6);
 if(kind==='nightmaw'){s.mana++;draw(s,1);emit(s,'passive','Nightmaw grants 1 Mana and 1 card.',{actor:u.id});}
}
function summonBossDemons(s: State, boss: Enemy) {
  if (boss.boss === "forest-sovereign") {
    const count = Math.min(2 - alive(s).filter(e=>e.summonedBy===boss.id).length, 4-(boss.summonsMade||0));
    for(let i=0;i<count;i++){
      const add:Enemy={...structuredClone(sovereignRoot),id:s.nextId++,maxHp:sovereignRoot.hp,guard:0,scorch:0,summonedBy:boss.id};
      const slot=s.enemies.findIndex(e=>e.summonedBy===boss.id&&e.hp<=0);
      if(slot>=0)s.enemies[slot]=add;else s.enemies.push(add);
      boss.summonsMade=(boss.summonsMade||0)+1;
      emit(s,"enemy-summon",`${boss.name} raises a Living Root.`,{actor:add.id,target:boss.id,spell:"rootwake"});
    }
    return;
  }
  const free = 2 - alive(s).filter(e => e.summonedBy === boss.id).length;
  const count = Math.min(free, 4 - (boss.summonsMade || 0));
  for (let i = 0; i < count; i++) {
    const hound = (boss.summonsMade || 0) % 2 === 1;
    const hp = hound ? 20 : 12;
    const add: Enemy = { id: s.nextId++, name: hound ? "Royal Hellhound" : "Crownfire Imp", art: hound ? "boss-hellhound" : "boss-imp", hp, maxHp: hp, guard: 0, scorch: 0, summonedBy: boss.id, moves: [{ name: hound ? "Infernal jaws" : "Imp firebolt", damage: hound ? 5 : 3, targeting: hound ? "front" : "hero" }] };
    const deadSlot = s.enemies.findIndex(e => e.summonedBy === boss.id && e.hp <= 0);
    if (deadSlot < 0) s.enemies.push(add); else s.enemies[deadSlot] = add;
    boss.summonsMade = (boss.summonsMade || 0) + 1;
    emit(s, "enemy-summon", `${boss.name} summons ${add.name}.`, { actor: add.id, target: boss.id });
  }
}
export const usesPersistentMonsterShields = (s:State) => s.monsterShieldRulesFrom !== undefined && s.history.length >= s.monsterShieldRulesFrom;
export function intent(s: State, e: Enemy) {
  let move = e.moves[(s.turn - 1) % e.moves.length];
  if (move.kind === "summon" && ((e.summonsMade || 0) >= 4 || alive(s).filter(add => add.summonedBy === e.id).length >= 2)) move = e.boss === "forest-sovereign" ? {name:"Ancient Fist",damage:11,targeting:"front"} : { name: "Crownfire Bolt", damage: 8, targeting: "front" };
  if (e.bossPhase === 2 && move.damage > 0) move = { ...move, name: `Enraged ${move.name}`, damage: move.damage + 2 };
  if (move.kind === "shield" && usesPersistentMonsterShields(s)) {
    const guard = Math.round(e.maxHp / 2);
    move = { ...move, guard, name: move.name.replace(/\d+ Guard/g, `${guard} Guard`) };
  }
  if(e.frozen)return {...move,name:'Frozen - skips action',damage:0,kind:undefined};
  move={...move,damage:Math.max(0,move.damage-(e.chill||0))};
  return e.sapped ? { ...move, damage: Math.floor(move.damage * .75) } : move;
}
export function resolveTargets(
  s: State,
  targeting: Targeting,
): (Unit | "hero")[] {
  const all=[...s.units].reverse();
  const front=usesSummonRules(s)&&all.some(u=>!u.elusive)?all.filter(u=>!u.elusive):all;
  if (targeting === "sweep") return ["hero", ...all];
  if (targeting === "front") return [front[0] || "hero"];
  if (targeting === "hero") return s.units.filter(u=>u.kind==='iron-legionary'&&u.hp>0).length>=2 ? ["hero"] : [front.find((u) => u.defender) || "hero"];
  if (targeting === "weakest")
    return [[...front].sort((a, b) => a.hp - b.hp)[0] || "hero"];
  if (targeting === "random_ally")
    return [
      ["hero" as const, ...front][Math.floor(random(s) * (front.length + 1))],
    ];
  return ["hero"];
}
function startTurn(s: State) {
  s.turn++;
  s.guard = 0;
  s.barrier = 0;
  s.mana = 3;
  if(s.relics.includes("icebound-phylactery"))gainGuard(s,4);
  if(s.powers["permafrost-aura"])for(const e of alive(s))chill(s,e,s.powers["permafrost-aura"]!);
  if(s.relics.includes("iron-sigil")) gainGuard(s,3);
  if(s.relics.includes("cinder-charm")) cinders(s,1);
  s.focus = alive(s)[0]?.id ?? 0;
  for (const u of s.units) { u.guard = 0; u.power -= u.temporaryPower || 0; u.temporaryPower = 0; }
  if (s.corruption >= 10 && s.demonTurns === 0) {
    s.demonTurns = 3;
    emit(
      s,
      "ascend",
      "Demon Form: +3 attack damage; attacks apply 2 Scorch; demons gain +2 Power.",
    );
  }
  for (const u of [...s.units].reverse()) {
    const paid = Math.min(s.cinders, u.upkeep);
    s.cinders -= paid;
    if (paid) emit(s, "upkeep", `${u.name} spends ${paid} Cinder.`);
    if (paid < u.upkeep) loseHp(s, u.upkeep - paid, true);
    if (s.phase === "lost") return;
    checkWin(s);
    if (s.phase !== "combat") return;
  }
  for(const u of [...s.units]){
    if(u.kind==='pyre-warden'||u.kind==='pyre-colossus')gainGuard(s,6);
    if(u.kind==='nightmaw'){s.mana++;draw(s,1);emit(s,'passive','Nightmaw grants 1 Mana and 1 card.',{actor:u.id});}
    if((u.kind==='ignivar'||u.kind==='cerberax')&&s.units.length<warbandCapacity(s))summon(s,u.kind==='ignivar'?'imp':'hellhound');
  }
  checkWin(s);if(s.phase!=='combat')return;
  for(const bulwark of legion(s).filter(u=>u.kind==='ironhorn-bulwark')){for(const soldier of legion(s))soldier.guard+=3;emit(s,'guard',`${bulwark.name} grants the Legion 3 Guard.`,{actor:bulwark.id,amount:3,targets:legion(s).map(u=>u.id)});}
  if (s.powers.pyroclasm) for (const e of alive(s)) scorch(s, e, s.powers.pyroclasm);
  draw(s, s.spent ? 4 : 5);
  s.spent = false;
  emit(s, "turn", `Turn ${s.turn}. Your move.`);
}
function beginCombat(s: State) {
  s.phase = "combat";
  s.turn = 0;
  s.guard = 0;
  s.cinders = s.hero==='runeblade'?0:3;
  if(s.hero==='runeblade'&&s.relics.includes('gravekeepers-seal'))s.corpses++;
  if(s.hero==='runeblade'&&s.relics.includes('gravebound-sigil'))s.corpses+=2;
  s.corruption = 0;
  s.demonTurns = 0;
  s.spent = false;
  s.powers = {};
  s.barrier = 0;
  s.hellgateTurn=undefined;
  s.units = s.legionRules===2 ? [] : s.units.filter(u=>isLegionKind(u.kind)&&u.hp>0).map(u=>({...u,guard:0,power:(u.legionBasePower??legionSummons[u.kind as keyof typeof legionSummons].power)+2*(u.promotionRank||0)+(s.relics.includes('warband-fang')?2:0),maxHp:(u.legionBaseHp??legionSummons[u.kind as keyof typeof legionSummons].hp)+2*(u.promotionRank||0),temporaryPower:0,promotedOnTurn:undefined}));
  s.hand = [];
  s.discard = [];
  s.enemies = activeEncounter(s).enemies.map((e) => ({
    ...structuredClone(e),
    ...(e.boss ? { bossPhase: 1 as const, summonsMade: 0 } : {}),
    id: s.nextId++,
    maxHp: e.hp,
    guard: 0,
    scorch: 0,
  }));
  s.reserves = (activeEncounter(s).reserves || []).map(e => ({ ...structuredClone(e), id: s.nextId++, maxHp: e.hp, guard: 0, scorch: 0 }));
  s.draw = shuffle(
    s,
    s.deck.map((id,index) => ({ id, uid: s.nextId++, ...(s.shops ? {level:cardLevel(s,index)} : {}) })),
  );
  startTurn(s);
  if(s.relics.includes("crown-of-rime"))for(const e of alive(s))chill(s,e,3);
  if(s.relics.includes("ember-heart")) s.hp=Math.min(s.maxHp,s.hp+5);
  if(s.relics.includes("scholar-seal")) draw(s,1);
  if (s.relics.includes("demon-lord-crown")) { gainGuard(s,5); s.mana += 1; }
}
export function newRun(seed = 7319, starterDeck: StarterDeckId = "classic", rulesVersion: 2 | 3 = 3, summonRulesFrom:number|undefined=undefined,runebladeRules:1|2=2,legionRules:1|2=1): State {
  if (starterDeck !== "classic" && starterDeck !== "pact" && !starterDecks.some(d => d.id === starterDeck)) throw Error("Unknown starter deck.");
  const s: State = {
    version: 1, legionRules, summonRulesFrom, runebladeRules:heroForDeck(starterDeck)==='runeblade'?runebladeRules:undefined, hero:heroForDeck(starterDeck),corpses:0,
    rulesVersion, legacyActions: null, pendingLoot: null, relics: heroForDeck(starterDeck)==='runeblade'&&runebladeRules===2?['gravekeepers-seal']:[],
    starterDeck, gold: 0, inventory: [], reserves: [], powers: {}, barrier: 0,
    seed: seed >>> 0,
    rng: seed >>> 0,
    room: 0,
    phase: "combat",
    turn: 0,
    hp: heroForDeck(starterDeck)==='runeblade'?80:72,
    maxHp: heroForDeck(starterDeck)==='runeblade'?80:72,
    guard: 0,
    mana: 3,
    cinders: 3,
    corruption: 0,
    demonTurns: 0,
    spent: false,
    deck: [...((heroForDeck(starterDeck)==='runeblade'&&runebladeRules===1?legacyRunebladeDecks:(summonRulesFrom===0||starterDeck==='hellbound'||heroForDeck(starterDeck)==='runeblade'?[...starterDecks,...modernWarlockDecks.filter(d=>d.id==='pact')]:legacyStarterDecks)).find(d => d.id === starterDeck)?.cards || starter)],
    draw: [],
    hand: [],
    discard: [],
    units: [],
    enemies: [],
    focus: 0,
    nextId: 1,
    events: [],
    history: [],
    rewards: [],
    potion: true,
  };
  if(legionRules!==2&&starterDeck==='hellbound')s.deck=s.deck.map(id=>id==='blood-ascension'?'field-promotion':id);
  beginCombat(s);
  return s;
}
/** New roguelike saves opt into shops; schemas 1–3 replay the historical demo unchanged. */
export function newRoguelikeRun(seed=7319,starterDeck:StarterDeckId='warband',monsterShieldRulesFrom=0,summonRulesFrom:number|undefined=0,runebladeRules:1|2=2,legionRules:1|2=2):State {
 const s=newRun(seed,starterDeck,3,summonRulesFrom,runebladeRules,legionRules);s.forestBossVersion=2;s.monsterShieldRulesFrom=monsterShieldRulesFrom;s.shops={current:null,stock:{}};s.deckLevels=s.deck.map(()=>0);
 if(starterDeck==='classic'){s.deck[3]='neutral-strike';s.deck[7]='neutral-bulwark';}
 // Recreate the opening battle from the original RNG position, with leveled card instances.
 s.rng=s.seed;s.nextId=1;s.events=[];s.corpses=0;beginCombat(s);return s;
}
function advanceAfterLoot(s:State){
 if(s.room===encounterCount(s)-1){s.phase='won';return;}
 if(s.shops&&s.room===encounters.length-1)emit(s,'realm','Thornroot Forest opens. Your cards, upgrades, relics and supplies travel with you.');
 if([1,3,5,7].includes(s.room))s.phase='camp';
 else{s.room++;beginCombat(s);}
}
function shopAction(s:State,action:Action):boolean {
 if(action.type==='leave-shop'){
  if(s.phase!=='shop'||!s.shops)throw Error('No shop here.');
  s.shops.current=null;advanceAfterLoot(s);
 } else if(action.type==="shop-reroll") {rerollShop(s,action.kind);
 } else if(action.type==="shop-buy"||action.type==="shop-upgrade"||action.type==="shop-remove") {
  if(s.phase!=="shop"||!s.shops)throw Error("Visit a shop first.");
  if(!Number.isInteger(action.index)||action.index<0)throw Error("Invalid selection.");
  prepareShop(s);
  if(action.type==="shop-buy") {
   const stock=currentShop(s)!;
   if(action.kind!=="card"&&action.kind!=="relic")throw Error("Invalid stock type.");
   if(action.kind==="card") {
    const item=stock.cards[action.index];if(!item||item.sold)throw Error("Sold out.");
    if(!canAddCard(s,item.id))throw Error("Card copy limit reached.");
    if(s.gold<item.price)throw Error("Not enough Gold.");
    s.gold-=item.price;item.sold=true;s.deck.push(item.id);s.deckLevels!.push(0);refreshRemovalOffers(s);
   }else{
    const item=stock.relics[action.index];if(!item||item.sold)throw Error("Sold out.");
    if(s.relics.includes(item.id))throw Error("You already own this relic.");
    if(s.gold<item.price)throw Error("Not enough Gold.");
    s.gold-=item.price;item.sold=true;s.relics.push(item.id);
   }
  }else{
   if(!s.deck[action.index])throw Error("Choose a card in your deck.");
   if(action.type==="shop-remove") {
    if(s.deck.length<=10)throw Error("Your deck must contain at least 10 cards.");
    const offered=s.shops.stock[s.shops.current!].removals.find(o=>o.index===action.index&&!o.sold&&o.id===s.deck[action.index]);
    if(!offered)throw Error('That copy is not offered for removal.');
    if(s.gold<10)throw Error("Not enough Gold.");
    s.gold-=10;s.deck.splice(action.index,1);s.deckLevels!.splice(action.index,1);remapShopCopies(s,action.index);
   }else{
    const offered=s.shops.stock[s.shops.current!].upgrades.find(o=>o.index===action.index&&!o.sold&&o.id===s.deck[action.index]);
    if(!offered)throw Error('That copy is not offered for upgrade.');
    const price=upgradeCost(cardLevel(s,action.index));
    if(!Number.isSafeInteger(price)||s.gold<price)throw Error("Not enough Gold.");
    s.gold-=price;s.deckLevels![action.index]++;if(offered)offered.sold=true;
   }
  }
 }else return false;
 return true;
}
export function manaCost(s: State, c: CardInstance) {
  if (cards[c.id].xCost) return s.mana;
  if ((c.id === "empower-demon" || c.id === "summon-pyre-warden") && c.upgraded) return 1;
  if (c.id === "rend-flesh" && s.demonTurns > 0) return 0;
  if (c.id === "infernal-transformation" && c.upgraded) return 1;
  return Math.max(cards[c.id].cost > 0 ? 1 : 0, cards[c.id].cost - Math.floor((c.level || 0)/3));
}
export const cinderCost=(c:CardInstance)=>c.id==='summon-gloomstalker'&&c.upgraded?1:cards[c.id].cinders;
export function cardPayment(s:State,c:CardInstance):{resource:'mana'|'corpses';amount:number} {
 const amount=manaCost(s,c);
 return {resource:s.hero==='runeblade' && c.id.startsWith('summon-') && s.corpses>=amount?'corpses':'mana',amount};
}
export function playable(s: State, c: CardInstance) {
  return (
    s.phase === "combat" &&
    (!['muster-legion','pike-detail'].includes(c.id)||s.units.length<=warbandCapacity(s)-2) &&
    (!legionTargetCards.includes(c.id)||legion(s).length>0) &&
    (c.id!=='hellgate-rite'||canHellgate(s)) &&
    (c.id!=='blood-ascension'||canBloodAscend(s)) &&
    s[cardPayment(s,c).resource] >= cardPayment(s,c).amount &&
    (!cardTargetsUnit(c.id) || s.units.length > 0) &&
    s.cinders >= cinderCost(c) &&
    (c.id!=='empower-demon'||s.units.some(u=>archForms[u.kind]&&!s.units.some(v=>v.kind===archForms[u.kind]))) &&
    (!archCards.includes(c.id as typeof archCards[number])||!s.units.some(u=>`summon-${u.kind}`===c.id))
  );
}
export function dispatch(previous: State, action: Action): State {
  const s = structuredClone(previous);
  s.events = [];
  if(shopAction(s,action)) { s.history.push(action); return s; }
  if (action.type === "focus") {
    if (s.phase !== "combat" || !alive(s).some((e) => e.id === action.target))
      throw Error("Choose a living enemy.");
    s.focus = action.target;
  } else if (action.type === "item") {
    if (items[action.item]?.passive) throw Error("Relics are passive and cannot be consumed.");
    const at = s.inventory.indexOf(action.item);
    if (s.phase !== "combat" || at < 0) throw Error("No such item available.");
    s.inventory.splice(at, 1);
    switch(action.item) {
      case "healing-draught": s.hp = Math.min(s.maxHp, s.hp + Math.floor(s.maxHp * .2)); break;
      case "mana-potion": s.mana += 2; break;
      case "barkskin-tonic": gainGuard(s,12); break;
      case "shrapnel-jar": for (const e of alive(s)) hitEnemy(s, e, 10); break;
      case "banner-draught": gainGuard(s,8); for(const u of s.units) u.guard += 8; break;
      case "bonesetters-salve": for(const u of s.units) u.hp = Math.min(u.maxHp, u.hp + 10); break;
      case "warhorn-oil": for(const u of s.units) u.power += 3; break;
    }
    emit(s, "item", `${items[action.item].name} used.`);
    checkWin(s);
  } else if (action.type === "potion") {
    if (s.phase !== "combat" || !s.potion) throw Error("No potion available.");
    const heal = Math.floor(s.maxHp * 0.2);
    s.hp = Math.min(s.maxHp, s.hp + heal);
    s.potion = false;
    emit(s, "heal", `Healing Draught restores up to ${heal} HP.`);
  } else if (action.type === "reward") {
    if (
      s.phase !== "reward" ||
      (action.card !== null && !s.rewards.includes(action.card))
    )
      throw Error("Invalid reward.");
    if (action.card) { if(s.shops && !canAddCard(s,action.card)) throw Error("Card copy limit reached."); s.deck.push(action.card); s.deckLevels?.push(0); }
    s.rewards = [];
    if (s.rulesVersion === 3) s.phase = "loot";
    else if (s.room === 1 || s.room === 3 || s.room === 5) s.phase = "camp";
    else {
      s.room++;
      beginCombat(s);
    }
  } else if (action.type === "continue") {
    if (s.phase !== "loot" || !s.pendingLoot) throw Error("There is no loot to acknowledge.");
    const final = s.pendingLoot.final;
    s.pendingLoot = null;
    if (s.shops && (s.room+1)%3===0) enterRoguelikeShop(s);
    else if (final) s.phase = "won";
    else if ([1, 3, 5, 7].includes(s.room)) s.phase = "camp";
    else { s.room++; beginCombat(s); }
  } else if (action.type === "camp") {
    if (s.phase !== "camp") throw Error("No rest site here.");
    s.hp = Math.min(s.maxHp, s.hp + Math.floor(s.maxHp * (s.room === 1 ? 0.3 : 0.5)));
    s.room++;
    beginCombat(s);
  } else if (action.type === "play") {
    const c = s.hand.find((c) => c.uid === action.uid);
    if (!c || !playable(s, c)) throw Error("You cannot play that card.");
    const livingEnemies = alive(s);
    // Untargeted cards must remain playable after the focused enemy dies.
    // An explicitly selected target still needs to be alive.
    const e = action.target === undefined
      ? livingEnemies.find((enemy) => enemy.id === s.focus) ?? livingEnemies[0]
      : livingEnemies.find((enemy) => enemy.id === action.target);
    if (!e) throw Error("Choose a living target.");
    if (
      c.id.startsWith("summon-") &&
      s.units.length >= warbandCapacity(s) &&
      !s.units.some((u) => u.id === action.dismiss)
    )
      throw Error("Choose a demon to dismiss: your Warband is full.");
    const unit = action.unit === undefined ? s.units.at(-1) : s.units.find(u => u.id === action.unit);
    if (cardTargetsUnit(c.id) && !unit) throw Error("Choose a living demon.");
    if(c.id==='empower-demon'&&(!archForms[unit!.kind]||s.units.some(v=>v.kind===archForms[unit!.kind])))throw Error('Choose a lesser demon whose Arch-form is not already alive.');
    if(legionTargetCards.includes(c.id)&&(!unit||!isLegionKind(unit.kind)))throw Error('Choose a living Legion soldier.');
    if(c.id==='blood-ascension'&&(action.unit===undefined||!unit||action.sacrifice===undefined||!canBloodAscend(s,unit.id,action.sacrifice)))throw Error('Choose a soldier and another living summon to sacrifice.');
    const x = s.mana;
    const upgraded = !!c.upgraded;
    const value = (base: number, improved: number) => c.level ? Math.max(base+c.level, Math.round(base*cardPower(c.level))) : upgraded ? improved : base;
    const corruption = (n: number) => { s.corruption = Math.min(10, s.corruption + n); };
    const pact = (n: number) => { loseHp(s, n, true); if(s.phase !== "lost") corruption(n); return s.phase !== "lost"; };
    const payment=cardPayment(s,c);s[payment.resource]-=payment.amount;
    s.cinders -= cinderCost(c);
    s.hand = s.hand.filter((x) => x.uid !== c.uid);
    if (cards[c.id].type !== "Power" && c.id !== "infernal-transformation" && c.id !== "glacier-wall") s.discard.push(c);
    s.focus = e.id;
    emit(s, "card", cards[c.id].name, { target: e.id });
    const damage = (amount: number, target = e) => {
      hitEnemy(s, target, amount + (s.demonTurns > 0 ? 3 : 0) + (s.relics.includes("blood-ruby") ? 1 : 0)+(s.relics.includes("hoarfrost-whetstone")&&cards[c.id].type==='Attack'?2:0), true);
      if (s.demonTurns > 0) scorch(s, target, 2);
      if(amount>0&&hasArch(s,'ignivar')&&['firebolt','immolate','smoldering-brand','searing-lash','conflagrate','chain-of-flame','infernal-whip','burning-hatred','hellfire','fire-and-brimstone','combust'].includes(c.id))scorch(s,target,4);
    };
    const rb=(old:number,current:number)=>s.runebladeRules===2?current:old;
    const heavy=(n:number,target=e)=>{const frozen=target.frozen;damage(n*(frozen?3:1),target);if(frozen){target.frozen=false;target.chill=0;emit(s,'shatter',`${target.name} shatters.`,{target:target.id});}};
    switch (c.id) {
      case 'summon-iron-legionary':case 'summon-ash-pikeman':case 'summon-ironhorn-bulwark':case 'summon-maledictor':case 'summon-dread-vanguard':summon(s,c.id.slice(7) as DemonKind,action.dismiss,false,c.level||(upgraded?1:0));break;
      case 'muster-legion':case 'pike-detail':for(let i=0;i<2;i++)summon(s,c.id==='muster-legion'?'iron-legionary':'ash-pikeman',undefined,false,c.level||(upgraded?1:0));break;
      case 'field-promotion':promote(s,unit!);break;
      case 'blood-ascension':{const victim=s.units.find(u=>u.id===action.sacrifice)!;killUnit(s,victim);if(s.units.some(u=>u.id===unit!.id)&&unit!.hp>0)promote(s,unit!,3);break;}
      case 'battlefield-commission':promote(s,unit!,2);unit!.hp=Math.min(unit!.maxHp,unit!.hp+value(6,8));break;
      case 'rally-legion':for(const u of legion(s)){u.hp=Math.min(u.maxHp,u.hp+value(5,7));u.guard+=value(5,7);}break;
      case 'infernal-logistics':draw(s,value(2,3));if(legion(s).length>=2)cinders(s,value(2,3));break;
      case 'hold-the-line':gainGuard(s,value(8,11));for(const u of legion(s))u.guard+=value(5,7);break;
      case 'hellgate-rite':openHellgate(s);draw(s,value(2,3));break;
      case 'veteran-command':{const twice=(unit!.promotionRank||0)>0;unitAct(s,unit!);if(twice)unitAct(s,unit!);break;}
      case 'summon-frost-thrall':case 'summon-shattered-queen':case 'summon-rime-seer':case 'summon-rune-revenant':case 'summon-bone-defender':summon(s,c.id.slice(7) as ThrallKind,action.dismiss,false,c.level || (upgraded?1:0));break;
      case 'exhume':{const n=value(2,3);s.corpses+=n;emit(s,'corpse-generation',`Exhume creates ${n} Corpses.`,{amount:n});break;}
      case 'mass-exhumation':{const n=value(4,5);s.corpses+=n;emit(s,'corpse-generation',`Mass Exhumation creates ${n} Corpses.`,{amount:n});break;}
      case 'hew':damage(value(rb(6,8),9));break;
      case 'brace':s.guard+=value(rb(5,6),8);break;
      case 'frostbite':heavy(value(rb(8,10),10));chill(s,e,value(3,4));break;
      case 'rimecleave':for(const enemy of alive(s)){damage(value(rb(5,6),7),enemy);chill(s,enemy,1);}break;
      case 'glacial-ward':s.guard+=value(8,11);draw(s,1);break;
      case 'frozen-grasp':chill(s,e,value(3,5));break;
      case 'command-the-dead':for(const u of [...s.units].reverse()){if(upgraded||c.level){const n=value(2,2);u.power+=n;u.temporaryPower=(u.temporaryPower||0)+n;}unitAct(s,u);}break;
      case 'bone-ward':s.guard+=value(rb(4,5),6)*Math.max(1,s.units.length);break;
      case 'hoarfrost-edge':for(let i=0;i<2;i++){damage(value(4,6));chill(s,e,1);}break;
      case 'unholy-vigor':s.powers[c.id]=(s.powers[c.id]||0)+value(2,3);for(const u of s.units)u.power+=value(2,3);break;
      case 'frost-nova':for(const enemy of alive(s))chill(s,enemy,value(4,6));s.guard+=value(6,8);break;
      case 'soulfrost-blade':damage(value(6,8)+value(2,3)*(e.chill||0));break;
      case 'dark-tithe':killUnit(s,unit!);s.mana+=2;draw(s,value(1,2));break;
      case 'rally-the-fallen':for(const u of s.units){u.hp=Math.min(u.maxHp,u.hp+value(rb(6,8),9));u.rot=0;}break;
      case 'sweeping-hew':for(const enemy of alive(s))heavy(value(rb(10,12),14),enemy);break;
      case 'permafrost-aura':s.powers[c.id]=(s.powers[c.id]||0)+value(2,3);break;
      case 'glacier-wall':s.guard+=value(30,40);break;

      case 'empower-demon':empower(s,unit!,c.level||0);break;
      case 'summon-gloomstalker':case 'summon-soul-leech':case 'summon-pyre-warden':case 'summon-ignivar':case 'summon-cerberax':case 'summon-nightmaw':case 'summon-hollow-saint':case 'summon-pyre-colossus':case 'summon-gorthak':summon(s,c.id.slice(7) as DemonKind,action.dismiss,upgraded,c.level);break;
      case "neutral-strike": damage(value(8,10)); break;
      case "neutral-bulwark": gainGuard(s,value(13,16)); break;
      case "neutral-insight": draw(s,value(2,3)); gainGuard(s,value(3,4)); break;
      case "neutral-renewal": s.hp=Math.min(s.maxHp,s.hp+value(6,8));gainGuard(s,value(6,8)); break;
      case "firebolt":
        damage(value(6, 9));
        break;
      case "ward-of-ash":
        gainGuard(s,value(5, 8));
        break;
      case "summon-imp":
        summon(s, "imp", action.dismiss, upgraded, c.level);
        break;
      case "blood-pact":
        loseHp(s, 3, true);
        if (s.phase !== "lost") {
          s.corruption = Math.min(10, s.corruption + 3);
          s.mana++;
          cinders(s, value(2, 3));
        }
        break;
      case "feed-the-pit":
        loseHp(s, 2, true);
        if (s.phase !== "lost") {
          s.corruption = Math.min(10, s.corruption + 2);
          cinders(s, value(3, 5));
        }
        break;
      case "immolate":
        damage(value(4, 5));
        scorch(s, e, value(4, 6));
        break;
      case "smoldering-brand":
        damage(value(3, 4));
        scorch(s, e, value(3, 5));
        break;
      case "searing-lash": {
        const burning = e.scorch > 0;
        damage(value(9, 12));
        if (burning) cinders(s, 1);
        break;
      }
      case "summon-hellhound":
        summon(s, "hellhound", action.dismiss, false, c.level);
        if(upgraded) s.units.at(-1)!.guard += 6;
        break;
      case "summon-pit-brute":
        summon(s, "pit-brute", action.dismiss, false, c.level);
        if(upgraded) { s.units.at(-1)!.hp += 10; s.units.at(-1)!.maxHp += 10; }
        break;
      case "kindle":
        cinders(s, value(4, 6));
        draw(s, 1);
        break;
      case "sinister-veil":
        gainGuard(s,value(8, 11));
        for (const u of s.units) u.guard += value(3, 4);
        break;
      case "ashen-ward":
        gainGuard(s,value(7, 9));
        for (const target of alive(s)) scorch(s, target, value(2, 3));
        break;
      case "conflagrate":
        for (const target of alive(s)) {
          damage(value(8, 10), target);
          scorch(s, target, value(2, 3));
        }
        break;
      case "hellish-command":
        if(upgraded || c.level) { const boost=c.level ? Math.max(1,Math.round(unit!.power*(cardPower(c.level)-1))) : 2; unit!.power += boost; unit!.temporaryPower = (unit!.temporaryPower || 0) + boost; }
        unitAct(s, unit!); break;
      case "ritual-cut": if(pact(2)) damage(value(13, 17)); break;
      case "chain-of-flame": {
        const copied = e.scorch;
        damage(value(5, 8));
        const others = alive(s).filter(other => other.id !== e.id);
        if(others.length) scorch(s, others[Math.floor(random(s) * others.length)], copied);
        break;
      }
      case "dark-bargain": if(pact(upgraded ? 3 : 4)) draw(s, c.level ? value(3,3) : 3); break;
      case "fiendish-feast": {
        const healing = Math.floor(unit!.hp / 2);
        killUnit(s, unit!); s.hp = Math.min(s.maxHp, s.hp + healing); cinders(s, value(3, 5)); break;
      }
      case "infernal-whip":
        damage(value(7, 10));
        for(const demon of [...s.units]) { emit(s, "muster", `${demon.name} lashes out.`, { actor: demon.id, target: e.id }); hitEnemy(s, e, value(3, 4), true); }
        break;
      case "burning-hatred": damage(value(15, 20)); corruption(2); break;
      case "cinder-shield": gainGuard(s,value(7, 9) * (s.cinders >= 5 ? 2 : 1)); break;
      case "smoke-and-mirrors":
        for(const enemy of alive(s)) enemy.sapped = (enemy.sapped || 0) + value(1, 2);
        for(const demon of s.units) demon.guard += value(3,3); break;
      case "hellfire":
        for(let hit=0; hit<2; hit++) for(const enemy of alive(s)) { damage(value(6, 8), enemy); scorch(s, enemy, 1); } break;
      case "infernal-pact": s.powers[c.id] = (s.powers[c.id] || 0) + value(5, 7); break;
      case "masters-of-the-pit":
        s.powers[c.id] = (s.powers[c.id] || 0) + value(2, 3);
        for(const demon of s.units) demon.power += value(2, 3); break;
      case "burning-soul":
        s.powers[c.id] = (s.powers[c.id] || 0) + value(1,1);
        for(const demon of s.units) demon.upkeep = Math.max(0, demon.upkeep - value(1,1));
        if(upgraded) cinders(s, 3); break;
      case "demonic-resilience": s.powers[c.id] = (s.powers[c.id] || 0) + value(6, 8); break;
      case "sacrificial-rite": killUnit(s, unit!); s.mana += 2; draw(s, value(2, 3)); break;
      case "corrupting-touch": corruption(3); e.exposed = (e.exposed || 0) + value(2, 3); break;
      case "fire-and-brimstone": damage(value(10, 14)); scorch(s, e, e.scorch); break;
      case "ember-storm": for(const enemy of alive(s)) scorch(s, enemy, value(3, 4) * x); break;
      case "unholy-frenzy": if(pact(upgraded ? 2 : 3)) for(const demon of [...s.units].reverse()) { const power=demon.power; if(c.level)demon.power=Math.round(power*cardPower(c.level));unitAct(s,demon);demon.power=power; } break;
      case "pyroclasm": s.powers[c.id] = (s.powers[c.id] || 0) + value(3, 4); break;
      case "shadowflame-barrier": gainGuard(s,value(12, 16)); s.barrier += value(3,3); break;
      case "void-gaze": e.sapped = (e.sapped || 0) + value(2, 3); corruption(2); draw(s, 1); break;
      case "rend-flesh": damage(value(10, 13)); if(s.demonTurns) damage(value(10, 13)); break;
      case "combust": { const burn = e.scorch; e.scorch = 0; damage(c.level ? Math.max(burn * 2 + c.level, Math.round(burn * 2 * cardPower(c.level))) * (burn > 0 ? 1 : 0) : burn * value(2, 3)); break; }
      case "blood-price": if(pact(2)) { damage(value(6, 8)); damage(value(6, 8)); if(e.hp <= 0) corruption(4); } break;
      case "wreathed-in-flame": gainGuard(s,value(5, 8) + Math.floor(alive(s).reduce((sum, enemy) => sum + enemy.scorch, 0) / 2)); break;
      case "dread-aura": s.powers[c.id] = (s.powers[c.id] || 0) + value(1, 2); break;
      case "feast-of-embers": unit!.hp = Math.min(unit!.maxHp, unit!.hp + value(8, 12)); unit!.power += value(3, 4); break;
      case "abyssal-gaze": corruption(2); draw(s, value(1, 2)); break;
      case "infernal-transformation": s.demonTurns = value(3,3); emit(s, "ascend", "The pact is sealed: Demon Form."); break;
    }
    emit(s,'card-resolved',`${cards[c.id].name} resolves.`);
    checkWin(s);
  } else if (action.type === "end") {
    if (s.phase !== "combat") throw Error("Combat has ended.");
    if (s.demonTurns > 0) {
      loseHp(s, 3, true);
      checkWin(s);
      if (s.phase !== "combat") {
        s.history.push(action);
        return s;
      }
    }
    s.discard.push(...s.hand.splice(0));
    for (const u of [...s.units].reverse()) {
      unitAct(s, u);
      checkWin(s);
      if (s.phase !== "combat") break;
    }
    if(s.phase==='combat'){openHellgate(s);checkWin(s);}
    if (s.phase === "combat")
      for (const e of alive(s)) {
        if(e.frozen){e.frozen=false;e.chill=0;emit(s,'frozen',`${e.name} skips its action.`,{actor:e.id});if(e.scorch>0){const burn=e.scorch;hitEnemy(s,e,burn,false,'scorch');if(e.hp>0)e.scorch=Math.floor(burn/2);}checkWin(s);if(s.phase!=='combat')break;continue;}
        const m = intent(s, e);
        if (e.hp <= 0) continue;
        const targets = m.kind ? [] : resolveTargets(s, m.targeting);
        emit(
          s,
          "enemy",
          `${e.name}: ${m.name} · ${m.damage} → ${m.targeting}.`,
          {
            actor: e.id,
            amount: m.damage,
            spell: m.spell,
            targets: targets.map((t) => (t === "hero" ? "hero" : t.id)),
          },
        );
        if (m.kind === "shield") { e.guard = usesPersistentMonsterShields(s) ? e.guard + (m.guard || 0) : Math.min(24, e.guard + (m.guard || 0)); emit(s, "enemy-shield", `${e.name} raises a protective barrier.`, { actor: e.id, amount: m.guard }); }
        if (m.kind === "summon") summonBossDemons(s, e);
        const allocated=new Map<number,number>();
        const bodyguards=s.units.filter(u=>u.kind==='iron-legionary'&&u.hp>0);
        const intercept=targets.includes('hero')&&bodyguards.length>=2;
        if(intercept){for(const [i,u]of bodyguards.entries())allocated.set(u.id,Math.floor(m.damage/bodyguards.length)+(i<m.damage%bodyguards.length?1:0));emit(s,'bodyguard','The Iron Legionaries intercept the Warlock’s damage.',{targets:bodyguards.map(u=>u.id),amount:m.damage});}
        const sharing=hasArch(s,'cerberax')?s.units.filter(isHound):[];
        for(const target of targets){if(target==='hero')continue;const recipients=sharing.length&&isHound(target)?[target,...sharing.filter(u=>u.id!==target.id)]:[target];for(const [i,u] of recipients.entries())allocated.set(u.id,(allocated.get(u.id)||0)+Math.floor(m.damage/recipients.length)+(i<m.damage%recipients.length?1:0));}
        for (const target of targets) {
          if (target === "hero" && !intercept) {
            const blocked = Math.min(s.guard, m.damage);
            s.guard -= blocked;
            loseHp(s, m.damage - blocked, false);
          } else {
            // Unit damage is applied below from the simultaneous allocation.
          }
        }
        const deadUnits:Unit[]=[];
        for(const [id,incoming] of allocated){const target=s.units.find(u=>u.id===id);if(!target)continue;const armored=Math.max(0,incoming-(target.armor||0));const blocked=Math.min(target.guard,armored);target.guard-=blocked;const amount=Math.min(target.hp,armored-blocked);target.hp-=amount;emit(s,'unit-hit',`${target.name} takes ${amount} damage.`,{target:id,amount});if(!target.hp)deadUnits.push(target);}
        for(const unit of deadUnits)killUnit(s,unit);
        if (targets.includes("hero") && s.barrier) scorch(s, e, s.barrier);
        emit(s, "enemy-impact", `${e.name}'s attack lands.`, {
          actor: e.id,
          amount: m.damage,
            spell: m.spell,
          targets: targets.map((t) => (t === "hero" ? "hero" : t.id)),
        });
        if (s.hp === 0) break;
        if (e.scorch > 0) {
          const burn = e.scorch;
          hitEnemy(s, e, burn, false, "scorch");
          if (e.hp > 0) e.scorch = Math.floor(burn / 2);
        }
        e.sapped = Math.max(0, (e.sapped || 0) - 1);
        e.exposed = Math.max(0, (e.exposed || 0) - 1);
        checkWin(s);
        if (s.phase !== "combat") break;
      }
    if (s.demonTurns > 0) {
      s.demonTurns--;
      if (s.demonTurns === 0) {
        s.corruption = 0;
        s.spent = true;
      }
    }
    if (s.phase === "combat") startTurn(s);
  }
  s.history.push(action);
  return s;
}
function migrateLegacy(s: State, prefix: number): State {
  s.rulesVersion = 3;
  s.legacyActions = prefix;
  if (s.phase === "reward") s.pendingLoot = { gold: 25 + s.room * 10, items: s.inventory.length ? [s.inventory[s.inventory.length - 1]] : [], final: false };
  // A completed eight-room save can continue to the new throne without rerolling its history.
  if (s.phase === "won" && s.room === 7) {
    s.phase = "loot";
    s.pendingLoot = { gold: 0, items: [], final: false };
  }
  return s;
}
export function replay(seed: number, actions: Action[], starterDeck: StarterDeckId = "classic", legacyActions: number | null = null,runebladeRules:1|2=1,legionRules:1|2=1): State {
  let s = newRun(seed, starterDeck, legacyActions === null ? 3 : 2, undefined, runebladeRules,legionRules);
  for (let i = 0; i < actions.length; i++) {
    if (i === legacyActions) s = migrateLegacy(s, legacyActions);
    s = dispatch(s, actions[i]);
  }
  if (legacyActions === actions.length) s = migrateLegacy(s, legacyActions);
  return s;
}
export const save = (s: State) => JSON.stringify({ legionRules:s.legionRules??1, schema: s.shops ? 8 : 3, runebladeRules:s.runebladeRules??1, forestBossVersion:s.forestBossVersion??1, ...(s.shops ? {shops:true,summonRulesFrom:s.summonRulesFrom ?? s.history.length} : {}), ...(s.shops ? {monsterShieldRulesFrom:s.monsterShieldRulesFrom ?? s.history.length} : {}), seed: s.seed, starterDeck: s.starterDeck, legacyActions: s.legacyActions, actions: s.history });
export function restore(raw: string): State {
  const data = JSON.parse(raw);
  if(data.legionRules!==undefined&&data.legionRules!==1&&data.legionRules!==2)throw Error('Unsupported Legion rules.');
  if (![1, 2, 3, 6, 7, 8].includes(data.schema) || !Number.isInteger(data.seed) || !Array.isArray(data.actions) || data.actions.length > 10000) throw Error("Unsupported save.");
  if(data.schema===8){
    if(data.shops&&(!Number.isInteger(data.monsterShieldRulesFrom)||data.monsterShieldRulesFrom<0||data.monsterShieldRulesFrom>data.actions.length))throw Error('Unsupported shield history.');
    if(!Number.isInteger(data.summonRulesFrom)||data.summonRulesFrom<0||data.summonRulesFrom>data.actions.length)throw Error('Unsupported summon history.');
    let s=data.shops?newRoguelikeRun(data.seed,data.starterDeck,data.monsterShieldRulesFrom,data.summonRulesFrom,data.runebladeRules===2?2:1,data.legionRules===2?2:1):newRun(data.seed,data.starterDeck,3,data.summonRulesFrom,data.runebladeRules===2?2:1,data.legionRules===2?2:1);
    s.forestBossVersion=data.forestBossVersion===2?2:1;
    for(const action of data.actions)s=dispatch(s,action);return s;
  }
  if(data.schema===6||data.schema===7) {
    const shieldPrefix=data.schema===6?data.actions.length:data.monsterShieldRulesFrom;
    if(!Number.isInteger(shieldPrefix)||shieldPrefix<0||shieldPrefix>data.actions.length)throw Error("Unsupported shield history.");
    let s=newRoguelikeRun(data.seed,data.starterDeck,shieldPrefix,data.actions.length,1,1);
    s.forestBossVersion=data.forestBossVersion===2?2:1;
    for(const action of data.actions)s=dispatch(s,action);
    return s;
  }
  const legacyActions = data.schema < 3 ? data.actions.length : data.legacyActions ?? null;
  if (legacyActions !== null && (!Number.isInteger(legacyActions) || legacyActions < 0 || legacyActions > data.actions.length)) throw Error("Unsupported save history.");
  return replay(data.seed, data.actions, data.schema === 1 ? "classic" : data.starterDeck, legacyActions,data.runebladeRules===2?2:1,data.legionRules===2?2:1);
}
