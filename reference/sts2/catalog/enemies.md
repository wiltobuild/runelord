# Enemies (115 monsters)

> Source: game-file extract from [spire-codex](https://github.com/ptrlrd/spire-codex) (PolyForm Noncommercial 1.0.0). Raw JSON in `../data/`. Markup stripped; `(1E)` = energy, `(1★)` = Regent stars.

HP shown as base / A8+ (Tough Enemies). Damage as base / A9+ (Deadly Enemies). `×n` = hits.

## Assassin Raider — Normal

- HP: 18–23 / 19–24
- Appears in: Ruby Raiders (Monster, Act 1 - Overgrowth)
- AI pattern (cycle): Always uses Killshot
  - **Killshot** [Attack] dmg 10/11

## Axe Raider — Normal

- HP: 20–22 / 21–23
- Appears in: Ruby Raiders (Monster, Act 1 - Overgrowth)
- AI pattern (cycle): Swing 1 → Swing 2 → Big Swing → repeat
  - **Swing 1** [Attack + Defend] dmg 5/6 block 5
  - **Swing 2** [Attack + Defend] dmg 5/6 block 5
  - **Big Swing** [Attack] dmg 12/13

## Axebot — Normal

- HP: 70–78 / 76–86
- Appears in: Axebot (Monster, Act 3 - Glory)
- AI pattern (cycle): Always uses Boot Up
  - **Boot Up** [Defend + Buff] block 10
  - **The One-Two** [Attack] dmg 9×2/10×2
  - **Hammer Uppercut** [Attack + Debuff] dmg 12/14

## Battle Friend V1.0 — Normal

- HP: 75 / ?
- Starts with: BATTLEWORN_DUMMY_TIME_LIMIT 3
- Appears in: Battleworn Dummy (Monster, None)
- AI pattern (cycle): 
  - **Nothing** [Unknown]

## Battle Friend V2.0 — Normal

- HP: 150 / ?
- Starts with: BATTLEWORN_DUMMY_TIME_LIMIT 3
- Appears in: Battleworn Dummy (Monster, None)
- AI pattern (cycle): 
  - **Nothing** [Unknown]

## Battle Friend V3.0 — Normal

- HP: 300 / ?
- Starts with: BATTLEWORN_DUMMY_TIME_LIMIT 3
- Appears in: Battleworn Dummy (Monster, None)
- AI pattern (cycle): 
  - **Nothing** [Unknown]

## Bowlbug (Egg) — Normal

- HP: 21–22 / 23–24
- Appears in: Bowlbug Swarm (Monster, Act 2 - Hive); Bowlbugs (Monster, Act 2 - Hive)
- AI pattern (cycle): Always uses Bite
  - **Bite** [Attack + Defend] dmg 7/8 block 7

## Bowlbug (Nectar) — Normal

- HP: 35–38 / 36–39
- Appears in: Bowlbug Swarm (Monster, Act 2 - Hive); Bowlbugs (Monster, Act 2 - Hive)
- AI pattern (cycle): Thrash → Buff → Thrash2 → repeat
  - **Thrash** [Attack] dmg 3/None
  - **Buff** [Buff]
  - **Thrash2** [Attack] dmg 3/None

## Bowlbug (Rock) — Normal

- HP: 45–48 / 46–49
- Starts with: IMBALANCED 1
- Appears in: Bowlbug Swarm (Monster, Act 2 - Hive); Bowlbugs (Monster, Act 2 - Hive); Slumber Party (Monster, Act 2 - Hive)
- AI pattern (conditional): Starts with Headbutt
  - **Headbutt** [Attack] dmg 15/16
  - **Dizzy** [Stun]

## Bowlbug (Silk) — Normal

- HP: 40–43 / 41–44
- Appears in: Bowlbug Swarm (Monster, Act 2 - Hive); Slumber Party (Monster, Act 2 - Hive)
- AI pattern (cycle): 
  - **Thrash** [Attack] dmg 4×2/5×2
  - **Toxic Spit** [Debuff]

## Brute Raider — Normal

- HP: 30–33 / 31–34
- Appears in: Ruby Raiders (Monster, Act 1 - Overgrowth)
- AI pattern (cycle): Always uses Beat
  - **Beat** [Attack] dmg 7/8
  - **Roar** [Buff]

## Byrdpip — Normal

- HP: 9999 / ?
- AI pattern (cycle): 
  - **Nothing** [Unknown]

## Calcified Cultist — Normal

- HP: 38–41 / 39–42
- Appears in: Cultists (Monster, Act 1 - Underdocks); Underdocks Wildlife (Monster, Act 1 - Underdocks)
- AI pattern (cycle): Always uses Incantation
  - **Incantation** [Buff]
  - **Dark Strike** [Attack] dmg 9/11

## Chomper — Normal

- HP: 60–64 / 63–67
- Starts with: ARTIFACT 2
- Appears in: An Automaton Pair (Monster, Act 2 - Hive); Tunneling Twosome (Monster, None)
- AI pattern (cycle): 
  - **Clamp** [Attack] dmg 8×2/9×2
  - **Screech** [Status]

## Corpse Slug — Normal

- HP: 25–27 / 27–29
- Starts with: RAVENOUS 4
- Appears in: Corpse Slugs (Monster, Act 1 - Underdocks); Many Corpse Slugs (Monster, Act 1 - Underdocks)
- AI pattern (cycle): 
  - **Whip Slap** [Attack] dmg 3×2/None×2
  - **Glomp** [Attack] dmg 8/9
  - **Goop** [Debuff]

## Crossbow Raider — Normal

- HP: 18–21 / 19–22
- Appears in: Ruby Raiders (Monster, Act 1 - Overgrowth)
- AI pattern (cycle): 
  - **Fire!** [Attack] dmg 14/16
  - **Reload** [Defend] block 3

## Cubex Construct — Normal

- HP: 65 / 70
- Starts with: ARTIFACT 1
- Appears in: Construct Menagerie (Monster, Act 3 - Glory); Cubex Construct (Monster, Act 1 - Overgrowth)
- AI pattern (cycle): Charge Up → Repeater Blast → Repeater Blast Move 2 → Expel → repeat
  - **Charge Up** [Buff]
  - **Repeater Blast** [Attack + Buff] dmg 7/8
  - **Repeater Blast Move 2** [Attack + Buff] dmg 7/8
  - **Expel** [Attack] dmg 5×2/6×2

## Damp Cultist — Normal

- HP: 51–53 / 52–54
- Appears in: Cultists (Monster, Act 1 - Underdocks)
- AI pattern (cycle): Always uses Incantation
  - **Incantation** [Buff]
  - **Dark Strike** [Attack] dmg 1/3

## Devoted Sculptor — Normal

- HP: 162 / 172
- Appears in: Devoted Sculptor (Monster, Act 3 - Glory)
- AI pattern (cycle): Always uses Forbidden Incantation
  - **Forbidden Incantation** [Buff]
  - **Savage** [Attack] dmg 12/15

## Exoskeleton — Normal

- HP: 24–28 / 25–29
- Starts with: HARD_TO_KILL 9
- Appears in: Exoskeletons (Monster, Act 2 - Hive); Many Exoskeletons (Monster, Act 2 - Hive)
- AI pattern (mixed): then random: Skitter (no repeat), Mandibles (no repeat); then conditional: Skitter (if in first slot) / Mandibles (if in second slot) / Enrage (if in third slot) / Rand (if in fourth slot)
  - **Skitter** [Attack] dmg 1×3/None×3
  - **Mandibles** [Attack] dmg 8/9
  - **Enrage** [Buff]

## Eye with Teeth — Normal

- HP: 6 / ?
- Starts with: ILLUSION 1
- Appears in: Fogmog (Monster, Act 1 - Overgrowth)
- AI pattern (cycle): Always uses Distract
  - **Distract** [Status]

## Fabricator — Normal

- HP: 150 / 155
- Appears in: Fabricator (Monster, Act 3 - Glory)
- AI pattern (mixed): then random: Fabricate, Fabricating Strike; then conditional: Rand (if can fabricate) / Disintegrate (if cannot fabricate)
  - **Fabricate** [Summon]
  - **Fabricating Strike** [Attack + Summon] dmg 18/21
  - **Disintegrate** [Attack] dmg 11/13

## Fat Gremlin — Normal

- HP: 13–17 / 14–18
- Appears in: Two Gremlins in a Trenchcoat (Monster, Act 1 - Underdocks)
- AI pattern (cycle): Always uses Wake Up
  - **Wake Up** [Stun]
  - **Flee** [Escape]

## Flyconid — Normal

- HP: 47–49 / 51–53
- Appears in: Overgrowth Flora (Monster, Act 1 - Overgrowth); Shroom and Slime (Monster, Act 1 - Overgrowth)
- AI pattern (random): 
  - **Vulnerable Spores** [Debuff] dmg 8/9
  - **Frail Spores** [Attack + Debuff] dmg 8/9
  - **Smash** [Attack] dmg 11/12

## Fogmog — Normal

- HP: 74 / 78
- Appears in: Fogmog (Monster, Act 1 - Overgrowth)
- AI pattern (random): Starts with Illusory Spores, then random: Swipe Random (no repeat, 40%), Headbutt (no repeat, 60%)
  - **Illusory Spores** [Summon]
  - **Thwack** [Attack + Buff] dmg 8/9
  - **Swipe Random** [Attack + Buff] dmg 8/9
  - **Headbutt** [Attack] dmg 14/16

## Fossil Stalker — Normal

- HP: 51–53 / 54–56
- Starts with: SUCK 3
- Appears in: Fossil Stalker (Monster, Act 1 - Underdocks)
- AI pattern (random): Starts with Latch
  - **Tackle** [Attack + Debuff] dmg 9/11
  - **Latch** [Attack] dmg 12/14
  - **Lash** [Attack] dmg 3×2/4×2

## Frog Knight — Normal

- HP: 191 / 199
- Starts with: PLATING 15
- Appears in: Frog Knight (Monster, Act 3 - Glory)
- AI pattern (conditional): Starts: Tongue Lash → Strike Down Evil → For the Queen; then conditional: Tongue Lash (if HasBeetleCharged // CurrentHp >= MaxHp / 2) / Beetle Charge (if !HasBeetleCharged && CurrentHp < MaxHp / 2)
  - **For the Queen** [Buff]
  - **Strike Down Evil** [Attack] dmg 21/23
  - **Tongue Lash** [Attack + Debuff] dmg 13/14
  - **Beetle Charge** [Attack] dmg 35/40

## Fuzzy Wurm Crawler — Normal

- HP: 55–57 / 58–59
- Appears in: Fuzzy Wurm Crawler (Monster, Act 1 - Overgrowth); Overgrowth Crawlers (Monster, Act 1 - Overgrowth)
- AI pattern (cycle): Always uses First Acid Goop
  - **First Acid Goop** [Attack] dmg 4/6
  - **Acid Goop** [Attack] dmg 4/6
  - **Inhale** [Buff]

## Gas Bomb — Normal

- HP: 7 / 8
- Starts with: MINION 1
- Appears in: Living Fog (Monster, Act 1 - Underdocks)
- AI pattern (cycle): Always uses Explode
  - **Explode** [Special] dmg 8/9

## Globe Head — Normal

- HP: 148 / 158
- Starts with: GALVANIC 6
- Appears in: A Lone Globe Head (Monster, Act 3 - Glory)
- AI pattern (cycle): Shocking Slap → Channel Lightning → Galvanic Burst → repeat
  - **Channel Lightning** [Attack] dmg 6×3/7×3
  - **Shocking Slap** [Attack + Debuff] dmg 13/14
  - **Galvanic Burst** [Attack + Buff] dmg 16/17

## Gremlin Merc — Normal

- HP: 47–49 / 51–53
- Starts with: SURPRISE 1
- Appears in: Two Gremlins in a Trenchcoat (Monster, Act 1 - Underdocks)
- AI pattern (cycle): Gimme → Double Smash → Hehe → repeat
  - **Gimme** [Attack] dmg 7×2/8×2
  - **Double Smash** [Attack + Debuff] dmg 6×2/7×2
  - **Hehe** [Attack + Buff] dmg 8/9

## Guardbot — Normal

- HP: 16–20 / 17–21
- AI pattern (cycle): Always uses Guard
  - **Guard** [Defend] block 15

## Haunted Ship — Normal

- HP: 63 / 67
- Appears in: Haunted Ship (Monster, Act 1 - Underdocks)
- AI pattern (cycle): Always uses Haunt
  - **Swipe** [Attack] dmg 13/14
  - **Stomp** [Attack] dmg 4×3/5×3
  - **Haunt** [Debuff + Status]

## Hunter Killer — Normal

- HP: 121 / 126
- Appears in: Hunter Killer (Monster, Act 2 - Hive)
- AI pattern (random): Starts with Tenderizing Goop
  - **Tenderizing Goop** [Debuff]
  - **Bite** [Attack] dmg 17/19
  - **Puncture** [Attack] dmg 7×3/8×3

## Inklet — Normal

- HP: 11–17 / 12–18
- Starts with: SLIPPERY 1
- Appears in: Inklets (Monster, Act 1 - Overgrowth)
- AI pattern (random): Starts: Whirlwind → Jab; then random: Jab, Whirlwind (no repeat); then random: Piercing Gaze (no repeat), Whirlwind (no repeat)
  - **Jab** [Attack] dmg 3/4
  - **Whirlwind** [Attack] dmg 2×3/3×3
  - **Piercing Gaze** [Attack] dmg 10/11

## Leaf Slime (M) — Normal

- HP: 32–35 / 33–36
- Appears in: Group of Slimes (Monster, Act 1 - Overgrowth); Shroom and Slime (Monster, Act 1 - Overgrowth); Strangler and Friend (Monster, Act 1 - Overgrowth); Swarm of Slimes (Monster, Act 1 - Overgrowth)
- AI pattern (cycle): 
  - **Clump Shot** [Attack] dmg 8/9
  - **Sticky Shot** [Status]

## Leaf Slime (S) — Normal

- HP: 11–15 / 12–16
- Appears in: Group of Slimes (Monster, Act 1 - Overgrowth); Strangler and Friend (Monster, Act 1 - Overgrowth); Swarm of Slimes (Monster, Act 1 - Overgrowth)
- AI pattern (random): 
  - **Tackle** [Attack] dmg 3/4
  - **Goop** [Status]

## Living Fog — Normal

- HP: 80 / 82
- Appears in: Living Fog (Monster, Act 1 - Underdocks)
- AI pattern (cycle): Advanced Gas → Bloat → Super Gas Blast → repeat
  - **Advanced Gas** [Attack + Debuff] dmg 8/9
  - **Bloat** [Attack + Summon] dmg 5/6
  - **Super Gas Blast** [Attack] dmg 8/9

## Living Shield — Normal

- HP: 55 / 65
- Starts with: RAMPART 25
- Appears in: Turret Operator (Monster, Act 3 - Glory)
- AI pattern (conditional): Starts with Shield Slam; then conditional: Shield Slam (if has allies) / Smash (if no allies)
  - **Shield Slam** [Attack] dmg 6/None
  - **Smash** [Attack + Buff] dmg 16/18

## Louse Progenitor — Normal

- HP: 134–136 / 138–141
- Starts with: CURL_UP 14
- Appears in: Louse Progenitor (Monster, Act 2 - Hive)
- AI pattern (cycle): Always uses Web Cannon
  - **Web Cannon** [Attack + Debuff] dmg 9/10
  - **Pounce** [Attack] dmg 14/16
  - **Curl and Grow** [Defend + Buff] block 14

## Mawler — Normal

- HP: 72 / 76
- Appears in: Mawler (Monster, Act 1 - Overgrowth)
- AI pattern (random): Starts with Claw; then random: Rip and Tear (no repeat), Roar (once), Claw (no repeat)
  - **Rip and Tear** [Attack] dmg 14/16
  - **Roar** [Debuff]
  - **Claw** [Attack] dmg 4×2/5×2

## Mysterious Knight — Normal

- HP: 101 / 108
- Appears in: Mysterious Knight (Monster, None)
  - **War Chant** [Buff]
  - **Flail** [Attack] dmg 9×2/10×2
  - **Ram** [Attack] dmg 15/17

## Myte — Normal

- HP: 61–67 / 64–69
- Appears in: Mass of Mytes (Monster, Act 2 - Hive)
- AI pattern (conditional): then conditional: Toxic Cornucopia (if in first slot) / Suck (if in second slot)
  - **Toxic Cornucopia** [Status]
  - **Bite** [Attack] dmg 13/15
  - **Suck** [Attack + Buff] dmg 4/6

## Nibbit — Normal

- HP: 42–46 / 44–48
- Appears in: A Lone Nibbit (Monster, Act 1 - Overgrowth); A Pair of Nibbits (Monster, Act 1 - Overgrowth)
- AI pattern (conditional): then conditional: Butt (if alone) / Hiss (if not in front) / Slice (if in front)
  - **Butt** [Attack] dmg 12/13
  - **Slice** [Attack + Defend] dmg 6/7 block 5
  - **Hiss** [Buff]

## Noisebot — Normal

- HP: 18–23 / 19–24
- AI pattern (cycle): Always uses Noise
  - **Noise** [Status]

## Osty — Normal

- HP: 1 / ?
- AI pattern (cycle): 
  - **Nothing** [Unknown]

## Ovicopter — Normal

- HP: 124–130 / 126–132
- Appears in: Ovicopter (Monster, Act 2 - Hive)
- AI pattern (conditional): Starts: Lay Eggs → Smash → Tenderizer; then conditional: Lay Eggs (if can lay) / Nutritional Paste (if cannot lay)
  - **Lay Eggs** [Summon]
  - **Smash** [Attack] dmg 16/17
  - **Tenderizer** [Attack + Debuff] dmg 7/8
  - **Nutritional Paste** [Buff]

## Owl Magistrate — Normal

- HP: 231 / 247
- Appears in: Owl Magistrate (Monster, Act 3 - Glory)
- AI pattern (cycle): Magistrate Scrutiny → Peck Assault → Judicial Flight → Verdict → repeat
  - **Magistrate Scrutiny** [Attack] dmg 16/17
  - **Peck Assault** [Attack] dmg 4×6/4×6
  - **Judicial Flight** [Buff]
  - **Verdict** [Attack + Debuff] dmg 33/36

## Pael's Legion — Normal

- HP: 9999 / ?
- AI pattern (cycle): 
  - **Nothing** [Unknown]

## Parafright — Normal

- HP: 21 / ?
- Starts with: ILLUSION 1
- Appears in: The Obscura (Monster, Act 2 - Hive)
- AI pattern (cycle): Always uses Slam
  - **Slam** [Attack] dmg 16/17

## Punch Construct — Normal

- HP: 55 / 60
- Starts with: ARTIFACT 1
- Appears in: Construct Menagerie (Monster, Act 3 - Glory); Punch Construct (Monster, Act 1 - Underdocks); Punch Constructs (Monster, None)
- AI pattern (cycle): 
  - **READY** [Defend] block 10
  - **Strong Punch** [Attack] dmg 14/16
  - **Fast Punch** [Attack + Debuff] dmg 5×2/6×2

## Scroll of Biting — Normal

- HP: 30–37 / 33–39
- Starts with: PAPER_CUTS 2
- Appears in: Many Scrolls of Biting (Monster, Act 3 - Glory); Scrolls of Biting (Monster, Act 3 - Glory)
- AI pattern (random): 
  - **Chomp** [Attack] dmg 14/16
  - **Chew** [Attack] dmg 5×2/6×2
  - **More Teeth** [Buff]

## Seapunk — Normal

- HP: 44–46 / 47–49
- Appears in: Seapunk (Monster, Act 1 - Underdocks); Underdocks Wildlife (Monster, Act 1 - Underdocks)
- AI pattern (cycle): Sea Kick → Spinning Kick → Bubble Burp → repeat
  - **Sea Kick** [Attack] dmg 11/13
  - **Spinning Kick** [Attack] dmg 2×4/None×4
  - **Bubble Burp** [Buff + Defend] block 7

## Sewer Clam — Normal

- HP: 56 / 58
- Appears in: Sewer Clam (Monster, Act 1 - Underdocks)
- AI pattern (cycle): 
  - **Pressurize** [Buff]
  - **Jet** [Attack] dmg 10/11

## Shrinker Beetle — Normal

- HP: 38–40 / 40–42
- Appears in: Overgrowth Crawlers (Monster, Act 1 - Overgrowth); Shrinker Beetle (Monster, Act 1 - Overgrowth)
- AI pattern (cycle): Shrinker → Chomp → Stomp → repeat
  - **Shrinker** [Debuff]
  - **Chomp** [Attack] dmg 7/8
  - **Stomp** [Attack] dmg 13/14

## Slimed Berserker — Normal

- HP: 261 / 281
- Appears in: Slimed Berserker (Monster, Act 3 - Glory)
- AI pattern (cycle): Always uses Vomit Ichor
  - **Vomit Ichor** [Status]
  - **Leeching Hug** [Debuff + Buff]
  - **Smother** [Attack] dmg 30/33
  - **Furious Pummeling** [Attack] dmg 4×4/5×4

## Slithering Strangler — Normal

- HP: 53–55 / 54–56
- Appears in: Strangler and Friend (Monster, Act 1 - Overgrowth)
- AI pattern (random): Starts with Constrict
  - **Constrict** [Debuff]
  - **Thwack** [Attack + Defend] dmg 7/8 block 5
  - **Lash** [Attack] dmg 12/13

## Sludge Spinner — Normal

- HP: 37–39 / 41–42
- Appears in: Sludge Spinner (Monster, Act 1 - Underdocks)
- AI pattern (random): Starts with Oil Spray
  - **Oil Spray** [Attack + Debuff] dmg 8/9
  - **Slam** [Attack] dmg 11/12
  - **Rage** [Attack + Buff] dmg 6/7

## Slumbering Beetle — Normal

- HP: 86 / 89
- Starts with: PLATING 15, SLUMBER 3
- Appears in: Slumber Party (Monster, Act 2 - Hive)
- AI pattern (conditional): Starts with Snore
  - **Snore** [Sleep]
  - **Roll Out** [Attack + Buff] dmg 16/18

## Snapping Jaxfruit — Normal

- HP: 31–33 / 34–36
- Appears in: Overgrowth Flora (Monster, Act 1 - Overgrowth); Strangler and Friend (Monster, Act 1 - Overgrowth)
- AI pattern (cycle): Always uses Energy Orb
  - **Energy Orb** [Attack + Buff] dmg 3/4

## Sneaky Gremlin — Normal

- HP: 10–14 / 11–15
- Appears in: Two Gremlins in a Trenchcoat (Monster, Act 1 - Underdocks)
- AI pattern (cycle): Always uses Wake Up
  - **Wake Up** [Stun]
  - **Tackle** [Attack] dmg 9/10

## Spiny Toad — Normal

- HP: 116–119 / 121–124
- Appears in: Spiny Toad (Monster, Act 2 - Hive)
- AI pattern (cycle): Protruding Spikes → Spike Explosion → Tongue Lash → repeat
  - **Protruding Spikes** [Buff]
  - **Spike Explosion** [Attack] dmg 23/25
  - **Tongue Lash** [Attack] dmg 17/19

## Stabbot — Normal

- HP: 18–23 / 19–24
- AI pattern (cycle): Always uses Stab
  - **Stab** [Attack + Debuff] dmg 11/12

## The Adversary Mk 1 — Normal

- HP: 100 / ?
- Starts with: ARTIFACT 0
- AI pattern (cycle): Smash → Beam → Barrage → repeat
  - **Smash** [Attack] dmg 12/None
  - **Beam** [Attack] dmg 15/None
  - **Barrage** [Attack + Buff] dmg 8×2/None×2

## The Adversary Mk 2 — Normal

- HP: 200 / 200
- Starts with: ARTIFACT 1
- AI pattern (cycle): Bash → Flame Beam → Barrage → repeat
  - **Bash** [Attack] dmg 13/None
  - **Flame Beam** [Attack] dmg 16/None
  - **Barrage** [Attack + Buff] dmg 9×2/None×2

## The Adversary Mk 3 — Normal

- HP: 300 / 300
- Starts with: ARTIFACT 2
- AI pattern (cycle): Crash → Flame Beam → Barrage → repeat
  - **Crash** [Attack] dmg 15/None
  - **Flame Beam** [Attack] dmg 18/None
  - **Barrage** [Attack + Buff] dmg 10×2/None×2

## The Architect — Normal

- HP: 9999 / ?
- Appears in: The Architect (Monster, None)
- AI pattern (cycle): Always uses Nothing
  - **Nothing** [Unknown]

## The Forgotten — Normal

- HP: 106 / 111
- Starts with: POSSESS_SPEED 1
- Appears in: Lost and Forgotten (Monster, Act 3 - Glory)
- AI pattern (cycle): Always uses Miasma
  - **Miasma** [Debuff + Defend + Buff] block 8
  - **Dread** [Attack]

## The Lost — Normal

- HP: 93 / 99
- Starts with: POSSESS_STRENGTH 1
- Appears in: Lost and Forgotten (Monster, Act 3 - Glory)
- AI pattern (cycle): Always uses Debilitating Smog
  - **Debilitating Smog** [Debuff + Buff]
  - **Eye Lasers** [Attack] dmg 4×2/5×2

## The Merchant??? — Normal

- HP: 165 / 175
- Appears in: The Merchant??? (Monster, None)
- AI pattern (random): Starts with Swipe
  - **Swipe** [Attack] dmg 13/15
  - **Spew Coins** [Attack] dmg 2/None
  - **Throw Relic** [Attack + Debuff] dmg 9/10
  - **Enrage** [Buff]

## The Obscura — Normal

- HP: 123 / 129
- Appears in: The Obscura (Monster, Act 2 - Hive)
- AI pattern (random): Starts with Illusion
  - **Illusion** [Summon]
  - **Piercing Gaze** [Attack] dmg 10/11
  - **Sail** [Buff]
  - **Hardening Strike** [Attack + Defend] dmg 6/7 block 6

## Thieving Hopper — Normal

- HP: 79 / 84
- Starts with: ESCAPE_ARTIST 5
- Appears in: Thieving Hopper (Monster, Act 2 - Hive)
- AI pattern (cycle): Thievery → Flutter → Hat Trick → Nab → Escape → repeat
  - **Thievery** [Attack + Debuff] dmg 17/19
  - **Nab** [Attack] dmg 14/16
  - **Hat Trick** [Attack] dmg 21/23
  - **Flutter** [Buff]
  - **Escape** [Escape]

## Toadpole — Normal

- HP: 21–25 / 22–26
- Appears in: Toadpoles (Monster, Act 1 - Underdocks)
- AI pattern (conditional): then conditional: Whirl (if not in front) / Spiken (if in front)
  - **Spike Spit** [Attack] dmg 3×3/4×3
  - **Whirl** [Attack] dmg 7/8
  - **Spiken** [Buff]

## Tough Egg — Normal

- HP: 14–18 / 15–19
- Appears in: Ovicopter (Monster, Act 2 - Hive)
- AI pattern (cycle): Always uses Hatch
  - **Hatch** [Summon]
  - **Nibble** [Attack] dmg 4/5

## Tracker Raider — Normal

- HP: 21–25 / 22–26
- Appears in: Ruby Raiders (Monster, Act 1 - Overgrowth)
- AI pattern (cycle): Always uses Track
  - **Track** [Debuff]
  - **Unleash the Hounds** [Attack] dmg 1×8/1×8

## Tunneler — Normal

- HP: 87 / 92
- Appears in: Tunneler (Monster, Act 2 - Hive); Tunneling Twosome (Monster, None)
- AI pattern (cycle): Bite → Burrow → Attack from Below → repeat
  - **Bite** [Attack] dmg 13/15
  - **Burrow** [Buff + Defend] block 32
  - **Attack from Below** [Attack] dmg 23/26
  - **Dizzy** [Stun]

## Turret Operator — Normal

- HP: 41 / 51
- Appears in: Turret Operator (Monster, Act 3 - Glory)
- AI pattern (cycle): Unload! → Unload Move 2 → Reload → repeat
  - **Unload!** [Attack] dmg 3×5/4×5
  - **Unload Move 2** [Attack] dmg 3×5/4×5
  - **Reload** [Buff]

## Twig Slime (M) — Normal

- HP: 26–28 / 27–29
- Appears in: Group of Slimes (Monster, Act 1 - Overgrowth); Shroom and Slime (Monster, Act 1 - Overgrowth); Strangler and Friend (Monster, Act 1 - Overgrowth); Swarm of Slimes (Monster, Act 1 - Overgrowth)
- AI pattern (random): Starts with Sticky Shot
  - **Pokey Pounce** [Attack] dmg 11/12
  - **Sticky Shot** [Status]

## Twig Slime (S) — Normal

- HP: 7–11 / 8–12
- Appears in: Group of Slimes (Monster, Act 1 - Overgrowth); Strangler and Friend (Monster, Act 1 - Overgrowth); Swarm of Slimes (Monster, Act 1 - Overgrowth)
- AI pattern (cycle): Always uses Tackle
  - **Tackle** [Attack] dmg 4/5

## Two-Tailed Rat — Normal

- HP: 17–21 / 18–22
- Appears in: Two-Tailed Rats (Monster, Act 1 - Underdocks)
- AI pattern (random): 
  - **Scratch** [Attack] dmg 8/9
  - **Disease Bite** [Attack] dmg 6/7
  - **Screech** [Debuff]
  - **Call for Backup** [Summon]

## Vine Shambler — Normal

- HP: 61 / 64
- Appears in: Vine Shambler (Monster, Act 1 - Overgrowth)
- AI pattern (cycle): Swipe → Grasping Vines → Chomp → repeat
  - **Grasping Vines** [Attack + Debuff] dmg 8/9
  - **Swipe** [Attack] dmg 6×2/7×2
  - **Chomp** [Attack] dmg 16/18

## Zapbot — Normal

- HP: 18–23 / 19–24
- Starts with: HIGH_VOLTAGE 2
- AI pattern (cycle): Always uses Zap
  - **Zap** [Attack] dmg 14/15

## Bygone Effigy — Elite

- HP: 127 / 132
- Starts with: SLOW 1
- Appears in: Bygone Effigy (Elite, Act 1 - Overgrowth)
- AI pattern (cycle): Sleep → Wake → Slashes → repeat
  - **Sleep** [Sleep]
  - **Wake** [Buff]
  - **Sleep Move 2** [Sleep]
  - **Slashes** [Attack] dmg 13/15

## Byrdonis — Elite

- HP: 81–84 / 90
- Starts with: TERRITORIAL 1
- Appears in: Byrdonis (Elite, Act 1 - Overgrowth)
- AI pattern (cycle): 
  - **Peck** [Attack] dmg 3×3/4×3
  - **Swoop** [Attack] dmg 17/19

## Decimillipede — Elite

- HP: 40–46 / 46–52
- Starts with: REATTACH 25
- AI pattern (random): 
  - **Writhe** [Attack] dmg 5×2/6×2
  - **Bulk** [Attack + Buff] dmg 6/7
  - **Constrict** [Attack + Debuff] dmg 8/9
  - **Dead** [Unknown]
  - **Reattach** [Heal]

## Decimillipede Segment (Back) — Elite

- HP: 40–46 / 46–52
- Appears in: The Decimillipede (Elite, Act 2 - Hive)
  - **Writhe** [Attack] dmg 5×2/6×2
  - **Bulk** [Attack + Buff] dmg 6/7
  - **Constrict** [Attack + Debuff] dmg 8/9
  - **Dead** [Unknown]
  - **Reattach** [Heal]

## Decimillipede Segment (Front) — Elite

- HP: 40–46 / 46–52
- Appears in: The Decimillipede (Elite, Act 2 - Hive)
  - **Writhe** [Attack] dmg 5×2/6×2
  - **Bulk** [Attack + Buff] dmg 6/7
  - **Constrict** [Attack + Debuff] dmg 8/9
  - **Dead** [Unknown]
  - **Reattach** [Heal]

## Decimillipede Segment (Middle) — Elite

- HP: 40–46 / 46–52
- Appears in: The Decimillipede (Elite, Act 2 - Hive)
  - **Writhe** [Attack] dmg 5×2/6×2
  - **Bulk** [Attack + Buff] dmg 6/7
  - **Constrict** [Attack + Debuff] dmg 8/9
  - **Dead** [Unknown]
  - **Reattach** [Heal]

## Entomancer — Elite

- HP: 145 / 155
- Starts with: PERSONAL_HIVE 1
- Appears in: Entomancer (Elite, Act 2 - Hive)
- AI pattern (cycle): Always uses Beeeees!
  - **Pheromone Spit** [Buff]
  - **Beeeees!** [Attack] dmg 3×7/3×7
  - **Spear!** [Attack] dmg 18/20

## Flail Knight — Elite

- HP: 101 / 108
- Appears in: Knight Gang (Elite, Act 3 - Glory)
- AI pattern (random): Starts with Ram
  - **War Chant** [Buff]
  - **Flail** [Attack] dmg 9×2/10×2
  - **Ram** [Attack] dmg 15/17

## Infested Prism — Elite

- HP: 161 / 171
- Starts with: VITAL_SPARK 2
- Appears in: Infested Prism (Elite, Act 2 - Hive)
- AI pattern (cycle): Jab → Radiate → Whirlwind → Pulsate → repeat
  - **Jab** [Attack] dmg 15/17
  - **Radiate** [Attack + Defend] dmg 11/13 block 11
  - **Whirlwind** [Attack] dmg 5×3/6×3
  - **Pulsate** [Attack + Buff + Defend] dmg 8/10 block 20

## Magi Knight — Elite

- HP: 82 / 89
- Appears in: Knight Gang (Elite, Act 3 - Glory)
- AI pattern (cycle): Power Shield → Dampen → Ram → Prep → Magic Bomb → repeat
  - **Power Shield** [Attack + Defend] dmg 6/7 block 5
  - **Dampen** [Debuff]
  - **Prep** [Defend] block 5
  - **Magic Bomb** [Attack] dmg 35/40
  - **Ram** [Attack] dmg 10/11

## Mecha Knight — Elite

- HP: 300 / 320
- Starts with: ARTIFACT 3
- Appears in: Mecha Knight (Elite, Act 3 - Glory)
- AI pattern (cycle): Charge → Flamethrower → Windup → Heavy Cleave → repeat
  - **Charge** [Attack] dmg 25/30
  - **Flamethrower** [Status]
  - **Windup** [Defend + Buff] block 15
  - **Heavy Cleave** [Attack] dmg 35/40

## Phantasmal Gardener — Elite

- HP: 26–31 / 27–32
- Starts with: SKITTISH 6
- Appears in: Phantasmal Gardeners (Elite, Act 1 - Underdocks)
- AI pattern (conditional): then conditional: Flail (if in first slot) / Bite (if in second slot) / Lash (if in third slot) / Enlarge (if in fourth slot)
  - **Bite** [Attack] dmg 5/5
  - **Lash** [Attack] dmg 7/7
  - **Flail** [Attack] dmg 1×3/None×3
  - **Enlarge** [Buff]

## Phrog Parasite — Elite

- HP: 61–64 / 66–68
- Starts with: INFESTED 4
- Appears in: Phrog Parasite (Elite, Act 1 - Overgrowth)
- AI pattern (random): Starts: Infect → Lash
  - **Infect** [Status]
  - **Lash** [Attack] dmg 4×4/5×4

## Skulking Colony — Elite

- HP: 75 / 80
- Starts with: HARDENED_SHELL 20
- Appears in: Skulking Colony (Elite, Act 1 - Underdocks)
- AI pattern (cycle): Zoom → Zoom Move 2 → Inertia → Piercing Stabs → repeat
  - **Zoom** [Attack] dmg 14/16
  - **Zoom Move 2** [Attack] dmg 14/16
  - **Inertia** [Attack + Buff] dmg 9/11
  - **Piercing Stabs** [Attack] dmg 7×2/8×2

## Soul Nexus — Elite

- HP: 234 / 254
- Appears in: Soul Nexus (Elite, Act 3 - Glory)
- AI pattern (random): Starts with Soul Burn; then random: Soul Burn (no repeat), Maelstrom (no repeat), Drain Life (no repeat)
  - **Soul Burn** [Attack] dmg 29/31
  - **Maelstrom** [Attack] dmg 6×4/7×4
  - **Drain Life** [Attack + Debuff] dmg 18/19

## Spectral Knight — Elite

- HP: 93 / 97
- Appears in: Knight Gang (Elite, Act 3 - Glory)
- AI pattern (random): Starts: Hex → Soul Slash
  - **Hex** [Debuff]
  - **Soul Slash** [Attack] dmg 15/17
  - **Soul Flame** [Attack] dmg 3×3/4×3

## Terror Eel — Elite

- HP: 140 / 150
- Starts with: SHRIEK 70
- Appears in: Terror Eel (Elite, Act 1 - Underdocks)
- AI pattern (cycle): Crash → Thrash → repeat
  - **Crash** [Attack] dmg 16/18
  - **Thrash** [Attack + Buff] dmg 3×3/4×3
  - **Stun** [Stun]
  - **Terrorize** [Debuff]

## Wriggler — Elite

- HP: 17–21 / 18–22
- Appears in: Phrog Parasite (Elite, Act 1 - Overgrowth); Wrigglers (Monster, None)
- AI pattern (conditional): 
  - **Nasty Bite** [Attack] dmg 6/7
  - **Wriggle** [Buff + Status]
  - **Spawned** [Stun]

## Aeonglass — Boss

- HP: 512 / 535
- Starts with: ARTIFACT 3
- Appears in: Aeonglass (Boss, Act 3 - Glory)
- AI pattern (cycle): Ebb → Eye Lasers → Increasing Intensity → repeat
  - **Ebb** [Attack + Defend] dmg 26/32 block 33
  - **Eye Lasers** [Attack] dmg 11×2/12×2
  - **Increasing Intensity** [Status + Buff]

## Ceremonial Beast — Boss

- HP: 252 / 262
- Appears in: Ceremonial Beast (Boss, Act 1 - Overgrowth)
- AI pattern (cycle): Stamp → Plow → repeat
  - **Stamp** [Buff]
  - **Plow** [Attack + Buff] dmg 18/20
  - **Stun** [Stun]
  - **Beast Cry** [Debuff]
  - **Stomp** [Attack] dmg 15/17
  - **Crush** [Attack + Buff] dmg 17/19

## Crusher — Boss

- HP: 209 / 219
- Starts with: BACK_ATTACK_LEFT 1, CRAB_RAGE 1
- Appears in: Kaiser Crab (Boss, Act 2 - Hive)
- AI pattern (cycle): Thrash → Enlarging Strike → Bug Sting → Adapt → Guarded Strike → repeat
  - **Thrash** [Attack] dmg 12/14
  - **Enlarging Strike** [Attack] dmg 4/4
  - **Bug Sting** [Attack + Debuff] dmg 6×2/7×2
  - **Adapt** [Buff]
  - **Guarded Strike** [Attack + Defend] dmg 12/14 block 18

## Kin Follower — Boss

- HP: 58–59 / 62–63
- Starts with: MINION 1
- Appears in: The Kin (Boss, Act 1 - Overgrowth)
- AI pattern (cycle): Power Dance → Quick Slash → Boomerang → repeat
  - **Quick Slash** [Attack] dmg 5/5
  - **Boomerang** [Attack] dmg 2×2/2×2
  - **Power Dance** [Buff]

## Kin Priest — Boss

- HP: 190 / 199
- Appears in: The Kin (Boss, Act 1 - Overgrowth)
- AI pattern (cycle): Orb of Frailty → Orb of Weakness → Soul Beam → Dark Ritual → repeat
  - **Orb of Frailty** [Attack + Debuff] dmg 8/9
  - **Orb of Weakness** [Attack + Debuff] dmg 8/9
  - **Soul Beam** [Attack] dmg 3×3/3×3
  - **Dark Ritual** [Buff]

## Knowledge Demon — Boss

- HP: 379 / 399
- Appears in: Knowledge Demon (Boss, Act 2 - Hive)
- AI pattern (conditional): Starts: Curse of Knowledge → Slap → Knowledge Overwhelming → Ponder; then conditional: Curse of Knowledge (if curse of knowledge counter < 3) / Slap (if curse of knowledge counter >= 3)
  - **Curse of Knowledge** [Debuff]
  - **Slap** [Attack] dmg 17/18
  - **Knowledge Overwhelming** [Attack] dmg 8×3/9×3
  - **Ponder** [Attack + Heal + Buff] dmg 11/13

## Lagavulin Matriarch — Boss

- HP: 222 / 233
- Starts with: PLATING 12, ASLEEP 3
- Appears in: Lagavulin Matriarch (Boss, Act 1 - Underdocks)
- AI pattern (conditional): Starts with Sleep
  - **Sleep** [Sleep]
  - **Slash** [Attack] dmg 19/21
  - **Slash2** [Attack + Defend] dmg 12/14 block 12
  - **Disembowel** [Attack] dmg 9×2/10×2
  - **Soul Siphon** [Debuff + Buff]

## Queen — Boss

- HP: 400 / 419
- Appears in: Queen (Boss, Act 3 - Glory)
- AI pattern (conditional): Starts: Puppet Strings → You Are Mine; then conditional: Burn Bright for Me (if does not have amalgam died) / Off with Your Head (if has amalgam died); then conditional: Burn Bright for Me (if does not have amalgam died) / Off with Your Head (if has amalgam died)
  - **Puppet Strings** [Debuff]
  - **You Are Mine** [Debuff]
  - **Burn Bright for Me** [Buff + Defend] block 20
  - **Off with Your Head** [Attack] dmg 3×5/4×5
  - **Execution** [Attack] dmg 15/18
  - **Enrage** [Buff]

## Rocket — Boss

- HP: 199 / 209
- Starts with: BACK_ATTACK_RIGHT 1, CRAB_RAGE 1
- Appears in: Kaiser Crab (Boss, Act 2 - Hive)
- AI pattern (cycle): Targeting Reticle → Precision Beam → Charge Up → Laser → Recharge → repeat
  - **Targeting Reticle** [Attack] dmg 3/4
  - **Precision Beam** [Attack] dmg 18/20
  - **Charge Up** [Buff]
  - **Laser** [Attack] dmg 31/35
  - **Recharge** [Sleep]

## Soul Fysh — Boss

- HP: 211 / 221
- Appears in: Soul Fysh (Boss, Act 1 - Underdocks)
- AI pattern (cycle): Beckon → De-Gas → Gaze → Fade → Scream → repeat
  - **Beckon** [Status]
  - **De-Gas** [Attack] dmg 16/17
  - **Gaze** [Attack + Status] dmg 7/8
  - **Fade** [Buff]
  - **Scream** [Attack + Debuff] dmg 13/15

## Test Subject #C14 — Boss

- HP: ? / ?
- Starts with: ADAPTABLE 1, ENRAGE 2
- Appears in: Test Subject (Boss, Act 3 - Glory)
- AI pattern (conditional): Starts: Bite → Skull Bash; then conditional: Multi-Claw (if respawns < 2) / Lacerate (if respawns >= 2)
  - **Respawn** [Heal + Buff]
  - **Bite** [Attack] dmg 20/22
  - **Skull Bash** [Attack + Debuff] dmg 14/16
  - **Multi-Claw** [Attack] dmg 10/11
  - **Lacerate** [Attack] dmg 10×3/11×3
  - **Big Pounce** [Attack] dmg 45/None
  - **Burning Growl** [Status + Buff]

## The Insatiable — Boss

- HP: 321 / 341
- Appears in: The Insatiable (Boss, Act 2 - Hive)
- AI pattern (cycle): Liquify Ground → Thrash → Lunging Bite → Salivate → Thrash Move 2 → repeat
  - **Liquify Ground** [Buff + Status]
  - **Thrash** [Attack] dmg 8×2/9×2
  - **Thrash Move 2** [Attack] dmg 8×2/9×2
  - **Lunging Bite** [Attack] dmg 28/31
  - **Salivate** [Buff]

## Torch Head Amalgam — Boss

- HP: 199 / 211
- Starts with: MINION 1
- Appears in: Queen (Boss, Act 3 - Glory)
- AI pattern (cycle): Tackle → Tackle 2 → Beam → Tackle 3 → Tackle 4 → repeat
  - **Tackle** [Attack] dmg 18/19
  - **Tackle 2** [Attack] dmg 18/19
  - **Beam** [Attack] dmg 8×3/8×3
  - **Tackle 3** [Attack] dmg 14/15
  - **Tackle 4** [Attack] dmg 14/15

## Vantom — Boss

- HP: 173 / 183
- Starts with: SLIPPERY 8
- Appears in: Vantom (Boss, Act 1 - Overgrowth)
- AI pattern (cycle): Ink Blot → Inky Lance → Dismember → Prepare → repeat
  - **Ink Blot** [Attack] dmg 7/8
  - **Inky Lance** [Attack] dmg 6×2/7×2
  - **Dismember** [Attack + Status] dmg 26/30
  - **Prepare** [Buff]

## Waterfall Giant — Boss

- HP: 240 / 250
- Appears in: Waterfall Giant (Boss, Act 1 - Underdocks)
- AI pattern (cycle): Pressurize → Stomp → Ram → Siphon → Pressure Gun → Pressure Up → repeat
  - **Pressurize** [Buff]
  - **Stomp** [Attack + Debuff + Buff] dmg 15/16
  - **Ram** [Attack + Buff] dmg 10/11
  - **Siphon** [Heal + Buff]
  - **Pressure Gun** [Attack + Buff]
  - **Pressure Up** [Attack + Buff] dmg 13/14
  - **About to Blow** [Stun]
  - **Explode** [Special]

