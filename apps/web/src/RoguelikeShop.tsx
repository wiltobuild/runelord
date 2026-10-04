import { useEffect, useRef, useState } from "react";
import { currentShop, type State, type Action } from "../../../packages/engine/index";
import { infernalShopAppearance } from "../../../packages/engine/index";

import { SoulforgeShop } from "./SoulforgeShop";
import { ShopAmbient } from "./ShopAmbient";
import { assetUrl } from "./baseUrl";
import type { Assets } from "./assets";
import "./shop-scene.css";

const SHOP_HOTSPOTS=[
 [{x:40,y:25,radius:4},{x:94,y:20,radius:5},{x:50,y:58,radius:4},{x:18,y:62,radius:4}],
 [{x:3,y:40,radius:5},{x:73,y:36,radius:4},{x:96,y:36,radius:4},{x:62,y:15,radius:4}],
 [{x:37,y:18,radius:5},{x:36,y:43,radius:3},{x:77,y:51,radius:4},{x:67,y:11,radius:5}]
] as const;
export function RoguelikeShop({state,assets,onAction,onMusic,musicOn,message}:{state:State;assets:Assets;onAction:(action:Action)=>void;onMusic:()=>void;musicOn:boolean;message:string}) {
  const preview=import.meta.env.DEV && new URLSearchParams(location.search).has("shopReview");
  const [shopPreview,setShopPreview]=useState(0);
  const [merchantPreview,setMerchantPreview]=useState(0);
  const [expression,setExpression]=useState<"idle"|"talk"|"satisfied"|"skeptical">("idle");
  const previousGold=useRef(state.gold);
  const [expressionReady,setExpressionReady]=useState(true);
  useEffect(()=>{
    if(previousGold.current>state.gold && state.phase==="shop")setExpression("satisfied");
    previousGold.current=state.gold;
  },[state.gold,state.phase]);
  useEffect(()=>{if(message && state.phase==="shop")setExpression("skeptical");},[message,state.phase]);
  useEffect(()=>{if(expression==="idle")return;const timer=setTimeout(()=>setExpression("idle"),2200);return()=>clearTimeout(timer);},[expression]);

  const shop=currentShop(state);
  const appearance=infernalShopAppearance(state.seed,state.shops?.current ?? null);
  const shopNumber=shopPreview||appearance.shop,merchantNumber=merchantPreview||appearance.merchant;
  const shopHotspots=SHOP_HOTSPOTS[shopNumber-1];
  const speak=()=>setExpression("talk");
  return <main className="infernal-journey shop-journey" data-shop={shopNumber} data-merchant={merchantNumber} style={{backgroundImage:`linear-gradient(#10091148,#100911b0),url(${state.phase==="shop"?assetUrl(`/infernal-assets/shop-${shopNumber}.webp`):assets.images["demon-throne"]})`}}>
    {state.phase==="shop"&&<ShopAmbient hotspots={shopHotspots}/>}
    {state.phase==="shop"&&shop&&<SoulforgeShop state={state} assets={assets} onAction={onAction} onTalk={speak} onMusic={onMusic} musicOn={musicOn} message={message} merchant={<aside className="imp-merchant"><div className={`merchant-portrait expression-${expression}`}><img className="merchant-idle" src={assetUrl(`/infernal-assets/shopkeeper-${merchantNumber}.webp`)} alt="Your demonic imp shopkeeper" style={{opacity:expression==="idle"||!expressionReady?1:0}}/>{expression!=="idle"&&expressionReady&&<span className="merchant-expression" aria-hidden="true"><img src={assetUrl(`/infernal-assets/shopkeeper-${merchantNumber}-expressions.webp`)} onError={()=>setExpressionReady(false)} style={{transform:`translateX(-${({talk:0,satisfied:1,skeptical:2} as const)[expression]*100/3}%)`}} alt=""/></span>}</div><div className="merchant-dialogue"><h2>Gold first. Power follows.</h2><p>“A sharper spell? A lighter deck? I've a price for everything.”</p><small>No refunds beyond the veil.</small>{preview&&<div className="shop-preview-controls"><label>Shop <select value={shopPreview} onChange={e=>setShopPreview(Number(e.target.value))}><option value={0}>Seeded</option>{[1,2,3].map(n=><option key={n} value={n}>{n}</option>)}</select></label><label>Merchant <select value={merchantPreview} onChange={e=>{setMerchantPreview(Number(e.target.value));setExpressionReady(true);}}><option value={0}>Seeded</option>{[1,2,3].map(n=><option key={n} value={n}>{n}</option>)}</select></label>{(["idle","talk","satisfied","skeptical"] as const).map(e=><button key={e} onClick={()=>setExpression(e)}>{e}</button>)}</div>}</div></aside>} />}
  </main>;
}