import { useEffect, useId, useRef, useState, type FormEvent, type ReactNode } from "react";
import { createPortal } from "react-dom";
import { cards, encounters, items, type CardId, type HeroId, type ItemId, type StarterDeckId } from "../../../packages/content/index";
import { activeEncounter, currentRealm, demonStats, forestEncounters, forestSovereignEncounter, frozenWastesEncounters, realmEncounterNumber, type DemonKind, type RealmId, type State } from "../../../packages/engine/index";
import { summonTraining } from "../../../packages/engine/expansionCatalog";
import { debugDecks, debugEnemies, type DebugAction, type DebugResource, type DebugRoomKind } from "./debugState";
import "./dev-console.css";

export type DevConsoleProps = {
  state: State | null;
  onAction: (action: DebugAction) => void;
  onUndo: () => void;
  onRedo: () => void;
  onRestore: () => void;
  canUndo: boolean;
  canRedo: boolean;
  sandbox: boolean;
  message: string;
};
type TabId = "navigate" | "spawn" | "cards" | "resources" | "relics" | "run";
const tabs: { id: TabId; name: string; hint: string }[] = [
  { id: "navigate", name: "Navigate", hint: "Jump to any biome, encounter, or room." },
  { id: "spawn", name: "Spawn", hint: "Create summons and enemies; edit the battlefield." },
  { id: "cards", name: "Cards", hint: "Add any card to your deck or combat piles." },
  { id: "resources", name: "Resources", hint: "Set health, currency, and combat resources." },
  { id: "relics", name: "Relics / Training", hint: "Grant items and unlock summon orders." },
  { id: "run", name: "Run", hint: "Start a sandbox run or restore your original run." },
];
const realmNames: Record<RealmId, string> = { "frozen-wastes": "Frozen Wastes", forest: "Thornroot Forest", infernal: "Infernal" };
const realmEncounters = { "frozen-wastes": frozenWastesEncounters, forest: forestEncounters.map((encounter, index) => index === forestEncounters.length - 1 ? forestSovereignEncounter : encounter), infernal: encounters };
const roomKinds: { id: DebugRoomKind; name: string }[] = [{ id: "combat", name: "Normal battle" }, { id: "elite", name: "Elite battle" }, { id: "boss", name: "Biome boss" }, { id: "shop", name: "Shop" }, { id: "camp", name: "Camp" }, { id: "treasure", name: "Treasure" }, { id: "route-choice", name: "Encounter choices" }];
const resourceLabels: Record<DebugResource, string> = { hp: "Health", maxHp: "Maximum health", guard: "Guard", mana: "Mana", gold: "Gold", cinders: "Cinders", corpses: "Corpses", corruption: "Corruption", turn: "Turn" };
const cardCatalog = (Object.keys(cards) as CardId[]).sort((a, b) => cards[a].name.localeCompare(cards[b].name));
const itemCatalog = (Object.keys(items) as ItemId[]).sort((a, b) => items[a].name.localeCompare(items[b].name));
const summonCatalog = (Object.keys(demonStats) as DemonKind[]).sort((a, b) => demonStats[a].name.localeCompare(demonStats[b].name));
const matches = (query: string, ...values: (string | number | undefined)[]) => !query.trim() || values.join(" ").toLowerCase().includes(query.trim().toLowerCase());
const whole = (value: string, fallback = 1, minimum = 0, maximum = 999999) => Number.isFinite(Number(value)) ? Math.max(minimum, Math.min(maximum, Math.floor(Number(value)))) : fallback;

function Field({ label, children }: { label: string; children: ReactNode }) { return <label className="dev-field"><span>{label}</span>{children}</label>; }
function Empty({ children }: { children: ReactNode }) { return <p className="dev-empty">{children}</p>; }
function Section({ title, children, count }: { title: string; children: ReactNode; count?: number }) { return <section className="dev-section"><h3>{title}{count !== undefined && <span>{count}</span>}</h3>{children}</section>; }

