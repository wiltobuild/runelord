import {
  cards,
  implemented, starterDecks, cardTargetsUnit, items, rewardWeight,
  type StarterDeckId, type ItemId,
  starter,
  encounters,
  rewardSets,
  type CardId,
  type Move,
  type Targeting,
} from "../content/index";
export type DemonKind = "imp" | "hellhound" | "pit-brute";
export type Unit = {
  id: number;
  kind: DemonKind;
  name: string;
  hp: number;
  maxHp: number;
  guard: number;
  power: number;
  upkeep: number;
  defender: boolean;
  temporaryPower?: number;
};
export type Enemy = {
  id: number;
  name: string;
  art: string;
  hp: number;
  maxHp: number;
  guard: number;
  scorch: number;
  moves: Move[];
  boss?: "demon-lord";
  bossPhase?: 1 | 2;
  summonsMade?: number;
  summonedBy?: number;
  sapped?: number;
  exposed?: number;
};
export type CardInstance = { uid: number; id: CardId; upgraded?: boolean };
export type GameEvent = {
  type: string;
  message: string;
  actor?: number;
  target?: number;
  amount?: number;
  cause?: "scorch";
  targets?: (number | "hero")[];
  unit?: Unit;
  view?: CombatView;
};
export type CombatView = Pick<
  State,
  | "hp"
  | "guard"
  | "mana"
  | "cinders"
  | "corruption"
  | "demonTurns"
  | "units"
  | "enemies"
  | "hand"
  | "draw"
  | "discard"
>;
export type PendingLoot = { gold: number; items: ItemId[]; final: boolean };
export type State = {
  version: 1;
  rulesVersion: 2 | 3;
  legacyActions: number | null;
  pendingLoot: PendingLoot | null;
  relics: ItemId[];
  starterDeck: StarterDeckId;
  gold: number;
  inventory: ItemId[];
  reserves: Enemy[];
  powers: Partial<Record<CardId, number>>;
  barrier: number;
  seed: number;
  rng: number;
  room: number;
  phase: "combat" | "reward" | "loot" | "camp" | "won" | "lost";
  turn: number;
  hp: number;
  maxHp: number;
  guard: number;
  mana: number;
  cinders: number;
  corruption: number;
  demonTurns: number;
  spent: boolean;
  deck: CardId[];
  draw: CardInstance[];
  hand: CardInstance[];
  discard: CardInstance[];
  units: Unit[];
  enemies: Enemy[];
  focus: number;
  nextId: number;
  events: GameEvent[];
  history: Action[];
  rewards: CardId[];
  potion: boolean;
};
export type Action =
  | { type: "play"; uid: number; target?: number; dismiss?: number; unit?: number }
  | { type: "item"; item: ItemId }
  | { type: "end" }
  | { type: "focus"; target: number }
  | { type: "reward"; card: CardId | null }
  | { type: "continue" }
  | { type: "camp" }
  | { type: "potion" };
const emit = (
  s: State,
  type: string,
  message: string,
  extra: Partial<GameEvent> = {},
) =>
  s.events.push({
    type,
    message,
    ...extra,
    view: structuredClone({
      hp: s.hp,
      guard: s.guard,
      mana: s.mana,
      cinders: s.cinders,
      corruption: s.corruption,
      demonTurns: s.demonTurns,
      units: s.units,
      enemies: s.enemies,
      hand: s.hand,
      draw: s.draw,
      discard: s.discard,
    }),
  });
