import { cards, items, encounters, heroForDeck, modernWarlockDecks, starterDecks, runebladeSummons, isLegionKind, type CardId, type ItemId, type StarterDeckId, type EnemyDefinition } from '../../../packages/content/index';
import { newRoguelikeRun, dispatch, routeChoices, activeEncounter, currentRealm, realmStartRoom, encounterCount, enterRoguelikeShop, demonStats, knownSummons, type State, type Unit, type Enemy, type DemonKind, type RealmId } from '../../../packages/engine/index';
import { forestEncounters, forestSovereignEncounter } from '../../../packages/engine/forest';
import { frozenWastesEncounters } from '../../../packages/engine/frozenWastes';

export type DebugRoomKind = 'combat'|'elite'|'boss'|'shop'|'treasure'|'camp'|'route-choice';
export type DebugResource = 'hp'|'maxHp'|'gold'|'mana'|'guard'|'cinders'|'corpses'|'corruption'|'turn';
export type DebugAction =
 | {type:'navigate';realm:RealmId;encounter:number;kind:DebugRoomKind}
 | {type:'step';delta:-1|1} | {type:'restart'}
 | {type:'new-run';deck:StarterDeckId;seed:number}
 | {type:'spawn-summon';kind:DemonKind;count?:number}
 | {type:'spawn-enemy';template:string;count?:number}
 | {type:'add-card';card:CardId;zone:'hand'|'draw'|'discard'|'deck';level?:number;count?:number}
 | {type:'resources';values:Partial<Record<DebugResource,number>>}
 | {type:'grant-item'|'remove-item';item:ItemId;count?:number}
 | {type:'clear';target:'units'|'enemies'|'hand'}
 | {type:'heal'} | {type:'refill'} | {type:'win'} | {type:'end-turn'}
 | {type:'set-training';kind:DemonKind;level:0|1|2}
 | {type:'remove-unit'|'remove-enemy';id:number}
 | {type:'edit-unit';id:number;values:Partial<Pick<Unit,'hp'|'maxHp'|'guard'|'power'|'rot'>>}
 | {type:'edit-enemy';id:number;values:Partial<Pick<Enemy,'hp'|'maxHp'|'guard'|'chill'|'scorch'|'sapped'|'exposed'>>};

const biomeEncounters = { infernal:encounters, forest:forestEncounters.map((e,i)=>i===forestEncounters.length-1?forestSovereignEncounter:e), 'frozen-wastes':frozenWastesEncounters };
export const debugRealms = (Object.keys(biomeEncounters) as RealmId[]).map(id=>({id,name:id==='forest'?'Thornroot Forest':id==='infernal'?'Infernal':'Frozen Wastes',encounters:biomeEncounters[id].map((e,index)=>({number:index+1,name:e.name}))}));
export const debugCards = Object.values(cards).map(card=>({...card,implemented:true as const}));
export const debugItems = Object.entries(items).map(([id,item])=>({id:id as ItemId,...item}));
export const debugSummons = (Object.keys(demonStats) as DemonKind[]).map(id=>({id,...demonStats[id]}));
export const debugDecks = [{id:'classic' as StarterDeckId,name:'Classic',hero:heroForDeck('classic')},...[...starterDecks,...modernWarlockDecks].filter((d,i,all)=>all.findIndex(x=>x.id===d.id)===i).map(({id,name})=>({id,name,hero:heroForDeck(id)}))];
export const debugEnemies = (Object.keys(biomeEncounters) as RealmId[]).flatMap(realm=>biomeEncounters[realm].flatMap((encounter,index)=>[...encounter.enemies,...(encounter.reserves??[])].map((template,slot)=>({id:`${realm}:${index+1}:${slot}`,name:template.name,realm,encounter:index+1,art:template.art,template:structuredClone(template)}))));

const bound = (value:number,min=0,max=999999) => { if(!Number.isFinite(value))throw Error('Enter a finite number.');return Math.min(max,Math.max(min,Math.trunc(value))); };
const count = (value=1)=>bound(value,1,100);
const combatOnly = (s:State)=>{if(s.phase!=='combat')throw Error('Open a combat encounter first.');};
const focus = (s:State)=>{if(!s.enemies.some(e=>e.id===s.focus&&e.hp>0))s.focus=s.enemies.find(e=>e.hp>0)?.id??0;};
const nextId = (s:State)=>{s.nextId=Math.max(s.nextId,1,...[...s.units,...s.enemies,...s.reserves].map(u=>u.id+1),...[...s.hand,...s.draw,...s.discard].map(c=>c.uid+1));return s.nextId++;};
const makeEnemy = (s:State,template:EnemyDefinition):Enemy=>({...structuredClone(template),id:nextId(s),maxHp:template.hp,guard:0,scorch:0,...(template.boss?{bossPhase:1 as const,summonsMade:0}:{})});

