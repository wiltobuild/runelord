import type { Assets } from './assets';
import type { SpellEffect } from './SpellEffects';
const images=new Map<string,HTMLImageElement>();
export function warmForestSpells(assets:Assets){
 return Promise.all(Object.values(assets.forestSpells??{}).flatMap(clip=>clip.frames.map(({src})=>{
  let im=images.get(src);if(!im){im=new Image();im.src=src;images.set(src,im)}return im.decode().catch(()=>undefined);
 })));
}
export function drawForestSpell(c:CanvasRenderingContext2D,e:SpellEffect,time:number,assets:Assets){
 const clip=assets.forestSpells?.[e.kind],elapsed=time-e.start-e.release;if(!clip||elapsed<0||elapsed>=clip.duration)return;
 const f=clip.frames.findLast(f=>f.time<=elapsed)??clip.frames[0],im=images.get(f.src);if(!im?.complete||!im.naturalWidth)return;
 const scale=e.scale??1;
 for(const point of e.targets.length?e.targets:[e.from]){
  c.save();c.globalAlpha=Math.min(1,(clip.duration-elapsed)/130);c.drawImage(im,point.x-clip.anchor[0]*scale,point.y-clip.anchor[1]*scale,clip.size[0]*scale,clip.size[1]*scale);c.restore();
 }
}
