# Warlock demo — Cinder & Oath

## Scope and relationship to the campaign

The current roguelike demo is a playable Warlock combat and presentation prototype, maintained separately from Conquer mode. The [campaign direction](campaign-direction.md), adopted 2026-10-03, expands the product into a 6–9 hour campaign with territory and lasting progression. Those systems are **planned**, not delivered by this demo.

The original first-slice notes are [archived](archive/warlock-demo-2026-10-02.md). Their three-fight route, fourteen-card implementation count, older hero renderer, and next-work list are historical and no longer describe the current demo.

## Play and develop

```powershell
npm install
npm run import:content
npm run import:assets
npm run dev
```

Open http://127.0.0.1:4320. Existing local artwork and music are needed for asset imports.

The animated introduction leads to character and pact selection. Warlock is the playable class; the other heroes are previews marked Coming Soon. Master of Demons is the default pact, alongside the fire and blood-pact alternatives. The Runeblade preview now uses its selected HD model and simplified idle frames.

Attack cards select a target; applicable skills cast on selection. Allied units act through the Warband combat system. The interface supports resuming a local save and includes mobile landscape presentation.

## Current prototype foundation

- Vite/React/TypeScript interface and PixiJS combat presentation.
- Seeded card shuffling, randomized rewards with starter-pact affinity weighting, and replay-based local saves.
- Three starter pacts and a fixed nine-encounter route through fire environments, ending in the demon lord.
- Warlock Mana, Cinders, Guard, Corruption, Scorch, summoning, upkeep, and allied-unit actions.
- Implemented card handlers and reward pools defined in [content](../packages/content/index.ts); imported catalog entries are not all automatically playable.
- Gold and item rewards, separate potion/item presentation, and loot explanation after card selection.
- Soulforge shops after combat encounters three and six, following card and item rewards. Each visit independently selects one of three existing backgrounds and shopkeepers from the run seed.
- Shops offer Warlock and neutral cards, five relics, per-copy card upgrades (50 Gold, doubling each level), and removal (10 Gold; minimum ten cards). Buy, upgrade, and removal offers have independent rerolls starting at 10 Gold and doubling. Copy limits are three, or two for rare cards.
- Upgrades scale applicable numerical effects by roughly 20% per level, with integer rounding and periodic mana reductions. Shop stock, spending and card levels persist through save/replay. New runs enable shops; older saves retain their original route rules.
- Animated hero/enemies/summons, spell and summon effects, sound effects, and music.

The actual available content and rules live in [packages/content/index.ts](../packages/content/index.ts) and [packages/engine/index.ts](../packages/engine/index.ts). This summary is not a claim that the full catalogs or all four heroes are implemented.

## Not yet implemented as campaign systems

The current fixed route must evolve into branching choices toward the first Sovereign. The demo does not yet provide the new campaign's spell combination, unit fusion, slotted equipment progression, stronghold construction, autonomous invasion chain, open-world conquest, or neutral reputation and quests.

Existing demo loot does not establish the complete campaign gear/relic rules. The demon lord finale does not currently imply territory ownership or a functioning stronghold. See [the build roadmap](../PLAN.md) for the planned sequence.

## Validation and assets

```powershell
npm test
npm run sim
npm run build
```

These check the current implementation; they do not certify the future campaign. Use the rules tests and simulator for supported combat/reward/replay behaviors and the browser for presentation checks.

Keep original production art and provenance. Follow [the art workflow](art-approval-workflow.md), exact gallery decisions, and the latest user-selected animation method. Technical readiness, gallery approval, and user authorization to integrate are separate.