function navigate(original:State,realm:RealmId,encounter:number,kind:DebugRoomKind):State {
  const start=realmStartRoom(original,realm);
  if(start<0)throw Error('This biome is unavailable in this run. Start a new debug run.');
  const size=biomeEncounters[realm].length;
  const local=kind==='boss'?size:bound(encounter,1,size),room=start+local-1;
  let s=original;
  s.hp=Math.max(1,s.hp);s.pendingLoot=null;s.rewards=[];s.events=[];s.units=[];s.enemies=[];s.reserves=[];s.focus=0;
  if(s.shops)s.shops.current=null;
  s.room=room-1;s.phase='route-choice';
  if(kind==='route-choice')return s; // Route choices describe this selected upcoming room.
  // Engine's public choose-room action invokes its private beginCombat and all start hooks.
  const opening=routeChoices(s).find(c=>c.kind==='combat'||c.kind==='boss');
  if(!opening)throw Error('No encounter can be opened here.');
  const history=s.history;
  s=dispatch(s,{type:'choose-room',id:opening.id});s.history=history;
  const actualKind=kind==='combat'&&local===size?'boss':kind;
  s.roomKinds??={};s.roomKinds[room]=actualKind;
  if(actualKind==='elite'){
    const scaled=activeEncounter(s);
    s.enemies=s.enemies.map((e,i)=>({...e,...structuredClone(scaled.enemies[i]),hp:scaled.enemies[i].hp,maxHp:scaled.enemies[i].hp}));
    s.reserves=s.reserves.map((e,i)=>({...e,...structuredClone(scaled.reserves![i]),hp:scaled.reserves![i].hp,maxHp:scaled.reserves![i].hp}));
  }
  if(kind==='shop'||kind==='camp'||kind==='treasure'){
    s.units=[];s.enemies=[];s.reserves=[];s.hand=[];s.draw=[];s.discard=[];s.focus=0;s.phase=kind;
    if(kind==='shop')enterRoguelikeShop(s);
  }
  focus(s);return s;
}

