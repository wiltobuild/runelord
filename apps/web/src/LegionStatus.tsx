import type { State } from "../../../packages/engine/index";

/** Live formation thresholds, derived from the authoritative living Warband. */
export function LegionStatus({state}:{state:State}) {
 const living=state.units.filter(unit=>unit.hp>0);
 const bodyguards=living.filter(unit=>unit.kind==='iron-legionary').length;
 const casters=living.filter(unit=>unit.kind==='maledictor').length;
 if(state.starterDeck!=='hellbound'&&!bodyguards&&!casters)return null;
 const reserves=Object.entries(state.legionRanks??{}).flatMap(([kind,ranks])=>(ranks??[]).map(rank=>`${kind.replaceAll('-',' ')}: rank ${rank}`));
 return <aside className="legion-status" aria-label="Hellbound Legion formations">
  <span className={bodyguards>=2?'ready':''} title="Two living Iron Legionaries share all hostile damage aimed at the Warlock. Their Armor and Guard absorb their shares.">Bodyguard oath <b>{Math.min(bodyguards,2)}/2</b></span>
  <span className={casters>=3?'ready':''} title="Three living Maledictors open a Hellgate at end turn: damage and Scorch all enemies, then promote every soldier. Once per turn.">Hellgate <b>{Math.min(casters,3)}/3</b></span>
  {reserves.length>0 && <span title={reserves.join("; ")}>Awaiting summons <b>{reserves.length}</b></span>}
 </aside>;
}
