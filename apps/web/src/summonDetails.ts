import { unitPower, unitScorch, type State, type Unit } from "../../../packages/engine/index";

export const summonTraits: Record<string, string> = {
  imp: "Swift: attacks on arrival. Each firebolt applies 1 Scorch.",
  hellhound: "Pack: +2 damage per other Hellhound or Cerberax.",
  "pit-brute": "Cleave: attacks every enemy. Defender: intercepts attacks aimed at the caster.",
  gloomstalker: "Elusive. Alternates 2 Sapped and 2 Exposed on the focus target.",
  "soul-leech": "Drain: heals the caster for damage dealt.",
  "pyre-warden": "Grants the caster 6 Guard each turn. Its action applies 1 Scorch to every enemy.",
  ignivar: "Archdemon · Unbound. Direct fire hits apply 4 additional Scorch. Summons an Imp each turn if there is space.",
  cerberax: "Archdemon · Unbound. Summons a Hellhound each turn if there is space. Incoming pack damage is shared before each member's Guard. Counts as a Hellhound.",
  nightmaw: "Archdemon · Unbound · Elusive. Applies 2 Sapped and 2 Exposed to the focus target. Gain 1 Mana and draw 1 card on arrival and each turn.",
  gorthak: "Archdemon · Unbound. All allied minions deal +2 damage. Newly summoned lesser demons become Pit Brutes.",
  "hollow-saint": "Archdemon · Unbound. Drains every enemy and heals the caster for damage dealt.",
  "pyre-colossus": "Archdemon · Unbound. Grants 6 Guard on arrival and each turn; doubles Guard gained by the caster. Applies 2 Scorch to all enemies. Allied demon deaths have a 50% chance to summon a Pyre Warden if there is space.",
};
export function summonPower(unit: Unit, state: State) {
  return unitPower(state, unit);
}
export function summonScorch(unit: Unit, state: State) {
  return unitScorch(state, unit);
}
export function summonDescription(unit: Unit, state: State) {
  return `${unit.name}: ${summonPower(unit, state)} damage, ${unit.upkeep} Upkeep. ${summonTraits[unit.kind] ?? ""}`;
}
