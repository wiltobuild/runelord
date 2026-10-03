# Opening Sanctum independent QA

Tested 2026-10-03 by opening_qa, separate from implementation author. Checkout HEAD 470f16cf6172148eac3b438649a53a21510a8eff plus working changes. URL http://localhost:4320/ in a separate CUA in-app-browser tab. No saved-run actions were performed; existing save was preserved.

## Observed passes
- Final three tome images loaded with nonzero natural width. Final desktop appearance matches dark fire-region art; clear distinct fire/demon/blood book identities, no broken images.
- All previews show 10 starting cards derived from content. Hellfire: Firebolt x2 plus eight singles. Demons: Summon Imp x2 plus eight singles. Blood: Ward of Ash x2 plus eight singles. Cards display costs and readable rule text.
- Preview does not select a deck. Choose Master of Demons selects its radio and updates Begin label.
- Keyboard Right moves from Master of Demons to Blood Covenant. Native radio selection is exposed in accessibility tree.
- Escape closes preview and returns focus to its trigger. Close receives initial focus. Native modal prevents reaching underlying page controls. Browser focus traverses outside the document between last and first modal control, then returns into modal; no custom strict two-button cycle is implemented.
- 390x844 portrait: one-column tome choices and readable two-column preview; no horizontal overflow. 844x390 landscape: three-column choices, vertical scrolling needed and supported; document width829 versus viewport844, no horizontal overflow. Temporary viewport restored.
- Final reload shows Enable music; click changes to Mute music with no captured warnings/errors. Footer names The Pact Sanctum. Console warning/error query returned empty after final asset load and music gesture.

## Code review passes / limits
- OpeningScreen selection/preview never writes storage. Resume calls unchanged start(true), reusing saved state rather than starter selection.
- CSS disables all sanctum animation/transition under reduced motion; AnimatedBackground observes reduced-motion preference and stops RAF. Runtime reduced-motion emulation was not available in supported browser tools, so this is source inspection only.
- Existing native dialog semantics and bounded scroll preserve access on narrow displays.
- New-run/resume combat transition not browser-tested here because this browser origin already contains a user save. Parent may provide separate isolated validation. No claim of engine acceptance from preview-only checks.
- Audio gesture and error state verified; subjective sound quality and loop seam were not auditioned by this reviewer.
- Build/test/sim results owned by integration parent; not rerun redundantly here.

## Evidence
- qa-desktop.png: full-page final desktop.
- qa-mobile.png: full-page final390px portrait.

## Tested source SHA256
- OpeningScreen.tsx: AA8B872120BE31479CD684DA76AEBCF5E41717FFC34E0561B394B5C6F60E06CF
- opening.css: 8C5FA997ADC87F88DE032755F4FE8D5D64B0E782ED5BE2158C1611861AB55B11
- main.tsx: 6A26D84601791EFFC5F7A0657CAC59C4265C1ABA6F0616B03E39E8B9BF89A8EC
- music.ts: AA70BA5268EAB5069715B8D200802217F286BDCBC9C7BC737AD84D78334E682F

No blocking defects found in the reviewed opening-screen scope. No production files edited.


Final compact-height spacing and art top padding repair rechecked in desktop screenshot: books have clear top space; Begin/Resume and footer remain visible. Desktop evidence refreshed; mobile evidence precedes this spacing-only adjustment.
