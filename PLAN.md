# Runelord: Build Plan (v2)

**Status:** Draft for approval · **Date:** 2026-10-01 · Supersedes v1, the StS2 clone plan, archived at [reference/sts2/STS2-CLONE-PLAN-v1.md](reference/sts2/STS2-CLONE-PLAN-v1.md)

Runelord is an original deckbuilding roguelike for the browser. It keeps the proven structure of Slay the Spire 2: three-act map climbs, turn-based card combat, relics and potions. It changes three things:

1. **Original heroes and content.** Four new heroes with 70 newly designed cards each, original potions, and every item renamed and restyled as **Runestones**.
2. **The Warband.** Every hero fights with allied units on the board, and each hero gets and keeps those units differently.
3. **Ultimate cards.** One-per-deck, resource-heavy climax cards, each an over-the-top version of that hero's summon fantasy.

Hero models, levels (acts and maps) and enemies are produced by a separate generation model that already has skills for this. This plan defines exactly what that model must deliver (§8).

---

## 0. Decisions needed before building

| # | Decision | Recommended default |
|---|---|---|
| D1 | **IP posture.** The structure is inspired by StS2. Cards keep an "Echoes" note for design traceability only. Names, text, items, potions and heroes are now original. | Keep the "Echoes"/"Restyles" columns in design docs only and strip them from shipped data. The rules framework (energy, block, map) is common to the genre. |
| D2 | **Art pipeline** | 2D cutout or sprite characters rendered in **PixiJS**; style "a little more basic than StS" (§8.1) |
| D3 | **Co-op** | Single-player first. The engine stays deterministic so co-op can be added in a later phase. |
| D4 | **Repo location / name / stack** | Vite + TypeScript monorepo (`packages/engine`, `packages/content`, `apps/web`). **Location and repo name need your approval.** |
| D5 | **Delegation** | Claude plans and verifies; Codex implements; start with `/bootstrap-project` (your global workflow) |
| D6 | **Enemies and acts** | The generation model designs the bestiary and acts against the spec in §8.3. The reference StS2 bestiary is **not** used. |

---

## 1. What's in this folder

| Path | Contents |
|---|---|
| [design/heroes.md](design/heroes.md) | The four heroes in full: concept, look, stats, resources, unit system, starting deck and runestone, build paths, Ultimates, balance targets |
| [design/warband-system.md](design/warband-system.md) | Shared unit framework: board, Muster phase, how enemies target units, unit keywords, and the enemy-spec fields for corpses and taming |
| [catalog/cards-runeblade.md](catalog/cards-runeblade.md) · [warlock](catalog/cards-warlock.md) · [runesmith](catalog/cards-runesmith.md) · [ranger](catalog/cards-ranger.md) | 70 cards each: 4 Basic, 18 Common, 28 Uncommon, 18 Rare, 2 Ultimate |
| [catalog/cards-neutral.md](catalog/cards-neutral.md) | 30 Neutral cards, 10 Curses, 6 Statuses, quest cards |
| [catalog/units.md](catalog/units.md) | Stat blocks for every Thrall, Demon (plus 6 Arch-forms), Construct, the Thunderhulk mech, Companions and Wild Beasts |
| [catalog/potions.md](catalog/potions.md) | 48 potions (36 shared, 3 per hero) + 2 special. Only Healing Draught and Mana Potion are genre staples. |
| [catalog/runestones.md](catalog/runestones.md) | 286 Runestones (items): 36 hero-specific + 250 shared, each renamed and restyled |
| [catalog/glossary.md](catalog/glossary.md) | All rules terms, Inscriptions (card upgrades-on-cards) and Hexes (enemy card curses) |
| `reference/sts2/` | The original StS2 research: mechanics, odds, economy, map rules. Used for numbers Runelord keeps. |

### Content totals
| Content | Count |
|---|---|
| Heroes | 4 (Runeblade, Warlock, Runesmith, Ranger) |
| Hero cards | 280 (4 × 70), including 8 Ultimates |
| Neutral / Curse / Status / Token / Quest | 30 / 10 / 6 / 3 (Arrow, Soul Shard, Burnout) / 5 |
| Unit types | 7 Thrall kinds, 6 Demons + 6 Arch-forms, 6 Constructs + Thunderhulk, Companion template + Kestrel + Spirit Wolf + 4 Wild Beasts, 2 universal |
| Potions | 48 + 2 special |
| Runestones | 286 |
| Ascension levels, custom modifiers, map rules, economy | Carried over from the reference with Runelord terms (§5) |

