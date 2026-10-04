import { items, type ItemId } from "../../../packages/content/index";
import type { Assets } from "./assets";
import { HudStatIcon } from "./HudTemplate";
import { LootIcon } from "./LootIcon";

export function LootReveal({ loot, assets, onContinue }: { loot: { gold: number; items: ItemId[]; final: boolean }; assets: Assets; onContinue: () => void }) {
  return <div className="overlay loot-overlay"><section className="reward-panel loot-panel" role="dialog" aria-modal="true" aria-label={loot.final ? "The Demon Lord's crown" : "Encounter loot"}>
    <div className="eyebrow">{loot.final ? "THE NINTH PIT FALLS SILENT" : "SPOILS OF THE ENCOUNTER"}</div>
    <h2>{loot.final ? "The crown is yours." : "Your spoils, revealed."}</h2>
    <p>{loot.final ? "The Demon Lord is defeated. His crown marks the end of your journey." : "These rewards have been added to your collection."}</p>
    <div className="loot-gold"><HudStatIcon kind="gold" /><span><strong>+{loot.gold}</strong> Gold</span></div>
    <div className="loot-reveal-items">{loot.items.map((id, index) => {
      const crown = String(id) === "demon-lord-crown";
      const src = assets.images[crown ? "item-demon-crown" : `item-${id}`];
      return <article key={`${id}-${index}`} className={crown ? "crown-reveal" : ""}>
        {src ? <img src={src} alt="" /> : <LootIcon item={id} />}
        <div><span className="loot-category">{items[id].category}</span><h3>{items[id].name}</h3><p>{items[id].text}</p>
          <small>{crown ? "Victory relic - kept as a trophy." : items[id].category === "relic" ? "Passive relic — its benefits apply automatically." : items[id].category === "potion" ? "Stored with potions. Use during your turn; consumed on use." : "Stored with items. Use during your turn; consumed on use."}</small></div>
      </article>;
    })}</div>
    <button className="primary" autoFocus onClick={onContinue}>{loot.final ? "Claim your victory" : "Continue your journey"}</button>
  </section></div>;
}
