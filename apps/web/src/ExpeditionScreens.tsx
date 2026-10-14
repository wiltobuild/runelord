import { useEffect, useId, useRef, useState, type CSSProperties, type ReactNode } from "react";
import { createPortal } from "react-dom";
import { cards, items, type ItemId } from "../../../packages/content/index";
import { campRecovery, cardLevel, currentRealm, trainingOptions, upgradePreview, type Action, type DemonKind, type State } from "../../../packages/engine/index";
import { expansionRelics, summonTraining } from "../../../packages/engine/expansionCatalog";
import { assetUrl } from "./baseUrl";
import { cardArtwork } from "./cardPresentation";
import { LootIcon } from "./LootIcon";
import type { Assets } from "./assets";
import "./expedition-screens.css";

type Shared = { state: State; assets: Assets; onAction: (action: Action) => void; message?: string; onHome?: () => void };
type TrainingSource = "shop" | "camp" | "treasure";
type Destination = { id: string; kind: string; name: string; description: string };
const realmNames = { infernal: "Infernal", forest: "Thornroot Forest", "frozen-wastes": "Frozen Wastes" };
const campNames = { infernal: "The Ember Refuge", forest: "The Rootbound Sanctuary", "frozen-wastes": "The Last Hearth" };
const trainingNames = ["Untrained", "Trained", "Mastered"];
type Realm = keyof typeof realmNames;
const exchangeNames = { infernal: "The Ember Exchange", forest: "The Woodland Exchange", "frozen-wastes": "Frostbound Exchange" };
const pathNames: Record<Realm, Record<string, string>> = {
  "frozen-wastes": { combat: "Frostgrave Crossing", mystery: "The Veiled Gate", treasure: "Buried Riches", shop: "Frostbound Exchange", elite: "The Rimebound Bastion", camp: "The Last Hearth", boss: "The Frozen Heart" },
  forest: { combat: "Thornroot Crossing", mystery: "The Hidden Way", treasure: "The Overgrown Reliquary", shop: "The Woodland Exchange", elite: "The Thornbound Grove", camp: "The Rootbound Sanctuary", boss: "The Living Orchard" },
  infernal: { combat: "The Ashen Causeway", mystery: "The Whispering Rift", treasure: "The Ember Treasury", shop: "The Ember Exchange", elite: "The Cinder Bastion", camp: "The Ember Refuge", boss: "The Demon Throne" },
};
const uiArt = (assets: Assets, name: string) => assets.images[`expedition-ui-${name}`] ?? assetUrl(`/game-assets/expedition/ui/${name}.webp`);
const pathArt = (assets: Assets, realm: Realm, kind: string) => assets.images[`path-${realm}-${kind}`] ?? assetUrl(`/game-assets/expedition/paths/${realm}/${kind}.webp`);
const expeditionStyle = (assets: Assets, realm?: Realm, kind = "combat") => ({
  "--expedition-card-frame": `url("${uiArt(assets, "card-frame")}")`,
  "--expedition-panel-frame": `url("${uiArt(assets, "panel-frame")}")`,
  "--expedition-button": `url("${uiArt(assets, "button")}")`,
  "--expedition-basalt": `url("${uiArt(assets, "basalt")}")`,
  ...(realm ? { "--expedition-scene": `url("${pathArt(assets, realm, kind)}")` } : {}),
} as CSSProperties);

function Medallion({ assets, kind }: { assets: Assets; kind: string }) {
  const name = ({ camp: "rest", train: "command", upgrade: "refine", relic: "treasure" } as Record<string, string>)[kind] ?? kind;
  const known = ["combat", "mystery", "treasure", "rest", "refine", "command", "gold"].includes(name);
  return <span className={`expedition-medallion ${known ? "" : "medallion-rune"}`} aria-hidden="true">{known ? <img src={uiArt(assets, `medallion-${name}`)} alt="" draggable={false} /> : <RuneIcon kind={name} />}</span>;
}