---

## 2. The heroes at a glance

| Hero | Fantasy | Gets units by... | Unit downside | Ultimate (summon) |
|---|---|---|---|---|
| **Runeblade** (human, ice, heavy armour, two-handed greatsword) | Freeze, shatter, raise the fallen | Killing enemies → Corpses → **Raise** | Thralls **Rot** away | **Army of the Dead:** raise every corpse and fill the board with Risen Legionnaires |
| **Warlock** (fire, sinister cloth robes) | Summon demons; become one | **Summon** cards paying Mana + **Cinders** | **Upkeep** every turn, or they feed on you | **Greater Summoning:** an Arch-form of a chosen demon (e.g. Gorthak the Pit Lord) |
| **Runesmith** (dwarf, lightning tech) | Deploy turrets and bots; drop into a war-mech | **Deploy** cards, one per construct type; **Mech Up** for the Thunderhulk | Constructs only act well when **Charged** | **Total Deployment:** every construct plus the mech at once |
| **Ranger** (elf, nature, longbow) | Tame the Spire's beasts | **Tame** weakened normal enemies | Companions are **lost for good** when they die | **Call of the Stampede:** X+2 wild beasts trample the enemy |

Details, rules and numbers: [design/heroes.md](design/heroes.md).

---

## 3. How the cards were redone, and how to design more

This is the method used for all 280 hero cards. Follow it for any additions or balance passes.

### 3.1 Principles
1. **Every card does something new.** No card keeps a reference card's effect and name. The **Echoes** column names the archetype card whose *role* it fills: a big single-target hit, an AoE, a scaling power, a draw engine, an escape button. That keeps the deck-building skeleton the genre is known for.
2. **The hero system comes first.** A card should touch its hero's unique system (Chill, Corpses, Scorch, Cinders, Corruption, Charge, Volts, Scrap, Mech, Tame, Mark, Venom, Arrows) unless it's a deliberate generic filler. Target: **≥ 60%** of each pool.
3. **Unit quota.** At least **35%** of each hero's cards create, buff, command, protect, sacrifice or pay off units. Current pools (keyword count): Runeblade 34/70, Warlock 32/70, Runesmith 47/70, Ranger 26/70. The Ranger's companions are also persistent and always on the board, which offsets its lower count.
4. **One way in per hero.** Units only arrive through the hero's own verb: Raise, Summon, Deploy, Tame. Neutral cards may *buff* "units" but never *create* hero-specific ones.
5. **Ultimates** are Unique and Consume. They cost 4–5 Mana, or X, **plus** the hero's secondary resource. They are offered only in boss card rewards (1 slot, 30% chance) and by the Act 2 Elder Spirit.

### 3.2 Value budget (for balancing)
Baseline per **1 Mana** at Common: **6 damage** or **5 Guard** or **draw 1.5**. Rarity multipliers: Uncommon ×1.15, Rare ×1.3 (or a unique effect). Each Upgrade adds about +30% value or −1 cost.

| Effect | Mana-equivalent |
|---|---|
| Raise (avg Thrall, with a Corpse) | 1.0 |
| Summon Imp / Hellhound / Pit Brute | 0.8 / 1.3 + 2🔥 / 2.0 + 2🔥 |
| Deploy a basic construct | 1.0 |
| Tame (when it succeeds) | 1.5 + a persistent unit (worth more in Acts 1–2) |
| 3 Chill / 4 Scorch / 3 Venom / 2 Mark | 0.5 / 0.6 / 0.5 / 0.3 |
| 1 Cinder / 1 Volt / 1 Scrap / 1 Corruption | 0.2 / 0.25 / 0.15 / 0.1 (+HP cost) |
| Command (one unit acts) | 0.4 + 0.1 per Power |

### 3.3 Card template (data format)
```jsonc
{
  "id": "RB_GLACIER_FALL", "hero": "runeblade", "name": "Glacier Fall",
  "rarity": "uncommon", "type": "attack", "cost": { "mana": 3 },        // + "cinders" | "volts" | "x": true
  "keywords": ["heavy"],
  "effects": [{ "op": "damage", "amount": 26, "target": "enemy" }],
  "costMods": [{ "op": "reduce", "per": "thrallCount" }],
  "upgrade": { "effects[0].amount": 32 },
  "text": "Heavy. Deal {dmg} damage. Costs 1 less for each Thrall you control.",
  "echoes": "Stomp"                                                       // design-only, stripped at build
}
```

