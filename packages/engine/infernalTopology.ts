/** Authored Infernal island circuits. Seed varies encounters, not unsafe geometric crossings. */
export type InfernalSlot={id:string;row:number;lane:number;island:string;x:number;y:number;kind:'combat'|'elite'|'shop'|'treasure'|'boss';next:string[]};
const rows:[string,InfernalSlot['kind'],[number,number][]][]=[
 ['ash-foot','combat',[[180,530],[310,580],[445,585]]],
 ['ash-foot','combat',[[280,480]]],
 ['western-shelf','combat',[[215,375],[510,380]]],
 ['western-shelf','shop',[[375,410]]],
 ['cinder-ridge','combat',[[220,265],[435,285]]],
 ['cinder-ridge','treasure',[[340,292]]],
 ['forge-islet','elite',[[650,280]]],
 ['heartland','combat',[[610,470],[825,425]]],
 ['heartland','shop',[[830,550]]],
 ['southern-crown','combat',[[1090,635],[1450,555]]],
 ['southern-crown','treasure',[[1250,585]]],
 ['eastern-wall','combat',[[1270,365],[1480,390]]],
 ['eastern-wall','elite',[[1390,300]]],
 ['throne','boss',[[836,320]]],
];
export const INFERNAL_CIRCUIT_SLOTS:InfernalSlot[]=rows.flatMap(([island,kind,points],row)=>points.map(([x,y],lane)=>({id:`infernal-v2-${row}-${lane}`,row,lane,island,kind,x,y,next:row===rows.length-1?[]:rows[row+1][2].map((_,i)=>`infernal-v2-${row+1}-${i}`)})));
// A second eastern crossing opens after the guardian is defeated; it is not a boss shortcut.
INFERNAL_CIRCUIT_SLOTS.find(n=>n.id==='infernal-v2-11-1')!.next.push('infernal-v2-13-0');