function ExpeditionChrome({ state, assets, onHome }: { state: State; assets: Assets; onHome?: () => void }) {
  return <div className="expedition-chrome"><div className="expedition-brand-wrap"><span className="expedition-banner" aria-hidden="true">◇</span>{onHome ? <button className="expedition-brand" onClick={onHome} aria-label="Runelord · Return to title">RUNELORD</button> : <span className="expedition-brand">RUNELORD</span>}</div><div className="expedition-counters"><span className="expedition-counter health" aria-label={`Health: ${state.hp} of ${state.maxHp}`}><span aria-hidden="true">♥</span> {state.hp} / {state.maxHp}</span><span className="expedition-counter gold" aria-label={`${state.gold} gold`}><span aria-hidden="true">◉</span> {state.gold}</span><RelicCollection state={state} assets={assets} /></div></div>;
}

/** Live icons use the same simple angular vocabulary as the combat HUD. */
function RuneIcon({ kind }: { kind: string }) {
  const paths: Record<string, ReactNode> = {
    battle: <><path d="m10 8 17 17-4 4L6 12Z M20 28l8-8 M17 29l-5 5 M8 30l8 8 M30 8 13 25 M29 21l5 5" /></>,
    elite: <><path d="m9 8 13 6L35 8l-4 21-9 9-9-9Z M15 19l5 3 M29 19l-5 3 M18 29h8" /></>,
    boss: <><path d="m7 10 7 7 8-11 8 11 7-7-4 22H11Z M12 38h20" /></>,
    mystery: <><path d="M15 15a7 7 0 1 1 11 6c-4 2-4 4-4 7 M22 34v2" /></>,
    treasure: <><path d="M7 18h30v19H7Z M7 18l5-9h20l5 9 M7 24h30 M18 20h8v10h-8Z" /></>,
    shop: <><path d="M8 18h28l-4-9H12Z M11 18v20h22V18 M17 27h10v11 M6 18v5h6v-5 M18 18v5h8v-5 M32 18v5h6v-5" /></>,
    camp: <><path d="M20 8c3 8-7 9-6 16 0 6 4 9 8 9 7 0 11-5 9-11-2 2-4 3-6 2 3-6-2-12-5-16Z M9 38l26-5 M10 33l25 5" /></>,
    train: <><path d="m22 5 14 17-14 17L8 22Z M22 13v18 M15 22h14" /></>,
    upgrade: <><path d="M11 9h20v29H11Z M22 31V17 M16 23l6-6 6 6" /></>,
    relic: <><path d="m22 5 6 10 11 7-11 7-6 10-6-10L5 22l11-7Z M22 14l8 8-8 8-8-8Z" /></>,
  };
  return <svg viewBox="0 0 44 44" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" strokeLinecap="round">{paths[kind] ?? paths.relic}</svg>;
}

