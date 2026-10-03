import catalog from "./warlock-catalog.json";
export const implemented = [
  "firebolt",
  "ward-of-ash",
  "summon-imp",
  "blood-pact",
  "immolate",
  "summon-hellhound",
  "sinister-veil",
  "kindle",
  "smoldering-brand",
  "summon-pit-brute",
  "conflagrate",
  "feed-the-pit",
  "ashen-ward",
  "searing-lash",
  "hellish-command",
  "ritual-cut",
  "chain-of-flame",
  "dark-bargain",
  "fiendish-feast",
  "infernal-whip",
  "burning-hatred",
  "cinder-shield",
  "smoke-and-mirrors",
  "hellfire",
  "infernal-pact",
  "masters-of-the-pit",
  "burning-soul",
  "demonic-resilience",
  "sacrificial-rite",
  "corrupting-touch",
  "fire-and-brimstone",
  "ember-storm",
  "unholy-frenzy",
  "pyroclasm",
  "shadowflame-barrier",
  "void-gaze",
  "rend-flesh",
  "combust",
  "blood-price",
  "wreathed-in-flame",
  "dread-aura",
  "feast-of-embers",
  "abyssal-gaze",
  "infernal-transformation",
] as const;
export type CardId = (typeof implemented)[number];
export type Card = {
  id: CardId;
  name: string;
  cost: number;
  xCost: boolean;
  cinders: number;
  type: string;
  rarity: string;
  text: string;
};
export const cards = implemented.reduce(
  (result, id) => {
    const c = catalog.find((c) => c.id === id)!;
    result[id] = {
      ...c,
      id,
      cost: c.cost === "X" ? 0 : Number(c.cost.match(/^\d+/)?.[0] ?? 0),
      xCost: c.cost === "X",
      cinders: Number(c.cost.match(/\+(\d+)/)?.[1] || 0),
    };
    return result;
  },
  {} as Record<CardId, Card>,
);
export const starter: CardId[] = [
  "firebolt",
  "firebolt",
  "firebolt",
  "firebolt",
  "ward-of-ash",
  "ward-of-ash",
  "ward-of-ash",
  "ward-of-ash",
  "summon-imp",
  "blood-pact",
];
export type StarterDeckId = "classic" | "fire" | "warband" | "pact";
export const starterDecks: { id: Exclude<StarterDeckId, "classic">; name: string; description: string; cards: CardId[] }[] = [
  { id: "fire", name: "Hellfire Adept", description: "Build Scorch, spread the blaze, then detonate it.", cards: ["firebolt", "firebolt", "immolate", "smoldering-brand", "chain-of-flame", "combust", "ward-of-ash", "ashen-ward", "kindle", "blood-pact"] },
  { id: "warband", name: "Master of Demons", description: "Summon a warband, strengthen it and command extra attacks.", cards: ["summon-imp", "summon-imp", "summon-hellhound", "hellish-command", "infernal-whip", "firebolt", "sinister-veil", "ward-of-ash", "kindle", "feed-the-pit"] },
  { id: "pact", name: "Blood Covenant", description: "Trade health for power, protect yourself and ascend into Demon Form.", cards: ["firebolt", "ritual-cut", "blood-price", "blood-pact", "dark-bargain", "abyssal-gaze", "ward-of-ash", "ward-of-ash", "cinder-shield", "summon-imp"] },
];
export const rewardSets: CardId[][] = [
  ["summon-hellhound", "immolate", "kindle"],
  ["summon-pit-brute", "conflagrate", "ashen-ward"],
];
export const cardTargetsUnit = (id: CardId) => ["hellish-command", "fiendish-feast", "sacrificial-rite", "feast-of-embers"].includes(id);
export type ItemId = "healing-draught" | "mana-potion" | "barkskin-tonic" | "shrapnel-jar" | "banner-draught" | "bonesetters-salve" | "warhorn-oil" | "demon-lord-crown";
export const items: Record<ItemId, { name: string; text: string; category: "potion" | "item" | "relic"; passive?: boolean }> = {
  "healing-draught": { category: "potion", name: "Healing Draught", text: "Restore 20% of maximum HP." },
  "mana-potion": { category: "potion", name: "Mana Potion", text: "Gain 2 Mana." },
  "barkskin-tonic": { category: "potion", name: "Barkskin Tonic", text: "Gain 12 Guard." },
  "shrapnel-jar": { category: "item", name: "Shrapnel Jar", text: "Deal 10 damage to ALL enemies." },
  "banner-draught": { category: "potion", name: "Banner Draught", text: "You and all demons gain 8 Guard." },
  "bonesetters-salve": { category: "item", name: "Bonesetter's Salve", text: "Heal all demons 10 HP." },
  "warhorn-oil": { category: "item", name: "Warhorn Oil", text: "All demons gain +3 Power this combat." },
  "demon-lord-crown": { category: "relic", passive: true, name: "Crown of the Infernal Sovereign", text: "Victory trophy. At the start of combat, gain 5 Guard and 1 Mana. This relic is kept and is never consumed." },
};
export const cardAffinities: Record<Exclude<StarterDeckId, "classic">, readonly CardId[]> = {
  fire: ["firebolt", "immolate", "searing-lash", "conflagrate", "ashen-ward", "kindle", "chain-of-flame", "smoldering-brand", "hellfire", "fire-and-brimstone", "ember-storm", "pyroclasm", "combust", "wreathed-in-flame"],
  warband: ["summon-imp", "summon-hellhound", "summon-pit-brute", "hellish-command", "sinister-veil", "fiendish-feast", "infernal-whip", "masters-of-the-pit", "burning-soul", "demonic-resilience", "sacrificial-rite", "unholy-frenzy", "dread-aura", "feast-of-embers"],
  pact: ["blood-pact", "feed-the-pit", "ritual-cut", "dark-bargain", "burning-hatred", "cinder-shield", "infernal-pact", "corrupting-touch", "shadowflame-barrier", "void-gaze", "rend-flesh", "blood-price", "abyssal-gaze", "infernal-transformation"],
};
/** Weight4 favors the chosen approach while every implemented reward stays possible. */
export const rewardWeight = (deck: StarterDeckId, id: CardId) => deck !== "classic" && cardAffinities[deck].includes(id) ? 4 : 1;
export type Targeting = "hero" | "front" | "sweep" | "weakest" | "random_ally" | "ignore_defender";
export type Move = { name: string; damage: number; targeting: Targeting; kind?: "summon" | "shield"; guard?: number };
export type EnemyDefinition = { name: string; art: string; hp: number; moves: Move[]; boss?: "demon-lord" };
export type Encounter = { name: string; subtitle: string; background: string; enemies: EnemyDefinition[]; reserves?: EnemyDefinition[] };
const goblin = (name: string, art: string, hp: number, damage: number, targeting: Targeting = "front"): EnemyDefinition => ({
  name: `Fire Goblin ${name}`, art, hp, moves: [{ name: "Blazing strike", damage, targeting }, { name: "Ember assault", damage: damage + 2, targeting: "hero" }],
});
export const encounters: Encounter[] = [
  { name: "The Ashen Road", subtitle: "Cinderforge approach", background: "forge", enemies: [
    { name: "Fire Goblin Cleaver Bruiser", art: "goblin", hp: 23, moves: [{ name: "Cleaver", damage: 6, targeting: "hero" }, { name: "Wild swing", damage: 8, targeting: "front" }] },
    { name: "Fire Goblin Ashknife", art: "skirmisher", hp: 19, moves: [{ name: "Cut down", damage: 5, targeting: "front" }, { name: "Knife throw", damage: 7, targeting: "hero" }] },
  ] },
  { name: "Coalhorn Crossing", subtitle: "The burning herd's sentinel", background: "forge", enemies: [
    { name: "Coalhorn Ram", art: "coalhorn-ram", hp: 42, moves: [{ name: "Horn gouge", damage: 7, targeting: "front" }, { name: "Ember stomp", damage: 4, targeting: "sweep" }, { name: "Coalhorn charge", damage: 9, targeting: "hero" }] },
  ] },
  { name: "The Furnace Carapace", subtitle: "Guardian of the caldera gate", background: "arena", enemies: [
    { name: "Furnace Beetle", art: "furnace-beetle", hp: 80, moves: [{ name: "Carapace slam", damage: 9, targeting: "hero" }, { name: "Furnace pulse", damage: 5, targeting: "sweep" }, { name: "Crushing mandibles", damage: 13, targeting: "front" }] },
  ] },
  { name: "The Ember Watch", subtitle: "Two goblins wait in reserve", background: "forge", enemies: [goblin("Spear Guard", "spear-guard", 24, 4), goblin("Emberbow Hunter", "emberbow-hunter", 20, 3, "ignore_defender")], reserves: [goblin("Twinaxe Reaver", "twinaxe-reaver", 26, 5), goblin("Coalhex Shaman", "coalhex-shaman", 21, 3, "sweep")] },
  { name: "Cindermaw's Hollow", subtitle: "The furnace beast awakens", background: "arena", enemies: [
    { name: "Cindermaw Salamander", art: "cindermaw-salamander", hp: 76, moves: [{ name: "Molten bite", damage: 9, targeting: "front" }, { name: "Cinder breath", damage: 4, targeting: "sweep" }] }, goblin("Crossbow Scout", "crossbow-scout", 24, 4, "weakest"),
  ] },
  { name: "The Scarblade Garrison", subtitle: "Two goblins wait in reserve", background: "forge", enemies: [goblin("Scarblade Captain", "scarblade-captain", 36, 6), goblin("Forgehammer Sapper", "forgehammer-sapper", 27, 3, "sweep")], reserves: [goblin("Ashknife", "skirmisher", 26, 6, "ignore_defender"), goblin("Spear Guard", "spear-guard", 34, 7)] },
  { name: "Ash and Arrows", subtitle: "Fire goblin hunting party", background: "forge", enemies: [goblin("Emberbow Hunter", "emberbow-hunter", 25, 4, "ignore_defender"), goblin("Twinaxe Reaver", "twinaxe-reaver", 34, 6), goblin("Coalhex Shaman", "coalhex-shaman", 25, 3, "sweep")] },
  { name: "Heart of the Forge", subtitle: "Slagheart's last stand", background: "arena", enemies: [
    { name: "Slagheart Juggernaut", art: "slagheart-juggernaut", hp: 95, moves: [{ name: "Furnace fist", damage: 10, targeting: "front" }, { name: "Slag eruption", damage: 5, targeting: "sweep" }, { name: "Crucible crush", damage: 13, targeting: "hero" }] }, goblin("Scarblade Captain", "scarblade-captain", 30, 5),
  ] },
  { name: "The Infernal Throne", subtitle: "The crowned lord of the fire realm", background: "demon-throne", enemies: [
    { name: "Vhalzor, Infernal Sovereign", art: "demon-lord", boss: "demon-lord", hp: 150, moves: [
      { name: "Open Hellgate - summon 2 demons", damage: 0, targeting: "hero", kind: "summon" },
      { name: "Royal Hellfire", damage: 6, targeting: "sweep" },
      { name: "Crown Aegis · 12 Guard", damage: 0, targeting: "hero", kind: "shield", guard: 12 },
      { name: "Sovereign's Judgment", damage: 12, targeting: "front" },
    ] },
  ] },
];
