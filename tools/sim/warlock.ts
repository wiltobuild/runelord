import {
  newRoguelikeRun,
  canAddCard,
  save,
  restore,
  dispatch,
  playable,
  archForms,
  type State,
} from "../../packages/engine/index";
import assert from "node:assert/strict";
import type {StarterDeckId} from '../../packages/content/index';
const runCount=Number(process.argv.find(v=>v.startsWith('--runs='))?.split('=')[1]??1000);
const deck=(process.argv.find(v=>v.startsWith('--deck='))?.split('=')[1]??'warband') as StarterDeckId;
if(!Number.isInteger(runCount)||runCount<1||!['classic','fire','warband','pact'].includes(deck))throw Error('Use --runs=<positive integer> and --deck=classic|fire|warband|pact');
let wins = 0,
  losses = 0,
  maxActions = 0;
const maxActionsPerRun = 3000;
for (let seed = 1; seed <= runCount; seed++) {
  let s: State = newRoguelikeRun(seed,deck),
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
      const targetUnit=c?.id==='empower-demon'?s.units.find(u=>archForms[u.kind]&&!s.units.some(v=>v.kind===archForms[u.kind])):s.units[0];
      s = dispatch(
        s,
        c
          ? {
              type: "play",
              uid: c.uid,
              ...(targetUnit ? { unit: targetUnit.id } : {}),
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
      runs: runCount,
      starterDeck:deck,
      wins,
      losses,
      softLocks: 0,
      identicalReplays: runCount,
      maxActions,
    },
    null,
    2,
  ),
);