function ExpeditionDialog({ title, onClose, children, className = "", assets, state, context, subtitle }: { title: string; onClose?: () => void; children: ReactNode; className?: string; assets: Assets; state?: State; context?: string; subtitle?: string }) {
  const container = useRef<HTMLElement>(null);
  const titleId = useId();
  const close = useRef(onClose);
  close.current = onClose;
  useEffect(() => {
    const previous = document.activeElement as HTMLElement | null;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const root = container.current;
    root?.focus();
    const keyboard = (event: KeyboardEvent) => {
      const dialogs = document.querySelectorAll('[role="dialog"][aria-modal="true"]');
      if (dialogs[dialogs.length - 1] !== root) return;
      if (event.key === "Escape" && close.current) { event.preventDefault(); event.stopPropagation(); close.current(); }
      if (event.key !== "Tab") return;
      const controls = Array.from(root?.querySelectorAll<HTMLElement>('button:not(:disabled),select:not(:disabled),summary,a[href],input:not(:disabled),[tabindex="0"]') ?? []).filter(element => element.getClientRects().length > 0 && !element.closest('[inert]'));
      if (!controls?.length) { event.preventDefault(); return; }
      const first = controls[0], last = controls[controls.length - 1];
      const outside = !root?.contains(document.activeElement);
      if (event.shiftKey && (outside || document.activeElement === first || document.activeElement === root)) { event.preventDefault(); last.focus(); }
      else if (!event.shiftKey && (outside || document.activeElement === last || document.activeElement === root)) { event.preventDefault(); first.focus(); }
    };
    document.addEventListener("keydown", keyboard, true);
    return () => { document.removeEventListener("keydown", keyboard, true); document.body.style.overflow = previousOverflow; if (previous?.isConnected) previous.focus(); };
  }, []);
  return createPortal(<div className={`expedition-backdrop ${state ? "scenic-backdrop" : ""}`} style={expeditionStyle(assets, state ? currentRealm(state) : undefined, "shop")} onClick={onClose}>
    <section ref={container} tabIndex={-1} className={`expedition-dialog ${className}`} role="dialog" aria-modal="true" aria-labelledby={titleId} onClick={event => event.stopPropagation()}>
      {state && <ExpeditionChrome state={state} assets={assets} />}
      <div className="expedition-dialog-panel"><header className="expedition-dialog-heading"><div><span className="expedition-kicker">{context ?? "RUNELORD · THE LONG JOURNEY"}</span><h2 id={titleId}>{title}</h2>{subtitle && <p>{subtitle}</p>}</div>{onClose && <button className="expedition-close" onClick={onClose} aria-label={`Close ${title}`}>×</button>}</header>
      {children}
      </div>
    </section>
  </div>, document.body);
}

function SummonPortrait({ kind, assets }: { kind: DemonKind; assets: Assets }) {
  const src = assets.images[kind] ?? assets.actors[kind]?.states.idle?.frames[0]?.src;
  return <span className="training-portrait">{src ? <img src={src} alt="" draggable={false} /> : <RuneIcon kind="train" />}</span>;
}

