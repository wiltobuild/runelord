import { useEffect, useRef, useState, type CSSProperties } from "react";
import { cards, starterDecks, type StarterDeckId, type CardId } from "../../../packages/content/index";
import type { Assets } from "./assets";
import { assetUrl } from "./baseUrl";
import { Hero } from "./Hero";
import "./opening.css";

const lore = {
  fire: { rune: "IGNIS", title: "The Cinder Testament", flavor: "Turn a spark into an inferno.", tags: "SCORCH · SPREAD · DETONATE", color: "#ff843d" },
  warband: { rune: "DAEMON", title: "The Book of the Bound", flavor: "No sovereign fights alone.", tags: "SUMMON · COMMAND · CONQUER", color: "#be8cff" },
  pact: { rune: "SANGUIS", title: "The Crimson Covenant", flavor: "Power always takes its due.", tags: "SACRIFICE · FORTIFY · ASCEND", color: "#f45b77" },
};
const comingHeroes = [
  { id: "runeblade", name: "Runeblade", theme: "FROST · STEEL · THE FALLEN" },
  { id: "runesmith", name: "Runesmith", theme: "RUNES · FORGE · CONSTRUCTS" },
  { id: "ranger", name: "Ranger", theme: "WILDS · BOW · COMPANIONS" },
];

