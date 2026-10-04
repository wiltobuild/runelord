/** Map-1 warboard placement manifest. Coordinates use the uncropped 1672 × 941 master. */
import { INFERNAL_CIRCUIT_SLOTS } from '../../../packages/engine/infernalTopology';
export type MapPoint={x:number;y:number};
export type MapAnchor=MapPoint&{id:string;row:number;lane:number;tier:0|1|2;artScale?:number};
export const MAP_STAGE={width:1672,height:941};
// Each row is [rear, middle, foreground]; points sit on the cleared plateaus, not a regular grid.
const placements=[
 [[268,283],[214,384],[182,530]],
 [[356,301],[315,380],[314,571]],
 [[421,356],[425,387],[423,599]],
 [[642,290],[523,371],[539,505]],
 [[757,416],[665,455],[652,543]],
 [[846,397],[789,446],[778,565]],
 [[963,243],[907,325],[903,531]],
 [[1022,274],[1030,326],[1033,479]],
 [[1198,406],[1196,590],[1090,638]],
 [[1316,373],[1300,412],[1284,582]],
 [[1422,340],[1410,401],[1430,552]],
];
export const INFERNAL_MAP_ANCHORS:MapAnchor[]=placements.flatMap((rowPoints,row)=>rowPoints.map(([x,y],lane)=>({id:`infernal-${row}-${lane}`,row,lane,x,y,tier:Math.min(2,Math.floor(row/4)) as 0|1|2}))).concat([{id:'infernal-11-0',row:11,lane:0,x:1434,y:371,tier:2}]);
export const infernalAnchor=(id:string)=>INFERNAL_MAP_ANCHORS.find(p=>p.id===id) ?? INFERNAL_CIRCUIT_ANCHORS.find(p=>p.id===id);
/** Walkable surfaces traced against approved map-template.png; their complement is bridged. */
export const INFERNAL_TERRAIN_PLATEAUS:readonly (readonly MapPoint[])[]=[
 [[175,240],[330,235],[475,275],[480,310],[345,332],[166,295]],
 [[165,340],[438,315],[620,345],[592,390],[368,445],[135,420]],
 [[147,481],[275,471],[329,515],[500,571],[490,626],[289,590],[126,556]],
 [[544,275],[675,250],[751,278],[730,309],[580,319]],
 [[550,415],[818,355],[1000,386],[1120,450],[1100,492],[902,590],[740,610],[435,538],[430,505]],
 [[826,255],[920,205],[1085,220],[1085,260],[990,285],[1175,310],[1140,345],[1040,370],[780,335],[780,300]],
 [[1170,340],[1375,265],[1495,260],[1550,420],[1330,460],[1100,405]],
 [[1070,555],[1285,495],[1520,510],[1580,550],[1390,630],[920,695],[875,665]],
].map(poly=>poly.map(([x,y])=>({x,y})));
const inside=(p:MapPoint,polygon:readonly MapPoint[])=>{
 let result=false;for(let i=0,j=polygon.length-1;i<polygon.length;j=i++){
  const a=polygon[i],b=polygon[j];if((a.y>p.y)!==(b.y>p.y)&&p.x<(b.x-a.x)*(p.y-a.y)/(b.y-a.y)+a.x)result=!result;
 }return result;
};
export const infernalPointOnLand=(point:MapPoint)=>INFERNAL_TERRAIN_PLATEAUS.some(p=>inside(point,p));
/** Conservative exposed grey ground traced against map-hd.png (not the earlier map template).
 * A structure's footprint is its ground-contact base; towers may project above it. */
