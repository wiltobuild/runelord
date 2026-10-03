---
name: runelord-production-status
description: "Reconcile Runelord catalogs, recorded evidence, runtime provenance and approvals into scoped production status and resumable next actions. Use for inventory, remaining work and handoffs."
---

# Runelord Production Status

Read [the shared production contract](../../../design/production/workflow.md) for scope, evidence, handoffs and resumption. Resolve paths from the assigned repository root, not a hardcoded personal directory. Only load the references needed for this task.

Run `node tools/production/cli.mjs status --repo .` first. Add `--out work/production/status.json` only when a saved report is useful. The scanner reads catalog tables and known runtime mappings; it does not enumerate all generated frames. Its coverage block and errors are part of the answer.

Inspect conflicts and map missing domains using explicit content records rather than assuming unmapped means absent. A qualified catalog key identifies a source row, not a fabricated engine ID. Distinguish placeholders, derived templates and fully specified content by reading the row before production. Registry membership is implementation evidence, not a handler/test audit.

Keep `design`, `art`, `approval`, `animation`, `gameplay`, `integration` and `qa` separate in `design/production/records/`. Use the template and `node tools/production/cli.mjs record <file>`. Record inputs and evidence as paths plus hashes. Approval is always derived from exact asset bytes and current user decisions; never copy a generic approved label onto changed files. Unknown, stale and blocked are useful outcomes.

For remaining work, prioritize the requested scope and dependencies: explicit repairs, a playable integration gap, then missing generation. Do not open new tasks, regenerate art, or implement content merely because inventory exposed a gap. Producer may propose a packet; execute only authorized scope. Report counts with their denominator, source time, known adapter limits and exact next actions. On resumption compare hashes and current decisions before skipping work.
