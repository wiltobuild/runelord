import type { Assets } from "./assets";
export const WARBAND_SPACE = { left:335, top:150, width:700, ground:376, gap:16 } as const;
type Member={id:number;kind:string};
const runebladeKinds = ["rime-seer", "rune-revenant", "frost-thrall", "bone-defender", "shattered-queen"] as const;
export const isRunebladeSummon = (kind:string) => (runebladeKinds as readonly string[]).includes(kind);
export const isAirborneSummon=(kind:string)=>["imp","ignivar","gloomstalker","soul-leech","nightmaw","hollow-saint","shattered-queen"].includes(kind);
export const summonArt=(kind:string,assets:Assets)=>kind==='imp'&&assets.actors['summon-imp-flight']?'summon-imp-flight':`summon-${kind}`;
export const summonHeightToAnchor = (actor: Assets["actors"][string]) => actor.geometry?.layout_bounds_px ? actor.anchor[1] - actor.geometry.layout_bounds_px[1] : actor.geometry?.reference_visible_height_px ?? actor.anchor[1];
export type FormationSlot={x:number;top:number;width:number;root:number;worldUnit:number;art:string;airborne:boolean;depth:number;bounds:{left:number;right:number;top:number;bottom:number}};
export type PackedGroup={kind:string;ids:number[];x:number;top:number;width:number;airborne:boolean};
// Scale is intrinsic to the model, never a function of its neighbours or ghosts.
export function measureSummon(unit:Member,assets:Assets){
 const art=summonArt(unit.kind,assets),actor=assets.actors[art],g=actor?.geometry;
 const airborne=isAirborneSummon(unit.kind),[ax,ay]=actor?.anchor??[256,340];
 const [l,t,r,b]=g?.layout_bounds_px??[0,0,...(actor?.size??[512,384])];
 const ppu=g?.source_pixels_per_world_unit||400,base=(LEGION_FORMATION_ORDER as readonly string[]).includes(unit.kind)?250:unit.kind==='hellhound'?225.8064515:200;
 // Fixed sky envelope applies to this model alone, including its widest wingbeat.
 const worldUnit=airborne&&!isRunebladeSummon(unit.kind)?Math.min(base,146*ppu/Math.max(1,b-t)):base,scale=worldUnit/ppu;
 return {...unit,art,airborne,worldUnit,upper:(ay-t)*scale,lower:Math.max(0,b-ay)*scale,width:Math.max(110,Math.max(ax-l,r-ax)*scale*2+12)};
}
type Measure=ReturnType<typeof measureSummon>;
const families:Record<string,string>={'pit-brute':'gorthak',hellhound:'cerberax',imp:'ignivar',gloomstalker:'nightmaw'};
const hasCrowdedHoundFamily=(kinds:string[])=>kinds.includes('hellhound')&&kinds.includes('cerberax')&&kinds.some(k=>k!=='hellhound'&&k!=='cerberax');
// Undead retain their authored intrinsic scale. Stable family/ID ordering changes
// spacing and overlap, never model size, when the army grows or a death ghost lingers.
function arrangeRuneblade(units:Member[], assets:Assets) {
 const measures=units.map(u=>measureSummon(u,assets));
 const ordered=[...measures].sort((a,b)=>runebladeKinds.indexOf(a.kind as typeof runebladeKinds[number])-runebladeKinds.indexOf(b.kind as typeof runebladeKinds[number])||a.id-b.id);
 const slots=new Map<number,FormationSlot>(),groups:PackedGroup[]=[];
 for(const airborne of [false,true]) {
  const lane=ordered.filter(m=>m.airborne===airborne);
  // Short allies occupy the ground; Queens hover over the rear ranks at full size.
  // Temporary extra entries can remain while an authored death finishes.
  const step=lane.length>1?Math.min(154,480/(lane.length-1)):0;
  const first=320-(lane.length-1)*step/2;
  lane.forEach((m,i)=>{
   const center=first+i*step,root=airborne?300-i*8:ordered.length>6?324-(lane.length-1-i)*6/Math.max(1,lane.length-1):376-(lane.length-1-i)*9;
   const x=center-m.width/2,top=root-m.upper;
   slots.set(m.id,{x,top,width:m.width,root,worldUnit:m.worldUnit,art:m.art,airborne,depth:airborne?8+i:20+i,
    bounds:{left:x,right:x+m.width,top,bottom:root+m.lower}});
  });
 }
 // Every unit owns a separate readable/selectable footer region even where art overlaps.
 const labelWidth=640/Math.max(5,ordered.length);
 if(ordered.length>6)addLaneLabels(groups,ordered,false,'runeblade');
 else ordered.forEach((m,i)=>groups.push({kind:`runeblade-${m.id}`,ids:[m.id],x:60+i*labelWidth,top:386,width:labelWidth,airborne:m.airborne}));
 return {slots,groups};
}


