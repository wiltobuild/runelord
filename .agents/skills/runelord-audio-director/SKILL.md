---
name: runelord-audio-director
description: "Integrate Runelord music, stems and combat audio with loop metadata, transitions and event timing. Use for game sound behavior, not automatic new soundtrack generation."
---

# Runelord Audio Director

Read [the shared production contract](../../../design/production/workflow.md) for scope, evidence, handoffs and resumption. Resolve paths from the assigned repository root, not a hardcoded personal directory. Only load the references needed for this task.

Read `assets/audio/music/README.md`, both loop manifests, runtime provenance and `apps/web/src/music.ts`. Existing cues/stems are the first resource; do not promise new audio generation tools. Inspect source licenses and preserve delivered masters, MIDI and composition sources.

Run `node tools/production/cli.mjs audio <loop_manifest.json>` to check metadata ranges and sample/duration agreement. This does not decode audio or prove an inaudible seam. Resolve actual files and verify duration/channel/sample-rate alignment before stem integration. Manifest loop ends are exclusive; WAV smpl ends can be inclusive. Use full mix OR aligned stems, not both at unity gain.

Map exploration/battle/boss/biome states explicitly. Start stems on one AudioContext clock and implement transitions without unintentional overlap, volume spikes or stale asynchronous loads winning a race. Tie combat sound to release/impact/death events rather than arbitrary timeouts; avoid repeated audio during save replay. Start/resume after a user gesture, preserve mute/volume across scene changes, and handle loading failure without blocking combat.

Audition loop seams, transitions, rapid navigation, background/resume, mute during load and several simultaneous impacts. Measure peak/clip behavior if changing mixes; keep accessibility controls independent of decorative visual motion. Deliver mapping, timing/loop metadata, provenance, browser observations and untested listening conditions. Technical metadata checks do not substitute for listening.
