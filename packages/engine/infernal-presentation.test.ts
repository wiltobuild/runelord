import test from 'node:test';
import assert from 'node:assert/strict';
import { generateInfernalJourney,infernalShopAppearance } from './infernal';
import { INFERNAL_MAP_ANCHORS,INFERNAL_MAP_EDGES,infernalMapEdge,infernalPointOnLand,MAP_STAGE } from '../../apps/web/src/infernalMapLayout';
test('Infernal appearance is stable, diverse, and leaves generation untouched',()=>{
 const before=generateInfernalJourney(118),seen=new Set<string>();
 for(let seed=0;seed<100;seed++) for(let row=0;row<12;row++){
  const id=`infernal-${row}-1`,a=infernalShopAppearance(seed,id);
  assert.deepEqual(a,infernalShopAppearance(seed,id));assert.ok(a.shop>=1&&a.shop<=3);assert.ok(a.merchant>=1&&a.merchant<=3);seen.add(`${a.shop}:${a.merchant}`);
 }
 assert.equal(seen.size,9);assert.deepEqual(before,generateInfernalJourney(118));
 assert.deepEqual(infernalShopAppearance(118,null),infernalShopAppearance(118,null));
});
test('34 unique map anchors stand on traced terrain and all 73 possible connections exist',()=>{
 assert.equal(INFERNAL_MAP_ANCHORS.length,34);assert.equal(new Set(INFERNAL_MAP_ANCHORS.map(p=>p.id)).size,34);assert.equal(INFERNAL_MAP_EDGES.length,73);
 for(const p of INFERNAL_MAP_ANCHORS){assert.ok(p.x>0&&p.x<MAP_STAGE.width&&p.y>0&&p.y<MAP_STAGE.height);assert.ok(infernalPointOnLand(p),`${p.id} not on land ${p.x},${p.y}`);}
 for(let seed=0;seed<200;seed++)for(const node of generateInfernalJourney(seed).nodes)for(const next of node.next)assert.ok(infernalMapEdge(node.id,next),`${node.id}->${next}`);
});
test('Every route gap sample is covered by a bridge and reaches the exact next anchor',()=>{
 for(const edge of INFERNAL_MAP_EDGES){
  const a=INFERNAL_MAP_ANCHORS.find(p=>p.id===edge.from)!,b=INFERNAL_MAP_ANCHORS.find(p=>p.id===edge.to)!;
  assert.deepEqual(edge.points[0],{x:a.x,y:a.y});assert.deepEqual(edge.points.at(-1),{x:b.x,y:b.y});
  for(let step=0;step<=100;step++){
   const t=step/100,p={x:a.x+(b.x-a.x)*t,y:a.y+(b.y-a.y)*t};if(infernalPointOnLand(p))continue;
   assert.ok(edge.bridges.some(bridge=>p.x>=Math.min(bridge.a.x,bridge.b.x)-.1&&p.x<=Math.max(bridge.a.x,bridge.b.x)+.1&&p.y>=Math.min(bridge.a.y,bridge.b.y)-.1&&p.y<=Math.max(bridge.a.y,bridge.b.y)+.1),`${edge.id} gap at ${t}`);
  }
 }
});
