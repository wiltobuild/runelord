# Summon training and modest relics

The shared data source is `packages/engine/expansionCatalog.ts`, identical in Conquer and the roguelike checkout. It contains 22 current summon species, 44 additional orders, and 30 unique relics. The initial budgets are design choices, not balance certification.

## Training contract

Each species starts with its existing action and passive rules. Training I costs 60 gold and grants the first utility order; Training II costs 100 gold and grants the specialist order. A mastered species offers exactly three orders: base, utility, specialist. Training is recorded by species for the run and applies to every copy from every summoning source. It does not upgrade cards or change existing promotion rules. Archdemons have their own species records.

Each order declares an ID, display name, exact mechanical description, target category and effect array. `enemy` and `ally` require a living selected target; `self` selects the acting ally; `none` has no selected target. All-enemy and all-ally effects use living combatants. Effects resolve in listed order, with death and combat completion checked between damage applications. Orders consume the same activation opportunity as a base action. Switching the selected order cannot create an extra activation.

Damage amounts are fixed unless an effect explicitly declares a coordination bonus; existing defenses apply. Scorch, Chill, Sapped and Exposed use existing status rules. Healing is capped by maximum HP. Guard uses existing guard lifetime rules. Power training effects last for the current battle only. Drillmaster grants one selected ally +1 Power, not a stacking army-wide increase. Bodyguard temporarily grants Defender until the next turn, preserving innate Defender status.

Pikeman Brace grants 3 Guard and one 4-damage counter against the next incoming attack before the next turn. The counter is consumed once and is not a new ally action. Coordinated Thrust deals 7 damage plus 2 for each other living Pikeman selecting that order, capped at +6; it then applies 1 Exposed. Count the formation at resolution time.

Maledictor Hellgate Channel requires three living Maledictors selecting Channel and shares the existing once-per-turn gate. Keep its existing damage/status/promotion effects, then summon one Imp if space permits. Gorthak Dominion summons one Pit Brute and has one charge shared by species and order across the entire battle, including resummoned copies. New reinforcements never act instantly or again in their creation phase; they wait for the next normal action phase. Full Warbands never exceed capacity. A summoning order should not consume its limited charge when no slot is available. Charges reset at the next battle and persist through saving/reloading the current battle.

Iron Legionary opens with Slash, learns Shield and then Drillmaster. Ash Pikeman opens with Impale, learns Brace and then Coordinated Thrust. Maledictor opens with Scorch Hex, learns Benediction and then Hellgate Channel. Bone Defender, Frost Thrall and Rune Revenant have dedicated defense, Chill and rune-specialist kits. Every other current species, including all six Archdemons, has its own named utility and specialist pair in the catalog.

## Relic contract

Ownership has no slot limit; each relic ID can be owned at most once. Relic effects are small and additive. A hook observes a resolved non-relic event. Relic effects never recursively dispatch hooks and do not trigger one another. A newly acquired relic does not retroactively replay an earlier hook.

Each record declares `hook`, `effect`, positive `amount`, activation `cap`, `timing`, `oncePerTurn`, and `condition`. Every current cap is 1. `battle` resets with combat start, `turn` with player turn, `event` permits one activation per source event, and `purchase` applies once in that purchase's quoted price. A failed condition does not consume a cap. `oncePerTurn` is true exactly for turn timing.

Conditions: `always` is unconditional; `warband` requires a living ally; `empty-warband` requires none; `wounded` means strictly below half maximum hero HP; `trained` requires at least Training I on the event actor's species; `defender` checks that actor's Defender status; `scorched` and `chilled` require at least one living enemy with that status. Actor conditions are used only with actor-bearing hooks.

`unitPower` affects the triggering summoned unit for this battle. `unitHp` adds to that unit's current and maximum HP for this battle. Relic Scorch and Chill target the first living enemy in stable engine order. Other effects target the hero or its corresponding resource. Draw respects ordinary deck/hand rules. Victory hooks execute once after a real victory, not when viewing rewards again. A unit death emits one death hook even when several effects contributed.

Shop discounts are flat gold reductions applied to purchases and services, additive across distinct owned relics, with a final minimum cost of 1. Quotes and transaction charges must use the same calculation. Discounts do not themselves grant gold or fire combat hooks.

## Acceptance evidence required

Check all 22 engine kinds have exactly two catalog tiers and nonempty base names. Verify sequential training, shared ownership across duplicate summon cards and non-card sources, three mastered choices, existing card upgrades, promotions, full Warband behavior, invalid targets and Hellgate's shared once-per-turn limit. Verify each hook's cap reset and duplicate ownership rejection, price quote parity, save/replay determinism, and no recursion from relic effects.

These are proposed effect budgets. Integration and behavioral test evidence belong to the engine owner and independent QA; a catalog's existence alone does not certify combat balance.
