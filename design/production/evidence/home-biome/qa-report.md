# Home-biome independent QA

Reviewer: runelord-game-qa. Scope: Runeblade Frozen Wastes → Forest → Infernal route in Conquer and demo; Warlock remains Infernal-first. Production files were read only. Test seed 42. Runtime version, timestamps and reviewed hashes are in results.json.

## Results

22 targeted checks pass across both checkouts. Each of gravehost, rimebound and runewarden starts in Frozen Wastes, then survives save/restore equality at new-run and after a legal opening end-turn. Warband still starts Infernal and round-trips.

Eight genuine prior-version saves were captured before implementation (three Runeblade decks and Warband in each mode). Each replays to its exact serialized prior state, excluding only the new explicit heroRouteVersion metadata, with original Infernal origin. This comparison normalizes undefined object fields omitted by JSON. Restoring and resaving each state round-trips.

Controlled all-deck route checks visit Frozen → Forest → Infernal exactly once and finish without a loop. Both later-realm routes contain twelve fights and four shops. Demo includes all 33 fights, 11 shops and four Infernal-only camps. Its gold amounts and first Infernal item drop are checked against local biome encounter indexes. All inspected shops offer Runeblade cards. Deck levels, deck contents and supplies persist; boundary dispatch from duplicate seeded states is deterministic. Conquer's existing Infernal map is outside the changed topology: its final boss loot acknowledgement was isolated after both complete twelve-fight realms and reaches won directly. Further continue is rejected.

## Defect and repair

P2 reported to root: demo camp UI used global room==1, promising 50% healing at Runeblade's first Infernal camp although rules correctly heal 30%. Root changed UI to realmEncounterNumber(state)==2; independently re-read and verified. No unresolved concrete defect found in scoped engine/UI review.

Static UI review also confirms route-aware LootReveal, Conquer realm numbering, and demo shop rotation use the selected route/local encounter number.

## Reproduce

From C:/Users/wilsh/Projects/runelord: `npx tsx work/production/home-biome/qa/checks.ts` (exit 0). Sources: checks.ts, baseline-saves.json, results.json. capture-baseline.ts documents original capture; do not rerun it now because that would replace the pre-change snapshots.

## Coverage limits and retained risk

Controlled route fixtures set enemies to zero HP. They verify transitions, formulas and terminal state, not combat balance. Boundary duplicate-dispatch equality is not a naturally earned whole-route save/restore test. New-run/first-battle saves and historical saves are tested; a legal Runeblade save spanning the new Frozen→Forest→Infernal boundaries is not available and remains unverified independently.

Frozen Wastes still uses its original later-biome enemy budgets (opening 65 HP per enemy, escalating through the 340 HP Sovereign). Starting fresh Runeblade decks there may be substantially harder; no silent rebalancing was performed. This review does not certify opening difficulty or that every starter can finish the route naturally.

Root owns broad suites/build and browser validation. Browser playback, UI layout, audio and browser refresh were not run by this reviewer and must use root's separate evidence.
