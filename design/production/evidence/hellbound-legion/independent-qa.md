# Hellbound Legion independent QA

Reviewer: `/root/hellbound_qa`, separate from rules, UI and card builders. Reviewed 2026-10-12. No production edits, commits, publishing or user-save manipulation. Applied `.agents/skills/runelord-playtest/SKILL.md`, production workflow and acceptance route.

## Revision and environment

Conquer: `C:/Users/wilsh/Projects/runelord`, base HEAD `03338e4`, pending working tree. Roguelike: `C:/Users/wilsh/Projects/runelord-roguelike-pages-recovery`, base HEAD `be1dc8c85d04dbf335352a212cd1d16efedf0700`, pending working tree.

Reviewed SHA-256: Conquer engine `9E275C1E9EA481428204302195DED13460E17C806179FF84F1345D0BB4CB0B7E`; Roguelike engine `E7A6B634D49A2022F7BF69234B66E2AA11B1F3D52FC4CA43191B028EB599A648`; shared `packages/content/hellbound.ts` `B3EA2E58FA2F8A0E8458DEFE673F435BD7AD5A2712D635304A1D9AFB1515E29B`; shared layout `B58C445351C2E371A9D1770D543F03AF42705E2719A42CF369509A9E4FEAF345`.

Browser: isolated Roguelike origin `http://127.0.0.1:4343`, 1280x720. Normal `/` player flow and explicit `/hellbound-review?group=hellgate` / `?group=bodyguards` fixtures were tested separately. Fixture startup is synthetic, subsequent actions use real controls and dispatcher. Fixture checks do not count as natural acquisition. Existing user ports 4320/4321 were not touched. Root independently reviewed Conquer browser 4342; that review is not represented here as my own.

## Independent behavioral checks: pass

Temporary probe: `work/production/hellbound-legion/independent-probe.ts` in Conquer, invoked with each checkout as working directory using `npx tsx <probe path>`. Seven independently authored probe groups pass in both modes:

1. Both pair-recruit cards at every occupancy from zero through five: at most three existing allies succeeds with exactly two recruits; four/five rejects even with a dismissal ID, with no partial payment/card loss/mutation.
2. Explicitly selecting an ordinary Imp for promotion while a valid soldier exists rejects without spending anything.
3. A lethal attack is completely absorbed by a pair of one-HP Legionaries; both die, and the next hostile attack in that same enemy phase correctly damages the Warlock.
4. Three Legionaries split an odd damage packet deterministically; Armor exceeding damage never heals units or produces negative HP damage.
5. A destroyed promoted veteran is removed; a fresh same-kind recruit has a new identity, rank zero, zero Armor and original Power.
6. Four Maledictors still open exactly one Hellgate each turn, before enemies act, and gain one rank per gate for three successive turns.
7. Legal action histories for 25 Pact seeds and 25 Hellbound seeds per mode restore identically. Roguelike uses its actual modern `newRoguelikeRun` constructor. This is 100 checked histories in total across both checkouts.

Builder focused tests were independently executed alongside existing formation regression tests: `npx tsx --test packages/engine/hellbound.test.ts apps/web/src/warbandLayout.test.ts`, 28/28 per mode at execution (15 Hellbound plus 13 layout tests). The builder subsequently added three extra Hellbound checks; root owns final full-suite evidence. Tests cover exact recruit/card-level stats, twelve uncapped promotions, HP increment/healing, Armor-before-Guard, sweeps, voluntary pact costs, duplicate Pikemen, Bulwark support, Hellgate timing, Vanguard Cleave/kill promotion, and wounded veteran transition.

Independently ran `npx tsx tools/sim/warlock.ts --runs=30 --deck=hellbound` in both modes. Conquer: 30 wins, zero losses, zero softlocks, 30 identical replays, maximum 636 actions. Roguelike: 29 wins, one loss, zero softlocks, 30 identical replays, maximum 648 actions. These exercise progression, rewards/shops and combat transitions, but the fixed bot is not a balance certification.

