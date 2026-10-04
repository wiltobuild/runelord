import {test} from 'node:test';
import assert from 'node:assert/strict';
import {newInfernalRun,dispatch,save,restore,infernalStartNode,mapDestinations,discoveredNodes,canEnterLocation} from './index';

test('new explorers see one landing point and arrival does not silently start combat',()=>{
 let s=newInfernalRun(42);
 const start=infernalStartNode(s)!;
 assert.deepEqual(discoveredNodes(s).map(n=>n.id),[start.id]);
 assert.deepEqual(mapDestinations(s).map(n=>n.id),[start.id]);
 assert.equal(canEnterLocation(s),false);
 assert.throws(()=>dispatch(s,{type:'enter-location'}),/No unfinished/);
 const rng=s.rng;
 s=dispatch(s,{type:'arrive',node:start.id});
 assert.equal(s.phase,'map');assert.equal(s.journey!.current,start.id);
 assert.equal(s.rng,rng);assert.deepEqual(s.enemies,[]);
 assert.equal(canEnterLocation(s),true);assert.deepEqual(mapDestinations(s),[]);
 assert.ok(start.next.every(id=>discoveredNodes(s).some(n=>n.id===id)));
 assert.ok(!discoveredNodes(s).some(n=>n.kind==='boss'));
 assert.throws(()=>dispatch(s,{type:'arrive',node:start.next[0]}),/Finish your encounter/);
 s=dispatch(s,{type:'enter-location'});
 assert.equal(s.phase,'combat');assert.ok(s.enemies.length>0);
 assert.deepEqual(restore(save(s)),s);
});

test('previously seen branches remain visible when walking back without revealing their neighbors',()=>{
 let s=newInfernalRun(81);
 const start=infernalStartNode(s)!;
 s=dispatch(s,{type:'arrive',node:start.id});
 s.journey!.completed.push(start.id);
 const junction=mapDestinations(s)[0];
 s=dispatch(s,{type:'arrive',node:junction.id});
 s.journey!.completed.push(junction.id);
 const seen=discoveredNodes(s).map(n=>n.id);
 s=dispatch(s,{type:'arrive',node:start.id});
 assert.deepEqual(discoveredNodes(s).map(n=>n.id),seen);
 assert.equal(canEnterLocation(s),false);
 assert.throws(()=>dispatch(s,{type:'enter-location'}),/No unfinished/);
 assert.ok(mapDestinations(s).some(n=>n.id===junction.id));
 const unseen=s.journey!.nodes.find(n=>!seen.includes(n.id))!;
 assert.throws(()=>dispatch(s,{type:'arrive',node:unseen.id}),/connected/);
});

test('finished treasure has no encounter action while completed shops can reopen their existing inventory',()=>{
 let s=newInfernalRun(42);
 const treasure=s.journey!.nodes.find(n=>n.kind==='treasure')!;
 s.journey!.current=treasure.id;
 assert.equal(canEnterLocation(s),true);
 s=dispatch(s,{type:'enter-location'});assert.equal(s.phase,'treasure');
 s=dispatch(s,{type:'claim-treasure'});s=dispatch(s,{type:'continue'});
 assert.equal(canEnterLocation(s),false);
 const shop=s.journey!.nodes.find(n=>n.kind==='shop')!;
 s.journey!.current=shop.id;s.journey!.completed.push(shop.id);
 assert.equal(canEnterLocation(s),true);
 s=dispatch(s,{type:'enter-location'});assert.equal(s.phase,'shop');
 s=dispatch(s,{type:'leave-shop'});assert.equal(canEnterLocation(s),true);
});

test('old travel histories reveal previously reached locations without changing replay semantics',()=>{
 let s=newInfernalRun(71);
 const otherStart=s.journey!.nodes.find(n=>n.row===0&&n.lane===1)!;
 s=dispatch(s,{type:'travel',node:otherStart.id});
 assert.equal(s.phase,'combat');
 assert.ok(discoveredNodes(s).some(n=>n.id===otherStart.id));
 assert.deepEqual(discoveredNodes(restore(save(s))),discoveredNodes(s));
});

test('the second throne crossing cannot bypass its elite guardian',()=>{
 const s=newInfernalRun(42);
 s.journey!.current='infernal-v2-11-1';s.journey!.completed=['infernal-v2-11-1'];
 assert.ok(discoveredNodes(s).some(n=>n.kind==='boss'));
 assert.ok(!mapDestinations(s).some(n=>n.kind==='boss'));
 assert.throws(()=>dispatch(s,{type:'arrive',node:'infernal-v2-13-0'}),/Finish your encounter/);
 s.journey!.completed.push('infernal-v2-12-0');
 assert.ok(mapDestinations(s).some(n=>n.kind==='boss'));
 assert.equal(dispatch(s,{type:'arrive',node:'infernal-v2-13-0'}).phase,'map');
});
