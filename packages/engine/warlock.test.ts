import { test } from "node:test";
import assert from "node:assert/strict";
import {
  newRun,
  dispatch,
  replay,
  save,
  restore,
  resolveTargets,
  type State,
  type Unit,
} from "./index";
import { implemented, type CardId } from "../content/index";
function setup(id: CardId) {
  const s = newRun(42);
  s.hand = [{ uid: 99, id }];
  s.mana = 10;
  s.cinders = 10;
  return s;
}
const play = (s: State) =>
  dispatch(s, { type: "play", uid: 99, target: s.enemies[0].id });
const demon = (kind: Unit["kind"] = "hellhound"): Unit => ({
  id: 50,
  kind,
  name: kind,
  hp: 20,
  maxHp: 20,
  power: 6,
  upkeep: 1,
  guard: 0,
  defender: kind === "pit-brute",
});
test("Healing Draught heals 20% Max HP rounded down and is single use", () => {
  const s = newRun();
  s.hp = 30;
  const next = dispatch(s, { type: "potion" });
  assert.equal(next.hp, 44);
  assert.equal(next.potion, false);
  assert.throws(() => dispatch(next, { type: "potion" }));
  assert.equal(dispatch(newRun(), { type: "potion" }).hp, 72);
});
test("presentation events capture actual targets and immutable impact checkpoints", () => {
  const s = newRun(123);
  s.enemies = [
    {
      ...s.enemies[0],
      moves: [{ name: "Strike", damage: 6, targeting: "hero" }],
    },
  ];
  s.units = [{ ...demon("pit-brute"), power: 0, upkeep: 0 }];
  const n = dispatch(s, { type: "end" });
  const attack = n.events.find((e) => e.type === "enemy")!;
  const impact = n.events.find((e) => e.type === "enemy-impact")!;
  assert.deepEqual(attack.targets, [50]);
  assert.deepEqual(impact.targets, [50]);
  assert.equal(attack.view!.units[0].hp, 20);
  assert.equal(impact.view!.units[0].hp, 14);
  assert.equal(n.hp, 72);
  n.units[0].hp = 1;
  assert.equal(
    impact.view!.units[0].hp,
    14,
    "Presentation snapshots must not share live entity references",
  );
});
test("sweep presentation includes the hero and every demon in resolution order", () => {
  const s = newRun();
  s.units = [
    { ...demon(), power: 0 },
    { ...demon(), id: 51, power: 0 },
  ];
  s.enemies = [
    {
      ...s.enemies[0],
      moves: [{ name: "Sweep", damage: 3, targeting: "sweep" }],
    },
  ];
  const n = dispatch(s, { type: "end" });
  assert.deepEqual(n.events.find((e) => e.type === "enemy")!.targets, [
    "hero",
    51,
    50,
  ]);
  assert.deepEqual(
    n.events
      .filter((e) => e.type === "unit-hit")
      .map((e) => [e.target, e.amount]),
    [
      [51, 3],
      [50, 3],
    ],
  );
});
test("starter is the catalog 10-card deck and Brand begins with 3 Cinders", () => {
  const s = newRun();
  assert.equal(s.deck.length, 10);
  assert.equal(s.cinders, 3);
  assert.equal(s.hand.length, 5);
  assert.equal(s.draw.length, 5);
  assert.equal(s.hp, 72);
});
const expectations: Partial<Record<CardId, (before: State, after: State) => void>> = {
  firebolt: (a, b) => assert.equal(b.enemies[0].hp, a.enemies[0].hp - 6),
  "ward-of-ash": (_, b) => assert.equal(b.guard, 5),
  "summon-imp": (a, b) => {
    assert.equal(b.units[0].hp, 6);
    assert.equal(b.enemies[0].hp, a.enemies[0].hp - 4);
    assert.equal(b.enemies[0].scorch, 1);
  },
  "blood-pact": (a, b) => {
    assert.equal(b.hp, a.hp - 3);
    assert.equal(b.corruption, 3);
    assert.equal(b.mana, 11);
    assert.equal(b.cinders, 13);
  },
  immolate: (a, b) => {
    assert.equal(b.enemies[0].hp, a.enemies[0].hp - 4);
    assert.equal(b.enemies[0].scorch, 4);
  },
  "summon-hellhound": (_, b) => {
    assert.equal(b.units[0].hp, 14);
    assert.equal(b.units[0].power, 6);
    assert.equal(b.units[0].upkeep, 1);
    assert.equal(b.cinders, 8);
  },
  "sinister-veil": (_, b) => {
    assert.equal(b.guard, 8);
    assert.equal(b.units[0].guard, 3);
  },
  kindle: (_, b) => {
    assert.equal(b.cinders, 14);
    assert.equal(b.hand.length, 1);
  },
  "smoldering-brand": (a, b) => {
    assert.equal(b.enemies[0].hp, a.enemies[0].hp - 3);
    assert.equal(b.enemies[0].scorch, 3);
  },
  "summon-pit-brute": (_, b) => {
    assert.equal(b.units[0].hp, 26);
    assert.equal(b.units[0].defender, true);
    assert.equal(b.units[0].upkeep, 2);
  },
  conflagrate: (a, b) =>
    b.enemies.forEach((e, i) => {
      assert.equal(e.hp, a.enemies[i].hp - 8);
      assert.equal(e.scorch, 2);
    }),
  "feed-the-pit": (a, b) => {
    assert.equal(b.hp, a.hp - 2);
    assert.equal(b.corruption, 2);
    assert.equal(b.cinders, 14);
  },
  "ashen-ward": (_, b) => {
    assert.equal(b.guard, 7);
    assert.ok(b.enemies.every((e) => e.scorch === 2));
  },
  "searing-lash": (a, b) => {
    assert.equal(b.enemies[0].hp, a.enemies[0].hp - 9);
    assert.equal(b.cinders, 11);
  },
};
for (const id of Object.keys(expectations) as CardId[])
  test(`catalog effect: ${id}`, () => {
    const s = setup(id);
    if (id === "sinister-veil") s.units = [demon()];
    if (id === "searing-lash") s.enemies[0].scorch = 1;
    const snapshot = structuredClone(s),
      next = play(s);
    expectations[id]!(s, next);
    assert.deepEqual(s, snapshot, "Actions must not mutate their input");
  });
