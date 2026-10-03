---
name: runelord-balance-lab
description: "Run reproducible Runelord balance experiments across seeds and strategies, distinguishing game strength from crash/replay checks. Use for encounter or card tuning and balance analysis."
---

# Runelord Balance Lab

Read [the shared production contract](../../../design/production/workflow.md) for scope, evidence, handoffs and resumption. Resolve paths from the assigned repository root, not a hardcoded personal directory. Only load the references needed for this task.

Read the current simulator, engine and relevant design value budgets. Begin with a falsifiable question, such as whether an encounter disproportionately punishes low-summon decks. Name the baseline, candidate, hero, rules/content revision, deck/reward conditions, strategies, seeds and outcome metrics before changing parameters.

The current `tools/sim/warlock.ts` is a fixed-policy crash/replay check. Extend or create a separate runner for the requested experiment; do not present its win rate as general player difficulty. Use matched seeds and identical conditions across variants. Include more than one plausible strategy and verify bots obey legal actions. Record crashes, timeouts and soft locks separately from losses; do not remove them from denominators silently.

Capture per-run JSON: `{seed, strategy, variant, outcome, turns, hpRemaining}` where outcome is win/loss/crash/timeout. Add opportunity-aware card observations if studying cards: offered, chosen, drawn, playable and played. Pick-rate alone is not card strength; uncontrolled win association is not causal win delta.

Run `node tools/production/balance.mjs baseline.json candidate.json` to compare matched runs and per-strategy win intervals. It rejects duplicate/mismatched seed-policy pairs and non-finite data. It summarizes evidence without prescribing nerfs. Report sample sizes, bot limitations, crashes and effect size; small differences need more evidence or human playtests. Change a small number of authorized parameters, then repeat the same experiment plus affected interaction/replay tests. Preserve baseline results and the exact parameter diff.
