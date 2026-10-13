# Banshee — base revision 1

Status: base_approved. Base r1 approved on 2026-10-01 with documented edge artifacts; see approval.json. No variants, layers, rig, or animation exists. Created using the built-in image generation tool.

Asset: banshee-base-r1.png, 1254 × 1254 pixels, PNG with genuine alpha. Inspected at full size and approximately 96 px character height over light and dark backgrounds. The silhouette, spectral face, separated claw hands and broad hair remain readable. Main figure has clear padding, although sparse low-alpha pixels extend beyond its visible silhouette (alpha bounds x 0–1197, y 8–1253); refine this fringe before runtime use. 1,023,399 fully transparent pixels were measured. The body includes partially transparent pixels; spectral opacity should be locked across animation frames.

Style reference: C:/Users/wilsh/.codex/skills/hd-fantasy-character/references/runespeak/kobold-scout.png, RuneSpeak commit 95416745414f87a1bdc6194b6fe177ad49de4a8c. Reference is style provenance, not design approval. Broad teal/ivory shapes, crisp graphic shadows, exaggerated head and stern face track the reference rendering with a spectral silhouette. Added details are a single clasp, torn sleeves, and broad hem folds.

Brief: medium humanoid spectral enemy, shallow three-quarter view facing left. Proposed signature attack: a short rising wail with forward-reaching claws. No weapon. Bespoke floating humanoid rig: no grounded feet or leg mechanics; a stationary root beneath the pelvis controls floating height.

## Proposed parts (not actual isolated layers)

- Root/pelvis and lower gown mass; chest/shoulder mass overlaps waist to hide torso rotation.
- Head and neck with jaw/mouth shape set for the wail; neck overlaps high collar.
- Two upper arms, two forearms, and two hands. Shoulder pivots sit beneath capelet; elbows beneath sleeve overlaps. Separate foreground reaching arm from rear arm.
- Capelet and clasp attached to chest; clasp rigid, capelet tips limited secondary motion.
- Three broad rear hair locks plus front scalp/framing hair, attached to head with bounded sway. Preserve the large negative spaces between locks.
- Three main gown hem lobes anchored beneath pelvis/lower gown; short deformations for idle and dissolution. Do not fragment into many thin tendrils.

Proposed stacking: rear hair, rear arm, rear sleeve, lower gown rear lobes, torso/pelvis, foreground gown, foreground arm/sleeve, collar, neck/head, front hair, clasp. Artist must recover hidden surfaces and joint overlap margins before claiming a cutout rig. Approximate root anchor is (640, 1140), pixel coordinates, top-left origin, x right/y down; resolve exact root and common motion bounds during animation. Canvas remains 1254 × 1254 for the base; final motion canvas and pixels-per-unit are not established.

## Future states

Required: idle (small float and hair sway, loop); attack (anticipation, wail release event, claw follow-through, recovery, one shot); hit (brief recoil and recovery); wounded_idle (stooped persistent float, loop); die (irreversible spectral dissolution, one shot). Cast, guard, spawn, and victory are not required by the current brief; add only if gameplay specifies them. Raised/tamed forms are not specified. All future states must retain facing, proportions, broad hair locks and two-arm anatomy. Keep wail effects separate. Target ordinary attack around 350 ms, subject to readable anticipation and recovery.

Base is a design draft with unresolved visible edge artifacts, not a clean final sprite or runtime delivery. Two targeted built-in repairs (r2 and r3) failed to eliminate white speckling and colored fringe. r1 remains the preferred composition; r2 and r3 are retained as unsuccessful repair attempts. No programmatic editing was applied. Before animation: three variant approvals unless user changes scope, alpha-edge refinement, isolated parts/revealed surfaces or consistent generated frames, stable root, and motion bounds.