export function SummonTraining({ state, assets, onAction, source = "shop", onClose, message }: Shared & { source?: TrainingSource; onClose?: () => void }) {
  const options = trainingOptions(state);
  const eligible = options.filter(option => option.level < 2);
  const mastered = options.filter(option => option.level >= 2);
  const [selectedKind, setSelectedKind] = useState<DemonKind | undefined>(eligible[0]?.kind ?? mastered[0]?.kind);
  const selected = options.find(option => option.kind === selectedKind) ?? eligible[0] ?? mastered[0];
  const kit = selected ? summonTraining[selected.kind] : undefined;
  const next = kit && selected && selected.level < 2 ? kit.tiers[selected.level as 0 | 1] : undefined;
  const free = source !== "shop";
  const canTrain = !!selected && selected.level < 2 && (free || selected.canTrain);
  const train = () => {
    if (!selected || !canTrain) return;
    onAction(source === "shop" ? { type: "train-summon", kind: selected.kind } : source === "camp" ? { type: "camp-choice", choice: "train", kind: selected.kind } : { type: "claim-treasure", choice: "train", kind: selected.kind });

  };
  const tile = (option: typeof options[number]) => <button key={option.kind} className={`training-tile ${option.kind === selected?.kind ? "selected" : ""}`} aria-pressed={option.kind === selected?.kind} onClick={() => setSelectedKind(option.kind)}>
    <SummonPortrait kind={option.kind} assets={assets} /><span className="training-tile-copy"><strong>{option.name}</strong><small>{trainingNames[Math.min(2, option.level)]}</small></span>
    <span className="training-tile-price">{option.level >= 2 ? "◆" : free ? "Free" : <><i aria-hidden="true">◉</i> {option.cost} G</>}</span>
  </button>;
  const context = source === "shop" ? exchangeNames[currentRealm(state)] : source === "camp" ? `${campNames[currentRealm(state)]} · ONE CAMP ACTION` : "ANCIENT KNOWLEDGE · ONE TREASURE";
  return <ExpeditionDialog title="Train your warband" assets={assets} state={state} context={context} subtitle="One lesson. Every summon of its kind." onClose={onClose} className="training-dialog">
    {message && <p className="expedition-status" role="status">{message}</p>}
    {options.length === 0 ? <div className="expedition-empty"><Medallion assets={assets} kind="command" /><h3>No summons discovered yet</h3><p>Acquire a summon card or summon a new creature to unlock its training.</p>{onClose && <button className="expedition-secondary" onClick={onClose}>← Back to {source}</button>}</div> : <div className="training-layout">
      <div className="training-roster"><h3>Ready to train <span>({eligible.length})</span></h3><div className="training-roster-scroll">{eligible.length ? <div className="training-roster-list">{eligible.map(tile)}</div> : <p className="expedition-muted">Your entire discovered warband is mastered.</p>}{mastered.length > 0 && <details className="training-mastered" open={eligible.length === 0 ? true : undefined}><summary>Mastered summons · {mastered.length}</summary><div className="training-roster-list">{mastered.map(tile)}</div></details>}</div>{onClose && <button className="expedition-secondary training-back" onClick={onClose}>← Back to {source === "treasure" ? "rewards" : source}</button>}</div>
      {selected && kit && <section className="training-detail" aria-label={`${selected.name} training details`}>
        <div className="training-detail-top"><SummonPortrait kind={selected.kind} assets={assets} /><div><h3>{selected.name}</h3><span className="expedition-kicker">{trainingNames[Math.min(2, selected.level)]}{next && <> <b>→</b> {trainingNames[selected.level + 1]}</>}</span><span key={`${selected.kind}-${selected.level}`} className="training-runes" aria-label={`Training level ${selected.level} of 2`}>{[0, 1, 2].map(level => <i key={level} className={level <= selected.level ? "unlocked" : ""}>◆</i>)}</span></div></div>
        <div className="training-ability current"><img className="training-ability-icon" src={uiArt(assets, "ability-signature")} alt="" /><div><span className="training-ability-tag">SIGNATURE · UNLOCKED</span><h4>{kit.baseName}</h4><p>Performs this creature’s normal combat action.</p></div></div>
        {kit.tiers.map((order, index) => { const locked = index > selected.level; return <div key={order.id} className={`training-ability ${index < selected.level ? "current" : index === selected.level ? "next" : "locked"}`}><img className="training-ability-icon" src={uiArt(assets, locked ? "ability-locked" : /\bguard\b/i.test(order.description) ? "ability-shield" : "ability-signature")} alt="" /><div><span className="training-ability-tag">TRAINING {index === 0 ? "I" : "II"} · {index < selected.level ? "UNLOCKED" : index === selected.level ? "NEXT" : "LOCKED"}</span><h4>{order.name}</h4><p>{order.description}</p><small>{order.target === "enemy" ? "Choose an enemy" : order.target === "ally" ? "Choose an allied summon" : order.target === "self" ? "Affects this summon" : "No target required"} · Replaces its normal action</small></div></div>; })}
        {next ? <div className="training-confirm"><button className="expedition-primary" disabled={!canTrain} onClick={train} aria-label={canTrain ? `Confirm training · ${free ? "Free" : `${selected.cost} gold`}` : `Need ${Math.max(0, selected.cost - state.gold)} more gold`}>{canTrain ? `Train ${selected.name} · ${free ? "Free" : `${selected.cost} gold`}` : `Need ${Math.max(0, selected.cost - state.gold)} more gold`}</button><p>Unlocks {next.name} for every {selected.name} this run.{free && <small>{source === "camp" ? "Uses your one camp action." : "Claims your one treasure reward."}</small>}</p></div> : <p className="training-complete">◆ Mastered · Every order is available.</p>}
      </section>}
    </div>}
  </ExpeditionDialog>;
}

