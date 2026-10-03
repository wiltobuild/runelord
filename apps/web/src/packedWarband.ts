import type { Assets } from "./assets";
import { summonArt, type FormationSlot } from "./warbandLayout";
type Member = { id:number; kind:string };
export type PackedGroup = { kind:string; ids:number[]; x:number; top:number; width:number; airborne:boolean };

export function packCrowdedWarband(units:Member[], assets:Assets, regular:Map<number,FormationSlot>) {
  const crowded = units.some(u => (regular.get(u.id)?.worldUnit ?? 0) < (u.kind === "hellhound" ? 225.8064515 : 200) * .99);
  if (!crowded || new Set(units.map(u=>u.kind)).size === units.length) return null;
  const kinds = [...new Set(units.map(u=>u.kind))];
  const groups:PackedGroup[] = [];
  const slots = new Map<number,FormationSlot>();
  let cursor=0;
  for(const kind of kinds.filter(k=>k!=="imp").concat(kinds.filter(k=>k==="imp"))) {
    const members=units.filter(u=>u.kind===kind), airborne=kind==="imp";
    // Air and ground consume separate lanes: ground crowding must not stack flyers.
    if (airborne) {
      const a=assets.actors[summonArt(kind,assets)], g=a.geometry!;
      const scale=200/g.source_pixels_per_world_unit;
      const width=Math.max(a.anchor[0]-g.layout_bounds_px![0],g.layout_bounds_px![2]-a.anchor[0])*scale*2+12;
      if(members.length*width+(members.length-1)*16<=700) {
        members.forEach((u,i)=>{
          const left=700-members.length*width-(members.length-1)*16+i*(width+16);
          const root=184,top=root-(a.anchor[1]-g.layout_bounds_px![1])*scale-50;
          slots.set(u.id,{x:left,top,width,root,worldUnit:200,art:summonArt(kind,assets),airborne:true,bounds:{left,right:left+width,top,bottom:root}});
        });
        continue;
      }
    }
    // Preserve the full-size open row whenever this ground row already fits.
    if(!airborne && units.filter(u=>u.kind!=="imp").every(u=>(regular.get(u.id)?.worldUnit??0)>=(u.kind==="hellhound"?225.8064515:200)*.99)) {
      for(const u of members) slots.set(u.id,regular.get(u.id)!);
      continue;
    }
    const step=kind==="pit-brute"?115:90;
    const groundKinds=kinds.filter(k=>k!=="imp");
    const required=groundKinds.reduce((sum,k)=>sum+250+(units.filter(u=>u.kind===k).length-1)*(k==="pit-brute"?115:90),0)+Math.max(0,groundKinds.length-1)*24;
    // Tighten horizontal overlap only; model scale and root registration stay fixed.
    const overlapFactor=Math.min(1,Math.max(.15,(820-groundKinds.length*250-Math.max(0,groundKinds.length-1)*24)/Math.max(1,required-groundKinds.length*250-Math.max(0,groundKinds.length-1)*24)));
    const stride=airborne?75:step*overlapFactor;
    const width=(airborne?160:250)+(members.length-1)*stride;
    const x=airborne?Math.max(0,820-width):cursor;
    members.forEach((u,i)=>{
      const art=summonArt(kind,assets), a=assets.actors[art], g=a.geometry!;
      const worldUnit=kind==="hellhound"?225.8064515:200;
      const upper=(a.anchor[1]-g.layout_bounds_px![1])*worldUnit/g.source_pixels_per_world_unit;
      const root=(airborne?184+Math.max(0,members.length-3)*5:376)-i*(airborne?4:8), top=root-upper;
      const left=x+i*stride, memberWidth=airborne?160:250;
      slots.set(u.id,{x:left,top,width:memberWidth,root,worldUnit,art,airborne,bounds:{left,right:left+memberWidth,top,bottom:root}});
    });
    groups.push({kind,ids:members.map(u=>u.id),x,top:airborne?-18:386,width,airborne});
    if(!airborne)cursor+=width+24;
  }
  return {slots,groups};
}