const alive = (s: State) => s.enemies.filter((e) => e.hp > 0);
function random(s: State) {
  s.rng = (Math.imul(s.rng, 1664525) + 1013904223) >>> 0;
  return s.rng / 4294967296;
}
function shuffle<T>(s: State, a: T[]) {
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(random(s) * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}
function draw(s: State, n: number) {
  for (let i = 0; i < n; i++) {
    if (!s.draw.length) s.draw = shuffle(s, s.discard.splice(0));
    const c = s.draw.pop();
    if (c) s.hand.push(c);
  }
}
function cinders(s: State, n: number) {
  s.cinders = Math.min(20, s.cinders + n);
}
function loseHp(s: State, n: number, playerTurn: boolean) {
  if (n <= 0 || s.hp <= 0) return;
  const amount = Math.min(n, s.hp);
  s.hp -= amount;
  if (playerTurn) cinders(s, 1);
  emit(s, "hurt", `Warlock loses ${amount} HP.`, { amount });
  if (s.hp === 0) {
    s.phase = "lost";
    emit(s, "defeat", "The Pit claims its price.");
  } else if (playerTurn && s.powers["infernal-pact"]) {
    for (const e of alive(s)) hitEnemy(s, e, s.powers["infernal-pact"]!);
  }
}
function hitEnemy(s: State, e: Enemy, n: number, attack = false, cause?: GameEvent["cause"]) {
  if (attack && e.exposed) n = Math.floor(n * 1.5);
  if (e.hp <= 0) return;
  const blocked = Math.min(e.guard, n);
  e.guard -= blocked;
  const amount = Math.min(e.hp, n - blocked);
  e.hp -= amount;
  emit(s, "damage", `${e.name} takes ${amount} damage.`, {
    target: e.id,
    amount,
    ...(cause ? { cause } : {}),
  });
  if (e.boss && e.hp > 0 && e.hp <= e.maxHp / 2 && e.bossPhase !== 2) {
    e.bossPhase = 2;
    e.guard += 8;
    emit(s, "boss-phase", "The crown erupts: Vhalzor gains 8 Guard and his damaging spells gain +2 damage.", { actor: e.id });
  }
  if (e.hp === 0) {
    cinders(s, Math.floor(e.scorch / 2));
    emit(s, "kill", `${e.name} falls.`, { target: e.id });
  }
}
function scorch(s: State, e: Enemy, n: number) {
  if (e.hp > 0) {
    e.scorch += n;
    emit(s, "scorch", `${e.name} gains ${n} Scorch.`, {
      target: e.id,
      amount: n,
    });
  }
}
/** Seeded weighted draw without replacement; no card is guaranteed or excluded by affinity. */
export function rollRewards(s: State): CardId[] {
  const pool = [...implemented].filter(id => cards[id].rarity !== "Basic");
  const result: CardId[] = [];
  while (result.length < 3 && pool.length) {
    let ticket = random(s) * pool.reduce((total, id) => total + rewardWeight(s.starterDeck, id), 0);
    let index = pool.length - 1;
    for (let i = 0; i < pool.length; i++) { ticket -= rewardWeight(s.starterDeck, pool[i]); if (ticket < 0) { index = i; break; } }
    result.push(pool.splice(index, 1)[0]);
  }
  return result;
}
function checkWin(s: State) {
  const fallenLord = s.enemies.find(e => e.boss && e.hp <= 0);
  if (s.phase === "combat" && fallenLord) for (const add of alive(s).filter(e => e.summonedBy === fallenLord.id)) {
    add.hp = 0;
    emit(s, "kill", `${add.name} vanishes as its master's bond breaks.`, { target: add.id });
  }
  if (s.phase === "combat") for (let i = 0; i < s.enemies.length && s.reserves.length; i++) {
    const fallen = s.enemies[i];
    if (fallen.hp > 0) continue;
    const replacement = s.reserves.shift()!;
    s.enemies[i] = replacement;
    if (s.focus === fallen.id) s.focus = replacement.id;
    emit(s, "reserve", `${replacement.name} steps out of reserve.`, { target: fallen.id, actor: replacement.id });
  }
  if (s.phase === "combat" && !alive(s).length) {
    const final = s.room === (s.rulesVersion === 2 ? 7 : encounters.length - 1);
    s.phase = final ? (s.rulesVersion === 2 ? "won" : "loot") : "reward";
    const gold = 25 + s.room * 10;
    s.gold += gold;
    const drops: ItemId[] = ["mana-potion", "barkskin-tonic", "shrapnel-jar", "banner-draught", "bonesetters-salve", "warhorn-oil", "healing-draught", "healing-draught", "demon-lord-crown"];
    const item = drops[s.room];
    if (items[item].passive) { if (!s.relics.includes(item)) s.relics.push(item); }
    else s.inventory.push(item);
    s.pendingLoot = s.rulesVersion === 3 ? { gold, items: [item], final } : null;
    emit(s, "loot", `Found ${gold} Gold and ${items[item].name}.`);
    s.rewards = final ? [] : s.rulesVersion === 3 ? rollRewards(s) : s.starterDeck === "classic" && s.room < 2 ? [...rewardSets[s.room]] : shuffle(s, [...implemented].filter(id => cards[id].rarity !== "Basic")).slice(0, 3);
    emit(s, "victory", final ? "The Infernal Sovereign falls. Claim his crown." : "The path is yours. Choose a card.");
  }
}
function killUnit(s: State, u: Unit) {
  s.units = s.units.filter((v) => v.id !== u.id);
  s.corruption = Math.min(10, s.corruption + 2);
  const resilience = s.powers["demonic-resilience"] || 0;
  if (resilience) { s.guard += resilience; cinders(s, 2); }
  emit(s, "unit-death", `${u.name} falls. Gain 2 Corruption.`, {
    actor: u.id,
    unit: structuredClone(u),
  });
}
function unitAct(s: State, u: Unit) {
  const e = alive(s).find((e) => e.id === s.focus) || alive(s)[0];
  if (!e) return;
  const pack =
    u.kind === "hellhound"
      ? 2 *
        s.units.filter((v) => v.kind === "hellhound" && v.id !== u.id).length
      : 0;
  const damage = u.power + pack + (s.demonTurns > 0 ? 2 : 0);
  emit(s, "muster", `${u.name} attacks ${e.name}.`, {
    actor: u.id,
    target: e.id,
  });
  hitEnemy(s, e, damage, true);
  if (s.powers["dread-aura"]) scorch(s, e, s.powers["dread-aura"]!);
  if (u.kind === "imp") scorch(s, e, 1);
}
function summon(s: State, kind: DemonKind, dismiss?: number, upgraded = false) {
  if (s.units.length >= 5) {
    const unit = s.units.find((u) => u.id === dismiss);
    if (!unit) throw Error("Choose a demon to dismiss: your Warband is full.");
    killUnit(s, unit);
  }
  const stats = {
    imp: { name: "Imp", hp: 6, power: 4, upkeep: 0, defender: false },
    hellhound: {
      name: "Hellhound",
      hp: 14,
      power: 6,
      upkeep: 1,
      defender: false,
    },
    "pit-brute": {
      name: "Pit Brute",
      hp: 26,
      power: 10,
      upkeep: 2,
      defender: true,
    },
  }[kind];
  const u: Unit = { ...stats, maxHp: stats.hp, kind, id: s.nextId++, guard: 0 };
  if (upgraded && kind === "imp") u.power += 2;
  u.power += s.powers["masters-of-the-pit"] || 0;
  u.upkeep = Math.max(0, u.upkeep - (s.powers["burning-soul"] || 0));
  s.units.push(u);
  emit(s, "summon", `${u.name} joins the Warband.`, { actor: u.id });
  if (kind === "imp") unitAct(s, u);
}
function summonBossDemons(s: State, boss: Enemy) {
  const free = 2 - alive(s).filter(e => e.summonedBy === boss.id).length;
  const count = Math.min(free, 4 - (boss.summonsMade || 0));
  for (let i = 0; i < count; i++) {
    const hound = (boss.summonsMade || 0) % 2 === 1;
    const hp = hound ? 20 : 12;
    const add: Enemy = { id: s.nextId++, name: hound ? "Royal Hellhound" : "Crownfire Imp", art: hound ? "boss-hellhound" : "boss-imp", hp, maxHp: hp, guard: 0, scorch: 0, summonedBy: boss.id, moves: [{ name: hound ? "Infernal jaws" : "Imp firebolt", damage: hound ? 5 : 3, targeting: hound ? "front" : "hero" }] };
    const deadSlot = s.enemies.findIndex(e => e.summonedBy === boss.id && e.hp <= 0);
    if (deadSlot < 0) s.enemies.push(add); else s.enemies[deadSlot] = add;
    boss.summonsMade = (boss.summonsMade || 0) + 1;
    emit(s, "enemy-summon", `${boss.name} summons ${add.name}.`, { actor: add.id, target: boss.id });
  }
}
export function intent(s: State, e: Enemy) {
  let move = e.moves[(s.turn - 1) % e.moves.length];
  if (move.kind === "summon" && ((e.summonsMade || 0) >= 4 || alive(s).filter(add => add.summonedBy === e.id).length >= 2)) move = { name: "Crownfire Bolt", damage: 8, targeting: "front" };
  if (e.bossPhase === 2 && move.damage > 0) move = { ...move, name: `Enraged ${move.name}`, damage: move.damage + 2 };
  return e.sapped ? { ...move, damage: Math.floor(move.damage * .75) } : move;
}
export function resolveTargets(
  s: State,
  targeting: Targeting,
): (Unit | "hero")[] {
  const front = [...s.units].reverse();
  if (targeting === "sweep") return ["hero", ...front];
  if (targeting === "front") return [front[0] || "hero"];
  if (targeting === "hero") return [front.find((u) => u.defender) || "hero"];
  if (targeting === "weakest")
    return [[...front].sort((a, b) => a.hp - b.hp)[0] || "hero"];
  if (targeting === "random_ally")
    return [
      ["hero" as const, ...front][Math.floor(random(s) * (front.length + 1))],
    ];
  return ["hero"];
}
function startTurn(s: State) {
  s.turn++;
  s.guard = 0;
  s.barrier = 0;
  s.mana = 3;
  s.focus = alive(s)[0]?.id ?? 0;
  for (const u of s.units) { u.guard = 0; u.power -= u.temporaryPower || 0; u.temporaryPower = 0; }
  if (s.corruption >= 10 && s.demonTurns === 0) {
    s.demonTurns = 3;
    emit(
      s,
      "ascend",
      "Demon Form: +3 attack damage; attacks apply 2 Scorch; demons gain +2 Power.",
    );
  }
  for (const u of [...s.units].reverse()) {
    const paid = Math.min(s.cinders, u.upkeep);
    s.cinders -= paid;
    if (paid) emit(s, "upkeep", `${u.name} spends ${paid} Cinder.`);
    if (paid < u.upkeep) loseHp(s, u.upkeep - paid, true);
    if (s.phase === "lost") return;
    checkWin(s);
    if (s.phase !== "combat") return;
  }
  if (s.powers.pyroclasm) for (const e of alive(s)) scorch(s, e, s.powers.pyroclasm);
  draw(s, s.spent ? 4 : 5);
  s.spent = false;
  emit(s, "turn", `Turn ${s.turn}. Your move.`);
}
function beginCombat(s: State) {
  s.phase = "combat";
  s.turn = 0;
  s.guard = 0;
  s.cinders = 3;
  s.corruption = 0;
  s.demonTurns = 0;
  s.spent = false;
  s.powers = {};
  s.barrier = 0;
  s.units = [];
  s.hand = [];
  s.discard = [];
  s.enemies = encounters[s.room].enemies.map((e) => ({
    ...structuredClone(e),
    ...(e.boss ? { bossPhase: 1 as const, summonsMade: 0 } : {}),
    id: s.nextId++,
    maxHp: e.hp,
    guard: 0,
    scorch: 0,
  }));
  s.reserves = (encounters[s.room].reserves || []).map(e => ({ ...structuredClone(e), id: s.nextId++, maxHp: e.hp, guard: 0, scorch: 0 }));
  s.draw = shuffle(
    s,
    s.deck.map((id) => ({ id, uid: s.nextId++ })),
  );
  startTurn(s);
  if (s.relics.includes("demon-lord-crown")) { s.guard += 5; s.mana += 1; }
}
export function newRun(seed = 7319, starterDeck: StarterDeckId = "classic", rulesVersion: 2 | 3 = 3): State {
  if (starterDeck !== "classic" && !starterDecks.some(d => d.id === starterDeck)) throw Error("Unknown starter deck.");
  const s: State = {
    version: 1,
    rulesVersion, legacyActions: null, pendingLoot: null, relics: [],
    starterDeck, gold: 0, inventory: [], reserves: [], powers: {}, barrier: 0,
    seed: seed >>> 0,
    rng: seed >>> 0,
    room: 0,
    phase: "combat",
    turn: 0,
    hp: 72,
    maxHp: 72,
    guard: 0,
    mana: 3,
    cinders: 3,
    corruption: 0,
    demonTurns: 0,
    spent: false,
    deck: [...(starterDecks.find(d => d.id === starterDeck)?.cards || starter)],
    draw: [],
    hand: [],
    discard: [],
    units: [],
    enemies: [],
    focus: 0,
    nextId: 1,
    events: [],
    history: [],
    rewards: [],
    potion: true,
  };
  beginCombat(s);
  return s;
}
export function manaCost(s: State, c: CardInstance) {
  if (cards[c.id].xCost) return s.mana;
  if (c.id === "rend-flesh" && s.demonTurns > 0) return 0;
  if (c.id === "infernal-transformation" && c.upgraded) return 1;
  return cards[c.id].cost;
}
export function playable(s: State, c: CardInstance) {
  return (
    s.phase === "combat" &&
    s.mana >= manaCost(s, c) &&
    (!cardTargetsUnit(c.id) || s.units.length > 0) &&
    s.cinders >= cards[c.id].cinders
  );
}
export function dispatch(previous: State, action: Action): State {
  const s = structuredClone(previous);
  s.events = [];
  if (action.type === "focus") {
    if (s.phase !== "combat" || !alive(s).some((e) => e.id === action.target))
      throw Error("Choose a living enemy.");
    s.focus = action.target;
  } else if (action.type === "item") {
    if (items[action.item]?.passive) throw Error("Relics are passive and cannot be consumed.");
    const at = s.inventory.indexOf(action.item);
    if (s.phase !== "combat" || at < 0) throw Error("No such item available.");
    s.inventory.splice(at, 1);
    switch(action.item) {
      case "healing-draught": s.hp = Math.min(s.maxHp, s.hp + Math.floor(s.maxHp * .2)); break;
      case "mana-potion": s.mana += 2; break;
      case "barkskin-tonic": s.guard += 12; break;
      case "shrapnel-jar": for (const e of alive(s)) hitEnemy(s, e, 10); break;
      case "banner-draught": s.guard += 8; for(const u of s.units) u.guard += 8; break;
      case "bonesetters-salve": for(const u of s.units) u.hp = Math.min(u.maxHp, u.hp + 10); break;
      case "warhorn-oil": for(const u of s.units) u.power += 3; break;
    }
    emit(s, "item", `${items[action.item].name} used.`);
    checkWin(s);
  } else if (action.type === "potion") {
    if (s.phase !== "combat" || !s.potion) throw Error("No potion available.");
    const heal = Math.floor(s.maxHp * 0.2);
    s.hp = Math.min(s.maxHp, s.hp + heal);
    s.potion = false;
    emit(s, "heal", `Healing Draught restores up to ${heal} HP.`);
  } else if (action.type === "reward") {
    if (
      s.phase !== "reward" ||
      (action.card !== null && !s.rewards.includes(action.card))
    )
      throw Error("Invalid reward.");
    if (action.card) s.deck.push(action.card);
    s.rewards = [];
    if (s.rulesVersion === 3) s.phase = "loot";
    else if (s.room === 1 || s.room === 3 || s.room === 5) s.phase = "camp";
    else {
      s.room++;
      beginCombat(s);
    }
  } else if (action.type === "continue") {
    if (s.phase !== "loot" || !s.pendingLoot) throw Error("There is no loot to acknowledge.");
    const final = s.pendingLoot.final;
    s.pendingLoot = null;
    if (final) s.phase = "won";
    else if ([1, 3, 5, 7].includes(s.room)) s.phase = "camp";
    else { s.room++; beginCombat(s); }
  } else if (action.type === "camp") {
    if (s.phase !== "camp") throw Error("No rest site here.");
    s.hp = Math.min(s.maxHp, s.hp + Math.floor(s.maxHp * (s.room === 1 ? 0.3 : 0.5)));
    s.room++;
    beginCombat(s);
  } else if (action.type === "play") {
    const c = s.hand.find((c) => c.uid === action.uid);
    if (!c || !playable(s, c)) throw Error("You cannot play that card.");
    const livingEnemies = alive(s);
    // Untargeted cards must remain playable after the focused enemy dies.
    // An explicitly selected target still needs to be alive.
    const e = action.target === undefined
      ? livingEnemies.find((enemy) => enemy.id === s.focus) ?? livingEnemies[0]
      : livingEnemies.find((enemy) => enemy.id === action.target);
    if (!e) throw Error("Choose a living target.");
    if (
      c.id.startsWith("summon-") &&
      s.units.length >= 5 &&
      !s.units.some((u) => u.id === action.dismiss)
    )
      throw Error("Choose a demon to dismiss: your Warband is full.");
    const unit = action.unit === undefined ? s.units.at(-1) : s.units.find(u => u.id === action.unit);
    if (cardTargetsUnit(c.id) && !unit) throw Error("Choose a living demon.");
    const x = s.mana;
    const upgraded = !!c.upgraded;
    const value = (base: number, improved: number) => upgraded ? improved : base;
    const corruption = (n: number) => { s.corruption = Math.min(10, s.corruption + n); };
    const pact = (n: number) => { loseHp(s, n, true); if(s.phase !== "lost") corruption(n); return s.phase !== "lost"; };
    s.mana -= manaCost(s, c);
    s.cinders -= cards[c.id].cinders;
    s.hand = s.hand.filter((x) => x.uid !== c.uid);
    if (cards[c.id].type !== "Power" && c.id !== "infernal-transformation") s.discard.push(c);
    s.focus = e.id;
    emit(s, "card", cards[c.id].name, { target: e.id });
    const damage = (amount: number, target = e) => {
      hitEnemy(s, target, amount + (s.demonTurns > 0 ? 3 : 0), true);
      if (s.demonTurns > 0) scorch(s, target, 2);
    };
    switch (c.id) {
      case "firebolt":
        damage(value(6, 9));
        break;
      case "ward-of-ash":
        s.guard += value(5, 8);
        break;
      case "summon-imp":
        summon(s, "imp", action.dismiss, upgraded);
        break;
      case "blood-pact":
        loseHp(s, 3, true);
        if (s.phase !== "lost") {
          s.corruption = Math.min(10, s.corruption + 3);
          s.mana++;
          cinders(s, value(2, 3));
        }
        break;
      case "feed-the-pit":
        loseHp(s, 2, true);
        if (s.phase !== "lost") {
          s.corruption = Math.min(10, s.corruption + 2);
          cinders(s, value(3, 5));
        }
        break;
      case "immolate":
        damage(value(4, 5));
        scorch(s, e, value(4, 6));
        break;
      case "smoldering-brand":
        damage(value(3, 4));
        scorch(s, e, value(3, 5));
        break;
      case "searing-lash": {
        const burning = e.scorch > 0;
        damage(value(9, 12));
        if (burning) cinders(s, 1);
        break;
      }
      case "summon-hellhound":
        summon(s, "hellhound", action.dismiss);
        if(upgraded) s.units.at(-1)!.guard += 6;
        break;
      case "summon-pit-brute":
        summon(s, "pit-brute", action.dismiss);
        if(upgraded) { s.units.at(-1)!.hp += 10; s.units.at(-1)!.maxHp += 10; }
        break;
      case "kindle":
        cinders(s, value(4, 6));
        draw(s, 1);
        break;
      case "sinister-veil":
        s.guard += value(8, 11);
        for (const u of s.units) u.guard += value(3, 4);
        break;
      case "ashen-ward":
        s.guard += value(7, 9);
        for (const target of alive(s)) scorch(s, target, value(2, 3));
        break;
      case "conflagrate":
        for (const target of alive(s)) {
          damage(value(8, 10), target);
          scorch(s, target, value(2, 3));
        }
        break;
      case "hellish-command":
        if(upgraded) { unit!.power += 2; unit!.temporaryPower = (unit!.temporaryPower || 0) + 2; }
        unitAct(s, unit!); break;
      case "ritual-cut": if(pact(2)) damage(value(13, 17)); break;
      case "chain-of-flame": {
        const copied = e.scorch;
        damage(value(5, 8));
        const others = alive(s).filter(other => other.id !== e.id);
        if(others.length) scorch(s, others[Math.floor(random(s) * others.length)], copied);
        break;
      }
      case "dark-bargain": if(pact(value(4, 3))) draw(s, 3); break;
      case "fiendish-feast": {
        const healing = Math.floor(unit!.hp / 2);
        killUnit(s, unit!); s.hp = Math.min(s.maxHp, s.hp + healing); cinders(s, value(3, 5)); break;
      }
      case "infernal-whip":
        damage(value(7, 10));
        for(const demon of [...s.units]) { emit(s, "muster", `${demon.name} lashes out.`, { actor: demon.id, target: e.id }); hitEnemy(s, e, value(3, 4), true); }
        break;
      case "burning-hatred": damage(value(15, 20)); corruption(2); break;
      case "cinder-shield": s.guard += value(7, 9) * (s.cinders >= 5 ? 2 : 1); break;
      case "smoke-and-mirrors":
        for(const enemy of alive(s)) enemy.sapped = (enemy.sapped || 0) + value(1, 2);
        for(const demon of s.units) demon.guard += 3; break;
      case "hellfire":
        for(let hit=0; hit<2; hit++) for(const enemy of alive(s)) { damage(value(6, 8), enemy); scorch(s, enemy, 1); } break;
      case "infernal-pact": s.powers[c.id] = (s.powers[c.id] || 0) + value(5, 7); break;
      case "masters-of-the-pit":
        s.powers[c.id] = (s.powers[c.id] || 0) + value(2, 3);
        for(const demon of s.units) demon.power += value(2, 3); break;
      case "burning-soul":
        s.powers[c.id] = (s.powers[c.id] || 0) + 1;
        for(const demon of s.units) demon.upkeep = Math.max(0, demon.upkeep - 1);
        if(upgraded) cinders(s, 3); break;
      case "demonic-resilience": s.powers[c.id] = (s.powers[c.id] || 0) + value(6, 8); break;
      case "sacrificial-rite": killUnit(s, unit!); s.mana += 2; draw(s, value(2, 3)); break;
      case "corrupting-touch": corruption(3); e.exposed = (e.exposed || 0) + value(2, 3); break;
      case "fire-and-brimstone": damage(value(10, 14)); scorch(s, e, e.scorch); break;
      case "ember-storm": for(const enemy of alive(s)) scorch(s, enemy, value(3, 4) * x); break;
      case "unholy-frenzy": if(pact(value(3, 2))) for(const demon of [...s.units].reverse()) unitAct(s, demon); break;
      case "pyroclasm": s.powers[c.id] = (s.powers[c.id] || 0) + value(3, 4); break;
      case "shadowflame-barrier": s.guard += value(12, 16); s.barrier += 3; break;
      case "void-gaze": e.sapped = (e.sapped || 0) + value(2, 3); corruption(2); draw(s, 1); break;
      case "rend-flesh": damage(value(10, 13)); if(s.demonTurns) damage(value(10, 13)); break;
      case "combust": { const burn = e.scorch; e.scorch = 0; damage(burn * value(2, 3)); break; }
      case "blood-price": if(pact(2)) { damage(value(6, 8)); damage(value(6, 8)); if(e.hp <= 0) corruption(4); } break;
      case "wreathed-in-flame": s.guard += value(5, 8) + Math.floor(alive(s).reduce((sum, enemy) => sum + enemy.scorch, 0) / 2); break;
      case "dread-aura": s.powers[c.id] = (s.powers[c.id] || 0) + value(1, 2); break;
      case "feast-of-embers": unit!.hp = Math.min(unit!.maxHp, unit!.hp + value(8, 12)); unit!.power += value(3, 4); break;
      case "abyssal-gaze": corruption(2); draw(s, value(1, 2)); break;
      case "infernal-transformation": s.demonTurns = 3; emit(s, "ascend", "The pact is sealed: Demon Form."); break;
    }
    emit(s,'card-resolved',`${cards[c.id].name} resolves.`);
    checkWin(s);
  } else if (action.type === "end") {
    if (s.phase !== "combat") throw Error("Combat has ended.");
    if (s.demonTurns > 0) {
      loseHp(s, 3, true);
      checkWin(s);
      if (s.phase !== "combat") {
        s.history.push(action);
        return s;
      }
    }
    s.discard.push(...s.hand.splice(0));
    for (const u of [...s.units].reverse()) {
      unitAct(s, u);
      checkWin(s);
      if (s.phase !== "combat") break;
    }
    if (s.phase === "combat")
      for (const e of alive(s)) {
        const m = intent(s, e);
        if (e.hp <= 0) continue;
        const targets = m.kind ? [] : resolveTargets(s, m.targeting);
        emit(
          s,
          "enemy",
          `${e.name}: ${m.name} · ${m.damage} → ${m.targeting}.`,
          {
            actor: e.id,
            amount: m.damage,
            targets: targets.map((t) => (t === "hero" ? "hero" : t.id)),
          },
        );
        if (m.kind === "shield") { e.guard = Math.min(24, e.guard + (m.guard || 0)); emit(s, "enemy-shield", `${e.name} raises a demonic barrier.`, { actor: e.id, amount: m.guard }); }
        if (m.kind === "summon") summonBossDemons(s, e);
        for (const target of targets) {
          if (target === "hero") {
            const blocked = Math.min(s.guard, m.damage);
            s.guard -= blocked;
            loseHp(s, m.damage - blocked, false);
          } else {
            const blocked = Math.min(target.guard, m.damage);
            target.guard -= blocked;
            const damage = Math.min(target.hp, m.damage - blocked);
            target.hp = Math.max(0, target.hp - m.damage + blocked);
            emit(s, "unit-hit", `${target.name} takes ${damage} damage.`, {
              target: target.id,
              amount: damage,
            });
            if (target.hp === 0) killUnit(s, target);
          }
        }
        if (targets.includes("hero") && s.barrier) scorch(s, e, s.barrier);
        emit(s, "enemy-impact", `${e.name}'s attack lands.`, {
          actor: e.id,
          amount: m.damage,
          targets: targets.map((t) => (t === "hero" ? "hero" : t.id)),
        });
        if (s.hp === 0) break;
        if (e.scorch > 0) {
          const burn = e.scorch;
          hitEnemy(s, e, burn, false, "scorch");
          if (e.hp > 0) e.scorch = Math.floor(burn / 2);
        }
        e.sapped = Math.max(0, (e.sapped || 0) - 1);
        e.exposed = Math.max(0, (e.exposed || 0) - 1);
        checkWin(s);
        if (s.phase !== "combat") break;
      }
    if (s.demonTurns > 0) {
      s.demonTurns--;
      if (s.demonTurns === 0) {
        s.corruption = 0;
        s.spent = true;
      }
    }
    if (s.phase === "combat") startTurn(s);
  }
  s.history.push(action);
  return s;
}
function migrateLegacy(s: State, prefix: number): State {
  s.rulesVersion = 3;
  s.legacyActions = prefix;
  if (s.phase === "reward") s.pendingLoot = { gold: 25 + s.room * 10, items: s.inventory.length ? [s.inventory[s.inventory.length - 1]] : [], final: false };
  // A completed eight-room save can continue to the new throne without rerolling its history.
  if (s.phase === "won" && s.room === 7) {
    s.phase = "loot";
    s.pendingLoot = { gold: 0, items: [], final: false };
  }
  return s;
}
export function replay(seed: number, actions: Action[], starterDeck: StarterDeckId = "classic", legacyActions: number | null = null): State {
  let s = newRun(seed, starterDeck, legacyActions === null ? 3 : 2);
  for (let i = 0; i < actions.length; i++) {
    if (i === legacyActions) s = migrateLegacy(s, legacyActions);
    s = dispatch(s, actions[i]);
  }
  if (legacyActions === actions.length) s = migrateLegacy(s, legacyActions);
  return s;
}
export const save = (s: State) => JSON.stringify({ schema: 3, seed: s.seed, starterDeck: s.starterDeck, legacyActions: s.legacyActions, actions: s.history });
export function restore(raw: string): State {
  const data = JSON.parse(raw);
  if (![1, 2, 3].includes(data.schema) || !Number.isInteger(data.seed) || !Array.isArray(data.actions) || data.actions.length > 10000) throw Error("Unsupported save.");
  const legacyActions = data.schema < 3 ? data.actions.length : data.legacyActions ?? null;
  if (legacyActions !== null && (!Number.isInteger(legacyActions) || legacyActions < 0 || legacyActions > data.actions.length)) throw Error("Unsupported save history.");
  return replay(data.seed, data.actions, data.schema === 1 ? "classic" : data.starterDeck, legacyActions);
}