### 3.4 Workflow for each card batch (Codex task brief)
1. Translate the catalog rows into card JSON plus effect handlers (the primitives in §6).
2. Generate one unit test per card: set up a board, play the card, assert the state change against the catalog numbers.
3. Run the **bot sim** (1,000 seeded fights per hero vs. Act 1 pool). Flag cards with pick-rate or win-delta outliers.
4. Claude reviews: rules text matches the glossary, the card fits the hero quota, and the budget is within ±20%.

---

## 4. Architecture

```
apps/web            React shell (menus, map, shop, events, deck & Lodge views) + PixiJS combat scene
packages/engine     Pure TS deterministic rules engine (no DOM). Action queue + hook bus + Warband.
packages/content    Card/unit/runestone/potion JSON + TS behaviour handlers, generated from catalog/*.md
packages/assets     Asset manifest + loaders (filled by the generation model)
tools/import        catalog/*.md tables → content JSON (+ validation: counts, glossary terms, quotas)
tools/sim           Headless bots for crash and balance runs
```

**Engine principles:**
- **Seeded RNG streams.** A run is reproducible from its seed and inputs.
- **Action queue.** Every effect is an Action. The UI animates from the event log.
- **Hook bus.** Runestones, statuses, Inscriptions and units subscribe to turn and combat hooks.
- **Serialisable state.** `RunState` and `CombatState` can be saved and restored.

**Warband additions:**
- A `Unit` entity (`id, family, hp, maxHp, power, guard, statuses, traits, action, charge?, rot?, upkeep?, bond?`).
- A `warband[]` array on `CombatState` (cap 5 + modifiers).
- A `lodge[]` array on `RunState` for **Persistent** units (Ranger companions).
- A **Muster phase** between the player's end of turn and the enemy turn.
- **Ally intents** shown above each unit.
- An enemy **target resolver** implementing `targeting` (warband-system §4).

**Hero-system modules:**
- `frost` (Chill / Frozen / Heavy / Shatter)
- `grave` (Corpses / Raise / Rot)
- `pit` (Scorch / Cinders / Upkeep / Corruption / Demon Form)
- `forge` (Charge / Overcharge / Arc / Static / Volts / Scrap / Thunderhulk)
- `wilds` (Tame / Companions / Bond / Snare / Mark / Venom / Arrows / Quickdraw)

Each module is isolated behind the hook bus, so heroes can be developed in parallel.

---

## 5. Run structure (carried over from the reference, renamed)

The proven numbers from the StS2 research are kept ([reference/sts2/catalog/constants.md](reference/sts2/catalog/constants.md), [data/mechanics_notes/](reference/sts2/data/mechanics_notes/)):
- 7-column map
- 15 / 14 / 13 rooms per act
- 5 elites (8 at A1+), 3 shops, rest-site and "?" room counts and adaptive odds
- Card rarity bands and pity
- Potion pity
- Gold amounts
- Shop layout and prices
- Score formula

**Renames and changes:**
- **Elder Spirits** replace Ancients at the start of each act (Mother Hollow; Ozzrik / Vaelith / Tzalla; Ninefold Choir / Thrax / Vuul; Grimmor wanders). They offer Elder runestones and, in Act 2, a chance at an **Ultimate**.
- **Rest Site options:**
  - Rest (heal 30%)
  - **Inscribe** (upgrade a card)
  - **Tend** (heal all Persistent units to full)
  - Runestone-gated: Lift, Dig, Cook, Kindle, Hatch
- **Shop:** 5 hero cards, 2 Neutral, 3 Runestones, 3 potions, card removal. Ranger shops always stock 1 **Beast Treat**.
- **Card rewards:** 3 cards. Boss rewards have a 30% chance to replace one slot with an Ultimate (never a duplicate).
- **Ascension 1–10:** same structure. A5 adds the curse **Hollow Oath**. Add **A11 "Wild Hunt"** (enemies with `sweep` attacks use them 1 turn earlier) to pressure Warbands.
- **Custom modifiers:** keep the 16 reference modifiers renamed, plus 2 new ones: **Lone Wolf** (Warband cap 1) and **Legion** (Warband cap 8; enemies +25% HP).
- **Unlock order:** Runeblade + Warlock at start → Runesmith → Ranger (see heroes.md).

