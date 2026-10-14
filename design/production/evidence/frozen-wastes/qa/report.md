# Frozen Wastes independent QA

Reviewed 2026-10-14 by runelord-game-qa, independently of production authors. Scope: both Conquer and roguelike demo. No production files changed. Exact reviewed engine/content/main/manifest hashes are retained in `independent-results.json`; every referenced Frozen runtime image hash is retained in `asset-results.json`.

## Result

PASS: 10 targeted behavioral assertions across both checkouts, plus all 14 actor mappings and 76 distinct Frozen image files per checkout. All mapped files decode, have ordered state timings and match byte-for-byte between modes. Source revision baselines: Conquer f599bc1e554c07f2a2e15415292fd33f4ef57207; demo b335f3855bbbc2f3797060fd68304020de41b7ac, with current uncommitted implementation identified by evidence hashes.

- Existing earned Forest-completion saves without a Frozen rules gate retain historical won state and deterministic save/restore.
- Replaying that earned action history with an explicit Frozen v2 gate reaches the new realm; deck, upgrades, inventory, relics, gold, maximum HP and hero persist. The resulting state and first Conquer battle round-trip through save/restore.
- Seed 42 controlled transition fixtures for Warlock/warband and Runeblade/rimebound preserve permanent gains, including existing Corpses plus documented battle-start relic grants. Each visits twelve fights and four shops and finishes only after the final exchange; extra continue is rejected.
- Exactly three elite slots, fourteen existing ice identities and two Frozen background IDs are present.
- Final static review confirms development-only review fixtures are excluded from the save effect and normal player UI selects Frozen maps/shops/boss/completion copy.

## Defect found and repaired

P2: Conquer LootReveal originally used truthiness of frozenWastesVersion; legacy value 1 advertised Frozen continuation despite preserving historical Forest completion. Reported to root. Root repaired both callers to explicit `state.frozenWastesVersion===2`; independently re-read final sources and verified the exact comparison. No unresolved concrete defect from scoped review.

## Evidence and reproduction

From canonical checkout:

`npx tsx work/production/frozen-wastes/qa/independent-checks.ts`

`npx tsx work/production/frozen-wastes/qa/asset-checks.ts`

Both return exit 0. Node environment/timestamp are recorded in results. The earned save fixtures are the existing `forest-complete-save.json` and `forest-roguelike-complete.json`; these retain their recorded seeds and historical rule versions. Controlled new-hero route fixtures use seed 42.

## Limits

Final presentation repair reviewed separately after the original checks: both `useBattleDirector.ts` copies now select the frost palette for ward effects only when the enemy's art ID belongs to the Frozen roster. The ninth effect argument is the existing frost flag; `SpellEffects` routes it to `drawRunebladeSpell`, whose ward branch draws an ice shield. Frozen Sovereign phase-change events carry the enemy snapshot, select the existing frost burst, and continue before the infernal ascend/conflagrate branch. Forest and Infernal handling remain intact. This static repair review passes; current director/renderer/engine hashes are in `presentation-repair-results.json`. Engine tests were not repeated because this final change only alters presentation. Root reports browser transition, summon, enemy attack, Runeblade Chill, map and boss checks separately; these are not this reviewer's own browser observations.

Controlled route checks deliberately set enemy HP to zero and skip combat difficulty. They are not a full naturally earned Frozen campaign victory or balance certification. Earned replay checks reach Frozen entry/first battle, not a legal whole-Frozen completion. Existing source packages author idle only; wounded idle reuses idle, action states hold a pose, and death fades. This accepted source limitation is documented by the asset integrator; no full authored combat-animation or approval claim is made. Filesystem image decode does not establish browser playback or visual fidelity.

Browser interaction, layout, refresh during presentation, console/network, audio and full frame playback are NOT RUN by this reviewer; root owns browser checks at ports 4350/4351 and broad suites/builds. Their separate evidence must determine those acceptance items. No packet completion status was edited by QA.
