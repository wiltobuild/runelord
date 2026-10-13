import type { State } from "../../../packages/engine/index";
import type { Targeting } from "../../../packages/content/index";

// Explain the target, rather than appearing to classify the enemy above the label.
// Do not call resolveTargets here: its random-target branch advances the combat RNG.
export function intentLabel(state: State, targeting: Targeting): string {
  const hero = state.hero === "runeblade" ? "Runeblade" : "Warlock";
  const front = state.units.at(-1);
  const bodyguards=state.units.filter(u=>u.kind==='iron-legionary'&&u.hp>0);
  if(bodyguards.length>=2 && (targeting==='hero'||targeting==='ignore_defender'))return "Targets: Legionary bodyguards";
  if (targeting === "front") return front ? `Targets: ${front.name} (front)` : `Targets: ${hero}`;
  if (targeting === "hero") {
    const defender = [...state.units].reverse().find(unit => unit.defender);
    return defender ? `Targets: ${defender.name} (defender)` : `Targets: ${hero}`;
  }
  if (targeting === "ignore_defender") return `Targets: ${hero} · ignores defender`;
  if (targeting === "sweep") return "Targets: all allies";
  if (!front) return `Targets: ${hero}`;
  if (targeting === "weakest") return "Targets: weakest summon";
  return "Targets: random ally";
}