export const LEGION_FORMATION_ORDER = ["dread-vanguard", "maledictor", "ash-pikeman", "ironhorn-bulwark", "iron-legionary"] as const;
const isLegionFormationMember=(kind:string)=>kind==='imp'||(LEGION_FORMATION_ORDER as readonly string[]).includes(kind);
// Footers stay individually selectable even when ten full-size actors must overlap.
function addLaneLabels(groups:PackedGroup[],lane:Measure[],airborne:boolean,prefix:string){
 const columns=Math.min(5,lane.length),width=128,stride=640/columns;
 lane.forEach((m,i)=>groups.push({kind:`${prefix}-${m.id}`,ids:[m.id],x:36+(i%5)*stride+(stride-width)/2,
  top:airborne?-4+Math.floor(i/5)*52:lane.length>5?334+Math.floor(i/5)*52:386,width,airborne}));
}
function arrangeLegion(units:Member[],assets:Assets){
 const slots=new Map<number,FormationSlot>(),groups:PackedGroup[]=[];
 for(const airborne of [false,true]){
  const lane=units.filter(u=>(u.kind==='imp')===airborne).sort((a,b)=>
   LEGION_FORMATION_ORDER.indexOf(a.kind as typeof LEGION_FORMATION_ORDER[number])-LEGION_FORMATION_ORDER.indexOf(b.kind as typeof LEGION_FORMATION_ORDER[number])||a.id-b.id
  ).map(u=>measureSummon(u,assets));
  if(!lane.length)continue;
  const left=36,right=676;
  const natural=lane.reduce((sum,m)=>sum+m.width,0)+16*(lane.length-1);
  const edges=(lane[0].width+lane[lane.length-1].width)/2;
  const desired=lane.slice(1).map((m,i)=>(lane[i].width+m.width)/2+16);
  const span=desired.reduce((sum,n)=>sum+n,0);
  const factor=span?Math.min(1,Math.max(0,right-left-edges)/span):1;
  const occupied=edges+span*factor;
  let center=left+(right-left-occupied)/2+lane[0].width/2;
  lane.forEach((m,i)=>{
   if(i)center+=desired[i-1]*factor;
   // A compressed line only has a shallow 6px rank, never a stairway into the air.
   const stagger=natural>right-left&&lane.length>1?(lane.length-1-i)*6/(lane.length-1):0;
   const root=airborne?165:((lane.length>5?324:376)-stagger),x=center-m.width/2,top=root-m.upper;
   slots.set(m.id,{x,top,width:m.width,root,worldUnit:m.worldUnit,art:m.art,airborne,depth:(airborne?60:20)+i,
    bounds:{left:x,right:x+m.width,top,bottom:root+m.lower}});
  });
  addLaneLabels(groups,lane,airborne,'legion');
 }
 return {slots,groups};
}

