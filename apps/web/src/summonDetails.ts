import { usesSummonRules, unitPower, unitScorch, type State, type Unit } from "../../../packages/engine/index";

export const summonTraits: Record<string, string> = {
  "iron-legionary": "Bodyguard oath: two living Legionaries share all hostile damage aimed at the Warlock.",
  "ash-pikeman": "Pike formation: +2 damage per other living Ash Pikeman.",
  "ironhorn-bulwark": "Defender. At the start of your turn, gives every soldier 3 Guard.",
  "maledictor": "Hits apply 2 Scorch. Three living Maledictors open a Hellgate at end turn: 6 damage and 2 Scorch to all enemies, then promote all soldiers. Once per turn.",
  "dread-vanguard": "Cleave: attacks every enemy. Its first kill each turn promotes it once.",
  "frost-thrall": "Hits apply 1 Chill.",
  "shattered-queen": "Attacks every enemy and applies 1 Chill.",
  "rime-seer": "Hits apply 3 Chill.",
  "rune-revenant": "Attacks twice.",
  "bone-defender": "Defender: intercepts attacks aimed at the caster.",
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
  const traits=unit.kind==="pit-brute"&&!usesSummonRules(state) ? "Strikes the focus target. Defender: intercepts attacks aimed at the caster." : summonTraits[unit.kind] ?? "";
  return `${unit.name}: ${summonPower(unit, state)} damage, ${unit.rot !== undefined ? `Rot ${unit.rot}` : `${unit.upkeep} Upkeep`}. ${unit.promotionRank !== undefined ? `Rank ${unit.promotionRank}, ${unit.armor ?? 0} Armor. Rank is saved for this recruit’s next summon. ` : ""}${traits}`;
}
