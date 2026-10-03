# Oath Intro r3 independent QA

Reviewer opening_qa, 2026-10-03. Read-only production review; only this report written. Scope render-oath-intro-r3.mjs, intro.css, runtime binding, sampled still, final MP4 decode.

## Results
- PASS: old right-side demon source/draw removed. Seraph center430,height790 remains on left with +/-12px six-second hover. Three Imps are present: two airborne atx22/x1650 and one grounded. Hellhound and PitBrute complete the five-summon composition.
- PASS: grounded summons use the exact combat drawSummon import, ground=true. Synthetic time2000+p/.00018 produces one full2pi seal rotation over24s and stays inside60000ms effect duration with steady fade1. It does not cycle an emergence or disappearing seal.
- PASS: camera, six-second hover/breath, aura, fog, six-second flares and particle positions are mathematically periodic over24s. Flying Imp bob is+/-7px. Ground breathing is only+/-0.3% anchored at feet. No statement of perceptual seam audition is implied.
- PASS: final still0.jpg inspected after ring-height repair. All five summons visible; hero and summon faces readable; flying wings fit frame. Foreground monsters intentionally overlap bodies but keep faces clear. Right area is quiet for title. Right-side adversary absent.
- REPAIRED: initial ground Imp/Hellhound rings clipped at bottom letterbox. Parent lifted ring centers to964/960 and creature bottoms959/955. Updated sampled still shows ring outlines fitting above bottom bar.
- PASS(source): desktop title moved toleft59%/right4%; tablet/mobile media rules retain adapted centered placement. Actual responsive UI fit not independently browser-tested in this bounded review.
- PASS: runtime points at r3 media, while r1 andr2 MP4 hashes remain identical to earlier QA.
- PASS: final MP4 decoded completely with ffmpeg exit0,576frames, no decode errors. Streams:24.00s,1920x1080 H.264 High yuv420p24fps; AAC-LC48000Hz stereo196kb/s.

## Decode command
work/promo-tools/node_modules/ffmpeg-static/ffmpeg.exe -hide_banner -i apps/web/public/opening-assets/oath-intro-r3.mp4 -f null -

## SHA256
- tools/cinematic/render-oath-intro-r3.mjs:603CB763DC2B13506D93FBBB8F6219A94DEACB3813394B8964EFEF09EF32A91B
- apps/web/src/intro.css:D0F4BF09DE08D3173AF72DD39992FAC271F711A92459CB92957247C43EF465D8
- apps/web/src/IntroCinematic.tsx:0BD4DA204C272F6B2F8ED723D1FCA1B8787CE2C454A16D692DE2F264B062D58C
- final oath-intro-r3.mp4:43C75E5980C13718A445AC0628BEC59DA3DF8F1E5DAAEC5CA5B3C274F42B145D
- preserved oath-intro-r2.mp4:72C02022608029C17835000945CF0E6A8895609076BAB0DCB3D5F818045E883C
- preserved oath-intro.mp4:4053D9C5021FBFE2FE82286F2ED6FFEEE3FA6B1C0B6558EA5439E65B7BFDDC14

## Limits
This is layered still animation, not full-motion generated character footage. One final still was visually inspected; full-frame identity approval, full playback audition, subjective audio sync/seam and browser flow were not independently repeated. Existing save untouched. No blocking defects remain in reviewed source, sampled layout and decode scope.
