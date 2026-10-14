import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { availableOrders, type State, type Action, type Unit } from "../../../packages/engine/index";
import { summonTraining } from "../../../packages/engine/expansionCatalog";
import "./summon-orders.css";

export function orderName(state: State, unit: Unit) {
  return availableOrders(state, unit).find(order => order.id === (unit.order ?? "attack"))?.name ?? summonTraining[unit.kind].baseName;
}

/** Orders are engine actions. This panel only selects an order and its legal target. */
export function SummonOrders({state,unit,onAction,onClose,onDismiss}:{state:State;unit:Unit;onAction:(action:Action)=>void;onClose:()=>void;onDismiss:()=>void}) {
  const choices = availableOrders(state,unit);
  const [chosen,setChosen] = useState(unit.order ?? choices[0]?.id ?? "basic");
  const [target,setTarget] = useState<number | undefined>(unit.orderTarget);
  const [matching,setMatching] = useState(false);
  const panel=useRef<HTMLElement>(null);
  const ability=choices.find(order=>order.id===chosen) ?? choices[0];
  const targets=ability?.target==='ally'?state.units.filter(u=>u.hp>0):ability?.target==='enemy'?state.enemies.filter(e=>e.hp>0):[];
  const selectedTarget=targets.some(value=>value.id===target)?target:targets[0]?.id;
  useEffect(()=>{
    const previous=document.activeElement as HTMLElement|null;
    panel.current?.querySelector<HTMLButtonElement>('button')?.focus();
    const onKey=(event:KeyboardEvent)=>{
      if(event.key==='Escape'){event.stopPropagation();onClose();}
      if(event.key==='Tab'){
        const controls=panel.current?.querySelectorAll<HTMLElement>('button:not(:disabled),select,input');
        if(!controls?.length)return;const first=controls[0],last=controls[controls.length-1];
        if(event.shiftKey&&document.activeElement===first){event.preventDefault();last.focus();}
        else if(!event.shiftKey&&document.activeElement===last){event.preventDefault();first.focus();}
      }
    };
    document.addEventListener('keydown',onKey,true);
    return()=>{document.removeEventListener('keydown',onKey,true);previous?.focus();};
  },[onClose]);
  return createPortal(<div className="orders-backdrop" onClick={onClose}>
    <section ref={panel} className="orders-panel" role="dialog" aria-modal="true" aria-label={`Orders for ${unit.name}`} onClick={event=>event.stopPropagation()}>
      <button className="orders-close" onClick={onClose} aria-label="Close orders">×</button>
      <div className="orders-kicker">COMMAND YOUR WARBAND</div><h2>{unit.name}</h2>
      <p className="orders-intro">Choose one action for the next summon phase. The order repeats until changed.</p>
      <div className="orders-options" role="group" aria-label="Available orders">{choices.map((order,index)=><button key={order.id} aria-pressed={chosen===order.id} className={chosen===order.id?'selected':''} onClick={()=>{setChosen(order.id);setTarget(undefined);}}><span className="orders-rune" aria-hidden="true">{index===0?'⚔':index===1?'◇':'✦'}</span><small>{index===0?'SIGNATURE':index===1?'TRAINED':'MASTERED'}</small><strong>{order.name}</strong><span>{order.description}</span></button>)}</div>
      {choices.length<3&&<p className="orders-training-hint">Train this summon type at a camp or shop to unlock {3-choices.length} more {choices.length===2?'order':'orders'} for every matching summon.</p>}
      {targets.length>0&&<label className="orders-target">{ability.target==='ally'?'Protect or empower':'Attack or weaken'}<select aria-label="Order target" value={selectedTarget} onChange={event=>setTarget(Number(event.target.value))}>{targets.map(value=><option key={value.id} value={value.id}>{value.name} · {value.hp}/{value.maxHp} HP</option>)}</select></label>}
      {state.units.filter(value=>value.kind===unit.kind&&value.hp>0).length>1&&<label className="orders-matching"><input type="checkbox" checked={matching} onChange={event=>setMatching(event.target.checked)}/>Apply to all living {unit.name} summons</label>}
      <div className="orders-footer"><button className="orders-dismiss" onClick={onDismiss}>Select for replacement</button><button className="orders-confirm" disabled={!ability||((ability.target==='ally'||ability.target==='enemy')&&selectedTarget===undefined)} onClick={()=>{onAction({type:'set-order',unit:unit.id,order:ability.id,...(selectedTarget===undefined?{}:{target:selectedTarget}),allOfKind:matching});onClose();}}>Set {ability?.name ?? 'order'} →</button></div>
      <p className="orders-footnote">Orders cost no Mana. Command cards trigger the signature action. {unit.rot!==undefined?'Rot applies after every action.':''}</p>
    </section>
  </div>,document.body);
}
