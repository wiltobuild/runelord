# Runelord

Runelord is an original **campaign deckbuilding RPG with Warband combat and territory conquest**, built for the browser. Turn-based card battles remain at its core, but progression is designed to carry a **6–9 hour campaign**: upgrade cards repeatedly, combine spells, fuse elite allies, equip gear, and build a realm capable of defending itself.

Choose branching routes through your first biome and defeat its Sovereign. That first map becomes your territory and unlocks your stronghold. From there, explore progressively unlocked open-world maps, conquer the remaining Sovereigns, and become **Sovereign Supreme**. Optional regions, neutral provinces, trade, reputation, and quests offer other routes to power.

Each hero commands a distinct Warband:

- **Runeblade:** raises fallen enemies as Thralls.
- **Warlock:** summons demons and draws on demonic power.
- **Runesmith:** deploys constructs and pilots the Thunderhulk.
- **Ranger:** tames beasts and builds a persistent companion roster.

**Current status:** playable Warlock combat demo, not yet the campaign described above. It has three starter pacts, a fixed nine-encounter route, rewards, items, and a final demon lord. Branching campaign maps, repeated card upgrades, spell combination, unit fusion, slotted equipment progression, strongholds, invasions, and faction reputation are planned work.

Start locally with `npm install`, `npm run import:content`, `npm run import:assets`, then `npm run dev`. Open http://127.0.0.1:4320. Existing artwork and music are required locally.

| Start here | Purpose |
|---|---|
| [Campaign direction](design/campaign-direction.md) | Authoritative product direction, progression, encounter rewards, territory, invasions, and open decisions |
| [Build plan](PLAN.md) | Roadmap for delivering the new campaign |
| [Warlock demo](design/warlock-demo.md) | Current prototype scope, controls, and validation |
| [Heroes](design/heroes.md) | Hero identities and combat design baseline |
| [Warband system](design/warband-system.md) | Allied-unit combat rules and campaign integration boundaries |
| [Catalog](catalog/) | Existing card, unit, potion, and runestone design inventory; not an implementation checklist |
| [Production workflow](design/production/README.md) | Project agents, skills, and [acceptance route](design/production/acceptance-route.md) |
| [Art and style atlas](http://localhost:4317) | Local approval gallery; [setup](style-gallery/README.md) |
| [Music sources](assets/audio/music/) | Scores, stems, editable MIDI, and audition tools |

The [Slay the Spire 2 research](reference/sts2/) is historical genre research with its own data NOTICE. Its three-act structure, economy, and progression rules are no longer requirements for Runelord.
