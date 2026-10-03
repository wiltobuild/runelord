import { useEffect, useRef } from "react";
import forge from "../../../assets/environments/cinderforge-approach/animation/fb9f7966288c/config.json";
import forest from "../../../assets/environments/thornroot-crossing/animation/2b941d161d90/config.json";
import arena from "../../../assets/environments/cinderforge-caldera/animation/be96f4c43d3f/config.json";

// Keep throne ambience above the combat lane. Deterministic, sparse motes
// preserve the artwork and leave enemy intents/characters unobscured.
const demonThrone = {
  ...arena,
  scene: "demon-throne",
  duration: 12,
  protected_lane: [.43, .87],
  particles: Array.from({ length: 22 }, (_, index) => ({
    kind: "throne-ember", x: .08 + ((index * 37) % 85) / 100,
    y: .22, rx: .00065 + (index % 3) * .0002, ry: .0012 + (index % 4) * .0003,
    alpha: .16 + (index % 4) * .035, sway: .003 + (index % 3) * .002,
    phase: index / 22, color: index % 4 === 0 ? "#f7c480" : "#e87e40",
  })),
};
const scenes = { forge, forest, arena, "demon-throne": demonThrone };

/** Existing eight-second scene loops, rendered as a transparent layer over their source art.
 * Geometry/opacity follows the saved RunelordWeather runtime, including its protected lane. */
export function AnimatedBackground({ scene }: { scene: string }) {
  const canvas = useRef<HTMLCanvasElement>(null);
  const config = scenes[scene as keyof typeof scenes];
  useEffect(() => {
    const el = canvas.current;
    if (!el || !config) return;
    const ctx = el.getContext("2d");
    if (!ctx) return;
    const motion = matchMedia("(prefers-reduced-motion: reduce)");
    let raf = 0, last = -Infinity;
    const draw = (seconds: number) => {
      const w = el.width, h = el.height;
      ctx.clearRect(0, 0, w, h);
      const p = ((seconds % config.duration) + config.duration) % config.duration / config.duration;
      for (const s of config.particles) {
        const q = (p + s.phase) % 1;
        const x = s.x + s.sway * Math.sin(Math.PI * 2 * q);
        let y = s.y, alpha = s.alpha;
        if (s.kind === "throne-ember") { y = .40 - q * .19; alpha *= Math.sin(Math.PI * q) ** 2; }
        else if (s.kind === "snow") { y = .03 + q * .48; alpha *= Math.sin(Math.PI * q) ** 2; }
        else if (s.kind === "ember") { y = .5 - q * .4; alpha *= Math.sin(Math.PI * q) ** 2; }
        else { y += .012 * Math.sin(Math.PI * 2 * q); alpha *= .65 + .35 * Math.sin(Math.PI * 2 * q) ** 2; }
        if (y + s.ry >= config.protected_lane[0] && y - s.ry <= config.protected_lane[1]) continue;
        ctx.globalAlpha = alpha; ctx.fillStyle = s.color; ctx.shadowColor = s.color; ctx.shadowBlur = s.kind === "throne-ember" ? 4 : 0; ctx.beginPath();
        if (s.kind === "leaf") {
          ctx.moveTo((x-s.rx)*w,y*h); ctx.lineTo(x*w,(y-s.ry)*h);
          ctx.lineTo((x+s.rx)*w,y*h); ctx.lineTo(x*w,(y+s.ry)*h); ctx.closePath();
        } else ctx.ellipse(x*w,y*h,s.rx*w,s.ry*h,0,0,Math.PI*2);
        ctx.fill();
      }
      ctx.globalAlpha = 1; ctx.shadowBlur = 0;
    };
    const frame = (time: number) => {
      if (time - last >= 1000 / 30) { draw(time / 1000); last = time; }
      raf = requestAnimationFrame(frame);
    };
    const sync = () => {
      cancelAnimationFrame(raf);
      const running = !motion.matches && !document.hidden;
      el.dataset.running = String(running);
      if (running) raf = requestAnimationFrame(frame);
      else draw(0);
    };
    sync();
    motion.addEventListener("change", sync);
    document.addEventListener("visibilitychange", sync);
    return () => { cancelAnimationFrame(raf); motion.removeEventListener("change", sync); document.removeEventListener("visibilitychange", sync); };
  }, [config]);
  return <canvas ref={canvas} className="ambient-background" width={1672} height={941}
    aria-hidden="true" data-scene={config?.scene} />;
}
