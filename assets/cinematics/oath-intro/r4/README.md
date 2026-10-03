# Endless summoned advance

Latest user request: remove left flying imp, restore Seraph position, regenerate remaining flying imp front-facing beside right wing without overlap; ground creatures emerge from summoning circles, advance fully offscreen and replace on a loop; condense title to fit.

Front-facing imp created with built-in image_gen using r3 imp-flight.png as identity reference. Prompt: exact same red imp, perfectly frontal face and torso, symmetrical spread bat wings, equal visible horns/amber eyes, lowered clawed hands and suspended feet, full transparent silhouette, angular cel shading, no scene or labels. Saved as imp-flight.png and submitted to gallery as intro-imp-flight/r2 pending review. Existing Seraph and ground artwork retained.

Seraph restored to center350,height920,y65. Single flying imp starts x680 with220px height, outside the Seraph bounding box. Title left65%,right4%,top48%, reduced typography.

Ground actors use staggered8-second cycles:0–.25s portal preparation, .25–1.6s upward clipped emergence,1.9–7s perspective advance with stride bob/tilt,7–8s offscreen interval. Replacement begins only after full exit. Three cycles fit the24-second movie. These are animated stills, not articulated walk-cycle frames. Exact combat drawSummon is reused for floor seals and emergence particles.

Commands: npx tsx tools/cinematic/render-oath-intro-r4.mjs; node tools/cinematic/mux-oath-intro-r4.mjs. Original score and older movies preserved.

Validation: npm run build passed with existing bundle-size advisory. Independent review in qa.md checked six time samples, cycle/exit math and final full decode. Browser currentSrc confirmed r4,readyState4,duration24,pausedfalse and active playback. Screenshot title-screen.png shows the final composition. This local revision is not committed or deployed.
