import type { Clip } from "./assets";

// Shared by sprite placement and spell sockets; all values are unzoomed canvas pixels.
export const HERO_VIEW = { width: 500, height: 400, ground: 334 } as const;
export function heroPlacement(clip: Clip) {
  const [width, height] = clip.size || [HERO_VIEW.width, HERO_VIEW.height];
  const [anchorX, anchorY] = clip.anchor || [width / 2, height * 0.835];
  const scale = Math.min(HERO_VIEW.width / width, HERO_VIEW.ground / anchorY,
    (HERO_VIEW.height - HERO_VIEW.ground) / (height - anchorY));
  return { scale, width: width * scale, height: height * scale,
    x: HERO_VIEW.width / 2 - anchorX * scale, y: HERO_VIEW.ground - anchorY * scale };
}

export function heroSourcePoint(clip: Clip, point: readonly [number, number]) {
  const placement = heroPlacement(clip);
  return { x: placement.x + point[0] * placement.scale,
    y: placement.y + point[1] * placement.scale };
}
