import {
  newRun,
  dispatch,
  playable,
  replay,
  type State,
} from "../../packages/engine/index";
import assert from "node:assert/strict";
let wins = 0,
  losses = 0,
  maxActions = 0;
for (let seed = 1; seed <= 1000; seed++) {
  let s: State = newRun(seed),
    actions = 0;
  while (s.phase !== "won" && s.phase !== "lost" && actions < 600) {
    if (s.phase === "reward")
      s = dispatch(s, { type: "reward", card: s.rewards[0] });
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
    actions++;
  }
  assert.ok(
    s.phase === "won" || s.phase === "lost",
    `Soft lock at seed ${seed}`,
  );
  assert.deepEqual(replay(seed, s.history), s);
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