export function CampScene({ state, assets, onAction, message, onHome }: Shared) {
  const realm = currentRealm(state);
  const [view, setView] = useState<"camp" | "train" | "upgrade">("camp");
  const [selectedCard, setSelectedCard] = useState<number | null>(null);
  const healing = Math.min(state.maxHp - state.hp, campRecovery(state));
  const trainable = trainingOptions(state).some(option => option.level < 2);
  const preview = selectedCard === null ? null : upgradePreview(state, selectedCard);
  return <section className={`expedition-scene camp-scene realm-${realm}`} style={expeditionStyle(assets, realm, "camp")} aria-label={`${realmNames[realm]} camp`}>
    <ExpeditionChrome state={state} assets={assets} onHome={onHome} /><div className="expedition-scene-content">{message && <p className="expedition-status" role="status">{message}</p>}<header className="expedition-scene-heading"><span className="expedition-kicker">{realmNames[realm]} · CAMP</span><h1>A moment of quiet</h1><p>Choose one action before you continue.</p></header>
      <div className="expedition-choice-grid camp-choices">
        <button className="expedition-choice camp-choice" onClick={() => onAction({ type: "camp-choice", choice: "rest" })}><span className="camp-choice-symbol"><Medallion assets={assets} kind="rest" /><span className="expedition-kicker">REST</span></span><span className="camp-choice-copy"><h2>Rest by the fire</h2><p>Restore {healing} HP.</p><span className="expedition-divider" aria-hidden="true">◇</span><strong>{state.hp} <b>→</b> {Math.min(state.maxHp, state.hp + campRecovery(state))} HP</strong></span><span className="expedition-cta">Rest</span></button>
        <button className="expedition-choice camp-choice" disabled={state.deck.length === 0} onClick={() => setView("upgrade")}><span className="camp-choice-symbol"><Medallion assets={assets} kind="refine" /><span className="expedition-kicker">REFINE</span></span><span className="camp-choice-copy"><h2>Upgrade a card</h2><p>Improve one card in your deck.</p><span className="expedition-divider" aria-hidden="true">◇</span><strong>One free upgrade</strong></span><span className="expedition-cta">{state.deck.length ? "Choose a card" : "No cards available"}</span></button>
        <button className="expedition-choice camp-choice" disabled={!trainable} onClick={() => setView("train")}><span className="camp-choice-symbol"><Medallion assets={assets} kind="command" /><span className="expedition-kicker">COMMAND</span></span><span className="camp-choice-copy"><h2>Train a summon</h2><p>Teach one type a new order.</p><span className="expedition-divider" aria-hidden="true">◇</span><strong>Every matching summon benefits</strong></span><span className="expedition-cta">{trainable ? "Choose training" : "No available training"}</span></button>
      </div><p className="expedition-footnote">One camp action · Choose wisely.</p>
    </div>
    {view === "train" && <SummonTraining state={state} assets={assets} onAction={onAction} source="camp" message={message} onClose={() => setView("camp")} />}
    {view === "upgrade" && <ExpeditionDialog title="Refine your spellcraft" assets={assets} onClose={() => setView("camp")} className="camp-card-dialog">{message && <p className="expedition-status" role="status">{message}</p>}<p className="expedition-muted">Select one card. Its next upgrade is free and uses your camp action.</p><div className="camp-upgrade-grid">{state.deck.map((id, index) => <button key={`${id}-${index}`} className={`camp-upgrade-card ${selectedCard === index ? "selected" : ""}`} aria-pressed={selectedCard === index} onClick={() => setSelectedCard(index)}>{cardArtwork(assets, id, state.runebladeRules ?? 1, true) && <img src={cardArtwork(assets, id, state.runebladeRules ?? 1, true)} alt="" />}<strong>{cards[id].name}</strong><small>Level {cardLevel(state, index)} → {cardLevel(state, index) + 1}</small></button>)}</div>{preview && selectedCard !== null && <div className="camp-upgrade-confirm"><div><h3>{cards[state.deck[selectedCard]].name}</h3><p><span>Current: </span>{preview.text}</p><p><strong>Upgraded: </strong>{preview.nextText}</p></div><button className="expedition-primary" onClick={() => onAction({ type: "camp-choice", choice: "upgrade", index: selectedCard })}>Confirm free upgrade</button></div>}</ExpeditionDialog>}
  </section>;
}

