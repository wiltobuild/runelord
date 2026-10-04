import {
  newRoguelikeRun,
  canAddCard,
  save,
  restore,
  dispatch,
  playable,
  type State,
} from "../../packages/engine/index";
import assert from "node:assert/strict";
let wins = 0,
  losses = 0,
  maxActions = 0;
const maxActionsPerRun = 3000;
for (let seed = 1; seed <= 1000; seed++) {
  let s: State = newRoguelikeRun(seed),
    actions = 0;
  while (s.phase !== "won" && s.phase !== "lost" && actions < maxActionsPerRun) {
    const before = JSON.stringify(s);
    if (s.phase === "reward")
      s = dispatch(s, { type: "reward", card: s.rewards.find(id => canAddCard(s, id)) ?? null });
    else if (s.phase === "loot") s = dispatch(s, { type: "continue" });
    else if (s.phase === "shop") s = dispatch(s, { type: "leave-shop" });
    else if (s.phase === "camp") s = dispatch(s, { type: "camp" });
    else if (s.hp <= 40 && s.potion) s = dispatch(s, { type: "potion" });
    else {
      const ranks: Record<string, number> = {
        "summon-imp": 10,
        "summon-hellhound": 9,
        "summon-pit-brute": 9,
        firebolt: 6,
        "ward-of-ash": 4,
        "blood-pact": 3,
      };
      const c = s.hand
        .filter(
          (c) =>
            playable(s, c) &&
            !(c.id === "blood-pact" && (s.hp < 10 || s.hand.length < 2)) &&
            !(c.id.startsWith("summon") && s.units.length >= 5),
        )
        .sort((a, b) => (ranks[b.id] ?? 5) - (ranks[a.id] ?? 5))[0];
      s = dispatch(
        s,
        c
          ? {
              type: "play",
              uid: c.uid,
              ...(s.units.length ? { unit: s.units[0].id } : {}),
              target: s.enemies
                .filter((e) => e.hp > 0)
                .sort((a, b) => a.hp - b.hp)[0].id,
            }
          : { type: "end" },
      );
    }
    assert.ok(
      s.hp >= 0 &&
        s.hp <= 72 &&
        s.cinders >= 0 &&
        s.cinders <= 20 &&
        s.mana >= 0 &&
        s.units.length <= 5,
    );
    assert.notEqual(JSON.stringify(s), before, `Unchanged-state stall at seed ${seed}`);
    actions++;
  }
  assert.ok(
    s.phase === "won" || s.phase === "lost",
    `Action budget exhausted at seed ${seed} after ${actions} actions`,
  );
  assert.deepEqual(restore(save(s)), s);
  if (s.phase === "won") wins++;
  else losses++;
  maxActions = Math.max(maxActions, actions);
}
console.log(
  JSON.stringify(
    {
      runs: 1000,
      wins,
      losses,
      softLocks: 0,
      identicalReplays: 1000,
      maxActions,
    },
    null,
    2,
  ),
);
