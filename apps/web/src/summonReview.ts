import { demonStats, dispatch, newRoguelikeRun, type DemonKind, type State } from "../../../packages/engine/index";
import { cards, type CardId } from "../../../packages/content/index";

/** Isolated development fixture. Never loads or overwrites the player's saved run. */
export const SUMMON_REVIEW = import.meta.env.DEV && location.pathname === "/summon-review";
export function summonReviewState(): State | null {
  if (!SUMMON_REVIEW) return null;
  let state = newRoguelikeRun(20261004, "warband");
  const params = new URLSearchParams(location.search);
  state.hp = state.maxHp = 300;
  state.mana = 30; state.cinders = 20;
  for (const enemy of state.enemies) { enemy.hp = enemy.maxHp = 500; }
  const kinds = (params.get("units") ?? "gloomstalker,soul-leech,pyre-warden").split(",").filter(kind => kind in demonStats).slice(0,5) as DemonKind[];
  for (const kind of kinds) {
    const card = `summon-${kind}` as CardId;
    const uid = state.nextId++;
    state.hand.push({id:card,uid});
    state = dispatch(state, {type:"play",uid});
    state.mana = 30; state.cinders = 20;
  }
  const hand = (params.get("cards") ?? "empower-demon,hellish-command,ward-of-ash,hellfire,summon-imp").split(",").filter(id => id in cards) as CardId[];
  state.hand = hand.map(id => ({id,uid:state.nextId++}));
  // Development-only animation checks without modifying a saved run.
  for (const unit of state.units) {
    if (params.get("wounded")?.split(",").includes(unit.kind)) unit.hp = Math.max(1, Math.floor(unit.maxHp * .2));
    if (params.get("defeated")?.split(",").includes(unit.kind)) unit.hp = 0;
  }
  if (params.get("wounded")?.split(",").includes("hero")) state.hp = Math.floor(state.maxHp * .6);
  state.events = [];
  return state;
}
