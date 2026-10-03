---
name: runelord-asset-integration
description: "Package existing Runelord artwork and animation for the game, preserving anchors, events, alpha, approvals and provenance. Use for runtime handoff, not new art generation."
---

# Runelord Asset Integration

Read [the shared production contract](../../../design/production/workflow.md) for scope, evidence, handoffs and resumption. Resolve paths from the assigned repository root, not a hardcoded personal directory. Only load the references needed for this task.

Read `design/art-approval-workflow.md`, `tools/import/assets.mjs`, `packages/assets/manifest.json` and the consuming renderer. Resolve the actual source revision from its manifest and ledger rather than choosing the lexically newest directory. Verify current file hashes and authorization for pending integration; never relabel pending art approved.

## Export and integrate

- Preserve masters. Write versioned runtime derivatives with source/output hashes and transform settings. Existing import caching based on mtime is not proof of content equality; changed bytes or settings require regeneration and verification.
- Normalize state names, duration units, frame index bases, loop flags, ground anchors and impact markers explicitly. Preserve the source-to-runtime mapping. Run `node tools/production/cli.mjs animation <manifest>` for supported frame manifests; unsupported formats need an adapter, not a guessed pass.
- Pack atlases with documented trim offsets, padding/extrusion and maximum texture dimensions supported by the target renderer. Measure actual encoded bytes and decoded texture memory. Do not resize each frame independently and introduce scale/foot jitter.
- Keep impact timing and targets from engine events. Handle attack recovery, wounded idle, single-play terminal death and interruption. Save/replay restores authoritative state without replaying damage just because a visual restarts.
- Inspect playback full size and at 96px, light/dark backgrounds and current arenas. Check missing-file fallback, alpha halos, clipping, attachment drift and loading failures. Use `node tools/production/art.mjs approval <file>` for current hash decisions.

Art repair uses the existing image-generation workflow; frame packing and resizing use technical tools. A preview or sheet alone is not a completed runtime handoff. Deliver provenance, actual runtime files, all required state mappings, an in-game proof and unresolved limits. Route UI/audio through their respective skills only if involved.
