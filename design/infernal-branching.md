# Infernal branching campaign slice

Updated 2026-10-03. New games use the Soulforge shop and island-circuit map. Strongholds and wider world progression remain future work.

## Map
21 encounter positions, 25 connections, eight islands and seven reserved bridge crossings. Each complete journey visits 14 encounters/services, ending at the grand Sovereign citadel at the top center. Branches converge before advancing; encounters must be completed in sequence. Every route has two shops, two treasures and two elite battles.

Terrain and safe navigation are authored templates. Monsters, shop/treasure assignments, shop inventory, merchant/background pairing and rewards are seeded. All seven bridges render once, including shared crossings. Three raster orientations fit the reserved locations. Tests check rotated bridge bounds, separate encounter footprints and lava coverage. Geometry is exported to apps/web/public/infernal-assets/map-layout-v2.json; topology lives in packages/engine/infernalTopology.ts.

## Working Soulforge Exchange
The selected cel-shaded design is a reusable blank raster template with live text, cards, prices and controls. Three shop backgrounds and three expressive merchants combine independently by seed.

- Two purchase offers drawn from implemented Warlock/neutral cards; five distinct relics from six working definitions.
- Upgrade and Remove each offer two eligible owned copies. Each service has independent per-shop rerolls costing10,20,40gold and onward. Rerolls replace offers, never delete owned cards, and prefer alternatives when possible. Scarce pools may produce one offer.
- Upgrades cost50 ×2^current level and consume that offer. Numerical comparisons use engine values. Primary effects target1.2^level scaling; discrete effects gain at least one, so small values can exceed20%. Mana above1 drops by1 every third upgrade, minimum1.
- Removal costs10gold, minimum10cards. Maximum3copies or2Rare. Copy indices are safely remapped; all transactions and counters replay deterministically.
- Existing neutral illustrations and blank frames are reused with live names/rules. Existing objects illustrate relics. Inspect cards/relics for full details. Mobile uses a readable scrolling canvas and fitted detail dialog.

Ordinary fights award gold, card choice and sometimes potion; elites award relics. Treasure currently gives a free relic or75gold if all are owned. Costed treasure, gear sales, broader stock and sustained balance testing remain future work.

## Effects and compatibility
Map/shop lighting, embers, merchant expressions and aligned brazier flames support reduced motion. Four original music loops cover the map and three shop backgrounds. Technical measurements and browser on/off checks exist; subjective listening quality is not independently certified.

New saves use schema5. Historical schema4 Infernal saves retain their34-node graph, seven-card stock and original services; older fixed-route saves also remain supported. Start a new journey for the new layout and rules.

## Review and verification
[Working review](http://127.0.0.1:4320/infernal-review.html) is development-only with1000 test gold and map/shop/treasure switches; it does not modify player saves. [Main demo](http://127.0.0.1:4320/) uses earned gold and actual progression. [UI proposals](http://127.0.0.1:4320/infernal-shop-ui/index.html) preserve static historical samples.

138 tests, TypeScript and build pass. Browser checks cover buy/reroll/upgrade/remove, deck minimum, desktop and844×390landscape, readable inspection, Escape/focus return and music toggle. Independent review: [soulforge-qa.md](production/evidence/infernal-branching/soulforge-qa.md). The mobile readability finding is repaired and rechecked.

Explicit user integration instructions authorize this slice; newly generated template, bridge, throne and brazier bytes retain pending hash-specific gallery status. Originals/provenance: assets/concepts/infernal-production/r2/. Runtime derivatives: apps/web/public/infernal-assets/. No commit/deployment requested.

## Map navigation revision (2026-10-03)

Routes now support adjacent travel in both directions, including skipped branches. Cleared combat and treasure nodes are safe waypoints and cannot grant rewards again; revisited shops retain stock, card services and reroll costs. The original onward routes retain their balanced service distribution, while backtracking intentionally lets the player collect optional branches.

The atlas opens focused on the current location (or starting region), supports mouse drag, wheel/pinch zoom, keyboard pan, overview and recenter controls. Bright animated dotted routes show immediately reachable destinations in either direction. Start and current markers are explicit. A generated cel-shaded map with texture-free plateaus, new runic header/footer and five encounter icons replace the old presentation. Runtime map export is 3840×2160 from a regenerated 1672×941 master; native 4K generation remains an art limitation.

Map closeup details: fourteen cel-shaded prop variants (rocks, burnt trees, lava vents/pools and three sizes of monster remains) are seeded independently of gameplay. They fade from hidden at240% zoom to fully visible at300%. Placement excludes full structure/label envelopes, all authored route segments, rotated bridges, shorelines and neighboring props. Dense islands remain clear rather than forcing clutter; current layouts typically admit about a dozen props. Route states share3px round non-scaling dots; only color, opacity and movement indicate reachability.
