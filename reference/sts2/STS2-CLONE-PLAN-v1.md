# Slay the Spire 2 Web Clone: Build Plan

**Status:** Draft for approval · **Date:** 2026-10-01 · **Reference build:** StS2 Early Access, v0.11x content (Major Update #1 and later patches)

This plan covers how to rebuild Slay the Spire 2's full rules and content as a browser game. The research is already done and lives in [`catalog/`](catalog/), which lists every card, relic, potion, power, enemy, encounter, event, act, modifier and unlock from the current game files. Raw JSON is in [`data/`](data/). This document covers architecture, rules, the content pipeline, the asset handoff to the art-generation model, and milestones.

---

## 0. Before building: decisions and constraints

| # | Decision | Recommended default | Why it matters |
|---|---|---|---|
| D1 | **IP and naming.** Card names, text, characters and lore belong to Mega Crit. The extracted dataset is licensed **PolyForm Noncommercial**. | Keep the project private and noncommercial. Build an **ID → display-name/text layer** so the whole game can be renamed or rethemed later without code changes. | A public or commercial release would need original names and text and its own numbers. The engine stays the same either way. |
| D2 | **Rendering style** for assets from the art model | 2D: layered sprites or spritesheets (optionally Spine-style skeletal JSON) rendered with **PixiJS**. StS2 itself is 2D. | Sets the asset contract in §6. Choosing 3D (glTF + three.js) would change the scene layer only. |
| D3 | **Co-op (1–4 players)** | Single-player first. Keep the engine multiplayer-ready (deterministic, action-based) and ship co-op in Phase 7. | About 40 cards and some relics are co-op only. Online play needs a server. |
| D4 | **Project location, repo name, stack** | Vite + TypeScript monorepo (`packages/engine`, `packages/content`, `apps/web`). Location to be chosen by you. | Your global rules require approval for locations, naming and new dependencies. |
| D5 | **Who implements** | Claude plans, delegates and verifies. Codex implements, following your global workflow. Start with `/bootstrap-project`. | Matches `~/.claude/CLAUDE.md`. |

---

## 1. What the research found

All counts come from the game-file extract ([spire-codex](https://github.com/ptrlrd/spire-codex)). Patch data was cross-checked against community wikis ([slaythespire.wiki.gg](https://slaythespire.wiki.gg/wiki/Slay_the_Spire_2:Cards_List), [slaythespire2.gg](https://slaythespire2.gg/)).

| Content | Count | Catalog file |
|---|---|---|
| Heroes | 5: Ironclad, Silent, Defect, Necrobinder (new), Regent (new) | [heroes.md](catalog/heroes.md) |
| Hero cards | 87–88 per hero: 3–4 Basic, 20 Common, 36 Uncommon, 26 Rare, 2 Ancient | `cards-<hero>.md` |
| Colorless cards | 64 (39 Uncommon, 25 Rare) | [cards-colorless.md](catalog/cards-colorless.md) |
| Event / Ancient cards | 27 | [cards-event.md](catalog/cards-event.md) |
| Curses / Statuses / Tokens / Quests | 18 / 12 / 14 / 3 | `cards-curse.md`, `cards-status.md`, `cards-token.md`, `cards-quest.md` |
| **Cards total** | **577** | |
| Relics | 296: 100 Ancient, 35 Event, 25 Shop, 25/30/35 Common/Uncommon/Rare shared, plus 7 per hero | [relics.md](catalog/relics.md), [ancients.md](catalog/ancients.md) |
| Potions | 63: 45 shared, 3 per hero, 2 event, 1 token | [potions.md](catalog/potions.md) |
| Powers (buffs/debuffs) | 257 (205 buff, 52 debuff) | [powers.md](catalog/powers.md) |
| Enemies | 115 monsters (82 normal, 18 elite, 15 boss) in 87 encounters | [enemies.md](catalog/enemies.md), [acts-and-encounters.md](catalog/acts-and-encounters.md) |
| Acts ("maps") | 4 biomes: Overgrowth **or** Underdocks (Act 1), Hive (Act 2), Glory (Act 3). Each has 3 possible bosses and 3 elites. | [acts-and-encounters.md](catalog/acts-and-encounters.md) |
| Events | 66, including Ancients and shared events | [events.md](catalog/events.md) |
| Ancients | 8: Neow, Darv, Orobas, Pael, Tezcatara, Nonupeipe, Tanx, Vakuu | [ancients.md](catalog/ancients.md) |
| Card modifiers | 7 keywords, 7 Afflictions, 22 Enchantments | [rules-glossary.md](catalog/rules-glossary.md) |
| Orbs / Intents | 5 orbs / 14 intents | [rules-glossary.md](catalog/rules-glossary.md) |
| Ascension | A0–A10 | [modes-and-progression.md](catalog/modes-and-progression.md) |
| Custom-run modifiers | 16 | [modes-and-progression.md](catalog/modes-and-progression.md) |
| Timeline epochs (unlocks) | 57 | [modes-and-progression.md](catalog/modes-and-progression.md) |
| Achievements | 22 | [modes-and-progression.md](catalog/modes-and-progression.md) |
| Economy and RNG constants | rarity odds, pity, gold, shop prices, potion odds, "?" room odds | [constants.md](catalog/constants.md), [data/mechanics_notes/](data/mechanics_notes/) |

**Known gaps in the data. These need hand authoring or verification in-game:**
1. **Enemy AI:** 76 monsters use simple cycles that the data fully describes. 14 use *conditional* AI, 19 use *random weighted* AI, 2 are *mixed*, and 4 have no pattern. For those 39, move order, weights and "can't repeat" rules must be written by hand. Use wiki pages or gameplay footage for each.
2. **Event scripts:** options and outcome text exist, but multi-page branching, random outcomes and minigames (Crystal Sphere's 11×11 dig grid, Wongo's loyalty points across runs) need scripting.
3. **Card behaviour:** text and numbers are complete. Engine semantics (how "Fatal", "Sly" and "Replay" interact, for example) are defined in §3 and must be checked against the game.
4. **Patch drift:** this is an Early Access game and values change between patches. Pin the dataset version in `content/VERSION` and re-import with a diff report when updating.

---

## 2. Architecture

```
apps/web            React shell (menus, map, shop, events, deck views), PixiJS combat scene
packages/engine     Pure TS. Deterministic rules engine, no DOM. Runs in browser, Node tests, later a server.
packages/content    Generated + hand-written content: JSON defs + TS behaviour hooks
packages/assets     Asset manifest + loaders (filled by the art-generation model)
tools/import        spire-codex JSON → content defs (+ diff report on re-import)
tools/sim           Headless bot runner for regression and balance smoke tests
```

**Engine principles**
- **Deterministic and seeded.** Use separate RNG streams like StS: `map`, `cardReward`, `relic`, `potion`, `shuffle`, `combatAI`, `event`, `shop`, `misc`. Each stream is seeded from the run seed. Then a run is fully determined by its seed and the player's input log. That gives replays, daily runs, bug reports and later co-op lockstep.
- **Action queue.** Every effect becomes an `Action` pushed onto a queue: DealDamage, GainBlock, ApplyPower, Draw, Discard, Exhaust, Channel, Evoke, Summon, Forge, GainStars, MakeCard and so on. The queue resolves one action at a time. Triggers can push to the *front* (immediate) or the *back*. The UI animates each resolved action from the event log, so the engine never waits on animations.
- **Hook bus.** Relics, powers, enchantments, afflictions, orbs and card-in-hand effects subscribe to typed hooks: `onCombatStart, onTurnStart(pre/post draw), onCardDrawn, onBeforeCardPlayed, onCardPlayed, onAttackDamageCalc(modify), onDamageTaken, onBlockGained, onPowerApplied, onExhaust, onDiscard, onShuffle, onEnemyDeath (Fatal), onTurnEnd, onCombatEnd, onRoomEnter, onRewardGenerated, onShopGenerated, onRest`... Priority ordering mirrors the game: relics in pickup order, then powers in application order.
- **Pure state.** `RunState` and `CombatState` are serialisable. Saves go to IndexedDB, plus a localStorage pointer, with an autosave at each room transition and after each combat action batch.

---

## 3. Combat rules spec (engine must match)

**Turn structure**
1. Start of player turn: clear Block (unless Barricade/Calipers-type effects apply). Trigger start-of-turn powers (Poison ticks on the poisoned creature's own turn start). Set Energy to 3 plus modifiers. Draw 5, or 7 on turn 1 with Ring of the Snake. Innate cards go to the top of the draw pile on turn 1.
2. Player phase: play cards, use potions (3 slots, 2 on A4+), click End Turn.
3. End of turn: trigger end-of-turn effects (orb passives, Plating, Ritual and so on). Exhaust Ethereal cards. Discard the hand except Retain cards. Decrement counters such as Vulnerable, Weak and Frail.
4. Enemy phase: enemies act left to right using their shown intent, then roll the next intent. Doom check: at the end of the enemy turn, a creature with Doom ≥ HP dies.
- Hand limit is 10, and cards drawn past it are discarded. When the draw pile is empty, shuffle the discard pile into it.

**Damage pipeline (per hit)**: `base + Strength (+ Vigor, enchantment flat bonuses)` → ×0.75 if attacker Weak → ×1.5 if target Vulnerable → other multipliers (Instinct ×2, Corrupted ×1.5, Tainted) → floor → Intangible caps at 1 → subtract Block → HP loss → Buffer/death checks. Multi-hit attacks run the full pipeline on every hit.
**Block pipeline**: `base + Dexterity (+ Nimble)` → ×0.75 if Frail.
Weak, Vulnerable and Frail use **fixed multipliers**. Their stack count is a duration only.

**Card keywords**: Exhaust, Ethereal, Innate, Retain, Unplayable, **Eternal** (cannot be removed or transformed), **Sly** (if discarded from hand before end of turn, it is played for free).
**Card-text mechanics**: Replay, Fatal (triggers when the card kills a non-minion enemy), Transform, Stun, Upgrade, X-cost.
**Afflictions** (temporary, applied by enemies to your cards): Bound, Entangled, Galvanized, Hexed, Ringing, Smog, Tainted.
**Enchantments** (permanent, on deck cards, stack with upgrades): 22 kinds, including Sharp X, Adroit X, Imbued (auto-played at combat start), Glam, Spiral, Swift, Instinct, Royally Approved and Tezcatara's Ember. See [rules-glossary.md](catalog/rules-glossary.md).

**Hero systems**
| Hero | System | Engine needs |
|---|---|---|
| Ironclad | Strength, Exhaust, self-damage payoffs; Burning Blood heals 6 after combat | HP-loss events separate from damage events |
| Silent | Poison, Shivs, discard engine with **Sly** | Discard-from-hand hook that auto-plays Sly cards for free |
| Defect | Orbs: Lightning, Frost, Dark, Plasma, **Glass** (new, decays). 3 slots, max 10. Focus. | Orb slot array; Channel evokes the oldest orb when full; Plasma ignores Focus |
| Necrobinder | **Osty**, an ally creature with its own HP that absorbs incoming hits before the player. Summon X raises his Max HP. He re-summons at 1 HP next turn after dying. Cards make "Osty deals X". Plus **Doom** (execute) and **Souls** (0-cost Exhaust "draw 2" tokens), with many Ethereal cards. | Ally creature slot; damage redirection; Osty as damage *source*; Doom check at end of enemy turn |
| Regent | **Stars (★)**, a second resource shown on cards as a star cost, gained from Divine Right (+3★ at combat start), Venerate and so on. **Forge X** adds Sovereign Blade (Retain, 10 damage) to hand the first time each combat and raises its damage permanently for that combat. **Minion** tokens. | Second resource and cost type; X-star cost; card-instance damage modifiers |

**Enemy model**: `{id, hp range (base/A8), moves[{intent, damage(base/A9), hits, block, powers}], ai: cycle|random-weighted|conditional script, innate powers}`. Intents shown: Attack (with damage after modifiers), Buff, Debuff, Strong Debuff, Card Debuff (Affliction), Defend, Status, Summon, Heal, Escape, Sleep, Stun, Death Blow, Unknown.

---

## 4. Run structure spec

**Run flow**: choose hero, ascension and modifiers → Act 1 (Overgrowth or Underdocks, 50/50 once Underdocks is unlocked) → Act 2 Hive → Act 3 Glory → the Architect (a story scene with no real fight; 9,999 HP and no moves).

**Map generation** (per act)
- 7-column grid. Choosable rooms: 15 in Act 1, 14 in Act 2, 13 in Act 3. Floors = rooms + Ancient node (start) + Boss node (end).
- Paths: about 6 seeded walks upward from the bottom row, moving to adjacent columns, with no crossing edges. Merge identical nodes. This is the classic StS algorithm.
- Room assignment: first row is always fights. The row 7 from the end is always Treasure. The last row is always a Rest Site. No Elites or Rest Sites in the first 5 rows.
- Room counts: 5 Elites (8 on A1+), 3 Shops, Unknown (?) rooms (10–14 in Act 1, 9–13 later, Gaussian), Rest Sites (6–7 in Acts 1–2, 5–6 in Act 3). Fights fill the rest. Weak (easy) encounter pool for the first 3 fights in Act 1 and the first 2 in later acts.
- Sibling and consecutive constraints as in StS: a node's children have different types; no Elite→Elite, Rest→Rest or Shop→Shop along a path.

**Unknown rooms**: a single roll walks the cumulative odds for Monster (10% base, +10% per miss), Elite (never, unless a modifier enables it), Treasure (2%, +2%) and Shop (3%, +3%). Anything else is an Event. The rolled outcome resets to base. All odds reset at each act.

**Ancient node** (start of each act): Neow offers 2 positive relics and 1 curse relic, and heals to full (80% on A2+). Acts 2 and 3 roll one of three Ancients, each with its own relic pools and conditions ([ancients.md](catalog/ancients.md)). Ancients **replace boss relics**: bosses drop no relic.

**Rewards**
- Gold: normal fights 10–20, elites 35–45, bosses 100, treasure rooms 42–52. All ×0.75 on A3+.
- Cards: 3 choices. Rarity is rolled from banded odds with a rare pity offset (start −5%, +1% per non-rare roll, cap +40%, reset on a rare). Boss rewards are always Rare. Upgrade chance is 0%/25%/50% by act, halved on A7+.
- Potions: pity starts at 40%, −10% when a potion drops and +10% when it doesn't. Elites add +12.5% to the roll. Rarity 65/25/10.
- Relics: elites and treasure rooms give 1 relic (Common 50%, Uncommon 33%, Rare 17%, falling back to the next rarity up when a pool is empty).

**Shop**: 5 hero cards (2 Attack, 2 Skill, 1 Power; one on sale at half price), 2 colorless (Uncommon and Rare, 1.15× markup), 3 relics (2 random + 1 Shop relic), 3 potions, and card removal (75 + 25n gold, or 100 + 50n on A6+). Prices vary by ±5% for cards and potions and ±15% for relics. Five gold-generating relics never appear in shops. There is a Fake Merchant variant (Foul Potion reveals it and starts a boss fight).

**Rest Site**: Rest (heal 30%) and Smith (upgrade a card). Relic- or card-gated options: Dig, Lift, Cook, Clone, Hatch, Kindle. Mend (heal an ally) is co-op only.

**Events**: 66 scripted events, filtered by act and preconditions. Quest cards: Byrdonis Egg (hatches into a pet), Lantern Key (special event next act), Spoils Map (600-gold site next act).

**Score**: rooms × 10 × act number, plus gold/100, plus 50 per elite and 100 per boss, all × (1 + 0.1 × ascension). The daily score is a packed integer: victory → floors → badges → time.

---

## 5. Content pipeline (how to implement 577 cards without 577 bugs)

1. **Import** (`tools/import`): convert spire-codex JSON into typed `CardDef / RelicDef / PotionDef / PowerDef / MonsterDef / EncounterDef / EventDef / ActDef`. Numbers (damage, block, hits, vars, upgrade deltas) and text templates come straight from the data. Never retype them by hand.
2. **Effect DSL**: about 70% of cards can be declared from roughly 40 primitives. Examples: `damage(n, target, hits)`, `block(n)`, `apply(power, n, target)`, `draw(n)`, `gainEnergy(n)`, `gainStars(n)`, `channel(orb)`, `evoke(n)`, `summon(n)`, `forge(n)`, `ostyAttack(n)`, `makeCard(id, pile, upgraded)`, `exhaust(selector)`, `discard(selector)`, `transform(selector)`, `upgrade(selector)`, `loseHp(n)`, `heal(n)`, `ifCondition(...)`, `xTimes(...)`, `forEach(enemy)`.
3. **Scripted handlers**: the remaining cards, plus every relic, power, event, Ancient and conditional-AI enemy, get a small TS handler that registers on the hook bus. Each lives in its own file named by ID, so Codex can work in parallel batches.
4. **Per-item tests**: each card, relic and potion gets a test that sets up a combat, plays or triggers the item, and asserts the state change. Generate a test skeleton per item from the data, with the expected numbers taken from the item's text.
5. **Text rendering**: one renderer for card text templates (`description_raw` with `{Var:diff()}`-style placeholders). Live values (Strength-adjusted damage, upgrade previews) are coloured green or red as in the game.
6. **Batches for delegation** (each is one Codex task brief with acceptance tests): Basic and starter set (all heroes) → Ironclad → Silent → Defect → Necrobinder → Regent → Colorless → Curses/Statuses/Tokens → Common/Uncommon/Rare relics → Shop/Event relics → Ancient relics → Potions → Act 1 enemies (both biomes) → Act 2 → Act 3 → Events by act.

---

## 6. Asset handoff contract (for the art-generation model)

The art model produces assets. The game loads them only by **ID** through `packages/assets/manifest.json`. Missing assets fall back to placeholders so the game always runs.

| Asset set | Count | Per-asset requirements |
|---|---|---|
| Hero combat models | 5 heroes + Osty (ally) + Regent's minions | States: `idle, attack, cast, hit, block, die, victory`. Anchor point, facing right, height normalised to 1 unit. Necrobinder needs Osty separately (`summon, idle, attack, hit, die`). |
| Hero select / portrait | 5 | Full-body select art, map icon, run-history portrait |
| Enemies | 115 | `idle, attack, buff/cast, hit, die` (+ `summon`/`escape`/`sleep`/`stun` where the enemy's moves use them). Size class S/M/L/Boss. Hit-box and intent-anchor offsets. |
| Act backgrounds ("levels") | 4 acts × (combat bg, map parchment/bg, boss arena) + Rest, Shop, Treasure, Event, Ancient scenes | 16:9 at 1920×1080, with a parallax layer split if possible |
| Ancients / NPCs | 8 Ancients, Merchant, Fake Merchant, The Architect | Idle loop plus a talk pose |
| Card art | 577 | 250×190 art window, plus frames per type (Attack/Skill/Power/Curse/Status/Quest) × rarity × hero colour |
| Relics / Potions / Powers / Intents / Orbs / Map nodes | 296 / 63 / 257 / 14 / 5 / 9 | Icons with transparent background. Relic 128², potion 96², power 64², intent 64² (attack intent has 6 damage tiers), orb 96² with idle loop |
| VFX | about 30 | slash, blunt, poison, block-gain, orb channel/evoke ×5, Doom, star gain, forge, summon, potion splash, heal, debuff, buff |

Asset IDs match the content IDs exactly (`IRONCLAD`, `AXE_RUBY_RAIDER`, `card/BASH`, `relic/AKABEKO`).

---

## 7. Milestones

Each phase ends with passing tests **and** a live local-server check, per your rules.

| Phase | Scope | Acceptance |
|---|---|---|
| **0. Bootstrap** | Repo, monorepo tooling, import tool, content version pin, CI (typecheck, lint, test) | `tools/import` produces typed defs for all 577/296/63/257/115/87/66 items. Re-running it yields no diff. |
| **1. Combat core** | Engine queue, hooks, piles, energy, damage/block pipeline, powers framework, intents, seeded RNG. Ironclad starter deck vs. Act 1 weak encounters. Placeholder art. | Ironclad can win and lose a fight in the browser. Replaying a seed plus its input log gives identical state. |
| **2. Run loop** | Map generation, all room types, rewards, shop, rest, Neow, potions, save/load, death and victory screens | A full run plays start to finish with placeholder content. Map-generation property tests (constraints hold for 10k seeds). |
| **3. All heroes** | Silent (Sly, Shivs, Poison), Defect (orbs), Necrobinder (Osty, Doom, Souls), Regent (Stars, Forge, minions). All 5 card pools plus colorless, curses, statuses and tokens. Afflictions and enchantments. | Every card has a passing test. Each hero's starter deck beats the Act 1 weak pool with the bot sim. |
| **4. All content** | All relics, potions, Ancients, 115 enemies with AI, 66 events, both Act 1 biomes, Acts 2–3, bosses, the Architect | Every item has a passing test. A bot sim of 1,000 seeded runs per hero has no crashes or soft-locks. |
| **5. Assets and feel** | Integrate the art model's assets via the manifest. Animation timeline from the engine event log. Audio hooks. Card hover, targeting and drag-to-play. Tooltips for keywords and powers. | Playtest checklist. 60 fps on a mid laptop. Usable at 1280×720 and on mobile landscape. |
| **6. Meta** | Ascension 1–10, the 16 custom modifiers, Timeline/Epoch unlocks, achievements, run history, seeded and daily runs with score | Unlock flow from a fresh profile matches the game's order (Ironclad/Silent → Regent → Necrobinder → Defect, Underdocks unlocked by the score-based "Underdocks" epoch, and the first run after that unlock is forced into Underdocks). |
| **7. Co-op (optional)** | 2–4 players: lockstep via the deterministic engine over WebSocket/WebRTC, shared map votes, per-player rewards, co-op-only cards, relics and Mend | 4-player run completes with no desync over 50 runs |

---

## 8. Testing and verification
- **Unit**: per-item generated tests, plus pipeline edge cases (Intangible + Buffer, Vulnerable on multi-hit, Sly discard during end of turn, orb overflow, Osty redirect at 0 HP, Doom versus Regen order).
- **Property**: map constraints, shop composition, reward odds within tolerance over 100k rolls against [constants.md](catalog/constants.md).
- **Golden replays**: recorded seeds plus inputs, snapshot-compared after every change.
- **Bot sim** (`tools/sim`): greedy and random policies to find crashes, infinite loops (cap actions per turn) and soft-locks.
- **Runtime**: Claude checks every phase in the in-app browser against a live dev server before any commit.

## 9. Risks
| Risk | Mitigation |
|---|---|
| IP and licensing exposure | D1: private and noncommercial; renameable text layer |
| Hidden interactions (trigger order) differ from the real game | Document trigger order in `engine/ORDER.md`. When unsure, check the wiki or gameplay footage, then add a regression test. |
| 39 enemies with non-trivial AI and 66 events need hand-written logic | Do them in their own batches with wiki and footage citations in each file header |
| Early Access patches change numbers | Re-import with a diff report; content version pinned in saves |
| Scope (around 1,400 content items) | Strict phase gates; placeholders allowed until Phase 5 |

## Sources
- Game-data extract: [ptrlrd/spire-codex](https://github.com/ptrlrd/spire-codex) (`data/eng/*.json`, `data/mechanics_pages/*.md`). Full copies are in [`data/`](data/) with [NOTICE](data/NOTICE.md).
- [Slay the Spire Wiki: StS2 Cards List](https://slaythespire.wiki.gg/wiki/Slay_the_Spire_2:Cards_List), [Relics List](https://slaythespire.wiki.gg/wiki/Slay_the_Spire_2:Relics_List)
- [slaythespire2.gg](https://slaythespire2.gg/), [sts2.untapped.gg](https://sts2.untapped.gg/en/cards), [Wikipedia: Slay the Spire II](https://en.wikipedia.org/wiki/Slay_the_Spire_II)
- Osty mechanics: [DualShockers Necrobinder guide](https://www.dualshockers.com/slay-the-spire-2-how-to-play-necrobinder/), [Sportskeeda](https://www.sportskeeda.com/esports/the-necrobinder-slay-spire-2-how-play-best-cards-abilities)
