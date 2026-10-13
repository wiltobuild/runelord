import { useEffect, useRef, type CSSProperties } from "react";
import { CinderUpkeep } from "./CinderUpkeep";
import { HudStatIcon } from "./HudTemplate";

export function ResourceMeters({ mana, cinders, upkeep, hero = "warlock", corpses = 0, runebladeRules = 2 }: { mana: number; cinders: number; upkeep: number; hero?: string; corpses?: number; runebladeRules?: 1 | 2 }) {
  const crystal = useRef<HTMLDivElement>(null);
  const resource = hero === "runeblade" ? corpses : cinders;
  const previousCinders = useRef(resource);
  useEffect(() => {
    const increased = resource > previousCinders.current;
    previousCinders.current = resource;
    if (!increased || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const pulse = crystal.current?.animate([
      { filter: "brightness(1)", transform: "scale(1)" },
      { filter: "brightness(1.4) drop-shadow(0 0 8px #ff8f35)", transform: "scale(1.035)", offset: .35 },
      { filter: "brightness(1)", transform: "scale(1)" },
    ], { duration: 620, easing: "ease-out" });
    return () => pulse?.cancel();
  }, [resource]);
  const charge = Math.min(4, Math.max(0, mana - 3));
  return <>
    <div className={`mana ${mana === 0 ? "depleted" : "charged"} ${charge ? "overcharged" : ""}`} style={{ "--mana-charge": charge } as CSSProperties} aria-label={`${mana} Mana${mana > 3 ? `, ${mana - 3} above your normal turn allowance` : ""}`}>
      <div className="mana-aura" aria-hidden="true" />
      <strong>{mana}</strong><span><small>{mana} / 3</small>MANA</span>
    </div>
    <div ref={crystal} className={`cinder-crystal ${hero === "runeblade" ? "corpse-crystal" : ""} ${resource === 0 ? "depleted" : ""}`} aria-label={hero === "runeblade" ? `${corpses} Corpses. Summons automatically spend Corpses instead of Mana when enough are available.` : `${cinders} of 20 Cinders`} title={hero === "runeblade" ? `Every friendly or enemy death grants 1 Corpse.${runebladeRules === 2 ? " Victory converts each surviving summon into 1 Corpse." : ""} Summons spend Corpses equal to their Mana cost when you have enough; otherwise they spend Mana.` : undefined}>
      {hero === "runeblade" ? <span className="corpse-glyph" aria-hidden="true">☠</span> : <HudStatIcon kind="cinders" />}<strong>{resource}</strong><span>{hero === "runeblade" ? "CORPSES" : "CINDERS"}</span>
      {hero !== "runeblade" && <CinderUpkeep cinders={cinders} upkeep={upkeep} />}
    </div>
  </>;
}
