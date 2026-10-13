/** Development-only isolated UI review. Never changes the player's save. */
import { useEffect, useRef, useState } from "react";
import { ScorePlayer } from "./music";
import { infernalShopAppearance } from "../../../packages/engine/infernal";
import { createRoot } from "react-dom/client";
import { newInfernalRun, dispatch, type State, type Action } from "../../../packages/engine/index";
import { LootReveal } from "./LootReveal";
import "./style.css";
import { InfernalJourney } from "./InfernalJourney";
import { loadAssets, type Assets } from "./assets";
function fixture(phase:"map"|"shop"|"treasure"|"cleared map"):State {
 const state=newInfernalRun(118,"warband");state.gold=1000;
 if(phase==="cleared map"){const node=state.journey!.nodes.find(n=>n.kind==="combat")!;state.journey!.current=node.id;state.journey!.completed.push(node.id);} else if(phase!=="map") {state.journey!.current=state.journey!.nodes.find(n=>n.kind===phase)!.id;state.phase=phase;}
 return state;
}
function Review({assets}:{assets:Assets}) {
 const [state,setState]=useState(()=>fixture("shop"));const [message,setMessage]=useState("");
 const score=useRef(new ScorePlayer());const [musicOn,setMusicOn]=useState(false);
 useEffect(()=>{if(musicOn)void score.current.play(assets,state.phase==="shop"?infernalShopAppearance(state.seed,state.journey?.current??null).shopId:"infernal-map");else score.current.stop();},[assets,musicOn,state.phase,state.journey?.current]);
 useEffect(()=>()=>score.current.stop(),[]);
 function act(action:Action){try {setState(dispatch(state,action));setMessage("");}catch(e){setMessage((e as Error).message);}}
 return <><nav style={{position:"fixed",bottom:0,left:0,zIndex:1000,background:"#000",padding:4,color:"white"}}>Isolated review — {(["map","shop","treasure","cleared map"] as const).map(p=><button key={p} onClick={()=>setState(fixture(p))}>{p}</button>)}</nav>{state.phase==="loot" && state.pendingLoot ? <LootReveal assets={assets} loot={state.pendingLoot} onContinue={()=>act({type:"continue"})}/> : <InfernalJourney state={state} assets={assets} onAction={act} onHome={()=>setState(fixture("map"))} onMusic={()=>setMusicOn(v=>!v)} musicOn={musicOn} message={message}/>}</>;
}
if(import.meta.env.DEV) void loadAssets().then(assets=>createRoot(document.getElementById("root")!).render(<Review assets={assets}/>));

