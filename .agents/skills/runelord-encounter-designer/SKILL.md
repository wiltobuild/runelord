---
name: runelord-encounter-designer
description: "Design Runelord enemy moves, AI patterns, encounters, corpse and tame profiles from existing creatures. Use for playable bestiary design, not creature illustration."
---

# Runelord Encounter Designer

Read [the shared production contract](../../../design/production/workflow.md) for scope, evidence, handoffs and resumption. Resolve paths from the assigned repository root, not a hardcoded personal directory. Only load the references needed for this task.

Read `design/warband-system.md` section 7, relevant hero rules, unit catalog, current encounters and available character art. Use original Runelord names and kits; archived reference bestiary is not production content.

For each enemy record ID, tier, biome/act role, base and ascension stats, telegraphed moves, AI selection constraints, innate statuses, corpse profile, tame profile and animation mapping. Every attack declares one of hero/front/random_ally/sweep/weakest/ignore_defender. Specify status-only moves explicitly rather than assigning invented damage. Boss kits include a meaningful sweep; normal beasts can support Ranger taming, while bosses and constructs must not become tameable by default.

Use complementary encounter roles (pressure, protector, setup, support), with visible counterplay and a recoverable early teaching encounter. Check no-Warband and full-Warband behavior, Defender, Elusive, fragile allies, dead targets, and death mid-sequence. Taming the last enemy must end combat and grant the expected reward exactly once. Corpse-derived units must identify the copied move and intended scaling.

Draft the small tool schema described by `node tools/production/cli.mjs help`; validate with `encounter <file>`. It checks structural invariants, not fun, difficulty or engine compatibility. Map validated proposals into the actual runtime schema explicitly. Test encounter scripts with seeded runs and at least two appropriate strategies; use balance-lab for comparisons. Deliver the kit, counterplay rationale, art/state dependencies, validations and measured limitations.
