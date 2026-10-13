# Pit Brute · Cinematic 32

New versioned whole-character animation package. Master: `assets/cinematics/oath-intro/r3/pit-brute.png`, SHA256 `0f8dc36570fd588701342dd9a89359bf1af59bf139fb2441ddf14f960b5a50b9`. Current user explicitly authorized reusing this three-quarter right-facing battle master. The r6 front-facing cinematic variant was excluded. Original and new gallery status are not promoted to Approved.

32 unique transparent authored poses: idle4, attack8, hit4, wounded_idle4, spawn4, die8. Built-in imagegen created real poses; no static-body warping, synthetic tween frames or runtime artwork changes. Sources are1254×1254 PNGs (nominal627px cells), not the requested2048; actual dimensions are recorded. Export canvases1024×768 add transparent space without upscaling. Transparent source corridors were measured before crop; translation places ground at680. See manifest for exact crops/roots/hashes and edge findings.

Preview: open `preview.html`; game-speed and slow review, state controls, pause and step. `animation-review.mp4` and `.gif` show all states on light/dark backgrounds plus about96px standing height. PNG atlas4096×6144 and all individual frames retain true alpha. Contact sheets under `review/` cover all32.

Timings: idle1400ms loop, attack500ms (impact190ms; deliberately heavier than ordinary350ms Muster target), hit340ms, wounded1600ms loop, spawn720ms (arrival540ms), death1510ms one-shot with terminal hold. Nonlooping live actions return to idle or game-selected wounded state. `attack` also supplies the demon `act` semantic when integrating. Cast/guard/victory were outside this user-selected32-frame state split; no separate casting ability is claimed.

Technical checks:32 unique hashes, all match current bytes, all source alpha extrema0–255, no cropped source-cell edge pixels after corridor selection. Packing does not edit character pixels. Initial proof and registration-border attack were rejected for crop/blue contamination, retained only as history; final manifest excludes them. Spawn-r2 replaces earlier poses that drifted toward frontal facing.

Independent parent browser playback checked all attack/hit recovery frames, wounded loops, spawn facing/transition, terminal death and light/dark/96px rendering; browser errors empty. Parent evidence: `work/production/cinematic-summons32-parent/pit-*.png`. Separate all-frame static QA report is recorded when returned. This package is not runtime-integrated, not deployed, and not visually approved by the user yet. Existing assets preserved.

Reproduce: from project root run `node assets/characters/warlock-pit-brute/animations/frames32-cinematic-r1/pack.mjs`, then `export-video.mjs`. Scripts use installed sharp, project-local canvas and ffmpeg helper dependencies; source raster generation uses built-in imagegen and saved prompts, not these technical scripts.


Final independent static QA: PASS, all32 frames reviewed individually at original size and approximately96px on light/dark backgrounds. Report: design/production/evidence/cinematic-summons32/final-review.json. Parent playback passed separately. Gallery status remains pending user review.
