import type { Assets } from './assets';
import type { SpellEffect } from './SpellEffects';
const images=new Map<string,HTMLImageElement>();
let blendSurface:HTMLCanvasElement|undefined;
export function warmForestSpells(assets:Assets){
 return Promise.all(Object.values(assets.forestSpells??{}).flatMap(clip=>clip.frames.map(({src})=>{
  let im=images.get(src);if(!im){im=new Image();im.src=src;images.set(src,im)}return im.decode().catch(()=>undefined);
 })));
}
export function drawForestSpell(c:CanvasRenderingContext2D,e:SpellEffect,time:number,assets:Assets){
 const clip=assets.forestSpells?.[e.kind],elapsed=time-e.start-e.release;if(!clip||elapsed<0||elapsed>=clip.duration)return;
 const index=Math.max(0,clip.frames.findLastIndex(f=>f.time<=elapsed));
 const f=clip.frames[index],im=images.get(f.src);if(!im?.complete||!im.naturalWidth)return;
 let drawable:CanvasImageSource=im;
 const next=clip.frames[index+1],nextImage=next&&images.get(next.src);
 if(next&&nextImage?.complete&&nextImage.naturalWidth){
  // Preserve authored keyframe times. Blend only near the boundary, avoiding
  // a hard four-frame flipbook without holding two ghost poses for a full beat.
  const window=Math.min(70,(next.time-f.time)/2);
  const mix=Math.max(0,Math.min(1,(elapsed-next.time+window)/window));
  if(mix>0){
   blendSurface??=document.createElement('canvas');
   if(blendSurface.width!==clip.size[0]||blendSurface.height!==clip.size[1]){blendSurface.width=clip.size[0];blendSurface.height=clip.size[1];}
   const b=blendSurface.getContext('2d')!;
   b.clearRect(0,0,blendSurface.width,blendSurface.height);
   // Add weighted premultiplied colors/alpha offscreen, then composite once.
   b.globalCompositeOperation='source-over';b.globalAlpha=1-mix;b.drawImage(im,0,0,blendSurface.width,blendSurface.height);
   b.globalCompositeOperation='lighter';b.globalAlpha=mix;b.drawImage(nextImage,0,0,blendSurface.width,blendSurface.height);
   b.globalCompositeOperation='source-over';b.globalAlpha=1;drawable=blendSurface;
  }
 }
 const scale=e.scale??1;
 for(const point of e.targets.length?e.targets:[e.from]){
  c.save();c.globalAlpha=Math.min(1,(clip.duration-elapsed)/130);c.drawImage(drawable,point.x-clip.anchor[0]*scale,point.y-clip.anchor[1]*scale,clip.size[0]*scale,clip.size[1]*scale);c.restore();
 }
}
