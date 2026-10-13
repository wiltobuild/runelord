import { newInfernalRun, generateForestJourney, dispatch, type State } from "../../../packages/engine/index";

/** Development-only presentation fixtures. Never persisted as a player's save. */
export const forestReviewActive = import.meta.env.DEV && location.pathname === "/forest-review";
export function forestReviewState(): State | null {
  if (!forestReviewActive) return null;
  let state = newInfernalRun(29, "warband");
  state.relics.push("demon-lord-crown");
  state.gold = 450;
  state.deckLevels = state.deck.map(() => 1);
  const stage = new URLSearchParams(location.search).get("stage") || "entry";
  if (stage === "crown") {
    state.journey!.current = state.journey!.nodes.find(node => node.kind === "boss")!.id;
    state.phase = "loot";
    state.pendingLoot = {gold:150,items:["demon-lord-crown"],final:true};
    return state;
  }
  state.journey = generateForestJourney(state.seed);
  state.phase = "map";
  state.room = 9;
  if (stage === "entry") return state;
  if (stage === "sovereign") {
    state.maxHp = state.hp = 120; state.deckLevels = state.deck.map(()=>2);
    state.inventory = ["healing-draught", "mana-potion"];
  }
  const id = stage === "sovereign" ? "forest-12" : stage.startsWith("shop-") ? `forest-${stage}` : `forest-${Number(stage) || 1}`;
  const index = state.journey.nodes.findIndex(node => node.id === id);
  if (index < 0) return state;
  state.journey.completed = state.journey.nodes.slice(0,index).map(node => node.id);
  state.journey.current = state.journey.nodes[index-1]?.id ?? null;
  state = dispatch(state,{type:"arrive",node:id});
  return dispatch(state,{type:"enter-location"});
}
