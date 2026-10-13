import {newRun,demonStats,type State,type Unit} from '../../../packages/engine/index';
import type {CardId} from '../../../packages/content/index';
export const HELLBOUND_REVIEW=import.meta.env.DEV&&location.pathname==='/hellbound-review';
/** Development-only battle lab; main.tsx excludes this state from player saves. */
export function hellboundReviewState():State|null{
 if(!HELLBOUND_REVIEW)return null;
 const state=newRun(217,'hellbound',3,0,2,2),group=new URLSearchParams(location.search).get('group');
 const kinds=group==='aura'?['iron-legionary','iron-legionary','iron-legionary','iron-legionary']:group==='ten'?['dread-vanguard','maledictor','maledictor','maledictor','ash-pikeman','ash-pikeman','ironhorn-bulwark','iron-legionary','iron-legionary','iron-legionary']:group==='hellgate'?['maledictor','maledictor','maledictor','ironhorn-bulwark']:group==='bodyguards'?['iron-legionary','iron-legionary','ash-pikeman']:['dread-vanguard','maledictor','ash-pikeman','ironhorn-bulwark','iron-legionary'];
 state.units=kinds.map(kind=>{const stats=demonStats[kind as keyof typeof demonStats];return {...stats,kind,id:state.nextId++,maxHp:stats.hp,guard:0,promotionRank:0,armor:0,legionBaseHp:stats.hp,legionBasePower:stats.power} as Unit;});
 if(group==='aura')state.units.forEach((unit,i)=>{const rank=[1,4,7,10][i];unit.promotionRank=unit.armor=rank;unit.power+=rank*2;unit.hp=unit.maxHp+=rank*2;});
 state.mana=10;state.cinders=20;state.hp=state.maxHp=100;
 state.enemies.forEach(enemy=>{enemy.hp=enemy.maxHp=180;enemy.moves=[{name:'Legion trial',damage:12,targeting:'ignore_defender'}];});state.reserves=[];
 const hand:CardId[]=group==='hellgate'?['hellgate-rite','field-promotion','blood-ascension','veteran-command','infernal-logistics']:group==='bodyguards'?['muster-legion','field-promotion','battlefield-commission','hold-the-line','veteran-command']:['field-promotion','blood-ascension','veteran-command','summon-iron-legionary','rally-legion'];
 state.hand=hand.map(id=>({id,uid:state.nextId++}));state.events=[];
 return state;
}
