import test from 'node:test';
import assert from 'node:assert/strict';
import {generateMapProps,makePropLayout,safeMapProp,mapDetailOpacity,pathTouchesProp,propOnIsland} from '../../apps/web/src/infernalMapProps';
import {INFERNAL_CIRCUIT_ANCHORS} from '../../apps/web/src/infernalMapLayout';

test('Zoom details reveal from a distance before entry zoom',()=>{
 assert.equal(mapDetailOpacity(1),0);assert.equal(mapDetailOpacity(1.15),0);assert.ok(Math.abs(mapDetailOpacity(1.45)-.5)<1e-9);assert.equal(mapDetailOpacity(1.75),1);assert.equal(mapDetailOpacity(2.25),1);assert.equal(mapDetailOpacity(4.5),1);
});
test('Full prop rectangles reject path crossings and concave shore cuts',()=>{
 assert.equal(pathTouchesProp({x:10,y:10,width:20,height:20},[{x:0,y:20},{x:40,y:20}]),true);
 assert.equal(pathTouchesProp({x:10,y:10,width:20,height:20},[{x:0,y:2},{x:40,y:2}]),false);
 const polygon=[{x:0,y:0},{x:60,y:0},{x:60,y:60},{x:35,y:60},{x:35,y:25},{x:25,y:25},{x:25,y:60},{x:0,y:60}];
 assert.equal(propOnIsland({x:10,y:10,width:40,height:35},polygon),false);
});
test('Both layouts keep every decoration clear of every slot, route, bridge and other decoration across seeds',()=>{
 for(const circuit of [true,false]) {
  const layout=makePropLayout(circuit),seen=new Set<string>();
  for(let seed=0;seed<40;seed++) {
   const props=generateMapProps(seed,layout);
   assert.deepEqual(props,generateMapProps(seed,layout));assert.ok(props.length>0&&props.length<=21);
   props.forEach((p,i)=>{assert.ok(safeMapProp(p,layout,props.filter((_,j)=>i!==j)),`${circuit}:${seed}:${p.id}`);seen.add(p.asset);});
   for(let island=0;island<layout.land.length;island++)assert.ok(props.filter(p=>p.island===island).length<=4);
  }
  assert.ok(seen.has('rock-1')&&seen.has('rock-2'));
 }
});
test('Moving authored structures changes exclusion bounds without manual prop changes',()=>{
 const anchors=INFERNAL_CIRCUIT_ANCHORS.map((a,i)=>i===0?{...a,x:1250,y:580}:a),layout=makePropLayout(true,anchors);
 for(const prop of generateMapProps(99,layout))assert.ok(safeMapProp(prop,layout));
 assert.equal(layout.structures[0].x,1167);
});


