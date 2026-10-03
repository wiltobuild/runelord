import { drawFireBurst } from "./fireBurstRenderer";
import { sfx } from "./sound";
import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";

export const FIRE_DEATH_MS = 1800;

/** The final pose is captured at its rendered size, including each model's CSS transform. */
export function FireDeathEffect({ image, audible = true }: { image: HTMLImageElement; audible?: boolean }) {
  const canvas = useRef<HTMLCanvasElement>(null);
  const [husk, setHusk] = useState(false);
  const battlefield = image.closest(".battlefield") as HTMLElement | null;
  const [placement] = useState(() => {
    const arena = battlefield?.getBoundingClientRect();
    const bounds = image.getBoundingClientRect();
    const scale = arena && battlefield ? arena.width / battlefield.offsetWidth : 1;
    const sample = document.createElement("canvas");
    sample.width = image.naturalWidth; sample.height = image.naturalHeight;
    const context = sample.getContext("2d", { willReadFrequently: true });
    let left = 0, top = 0, right = sample.width, bottom = sample.height;
    if (context && sample.width && sample.height) {
      context.drawImage(image, 0, 0);
      const pixels = context.getImageData(0, 0, sample.width, sample.height).data;
      left = sample.width; top = sample.height; right = 0; bottom = 0;
      for (let y = 0; y < sample.height; y++) for (let x = 0; x < sample.width; x++) {
        if (pixels[(y * sample.width + x) * 4 + 3] > 8) {
          left = Math.min(left, x); top = Math.min(top, y); right = Math.max(right, x + 1); bottom = Math.max(bottom, y + 1);
        }
      }
      if (!right) { left = 0; top = 0; right = sample.width; bottom = sample.height; }
    }
    return { left: (bounds.left - (arena?.left ?? 0)) / scale, top: (bounds.top - (arena?.top ?? 0)) / scale,
      width: bounds.width / scale, height: bounds.height / scale, src: image.src,
      silhouette: { x:left / sample.width, y:top / sample.height, width:(right-left) / sample.width, height:(bottom-top) / sample.height } };
  });
  useEffect(() => {
    const enemy = image.closest(".enemy") as HTMLElement | null;
    if (enemy) enemy.dataset.fireDeath = "burst";
    const el = canvas.current, ctx = el?.getContext("2d");
    if (!el || !ctx) return;
    if (audible) sfx.play("fire-death", 0, .3);
    let raf = 0;
    const start = performance.now();
    const draw = (now: number) => {
      const t = Math.max(0, Math.min(1, (now - start) / FIRE_DEATH_MS));
      const w = el.width, h = el.height;
      ctx.clearRect(0, 0, w, h);
      drawFireBurst(ctx, w, h, t);
      if (t >= .28 && enemy) enemy.dataset.fireDeath = "covered";
      if (t < 1) raf = requestAnimationFrame(draw);
      else { if (enemy) enemy.dataset.fireDeath = "husk"; setHusk(true); }
    };
    raf = requestAnimationFrame(draw);
    return () => { cancelAnimationFrame(raf); if (enemy) delete enemy.dataset.fireDeath; };
  }, [image]);
  if (!battlefield) return null;
  return createPortal(<>
    <img className="fire-death-husk" src={placement.src} alt="" aria-hidden="true" style={{left:placement.left,top:placement.top,width:placement.width,height:placement.height}} />
    {!husk && <canvas ref={canvas} className="fire-death-burst" width={600} height={600} aria-hidden="true"
      style={{ left: placement.left + placement.width * (placement.silhouette.x - placement.silhouette.width * .5),
        top: placement.top + placement.height * (placement.silhouette.y - placement.silhouette.height),
        width: placement.width * placement.silhouette.width * 2, height: placement.height * placement.silhouette.height * 3 }} />}
  </>, battlefield);
}
