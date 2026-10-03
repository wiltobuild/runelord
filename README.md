# Runelord

[Project agents, skills and production workflow](design/production/README.md) · [Reusable acceptance route](design/production/acceptance-route.md)

[Open the live art & style atlas](http://localhost:4317) · [Gallery setup and automatic indexing](style-gallery/README.md)

An original deckbuilding roguelike for the browser. Each hero fights with a **Warband** of allied units:

- **Runeblade**: raises fallen enemies as Thralls
- **Warlock**: summons demons and becomes one
- **Runesmith**: deploys constructs and pilots the Thunderhulk mech
- **Ranger**: tames beasts that stay with her for the whole run

**Status:** first playable Warlock demo. Start with `npm install`, `npm run import:content`, `npm run import:assets`, then `npm run dev` and open http://127.0.0.1:4320. Existing artwork and music are required locally. See [the demo scope, controls, validation, and next work](design/warlock-demo.md).

| Start here | |
|---|---|
| [PLAN.md](PLAN.md) | Build plan: decisions, architecture, card-design method, art and enemy hand-off spec, milestones |
| [design/heroes.md](design/heroes.md) | The four heroes and how their systems work |
| [design/warband-system.md](design/warband-system.md) | The shared allied-unit framework |
| [catalog/](catalog/) | Cards (4 × 70 + neutral), units, potions, runestones, glossary |
| [assets/audio/music/](assets/audio/music/) | Six loopable scores, WAV stems, editable MIDI, and the loop audition player |
| [reference/sts2/](reference/sts2/) | Slay the Spire 2 research used as reference (see its data NOTICE; noncommercial) |
