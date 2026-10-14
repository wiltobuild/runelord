import { newInfernalRun, generateForestJourney, generateFrozenWastesJourney, generateInfernalJourney, configureHeroShops, prepareShop, dispatch, demonStats, expansionRelics, type State, type DemonKind } from "../../../packages/engine/index";
import {addExpansionCamps} from "../../../packages/engine/expansionJourney";
/** Development fixtures are never written to the player's saved journey. */
export const EXPEDITION_REVIEW=import.meta.env.DEV&&location.pathname==='/expedition-review';
export function expeditionReviewState():State|null {
 if(!EXPEDITION_REVIEW)return null;
 const params=new URLSearchParams(location.search),stage=params.get('stage')??'camp',realm=params.get('realm')??'frozen-wastes';
 const hero=params.get('hero')??(realm==='infernal'?'warlock':'runeblade');
 let state=newInfernalRun(42,hero==='runeblade'?'rimebound':'hellbound');
 state.journey=realm==='forest'?generateForestJourney(state.seed):realm==='infernal'?generateInfernalJourney(state.seed,false,state.hero):generateFrozenWastesJourney(state.seed);configureHeroShops(state);addExpansionCamps(state);
 state.gold=240;state.hp=51;state.relics.push(...Object.keys(expansionRelics).slice(0,8) as (keyof typeof expansionRelics)[]);
 state.acquiredSummons=hero==='runeblade'?['frost-thrall','bone-defender','rune-revenant','rime-seer','shattered-queen']:['iron-legionary','ash-pikeman','maledictor','ironhorn-bulwark','dread-vanguard','imp'];
 if(params.get('training')==='mastered')state.trainingLevels=Object.fromEntries((state.acquiredSummons??[]).map(kind=>[kind,2]));
 if(params.get('gold')==='0')state.gold=0;
 if(stage==='camp'){state.journey!.current=state.journey!.nodes.find(node=>node.kind==='camp')?.id??null;state.phase='camp';return state;}
 if(stage==='treasure'){state.journey!.current=state.journey!.nodes.find(node=>node.kind==='treasure')?.id??null;state.phase='treasure';return state;}
 if(stage==='shop'){state.journey!.current=state.journey!.nodes.find(node=>node.kind==='shop')!.id;state.phase='shop';prepareShop(state);return state;}
 state=dispatch(state,{type:'travel',node:state.journey!.nodes.find(node=>node.kind==='combat')!.id});
 state.phase='combat';state.units=[];
 for(const kind of (state.acquiredSummons??[]).slice(0,3) as DemonKind[]){const stats=demonStats[kind];state.units.push({...stats,kind,id:state.nextId++,maxHp:stats.hp,guard:0,order:'attack',...(hero==='runeblade'?{rot:1}:{})});state.trainingLevels??={};state.trainingLevels[kind]=2;}
 return state;
}

