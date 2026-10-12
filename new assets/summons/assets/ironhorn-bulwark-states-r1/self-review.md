# Bulwark action export review

Source sheets and every state contact sheet inspected statically. Authored attack, recoil, wounded stance, summon rise, and death have distinct joint/body poses. Mace handles remain straight; shield/horns/hooves are retained. Connected-component extraction avoids neighboring-pose contamination. Source windup mace has 7 pixels above its visible silhouette; terminal horns have 2 pixels at source right edge, visibly complete.

All 28 PNG slots retain transparency and have alpha>16 margins on every canvas edge. Eight accepted idle frames retain exact RGBA pixels at fixed offset (300,100), with no resizing. All authored poses use one fixed scale per sheet, recorded in animation.json. Ground/stance anchors are registered manually; collapse keeps natural decreasing height. Canvas is 1400×1200, anchor (700,1104), reference idle rectangle (300,100,800,1056).

Review limits: authored source proportions and shield width differ mildly from the original master, especially the narrow shield in the wounded pose. These are animation studies pending user approval. Static review does not establish playback smoothness. Browser playback and independent review remain with parent task. One-shot behavior lives in manifest; GIFs deliberately repeat for review.