test("invalid costs and targets leave the input unchanged", () => {
  const s = setup("summon-hellhound");
  s.cinders = 1;
  assert.throws(() => play(s));
  assert.equal(s.hand.length, 1);
  assert.throws(() => dispatch(newRun(), { type: "focus", target: -1 }));
});
test("Scorch triggers AFTER enemy attack, halves, and grants Cinders on death", () => {
  const s = newRun();
  s.enemies = [s.enemies[0]];
  s.enemies[0].scorch = 8;
  const n = dispatch(s, { type: "end" });
  assert.equal(n.hp, 66);
  assert.equal(n.enemies[0].scorch, 4);
  assert.equal(n.enemies[0].hp, 15);
  s.enemies[0].hp = 4;
  const won = dispatch(s, { type: "end" });
  assert.equal(won.phase, "reward");
  assert.equal(won.cinders, 7);
});
test("Muster is front to back and prevents enemies acting after lethal", () => {
  const s = newRun();
  s.enemies = [s.enemies[0]];
  s.enemies[0].hp = 5;
  s.units = [
    { ...demon(), id: 51 },
    { ...demon(), id: 52 },
  ];
  const n = dispatch(s, { type: "end" });
  assert.equal(n.events.find((e) => e.type === "muster")?.actor, 52);
  assert.equal(n.hp, 72);
  assert.equal(n.phase, "reward");
});
test("unpaid Upkeep ignores Guard, Brand refunds one Cinder per HP-loss event", () => {
  const s = newRun();
  s.enemies = [
    {
      ...s.enemies[0],
      hp: 100,
      maxHp: 100,
      moves: [{ name: "Wait", damage: 0, targeting: "hero" }],
    },
  ];
  s.units = [{ ...demon("pit-brute"), upkeep: 2, power: 0 }];
  s.cinders = 0;
  s.guard = 50;
  const n = dispatch(s, { type: "end" });
  assert.equal(n.hp, 70);
  assert.equal(n.cinders, 1);
  assert.equal(n.guard, 0);
});
test("Defender intercepts hero but not sweep or ignore_defender", () => {
  const s = newRun();
  s.units = [demon("pit-brute"), { ...demon(), id: 51 }];
  assert.equal((resolveTargets(s, "hero")[0] as Unit).id, 50);
  assert.equal((resolveTargets(s, "front")[0] as Unit).id, 51);
  assert.equal(resolveTargets(s, "sweep").length, 3);
  assert.deepEqual(resolveTargets(s, "ignore_defender"), ["hero"]);
});
test("full Warband requires explicit dismissal and death adds Corruption", () => {
  const s = setup("summon-imp");
  s.units = Array.from({ length: 5 }, (_, i) => ({ ...demon(), id: 50 + i }));
  assert.throws(() => play(s), /dismiss/);
  const n = dispatch(s, { type: "play", uid: 99, dismiss: 50 });
  assert.equal(n.units.length, 5);
  assert.equal(n.corruption, 2);
  assert.ok(!n.units.some((u) => u.id === 50));
});
test("Pact can kill hero and cannot then grant a reward", () => {
  const s = setup("blood-pact");
  s.hp = 2;
  const n = play(s);
  assert.equal(n.phase, "lost");
  assert.equal(n.hp, 0);
  assert.equal(n.mana, 10);
});
test("Demon Form activates next turn and lasts through final Muster", () => {
  const s = newRun();
  s.corruption = 10;
  s.enemies = [
    {
      ...s.enemies[0],
      hp: 200,
      maxHp: 200,
      moves: [{ name: "Wait", damage: 0, targeting: "hero" }],
    },
  ];
  let n = dispatch(s, { type: "end" });
  assert.equal(n.demonTurns, 3);
  n.units = [{ ...demon(), upkeep: 0 }];
  n = dispatch(n, { type: "end" });
  assert.equal(n.demonTurns, 2);
  assert.equal(n.enemies[0].hp, 192);
  n = dispatch(n, { type: "end" });
  n = dispatch(n, { type: "end" });
  assert.equal(n.demonTurns, 0);
  assert.equal(n.corruption, 0);
  assert.equal(n.hand.length, 4);
  assert.equal(n.enemies[0].hp, 176);
});
test("replay and save/resume reproduce identical state", () => {
  let s = newRun(9);
  for (let i = 0; i < 3 && s.phase === "combat"; i++) {
    const card = s.hand.find((c) => c.id === "ward-of-ash");
    if (card) s = dispatch(s, { type: "play", uid: card.uid });
    s = dispatch(s, { type: "end" });
  }
  assert.deepEqual(replay(s.seed, s.history), s);
  assert.deepEqual(restore(save(s)), s);
  assert.throws(() => restore('{"schema":0}'));
});
test("legacy reward, rest, boss, and victory transitions", () => {
  let s = newRun();
  s.rulesVersion = 2;
  s.enemies.forEach((e) => (e.hp = 1));
  s.units = [
    { ...demon(), id: 51 },
    { ...demon(), id: 52 },
  ];
  s = dispatch(s, { type: "end" });
  assert.equal(s.phase, "reward");
  s = dispatch(s, { type: "reward", card: "summon-hellhound" });
  assert.equal(s.room, 1);
  assert.equal(s.deck.length, 11);
  s.enemies[0].hp = 1;
  s.units = [demon()];
  s = dispatch(s, { type: "end" });
  s = dispatch(s, { type: "reward", card: "summon-pit-brute" });
  assert.equal(s.phase, "camp");
  s.hp = 30;
  s = dispatch(s, { type: "camp" });
  assert.equal(s.room, 2);
  assert.equal(s.hp, 51);
  s.enemies[0].hp = 1;
  s.units = [demon()];
  s = dispatch(s, { type: "end" });
  assert.equal(s.phase, "reward", "The former final boss now leads into the five new encounters");
});
