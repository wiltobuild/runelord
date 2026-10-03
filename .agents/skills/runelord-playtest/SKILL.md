---
name: runelord-playtest
description: "Verify a Runelord playable slice in the browser and engine, including combat presentation, targeting, saves, audio and access. Use for independent QA and repair verification."
---

# Runelord Playtest

Read [the shared production contract](../../../design/production/workflow.md) for scope, evidence, handoffs and resumption. Resolve paths from the assigned repository root, not a hardcoded personal directory. Only load the references needed for this task.

Read the assigned packet and `design/production/acceptance-route.md`. Use the actual current build and preserve the user's save. Record checkout/revision or file hashes, seed, browser URL, viewport and changed capabilities. If delegated as QA, do not repair production files in the same role.

Choose relevant route checks for narrow changes and the full route for substantive integrations. Test through visible controls using available browser tools and their instructions. Add engine fixtures for hard-to-reach edge cases; do not manipulate browser state then claim that the real player path was verified. Check console/network errors, input lock recovery, actual target and HP timing, refresh during presentation and deterministic resume.

Run `npm test`, `npm run sim`, and `npm run build` when the change requires them. Record command exit results and relevant logs. The existing 1000-seed bot validates crash/replay invariants, not difficulty. A screenshot cannot establish smoothness or sound; inspect playback and audition audio when claimed. When unavailable, mark not-run and explain the exact limitation.

Return defects with severity, expected/actual result, precise reproduction, evidence paths, affected content IDs and suggested owner. Report checks as pass/fail/not-run/not-applicable, never infer a pass from absence of a report. Recheck repairs and adjacent behaviors before closing; retain unresolved defects. Complete the packet acceptance evidence only for the tested revision.
