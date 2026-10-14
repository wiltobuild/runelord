import { useEffect, useMemo, useRef, useState, type CSSProperties, type PointerEvent } from "react";
import { mapDestinations, discoveredNodes, infernalStartNode, canEnterLocation, type State, type Action } from "../../../packages/engine/index";
import { assetUrl } from "./baseUrl";
import { MAP_STAGE, infernalAnchor, infernalMapEdge, MAP_LAVA_HOTSPOTS } from "./infernalMapLayout";
import { InfernalAmbient } from "./InfernalAmbient";
import { generateMapProps, makePropLayout, mapDetailOpacity } from "./infernalMapProps";
import "./infernal-map.css";
import { infernalMarkerAppearance } from "./infernalMarkerAppearance";

const labels = { combat: "Battle", elite: "Elite", shop: "Shop", treasure: "Treasure", camp: "Camp", boss: "Sovereign" };
type Camera = { x: number; y: number; scale: number };
export function InfernalMap({ state, onAction, onHome, onMusic, musicOn, message, preview, tierPreview, onTierPreview }: {
  state: State; onAction: (action: Action) => void; onHome: () => void; onMusic: () => void; musicOn: boolean;
  message: string; preview: boolean; tierPreview: number; onTierPreview: (tier: number) => void;
}) {
  const journey = state.journey!;
  const circuit = journey.nodes[0]?.id.startsWith("infernal-v2");
  const decorations = useMemo(() => generateMapProps(state.seed, makePropLayout(circuit)), [state.seed, circuit]);
  const viewport = useRef<HTMLDivElement>(null);
  const [camera, setCamera] = useState<Camera>({ x: 0, y: 0, scale: 1 });
  const cameraRef = useRef(camera);
  const fit = useRef(1);
  const pointers = useRef(new Map<number, { x: number; y: number }>());
  const gesture = useRef({ startX: 0, startY: 0, moved: false, suppressUntil: 0 });
  const [dragging, setDragging] = useState(false);
  const available = new Set(mapDestinations(state).map(node => node.id));
  const startNodes = [infernalStartNode(state)].filter((node): node is NonNullable<typeof node> => !!node);
  const discovered = new Set(discoveredNodes(state).map(node => node.id));
  const origin = journey.current ? infernalAnchor(journey.current) : infernalAnchor(startNodes[0]?.id ?? journey.nodes[0].id);
  const currentName = journey.nodes.find(node => node.id === journey.current)?.name;
  const move = (next: Camera) => {
    const element = viewport.current;
    if (element) {
      const width = MAP_STAGE.width * next.scale, height = MAP_STAGE.height * next.scale;
      next = { ...next,
        x: width <= element.clientWidth ? (element.clientWidth - width) / 2 : Math.max(element.clientWidth - width, Math.min(0, next.x)),
        y: height <= element.clientHeight ? (element.clientHeight - height) / 2 : Math.max(element.clientHeight - height, Math.min(0, next.y)) };
    }
    cameraRef.current = next; setCamera(next);
  };
  const center = (overview = false) => {
    const element = viewport.current; if (!element) return;
    const scale = fit.current * (overview ? 1 : 2.25);
    const point = overview ? { x: MAP_STAGE.width / 2, y: MAP_STAGE.height / 2 } : origin ?? { x: 180, y: 530 };
    move({ scale, x: element.clientWidth / 2 - point.x * scale, y: element.clientHeight / 2 - point.y * scale + (overview ? 0 : 35) });
  };
  const zoom = (factor: number, x?: number, y?: number) => {
    const element = viewport.current; if (!element) return;
    const old = cameraRef.current;
    const scale = Math.max(fit.current * .75, Math.min(fit.current * 4.5, old.scale * factor));
    const px = x ?? element.clientWidth / 2, py = y ?? element.clientHeight / 2;
    move({ scale, x: px - (px - old.x) * scale / old.scale, y: py - (py - old.y) * scale / old.scale });
  };
  useEffect(() => {
    const element = viewport.current; if (!element) return;
    const resize = () => { fit.current = Math.min(element.clientWidth / MAP_STAGE.width, element.clientHeight / MAP_STAGE.height); center(); };
    const observer = new ResizeObserver(resize); observer.observe(element); resize();
    const wheel = (event: WheelEvent) => { event.preventDefault(); const rect = element.getBoundingClientRect(); zoom(Math.exp(-event.deltaY * .0018), event.clientX - rect.left, event.clientY - rect.top); };
    element.addEventListener("wheel", wheel, { passive: false });
    return () => { observer.disconnect(); element.removeEventListener("wheel", wheel); };
  }, [journey.current]);
  const down = (event: PointerEvent<HTMLDivElement>) => {
    if (event.button !== 0) return;
    pointers.current.set(event.pointerId, { x: event.clientX, y: event.clientY });
    gesture.current.startX = event.clientX; gesture.current.startY = event.clientY; gesture.current.moved = false;
  };
  const drag = (event: PointerEvent<HTMLDivElement>) => {
    // A mouse released outside before capture must not keep dragging on re-entry.
    if (event.pointerType === "mouse" && event.buttons === 0) {
      pointers.current.delete(event.pointerId); setDragging(false); return;
    }
    const previous = pointers.current.get(event.pointerId); if (!previous) return;
    const before = [...pointers.current.values()];
    pointers.current.set(event.pointerId, { x: event.clientX, y: event.clientY });
    const after = [...pointers.current.values()];
    if (!gesture.current.moved && pointers.current.size === 1 && Math.hypot(event.clientX - gesture.current.startX, event.clientY - gesture.current.startY) < 6) return;
    gesture.current.moved = true; setDragging(true); event.currentTarget.setPointerCapture(event.pointerId);
    if (after.length === 2) {
      const rect = event.currentTarget.getBoundingClientRect();
      const oldDistance = Math.hypot(before[0].x - before[1].x, before[0].y - before[1].y);
      const newDistance = Math.hypot(after[0].x - after[1].x, after[0].y - after[1].y);
      if (oldDistance > 0) zoom(newDistance / oldDistance, (before[0].x + before[1].x) / 2 - rect.left, (before[0].y + before[1].y) / 2 - rect.top);
      move({ ...cameraRef.current, x: cameraRef.current.x + (event.clientX - previous.x) / 2, y: cameraRef.current.y + (event.clientY - previous.y) / 2 });
    } else move({ ...cameraRef.current, x: cameraRef.current.x + event.clientX - previous.x, y: cameraRef.current.y + event.clientY - previous.y });
  };
  const up = (event: PointerEvent<HTMLDivElement>) => {
    pointers.current.delete(event.pointerId);
    if (gesture.current.moved) gesture.current.suppressUntil = Date.now() + 300;
    if (event.currentTarget.hasPointerCapture(event.pointerId)) event.currentTarget.releasePointerCapture(event.pointerId);
    if (!pointers.current.size) setDragging(false);
  };
  return <section className="infernal-atlas" aria-label="Infernal territory" style={{ "--atlas-button": `url(${assetUrl("/opening-assets/runic-button.webp")})` } as CSSProperties}>
    <header className="atlas-header" style={{ backgroundImage: `url(${assetUrl("/infernal-assets/map-ui-header.webp")})` }}>
      <button className="atlas-control" onClick={onHome}>← Sanctum</button>
      <div className="atlas-title"><span>THE INFERNAL DOMINION</span><h1>Road to the Sovereign</h1></div>
      <div className="atlas-resources"><span aria-label={`Health ${state.hp} of ${state.maxHp}`}>♥ {state.hp}/{state.maxHp}</span><strong>{state.gold} Gold</strong><span>{state.deck.length} Cards</span><button className="atlas-control atlas-music" onClick={onMusic} aria-label={musicOn ? "Mute music" : "Enable music"}>{musicOn ? "♫" : "♪"}</button></div>
    </header>
    <div className="atlas-viewport" ref={viewport} tabIndex={0} role="region" aria-label="Interactive map. Drag to pan, scroll or pinch to zoom. Arrow keys pan; plus and minus zoom." data-dragging={dragging}
      onPointerDown={down} onPointerMove={drag} onPointerUp={up} onPointerCancel={up}
      onClickCapture={event => { if (Date.now() < gesture.current.suppressUntil) { event.preventDefault(); event.stopPropagation(); } }}
      onKeyDown={event => { if (event.target !== event.currentTarget) return; const offsets: Record<string, [number, number]> = { ArrowLeft: [80, 0], ArrowRight: [-80, 0], ArrowUp: [0, 80], ArrowDown: [0, -80] }; if (offsets[event.key]) { event.preventDefault(); const [x, y] = offsets[event.key]; move({ ...cameraRef.current, x: cameraRef.current.x + x, y: cameraRef.current.y + y }); } else if (["+", "=", "-"].includes(event.key)) { event.preventDefault(); zoom(event.key === "-" ? .8 : 1.25); } }}>
      <div className="atlas-world" style={{ left: camera.x, top: camera.y }}>
        <section className={`journey-map illustrated-map ${journey.nodes[0]?.id.startsWith("infernal-v2") ? "circuit-map" : ""}`} aria-label="Branching Infernal route map" style={{ zoom: camera.scale, backgroundImage: `url(${assetUrl(camera.scale*(window.devicePixelRatio||1)>2?"/infernal-assets/map-detail-r2-8k.webp":"/infernal-assets/map-detail-r2.webp")})` }}>
          <InfernalAmbient hotspots={MAP_LAVA_HOTSPOTS}/>
          <div className="atlas-terrain-details" aria-hidden="true" data-visible={camera.scale / fit.current > 1.15} style={{ opacity: mapDetailOpacity(camera.scale / fit.current) }}>
            {decorations.map(prop => <img key={prop.id} data-map-prop={prop.asset} className={`atlas-terrain-prop prop-${prop.kind}`} src={assetUrl(`/infernal-assets/props/${prop.asset}.webp`)} srcSet={[256,512,1024].map(size => `${assetUrl(`/infernal-assets/props/${prop.asset}${size===256?"":`-${size}`}.webp`)} ${size}w`).join(", ")} sizes={`${Math.ceil(prop.width*camera.scale)}px`} alt="" draggable={false} decoding="async" style={{ left: prop.x, top: prop.y, width: prop.width, height: prop.height }}/>) }
          </div>
          <svg className="journey-routes" viewBox={`0 0 ${MAP_STAGE.width} ${MAP_STAGE.height}`} aria-hidden="true">
            {journey.nodes.flatMap(node => node.next.map(id => {
              const route = infernalMapEdge(node.id, id); if (!route || !discovered.has(node.id) || !discovered.has(id)) return null;
              const forward = node.id === journey.current && available.has(id);
              const backward = id === journey.current && available.has(node.id);
              const points = backward ? [...route.points].reverse() : route.points;
              return <g key={route.id} className={forward || backward ? "open" : journey.completed.includes(node.id) && journey.completed.includes(id) ? "travelled" : "dormant"}><path className="route-trail" d={`M ${points.map(point => `${point.x},${point.y}`).join(" L ")}`}/></g>;
            }))}
          </svg>
        </section></div>
      <div className="atlas-marker-camera" style={{left:camera.x,top:camera.y}}><section className={`journey-map illustrated-map atlas-marker-layer ${circuit ? "circuit-map" : ""}`} style={{zoom:camera.scale}}>
          {journey.nodes.map(node => {
            const point = infernalAnchor(node.id); if (!point || !discovered.has(node.id)) return null;
            const completed = journey.completed.includes(node.id), current = journey.current === node.id, starting = !journey.current && startNodes.some(start => start.id === node.id);
            const appearance = infernalMarkerAppearance(node.kind,state.seed,node.id,point.tier);
            const tier = tierPreview >= 0 ? tierPreview : appearance.tier;
            const density=camera.scale*(window.devicePixelRatio||1);
            const lod=density>4?1024:density>1.5?512:256;
            const marker=node.kind==="boss"&&circuit?`/infernal-assets/infernal-grand-throne-${density>1.5?1024:512}.webp`:`/infernal-assets/marker-${appearance.atlas}${lod===256?"":`-${lod}`}.webp`;
            return <button key={node.id} data-node={node.id} data-tier={tier + 1} aria-current={current ? "location" : undefined} className={`journey-node ${node.kind} ${available.has(node.id) ? "available" : ""} ${completed ? "visited" : ""} ${current ? "current" : ""} ${starting ? "starting" : ""}`} style={{ left: `${point.x / MAP_STAGE.width * 100}%`, top: `${point.y / MAP_STAGE.height * 100}%`, "--marker-scale": point.artScale ?? 1 } as React.CSSProperties} disabled={!available.has(node.id) && !(current && canEnterLocation(state))} onClick={() => onAction(current ? {type:"enter-location"} : { type: "arrive", node: node.id })} title={`${node.name} · ${labels[node.kind]}${current ? " · You are here" : completed ? " · Cleared; safe to revisit" : ""}`} aria-label={`${node.name}, ${labels[node.kind]}${current ? ", you are here" : completed ? ", cleared, revisit" : starting ? ", starting location" : ""}`}>
              {(current || starting) && <span className="atlas-location-flag">{current ? "YOU ARE HERE" : "START HERE"}</span>}
              <span className="map-marker-art" aria-hidden="true" style={{ backgroundImage: `url(${assetUrl(marker)})`, backgroundPosition: `${tier * 50}% 100%` }}/>
              {completed && ["combat","elite","boss"].includes(node.kind) && <span className="atlas-cleared-smoke" aria-hidden="true"><i/><i/><i/></span>}
              {current && canEnterLocation(state) && <strong className="atlas-node-label" style={{ backgroundImage: `url(${assetUrl(density>2?"/opening-assets/runic-button.webp":"/infernal-assets/map-label-384.webp")})` }}>{node.kind==="camp"?<span aria-hidden="true">♨</span>:<img src={assetUrl(`/infernal-assets/map-icon-${node.kind}.webp`)} alt=""/>}{labels[node.kind]}{completed && <span className="atlas-cleared" aria-label="Cleared">✓</span>}</strong>}
              {current && <span className="atlas-current-particles" aria-hidden="true"><i/><i/><i/><i/><i/></span>}
              <small>{node.name}</small>
            </button>;
          })}
        </section>
      </div>
    </div>
    <footer className="atlas-footer" style={{ backgroundImage: `url(${assetUrl("/infernal-assets/map-ui-footer.webp")})` }}>
      <div className="atlas-location" role="status"><strong>{journey.current ? `You are at ${currentName}` : "Your journey begins at the Ashen Foothold"}</strong><span>{message || (journey.current ? "Follow the moving embers. Cleared paths can be retraced." : "Select START HERE to arrive at your first encounter.")}</span></div>
      <div className="atlas-camera-controls"><button className="atlas-control" onClick={() => zoom(.8)} aria-label="Zoom map out">−</button><output aria-label="Map zoom">{Math.round(camera.scale / fit.current * 100)}%</output><button className="atlas-control" onClick={() => zoom(1.25)} aria-label="Zoom map in">+</button><button className="atlas-control" onClick={() => center()}>Your location</button><button className="atlas-control" onClick={() => center(true)}>Overview</button></div>
      <p className="atlas-help">Drag to explore · Scroll / pinch to zoom</p>
      {preview && <label className="atlas-tier-review">Marker review <select value={tierPreview} onChange={event => onTierPreview(Number(event.target.value))}><option value={-1}>Depth tiers</option>{[0, 1, 2].map(tier => <option value={tier} key={tier}>Tier {tier + 1}</option>)}</select></label>}
    </footer>
  </section>;
}
