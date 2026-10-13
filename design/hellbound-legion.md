# Hellbound Legion — revision 2

The current Warlock build in Conquer and Roguelike supports **ten summons**. Battles begin with an empty Warband. No living demon travels between encounters.

## Promotion and returning ranks

A promotion gives +2 base Power, +2 maximum HP, heals 2 HP, and adds +1 Armor. Armor reduces an enemy action's allocated damage before that soldier's Guard. There is no rank cap.

Each recruited soldier owns its own earned rank. When it dies, is sacrificed, is dismissed, or leaves at battle completion, its rank is stored in a bank for its kind. The next summon of that kind consumes the highest stored rank; equal-rank entries retain insertion order. Remaining copies receive another stored rank or begin at rank zero. This is an individual recruit bank, not a shared kind-wide rank: two simultaneous recruits never clone one veteran's promotions. Active ranks are not also present in the bank.

A returning soldier is a fresh body with full HP. Its intrinsic HP and Power come from the currently played summon card's level, plus its saved promotion increments. Temporary Power, Guard, wounds, and former card-level stats do not travel. Victory clears all living Warlock summons and banks soldier ranks without sacrifice/death triggers or Corruption. Defeat also clears the Warband. Runeblade corpse conversion remains its separate existing mechanic.

**Design assumption:** the user requested saved promotions for the next summon. The implementation preserves ranks per individual recruit, selected highest first, rather than sharing one rank across every soldier of the same kind.

## Soldier roles

| Soldier | Mana | Base HP / Power | Role |
| --- | ---: | ---: | --- |
| Iron Legionary | 2 | 18 / 4 | Two or more split all hostile damage intended for the Warlock. |
| Ash Pikeman | 1 | 12 / 5 | +2 attack damage for each other living Pikeman. |
| Ironhorn Bulwark | 2 | 28 / 2 | Defender. Grants all soldiers 3 Guard at turn start. |
| Maledictor | 2 | 14 / 3 | Attacks apply 2 Scorch; three enable Hellgate. |
| Dread Vanguard | 3 | 24 / 7 | Cleave; its first direct attack kill each turn promotes it. |

Soldiers are not Archdemons: duplicates are legal, Empower does not target them, and Gorthak does not convert their recruitment into Pit Brutes. Updated Imp artwork retains ordinary Imp rules.

**Bodyguards:** determine the living formation at the start of each hostile action. Split hero-directed damage among Legionaries before hero Guard, with remainder points in recruitment order. Unit Armor and Guard reduce each total allocation. Lethal overflow is absorbed by the formation; another hostile action recalculates whether two Legionaries remain. Sweeps still deal the soldiers their own direct damage in addition to the intercepted share. Paired Legionaries take precedence over a hero-targeting Defender. Voluntary blood costs and upkeep are not intercepted.

**Hellgate:** three living Maledictors open a gate after Warband actions and before enemies act. Deal 6 damage and 2 Scorch to every living enemy, then promote every soldier once. Hellgate Rite can trigger the gate earlier but shares the same once-per-turn limit. No extra summon slot is used. An already won battle does not trigger another gate.

## Cards and starter

The authoritative definitions and upgrade text are in packages/content/hellbound.ts. There are fifteen cards: the five individual summon cards, Muster the Legion, Pike Detail, Field Promotion, Blood Ascension, Battlefield Commission, Rally the Legion, Infernal Logistics, Hold the Line, Hellgate Rite, and Veteran's Command.

- **Muster the Legion (3 Mana):** summon two Legionaries. **Pike Detail (2 Mana):** summon two Pikemen. Both require two empty slots and reject before payment at nine or ten occupied slots.
- **Field Promotion (1 Mana):** promote a selected soldier once.
- **Blood Ascension (2 Mana, Uncommon):** explicitly choose a beneficiary soldier and a different living summon to sacrifice, then promote the surviving beneficiary three times. No automatic victim selection. Both targets are validated before payment; regular sacrifice triggers occur and the victim's earned rank is banked once. Promotion count stays three at upgraded card levels.
- **Battlefield Commission (2 Mana):** promote a soldier twice and heal it 6 HP.
- **Rally the Legion (1 Mana):** heal all soldiers 5 HP and grant them 5 Guard.
- **Infernal Logistics (1 Mana):** draw two; with at least two soldiers gain two Cinders.
- **Hold the Line (1 Mana):** gain 8 Guard; soldiers gain 5 Guard.
- **Hellgate Rite (2 Mana):** requires three Maledictors and an unused gate this turn; open it and draw two.
- **Veteran's Command (2 Mana):** a soldier attacks, twice if it was already promoted when the command began.

The ten-card starter contains Iron Legionary, Ash Pikeman, Maledictor, Muster the Legion, Pike Detail, Field Promotion, Blood Ascension, Rally the Legion, Hold the Line, and Infernal Logistics. Blood Ascension replaces the second Field Promotion from revision 1.

Summon upgrades scale HP/Power using the existing level multiplier. Utility upgrades scale healing, Guard, draw, and Cinders. Promotion rank increments, sacrifice rank counts, formation thresholds and innate gate damage remain fixed. No new card has an extra Cinder cost.

All fifteen cards are eligible for the Hellbound starter's weighted rewards and current shops in both modes. Other Warlock cards remain available under existing progression gates. Keeping the new cards out of other starter pools preserves historical reward replay.

## Save compatibility

State and save metadata carry legionRules. Current newInfernalRun and newRoguelikeRun start revision 2. Historical saves missing the marker replay revision 1: five slots, the old starter, no Blood Ascension reward, and the previous living-veteran persistence. The low-level historical newRun constructor defaults to revision 1 and accepts revision 2 as its final argument. The exported warbandCapacity helper is authoritative for engine and UI.

Blood Covenant remains reconstructable for saved runs despite its removal from the new-game selector. Saved actions reconstruct the rank bank, including both explicit Blood Ascension targets, rather than storing a second unvalidated rank inventory.

## Verification

hellbound.test.ts preserves revision-1 contracts and shared soldier behavior. hellbound-r2.test.ts covers ten-slot boundaries, atomic pairs, individual rank deposits and consumes without cloning, empty next encounters, sacrifice/death timing, explicit two-target validation, and versioned save reconstruction. Seeded simulation supports --deck=hellbound, chooses explicit sacrifice victims, and uses the versioned capacity helper. This is an initial balance pass, not a competitive balance certification.

No commit, push, or deployment is implied.