/** Sandbox snapshots only: debug operations deliberately do not form replayable save history. */
export function applyDebugAction(previous:State|null,action:DebugAction):State {
  if(action.type==='new-run'){
    if(!debugDecks.some(d=>d.id===action.deck))throw Error('Unknown starter deck.');
    return newRoguelikeRun(bound(action.seed,0,0xffffffff),action.deck);
  }
  if(!previous)throw Error('Start a debug run first.');
  let s=structuredClone(previous);s.events=[];
  if(action.type==='navigate')return navigate(s,action.realm,action.encounter,action.kind);
  if(action.type==='step'||action.type==='restart'){
    const current=s.phase==='route-choice'?s.room+1:s.room;
    const room=bound(current+(action.type==='step'?action.delta:0),0,encounterCount(s)-1);
    const realm=currentRealm({...s,room});
    return navigate(s,realm,room-realmStartRoom(s,realm)+1,action.type==='restart'&&(s.roomKinds?.[room]==='elite')?'elite':'combat');
  }
  if(action.type==='spawn-summon'){
    combatOnly(s);if(!(action.kind in demonStats))throw Error('Unknown summon.');
    const amount=count(action.count);if(s.units.length+amount>30)throw Error('Debug battles support at most 30 summons.');
    for(let i=0;i<amount;i++){
      const stats=demonStats[action.kind];const unit:Unit={...stats,id:nextId(s),kind:action.kind,maxHp:stats.hp,guard:0,order:'attack',readyTurn:s.turn};
      if(action.kind in runebladeSummons)unit.rot=1;
      if(isLegionKind(action.kind))Object.assign(unit,{promotionRank:0,armor:0,legionBaseHp:stats.hp,legionBasePower:stats.power});
      s.units.push(unit);
    }
    s.acquiredSummons=Array.from(new Set([...(s.acquiredSummons??[]),action.kind]));
  }else if(action.type==='spawn-enemy'){
    combatOnly(s);const source=debugEnemies.find(e=>e.id===action.template);if(!source)throw Error('Unknown enemy template.');
    const amount=count(action.count);if(s.enemies.length+amount>30)throw Error('Debug battles support at most 30 enemies.');
    for(let i=0;i<amount;i++)s.enemies.push(makeEnemy(s,source.template));
  }else if(action.type==='add-card'){
    if(!cards[action.card])throw Error('Unknown implemented card.');const level=bound(action.level??0,0,99);
    if(action.zone!=='deck')combatOnly(s);
    for(let i=0;i<count(action.count);i++){
      if(action.zone==='deck'){s.deckLevels??=s.deck.map(()=>0);s.deck.push(action.card);s.deckLevels.push(level);}
      else s[action.zone].push({id:action.card,uid:nextId(s),level});
    }
    s.acquiredSummons=knownSummons(s);
  }else if(action.type==='resources'){
    const limits:Record<DebugResource,[number,number]>={hp:[0,999999],maxHp:[1,999999],gold:[0,999999],mana:[0,999],guard:[0,999999],cinders:[0,20],corpses:[0,999],corruption:[0,10],turn:[1,9999]};
    for(const [key,value] of Object.entries(action.values)){if(!(key in limits))throw Error('Unknown resource.');const k=key as DebugResource;s[k]=bound(value!,...limits[k]);}
    s.hp=Math.min(s.hp,s.maxHp);if(s.hp===0)s.phase='lost';
  }else if(action.type==='grant-item'||action.type==='remove-item'){
    const item=items[action.item];if(!item)throw Error('Unknown item.');const list=item.passive||item.category==='relic'?s.relics:s.inventory;
    if(action.type==='grant-item'){if(list===s.relics){if(!list.includes(action.item))list.push(action.item);}else for(let i=0;i<count(action.count);i++)list.push(action.item);}
    else for(let i=0;i<count(action.count);i++){const index=list.indexOf(action.item);if(index>=0)list.splice(index,1);}
  }else if(action.type==='clear'){
    s[action.target]=[];if(action.target==='enemies')s.reserves=[];
  }else if(action.type==='heal'){s.hp=s.maxHp;for(const u of s.units)u.hp=u.maxHp;}
  else if(action.type==='refill'){s.mana=3;s.cinders=20;s.corpses=20;s.potion=true;}
  else if(action.type==='set-training'){
    if(!(action.kind in demonStats)||![0,1,2].includes(action.level))throw Error('Choose a valid summon and training level.');
    s.trainingLevels??={};s.trainingLevels[action.kind]=action.level;s.acquiredSummons=Array.from(new Set([...(s.acquiredSummons??[]),action.kind]));
    for(const unit of s.units.filter(u=>u.kind===action.kind)){unit.order='attack';unit.orderTarget=undefined;}
  }else if(action.type==='remove-unit')s.units=s.units.filter(u=>u.id!==action.id);
  else if(action.type==='remove-enemy'){s.enemies=s.enemies.filter(e=>e.id!==action.id);s.reserves=s.reserves.filter(e=>e.id!==action.id);}
  else if(action.type==='edit-unit'||action.type==='edit-enemy'){
    const unit=action.type==='edit-unit'?s.units.find(u=>u.id===action.id):s.enemies.find(e=>e.id===action.id);
    if(!unit)throw Error('That combatant no longer exists.');
    for(const [key,value] of Object.entries(action.values)){const min=key==='maxHp'?1:0;(unit as unknown as Record<string,number>)[key]=bound(value!,min);}
    unit.hp=Math.min(unit.hp,unit.maxHp);
  }else if(action.type==='end-turn'){
    combatOnly(s);const history=s.history;s=dispatch(s,{type:'end'});s.history=history;
  }else if(action.type==='win'){
    combatOnly(s);s.reserves=[];for(const enemy of s.enemies)enemy.hp=0;
    // A harmless engine item action runs the real victory/reward/loot hooks.
    const oldMana=s.mana,history=s.history,inventory=[...s.inventory];s.inventory.push('mana-potion');
    s=dispatch(s,{type:'item',item:'mana-potion'});s.mana=oldMana;s.history=history;s.inventory=inventory;
  }
  focus(s);return s;
}
