---
name: runelord-content-to-game
description: "Implement Runelord catalog cards, units, potions and runestones as deterministic gameplay with upgrades and interaction tests. Use for content implementation, not card illustration."
---

# Runelord Content to Game

Read [the shared production contract](../../../design/production/workflow.md) for scope, evidence, handoffs and resumption. Resolve paths from the assigned repository root, not a hardcoded personal directory. Only load the references needed for this task.

Read the relevant catalog rows, glossary, hero rules, Warband rules and current engine/content code. The source of design is catalog Markdown; PLAN counts and examples can be stale. Preserve stable shipped IDs; new qualified inventory keys are not engine IDs. Keep Echoes and Restyles design-only.

## Implement a bounded slice

1. Identify existing import records, implementation registry, handlers, reward eligibility, text and asset mappings. The current Warlock importer validates 70 IDs and rarity counts but does not implement effects. Do not use parseInt for X or compound resource costs when extending the parser.
2. Translate exact base and upgrade effects into existing primitives/handlers. Define target legality, payment atomicity, timing, death cleanup and hooks. Reuse the authoritative engine; no UI-only damage or independent RNG. Expand architecture only when the slice requires it.
3. Add tests grounded in catalog outcomes, including invalid actions spending nothing, resource boundaries, relevant unit/status interactions and replay. Cover upgrades independently. For ambiguous catalog behavior record the narrow question and continue unrelated specified work; do not invent a balance decision.
4. Expose only implemented and tested content in starter/reward/shop pools. Preserve authored text and map runtime illustrations by actual content ID. Coordinate missing presentation with the Technical Artist.
5. Run relevant tests, replay simulation and build. Use the browser acceptance route for the integrated slice; a build alone is insufficient.

Useful entry points: `tools/import/catalog.mjs`, `packages/content/index.ts`, `packages/engine/index.ts`, `packages/engine/warlock.test.ts`. Recheck these paths before using them. Run `node tools/production/cli.mjs status --repo .` to distinguish catalog coverage from implementation-registry evidence. Deliver changed IDs, tested effects, eligibility changes, unresolved mechanics and a resumable packet.
