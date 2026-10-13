# Runelord cross-mode reconciliation — pre-commit report

Date: October 12, 2026. **No changes staged, committed, pushed, or deployed by this reconciliation.** The live demo is unchanged.

## Scope and source review

Reviewed 36 other identified Runelord development/art/promo chats plus this conversation, current repository state, the selected runtime manifests and importers, and the older release/worktree differences. The project sidebar and local session index were used to find the chats; the archived Codex listing was empty. Chat claims were checked against current files and newer decisions. Old concepts, failed animation studies and superseded revisions were not treated as finished game updates.

Two independently maintained versions:

| Version | Checkout | Local HEAD | Remote branch |
|---|---|---|---|
| Conquer | C:/Users/wilsh/Projects/runelord | 03338e4 | conquer-mode at f688c4a |
| Roguelike demo | C:/Users/wilsh/Projects/runelord-roguelike-pages-recovery | be1dc8c | main at be1dc8c |

Conquer remains a branching-map campaign prototype. The demo retains its sequential Infernal/Forest encounters and shop cadence. They share combat and presentation updates; neither progression model was overwritten.

## Game changes currently uncommitted

This includes pre-existing work from the other chats plus the missing cross-mode integration completed here.

| Area | Included behavior/assets | Reconciliation |
|---|---|---|
| Runeblade gameplay | Three starter decks; five animated undead summons; 24 playable cards; Corpses, Rot, Chill/Freeze; hero-specific acquisition; Gravekeeper’s Seal starts each combat with +1 Corpse; each surviving summon converts to one Corpse after victory; stronger summons and seven buffed spells; Exhume 1 Mana → 2 Corpses and Mass Exhumation 2 → 4 | Demo’s newer r2 rules brought to Conquer; historical saves retain earlier rules |
| Runeblade cards and equipment | 24 revised/current card faces, historical card faces, seven relic illustrations, three starter tomes, summon/hero frames and manifests | Both versions now reference the same current package |
| Runeblade presentation | Ice HUD with preserved layout, blue resource/guard treatment, icy hero/minion spells and shields, blue ground strike and energy waves, fully concealed mound entrance, reversed death-to-standing animation, fixed-size formations | Completed effects routed through both versions, not merely copied as unused files |
| Warlock summons and mechanics | Six lesser demons and six Archdemons; Empower Demon; Arch passives, revised starters, acquisition gates; Pit Brute 7-damage cleave; Pyre changes; current Gorthak and flying Ignivar art; family formations and staggered idle phase | Existing demo functionality ported to Conquer; mode-specific reward and travel flow retained |
| Cinematic summon models | Battle-facing 32-frame Hellhound and Pit Brute, authored entrance and attack timing | Conquer had still referenced the old models; now updated |
| Combat readability and fixes | Defensive target fallback retained; shields fit in front of allied silhouettes; readable Scorch lead-in and hold, actual damage metadata, fiery animated text without box/dot; card-hover/text clearance; removed End Turn symbol row; proper hurt/wounded fallback and authored sprite reveal | Previously missing Conquer fixes restored; both share the corrected behavior |
| Spell performance | Cached flame/glow/portal textures, display-scaled canvas, no animation loop when effects are inactive, blended Forest spell frames, music resume/cancellation fix | Recent Conquer performance improvements added to demo while preserving its Empower and nature effects |
| Forest content | Root-Crown King, independent living roots, Rootwake/Verdant Cyclone/Crownfall, nature shields, forest combat/background/music integration | Shared content retained in both; root reveal metadata and presentation aligned |
| Infernal map, Conquer only | Existing branching map/props/review work, no decorative bridges, Battle action close above selected location | Preserved as Conquer-only; obsolete bridge-overlap test removed, land/structure/route checks retained |
| Monster shields | Current persistent, uncapped monster Guard rules with half-max-HP shield gain | Ported to Conquer with old-save compatibility |
| Saved-run presentation | Version-aware descriptions and faces, including original 10-damage Pit Brute for historical saves and 7-damage Cleave for current runs | Browser QA found stale Pit Brute text; fixed both descriptions and historical face selection |
| Release/support tooling | Required runtime assets made visible to Git, shared asset completeness/revision checks, repaired Conquer simulator, updated current-scope docs, review pages and evidence | Added/retained to make the eventual release inspectable and reproducible from shipped runtime files |

Representative code: `packages/content/runeblade.ts`, `packages/engine/index.ts`, mode-specific shop engines, `ActorSprite.tsx`, `useBattleDirector.ts`, `SpellEffects.tsx`, `runebladeSpellEffects.ts`, `runebladeSummonTiming.ts`, `warbandLayout.ts`, `cardPresentation.ts`, HUD/style files and the asset importers.

## Required runtime files

Each version references **1,155 runtime files**. Independent audit found zero missing runtime files, output hash mismatches, missing active sources, or ignored required assets.

- Conquer: **715 required runtime paths are still untracked**.
- Demo: **239 required runtime paths are still untracked**.
- These are not yet committed. The eventual commit must include them together with source changes and manifests.
- New runtime data includes character frames, card faces, relic icons, Forest assets/audio and the historical Pit Brute face.
- The demo also retains 74 unused historical provenance entries whose old source files are absent in that checkout. No current runtime asset depends on them.
- Full authoring regeneration still uses the local source library. Shipping the verified runtime assets does not require publishing the heavyweight historical authoring archive.

