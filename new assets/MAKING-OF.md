# What the work is, and how it was made

This guide combines the recovered chat direction with the actual prompts, scripts and manifests. Approval, completed export, historical QA and production integration are separate statuses. A user saying a preview looks good is not evidence that every later frame received exact-hash gallery approval.

## Five ice monsters

**Rimejaw** is a low, heavy quadrupedal ambush creature with oversized forelimbs and a split shovel-like ice jaw. **Bellwraith** is a floating hollow ice bell surrounding a stern face, with hanging shards. **Driftling Broodmother** is a low, wide snow-basin creature carrying three angular brood heads. **Needlecrown** is a narrow biped with a swept ice crown and a dark mineral core. **Thawbelly** is a barrel-bodied quadruped with a waterline and heartstone inside its hanging frozen belly.

The first reference selection used old Warlock/Pleatcap art; the user rejected that selection. The corrected generation direction used newer Forest Sovereign, Gorthak and Abyssal Seraph imagery, with dimensional 2D shapes, curved organic silhouettes, crisp cel shadows and separated ice/stone materials. The exact reference hashes and shared/per-monster brief are in [ice-monster-brief.txt](ice-and-map/assets/ice-monster-brief.txt). Image generation produced isolated concept illustrations with backdrops, not transparent combat sprites.

The user required enemies to face screen left. Four existing images were horizontally mirrored with permission; Thawbelly was generated left-facing. Bellwraith still reads mostly frontal and remains provisional. The recovered review also noted denser facets/glow than requested, an armored-ice reading for Broodmother and long arms on Needlecrown. Suggested attacks were design hooks, not implemented mechanics. No ice animation or gameplay integration was completed in these chats.

## Initial Warlock concept exploration

The first five written ideas—Sootwing, Riftstrider, Oathgullet, Unbidden Hand and Griefneedle—were rejected for reading like red animals/objects rather than demons. The replacement brief proposed Ashhorn Hexer, Vexrath the Red Advocate, Gormaw the Oath-Eater, Velissa the Whisperer and Chainbound Scourger. Their identities, silhouettes and possible roles are preserved in [warlock-concepts.md](summons/assets/warlock-concepts.md).

Early prose-only renders were also rejected for excessive realism and detail. The workflow shifted to supplying actual Imp and Pit Brute art to the generator, then to the user's requested more refined current reference direction. The archive retains generated experiments where recovered; a named written concept should not be assumed to have a finished exported or animated asset. The concept brief records its own superseded directions and limitations.

## Ashhorn, Covenant Ram, Ignivar and Pit Brute

The loose PNG/JSON pairs in [summons/assets](summons/assets) preserve individual reference-driven revisions: `ashhorn-style-r2`, `covenant-ram-concept-r1`, `covenant-ram-seraph-r2`, `ignivar-refined-r2`, and `pit-brute-armored-r2`, `pit-brute-head-r3`, `pit-brute-horns-r4`.

These were iterative image edits, not new gameplay definitions. Each companion JSON contains the concrete prompt and reference paths. Pit Brute revisions progress through armor, head and horn refinement. Covenant Ram has both its initial concept and a Seraph-influenced revision. The prompts are the precise record of which features were requested; revision numbers alone do not establish approval or implementation.

## Imp refinement and flight

The Imp retains crimson skin, black horns, bat wings, a wiry crouched body, claws and a small dark waist wrap. `imp-refined-r2.json` records a reference-guided image edit using the original Imp, refined Pit Brute and Abyssal Seraph for anatomy and illustration finish. `imp-hands-r3.png` and `imp-flying-r4.png` preserve subsequent pose/hand and flying-source work.

The idle family is `imp-idle-8` through `imp-idle-8-r5`. It developed from an eight-frame wingbeat into corrected crops, more stable proportions, four body poses combined with wing motion, and finally steadier legs with subtle floating. The user explicitly liked the later floating direction and requested the remaining states. Earlier animation versions remain because they explain the feedback and fixes.

[imp-states-r1](summons/assets/imp-states-r1) adds attack, hit, wounded hover, summon arrival and death around that idle. Image-generated action/keypose material was extracted into frames, cleaned and registered, then packed into previews and timed manifests. A review found a body-size jump at the spawn-to-idle transition; the saved independent review records its correction. The initial idle review also flagged a clipped wingtip and stray fragments. Read the per-bundle reviews and QA rather than assuming every earlier revision passed.

