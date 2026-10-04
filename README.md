# Runelord — Cinder & Oath

**Rule a warband. Break the Sovereigns. Build an empire that can survive without you.**

Runelord is an original browser-first tactical deckbuilding RPG. Every fight is a deliberate, turn-based duel between a hero, their deck, and a living Warband. Every victory feeds a larger ambition: carve a route through hostile realms, take their power, and ultimately become **Sovereign Supreme**.

The project is deliberately moving along two connected tracks. The playable **Roguelike Demo** delivers the tight, combat-first Runelord experience. **Conquer Mode** is the long-form campaign that grows out of that combat foundation: a six-to-nine-hour conquest where decks, demons, equipment, territory, and defenses all persist and evolve. They are preserved independently today and designed to unite later. See [branch and mode ownership](design/branch-modes.md).

## Play the Roguelike Demo

The live demo is a complete Warlock-first combat slice: animated demon-form hero presentation, Warband combat, three starter pacts, a nine-encounter Infernal route, card rewards, loot, relics, potions, a demon-lord finale, and the Soulforge shop after encounters three and six.

The Soulforge is not a mockup. It rolls one of three infernal shops and shopkeepers per visit, sells Warlock and neutral cards, relics, card upgrades, and removals, and supports escalating rerolls. Purchases, upgrade levels, and stock persist through save and replay.

Run locally:

```powershell
npm install
npm run import:content
npm run import:assets
npm run dev
```

Open `http://127.0.0.1:4320`. Imported local artwork and music are required when rebuilding the asset manifest.

## A growing art library, not placeholder content

Runelord already carries a large, expanding production library: thousands of source and runtime assets across hero portraits and whole-character animation frames, illustrated cards, demons and enemy families, bosses, summons, equipment, relics, potions, cinematic scenes, infernal environments, map structures, UI systems, visual effects, and original music.

