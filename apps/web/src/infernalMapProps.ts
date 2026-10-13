import {
  INFERNAL_MAP_ANCHORS, INFERNAL_CIRCUIT_ANCHORS, INFERNAL_MAP_EDGES,
  INFERNAL_CIRCUIT_EDGES, INFERNAL_STRUCTURE_PLATEAUS, INFERNAL_BRIDGES,
  type MapPoint, type MapAnchor, type MapEdge,
} from './infernalMapLayout';

export type PropBounds = { x: number; y: number; width: number; height: number };
export type MapProp = PropBounds & { id: string; asset: string; kind: string; island: number };
export type PropLayout = { land: readonly (readonly MapPoint[])[]; structures: PropBounds[]; paths: MapPoint[][]; bridges: PropBounds[] };
const corners = (b: PropBounds): MapPoint[] => [{x:b.x,y:b.y},{x:b.x+b.width,y:b.y},{x:b.x+b.width,y:b.y+b.height},{x:b.x,y:b.y+b.height}];
const expand = (b: PropBounds, margin: number): PropBounds => ({x:b.x-margin,y:b.y-margin,width:b.width+margin*2,height:b.height+margin*2});
export const propsOverlap = (a: PropBounds,b: PropBounds) => a.x<=b.x+b.width&&a.x+a.width>=b.x&&a.y<=b.y+b.height&&a.y+a.height>=b.y;
const cross = (a:MapPoint,b:MapPoint,c:MapPoint) => (b.x-a.x)*(c.y-a.y)-(b.y-a.y)*(c.x-a.x);
function segmentsTouch(a:MapPoint,b:MapPoint,c:MapPoint,d:MapPoint) {
  if(Math.max(a.x,b.x)<Math.min(c.x,d.x)||Math.max(c.x,d.x)<Math.min(a.x,b.x)||Math.max(a.y,b.y)<Math.min(c.y,d.y)||Math.max(c.y,d.y)<Math.min(a.y,b.y)) return false;
  return cross(a,b,c)*cross(a,b,d)<=0&&cross(c,d,a)*cross(c,d,b)<=0;
}
function inside(p:MapPoint,polygon:readonly MapPoint[]) {
  let yes=false;
  for(let i=0,j=polygon.length-1;i<polygon.length;j=i++) {
    const a=polygon[i],b=polygon[j];
    if((a.y>p.y)!==(b.y>p.y)&&p.x<(b.x-a.x)*(p.y-a.y)/(b.y-a.y)+a.x) yes=!yes;
  }
  return yes;
}
/** Full padded image rectangle, not merely its ground contact, must fit inside one island. */
export function propOnIsland(box:PropBounds,polygon:readonly MapPoint[]) {
  const points=corners(expand(box,3));
  return points.every(p=>inside(p,polygon))&&!points.some((a,i)=>polygon.some((c,j)=>segmentsTouch(a,points[(i+1)%4],c,polygon[(j+1)%polygon.length])));
}
export function pathTouchesProp(box:PropBounds,path:readonly MapPoint[],clearance=7) {
  const b=expand(box,clearance),points=corners(b);
  return path.some(p=>p.x>=b.x&&p.x<=b.x+b.width&&p.y>=b.y&&p.y<=b.y+b.height)||path.slice(1).some((p,i)=>points.some((a,j)=>segmentsTouch(path[i],p,a,points[(j+1)%4])));
}
/** Exclusions use every authored slot and route, including slots not selected by this seed. */
export function makePropLayout(circuit:boolean,anchors:readonly MapAnchor[]=circuit?INFERNAL_CIRCUIT_ANCHORS:INFERNAL_MAP_ANCHORS,edges:readonly MapEdge[]=circuit?INFERNAL_CIRCUIT_EDGES:INFERNAL_MAP_EDGES):PropLayout {
  const bossRow=Math.max(...anchors.map(a=>a.row));
  return {
    land:INFERNAL_STRUCTURE_PLATEAUS,
    structures:anchors.map(a=>a.row===bossRow&&circuit
      ? {x:a.x-150,y:a.y-286,width:300,height:342}
      : {x:a.x-83,y:a.y-94,width:166,height:152}),
    paths:edges.map(e=>e.points),
    bridges:circuit?INFERNAL_BRIDGES.map(({box,rotation})=>{
      const angle=rotation*Math.PI/180,width=Math.abs(Math.cos(angle))*box.width+Math.abs(Math.sin(angle))*box.height,height=Math.abs(Math.sin(angle))*box.width+Math.abs(Math.cos(angle))*box.height;
      return {x:box.x+box.width/2-width/2-5,y:box.y+box.height/2-height/2-5,width:width+10,height:height+10};
    }):edges.flatMap(e=>e.bridges.map(({a,b})=>({x:Math.min(a.x,b.x)-16,y:Math.min(a.y,b.y)-16,width:Math.abs(a.x-b.x)+32,height:Math.abs(a.y-b.y)+32}))),
  };
}
export function safeMapProp(box:PropBounds,layout:PropLayout,placed:readonly PropBounds[]=[]) {
  return layout.land.some(poly=>propOnIsland(box,poly))
    && !layout.structures.some(b=>propsOverlap(box,b))
    && !layout.bridges.some(b=>propsOverlap(box,b))
    && !layout.paths.some(path=>pathTouchesProp(box,path))
    && !placed.some(b=>propsOverlap(expand(box,14),b));
}
const types=[['bones-large',42],['tree',31],['geyser',26],['bones-medium',28],['pool',30],['rock',22],['bones-small',19]] as const;
export const mapDetailOpacity=(zoom:number)=>Math.max(0,Math.min(1,(zoom-1.15)/.6));
/** Seeded decorative RNG is isolated from gameplay and stable while moving the camera. */
export function generateMapProps(seed:number,layout:PropLayout):MapProp[] {
  let rng=(seed^0x6d617070)>>>0;
  const random=()=>{rng=(Math.imul(rng,1664525)+1013904223)>>>0;return rng/4294967296;};
  const result:MapProp[]=[];
  // Two rounds cover each variation; a third adds sparse smaller details where safe.
  for(let round=0;round<3;round++) for(let type=0;type<types.length;type++) {
    const [kind,size]=types[type];
    const variant=1+(round+type)%2;
    for(let attempt=0;attempt<700;attempt++) {
      const island=Math.floor(random()*layout.land.length),poly=layout.land[island];
      if(result.filter(p=>p.island===island).length>=4) continue;
      const xs=poly.map(p=>p.x),ys=poly.map(p=>p.y);
      const box={x:Math.min(...xs)+random()*(Math.max(...xs)-Math.min(...xs)-size),y:Math.min(...ys)+random()*(Math.max(...ys)-Math.min(...ys)-size),width:size,height:size};
      if(!propOnIsland(box,poly)||!safeMapProp(box,layout,result)) continue;
      result.push({...box,id:`detail-${round}-${type}`,asset:`${kind}-${variant}`,kind,island});break;
    }
  }
  return result;
}