export const INFERNAL_STRUCTURE_PLATEAUS:readonly (readonly MapPoint[])[]=[
 [[220,248],[310,255],[382,267],[450,272],[461,288],[429,304],[388,318],[295,313],[224,289]],
 [[170,356],[280,337],[375,323],[450,327],[556,340],[606,358],[548,386],[482,410],[400,434],[295,447],[216,421],[150,397]],
 [[151,485],[231,482],[278,491],[306,515],[335,540],[428,556],[502,585],[523,610],[450,634],[350,619],[292,590],[205,585],[136,568],[115,544],[128,513]],
 [[578,263],[672,255],[702,269],[723,284],[711,298],[660,308],[591,297],[565,283]],
 [[723,385],[786,365],[868,357],[918,380],[994,397],[1038,421],[1095,465],[1115,481],[1058,509],[977,536],[896,574],[799,610],[716,623],[670,598],[594,569],[541,545],[465,526],[438,511],[463,489],[527,464],[601,435],[657,411]],
 [[892,215],[958,207],[1029,212],[1085,222],[1060,242],[1104,277],[1150,294],[1120,313],[1096,335],[1046,353],[975,367],[923,359],[896,340],[832,333],[814,324],[843,311],[861,292],[851,278],[901,260],[918,240],[879,229]],
 [[1252,351],[1338,327],[1397,304],[1457,289],[1481,350],[1528,389],[1555,413],[1501,430],[1447,438],[1398,441],[1349,458],[1254,455],[1188,437],[1123,415],[1087,404],[1128,386],[1196,367]],
 [[1009,624],[1124,571],[1247,535],[1349,516],[1438,516],[1516,535],[1543,551],[1495,580],[1415,591],[1317,626],[1237,655],[1171,664],[1080,689],[958,693],[898,674]],
].map(poly=>poly.map(([x,y])=>({x,y})));
export const infernalPointOnGreyGround=(point:MapPoint)=>INFERNAL_STRUCTURE_PLATEAUS.some(poly=>inside(point,poly));
export const infernalStructureFootprint=(anchor:MapPoint&{artScale?:number},boss=false)=>{const scale=anchor.artScale??1,width=(boss?221:82)*scale,height=(boss?49:24)*scale;return {x:anchor.x-width/2,y:anchor.y-height,width,height};};
export function infernalStructureFits(anchor:MapPoint&{artScale?:number},island:number,boss=false,margin=3) {
 const b=infernalStructureFootprint(anchor,boss),poly=INFERNAL_STRUCTURE_PLATEAUS[island];
 // Sample every edge, as a concave island can contain the corners but cut across an edge.
 for(let i=0;i<=20;i++) {
  const t=i/20,x=b.x-margin+(b.width+margin*2)*t,y=b.y-margin+(b.height+margin*2)*t;
  if(!inside({x,y:b.y-margin},poly)||!inside({x,y:b.y+b.height+margin},poly)||!inside({x:b.x-margin,y},poly)||!inside({x:b.x+b.width+margin,y},poly))return false;
 }return true;
}
const CIRCUIT_GROUND_POSITIONS:number[][][]=[
 [[175,550],[307,570],[446,610]],[[237,521]],[[220,392],[500,380]],[[365,412]],
 [[275,284],[402,294]],[[331,310]],[[645,290]],[[590,488],[813,447]],[[827,557]],
 [[1060,652],[1442,557]],[[1240,600]],[[1270,400],[1467,402]],[[1385,354]],[[984,330]],
];
export const INFERNAL_CIRCUIT_ISLANDS=[2,2,1,1,0,0,3,4,4,7,7,6,6,5];

