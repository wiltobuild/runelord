import { isMobileGame } from "./MobileShell";
import { useEffect, useState, type CSSProperties, type ReactNode } from "react";

// Native artwork coordinates. Scale the entire stage, never individual HUD parts.
export const HUD = {
  width: 1672, height: 941,
  items: [1293, 1348, 1403], potions: [1472, 1527, 1582],
  slotY: 79, slotSize: 40,
} as const;

export function useHudScale() {
  const measure = () => {
    const mobile = isMobileGame();
    const style = mobile ? getComputedStyle(document.getElementById("root")!) : null;
    const horizontal = style ? parseFloat(style.paddingLeft) + parseFloat(style.paddingRight) : 0;
    const vertical = style ? parseFloat(style.paddingTop) + parseFloat(style.paddingBottom) : 0;
    return Math.min(((mobile ? window.visualViewport?.width : undefined) ?? window.innerWidth) / HUD.width - horizontal / HUD.width,
      (((mobile ? window.visualViewport?.height : undefined) ?? window.innerHeight) - vertical) / HUD.height);
  };
  const [scale, setScale] = useState(measure);
  useEffect(() => {
    const resize = () => setScale(measure());
    window.addEventListener("resize", resize);
    window.visualViewport?.addEventListener("resize", resize);
    const frame = requestAnimationFrame(resize);
    return () => { window.removeEventListener("resize", resize); window.visualViewport?.removeEventListener("resize", resize); cancelAnimationFrame(frame); };
  }, []);
  return scale;
}

export function HudTemplate({hero = "warlock"}: {hero?: string}) {
  const source = `${import.meta.env.BASE_URL}ui/obsidian-template.png`;
  return <><img className="hud-template" src={source} alt="" draggable={false} aria-hidden="true" />
    {hero === "runeblade" && <><img className="hud-template hud-mana-preserved" src={source} alt="" draggable={false} aria-hidden="true" /><HudFrostAccents /></>}</>;
}

/** Small faceted frost deposits along existing stone edges, outside live content. */
function HudFrostAccents() {
  return <svg className="hud-frost-accents" viewBox="0 0 1672 941" aria-hidden="true" focusable="false">
    <g fill="#7cbbd5" stroke="#c6efff" strokeWidth="1" opacity=".78">
      <path d="M322 47 337 9 350 37 344 50Z M351 39 365 17 370 36 359 44Z" />
      <path d="M1247 43 1261 14 1267 38 1260 50Z M1274 57 1290 31 1295 54 1282 63Z" />
      <path d="M304 635 312 600 326 620 329 643Z M328 620 345 603 348 621 339 631Z" />
      <path d="M1320 627 1330 596 1340 618 1336 642Z M1352 660 1367 627 1374 653 1364 672Z" />
      <path d="M1391 705 1402 678 1410 697 1403 711Z M1647 829 1661 801 1664 838 1650 851Z" />
      <path d="M391 918 407 901 410 929 400 936Z M1191 921 1208 906 1217 933 1200 938Z" />
    </g>
    <g fill="#e4f8ff" opacity=".65">
      <path d="M337 9 339 37 322 47Z M365 17 364 36 351 39Z M1261 14 1258 39 1247 43Z M1290 31 1287 51 1274 57Z" />
      <path d="M312 600 315 624 304 635Z M345 603 338 620 328 620Z M1330 596 1330 622 1320 627Z M1367 627 1363 653 1352 660Z" />
      <path d="M1402 678 1402 700 1391 705Z M1661 801 1656 829 1647 829Z M407 901 404 920 391 918Z M1208 906 1205 925 1191 921Z" />
    </g>
    <g fill="none" stroke="#b7e7f7" strokeWidth="1.4" opacity=".48">
      <path d="m384 49 37-2 21 3 41-3 M1024 51l38-3 22 3 37-2 M353 628l44-3 19 2 33-2 M1198 627l41-3 20 2 39-2 M446 910l39 3 19-3 41 2 M1127 913l39-4 23 3 26-3" />
    </g>
  </svg>;
}

