# Expedition / training independent QA

Reviewer: runelord-game-qa, separate from production authors. Reviewed both Conquer and demo. No production edits. Latest reviewed source SHA-256 values are in final-source-hashes.json. All earned simulations use seed 42 and actual dispatch actions without injected resources, enemy HP changes or other state cheats.

## Final result

28/28 independent adversarial checks pass. Thirteen retained earned histories reopen on the final frozen engine, preserve recorded phase/HP/room, and round-trip exactly. An additional earned training/order branch also round-trips after each new mechanic.

| Mode / policy | Fire | Warband | Hellbound | Gravehost | Rimebound | Runewarden |
|---|---|---|---|---|---|---|
| Conquer, fixed policy | Lost normally | Won | Won | Won | Won | Won |
| Demo, fixed policy | Won | Won | Won | Won | Over 80-turn bound | Won |
| Demo, upgrade/attack policy | — | — | — | — | Won | — |

Final Conquer action counts: Fire 219, Warband 1118, Hellbound 770, Gravehost 1147, Rimebound 1250, Runewarden 1076. Final demo fixed-policy counts: Fire 279, Warband 227, Hellbound 201, Gravehost 296, Rimebound 402 at the diagnostic stop, Runewarden 290. Improved demo Rimebound policy completes in 618 actions with 56 HP. All successful runs traverse their complete three-biome route and finish in won. The normal Fire loss and original Rimebound bound failure are retained honestly, not relabeled as victories.

## Adversarial coverage

- All 22 summon kinds have shared training across two copies, future copies, and three available orders when mastered. All 44 learned order definitions execute. Generated Imp tokens and actual card-summoned copies inherit the training.
- Invalid training/payment preserves the original state. Discounted removal spends exactly five gold with both discount relics and rejects four gold atomically.
- Commands perform the basic action without consuming utility; utility actions incur Rot. Dead defensive targets fall back, and dead hostile targets retarget a living enemy.
- Chosen Hellgate requires three channels, fires once, and its reinforcement does not act in the creation phase. Two channels do not trigger. Gorthak charges are shared across copies, and a full ten-unit board does not consume the failed reinforcement charge.
- Brace counters once against multiple attackers. Coordinated Thrust counts other selected Pikemen and caps its bonus at six. Unselected Legionaries no longer disable another Defender.
- All 30 declared relic hooks execute under their conditions and caps; additive discounts floor at one. Engine treasure actions collect the entire unique pool beyond 30, then yield gold when exhausted.
- Eight captured pre-change save snapshots preserve their original serialized gameplay state (new version metadata excluded) and round-trip.
- Demo route generation is deterministic over 1000 seeds: three distinct choices except forced normal opening and forced final boss. Mystery results never select a boss. Across 19,000 mystery samples: 12,482 treasure (65.7%), 1,863 normal combat, 1,835 shop, 1,862 camp, and 958 elite (5.0%).
- Selected normal/elite normalization applies to reserve monsters too: Frozen encounter-eight reserve is 93 HP normal / 112 HP selected elite, with no ordinary boss binding.

## Earned new-mechanic evidence

earned-training-save.json branches from a genuine current Warband campaign prefix. The player selects free Imp training at a camp, later summons an Imp, chooses Cinder Screen and executes the normal action phase. All three checkpoints save/restore exactly; the retained history has 53 legal actions. Training source and checks are recorded in earned-training-results.json.

## Defects found and rechecked

1. Discount relics did not reduce card removal's hardcoded price. Repaired by rules engineer; actual engine payment/atomicity test passes both modes.
2. Any two Legionaries disabled other Defender targeting even without chosen shields. Repaired by rules engineer; independent target check passes both modes.
3. Demo normal selection retained authored elite budgets; first repair missed reserves. Root repaired both front and reserve arrays; independent 93/112 HP assertions pass.
4. Demo route-choice title/art used the completed biome at boundaries. Root now derives the destination from room+1; final static source re-read passes.
5. Expansion boss victory text incorrectly promised a final exchange. Root uses expansion-specific continuation copy; final static re-read passes.

No unresolved concrete rules defect remains from scoped review. Root owns broad suites/build, actual browser actions, rendered camp art, audio and animation checks; this report does not claim those observations.

## Retained gameplay limitation

Demo Rimebound's original bot reached the Frozen Sovereign and exceeded the 80-turn combat bound with 78 hero HP, boss 90/340 HP, 137 Guard and 27 Chill. A better legal policy prioritizes card upgrades/training, upgrades Hew at healthy camps, and attacks ahead of surplus summons/defensive cards. It eventually wins the campaign, but the Frozen Sovereign fight lasts 93 turns (Forest/Infernal maxima five). This disproves an inevitable infinite loop for the tested route but establishes a serious slow-attrition risk. No rules were silently rebalanced to force the test to pass. Heuristic bots do not certify general difficulty or player experience.

## Reproduction and evidence selection

Run from C:/Users/wilsh/Projects/runelord:

- `npx tsx work/production/expedition-training/qa/adversarial.ts` — final exit 0, adversarial-results.json.
- `npx tsx work/production/expedition-training/qa/current-conquer-smoke.ts` — final exit 0, current-earned-results.json and current-earned-conquer-*.json.
- `npx tsx work/production/expedition-training/qa/upgrade-policy-smoke.ts` — exit 0, upgrade-policy-earned-results.json and upgrade-policy-earned-demo-rimebound.json.
- `npx tsx work/production/expedition-training/qa/final-replay.ts` — exit 0, all 13 entries pass in final-replay-results.json.
- `npx tsx work/production/expedition-training/qa/earned-training.ts` — exit 0, earned-training-results.json and earned-training-save.json.

The initial earned-results.json includes all six demo runs and earlier Conquer runs. Earlier earned-conquer-*.json files were produced while implementation was still changing and are superseded by current-earned-conquer-*.json. They are not final acceptance evidence. The original all-deck smoke exits 1 because it intentionally retains the 80-turn Rimebound diagnostic stop; final-replay-results explicitly includes that combat state rather than claiming it completed.
