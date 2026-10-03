# Runelord glossary

**Campaign scope — 2026-10-03:** The [campaign direction](../design/campaign-direction.md) governs progression and supersedes inherited act/run assumptions here. Combat vocabulary remains the baseline. Card upgrades now span multiple levels; exact levels and recipes are pending. Spell combination and Warband fusion are distinct systems. Equipment means slotted gear with stats/passives; relics are a separate reward category. A Sovereign is a biome ruler; the Throne City is the final defense and hero-intervention site. These campaign concepts are planned, not claims about current engine support.

The single source of truth for rules text. Card text, tooltips and the engine must use these exact terms. The "Reference term" column maps each one back to the inspiration (StS2) research in `../reference/sts2/`.

## Core
| Term | Rule | Reference term |
|---|---|---|
| Mana | Spent to play cards. 3 per turn. | Energy |
| Guard | Prevents damage. Removed at the start of your turn. | Block |
| Might | +1 attack damage per stack (hero **and** unit attacks) | Strength |
| Finesse | +1 Guard from cards per stack | Dexterity |
| Fervor | Your next Attack deals +X damage | Vigor |
| Plating | At end of turn gain X Guard, then −1 | Plating |
| Thorns | When attacked, deal X back | Thorns |
| Regrowth | Heal X at end of turn, then −1 | Regen |
| Phased | Damage and HP loss reduced to 1 this turn | Intangible |
| Ward Rune | Negates the next debuff | Artifact |
| Exposed | Takes 50% more attack damage; −1 per turn | Vulnerable |
| Sapped | Deals 25% less attack damage; −1 per turn | Weak |
| Brittle | Gains 25% less Guard from cards; −1 per turn | Frail |
| Befuddled | Card costs randomize 0–3 when drawn | Confused |
| Stunned | Skips its next action | Stun |

## Card keywords
| Keyword | Rule | Reference term |
|---|---|---|
| Consume | Removed for the rest of combat (goes to the Ash pile) | Exhaust |
| Fleeting | Consumed if still in hand at end of turn | Ethereal |
| Opening | Starts each combat in your hand | Innate |
| Hold | Not discarded at end of turn | Retain |
| Bound | Can't be removed or transformed from your deck | Eternal |
| Unplayable | Can't be played | Unplayable |
| Unique | Only one copy can be in your deck (all Ultimates) | — (new) |
| Quickdraw | If discarded from your hand during your turn, it's played for free | Sly |
| Echo | Plays this card an additional time | Replay |
| Fatal | Triggers when this card kills a non-minion enemy | Fatal |
| Command | A unit performs its action now | — (new) |
| Inscribe / Inscription | Permanent card modifier (rest site: Inscribe = upgrade) | Smith / Enchantment |
| Hex | Temporary negative card modifier applied by enemies | Affliction |

## Hero mechanics
| Term | Hero | Rule |
|---|---|---|
| Chill X / Frozen | Runeblade | Chill: −1 to its next attack per stack. 10 Chill → Frozen: skips its next action; elites and bosses need +10 more each time |
| Heavy | Runeblade | Triple damage to Frozen enemies, and **Shatters** them (removes Frozen) |
| Corpse / Grave | Runeblade | Dead non-minion enemies leave Corpses in the Grave |
| Raise | Runeblade | Spend the newest Corpse to create a Thrall (Bone Thrall if the Grave is empty) |
| Rot | Runeblade | Thralls lose HP equal to Rot after their action, then Rot +1 |
| Rimeplate X | Runeblade | Runeblade-themed Plating |
| Scorch X | Warlock | Deals X at the end of the bearer's turn, then halves |
| Cinders 🔥 | Warlock | Summon fuel; carries over between turns; cap 20 |
| Upkeep N / Hunger | Warlock | Pay N Cinders per demon at turn start, or take the shortfall as damage |
| Pact X | Warlock | Lose X HP as part of the cost; gain X Corruption |
| Corruption / Demon Form | Warlock | At 10 Corruption, transform for 3 turns: +3 Might, Attacks Scorch, −3 HP per turn |
| Sacrifice | Warlock | Destroy one of your demons as a cost |
| Soul Shard | Warlock | Token: gain 2 Cinders, draw 1, Consume |
| Deploy | Runesmith | Put a specific construct into play |
| Charge / Overcharge / Discharge | Runesmith | 3 Charge → its Overcharge effect replaces its next action; Discharge = trigger it now |
| Arc X | Runesmith | X lightning damage to a random enemy |
| Static X | Runesmith | Takes +X damage from Arcs and construct actions; −1 per turn |
| Volts ⚡ | Runesmith | Second resource; carries over between turns; cap 10 |
| Scrap / Recycle | Runesmith | +2 Scrap whenever a construct is destroyed or Recycled |
| Mech Up N / Piloting / Calibrate | Runesmith | Pilot the Thunderhulk for N turns; Hull = 12 + 4×Scrap spent; Calibrate raises its Slam damage |
| Tame | Ranger | A Tameable normal enemy at ≤30% HP (≤50% if Snared) becomes a Companion |
| Companion / Bond / Lodge | Ranger | Persistent units; Bond levels at 3 and 6; permadeath |
| Snare X | Ranger | Raises the Tame threshold; −25% Guard gain; −1 per turn |
| Mark X | Ranger | +X damage from Arrows and companions; −1 per turn |
| Venom X | Ranger | Lose X HP at start of turn, then −1 |
| Arrow | Ranger | 0-cost token Attack: 4 damage, Consume |
| Vengeance | Ranger | +3 Might for the rest of combat when a companion dies |

## Unit keywords
See [warband-system.md §5](../design/warband-system.md): Defender, Elusive, Swift, Fragile, Persistent, Unbound, Rally, Fortify, Mend/Repair.

## Inscriptions (renamed enchantments)
| Inscription | Effect | Reference |
|---|---|---|
| Keen X | +X damage | Sharp |
| Steadfast X | Gain X Guard | Adroit |
| Primed | Played automatically at the start of each combat | Imbued |
| Encore | Echo once per combat | Glam |
| Twinned | Gains Echo 1 | Spiral |
| Quickened X | The first play each combat draws X cards | Swift |
| Savage | Attack damage doubled | Instinct |
| Building Fury X | Each play this combat, damage +X | Momentum |
| Royal Writ | Gains Opening and Hold | Royally Approved |
| Tzalla's Ember | Costs 0, +3 damage, gains Bound (Basic Attacks only) | Tezcatara's Ember |
| Ooze-Coated | Gains Consume; each play permanently adds +1 Guard | Goopy |
| Mirrored | Can be duplicated at Rest Sites | Clone |
| Seeded | The first play each combat gives 1 Mana | Sown |
| Bloodthirsty | +50% damage; lose 2 HP when played | Corrupted |
| Inkstained | +1 damage and 1 Sapped | Inky |
| Light-Footed X | Guard gained +X | Nimble |
| Well-Placed | Goes to the top of the Draw Pile instead of being shuffled in | Perfect Fit |
| Shifting | Cost randomizes 0–3 when drawn | Slither |
| Dormant | If held at end of turn, costs 1 less until played | Slumbering Essence |
| Enduring | Loses Consume | Soul's Power |
| Anchored | Gains Hold | Steady |
| Eager X | The first play deals X extra damage | Vigorous |

## Hexes (renamed afflictions)
Shackled (only 1 Shackled card per turn) · Tangled (+1 cost) · Galvanized (take X when played) · Withered (gains Fleeting) · Ringing (only 1 card this turn) · Smog (no more Skills this turn) · Tainted (gain X Tainted when played).
