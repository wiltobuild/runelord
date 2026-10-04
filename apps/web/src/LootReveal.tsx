import { items, type ItemId } from "../../../packages/content/index";
import type { Assets } from "./assets";
import { HudStatIcon } from "./HudTemplate";
import { LootIcon } from "./LootIcon";

export function LootReveal({ loot, assets, onContinue, realm, continuesToForest=false }: { loot: { gold: number; items: ItemId[]; final: boolean }; assets: Assets; onContinue: () => void; realm?: "infernal" | "forest"; continuesToForest?: boolean }) {
  const forest = realm === "forest";
  return <div className="overlay loot-overlay"><section className="reward-panel loot-panel" role="dialog" aria-modal="true" aria-label={loot.final ? forest ? "Forest Sovereign spoils" : "The Demon Lord's crown" : "Encounter loot"}>
    <div className="eyebrow">{loot.final ? forest ? "THE LIVING ORCHARD FALLS SILENT" : "THE INFERNAL SOVEREIGN FALLS" : "SPOILS OF THE ENCOUNTER"}</div>
    <h2>{loot.final ? forest ? "The heart of the forest is yours." : "The crown is yours." : "Your spoils, revealed."}</h2>
    <p>{loot.final ? forest ? "Collect your spoils, then visit the final Woodland Exchange to complete your journey." : continuesToForest ? "Visit the border exchange, then enter Thornroot Forest with your cards, upgrades, relics, gold and supplies." : "The Demon Lord is defeated. His crown marks the end of your journey." : "These rewards have been added to your collection."}</p>
    <div className="loot-gold"><HudStatIcon kind="gold" /><span><strong>+{loot.gold}</strong> Gold</span></div>
    <div className="loot-reveal-items">{loot.items.map((id, index) => {
      const crown = String(id) === "demon-lord-crown";
      const src = assets.images[crown ? "item-demon-crown" : `item-${id}`];
      return <article key={`${id}-${index}`} className={crown ? "crown-reveal" : ""}>
        {src ? <img src={src} alt="" /> : <LootIcon item={id} />}
        <div><span className="loot-category">{items[id].category}</span><h3>{items[id].name}</h3><p>{items[id].text}</p>
          <small>{items[id].category === "relic" ? "Passive relic — its benefits apply automatically." : items[id].category === "potion" ? "Stored with potions. Use during your turn; consumed on use." : "Stored with items. Use during your turn; consumed on use."}</small></div>
      </article>;
    })}</div>
    <button className="primary" autoFocus onClick={onContinue}>{loot.final ? forest ? "Continue to the final exchange" : continuesToForest ? "Visit the border exchange →" : "Claim your victory" : "Continue your journey"}</button>
  </section></div>;
}