## Demon soldiers, captain and casters

**Iron Legionary** is a heavy sword-and-shield demon infantryman. **Ash Pikeman** is a leaner spear soldier with lighter armor and more exposed upper arms. Their r1 concept set was considered too refined; r2 introduced jagged hooked armor and glowing demonic weapon runes. The two revisions and their exact generation inputs are in `demon-soldier-samples-r1` and `demon-soldier-samples-r2`.

The family then expanded with **Infernal Captain**, **Infernal Battlemage** and **Maledictor**, a curse caster. The captain's first distinction relied too much on cloth. User feedback led to elite armor, a helmet and removal of an unwanted head/shoulder ornament. `demon-command-robes-r1` also introduced cloth-only caster directions, Ember Ritualist and Hex Votary. `infernal-captain-alternates-r1` explores three darker-armored alternatives, including the Dread Vanguard direction subsequently animated.

**Ember Ritualist** variants are Cinder Veil (hood and hanging sleeves), Black Covenant (broad ceremonial mantle) and Oathbound Hexer (asymmetric robes/exposed casting arm). **Hex Votary** variants are Dread Cowl, Gallows Veil and Widow's Shroud. They explore more sinister demonic cloth silhouettes. These are generated concept edits with individual PNGs, review boards and prompts/provenance, not balanced new units.

Review boards were composed from the exported art with preserved aspect ratios and labels. Saved checks include full-size and small-size readability, alpha/transparency and silhouette review. Art submissions remained pending unless the exact hash has a decision in the preserved ledger.

## Goatman family

**Cinderhorn Reaver** is a broad ram-horned cleaver fighter. **Blackhorn Cantor** is a lean long-horned occultist with an ash-white facial blaze. The first expansion adds **Ironhorn Bulwark**, a shield guardian; **Gorehook Stalker**, a hooked-polearm hunter; and **Ashbone Elder**, a sacrificial shaman.

The second expansion revision gives Bulwark more demonic shield/cudgel forms, Stalker glowing weapon runes and Elder a sinister hood and mantle. The concepts were generated from the supplied project references, checked individually and on comparison boards, and submitted to the gallery. Each family folder retains its `provenance.json` with exact prompts and source information.

The later `ironhorn-bulwark-source-r3` corrects an unrealistic bend in the weapon handle. This distinction matters: the user wanted the source handle repaired while keeping normal breathing, rather than globally freezing the character's equipment/body.

## Dread Vanguard: idle, fire and empowerment

Dread Vanguard is the heavily armored dark captain variant brought into a battle stance. The initial eight-frame idle (`idle-r1`) used one source pose with technical sway/lighting changes and subtle rune/eye flicker; it was not eight newly authored poses. The user asked for stronger movement, fiery effects and a glowing blade edge.

`idle-r2` introduced more motion and flames. Further revisions reduce the excessive third-frame pose. A correction reused a pose with painted fire, so only brightness varied and the flames appeared frozen; the chat explicitly identifies that defect. `idle-r5` restores changing flame shapes while preserving the corrected body movement. These revisions are retained separately so the failure and repair are inspectable.

The empowerment branch creates matching unlit and fiery states from a shared unlit master. Initial fire alignment was rough. `dread-vanguard-aligned-fire-r1` redraws the effect along the blade, and `dread-vanguard-four-fire-r1` uses all four distinct flame phases across an eight-frame loop after the user found that only one phase was being used. `dread-vanguard-effect-alternatives-r1` preserves static molten cutting-edge and rune-ignition alternatives; those are direction previews, not pixel-registered effect layers.

Scripts in [summons/making-of](summons/making-of) preserve source preparation, effect extraction, alpha/mask composition, frame export, alignment and validation logic. The metadata distinguishes generated keyposes from technical transformations of an existing source. Later preview scaling increased the displayed character by 30%, then another 10% (1.43 times the original). Historical previews temporarily used the Pit Brute gameplay slot; this archive does not make Vanguard a new production summon.

## Dread Vanguard: complete states and registration repair

