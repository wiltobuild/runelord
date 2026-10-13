# Hellbound Legion revision 2 — independent QA

Reviewer `/root/hellbound_qa`, separate from engine/UI builders. Scope: ten-unit capacity, rank banking instead of living-unit carryover, Blood Ascension two-target sacrifice, adaptive formation and red promotion/aura presentation. No production changes made by reviewer. Previous revision QA does not establish these new behaviors.

## Tested revision

Pending working trees: `C:/Users/wilsh/Projects/runelord` and `C:/Users/wilsh/Projects/runelord-roguelike-pages-recovery`.

SHA-256 after the explicit-target repair: Conquer engine `A672A54827917BBBF6AAF686A425BCE80514DF3467BF973DC19E612545911677`; Roguelike engine `30003F534DE2295093C296F38B237D317F7E657BB383714CB8932340D3BF9088`; shared Hellbound definitions `3568C185ECD47F404D83B87E3DC79C6A09606EAE763584B2C1D4A00D7719AE43`.

## Independent behavioral probes — pass in both modes

Temporary executable evidence: `work/production/hellbound-legion/independent-r2.ts` in Conquer. Executed using `npx tsx <absolute probe path>` with each checkout as working directory. Seven independent probe groups passed after repair:

- Both pair cards succeed at eight occupants with exactly ten total, reject at nine/ten without dismissing or spending, and an eleventh single summon requires explicit dismissal.
- Blood Ascension requires an explicit living soldier beneficiary and an explicit, different living sacrifice. Missing beneficiary, missing victim, same target twice, nonexistent victim, and non-soldier beneficiary all reject atomically. Valid cast spends two Mana, kills the chosen victim before promotion, and gives exactly three ranks: Legionary 4→10 intrinsic Power, 18→24 maximum HP and Armor 3.
- Hostile death deposits a rank-two Pikeman once. Pike Detail consumes that saved rank once, producing ranks `[2,0]`, with the veteran fully summoned at 16 HP. No duplication of earned ranks.
- Sacrificing a rank-two duplicate banks its own rank while a rank-one beneficiary becomes rank four. Subsequent pair recruitment results in `[4,2,0]`, not cloned rank-four recruits.
- Victory clears every living summon, including an ordinary Imp. Two surviving Pikemen bank distinct ranks `[2,1]`. The next battle begins with no units; recruiting the pair restores those ranks at full HP `[16,14]` and empties the bank. Battle transitions do not deposit the same ranks twice.
- Historical marker-one construction retains five slots and the old two-Field-Promotion starter. New Blood Ascension behavior does not silently change old saved-run rules.
- Ten seeded legal revision-two histories per checkout were exercised for up to 55 actions each, through rewards and subsequent battles. Save/restore was compared after every action using normalized state. All comparisons passed, including rank-bank reconstruction. These are explicit engine histories; no claim is made that they manually traverse every campaign shop.

Separately executed builder tests and layout regressions: `npx tsx --test packages/engine/hellbound-r2.test.ts apps/web/src/warbandLayout.test.ts`: 22/22 passed in Conquer and 22/22 in Roguelike (seven revision-two rule tests and fifteen formation tests). Tests include ten mixed ground units at full intrinsic scale and ten Runeblade controls arranged in two rows. Parent owns final full suites/builds and any later formation changes.

## Defect found, repaired and rechecked

The original Blood Ascension validation accepted an action containing only a sacrifice ID, silently choosing the last unit as beneficiary through the generic targeting fallback. Reproduced with two Legionaries: `{type:'play', uid:999, sacrifice:first.id}` spent two Mana and promoted the second without an explicit beneficiary. Severity: medium validation defect; the normal UI already supplied both IDs.

Rules engineer added an explicit `action.unit !== undefined` requirement and regression case. Independently re-ran the missing-beneficiary action alongside other invalid cases in both checkouts. All now reject before payment; valid sacrifice still works. No unresolved engine defect found in the tested scope.

## Presentation review and browser limitation

Independent browser execution was unavailable in this revision: `cua.getState()` returned no browsers/apps and the prior browser binding was unavailable. Consequently this reviewer does **not** claim independent browser passage of the two-target interaction, ten-footers geometry, animated red seal, aura visibility, or appearance at mobile dimensions.

Static review confirms separate first-stage beneficiary selection, a prompt to select a different sacrifice, same-unit rejection, and dispatch of both IDs. Selecting another card resets the stored beneficiary. Promotion drawing uses blood-red glow, rotating seal and rising horns. Ranked actors render a rank-scaled red aura and red drop shadow, with reduced-motion handling for the aura. These code observations are not equivalent to playback validation.

Integration owner `/root` separately reported browser success at `http://127.0.0.1:4342/hellbound-review?group=ten`: Field Promotion made Vanguard rank one, then Blood Ascension explicitly selected Vanguard and Legionary 3; result Vanguard rank four, HP 32, Power 15, Armor 4, Legionaries reduced from three to two, Mana nine→seven, discard two, no console errors. Owner evidence: `rank-four-sacrifice.jpg`. Owner also inspected two rows of five footer controls and adjusted roots/footer placement to keep controls in bounds. This is builder-owned browser evidence, clearly distinguished from my independent rules checks.

No full simulation rerun was required for this bounded review. Full manual campaigns, balance, keyboard-only targeting, mobile layout, audio, measured FPS and exhaustive animation-frame review are not independently certified here.
