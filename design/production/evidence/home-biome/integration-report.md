# Hero home-biome integration — 2026-10-14

New Runeblade runs in both Conquer and demo follow Frozen Wastes → Thornroot Forest → Infernal. Warlock follows Infernal → Thornroot Forest → Frozen Wastes. All three Runeblade decks use the same home route. Existing saves retain their original route through an explicit replay version.

Realm transitions, boss rewards, final victory, realm numbering, shop rotation, local encounter rewards/camps, opening text and ending text follow the selected route. Infernal is a terminal realm for Runeblade and does not loop back to Forest. Both modes continue to use the existing ice actors and battle backgrounds.

Validation: Conquer full engine suite 309/309; demo 290/290. Both TypeScript + Vite production builds pass. Independent reviewer passed 22 checks, including eight captured pre-change save fixtures, all decks, controlled full route transitions, deterministic boundaries and inventory preservation. Full logs and independent evidence accompany this report. Both git diff --check commands exited zero (CRLF notices only).

Browser: actual new Gravehost starts, without preview fixtures, verified in both modes on isolated localhost ports 4350 and 4351. Conquer shows Realm I Frozen Wastes and its 12 encounter map; first combat uses Rimejaw Scavenger/Shardstep Skitterer and Frostgrave Causeway. Demo starts Frozen Wastes 1 of 12 with the same ice actors/background. Both browser reload/resume flows return to the same first combat. No console warnings/errors were captured. Screenshots retained.

Scope and limits: no commit, push or deployment. Enemy budgets were not rebalanced: the Frozen opening still has 65 HP enemies and its boss has 340 HP. This is routing and compatibility validation, not a certification of Frozen-first difficulty. Controlled boundary fixtures are not naturally earned full-campaign saves. Original frozen-wastes packet is a historical checkpoint; this packet supersedes its universal Infernal-first route assumption without rewriting prior evidence.
