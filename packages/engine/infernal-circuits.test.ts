import test from 'node:test';
import assert from 'node:assert/strict';
import {INFERNAL_CIRCUIT_SLOTS} from './infernalTopology';
import {INFERNAL_CIRCUIT_EDGES,INFERNAL_BRIDGES,infernalPointOnLand,infernalPointOnGreyGround,infernalStructureFits} from '../../apps/web/src/infernalMapLayout';
test('Island circuits have distinct land footprints and a larger top-middle throne',()=>{
 const nodes=INFERNAL_CIRCUIT_SLOTS;assert.equal(nodes.length,21);
 for(const n of nodes)assert.ok(infernalPointOnLand(n),n.id);
 for(let i=0;i<nodes.length;i++)for(let j=i+1;j<nodes.length;j++){
  const a=nodes[i],b=nodes[j];if(a.kind==='boss'||b.kind==='boss')continue;
  assert.ok(Math.abs(a.x-b.x)>=94||Math.abs(a.y-b.y)>=80,'Overlapping encounters '+a.id+' '+b.id);
 }
 const boss=nodes.find(n=>n.kind==='boss')!;assert.equal(boss.x,836);assert.equal(boss.island,'throne');
});
test('Physical bridge deck centerlines never intersect',()=>{
 function orient(a:{x:number;y:number},b:{x:number;y:number},c:{x:number;y:number}){return(b.x-a.x)*(c.y-a.y)-(b.y-a.y)*(c.x-a.x)}
 for(let i=0;i<INFERNAL_BRIDGES.length;i++)for(let j=i+1;j<INFERNAL_BRIDGES.length;j++){const a=INFERNAL_BRIDGES[i],b=INFERNAL_BRIDGES[j];assert.ok(orient(a.a,a.b,b.a)*orient(a.a,a.b,b.b)>0||orient(b.a,b.b,a.a)*orient(b.a,b.b,a.b)>0,a.id+' crosses '+b.id)}
});
test('Circuit paths only cross lava within a reserved bridge footprint',()=>{
 for(const e of INFERNAL_CIRCUIT_EDGES)for(let i=1;i<e.points.length;i++)for(let k=1;k<40;k++){
 const a=e.points[i-1],b=e.points[i],p={x:a.x+(b.x-a.x)*k/40,y:a.y+(b.y-a.y)*k/40};
 assert.ok(infernalPointOnGreyGround(p)||INFERNAL_BRIDGES.some(q=>{const r=-q.rotation*Math.PI/180,dx=p.x-(q.box.x+q.box.width/2),dy=p.y-(q.box.y+q.box.height/2);return Math.abs(dx*Math.cos(r)-dy*Math.sin(r))<=q.box.width/2&&Math.abs(dx*Math.sin(r)+dy*Math.cos(r))<=q.box.height/2}),e.id+' unbridged lava '+JSON.stringify(p));
 }
});
test('Island routes cannot skip required encounters or loop; service budgets match every route',()=>{
 const nodes=INFERNAL_CIRCUIT_SLOTS;
 function walk(id:string,shops=0,treasures=0,elites=0,depth=0){const n=nodes.find(n=>n.id===id)!;assert.ok(depth<20);shops+=Number(n.kind==='shop');treasures+=Number(n.kind==='treasure');elites+=Number(n.kind==='elite');if(!n.next.length){assert.equal(n.kind,'boss');assert.equal(shops,2);assert.equal(treasures,2);assert.equal(elites,2);assert.equal(depth,13);}for(const next of n.next.filter(id=>!(n.row===11&&id==='infernal-v2-13-0'))){assert.ok(nodes.find(x=>x.id===next)!.row>n.row);walk(next,shops,treasures,elites,depth+1)}}
 nodes.filter(n=>n.row===0).forEach(n=>walk(n.id));
});

 test('Uniform bridges preserve source aspect, land on grey, and give every island two crossings',()=>{
 const counts=Array(8).fill(0);
 for(const b of INFERNAL_BRIDGES){const ratio=b.sourceSize[0]/b.sourceSize[1];assert.equal(b.rotation,0);assert.ok(Math.abs(b.box.width/b.box.height-ratio)<1e-9);
  assert.ok(infernalStructureFits({...b.a,artScale:0},b.islands[0],false,0),b.id+' start');assert.ok(infernalStructureFits({...b.b,artScale:0},b.islands[1],false,0),b.id+' end');b.islands.forEach(i=>counts[i]++);
 }counts.forEach((n,i)=>assert.ok(n>=2,'island '+i));
 });