export type MapEdge={id:string;from:string;to:string;points:MapPoint[];bridges:{a:MapPoint;b:MapPoint}[]};
function edge(from:MapAnchor,to:MapAnchor):MapEdge {
 const points=[{x:from.x,y:from.y},{x:to.x,y:to.y}];
 const bridges:MapEdge['bridges']=[];let start:number|null=null;
 const point=(t:number)=>({x:from.x+(to.x-from.x)*t,y:from.y+(to.y-from.y)*t});
 for(let i=0;i<=100;i++){
  const crossing=!infernalPointOnLand(point(i/100));
  if(crossing&&start===null)start=Math.max(0,(i-3)/100);
  if(start!==null&&(!crossing||i===100)){bridges.push({a:point(start),b:point(Math.min(1,(i+3)/100))});start=null;}
 }
 return {id:`${from.id}:${to.id}`,from:from.id,to:to.id,points,bridges};
}
/** Every possible edge is authored, even when a particular seed omits it. */
export const INFERNAL_MAP_EDGES:MapEdge[]=INFERNAL_MAP_ANCHORS.flatMap(from=>{
 if(from.row===11)return [];
 const targets=from.row===10?[infernalAnchor('infernal-11-0')!]:INFERNAL_MAP_ANCHORS.filter(p=>p.row===from.row+1&&Math.abs(p.lane-from.lane)<=1);
 return targets.map(to=>edge(from,to));
});
export const infernalMapEdge=(from:string,to:string)=>INFERNAL_MAP_EDGES.find(e=>e.from===from&&e.to===to) ?? INFERNAL_CIRCUIT_EDGES.find(e=>e.from===from&&e.to===to);
export const MAP_LAVA_HOTSPOTS=[{x:31.5,y:31,radius:3},{x:41,y:39,radius:4},{x:34.5,y:72,radius:4},{x:49,y:26,radius:3},{x:63,y:65,radius:4},{x:69,y:31,radius:3},{x:74,y:55,radius:3},{x:21,y:55,radius:4},{x:87,y:69,radius:3}] as const;
/** Circuit layout: one physical bridge per lava crossing, shared by branch routes. */
export type AuthoredBridge={id:string;a:MapPoint;b:MapPoint;variant:0|1|2;asset:string;islands:readonly [number,number];box:{x:number;y:number;width:number;height:number};rotation:number;sourceSize:readonly [number,number];sourceLandings:readonly [MapPoint,MapPoint]};
// Authored level-deck isometric projections. The artwork is never rotated: posts stay upright.
const BRIDGE_PROJECTIONS={rise:{size:[1536,1024],left:{x:400,y:775},right:{x:1180,y:300}},fall:{size:[1536,1024],left:{x:300,y:260},right:{x:1210,y:800}},shallow:{size:[1774,887],left:{x:110,y:445},right:{x:1680,y:325}}} as const;
function authoredBridge(id:string,left:MapPoint,span:number,islands:readonly [number,number],kind:keyof typeof BRIDGE_PROJECTIONS,reverse=false):AuthoredBridge {
 const p=BRIDGE_PROJECTIONS[kind],scale=span/(p.right.x-p.left.x),right={x:left.x+span,y:left.y+(p.right.y-p.left.y)*scale};
 return {id,a:reverse?right:left,b:reverse?left:right,islands,variant:2,asset:`/infernal-assets/bridge-iso-${kind}.webp`,box:{x:left.x-p.left.x*scale,y:left.y-p.left.y*scale,width:p.size[0]*scale,height:p.size[1]*scale},rotation:0,sourceSize:p.size,sourceLandings:[p.left,p.right]};
}
export const INFERNAL_BRIDGES:AuthoredBridge[]=[
 authoredBridge('ash-west',{x:285,y:505},130,[2,1],'rise'),
 authoredBridge('ash-west-outer',{x:180,y:500},110,[2,1],'rise'),
 authoredBridge('west-ridge',{x:380,y:335},70,[1,0],'rise'),
 authoredBridge('ridge-forge',{x:445,y:290},140,[0,3],'shallow'),
 authoredBridge('forge-heart',{x:660,y:295},165,[3,4],'fall'),
 authoredBridge('heart-south',{x:1005,y:508},165,[4,7],'fall'),
 authoredBridge('south-east',{x:1295,y:540},175,[7,6],'rise'),
 authoredBridge('east-throne',{x:1080,y:337},130,[6,5],'fall',true),
 authoredBridge('east-throne-upper',{x:1140,y:300},180,[6,5],'fall',true),
];
const pairBridges:Record<number,{id:string;before:MapPoint[];after:MapPoint[]}>={
 1:{id:'ash-west',before:[{x:275,y:520}],after:[{x:450,y:410}]},
 3:{id:'west-ridge',before:[{x:280,y:390}],after:[]},
 5:{id:'ridge-forge',before:[{x:410,y:293}],after:[]},
 6:{id:'forge-heart',before:[],after:[{x:825,y:425}]},
 8:{id:'heart-south',before:[{x:955,y:535}],after:[]},
 10:{id:'south-east',before:[{x:1300,y:570}],after:[{x:1440,y:425}]},
 12:{id:'east-throne',before:[{x:1310,y:405}],after:[{x:1050,y:340}]},
};
export const INFERNAL_CIRCUIT_ANCHORS:MapAnchor[]=INFERNAL_CIRCUIT_SLOTS.map(s=>({...s,artScale:s.row===4||s.row===5?.8:1,x:CIRCUIT_GROUND_POSITIONS[s.row][s.lane][0],y:CIRCUIT_GROUND_POSITIONS[s.row][s.lane][1],tier:Math.min(2,Math.floor(s.row/5)) as 0|1|2}));
export const INFERNAL_CIRCUIT_EDGES:MapEdge[]=INFERNAL_CIRCUIT_SLOTS.flatMap(from=>from.next.map(id=>{
 const fromAnchor=INFERNAL_CIRCUIT_ANCHORS.find(s=>s.id===from.id)!;
 const to=INFERNAL_CIRCUIT_ANCHORS.find(s=>s.id===id)!;
 const cross=from.row===11&&to.row===13?{id:'east-throne-upper',before:[{x:1390,y:410}],after:[{x:1090,y:310}]}:from.row===1&&to.lane===0?{id:'ash-west-outer',before:[{x:200,y:510}],after:[{x:300,y:415}]}:pairBridges[from.row],bridge=cross?INFERNAL_BRIDGES.find(b=>b.id===cross.id)!:null;
 const points=bridge&&cross?[fromAnchor,...cross.before,bridge.a,bridge.b,...cross.after,to]:from.row===0&&from.lane===2?[fromAnchor,{x:345,y:555},{x:310,y:520},to]:[fromAnchor,to];
 return {id:from.id+':'+id,from:from.id,to:id,points,bridges:bridge?[bridge]:[]};
}));
