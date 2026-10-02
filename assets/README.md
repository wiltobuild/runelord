# Character artwork

Imported from the October 1, 2026 goblin art session. Original designs and revisions are preserved; this is an asset library, not game integration.

## Goblin raiders

- [Base B1](characters/goblin-raider/goblin-base-b1.png) and approved designs: [V1 greatsword](characters/goblin-raider/v1-greatsword-r1.png), [V2 shield veteran](characters/goblin-raider/v2-veteran-r1.png), [V3 skirmisher](characters/goblin-raider/v3-skirmisher-r1.png).
- [Design comparison](characters/goblin-raider/variants.html).
- [Animation preview](characters/goblin-raider/animation/preview-r2.html) and [downloadable package](characters/goblin-raider/animation/goblin-animation-study-r2.zip). Download/open locally to run the HTML previews; GitHub displays their source.
- [Runtime manifest](characters/goblin-raider/animation/manifest.json), [verification](characters/goblin-raider/animation/verification.json), and [approval/handoff record](characters/goblin-raider/handoff.json).

The r2 animation exports are the current prototype: 36 transparent 512x512 frames, three atlases, and idle, attack, hit, wounded-idle, and death for each goblin. Older exports and generated source poses are retained for provenance. The prototype has sparse frames and visible weapon/face/foot continuity issues; V1's idle sword length changes. Full browser playback review remains unverified. It is not production-ready or integrated into gameplay.

## Warg riders

- [Current base B3](characters/wolf-rider-goblins/base-b3-warg.png): fierce warg with armored spear rider, awaiting design approval.
- Earlier [B1](characters/wolf-rider-goblins/base-b1.png) and [B2](characters/wolf-rider-goblins/base-b2.png) wolf designs retained.
- [Design record](characters/wolf-rider-goblins/design-record.json) and [B3 prompt](characters/wolf-rider-goblins/warg-b3-prompt.txt).

The requested leather-armored archer, metal-armored spearman, and staff-bearing shaman variants have not yet been generated. No mounted animations exist yet.

## Style references

[Bundled RuneSpeak references](style-references/runespeak/) come from wiltobuild/RuneSpeak at commit `95416745414f87a1bdc6194b6fe177ad49de4a8c`: `assets/goblins/fighter.png`, `assets/knight-approved.png`, and `assets/kobolds/scout-approved.png`. They anchor the simplified cel shading. Runelord's direction is grittier and more serious with slightly more designed detail, while avoiding realistic rendering. These references are distinct from the generated Runelord assets.
