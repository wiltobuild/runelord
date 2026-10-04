import { test } from 'node:test';
import assert from 'node:assert/strict';
import { newRun, dispatch, save, restore, manaCost, playable, type State, type Unit } from './index';
import { implemented, encounters, starterDecks, cardTargetsUnit, type CardId, type ItemId } from '../content/index';
const demon = (): Unit => ({ id: 500, kind: 'hellhound', name: 'Hellhound', hp: 10, maxHp: 20, power: 6, guard: 0, upkeep: 1, defender: false });
function setup(id: CardId, upgraded = false) {
  const s = newRun(42, 'fire');
  s.hand = [{ id, uid: 900, upgraded }]; s.draw = Array.from({ length: 10 }, (_, i) => ({ id: 'firebolt' as const, uid: 1000+i })); s.discard = [];
  s.mana = 10; s.cinders = 10; s.hp = 50; s.units = [demon()];
  s.enemies.forEach(e => { e.hp = e.maxHp = 200; e.scorch = 4; });
  return s;
}
function play(s: State) { return dispatch(s, { type: 'play', uid: 900, target: s.enemies[0].id, unit: 500 }); }
const checks: Partial<Record<CardId, (s: State, up: boolean) => void>> = {
  'hellish-command': (s,u) => { assert.equal(s.enemies[0].hp, u ? 192 : 194); assert.equal(s.units[0].power, u ? 8 : 6); },
  'ritual-cut': (s,u) => { assert.equal(s.hp,48); assert.equal(s.corruption,2); assert.equal(s.enemies[0].hp,u?183:187); },
  'chain-of-flame': (s,u) => { assert.equal(s.enemies[0].hp,u?192:195); assert.equal(s.enemies[1].scorch,8); },
  'dark-bargain': (s,u) => { assert.equal(s.hp,u?47:46); assert.equal(s.corruption,u?3:4); assert.equal(s.hand.length,3); },
  'fiendish-feast': (s,u) => { assert.equal(s.units.length,0); assert.equal(s.hp,55); assert.equal(s.cinders,u?15:13); },
  'infernal-whip': (s,u) => assert.equal(s.enemies[0].hp,u?186:190),
  'burning-hatred': (s,u) => { assert.equal(s.enemies[0].hp,u?180:185); assert.equal(s.corruption,2); },
  'cinder-shield': (s,u) => assert.equal(s.guard,u?18:14),
  'smoke-and-mirrors': (s,u) => { assert.ok(s.enemies.every(e => e.sapped === (u?2:1))); assert.equal(s.units[0].guard,3); },
  'hellfire': (s,u) => { assert.ok(s.enemies.every(e => e.hp === (u?184:188))); assert.ok(s.enemies.every(e => e.scorch === 6)); },
  'infernal-pact': (s,u) => assert.equal(s.powers['infernal-pact'],u?7:5),
  'masters-of-the-pit': (s,u) => assert.equal(s.units[0].power,u?9:8),
  'burning-soul': (s,u) => { assert.equal(s.units[0].upkeep,0); assert.equal(s.cinders,u?13:10); },
  'demonic-resilience': (s,u) => assert.equal(s.powers['demonic-resilience'],u?8:6),
  'sacrificial-rite': (s,u) => { assert.equal(s.units.length,0); assert.equal(s.mana,12); assert.equal(s.hand.length,u?3:2); },
  'corrupting-touch': (s,u) => { assert.equal(s.enemies[0].exposed,u?3:2); assert.equal(s.corruption,3); },
  'fire-and-brimstone': (s,u) => { assert.equal(s.enemies[0].hp,u?186:190); assert.equal(s.enemies[0].scorch,8); },
  'ember-storm': (s,u) => { assert.equal(s.mana,0); assert.ok(s.enemies.every(e => e.scorch === (u?44:34))); },
  'unholy-frenzy': (s,u) => { assert.equal(s.hp,u?48:47); assert.equal(s.enemies[0].hp,194); },
  'pyroclasm': (s,u) => assert.equal(s.powers.pyroclasm,u?4:3),
  'shadowflame-barrier': (s,u) => { assert.equal(s.guard,u?16:12); assert.equal(s.barrier,3); },
  'void-gaze': (s,u) => { assert.equal(s.enemies[0].sapped,u?3:2); assert.equal(s.corruption,2); assert.equal(s.hand.length,1); },
  'rend-flesh': (s,u) => assert.equal(s.enemies[0].hp,u?187:190),
  'combust': (s,u) => { assert.equal(s.enemies[0].hp,u?188:192); assert.equal(s.enemies[0].scorch,0); },
  'blood-price': (s,u) => { assert.equal(s.hp,48); assert.equal(s.enemies[0].hp,u?184:188); assert.equal(s.corruption,2); },
  'wreathed-in-flame': (s,u) => assert.equal(s.guard,u?12:9),
  'dread-aura': (s,u) => assert.equal(s.powers['dread-aura'],u?2:1),
  'feast-of-embers': (s,u) => { assert.equal(s.units[0].hp,u?20:18); assert.equal(s.units[0].power,u?10:9); },
  'abyssal-gaze': (s,u) => { assert.equal(s.corruption,2); assert.equal(s.hand.length,u?2:1); },
  'infernal-transformation': s => { assert.equal(s.demonTurns,3); assert.equal(s.discard.length,0); },
};
for(const id of Object.keys(checks) as CardId[]) for(const upgraded of [false,true]) test(`${id}: ${upgraded?'upgraded':'base'} catalog outcome`, () => {
  const before = setup(id,upgraded), snapshot = structuredClone(before), after = play(before);
  checks[id]!(after,upgraded); assert.deepEqual(before,snapshot);
});
test('exactly30 additions, all3 distinct ten-card starter decks and9fire encounters', () => {
  assert.equal(Object.keys(checks).length,30); assert.equal(implemented.length,44); assert.equal(encounters.length,9);
  assert.ok(encounters.every(e => ['forge','arena','demon-throne'].includes(e.background)));
  for(const deck of starterDecks) { const s=newRun(1,deck.id); assert.deepEqual(s.deck,deck.cards); assert.equal(s.deck.length,10); assert.ok(s.deck.every(id=>(implemented as readonly string[]).includes(id))); }
});
test('unit-targeted cards reject missing/invalid demons without spending resources', () => {
  for(const id of implemented.filter(cardTargetsUnit)) {
    const s=setup(id); s.units=[]; const snapshot=structuredClone(s); assert.equal(playable(s,s.hand[0]),false); assert.throws(()=>play(s)); assert.deepEqual(s,snapshot);
    const valid=setup(id); assert.throws(()=>dispatch(valid,{type:'play',uid:900,unit:-1}));
  }
});
test('powers persist for combat, affect future summons, and leave the card cycle', () => {
  let s=play(setup('masters-of-the-pit')); assert.equal(s.discard.length,0);
  s.hand=[{id:'burning-soul',uid:900}]; s=play(s);
  s.hand=[{id:'summon-hellhound',uid:900}]; s=play(s);
  assert.equal(s.units[1].power,8); assert.equal(s.units[1].upkeep,0);
  s.powers['demonic-resilience']=6; s.hand=[{id:'sacrificial-rite',uid:900}]; const before=s.cinders; s=play(s); assert.equal(s.guard,6); assert.equal(s.cinders,before+2);
});
test('Infernal Pact triggers once per player HP loss; Pyroclasm ticks next turn; temporary command power expires', () => {
  let s=play(setup('infernal-pact')); s.hand=[{id:'blood-pact',uid:900}]; s=play(s); assert.ok(s.enemies.every(e=>e.hp===195));
  s=play(setup('pyroclasm')); s.units=[]; s=dispatch(s,{type:'end'}); assert.ok(s.enemies.every(e=>e.scorch===5));
  s=play(setup('hellish-command',true)); s=dispatch(s,{type:'end'}); assert.equal(s.units[0].power,6);
});
test('Sapped reduces actual intent damage; Exposed modifies attacks but not Scorch', () => {
  let s=setup('firebolt'); s.units=[]; s.enemies=[s.enemies[0]]; s.enemies[0].scorch=0; s.enemies[0].sapped=2;
  s=dispatch(s,{type:'end'}); assert.equal(s.hp,46); assert.equal(s.enemies[0].sapped,1);
  s=setup('firebolt'); s.enemies[0].exposed=2; s=play(s); assert.equal(s.enemies[0].hp,191);
});
test('barrier retaliates only when hero is attacked and expires next turn', () => {
  let s=play(setup('shadowflame-barrier')); s.units=[]; s=dispatch(s,{type:'end'}); assert.ok(s.enemies.every(e=>e.scorch===3)); assert.equal(s.barrier,0);
});
test('Rend Flesh is free and hits twice in Demon Form; Blood Price awards kill corruption', () => {
  let s=setup('rend-flesh'); s.demonTurns=3; assert.equal(manaCost(s,s.hand[0]),0); s=play(s); assert.equal(s.enemies[0].hp,174); assert.equal(s.mana,10);
  s=setup('blood-price'); s.enemies[0].hp=8; s=play(s); assert.equal(s.corruption,6);
});
test('upgraded Imp power applies to its immediate entry attack', () => {
  const s=play(setup('summon-imp',true)); assert.equal(s.enemies[0].hp,194); assert.equal(s.units.at(-1)!.power,6);
});
function reserveRoom() { const s=newRun(); s.room=2; s.phase='loot'; s.pendingLoot={gold:0,items:[],final:false}; return dispatch(s,{type:'continue'}); }
test('two reserves replace dead slots after kill checkpoints, never end battle early', () => {
  let s=reserveRoom(); assert.equal(s.reserves.length,2);
  for(let i=0;i<2;i++) {
    const deadId=s.enemies[0].id; s.enemies[0].hp=1; s.hand=[{id:'firebolt',uid:900}]; s.mana=3;
    s=dispatch(s,{type:'play',uid:900,target:deadId});
    const kill=s.events.findIndex(e=>e.type==='kill'); const arrival=s.events.findIndex(e=>e.type==='reserve');
    assert.ok(arrival>kill); assert.equal(s.events[kill].view!.enemies[0].hp,0); assert.equal(s.events[arrival].target,deadId);
    assert.notEqual(s.enemies[0].id,deadId); assert.equal(s.reserves.length,1-i); assert.equal(s.phase,'combat');
  }
});
test('all8encounters route through loot, rewards, camps and final victory with no reserve softlock', () => {
  let s=newRun(71,'fire',2);
  for(let room=0;room<8;room++) {
    assert.equal(s.room,room); let waves=0;
    while(s.phase==='combat' && waves++<4) {
      s.enemies.forEach(e=>e.hp=1); s.mana=10; s.hand=[{id:'conflagrate',uid:900}];
      s=dispatch(s,{type:'play',uid:900,target:s.enemies.find(e=>e.hp>0)!.id});
    }
    assert.ok(waves<=3); assert.equal(s.inventory.length,room+1);
    if(room<7) { assert.equal(s.phase,'reward'); assert.equal(s.rewards.length,3); s=dispatch(s,{type:'reward',card:s.rewards[0]}); if(s.phase==='camp') s=dispatch(s,{type:'camp'}); }
  }
  assert.equal(s.phase,'won'); assert.equal(s.gold,480);
});
test('every loot item has a working effect and is consumed exactly once', () => {
  const expected: Partial<Record<ItemId,(s:State)=>void>> = {
    'healing-draught': s=>assert.equal(s.hp,64), 'mana-potion': s=>assert.equal(s.mana,12), 'barkskin-tonic': s=>assert.equal(s.guard,12),
    'shrapnel-jar': s=>assert.ok(s.enemies.every(e=>e.hp===190)), 'banner-draught': s=>{assert.equal(s.guard,8); assert.equal(s.units[0].guard,8);},
    'bonesetters-salve': s=>assert.equal(s.units[0].hp,20), 'warhorn-oil': s=>assert.equal(s.units[0].power,9),
  };
  for(const item of Object.keys(expected) as ItemId[]) { const s=setup('firebolt'); s.inventory=[item]; const next=dispatch(s,{type:'item',item}); expected[item]!(next); assert.equal(next.inventory.length,0); assert.throws(()=>dispatch(next,{type:'item',item})); assert.deepEqual(s.inventory,[item]); }
});
test('new saves preserve selected deck and replay; legacy schema1 remains readable', () => {
  for(const deck of starterDecks) { let s=newRun(84,deck.id); s=dispatch(s,{type:'end'}); assert.deepEqual(restore(save(s)),s); }
  const legacy=dispatch(newRun(99),{type:'end'}); const migrated=restore(JSON.stringify({schema:1,seed:99,actions:legacy.history})); assert.equal(migrated.hp,legacy.hp); assert.deepEqual(migrated.hand,legacy.hand); assert.equal(migrated.legacyActions,1); assert.deepEqual(restore(save(migrated)),migrated);
});

test('Infernal Pact final kills from Demon Form and upkeep finish combat; lethal HP loss still loses', () => {
  for(const source of ['form','upkeep']) {
    const s=newRun(); s.enemies=[s.enemies[0]]; s.enemies[0].hp=5; s.enemies[0].scorch=0; s.powers['infernal-pact']=5;
    if(source==='form') s.demonTurns=1;
    else { s.units=[{...demon(),power:0,upkeep:2,hp:100,maxHp:100}]; s.cinders=0; s.enemies[0].moves=[{name:'wait',damage:0,targeting:'hero'}]; }
    const n=dispatch(s,{type:'end'}); assert.equal(n.phase,'reward'); assert.equal(n.events.filter(e=>e.type==='loot').length,1);
  }
  const s=newRun(); s.enemies=[s.enemies[0]]; s.enemies[0].hp=5; s.powers['infernal-pact']=5; s.demonTurns=1; s.hp=3;
  assert.equal(dispatch(s,{type:'end'}).phase,'lost');
});
