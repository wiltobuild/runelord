# Runeblade in the GitHub Pages roguelike

This integration targets the traditional roguelike on `origin/main`, based on `be1dc8c`. The separate `conquer-mode` implementation was the wrong target and is not acceptance evidence for this demo.

Runeblade uses the existing `newRoguelikeRun` entry, fixed Infernal and Forest encounter sequence, and shops after every three battles. It does not introduce territory maps or campaign progression.

Choose Gravehost, Rimebound, or Runewarden, each with ten starting cards and its own spellbook. Five animated summons and 22 Runeblade cards share the existing combat presentation. Shops and battle rewards use Runeblade card and relic pools.

Every actual friendly or enemy death grants one Corpse. Summons automatically spend Corpses equal to their effective Mana cost when sufficient; otherwise they spend the full Mana cost. Payment is never split. Corpses persist during the run. Dismissing a living unit is not a death.

Runtime artwork was explicitly authorized for integration by the user. Its design approval status remains independent. Original Warlock assets and behavior remain in place.

Verification is recorded under `work/production/runeblade-pages/`. This document does not claim publication; a successful local Pages-path build is separate from deployment.

## October 12 refinement

New runs use Runeblade rules version 2. Gravekeeper's Seal is the starting relic and grants one Corpse at the start of every combat. Each surviving summon converts into one Corpse after victory, once; this is not a death and does not trigger death relics. Corpses carry into the next encounter.

Exhume costs 1 Mana and grants 2 Corpses; Mass Exhumation costs 2 Mana and grants 4. Each starter includes Exhume. Summon HP/Power becomes Frost Thrall 20/7, Shattered Queen 15/4, Rime Seer 13/5, Rune Revenant 18/4, and Bone Defender 23/4. Hew, Brace, Frostbite, Rimecleave, Bone Ward, Rally the Fallen, and Sweeping Hew also receive modest buffs. Card illustrations and printed rules match these values.

Seven relic icons now cover the starting Seal and every Runeblade shop relic. The hero-specific HUD reuses existing geometry, recolors only decorative layers, and adds restrained ice along frame seams. Semantic HP/Mana colors, controls, actors and cards retain their own rendering. Warlock retains its original theme.

Existing saves without the version-2 marker retain their prior rules, stats and decks for deterministic replay. Start a new run to play this refinement. Artwork is submitted for gallery review, not self-approved.

## Cross-mode reconciliation, October 12
The completed shared combat rules, cards, relics and presentation are now also integrated into the local Conquer build. Conquer keeps branching travel and realm progression; the demo keeps its sequential encounter/shop flow. No publication is implied.
