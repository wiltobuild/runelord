# Infernal branching presentation QA

Independent reviewer: seraph_package (no Infernal production asset or UI authorship). Date: 2026-10-03. Scope: new r1 merchant expressions, marker tiers, map placement/routing, appearance selection, and presentation integration. No production files changed.

## Result

Asset and source/logic review pass. The minor reduced-motion rendering issue found during review was repaired and rechecked; see final disposition below. Browser interaction and final rendered-layout acceptance are not claimed: this worker has no browser/CUA tool. HTTP GET of http://127.0.0.1:4320/infernal-review.html returned 200, which proves delivery only.

## Checks performed

- npm test: 123/123 passing, zero failures. Includes repeatable appearance selection, nine combinations, 34 anchors, 73 possible routes, and bridge sample coverage.
- npm run build: passed TypeScript and Vite production build. Existing bundle-size advisory: main JS 642.48kB; not a build failure.
- Independent TypeScript sweep of seeds 1000 through1249: every generated node has a placement; all14704 actual generated edges resolve in the layout; allnine shop/merchant combinations occur on actual shop nodes.
- Visually inspected all three merchant contact sheets, each containing base idle plus talk, satisfied, skeptical. Distinct readable gestures, preserved identity/accessories, aligned baseline, no apparent neighboring-cell fragments or cropped limbs. Merchant3 is deliberately broader/shorter than the other two; consistent through his expressions.
- Visually inspected every tier in all five marker contact sheets (combat, elite, shop, treasure, boss):15 total marker designs. Progression adds size and architectural complexity; category silhouettes remain distinct. No apparent cut corners, neighboring fragments, or lost bases.
- Independently decoded runtime WEBP atlases. Merchant atlases are1536x768 (three512x768 cells); markers768x256 (three256x256 cells). Every one of24 cells has zero alpha>32 pixels in outer2px. This independently confirms edge clearance on runtime bytes, rather than only builder logs.
- Inspected map-template.png visually. It is the1672x941 uncropped warboard used by the fixed coordinate system. Anchors correspond to available plateaus; tests cover every anchor inside traced terrain. Routes are straight endpoint-to-endpoint paths with bridge segments over the traced complement. The geometric test proves coverage relative to those polygons, not a pixel-perfect automated terrain classifier.
- Reviewed expression atlas selection: width300%, overflow clipping, translations0/-33.333/-66.667 percent select talk/satisfied/skeptical correctly. Base and expression viewports now share2:3 aspect ratio. Purchase gold decrease selects satisfied, tab interaction talk, error message skeptical;2.2s timeout returns idle. Error fallback retains base portrait.
- Reviewed marker selection: background-size300% with positions0/50/100% selects allthree cells. Tiers derive from row depth, capped at2. DEV controls do not alter saved journey state.
- Appearance hashing uses independent salts for shop and merchant and does not consume generator RNG. Same seed/node yields the same choice. Ambient canvas is pointer-events:none and decorative/aria-hidden; reduced-motion removes ongoing particle animation.

## Original minor finding (resolved): reduced-motion static glow can clear after resize

InfernalAmbient resize callback assigns canvas.width/height, which clears the bitmap. With reduced motion enabled, paint does not schedule another frame. ResizeObserver's initial callback or a subsequent viewport resize can therefore erase the static glow until the effect restarts. Normal animated mode repaints next frame. Repair: repaint once after resize when reduced motion is active. This is a decorative P3 issue; controls and navigation remain functional. Reported to integration owner; no repair made by reviewer.

## Limitations

No actual browser click, responsive-layout, console, live expression transition, or audio-listening claims. Audio technical checks belong to their existing evidence. Art acceptance remains a user decision, not conferred by this report. Build/tests/source inspection and contact-sheet visual inspection are distinct evidence.

## Reviewed hashes

- InfernalJourney.tsx:949a1b9eb1c28a44c0b8e024d7492df03d4fecfa80d6c125aaf4a4d1e8c4d9a7
- InfernalAmbient.tsx:0160dc4319c07045c10d40ba76e6ccdd2b79513d716618402c9f9406f5c315e4
- infernalMapLayout.ts:ce96ee07efa0484649cff4f96de0742e11bd798779a0a07642d597ce466bd3a6
- infernal-journey.css:3fea340d78fa598871b05d7b7562d95c55ac3a0d4d163e7dba28036ed522c934
- packages/engine/infernal.ts:25f9d22c8e2d14995c6bbe6f9dc01f01f4596cc9f3dd189ca1362b9a1e249d3e
- map-template.png:2700d65a29f522fc8f79871e51e3303f55a0a350c1334a88309b738645385c3f
- shopkeeper1 expressions:9f4cec13b05255d741c6bddd886964725bfa7630d049b14d61e93a264376ff48
- shopkeeper2 expressions:6e0b72b083cd87855ecce3fb8cbf293de38553ae1d3be2db5878978275c15d52
- shopkeeper3 expressions:c0c323c8e777520c1df359d01eeb03c00bb33a7ef11c4965005ce3d6c9b3d524
- marker combat:69f8ddde03fc00c6ba07fa3746e55a67f958775fcb5f4c60480a05b5a45b6dc1
- marker elite:82368d751adcb2b4db087d1504977a25768d4b41a4147aa5c4a5546193814563
- marker shop:3d5c4a806799aa52159b9d40fb95239760d4cc6ac6b0709c38ba010db6e1eb8b
- marker treasure:01fde0d38d59b315266964b5cfb35a014584ad375c4e573f327ecd20f1e15fb9
- marker boss:5597d6fa3fc0d6f0cd2fee65e8bd5014723e53a14360f3253d3be6f48a14561d

## Repair recheck and runtime screenshot inspection

The reduced-motion issue is resolved by the integration owner. Re-read InfernalAmbient.tsx: ResizeObserver is installed after paint is defined, calls resize then paint when reduced motion is active; initial setup sizes the canvas before restart paints. No additional RAF loop is introduced in reduced-motion mode. Current source SHA256:08093760012e640340a43fbcee0f85a2f5e2664d1e61855c7c1101ff60ba0289. This supersedes the original Ambient hash/finding above. Source recheck passes; live preference-toggle/resize interaction remains untested by this reviewer.

Independently inspected parent-captured shop-integrated.png and map-integrated.png at1280x720. Shop screenshot shows correctly proportioned merchant1 against the Cinder Vault setting, readable primary card/services/gold controls, aligned portrait base and dialogue, and intended scrolling for remaining stock. Some neutral-card entries use text fallbacks rather than illustrated cards, consistent with source fallback handling; this review does not assert new artwork exists for those entries.

Map screenshot shows the full uncropped warboard within its frame, markers and bridge routes on the plateaus, distinct services, and visible Overview/Zoom controls. At full-map overview, detailed node labels are small (roughly5-6px at this screenshot size); the provided zoom is necessary to comfortably read encounter names. Screenshot alone does not prove zoom interaction. No unintended clipping or opaque atlas rectangles are visible in either screenshot. The fixed isolated-review navigation is development UI.

Screenshot hashes:
- shop-integrated.png:921b6a656edda1616b4836830dec2c061683b441f0131c1c35873f5b51b4d618
- map-integrated.png:8556ebc5e59502f3b0e170f40fe1cf25f7c1006639990a48e43c4e6647277a79

Final disposition: asset/source/logic checks and supplied runtime screenshot inspection pass; no unresolved blocking finding. Browser interactions, animation timing in motion, reduced-motion live behavior, and audio listening are outside this worker's verified scope. The later Soulforge static-design refinement is not assessed here and is not represented as implemented.

