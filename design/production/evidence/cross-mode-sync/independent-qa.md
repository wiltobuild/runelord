# Independent cross-mode QA — 2026-10-12

Reviewer: `/root/independent_qa`; no production edits, staging, or commits.

## Environment and scope

Conquer checkout `C:/Users/wilsh/Projects/runelord` HEAD `03338e4da39bbaf1f48651557e45f71f455a291a`; demo checkout `C:/Users/wilsh/Projects/runelord-roguelike-pages-recovery` HEAD `be1dc8c85d04dbf335352a212cd1d16efedf0700`, with the coordinated uncommitted integration changes. Browser CUA IAB, screenshots observed at 1280×720. Real player routes used fresh origins `http://127.0.0.1:4337/` and `http://127.0.0.1:4338/`. Existing user saves on 4320/4321 were not started, resumed, or overwritten. Fresh UI uses random seed; no seed control was exposed, so seed42 was not forced via hidden state. Source edits/HMR during test reloaded Conquer once; this was not mistaken for a game defect.

## Observed passes

- Both heroes entered actual combat in both versions through title screen, hero/deck selection and Begin the pact. Conquer additionally traversed first location selection and Battle action; demo entered its nine-encounter run directly.
- Demo Gravehost: Exhume cost1Mana and changed Corpses1→3. Bone Defender consumed2Corpses while Mana remained2, spawned23HP/4Power and redirected appropriate enemy intents. Burial mound/resurrection and blue HUD/new card artwork rendered.
- Demo Glacial Ward cost1Mana, gave8Guard, drew1card. Reload/resume returned exactly8Guard/1Mana/1Corpse and one Bone Defender without duplicate application. All action controls recovered.
- Demo end turn: Bone Defender hit focused goblin for4, took1Rot and two attacks totaling11, ending11/23HP, Rot2, hero80HP; next turn unlocked with3Mana/newhand.
- Conquer Warlock: Pit Brute spent2Mana/2Cinders, spawned26HP/7Power withCleave/Defender. Sinister Veil cast immediately without selecting an enemy or requiring an attack first, gave hero8Guard and demon3Guard, and unlocked.
- Demo Warlock: Hellhound spent1Mana/2Cinders, spawned14HP/6Power using current cinematic asset and recovered controls.
- Conquer Runeblade: Gravehost entered Infernal battle with80HP,1Corpse, new blueHUD and shared summon/spell card descriptions.
- Conquer map visible without bridges; selected Battle action sat close above location art, clickable and entered encounter.
- Runeblade effects review on4320/4321 both rendered burial revision3 five-unit formation; sampled1000ms mound and2300ms resurrection. Nature-shield demo review showed green body-fitted ward on crab/mushroom.
- Browser logs checked after demo resume and Conquer ward contained no errors/warnings.

## Found and repaired during review

P2: Conquer Summon Pit Brute hand initially said10damage while spawned unit had7+Cleave. Rules builder repaired version-aware cardEffectText. Independent modern Conquer deck preview recheck read26HP,7damage to ALL enemies,Defender,Upkeep2; demo modern hand also read correct7ALL. Legacy-save copy behavior is covered by builder/engine tests, not this browser route.

## Asset inventory

See `inventory.json` and rerunnable `inventory.mjs`. Both manifests reference1,154 runtime paths; all exist. Latest output SHA checks all match. Active referenced source files all exist in both; no present source hash mismatches. Demo74missing provenance sources are unused historical entries. Required untracked runtime paths are714Conquer/238demo; git check-ignore now returns zero of those after producer's ignore-rule changes. They still need inclusion in the eventual commit. Package/public differences were restricted to provenance/integration metadata, not runtime bindings at review time; producer owns final normalization.

## Limits / not-run

This is a focused integration smoke route, not exhaustive gameplay acceptance. Full boss/victory/reward traversal, full-board dismissal, lethal Pact, audio listening/loop seams, mobile/keyboard/reduced-motion, all32frames, measured FPS, Scorch timing in real combat, and every card were not independently retested. Review timeline snapshots demonstrate rendering, not continuous smoothness. Main builds/tests/sim were left to coordinated final verification until builders marked stable, avoiding competing writes.

## Final stable-source recheck

After producer confirmed production stable and added legacy Warlock card binding, reran inventory: **1,155 referenced assets per repository; zero missing runtime files, zero output hash mismatches, zero present-source hash mismatches, zero missing active source files, zero ignored required assets.** Required untracked runtime counts are now715Conquer/239demo. These replace earlier counts above. Package/public manifests differ only in provenance/integration metadata; active bindings match.

Inspected progression entry points and changes independently: Conquer main still calls newInfernalRun and starts in map phase with generated branching journey. Demo main still calls newRoguelikeRun and retains its linear Infernal then Forest encounter progression and advanceAfterLoot. Hero-specific reward filtering and Runeblade relic drops were added; no accidental replacement of one mode's navigation/progression by the other was found. This is static review plus earlier real first-encounter routes, not an independently completed full campaign.

Static presentation recheck confirms EndTurnButton contains label/embers/turn announcement and no removed runic symbol row. Card enlargement is bounded to translateY(-8px)/scale(1.03), with inspection text positioned62px above the card. Scorch has dedicated settle,300mslead-in,1450msrecovery; label is SCORCH plus damage/blocked, fiery text shadow/flame animation and background:none/border:0. Dynamic final hover/Scorch recheck was unavailable because the earlier CUA browser binding was no longer available after handoff. Continuous effects FPS remains unmeasured by this reviewer; do not substitute these static observations for measured smoothness.

Final tested package-manifest SHA256: Conquer `d279b2d5fc558f425f62d311dd4d2513c7690114eb1c3a1654d7ac624a1ba01a`; demo `bf5784947961f6508c711caafddce860fef0d82c432d83ef8e3865c44ce3b7dc`. Producer is running final engine suites,1000seed simulations and builds; this reviewer intentionally did not duplicate them.