## Full uncommitted inventory

The following is a snapshot taken before adding this report and its evidence copies. Counts include each checkout separately, so duplicated files are not unique global totals. File sizes are on-disk totals of changed/untracked files, not Git patch size or proposed upload size.

| Checkout | Modified tracked files | Untracked files | On-disk total |
|---|---:|---:|---:|
| runelord | 52 | 6813 | 4.651 GB |
| runelord-roguelike-pages-recovery | 35 | 827 | 0.273 GB |

Every listed path, Git status, category and byte count is in [Conquer CSV](evidence/cross-mode-sync/conquer-uncommitted.csv) and [demo CSV](evidence/cross-mode-sync/demo-uncommitted.csv). Grouped machine-readable inventory: [summary JSON](evidence/cross-mode-sync/uncommitted-summary.json).

| Category | Conquer files / size | Demo files / size |
| Documentation, tooling and configuration | 71 / 9.9 MB | 14 / 0.1 MB |
| Runtime art, audio and public assets | 768 / 87.5 MB | 281 / 18.4 MB |
| Gameplay, presentation and tests | 68 / 0.6 MB | 39 / 0.4 MB |
| Gallery decisions | 1 / 8.5 MB | 0 |
| Character source art and animation studies | 2825 / 1547.4 MB | 166 / 42.1 MB |
| Runtime asset provenance manifest | 1 / 1.2 MB | 1 / 1.3 MB |
| Art approval previews | 2052 / 1700.2 MB | 0 |
| Other art, objects, environments and music sources | 234 / 257.3 MB | 33 / 11.3 MB |
| Card masters and production files | 679 / 327.2 MB | 323 / 199.8 MB |
| Scratch work, captures and handoff archives | 166 / 711.3 MB | 5 / 0.0 MB |

## Local art and work that is not a game-release change

These files are preserved and included in the inventory, but should not be swept into a game commit merely because they are untracked:

- Approval inbox previews and gallery decisions: character concepts, card reviews, animation previews and current decision history.
- Character masters, alternative designs, frame sources, motion proofs, repairs, and superseded animation revisions.
- Card masters, masks, editable layers, illustrations, generation prompts and production manifests.
- Environment/map/shop/UI concepts, object masters, music sources and alternate exports.
- Capture tools, screenshots, recordings, temporary work and handoff ZIP archives.
- The separate ignored authoring archive contains **118,733 files / 28.10 GB**, primarily older hero animation and reference libraries. It remains ignored and untouched. This is additional to the uncommitted totals above.

Unselected Fire/Frost Sovereign concepts, three proposed Seraph demon forms, unrelated monster/dragon concepts, failed/superseded animation studies, and unfinished Ranger/Runesmith gameplay are not newly integrated. They require selection, production or gameplay work; their existence in a chat or art directory is not a completed update to port. Promo-video motion interpolation belongs to the video export and was not represented as newly authored game frames.

## Already committed locally, but not pushed

Conquer is two existing commits ahead of its remote branch:
- `35d9f06` — align summon circles.
- `03338e4` — woodland exchange shops.

These are distinct from the uncommitted changes. The demo checkout is based on remote main `be1dc8c`. Older worktrees contain historical dirty copies and were preserved; the current reconciliation targets the two active checkouts above.

## Verification

- Conquer: **273 gameplay tests passed**.
- Demo: **252 gameplay tests passed**.
- Both production builds passed; demo built with the GitHub Pages base path.
- Shared runtime release checks: four passed in Conquer; all seven demo release checks passed.
- Eleven production tooling tests passed in each checkout.
- Focused layout, resurrection timing, current/legacy card presentation and TypeScript checks passed.
- Both Git whitespace/diff checks passed.
- Independent browser review verified both heroes entering combat in both modes, Corpse costs, summoning/resurrection, defensive casting, turn resolution, save/resume without duplicated effects, corrected Pit Brute text, and the Conquer map change.
- Simulations: **1,000 seeds per mode, zero stalls and 1,000 identical save/replays in each.** These validate crash/replay invariants, not balance; the fixed Warband bot won 8 Conquer runs and 1 demo run. Raw logs are retained.

See [independent QA](evidence/cross-mode-sync/independent-qa.md) and [runtime inventory](evidence/cross-mode-sync/runtime-inventory.json). Both builds retain the existing large-bundle warning. Independent QA did not exhaustively recheck every card, full campaign, audio, mobile/keyboard access, every animation frame, or measure FPS. Final dynamic Scorch/hover checks were not repeated; source/timing checks passed.

## Suggested eventual commit grouping

1. Shared combat rules, card text and save compatibility.
2. Runeblade and Warlock animation, formation, HUD and effects integration.
3. Required runtime art/audio, manifests and import tooling.
4. Conquer map changes and mode-specific fixes.
5. Release checks, simulator, documentation and QA evidence.

Keep approval/archive/source-library publication as a deliberate separate decision. **No commit or deployment has been performed; this report is the requested pre-commit review.**
