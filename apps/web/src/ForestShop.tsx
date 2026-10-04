import type { CSSProperties } from "react";
import { activeEncounter, type State, type Action } from "../../../packages/engine/index";
import type { Assets } from "./assets";
import { AnimatedBackground } from "./AnimatedBackground";
import { SoulforgeShop } from "./SoulforgeShop";
import "./forest-shop.css";

export function ForestShop({state,assets,onAction,onMusic,musicOn,message}:{state:State;assets:Assets;onAction:(action:Action)=>void;onMusic:()=>void;musicOn:boolean;message:string}) {
  const scene=activeEncounter(state).background;
  return <main className="forest-shop" style={{"--forest-scene":`url(${assets.images[scene]})`} as CSSProperties}>
    <AnimatedBackground scene={scene}/>
    <SoulforgeShop title="Woodland Exchange" state={state} assets={assets} onAction={onAction} onTalk={()=>{}} onMusic={onMusic} musicOn={musicOn} message={message} merchant={<aside className="forest-merchant"><span>THORNROOT FOREST</span><h2>The Woodland Exchange</h2><p>Refine the power you carried through the flames.</p><small>Limited stock · Upgrades · Card removal</small></aside>}/>
  </main>;
}
