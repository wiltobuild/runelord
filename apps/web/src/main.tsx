import { DevConsole } from "./DevConsole";
import { applyDebugAction, type DebugAction } from "./debugState";
import { EXPEDITION_REVIEW, expeditionReviewState } from "./expeditionReview";
import { SummonOrders, orderName } from "./SummonOrders";
import { CampScene, RouteChoice, TreasureScene, RelicCollection } from "./ExpeditionScreens";
import { treasureOptions, routeChoices } from "../../../packages/engine/index";
import { nextRealm } from "../../../packages/engine/index";
import { routeDescription } from "./realmPresentation";
import { FROZEN_REVIEW, frozenWastesReviewState } from "./frozenWastesReview";
import {ARCTIC_REVIEW,arcticReviewState,arcticReviewAssets,arcticEncounter} from "./arcticReview";
import { HELLBOUND_REVIEW, hellboundReviewState } from "./hellboundReview";
import { cardArtwork } from "./cardPresentation";
import { NeutralCard } from "./SoulforgeShop";
import { RoguelikeShop } from "./RoguelikeShop";
import { ForestShop } from "./ForestShop";
import { SUMMON_REVIEW, summonReviewState } from "./summonReview";
import { FOREST_REVIEW, SOVEREIGN_PLAYTEST, forestReviewState } from "./forestReview";
import { IntroCinematic } from "./IntroCinematic";
import { OpeningScreen } from "./OpeningScreen";
import { GuardAura } from "./GuardAura";
import { useEffect, useState, useRef, type CSSProperties } from "react";
import { createRoot } from "react-dom/client";
import {
  cards,
  encounters,
  starterDecks, runebladeSummons, cardTargetsUnit, items, type StarterDeckId,
  isLegionKind, type CardId,
} from "../../../packages/content/index";
import {
  newRoguelikeRun, infernalShopAppearance, cardEffectText, cardLevel, canAddCard, enterRoguelikeShop,
  activeEncounter, encounterCount, currentRealm, realmEncounterNumber, realmEncounterCount, isRealmBoss,
  usesSummonRules, warbandCapacity,
  dispatch,
  playable,
  manaCost,
  cardPayment,
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
import { summonDescription, summonPower, summonScorch } from "./summonDetails";
import { LegionStatus } from "./LegionStatus";
import { MinionDetails } from "./MinionDetails";
import { LootReveal } from "./LootReveal";
import { LootIcon } from "./LootIcon";
import { ResourceMeters } from "./ResourceMeters";
import { EnemyName } from "./EnemyName";
import { SpellEffects } from "./SpellEffects";
import { useBattleDirector } from "./useBattleDirector";
import { score, OPENING_SCORE_ID, OPENING_SCORE_TITLE, INFERNAL_SCORES } from "./music";
import { sfx } from "./sound";
import "./style.css";
import { HUD, HudTemplate, HudStatIcon, InventorySlot, useHudScale } from "./HudTemplate";
import { AnimatedBackground } from "./AnimatedBackground";
import { EndTurnButton } from "./EndTurnButton";
import { intentLabel } from "./intentLabel";
import { layoutWarband, retreatGroundFormation, WARBAND_SPACE } from "./warbandLayout";
import { packCrowdedWarband } from "./packedWarband";
import "./hud.css";
import "./runeblade-theme.css";
import "./mobile.css";
import { MobileShell } from "./MobileShell";
const SHOP_REVIEW = import.meta.env.DEV && new URLSearchParams(location.search).has("shopReview");
const SAVE_KEY = "runelord-warlock-demo-v1";
function demoScore(state: State | null) {
  if (!state) return OPENING_SCORE_ID;
  if (currentRealm(state) === "frozen-wastes") return ["combat", "reward", "loot"].includes(state.phase) ? "battle" : "explore";
  if (currentRealm(state) === "forest") return isRealmBoss(state) && ["combat", "reward", "loot"].includes(state.phase) ? "forest-boss" : "forest-explore";
  if (state.phase === "shop") return infernalShopAppearance(state.seed,state.shops?.current ?? null).shopId;
  if (state.phase === "camp" || state.phase === "won") return "explore";
  return isRealmBoss(state) ? "demon-boss" : "battle";
}
function reviewShop() {
  const state = newRoguelikeRun(20261003,"warband");
  state.room = 2; state.gold = 500;
  enterRoguelikeShop(state);
  return state;
}
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
  level = 0,
  payment,
  runebladeRules = 2,
  summonRules = true,
}: {
  id: CardId;
  assets: Assets;
  onClick?: () => void;
  disabled?: boolean;
  selected?: boolean;
  cost?: number;
  level?: number;
  runebladeRules?: 1 | 2;
  summonRules?: boolean;
  payment?: {resource: "mana" | "corpses"; amount: number};
}) {
  const c = cards[id];
  const displayedCost = cost ?? (c.xCost ? "X" : Math.max(c.cost > 0 ? 1 : 0,c.cost-Math.floor(level/3)));
  const effectText = cardEffectText(id,level,runebladeRules,summonRules);
  const artwork = cardArtwork(assets,id,runebladeRules,summonRules);
  const corpseSummon = id.startsWith("summon-") && id.slice(7) in runebladeSummons;
  const costLabel = payment?.resource === "corpses" ? `${payment.amount} Corpses · Mana saved` : `${displayedCost} Mana${corpseSummon ? ` or ${displayedCost} Corpses` : ""}${c.cinders ? ` + ${c.cinders} Cinders` : ""}`;
  return (
    <button
      className={`card ${selected ? "selected" : ""}`}
      disabled={disabled}
      onClick={onClick}
      aria-label={`${c.name}, ${costLabel}. ${effectText}`}
    >
      {artwork ? (
        <img src={artwork} alt="" draggable={false} />
      ) : id.startsWith("neutral-") ? <NeutralCard id={id} level={level}/> : (
        <div className="card-text">
          <span className="card-type">{c.rarity} · {c.type}</span><h3>{c.name}</h3>
          <p>{effectText}</p><strong className="card-cost">{displayedCost} Mana{c.cinders ? ` + ${c.cinders} Cinders` : ""}</strong>
        </div>
      )}
      {corpseSummon && <span className={`corpse-cost-badge ${payment?.resource === "corpses" ? "corpse-payment-active" : ""}`}>{payment?.resource === "corpses" ? `${payment.amount} CORPSES` : `${displayedCost} MANA / CORPSES`}</span>}
      <span className="card-info">
        <strong>{c.name}{level > 0 ? ` · +${level}` : ""}</strong>
        <span>
          {costLabel}
        </span>
        <span>{effectText}</span>
      </span>
    </button>
  );
}
function App({ assets }: { assets: Assets }) {
  const hudScale = useHudScale();
  const [orderUnitId,setOrderUnitId]=useState<number | null>(null);
  const [inspection, setInspection] = useState<"brand" | "draw" | "discard" | "items" | "powers" | null>(null);
  const [introStarted, setIntroStarted] = useState(false);
  const [starterDeck, setStarterDeck] = useState<StarterDeckId>("warband");
  const [saved, setSaved] = useState<State | null>(readSave),
    [game, setState] = useState<State | null>(() => EXPEDITION_REVIEW ? expeditionReviewState() : FROZEN_REVIEW ? frozenWastesReviewState() : ARCTIC_REVIEW ? arcticReviewState() : HELLBOUND_REVIEW ? hellboundReviewState() : SUMMON_REVIEW ? summonReviewState() : (FOREST_REVIEW || SOVEREIGN_PLAYTEST) ? forestReviewState() : SHOP_REVIEW ? reviewShop() : null),
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
    [promotionRecipient, setPromotionRecipient] = useState<number | undefined>(),
    [musicError, setMusicError] = useState(false),
    [musicActive, setMusicActive] = useState(false);
  const debugSession = useRef<{ active: boolean; original: State | null; past: (State | null)[]; future: (State | null)[] }>({ active: false, original: null, past: [], future: [] });
  const [debugMessage, setDebugMessage] = useState("");
  const [, refreshDebug] = useState(0);
  const actionEpoch = useRef(0);
  const rememberDebug = (before: State | null) => {
    if (!debugSession.current.active) return;
    debugSession.current.past = [...debugSession.current.past.slice(-99), structuredClone(before)];
    debugSession.current.future = [];
    refreshDebug(n => n + 1);
  };
  const state = visual ?? game;
  const isRuneblade = state?.hero === "runeblade";
  const runebladeRules = state?.runebladeRules ?? 1;
  const summonRules = state ? usesSummonRules(state) : true;
  const hasGravekeepersSeal = !!state?.relics.includes("gravekeepers-seal");
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
      if (document.querySelector(".dev-console")) return;
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
    encounter = state ? ARCTIC_REVIEW ? arcticEncounter : activeEncounter(phase === "route-choice" ? { ...state, room: Math.min(state.room + 1, encounterCount(state) - 1) } : state) : encounters[0],
    track = demoScore(state);
  const animate = (name: string) => {
    setAnimation(name);
    setSequence((n) => n + 1);
  };
  const director = useBattleDirector(assets, animate, (view) =>
    setVisual((current) => (current ? { ...current, ...view } : null)),
    state?.hero ?? "warlock",
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
    if (debugSession.current.active || !game || EXPEDITION_REVIEW || FROZEN_REVIEW || ARCTIC_REVIEW || HELLBOUND_REVIEW || SHOP_REVIEW || FOREST_REVIEW || SOVEREIGN_PLAYTEST || SUMMON_REVIEW) return;
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
    actionEpoch.current++;
    rememberDebug(game);
    director.clear();
    setVisual(null);
    resolving.current = false;
    setBusy(false);
    const next = resume && saved ? saved : newRoguelikeRun(seed.trim() ? Number(seed) >>> 0 : crypto.getRandomValues(new Uint32Array(1))[0], starterDeck);
    setState(next);
    setMusicActive(true);
    setSelected(null);
    setLog(next.events.map((e) => e.message));
    setMessage("Select an attack, then an enemy. Click a skill to cast it.");
    animate("idle_breathe");
    void score
      .play(assets, demoScore(next))
      .catch(() => setMusicError(true));
  };
  const act = async (action: Action) => {
    if (!game || resolving.current) return;
    const epoch = actionEpoch.current;
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
      rememberDebug(before);
      setState(next);
      setLog((l) => [...l, ...next.events.map((e) => e.message)].slice(-40));
      setSelected(null);
      setPromotionRecipient(undefined);
      setDismiss(undefined);
      setMessage("");
      if (animated) await director.run(before, next, action);
      else if (action.type === "reward" || action.type === "camp" || action.type === "continue") {
        director.clear();
        animate("idle_breathe");
      }
    } catch (e) {
      if (epoch === actionEpoch.current) setMessage((e as Error).message);
    } finally {
      if (epoch !== actionEpoch.current) return;
      setVisual(null);
      setBusy(false);
      resolving.current = false;
    }
  };
  const chooseUnit = (id:number) => {
    if (!state || !selected || busy) return;
    if (selected.id !== 'blood-ascension') { void act({type:'play',uid:selected.uid,unit:id}); return; }
    const unit=state.units.find(u=>u.id===id && u.hp>0);
    if (!unit) return;
    if (promotionRecipient === undefined) {
      if (!isLegionKind(unit.kind)) { setMessage('Choose a Legion soldier to receive three promotions.'); return; }
      setPromotionRecipient(id);
      setMessage(`Blood Ascension: ${unit.name} will gain three ranks. Choose a DIFFERENT summon to sacrifice, or choose another card to cancel.`);
      return;
    }
    if(id===promotionRecipient) {setMessage('Choose a different summon to sacrifice.');return;}
    void act({type:'play',uid:selected.uid,unit:promotionRecipient,sacrifice:id});
  };
  const chooseSummon=(id:number)=>{
    if(!state||busy)return;
    if(selected&&cardTargetsUnit(selected.id)){chooseUnit(id);return;}
    if(state.expansionVersion===2&&!selected&&state.phase==='combat'){setOrderUnitId(id);return;}
    setDismiss(id);setMessage('Summon selected for replacement when the warband is full.');
  };
  const chooseCard = (c: CardInstance) => {
    if (!state || busy) return;
    setPromotionRecipient(undefined);
    setOrderUnitId(null);
    if (!playable(state, c)) {
      setMessage("This card needs enough resources, a valid target and room in the Warband. Pair recruits need two free slots; Hellgate needs three Maledictors and can open once per turn.");
      return;
    }
    if (cardTargetsUnit(c.id)) {
      setSelected(c);
      setMessage(`Choose ${["field-promotion","battlefield-commission","veteran-command","blood-ascension"].includes(c.id) ? "a Legion soldier" : isRuneblade ? "an undead ally" : "a demon"} for ${cards[c.id].name}.`);
    } else if ((cards[c.id].type === "Attack" || c.id === "void-gaze" || c.id === "corrupting-touch" || c.id === "frozen-grasp")) {
      setSelected(c);
      setMessage(`Choose a target for ${cards[c.id].name}.`);
    } else if (
      c.id.startsWith("summon") &&
      state.units.length >= warbandCapacity(state) &&
      dismiss === undefined
    ) {
      setSelected(c);
      setMessage(
        isRuneblade ? "Warband full. Select an undead ally to dismiss, then play the summon. Dismissal grants no Corpse." : "Warband full. Select a demon to dismiss, then play the summon.",
      );
    } else act({ type: "play", uid: c.uid, dismiss });
  };
  const replaceDebugState = (next: State | null) => {
    actionEpoch.current++;
    director.clear();
    resolving.current = false;
    setVisual(null); setBusy(false); setSelected(null); setInspection(null);
    setOrderUnitId(null); setShowDeck(false); setShowHelp(false);
    setDismiss(undefined); setPromotionRecipient(undefined); setMessage("");
    setLog(next?.events.map(event => event.message) ?? []);
    animate("idle_breathe"); setState(next); refreshDebug(n => n + 1);
  };
  const debugAction = (action: DebugAction) => {
    try {
      const next = applyDebugAction(game, action);
      if (!debugSession.current.active) {
        debugSession.current = { active: true, original: structuredClone(game), past: [], future: [] };
      }
      rememberDebug(game);
      replaceDebugState(next);
      setDebugMessage(`Applied ${action.type}. Normal save is unchanged.`);
    } catch (error) { setDebugMessage(error instanceof Error ? error.message : String(error)); }
  };
  const debugHistory = (direction: "undo" | "redo") => {
    const session = debugSession.current;
    const source = direction === "undo" ? session.past : session.future;
    const destination = direction === "undo" ? session.future : session.past;
    if (!source.length) return;
    destination.push(structuredClone(game));
    replaceDebugState(source.pop() ?? null);
    setDebugMessage(direction === "undo" ? "Previous state restored." : "Next state restored.");
  };
  const restoreOriginal = () => {
    const session = debugSession.current;
    if (!session.active) return;
    const original = structuredClone(session.original);
    debugSession.current = { active: false, original: null, past: [], future: [] };
    replaceDebugState(original);
    setDebugMessage("Original run restored. Normal saving resumed.");
  };
  const returnToTitle = () => { rememberDebug(game); setState(null); };
  const renderScreen = () => {
  if(state?.expansionVersion===2&&phase==='camp')return <CampScene onHome={returnToTitle} state={state} assets={assets} message={message} onAction={action=>{void act(action);}}/>;
  if(state?.expansionVersion===2&&phase==='treasure')return <TreasureScene onHome={returnToTitle} state={state} assets={assets} message={message} options={treasureOptions(state)} onAction={action=>{void act(action);}}/>;
  if(state?.expansionVersion===2&&phase==='route-choice')return <RouteChoice onHome={returnToTitle} state={state} assets={assets} message={message} choices={routeChoices(state)} onChoose={id=>{void act({type:"choose-room",id});}}/>;
  if (state && phase === "shop") {
    const Shop = currentRealm(state) !== "infernal" ? ForestShop : RoguelikeShop;
    return <Shop state={state} assets={assets} onAction={action => { void act(action); }} message={message} musicOn={musicActive && volume > 0} onMusic={() => { const v = !musicActive || !volume ? .35 : 0; setVolume(v); score.setVolume(v); void music(); }} />;
  }
  if (!state && !introStarted) return <IntroCinematic volume={volume} onVolume={v => { setVolume(v); score.setVolume(v); }} onStart={() => { setIntroStarted(true); void music(); }} />;
  return (
    <main
      className={state ? "battle-ui" : "title"}
      data-hero={state?.hero ?? "warlock"}
      style={
        {
          "--scene": `url(${assets.images[!state ? "demon-throne" : encounter.background]})`,
          "--hud-scale": hudScale,
        } as React.CSSProperties
      }
    >
      {!state && <AnimatedBackground scene="demon-throne" />}
      {state && <><AnimatedBackground scene={encounter.background} /><HudTemplate hero={state.hero} /></>}
      <header className="topbar">
        <button
          className="wordmark"
          disabled={busy}
          onClick={() => {
            director.clear();
            setVisual(null);
            returnToTitle();
            setSelected(null);
            animate("idle_breathe");
          }}
        >
          <span className="logo-type">R<em>U</em>NELORD</span><small>CINDER &amp; OATH</small>
        </button>
        <div className="chapter">
          {state
            ? ARCTIC_REVIEW ? "ARCTIC PREVIEW · Frostgrave Causeway" : `${currentRealm(state) === "frozen-wastes" ? "FROZEN WASTES" : currentRealm(state) === "forest" ? "FOREST" : "INFERNAL"} · ${realmEncounterNumber(state)} OF ${realmEncounterCount(state)}`
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
            <div className="stat corruption" title={isRuneblade ? "Every friendly or enemy death grants 1 Corpse, regardless of cause." : undefined}>
              <HudStatIcon kind={isRuneblade ? "corpses" : "corruption"} />
              <strong>
                {isRuneblade ? state.corpses : state.demonTurns
                  ? `${state.demonTurns} turns`
                  : state.corruption}
                <small>{isRuneblade || state.demonTurns ? "" : " / 10"}</small>
              </strong>
              <label>{isRuneblade ? "CORPSES" : state.demonTurns ? "DEMON FORM" : "CORRUPTION"}</label>
            </div>
          </div>
          {Object.keys(state.powers).length > 0 && <button className="active-powers" onClick={() => setInspection("powers")}>Active powers <strong>{Object.keys(state.powers).length}</strong></button>}
          <div className="inventory" role="group" aria-label="Items and potions">
            <div role="group" aria-label="Items and relics">
              <span className="inventory-category item-category">ITEMS</span>
              <InventorySlot x={HUD.items[0]} label={isRuneblade ? (hasGravekeepersSeal ? "Gravekeeper’s Seal — inspect starting relic" : "Corpse Harvest — inspect ability") : "Brand of the Pit - inspect relic"} image={isRuneblade ? (assets.images["item-gravekeepers-seal"] ?? assets.images["relic-gravekeepers-seal"] ?? assets.images.runeblade) : assets.images.brand}
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
            <LegionStatus state={state} />
            {HELLBOUND_REVIEW && <nav className="legion-review-links" aria-label="Legion battle lab"><a href="/hellbound-review">Formation / reset</a><a href="/hellbound-review?group=bodyguards">Bodyguards</a><a href="/hellbound-review?group=hellgate">Three Maledictors</a><a href="/hellbound-review?group=ten">Ten summons</a></nav>}
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
              <GuardAura hero={state.hero} active={state.guard > 0 && state.hp > 0 && phase === "combat"} />
              <Hero
                hero={state.hero}
                assets={assets}
                animation={animation}
                sequence={sequence}
                empowered={state.demonTurns > 0}
                hp={state.hp}
                maxHp={state.maxHp}
              />
              <div className="hero-label">
                {isRuneblade ? "RUNEBLADE" : "WARLOCK"}{" "}
                <span>
                  {isRuneblade ? "LORD OF THE FALLEN" : state.demonTurns ? "ASCENDED" : "BRAND OF THE PIT"}
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
                    className={`unit formation-unit ${isRuneblade ? "runeblade-unit" : ""} ${stack ? "packed-unit" : ""} summon-${u.kind} ${slot.airborne ? "airborne" : ""} ${dismiss === u.id ? "chosen" : ""} ${u.hp <= 0 ? "unit-dying" : ""}`}
                    style={{left: slot.x, top: slot.top, width: slot.width, zIndex: slot.depth, "--summon-world-unit": `${slot.worldUnit}px`, "--summon-status-top": `${slot.root-slot.top+2}px`, "--flight-drop": `${WARBAND_SPACE.ground - slot.root}px`, "--summon-lower-padding": `${Math.max(0, slot.bounds.bottom - slot.root - 50)}px`, "--flight-landing-duration": `${assets.actors[slot.art]?.flightLandingMs ?? 290}ms`, "--death-duration": `${assets.actors[slot.art]?.states.die.duration ?? 740}ms`} as CSSProperties}
                    data-actor={`unit-${u.id}`}
                    disabled={busy || u.hp <= 0}
                    title={summonDescription(u, state)}
                    aria-label={summonDescription(u, state)}
                    onClick={() => chooseSummon(u.id)}
                  >
                    {!stack && <span className="minion-headroom" aria-hidden="true" />}
                    <ActorSprite
                      assets={assets}
                      art={slot.art}
                      animationSeed={u.id}
                      promotionRank={u.promotionRank}
                      cue={director.cues[`unit-${u.id}`]}
                      hp={u.hp}
                      maxHp={u.maxHp}
                      name={u.name}
                      className="summon-model"
                    />
                    {!stack && <MinionDetails promotionRank={u.promotionRank} armor={u.armor} rot={isRuneblade ? u.rot : undefined} name={u.name} hp={u.hp} maxHp={u.maxHp} guard={u.guard} defender={u.defender} power={summonPower(u, state)} scorch={summonScorch(u, state)} order={state.expansionVersion===2?orderName(state,u):undefined} />}
                  </button>
                ); })}
                {packed?.groups.map(group => {
                  const members = group.ids.map(id => warbandUnits.find(u => u.id === id)!).filter(u => u.hp > 0);
                  if (!members.length) return null;
                  return <div key={group.kind} className="packed-status" style={{left:group.x-(group.airborne?0:groundRetreat.shift),top:group.top,width:group.width}}>
                    {members.map((u,i)=><button key={u.id} disabled={busy} className={dismiss===u.id?"selected":""} aria-label={`${u.name} ${warbandUnits.filter(member=>member.kind===u.kind&&member.hp>0).findIndex(member=>member.id===u.id)+1}, ${u.hp} of ${u.maxHp} health, ${u.guard} Guard`} title={summonDescription(u,state)} onClick={()=>chooseSummon(u.id)}>
                      <MinionDetails promotionRank={u.promotionRank} armor={u.armor} rot={isRuneblade ? u.rot : undefined} name={u.name} hp={u.hp} maxHp={u.maxHp} guard={u.guard} defender={u.defender} power={summonPower(u,state)} scorch={summonScorch(u,state)} order={state.expansionVersion===2?orderName(state,u):undefined} />
                    </button>)}
                  </div>;
                })}
              </div>
            </div>
            <div className={`enemies count-${state.enemies.length}`}>
              {state.enemies.map((e) => {
                const m = intent(state, e);
                const enemyName = e.name;
                const moveDescription = m.kind === "summon" ? (e.boss === "forest-sovereign" ? "Raises up to 2 living roots" : "Summons a demon ally") : m.kind === "shield" ? `Gains ${m.guard ?? 0} Guard` : `${m.damage} damage. ${intentLabel(state, m.targeting)}`;
                return (
                  <button
                    key={e.id}
                    data-actor={`enemy-${e.id}`}
                    className={`enemy ${e.boss ? "demon-lord" : ""} ${e.art === "forest-sovereign" ? "forest-sovereign" : ""} ${e.art === "sovereign-root" ? "living-root" : ""} ${e.summonedBy ? "boss-summon" : ""} ${state.focus === e.id ? "focused" : ""} ${e.hp <= 0 ? "fallen" : ""} ${selected && e.hp > 0 ? "targetable" : ""}`}
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
                      {e.boss && <span className="boss-phase">{e.bossPhase === 2 ? "PHASE II - ENRAGED" : e.boss === "frozen-sovereign" ? "PHASE I - FROZEN SOVEREIGN" : e.boss === "forest-sovereign" ? "PHASE I - FOREST SOVEREIGN" : "PHASE I - INFERNAL SOVEREIGN"}</span>}{e.summonedBy && <span className="boss-phase">{e.art === "sovereign-root" ? "LIVING ROOT" : "SUMMONED DEMON"}</span>}
                      <div className="hp-track">
                        <i style={{ width: `${(e.hp / e.maxHp) * 100}%` }} />
                        <span>
                          {e.hp} / {e.maxHp}
                        </span>
                      </div>
                      <small>
                        {e.guard > 0 ? `${e.guard} Guard | ` : ""}{e.sapped ? `${e.sapped} Sapped · ` : ""}{e.exposed ? `${e.exposed} Exposed · ` : ""}
                        {e.scorch ? `✦ ${e.scorch} Scorch` : " "}{e.chill ? ` · ❄ ${e.chill} Chill` : ""}{e.frozen ? " · FROZEN" : ""}
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
            <SpellEffects effects={director.effects} assets={assets} />
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
            <ResourceMeters runebladeRules={runebladeRules} hero={state.hero} corpses={state.corpses} mana={state.mana} cinders={state.cinders} upkeep={state.units.filter(u => u.hp > 0).reduce((sum, u) => sum + u.upkeep, 0)} />
            <button className="pile draw-pile" aria-label={`Draw pile, ${state.draw.length} cards`} onClick={() => setInspection("draw")}><b>{state.draw.length}</b><span>Draw<br />pile</span></button>
            <button className="pile discard-pile" aria-label={`Discard pile, ${state.discard.length} cards`} onClick={() => setInspection("discard")}><b>{state.discard.length}</b><span>Discard</span></button>
            <div key={`${room}-${state.turn}`} className={`hand ${busy && game?.history.at(-1)?.type === "end" ? "hand-ending" : ""}`} aria-label="Your hand">
              {state.hand.map((c) => (
                <CardView summonRules={summonRules} runebladeRules={runebladeRules}
                  key={c.uid}
                  id={c.id}
                  level={c.level ?? 0}
                  cost={manaCost(state, c)} payment={cardPayment(state,c)}
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
                <h2>{isRealmBoss(state) ? "Claim an Archdemon." : "Deepen your pact."}</h2>
                <p>{isRealmBoss(state) && state.hero === "warlock" && currentRealm(state) === "infernal" ? "The Sovereign falls. Choose an Archdemon to strengthen your deck." : "Choose one card to add to your deck. Offerings favor your starting pact."}</p>
                <div className="reward-cards">
                  {state.rewards.map((id) => (
                    <CardView summonRules={summonRules} runebladeRules={runebladeRules}
                      key={id}
                      id={id}
                      assets={assets}
                      disabled={!canAddCard(state,id)}
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
          {phase === "loot" && state.pendingLoot && <LootReveal training={state.history.slice(-1).some(action=>action.type==='claim-treasure'&&action.choice==='train')} loot={state.pendingLoot} assets={assets} realm={currentRealm(state)} nextRealm={nextRealm(state)} exchangeBeforeContinue={state.expansionVersion!==2&&!!state.shops} onContinue={() => act({ type: "continue" })} />}
          {phase === "camp" && (
            <div className="overlay">
              <section className="result-panel">
                <div className="eyebrow">A MOMENT BETWEEN FLAMES</div>
                <h2>Rest by the embers.</h2>
                <p>
                  The path ahead still burns.
                  <br />
                  Recover {Math.floor(state.maxHp * (realmEncounterNumber(state) === 2 ? .3 : .5))} HP before your next encounter.
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
                    ? currentRealm(state) === "frozen-wastes" ? "The long winter breaks." : currentRealm(state) === "forest" ? "The forest bows." : "The flame is yours."
                    : "The Pit remembers."}
                </h2>
                <p>
                  {phase === "won"
                    ? state.shops ? `You completed all ${encounterCount(state)} journey steps: ${routeDescription(state)}.` : `You survived all ${encounters.length} encounters through the Cinderforge.`
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
                    returnToTitle();
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
      {state?.expansionVersion===2&&<RelicCollection state={state} assets={assets}/>}
      {state?.expansionVersion===2&&phase==='combat'&&!busy&&orderUnitId!==null&&state.units.some(u=>u.id===orderUnitId&&u.hp>0)&&<SummonOrders key={orderUnitId} state={state} unit={state.units.find(u=>u.id===orderUnitId)!} onAction={action=>{void act(action);}} onClose={()=>setOrderUnitId(null)} onDismiss={()=>{setDismiss(orderUnitId);setOrderUnitId(null);setMessage('Summon selected for replacement when the warband is full.');}}/>}
      {state && <footer>
        <span>
          RUNELORD <i>◆</i> CINDER & OATH
        </span>
        <span>
          {musicError
            ? "Music unavailable — toggle to retry"
            : `♫ ${track === OPENING_SCORE_ID ? OPENING_SCORE_TITLE : INFERNAL_SCORES[track]?.title ?? assets.music[track]?.title ?? "Cinderforge score"}`}
        </span>
        <span>
          {state ? "AUTOSAVED LOCALLY" : "WARLOCK PLAYABLE DEMO · 0.1"}
        </span>
      </footer>}
      {inspection && inspection !== "items" && inspection !== "powers" && state && <div className="overlay" onClick={() => setInspection(null)}>
        <section className={`help-panel inspection-panel ${inspection === "brand" ? "item-inspection" : "pile-inspection"}`} role="dialog" aria-modal="true" aria-label={inspection === "brand" ? (isRuneblade ? (hasGravekeepersSeal ? "Gravekeeper’s Seal" : "Corpse Harvest") : "Brand of the Pit") : `${inspection} pile`} onClick={e => e.stopPropagation()}>
          <button className="close" autoFocus onClick={() => setInspection(null)}>Close ×</button>
          <div className="inspection-kicker">{isRuneblade ? "THE RUNEBLADE’S CODEX" : inspection === "brand" ? "RELIC OF THE NINTH PIT" : "THE WARLOCK’S GRIMOIRE"}</div>
          <h2>{inspection === "brand" ? (isRuneblade ? (hasGravekeepersSeal ? "Gravekeeper’s Seal" : "Corpse Harvest") : "Brand of the Pit") : `${inspection === "draw" ? "Draw" : "Discard"} pile`}</h2>
          {inspection === "brand" && isRuneblade ? <><div className="relic-display"><img className="inspected-item" src={assets.images["item-gravekeepers-seal"] ?? assets.images["relic-gravekeepers-seal"] ?? assets.images.runeblade} alt="Gravekeeper’s Seal" /></div><h3>{hasGravekeepersSeal ? "Begin each combat with 1 additional Corpse." : "Death fuels your army."}</h3><p>Every friendly or enemy death grants 1 Corpse, regardless of how it died.{state.runebladeRules === 2 && " After victory, each surviving summon returns as 1 Corpse; this conversion is not a death."}</p><p>When Corpses cover a summon’s full Mana cost, casting it automatically spends that many Corpses instead. Otherwise, it spends Mana. Resources are never mixed.</p></> : inspection === "brand" ? <><div className="relic-display"><img className="inspected-item" src={assets.images.brand} alt="Brand of the Pit" /></div><div className="relic-description"><p>Start combat with <strong>3 Cinders.</strong></p><p>Gain <strong>1 Cinder</strong> whenever you lose HP on your turn.</p></div><div className="relic-status"><span aria-hidden="true">◆</span> PASSIVE ITEM · ALWAYS ACTIVE</div></> : <div className="deck-grid">
            {(inspection === "draw" ? [...state.draw].sort((a, b) => a.id.localeCompare(b.id)) : state.discard).map(c => <CardView summonRules={summonRules} runebladeRules={runebladeRules} key={c.uid} id={c.id} level={c.level ?? 0} assets={assets} />)}
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
            <div className="eyebrow">{isRuneblade ? "THE RUNEBLADE’S OATH" : "THE WARLOCK’S BARGAIN"}</div>
            <h2>Power has a price.</h2>
            <label className="effects-volume">Sound effects
              <input aria-label="Sound effects volume" type="range" min="0" max="1" step=".05" value={effectsVolume} onChange={e=>{const value=Number(e.target.value);setEffectsVolume(value);sfx.setVolume(value);}} />
              <button onClick={()=>{const value=effectsVolume?0:.6;setEffectsVolume(value);sfx.setVolume(value);}}>{effectsVolume ? "Mute effects" : "Enable effects"}</button>
            </label>
            {isRuneblade ? <div className="help-grid"><article><h3>01 · Cast</h3><p>Draw 5 cards and gain 3 Mana each turn. Select attacks then their targets. Click summons and skills to cast them.</p></article><article><h3>02 · Raise</h3><p>Every summon can use Corpses. If you have Corpses equal to its current Mana cost, it automatically spends Corpses instead of Mana. Otherwise it spends Mana.</p></article><article><h3>03 · Harvest</h3><p>Every friendly or enemy death grants exactly 1 Corpse, regardless of cause. Corpses persist across battles.{state?.runebladeRules === 2 && " Victory converts each surviving summon into 1 Corpse."}{hasGravekeepersSeal && " Your Seal grants 1 additional Corpse at the start of combat."} Dismissing a healthy ally is not a death.</p></article><article><h3>04 · Command</h3><p>Your undead attack the focus target after your turn. Rot damages them after each attack and grows. Defenders protect you. Chill weakens enemy attacks; enough Chill freezes them. Heavy attacks shatter Frozen enemies.</p></article></div> : <div className="help-grid">
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
                  Demons act front to back after your
                  turn. Imps also act immediately. Cinders pay Upkeep; any
                  shortfall costs HP. The front is the newest demon. {summonRules ? "Pit Brutes cleave every enemy; support demons use their own actions. Empower Demon transforms a lesser demon into its Arch-form. Only one of each Archdemon can be alive at a time." : "Pit Brutes strike the focus target and protect you with Defender."}
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
            </div>}
            {state?.starterDeck === "hellbound" && <div className="help-grid"><article><h3>Hellbound veterans</h3><p>Summons leave after each battle. Each promoted recruit saves its rank for the next summon of that kind; one summon consumes one saved rank. Each promotion adds 2 Power, 2 maximum HP, heals 2 HP and adds 1 Armor. Armor reduces every incoming hit; Guard is temporary.</p></article><article><h3>Formation payoffs</h3><p>Two Legionaries share hostile damage aimed at the Warlock, even attacks that ignore Defender. Health paid by your own cards is still yours to pay. Three Maledictors open a Hellgate at turn end, damaging and scorching all enemies and promoting every soldier, once per turn.</p></article><article><h3>Recruit carefully</h3><p>The Warband holds up to ten units in new runs. Muster the Legion and Pike Detail each need two empty slots. Blood Ascension sacrifices a chosen summon to promote another soldier three times. Saved ranks return on resummoning, including after death or sacrifice.</p></article></div>}
            <p className="muted">
              Each hero starts at home. Runeblade travels Frozen Wastes → Forest → Infernal; Warlock travels Infernal → Forest → Frozen Wastes. Carry your deck and upgrades between realms. Choose your next destination after each room: battles, mysteries, treasures, shops, elites and camps. Every biome begins with a normal battle and ends at its Sovereign. Choose one of three starter decks for your character. Shops and card rewards support your chosen hero.
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
              {state.deck.map((id,index) => <div key={index}><CardView summonRules={summonRules} runebladeRules={runebladeRules} id={id} level={cardLevel(state,index)} assets={assets}/></div>)}
            </div>
          </section>
        </div>
      )}
    </main>
  );
  };
  return <>{renderScreen()}<DevConsole state={game} onAction={debugAction} onUndo={() => debugHistory("undo")} onRedo={() => debugHistory("redo")} onRestore={restoreOriginal} canUndo={debugSession.current.past.length > 0} canRedo={debugSession.current.future.length > 0} sandbox={debugSession.current.active} message={debugMessage} /></>;
}
const root = createRoot(document.getElementById("root")!);
root.render(
  <div className="loading">
    RUNELORD <span>Gathering the embers…</span>
  </div>,
);
loadAssets()
  .then(async (assets) => {
    arcticReviewAssets(assets);
    if (import.meta.env.DEV && location.pathname === "/runeblade-effects-review") { const {RunebladeEffectsReview}=await import("./RunebladeEffectsReview"); root.render(<RunebladeEffectsReview assets={assets}/>); } else if (import.meta.env.DEV && location.pathname === "/nature-shield-review") {
      const { NatureShieldReview } = await import("./NatureShieldReview");
      root.render(<NatureShieldReview />);
    } else root.render(<MobileShell><App assets={assets} /></MobileShell>);
  })
  .catch((e) =>
    root.render(
      <div className="loading">
        Unable to load Runelord.<span>{String(e.message)}</span>
      </div>,
    ),
  );
