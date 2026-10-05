# Roguelike summon progression

Implemented direction: 2026-10-04. Applies to new roguelike runs; historical fixed demos retain their rules. Authoritative stats and actions are in `packages/engine/index.ts`, card definitions in `packages/content`, and independent contract coverage in `packages/engine/summons.test.ts`.

## Starters and acquisition

All three starters remain ten cards. Master of Demons replaces Firebolt with Summon Pit Brute and Ward of Ash with Empower Demon. Hellfire Adept replaces Ward of Ash with Summon Ignivar. Blood Covenant replaces one Ward of Ash with Summon Nightmaw.

All six lesser summon cards are eligible for infernal rewards and shops. Empower is available early only to Master of Demons; it can transform any lesser species the player acquires. The starter does not automatically contain all six species. Defeating the Infernal Sovereign offers an Archdemon choice before normal loot and the forest transition. Direct Arch summon cards enter ordinary rewards and shops in the forest. Greater Summoning remains an archived catalog design and is not in the playable pool.

## Base demons

| Demon | HP | Action | Upkeep |
|---|---:|---|---:|
| Imp | 6 | 4 fire damage and 1 Scorch; also acts on arrival | 0 |
| Hellhound | 14 | 6 damage, +2 per other living Hellhound/Cerberax | 1 |
| Pit Brute | 26 | 7 damage to every enemy; Defender | 2 |
| Gloomstalker | 10 | Alternates 2 Sapped / 2 Exposed on the focus target; Elusive | 1 |
| Soul Leech | 8 | 4 drain damage; heal caster for HP damage dealt | 1 |
| Pyre Warden | 12 | 1 Scorch to every enemy; grants caster 6 Guard on arrival and each turn | 1 |

Elusive demons are skipped by front/weakest/random targeting when a non-Elusive demon is available; sweeps still hit them. Warden Guard resolves after the turn reset; Command repeats its Scorch action, not its recurring Guard benefit.

## Archdemons

All direct Arch cards cost 3 Mana, have no upkeep, and permit only one living copy of their named form. Costs, stats, and the +2 Gorthak aura are initial tuning values; rule correctness does not establish final balance.

| Form | Base | HP | Action and passive |
|---|---|---:|---|
| Ignivar | Imp | 18 | 6 fire damage +1 Scorch. Direct fire hits from caster and fire-attacking demons apply +4 Scorch per hit. Generates an Imp each turn. |
| Cerberax | Hellhound | 28 | 8 damage plus ordinary pack bonus. Counts as a Hellhound. Generates a Hellhound each turn. Incoming damage to a pack member is shared among the living pack before individual Guard. |
| Nightmaw | Gloomstalker | 18 | Applies 2 Sapped and 2 Exposed. Elusive. Grants 1 Mana and draws 1 card on arrival and each turn. |
| Gorthak | Pit Brute | 40 | 9 damage to all enemies, Defender. All damaging minion actions gain +2 damage. New lesser summons become Pit Brutes. |
| Hollow Saint | Soul Leech | 20 | Drains 6 damage from each enemy; heals caster for total HP damage dealt. |
| Pyre Colossus | Pyre Warden | 24 | Applies 2 Scorch to all enemies. Grants 6 Guard on arrival and each turn; doubles all caster Guard gains, including its own. Allied demon deaths have a seeded 50% chance to summon a Pyre Warden. |

The new Gorthak passive replaces the proposed universal taunt. Ordinary Defender remains. Scorch damage never retriggers Ignivar. No multiplier applies to Scorch stacks merely because Scorch itself deals damage.

## Transformations and interactions

Empower Demon costs 2 Mana +2 Cinders. It transforms a chosen lesser demon in place, preserving its identity/slot, Guard, Power bonuses and remaining HP proportion. It triggers neither a death nor a new Swift attack. Arrival resource/support passives activate on transformation. Already-Arch targets and duplicate living Arch-forms are rejected before costs are spent.

Generators begin on the following turn, after existing units pay upkeep. Generated units cost no Mana or summon Cinders but retain ordinary upkeep. At capacity, generation skips without dismissing anything. Gorthak converts generated lesser units as well as card summons; directly summoned Archdemons remain unchanged. Thus Ignivar/Cerberax/Pyre rebirth can generate Pit Brutes while Gorthak lives.

Shared pack damage conserves incoming integer damage before Guard, distributing remainder points to the original target first. Sharing does not recurse. Sweeps still generate their normal hits; the aura stops applying to subsequent hits after Cerberax dies. Pyre rebirth triggers on actual deaths including sacrifice; dismissal preserves legacy Corruption/Resilience behavior but does not trigger rebirth.

## Assets, presentation and saves

All twelve forms use existing authored animation sources. The original three current animation implementations are retained. Nine additional sets have exact source/export provenance; their limited pose animation and pending gallery review remain recorded rather than relabeled approved. Seven new cards and revised Brute/Warden cards use the existing frame and illustrations. No new creature identities were generated.

Empower has a visible transformation effect; support, drain, cleave and shared-hit events have matching presentation. Soul Leeches, Nightmaw and Hollow Saint use the upper formation row to keep full boards readable. Ignivar uses the ground row, matching its grounded model. Actor preloading is scoped to the current combat/event sequence. Development-only `/summon-review` fixtures never overwrite player saves and are unavailable in production builds.

Save schema 8 records a summon-rule activation boundary. Older roguelike saves replay their original starters, acquisition pools and pre-change summon behavior before activating new rules for subsequent actions. Existing decks are not silently replaced on resume; new starters apply to new runs.
