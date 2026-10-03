# Oath Intro independent source QA

Reviewer opening_qa,2026-10-03. Scope: IntroCinematic.tsx, intro.css and main.tsx integration. Production files and browser saves untouched.

## Source checks
- PASS: muted initial video autoplay, loop and playsInline. Sound requires explicit control gesture; unmutes the same element so visual/audio clocks remain shared once final soundtrack is muxed.
- PASS: volume updates media element; enabling sound at zero restores0.35. Pause calls video.pause(), pausing video and any muxed audio together. Playback rejection switches paused state so player can retry.
- PASS: reduced-motion preference defaults paused and listens for changes. CSS suppresses reveal/pulse transitions under reduced motion. User can explicitly play.
- PASS: Press Start click or body-level Enter/Space sets leaving state, waits450ms then invokes onStart. Keyboard events on focused controls are not hijacked. Start disabled during leaving prevents duplicate click activation.
- PASS: main onStart only sets introStarted and starts menu music; it does not call start(), dispatch(), or write a save. The existing character/pact selection follows; no automatic combat entry.
- PASS: stateful controls and event listeners clean up; fallback status plus Start remain present if media errors.
- PASS (source only): portrait and short-landscape media rules preserve centered title/control layouts. Visual fit needs runtime evidence.

## Defect and repair
Identified animation fill-mode both retaining opacity1 and overriding leaving opacity0 after reveal. Parent changed reveal fill mode to backwards; normal exit is fixed by source inspection. Minor remaining early-exit edge: clicking Start within the initial1.5s reveal can still be governed by reveal animation opacity during450ms exit. Suggested .intro-leaving{animation:none} to fully clear the conflict. This does not prevent transition into menu.

## Limitations
Worker CUA inventory is empty (no browsers/apps); independent browser runtime verification, screenshots, audio audition, actual playback pause/loop, Enter/Space and post-intro menu interactions NOT RUN. Parent handles runtime verification. Final video was still awaiting audio mux when review started; no claim of final soundtrack/sync validation. Build result is parent-owned, not independently rerun. Prior opening reports do not establish runtime acceptance of this new intro.

## SHA256 reviewed
- IntroCinematic.tsx:242A56BE4A4A698412144734EABFA8215C857A8E5E6CBEF66A4A9B8D2DC7A0F6
- intro.css:AF389ABFCA2E72EDA65A2A1A7FF8749996237E6CB10812A01E9901598547DB80
- main.tsx:7C6B18BB603C31731B6B2E5CE651FC13E32552580ABA630CF2B85B22B76B36EA

No blocking functional source defects found. Early-exit animation edge is now resolved by final repair below. No final audiovisual acceptance claimed.


## Final repair and mux verification
- PASS: final .intro-leaving explicitly sets animation:none, resolving the early-exit opacity conflict above. Both reported reveal/fade source defects are closed.
- PASS: independently decoded the complete final MP4 with work/promo-tools/node_modules/ffmpeg-static/ffmpeg.exe -hide_banner -i apps/web/public/opening-assets/oath-intro.mp4 -f null -. Exit0,576 decoded frames, no decode errors.
- Verified container duration24.00s, video H.264 High/yuv420p1920x1080 at24fps, audio AAC-LC48000Hz stereo196kb/s. This proves final audio stream presence and successful decode, not subjective sound quality or perceptual loop seam.
- Final MP4 SHA256:4053D9C5021FBFE2FE82286F2ED6FFEEE3FA6B1C0B6558EA5439E65B7BFDDC14.
- Parent reports browser readyState4,duration24,1920x1080, unmuted playback and pause, and844x390 Start fitting. These are parent-owned observations, not independent worker browser checks.

Final source result: no unresolved blocking defects. Browser/media-perception limitations above remain explicit.
