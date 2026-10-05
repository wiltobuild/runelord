import { drawDemonSpell } from "./demonSpellEffects";
import type { Assets } from "./assets";
import {drawForestSpell} from "./forestSpellRenderer";
import { drawWard } from "./wardEffect";
import { drawNatureWard } from "./natureWardEffect";
import { drawSummon } from './summonEffect';
import { useEffect, useRef } from "react";
export type Point = { x: number; y: number; width?: number; height?: number };
export type SpellKind = "rootwake" | "verdant_cyclone" | "crownfall" 
  | "flaming-arrow"
  | "crossbow-bolt"
  | "demon-bolt"
  | "fire"
  | "lash"
  | "immolate"
  | "conflagrate"
  | "ward"
  | "nature-ward"
  | "pact"
  | "kindle"
  | "summon"
  | "empower"
  | "sacrifice-rite"
  | "sacrifice-feast"
  | "command"
  | "ember-feast"
  | "impact"
  | "scorch"
  | "ascend";
export type SpellEffect = {
  id: number;
  kind: SpellKind;
  start: number;
  duration: number;
  release: number;
  travel: number;
  from: Point;
  targets: Point[];
  scale?: number;
  height?: number;
  targetActor?: string;
};
const clamp = (n: number) => Math.max(0, Math.min(1, n));
const ease = (n: number) => 1 - Math.pow(1 - clamp(n), 3);
const random = (n: number) => {
  const x = Math.sin(n * 127.1 + 311.7) * 43758.5453;
  return x - Math.floor(x);
};
function glow(
  c: CanvasRenderingContext2D,
  x: number,
  y: number,
  r: number,
  color: string,
  alpha: number,
) {
  c.save();
  c.globalAlpha = clamp(alpha);
  const g = c.createRadialGradient(x, y, 0, x, y, r);
  g.addColorStop(0, color);
  g.addColorStop(0.25, color + "bb");
  g.addColorStop(1, color + "00");
  c.fillStyle = g;
  c.beginPath();
  c.arc(x, y, r, 0, Math.PI * 2);
  c.fill();
  c.restore();
}
function rune(
  c: CanvasRenderingContext2D,
  p: Point,
  r: number,
  rotation: number,
  alpha: number,
  color = "#ffb15b",
  flat = false,
) {
  c.save();
  c.translate(p.x, p.y);
  if (flat) c.scale(1, 0.32);
  c.rotate(rotation);
  c.globalAlpha = clamp(alpha);
  c.strokeStyle = color;
  c.lineWidth = 2;
  c.shadowBlur = 12;
  c.shadowColor = color;
  c.beginPath();
  c.arc(0, 0, r, 0, Math.PI * 2);
  c.arc(0, 0, r * 0.78, 0, Math.PI * 2);
  c.stroke();
  for (let i = 0; i < 12; i++) {
    c.save();
    c.rotate((i * Math.PI) / 6);
    c.beginPath();
    c.moveTo(r * 0.84, -4);
    c.lineTo(r * 0.96, 0);
    c.lineTo(r * 0.84, 4);
    c.moveTo(r * 0.9, 0);
    c.lineTo(r * 0.9, 9);
    c.stroke();
    c.restore();
  }
  c.beginPath();
  for (let i = 0; i < 7; i++) {
    const a = (i * Math.PI * 2) / 6;
    c.lineTo(Math.cos(a) * r * 0.66, Math.sin(a) * r * 0.66);
  }
  c.stroke();
  c.restore();
}
function flame(
  c: CanvasRenderingContext2D,
  x: number,
  y: number,
  size: number,
  time: number,
  angle = 0,
  alpha = 1,
) {
  c.save();
  c.translate(x, y);
  c.rotate(angle);
  c.globalAlpha = clamp(alpha);
  c.shadowBlur = size * 0.7;
  c.shadowColor = "#ff611b";
  for (let layer = 0; layer < 3; layer++) {
    const s = size * (1 - layer * 0.27);
    c.fillStyle = ["#e64316", "#ff9f25", "#fff3b4"][layer];
    c.beginPath();
    c.moveTo(-s * 0.5, s * 0.3);
    c.bezierCurveTo(-s * 1.1, -s * 0.5, -s * 0.2, -s * 0.85, s * 0.1, -s * 1.9);
    c.bezierCurveTo(s * 0.3, -s * 0.6, s * 0.9, -s * 0.8, s * 0.65, s * 0.1);
    c.quadraticCurveTo(s * 0.15, s * 0.65, -s * 0.5, s * 0.3);
    c.fill();
  }
  c.restore();
}
function burst(
  c: CanvasRenderingContext2D,
  p: Point,
  t: number,
  seed: number,
  scale = 1,
  color = "#ff9d39",
) {
  if (t < 0 || t > 800) return;
  const q = t / 800,
    fade = 1 - q;
  c.save();
  c.globalCompositeOperation = "lighter";
  glow(c, p.x, p.y, (35 + 100 * ease(q)) * scale, color, fade * 0.85);
  c.strokeStyle = color;
  c.lineWidth = 5 * (1 - q);
  c.globalAlpha = fade * 0.8;
  c.beginPath();
  c.ellipse(
    p.x,
    p.y,
    (15 + 95 * ease(q)) * scale,
    (10 + 68 * ease(q)) * scale,
    0,
    0,
    Math.PI * 2,
  );
  c.stroke();
  for (let i = 0; i < 45; i++) {
    const a = random(i + seed) * Math.PI * 2,
      speed = (35 + random(i + seed + 40) * 150) * scale,
      d = ease(q) * speed;
    const x = p.x + Math.cos(a) * d,
      y = p.y + Math.sin(a) * d + q * q * 45;
    c.globalAlpha = fade * (0.3 + random(i) * 0.7);
    c.strokeStyle = i % 3 ? "#ff8b26" : "#fff0ba";
    c.lineWidth = (1 + random(i + 11) * 4) * fade;
    c.beginPath();
    c.moveTo(x, y);
    c.lineTo(x - Math.cos(a) * 12 * (1 - q), y - Math.sin(a) * 12 * (1 - q));
    c.stroke();
  }
  for (let i = 0; i < 9; i++) {
    const a = (i * Math.PI * 2) / 9;
    flame(
      c,
      p.x + Math.cos(a) * q * 60 * scale,
      p.y + Math.sin(a) * q * 45 * scale,
      (15 + random(seed + i) * 13) * scale * (1 - q),
      q,
      a + Math.PI / 2,
      fade,
    );
  }
  c.restore();
}
function drawEffect(c: CanvasRenderingContext2D, e: SpellEffect, time: number) {
  const t = time - e.start;
  if (t < 0 || t > e.duration) return;
  const scale = e.scale ?? 1,
    p = e.from,
    charge = clamp(t / e.release),
    after = t - e.release,
    impact = e.release + e.travel;
  c.save();
  c.globalCompositeOperation = "lighter";
  if (["sacrifice-rite", "sacrifice-feast", "command", "ember-feast"].includes(e.kind)) {
    drawDemonSpell(c, e, time);
  } else if (["flaming-arrow", "crossbow-bolt", "demon-bolt"].includes(e.kind)) {
    for (const [index,target] of e.targets.entries()) {
      if (after >= 0 && after < e.travel) {
        const u=clamp(after/e.travel), dx=target.x-p.x, dy=target.y-p.y;
        const x=p.x+dx*u, y=p.y+dy*u-Math.sin(u*Math.PI)*24;
        const angle=Math.atan2(dy-Math.cos(u*Math.PI)*24*Math.PI,dx);
        c.save();c.translate(x,y);c.rotate(angle);c.scale(scale,scale);
        const magic=e.kind==="demon-bolt", fiery=e.kind!=="crossbow-bolt";
        glow(c,-10,0,magic?32:23,magic?"#c641fa":"#ff681f",.7);
        for(let i=0;i<18;i++) {
          const length=10+i*3, flicker=Math.sin(time*.023+i*2.7)* (2+i*.25);
          glow(c,-length,flicker,Math.max(1,6-i*.25),magic?"#ba4cff":"#ff7b2e",(1-i/18)*(fiery?.65:.18));
        }
        if (magic) {
          glow(c,0,0,14,"#ffdf9f",1);
          c.strokeStyle="#f9b0ff";c.lineWidth=2;c.beginPath();c.moveTo(-25,-6);c.lineTo(-8,5);c.lineTo(6,-3);c.lineTo(13,0);c.stroke();
        } else {
          c.strokeStyle=fiery?"#ffe8ac":"#c8d6da";c.lineWidth=2.6;c.beginPath();c.moveTo(-32,0);c.lineTo(10,0);c.stroke();
          c.fillStyle=fiery?"#fff2cb":"#e7e9e8";c.beginPath();c.moveTo(18,0);c.lineTo(5,-5);c.lineTo(8,0);c.lineTo(5,5);c.closePath();c.fill();
          c.strokeStyle=fiery?"#f35424":"#849296";c.beginPath();c.moveTo(-24,0);c.lineTo(-34,-6);c.moveTo(-24,0);c.lineTo(-34,6);c.stroke();
        }
        c.restore();
      }
      if(after>=e.travel)burst(c,target,after-e.travel,e.id+index*13,e.kind==="demon-bolt"?.7:.45,e.kind==="demon-bolt"?"#cb69ff":"#ffa14c");
    }
  } else if (["fire", "lash", "immolate", "conflagrate"].includes(e.kind)) {
    if (t < e.release + 150) {
      const a = 1 - clamp((t - e.release) / 150);
      rune(c, p, 20 + charge * 21, time * 0.002, a * 0.9);
      glow(c, p.x, p.y, 55 * scale, "#ff631c", a * 0.65);
      flame(c, p.x, p.y, (8 + charge * 22) * scale, time, Math.PI / 2, a);
      for (let i = 0; i < 14; i++) {
        const a1 = time * 0.007 + i * 0.45,
          r = (1 - charge) * 85 + 19;
        glow(
          c,
          p.x + Math.cos(a1) * r,
          p.y + Math.sin(a1) * r * 0.7,
          3,
          "#ffd176",
          0.8 * a,
        );
      }
    }
    for (const [index, target] of e.targets.entries()) {
      if (after >= 0 && after < e.travel + 70) {
        const u = clamp(after / e.travel),
          x = p.x + (target.x - p.x) * ease(u),
          y = p.y + (target.y - p.y) * ease(u) - Math.sin(u * Math.PI) * 25,
          angle = Math.atan2(target.y - p.y, target.x - p.x) + Math.PI / 2;
        for (let trail = 12; trail >= 0; trail--) {
          const v = clamp((after - trail * 10) / e.travel),
            tx = p.x + (target.x - p.x) * ease(v),
            ty = p.y + (target.y - p.y) * ease(v) - Math.sin(v * Math.PI) * 25;
          glow(
            c,
            tx,
            ty,
            (16 + trail) * scale,
            "#ff681c",
            (1 - trail / 14) * 0.55,
          );
          flame(
            c,
            tx,
            ty,
            (26 - trail * 1.6) * scale,
            time,
            angle + Math.sin(time * 0.02 + trail) * 0.12,
            (1 - trail / 14) * 0.7,
          );
        }
        if (e.kind === "lash") {
          c.strokeStyle = "#ffb44d";
          c.lineWidth = 7;
          c.shadowBlur = 15;
          c.shadowColor = "#ff4a17";
          c.beginPath();
          c.moveTo(p.x, p.y);
          c.bezierCurveTo(p.x + 80, p.y - 65, x - 100, y + 60, x, y);
          c.stroke();
        }
        glow(c, x, y, 42 * scale, "#ffb64d", 0.95);
        flame(c, x, y, 30 * scale, time, angle);
      }
      burst(
        c,
        target,
        t - impact,
        e.id + index * 30,
        e.kind === "conflagrate" ? 1.35 : scale,
      );
      if (["immolate", "conflagrate"].includes(e.kind) && t > impact)
        for (let i = 0; i < 6; i++) {
          const a = clamp((e.duration - t) / 450);
          flame(
            c,
            target.x + (i - 2.5) * 15,
            target.y + 40,
            20 * scale,
            time + i,
            Math.sin(i) * 0.2,
            a,
          );
        }
    }
  } else if ((e.kind === "summon" || e.kind === "empower")) {
    drawSummon(c, e, time, false);
  } else if (e.kind === "ward") {
    drawWard(c, e, time);
  } else if (e.kind === "nature-ward") {
    drawNatureWard(c, e, time);
  } else if (e.kind === "pact" || e.kind === "kindle" || e.kind === "ascend") {
    const a = Math.sin(Math.PI * clamp(t / e.duration));
    rune(
      c,
      { x: p.x, y: p.y + 65 },
      75,
      time * 0.002,
      a,
      e.kind === "pact" ? "#e55768" : "#ffbe5b",
      true,
    );
    glow(c, p.x, p.y, 100, e.kind === "pact" ? "#d62963" : "#ff932a", a * 0.5);
    for (let i = 0; i < 34; i++) {
      const angle = i * 2.4 + t * 0.003,
        r = 80 * (1 - clamp(t / e.duration)) + (i % 3) * 8;
      const y = p.y + Math.sin(angle) * r * 0.9;
      flame(
        c,
        p.x + Math.cos(angle) * r,
        y,
        9 + random(i) * 10,
        time,
        Math.sin(angle),
        a,
      );
    }
    if (e.kind === "ascend") rune(c, p, 90, time * -0.001, a);
  } else if (e.kind === "scorch") {
    for (const target of e.targets)
      for (let i = 0; i < 6; i++)
        flame(
          c,
          target.x + (i - 2.5) * 12,
          target.y + 30,
          20 * (1 - t / e.duration),
          time + i,
          Math.sin(i) * 0.2,
          1 - t / e.duration,
        );
  } else
    for (const target of e.targets) burst(c, target, t, e.id, 0.55, "#ffd5a0");
  c.restore();
}
function EffectCanvas({ effects, assets, ground = false }: { effects: SpellEffect[]; assets:Assets; ground?: boolean }) {
  const canvas = useRef<HTMLCanvasElement>(null),
    latest = useRef(effects);
  latest.current = effects;
  useEffect(() => {
    const el = canvas.current!,
      ctx = el.getContext("2d")!;
    let raf = 0;
    const draw = (time: number) => {
      const box = { width: el.clientWidth, height: el.clientHeight },
        dpr = Math.min(devicePixelRatio, 2);
      if (
        el.width !== Math.round(box.width * dpr) ||
        el.height !== Math.round(box.height * dpr)
      ) {
        el.width = Math.round(box.width * dpr);
        el.height = Math.round(box.height * dpr);
      }
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, box.width, box.height);
      for (const original of latest.current) {
        let e = original;
        if (e.kind === "empower" && e.targetActor) {
          const sprite = document.querySelector<HTMLElement>(`[data-actor="${e.targetActor}"] .actor-sprite`);
          const root = sprite?.getBoundingClientRect(), surface = el.getBoundingClientRect();
          if (root && surface.width && surface.height) e = {...e, targets:[{
            x:(root.left+root.width/2-surface.left)*box.width/surface.width,
            y:(root.bottom-surface.top)*box.height/surface.height,
          }]};
        }
        // Summons can move as the formation repacks. Both portal layers follow
        // the rendered source root, in this canvas's coordinates, on every frame.
        if (e.kind === "summon" && e.targetActor) {
          const sprite = document.querySelector<HTMLElement>(`[data-actor="${e.targetActor}"] .actor-sprite`);
          const image = sprite?.querySelector("img");
          const anchor = sprite?.dataset.summonAnchor?.split(",").map(Number);
          const source = anchor && image ? image.getBoundingClientRect() : sprite?.getBoundingClientRect();
          const surface = el.getBoundingClientRect();
          if (source && surface.width && surface.height) {
            const x = source.left + source.width * (anchor?.[0] ?? .5);
            const y = source.top + source.height * (anchor?.[1] ?? (e.targetActor.startsWith("enemy-") ? .88 : 1));
            e = {...e, targets: [{x:(x-surface.left)*box.width/surface.width, y:(y-surface.top)*box.height/surface.height}]};
          }
        }
        if (ground) { if (e.kind === "summon" || e.kind === "empower") drawSummon(ctx, e, time, true); }
        else if(assets.forestSpells?.[e.kind]) drawForestSpell(ctx,e,time,assets);
        else drawEffect(ctx, e, time);
      }
      raf = requestAnimationFrame(draw);
    };
    raf = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(raf);
  }, []);
  return (
    <canvas
      className={`spell-effects${ground ? " summon-floor-effects" : ""}`}
      ref={canvas}
      aria-hidden="true"
      data-effects={effects.map((e) => e.kind).join(",")}
    />
  );
}

export function SpellEffects({effects,assets}:{effects:SpellEffect[];assets:Assets}) {
  return <><EffectCanvas effects={effects} assets={assets} ground /><EffectCanvas effects={effects} assets={assets} /></>;
}
