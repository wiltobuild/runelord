import { useEffect, useRef } from "react";
import { HERO_VIEW } from "./heroGeometry";
import { drawSummon } from "./summonEffect";

// Guard is authoritative: losing some guard keeps the ward alive; losing all fades it.
export function GuardAura({ active }: { active: boolean }) {
  const canvas = useRef<HTMLCanvasElement>(null);
  const strength = useRef(0);
  useEffect(() => {
    const el = canvas.current!, c = el.getContext("2d");
    if (!c) return;
    const dpr = Math.min(devicePixelRatio || 1, 2);
    el.width = HERO_VIEW.width * dpr; el.height = HERO_VIEW.height * dpr;
    let raf = 0, previous = performance.now();
    const draw = (time: number) => {
      const dt = Math.min(50, time - previous); previous = time;
      strength.current = Math.max(0, Math.min(1, strength.current + dt / (active ? 280 : -380)));
      const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
      const clock = reduced ? 0 : time;
      const pulse = .78 + .22 * Math.sin(clock * Math.PI / 1100);
      el.style.opacity = String(strength.current * pulse);
      c.setTransform(dpr, 0, 0, dpr, 0, 0); c.clearRect(0, 0, HERO_VIEW.width, HERO_VIEW.height);
      const x = HERO_VIEW.width / 2, y = HERO_VIEW.ground;
      drawSummon(c, { id: 0, kind: "summon", start: time - 650, duration: 1300, release: 160, travel: 0,
        from: { x, y }, targets: [{ x, y }], scale: 1.12 }, time, true);
      c.save(); c.translate(x, y); c.globalCompositeOperation = "lighter";
      c.shadowColor = "#ff481a"; c.shadowBlur = 10;
      // Short tongues of fire hug the seal instead of obscuring the hero's body.
      for (let i = 0; i < 24; i++) {
        const a = i * Math.PI / 12, px = Math.cos(a) * 83, py = Math.sin(a) * 25;
        const flicker = .5 + .5 * Math.sin(clock * .005 + i * 2.4);
        const h = 9 + flicker * 22, w = 3 + flicker * 3;
        const gradient = c.createLinearGradient(px, py, px, py - h);
        gradient.addColorStop(0, "#ffbc62"); gradient.addColorStop(.45, "#f95723bb"); gradient.addColorStop(1, "#bd192b00");
        c.fillStyle = gradient; c.beginPath(); c.moveTo(px - w, py);
        c.quadraticCurveTo(px - w * 1.3, py - h * .45, px + Math.sin(clock * .003 + i) * 6, py - h);
        c.quadraticCurveTo(px + w, py - h * .45, px + w, py); c.closePath(); c.fill();
      }
      c.restore();
      if (active || strength.current > 0) raf = requestAnimationFrame(draw);
    };
    if (active || strength.current > 0) raf = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(raf);
  }, [active]);
  return <canvas ref={canvas} className="guard-aura" aria-hidden="true" data-active={active} style={{ opacity: 0 }} />;
}
