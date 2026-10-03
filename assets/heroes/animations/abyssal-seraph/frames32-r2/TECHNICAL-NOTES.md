# Abyssal Seraph hero frame package

Whole-character frame animation facing screen right. Standalone asset study: existing playable Warlock is unchanged. Art approval and independent QA are separate from builder checks.

Rebuild with `node tools/animation/pack-seraph.mjs --video`. Eight 2-by-2 source sheets produce exactly 32 numbered transparent PNGs and six state atlases. `manifest.json` records exact source/output hashes, rectangles, alpha bounds, translations, uniform scales, and memory sizes. `animation.json` adapts the same files to the production animation validator's flat frame/index schema.

States: idle 4; hit 4; attack 8; wounded idle 4; cast 8; death 4. Shared canvas: 768 by 896, root (384,816). Standing figure height is approximately 640px. Each sheet has one uniform scale, never separate per-frame scaling: idle 1; hit 1.04; cast 1.06; death 1; attack-a/b 0.98; cast-recovery 1.02; wounded 0.94. Native source resolution is about 512 by 768 per pose. Boot/body root alignment is independent of wing silhouette and preserves authored pose changes.

Repaired source sheets replace the first attempt; originals remain in source/first-pass. Attack-a lower-row extraction divider is x522 instead of x512. Attack-b upper-row divider is x542. Both lie in transparent gaps and preserve extended fingertips. Right-cell root coordinates compensate for these offsets. No artwork was painted over, reconstructed, or removed. Every final cell has zero alpha>32 pixels in its outer 2px; manifest.issues is empty. Raw transparent-image viewers can expose red RGB beneath alpha; actual light/dark compositing confirms clean edges.

Atlases use four fixed canvas cells per row, up to two rows. Consumers must use integer rectangles and clamp sampling. Do not trim and recenter frames on wing or alpha bounds.

Preview /seraph-hero-preview/ autoplays idle with selectable states, pause, and all-state mode. Dark/light and approximately 96px-character-height views share a clock. Idle and wounded loop; actions return to idle except death, which holds its final pose. All-state inspection advances after showing death hold. Optional root and palm markers assist integration.

Cast release: zero-based frame 3 at 450ms; palm attachment (471,333) output pixels. Attack impact: frame 3 at 435ms. These presentation events do not independently apply gameplay damage. All durations use milliseconds.

motion-proof.mp4 sequences all states on light/dark backgrounds with a 96px inset. contact-sheet.png shows all32 poses. These are builder inspection artifacts, not independent approval. Validate with `node tools/production/cli.mjs animation assets/heroes/animations/abyssal-seraph/frames32-r2/animation.json`. Final art/playback acceptance belongs to independent QA and the user.
