import type { Assets } from "./assets";
import type { CardId } from "../../../packages/content/index";

/** Saved Runeblade v1 runs retain their original printed rules as well as mechanics. */
export function cardArtwork(assets: Assets, id: CardId, runebladeRules: 1 | 2 = 2, summonRules = true) {
  if (!summonRules && assets.legacyWarlockCards?.[id]) return assets.legacyWarlockCards[id];
  return runebladeRules === 1 ? assets.legacyRunebladeCards?.[id] ?? assets.cards[id] : assets.cards[id];
}
