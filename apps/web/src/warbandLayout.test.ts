import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {arrangeWarband,measureSummon,retreatGroundFormation} from './warbandLayout';
import type {Assets} from './assets';
const assets=JSON.parse(fs.readFileSync(new URL('../../../packages/assets/manifest.json',import.meta.url),'utf8')) as Assets;
test('adding Gorthak-converted Imp preserves every existing model size',()=>{
 const before=['imp','cerberax','ignivar','gorthak'].map((kind,id)=>({kind,id}));
 const a=arrangeWarband(before,assets),b=arrangeWarband([...before,{kind:'pit-brute',id:4}],assets);
 for(const u of before)assert.equal(a.slots.get(u.id)!.worldUnit,b.slots.get(u.id)!.worldUnit);
 assert.equal(b.slots.get(3)!.worldUnit,200);
 const family=b.groups.find(g=>g.ids.includes(3))!;assert.deepEqual(family.ids,[4,3]);
 assert.ok(b.slots.get(4)!.depth>b.slots.get(3)!.depth);
});
test('crowded arch families put foreground members farther from the enemy',()=>{
 for(const [arch,lesser] of [['gorthak','pit-brute'],['cerberax','hellhound'],['ignivar','imp']]){
  const result=arrangeWarband([{id:1,kind:lesser},{id:2,kind:arch},{id:3,kind:lesser},{id:4,kind:lesser},{id:5,kind:lesser}],assets);
  assert.equal(result.slots.size,5);
  for(const group of result.groups){
   const backToFront=[...group.ids].reverse();
   for(let i=1;i<backToFront.length;i++){
    const back=result.slots.get(backToFront[i-1])!,front=result.slots.get(backToFront[i])!;
    assert.ok(front.depth>back.depth);
    assert.ok(front.x+front.width/2<back.x+back.width/2);
    if(!front.airborne)assert.ok(front.root>=back.root);
   }
  }
 }
});

test('three hellhounds form their own stack behind Cerberax when kind groups fit',()=>{
 const result=arrangeWarband(['cerberax','hellhound','hellhound','hellhound'].map((kind,id)=>({kind,id})),assets);
 assert.equal(result.groups.length,2);
 assert.deepEqual(result.groups.find(g=>g.ids.includes(0))!.ids,[0]);
 const members=[1,2,3].map(id=>result.slots.get(id)!).sort((a,b)=>a.depth-b.depth);
 for(let i=1;i<members.length;i++)assert.ok(members[i].x+members[i].width/2<members[i-1].x+members[i-1].width/2);
 const arch=result.slots.get(0)!;
 for(const hound of members)assert.ok(hound.x+hound.width/2<arch.x+arch.width/2);
});

test('same-kind units and arch relatives spread out when the row has room',()=>{
 for(const kinds of [['imp','imp','imp'],['imp','ignivar'],['hellhound','hellhound']]){
  const {slots,groups}=arrangeWarband(kinds.map((kind,id)=>({kind,id})),assets);
  assert.equal(groups.length,0);
  const ordered=[...slots.values()].sort((a,b)=>a.x-b.x);
  for(let i=1;i<ordered.length;i++)assert.ok(ordered[i].bounds.left>=ordered[i-1].bounds.right+15);
 }
});

test('Gloomstalker shares the flying row with Nightmaw and frees ground space',()=>{
 const {slots}=arrangeWarband(['gloomstalker','nightmaw','hellhound'].map((kind,id)=>({kind,id})),assets);
 assert.equal(slots.get(0)!.airborne,true);
 assert.equal(slots.get(1)!.airborne,true);
 assert.equal(slots.get(2)!.airborne,false);
 assert.ok(slots.get(0)!.root<slots.get(2)!.root);
});
test('unique crowded units and death ghosts never trigger scaling',()=>{
 const kinds=['gorthak','cerberax','pyre-colossus','pit-brute','pyre-warden','nightmaw','ignivar','imp','hellhound','soul-leech'];
 for(let count=1;count<=kinds.length;count++){
  const units=kinds.slice(0,count).map((kind,id)=>({kind,id}));
  const result=arrangeWarband(units,assets);
  for(const u of units){const s=result.slots.get(u.id)!;assert.equal(s.worldUnit,measureSummon(u,assets).worldUnit);assert.ok(Number.isFinite(s.x)&&s.width>0);}
 }
});
test('crowded unrelated large demons stay behind short units and use the rear reserve',()=>{
 const units=['pit-brute','pyre-warden','cerberax','pyre-colossus','gorthak'].map((kind,id)=>({kind,id}));
 const {slots}=arrangeWarband(units,assets);
 assert.ok(slots.get(2)!.depth>slots.get(3)!.depth);
 const ordered=[...slots.values()].sort((a,b)=>(a.x+a.width/2)-(b.x+b.width/2));
 for(let i=1;i<ordered.length;i++)assert.ok(ordered[i-1].depth>ordered[i].depth);
 for(const slot of slots.values())assert.ok(slot.x>=-180-1e-6);
});


test('arch demons and three hellhounds use rear space without collapsing stagger',()=>{
 for(const kinds of [
  ['cerberax','hellhound','hellhound','hellhound','pyre-colossus'],
  ['pyre-colossus','hellhound','cerberax','hellhound','hellhound'],
  ['cerberax','hellhound','gorthak','pit-brute','pyre-colossus'],
 ]){
  const units=kinds.map((kind,id)=>({kind,id}));
  const {slots}=arrangeWarband(units,assets);
  const ordered=[...slots.values()].sort((a,b)=>(a.x+a.width/2)-(b.x+b.width/2));
  assert.ok(ordered[0].x<60,'uses space behind Warlock instead of bunching');
  for(let i=1;i<ordered.length;i++){
   assert.ok(ordered[i].x+ordered[i].width/2-ordered[i-1].x-ordered[i-1].width/2>=71.99,'readable minimum stagger');
  }
  for(const u of units)assert.equal(slots.get(u.id)!.worldUnit,measureSummon(u,assets).worldUnit);
  const retreated=retreatGroundFormation(slots,assets);
  for(const s of retreated.slots.values())assert.ok(s.x>=-240-1e-6,'retreat preserves rear boundary');
 }
});


test('hellhounds pack tighter to leave Cerberax clear of Pyre Colossus',()=>{
 const units=['cerberax','hellhound','hellhound','hellhound','pyre-colossus'].map((kind,id)=>({kind,id}));
 const {slots}=arrangeWarband(units,assets);
 const center=(id:number)=>{const s=slots.get(id)!;return s.x+s.width/2;};
 assert.ok(center(4)-center(0)>=230);
 assert.ok(center(1)-center(2)<=80);
 assert.ok(center(2)-center(3)<=80);
 assert.ok(slots.get(3)!.x<-210,'rear tail reaches behind Warlock');
});
