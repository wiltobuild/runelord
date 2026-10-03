import type { State } from "../../../packages/engine/index";
import type { Targeting } from "../../../packages/content/index";

// Explain the target, rather than appearing to classify the enemy above the label.
// Do not call resolveTargets here: its random-target branch advances the combat RNG.
export function intentLabel(state: State, targeting: Targeting): string {
  const front = state.units.at(-1);
  if (targeting === "front") return front ? `Targets: ${front.name} (front)` : "Targets: Warlock";
  if (targeting === "hero") {
    const defender = [...state.units].reverse().find(unit => unit.defender);
    return defender ? `Targets: ${defender.name} (defender)` : "Targets: Warlock";
  }
  if (targeting === "ignore_defender") return "Targets: Warlock · ignores defender";
  if (targeting === "sweep") return "Targets: all allies";
  if (!front) return "Targets: Warlock";
  if (targeting === "weakest") return "Targets: weakest summon";
  return "Targets: random ally";
}
