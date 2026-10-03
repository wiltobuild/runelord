---
name: runelord-ui-system
description: "Implement selected Runelord UI concepts as live reusable game components, matching the current HUD, maps, states and input behavior. Use for interface design and integration."
---

# Runelord UI System

Read [the shared production contract](../../../design/production/workflow.md) for scope, evidence, handoffs and resumption. Resolve paths from the assigned repository root, not a hardcoded personal directory. Only load the references needed for this task.

Read `design/obsidian-hud.md` and inspect current `HudTemplate.tsx`, `hud.css`, `main.tsx`, targeting, inventory and renderer coordinates. Honor the selected design; an old comparison concept is not permission to replace the current HUD.

Keep raster decoration separate from live text, counters, cards, actors and inventory. The current HUD uses native 1672x941 coordinates uniformly scaled into the window; re-read actual constants before placement. Pointer hit-testing, spell origins and actor motion must convert through the same space. Preserve safe regions for intents, the hand, targets and end-turn controls.

Build reusable tokens/components for palette, typography, spacing and state feedback when repeated UI justifies it. Specify normal, hover, focus, selected, disabled, resolving and empty states. Costs, rarity and target types need more than color alone. Inspect status/intent icons at their actual display size. Use existing art skills for new raster UI ornament rather than code-painted approximations of approved artwork.

Preview representative bright/dark biomes, long names, full hand/Warband, no Mana, filled/empty inventory and dialogs. Verify pointer and keyboard behavior, Escape, focus trapping/return, reduced motion, 1280x720 and mobile landscape. Do not reintroduce a removed empty Warband panel just because an older mockup contained one. Keep game rules authoritative and untouched by visual changes. Deliver live components, coordinate/token decisions, screenshots and interaction evidence; label static concepts as static.
