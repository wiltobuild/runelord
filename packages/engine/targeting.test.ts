import { test } from "node:test";
import assert from "node:assert/strict";
import { dispatch, newRun, type Unit } from "./index";
import { type CardId } from "../content/index";

function afterFocusedKill(card: CardId) {
  const state = newRun(42);
  const enemy = state.enemies[0];
  state.enemies = [{ ...enemy, hp: 1, guard: 0 }, { ...enemy, id: enemy.id + 100, hp: 100, maxHp: 100, guard: 0 }];
  state.reserves = [];
  state.hand = [{ uid: 100, id: "firebolt" }, { uid: 101, id: card }];
  state.mana = 10; state.cinders = 10;
  return dispatch(state, { type: "play", uid: 100, target: enemy.id });
}

for (const [card, guard, cost] of [["ward-of-ash", 5, 1], ["sinister-veil", 8, 1], ["ashen-ward", 7, 1], ["cinder-shield", 14, 1]] as const) {
  test(`${card} works immediately after killing the focused enemy`, () => {
    const state = afterFocusedKill(card), snapshot = structuredClone(state), action = { type: "play", uid: 101 } as const;
    const next = dispatch(state, action);
    assert.equal(next.phase, "combat"); assert.equal(next.guard, state.guard + guard); assert.equal(next.focus, state.enemies[1].id);
    assert.equal(next.hand.length, 0); assert.equal(next.mana, state.mana - cost); assert.deepEqual(next.history.at(-1), action);
    assert.deepEqual(dispatch(state, action), next, "Resolution stays deterministic"); assert.deepEqual(state, snapshot, "Input state remains unchanged");
  });
}

test("summons and demon-targeted cards work with a dead enemy focus", () => {
  const summon = dispatch(afterFocusedKill("summon-imp"), { type: "play", uid: 101 }); assert.equal(summon.units.length, 1);
  const state = afterFocusedKill("hellish-command");
  const unit: Unit = { id: 500, kind: "imp", name: "Imp", hp: 10, maxHp: 10, power: 3, guard: 0, upkeep: 0, defender: false };
  state.units = [unit]; const next = dispatch(state, { type: "play", uid: 101, unit: unit.id });
  assert.equal(next.enemies[1].hp, state.enemies[1].hp - unit.power);
});

test("explicit dead or unknown attack targets remain invalid and spend nothing", () => {
  const state = afterFocusedKill("firebolt"), snapshot = structuredClone(state);
  for (const target of [state.focus, -1]) { assert.throws(() => dispatch(state, { type: "play", uid: 101, target }), /Choose a living target/); assert.deepEqual(state, snapshot); }
});

test("untargeted defense preserves a living focus instead of switching enemies", () => {
  const state = newRun(42); state.enemies = [state.enemies[0], { ...state.enemies[0], id: 500 }]; state.focus = 500;
  state.hand = [{ uid: 101, id: "ward-of-ash" }]; const next = dispatch(state, { type: "play", uid: 101 });
  assert.equal(next.focus, 500); assert.equal(next.guard, 5);
});
