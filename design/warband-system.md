# The Warband: Runelord's Allied-Unit System

**Campaign update — 2026-10-03:** Read the [campaign direction](campaign-direction.md) for elite-unit fusion, tower forces, Throne City support, and invasion attrition. The rules below describe the existing hero-combat design baseline; they do not yet specify fusion or autonomous defenses. Do not infer permanent ownership of every summon from campaign progression. Card/unit fusion inputs, defender lifetimes, and defense-specific caps remain open. Attackers killed in an invasion stay dead across its defensive encounters; this does not automatically impose the same persistence rules on defending summons.

Runelord's main difference from its inspiration: **the hero never fights alone.** Every hero adds allied units to a **Warband** that stands between them and the enemies. All four heroes share one Warband framework. They differ in **how they get units**, **how those units stay alive**, and **what happens when units fall**.

| Hero | Unit family | How units are obtained | How long they last | When one dies |
|---|---|---|---|---|
| Runeblade | **Thralls** (raised undead) | Kill enemies; their **Corpses** go to the Grave, and **Raise** cards spend Corpses | One combat. They **Rot** and decay each turn. | Nothing lost; dead Thralls do not leave Corpses |
| Warlock | **Demons** (summoned) | **Summon** cards that cost Mana and usually **Cinders** | One combat. Each has an **Upkeep** cost every turn. | +2 **Corruption** (pushes toward Demon Form) |
| Runesmith | **Constructs** + the **Thunderhulk** mech | **Deploy** cards, one card per construct type; **Mech Up** cards for the mech | One combat. Constructs don't decay; the mech lasts N turns. | +2 **Scrap**, which feeds the mech |
| Ranger | **Companions** (tamed beasts) | **Tame** weakened normal enemies | **The whole run.** HP carries over between fights. | **Gone for good.** The Ranger gains **Vengeance**. |

---

## 1. Board layout

```
[Hero]  [Unit 1][Unit 2][Unit 3][Unit 4][Unit 5]   ⟶   [Enemy A][Enemy B][Enemy C]
          ^ front of the warband is the slot nearest the enemies (Unit 5 here, rendered rightmost)
```
- **Warband cap: 5 units.** Upgrades and runes can raise it. The Thunderhulk is a vehicle the hero pilots, not a unit, so it uses no slot.
- If a new unit would exceed the cap, the hero picks one existing unit to dismiss, which counts as a death. The Runesmith instead **auto-recycles the oldest construct** (+2 Scrap), echoing orb overflow.
- New units enter at the **front**. Players can drag-reorder units once per turn for free.

## 2. Unit stat block
| Field | Meaning |
|---|---|
| `HP / Max HP` | Health. 0 HP = death. |
| `Power` | Base damage of the unit's attack action |
| `Guard` | Same as hero Guard (block). Cleared at the start of the player's turn. |
| `Action` | What the unit does in the Muster phase. Shown as an **ally intent** icon above it. |
| `Traits` | Keywords listed below |
| `Statuses` | Same status system as heroes and enemies: Might, Sapped, Exposed, Venom, Scorch... |

Unit damage pipeline: `Power + Might (+ Rally)` → Sapped ×0.75 → target Exposed ×1.5 → Guard → HP. Statuses that change **attack** damage (Might, Sapped, Exposed) apply to unit actions. Card-only effects such as Finesse do not.

## 3. Turn structure with a Warband
1. **Player turn start:** Guard clears on the hero and all units. Start-of-turn effects run: Upkeep (Warlock), Rot tick timing (see units.md), Bound Phylactery-style relics. Draw.
2. **Player phase:** play cards. **Command** cards make a unit act immediately; this does *not* replace its Muster action unless the card says so.
3. **End of turn:** the hero's end-of-turn effects run, then hand discard, then:
4. **Muster phase:** each unit performs its Action, **front to back**. Attack actions target the **Focus Target**: the enemy the hero last targeted this turn, or the front enemy if that one is dead or none was set. The player can change the Focus Target by right-clicking an enemy.
5. **Enemy phase:** enemies act. Each attack intent shows its target (below).

## 4. How enemies target the Warband
This is a requirement for the enemy-design model. **Every enemy attack move must declare a `targeting` value:**

| `targeting` | Behaviour | Intent icon badge |
|---|---|---|
| `hero` (default) | Hits the hero, unless a **Defender** unit exists, in which case it hits the front Defender | sword → hero portrait |
| `front` | Hits the front unit; hits the hero if there are no units | sword → shield |
| `random_ally` | Random target among hero + units | sword → ? |
| `sweep` | Hits the hero **and** every unit | sword with arc |
| `weakest` | Hits the lowest-HP unit (hero if none) | sword → cracked heart |
| `ignore_defender` | Hits the hero even through Defenders (assassins) | dagger |

Recommended mix per act: about 60% `hero`, 15% `front`, 10% `sweep`, 15% other. Boss kits need at least one `sweep`, so Warbands can't trivialise them.

## 5. Shared unit keywords
| Keyword | Rule |
|---|---|
| **Defender** | Enemy `hero`-targeted attacks hit this unit instead (front-most Defender first) |
| **Elusive** | Can't be targeted by `front`/`random_ally`/`weakest` while another unit exists |
| **Swift** | Acts once immediately when it enters play |
| **Fragile** | Takes double damage from `sweep` attacks |
| **Persistent** | Survives the end of combat (Ranger companions, some Ultimate summons) |
| **Unbound** | Has no Upkeep, Rot or other drawback |
| **Command** (card keyword) | "A unit acts now" |
| **Rally X** (card keyword) | A unit gains +X Power this combat |
| **Fortify X** (card keyword) | A unit gains X Guard |
| **Mend X** (card keyword) | Heal a unit X HP (Constructs: "Repair") |

Statuses on units work as on any creature. **Unit healing:** units can't be healed above Max HP, and Rest Sites only heal **Persistent** units (via the *Tend* option).

## 6. Units outside combat
- Only **Persistent** units (Ranger companions, rare Ultimate summons) appear on the map screen, in the **Lodge** panel next to the deck. That panel shows HP, Bond level and perks.
- Rest Site option **Tend** (always available if you have Persistent units): heal every Persistent unit to full **instead of** Rest or Inscribe.
- Shops sell **Beast Treats** (companion heal) and **Oil Cans** (construct buffs) as potions. Hero-agnostic shops never sell units.

## 7. Enemy-design requirements for the art/enemy model
Every enemy definition must include, besides HP/moves/AI:
```jsonc
{
  "id": "MOSSBACK_TOAD",
  "tier": "normal",                 // normal | elite | boss | minion
  "moves": [{ "id": "TONGUE_LASH", "damage": 7, "targeting": "front" /* §4 */ }],
  "corpse": {                       // Runeblade (defaults derived if omitted)
    "raisable": true,               // false for bosses, constructs, spirits
    "thrall_hp_pct": 0.4,
    "thrall_move": "TONGUE_LASH"    // move the Thrall copies at 50% damage
  },
  "tame": {                         // Ranger: normal-tier beasts/critters only
    "tameable": true,
    "companion_hp_pct": 0.6,
    "instinct_move": "TONGUE_LASH", // its action as a companion (70% damage)
    "bond_perk": "Sticky Tongue: action also applies 1 Snare"
  },
  "animations": ["idle","attack","hit","die","tamed_idle","raised_idle"]
}
```
Guidance: **about 50% of normal enemies should be tameable** (beasts, insects, critters; not humanoids or constructs). **About 85% should be raisable** (anything with a body). Give each act at least 4 tameable species with different roles (tank, damage, debuffer, support).
