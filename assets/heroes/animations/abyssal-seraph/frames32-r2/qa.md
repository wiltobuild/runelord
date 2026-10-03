# Independent Seraph hero frame QA

Reviewed 2026-10-03 by opening_qa, separate from the artwork author and package builder. Source HEAD: 5be0f6cf53a1f173844f954588a5803a51ed85fc (working tree candidate). Scope: assets/heroes/animations/abyssal-seraph/frames32-r2 and standalone preview source. No production files, playable hero selection, or saves changed by this reviewer.

## Result

PASS for the independently checked frame/package requirements, with a motion continuity caveat below. This is technical review, not user art approval or a claim of game integration. Each of the 32 frames was visually inspected on both dark and light backgrounds at large size and approximately 96px standing-figure height; frame-ledger.json records each exact file hash and independent decoded bounds.

- PASS: exactly 32 transparent 768x896 frames, six states, all hashes match manifest. Independent alpha>32 scan finds no opaque pixels in any output's outer two pixels. Source-cell edge audit is builder evidence; output scan is independent.
- PASS: red horned hood, black/red wings, gold brooch/trim and layered robe remain recognizable throughout all32 poses. Head/body read roughly right; downward death poses appropriately cease looking horizontally. No detached anatomy, sheet seams or clipped fingertips observed on composited sheets.
- PASS: idle00–03 arms crossed, restrained wing/hood changes. Hit00–03 retain identity during slight recoil. Attack00–07 open the arm toward the right and recover. Wounded00–03 hunch with subdued movement. Cast00–07 present one extended casting hand and recover. Die00–03 progressively collapse and retain the recognizable winged silhouette.
- PASS: both light/dark 96px sheets preserve the silhouette, red/gold contrast and readable state differences. Facial detail is necessarily small at this size; no claim of fine-detail readability.
- PASS: independent output bottoms remain at y816–818, consistent with root (384,816). Standing vertical bounds remain approximately640px; death height decreases without rescaling to fill the cell. Manifest stores explicit per-sheet scaling rather than frame-by-frame normalization.
- PASS: animation validator returns valid:true/errors:[]; idle 1400ms and wounded1600ms loop; hit520ms, attack1160ms, cast1200ms are nonloop actions; die1200ms is nonloop with terminalHold true. Preview clamps death to its final frame and returns other completed actions to idle. All-state inspection intentionally advances after displaying the hold.
- PASS: cast-release localframe3 at450ms, hand attachment (471,333) visually lies in the extended palm of cast-03; attack localframe3 at435ms is consistent with 145ms frames. No gameplay damage is applied by these markers.
- PASS: FFmpeg fully decoded motion-proof.mp4 without errors (exit0).

## Motion caveat and limits

Static adjacent-pose inspection shows a noticeable shape/foreshortening change across attack02→03→04 and cast03→04. The left silhouette extent moves roughly50–60px while the foot anchor remains fixed. This can read as authored turning, but motion smoothness at game scale needs the user's preview judgment; do not describe it as perfectly seamless. No source change requested solely from this static observation. Idle/wounded last-to-first pose differences are restrained on inspected sheets.

Browser playback, interactive pause/buttons, realtime seam perception, performance and runtime save behavior were NOT RUN in this reviewer pass. The standalone HTML was source-inspected; video decode is not equivalent to watching playback. Combat rules, damage timing integration, audio and saves are N/A for this standalone asset delivery. No deployment or replacement of the current Warlock was tested or authorized in this packet.

## Exact candidate hashes (SHA256)

- manifest.json: 982b72e54ead3b52828c59465252d7ae21ca4242a95cf697500183ba96cd2dbf
- animation.json: 1a24dc80729ec3718cefe4eae9eab4ee8e14a4a2505b55e6391aeec22f62f467
- motion-proof.mp4: e7e76c8960868b404205ff5ddfc0c4cd1df9e795a24364ce3e5ed2d112395762

Evidence: package evidence/{idle,hit,attack,wounded,cast,die}-{large,96px}.png, contact-sheet.png, cast-03.png palm inspection, and independent frame-ledger.json pixel/hash audit. All32 final frames inspected; no sampling inference used. Next action: show standalone animation preview to user for art/motion acceptance, retaining original playable hero.