## Browser acceptance: pass

Normal player route: title Start → Warlock selected → Hellbound Legion radio → Begin. Three Warlock starters displayed; Blood Covenant absent and Hellbound present. Fresh battle begins with the ten-card deck, 72 HP and three Mana.

Played Pike Detail from actual starting hand: Mana 3→1, exactly two Ash Pikemen at 12 HP, displayed attack 7 each (five intrinsic plus duplicate bonus), one card discarded. Field Promotion was disabled before any soldier existed, then enabled after recruitment.

Selected Field Promotion and the second Pikeman footer, immediately reloaded during effect presentation, then used title Start and Resume. Result: exactly two Pikemen retained, second has rank 1, Armor 1, 14/14 HP and attack 9; first remains rank zero, 12/12 HP and attack 7. Mana zero and discard two. No duplicate promotion or summon. A preceding development hot reload also restored the pair correctly; this interruption was not mistaken for a gameplay failure.

Hellgate fixture: cast Hellgate Rite using actual controls. Both enemies 180→174 HP, two Scorch each, all three Maledictors and Bulwark promoted exactly once. Maledictors become 16 HP/5 Power/rank 1/Armor 1; Bulwark 30 HP/4 Power. Mana 10→8 and two cards drawn. End Turn performs normal attacks and enemy phase, reaches turn two, and all remain rank one: Rite and automatic end-turn gate did not double-trigger. Bulwark grants each soldier three Guard next turn. Controls unlock after resolution.

Bodyguard fixture: promote first Legionary to 20 HP/6 Power/rank 1/Armor 1, then End Turn against two 12-damage ignore-defender attacks. Warlock remains 100/100. First Legionary ends 10/20 HP and second 6/18: each receives six per attack, with the promoted unit reducing each hit by one. Enemy intent explicitly names Legionary bodyguards. Bodyguard counter reads 2/2; individual duplicate footers remain selectable.

Final normal battle screenshot review shows finished illustrated Ash Pikeman, Rally the Legion and Maledictor cards, correct parchment frame/cost/name presentation, restored rank/Armor stats and intact battle controls at 1280x720. Earlier fallback text cards during production were superseded. No captured browser console warnings or errors in these routes.

## Runtime and visual inspection

All six integrated actor definitions face right. Checked 219 referenced runtime image paths across Imp, Vanguard, Maledictor, Legionary, Bulwark and Pikeman: none missing. Required idle, attack, hit, wounded idle, spawn and death states present; Maledictor attack intentionally aliases its authored cast.

Intrinsic model metadata makes Vanguard 1.2075 world units versus Legionary 1.05: 15% taller. Imp standing height is approximately 0.6273 world units, roughly 125 pixels at normal ground scale, well below the soldiers. The reviewed formation order is Vanguard, Maledictor, Pikeman, Bulwark, Legionary, satisfying the requested Legionary/Pikeman swap. Three-Maledictor and paired-Legionary browser fixtures showed independently readable footer targets. Detailed every-frame identity/smoothness audit is not claimed.

## Findings and limitations

No unresolved blocking defect in independently tested Hellbound behavior. An initial focused replay assertion compared an explicit `undefined` action field against its JSON-serialized absence; builder corrected fixture construction and rerun passed. An early intent-order concern was resolved by final rules explicitly giving paired Legionaries precedence over Defender; label and rules now agree.

Existing developer-only `newRun(..., summonRulesFrom=0)` with a schema-3 Roguelike save does not retain that modern marker; this predates the feature and is not the production player path. Modern `newRoguelikeRun` schema-8 histories passed. No legacy-save compatibility claim relies on that unsupported combination.

Full campaign manual play, mobile landscape, keyboard-only controls, reduced motion, audio loop listening, exhaustive art-frame review and measured FPS were not run by this reviewer. Parent owns final production builds, full suites, larger simulation run, complete 14-card art inventory and exact manifest checks after integration. Browser screenshots demonstrate appearance and authoritative state, not measured frame rate. Preserve these limitations in final acceptance.
