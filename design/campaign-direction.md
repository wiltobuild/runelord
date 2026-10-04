# Runelord Conquer Mode direction

**Decision date: 2026-10-03. Status: accepted product direction for Conquer Mode; implementation is pending unless explicitly documented in the playable roguelike demo scope.**

Conquer Mode is the long-form six-to-nine-hour campaign being developed beside the deployed Roguelike Demo. The modes share Runelord's combat, cards, Warbands, hero classes, and growing production art library, but are intentionally preserved separately while territory progression matures. See [mode ownership](branch-modes.md).

This document records the user's revised direction. It supersedes the old three-act roguelike structure, inherited reference economy, single-upgrade assumptions, and run-reset progression in the archived v2 plan. Existing combat, art, animation, music, and catalog work remains useful; old numbers and acquisition rules are not automatically campaign requirements.

## Experience and objective

Runelord keeps tactical turn-based card combat with a hero and Warband, while expanding into a persistent **6–9 hour campaign**. Progress accumulates through stronger cards, spell combinations, elite units, equipment, relics, and territory. This duration is a design target, not the current demo's length or a fixed timetable for each region.

The final objective is to defeat every Sovereign and become **Sovereign Supreme**. Each Sovereign rules a biome with its own monsters and a final boss encounter. Defeating each Sovereign grants a choice of powerful relics.

Persistence here means progress carried through the campaign. Hero-death penalties, campaign failure, and what survives a new campaign are not yet decided; do not assume either total roguelike resets or loss-free resurrection.

## Campaign sequence

1. **First biome:** choose branching paths toward its Sovereign. Regular battles are the most common nodes, mixed with elites, shops, and treasure.
2. **First Sovereign defeated:** claim the first map as the hero's territory. Unlock the stronghold and its building, upgrade, and defense systems at this point, not before.
3. **Expansion:** the game shifts to open-world maps whose areas unlock as the player progresses. Explore other biomes, improve the realm, and engage with optional factions.
4. **Conquest:** fight through each Sovereign's biome and defeat its ruler. Choose a powerful relic after each victory.
5. **Supreme rule:** defeat all Sovereigns to achieve the campaign's main goal.

The first map explicitly becomes territory. How later conquests add land, the number of Sovereigns, and the map-unlocking rules remain to be designed.

## Lasting progression

| System | Required direction | Not yet specified |
|---|---|---|
| Card levels | Cards can be upgraded multiple times. Shops provide the first few levels. | Maximum levels, costs, upgrade branches, and access to later levels |
| Spell combination | Combine spell cards into more powerful versions. | Recipes, compatible inputs, consumption, and result inheritance |
| Warband fusion | Fuse Warband members into more elite and powerful members. | Eligible families, inputs, cost, timing, persistence, and inherited traits |
| Equipment | Slotted gear grants stat upgrades and passive benefits. | Slot list, class restrictions, rarity scaling, and replacement rules |
| Relics | Reward distinctive passive power, including powerful Sovereign reward choices. | Relic limits, stacking rules, and complete effect pools |
| Territory | Configurable, highly upgradeable defenses and support structures strengthen the campaign build. | Plot counts, upgrade caps, resource names, and construction costs |

Equipment, relics, and potions are distinct reward and inventory concepts. Existing Runestone content can inform relic design, but must be classified deliberately rather than treating every item as interchangeable gear. Keep potion and item presentation separate.

Existing class mechanics remain the combat baseline. Fusion must be reconciled with temporary summons, decaying Thralls, constructs, and persistent companions; this direction does not silently turn every combat summon into a permanent roster member.

## Branching encounters and rewards

The first route must offer meaningful path choices rather than the demo's fixed encounter sequence. Show enough encounter information for players to choose between combat rewards, elite risk, shopping, and treasure.

| Encounter | Experience | Rewards or services |
|---|---|---|
| Regular monsters | Most common battle type | Gold, sometimes a potion, and a choice of card to keep |
| Elite monsters | Stronger enemies | Guaranteed gear or relic, plus a choice of card to keep |
| Shop | Noncombat encounter with a shopkeeper | Limited stock of cards, potions, relics, and gear; buy cards, remove cards, and upgrade owned cards through their first few levels |
| Treasure | Reward encounter, sometimes with a tradeoff | Sometimes free gear or a relic; other offers cost health, gold, or another relic. When a cost is required, offer a rare relic in return |
| Sovereign | Final boss of its biome | A choice of powerful relics; the first victory also unlocks the stronghold and ownership of the first map |

