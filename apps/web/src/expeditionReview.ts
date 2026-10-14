import { newRoguelikeRun, realmStartRoom, enterRoguelikeShop, dispatch, demonStats, expansionRelics, type State, type DemonKind } from "../../../packages/engine/index";

/** Development fixtures are never written to the player's saved journey. */
export const EXPEDITION_REVIEW=import.meta.env.DEV&&location.pathname==='/expedition-review';
export function expeditionReviewState():State|null {
 if(!EXPEDITION_REVIEW)return null;
 const params=new URLSearchParams(location.search),stage=params.get('stage')??'camp',realm=params.get('realm')??'frozen-wastes';
 const hero=params.get('hero')??(realm==='infernal'?'warlock':'runeblade');
 let state=newRoguelikeRun(42,hero==='runeblade'?'rimebound':'hellbound');
 state.room=realmStartRoom(state,realm==='forest'?'forest':realm==='infernal'?'infernal':'frozen-wastes');
 state.gold=240;state.hp=51;state.relics.push(...Object.keys(expansionRelics).slice(0,8) as (keyof typeof expansionRelics)[]);
 state.acquiredSummons=hero==='runeblade'?['frost-thrall','bone-defender','rune-revenant','rime-seer','shattered-queen']:['iron-legionary','ash-pikeman','maledictor','ironhorn-bulwark','dread-vanguard','imp'];
 if(params.get('training')==='mastered')state.trainingLevels=Object.fromEntries((state.acquiredSummons??[]).map(kind=>[kind,2]));
 if(params.get('gold')==='0')state.gold=0;
 if(stage==='camp'){state.phase='camp';return state;}
 if(stage==='treasure'){state.phase='treasure';return state;}
 if(stage==='route'){const step=Number(params.get('step')??0);state.room+=Number.isFinite(step)?Math.max(0,Math.min(realm==='infernal'?7:10,Math.floor(step))):0;state.phase='route-choice';return state;}
 if(stage==='boundary'){state.room+=realm==='infernal'?8:11;state.phase='route-choice';return state;}
 if(stage==='shop'){enterRoguelikeShop(state);return state;}
 
 state.phase='combat';state.units=[];
 for(const kind of state.acquiredSummons.slice(0,3) as DemonKind[]){const stats=demonStats[kind];state.units.push({...stats,kind,id:state.nextId++,maxHp:stats.hp,guard:0,order:'attack',...(hero==='runeblade'?{rot:1}:{})});state.trainingLevels??={};state.trainingLevels[kind]=2;}
 return state;
}
