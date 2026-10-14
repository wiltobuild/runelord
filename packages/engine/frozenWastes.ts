import type {EnemyDefinition,Move,Encounter} from '../content/index';
export const FROZEN_WASTES_ENEMY_IDS=['rimejaw-scavenger','shardstep-skitterer','whiteout-ray','coffinback-bastion','hollowmask-oracle','shardlance-stalker','hoarveil-crone','iceclamp-bombardier','paleveil-moth','cairnfrost-ursine','dragon-frost-mammoth','dragon-rime-antler','rime-hauler','avalanche-colossus'] as const;
type IceId=typeof FROZEN_WASTES_ENEMY_IDS[number];
const attack=(name:string,damage:number,targeting:Move['targeting']='front'):Move=>({name,damage,targeting});
const shield=(name:string,guard:number):Move=>({name,damage:0,targeting:'front',kind:'shield',guard});
const kits:Record<IceId,{name:string;moves:Move[]}>= {
 'rimejaw-scavenger':{name:'Rimejaw Scavenger',moves:[attack('Rime bite',10),attack('Scrabbling claws',8,'weakest'),shield('Snow burrow',10)]},
 'shardstep-skitterer':{name:'Shardstep Skitterer',moves:[attack('Shard legs',9),shield('Crystal carapace',14),attack('Ice splinters',7,'sweep')]},
 'whiteout-ray':{name:'Whiteout Ray',moves:[shield('Whiteout veil',12),attack('Freezing gust',8,'sweep'),attack('Diving barb',12,'hero')]},
 'coffinback-bastion':{name:'Coffinback Bastion',moves:[shield('Frozen rampart',18),attack('Bastion slam',14),attack('Grave ice',9,'sweep')]},
 'hollowmask-oracle':{name:'Hollowmask Oracle',moves:[attack('Hollow prophecy',12,'hero'),shield('Mirror of rime',14),attack('Splintered omen',11,'random_ally')]},
 'shardlance-stalker':{name:'Shardlance Stalker',moves:[attack('Shard lance',13),shield('Stalking frost',10),attack('Piercing pursuit',11,'weakest')]},
 'hoarveil-crone':{name:'Hoarveil Crone',moves:[shield('Hoarfrost mantle',16),attack('Winter curse',12,'hero'),attack('Veil of needles',8,'sweep')]},
 'iceclamp-bombardier':{name:'Iceclamp Bombardier',moves:[attack('Iceclamp',13),shield('Packed snow',12),attack('Glacial bombardment',9,'sweep')]},
 'paleveil-moth':{name:'Paleveil Moth',moves:[attack('Pale wing',10,'random_ally'),shield('Frost cocoon',12),attack('Powdered winter',7,'sweep')]},
 'cairnfrost-ursine':{name:'Cairnfrost Ursine',moves:[attack('Cairn claws',15),shield('Frozen hide',16),attack('Ursine charge',13,'hero')]},
 'dragon-frost-mammoth':{name:'Frost Mammoth',moves:[shield('Icebound hide',18),attack('Tusk avalanche',16),attack('Trampling snow',9,'sweep')]},
 'dragon-rime-antler':{name:'Rime Antler',moves:[attack('Antler charge',14),shield('Rime crown',14),attack('Shard spray',9,'sweep')]},
 'rime-hauler':{name:'Rime Hauler',moves:[shield('Burden of ice',18),attack('Frozen freight',16),attack('Dragging chains',12,'weakest')]},
 'avalanche-colossus':{name:'Avalanche Colossus, Sovereign of the Wastes',moves:[shield('Glacier mantle',24),attack('Avalanche fist',20),attack('Whiteout collapse',11,'sweep'),attack('Icebound judgment',17,'hero')]},
};
const scripts:{name:string;roster:IceId[];reserve?:IceId}[]=[
 {name:'The Rimebound Pass',roster:['rimejaw-scavenger','shardstep-skitterer']},
 {name:'Wings in the Whiteout',roster:['whiteout-ray','paleveil-moth']},
 {name:'The Buried Watch',roster:['coffinback-bastion','hollowmask-oracle']},
 {name:'Lances across the Drift',roster:['shardlance-stalker','rimejaw-scavenger','shardstep-skitterer']},
 {name:'Cairnfrost Den',roster:['cairnfrost-ursine','hoarveil-crone']},
 {name:'The Frozen Battery',roster:['iceclamp-bombardier','whiteout-ray','paleveil-moth']},
 {name:'Tracks beneath the Glacier',roster:['dragon-rime-antler','shardlance-stalker','hollowmask-oracle']},
 {name:'The Mammoth Crossing',roster:['dragon-frost-mammoth','coffinback-bastion'],reserve:'rimejaw-scavenger'},
 {name:'The Hoarveil Procession',roster:['hoarveil-crone','paleveil-moth','iceclamp-bombardier']},
 {name:'The Last Haul',roster:['rime-hauler','cairnfrost-ursine','shardlance-stalker']},
 {name:'Wardens of the Avalanche',roster:['dragon-rime-antler','dragon-frost-mammoth','hollowmask-oracle']},
 {name:'The Avalanche Throne',roster:['avalanche-colossus']},
];
export const frozenWastesEliteRooms=[4,7,10];
/** Fixed encounter budgets never scale against the player's earned deck upgrades. */
export const frozenWastesEncounters:Encounter[]=scripts.map((script,i)=>{
 const enemy=(id:IceId):EnemyDefinition=>({art:id,name:kits[id].name,hp:id==='avalanche-colossus'?340:Math.round((65+i*4)*(frozenWastesEliteRooms.includes(i)?1.18:1)),...(id==='avalanche-colossus'?{boss:'frozen-sovereign' as const}:{}),moves:kits[id].moves.map(m=>({...m,damage:m.damage?m.damage+Math.floor(i/4):0}))});
 return {name:script.name,subtitle:`Frozen Wastes · Encounter ${i+1} of 12`,background:i<6?'frozen-wastes':'frozen-heart',enemies:script.roster.map(enemy),reserves:script.reserve?[enemy(script.reserve)]:[]};
});

import {generateInfernalJourney,type InfernalJourney,type InfernalNode} from './infernal';
export function generateFrozenWastesJourney(seed:number):InfernalJourney {
 const nodes:InfernalNode[]=[],shops:InfernalJourney['shops']={};
 for(const [i,source] of frozenWastesEncounters.entries()){
  const number=i+1,boss=number===12,encounter=structuredClone(source),id=`frozen-wastes-${number}`;
  nodes.push({id,row:nodes.length,lane:0,kind:boss?'boss':frozenWastesEliteRooms.includes(i)?'elite':'combat',name:encounter.name,next:[number%3===0?`frozen-wastes-shop-${number}`:`frozen-wastes-${number+1}`],encounterIndex:21+i,encounter});
  if(number%3===0){const shopId=`frozen-wastes-shop-${number}`;shops[shopId]=structuredClone(Object.values(generateInfernalJourney((seed+Math.imul(number+12,104729))>>>0).shops)[0]);nodes.push({id:shopId,row:nodes.length,lane:0,kind:'shop',name:'The Frostbound Exchange',next:boss?[]:[`frozen-wastes-${number+1}`],encounterIndex:21+i,encounter:{...encounter,enemies:[],reserves:[]}});}
 }
 return {realm:'frozen-wastes',nodes,current:null,completed:[],shops,shopRules:'soulforge'};
}