Shops are the **main source of neutral cards**. Their quantities and stock are limited, not infinite catalogs. Exact prices, restocking, inventories, reward counts, and rarity odds need campaign-specific tuning. Do not inherit the old reference game's room counts or shop prices as binding defaults.

Existing demo starter-pact weighting and randomized card rewards are prototype behavior, not a complete campaign reward specification. Sovereign card rewards and additional elite rewards beyond those listed above remain unspecified.

## Stronghold and territory plots

Territory provides both autonomous defense and long-term build support.

- **Smaller defense towers:** assign upgraded cards to configure how they fight automatically. Towers spawn and buff their own forces and support extensive upgrades and configuration.
- **Throne City:** the final and strongest defensive encounter. Its defenses directly support the hero, including automatically spawning Warband members each turn and buffing the hero or Warband.
- **Support plots:** structures passively benefit the hero, Warband, other structures, or some combination defined by the structure.
- **Resource plots:** structures produce resources after encounters, in varying amounts. The player spends those resources on further upgrades.

Structure identity, card assignment rules, resource yields, and upgrade tradeoffs need separate specifications. In particular, whether an assigned card remains in the player's deck or is committed exclusively to defense is an open decision.

## Invasion resolution

An invading army must work through a **series of simulated defensive encounters** before reaching the Throne City.

1. Resolve the army against the first defense using the player's configured cards and structures.
2. Remove killed attackers permanently from that invasion. They cannot reappear at later defenses or at the Throne City.
3. If attackers remain, carry the surviving force forward to the next defense and simulate again.
4. If every attacker dies before reaching the Throne City, the invasion ends. **No hero intervention is required.**
5. If any attackers reach the Throne City, the hero **must teleport home** and fight alongside its strongest defenses against the surviving force.

This is attrition across one invasion, not a fresh full-strength army generated at every tower. Death persistence is settled; carryover of surviving attackers' HP, statuses, cooldowns, and reinforcements is not. Defender losses and rebuilding rules are also undecided.

The simulation should produce an understandable account of where attackers died and why a breach occurred. Deterministic rules and replayable results are the intended technical foundation; whether the player watches each simulated battle, gets a summary, or has both options is a later UX decision.

Invasion frequency, trigger conditions, scheduling during exploration, the interrupted activity's resume behavior, simultaneous invasions, and consequences of losing the Throne City are open questions. Do not interpret automatic defense as a requirement for real-time offline progression or multiplayer attacks.

## Optional regions and factions

The world includes areas and factions outside the Sovereign conquest chain:

- **Dragon's Roost:** dragon encounters with rare loot.
- **Human, elven, and dwarven provinces:** the player can raid, take over, or destroy them.
- **Neutral trade and reputation:** trade with neutrals and gain reputation through trading and helping with quests.

These provide exploration, loot, and relationships beyond the main victory path. The exact consequences of raiding, conquest, destruction, diplomacy, and reputation tiers are undecided. Non-Sovereign regions are not additional mandatory Sovereigns by default.

## Design boundaries and next decisions

The direction above is settled; these details need design before implementation:

- Campaign pacing and save model; hero defeat, recovery, and new-campaign rules.
- Card level curves and higher-level upgrade sources; spell and unit fusion recipes and consumption.
- Equipment slots, gear/relic interaction, stacking, and inventory capacity.
- Branching map generation, area unlocks, travel, encounter refresh, and first-map ownership presentation.
- Tower card allocation, automated targeting, structure progression, defender casualties, and repair.
- Invasion timing, survivor HP/status carryover, teleport interruption, and Throne City defeat.
- Resource economy and which encounter completions generate structure income, including simulated defenses.
- Neutral faction relationships, reputation rewards, quests, and the effects of conquest or destruction.

No gameplay code changes are authorized by this documentation update. The [roadmap](../PLAN.md) describes future slices; it does not launch them.
