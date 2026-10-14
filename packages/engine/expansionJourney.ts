import type {State} from './index';
import type {InfernalNode} from './infernal';
/** Expansion-only camp insertion preserves every old node ID and all treasure rewards. */
export function addExpansionCamps(s:State){
 if(s.expansionVersion!==2||!s.journey||s.journey.shopRules==='legacy'||s.journey.nodes.some(n=>n.kind==='camp'))return;
 if(!s.journey.realm||s.journey.realm==='infernal'){const node=s.journey.nodes.find(n=>n.kind==='combat'&&n.row>=4);if(node){node.kind='camp';node.name='The Ashen Camp';node.encounter={...node.encounter,enemies:[],reserves:[]};}return;}
 const additions:InfernalNode[]=[];
 for(const shop of s.journey.nodes.filter(n=>n.kind==='shop'&&(n.id.endsWith('-3')||n.id.endsWith('-9')))){
  const id=`${shop.id}-camp`;additions.push({...shop,id,kind:'camp',name:'Sheltered Camp',row:shop.row+.5,next:[...shop.next]});shop.next=[id];
 }
 s.journey.nodes.push(...additions);s.journey.nodes.sort((a,b)=>a.row-b.row);s.journey.nodes.forEach((n,i)=>{n.row=i;});
}