`dread-vanguard-states-r1` adds cleave/attack, cast/command, hit, block, wounded idle, arrival and death. Whole-character action keyposes were generated, extracted, cleaned and placed on shared canvases. Reaction states and lifecycle states used small authored keypose sets, so their movement is deliberately stepped. Attack fire clipping and detached fragments were found and repaired during historical review.

The user then reported inconsistent scale and a floating corpse. `dread-vanguard-states-r2` preserves offline anatomical-scale correction around a fixed floor anchor, with the death body registered separately from the dropped sword. Its `registration.json` records the scale corrections and body-ground shifts. The saved QA reports a 2000×1200 final frame canvas with anchor `[1000,1080]` and preserved idle pixels. These are evidence from that export, not a fresh live-game certification.

## Maledictor, Bulwark, Legionary and Pikeman animation

All four first received eight-frame breathing idles with restrained movement and emissive flicker. Maledictor includes staff movement, crystal/rune flicker and four distinct hand-flame phases. Technical breathing exports deform/translate a source image with motion tapering toward fixed feet; they should not be described as eight independently drawn poses.

For **Iron Legionary**, the user specifically rejected a breathing sword. Revision r3 isolates the sword with a silhouette mask and translates it rigidly with the grip while restoring the rest of the body's original breathing. Metadata records a 720×1024 canvas, 1,440 ms loop and up to 3px upper-body lift. For **Ironhorn Bulwark**, r3 uses the corrected straight-handle source and restores subtle whole-body breathing, with planted feet and restrained emission changes. The r2 rigid-weapon attempts are historical rejected approaches.

The four `*-states-r1` bundles add action/attack or cast, hit, wounded idle, spawn and terminal death. Accepted breathing idles were retained with fixed canvas padding, and new whole-character keypose sheets supplied the action states. Melee bundles alias act/cast to attack where specified. Manifests contain frame paths, timings, event cues, anchors and terminal behavior.

| Bundle | Selected technical evidence |
|---|---|
| [Maledictor](summons/assets/maledictor-states-r1) | 1280×1100 canvas, anchor `[640,1038]`; padded eight-frame idle, authored cast/hit/spawn/death poses; some broader action-pose shape drift noted in review |
| [Iron Legionary](summons/assets/iron-legionary-states-r1) | 1280×1100 canvas, anchor `[640,1030]`; accepted idle-r3 retained; overhead-to-follow-through attack uses sparse keyframes |
| [Ironhorn Bulwark](summons/assets/ironhorn-bulwark-states-r1) | 28 exported frames across idle, attack, hit, wounded idle, spawn and death; original accepted idle preserved |
| [Ash Pikeman](summons/assets/ash-pikeman-states-r1) | 36 exported PNG frames, 1400×1200 canvas, anchor `[700,1093]`; attack impact 270 ms and terminal death 550 ms in the recorded handoff |

Historical static/contact and numerical reviews found no blocking clipping or terminal-death issue after repairs. Maledictor preserved visible idle pixels/alpha while invisible RGB beneath zero alpha differed; Legionary's idle was recorded as pixel-exact. Static checks did not themselves certify live playback. `full-summon-browser-qa.json` and the saved review UI/screenshots preserve the separate browser evidence. These four were preview assets, not established new combat integrations.

## Infernal Plane map and engine investigation

[infernal-plane-all-points.png](ice-and-map/assets/infernal-plane-all-points.png) is a labeled image showing 21 points from the conquest-branch layout. It is a presentation of the map, not a recovered playable conquest build. The subsequent request to open it in-engine launched the roguelike build instead. The chat then reported missing map-screen files in the inspected conquest checkout/history, so a working map launch was unresolved. The archive preserves that distinction.

## Repository setup and Android-port discussion

The clone chat recovered `wiltobuild/runelord` after an initial disk-space failure. It inspected the React/TypeScript/PixiJS game, existing touch/layout/fullscreen handling, and proposed a Capacitor wrapper for Android. It gave rough effort estimates and identified UI readability, performance/download size, app lifecycle, save behavior, signing and device testing as remaining work. No Android app, APK or device test was produced. The exact historical discussion is in the clone chat notes.

The same chat loaded six project role definitions and eight skills, and started some worker roles. Existing role/workflow files were already in the repository; they were not newly built game assets. This archive snapshots the relevant production workflow and links back to the source chats instead of claiming those definitions as newly implemented features.
