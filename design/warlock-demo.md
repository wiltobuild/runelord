# Warlock demo — Cinder & Oath

Implemented 2026-10-02 at the user's direction: prioritize Warlock because its animation set is ready; use the existing art collection and music. This is a playable first slice of PLAN.md, not completion of the full seven-phase plan.

## Play and develop

```powershell
npm install
npm run import:content
npm run import:assets
npm run dev
```

Open http://127.0.0.1:4320. The title screen offers a reproducible seed and resumes the local save. The ten-card starting deck exactly follows the Warlock catalog. Attack cards require an enemy click; skills begin their cast when clicked. Damage and reactions follow the animated impact. Enemy clicks without a selected attack change the Warband's focus. The newest demon is at the front. At five demons, select one to dismiss before summoning another.

The path is two encounters, two card rewards, a rest stop (30% Max HP, rounded down), and a boss. The demo gives one Healing Draught (20% Max HP, rounded down). The route and encounter stats are prototype content; the three-act branching map is not implemented.

## What exists

- Vite/React/TypeScript shell and PixiJS Warlock renderer.
- Pure serializable rules engine with seeded shuffle, immutable actions, event log, replay-based saves, piles, Mana, Guard, focus, Warband cap, all six enemy targeting modes, and front-to-back Muster.
- Warlock Cinders, Brand of the Pit, Pact, Corruption, three-turn Demon Form, Spent, Scorch, Imp Swift, Hellhound pack bonus, Pit Brute Defender, Upkeep/Hunger, and demon death.
- 70 imported Warlock catalog records, with unique-ID and rarity-count validation. The design-only Echoes column is omitted. Fourteen card handlers are implemented and individually tested; unimplemented cards cannot enter the demo deck. Ten of the fourteen appear in the starter/reward pools.
- Eleven Warlock animation states selected from the r4 exports, rendered in PixiJS with separate body and fire tracks. Timing comes from the source manifests. Runtime copies are resized and sampled to roughly 12 fps; full production frames remain untouched.
- Existing Cinderforge, Thornroot, goblin, Briarjaw, Tollbell, card, Brand, and potion artwork. Asset provenance records source and output hashes and the actual ledger decision without promoting pending art to approved.
- Three existing scores, using Web Audio loops at the exact manifest loop points, a volume control and mute. Audio starts after a user gesture. Original soundtrack license is included in the runtime assets.
- Local auto-save stores the seed and action history. Resuming replays the rules rather than trusting a serialized mutable combat state.

## Art and animation boundaries

The demo uses the user's standalone Imp, Hellhound, and Pit Brute character masters. These models enter through fire portals and move onto their attack targets; their masters are flattened art, not articulated rigs. Enemies use their existing idle, attack, hit, wounded-idle, and terminal death frame sets. Demon Form uses the existing empowered **human** Warlock motion; it does not claim the unapproved alternate demon anatomy is complete.

Spell presentation now runs as a timed sequence: the original Warlock release marker starts a projectile, impact changes HP and starts the reaction, then the actor recovers. Canvas effects include firebolt trails/bursts, lash ribbons, immolation, multi-target conflagration, ward shields, blood pact, Kindle, ascension, and summon portals. These are editable runtime effects drawn over the existing models; no replacement cards or character designs were generated.

Enemy movement uses targets captured by the rules engine, including Defender interception, front targeting, and sweeps. Source frame durations and impact markers are preserved. Presentation checkpoints are separate from the authoritative saved outcome, so refreshing mid-animation safely resumes the completed action. Attack controls stay locked until the sequence completes.

Use the user's `hd-fantasy-character`, `hd-card-creator`, and `hd-animate-fantasy-character` skills for any required new assets. New standalone demons should go through the character base/variant approval workflow and animation handoff. Do not treat approval of card illustrations as approval of a character rig. Preserve the current gallery ledger and existing source art.

## Validation

```powershell
npm test
npm run sim
npm run build
```

Tests cover every implemented card, invalid actions, Scorch timing, Swift, Muster order, Defender, sweep targeting, full-board dismissal, Hunger through Guard, lethal Pact, Demon Form duration/Spent, rewards/rest/victory, and deterministic save/replay. The simulator runs 1,000 seeds through the whole demo and checks terminal outcomes, numeric invariants, and exact replay equality. It is a crash/replay check, not a balance certification; the current demo is intentionally forgiving.

Asset import reads `assets/audio/music` by default; `RUNELORD_MUSIC_ROOT` can override that location. Browser-ready assets go to `apps/web/public/game-assets`; provenance lives in `packages/assets/manifest.json`. Source archives are not modified. The importer rejects assets marked Needs revision, and records pending/unreviewed status faithfully.

## Next work

1. Add articulated motion exports for the existing Imp, Hellhound, and Pit Brute masters through the specified animation workflow.
2. Add runtime atlas packing and extend spell-specific hand attachments for further hero actions.
3. Expand Warlock card handlers from the catalog, with per-card and interaction tests. Add Sacrifice, Soul Shards, Powers, Gloomstalker, Soul Leech, and Pyre Warden.
4. Implement the shared hook bus/action queue, branching map, shop, inscriptions, full run persistence, and the broader Phase 0 catalog validations.
5. Balance encounter kits, accessibility and keyboard targeting, reduced-motion playback, and mobile landscape presentation. Other heroes remain out of scope for this first demo.
