import test from 'node:test';
import assert from 'node:assert/strict';
import {infernalMarkerAppearance} from '../../apps/web/src/infernalMarkerAppearance';
test('Battle markers use seeded tower ranks, while elites use battle fortresses',()=>{
 const ranks=[0,0,0];
 for(let seed=0;seed<1000;seed++) {
  const result=infernalMarkerAppearance('combat',seed,'infernal-v2-0-0',2);
  assert.equal(result.atlas,'elite');ranks[result.tier]++;
  assert.deepEqual(result,infernalMarkerAppearance('combat',seed,'infernal-v2-0-0',0));
 }
 assert.ok(ranks[0]>350&&ranks[1]>350&&ranks[2]>50&&ranks[2]<150);
 assert.deepEqual(infernalMarkerAppearance('elite',1,'any',1),{atlas:'combat',tier:1});
});
