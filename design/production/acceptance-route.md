# Warlock acceptance route

Use the current runnable demo and current content, not a hardcoded DOM selector or an assumption that a future card is implemented. Start a separate test save/profile or preserve the user's existing save. Record seed, source revision/hashes, viewport, browser URL, and test data. Use seed 42 for the ordinary route; construct explicit engine fixtures for rare edges instead of hoping the route draws them.

| Check | Observable acceptance |
|---|---|
| Start and restore | Fresh seeded run starts; an existing test run resumes without duplicated actions. |
| Targeted spell | Selection and cancellation work; projectile release precedes impact; HP/reaction match the authoritative event target; input unlocks after recovery. |
| Summon | Unit appears with correct cost, position and intent; Imp Swift acts once; source identity and alpha remain intact. |
| Full board | At five units, dismissal behavior matches rules; canceled/invalid actions spend nothing. |
| Targeting | Defender redirects the correct attack; front and sweep affect their actual targets; dead focus falls back deterministically. |
| End turn | Muster is front-to-back; Upkeep/Hunger and Scorch occur at documented times; lethal effects stop invalid follow-up actions. |
| Transition | Rewards, camp, boss and victory advance once; no invisible input lock or dangling target selection. |
| Refresh during action | Reload during spell presentation; resume yields the saved authoritative result without applying the action twice. |
| Inventory | Brand inspection works; Healing Draught heals the rules-derived amount and is consumed once; empty sockets remain intelligible. |
| Audio | User gesture starts sound; changing scenes does not layer unintended full mixes; mute persists during transitions; audition a loop seam. |
| Layout and access | Check 1280x720 and mobile landscape plus current HUD native size; no blocked controls, clipped costs, or horizontal overflow. Keyboard targeting/help, Escape, focus return and reduced motion are checked or recorded as known gaps. |

Choose affected checks for a narrow fix; use the complete route for substantial combat/presentation integration. Record pass, fail, not-run, or justified not-applicable for every selected check. A screenshot proves appearance at that moment, not interactivity, smooth playback, or audio quality. Include console/network failures and exact reproduction actions. Use the available browser tooling and its instructions; a missing browser capability is a limitation, not permission to report success.

Engine complement: `npm test`, `npm run sim`, and `npm run build` as relevant. Existing simulation is crash/replay validation, not a card-balance experiment. Use explicit fixtures for zero Cinders, lethal Pact, full-board dismissal, death during Muster, and replay equivalence. Do not change game rules merely to make the acceptance route pass.