export function RouteChoice({ state, assets, onChoose, choices, message, onHome }: Omit<Shared, "onAction"> & { choices: Destination[]; onChoose: (id: string) => void }) {
  const realm = currentRealm({ ...state, room: state.room + 1 });
  const boss = choices.length === 1 && choices[0].kind === "boss";
  const opening = choices.length === 1 && choices[0].kind === "combat";
  return <section className={`expedition-scene route-scene realm-${realm}`} style={expeditionStyle(assets, realm, boss ? "boss" : "combat")} aria-label="Choose your next encounter"><ExpeditionChrome state={state} assets={assets} onHome={onHome} /><div className="expedition-scene-content">{message && <p className="expedition-status" role="status">{message}</p>}
    <header className="expedition-scene-heading"><span className="expedition-kicker">{realmNames[realm]}</span><h1>{boss ? "The Sovereign awaits" : opening ? `Enter ${realmNames[realm]}` : "Choose your path"}</h1><p className="route-progress">{boss ? "BIOME FINALE · FACE ITS RULER" : opening ? "A NEW REALM · THE FIRST BATTLE AWAITS" : `NEXT ENCOUNTER · ${state.room + 2}`}</p></header>
    <div className={`expedition-choice-grid route-choices ${choices.length === 1 ? "boss-only" : ""}`}>{choices.map((choice, index) => <button key={choice.id} className={`expedition-choice route-card destination-${choice.kind}`} onClick={() => onChoose(choice.id)}>
      <span className="route-card-art"><img src={pathArt(assets, realm, choice.kind)} alt="" draggable={false} /><span className="route-number">{boss ? "FINALE" : `PATH ${["I", "II", "III"][index] ?? index + 1}`}</span></span>
      <span className="route-card-copy"><Medallion assets={assets} kind={choice.kind} /><span className="route-type">{choice.kind === "combat" ? "Battle" : choice.kind}</span><h2>{pathNames[realm][choice.kind] ?? choice.name}</h2><span className="expedition-divider" aria-hidden="true">◇</span><p>{choice.description}</p><span className="expedition-cta">{boss ? "Challenge the Sovereign" : "Take this path"}</span></span>
    </button>)}</div><p className="expedition-footnote">{boss ? "Boss encounter · No alternate route" : opening ? "Opening encounter · Normal battle" : "One choice. The journey continues."}</p>
  </div></section>;
}

