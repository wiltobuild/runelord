import type { EnemyDefinition, Move, Encounter } from '../content/index';

/** Only living woodland creatures and constructs from the user's animated novel-20 sheet. */
export const FOREST_ENEMY_IDS = ['briarjaw-ambusher','cairnback-hermit','cairnwheel-witness','gallows-orchard','inkvein-adjudicator','ironfan-isopod','pleatcap-matriarch','reedstep-ferryman','siltglass-colony','spindleback-threadwarden','tithe-mantis','tollbell-penitent'] as const;
type ForestEnemyId = typeof FOREST_ENEMY_IDS[number];
const attack=(name:string,damage:number,targeting:Move['targeting']='front'):Move=>({name,damage,targeting});
const shield=(name:string,guard:number):Move=>({name,damage:0,targeting:'front',kind:'shield',guard});
const kits:Record<ForestEnemyId,{name:string;moves:Move[]}>= {
 'briarjaw-ambusher':{name:'Briarjaw Ambusher',moves:[attack('Thorn snap',7),attack('Root lash',5,'sweep'),shield('Folded leaves',8)]},
 'cairnback-hermit':{name:'Cairnback Hermit',moves:[shield('Cairn shelter',12),attack('Stone claw',10),attack('Low scuttle',7,'weakest')]},
 'cairnwheel-witness':{name:'Cairnwheel Witness',moves:[shield('Runic orbit',10),attack('Rolling judgment',10),attack('Pebble volley',6,'random_ally')]},
 'gallows-orchard':{name:'Gallows Orchard',moves:[attack('Grasping roots',8),shield('Bark mantle',12),attack('Falling boughs',7,'sweep')]},
 'inkvein-adjudicator':{name:'Inkvein Adjudicator',moves:[attack('Ink writ',8,'hero'),shield('Sealed decree',10),attack('Binding stroke',11)]},
 'ironfan-isopod':{name:'Ironfan Isopod',moves:[shield('Iron plates',12),attack('Burrowing ram',10),attack('Fan sweep',5,'sweep')]},
 'pleatcap-matriarch':{name:'Pleatcap Matriarch',moves:[shield('Pleated canopy',10),attack('Spore cloud',6,'sweep'),attack('Root press',11)]},
 'reedstep-ferryman':{name:'Reedstep Ferryman',moves:[attack('Reed staff',8),shield('Basket ward',8),attack('River stones',9,'random_ally')]},
 'siltglass-colony':{name:'Siltglass Colony',moves:[shield('Crystal lattice',12),attack('Shard rain',6,'sweep'),attack('Crystal thrust',11)]},
 'spindleback-threadwarden':{name:'Spindleback Threadwarden',moves:[attack('Shuttle strike',9),shield('Woven shelter',12),attack('Thread snare',8,'weakest')]},
 'tithe-mantis':{name:'Tithe Mantis',moves:[attack('Reaping claw',10),shield('Poised wings',6),attack('Twin scythes',7,'sweep')]},
 'tollbell-penitent':{name:'Tollbell Penitent',moves:[shield('Bronze shell',14),attack('Tolling bell',7,'sweep'),attack('Chain swing',12)]},
};
// Fixed budgets respect earned upgrades: no hidden scaling that cancels a player's stronger build.
const scripts:{name:string;roster:ForestEnemyId[];elite?:boolean;reserve?:ForestEnemyId}[]=[
 {name:'The Living Threshold',roster:['briarjaw-ambusher','cairnback-hermit']},
 {name:'Reedwater Crossing',roster:['reedstep-ferryman','ironfan-isopod']},
 {name:'Witnesses of the Grove',roster:['cairnwheel-witness','tithe-mantis']},
 {name:'The Pleated Canopy',roster:['pleatcap-matriarch','briarjaw-ambusher','cairnback-hermit']},
 {name:'The Woven Toll',roster:['spindleback-threadwarden','tollbell-penitent'],elite:true},
 {name:'Ink beneath the Boughs',roster:['inkvein-adjudicator','reedstep-ferryman','cairnwheel-witness']},
 {name:'Glassroot Hollow',roster:['siltglass-colony','ironfan-isopod','tithe-mantis']},
 {name:'The Orchard Stirs',roster:['gallows-orchard','pleatcap-matriarch'],elite:true,reserve:'briarjaw-ambusher'},
 {name:'The Threadwarden Court',roster:['spindleback-threadwarden','inkvein-adjudicator','reedstep-ferryman']},
 {name:'The Last Toll',roster:['tollbell-penitent','cairnback-hermit','siltglass-colony']},
 {name:'Wardens of the Heart',roster:['tithe-mantis','cairnwheel-witness','ironfan-isopod'],elite:true},
 {name:'Sovereign of the Living Orchard',roster:['gallows-orchard','pleatcap-matriarch','spindleback-threadwarden']},
];
/** Linear forest chapter: no campaign map or journey state. */
export const forestEncounters:Encounter[]=scripts.map((script,i)=>{
 const number=i+1,boss=number===12;
 const enemy=(id:ForestEnemyId,index:number):EnemyDefinition=>({
  art:id,name:boss&&index===0?'Gallows Orchard, Heart of Thornroot':kits[id].name,
  hp:boss?(index===0?190:65):Math.round((42+i*3)*(script.elite?1.18:1)),
  moves:kits[id].moves.map(m=>({...m,damage:m.damage?m.damage+Math.floor(i/4):0})),
 });
 return {name:script.name,subtitle:`Thornroot Forest - Encounter ${number} of 12`,background:number<=6?'forest':'forest-heart',enemies:script.roster.map(enemy),reserves:script.reserve?[enemy(script.reserve,3)]:[]};
});
export const forestEliteRooms=[4,7,10];
