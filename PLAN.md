# Runelord: campaign build plan (v3)

**Updated 2026-10-04.** This is the roadmap for **Conquer Mode**. The [campaign direction](design/campaign-direction.md) is the authoritative product brief. The deployed Roguelike Demo on `main` remains a separately preserved combat-first experience while Conquer Mode develops on its feature branch; see [mode ownership](design/branch-modes.md). This roadmap replaces the three-act roguelike plan. The [v2 plan](design/archive/build-plan-v2.md) is retained as historical reference, not an active specification.

## Product target

A browser campaign deckbuilding RPG lasting roughly **6–9 hours**, with tactical hero/Warband combat and lasting progression. Defeat the first Sovereign along a branching route to claim that map and unlock the stronghold. Expand through progressively unlocked open-world regions, defend the realm, and defeat all Sovereigns to become **Sovereign Supreme**.

Keep the four hero identities and original content. Add repeated card upgrades, spell combination, elite Warband fusion, slotted gear, relic progression, configurable defenses, resource structures, and neutral-faction relationships.

The current Warlock roguelike demo is a combat and presentation foundation. It does not implement Conquer Mode's persistent campaign systems. See [demo scope](design/warlock-demo.md).

## Source precedence and retained work

1. Latest explicit user decisions.
2. [Campaign direction](design/campaign-direction.md) and this roadmap.
3. Relevant hero, Warband, catalog, art, and production contracts where compatible.
4. Historical plans and reference research, for context only.

Existing combat mechanics, asset pipelines, and catalog inventories remain useful. Catalog quantities are inventories, not promises of implemented or balanced content. Single-upgrade data, act-specific unlocks, Elder Spirit distribution, Ascension, inherited economy constants, and short-run balance targets require reconsideration before reuse. Co-op is not part of this campaign brief.

Art follows [the current art approval workflow](design/art-approval-workflow.md) and the latest approved masters and animation choices, not the archived plan's older fidelity targets.

## Architecture direction

Retain the current Vite/React interface, PixiJS presentation, TypeScript rules engine, content definitions, and asset pipeline. Preserve seeded randomness, serializable state, and rules/presentation separation.

Future campaign work needs durable ownership and progression for cards, equipment, fused units or their unlocks, regions, structures, resources, faction reputation, and invasion survivors. The precise schemas are not designed yet. Extend the existing save/replay model deliberately with versioning and migration; do not assume a combat replay alone captures the entire realm.

Autonomous defense should reuse compatible combat rules without requiring a hero or renderer for each simulation. Carry attacker identities and confirmed casualties between defense encounters. Record outcomes so the final city encounter contains only surviving attackers.

Do not change temporary summon lifetimes or companion persistence merely to make fusion easy. Resolve those design interactions first.

## Delivery roadmap

These are planned slices, not completed milestones or authorization to start coding.

| Slice | Scope | Acceptance target |
|---|---|---|
| 1. Branching first biome | Route selection, regular/elite/shop/treasure nodes, Sovereign destination | Different paths reach the same regional objective; regular battles are most common; encounter rewards match the brief |
| 2. Campaign build progression | Repeated card levels, shop early upgrades/removal, limited inventory, neutral acquisition, slotted gear | Purchases and upgrades persist; equipment grants stated benefits; inventory and currency remain consistent through save/load |
| 3. Combination and fusion | Spell recipes and elite Warband fusion after design decisions | Valid inputs produce defined stronger outcomes; costs and inheritance are explicit; class lifetimes remain coherent |
| 4. First conquest and stronghold | First Sovereign reward, first-map ownership, plots, towers, support and resource structures | Stronghold unlocks only after the victory; upgraded-card defenses are configurable; encounter income and bonuses apply once |
| 5. Invasion chain | Autonomous tower battles, attacker attrition, city escalation | Dead attackers never return; a wiped army causes no intervention; surviving invaders trigger hero teleport and a supported city battle |
| 6. World expansion | Progressively unlocked maps, additional biomes and Sovereigns | Region progress persists; each Sovereign offers a powerful relic choice; defeating all resolves the main objective |
| 7. Optional factions | Dragon's Roost, provinces, trade, reputation, quests | Optional loot and faction choices have defined effects; provinces support raid/takeover/destruction outcomes |
| 8. Campaign pacing and polish | Economy, defenses, combat balance, UX, accessibility, performance | Full-campaign playtests assess the 6–9 hour target and whether upgrades and territory remain meaningful |

Combat and content expansion can support these slices, but should not quietly hard-code unresolved campaign rules.

## Verification priorities

- Branch connectivity, encounter availability, reward guarantees, limited stock, and neutral card acquisition.
- Upgrade/fusion validation, resource consumption, gear passives, and save/load at each progression boundary.
- First-conquest unlock exactly once, plot ownership, structure bonuses, and encounter-income accounting.
- Replayable invasion outcomes; permanent attacker casualties throughout the chain.
- No intervention on total attacker defeat; correct survivor roster and hero support when the city is breached.
- Campaign interruption/resume after city defense once those rules are specified.
- Faction state and world unlock persistence; final victory after all required Sovereigns.
- Long-form balance and pacing playtests rather than inherited reference-game odds.

Current project checks include `npm test`, `npm run sim`, and `npm run build`. Passing them validates their present scope, not the future campaign systems.

## Open decisions

See [the decision list](design/campaign-direction.md#design-boundaries-and-next-decisions). Prioritize progression ownership, fusion consumption, defensive card allocation, invasion timing, defeat rules, and the resource economy before committing to their implementation.

Use the [production workflow](design/production/workflow.md) for authorized implementation slices. This revision changes documentation only.
