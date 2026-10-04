import { test } from "node:test";
import assert from "node:assert/strict";
import { dispatch, newRun } from "./index";

function burningEnemy(hp = 20, guard = 0) {
  const state = newRun(42);
  state.enemies = [{ ...state.enemies[0], hp, maxHp: 20, guard, scorch: 8, moves: [{ name: "Strike", damage: 2, targeting: "hero" }] }];
  state.reserves = []; state.units = []; return state;
}

for (const [guard, hpLost] of [[0, 8], [3, 5], [10, 0]] as const) {
  test(`Scorch tick reports actual HP loss with ${guard} Guard after enemy impact`, () => {
    const state = burningEnemy(20, guard), next = dispatch(state, { type: "end" }), burns = next.events.filter(event => event.cause === "scorch"), burn = burns[0];
    assert.equal(burns.length, 1); assert.equal(burn.type, "damage"); assert.equal(burn.target, state.enemies[0].id); assert.equal(burn.amount, hpLost);
    assert.ok(next.events.indexOf(burn) > next.events.findIndex(event => event.type === "enemy-impact")); assert.equal(burn.view!.enemies[0].hp, 20 - hpLost);
    assert.equal(burn.view!.enemies[0].guard, Math.max(0, guard - 8)); assert.equal(next.enemies[0].scorch, 4); assert.equal(next.hp, state.hp - 2);
  });
}

test("lethal Scorch reports capped HP loss then death, after the enemy has attacked", () => {
  const state = burningEnemy(3, 2), next = dispatch(state, { type: "end" }), burnIndex = next.events.findIndex(event => event.cause === "scorch"), killIndex = next.events.findIndex(event => event.type === "kill");
  assert.equal(next.events[burnIndex].amount, 3); assert.ok(burnIndex > next.events.findIndex(event => event.type === "enemy-impact")); assert.ok(killIndex > burnIndex);
  assert.equal(next.events[burnIndex].view!.enemies[0].hp, 0); assert.equal(next.hp, state.hp - 2); assert.equal(next.cinders, state.cinders + 4); assert.equal(next.phase, "reward");
});

test("card damage and Scorch stack application are not marked as burn ticks", () => {
  const state = burningEnemy(); state.hand = [{ uid: 100, id: "immolate" }]; const next = dispatch(state, { type: "play", uid: 100, target: state.enemies[0].id });
  assert.ok(next.events.some(event => event.type === "damage")); assert.ok(next.events.some(event => event.type === "scorch")); assert.ok(next.events.every(event => event.cause === undefined));
});
