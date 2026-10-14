import { items, type ItemId } from "../../../packages/content/index";
import type { Assets } from "./assets";
import { HudStatIcon } from "./HudTemplate";
import { LootIcon } from "./LootIcon";
import { realmNames } from "./realmPresentation";

export function LootReveal({ loot, assets, onContinue, realm, nextRealm, exchangeBeforeContinue=false, training=false }: { loot: { gold: number; items: ItemId[]; final: boolean }; assets: Assets; onContinue: () => void; realm?: "infernal" | "forest" | "frozen-wastes"; nextRealm?: "infernal" | "forest" | "frozen-wastes"; exchangeBeforeContinue?: boolean; training?: boolean }) {
  const forest = realm === "forest";
  const frozen = realm === "frozen-wastes";

  return <div className="overlay loot-overlay"><section className="reward-panel loot-panel" role="dialog" aria-modal="true" aria-label={loot.final ? frozen ? "Frozen Sovereign spoils" : forest ? "Forest Sovereign spoils" : "The Demon Lord's crown" : "Encounter loot"}>
    <div className="eyebrow">{training ? "A LESSON FOR THE WARBAND" : loot.final ? frozen ? "THE LONG WINTER BREAKS" : forest ? "THE LIVING ORCHARD FALLS SILENT" : "THE INFERNAL SOVEREIGN FALLS" : "SPOILS OF THE ENCOUNTER"}</div>
    <h2>{training ? "A new order, learned." : loot.final ? frozen ? "The Frozen Wastes are yours." : forest ? "The heart of the forest is yours." : "The crown is yours." : "Your spoils, revealed."}</h2>
    <p>{training ? "Every matching summon can use its new order for the rest of this run. Select a summon in battle to choose its action." : !loot.final ? "These rewards have been added to your collection." : nextRealm ? `${exchangeBeforeContinue ? "Visit the exchange, then enter" : "Enter"} ${realmNames[nextRealm]} with your cards, upgrades, relics, gold and supplies.` : exchangeBeforeContinue ? "Claim your spoils, then visit the final exchange to complete your journey." : "The Sovereign is defeated. Claim your victory."}</p>
    {loot.gold > 0 && <div className="loot-gold"><HudStatIcon kind="gold" /><span><strong>+{loot.gold}</strong> Gold</span></div>}
    <div className="loot-reveal-items">{loot.items.map((id, index) => {
      const crown = String(id) === "demon-lord-crown";
      const src = assets.images[crown ? "item-demon-crown" : `item-${id}`];
      return <article key={`${id}-${index}`} className={crown ? "crown-reveal" : ""}>
        {src ? <img src={src} alt="" /> : <LootIcon item={id} />}
        <div><span className="loot-category">{items[id].category}</span><h3>{items[id].name}</h3><p>{items[id].text}</p>
          <small>{items[id].category === "relic" ? "Passive relic — its benefits apply automatically." : items[id].category === "potion" ? "Stored with potions. Use during your turn; consumed on use." : "Stored with items. Use during your turn; consumed on use."}</small></div>
      </article>;
    })}</div>
    <button className="primary" autoFocus onClick={onContinue}>{!loot.final ? "Continue your journey" : exchangeBeforeContinue ? nextRealm ? "Visit the border exchange →" : "Continue to the final exchange" : nextRealm ? `Enter ${realmNames[nextRealm]} →` : "Claim your victory"}</button>
  </section></div>;
}
