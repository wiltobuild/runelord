import type { Assets } from "./assets";

export const WARBAND_SPACE = { left: 335, top: 150, width: 700, ground: 376, gap: 16 } as const;
type Member = { id: number; kind: string };
export const summonArt = (kind: string, assets: Assets) =>
  kind === "imp" && assets.actors["summon-imp-flight"] ? "summon-imp-flight" : `summon-${kind}`;
export type FormationSlot = {
  x: number; top: number; width: number; root: number; worldUnit: number; art: string;
  airborne: boolean; bounds: { left: number; right: number; top: number; bottom: number };
};

// Reserve the union of every pose, not just the current frame or a narrow flex item.
export function layoutWarband(units: Member[], assets: Assets): Map<number, FormationSlot> {
  const measures = units.map(unit => {
    const art = summonArt(unit.kind, assets);
    const airborne = art === "summon-imp-flight";
    const actor = assets.actors[art];
    const geometry = actor?.geometry;
    const worldUnit = unit.kind === "hellhound" ? 225.8064515 : 200;
    const scale = worldUnit / (geometry?.source_pixels_per_world_unit || 400);
    const [ax, ay] = actor?.anchor || [256, 340];
    const [left, top, right, bottom] = geometry?.layout_bounds_px || [0, 0, ...(actor?.size || [512, 384])];
    return { ...unit, art, airborne, worldUnit,
      half: Math.max(ax - left, right - ax) * scale,
      upper: (ay - top) * scale, lower: Math.max(0, bottom - ay) * scale };
  });
  const result = new Map<number, FormationSlot>();
  const labelWidth = Math.min(110, (WARBAND_SPACE.width - Math.max(0, units.length - 1) * WARBAND_SPACE.gap) / Math.max(1, units.length));
  const widthOf = (m: typeof measures[number], factor: number) => Math.max(labelWidth, m.half * factor * 2 + 12);
  const groundWidthLimit = measures.filter(m=>!m.airborne).every(m=>m.kind === "hellhound") ? 780 : WARBAND_SPACE.width;
  const fit = (row: typeof measures, available = WARBAND_SPACE.width as number) => {
    let low = 0, high = 1;
    for (let i = 0; i < 24; i++) {
      const mid = (low + high) / 2;
      const width = row.reduce((sum, m) => sum + widthOf(m, mid), 0) + Math.max(0, row.length - 1) * WARBAND_SPACE.gap;
      if (width <= available) low = mid; else high = mid;
    }
    return low;
  };
  const ground = measures.filter(m => !m.airborne), air = measures.filter(m => m.airborne);
  let groundFactor = fit(ground, groundWidthLimit);
  const airFactor = fit(air);
  const airWidth = air.reduce((sum, m) => sum + widthOf(m, airFactor), 0) + Math.max(0, air.length - 1) * WARBAND_SPACE.gap;
  for (let attempt = 0; attempt < 32; attempt++) {
    result.clear();
    const groundWidth = ground.reduce((sum, m) => sum + widthOf(m, groundFactor), 0) + Math.max(0, ground.length - 1) * WARBAND_SPACE.gap;
    let cursor = WARBAND_SPACE.width - groundWidth;
    for (const m of ground) {
      const width = widthOf(m, groundFactor), top = WARBAND_SPACE.ground - m.upper * groundFactor - 24;
      result.set(m.id, { x: cursor, top, width, root: WARBAND_SPACE.ground, art: m.art, airborne: false, worldUnit: m.worldUnit * groundFactor,
        bounds: { left: cursor, right: cursor + width, top, bottom: WARBAND_SPACE.ground + m.lower * groundFactor + 50 } });
      cursor += width + WARBAND_SPACE.gap;
    }
    if (!air.length) break;
    // Shift the complete flight row to favor clear sky above shorter ground actors.
    // A contiguous row prevents greedy placement from stranding a later flyer.
    const maxShift = Math.max(0, WARBAND_SPACE.width - airWidth);
    const shifts = new Set([0, maxShift]);
    for (let x = 0; x <= maxShift; x += 4) shifts.add(x);
    let best: { score: number; slots: [number, FormationSlot][] } | undefined;
    for (const shift of shifts) {
      let x = shift, score = airFactor;
      const slots: [number, FormationSlot][] = [];
      for (const m of air) {
        const width = widthOf(m, airFactor);
        let bottom = WARBAND_SPACE.ground - 180;
        for (const slot of result.values()) {
          if (x < slot.bounds.right && x + width > slot.bounds.left)
            bottom = Math.min(bottom, slot.bounds.top - WARBAND_SPACE.gap);
        }
        // Flyers reserve their compact details above the wings, with no footer below.
        const factor = Math.min(airFactor, (bottom - 50) / (m.upper + m.lower));
        score = Math.min(score, factor);
        const top = bottom - (m.upper + m.lower) * factor - 50;
        slots.push([m.id, { x, top, width, root: top + 50 + m.upper * factor, art: m.art, airborne: true, worldUnit: m.worldUnit * factor,
          bounds: { left: x, right: x + width, top, bottom } }]);
        x += width + WARBAND_SPACE.gap;
      }
      if (!best || score > best.score) best = { score, slots };
    }
    if (best && best.score >= airFactor * 0.65) {
      for (const [id, slot] of best.slots) result.set(id, slot);
      break;
    }
    groundFactor *= 0.92;
  }
  return result;
}

// Reserve a clear gap before the enemy lane using the full authored pose bounds.
// Shift only the ground row; flying Imps retain their independent sky positions.
export function retreatGroundFormation(slots:Map<number,FormationSlot>, assets:Assets) {
  const ground=[...slots.values()].filter(s=>!s.airborne);
  const right=Math.max(0,...ground.map(s=>{
    const a=assets.actors[s.art],g=a?.geometry;
    const spriteRight=g ? s.x+s.width/2+(g.layout_bounds_px![2]-a.anchor[0])*s.worldUnit/g.source_pixels_per_world_unit : s.bounds.right;
    return Math.max(s.bounds.right,spriteRight);
  }));
  const shift=ground.length ? Math.max(100,right-590) : 0;
  return {shift,slots:new Map([...slots].map(([id,s])=>[id,s.airborne?s:{...s,x:s.x-shift,bounds:{...s.bounds,left:s.bounds.left-shift,right:s.bounds.right-shift}}]))};
}
