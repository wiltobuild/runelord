import type {State,Unit,DemonKind,Enemy} from './index';
import {demonStats,warbandCapacity} from './index';
import {expansionRelics,summonTraining,trainingCosts,type TrainingOrder,type ExpansionRelic} from './expansionCatalog';
import {relicsForHero,type ItemId} from '../content/index';
export * from './expansionCatalog';
export const usesExpansion=(s:State)=>s.expansionVersion===2;
export const trainingLevel=(s:State,kind:DemonKind)=>s.trainingLevels?.[kind]??0;
export function knownSummons(s:State):DemonKind[]{
 const known=new Set<DemonKind>(s.acquiredSummons||[]);
 for(const id of s.deck){const kind=id.slice(7) as DemonKind;if(id.startsWith('summon-')&&kind in demonStats)known.add(kind);if(id==='muster-legion')known.add('iron-legionary');if(id==='pike-detail')known.add('ash-pikeman');}
 return [...known].sort();
}
export const trainingOptions=(s:State)=>knownSummons(s).map(kind=>{const level=trainingLevel(s,kind),cost=expansionPrice(s,trainingCosts[Math.min(level,1)]);return {kind,name:demonStats[kind].name,level,cost,canTrain:usesExpansion(s)&&level<2&&(s.phase==='camp'||s.phase==='treasure'||(s.phase==='shop'&&s.gold>=cost))};});
export function trainSummon(s:State,kind:DemonKind,free=false){const offer=trainingOptions(s).find(o=>o.kind===kind);if(!offer||offer.level>=2||!usesExpansion(s))throw Error('Choose an acquired summon that is not mastered.');const cost=free?0:offer.cost;if(s.gold<cost)throw Error('Not enough Gold.');s.gold-=cost;s.trainingLevels??={};s.trainingLevels[kind]=(offer.level+1) as 1|2;}
export const availableOrders=(s:State,u:Unit):TrainingOrder[]=>[{id:'attack',name:summonTraining[u.kind].baseName,description:'Use this summon’s basic action. Commands always use this action.',target:'enemy',effects:[]},...(usesExpansion(s)?summonTraining[u.kind].tiers.slice(0,trainingLevel(s,u.kind)):[])];
export function setOrder(s:State,unit:number,order:string,target?:number,allOfKind=false){
 if(!usesExpansion(s)||s.phase!=='combat')throw Error('Choose orders during combat.');const u=s.units.find(u=>u.id===unit&&u.hp>0);if(!u)throw Error('Choose a living summon.');const definition=availableOrders(s,u).find(o=>o.id===order);if(!definition)throw Error('That order has not been learned.');
 if(definition.target==='ally'&&!s.units.some(v=>v.id===target&&v.hp>0))throw Error('Choose a living ally.');
 if(definition.target==='enemy'&&target!==undefined&&!s.enemies.some(e=>e.id===target&&e.hp>0))throw Error('Choose a living enemy.');
 for(const v of allOfKind?s.units.filter(v=>v.kind===u.kind):[u]){v.order=order;v.orderTarget=definition.target==='self'?v.id:target;}
}
export const campRecovery=(s:State)=>Math.floor(s.maxHp*.3);
export const expansionRelicPool=(s:State):ItemId[]=>[...relicsForHero(s.hero),...(usesExpansion(s)?Object.keys(expansionRelics) as ItemId[]:[])];
export function treasureOptions(s:State){const pool=expansionRelicPool(s).filter(id=>!s.relics.includes(id)),salt=stableHash(s.seed,`treasure:${(s as State&{journey?:{current:string|null}}).journey?.current??s.room}`);return {relic:pool[salt%pool.length],gold:65,training:trainingOptions(s)};}
export function stableHash(seed:number,salt:string){let n=seed>>>0;for(const ch of salt)n=Math.imul(n^ch.charCodeAt(0),16777619)>>>0;return n;}
export function relicCondition(s:State,condition:ExpansionRelic['condition'],u?:Unit){return condition==='always'||condition==='warband'&&s.units.some(v=>v.hp>0)||condition==='empty-warband'&&!s.units.some(v=>v.hp>0)||condition==='wounded'&&s.hp<s.maxHp/2||condition==='trained'&&!!u&&trainingLevel(s,u.kind)>0||condition==='defender'&&!!u?.defender||condition==='scorched'&&s.enemies.some(e=>e.hp>0&&e.scorch>0)||condition==='chilled'&&s.enemies.some(e=>e.hp>0&&(e.chill||0)>0);}
export function expansionPrice(s:State,price:number){if(!usesExpansion(s))return price;const discount=s.relics.reduce((n,id)=>{const r=expansionRelics[id as keyof typeof expansionRelics];return n+(r?.effect==='discount'&&relicCondition(s,r.condition)?r.amount:0);},0);return Math.max(1,price-discount);}
export type ExpansionHooks={guard:(n:number)=>void;draw:(n:number)=>void;scorch:(e:Enemy,n:number)=>void;chill:(e:Enemy,n:number)=>void;damage:(e:Enemy,n:number)=>void;summon:(kind:DemonKind)=>void;hellgate:()=>void;emit:(type:string,message:string,u?:Unit)=>void};
export function relicHook(s:State,hook:ExpansionRelic['hook'],h:ExpansionHooks,u?:Unit){
 if(!usesExpansion(s))return;s.relicCounters??={};
 for(const id of s.relics){const r=expansionRelics[id as keyof typeof expansionRelics];if(!r||r.hook!==hook||r.effect==='discount'||!relicCondition(s,r.condition,u))continue;
 const key=`${id}:${r.timing==='turn'?s.turn:'battle'}`;if(r.timing!=='event'&&(s.relicCounters[key]||0)>=r.cap)continue;s.relicCounters[key]=(s.relicCounters[key]||0)+1;
 const enemy=s.enemies.find(e=>e.hp>0);switch(r.effect){case'heroGuard':h.guard(r.amount);break;case'healHero':if(s.hp>0)s.hp=Math.min(s.maxHp,s.hp+r.amount);break;case'draw':h.draw(r.amount);break;case'cinders':s.cinders=Math.min(20,s.cinders+r.amount);break;case'corpses':s.corpses+=r.amount;break;case'unitPower':if(u)u.power+=r.amount;break;case'unitHp':if(u){u.maxHp+=r.amount;u.hp+=r.amount;}break;case'gold':s.gold+=r.amount;break;case'chill':if(enemy)h.chill(enemy,r.amount);break;case'scorch':if(enemy)h.scorch(enemy,r.amount);break;}
 h.emit('relic',`${r.name}: ${r.text}`,u);
 }
}
/** Returns false for basic orders, spent utilities, or a fallen defensive target. */
export function performOrder(s:State,u:Unit,h:ExpansionHooks):boolean{
 const order=availableOrders(s,u).find(o=>o.id===u.order);if(!order||order.id==='attack'||u.utilityUsedTurn===s.turn)return false;
 const ally=order.target==='self'?u:s.units.find(v=>v.id===u.orderTarget&&v.hp>0);if(order.target==='ally'&&!ally)return false;
 const enemy=s.enemies.find(e=>e.id===u.orderTarget&&e.hp>0)||s.enemies.find(e=>e.hp>0);const chargeKey=`${u.kind}:${order.id}`;s.orderCharges??={};if(order.charges&&(s.orderCharges[chargeKey]||0)>=order.charges)return false;if(order.effects.some(e=>e.type==='summon')&&s.units.length>=warbandCapacity(s))return false;u.utilityUsedTurn=s.turn;if(order.charges)s.orderCharges[chargeKey]=(s.orderCharges[chargeKey]||0)+1;
 for(const effect of order.effects){const allies=effect.scope==='allAllies'?s.units:effect.scope==='target'&&ally?[ally]:[u];const enemies=effect.scope==='allEnemies'?s.enemies.filter(e=>e.hp>0):enemy?[enemy]:[];
 switch(effect.type){case'counter':u.counterDamage=effect.amount;u.counterUntil=s.turn+1;break;case'coordinatedDamage':for(const e of enemies)h.damage(e,effect.amount+Math.min(6,2*s.units.filter(v=>v.id!==u.id&&v.hp>0&&v.kind==='ash-pikeman'&&v.order==='coordinated-thrust').length));break;case'damage':for(const e of enemies)h.damage(e,effect.amount);break;case'heroGuard':h.guard(effect.amount);break;case'unitGuard':for(const v of allies)v.guard+=effect.amount;break;case'healUnit':for(const v of allies)v.hp=Math.min(v.maxHp,v.hp+effect.amount);break;case'healHero':s.hp=Math.min(s.maxHp,s.hp+effect.amount);break;case'power':for(const v of allies)v.power+=effect.amount;break;case'scorch':for(const e of enemies)h.scorch(e,effect.amount);break;case'chill':for(const e of enemies)h.chill(e,effect.amount);break;case'sapped':case'exposed':for(const e of enemies)e[effect.type]=(e[effect.type]||0)+effect.amount;break;case'draw':h.draw(effect.amount);break;case'summon':for(let i=0;i<effect.amount;i++)h.summon(effect.kind as DemonKind);break;case'bodyguard':u.defender=true;u.bodyguardUntil=s.turn+1;break;case'hellgate':h.hellgate();break;}
 }
 h.emit('order',`${u.name}: ${order.name}`,u);return true;
}

export const campHealAmount=campRecovery;
export const shopServiceCost=expansionPrice;
