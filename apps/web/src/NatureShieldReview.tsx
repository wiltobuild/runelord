import { useEffect, useRef, useState } from 'react';
import { loadAssets } from './assets';
import type { SpellEffect } from './SpellEffects';
import { drawNatureWard } from './natureWardEffect';
import { natureWardTarget } from './natureWardGeometry';
import './natureShieldReview.css';

declare global { interface Window { __natureShieldReview?: { ready:boolean; duration:number; render:(time:number)=>string; play:()=>void }; } }
export function NatureShieldReview() {
  const canvas=useRef<HTMLCanvasElement>(null),controls=useRef<{play:()=>void;render:(time:number)=>string}|null>(null);
  const [error,setError]=useState('');
  useEffect(()=>{let raf=0,alive=true;const el=canvas.current!;const ctx=el.getContext('2d')!;
    (async()=>{const assets=await loadAssets();const urls=[assets.images.forest,assets.actors['cairnback-hermit'].states.idle.frames[0].src,assets.actors['pleatcap-matriarch'].states.idle.frames[0].src];
      const imgs=await Promise.all(urls.map(src=>new Promise<HTMLImageElement>((resolve,reject)=>{const im=new Image();im.onload=()=>resolve(im);im.onerror=()=>reject(Error('Preview image unavailable'));im.src=src;})));
      if(!alive)return;let fixed:number|null=matchMedia("(prefers-reduced-motion: reduce)").matches?1250:null,start=performance.now();
      const effect:SpellEffect={id:1,kind:'ward',start:0,duration:3450,release:450,travel:0,from:{x:385,y:338},targets:[natureWardTarget('cairnback-hermit',{x:400,y:253,width:224,height:224}),natureWardTarget('pleatcap-matriarch',{x:791,y:250,width:217,height:224})]};
      const draw=(time:number)=>{ctx.clearRect(0,0,1280,720);ctx.drawImage(imgs[0],0,0,1280,720);ctx.fillStyle='#00180e33';ctx.fillRect(0,0,1280,720);
        ctx.drawImage(imgs[1],400,253,224,224);ctx.drawImage(imgs[2],791,250,217,224);drawNatureWard(ctx,effect,time);
        ctx.fillStyle='#071a13db';ctx.fillRect(30,30,489,74);ctx.fillStyle='#d9f4df';ctx.font='24px Georgia';ctx.fillText('THORNROOT WARD',48,62);ctx.font='13px Arial';ctx.fillStyle='#a9cbb6';ctx.fillText('Approved nature design · body-fitted shield · revision 2',48,87);
      };
      const render=(time:number)=>{fixed=time;draw(time);return el.toDataURL('image/png');};const play=()=>{fixed=null;start=performance.now();};
      controls.current={render,play};window.__natureShieldReview={ready:true,duration:4000,render,play};
      const tick=(now:number)=>{draw(fixed??(now-start)%4000);raf=requestAnimationFrame(tick);};raf=requestAnimationFrame(tick);
    })().catch(e=>setError(String(e)));return()=>{alive=false;cancelAnimationFrame(raf);delete window.__natureShieldReview;};
  },[]);
  return <main className="nature-shield-review"><div className="nature-review-heading"><span>RUNELORD / VISUAL REVIEW</span><h1>Thornroot Ward</h1><p>Emerald and mint light, a leaf-shaped shell, branching veins and drifting pollen.</p></div><canvas ref={canvas} width={1280} height={720} aria-label="Animated green nature shield over forest enemies"/><div className="nature-review-controls"><button onClick={()=>controls.current?.play()}>Replay animation</button><button onClick={()=>controls.current?.render(1250)}>Pause at full shield</button><button onClick={()=>controls.current?.render(2820)}>Inspect fade</button><span>Approved design with the crab's shield fitted to its body.</span></div>{error&&<p role="alert">{error}</p>}</main>;
}
