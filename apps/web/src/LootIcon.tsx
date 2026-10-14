import type { ItemId } from "../../../packages/content/index";
import { expansionRelics } from "../../../packages/engine/expansionCatalog";

/** Readable silhouettes for consumable loot, independent of card/character artwork. */
export function LootIcon({ item }: { item: ItemId }) {
  if(item in expansionRelics){
    const relic=expansionRelics[item as keyof typeof expansionRelics];
    const frost=['chill','corpses'].includes(relic.effect),green=['healHero','unitHp'].includes(relic.effect),color=frost?'#91e3ed':green?'#9acd91':'#eac780';
    const glyph=({heroGuard:'◇',healHero:'✚',draw:'ᚱ',cinders:'ᚲ',corpses:'ᛟ',unitPower:'ᛏ',unitHp:'✚',gold:'◈',discount:'ᚠ',chill:'❄',scorch:'ᛉ'} as const)[relic.effect];
    return <svg className="loot-icon relic-medallion" viewBox="0 0 64 64" aria-hidden="true"><path d="M32 3 51 12 61 32 51 52 32 61 12 52 3 32 12 12Z" fill="#101d29" stroke={color} strokeWidth="2"/><path d="M32 10 47 18 54 32 46 47 32 54 18 47 10 32 18 18Z" fill={frost?'#243e50':green?'#2b3b30':'#493d2b'} stroke="#aa9572"/><path d="m32 3 0 7M3 32h7M54 32h7M32 54v7" stroke={color} strokeWidth="3"/><text x="32" y="42" textAnchor="middle" fill={color} fontFamily="Georgia,serif" fontSize="30">{glyph}</text></svg>;
  }
  const color = item === "mana-potion" ? "#68d7ff" : item === "healing-draught" ? "#ef6765" : item === "barkskin-tonic" ? "#c69b66" : item === "bonesetters-salve" ? "#a6d58b" : "#efc675";
  return <svg className="loot-icon" viewBox="0 0 48 48" aria-hidden="true">
    {item === "shrapnel-jar" ? <><path d="M18 5h12v8l9 7-3 23H12L9 20l9-7Z" fill="#665267" stroke="#dec6a0" strokeWidth="2"/><path d="m16 26 7-7 2 12 8-6-4 13H18Z" fill="#ffd98e"/></>
    : item === "warhorn-oil" ? <><path d="M7 13c4 17 14 22 31 18l5-15c-14 10-21 5-26-9Z" fill="#deb578" stroke="#fff0c6" strokeWidth="2"/><path d="m12 10 9 22m13-12-3 14" stroke="#6f492c" strokeWidth="4"/></>
    : item === "banner-draught" ? <><path d="M10 5v38" stroke="#e7c28c" strokeWidth="4"/><path d="M13 7h27l-7 10 7 12H13Z" fill="#9b4149" stroke="#efc87f" strokeWidth="2"/><path d="m24 11 3 6 6 1-5 4 1 5-5-3-5 3 1-5-5-4 6-1Z" fill="#ffdf9a"/></>
    : <><path d="M18 4h12v13l9 9v12l-6 6H15l-6-6V26l9-9Z" fill="#2d2633" stroke="#dfc3a0" strokeWidth="2"/><path d="M12 29h24v8l-5 4H17l-5-4Z" fill={color}/><path d="M16 5h16v6H16Z" fill="#a88355"/><path d="M17 22v10" stroke="#fff4d5" strokeWidth="2" opacity=".7"/>{item === "healing-draught" && <path d="M21 28h6v4h4v6h-4v4h-6v-4h-4v-6h4Z" fill="#ffecc9"/>}</>}
  </svg>;
}
