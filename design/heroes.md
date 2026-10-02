# Runelord Heroes

Four original heroes. Each takes a familiar deckbuilder archetype and centres it on a distinct **Warband** unit family (see [warband-system.md](warband-system.md)). Universal terms used below: **Mana** (energy, 3 per turn), **Guard** (block), **Might** (+attack damage), **Finesse** (+Guard from cards), **Exposed** (+50% damage taken), **Sapped** (−25% damage dealt), **Brittle** (−25% Guard gained), **Consume** (removed for the rest of combat), **Fleeting** (consumed if still in hand at end of turn), **Hold** (stays in hand), **Opening** (starts in hand), **Bound** (can't be removed from the deck). Full glossary: [../catalog/glossary.md](../catalog/glossary.md).

| | Runeblade | Warlock | Runesmith | Ranger |
|---|---|---|---|---|
| Race / look | Human, frost-rimed heavy plate, glowing blue runes, two-handed greatsword | Human, sinister layered cloth robes, horned cowl, ember-lit sigils | Dwarf, leather apron over riveted plate, rune goggles, lightning hammer, coil backpack | Elf, leaf-green hooded cloak, leather, longbow, antler circlet |
| Element | Ice | Fire | Lightning / tech | Nature / venom |
| Max HP | 80 | 72 | 78 | 70 |
| Units | Thralls (raised dead) | Demons | Constructs + Thunderhulk mech | Companions (tamed beasts) |
| Second resource | **Corpses** in the Grave | **Cinders** 🔥 (cap 20) + **Corruption** meter (0–10) | **Volts** ⚡ (cap 10) + **Scrap** | none (uses X-costs and companion count) |
| Signature status | **Chill → Frozen** | **Scorch** | **Static** | **Venom**, **Mark**, **Snare** |
| Inspired by | Ironclad's armour/Might + Necrobinder's undead companion | Ironclad's Demon Form & HP-as-resource + Necrobinder's Souls | Defect's orbs + Regent's star resource & Forge | Silent's shivs, poison and discard + a new taming system |
| Unlock | Start | Start | Win 1 run (or reach Act 3 twice) | Win with Runesmith or Warlock |

Card pools: [Runeblade](../catalog/cards-runeblade.md) · [Warlock](../catalog/cards-warlock.md) · [Runesmith](../catalog/cards-runesmith.md) · [Ranger](../catalog/cards-ranger.md) · [Neutral](../catalog/cards-neutral.md) · Unit stat blocks: [units.md](../catalog/units.md)

Each hero has **70 cards**: 4 Basic, 18 Common, 28 Uncommon, 18 Rare and 2 **Ultimate**.

---

## 1. The Runeblade: Oathsworn of the Long Winter

> *"The cold keeps what it kills."* A knight who died on a frozen battlefield and rose still bound to his oath. He wields **Hoarfang**, a greatsword etched with frost runes. Where he walks the dead stand up again, and they fight on his side.

**Art direction:** bulky silhouette; plate armour crusted with ice; pale-blue rune glow on the blade and visor; breath mist. Thralls are shambling corpses of whatever enemy fell, with ice in their wounds and blue eye-light (the *raised_idle* animation of each enemy, tinted blue-grey).

### Systems
**Chill and Frozen (ice)**
- *Chill X* stacks on enemies. Each stack reduces that enemy's **next attack** damage by 1; Chill is **not** spent by attacking.
- When an enemy reaches **10 Chill** it becomes **Frozen**: all Chill is removed and it **skips its next action**. Its intent shows a frozen icon.
- **Elites and bosses** need 10 Chill for the first Freeze, then **+10 for each later Freeze** that combat (20, 30...). This prevents lock-downs.
- **Heavy** (Attack keyword): a Heavy attack on a **Frozen** enemy deals **triple damage** and **Shatters** it (removes Frozen). An enemy killed by a Shatter leaves a **Frost Corpse**: its Thrall gets +50% HP and Power.

**The Grave, Corpses and Raise (undead)**
- When a non-minion enemy dies, its **Corpse** goes to the **Grave**, a stack shown beside the hero's portrait. Each Corpse records the enemy's max HP and its strongest move.
- **Raise**: spend the newest Corpse to create a **Thrall** in the Warband:
  - Thrall HP = 40% of the enemy's max HP (min 6, max 40)
  - Thrall Power = 50% of the enemy's strongest single hit (min 3, max 12)
  - Action: attack the Focus Target
  - Elite corpses give ×1.5 stats and **Defender**. Bosses can't be raised.
- **If the Grave is empty**, Raise creates a **Bone Thrall** (6 HP, 3 Power) instead, so Raise cards are never dead draws.
- **Rot:** Thralls start with Rot 1. At the end of each Muster phase, each Thrall loses HP equal to its Rot, then Rot +1. A typical Thrall lasts 3–5 turns. Cards like *Rally the Fallen* reset Rot; *Necromantic Mastery* removes it.
- **Fallen Soldier Corpses** are generic corpses (10 HP / 4 Power Thrall) that some cards add to the Grave. They let the Runeblade raise the dead in single-enemy fights.

**Heavy armour:** the deepest Guard tools of any hero. **Rimeplate X** gives X Guard at end of turn, then decreases by 1. Barricade-style effects (*Unbroken*, *Glacial Citadel*), and Body Slam-style payoffs (*Avalanche*).

### Start of run
- **Deck (10):** 4× Hew, 4× Brace, 1× Frostbite, 1× Raise Dead
- **Starter rune: Gravebound Sigil.** Start each combat with 1 Fallen Soldier Corpse in the Grave. At the end of combat, heal 5 HP.
  - Upgraded by an Elder Spirit to **Lichbound Sigil**: start with 2 Corpses; heal 8; your first Raise each combat is a Frost Corpse.

### Build paths
1. **Glacier Wall:** stack Guard and Rimeplate, then convert it with *Avalanche* and *Frostforged Wrath*.
2. **Freeze & Shatter:** *Permafrost Aura* and *Frost Nova* build Chill to Freeze, then Heavy cards like *Executioner* triple damage. Shatter kills feed better corpses.
3. **Gravelord:** fast kills on small enemies, Raise chains, buff Thralls with *Unholy Vigor* and *Necromantic Mastery*, and command them with *Command the Dead*.

### Ultimates
- **Army of the Dead** (4 Mana, Consume, Unique): Raise **every** Corpse in the Grave. Then fill all empty Warband slots with **Risen Legionnaires** (14 HP, 6 Power, Defender). Thralls raised this way don't Rot this combat.
- **Eternal Winter** (4 Mana): Freeze ALL enemies (bosses gain 15 Chill instead). Your Thralls' attacks apply 2 Chill for the rest of combat.

---

## 2. The Warlock: Cinder-Sworn of the Ninth Pit

> *"Every flame has a price. I've already paid mine."* A scholar who sold more than his soul to the Ninth Pit. His robes smoulder at the hem. The demons who serve him are hungry, and if he lets the Pit in far enough, he becomes one of them.

**Art direction:** tall and thin; layered dark robes in oxblood and charcoal; a horned cowl hiding most of the face; ember sigils that glow brighter as Corruption rises. In **Demon Form**, the robes burn away into a horned, winged fire-demon silhouette (a separate hero model with its own animation set). Demons are stylised, chunky and readable, each with one dominant colour accent.

### Systems
**Scorch (fire):** *Scorch X* on a creature deals X damage at the **end of that creature's turn**, then Scorch is **halved** (rounded down). Poison is a slow −1 tick; Scorch is a front-loaded burst that rewards re-applying it. When an enemy dies with Scorch on it, the Warlock gains Cinders equal to **half its remaining Scorch**.

**Cinders 🔥 (summoning fuel):** a second resource that carries over between turns (cap 20). It is gained from *Blood Pact*, *Kindle*, *Feed the Pit*, **Soul Shards** (0-cost Consume tokens: gain 2 Cinders, draw 1) and Scorch kills. The starter rune also gives 1 Cinder whenever you lose HP on your turn. Summon cards show a cost like `1 +2🔥`.

**Demons and Upkeep:** Summon cards create specific demons, one card per type. Each demon has an **Upkeep N**. At the start of your turn, Upkeep is paid in Cinders, front demon first. **If you can't pay, the demon Hungers:** it deals the unpaid amount as damage to *you*, ignoring Guard, and still acts. Demons are stronger than other heroes' units in exchange.
| Demon | HP | Power | Upkeep | Action / trait |
|---|---|---|---|---|
| Imp | 6 | 4 | 0 | Firebolt: 4 damage + 1 Scorch. Swift. |
| Hellhound | 14 | 6 | 1 | Bite. +2 Power for each other Hellhound. |
| Gloomstalker | 10 | 0 | 1 | Alternates 2 Sapped / 2 Exposed on the Focus Target. Elusive. |
| Soul Leech | 8 | 4 | 1 | Drain: deal 4, heal the Warlock that much |
| Pyre Warden | 12 | 0 | 1 | Gives the Warlock 4 Guard and applies 1 Scorch to ALL enemies |
| Pit Brute | 26 | 10 | 2 | Slam. Defender. |

**Pact X:** a card keyword meaning "lose X HP as part of this card's cost; gain X Corruption."

**Corruption and Demon Form:** a 0–10 meter on the portrait.
- It fills from Pact, from **+2 whenever one of your demons dies**, and from cards that add it.
- At 10 Corruption, you **Ascend at the start of your next turn** into **Demon Form** for **3 turns**:
  - +3 Might; your Attacks apply 2 Scorch; immune to Sapped; your demons get +2 Power
  - Lose 3 HP at the end of each turn
- When Demon Form ends, Corruption resets to 0 and you draw 1 fewer card next turn ("Spent").
- Some cards enter Demon Form directly (*Infernal Transformation*).

**Sacrifice** (Exhaust-echo): destroy one of your demons as a cost. Payoffs include *Sacrificial Rite*, *Feast of Souls* and *Demonic Resilience*.

### Start of run
- **Deck (10):** 4× Firebolt, 4× Ward of Ash, 1× Summon Imp, 1× Blood Pact
- **Starter rune: Brand of the Pit.** Start each combat with 3 Cinders. Whenever you lose HP on your turn, gain 1 Cinder.
  - Upgraded to **Crown of the Pit**: start with 6 Cinders; Corruption starts at 3.

### Build paths
1. **Infernal Host:** many summons with *Masters of the Pit*, *Burning Soul* (cheaper Upkeep) and *Unholy Frenzy*.
2. **Pyromancer:** stack Scorch with *Pyroclasm*, *Fire and Brimstone* and *Witchfire Brand*, then cash it in with *Combust*.
3. **Pact-Fiend:** self-damage and Corruption cycling to stay in Demon Form as much as possible (*Ascendant Will*, *Hellborn*, *Infernal Pact*).

### Ultimates
- **Greater Summoning** (4 Mana +10🔥, Consume, Unique): choose a demon type and summon its **Arch-form**. Arch-forms are Unbound (no Upkeep) and have about 3× stats with an upgraded action. See [units.md](../catalog/units.md): *Ignivar the Archimp, Cerberax the Three-Jawed, Nightmaw, The Hollow Saint, The Pyre Colossus, Gorthak the Pit Lord*.
- **Crown of the Abyss** (3 Mana +5🔥): enter Demon Form now. It lasts until the end of combat, but you lose 4 HP per turn instead of 3.

---

## 3. The Runesmith: Thane of the Deep Forge

> *"Stand back. No — further."* A dwarven engineer-runecaster who puts lightning runes into everything she builds: turrets, shield-bots, mortars, drones. When things get serious she calls down the **Thunderhulk**, a rune-powered war-mech she climbs into for a few explosive turns.

**Art direction:** short and broad; braided beard; copper and brass on dark leather; rune goggles; a Tesla coil backpack that arcs when she plays Volts cards. Constructs are boxy and readable with a visible charge gauge (three pips). The **Thunderhulk** is about 2.5× hero height: an armoured riveted walker with a glass cockpit showing the dwarf inside. It needs its own animation set: *drop-in, idle, slam, hit, eject, explode*.

### Systems
**Constructs (Deploy):** each construct type has its own **Deploy** card; you can only deploy what you hold. Constructs don't decay.
| Construct | HP | Action (each Muster) | Overcharge (at 3 Charge, replaces action, then resets) |
|---|---|---|---|
| Spark Turret | 6 | Arc 3 | Arc 9 |
| Bulwark Bot | 10, Defender | Hero gains 3 Guard | ALL allies gain 8 Guard |
| Rivet Mortar | 8 | 5 damage to the highest-HP enemy | 12 damage to ALL enemies |
| Mender Drone | 5, Elusive | Repair the most damaged construct (or Thunderhulk) 3 | Repair ALL constructs 5; each gains 1 Charge |
| Tesla Pylon | 12 | Give adjacent constructs 1 Charge | Chain lightning: 6 damage, jumps 3 times |
| Clockwork Sapper | 4, Fragile | Apply 2 Exposed to the Focus Target | Explodes: 15 damage to the target; destroyed (+2 Scrap) |

**Charge and Overcharge (Defect evoke-echo):** cards give **Charge** to constructs. When a construct ends the turn with **3 Charge**, it uses its Overcharge effect instead of its normal action and resets to 0. **Discharge** triggers the Overcharge immediately, regardless of Charge.

**Arc X:** deal X lightning damage to a random enemy. Increased by **Static** on the target.

**Static X** (enemy debuff): takes +X damage from Arcs and construct actions; −1 per turn.

**Volts ⚡:** the Runesmith's second resource (Regent-star echo). It carries over between turns (cap 10). It's gained from *Jolt*, *Static Shield*, *Capacitor Bank* and the starter rune, and spent on ⚡-cost cards and big payoffs (*Volt Surge*, *Megavolt*).

**Scrap:** a counter that is gained when constructs are destroyed or **Recycled** (+2 each) and from cards like *Spare Parts*. Its main use is the mech.

**The Thunderhulk (Mech Up N):** you climb into the mech for N turns.
- **Hull** = 12 + 4 × all Scrap spent (Mech Up spends all Scrap). Damage to the hero hits Hull first.
- While **Piloting**: your Attacks deal +3; at the end of each turn the Thunderhulk **Slams** the Focus Target for 10 + **Calibration**. Cards with "*Piloting:*" text get a bonus.
- **Calibrate X** (Forge echo) permanently raises Slam damage by X for this combat.
- When the turns run out you eject safely. If Hull hits 0 you are **ejected and Dazed**: −1 Mana next turn.
- Mech Up while already piloting adds the turns and the new Hull.

### Start of run
- **Deck (10):** 4× Hammer Blow, 4× Rivet Guard, 1× Deploy: Spark Turret, 1× Jolt
- **Starter rune: Coil of the Deep Forge.** Start each combat with 2 Volts. At the start of combat, Deploy a Spark Turret.
  - Upgraded to **Heart of the Deep Forge**: also start with 4 Scrap; the turret starts with 1 Charge.

### Build paths
1. **Turret Line:** Spark Turrets, Tesla Pylons and *Power Grid* for Overcharge loops; *Tesla Field* and *Echo Circuit*.
2. **Scrapper:** recycle and sacrifice constructs for Scrap (*Salvage*, *Self-Destruct Protocol*), then huge Thunderhulk drops (*Thunderhulk Mk II*, *Juggernaut Plating*).
3. **Stormcaller:** Volts and Arc spam with Static (*Runic Battery*, *Storm Forge*, *Megavolt*). This path uses few units.

### Ultimates
- **Total Deployment** (5 Mana +10⚡, Consume, Unique): Deploy one of **every** construct type, ignoring the Warband cap for this combat. All constructs gain 3 Charge. Then **Mech Up 3** with +30 Hull.
- **Forgefather's Wrath** (3 Mana + all Volts): Calibrate 4 per Volt spent. Mech Up 2. The Thunderhulk Slams immediately.

---

## 4. The Ranger: Warden of the Thornwood

> *"Every creature in these woods has a name. Some of them will tell it to you."* An elven warden who walks the Spire with a longbow, a quiver of fletched arrows and a growing pack of beasts. They followed her because she spared them. When one falls, it does not come back.

**Art direction:** slim, light silhouette; layered green cloak with leaf trim; longbow taller than she is; antler circlet; small bone charms for each companion currently in the pack (a visual roster on the model). Companions are the tamed enemies' own models with a **"tamed" variant**: a green leaf collar or band, friendlier idle pose, facing right.

### Systems
**Taming:**
- **Tame** (card effect) targets a **Tameable normal enemy** (see the enemy spec in [warband-system.md §7](warband-system.md)). It succeeds if the enemy's HP is **≤ 30% of max**, or **≤ 50% if it has Snare**.
- On success the enemy leaves the fight, counting as defeated for rewards, and joins your **Lodge** as a **Companion**:
  - Max HP = 60% of its max HP; it keeps its *current* HP
  - Power = 70% of its *instinct move*
  - Action: its instinct move
- On failure, each Tame card applies a fallback effect (e.g. *Coax* applies 2 Snare).
- **Bond slots: 3.** Runes and cards can raise it. If full, you choose a companion to release (it leaves forever, no penalty) or cancel.

**Companions (Persistent):**
- They carry their HP between fights and can only be healed by Ranger cards, potions, Rest Site **Tend**, and runes.
- **Bond:** +1 per combat survived. At **Bond 3**: +30% HP and Power. At **Bond 6**: unlocks the species' **bond perk** from its tame profile.
- **Permadeath:** a companion at 0 HP is gone for the rest of the run. The Ranger gains **Vengeance** for the rest of that combat (+3 Might). *Vengeful Howl* scales with companions lost this run.

**Snare X** (enemy debuff): raises the Tame threshold (above) and reduces the enemy's Guard gain by 25%. −1 per turn.

**Mark X:** the marked enemy takes +X damage from Arrows and companion actions. It decays by 1 at end of turn.

**Venom X:** lose X HP at the start of its turn, then −1. The Silent poison echo.

**Arrows:** 0-cost Consume token Attacks (4 damage). Created by *Quiver Draw*, *Endless Quiver* and others. The shiv echo.

**Quickdraw** (Sly echo): if this card is discarded from your hand during your turn, it's played for free.

### Start of run
- **Deck (10):** 4× Loose Arrow, 4× Evade, 1× Hunter's Mark, 1× Coax
- **Starting companion: Kestrel** (a hawk, Bond 0): 9 HP, Power 3; action *Peck*: 3 damage + 1 Mark. Bond perk: *Keen Eye*, its Mark is 2. If Kestrel dies, she's gone.
- **Starter rune: Falconer's Whistle.** At the start of each combat, your first companion acts. After each combat, companions heal 2 HP.
  - Upgraded to **Wildheart Whistle**: +1 Bond slot; companions heal 4 after combat.

### Build paths
1. **Beastmaster:** a full lodge of 3–4 companions, *Alpha's Call*, *Kinship*, *Beastmaster Form*, *Pounce Order*.
2. **Fletcher:** Arrow spam with *Endless Quiver*, *Fletcher's Focus* and *Thousand Arrows*, plus Mark stacking.
3. **Venomwood:** Venom stacking with *Thornwild*, *Virulent Strain* and *Toxic Burst*, using Quickdraw discard loops.

### Ultimates
- **Call of the Stampede** (X Mana, min 2, Consume, Unique): X+2 **Wild Beasts** (a random mix of Stag, Boar, Elk and Bear) charge through. Each deals 7 damage to a random enemy and applies 1 Snare, then they leave. Then each companion acts twice.
- **Heart of the Wild** (4 Mana): Tame any normal enemy regardless of HP, even if not Tameable. All companions heal to full and gain +3 Power this combat.

---

## 5. Balance targets (for the playtest phase)
| Metric | Target |
|---|---|
| Share of a turn's damage done by units, mid-game | Runeblade 25–35% · Warlock 35–45% · Runesmith 40–55% · Ranger 30–45% |
| Average units on board by turn 3, Act 1 | 1–2 |
| Ranger companions alive entering Act 3 | about 2 (losing some must be common, not rare) |
| Warlock HP lost to Hunger per Act | 5–15 |
| Thunderhulk uptime | 20–35% of turns in Scrapper builds |
| Ultimate seen per run | about 60% of runs (one offered at each boss reward + Act 2 Elder Spirit) |
