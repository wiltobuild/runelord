import type { Assets } from "./assets";
import { arrangeWarband, type FormationSlot } from "./warbandLayout";
export type { PackedGroup } from "./warbandLayout";
export function packCrowdedWarband(units:{id:number;kind:string}[],assets:Assets,_regular:Map<number,FormationSlot>){
 const layout=arrangeWarband(units,assets);return layout.groups.length?layout:null;
}
