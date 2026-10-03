# Coalhorn Ram repair

Repairs the user-reported detached tail/hoof and missing wounded collar gems.

The previous equal-grid crop split poses that crossed cell boundaries. `tools/import/repair-coalhorn.py` extracts the twelve complete connected sprite islands at a shared source scale, retaining alpha edges and registering feet at y414 on448px canvases. All original assets remain in fire-demo-r1.

Wounded09 was repaired with image_gen using original09 as pose and08 as gem reference. Source preserved as wounded-repair.png and hashed in manifest. Low-alpha exterior pixels are excluded from registration bounds to prevent scale popping. No other pose was redrawn.

Runtime importer explicitly selects this revision and uses fire-repair-r2 URLs to avoid old cached frames. Gallery animation-repair-r3 contains the final frame sheet and playable preview; animation-repair-r2 is an earlier superseded preview. Art approval remains pending; integration is authorized by the repair request.

Verified twelve448x448 transparent runtime frames and allfive existing states. Independent review report: work/production/coalhorn-repair/qa.json.
