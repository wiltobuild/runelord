# Ignivar flying revision

Pending user approval. This replaces the grounded pose language with compact bent-knee flight, following the existing Imp's upstroke/downstroke motion pattern while retaining Ignivar's approved long-limbed identity.

- `animation.json`: frame hashes, state clips, atlas rectangles, source provenance, anchors, flight lane contract.
- `preview.html`: actual PNG playback with state controls, light/dark surfaces and about 96 px visible-height sample.
- `flight-review.gif`: all six states; individual GIFs use the same exported frames and timing. Idle and wounded loop; hit, act, death, spawn are one-shot.
- `source/`: ten original individually generated transparent raster poses. These are real flattened whole-character drawings, not rig layers.
- `frame-00.png` through `frame-10.png`: 1536 square transparent exports. Ten native master-scale poses plus one translated entry frame. Pixel artwork was never upscaled; larger canvas supplies motion padding.
- Each state's `*-atlas.png` stays within 3072 square; registration is integer translation only and preserves generated alpha.

## Integration contract

Facing right, not safely mirrorable because of asymmetric horn fissure. Use fixed root `[850,1400]` in 1536 square coordinates. Keep scale constant; do not tight-fit individual poses. Suggested standing-height-world 0.8 and extra airborne lane height 0.18 follow the existing summon sizing convention and remain integration proposals. Frame 0 reference visible height 1213 px. Remove the airborne lane offset during the first 290 ms of death; frame 9 opaque bottom is ground y 1400. Spawn starts 110 px lower before entering the idle pose. Ordinary act 350 ms, release at 100 ms. Actual firestorm VFX belong in the runtime, not baked into the art.

## Limitations

Three authored idle wing phases and two wounded phases give deliberately limited cel animation; no generated in-between interpolation is claimed. Small contour variations remain at claws/spikes. New frame and preview approvals are pending. The package does not install a new gameplay summon or claim runtime integration.

