# Frozen Wastes integration — 2026-10-14

Implemented locally in Conquer (f599bc1 + uncommitted changes) and roguelike demo (b335f38 + uncommitted changes).

## Player flow

New runs progress Infernal → Thornroot Forest → Frozen Wastes. Conquer retains map travel; demo retains linear battles (33 total). Frozen Wastes has 12 encounters, elites at 5/8/11, shops after 3/6/9/12, and Avalanche Colossus as Sovereign. Deck, upgrades, relics, resources and supplies carry forward. Final victory follows the last exchange. Historical saves retain their prior Forest ending through frozenWastesVersion=1; new saves use version 2.

Fourteen existing ice actor packages and two Frostgrave backgrounds are mapped with 76 verified runtime image files in each checkout. Source approval statuses are unchanged. Existing traveling woodland merchants provide the ice exchanges. Existing battle/explore scores are reused because no ice soundtrack is available.

## Verification

- Full suites: Conquer 303/303, demo 282/282 during integration. The added final Frozen mechanics test is covered by the final focused suites: 7/7 each.
- Both final production builds passed; existing >500 kB Vite chunk advisory remains.
- 100 seeded Warband simulations per mode: zero stalls, 100 identical replays each. The fixed-policy bot lost all 100 runs in each mode; these are crash/replay checks, not difficulty certification. Initial default 1000-seed processes were stopped without a result and replaced by these bounded runs.
- Independent QA: 10/10 progression/terminal/persistence checks for both heroes and modes; 14 actor mappings and 76 images verified in each. One legacy loot-copy defect was repaired and rechecked. Final ice ward/enrage routing independently reviewed.
- Root browser verification used separate fresh origins 4350/4351 and development fixtures, never a user's saved campaign. Via visible controls: Forest final shop → Frozen map (Conquer) or battle (demo); map arrival → combat; Warlock Hellhound summon; ice attacks correctly targeted the summon and unlocked on turn 2; Runeblade Frostbite dealt 14 HP and 5 Chill; Frostbite upgrade spent 200 gold and appeared at +3 in encounter 4; Avalanche throne loaded correct boss/background and its shield resolved with 170 Guard. No browser error/warning entries in checked views. No visible broken images. Layout checked at 1280×720 and 960×540, plus initial narrow portrait viewport.
- Final git diff whitespace checks passed both checkouts.

## Limits

Authored ice animations are idle-only. Wounded idle reuses idle; attack/cast/hit/guard use documented held poses and existing movement/effects; death fades to transparent. No full authored combat animation or changed gallery approval is claimed. Independent route checks control enemy HP; isolated legal-action kit smoke refills hero HP between fights. Continuous campaign difficulty, full frame-by-frame artistic review, audio listening, and an earned human campaign victory were not certified. Browser checks used review fixtures, while real historical action replay verifies the engine transition.

No commit, push or deployment performed. Local preview routes: http://127.0.0.1:4350/frozen-wastes-review and http://127.0.0.1:4351/frozen-wastes-review . Standard new campaigns run at the same origins' root paths.
