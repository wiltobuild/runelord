# Oath Intro r2 independent QA

Reviewer opening_qa,2026-10-03. Read-only production review; owned only this report. Revision reviewed: user-selected concept2 Abyssal Seraph, layered still cinematic.

## Passes
- Render source uses p=2*pi*t/24 and hover=12*sin(p*4): exact6-second period, +/-12px vertical motion, no lateral hero translation. Hero height920px remains fixed.
- Hero aura opacity varies .195–.285; shadow blur9–15px. This is restrained numeric modulation rather than abrupt flashes. Right adversary alpha varies .72–.84 continuously, never disappears.
- All modeled motion is cyclic across24s: camera, hover, aura, fog and particles. Rotating seal ends after half-turn, visually equivalent because16 evenly distributed spokes and circular rings are symmetric. This is mathematical/source continuity, not an auditioned perceptual seam.
- Sample still0.jpg visually inspected: selected winged hero is legible at left, wings/body fit, right adversary remains visible, title region stays open. Static inspection does not prove full playback quality.
- IntroCinematic references oath-intro-r2.mp4 and r2-poster paths; both exist. Muted autoplay, explicit sound gesture, pause/reduced-motion and Start-only menu transition are retained. Muting sound now sets shared volume0, preserving mute into menu.
- Original runtime oath-intro.mp4 is unchanged from previous QA: SHA2564053D9C5021FBFE2FE82286F2ED6FFEEE3FA6B1C0B6558EA5439E65B7BFDDC14. r2 renderer writes separate r2 source/runtime paths.
- Silent render and final runtime MP4 both fully decoded using existing ffmpeg-static executable, exit0 with576 frames and no decode errors.
- Final runtime stream metadata:24.00 seconds,1920x1080 H.264 High/yuv420p at24fps; AAC-LC48000Hz stereo196kb/s.

## Reproduction command
work/promo-tools/node_modules/ffmpeg-static/ffmpeg.exe -hide_banner -i apps/web/public/opening-assets/oath-intro-r2.mp4 -f null -

## SHA256
- tools/cinematic/render-oath-intro-r2.mjs:5EBB0048B1AC1C8FA7B3A36CF0B8457F7473D86D343D0F5DC5ECEAB80E7A6AD2
- apps/web/src/IntroCinematic.tsx:4305A80AACBF3EC30F83A3EAD7EA0570925F177B14FBCA4899E7F1242E1900AE
- assets/cinematics/oath-intro/r2/demon-warlock.png:49231CCF61F410D3FD5CE7B3DD416BDEFEFCDA090BB59ECE69586EC17DE51B24
- apps/web/public/opening-assets/oath-intro-r2.mp4:72C02022608029C17835000945CF0E6A8895609076BAB0DCB3D5F818045E883C

## Limits and result
No new browser verification or audio audition in this bounded review. No claim that a sampled still establishes smoothness, audiovisual sync perception, full-frame art approval or responsive UI fit. This is layered still animation, not generated full-motion footage. No blocking defects found in source, sampled still or decode validation.
