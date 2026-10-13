# Gorthak HD animation revision 2

This revision repairs the source-resolution loss in the prior animation set. The old animation was authored as sixteen poses on one 1536×1024 sheet; the first packed silhouette measures about 294×207 pixels. Each new pose was generated individually at 1254×1254, with the exact approved 1312×1199 master retained as neutral. Standing source silhouettes now occupy roughly 1100–1200 native pixels vertically. No generated pose was enlarged.

`source/` holds the native immutable images. `frame-00.png` through `frame-09.png` register those images by translation on a common transparent 1536×1536 canvas; `animation.json` supplies root, frame, timing, and state metadata. `pack.py` reproduces technical packing and six actual 1024px GIF previews. `key-poses.jpg` is a review contact sheet, not the runtime source. `packing-checks.json` records measured geometry checks. `generation.json` records generation provenance.

States: spawn, idle, act/attack, hit, wounded_idle, die. Death plays once and holds its terminal pose. Spawn uses opacity materialization; external summon VFX remain separate. Idle and wounded loops each use two articulated poses. The ten-pose set is stepped limited animation, not smooth interpolated motion, and generated anatomy/foot placement are not claimed to be perfectly invariant. It has high source detail rather than artificially upscaled low-resolution sprites.

The neutral source hash is `5e5700db391d6b020f31307d1af113102eb81f5d80575eef2c01777119f5c191`, currently approved with evidence `60fd264d-616b-4049-b781-ca8acf21506a`. All changed poses and previews remain pending user approval. This package is not mapped into the game runtime. Existing production assets and approval decisions are preserved.
