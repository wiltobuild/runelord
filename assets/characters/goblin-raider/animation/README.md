# Goblin warband animation study

Open preview-r2.html to play the three variants. Select idle, attack, hit, wounded_idle or die. GIFs are also supplied for all 15 states; death is a one-shot and holds.

36 transparent 512x512 PNG keyframes, three 2048x1536 atlases, 15 GIFs, and a JSON runtime manifest. Coordinates are pixels from top left. Common visual ground anchor [280,450]. 1200 ms idle/wounded loops, 350 ms attacks with impact at135 ms, 280 ms hits, 700 ms deaths. Runtime frames have not been independently scaled; source pose sheets are 1448x1086.

These are playable low-frame-count prototype animations, not polished production animations. V1 idle sword length changes, equipment/face proportions vary, foot contact alignment is approximate, and fine edge quality still warrants in-engine review. Browser playback was blocked by local URL access restrictions; inspect the GIFs/native browser yourself before integration. See verification.json.

Original approved art is preserved in the parent folder. Source contains generated pose sheets and technically isolated crops; there is no rig or layered artwork. generation-record.json records built-in image_gen prompts. A V1 idle repair attempt was rejected because continuity remained imperfect.
