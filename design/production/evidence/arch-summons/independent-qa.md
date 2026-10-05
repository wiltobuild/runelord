# Independent QA — Arch summons

Checkout HEAD: 520a1d9549599a5e1bf871beeba8791a4b2e874a with task changes uncommitted. Exact engine/content/test hashes in hashes.txt. Reviewer /root/qa authored tests independently; no production implementation edits. Test-only packages/engine/summons.test.ts authorized by producer.

## Passed
- 21 independent contract checks (contract-results.txt): all twelve summon identities; six transformations; proportional HP, Guard and identity preservation; invalid/duplicate rejection without input mutation; Ignivar +4 Scorch per fire hit including partial Guard absorption; physical exclusion; Brute7 all-enemy cleave; Gloom alternating actions; Warden arrival Guard6 and Scorch1; Colossus double Guard; all lesser Gorthak conversions; arch preservation; full-board generators; Cerberax rounding, Guard, sweep, lethal sharing; early reward restrictions; exact starter replacements; fresh starter save replay; seeded 50% Colossus rebirth branches; replacement conversion; dismissal no rebirth; Sovereign choice-to-loot-to-shop.
- Existing npm test suite149 passed before adding independent tests. Retained independent test suite21 passed afterward.
- npm run build exited0, including runtime asset validation and TypeScript. Existing chunk-size warning remains.
- Browser at http://127.0.0.1:5191, isolated agent-browser session arch-qa, 1260x568. Ordinary visible title→start→Master of Demons deck preview shows correct ten cards, Pit Brute replaces Firebolt, Empower replaces Ward. starter.png.
- Dev fixture /summon-review?units=imp,gloomstalker,pit-brute&cards=empower-demon,hellish-command,summon-imp: click Empower→Gloomstalker; correct Nightmaw form, maintained slot, Mana30→29 (2 cost and1 refund), Cinders20→18, extra card, action lock recovers. Invalid targeting Nightmaw shows error and no additional cost. empowered-nightmaw.png inspected.
- Dev fixture /summon-review?units=cerberax,hellhound,hellhound&cards=hellish-command: End Turn; enemy5 splits Cerberax28→26, rear hound14→13, front14→12. Free fourth pack member arrives14/14 at next turn. Pack power updates14/12. Input unlocks. cerberax-split.png.
- Browser page-errors query empty during transformation flow.

## Findings and resolutions
- Gloom parity expression initially skipped Sapped after first action; rules author repaired; third-action check passes.
- Simulation bot initially selected invalid Empower target and crashed; reported to rules author, repaired; full rerun in progress.
- Dismissal intentionally retains historical Corruption/Resilience, excludes only Pyre rebirth per agreed wording; check narrowed accordingly.
- Minor presentation wording: Hellish Command accessible label says attacks immediately while support units act; reported producer.

## Limits / not run
- Browser fixtures are explicit constructed scenario tests, not proof of normal progression acquisition.
- Audio audition, every animation frame, mobile landscape, complete browser journey, and refresh during animation not run by this reviewer.
- Escape check interrupted by development HMR fixture reset; not claimed.
- Balance not established by correctness/simulation tests.

## Final integration recheck
- Full npm test now174/174 pass (includes independent21 plus rules additions), npm-test.txt.
- Mixed five-unit formation Ignivar, Imp, Imp, Cerberax, Hellhound visually inspected after layout repair; all distinct and labels readable, full-formation.png. Selected second Imp with Hellish Command via visible unit button; target492→488 HP and Scorch10→15; input recovered.
- Accessible Command wording now corrected to acts immediately.
- Simulation remains running at report handoff; session28178 can be polled, sim.txt receives final result. Initial failed run was superseded by fixed rerun.
- Redundant QA1000-run simulation stopped by producer request (Ctrl-C, session28178 exit1); not completed and not a pass. Rules author owns the remaining full simulation run. No QA simulation process left running.