---

## 6. Content pipeline
1. **Import:** `tools/import` parses the catalog markdown tables, the source of truth for design, into `packages/content/*.json`. It validates:
   - names are unique and don't collide with reference names (a check already run on this draft)
   - every keyword exists in glossary.md
   - rarity counts per hero are 4/18/28/18/2
   - unit quotas (§3.1) are met
2. **Effect primitives** (about 50): damage, block→`guard`, apply, draw, discard, consume, gainMana, makeCard, transform, upgrade, heal, loseHp, xTimes, conditional, plus Warband/hero ops:
   - Runeblade: `raise`, `addCorpse`, `chill`
   - Warlock: `summon(demon)`, `sacrifice`, `scorch`, `gainCinders`, `corruption`, `enterDemonForm`
   - Runesmith: `deploy(construct)`, `charge`, `discharge`, `recycle`, `arc`, `gainVolts`, `gainScrap`, `mechUp`, `calibrate`
   - Ranger: `tame`, `mark`, `snare`, `venom`, `addArrow`
   - Shared: `command(unit|all)`, `rally`, `fortify`, `mend`
3. **Handlers** for anything the primitives can't express: Powers, Runestones, Elder events, unit actions. One file per ID.
4. **Per-item tests** auto-skeletoned from the catalog numbers.

---

## 7. Hero-specific engine rules (summary; full detail in design/)
- **Runeblade:**
  - Chill reduces next-attack damage. 10 Chill → Frozen; elites and bosses need +10 more after each Freeze.
  - Heavy does ×3 to Frozen and Shatters it. A Shatter kill leaves a Frost Corpse.
  - Thrall stats: 40% HP / 50% hit, with Rot.
- **Warlock:**
  - Scorch ticks at the end of the bearer's turn, then halves.
  - Upkeep is paid at turn start from Cinders, front demon first; any shortfall hits the Warlock as unblockable damage.
  - Corruption 10 → Demon Form for 3 turns.
- **Runesmith:**
  - Overcharge at 3 Charge replaces the unit's action.
  - Overflowing the Warband recycles the oldest construct.
  - Hull = 12 + 4×Scrap. Destroying the mech gives Dazed (−1 Mana).
- **Ranger:**
  - Tame at ≤30% HP, or ≤50% if Snared, normal Tameable enemies only.
  - Companions keep their HP across fights; Bond at 3 and 6; permadeath; Vengeance +3 Might when one dies.

---

## 8. Hand-off to the generation model (heroes, levels, enemies)

### 8.1 Art direction: "a little more basic than StS, but not by much"
- **2D, hand-painted look simplified:** clean silhouettes, **thick dark outlines**, 2–3 tone cel shading, limited palette per act. No painterly texture noise.
- **Cutout animation** (rigged parts) or short sprite loops. 6–8 key poses per action is enough, with snappy squash/stretch.
- Readability first: every unit, enemy and intent must read at **96 px tall** on a 1280×720 screen.
- **Hero colour-coding:** Runeblade ice-blue/steel; Warlock oxblood/ember-orange; Runesmith copper/electric-yellow; Ranger moss-green/bark-brown. Units inherit their hero's accent colour for ally readability.

### 8.2 Hero and unit models
| Asset | Animations |
|---|---|
| Runeblade, Warlock, Runesmith, Ranger | `idle, attack, cast, hit, guard, die, victory, summon` (raise / summon / deploy / tame gesture) |
| Warlock **Demon Form** (separate model) | `transform_in, idle, attack, cast, hit, transform_out` |
| **Thunderhulk** mech | `drop_in, idle, slam, hit, eject, explode` + cockpit overlay |
| 6 Demons + 6 Arch-forms, 6 Constructs, Kestrel, Spirit Wolf, Ancestor Spirit, Wyvernling | `spawn, idle, act, hit, die` |
| 4 Wild Beasts | `charge` (a run across the screen) |

### 8.3 Enemies (bestiary designed by the generation model)
Required per act: about **14 normal encounters** (including 3 "weak" early ones), **3 elites**, **3 bosses**, plus an **alternate Act 1 biome** with its own set. Every enemy needs:
- HP (base / A8+), moves with damage (base / A9+), AI pattern (cycle / weighted / scripted), innate statuses
- **`targeting` on every attack** (hero / front / random_ally / sweep / weakest / ignore_defender). At least one `sweep` per boss.
- A **`corpse`** profile for the Runeblade, and a **`tame`** profile for the Ranger on about 50% of normal enemies: instinct move and bond perk.
- **Animations:** `idle, attack, cast, hit, die` + **`raised_idle`** (blue-grey palette swap OK) + **`tamed_idle`** (facing right, leaf collar) where applicable.
- Full schema: [design/warband-system.md §7](design/warband-system.md).

