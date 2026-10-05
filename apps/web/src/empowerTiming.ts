export const EMPOWER_MS = 2600;
const clamp = (n: number) => Math.max(0, Math.min(1, n));
const smooth = (n: number) => { const t = clamp(n); return t * t * (3 - 2 * t); };
export function empowerPhase(elapsed: number) {
  return {
    morph: smooth((elapsed - 350) / 1100),
    reveal: smooth((elapsed - 1600) / 550),
    circle: smooth(elapsed / 180) * (1 - smooth((elapsed - 1600) / 1000)),
    beam: smooth(elapsed / 260) * (1 - smooth((elapsed - 1450) / 650)),
  };
}
