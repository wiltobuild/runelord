# Forest realm independent acceptance

Reviewer: forest_qa, separate from implementation authors. Date: 2026-10-04.
Repository HEAD: f688c4a6ad244b623b8ed2140e3019fa2cdbe135 plus working changes; exact reviewed source hashes in source-hashes.json.
Environment: Windows / Node24.18 / agent-browser0.38.2 isolated session runelord-forest-qa. URL http://127.0.0.1:5173/forest-review. Browser fixtures seed29; engine independent seeds0,42,7319,4294967295; genuine replay fixtures seed0 and10. Viewports1280x720 and960x540.

Conclusion: no new blocking defects found in reviewed forest scope. One unrelated pre-existing map geometry test remains failing. Implementation accepted with the explicit coverage limitations below.

## Observed passes

- Seven forest engine tests pass, including exact restore/save equality of the genuine474-action fully earned campaign reaching won after all12 forest battles and4 exchanges. Retained forest-tests.log. Genuine228-action history replayed independently at EVERY prefix, including Infernal crown boundary and forest shop; independent-engine.json identifies inputs.
- Independent dynamic checks:48 battle fixtures across4 seeds,12 enemy turns each (576 total), all runtime enemies/reserves stay within approved selection; no Suture Standard, fire or undead replacements, no summon AI. Independent-engine.ts/json retained.
- Twelve forest battle nodes, shops after3/6/9/12; clean final shop -> won, no extra crown duplication. Transition carries deck/copy upgrades, relics, inventory,gold,HP/maxHP and seed/RNG. Transient combat powers retain ordinary reset semantics.
- Visible crown fixture action Enter Thornroot Forest -> entry,450gold,10cards,72HP intact. Visible Encounter1 travel -> Begin encounter -> two42HP living forest foes.
- Combat7 loads heart scene and Siltglass Colony/Ironfan Isopod/Tithe Mantis. Combat12 loads heart scene and Gallows Orchard190HP/Pleatcap65/Threadwarden65, correct forest labels.
- Boss fixture Summon Hellhound -> presentation lock -> unlock; End turn -> individual damage/HP updates -> next turn unlocked, living forest enemies and updated intents. Existing player fire summons deliberately remain player-owned.
- Shop3 upgrade purchase deducts100gold once; Leave -> map with encounter4 available. Inspect card modal opens and Escape closes. Final exchange Leave -> The forest bows victory and restart/title controls.
- Fixed shops fit entirely at1280x720 and960x540. 1280 measured scrollWidth1280 and scrollHeight720. Forest route960 has no horizontal overflow; vertical route scrolling is intentional.
- Actual forest-explore04_lanterns_in_the_hollow.ogg and forest-boss06_the_silent_conclave.ogg requests return200 after user gesture; music toggle changes accessible label. Empty browser errors log after final checks. Scene canvas binds thornroot-crossing; representative forest backgrounds/actor art render correctly.

## Repair recheck

Initial forest shop header consumed vertical space and pushed relic prices below viewport. Integration author removed duplicate outer shop header/padding. Rechecked fixed1280 and960 screenshots: all controls and prices fit.

## Existing issue / limitations

- Baseline npm test before forest changes:161 total,160 pass,1 failure: infernal-structure-land.test.ts No circuit structure occupies an actual bridge crossing. baseline-test.log preserves it. Producer's final broader test/build evidence is separate.
- Browser fixture actions are presentation verification, not proof of playing a full campaign through UI. Genuine full campaign and every-prefix save replay were tested in engine. Reload during animation through player-save browser route not run; dev fixtures intentionally never save.
- Audio fetch/decoding and toggles checked; audible audition, loop-seam listening and listening for mix overlap not performed in headless browser. Asset agent's waveform/loop validation is separate evidence.
- Animation frames/assets render and attack/turn presentation resolves; this does not certify frame-by-frame identity or smoothness of every actor state. Comprehensive visual animation audit outside this integration scope.
- Full keyboard-only campaign/reduced-motion audit not run. Escape modal action passed. Balance evidence is rules designer's separate12-seed legal campaign simulation, not inferred from these tests.

Evidence images ending -fixed supersede earlier shop images. Reviewer changed only QA evidence and scripts; no production repairs.
