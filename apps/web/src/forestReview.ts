import { newRoguelikeRun, dispatch, enterRoguelikeShop, type State } from "../../../packages/engine/index";

/** Development-only presentation fixtures; these never replace a player's save. */
export const FOREST_REVIEW = import.meta.env.DEV && location.pathname === "/forest-review";
export function forestReviewState(): State | null {
  if (!FOREST_REVIEW) return null;
  let state = newRoguelikeRun(29,"warband");
  state.relics.push("demon-lord-crown");
  state.gold = 450;
  state.deckLevels = state.deck.map(()=>1);
  state.enemies=[];
  state.reserves=[];
  state.hand=[];
  state.draw=[];
  state.discard=[];
  const stage=new URLSearchParams(location.search).get("stage") || "1";
  state.room=8;
  state.phase="loot";
  state.pendingLoot={gold:150,items:["demon-lord-crown"],final:true};
  if(stage==="crown") return state;
  if(stage==="border") return dispatch(state,{type:"continue"});
  if(stage==="sovereign"){state.maxHp=state.hp=120;state.deckLevels=state.deck.map(()=>2);state.inventory=["healing-draught","mana-potion"];state.room=19;state.pendingLoot=null;enterRoguelikeShop(state);return dispatch(state,{type:"leave-shop"});}
  const number=Number(stage.replace("shop-","")) || 1;
  state.room=8+Math.max(1,Math.min(12,number))-(stage.startsWith("shop-")?0:1);
  state.pendingLoot=null;
  enterRoguelikeShop(state);
  if(stage.startsWith("shop-")) return state;
  return dispatch(state,{type:"leave-shop"});
}