function ActorEditor({ kind, actor, onAction }: { kind: "unit" | "enemy"; actor: State["units"][number] | State["enemies"][number]; onAction: DevConsoleProps["onAction"] }) {
  const fields = kind === "unit" ? ["hp", "maxHp", "guard", "power", "rot"] : ["hp", "maxHp", "guard", "chill", "scorch", "sapped", "exposed"];
  const labels: Record<string, string> = { hp: "HP", maxHp: "Max HP", guard: "Guard", power: "Power", rot: "Rot", chill: "Chill", scorch: "Scorch", sapped: "Sapped", exposed: "Exposed" };
  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const values = Object.fromEntries(fields.map(field => [field, whole(String(form.get(field) ?? 0), 0)]));
    onAction(kind === "unit" ? { type: "edit-unit", id: actor.id, values } : { type: "edit-enemy", id: actor.id, values });
  };
  return <details className="dev-actor"><summary><span>{actor.name} <small>#{actor.id}</small></span><span>{actor.hp}/{actor.maxHp} HP · {actor.guard} Guard</span></summary><form onSubmit={submit}><div className="dev-fields dev-actor-fields">{fields.map(field => { const value = Number((actor as unknown as Record<string, unknown>)[field] ?? 0); return <Field key={field} label={labels[field]}><input key={`${actor.id}-${field}-${value}`} name={field} type="number" min={0} step={1} defaultValue={value} /></Field>; })}</div><div className="dev-actions"><button type="submit">Apply stats</button><button type="button" className="dev-danger" onClick={() => onAction(kind === "unit" ? { type: "remove-unit", id: actor.id } : { type: "remove-enemy", id: actor.id })}>Remove {kind === "unit" ? "summon" : "enemy"}</button></div></form></details>;
}

