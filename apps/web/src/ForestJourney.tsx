import { useEffect, useRef, useState, type CSSProperties } from "react";
import { activeEncounter, canEnterLocation, mapDestinations } from "../../../packages/engine/infernal";
import type { State, Action } from "../../../packages/engine/index";
import type { Assets } from "./assets";
import { AnimatedBackground } from "./AnimatedBackground";
import { SoulforgeShop } from "./SoulforgeShop";
import { assetUrl } from "./baseUrl";
import "./forest-journey.css";

const FOREST_SHOP_NAMES=["Woodland Exchange","Mushroom Hollow","Canopy Market"];

export function ForestJourney({state,assets,onAction,onHome,onMusic,musicOn,message}:{state:State;assets:Assets;onAction:(action:Action)=>void;onHome:()=>void;onMusic:()=>void;musicOn:boolean;message:string}) {
  const journey=state.journey!;
  const current=journey.nodes.find(node=>node.id===journey.current);
  const destinations=new Set(mapDestinations(state).map(node=>node.id));
  const battles=journey.nodes.filter(node=>node.kind!=="shop");
  const completed=battles.filter(node=>journey.completed.includes(node.id)).length;
  const scene=activeEncounter(state)?.background || "forest";
  const shopIndex=Math.max(0,journey.nodes.filter(node=>node.kind==="shop").findIndex(node=>node.id===journey.current));
  const preview=import.meta.env.DEV && location.pathname==="/forest-review";
  const requested=preview?Number(new URLSearchParams(location.search).get("shop")):0;
  const shopNumber=[1,2,3].includes(requested)?requested:shopIndex%3+1;
  const shopNames=FOREST_SHOP_NAMES;
  // Resolve presentation from stable route order, including previously saved journeys.
  const locationName=(node:typeof current)=>node?.kind==="shop"
    ?shopNames[Math.max(0,journey.nodes.filter(entry=>entry.kind==="shop").findIndex(entry=>entry.id===node.id))%3]
    :node?.name;
  const [expression,setExpression]=useState<"idle"|"talk"|"satisfied">("idle");
  const previousGold=useRef(state.gold);
  useEffect(()=>{if(state.phase==="shop"&&state.gold<previousGold.current)setExpression("satisfied");previousGold.current=state.gold;},[state.gold,state.phase]);
  useEffect(()=>{setExpression("idle");},[journey.current]);
  useEffect(()=>{if(expression==="idle")return;const timer=setTimeout(()=>setExpression("idle"),2200);return()=>clearTimeout(timer);},[expression]);
  const shopAsset=(name:string)=>assetUrl(`/forest-shop-assets/${name}.webp`);
  const merchantNames=["Dryad trader","Myconid apothecary","Antlered woodland trader"];
  return <main className={`forest-journey ${state.phase==="shop"?"forest-shop":""}`} data-shop={shopNumber} data-expression={expression} style={{"--forest-scene":`url(${state.phase==="shop"?shopAsset(`background-${shopNumber}`):assets.images[scene] || assets.images.forest})`,"--forest-shop-frame":`url(${shopAsset("shop-frame")})`} as CSSProperties}>
    {state.phase!=="shop"&&<AnimatedBackground scene={scene}/>}
    <header className="forest-header"><button onClick={onHome}>← Sanctum</button><div><span className="eyebrow">REALM II · THORNROOT FOREST</span><h1>{state.phase==="shop"?shopNames[shopNumber-1]:"Beyond the Ember Gate"}</h1></div><div className="forest-resources"><span>♥ {state.hp}/{state.maxHp}</span><span>◉ {state.gold} gold</span><span>{state.deck.length} cards</span><button onClick={onMusic} aria-label={musicOn?"Mute music":"Enable music"}>{musicOn?"♫":"♪"}</button></div></header>
    <p className="forest-feedback" role="status">{message || (state.phase==="shop"?"Trade, strengthen your cards, and prepare for the next stretch.":`${completed} / 12 encounters cleared · Your Infernal spoils travel with you.`)}</p>
    {state.phase==="shop"?<SoulforgeShop title={shopNames[shopNumber-1]} state={state} assets={assets} onAction={onAction} onTalk={()=>setExpression("talk")} onMusic={onMusic} musicOn={musicOn} message={message} merchant={<aside className="forest-shopkeeper"><div className="forest-shopkeeper-portrait">{(["idle","talk","satisfied"] as const).map(pose=><img key={pose} src={shopAsset(`shopkeeper-${shopNumber}${pose==="idle"?"":`-${pose}`}`)} style={{visibility:expression===pose?"visible":"hidden"}} alt={expression===pose?merchantNames[shopNumber-1]:""} aria-hidden={expression!==pose} draggable={false}/>)}</div><p className="forest-shopkeeper-dialogue">{["Every seed holds a promise.","A remedy for the road ahead.","A fair measure. A fair price."][shopNumber-1]}</p></aside>}/>:<>
      <section className="forest-arrival" aria-label="Current location"><div><span className="eyebrow">{current?"CURRENT LOCATION":"THE FOREST AWAITS"}</span><h2>{locationName(current) || "Thornroot Crossing"}</h2><p>{current?.encounter.subtitle || "Follow the woodland path. A trader waits after every three encounters."}</p></div>{canEnterLocation(state)&&<button className="primary" onClick={()=>onAction({type:"enter-location"})}>{current?.kind==="shop"?"Visit exchange":"Begin encounter"} →</button>}</section>
      <nav className="forest-route" aria-label="Forest encounters and shops">{journey.nodes.map(node=>{
        const done=journey.completed.includes(node.id),here=current?.id===node.id,available=destinations.has(node.id),number=battles.findIndex(b=>b.id===node.id)+1;
        const name=locationName(node);
        return <button key={node.id} className={`forest-tile ${node.kind} ${done?"complete":""} ${here?"current":""}`} disabled={!available} aria-current={here?"location":undefined} onClick={()=>onAction({type:"arrive",node:node.id})} aria-label={`${node.kind==="shop"?"Shop":`Encounter ${number}`}: ${name}${done?", cleared":here?", current location":available?", travel available":", locked"}`}><span className="forest-tile-number">{done?"✓":node.kind==="shop"?"◉":String(number).padStart(2,"0")}</span><span><small>{node.kind==="shop"?"FOREST SHOP":node.kind==="boss"?"FOREST SOVEREIGN":node.kind==="elite"?"ELITE ENCOUNTER":"ENCOUNTER"}</small><strong>{name}</strong><em>{here?"You are here":done?"Cleared":available?"Travel here →":node.kind==="shop"?"Buy · Upgrade · Remove":"Further along the path"}</em></span></button>;
      })}</nav>
    </>}
  </main>;
}
