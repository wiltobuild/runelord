# Summoned warband cinematic

User authorized removal of the right-hand demon, a rightward move of title/UI, three imps around Abyssal Seraph and higher-quality familiar summons. Seraph remains the selected r2 character. All earlier movies preserved.

New assets generated with built-in image_gen, using the corresponding existing Warlock summon base PNG as identity reference: imp base/r1, hellhound base/r1, pit-brute base/r2. Prompt direction: refine the recognizable full-body summon with crisp angular serious cel shading, rich crimson/obsidian/ember palette, clean silhouette and transparent alpha; no scene, lettering or baked floor circles. Flying imp: spread bat wings and suspended feet. Ground imp: crouched stance. Hellhound: four-legged stance, barbed tail and ember mouth. Pit Brute: massive fists and jagged black armor. Sources saved alongside this file; gallery submissions remain pending review.

Rendering uses `npx tsx tools/cinematic/render-oath-intro-r3.mjs`, then `node tools/cinematic/mux-oath-intro-r3.mjs`. These use the existing work/cinematic-tools canvas and work/promo-tools FFmpeg dependencies. The combat `drawSummon` function is imported directly from apps/web/src/summonEffect.ts for floor circles. Ground positions remain fixed with slight breathing; flying imps and Seraph gently bob. Original24-second score retained.

Runtime movie: apps/web/public/opening-assets/oath-intro-r3.mp4. UI remains real accessible HTML over video. No gameplay actor assets have been replaced.