export function DevConsole({ state, onAction, onUndo, onRedo, onRestore, canUndo, canRedo, sandbox, message }: DevConsoleProps) {
  const displayedState = state && (state.phase === "route-choice" ? { ...state, room: state.room + 1 } : state);
  const currentEncounterName = displayedState ? activeEncounter(displayedState)?.name ?? "Unknown encounter" : "No active encounter";
  const [open, setOpen] = useState(false);
  const [tab, setTab] = useState<TabId>("navigate");
  const [query, setQuery] = useState("");
  const [realm, setRealm] = useState<RealmId>(state ? currentRealm(state) : "frozen-wastes");
  const [encounter, setEncounter] = useState(state ? realmEncounterNumber(displayedState!) : 1);
  const [roomKind, setRoomKind] = useState<DebugRoomKind>("combat");
  const [spawnCount, setSpawnCount] = useState("1");
  const [spawnSide, setSpawnSide] = useState<"summons" | "enemies">("summons");
  const [enemyRealm, setEnemyRealm] = useState<"all" | RealmId>("all");
  const [cardZone, setCardZone] = useState<"hand" | "deck" | "draw" | "discard">("hand");
  const [cardCount, setCardCount] = useState("1");
  const [cardLevel, setCardLevel] = useState("0");
  const [itemCategory, setItemCategory] = useState("all");
  const [itemCount, setItemCount] = useState("1");
  const [hero, setHero] = useState<HeroId>(state?.hero ?? "runeblade");
  const [deck, setDeck] = useState<StarterDeckId>(state?.starterDeck ?? "gravehost");
  const [seed, setSeed] = useState(String(state?.seed ?? 7319));
  const dialogRef = useRef<HTMLElement>(null);
  const launcherRef = useRef<HTMLButtonElement>(null);
  const searchRef = useRef<HTMLInputElement>(null);
  const previousFocus = useRef<HTMLElement | null>(null);
  const openRef = useRef(open);
  const id = useId();
  openRef.current = open;
  const heroDecks = debugDecks.filter(option => option.hero === hero);
  const chosenDeck = heroDecks.some(option => option.id === deck) ? deck : heroDecks[0]?.id;

  useEffect(() => {
    if (!state) return;
    setHero(state.hero); setDeck(state.starterDeck); setSeed(String(state.seed));
  }, [state?.hero, state?.starterDeck, state?.seed]);
  useEffect(() => {
    const keyboard = (event: KeyboardEvent) => {
      if (event.isComposing || event.repeat) return;
      if (event.code === "Backquote" || event.key === "`") {
        event.preventDefault(); event.stopImmediatePropagation();
        setOpen(value => !value); return;
      }
      if (!openRef.current) return;
      if (event.key === "Escape") { event.preventDefault(); event.stopImmediatePropagation(); setOpen(false); return; }
      if (event.key !== "Tab") return;
      const root = dialogRef.current;
      const controls = Array.from(root?.querySelectorAll<HTMLElement>('button:not(:disabled),input:not(:disabled),select:not(:disabled),summary,[tabindex="0"]') ?? []).filter(element => element.getClientRects().length > 0 && !element.closest('[inert]'));
      if (!controls.length) { event.preventDefault(); event.stopImmediatePropagation(); root?.focus(); return; }
      const first = controls[0], last = controls[controls.length - 1], active = document.activeElement;
      if (!root?.contains(active) || active === root || event.shiftKey && active === first || !event.shiftKey && active === last) {
        event.preventDefault(); event.stopImmediatePropagation(); (event.shiftKey ? last : first).focus();
      }
    };
    window.addEventListener("keydown", keyboard, true);
    return () => window.removeEventListener("keydown", keyboard, true);
  }, []);
  useEffect(() => {
    if (!open) return;
    previousFocus.current = document.activeElement as HTMLElement | null;
    searchRef.current?.focus();
    const focus = (event: FocusEvent) => { const target = event.target; if (target instanceof Node && !dialogRef.current?.contains(target)) searchRef.current?.focus(); };
    document.addEventListener("focusin", focus);
    return () => { document.removeEventListener("focusin", focus); if (previousFocus.current?.isConnected && previousFocus.current !== document.body) previousFocus.current.focus(); else launcherRef.current?.focus(); };
  }, [open]);

  const navigate = (kind = roomKind) => onAction({ type: "navigate", realm, encounter: Math.min(encounter, realmEncounters[realm].length), kind });
  const submitResources = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault(); const form = new FormData(event.currentTarget);
    const values = Object.fromEntries((Object.keys(resourceLabels) as DebugResource[]).map(key => [key, whole(String(form.get(key) ?? 0), 0)]));
    onAction({ type: "resources", values });
  };
  const activeTab = tabs.find(option => option.id === tab)!;
  const matchingEncounters = realmEncounters[realm].map((entry, index) => ({ ...entry, number: index + 1 })).filter(entry => matches(query, entry.name, entry.number, entry.subtitle));
  const filteredSummons = summonCatalog.filter(kind => matches(query, demonStats[kind].name, kind, summonTraining[kind].tiers.map(tier => tier.name).join(" ")));
  const filteredEnemies = debugEnemies.filter(enemy => (enemyRealm === "all" || enemy.realm === enemyRealm) && matches(query, enemy.name, enemy.id, enemy.realm, enemy.encounter));
  const filteredCards = cardCatalog.filter(card => matches(query, cards[card].name, card, cards[card].text, cards[card].type, cards[card].rarity));
  const filteredItems = itemCatalog.filter(item => (itemCategory === "all" || items[item].category === itemCategory) && matches(query, items[item].name, item, items[item].text));
  return <>
    <button ref={launcherRef} hidden={open} className="dev-console-launcher" onClick={() => setOpen(true)} aria-label="Open developer console" title="Developer console · Backtick (`)"><span aria-hidden="true">⌘</span> {sandbox ? "DEV SANDBOX" : "Console"} <kbd>`</kbd>{sandbox && <i>Saves paused</i>}</button>
    {open && createPortal(<div className="dev-console-backdrop" onClick={() => setOpen(false)}><section className="dev-console" ref={dialogRef} role="dialog" aria-modal="true" aria-labelledby={`${id}-title`} tabIndex={-1} onClick={event => event.stopPropagation()}>
      <header className="dev-console-header"><div><div className="dev-console-eyebrow">RUNELORD · ROGUELIKE DEMO</div><h2 id={`${id}-title`}>Developer console <span className={sandbox ? "dev-badge active" : "dev-badge"}>{sandbox ? "Sandbox active" : "Live run"}</span></h2><p>{state ? `${state.hero === "runeblade" ? "Runeblade" : "Warlock"} · ${realmNames[currentRealm(displayedState!)]} · Encounter ${realmEncounterNumber(displayedState!)} · ${state.phase} · Turn ${state.turn}` : "No active run · Open Run to create a sandbox."}</p></div><button className="dev-console-close" onClick={() => setOpen(false)} aria-label="Close developer console">×</button></header>
      <div className="dev-console-history"><button disabled={!canUndo} onClick={onUndo} title="Undo the most recent sandbox action">↶ Undo</button><button disabled={!canRedo} onClick={onRedo} title="Redo the last undone action">↷ Redo</button><button disabled={!sandbox} onClick={onRestore} title="Discard sandbox changes and return to the saved run">Restore original run</button><span>Toggle <kbd>`</kbd> · Close <kbd>Esc</kbd></span></div>
      <nav className="dev-tabs" aria-label="Developer console sections">{tabs.map(option => <button key={option.id} aria-current={tab === option.id ? "page" : undefined} onClick={() => { setTab(option.id); setQuery(""); }}>{option.name}</button>)}</nav>
      <div className="dev-search"><label htmlFor={`${id}-search`}>Search {activeTab.name.toLowerCase()}</label><input ref={searchRef} id={`${id}-search`} type="search" value={query} onChange={event => setQuery(event.target.value)} placeholder={tab === "run" ? "Search starter decks…" : tab === "resources" ? "Search resource names…" : `Search ${activeTab.name.toLowerCase()}…`} autoComplete="off" /><p>{activeTab.hint}</p></div>
      <div className="dev-console-content">
        {!state && tab !== "run" && <div className="dev-notice">Start a sandbox run to use these controls. <button onClick={() => { setTab("run"); setQuery(""); }}>Create run</button></div>}
        {tab === "navigate" && <fieldset disabled={!state}><legend className="dev-sr-only">Encounter navigation</legend><Section title="Jump to a room"><div className="dev-fields"><Field label="Biome"><select value={realm} onChange={event => { setRealm(event.target.value as RealmId); setEncounter(1); }}>{(Object.keys(realmNames) as RealmId[]).map(value => <option key={value} value={value}>{realmNames[value]}</option>)}</select></Field><Field label="Room type"><select value={roomKind} onChange={event => setRoomKind(event.target.value as DebugRoomKind)}>{roomKinds.map(value => <option key={value.id} value={value.id}>{value.name}</option>)}</select></Field></div><div className="dev-encounters" role="group" aria-label="Choose encounter">{matchingEncounters.map(entry => <button key={entry.number} className={entry.number === encounter ? "selected" : ""} aria-pressed={entry.number === encounter} onClick={() => setEncounter(entry.number)}><span>{String(entry.number).padStart(2, "0")}</span><strong>{entry.name}</strong><small>{entry.number === realmEncounters[realm].length ? "Boss" : "Encounter"}</small></button>)}</div>{!matchingEncounters.length && <Empty>No encounters match this search.</Empty>}<div className="dev-actions"><button className="dev-primary" onClick={() => navigate()}>Go to {realmNames[realm]} · {encounter}</button><span>{roomKinds.find(value => value.id === roomKind)?.name}</span></div></Section><Section title="Current encounter"><p className="dev-muted">{state ? currentEncounterName : "No active encounter"}</p><div className="dev-actions"><button onClick={() => onAction({ type: "step", delta: -1 })}>← Previous</button><button onClick={() => onAction({ type: "step", delta: 1 })}>Next →</button><button onClick={() => onAction({ type: "restart" })}>Restart encounter</button><button disabled={state?.phase !== "combat"} onClick={() => onAction({ type: "end-turn" })}>End turn instantly</button><button disabled={state?.phase !== "combat"} onClick={() => onAction({ type: "win" })}>Win encounter</button></div></Section><Section title="Quick room access"><div className="dev-actions">{roomKinds.filter(kind => ["shop", "camp", "treasure", "route-choice", "boss"].includes(kind.id)).map(kind => <button key={kind.id} onClick={() => navigate(kind.id)}>{kind.name}</button>)}</div><p className="dev-muted">Uses the biome and encounter selected above. Boss always opens the biome finale.</p></Section></fieldset>}
        {tab === "spawn" && <fieldset disabled={!state}><legend className="dev-sr-only">Spawn and edit actors</legend><div className="dev-fields"><Field label="Catalog"><select value={spawnSide} onChange={event => setSpawnSide(event.target.value as typeof spawnSide)}><option value="summons">All summons</option><option value="enemies">Enemies and bosses</option></select></Field><Field label="Count"><input type="number" min={1} max={30} step={1} value={spawnCount} onChange={event => setSpawnCount(event.target.value)} /></Field>{spawnSide === "enemies" && <Field label="Enemy biome"><select value={enemyRealm} onChange={event => setEnemyRealm(event.target.value as typeof enemyRealm)}><option value="all">All biomes</option>{(Object.keys(realmNames) as RealmId[]).map(value => <option key={value} value={value}>{realmNames[value]}</option>)}</select></Field>}</div><Section title={spawnSide === "summons" ? "Summon catalog" : "Enemy catalog"} count={spawnSide === "summons" ? filteredSummons.length : filteredEnemies.length}><div className="dev-catalog">{spawnSide === "summons" ? filteredSummons.map(kind => <article className="dev-catalog-row" key={kind}><div><h4>{demonStats[kind].name}</h4><p>{demonStats[kind].hp} HP · {demonStats[kind].power} Power · {demonStats[kind].upkeep} upkeep{demonStats[kind].defender ? " · Defender" : ""}</p><code>{kind}</code></div><button onClick={() => onAction({ type: "spawn-summon", kind, count: whole(spawnCount, 1, 1, 30) })} aria-label={`Spawn ${demonStats[kind].name}`}>Spawn</button></article>) : filteredEnemies.map(enemy => <article className="dev-catalog-row" key={enemy.id}><div><h4>{enemy.name}</h4><p>{realmNames[enemy.realm]} · {enemy.encounter}</p><code>{enemy.id}</code></div><button onClick={() => onAction({ type: "spawn-enemy", template: enemy.id, count: whole(spawnCount, 1, 1, 30) })} aria-label={`Spawn ${enemy.name}`}>Spawn</button></article>)}</div>{!(spawnSide === "summons" ? filteredSummons.length : filteredEnemies.length) && <Empty>No creatures match this search.</Empty>}</Section>{state && <Section title="Current battlefield"><div className="dev-actions"><button disabled={!state.units.length} className="dev-danger" onClick={() => onAction({ type: "clear", target: "units" })}>Clear summons ({state.units.length})</button><button disabled={!state.enemies.length} className="dev-danger" onClick={() => onAction({ type: "clear", target: "enemies" })}>Clear enemies ({state.enemies.length})</button></div><h4>Summons</h4>{state.units.map(actor => <ActorEditor key={actor.id} actor={actor} kind="unit" onAction={onAction} />)}{!state.units.length && <p className="dev-muted">No summons on the battlefield.</p>}<h4>Enemies</h4>{state.enemies.map(actor => <ActorEditor key={actor.id} actor={actor} kind="enemy" onAction={onAction} />)}{!state.enemies.length && <p className="dev-muted">No active enemies.</p>}</Section>}</fieldset>}
        {tab === "cards" && <fieldset disabled={!state}><legend className="dev-sr-only">Card controls</legend><div className="dev-fields"><Field label="Destination"><select value={cardZone} onChange={event => setCardZone(event.target.value as typeof cardZone)}><option value="hand">Hand</option><option value="deck">Permanent deck</option><option value="draw">Draw pile</option><option value="discard">Discard pile</option></select></Field><Field label="Upgrade level"><input type="number" min={0} max={99} step={1} value={cardLevel} onChange={event => setCardLevel(event.target.value)} /></Field><Field label="Copies"><input type="number" min={1} max={50} step={1} value={cardCount} onChange={event => setCardCount(event.target.value)} /></Field></div><p className="dev-muted">Level 0 is the base card. Adding to a combat pile affects this encounter; adding to your deck persists through the sandbox run.</p>{state && <div className="dev-actions"><span>Hand {state.hand.length} · Draw {state.draw.length} · Discard {state.discard.length} · Deck {state.deck.length}</span><button disabled={!state.hand.length} onClick={() => onAction({ type: "clear", target: "hand" })}>Clear hand</button></div>}<Section title="All cards" count={filteredCards.length}><div className="dev-catalog">{filteredCards.map(card => <article className="dev-catalog-row" key={card}><div><h4>{cards[card].name}<span className="dev-pill">{cards[card].xCost ? "X" : cards[card].cost} Mana{cards[card].cinders ? ` · ${cards[card].cinders} Cinders` : ""}</span></h4><p>{cards[card].text}</p><small>{cards[card].type} · {cards[card].rarity}</small><code>{card}</code></div><button title={`Add ${whole(cardCount, 1, 1, 50)} copies at level ${whole(cardLevel, 0, 0, 99)} to ${cardZone}`} onClick={() => onAction({ type: "add-card", card, zone: cardZone, count: whole(cardCount, 1, 1, 50), level: whole(cardLevel, 0, 0, 99) })} aria-label={`Add ${cards[card].name} to ${cardZone}`}>Add</button></article>)}</div>{!filteredCards.length && <Empty>No cards match this search.</Empty>}</Section></fieldset>}
        {tab === "resources" && <fieldset disabled={!state}><legend className="dev-sr-only">Resource controls</legend><Section title="Set resources"><form onSubmit={submitResources}><div className="dev-fields dev-resource-fields">{(Object.keys(resourceLabels) as DebugResource[]).map(key => <label className="dev-field" key={key} hidden={!matches(query, resourceLabels[key], key)}><span>{resourceLabels[key]}</span><input key={`${key}-${state?.[key] ?? 0}`} name={key} type="number" min={key === "maxHp" ? 1 : 0} step={1} defaultValue={state?.[key] ?? 0} /><small>Current: {state?.[key] ?? 0}</small></label>)}</div><div className="dev-actions"><button className="dev-primary" type="submit">Apply resources</button></div></form></Section><Section title="Quick adjustments"><div className="dev-actions"><button onClick={() => onAction({ type: "heal" })}>Heal to full</button><button onClick={() => onAction({ type: "refill" })}>Refill combat resources</button><button onClick={() => onAction({ type: "resources", values: { gold: (state?.gold ?? 0) + 1000 } })}>+1,000 gold</button><button onClick={() => onAction({ type: "resources", values: { guard: (state?.guard ?? 0) + 50 } })}>+50 Guard</button></div><p className="dev-muted">Refill sets 3 Mana, 20 Cinders, and 20 Corpses, and restores the potion. Resource edits take effect immediately.</p></Section></fieldset>}
        {tab === "relics" && <fieldset disabled={!state}><legend className="dev-sr-only">Items and training</legend><Section title="Items and relics" count={filteredItems.length}><div className="dev-fields"><Field label="Category"><select value={itemCategory} onChange={event => setItemCategory(event.target.value)}><option value="all">All items</option><option value="relic">Relics</option><option value="potion">Potions</option><option value="item">Items</option></select></Field><Field label="Quantity"><input type="number" min={1} max={50} step={1} value={itemCount} onChange={event => setItemCount(event.target.value)} /></Field></div><div className="dev-catalog">{filteredItems.map(item => { const owned = [...(state?.relics ?? []), ...(state?.inventory ?? [])].filter(id => id === item).length; return <article className="dev-catalog-row" key={item}><div><h4>{items[item].name}<span className="dev-pill">{items[item].category} · Owned {owned}</span></h4><p>{items[item].text}</p><code>{item}</code></div><div className="dev-row-actions"><button onClick={() => onAction({ type: "grant-item", item, count: whole(itemCount, 1, 1, 50) })} aria-label={`Grant ${items[item].name}`}>Grant</button><button disabled={!owned} onClick={() => onAction({ type: "remove-item", item, count: whole(itemCount, 1, 1, 50) })} aria-label={`Remove ${items[item].name}`}>Remove</button></div></article>; })}</div>{!filteredItems.length && <Empty>No items match this search.</Empty>}</Section><Section title="Summon training" count={filteredSummons.length}><p className="dev-muted">Set the training level for every copy of a summon. No gold cost.</p><div className="dev-catalog">{filteredSummons.map(kind => <article className="dev-catalog-row" key={kind}><div><h4>{demonStats[kind].name}</h4><p>1: {summonTraining[kind].tiers[0].name} · 2: {summonTraining[kind].tiers[1].name}</p></div><label className="dev-field"><span className="dev-sr-only">{demonStats[kind].name} training level</span><select value={state?.trainingLevels?.[kind] ?? 0} onChange={event => onAction({ type: "set-training", kind, level: Number(event.target.value) as 0 | 1 | 2 })}><option value={0}>0 · Untrained</option><option value={1}>1 · Trained</option><option value={2}>2 · Mastered</option></select></label></article>)}</div></Section></fieldset>}
        {tab === "run" && <><Section title="Create a sandbox run"><form onSubmit={event => { event.preventDefault(); if (chosenDeck) onAction({ type: "new-run", deck: chosenDeck, seed: whole(seed, 7319, 1, 2147483647) }); }}><div className="dev-fields"><Field label="Hero"><select value={hero} onChange={event => setHero(event.target.value as HeroId)}><option value="runeblade">Runeblade</option><option value="warlock">Warlock</option></select></Field><Field label="Seed"><input type="number" min={1} max={2147483647} step={1} value={seed} onChange={event => setSeed(event.target.value)} /></Field></div><div className="dev-decks">{heroDecks.filter(option => matches(query, option.name, option.id, option.hero)).map(option => <label key={option.id} className={option.id === chosenDeck ? "selected" : ""}><input type="radio" name={`${id}-deck`} checked={option.id === chosenDeck} onChange={() => setDeck(option.id)} /><span><strong>{option.name}</strong><code>{option.id}</code></span></label>)}</div><div className="dev-actions"><button className="dev-primary" type="submit" disabled={!chosenDeck}>Start {hero === "runeblade" ? "Runeblade" : "Warlock"} sandbox</button></div><p className="dev-muted">A fresh run using the chosen hero, starter deck, and seed. Your original run remains available through Restore original run.</p></form></Section><Section title="Sandbox history"><p className="dev-muted">Undo and redo include console edits and normal gameplay while the sandbox is active. Restore original run exits the sandbox.</p><div className="dev-actions"><button disabled={!canUndo} onClick={onUndo}>Undo last action</button><button disabled={!canRedo} onClick={onRedo}>Redo action</button><button disabled={!sandbox} onClick={onRestore}>Restore original run</button></div>{state && <dl className="dev-run-stats"><div><dt>Hero</dt><dd>{state.hero}</dd></div><div><dt>Starter deck</dt><dd>{state.starterDeck}</dd></div><div><dt>Seed</dt><dd>{state.seed}</dd></div><div><dt>Current phase</dt><dd>{state.phase}</dd></div><div><dt>Encounter</dt><dd>{displayedState!.room + 1} · {currentEncounterName}</dd></div><div><dt>Turn</dt><dd>{state.turn}</dd></div></dl>}</Section></>}
      </div>
      <footer className="dev-console-footer"><span role="status" aria-live="polite">{message || (sandbox ? "Sandbox changes are active. Original save preserved." : "Console actions open a sandbox. Original save preserved.")}</span></footer>
    </section></div>, document.body)}
  </>;
}

