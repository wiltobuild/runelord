import { useEffect, useState, type CSSProperties, type ReactNode } from "react";

// Native artwork coordinates. Scale the entire stage, never individual HUD parts.
export const HUD = {
  width: 1672, height: 941,
  items: [1293, 1348, 1403], potions: [1472, 1527, 1582],
  slotY: 79, slotSize: 40,
} as const;

export function useHudScale() {
  const measure = () => Math.min(window.innerWidth / HUD.width, window.innerHeight / HUD.height);
  const [scale, setScale] = useState(measure);
  useEffect(() => {
    const resize = () => setScale(measure());
    window.addEventListener("resize", resize);
    return () => window.removeEventListener("resize", resize);
  }, []);
  return scale;
}

export function HudTemplate() {
  return <img className="hud-template" src="/ui/obsidian-template.png" alt="" draggable={false} aria-hidden="true" />;
}

export function HudStatIcon({ kind }: { kind: "health" | "guard" | "cinders" | "corruption" | "gold" }) {
  return <span className="hud-stat-icon" aria-hidden="true"><svg viewBox="0 0 48 56" width="48" height="56">
    {kind === "health" && <><path fill="#bc2029" d="M24 12 13 3 3 10 2 23 24 53 46 23 45 10 35 3Z"/><path fill="#ff4a41" d="M24 12 13 3 3 10 12 27 24 53Z"/><path fill="#e43032" d="m24 12 11-9 10 7-9 17-12 26Z"/><path fill="#ff7660" d="m3 10 10-7 3 18-4 6Z"/></>}
    {kind === "guard" && <><path fill="#d5e5e6" d="M24 2 45 12 42 37 24 54 6 37 3 12Z"/><path fill="#47bbed" d="M24 2 24 54 6 37 3 12Z"/><path fill="#253d50" d="M24 9 38 16 36 33 24 46 12 33 10 16Z"/><path fill="#758b9b" d="m24 9 14 7-2 17-12 13Z"/></>}
    {kind === "cinders" && <><path fill="#dc3d2a" d="M25 1 33 23 39 15 47 35 40 48 24 55 8 48 1 34 12 17 15 27Z"/><path fill="#ff9433" d="m25 13 5 24 8-8 3 12-17 14-15-14 5-10 6 8Z"/><path fill="#ffe18b" d="m24 32 7 13-7 10-7-10Z"/></>}
    {kind === "gold" && <><ellipse cx="24" cy="30" rx="22" ry="23" fill="#80511c"/><ellipse cx="24" cy="26" rx="22" ry="23" fill="#f4c75b" stroke="#ffe5a0" strokeWidth="2"/><ellipse cx="24" cy="26" rx="16" ry="17" fill="#b87d25" stroke="#ffe49a"/><path d="m24 12 4 8 9 2-7 6 1 10-7-5-7 5 1-10-7-6 9-2Z" fill="#ffe19a"/></>}
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
