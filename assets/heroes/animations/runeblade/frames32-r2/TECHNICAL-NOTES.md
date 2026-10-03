# Runeblade — 32-frame hero package

Approved identity: `source/master.png`, SHA-256 `9a4a666b1ed74621fab2b9117805af763c2100ecf228cbadc8f2e44c9be5aef1`. The user explicitly selected this image and authorized its 32-frame animation and character-selection replacement. Animation design review is separate from technical validation.

Method: eight reference-conditioned 2×2 authored whole-character sheets. No flat-puppet approximation, per-frame stretching, pixel painting, or procedural anatomy. Source sheets are retained. Packing detects transparent gutters rather than assuming generated sheets divide exactly at their midpoint. Every crop rectangle and source hash is in manifest.json.

Canvas: 1024×896 transparent RGBA, common boot/body root (448,816), pixels measured from upper left. Each source sheet has one uniform scale; per-frame translations register feet and body. Wide sword bounds never define the body root. Death preserves deliberate collapse rather than forcing each fallen pose to full standing height.

States: idle4, hit4, attack8, cast8, wounded_idle4, die4. Idle/wounded loop. Attack/hit/cast return to idle in the preview; death holds terminal frame. The cast release marker is exported in manifest.json, measured on the extended hand at frame3. Generated keyframes can have stepped transitions; this package makes no claim of continuously interpolated anatomy. Cyan magical accent pixels are part of the authored artwork.

Selection export: `apps/web/public/opening-assets/hero-runeblade-hd-idle.webp`, 1280×320, four 320px cells, 350ms each. A single shared scale and translation centers the union of all four idle silhouettes and fits at most280px tall /300px wide, retaining full sword margins. Character-selection CSS owns additional panel sizing; no gameplay character availability changes are made by this package.

Rebuild: `node tools/animation/pack-runeblade-r2.mjs --video`. Produces PNG frames/state atlases, manifest.json, flat animation.json adapter, light/dark large and96px evidence, motion-proof.mp4, and standalone `runeblade-hero-preview/index.html`. The MP4 contains actual playback of all six states on dark and light backgrounds.

Final per-frame technical QA and source edge findings must be read from the matching manifest and independent review report, not inferred from this description.
