# Character Court independent source QA

Reviewer: opening_qa. 2026-10-03. Checkout HEAD470f16cf6172148eac3b438649a53a21510a8eff plus working tree revisions. Production files were read-only; no save data touched.

## Source inspection results
- PASS: characterChosen initializes false. Warlock button sets true and exposes aria-pressed. The other three hero buttons have native disabled and explicit Coming soon labels; no handler activates unavailable heroes.
- PASS: pact controls live inside disabled fieldset until Warlock selection. Begin disabled tracks the same state. Resume sits outside the fieldset and has no characterChosen gate, preserving saved-run access.
- PASS: selection is local component state. Neither character/pact selection nor card preview writes storage or starts a run. Existing parent start(true) retains saved game state.
- PASS: preview counts/rules derive from starterDecks/cards. Card copy counts are grouped from actual IDs. Closing effect closes native dialog before returning focus to triggering preview button. Escape cancels via shared close handler.
- PASS: fixed per-deck --magic remains fire orange, demon violet, blood crimson. Final higher-specificity image rules override earlier brightening/color-filter hover rules. Halo/orbit intensity varies opacity; image hue is unchanged.
- PASS: title/header, button and tome frames use common obsidian/brass treatment. Character plates reference same existing sanctum-frame.svg asset. Three hero thumbnail files exist and have nonzero size.
- PASS (source only): responsive rules switch character court to two columns and pacts to one column at600px. Header wraps on mobile. Reduced-motion rules disable sanctum motion and replace Warlock canvas visually with existing0.webp still. Runtime Pixi ticker is not paused by CSS but no animated canvas remains visible.
- PASS: music wiring unchanged from prior checked opening screen. Interactions invoke awaken; music player and initial Enable music handling remain in parent.

## Runtime limitation / evidence ownership
Worker CUA could not access browser for this revision. Prior browser2 binding failed; inventory returned no apps/browsers; fresh createBrowserTab for iab and2 also failed. No external browser automation was substituted. Therefore independent browser layout, screenshot, animation/hover playback, audio audition, and gate/preview interaction checks are NOT RUN for this revision. Parent integration agent is separately performing runtime verification in tab35 and retaining screenshots. Earlier opening-sanctum QA is not claimed as runtime proof of this new character revision.

## Source SHA256
- apps/web/src/OpeningScreen.tsx:14DA77B21A3F5C855BB989757E7DBB86716288D1B6E443B5C847E6C393DA14BD
- apps/web/src/opening.css:DBE6F08CC4A48860C0516C428804932A3A7C667659897F7093EE98E717DDF2E2
- apps/web/src/main.tsx:6A26D84601791EFFC5F7A0657CAC59C4265C1ABA6F0616B03E39E8B9BF89A8EC
- apps/web/src/music.ts:AA70BA5268EAB5069715B8D200802217F286BDCBC9C7BC737AD84D78334E682F
- sanctum-frame.svg:6948B10A015127F00470341DA65C4E6B751E915E2240FDC36EF235BEE90F229E
- hero-runeblade.webp:5E0EC59A75210732F2FAFDA7CA6F8C7D2C736F7D9F2EE1FE8EEB260239FCF512
- hero-runesmith.webp:8ACDE8CF1806D84D834706CA71B1E3BCECADE85AC9BD7672AE4DEF87ADA93745
- hero-ranger.webp:6FCA396F0E0F5A2CCBBDF4578789F70F8BE7E920AF1D8583F1DBD29699B92975

No blocking source defects found. Runtime acceptance remains owned by parent evidence; no claim of independent visual acceptance or user art approval.
