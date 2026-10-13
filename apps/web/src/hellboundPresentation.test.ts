import {test} from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {arrangeWarband,retreatGroundFormation,measureSummon} from './warbandLayout';
import type {Assets} from './assets';
const assets=JSON.parse(fs.readFileSync(new URL('../../../packages/assets/manifest.json',import.meta.url),'utf8')) as Assets;
test('Legion formation preserves approved order with Pikeman and Legionary swapped',()=>{
 const kinds=['iron-legionary','ironhorn-bulwark','maledictor','dread-vanguard','ash-pikeman'];
 const army=kinds.map((kind,id)=>({kind,id})),layout=arrangeWarband(army,assets);
 const order=[...layout.slots].sort((a,b)=>(a[1].x+a[1].width/2)-(b[1].x+b[1].width/2)).map(([id])=>kinds[id]);
 assert.deepEqual(order,['dread-vanguard','maledictor','ash-pikeman','ironhorn-bulwark','iron-legionary']);
 assert.equal(retreatGroundFormation(layout.slots,assets).shift,0);
 const v=measureSummon(army[3],assets),l=measureSummon(army[0],assets);
 assert.ok(v.upper>l.upper*1.1 && v.upper<l.upper*1.2);
});
test('three Maledictors retain fixed model scale and independently readable controls',()=>{
 const army=['maledictor','maledictor','maledictor','ironhorn-bulwark'].map((kind,id)=>({kind,id}));
 const layout=arrangeWarband(army,assets),casters=layout.groups.filter(g=>g.ids.some(id=>id<3));
 assert.equal(casters.length,3);assert.ok(casters.every(g=>g.ids.length===1&&g.width>=120));
 for(const u of army)assert.equal(layout.slots.get(u.id)!.worldUnit,measureSummon(u,assets).worldUnit);
 assert.equal(new Set(army.map(u=>layout.slots.get(u.id)!.x)).size,4);
});


test('sparse Legion soldiers spread naturally before overlap is necessary',()=>{
 for(const kind of ['iron-legionary','maledictor','ash-pikeman']){
  const army=[{id:1,kind},{id:2,kind}],layout=arrangeWarband(army,assets);
  const [a,b]=[...layout.slots.values()];
  assert.ok(b.bounds.left-a.bounds.right>=15.99,`${kind} pair should not stack`);
  assert.equal(a.root,376);assert.equal(b.root,376);
 }
});

test('one through ten soldiers and Imps retain scale, bounded lanes and unique controls',()=>{
 const kinds=['dread-vanguard','maledictor','ash-pikeman','ironhorn-bulwark','iron-legionary'];
 for(let count=1;count<=10;count++)for(const roster of [
  Array.from({length:count},(_,i)=>kinds[i%kinds.length]),
  Array.from({length:count},()=> 'maledictor'),
  Array.from({length:count},(_,i)=>i%2?'imp':'iron-legionary'),
 ]){
  const army=roster.map((kind,id)=>({kind,id})),layout=arrangeWarband(army,assets),reversed=arrangeWarband([...army].reverse(),assets);
  assert.equal(layout.slots.size,count);assert.equal(layout.groups.length,count);
  for(const u of army){
   const slot=layout.slots.get(u.id)!;
   assert.equal(slot.worldUnit,measureSummon(u,assets).worldUnit);
   assert.deepEqual(slot,reversed.slots.get(u.id));
   assert.ok(slot.bounds.left>=35.99&&slot.bounds.right<=676.01,'full artwork remains in formation');
   assert.equal(layout.groups.filter(g=>g.ids.includes(u.id)).length,1);
  }
  for(const [i,g] of layout.groups.entries()){
   assert.equal(g.ids.length,1);assert.ok(g.width>=128);
   for(const other of layout.groups.slice(i+1))if(other.top===g.top)assert.ok(g.x+g.width<=other.x+.001||other.x+other.width<=g.x+.001,'target controls never overlap');
  }
  const roots=[...layout.slots.values()].filter(s=>!s.airborne).map(s=>s.root);
  assert.ok(Math.max(...roots)-Math.min(...roots)<=6.001,'soldiers stay firmly grounded');
 }
});

test('ten soldiers compact spacing only, compared with a sparse pair',()=>{
 const army=Array.from({length:10},(_,id)=>({id,kind:'iron-legionary'}));
 const pair=arrangeWarband(army.slice(0,2),assets),full=arrangeWarband(army,assets);
 const distance=(layout:ReturnType<typeof arrangeWarband>)=>layout.slots.get(1)!.x-layout.slots.get(0)!.x;
 assert.ok(distance(full)<distance(pair));assert.ok(distance(full)>35);
 assert.equal(new Set([...full.slots.values()].map(s=>s.x)).size,10);
 assert.deepEqual([...new Set(full.groups.map(g=>g.top))],[334,386]);
});
