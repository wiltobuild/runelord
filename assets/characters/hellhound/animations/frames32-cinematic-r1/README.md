# Hellhound Cinematic 32

32 authored, transparent whole-character poses based on the user's selected right-facing cinematic Hellhound. Current export revision: **repair-r2**. This is a standalone animation package; no live-game asset or runtime file was changed.

Open `preview.html` for individual state playback, pause and frame stepping. `motion-proof.mp4` and `motion-proof.gif` show the complete sequence on light/dark backgrounds with a small-scale inset. The comparison GIF repeats its entire reel; the actual death state plays once and holds its final frame.

| State | Poses | Duration | Behavior |
|---|---:|---:|---|
| idle | 4 | 1,400 ms | Loop |
| attack | 8 | 920 ms | Impact at 240 ms; recover to idle |
| hit | 4 | 550 ms | Recover to idle |
| wounded_idle | 4 | 1,600 ms | Loop |
| spawn | 4 | 840 ms | Arrival at 360 ms; recover to idle |
| die | 8 | 1,800 ms | Terminal frame holds |

`act` may alias attack when integrated because this is a melee attacker. Separate cast, guard and victory poses are not required by the current summon renderer. Guard remains an independent presentation effect.

All 32 PNG frames use a 768×640 canvas and registered root `(170, 560)`. Six atlases use four columns and exact 768×640 cells. Source sheets are native 1254×1254, nominally about 627 pixels per cell; requests for 2048-pixel sheets were not honored by the image tool, so this package does not claim 1024-pixel native poses. Exact extraction rectangles, source hashes, translations and uniform sheet scales are in `manifest.json`. No frame was individually rescaled, and no masks or pixel repainting replaced generated anatomy.

Identity master: `assets/cinematics/oath-intro/r3/hellhound.png`, SHA-256 `f42e103c244b550e770f3a2d5bff02cc12d10f9532d545fe13ac5ea287c572f4`. Current user authorization permitted this exact design; its gallery status was Unreviewed and was never relabeled Approved. Front-facing r6 artwork and the excluded legacy Warlock master were not used.

Built-in image generation created all poses and source repairs. `source/generation-provenance.json` and `source/prompts-final.json` retain prompts and reference roles. Rejected/superseded sheets remain in `source/`. Initial idle clipping and gray registration fragments at several recovery/wounded paws were repaired through image generation, then re-extracted. Tiny red edge fringe remains visible at native size; no gray frame fragments remain in the reviewed repair.

`technical-check.json` records 32 distinct hashes, true alpha in every frame, zero opaque pixels touching export boundaries, and measured payload. PNG frames total 7,136,895 bytes; atlases total 7,131,996 bytes. Decoding all frames simultaneously requires 62,914,560 bytes (60 MiB), before renderer overhead. Choose either frames or atlases for integration rather than loading both.

`animation.json` passes `node tools/production/cli.mjs animation <path>`. This validates file references and timing, not appearance. Independent frame review and parent live-browser playback evidence are recorded separately in `handoff.json`. User design review remains pending.

Gallery: search **Hellhound Cinematic 32** at `http://localhost:4317`. Current revision is **repair-r2**; older r1 and initial16 proof are retained as history.

- MP4: `http://localhost:4317/asset/e2c977e52a4e52d09469920b`
- GIF: `http://localhost:4317/asset/a44faa25372e2dcfa87cdce5`
- All-pose sheet: `http://localhost:4317/asset/ecac12fb2d9a51ddca2b3be7`

Reproduction: run `pack.mjs` from the repository root, generate the GIF with the documented ffmpeg filter in the handoff, then run `finalize.mjs`. Packing uses existing `sharp`, `work/cinematic-tools/node_modules/@napi-rs/canvas`, and `work/promo-tools/node_modules/ffmpeg-static/ffmpeg.exe`; generation requires the built-in image tool and supplied prompts.
