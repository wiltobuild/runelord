import {newRun,newInfernalRun,type State,type Unit} from '../../../packages/engine/index';
import {runebladeSummons,type CardId,type Encounter} from '../../../packages/content/index';
import type {Assets} from './assets';
export const ARCTIC_REVIEW=new URLSearchParams(location.search).get('preview')==='arctic'||import.meta.env.DEV&&location.pathname==='/runeblade-arctic-preview';
export const arcticEncounter:Encounter={name:'Frostgrave Causeway',background:'arctic-preview',subtitle:'Runeblade battle preview',enemies:[]};
export function arcticReviewAssets(assets:Assets){
 if(!ARCTIC_REVIEW)return;
 assets.images['arctic-preview']=`${import.meta.env.BASE_URL}arctic-preview/frostgrave-causeway.png`;
 for(const kind of ['rune-revenant','bone-defender']){
  const source=assets.actors[`summon-${kind}`];assets.actors[`arctic-${kind}`]={...source,deathEffect:undefined};
  assets.images[`arctic-${kind}`]=source.states.idle.frames[0].src;
 }
}
/** Isolated presentation fixture; never writes a campaign save. */
export function arcticReviewState():State|null{
 if(!ARCTIC_REVIEW)return null;
 const s=newRun(413,'rimebound',3,0,2,2);
 s.journey=newInfernalRun(413,'rimebound').journey;
 const node=s.journey!.nodes[0];s.journey!.current=node.id;
 node.name='Frostgrave Causeway';node.encounter={...node.encounter,name:'Frostgrave Causeway',background:'arctic-preview'};
 s.units=Object.entries(runebladeSummons).map(([kind,stats])=>({...stats,kind,id:s.nextId++,maxHp:stats.hp,guard:0,rot:0}) as Unit);
 s.enemies=['rune-revenant','bone-defender'].map((kind,i)=>({id:s.nextId++,name:i?'Frostgrave Sentinel':'Frostgrave Revenant',art:`arctic-${kind}`,hp:180,maxHp:180,guard:0,scorch:0,moves:[{name:'Frozen steel',damage:6,targeting:'front' as const}]}));
 const hand:CardId[]=['frostbite','rimecleave','glacial-ward','command-the-dead','summon-shattered-queen'];
 s.hand=hand.map(id=>({id,uid:s.nextId++}));s.reserves=[];s.mana=10;s.corpses=10;s.hp=s.maxHp=100;s.events=[];
 return s;
}
