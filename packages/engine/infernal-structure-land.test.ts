import test from 'node:test';
import assert from 'node:assert/strict';
import { INFERNAL_CIRCUIT_ANCHORS, INFERNAL_CIRCUIT_ISLANDS, INFERNAL_MAP_ANCHORS, INFERNAL_STRUCTURE_PLATEAUS, INFERNAL_CIRCUIT_EDGES, infernalStructureFits, infernalStructureFootprint } from '../../apps/web/src/infernalMapLayout';

test('Every circuit structure has its entire padded base on the correct grey island',()=>{
 for(const anchor of INFERNAL_CIRCUIT_ANCHORS) assert.ok(infernalStructureFits(anchor,INFERNAL_CIRCUIT_ISLANDS[anchor.row],anchor.row===13),anchor.id);
 const throne=INFERNAL_CIRCUIT_ANCHORS.find(a=>a.row===13)!;
 assert.deepEqual(infernalStructureFootprint(throne,true),{x:873.5,y:281,width:221,height:49});
});
test('Legacy map markers also have complete ground contact on grey terrain',()=>{
 for(const anchor of INFERNAL_MAP_ANCHORS) assert.ok(INFERNAL_STRUCTURE_PLATEAUS.some((_,i)=>infernalStructureFits(anchor,i)),anchor.id);
});
test('Structure ground footprints are disjoint, including the largest preview tier',()=>{
 for(const anchors of [INFERNAL_MAP_ANCHORS,INFERNAL_CIRCUIT_ANCHORS]) for(let i=0;i<anchors.length;i++)for(let j=i+1;j<anchors.length;j++){
  const a=infernalStructureFootprint(anchors[i],anchors[i].id==='infernal-v2-13-0'),b=infernalStructureFootprint(anchors[j],anchors[j].id==='infernal-v2-13-0');
  assert.ok(a.x+a.width<=b.x||b.x+b.width<=a.x||a.y+a.height<=b.y||b.y+b.height<=a.y,anchors[i].id+' '+anchors[j].id);
 }
});
test('Rendered route endpoints follow safe visual anchors rather than old engine coordinates',()=>{
 for(const edge of INFERNAL_CIRCUIT_EDGES){const from=INFERNAL_CIRCUIT_ANCHORS.find(a=>a.id===edge.from)!,to=INFERNAL_CIRCUIT_ANCHORS.find(a=>a.id===edge.to)!;
  assert.equal(edge.points[0].x,from.x);assert.equal(edge.points[0].y,from.y);assert.equal(edge.points.at(-1)!.x,to.x);assert.equal(edge.points.at(-1)!.y,to.y);
 }
});
// Bridges were removed from the rendered map on 2026-10-12. Their retained legacy geometry does not constrain visible structures.
