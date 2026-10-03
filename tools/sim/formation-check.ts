import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {layoutWarband,retreatGroundFormation} from '../../apps/web/src/warbandLayout';
import {packCrowdedWarband} from '../../apps/web/src/packedWarband';
import type {Assets} from '../../apps/web/src/assets';
const assets=JSON.parse(readFileSync('apps/web/public/game-assets/manifest.json','utf8')) as Assets;
const make=(kinds:string[])=>kinds.map((kind,id)=>({kind,id}));
for(const kinds of [['hellhound','hellhound','hellhound'],['hellhound','hellhound','hellhound','imp','imp','imp']]){
 const u=make(kinds),regular=layoutWarband(u,assets),packed=packCrowdedWarband(u,assets,regular);
 assert.equal(packed,null,'Three hounds should fit an open row, even with flyers');
 for(const x of u.filter(x=>x.kind==='hellhound'))assert.ok(regular.get(x.id)!.worldUnit>225);
 const h=u.filter(x=>x.kind==='hellhound').map(x=>regular.get(x.id)!);assert.ok(h[0].bounds.right<h[1].bounds.left&&h[1].bounds.right<h[2].bounds.left);
}
const u=make(['pit-brute','pit-brute','hellhound','hellhound','imp','imp','imp']);
const packed=packCrowdedWarband(u,assets,layoutWarband(u,assets))!;
assert.ok(packed);assert.ok(!packed.groups.some(g=>g.kind==='imp'),'Ground packing must not stack three imps');
for(const g of packed.groups)for(let i=1;i<g.ids.length;i++)assert.ok(packed.slots.get(g.ids[i])!.x>packed.slots.get(g.ids[i-1])!.x,'Lower layers are closer to the enemies');
console.log('Formation regressions passed: 3 full-size hounds, 3 hounds+3 flyers, mixed packed ground with unstacked flyers.');

for(const kinds of [['hellhound','hellhound','hellhound','imp','imp','imp'],['pit-brute','pit-brute','hellhound','hellhound','imp','imp','imp'],['pit-brute','pit-brute','pit-brute','hellhound','hellhound','hellhound']]) {
 const units=make(kinds), regular=layoutWarband(units,assets), original=packCrowdedWarband(units,assets,regular)?.slots??regular;
 const moved=retreatGroundFormation(original,assets);
 for(const [id,slot] of moved.slots) {
  if(slot.airborne){assert.deepEqual(slot,original.get(id));continue;}
  const a=assets.actors[slot.art],g=a.geometry!;
  const right=slot.x+slot.width/2+(g.layout_bounds_px![2]-a.anchor[0])*slot.worldUnit/g.source_pixels_per_world_unit;
  assert.ok(right<=590.0001,'Full ground sprite stays behind enemy clearance line');
  assert.equal(slot.worldUnit,original.get(id)!.worldUnit,'Moving closer must not shrink summons');
 }
}
console.log('Enemy clearance passed for open and packed formations; airborne positions and model scales preserved.');
