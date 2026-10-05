import { useEffect, useRef, useState, type CSSProperties } from "react";
import { activeEncounter, type State, type Action } from "../../../packages/engine/index";
import type { Assets } from "./assets";
import { AnimatedBackground } from "./AnimatedBackground";
import { SoulforgeShop } from "./SoulforgeShop";
import { assetUrl } from "./baseUrl";
import "./forest-shop.css";

export function ForestShop({state,assets,onAction,onMusic,musicOn,message}:{state:State;assets:Assets;onAction:(action:Action)=>void;onMusic:()=>void;musicOn:boolean;message:string}) {
  const scene=activeEncounter(state).background;
  // Forest shop rooms are 12, 15, 18, and 21: Dryad, Myconid, Antlered, then Dryad again.
  const shopNumber=Math.max(0,Math.floor((state.room-9)/3))%3+1;
  const [expression,setExpression]=useState<"idle"|"talk"|"satisfied">("idle");
  const previousGold=useRef(state.gold);
  useEffect(()=>{if(state.gold<previousGold.current)setExpression("satisfied");previousGold.current=state.gold;},[state.gold]);
  useEffect(()=>{setExpression("idle");},[state.shops?.current]);
  useEffect(()=>{if(expression==="idle")return;const timer=setTimeout(()=>setExpression("idle"),2200);return()=>clearTimeout(timer);},[expression]);
  const shopAsset=(name:string)=>assetUrl(`/forest-shop-assets/${name}.webp`);
  const titles=["Woodland Exchange","Mushroom Hollow","Canopy Market"];
  const merchants=["Dryad trader","Myconid apothecary","Antlered woodland trader"];
  const dialogue=["Every seed holds a promise.","A remedy for the road ahead.","A fair measure. A fair price."];
  return <main className="forest-shop" data-shop={shopNumber} data-expression={expression} style={{"--forest-scene":`url(${shopAsset(`background-${shopNumber}`)})`,"--forest-shop-frame":`url(${shopAsset("shop-frame")})`} as CSSProperties}>
    <AnimatedBackground scene={scene}/>
    <SoulforgeShop title={titles[shopNumber-1]} state={state} assets={assets} onAction={onAction} onTalk={()=>setExpression("talk")} onMusic={onMusic} musicOn={musicOn} message={message} merchant={<aside className="forest-shopkeeper"><div className="forest-shopkeeper-portrait">{(["idle","talk","satisfied"] as const).map(pose=><img key={pose} src={shopAsset(`shopkeeper-${shopNumber}${pose==="idle"?"":`-${pose}`}`)} style={{visibility:expression===pose?"visible":"hidden"}} alt={expression===pose?merchants[shopNumber-1]:""} aria-hidden={expression!==pose} draggable={false}/>)}</div><p className="forest-shopkeeper-dialogue">{dialogue[shopNumber-1]}</p></aside>}/>
  </main>;
}
