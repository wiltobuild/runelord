import type {State,RealmId} from './index';
import {currentRealm,realmStartRoom,realmEncounterCount,encounterCount} from './index';
import {stableHash} from './expansion';
export type RoomKind='combat'|'elite'|'shop'|'camp'|'treasure'|'mystery'|'boss';
export type RoomChoice={id:string;kind:RoomKind;name:string;description:string};
const names:Record<RoomKind,string>={combat:'Battle',elite:'Elite Battle',shop:'Merchant',camp:'Camp',treasure:'Treasure',mystery:'Uncharted Path',boss:'Sovereign'};
export function routeChoices(s:State):RoomChoice[]{
 if(s.expansionVersion!==2||s.phase!=='route-choice')return [];const room=s.room+1;if(room>=encounterCount(s))return [];
 const next={...s,room},local=room-realmStartRoom(next,currentRealm(next)),last=local===realmEncounterCount(next)-1;
 const make=(kind:RoomKind,i:number)=>({id:`room-${room}-${i}`,kind,name:names[kind],description:kind==='mystery'?'Usually treasure; may reveal another ordinary encounter.':kind==='camp'?'Choose rest, a card upgrade, or summon training.':kind==='shop'?'Buy supplies, improve cards, and train summons.':kind==='elite'?'A harder battle with a relic reward.':kind==='treasure'?'Choose a relic, Gold, or summon training.':kind==='boss'?'Defeat this biome’s Sovereign.':'Defeat monsters and choose a card reward.'});
 if(last)return [make('boss',0)];if(local===0)return [make('combat',0)];
 const hash=stableHash(s.seed,`choices:${room}`),support:RoomKind=local%3===2?'camp':local%3===0?'shop':'mystery',third:RoomKind[]=['mystery','mystery','elite','treasure'].filter(kind=>kind!==support) as RoomKind[];
 return [make('combat',0),make(support,1),make(third[hash%third.length],2)];
}
export function resolveRoomKind(s:State,choice:RoomChoice):RoomKind{if(choice.kind!=='mystery')return choice.kind;const n=stableHash(s.seed,`${choice.id}:mystery`)%100;return n<65?'treasure':n<75?'camp':n<85?'shop':n<95?'combat':'elite';}
export const selectedRoomKind=(s:State):RoomKind=>s.roomKinds?.[s.room]??'combat';
