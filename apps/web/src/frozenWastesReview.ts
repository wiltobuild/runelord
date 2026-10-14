import { newRoguelikeRun, dispatch, enterRoguelikeShop, realmStartRoom, type State } from "../../../packages/engine/index";

/** Isolated development route for scene/interaction checks; never persisted. */
export const FROZEN_REVIEW = import.meta.env.DEV && location.pathname === "/frozen-wastes-review";
export function frozenWastesReviewState(): State | null {
  if (!FROZEN_REVIEW) return null;
  const params = new URLSearchParams(location.search);
  const stage = params.get("stage") || "1";
  let state = newRoguelikeRun(29, params.get("hero") === "runeblade" ? "rimebound" : "warband");
  state.relics.push("demon-lord-crown");
  state.gold = 650;
  state.deckLevels = state.deck.map(() => 2);
  const number=stage==="sovereign"?12:Math.max(1,Math.min(12,Number(stage.replace("shop-","")) || 1));
  const start=realmStartRoom(state,"frozen-wastes");
  if(start===0 && number===1 && !stage.startsWith("shop-") && stage!=="transition") return state;
  state.enemies=[]; state.reserves=[]; state.hand=[]; state.draw=[]; state.discard=[];
  state.room=stage==="transition"?realmStartRoom(state,"forest")+11:start+number-1-(stage.startsWith("shop-")?0:1);
  enterRoguelikeShop(state);
  if(stage==="transition" || stage.startsWith("shop-")) return state;
  return dispatch(state,{type:"leave-shop"});
}
