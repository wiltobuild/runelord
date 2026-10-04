import { useEffect, useRef } from "react";

export type EmberHotspot={x:number;y:number;radius:number};
/** Reused shop-specific lava glow and drifting embers. */
export function ShopAmbient({hotspots}:{hotspots:readonly EmberHotspot[]}) {
 const canvas=useRef<HTMLCanvasElement>(null);
 useEffect(()=>{
  const el=canvas.current;if(!el)return;
  const ctx=el.getContext("2d");if(!ctx)return;
  const reduce=matchMedia("(prefers-reduced-motion: reduce)");let frame=0,alive=true,last=0,lastSizeCheck=0;

  const resize=()=>{const box=el.getBoundingClientRect();/* Bound fill rate independently of map zoom. */const width=Math.max(1,Math.min(2560,Math.round(box.width*Math.min(1.5,devicePixelRatio||1)))),height=Math.max(1,Math.round(width*box.height/Math.max(1,box.width)));if(el.width!==width||el.height!==height){el.width=width;el.height=height;}};
  resize();
  const paint=(time:number)=>{
   if(!alive)return;
   if(!reduce.matches){frame=requestAnimationFrame(paint);if(time-last<32)return;last=time;}
   if(time-lastSizeCheck>500){lastSizeCheck=time;resize();}
   const w=el.width,h=el.height,t=reduce.matches?0:time*.001;ctx.clearRect(0,0,w,h);
   hotspots.forEach((spot,index)=>{
    const cover=Math.max(w/1672,h/941),artW=1672*cover,artH=941*cover;
    const x=(w-artW)/2+spot.x*artW/100,y=(h-artH)/2+spot.y*artH/100,r=spot.radius*artW/100;
    const pulse=reduce.matches?.18:.17+Math.sin(time*.0014+index*1.7)*.07;
    const glow=ctx.createRadialGradient(x,y,0,x,y,r);glow.addColorStop(0,`rgba(255,101,20,${pulse})`);glow.addColorStop(1,"rgba(255,50,0,0)");ctx.fillStyle=glow;ctx.fillRect(x-r,y-r,r*2,r*2);
    if(!reduce.matches)for(let j=0;j<7;j++){
     const progress=(time*.00011+j*.173+index*.13)%1,px=x+Math.sin(j*7.3+index)*r*.55+Math.sin(time*.0005+j)*r*.08,py=y-progress*r*2;
     ctx.fillStyle=`rgba(255,${155+j*10},65,${Math.sin(progress*Math.PI)*.65})`;ctx.beginPath();ctx.arc(px,py,Math.max(.7,w/1400),0,Math.PI*2);ctx.fill();
    }
   });
  };
  const restart=()=>{cancelAnimationFrame(frame);last=0;paint(performance.now());};
  const observer=new ResizeObserver(()=>{resize();if(reduce.matches)paint(performance.now());});observer.observe(el);
  const reducedSizing=window.setInterval(()=>{if(reduce.matches){const before=el.width;resize();if(before!==el.width)paint(performance.now());}},500);
  reduce.addEventListener("change",restart);restart();
  return()=>{alive=false;window.clearInterval(reducedSizing);cancelAnimationFrame(frame);observer.disconnect();reduce.removeEventListener("change",restart);};
 },[hotspots]);
 return <canvas className="infernal-ambient" ref={canvas} aria-hidden="true"/>;
}