export function OpeningScreen({ assets, selected, onSelect, onBegin, onResume, awaken }: {
  assets: Assets; selected: StarterDeckId; onSelect: (id: StarterDeckId) => void;
  onBegin: () => void; onResume?: () => void; awaken: () => void;
}) {
  const [characterChosen, setCharacterChosen] = useState(true);
  const [preview, setPreview] = useState<typeof starterDecks[number] | null>(null);
  const dialog = useRef<HTMLDialogElement>(null);
  const returnFocus = useRef<HTMLElement | null>(null);
  useEffect(() => {
    if (preview) dialog.current?.showModal();
    else { dialog.current?.close(); returnFocus.current?.focus(); }
  }, [preview]);
  const close = () => setPreview(null);
  const deck = starterDecks.find(d => d.id === selected) ?? starterDecks[0];
  const counts = new Map<CardId, number>();
  preview?.cards.forEach(id => counts.set(id, (counts.get(id) ?? 0) + 1));
  return <section className="pact-sanctum" onPointerDownCapture={awaken} onKeyDownCapture={awaken}>
    <div className="sanctum-atmosphere" aria-hidden="true"><div className="sanctum-light" /><div className="sanctum-seal">✧</div>
      {Array.from({ length: 28 }, (_, i) => <i key={i} style={{ "--n": i, left: `${(i * 37 + 11) % 100}%`, animationDelay: `${-i * .61}s` } as CSSProperties} />)}
    </div>
    <div className="sanctum-heading"><div className="sanctum-kicker">I · THE SOUL BEHIND THE OATH</div><h1>Choose your <em>character.</em></h1></div>
    <div className="character-court" role="group" aria-label="Choose your character">
      <button className={`character-plaque warlock-plaque ${characterChosen ? "chosen" : ""}`} aria-pressed={characterChosen} onClick={() => setCharacterChosen(true)}>
        <span className="character-model"><Hero assets={assets} animation="idle_breathe" sequence={0} empowered={false} /></span>
        <span className="character-title">Warlock</span><span className="character-specialty">DEMONS · HELLFIRE · BLOOD</span><span className="character-availability">{characterChosen ? "◆ CHARACTER CHOSEN" : "CHOOSE THE WARLOCK"}</span>
      </button>
      {comingHeroes.map(hero => <button key={hero.id} className="character-plaque unavailable" data-hero={hero.id} disabled aria-label={`${hero.name} — Coming soon`}><span className="character-model"><span className="coming-hero-idle" aria-hidden="true"><img src={assetUrl(`/opening-assets/hero-${hero.id}${hero.id === "runeblade" ? "-hd" : ""}-idle.webp`)} alt="" draggable={false} /></span></span><span className="character-title">{hero.name}</span><span className="character-specialty">{hero.theme}</span><span className="character-availability">COMING SOON</span></button>)}
    </div>
    <div className="pact-command-row">
      <button className="pact-begin runic-action" disabled={!characterChosen} onClick={onBegin}><span>Begin the pact</span><small>{characterChosen ? deck.name : "Choose your character first"}</small></button>
      <div className="sanctum-heading pact-heading"><div className="sanctum-kicker">II · THE POWER YOU WILL WIELD</div><h2>Choose your <em>pact.</em></h2><p aria-live="polite">{characterChosen ? "Three forbidden tomes. One path through the fire." : "Choose the Warlock above to unlock his pacts."}</p></div>
      {onResume ? <button className="pact-resume runic-action" onClick={onResume}><span>Resume journey</span><small>RETURN TO YOUR OATH</small></button> : <div className="pact-resume-space" />}
    </div>
    <fieldset className="tome-choices" disabled={!characterChosen}><legend className="sr-only">Choose your starting deck</legend>
      {starterDecks.map((d, i) => <article key={d.id} className={`tome-altar ${selected === d.id ? "is-chosen" : ""}`} style={{ "--magic": lore[d.id].color, "--delay": `${-i * 1.7}s` } as CSSProperties}>
        <label className="tome-select">
          <input type="radio" name="starter-pact" aria-label={d.name} value={d.id} checked={selected === d.id} onChange={() => onSelect(d.id)} />
          <span className="tome-art"><span className="tome-halo" /><span className="tome-orbit" /><img src={assetUrl(`/opening-assets/tome-${d.id}.webp`)} alt={`${lore[d.id].title}, a floating spell tome`} /><span className="tome-plinth" /></span>
          <span className="tome-rune">{lore[d.id].rune}</span><h2>{d.name}</h2><span className="tome-flavor">{lore[d.id].flavor}</span><span className="tome-description">{d.description}</span><span className="tome-tags">{lore[d.id].tags}</span>
          <span className="tome-selection">{!characterChosen ? "AWAITING YOUR CHARACTER" : selected === d.id ? "◆ PACT CHOSEN" : "◇ CHOOSE THIS PACT"}</span>
        </label>
        <button className="tome-preview" onClick={e => { returnFocus.current = e.currentTarget; setPreview(d); }}>Preview {d.cards.length} cards <span aria-hidden="true">↗</span><span className="sr-only"> — {d.name}</span></button>
      </article>)}
    </fieldset>
    <dialog ref={dialog} className="pact-deck-dialog" onCancel={close} onClick={e => { if (e.target === e.currentTarget) close(); }} aria-labelledby="pact-preview-title">
      {preview && <div className="pact-deck-content"><header><div><div className="sanctum-kicker">INSIDE THE GRIMOIRE · {preview.cards.length} STARTING CARDS</div><h2 id="pact-preview-title">{preview.name}</h2><p>{preview.description}</p></div><button className="close" autoFocus onClick={close} aria-label="Close deck preview">Close ×</button></header>
        <div className="pact-card-grid">{[...counts].map(([id, count]) => <figure key={id}><div className="preview-card-face">{assets.cards[id] ? <img src={assets.cards[id]} alt={cards[id].name} /> : <strong>{cards[id].name}</strong>}<span className="card-copies">×{count}</span></div><figcaption><strong>{cards[id].name}</strong><span>{cards[id].cost} Mana{cards[id].cinders ? ` · ${cards[id].cinders} Cinders` : ""}</span><p>{cards[id].text}</p></figcaption></figure>)}</div>
        <footer><span>Every copy shown. Rewards grow your deck during the journey.</span><button className="pact-preview-select" onClick={() => { onSelect(preview.id); close(); }}>Choose {preview.name}</button></footer></div>}
    </dialog>
  </section>;
}