### 8.4 Levels (acts)
- **4 biomes:** Act 1 main, Act 1 alternate, Act 2, Act 3.
- Each biome needs:
  - Combat background (1920×1080, 2–3 parallax layers)
  - Map backdrop
  - Boss arena
  - Shop, Rest Site, Treasure and Event scenes
- 8 Elder Spirit portraits (idle + talk).
- Event roster about 15 per act. Events are new writing; the generation model's skills or a later writing pass can produce them using the reference event *structures* in [reference/sts2/catalog/events.md](reference/sts2/catalog/events.md).

### 8.5 UI and icons
- **Card art:** 288 hero/neutral cards + curses, statuses and tokens; art window 250×190, plus 5 frame sets (4 hero colours + neutral).
- **Icons:** 286 runestone icons (128²), 50 potion icons (96²).
- **Status icons:** about 45 (64²).
- **Intent icons:** attack with 6 damage tiers, plus the 6 targeting badges; ally intent variants.
- **Map node icons.**

The manifest is keyed by content ID, and missing assets fall back to placeholders.

---

## 9. Milestones
| Phase | Scope | Acceptance |
|---|---|---|
| 0. Bootstrap | Repo, tooling, CI, `tools/import` with validations | All catalogs import with 0 errors; quotas pass |
| 1. Combat core + Warband | Queue, hooks, piles, Mana, Guard, statuses, intents with `targeting`, Muster phase, generic units | Runeblade starter deck plays a full fight with Raise and Thralls vs. placeholder enemies; deterministic replay |
| 2. Run loop | Map, rooms, rewards, shop, Rest (Inscribe/Tend), Elder Spirit stubs, potions, save/load | Full placeholder run start to finish |
| 3. Heroes | All 4 hero systems and 280 cards, neutral/curse/status, Ultimates | Every card's test passes; bot sim of each hero's starter deck vs. Act 1 has no crashes |
| 4. Content | 286 runestones, 50 potions, units, Inscriptions/Hexes, Elder Spirits; integrate the generation model's bestiary and acts | Every item tested; 1,000-run sim per hero finishes with no soft-locks |
| 5. Assets & feel | Manifest integration, animation timeline, ally intents UI, targeting badges, Lodge panel, tooltips, audio hooks | Playtest checklist; 60 fps mid laptop; 1280×720 + mobile landscape |
| 6. Meta & balance | Ascension 1–11, modifiers, unlocks, run history, daily seed; balance pass against heroes.md §5 targets | Win-rate spread between heroes ≤ 8 points at A0 in bot + human tests |
| 7. Co-op (optional) | Lockstep multiplayer, shared Warband rules | 50 four-player runs with no desync |

## 10. Testing
- **Unit tests:** every card, runestone, potion and unit.
- **Interaction cases:**
  - Heavy vs. Frozen elite threshold
  - Hunger with 0 Cinders
  - Overcharge + Discharge in the same turn
  - Tame on the last enemy (combat ends; reward still granted)
  - Companion death mid-Muster
  - Mech Hull overflow
  - Demon Form ending mid-enemy-turn
- **Property tests:** map and economy odds against the reference constants.
- **Golden replays and bot sim** (§3.4).
- **Live check:** Claude verifies each phase in the in-app browser before any commit.

## 11. Risks and open items
| Risk / gap | Plan |
|---|---|
| Unit turns slow down combat | Muster animations ≤ 350 ms each; fast-forward toggle; units act in parallel when there are no cross-dependencies |
| Ranger power swings (early companion luck) | Kestrel guarantees a unit; tame thresholds tuned in Phase 6; Bond perks scale late |
| Warband trivialises bosses | `sweep` attacks required on bosses; Ascension 11 |
| Elder runestones and events still carry reference structure | New writing pass in Phase 4 (Elder Spirit dialogue, about 60 events) |
| Bestiary quality depends on the external model | §8.3 schema + import validator rejects enemies without `targeting` / `corpse` / `tame` |
| Balance numbers are first-pass | §3.2 budget + bot sim + Phase 6 targets |