export function TreasureScene({ state, assets, onAction, options, message, onHome }: Shared & { options: { relic?: ItemId; gold: number; training: ReturnType<typeof trainingOptions> } }) {
  const [training, setTraining] = useState(false);
  const realm = currentRealm(state);
  const reward = options.relic && items[options.relic];
  return <section className={`expedition-scene treasure-scene realm-${realm}`} style={expeditionStyle(assets, realm, "treasure")} aria-label="Treasure room"><ExpeditionChrome state={state} assets={assets} onHome={onHome} /><div className="expedition-scene-content">{message && <p className="expedition-status" role="status">{message}</p>}<header className="expedition-scene-heading"><span className="expedition-kicker">{realmNames[realm]} · TREASURE</span><h1>A fortune left behind</h1><p>Choose one reward for the journey ahead.</p></header><div className={`expedition-choice-grid treasure-choices ${reward ? "" : "two-rewards"}`}>
    {reward && <button className="expedition-choice route-card treasure-relic" onClick={() => onAction({ type: "claim-treasure", choice: "relic" })}><span className="treasure-card-art relic-reward-art" style={{ backgroundImage: `url("${pathArt(assets, realm, "treasure")}")` }}><RelicArtwork id={options.relic!} assets={assets} featured /></span><span className="route-card-copy"><Medallion assets={assets} kind="relic" /><span className="expedition-kicker">RELIC</span><h2>{reward.name}</h2><p>{reward.text}</p><span className="expedition-cta">Claim relic</span></span></button>}
    <button className="expedition-choice route-card" onClick={() => onAction({ type: "claim-treasure", choice: "gold" })}><span className="treasure-card-art"><img src={uiArt(assets, "reward-gold")} alt="" draggable={false} /></span><span className="route-card-copy"><Medallion assets={assets} kind="gold" /><span className="expedition-kicker">GOLD CACHE</span><h2>{options.gold} gold</h2><p>Save for cards, upgrades,<br />and training.</p><span className="treasure-gold-total">{state.gold} <b>→</b> {state.gold + options.gold} gold</span><span className="expedition-cta">Take the gold</span></span></button>
    <button className="expedition-choice route-card" disabled={!options.training.some(option => option.level < 2)} onClick={() => setTraining(true)}><span className="treasure-card-art"><img src={uiArt(assets, "reward-tome")} alt="" draggable={false} /></span><span className="route-card-copy"><Medallion assets={assets} kind="command" /><span className="expedition-kicker">ANCIENT KNOWLEDGE</span><h2>A forgotten lesson</h2><p>Unlock one order for<br />a summon type.</p><span className="expedition-cta">{options.training.some(option => option.level < 2) ? "Choose free training" : "No available training"}</span></span></button>
  </div><p className="expedition-footnote">Only one reward can be claimed.</p></div>{training && <SummonTraining state={state} assets={assets} onAction={onAction} source="treasure" message={message} onClose={() => setTraining(false)} />}</section>;
}

function RelicArtwork({ id, assets, featured = false }: { id: ItemId; assets: Assets; featured?: boolean }) {
  const src = assets.images[`relic-${id}`] ?? assets.images[`item-${id}`];
  const approvedSeal = featured && id === "first-muster-seal";
  return <span className={`expedition-relic-art ${approvedSeal ? "approved-seal-art" : ""}`}>{src ? <img src={src} alt="" draggable={false} /> : approvedSeal ? <img src={uiArt(assets, "reward-relic")} alt="" draggable={false} /> : id in expansionRelics ? <LootIcon item={id} /> : <RuneIcon kind="relic" />}</span>;
}

export function RelicCollection({ state, assets }: { state: State; assets: Assets }) {
  const [open, setOpen] = useState(false);
  const relics = Array.from(new Set(state.relics));
  return <><button className="expedition-relic-toggle" style={expeditionStyle(assets)} onClick={() => setOpen(true)} aria-label={`Open relic collection: ${relics.length} active relics`}><RuneIcon kind="relic" /><span><b>{relics.length}</b> Relics</span></button>{open && <ExpeditionDialog title="Your relic collection" assets={assets} onClose={() => setOpen(false)} className="relic-collection-dialog"><div className="training-intro"><p>Small discoveries. Lasting power.<br /><span>Every owned relic is active. Their effects stack throughout the run.</span></p><strong>{relics.length} active · No limit</strong></div><div className="relic-collection-grid">{relics.map(id => { const relic = items[id]; const expansion = id in expansionRelics ? expansionRelics[id as keyof typeof expansionRelics] : undefined; return <article key={id} className="relic-collection-item"><RelicArtwork id={id} assets={assets} /><div><span className="expedition-kicker">{expansion ? expansion.hook.replaceAll("-", " ") : "PASSIVE RELIC"}</span><h3>{relic.name}</h3><p>{relic.text}</p><small>Active for this run</small></div></article>; })}</div>{relics.length === 0 && <p className="expedition-empty">Find relics in treasure rooms, at shops, and after powerful encounters.</p>}</ExpeditionDialog>}</>;
}
