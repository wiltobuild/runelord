import { newInfernalRun, generateFrozenWastesJourney, generateForestJourney, dispatch, type State } from "../../../packages/engine/index";

/** Isolated development route for scene/interaction checks; never persisted. */
export const FROZEN_REVIEW = import.meta.env.DEV && location.pathname === "/frozen-wastes-review";
export function frozenWastesReviewState(): State | null {
  if (!FROZEN_REVIEW) return null;
  const params = new URLSearchParams(location.search);
  const stage = params.get("stage") || "entry";
  let state = newInfernalRun(29, params.get("hero") === "runeblade" ? "rimebound" : "warband");
  state.relics.push("demon-lord-crown");
  state.gold = 650;
  state.deckLevels = state.deck.map(() => 2);
  state.journey = stage === "transition" ? generateForestJourney(state.seed) : generateFrozenWastesJourney(state.seed);
  state.phase = "map";
  if (stage === "entry") return state;
  const id = stage === "transition" ? "forest-shop-12" : stage === "sovereign" ? "frozen-wastes-12" : stage.startsWith("shop-") ? `frozen-wastes-${stage}` : `frozen-wastes-${Number(stage) || 1}`;
  const index = state.journey.nodes.findIndex(node => node.id === id);
  if (index < 0) return state;
  state.journey.completed = state.journey.nodes.slice(0,index).map(node => node.id);
  state.journey.current = state.journey.nodes[index-1]?.id ?? null;
  state = dispatch(state, {type:"arrive",node:id});
  return dispatch(state, {type:"enter-location"});
}
