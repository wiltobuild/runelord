import { useEffect, useRef, type CSSProperties } from "react";
import { CinderUpkeep } from "./CinderUpkeep";
import { HudStatIcon } from "./HudTemplate";

export function ResourceMeters({ mana, cinders, upkeep }: { mana: number; cinders: number; upkeep: number }) {
  const crystal = useRef<HTMLDivElement>(null);
  const previousCinders = useRef(cinders);
  useEffect(() => {
    const increased = cinders > previousCinders.current;
    previousCinders.current = cinders;
    if (!increased || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const pulse = crystal.current?.animate([
      { filter: "brightness(1)", transform: "scale(1)" },
      { filter: "brightness(1.4) drop-shadow(0 0 8px #ff8f35)", transform: "scale(1.035)", offset: .35 },
      { filter: "brightness(1)", transform: "scale(1)" },
    ], { duration: 620, easing: "ease-out" });
    return () => pulse?.cancel();
  }, [cinders]);
  const charge = Math.min(4, Math.max(0, mana - 3));
  return <>
    <div className={`mana ${mana === 0 ? "depleted" : "charged"} ${charge ? "overcharged" : ""}`} style={{ "--mana-charge": charge } as CSSProperties} aria-label={`${mana} Mana${mana > 3 ? `, ${mana - 3} above your normal turn allowance` : ""}`}>
      <div className="mana-aura" aria-hidden="true" />
      <strong>{mana}</strong><span><small>{mana} / 3</small>MANA</span>
    </div>
    <div ref={crystal} className={`cinder-crystal ${cinders === 0 ? "depleted" : ""}`} aria-label={`${cinders} of 20 Cinders`}>
      <HudStatIcon kind="cinders" /><strong>{cinders}</strong><span>CINDERS</span>
      <CinderUpkeep cinders={cinders} upkeep={upkeep} />
    </div>
  </>;
}
