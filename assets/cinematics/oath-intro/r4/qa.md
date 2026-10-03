# Oath Intro r4 independent QA

Reviewer opening_qa, 2026-10-03. Only this report written. Reviewed renderer, intro CSS/runtime source, requested six stills and final encoded movie.

## Results
- PASS: Seraph restored center350,height920. Single front-facing airborne Imp atx680, height220, beside wing. Requested stills0,36,72,120,168,288 visually inspected; no wing collision; faces clear; right-side title area remains quiet.
- PASS: eight-second ground summon cycles stagger0,2.65,5.3s. Portal reveals upward by clipping at floor rather than fading an entire hovering sprite. Combat drawSummon provides floor and foreground effects.
- PASS: forward advance scales1–1.8, increases bottom position until actor is fully below frame before age7 cutoff. Top approaches1170px by cutoff, greater than1080 even allowing small rotation; next spawn waits until age8 reset. No reset of a still-visible actor implied by source math.
- PASS:24 seconds contains exactly three8-second cycles and four6-second hover cycles. Other scene motion/particles are periodic. Age-dependent stride discontinuity is hidden while actors are offscreen. This establishes mathematical continuity, not an auditioned audiovisual seam.
- PASS: sampled stills show rise, forward approach and cropped offscreen exit phases as intended. Body movement is translated/scaled still art with bob/tilt, not articulated leg walking or new frame animation.
- PASS(source): desktop title positionedleft65%/right4%, current heading clamp40px,4.5vw,92px. Responsive overrides remain. Browser fit not independently retested.
- REPAIRED: original timeline.sourceArt incorrectly pointed ground creatures at r4. Source and written final timeline now correctly use r4 only for flyingImp and r3 for groundImp/Hellhound/PitBrute; runtime final hash matches file.
- PASS: final MP4 fully decoded, exit0,576 frames, no decode errors.24.00s,1920x1080 H.264 High/yuv420p at24fps, AAC-LC48000Hz stereo196kb/s.

## Decode command
work/promo-tools/node_modules/ffmpeg-static/ffmpeg.exe -hide_banner -i apps/web/public/opening-assets/oath-intro-r4.mp4 -f null -

## SHA256
- render-oath-intro-r4.mjs:C9699FAB6362806546D82665CA625C6C5F88BD580165EA76C8515D81373490E1
- intro.css:D3D73274E8CA2CB613309A6B31E9ADE11C0CC17E4E137F8BF18CBC8440068C43
- IntroCinematic.tsx:D765FAA920F3601FCFC4801A76F4B5D47239BE9CFF3A05EB6CB72A727AD5B59C
- oath-intro-r4.mp4:5C79E32DAE4C744AF8DB0F1DC6F5A23EB2AC14C14238E5831D296E869192BF9A

No blocking defects remain in source, sampled layout or decode scope. Full browser flow, all-frame perceptual playback, audio audition and subjective loop seam not independently performed. Save untouched; no production edits.