export function arrangeWarband(units:Member[],assets:Assets){
 if(units.some(u=>(LEGION_FORMATION_ORDER as readonly string[]).includes(u.kind))&&units.every(u=>isLegionFormationMember(u.kind)))return arrangeLegion(units,assets);
 if(units.length&&units.every(u=>isRunebladeSummon(u.kind)))return arrangeRuneblade(units,assets);
 const measures=units.map(u=>measureSummon(u,assets)),slots=new Map<number,FormationSlot>(),groups:PackedGroup[]=[];
 for(const airborne of [false,true]){
  const row=measures.filter(m=>m.airborne===airborne);if(!row.length)continue;
  const hounds=row.filter(m=>m.kind==='hellhound').sort((a,b)=>a.id-b.id);
  const cerberax=row.find(m=>m.kind==='cerberax');
  if(!airborne&&row.length===5&&hounds.length===4&&cerberax){
   // A full canine pack frames its arch demon with a staggered pair per flank.
   // Stable IDs keep the same hounds on each side across rerenders.
   const pack=[hounds[0],hounds[1],cerberax,hounds[2],hounds[3]];
   const centers=[60,140,300,415,495];
   pack.forEach((m,i)=>{
    const x=centers[i]-m.width/2,root=376-i*8,top=root-m.upper;
    slots.set(m.id,{x,top,width:m.width,root,worldUnit:m.worldUnit,art:m.art,airborne:false,depth:15-i,
     bounds:{left:x,right:x+m.width,top,bottom:root+m.lower}});
   });
   groups.push({kind:'ground-cerberax-pack',ids:pack.map(m=>m.id),x:60,top:386,width:640,airborne:false});
   continue;
  }
  const naturalRow=row.reduce((sum,m)=>sum+m.width,0)+(row.length-1)*16;
  // Crowded ground rows may use the space beside/partly behind the Warlock.
  const houndReserve=!airborne&&hasCrowdedHoundFamily(row.map(m=>m.kind));
  const left=airborne?0:naturalRow>640?(houndReserve?-240:-180):60,available=700-left;
  const needsStack=row.reduce((sum,m)=>sum+m.width,0)+(row.length-1)*16>available;
  // First stack duplicates by kind. Only borrow an arch's stack when even
  // separate kind groups cannot fit at their intrinsic model widths.
  const kindWidths=new Map<string,number>();
  for(const m of row)kindWidths.set(m.kind,Math.max(kindWidths.get(m.kind)??0,m.width));
  const mergeFamilies=[...kindWidths.values()].reduce((sum,width)=>sum+width,0)+(kindWidths.size-1)*16>available;
  const buckets=new Map<string,Measure[]>();
  for(const m of row){const family=families[m.kind],key=!needsStack?`${m.kind}-${m.id}`:mergeFamilies&&family&&row.some(n=>n.kind===family)?family:m.kind;
   if(!buckets.has(key))buckets.set(key,[]);buckets.get(key)!.push(m);
  }
  const bundles=[...buckets].map(([key,members])=>{
   members.sort((a,b)=>(a.kind===key?-1:0)-(b.kind===key?-1:0)||b.upper-a.upper||a.id-b.id);
   const stride=airborne?56:72;
   const maxWidth=Math.max(...members.map(m=>m.width));
   return {key,members,stride,maxWidth};
  });
  const familyKey=(kind:string)=>families[kind]??kind;
  bundles.sort((a,b)=>{
   const ak=a.members[0].kind,bk=b.members[0].kind,af=familyKey(ak),bf=familyKey(bk);
   const familyWidth=(family:string)=>Math.max(...row.filter(m=>familyKey(m.kind)===family).map(m=>m.width));
   return (!airborne?familyWidth(af)-familyWidth(bf):0)||row.findIndex(m=>familyKey(m.kind)===af)-row.findIndex(m=>familyKey(m.kind)===bf)
    ||Number(ak===af)-Number(bk===bf);
  });
  // Solve the entire row together. Clamping each bundle independently makes
  // wide arch demons push several stacks into the same position.
  const ordered=bundles.flatMap(b=>[...b.members].reverse().map(m=>({m,b})));
  const desired=ordered.slice(1).map(({m,b},i)=>{
   const previous=ordered[i];
   if(previous.b===b&&m.kind==='hellhound'&&previous.m.kind==='hellhound')return 80;
   return previous.b===b?Math.max(b.stride,(previous.m.width+m.width)*.24):(previous.m.width+m.width)/2+16;
  });
  const minimum=ordered.slice(1).map(({m},i)=>{
   const previous=ordered[i].m;
   if(airborne)return 56;
   if(previous.kind===m.kind)return m.kind==='hellhound'?72:96;
   // Reserve a clear shoulder/face gap between the hound family and a large neighbour.
   if(houndReserve&&familyKey(previous.kind)==='cerberax'&&familyKey(m.kind)!=='cerberax'&&m.width>=400)return 230;
   return 110;
  });
  const ideal=desired.map((d,i)=>Math.max(d,minimum[i]));
  const edges=(ordered[0].m.width+ordered[ordered.length-1].m.width)/2;
  const minimumSpan=minimum.reduce((s,n)=>s+n,0);
  const idealSpan=ideal.reduce((s,n)=>s+n,0);
  const room=available-edges;
  const factor=idealSpan===minimumSpan?1:Math.max(0,Math.min(1,(room-minimumSpan)/(idealSpan-minimumSpan)));
  const unboundedSteps=ideal.map((d,i)=>minimum[i]+(d-minimum[i])*factor);
  // At ten actors even the usual minimum shoulder gaps can exceed the lane.
  // Compress distances, never the authored model scale.
  const stepSpan=unboundedSteps.reduce((sum,n)=>sum+n,0);
  const denseFactor=stepSpan?Math.min(1,Math.max(0,room)/stepSpan):1;
  const steps=unboundedSteps.map(step=>step*denseFactor);
  const centers=new Map<number,number>();
  let center=airborne?ordered[0].m.width/2:700-ordered[ordered.length-1].m.width/2-steps.reduce((s,n)=>s+n,0);
  ordered.forEach(({m},i)=>{if(i)center+=steps[i-1];centers.set(m.id,center);});
  const packed=factor<1||denseFactor<1||bundles.some(b=>b.members.length>1);
  // Keep controls in the original footer even when artwork extends behind hero.
  let labelCursor=airborne?0:60;
  const labelWidth=640/row.length;
  if(row.length>5)addLaneLabels(groups,ordered.map(entry=>entry.m),airborne,airborne?'air':'ground');
  for(const b of bundles){
   if(packed&&row.length<=5){groups.push({kind:`${airborne?'air':'ground'}-${b.key}`,ids:[...b.members].reverse().map(m=>m.id),x:labelCursor,top:airborne?-4:386,width:labelWidth*b.members.length,airborne});labelCursor+=labelWidth*b.members.length;}
   const baseDepth=60;
   b.members.forEach((m,i)=>{
    const x=centers.get(m.id)!-m.width/2;
    const root=airborne?196-m.lower-(b.members.length-1-i)*4:(row.length>5?324:376)-Math.min(row.length>5?6:Infinity,(b.members.length-1-i)*8);
    const headroom=packed?0:airborne?50:24,top=root-m.upper-headroom;
    slots.set(m.id,{x,top,width:m.width,root,worldUnit:m.worldUnit,art:m.art,airborne,depth:airborne?baseDepth+i:10+ordered.length-ordered.findIndex(entry=>entry.m.id===m.id),
     bounds:{left:x,right:x+m.width,top:root-m.upper,bottom:root+m.lower}});
   });
  }
 }
 return {slots,groups};
}
export function layoutWarband(units:Member[],assets:Assets){return arrangeWarband(units,assets).slots;}
export function retreatGroundFormation(slots:Map<number,FormationSlot>,assets:Assets){
 if([...slots.values()].some(s=>(LEGION_FORMATION_ORDER as readonly string[]).includes(s.art.replace(/^summon-/,"")))&&[...slots.values()].every(s=>isLegionFormationMember(s.art.replace(/^summon-/,"").replace("imp-flight","imp"))))return {shift:0,slots:new Map(slots)};
 if(slots.size&&[...slots.values()].every(s=>isRunebladeSummon(s.art.replace(/^summon-/,""))))return {shift:0,slots:new Map(slots)};
 const ground=[...slots.values()].filter(s=>!s.airborne);
 const right=Math.max(0,...ground.map(s=>{
  const a=assets.actors[s.art],g=a?.geometry;
  const edge=g?s.x+s.width/2+(g.layout_bounds_px![2]-a.anchor[0])*s.worldUnit/g.source_pixels_per_world_unit:s.bounds.right;
  return Math.max(s.bounds.right,edge);
 }));
 // Retreat only into unused rear room; otherwise this second translation
 // cancels the crowded-row spacing and pushes models off the board.
 const rear=Math.min(0,...ground.map(s=>s.bounds.left));
 const rearLimit=hasCrowdedHoundFamily(ground.map(s=>s.art.replace('summon-','')))?240:180;
 const shift=ground.length?Math.min(Math.max(100,right-590),Math.max(0,rear+rearLimit)):0;
 return {shift,slots:new Map([...slots].map(([id,s])=>[id,s.airborne?s:{...s,x:s.x-shift,bounds:{...s.bounds,left:s.bounds.left-shift,right:s.bounds.right-shift}}]))};
}
