import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {arrangeWarband,measureSummon} from './warbandLayout';
import type {Assets} from './assets';
const assets=JSON.parse(fs.readFileSync(new URL('../../../packages/assets/manifest.json',import.meta.url),'utf8')) as Assets;
test('adding Gorthak-converted Imp preserves every existing model size',()=>{
 const before=['imp','cerberax','ignivar','gorthak'].map((kind,id)=>({kind,id}));
 const a=arrangeWarband(before,assets),b=arrangeWarband([...before,{kind:'pit-brute',id:4}],assets);
 for(const u of before)assert.equal(a.slots.get(u.id)!.worldUnit,b.slots.get(u.id)!.worldUnit);
 assert.equal(b.slots.get(3)!.worldUnit,200);
 const family=b.groups.find(g=>g.ids.includes(3))!;assert.deepEqual(family.ids,[3,4]);
 assert.ok(b.slots.get(4)!.depth>b.slots.get(3)!.depth);
});
test('arch families keep individual slots with lesser members in front',()=>{
 for(const [arch,lesser] of [['gorthak','pit-brute'],['cerberax','hellhound'],['ignivar','imp']]){
  const result=arrangeWarband([{id:1,kind:lesser},{id:2,kind:arch},{id:3,kind:lesser}],assets);
  assert.deepEqual(result.groups[0].ids,[2,1,3]);
  assert.equal(result.slots.size,3);
  assert.ok(result.slots.get(1)!.depth>result.slots.get(2)!.depth);
  assert.notEqual(result.slots.get(1)!.x,result.slots.get(3)!.x);
 }
});
test('unique crowded units and death ghosts never trigger scaling',()=>{
 const kinds=['gorthak','cerberax','pyre-colossus','pit-brute','pyre-warden','nightmaw','ignivar','imp','hellhound','soul-leech'];
 for(let count=1;count<=kinds.length;count++){
  const units=kinds.slice(0,count).map((kind,id)=>({kind,id}));
  const result=arrangeWarband(units,assets);
  for(const u of units){const s=result.slots.get(u.id)!;assert.equal(s.worldUnit,measureSummon(u,assets).worldUnit);assert.ok(Number.isFinite(s.x)&&s.width>0);}
 }
});
test('crowded unrelated large demons stay behind short units and clear the hero',()=>{
 const units=['pit-brute','pyre-warden','cerberax','pyre-colossus','gorthak'].map((kind,id)=>({kind,id}));
 const {slots}=arrangeWarband(units,assets);
 assert.ok(slots.get(2)!.depth>slots.get(3)!.depth);
 assert.ok(slots.get(1)!.depth>slots.get(4)!.depth);
 for(const slot of slots.values())assert.ok(slot.x>=60);
});