This library is built to support a game rather than a single presentation page. The same art direction runs from card faces and shop pedestals through animated Warband units, boss arenas, title sequences, maps, and future territory structures. New work adds to that reusable foundation; it does not depend on one narrow enemy set or temporary placeholder art. The [art and style atlas](http://localhost:4317) and [production workflow](design/production/README.md) track provenance, approval, integration, and runtime readiness separately.

## Four heroes, four complete class identities

The Warlock is playable now. The other three hero classes are visible in character selection as **Coming Soon**, with finished 70-card class decks in the catalog and completed hero asset packages and selection presentation already in the library. Their battle implementations are the next major gameplay expansion after the remaining roguelike biomes.

| Hero | Combat fantasy | Warband | Deck identity | Current state |
|---|---|---|---|---|
| **Warlock — Cinder-Sworn of the Ninth Pit** | Burn the battlefield, bargain with blood, then become the monster. | Demons | Scorch, Cinders, Corruption, sacrifice, Demon Form | **Playable now** |
| **Runeblade — Oathsworn of the Long Winter** | A frost-armored executioner who turns the fallen into an army. | Thralls | Chill, Freeze, Shatter, Corpses, Raise, Rot | Coming soon to gameplay; deck and hero assets complete |
| **Runesmith — Thane of the Deep Forge** | A lightning-forge commander who floods the board with machines and steps into a war mech. | Constructs + Thunderhulk | Charge, Overcharge, Volts, Scrap, Arc, Mech Up | Coming soon to gameplay; deck and hero assets complete |
| **Ranger — Warden of the Thornwood** | A relentless hunter whose companions become a permanent fighting pack. | Tamed companions | Mark, Snare, Venom, Arrows, Tame, Bond | Coming soon to gameplay; deck and hero assets complete |

The deck catalogs are intentionally broad rather than starter-only lists: each class has a 70-card design deck spanning Basics, Commons, Uncommons, Rares, and Ultimates. Explore [Runeblade](catalog/cards-runeblade.md), [Warlock](catalog/cards-warlock.md), [Runesmith](catalog/cards-runesmith.md), [Ranger](catalog/cards-ranger.md), and [Neutral](catalog/cards-neutral.md) cards. The [hero guide](design/heroes.md) and [Warband rules](design/warband-system.md) explain how each class turns that deck into a distinct battlefield machine.

## Conquer Mode: the long game

Conquer Mode is Runelord's intended campaign-scale expression. Combat remains the heart of the game, but a winning battle is only one decision in a larger war. The first Sovereign’s biome is a branching climb toward a boss. Defeat that Sovereign and the map stops being a route you passed through: it becomes your territory, your stronghold, and the opening chapter of an expanding realm.

### The core conquest loop

1. **Choose a path through a hostile biome.** Regular battles, elite encounters, shops, treasure, and Sovereign routes make risk and reward visible before you commit.
2. **Win tactical Warband combat.** Build around your hero’s class mechanics, cards, units, status effects, positioning, and target priority.
3. **Take the right reward.** Regular fights supply gold, cards, and sometimes potions. Elites always pay out with gear or relics as well as a card choice. Treasures can be free, costly, or offer a rare relic in exchange for health, gold, or another relic.
4. **Forge a stronger build.** Shops are the principal source of neutral cards. Upgrade owned cards repeatedly, buy new cards, remove weak links, collect relics, equip gear, and pursue spell combinations rather than simply adding more cards.
5. **Defeat the Sovereign.** Claim a powerful relic choice. On the first victory, claim the biome itself and unlock the stronghold.
6. **Turn victory into territory.** Spend encounter-earned resources on plots, towers, support buildings, and the Throne City. Configure defensive cards and upgrades so your realm gains power while you travel.
7. **Expand into the open world.** Unlock new maps, conquer further Sovereigns, seek rare dragon loot, and decide whether human, elven, dwarven, and neutral regions become trading partners, quest givers, targets for raids, or future territory.

### Buildcraft that lasts

Conquer Mode is about compounding decisions. Cards can gain multiple upgrade levels; early levels are available in shops, while later growth and combination systems make the deck itself a long-term project. Compatible spells can be fused into stronger forms. Warband members can be fused into elite versions that carry a build in a new direction. Slotted equipment delivers stat growth and passives, while relics create sharp rule-changing moments.

The result should feel less like assembling one disposable run and more like shaping a personal fighting doctrine: a Warlock whose upgraded summons become an engine, a Runeblade who turns every kill into a winter legion, a Runesmith whose constructs power a Thunderhulk, or a Ranger whose carefully protected companions become the party’s backbone.

### A stronghold that fights its own wars

The stronghold is not a passive upgrade screen. It is a configurable defensive network built from your cards and progression choices.

- **Defense towers** spawn and strengthen their own forces, use assigned upgraded cards, and can be specialized through upgrades and configuration.
- **Support plots** improve the hero, Warband, or neighboring structures.
- **Resource plots** generate materials after encounters to fund continued expansion.
- **The Throne City** is the final, most powerful line of defense. Its effects are designed to directly reinforce the hero: automatically spawning Warband members, amplifying allies, or granting powerful class support.

When an invasion begins, attackers fight through a sequence of simulated defensive encounters. Their dead stay dead for the whole invasion. If the defenses eliminate the army before it reaches the Throne City, the player receives the outcome without needing to intervene. If survivors breach to the throne, the hero teleports home for the decisive fight alongside the strongest defenses. That creates a real strategic question: do you spend your next reward on today’s combat power, tomorrow’s tower, or the Throne City contingency that saves an entire campaign?

### Beyond the Sovereigns

The final ambition is to defeat every Sovereign and claim the title of **Sovereign Supreme**, but the world is larger than its main boss chain. Dragon’s Roost offers rare dragon encounters and exceptional loot. Human, elven, and dwarven provinces can be raided, conquered, or destroyed. Neutral factions can be traded with and helped through quests to build reputation. These regions are meant to give Conquer Mode political texture, exploration choices, and alternate paths to power rather than serving as filler between bosses.

## What is playable, what is in production

The Warlock roguelike demo is playable now. Conquer Mode’s territory map, shops, structures, map presentation, and art direction exist as active feature work on its preserved branch; the full persistent campaign, class gameplay for Runeblade/Ranger/Runesmith, card fusion, unit fusion, equipment slots, autonomous invasions, faction reputation, and open-world progression remain the intended build direction rather than completed gameplay.

This distinction matters: the project has the combat systems, art library, deck designs, and production foundation to support the bigger game, while the README is not claiming that every planned feature is already shipped.

## Documentation map

| Start here | Purpose |
|---|---|
| [Mode ownership](design/branch-modes.md) | How the deployed roguelike and Conquer Mode are preserved independently today |
| [Campaign direction](design/campaign-direction.md) | Authoritative Conquer Mode design: progression, territory, invasions, encounters, and open decisions |
| [Warlock demo](design/warlock-demo.md) | Current playable roguelike scope, controls, shops, and validation |
| [Heroes](design/heroes.md) | Four class identities, mechanics, and deck foundations |
| [Warband system](design/warband-system.md) | Allied-unit combat rules and campaign boundaries |
| [Catalog](catalog/) | Card, unit, potion, and runestone design library |
| [Build plan](PLAN.md) | Delivery roadmap |
| [Production workflow](design/production/README.md) | Asset, animation, integration, and acceptance route |
| [Music sources](assets/audio/music/) | Scores, stems, editable MIDI, and audition tools |

The [Slay the Spire 2 research](reference/sts2/) is historical genre research with its own data NOTICE. Its act structure, economy, and progression rules are not Runelord requirements.
