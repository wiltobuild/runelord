# Units catalog

Stat blocks for every allied unit. Rules: [warband-system.md](../design/warband-system.md). "Power" is the base damage of the unit's attack action. All units also need art from the asset model (see PLAN §6).

## Runeblade: Thralls
Thralls are derived from the Corpse of a fallen enemy unless listed here.
| Unit | HP | Power | Traits | Action | Source |
|---|---|---|---|---|---|
| Thrall (derived) | 40% of enemy max HP (6–40) | 50% of enemy's strongest hit (3–12) | Rot | Attack Focus Target | Raise on an enemy Corpse |
| Elite Thrall (derived) | ×1.5 | ×1.5 | Rot, Defender | Attack | Raise on an Elite Corpse |
| Frost Thrall (derived) | ×1.5 HP | ×1.5 | Rot | Attack + 1 Chill | Corpse from a Shatter kill |
| Fallen Soldier Thrall | 10 | 4 | Rot | Attack | Fallen Soldier Corpse (cards, starter rune) |
| Bone Thrall | 6 | 3 | Rot | Attack | Raise with an empty Grave |
| Risen Legionnaire | 14 (upg 20) | 6 (upg 8) | Defender, no Rot this combat | Attack | *Army of the Dead* |
| Rimebound Champion | 30 (upg 40) | 8 (upg 10) | Defender, Unbound | Attack + 1 Chill | *Rimebound Champion* |

**Rot:** starts at 1. At the end of each Muster phase, the Thrall loses HP equal to Rot, then Rot +1. Art: each enemy needs a `raised_idle` variant (blue-grey tint, ice in wounds, glowing blue eyes). It can be a shader/palette swap of the base model.

## Warlock: Demons
| Demon | HP | Power | Upkeep | Traits | Action |
|---|---|---|---|---|---|
| Imp | 6 | 4 | 0 | Swift | Firebolt: Power damage + 1 Scorch |
| Hellhound | 14 | 6 | 1 | Pack: +2 Power per other Hellhound | Bite |
| Gloomstalker | 10 | — | 1 | Elusive | Alternates: 2 Sapped / 2 Exposed on the Focus Target |
| Soul Leech | 8 | 4 | 1 | — | Drain: deal Power, heal the Warlock that much |
| Pyre Warden | 12 | — | 1 | — | Warlock gains 4 Guard; 1 Scorch to ALL enemies |
| Pit Brute | 26 | 10 | 2 | Defender | Slam |

**Arch-forms** (from *Greater Summoning*; all **Unbound**, no Upkeep):
| Arch-form | Base | HP | Power | Action |
|---|---|---|---|---|
| Ignivar, the Archimp | Imp | 24 | 6 | Swift. Firestorm: 3 hits of 6 damage, each applying 3 Scorch, at random enemies |
| Cerberax, the Three-Jawed | Hellhound | 45 | 9 | Bites 3 times; +2 Power whenever it kills |
| Nightmaw | Gloomstalker | 30 | 8 | Elusive. Apply 3 Sapped + 3 Exposed to ALL enemies, then attack |
| The Hollow Saint | Soul Leech | 36 | 10 | Drain from ALL enemies; heal the Warlock the total |
| Pyre Colossus | Pyre Warden | 50 | — | Warlock and all demons gain 10 Guard; 5 Scorch to ALL enemies |
| Gorthak, the Pit Lord | Pit Brute | 90 | 20 | Defender. Cataclysm Slam: 20 damage to ALL enemies |

## Runesmith: Constructs & mech
| Construct | HP | Traits | Action | Overcharge (3 Charge) |
|---|---|---|---|---|
| Spark Turret | 6 | — | Arc 3 | Arc 9 |
| Bulwark Bot | 10 | Defender | Runesmith gains 3 Guard | ALL allies gain 8 Guard |
| Rivet Mortar | 8 | — | 5 damage to the highest-HP enemy | 12 damage to ALL enemies |
| Mender Drone | 5 | Elusive | Repair the most damaged construct or the Thunderhulk 3 | Repair ALL 5; each construct +1 Charge |
| Tesla Pylon | 12 | — | Adjacent constructs gain 1 Charge | Chain lightning: 6 damage, jumps 3 times |
| Clockwork Sapper | 4 | Fragile | Apply 2 Exposed to the Focus Target | Explodes: 15 damage to the target; destroyed (+2 Scrap) |

**The Thunderhulk** (vehicle, no slot): Hull 12 + 4×Scrap spent (+ bonuses). *Piloting:* the hero's Attacks +3; at the end of turn it Slams the Focus Target for 10 + Calibration. Destroyed = eject + Dazed (−1 Mana next turn). Art set: `drop_in, idle, slam, hit, eject, explode` plus a cockpit overlay showing the hero.

## Ranger: Companions
| Unit | HP | Power | Traits | Action | Source |
|---|---|---|---|---|---|
| Companion (derived) | 60% of the enemy's max HP (keeps current HP when tamed) | 70% of its instinct move | Persistent, Bond 0 | Instinct move | Tame |
| Kestrel | 9 | 3 | Persistent, Elusive | Peck: 3 damage + 1 Mark | Starting companion |
| Spirit Wolf | 8 | 5 | Vanishes at end of combat | Attack | *Ancestral Spirits* |
| Wild Beast: Stag | — | 7 | One-shot charge | 7 damage + 1 Snare | *Call of the Stampede* |
| Wild Beast: Boar | — | 7 | One-shot charge | 7 damage + 1 Snare | *Call of the Stampede* |
| Wild Beast: Elk | — | 7 | One-shot charge | 7 damage + 1 Snare | *Call of the Stampede* |
| Wild Beast: Bear | — | 7 | One-shot charge | 7 damage + 1 Snare | *Call of the Stampede* |

**Bond:** +1 per combat survived. At Bond 3: +30% HP and Power. At Bond 6: the species' bond perk. **Permadeath:** 0 HP = removed from the run. Art: each tameable enemy needs a `tamed_idle` variant facing right with a leaf collar or band. Each Wild Beast needs only a `charge` animation (run across the screen).

## Universal
| Unit | HP | Power | Traits | Action | Source |
|---|---|---|---|---|---|
| Ancestor Spirit | 10 | 5 | Vanishes at end of combat | Attack | Potion: *Bottled Ancestors* |
| Wyvernling | ∞ (untargetable) | 2 | Pet, no slot | Peck the Focus Target | Hatched *Wyvern Egg* |
