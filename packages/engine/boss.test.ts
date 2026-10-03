import { test } from 'node:test';
import assert from 'node:assert/strict';
import { newRun, dispatch, intent, rollRewards, save, restore, type State } from './index';
import { cards, cardAffinities, encounters, starterDecks, items } from '../content/index';
function bossRoom(): State {
  let s=newRun(701,'warband'); s.room=7; s.phase='loot'; s.pendingLoot={gold:95,items:['healing-draught'],final:false};
  s=dispatch(s,{type:'continue'}); assert.equal(s.phase,'camp'); s=dispatch(s,{type:'camp'}); return s;
}
function killFight(s:State):State {
  for(let i=0;i<4 && s.phase==='combat';i++) {
    s.enemies.forEach(e=>e.hp=1); s.mana=10; s.hand=[{id:'conflagrate',uid:99000}];
    s=dispatch(s,{type:'play',uid:99000,target:s.enemies.find(e=>e.hp>0)!.id});
  }
  return s;
}
test('ninth boss has summons, hellfire, barrier and readable enraged intents',()=>{
  let s=bossRoom(); const lord=s.enemies[0]; assert.equal(s.room,8); assert.equal(encounters[8].background,'demon-throne'); assert.equal(lord.boss,'demon-lord'); assert.equal(intent(s,lord).kind,'summon');
  s=dispatch(s,{type:'end'}); assert.equal(s.enemies.length,3); assert.deepEqual(s.events.filter(e=>e.type==='enemy-summon').map(e=>e.actor),s.enemies.slice(1).map(e=>e.id));
  assert.equal(s.hp,72,'new summons cannot attack on their arrival turn');
  assert.equal(intent(s,s.enemies[0]).name,'Royal Hellfire');
  s.enemies[0].hp=76; s.hand=[{id:'firebolt',uid:999}]; s.mana=3;
  s=dispatch(s,{type:'play',uid:999,target:s.enemies[0].id});
  assert.equal(s.enemies[0].bossPhase,2); assert.equal(s.enemies[0].guard,8); assert.equal(s.events.filter(e=>e.type==='boss-phase').length,1); assert.equal(intent(s,s.enemies[0]).damage,8);
  s.hand=[{id:'firebolt',uid:999}]; s.mana=3; s=dispatch(s,{type:'play',uid:999,target:s.enemies[0].id}); assert.equal(s.enemies[0].guard,2); assert.equal(s.events.filter(e=>e.type==='boss-phase').length,0);
});
test('boss summons cap2 living and4 lifetime; dead adds reuse slots and no infinite refill',()=>{
  let s=bossRoom(); s=dispatch(s,{type:'end'}); assert.equal(s.enemies[0].summonsMade,2);
  s.turn=5; s=dispatch(s,{type:'end'}); assert.equal(s.enemies.length,3); assert.equal(s.enemies[0].summonsMade,2); assert.equal(s.events.some(e=>e.type==='enemy-summon'),false);
  s.enemies.slice(1).forEach(e=>e.hp=0); s.turn=9; s=dispatch(s,{type:'end'}); assert.equal(s.enemies.length,3); assert.equal(s.enemies[0].summonsMade,4);
  s.enemies.slice(1).forEach(e=>e.hp=0); s.turn=13; assert.equal(intent(s,s.enemies[0]).name,'Crownfire Bolt'); s=dispatch(s,{type:'end'}); assert.equal(s.enemies[0].summonsMade,4);
});
test('boss barrier is capped and has no attack targets or damage',()=>{
  let s=bossRoom(); s.turn=3; s.enemies[0].guard=20; s=dispatch(s,{type:'end'}); assert.equal(s.enemies[0].guard,24); assert.equal(s.hp,72); assert.deepEqual(s.events.find(e=>e.type==='enemy')!.targets,[]); assert.equal(s.events.some(e=>e.type==='enemy-shield'),true);
});
test('killing boss dispels surviving adds, awards crown exactly once, reveals loot before victory',()=>{
  let s=dispatch(bossRoom(),{type:'end'}); s.enemies[0].hp=1; s.mana=3; s.hand=[{id:'firebolt',uid:999}];
  s=dispatch(s,{type:'play',uid:999,target:s.enemies[0].id});
  assert.ok(s.enemies.every(e=>e.hp===0)); assert.equal(s.phase,'loot'); assert.deepEqual(s.relics,['demon-lord-crown']); assert.equal(s.inventory.includes('demon-lord-crown'),false);
  assert.deepEqual(s.pendingLoot,{gold:105,items:['demon-lord-crown'],final:true}); const gold=s.gold;
  assert.throws(()=>dispatch(s,{type:'end'})); assert.throws(()=>dispatch(s,{type:'item',item:'demon-lord-crown'}));
  s=dispatch(s,{type:'continue'}); assert.equal(s.phase,'won'); assert.equal(s.gold,gold); assert.equal(s.relics.length,1); assert.equal(s.pendingLoot,null); assert.throws(()=>dispatch(s,{type:'continue'}));
});
test('crown is a persistent passive relic and grants stated combat-opening bonus',()=>{
  let s=newRun(); s.relics=['demon-lord-crown']; s.phase='loot'; s.pendingLoot={gold:0,items:[],final:false};
  s=dispatch(s,{type:'continue'}); assert.equal(s.guard,5); assert.equal(s.mana,4); assert.equal(items['demon-lord-crown'].category,'relic');
});
test('all9 encounters require card then loot acknowledgement and end with crowned victory',()=>{
  let s=newRun(32,'fire');
  for(let room=0;room<9;room++) {
    assert.equal(s.room,room); s=killFight(s); const gold=s.gold; const count=s.inventory.length;
    if(room<8) { assert.equal(s.phase,'reward'); const card=s.rewards[0]; s=dispatch(s,{type:'reward',card}); assert.equal(s.phase,'loot'); assert.equal(s.room,room); assert.equal(s.pendingLoot!.items.length,1); assert.equal(s.gold,gold); assert.equal(s.inventory.length,count); }
    else assert.equal(s.phase,'loot');
    s=dispatch(s,{type:'continue'}); if(s.phase==='camp') s=dispatch(s,{type:'camp'});
  }
  assert.equal(s.phase,'won'); assert.equal(s.gold,585); assert.deepEqual(s.relics,['demon-lord-crown']);
});
test('deck composition stays curated, order is seeded, and repeat seeds reproduce deals',()=>{
  for(const deck of starterDecks) {
    assert.deepEqual(newRun(1,deck.id).deck,deck.cards);
    assert.deepEqual(newRun(7,deck.id).hand,newRun(7,deck.id).hand);
    const hands=new Set(Array.from({length:50},(_,i)=>newRun(i+1,deck.id).hand.map(c=>c.id).join(',')));
    assert.ok(hands.size>20);
  }
});
test('seeded rewards are distinct, weighted toward chosen style, and retain off-style possibilities',()=>{
  for(const deck of starterDecks) {
    let themed=0,total=0,offStyle=0; const seen=new Set<string>();
    for(let seed=1;seed<=1000;seed++) {
      const s=newRun(seed,deck.id); const result=rollRewards(s);
      assert.equal(new Set(result).size,3); assert.ok(result.every(id=>cards[id].rarity!=='Basic'));
      for(const id of result) { total++; seen.add(id); if(cardAffinities[deck.id].includes(id)) themed++; else offStyle++; }
      assert.deepEqual(result,rollRewards(newRun(seed,deck.id)));
    }
    assert.ok(themed/total>.55,`${deck.id}: ${themed/total}`); assert.ok(themed/total<.85); assert.ok(offStyle>0); assert.equal(seen.size,40);
  }
});
test('legacy schema2 prefix keeps historical rewards/deal and migrates safely into loot staging',()=>{
  // A real replayable old run, using only legal actions and its fixed starter order.
  let old=newRun(7319,'warband',2);
  for(let i=0;i<3 && old.phase==='combat';i++) old=dispatch(old,{type:'end'});
  const raw=JSON.stringify({schema:2,seed:old.seed,starterDeck:old.starterDeck,actions:old.history});
  const migrated=restore(raw); assert.equal(migrated.rulesVersion,3); assert.equal(migrated.legacyActions,old.history.length); assert.deepEqual(migrated.hand,old.hand); assert.equal(migrated.hp,old.hp); assert.equal(migrated.rng,old.rng);
  assert.deepEqual(restore(save(migrated)),migrated);
  if(migrated.phase==='combat') { const next=dispatch(migrated,{type:'end'}); assert.deepEqual(restore(save(next)),next); }
});
