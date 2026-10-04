# Roguelike forest independent QA

Reviewer: forest_qa. Target: C:/Users/wilsh/Projects/runelord-tintfix-roguelike-main-push. HEAD9f7cfd76e10f25ff2c64dee528e7cb51cf011cbb plus reviewed working changes. This report covers the corrected MAIN roguelike target; earlier Conquer QA is a separate implementation and not evidence for this target.

Environment: Windows, Node24.18, agent-browser0.38.2 isolated roguelike-forest-qa session. URL http://127.0.0.1:5174/forest-review. Seed29 browser fixtures; seed11 legal engine full-run fixture. Viewports1280x720 and960x540.

## Independent observed passes

- Baseline target tests135/135 before implementation. Six forest engine tests independently pass after integration, including genuine438-action newRoguelikeRun completed save restore. Correct target has no pre-existing map geometry failure.
- Independent replay script executes all438 actions, checks exact save/restore every10 actions and every phase transition, finishes won at52HP. Visits21 battles and exactly seven shops after battles3,6,9,12,15,18,21. No journey field and no map/treasure phases at any action. Forest roster, reserves and moves exclude Suture Standard, fire, undead and summon AI. Script/results retained.
- Core tests verify permanent deck/copy levels, relics, inventory,gold,HP/maxHP carryover and old schema6 terminal history continuation into border shop9; historical non-shop schemas remain nine-room endings.
- Browser: crown loot -> Visit border exchange -> LEAVE -> FOREST1 OF12 combat directly, preserving450gold,10 leveled cards,72HP; crown gives5Guard/4Mana. No Conquer route/map UI.
- Forest1 actors and crossing scene render at1280. Summon Hellhound spends resources and locks input for presentation; unlocks. End turn resolves7 damage to Briarjaw,7 damage to Hellhound, guard/intent changes and next-turn hand, then unlocks.
- Forest shop3 upgrade Kindle for100gold -> sold/disabled; LEAVE -> FOREST4 OF12 directly,350gold and upgraded Kindle6Cinders. Woodland Exchange title and forest backdrop render, all services fit at1280 and960.
- Forest12 boss presents Gallows190HP/Pleatcap65/Threadwarden65, heart scene and FOREST12 OF12 label at960. Final exchange LEAVE -> The forest bows victory and restart/title controls.
- Original forest-explore04_lanterns_in_the_hollow.ogg and forest-boss06_the_silent_conclave.ogg both GET200 after user gesture. Music button changes to Mute. Empty final browser errors log.

## Scope and limitations

- Actual legal full-run replay validates engine/save flow; browser checks use explicit non-persisting developer fixtures. Full438-action player UI route and browser reload during animation not run.
- Audible audio/loop-seam listening not available in headless verification. Successful fetch and toggles are not an audible mix audit. Asset agent waveform/loop evidence is separate.
- Representative art and resolving presentations observed; no exhaustive frame identity/smoothness audit or complete keyboard/reduced-motion audit.
- Producer owns full141-test suite/build/production checks and24-seed balance evidence. This review does not relabel bot survival data as human difficulty testing.
- QA detected developer fixture-only stale opening enemies in crown/shop stages (living fire goblins behind final victory overlay). Real earned final state is correct. Reported to integration owner for fixture repair; final repair result appended below.

No production code was changed by this reviewer. Final recommendation: accept corrected roguelike integration subject to stated verification limits; no production blocking defect found.

Repair recheck PASS: developer fixture arrays cleared by integration owner. Reopened shop-12 and clicked Leave: victory-fixed-ax.log has no enemy target buttons; victory-fixed-960.png confirms forest victory overlay with empty arena. This supersedes victory-960.png. No unresolved new defect.
