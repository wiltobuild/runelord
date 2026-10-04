import { useEffect, useRef, useState } from "react";
import { Application, Assets as PixiAssets, Sprite, Texture } from "pixi.js";
import type { Assets, Clip } from "./assets";
import { heroPlacement } from "./heroGeometry";
type Loaded = { clip: Clip; body: Texture[]; fx: Texture[] };
const cache = new WeakMap<Clip, Promise<Loaded>>();
function load(assets: Assets, name: string) {
  const clip = assets.animations[name] ?? (name === "wounded_idle" ? assets.animations.wounded : undefined);
  if (!clip) return Promise.reject(Error(`Missing hero clip: ${name}`));
  if (!cache.has(clip)) {
    cache.set(
      clip,
      Promise.all(
        clip.frames.map(async (f) => ({
          body: await PixiAssets.load<Texture>(f.body),
          fx: f.fx ? await PixiAssets.load<Texture>(f.fx) : Texture.EMPTY,
        })),
      ).then((frames) => ({
        clip,
        body: frames.map((f) => f.body),
        fx: frames.map((f) => f.fx),
      })).catch((error) => { cache.delete(clip); throw error; }),
    );
  }
  return cache.get(clip)!;
}
export async function warmHeroClip(assets:Assets, name:string) { await load(assets,name); }
export function Hero({
  assets,
  animation,
  sequence,
  empowered,
  hp,
  maxHp,
}: {
  assets: Assets;
  animation: string;
  sequence: number;
  empowered: boolean;
  hp?: number;
  maxHp?: number;
}) {
  const host = useRef<HTMLDivElement>(null),
    app = useRef<Application | null>(null),
    sprites = useRef<Sprite[]>([]),
    current = useRef<Loaded | null>(null),
    start = useRef(0),
    requested = useRef(0),
    [ready, setReady] = useState(false),
    [error, setError] = useState(false);
  useEffect(() => {
    let cancelled = false;
    const instance = new Application();
    async function init() {
      try {
        await instance.init({
          width: 500,
          height: 400,
          backgroundAlpha: 0,
          antialias: true,
          resolution: Math.min(devicePixelRatio, 2),
          autoDensity: true,
        });
        if (cancelled) {
          instance.destroy(true);
          return;
        }
        app.current = instance;
        host.current?.appendChild(instance.canvas);
        sprites.current = [new Sprite(), new Sprite()];
        for (const sprite of sprites.current) {
          sprite.width = 500;
          sprite.height = 400;
          instance.stage.addChild(sprite);
        }
        instance.ticker.add(() => {
          const c = current.current;
          if (!c) return;
          let t = performance.now() - start.current;
          if (c.clip.loop) t %= c.clip.duration;
          const frame = Math.max(
            0,
            c.clip.frames.findLastIndex((f) => f.time <= t),
          );
          sprites.current[0].texture = c.body[frame];
          sprites.current[1].texture = c.fx[frame];
          for (const sprite of sprites.current) {
            const placement = heroPlacement(c.clip);
            sprite.width = placement.width;
            sprite.height = placement.height;
            sprite.x = placement.x;
            sprite.y = placement.y;
          }
        });
        setReady(true);
      } catch {
        setError(true);
      }
    }
    void init();
    return () => {
      cancelled = true;
      if (app.current === instance) {
        instance.destroy(true, { children: true });
        app.current = null;
      }
    };
  }, []);
  const resting = hp !== undefined && maxHp && hp / maxHp < 0.3 ? "wounded_idle" : empowered ? "empowered_idle" : "idle_breathe";
  useEffect(() => {
    if (!ready) return;
    const request = ++requested.current;
    let timer: ReturnType<typeof setTimeout> | undefined;
    const name = ["idle", "idle_breathe", "empowered_idle", "victory"].includes(animation) ? resting : assets.animations[animation] ? animation : resting;
    load(assets, name)
      .then((c) => {
        if (request !== requested.current) return;
        setError(false);
        current.current = c;
        start.current = performance.now();
        if (!c.clip.loop && name !== "die")
          timer = setTimeout(() => {
            const idle = resting;
            load(assets, idle)
              .then((c) => {
                if (request === requested.current) {
                  current.current = c;
                  start.current = performance.now();
                }
              })
              .catch(() => { if (request === requested.current) setError(true); });
          }, c.clip.duration);
      })
      .catch(() => { if (request === requested.current) setError(true); });
    return () => {
      requested.current++;
      if (timer) clearTimeout(timer);
    };
  }, [assets, animation, sequence, resting, ready]);
  return (
    <div className={`hero-canvas${error ? " hero-load-error" : ""}`} ref={host} aria-label="Animated Warlock">
      {(!ready || error) && (
        <img
          className="hero-fallback"
          src={assets.images.warlock}
          alt="Warlock"
        />
      )}
      {error && <span className="animation-error">Animation unavailable</span>}
    </div>
  );
}