export function HudStatIcon({ kind }: { kind: "health" | "guard" | "cinders" | "corruption" | "gold" | "corpses" }) {
  return <span className="hud-stat-icon" aria-hidden="true"><svg viewBox="0 0 48 56" width="48" height="56">
    {kind === "health" && <><path fill="#bc2029" d="M24 12 13 3 3 10 2 23 24 53 46 23 45 10 35 3Z"/><path fill="#ff4a41" d="M24 12 13 3 3 10 12 27 24 53Z"/><path fill="#e43032" d="m24 12 11-9 10 7-9 17-12 26Z"/><path fill="#ff7660" d="m3 10 10-7 3 18-4 6Z"/></>}
    {kind === "guard" && <><path fill="#d5e5e6" d="M24 2 45 12 42 37 24 54 6 37 3 12Z"/><path fill="#47bbed" d="M24 2 24 54 6 37 3 12Z"/><path fill="#253d50" d="M24 9 38 16 36 33 24 46 12 33 10 16Z"/><path fill="#758b9b" d="m24 9 14 7-2 17-12 13Z"/></>}
    {kind === "cinders" && <><path fill="#dc3d2a" d="M25 1 33 23 39 15 47 35 40 48 24 55 8 48 1 34 12 17 15 27Z"/><path fill="#ff9433" d="m25 13 5 24 8-8 3 12-17 14-15-14 5-10 6 8Z"/><path fill="#ffe18b" d="m24 32 7 13-7 10-7-10Z"/></>}
    {kind === "gold" && <><ellipse cx="24" cy="30" rx="22" ry="23" fill="#80511c"/><ellipse cx="24" cy="26" rx="22" ry="23" fill="#f4c75b" stroke="#ffe5a0" strokeWidth="2"/><ellipse cx="24" cy="26" rx="16" ry="17" fill="#b87d25" stroke="#ffe49a"/><path d="m24 12 4 8 9 2-7 6 1 10-7-5-7 5 1-10-7-6 9-2Z" fill="#ffe19a"/></>}
    {kind === "corpses" && <><path d="M24 3 10 7 4 20 6 34 14 39 14 50 34 50 34 39 42 34 44 20 38 7Z" fill="#98cee2" stroke="#e0f6ff" strokeWidth="2"/><path d="M24 5 12 10 8 21 11 34 18 37 18 48 24 48Z" fill="#c5eaf6"/><path d="m10 23 10-2 1 10-8 2Zm28 0-10-2-1 10 8 2ZM24 30l-4 8h8Z" fill="#173f56"/><path d="M20 43v7m8-7v7" fill="none" stroke="#39718b" strokeWidth="2"/></>}
    {kind === "corruption" && <><path d="M5 2 17 15h14L43 2l-3 21 5 8-10 17-11 7-11-7L3 31l5-8Z" fill="#49265c" stroke="#cf8fee" strokeWidth="2"/><path d="m11 24 13-8 13 8-4 19-9 8-9-8Z" fill="#9958b4"/><path d="m12 28 10 4-4 5-6-4Zm24 0-10 4 4 5 6-4Z" fill="#fff0b6"/><path d="m24 31-4 9h8Zm-9 12 9 4 9-4-4 8H19Z" fill="#28152d"/></>}

  </svg></span>;
}

export function InventorySlot({ x, label, image, icon, disabled, empty, onClick }: {
  x: number; label: string; image?: string; icon?: ReactNode; disabled?: boolean; empty?: boolean; onClick?: () => void;
}) {
  return <button className={`inventory-slot ${empty ? "empty" : "occupied"}`}
    style={{ left: x, top: HUD.slotY, width: HUD.slotSize, height: HUD.slotSize } as CSSProperties}
    aria-label={label} title={label} disabled={disabled} onClick={onClick}>
    {image ? <img src={image} alt="" draggable={false} /> : icon ?? <span aria-hidden="true">◇</span>}
    <span className="slot-tooltip">{label}</span>
  </button>;
}
