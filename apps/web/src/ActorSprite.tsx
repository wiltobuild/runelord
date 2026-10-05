import { EMPOWER_MS, empowerPhase } from "./empowerTiming";
import { DemonLordGlow } from "./DemonLordGlow";
import { useEffect, useRef, useState, type CSSProperties } from "react";
import type { Assets } from "./assets";
import { FireDeathEffect } from "./FireDeathEffect";
import "./cinematic-summons.css";
export type ActorCue = { state: string; sequence: number; fromArt?: string; startedAt?: number; sourceWorldUnit?: number };
const loaded = new Map<string, Promise<void>>();
function imageReady(src: string) {
  if (!loaded.has(src))
    loaded.set(
      src,
      new Promise<void>((resolve, reject) => {
        const img = new Image();
        img.onload = () => resolve();
        img.onerror = () => reject(Error(`Missing animation frame: ${src}`));
        img.src = src;
      }).catch((error) => { loaded.delete(src); throw error; }),
    );
  return loaded.get(src)!;
}
export async function warmActors(assets: Assets, actorIds?: Iterable<string>) {
  await Promise.all(
    (actorIds ? [...new Set(actorIds)].map(id => assets.actors[id]).filter(Boolean) : Object.values(assets.actors)).flatMap((actor) =>
      Object.values(actor.states).flatMap((clip) =>
        clip.frames.map((f) => imageReady(f.src)),
      ),
    ),
  );
}
export function ActorSprite({
  assets,
  art,
  cue,
  hp,
  maxHp,
  name,
  className = "enemy-art",
  animationSeed = 0,
}: {
  assets: Assets;
  art: string;
  cue?: ActorCue;
  hp: number;
  maxHp: number;
  name: string;
  className?: string;
  animationSeed?: number;
}) {
  const [failed, setFailed] = useState(false);
  const [deathFinished, setDeathFinished] = useState(false);
  const wasAlive = useRef(hp > 0);
  if (hp > 0) wasAlive.current = true;
  const fire = useRef<HTMLCanvasElement>(null);
  const image = useRef<HTMLImageElement>(null),
    actor = assets.actors[art],
    states = actor?.states;
  // One shared world scale and fixed source root for every pose. Enemy layout stays unchanged.
  const geometry = art.startsWith("summon-") ? actor?.geometry : undefined;
  const pixelsPerUnit = geometry?.source_pixels_per_world_unit;
  const summonStyle: CSSProperties | undefined = pixelsPerUnit ? {
    position: "absolute",
    width: `calc(var(--summon-world-unit, 200px) * ${actor.size[0] / pixelsPerUnit})`,
    height: `calc(var(--summon-world-unit, 200px) * ${actor.size[1] / pixelsPerUnit})`,
    maxWidth: "none",
    left: `calc(50% - var(--summon-world-unit, 200px) * ${actor.anchor[0] / pixelsPerUnit})`,
    bottom: `calc(var(--summon-world-unit, 200px) * ${-(actor.size[1] - actor.anchor[1]) / pixelsPerUnit})`,
    objectFit: "fill",
  } : undefined;
  const empoweringCue = cue?.state === "empower";
  const fireStyle: CSSProperties | undefined = empoweringCue && pixelsPerUnit ? {
    ...summonStyle,
    width: `calc(var(--summon-world-unit, 200px) * ${actor.size[0] * 2 / pixelsPerUnit})`,
    height: `calc(var(--summon-world-unit, 200px) * ${actor.size[1] * 2 / pixelsPerUnit})`,
    left: `calc(50% - var(--summon-world-unit, 200px) * ${(actor.anchor[0] + actor.size[0] / 2) / pixelsPerUnit})`,
    bottom: `calc(var(--summon-world-unit, 200px) * ${-(actor.size[1] * 1.5 - actor.anchor[1]) / pixelsPerUnit})`,
  } : summonStyle;
  const resting = hp <= 0 ? "die" : hp / maxHp < 0.3 ? "wounded_idle" : "idle";
  const requestedState = hp <= 0 ? "die" : cue?.state || resting;
  const sequence = hp <= 0 ? 0 : cue?.sequence;
  useEffect(() => {
    if (!states || failed) return;
    if (requestedState !== "die") setDeathFinished(false);
    let raf = 0,
      alive = true;
    const begin = requestedState === "empower" ? cue?.startedAt ?? performance.now() : performance.now();
    const original = cue?.fromArt ? assets.actors[cue.fromArt] : undefined;
    const originalImage = new Image();
    if (original) originalImage.src = original.states.idle.frames[0].src;
    const requested = requestedState;
    const initial = states[requested] || states[resting];
    if (!initial) return;
    const render = () => {
      if (!alive || !image.current) return;
      const elapsed = performance.now() - begin;
      let clip = initial,
        t = elapsed;
      if (!clip.loop && elapsed >= clip.duration && requested !== "die") {
        clip = states[resting] || initial;
        t = elapsed - initial.duration;
      }
      // Stable per-unit phase separates resting loops, including after a cue.
      // Combat/spawn/death clips retain their authored timing and first frame.
      if (clip.loop && (clip === states.idle || clip === states.wounded_idle)) {
        t += ((animationSeed * 0.618033988749895) % 1) * clip.duration;
      }
      if (clip.loop) t %= clip.duration;
      const frame =
        clip.frames[
          Math.max(
            0,
            clip.frames.findLastIndex((f) => f.time <= t),
          )
        ];
      if (image.current.getAttribute("src") !== frame.src)
        image.current.src = frame.src;
      if (frame.effects || actor.effects) image.current.dataset.glow = JSON.stringify(frame.effects ?? actor.effects);
      const spawning = requested === "spawn" && actor.spawnReveal !== "authored" && elapsed < 1200;
      const empowering = requested === "empower" && elapsed < EMPOWER_MS;
      const phase = empowerPhase(elapsed);
      const reveal = empowering ? phase.reveal : Math.max(0, Math.min(1, (elapsed - 790) / 330));
      image.current.style.opacity = String((frame.opacity ?? 1) * (spawning || empowering ? reveal : 1));
      image.current.style.clipPath = spawning ? `inset(${Math.max(0, 100 - elapsed / 8)}% 0 0)` : "";
      const canvas = fire.current;
      if (canvas) {
        canvas.style.display = spawning || empowering ? "block" : "none";
        const c = canvas.getContext("2d");
        if ((spawning || empowering) && c && image.current.complete && image.current.naturalWidth) {
          const padding = empoweringCue ? 2 : 1;
          const w = canvas.width / padding, h = canvas.height / padding;
          c.clearRect(0, 0, canvas.width, canvas.height);
          c.save();
          if (empoweringCue) c.translate(w/2, h/2);
          if (!empowering) { c.beginPath(); c.rect(0, h * Math.max(0, 1 - elapsed / 800), w, h); c.clip(); }
          if (empowering && original && originalImage.complete && originalImage.naturalWidth) {
            // Register both silhouettes at their source roots; grow the old form
            // while the new outline resolves, keeping the fiery texture continuous.
            const worldUnit = parseFloat(getComputedStyle(image.current).getPropertyValue("--summon-world-unit")) || 200;
            const sourceScale = (cue?.sourceWorldUnit ?? worldUnit) / worldUnit * (actor.geometry?.source_pixels_per_world_unit ?? 400) / (original.geometry?.source_pixels_per_world_unit ?? 400);
            const growth = sourceScale * (1 + phase.morph * .18);
            c.globalAlpha = 1 - phase.morph;
            c.drawImage(originalImage, actor.anchor[0] - original.anchor[0] * growth, actor.anchor[1] - original.anchor[1] * growth, original.size[0] * growth, original.size[1] * growth);
            c.globalCompositeOperation = "lighter";
          }
          c.globalAlpha = empowering ? phase.morph : 1;
          c.drawImage(image.current, 0, 0, w, h);
          c.globalAlpha = 1;
          c.globalCompositeOperation = "source-in";
          const g = c.createLinearGradient(0, h, w * .25, 0);
          g.addColorStop(0, "#ffdd79"); g.addColorStop(.4, "#ff731b"); g.addColorStop(1, "#cf2217");
          c.fillStyle = g; c.fillRect(-w/2, -h/2, w*2, h*2);
          c.globalCompositeOperation = "source-atop";
          for (let i = 0; i < 26; i++) {
            const x = (i * 83.7) % w, y = h - ((elapsed * (.3 + i % 4 * .08) + i * 53) % h);
            const flame = c.createRadialGradient(x, y, 0, x, y, 24);
            flame.addColorStop(0, "#fff3b9"); flame.addColorStop(1, "#ffad2600");
            c.fillStyle = flame; c.fillRect(x - 24, y - 24, 48, 48);
          }
          c.restore();
          canvas.style.opacity = String(1 - reveal);
        }
      }
      // Source-pixel registration is separate from the pose's existing CSS transform.
      // Reset on attacks/hits/death so their authored movement stays untouched.
      if (frame.offsetX) {
        const fit = Math.min(image.current.clientWidth / actor.size[0], image.current.clientHeight / actor.size[1]);
        const transform = new DOMMatrixReadOnly(getComputedStyle(image.current).transform);
        image.current.style.translate = `${frame.offsetX * fit * Math.abs(transform.a)}px 0`;
      } else image.current.style.translate = "";
      image.current.dataset.clip =
        requested === "die"
          ? "die"
          : (requested === "empower" ? elapsed < EMPOWER_MS : elapsed < initial.duration)
            ? requested
            : resting;
      if (requested === "die" && elapsed >= initial.duration) {
        setDeathFinished(true);
        return;
      }
      raf = requestAnimationFrame(render);
    };
    raf = requestAnimationFrame(render);
    return () => {
      alive = false;
      cancelAnimationFrame(raf);
    };
  }, [states, sequence, requestedState, resting, failed, animationSeed, cue?.fromArt, cue?.startedAt, cue?.sourceWorldUnit]);
  return (
    <div
      className={`actor-sprite ${className}${cue?.state === "spawn" && hp > 0 ? " arriving" : ""}${pixelsPerUnit ? " source-scaled-summon" : ""}`}
      data-art={art}
      data-spawn-reveal={actor?.spawnReveal}
      data-empowering={cue?.state === "empower" || undefined}
      data-death-effect={actor?.deathEffect}
      style={pixelsPerUnit ? { height: `calc(var(--summon-world-unit, 200px) * ${(geometry!.layout_bounds_px ? actor.anchor[1] - geometry!.layout_bounds_px[1] : geometry!.reference_visible_height_px) / pixelsPerUnit})` } : undefined}
    >
      <img
        ref={image}
        style={{...summonStyle, ...((cue?.state === "empower" || cue?.state === "spawn" && actor?.spawnReveal !== "authored") ? {opacity: 0} : {})}}
        src={failed ? assets.images[art] : states?.idle.frames[0].src || assets.images[art]}
        onError={() => { setFailed(true); if (image.current) image.current.style.opacity = "1"; }}
        alt={name}
        draggable={false}
      />
      {(cue?.state === "empower" || cue?.state === "spawn" && actor?.spawnReveal !== "authored") && hp > 0 && <canvas ref={fire} width={(actor?.size[0] ?? 512) * (empoweringCue ? 2 : 1)} height={(actor?.size[1] ?? 512) * (empoweringCue ? 2 : 1)} className="summon-fire-silhouette" style={{...fireStyle, pointerEvents: "none", filter: "drop-shadow(0 0 7px #ff671d) drop-shadow(0 0 16px #ff300a)"}} aria-hidden="true" />}
      {art === "demon-lord" && <DemonLordGlow image={image} active={hp > 0} enraged={hp / maxHp <= .5} sockets={actor?.effects} />}
      {deathFinished && hp <= 0 && actor.deathEffect === "fire" && image.current && <FireDeathEffect image={image.current} audible={wasAlive.current} />}
    </div>
  );
}

