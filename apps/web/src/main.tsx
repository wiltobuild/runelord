import { IntroCinematic } from "./IntroCinematic";
import { OpeningScreen } from "./OpeningScreen";
import { GuardAura } from "./GuardAura";
import { useEffect, useState, useRef, type CSSProperties } from "react";
import { createRoot } from "react-dom/client";
import {
  cards,
  encounters,
  starterDecks, cardTargetsUnit, items, type StarterDeckId,
  type CardId,
} from "../../../packages/content/index";
import {
  newRun,
  dispatch,
  playable,
  manaCost,
  intent,
  save,
  restore,
  type State,
  type Action,
  type CardInstance,
} from "../../../packages/engine/index";
import { loadAssets, type Assets } from "./assets";
import { Hero } from "./Hero";
import { ActorSprite } from "./ActorSprite";
import { MinionDetails } from "./MinionDetails";
import { LootReveal } from "./LootReveal";
import { LootIcon } from "./LootIcon";
import { ResourceMeters } from "./ResourceMeters";
import { EnemyName } from "./EnemyName";
import { SpellEffects } from "./SpellEffects";
import { useBattleDirector } from "./useBattleDirector";
import { score, OPENING_SCORE_ID, OPENING_SCORE_TITLE } from "./music";
import { sfx } from "./sound";
import "./style.css";
import { HUD, HudTemplate, HudStatIcon, InventorySlot, useHudScale } from "./HudTemplate";
import { AnimatedBackground } from "./AnimatedBackground";
import { EndTurnButton } from "./EndTurnButton";
import { intentLabel } from "./intentLabel";
import { layoutWarband, retreatGroundFormation, WARBAND_SPACE } from "./warbandLayout";
import { packCrowdedWarband } from "./packedWarband";
import "./hud.css";
import "./mobile.css";
import { MobileShell } from "./MobileShell";
const SAVE_KEY = "runelord-warlock-demo-v1";
function readSave() {
  try {
    const raw = localStorage.getItem(SAVE_KEY);
    return raw ? restore(raw) : null;
  } catch {
    return null;
  }
}
function CardView({
  id,
  assets,
  onClick,
  disabled = false,
  selected = false,
  cost,
}: {
  id: CardId;
  assets: Assets;
  onClick?: () => void;
  disabled?: boolean;
  selected?: boolean;
  cost?: number;
}) {
  const c = cards[id];
  const displayedCost = cost ?? (c.xCost ? "X" : c.cost);
  return (
    <button
      className={`card ${selected ? "selected" : ""}`}
      disabled={disabled}
      onClick={onClick}
      aria-label={`${c.name}, ${displayedCost} Mana${c.cinders ? `, ${c.cinders} Cinders` : ""}. ${c.text}`}
    >
      {assets.cards[id] ? (
        <img src={assets.cards[id]} alt="" draggable={false} />
      ) : (
        <div className="card-text">
          <span className="card-type">{c.rarity} · {c.type}</span><h3>{c.name}</h3>
          <p>{c.text}</p><strong className="card-cost">{displayedCost} Mana{c.cinders ? ` + ${c.cinders} Cinders` : ""}</strong>
        </div>
      )}
      <span className="card-info">
        <strong>{c.name}</strong>
        <span>
          {displayedCost} Mana{c.cinders ? ` + ${c.cinders} Cinders` : ""}
        </span>
        <span>{c.text}</span>
      </span>
    </button>
  );
}
function App({ assets }: { assets: Assets }) {
  const hudScale = useHudScale();
  const [inspection, setInspection] = useState<"brand" | "draw" | "discard" | "items" | "powers" | null>(null);
  const [introStarted, setIntroStarted] = useState(false);
  const [starterDeck, setStarterDeck] = useState<StarterDeckId>("warband");
  const [saved, setSaved] = useState<State | null>(readSave),
    [game, setState] = useState<State | null>(null),
    [visual, setVisual] = useState<State | null>(null),
    [seed, setSeed] = useState(""),
    [selected, setSelected] = useState<CardInstance | null>(null),
    [animation, setAnimation] = useState("idle_breathe"),
    [sequence, setSequence] = useState(0),
    [busy, setBusy] = useState(false),
    [message, setMessage] = useState(""),
    [volume, setVolume] = useState(0.35),
    [effectsVolume, setEffectsVolume] = useState(sfx.volume),
    [showHelp, setShowHelp] = useState(false),
    [showDeck, setShowDeck] = useState(false),
    [log, setLog] = useState<string[]>([]),
    [dismiss, setDismiss] = useState<number | undefined>(),
    [musicError, setMusicError] = useState(false),
    [musicActive, setMusicActive] = useState(false);
  const state = visual ?? game;
  const potionInventory = state?.inventory.filter(id => items[id].category === "potion") ?? [];
  const itemInventory = state?.inventory.filter(id => items[id].category === "item") ?? [];
  useEffect(() => {
    const unlock = () => { void sfx.unlock(); };
    const visibility = () => { if (document.hidden) sfx.stop(); };
    window.addEventListener("pointerdown", unlock, {capture:true});
    window.addEventListener("keydown", unlock, {capture:true});
    document.addEventListener("visibilitychange", visibility);
    return () => { window.removeEventListener("pointerdown",unlock,true); window.removeEventListener("keydown",unlock,true); document.removeEventListener("visibilitychange",visibility);sfx.stop(); };
  }, []);
  useEffect(() => {
    const dialogOpen = !!inspection || showHelp || showDeck || state?.phase === "loot";
    const previous = document.activeElement as HTMLElement | null;
    const keydown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setInspection(null); setShowHelp(false); setShowDeck(false);
        setSelected(null); setMessage("");
      }
      if (event.key === "Tab" && dialogOpen) {
        const dialog = document.querySelector<HTMLElement>('[role="dialog"]');
        const controls = dialog?.querySelectorAll<HTMLElement>('button:not(:disabled), input, [tabindex="0"]');
        if (!controls?.length) return;
        const first = controls[0], last = controls[controls.length - 1];
        if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
        else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
      }
    };
    if (dialogOpen) document.querySelector<HTMLElement>('[role="dialog"] .close')?.focus();
    window.addEventListener("keydown", keydown);
    return () => { window.removeEventListener("keydown", keydown); if (dialogOpen) previous?.focus(); };
  }, [inspection, showHelp, showDeck, state?.phase]);
  const resolving = useRef(false);
  const room = state?.room ?? 0,
    phase = state?.phase,
    encounter = encounters[room],
    track =
      !state ? OPENING_SCORE_ID : phase === "camp" || phase === "won"
        ? "explore"
        : room === encounters.length - 1
          ? "demon-boss"
          : "battle";
  const animate = (name: string) => {
    setAnimation(name);
    setSequence((n) => n + 1);
  };
  const director = useBattleDirector(assets, animate, (view) =>
    setVisual((current) => (current ? { ...current, ...view } : null)),
  );
  const warbandUnits = state ? [...state.units, ...director.ghosts.filter(g => !state.units.some(u => u.id === g.id))] : [];
  const regularFormation = layoutWarband(warbandUnits, assets);
  const packed = packCrowdedWarband(warbandUnits, assets, regularFormation);
  const groundRetreat = retreatGroundFormation(packed?.slots ?? regularFormation, assets);
  const formation = groundRetreat.slots;
  const music = () => {
    setMusicActive(true);
    return score
      .play(assets, track)
      .then(() => setMusicError(false))
      .catch(() => setMusicError(true));
  };
  useEffect(() => {
    if (musicActive) {
      void score
        .play(assets, track)
        .then(() => setMusicError(false))
        .catch(() => setMusicError(true));
    }
  }, [assets, track, musicActive]);
  useEffect(() => {
    if (!game) return;
    try {
      localStorage.setItem(SAVE_KEY, save(game));
      setSaved(game);
    } catch {
      setMessage(
        "Browser storage unavailable; keep this tab open to retain your run.",
      );
    }
  }, [game]);
  const start = (resume = false) => {
    director.clear();
    setVisual(null);
    resolving.current = false;
    setBusy(false);
    const next = resume && saved ? saved : newRun(seed.trim() ? Number(seed) >>> 0 : crypto.getRandomValues(new Uint32Array(1))[0], starterDeck);
    setState(next);
    setMusicActive(true);
    setSelected(null);
    setLog(next.events.map((e) => e.message));
    setMessage("Select an attack, then an enemy. Click a skill to cast it.");
    animate("idle_breathe");
    void score
      .play(assets, next.room === encounters.length - 1 ? "demon-boss" : "battle")
      .catch(() => setMusicError(true));
  };
  const act = async (action: Action) => {
    if (!game || resolving.current) return;
    try {
      const before = game;
      const next = dispatch(before, action);
      if (action.type === "potion") sfx.play("item-potion", 0, -.3);
      const animated = action.type === "play" || action.type === "end" || action.type === "item";
      if (animated) {
        resolving.current = true;
        setBusy(true);
        setVisual(before);
      }
      setState(next);
      setLog((l) => [...l, ...next.events.map((e) => e.message)].slice(-40));
      setSelected(null);
      setDismiss(undefined);
      setMessage("");
      if (animated) await director.run(before, next, action);
      else if (action.type === "reward" || action.type === "camp" || action.type === "continue") {
        director.clear();
        animate("idle_breathe");
      }
    } catch (e) {
      setMessage((e as Error).message);
    } finally {
      setVisual(null);
      setBusy(false);
      resolving.current = false;
    }
  };
  const chooseCard = (c: CardInstance) => {
    if (!state || busy) return;
    if (!playable(state, c)) {
      setMessage("You need more Mana or Cinders.");
      return;
    }
    if (cardTargetsUnit(c.id)) {
      setSelected(c);
      setMessage(`Choose a demon for ${cards[c.id].name}.`);
    } else if ((cards[c.id].type === "Attack" || c.id === "void-gaze" || c.id === "corrupting-touch")) {
      setSelected(c);
      setMessage(`Choose a target for ${cards[c.id].name}.`);
    } else if (
      c.id.startsWith("summon") &&
      state.units.length === 5 &&
      dismiss === undefined
    ) {
      setSelected(c);
      setMessage(
        "Warband full. Select a demon to dismiss, then play the summon.",
      );
    } else act({ type: "play", uid: c.uid, dismiss });
  };
  if (!state && !introStarted) return <IntroCinematic volume={volume} onVolume={v => { setVolume(v); score.setVolume(v); }} onStart={() => { setIntroStarted(true); void music(); }} />;
  return (
    <main
      className={state ? "battle-ui" : "title"}
      style={
        {
          "--scene": `url(${assets.images[!state ? "demon-throne" : encounter.background]})`,
          "--hud-scale": hudScale,
        } as React.CSSProperties
      }
    >
      {!state && <AnimatedBackground scene="demon-throne" />}
      {state && <><AnimatedBackground scene={encounter.background} /><HudTemplate /></>}
      <header className="topbar">
        <button
          className="wordmark"
          disabled={busy}
          onClick={() => {
            director.clear();
            setVisual(null);
            setState(null);
            setSelected(null);
            animate("idle_breathe");
          }}
        >
          <span className="logo-type">R<em>U</em>NELORD</span><small>CINDER &amp; OATH</small>
        </button>
        <div className="chapter">
          {state
            ? `ENCOUNTER ${room + 1} OF ${encounters.length}`
            : "A DECKBUILDING ROGUELIKE"}
        </div>
        <nav>
          <button className="help-button" aria-label="How to play" title="How to play" onClick={() => setShowHelp(true)}>{state ? "?" : "How to play"}</button>
          {state && (
            <button className="deck-button" onClick={() => setShowDeck(true)}>
              Deck · {state.deck.length}
            </button>
          )}
          <button
            className="music-button"
            onClick={() => {
              const v = !musicActive ? 0.35 : volume ? 0 : 0.35;
              setVolume(v);
              score.setVolume(v);
              void music();
            }}
            aria-label={musicActive && volume ? "Mute music" : "Enable music"}
          >
            {state ? (volume ? "♫" : "♪") : (!musicActive ? "♫ Enable music" : volume ? "♫ Music on" : "♫ Music off")}
          </button>
          <input
            aria-label="Music volume"
            title="Music volume"
            type="range"
            min="0"
            max="1"
            step=".05"
            value={volume}
            onChange={(e) => {
              const v = Number(e.target.value);
              setVolume(v);
              score.setVolume(v);
            }}
          />
        </nav>
      </header>
      {!state ? (
        <OpeningScreen assets={assets} selected={starterDeck} onSelect={setStarterDeck} onBegin={() => start()} onResume={saved ? () => start(true) : undefined} awaken={() => { if (!musicActive) void music(); }} />
      ) : (
        <>
          <div className="runbar">
            <div className="stat health">
              <HudStatIcon kind="health" />
              <strong>
                {state.hp}
                <small> / {state.maxHp}</small>
              </strong>
              <label>VITALITY</label>
            </div>
            <div className="stat">
              <HudStatIcon kind="guard" />
              <strong>{state.guard}</strong>
              <label>GUARD</label>
            </div>
            <div className="stat gold">
              <HudStatIcon kind="gold" />
              <strong>{state.gold}</strong>
              <label>GOLD</label>
            </div>
            <div className="stat corruption">
              <HudStatIcon kind="corruption" />
              <strong>
                {state.demonTurns
                  ? `${state.demonTurns} turns`
                  : state.corruption}
                <small>{state.demonTurns ? "" : " / 10"}</small>
              </strong>
              <label>{state.demonTurns ? "DEMON FORM" : "CORRUPTION"}</label>
            </div>
          </div>
          {Object.keys(state.powers).length > 0 && <button className="active-powers" onClick={() => setInspection("powers")}>Active powers <strong>{Object.keys(state.powers).length}</strong></button>}
          <div className="inventory" role="group" aria-label="Items and potions">
            <div role="group" aria-label="Items and relics">
              <span className="inventory-category item-category">ITEMS</span>
              <InventorySlot x={HUD.items[0]} label="Brand of the Pit - inspect relic" image={assets.images.brand}
                onClick={() => { sfx.play("item-brand"); setInspection("brand"); }} />
              {HUD.items.slice(1).map((x, i) => {
                const item = itemInventory[i];
                return <InventorySlot key={x} x={x} label={item ? `${items[item].name} - ${items[item].text} Click to use item.` : `Empty item slot ${i + 1}`}
                  image={item ? assets.images[`item-${item}`] : undefined} icon={item ? <LootIcon item={item} /> : undefined} empty={!item} disabled={busy || phase !== "combat"}
                  onClick={() => item ? void act({ type: "item", item }) : setMessage("No item stored here.")} />;
              })}
            </div>
            <div role="group" aria-label="Potions">
              <span className="inventory-category potion-category">POTIONS</span>
              {HUD.potions.map((x, i) => {
                const startingDraught = state.potion && i === 0;
                const item = potionInventory[i - (state.potion ? 1 : 0)];
                return <InventorySlot key={x} x={x} label={startingDraught ? `Healing Draught - restore ${Math.floor(state.maxHp * .2)} HP. Drink potion.` : item ? `${items[item].name} - ${items[item].text} Drink potion.` : `Empty potion slot ${i + 1}`}
                  image={startingDraught ? assets.images.potion : item ? assets.images[`item-${item}`] : undefined}
                  icon={item ? <LootIcon item={item} /> : undefined} empty={!startingDraught && !item} disabled={busy || phase !== "combat"}
                  onClick={() => startingDraught ? void act({ type: "potion" }) : item ? void act({ type: "item", item }) : setMessage("No potion stored here.")} />;
              })}
            </div>
            {state.inventory.length > 0 && <button className="inventory-overflow" onClick={() => setInspection("items")}>All supplies ({itemInventory.length} items / {potionInventory.length + Number(state.potion)} potions)</button>}
          </div>
          <section className="battlefield" aria-label="Combat arena">
            <div className="turn-tag">
              <span>
                {phase === "combat"
                  ? `TURN ${state.turn}`
                  : phase === "lost"
                    ? "DEFEAT"
                    : "VICTORY"}
              </span>
              <strong>
                {busy
                  ? "Resolving…"
                  : selected
                    ? "Choose a target"
                    : phase === "combat"
                      ? "Your move"
                      : "The path continues"}
              </strong>
            </div>
            <div
              data-actor="hero"
              className={`hero-position ${state.demonTurns ? "empowered" : ""}`}
            >
              <GuardAura active={state.guard > 0 && state.hp > 0 && phase === "combat"} />
              <Hero
                assets={assets}
                animation={animation}
                sequence={sequence}
                empowered={state.demonTurns > 0}
                hp={state.hp}
                maxHp={state.maxHp}
              />
              <div className="hero-label">
                WARLOCK{" "}
                <span>
                  {state.demonTurns ? "ASCENDED" : "BRAND OF THE PIT"}
                </span>
              </div>
            </div>
            <div className="warband" aria-label="Your Warband" style={{left: WARBAND_SPACE.left, top: WARBAND_SPACE.top, width: WARBAND_SPACE.width}}>
              <div className="units">
                {warbandUnits.map((u) => {
                  const slot = formation.get(u.id)!;
                  const stack = packed?.groups.find(g => g.ids.includes(u.id));
                  return (
                  <button
                    key={u.id}
                    className={`unit formation-unit ${stack ? "packed-unit" : ""} summon-${u.kind} ${slot.airborne ? "airborne" : ""} ${dismiss === u.id ? "chosen" : ""} ${u.hp <= 0 ? "unit-dying" : ""}`}
                    style={{left: slot.x, top: slot.top, width: slot.width, zIndex: stack ? 10 - stack.ids.indexOf(u.id) : undefined, "--summon-world-unit": `${slot.worldUnit}px`, "--flight-drop": `${WARBAND_SPACE.ground - slot.root}px`, "--summon-lower-padding": `${Math.max(0, slot.bounds.bottom - slot.root - 50)}px`, "--death-duration": `${assets.actors[slot.art]?.states.die.duration ?? 740}ms`} as CSSProperties}
                    data-actor={`unit-${u.id}`}
                    disabled={busy || u.hp <= 0}
                    title={`${u.name}: ${u.power + (state.demonTurns ? 2 : 0)} Power, ${u.upkeep} Upkeep. ${u.defender ? "Defender intercepts hero attacks." : ""}`}
                    onClick={() => {
                      if (selected && cardTargetsUnit(selected.id)) { void act({ type: "play", uid: selected.uid, unit: u.id }); return; }
                      setDismiss(u.id);
                      setMessage(
                        `${u.name} selected for dismissal if the Warband is full.`,
                      );
                    }}
                  >
                    {!stack && <span className="minion-headroom" aria-hidden="true" />}
                    <ActorSprite
                      assets={assets}
                      art={slot.art}
                      cue={director.cues[`unit-${u.id}`]}
                      hp={u.hp}
                      maxHp={u.maxHp}
                      name={u.name}
                      className="summon-model"
                    />
                    {!stack && <MinionDetails name={u.name} hp={u.hp} maxHp={u.maxHp} guard={u.guard} defender={u.defender} power={u.power + (state.demonTurns ? 2 : 0) + (u.kind === "hellhound" ? 2 * state.units.filter(x => x.kind === "hellhound" && x.id !== u.id).length : 0)} scorch={u.kind === "imp" ? 1 : 0} />}
                  </button>
                ); })}
                {packed?.groups.map(group => {
                  const members = group.ids.map(id => warbandUnits.find(u => u.id === id)!).filter(u => u.hp > 0);
                  if (!members.length) return null;
                  const damage = members.map(u => u.power + (state.demonTurns ? 2 : 0) + (u.kind === "hellhound" ? 2 * (state.units.filter(x => x.kind === "hellhound").length - 1) : 0));
                  const equal = damage.every(n => n === damage[0]);
                  return <div key={group.kind} className="packed-status" style={{left:group.x+(group.width-240)/2-(group.airborne?0:groundRetreat.shift),top:group.top,width:240}}>
                    <div>{members[0].name} · ⚔ {equal ? damage[0] : damage.join("+")} {equal && <b>×{members.length}</b>}{group.kind === "imp" ? " · ✦ 1" : ""}</div>
                    {members.map((u,i)=><button key={u.id} disabled={busy} className={dismiss===u.id?"selected":""} aria-label={`${u.name} ${i+1}, ${u.hp} of ${u.maxHp} health, ${u.guard} Guard`} title={`${u.defender?"Defender · ":""}${u.guard} Guard · ${u.upkeep} Upkeep`} onClick={()=>{if(selected && cardTargetsUnit(selected.id)){void act({type:"play",uid:selected.uid,unit:u.id});return;}setDismiss(u.id);setMessage(`${u.name} selected for dismissal if the Warband is full.`);}}>
                      <div className="hp-track" style={{height:Math.min(16,46/members.length)}}><i style={{width:`${u.hp/u.maxHp*100}%`}}/><span>{u.hp} / {u.maxHp}{u.guard ? ` · ⬡ ${u.guard}` : ""}</span></div>
                    </button>)}
                  </div>;
                })}
              </div>
            </div>
            <div className={`enemies count-${state.enemies.length}`}>
              {state.enemies.map((e) => {
                const m = intent(state, e);
                const enemyName = e.name;
                const moveDescription = m.kind === "summon" ? "Summons a demon ally" : m.kind === "shield" ? `Gains ${m.guard ?? 0} Guard` : `${m.damage} damage. ${intentLabel(state, m.targeting)}`;
                return (
                  <button
                    key={e.id}
                    data-actor={`enemy-${e.id}`}
                    className={`enemy ${e.boss ? "demon-lord" : ""} ${e.summonedBy ? "boss-summon" : ""} ${state.focus === e.id ? "focused" : ""} ${e.hp <= 0 ? "fallen" : ""} ${selected && e.hp > 0 ? "targetable" : ""}`}
                    disabled={e.hp <= 0 || phase !== "combat" || busy || !!(selected && cardTargetsUnit(selected.id))}
                    onClick={() =>
                      selected
                        ? act({
                            type: "play",
                            uid: selected.uid,
                            target: e.id,
                            dismiss,
                          })
                        : act({ type: "focus", target: e.id })
                    }
                    aria-label={`Target ${enemyName}, ${e.hp} HP${e.boss ? `, phase ${e.bossPhase ?? 1}` : ""}, intent ${moveDescription}`}
                  >
                    <div className="intent">
                      <b>{m.kind === "summon" ? "SUMMON" : m.kind === "shield" ? `GUARD ${m.guard ?? 0}` : `⚔ ${m.damage}`}</b>
                      <span>{m.name}</span>
                      <small>{m.kind ? moveDescription : intentLabel(state, m.targeting)}</small>
                    </div>
                    <ActorSprite
                      assets={assets}
                      art={e.art}
                      cue={director.cues[`enemy-${e.id}`]}
                      hp={e.hp}
                      maxHp={e.maxHp}
                      name={enemyName}
                    />
                    <div className="enemy-status">
                      <EnemyName name={enemyName} />
                      {e.boss && <span className="boss-phase">{e.bossPhase === 2 ? "PHASE II - ENRAGED" : "PHASE I - INFERNAL SOVEREIGN"}</span>}{e.summonedBy && <span className="boss-phase">SUMMONED DEMON</span>}
                      <div className="hp-track">
                        <i style={{ width: `${(e.hp / e.maxHp) * 100}%` }} />
                        <span>
                          {e.hp} / {e.maxHp}
                        </span>
                      </div>
                      <small>
                        {e.guard > 0 ? `${e.guard} Guard | ` : ""}{e.sapped ? `${e.sapped} Sapped · ` : ""}{e.exposed ? `${e.exposed} Exposed · ` : ""}
                        {e.scorch ? `✦ ${e.scorch} Scorch` : " "}
                        {state.focus === e.id && e.hp > 0
                          ? " · Focus target"
                          : ""}
                      </small>
                    </div>
                  </button>
                );
              })}
            </div>
            {director.husks.map(husk => <img key={husk.id} src={husk.src} style={husk.style} className="fire-death-husk" alt="" aria-hidden="true" />)}
            <SpellEffects effects={director.effects} />
            <div className="damage-numbers" aria-hidden="true">
              {director.numbers.map((n) => (
                <span key={n.id} className={n.cause === "scorch" ? "scorch-number" : undefined} data-label={n.cause === "scorch" ? n.label : undefined} style={{ left: n.point.x, top: n.point.y }}>
                  {n.label}
                </span>
              ))}
            </div>
          </section>
          <div className="combat-message" role="status">
            {director.label ||
              message ||
              (phase === "combat"
                ? "Select an attack, then its target. Click a skill to cast it."
                : phase === "lost"
                  ? "Your pact is broken. The Pit will wait."
                  : "The embers settle.")}
            {selected && (
              <button
                onClick={() => {
                  setSelected(null);
                  setMessage("");
                }}
              >
                Cancel
              </button>
            )}
          </div>
          <section className="hand-zone">
            <ResourceMeters mana={state.mana} cinders={state.cinders} upkeep={state.units.filter(u => u.hp > 0).reduce((sum, u) => sum + u.upkeep, 0)} />
            <button className="pile draw-pile" aria-label={`Draw pile, ${state.draw.length} cards`} onClick={() => setInspection("draw")}><b>{state.draw.length}</b><span>Draw<br />pile</span></button>
            <button className="pile discard-pile" aria-label={`Discard pile, ${state.discard.length} cards`} onClick={() => setInspection("discard")}><b>{state.discard.length}</b><span>Discard</span></button>
            <div key={`${room}-${state.turn}`} className={`hand ${busy && game?.history.at(-1)?.type === "end" ? "hand-ending" : ""}`} aria-label="Your hand">
              {state.hand.map((c) => (
                <CardView
                  key={c.uid}
                  id={c.id}
                  cost={manaCost(state, c)}
                  assets={assets}
                  disabled={busy || !playable(state, c)}
                  selected={selected?.uid === c.uid}
                  onClick={() => chooseCard(c)}
                />
              ))}
            </div>
            <div className="turn-controls">
              <EndTurnButton
                busy={busy}
                ending={busy && game?.history.at(-1)?.type === "end"}
                disabled={busy || phase !== "combat"}
                turn={state.turn}
                onClick={() => act({ type: "end" })}
              />
              <details className="combat-log">
                <summary><span aria-hidden="true">◆</span> Combat log</summary>
                <ol aria-label="Recent combat events">
                  {log.slice(-14).map((line, i) => (
                    <li key={i}>{line}</li>
                  ))}
                </ol>
              </details>
            </div>
          </section>
          {phase === "reward" && (
            <div className="overlay">
              <section className="reward-panel">
                <div className="eyebrow">A DEBT COLLECTED</div>
                <h2>Deepen your pact.</h2>
                <p>Choose one card to add to your deck. Offerings favor your starting pact.</p>
                <div className="reward-cards">
                  {state.rewards.map((id) => (
                    <CardView
                      key={id}
                      id={id}
                      assets={assets}
                      onClick={() => act({ type: "reward", card: id })}
                    />
                  ))}
                </div>
                <button onClick={() => act({ type: "reward", card: null })}>
                  Leave these offerings behind →
                </button>
              </section>
            </div>
          )}
          {phase === "loot" && state.pendingLoot && <LootReveal loot={state.pendingLoot} assets={assets} onContinue={() => act({ type: "continue" })} />}
          {phase === "camp" && (
            <div className="overlay">
              <section className="result-panel">
                <div className="eyebrow">A MOMENT BETWEEN FLAMES</div>
                <h2>Rest by the embers.</h2>
                <p>
                  The path ahead still burns.
                  <br />
                  Recover {Math.floor(state.maxHp * (state.room === 1 ? .3 : .5))} HP before your next encounter.
                </p>
                <button
                  className="primary"
                  onClick={() => act({ type: "camp" })}
                >
                  Rest, then continue →
                </button>
              </section>
            </div>
          )}
          {(phase === "won" || phase === "lost") && (
            <div className="overlay result-overlay">
              <section className="result-panel">
                <div className="eyebrow">
                  {phase === "won" ? "JOURNEY COMPLETE" : "THE PACT IS BROKEN"}
                </div>
                <h2>
                  {phase === "won"
                    ? "The flame is yours."
                    : "The Pit remembers."}
                </h2>
                <p>
                  {phase === "won"
                    ? `You survived all ${encounters.length} encounters through the Cinderforge.`
                    : "A different pact. A different outcome. Try again."}
                </p>
                {phase === "won" && state.relics.includes("demon-lord-crown") && <div className="victory-crown"><img src={assets.images["item-demon-crown"]} alt="Demon Lord's Crown" /><h3>{items["demon-lord-crown"].name}</h3><p>{items["demon-lord-crown"].text}</p></div>}
                <p className="run-result">
                  Seed {state.seed} · {state.gold} gold · {state.deck.length} cards · {state.hp} HP
                  remaining
                </p>
                <button className="primary" onClick={() => start()}>
                  Begin again →
                </button>
                <button
                  onClick={() => {
                    setState(null);
                    animate("idle_breathe");
                  }}
                >
                  Return to title
                </button>
              </section>
            </div>
          )}
        </>
      )}
      {state && <footer>
        <span>
          RUNELORD <i>◆</i> CINDER & OATH
        </span>
        <span>
          {musicError
            ? "Music unavailable — toggle to retry"
            : `♫ ${track === OPENING_SCORE_ID ? OPENING_SCORE_TITLE : assets.music[track]?.title ?? "Cinderforge score"}`}
        </span>
        <span>
          {state ? "AUTOSAVED LOCALLY" : "WARLOCK PLAYABLE DEMO · 0.1"}
        </span>
      </footer>}
      {inspection && inspection !== "items" && inspection !== "powers" && state && <div className="overlay" onClick={() => setInspection(null)}>
        <section className={`help-panel inspection-panel ${inspection === "brand" ? "item-inspection" : "pile-inspection"}`} role="dialog" aria-modal="true" aria-label={inspection === "brand" ? "Brand of the Pit" : `${inspection} pile`} onClick={e => e.stopPropagation()}>
          <button className="close" autoFocus onClick={() => setInspection(null)}>Close ×</button>
          <div className="inspection-kicker">{inspection === "brand" ? "RELIC OF THE NINTH PIT" : "THE WARLOCK’S GRIMOIRE"}</div>
          <h2>{inspection === "brand" ? "Brand of the Pit" : `${inspection === "draw" ? "Draw" : "Discard"} pile`}</h2>
          {inspection === "brand" ? <><div className="relic-display"><img className="inspected-item" src={assets.images.brand} alt="Brand of the Pit" /></div><div className="relic-description"><p>Start combat with <strong>3 Cinders.</strong></p><p>Gain <strong>1 Cinder</strong> whenever you lose HP on your turn.</p></div><div className="relic-status"><span aria-hidden="true">◆</span> PASSIVE ITEM · ALWAYS ACTIVE</div></> : <div className="deck-grid">
            {(inspection === "draw" ? [...state.draw].sort((a, b) => a.id.localeCompare(b.id)) : state.discard).map(c => <CardView key={c.uid} id={c.id} assets={assets} />)}
            {!state[inspection].length && <p>This pile is empty.</p>}
          </div>}
        </section>
      </div>}
      {inspection === "powers" && state && <div className="overlay" onClick={() => setInspection(null)}>
        <section className="help-panel" role="dialog" aria-modal="true" aria-label="Active powers" onClick={e => e.stopPropagation()}>
          <button className="close" onClick={() => setInspection(null)}>Close ×</button>
          <div className="eyebrow">BOUND TO THIS BATTLE</div><h2>Active powers</h2>
          <div className="power-list">{Object.entries(state.powers).map(([id, value]) => <article key={id}><h3>{cards[id as CardId].name}</h3><p>{id === "burning-soul" ? `Demon upkeep reduced by ${value}.` : id === "masters-of-the-pit" ? `Demons gain ${value} Power.` : id === "infernal-pact" ? `Deal ${value} damage to all enemies whenever you lose HP on your turn.` : id === "demonic-resilience" ? `Gain ${value} Guard and 2 Cinders when a demon dies.` : id === "pyroclasm" ? `Apply ${value} Scorch to every enemy at the start of your turn.` : id === "dread-aura" ? `Demon attacks apply ${value} Scorch.` : cards[id as CardId].text}</p></article>)}</div>
        </section>
      </div>}
      {inspection === "items" && state && <div className="overlay" onClick={() => setInspection(null)}>
        <section className="help-panel" role="dialog" aria-modal="true" aria-label="Collected supplies" onClick={e => e.stopPropagation()}>
          <button className="close" onClick={() => setInspection(null)}>Close ×</button>
          <div className="eyebrow">LOOT FROM THE CINDERFORGE</div><h2>Your supplies</h2>
          <p>Consumables can be used during your turn. Each use consumes one item.</p>
          {[{ title: "Potions", entries: potionInventory }, { title: "Items", entries: itemInventory }].map(group => <section key={group.title} aria-label={group.title}><h3>{group.title}</h3><div className="item-list">
            {group.title === "Potions" && state.potion && <button disabled={busy || phase !== "combat"} onClick={() => { setInspection(null); void act({ type: "potion" }); }}><img className="loot-icon" src={assets.images.potion} alt="" /><span><strong>Healing Draught</strong><small>Restore {Math.floor(state.maxHp * .2)} HP.</small></span><span>Drink</span></button>}
            {group.entries.map((item, index) => <button key={`${item}-${index}`} disabled={busy || phase !== "combat"} onClick={() => { setInspection(null); void act({ type: "item", item }); }}>
              {assets.images[`item-${item}`] ? <img className="loot-icon" src={assets.images[`item-${item}`]} alt="" /> : <LootIcon item={item} />}<span><strong>{items[item].name}</strong><small>{items[item].text}</small></span><span>{group.title === "Potions" ? "Drink" : "Use"}</span>
            </button>)}
            {!group.entries.length && !(group.title === "Potions" && state.potion) && <p>No {group.title.toLowerCase()} collected.</p>}
          </div></section>)}
          {!state.inventory.length && <p>No supplies remain.</p>}
        </section>
      </div>}
      {showHelp && (
        <div className="overlay">
          <section
            className="help-panel"
            role="dialog"
            aria-modal="true"
            aria-label="How to play"
          >
            <button className="close" onClick={() => setShowHelp(false)}>
              Close ×
            </button>
            <div className="eyebrow">THE WARLOCK'S BARGAIN</div>
            <h2>Power has a price.</h2>
            <label className="effects-volume">Sound effects
              <input aria-label="Sound effects volume" type="range" min="0" max="1" step=".05" value={effectsVolume} onChange={e=>{const value=Number(e.target.value);setEffectsVolume(value);sfx.setVolume(value);}} />
              <button onClick={()=>{const value=effectsVolume?0:.6;setEffectsVolume(value);sfx.setVolume(value);}}>{effectsVolume ? "Mute effects" : "Enable effects"}</button>
            </label>
            <div className="help-grid">
              <article>
                <h3>01 · Cast</h3>
                <p>
                  You draw 5 cards and gain 3 Mana each turn. Click an attack,
                  then an enemy. Click a skill to cast it. Unspent cards are
                  discarded at turn end. Cards with X cost spend all your current Mana. Click an allied demon when a card asks for one.
                </p>
              </article>
              <article>
                <h3>02 · Summon</h3>
                <p>
                  Demons attack the focus target, front to back, after your
                  turn. Imps also act immediately. Cinders pay Upkeep; any
                  shortfall costs HP. The front is the newest demon.
                </p>
              </article>
              <article>
                <h3>03 · Burn</h3>
                <p>
                  Scorch deals damage after an enemy acts, then halves. Burning
                  enemies grant Cinders when killed. Blood Pact trades 3 HP for
                  Mana, Cinders, and Corruption.
                </p>
              </article>
              <article>
                <h3>04 · Ascend</h3>
                <p>
                  At 10 Corruption, your next turn begins 3 turns of Demon Form:
                  +3 attack damage, +2 Scorch on attacks, and +2 demon Power.
                  Lose 3 HP at turn end. The human empowered animation
                  represents this form in the demo.
                </p>
              </article>
            </div>
            <p className="muted">
              Explore {encounters.length} encounters with {Object.keys(cards).length} cards and three starting pacts. Your summoned demons use their original character artwork.
              Enemy animations and spell impacts play in combat order.
            </p>
            <button className="primary" onClick={() => setShowHelp(false)}>
              Understood →
            </button>
          </section>
        </div>
      )}
      {showDeck && state && (
        <div className="overlay">
          <section
            className="deck-panel"
            role="dialog"
            aria-modal="true"
            aria-label="Deck"
          >
            <button className="close" onClick={() => setShowDeck(false)}>
              Close ×
            </button>
            <h2>Your pact</h2>
            <div className="deck-grid">
              {Object.entries(
                state.deck.reduce<Record<string, number>>(
                  (a, id) => ((a[id] = (a[id] || 0) + 1), a),
                  {},
                ),
              ).map(([id, n]) => (
                <div key={id}>
                  <CardView id={id as CardId} assets={assets} />
                  <span>× {n}</span>
                </div>
              ))}
            </div>
          </section>
        </div>
      )}
    </main>
  );
}
const root = createRoot(document.getElementById("root")!);
root.render(
  <div className="loading">
    RUNELORD <span>Gathering the embers…</span>
  </div>,
);
loadAssets()
  .then((assets) => root.render(<MobileShell><App assets={assets} /></MobileShell>))
  .catch((e) =>
    root.render(
      <div className="loading">
        Unable to load Runelord.<span>{String(e.message)}</span>
      </div>,
    ),
  );

