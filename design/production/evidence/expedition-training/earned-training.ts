import fs from 'node:fs';import assert from 'node:assert/strict';import * as e from '../../../../packages/engine/index';
const source=JSON.parse(fs.readFileSync(new URL('./current-earned-conquer-warband.json',import.meta.url),'utf8'));
let s=e.restore(JSON.stringify({...source,actions:[]}));let trained:string|undefined,used=false;
for(const original of source.actions){
 if(!trained&&s.phase==='camp'){
  const options=e.trainingOptions(s);const option=options.find(v=>v.kind==='imp'&&v.level<2)??options.find(v=>v.level<2);assert.ok(option);
  s=e.dispatch(s,{type:'camp-choice',choice:'train',kind:option.kind});trained=option.kind;assert.equal(s.trainingLevels?.[option.kind],1);assert.deepEqual(e.restore(e.save(s)),s);continue;
 }
 if(trained&&s.phase==='combat'){
  const actor=s.units.find(v=>v.kind===trained&&v.hp>0);if(actor){const order=e.availableOrders(s,actor)[1];assert.ok(order);const target=order.target==='ally'?actor.id:order.target==='enemy'?s.enemies.find(v=>v.hp>0)!.id:undefined;
   s=e.dispatch(s,{type:'set-order',unit:actor.id,order:order.id,...(target===undefined?{}:{target})});assert.deepEqual(e.restore(e.save(s)),s);s=e.dispatch(s,{type:'end'});assert.ok(s.events.some(v=>v.type==='order'&&v.actor===actor.id));assert.deepEqual(e.restore(e.save(s)),s);used=true;break;
  }
 }
 s=e.dispatch(s,original);
}
assert.ok(trained&&used);fs.writeFileSync(new URL('./earned-training-save.json',import.meta.url),e.save(s));
fs.writeFileSync(new URL('./earned-training-results.json',import.meta.url),JSON.stringify({timestamp:new Date().toISOString(),status:'pass',source:'current-earned-conquer-warband.json',trainedKind:trained,actions:s.history.length,phase:s.phase,room:s.room,checks:['earned camp free training','persisted training level','trained order selection and normal action phase','exact save/restore after training, order selection and execution'],limitations:'One earned Conquer branch; not exhaustive every source/species browser training.'},null,2));console.log({trained,used,actions:s.history.length,phase:s.phase});


