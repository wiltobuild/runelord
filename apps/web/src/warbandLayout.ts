import type { Assets } from "./assets";
export const WARBAND_SPACE = { left:335, top:150, width:700, ground:376, gap:16 } as const;
type Member={id:number;kind:string};
export const isAirborneSummon=(kind:string)=>["imp","ignivar","soul-leech","nightmaw","hollow-saint"].includes(kind);
export const summonArt=(kind:string,assets:Assets)=>kind==='imp'&&assets.actors['summon-imp-flight']?'summon-imp-flight':`summon-${kind}`;
export type FormationSlot={x:number;top:number;width:number;root:number;worldUnit:number;art:string;airborne:boolean;depth:number;bounds:{left:number;right:number;top:number;bottom:number}};
export type PackedGroup={kind:string;ids:number[];x:number;top:number;width:number;airborne:boolean};
// Scale is intrinsic to the model, never a function of its neighbours or ghosts.
export function measureSummon(unit:Member,assets:Assets){
 const art=summonArt(unit.kind,assets),actor=assets.actors[art],g=actor?.geometry;
 const airborne=isAirborneSummon(unit.kind),[ax,ay]=actor?.anchor??[256,340];
 const [l,t,r,b]=g?.layout_bounds_px??[0,0,...(actor?.size??[512,384])];
 const ppu=g?.source_pixels_per_world_unit||400,base=unit.kind==='hellhound'?225.8064515:200;
 // Fixed sky envelope applies to this model alone, including its widest wingbeat.
 const worldUnit=airborne?Math.min(base,146*ppu/Math.max(1,b-t)):base,scale=worldUnit/ppu;
 return {...unit,art,airborne,worldUnit,upper:(ay-t)*scale,lower:Math.max(0,b-ay)*scale,width:Math.max(110,Math.max(ax-l,r-ax)*scale*2+12)};
}
type Measure=ReturnType<typeof measureSummon>;
const families:Record<string,string>={'pit-brute':'gorthak',hellhound:'cerberax',imp:'ignivar'};
export function arrangeWarband(units:Member[],assets:Assets){
 const measures=units.map(u=>measureSummon(u,assets)),slots=new Map<number,FormationSlot>(),groups:PackedGroup[]=[];
 for(const airborne of [false,true]){
  const row=measures.filter(m=>m.airborne===airborne);if(!row.length)continue;
  const buckets=new Map<string,Measure[]>();
  for(const m of row){const family=families[m.kind],key=family&&row.some(n=>n.kind===family)?family:m.kind;
   if(!buckets.has(key))buckets.set(key,[]);buckets.get(key)!.push(m);
  }
  const bundles=[...buckets].map(([key,members])=>{
   members.sort((a,b)=>(a.kind===key?-1:0)-(b.kind===key?-1:0)||b.upper-a.upper||a.id-b.id);
   const stride=airborne?56:72;
   return {key,members,stride,span:Math.max(...members.map((m,i)=>m.width+i*stride))};
  });
  const gap=16,natural=bundles.reduce((s,b)=>s+b.span,0),budget=700-(bundles.length-1)*gap;
  const compress=Math.min(1,budget/natural);
  const packed=compress<1||bundles.some(b=>b.members.length>1);
  let cursor=airborne?0:700-(natural*compress+(bundles.length-1)*gap);
  // All packed labels share a separate row with one accessible control per unit.
  let labelCursor=airborne?0:700-(natural*compress+(bundles.length-1)*gap);
  const labelWidth=(natural*compress+(bundles.length-1)*gap)/row.length;
  for(const b of bundles){
   const allocation=b.span*compress;
   if(packed){groups.push({kind:`${airborne?'air':'ground'}-${b.key}`,ids:b.members.map(m=>m.id),x:labelCursor,top:airborne?-4:386,width:labelWidth*b.members.length,airborne});labelCursor+=labelWidth*b.members.length;}
   b.members.forEach((m,i)=>{
    const center=cursor+allocation/2+(i-(b.members.length-1)/2)*b.stride*compress;
    const x=Math.max(airborne?0:60,Math.min(700-m.width,center-m.width/2));
    const root=airborne?196-m.lower-(b.members.length-1-i)*4:376-(b.members.length-1-i)*8;
    const headroom=packed?0:airborne?50:24,top=root-m.upper-headroom;
    slots.set(m.id,{x,top,width:m.width,root,worldUnit:m.worldUnit,art:m.art,airborne,depth:airborne?60+i:10+Math.round((400-m.upper)/10)+i,
     bounds:{left:x,right:x+m.width,top:root-m.upper,bottom:root+m.lower}});
   });cursor+=allocation+gap;
  }
 }
 return {slots,groups};
}
export function layoutWarband(units:Member[],assets:Assets){return arrangeWarband(units,assets).slots;}
export function retreatGroundFormation(slots:Map<number,FormationSlot>,assets:Assets){
 const ground=[...slots.values()].filter(s=>!s.airborne);
 const right=Math.max(0,...ground.map(s=>{
  const a=assets.actors[s.art],g=a?.geometry;
  const edge=g?s.x+s.width/2+(g.layout_bounds_px![2]-a.anchor[0])*s.worldUnit/g.source_pixels_per_world_unit:s.bounds.right;
  return Math.max(s.bounds.right,edge);
 }));
 const shift=ground.length?Math.max(100,right-590):0;
 return {shift,slots:new Map([...slots].map(([id,s])=>[id,s.airborne?s:{...s,x:s.x-shift,bounds:{...s.bounds,left:s.bounds.left-shift,right:s.bounds.right-shift}}]))};
}
