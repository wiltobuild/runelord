# Gorthak frames32-r2 — idle-only repair

The user rejected r1 idle for dark flashing and excessive chest motion. This revision changes only idle sources/exports01,02,03 using strict minimal imagegen edits conditioned on exact approved neutral00. All three use neutral00 packing translation. Neutral00 remains byte-identical. All28 nonidle sources/packed frames, nonidle previews, every animation timing and geometry value remain identical to r1.

Composition: nine original hd-r2 sources retained exactly,20 newly authored r1 nonidle sources retained exactly, three newly repaired idle sources.32 unique sources remain. No nonidle regeneration, recoloring, warping, interpolation or upscaling occurred. `repair-idle.py` and `idle-repair-checks.json` verify the preservation contract. `animation.json` is the current manifest; `preview.html` plays it. `idle-review.jpg` is current idle contact sheet. Original r1 proof/evidence lives in sibling frames32-r1 and is not a validation of this repair.

Current status: independent QA qualified pass for runtime preview. Fixed chest ROI means54.32/56.50/55.63/54.25, seam offsets0/0/-1px; chest swelling removed and no conspicuous dark beat in two-cycle full/small playback. Minor residual color variation remains. Only revised idle preview submitted, Pending approval. Parent owns game integration. Changed art remains pending approval.
