import { useEffect, useRef } from "react";
import { assetUrl } from "./baseUrl";
export type EmberHotspot={x:number;y:number;radius:number};
/** Material-clipped lava flow. The mask comes from the exact unchanged terrain pixels. */
export function InfernalAmbient({hotspots,mode="map"}:{hotspots:readonly EmberHotspot[];mode?:"map"|"shop"}) {
 const canvas=useRef<HTMLCanvasElement>(null);
 useEffect(()=>{
  const el=canvas.current;if(!el)return;
  const ctx=el.getContext("2d");if(!ctx)return;
  const reduce=matchMedia("(prefers-reduced-motion: reduce)");let frame=0,alive=true,last=0,lastSizeCheck=0;
  const mask=new Image();let ready=false;
  const resize=()=>{const box=el.getBoundingClientRect();/* Bound fill rate independently of map zoom. */const width=Math.max(1,Math.min(2560,Math.round(box.width*Math.min(1.5,devicePixelRatio||1)))),height=Math.max(1,Math.round(width*box.height/Math.max(1,box.width)));if(el.width!==width||el.height!==height){el.width=width;el.height=height;}};
  resize();
  const paint=(time:number)=>{
   if(!alive)return;
   if(!reduce.matches){frame=requestAnimationFrame(paint);if(time-last<32)return;last=time;}
   if(time-lastSizeCheck>500){lastSizeCheck=time;resize();}
   const w=el.width,h=el.height,t=reduce.matches?0:time*.001;ctx.clearRect(0,0,w,h);
   if(mode==="map"){
    if(!ready)return;
    // Broad diagonal highlights travel along the lava, then destination-in removes every land pixel.
    ctx.fillStyle=`rgba(255,135,15,${reduce.matches?.1:.14+Math.sin(t*.7)*.035})`;ctx.fillRect(0,0,w,h);
    if(!reduce.matches){
     const spacing=w*.037,shift=(t*w*.017)%spacing;
     ctx.lineCap="round";
     for(let line=-30;line<42;line++){
      const start=line*spacing+shift;ctx.beginPath();ctx.moveTo(start,-h*.1);
      for(let y=0;y<=h;y+=h/25)ctx.lineTo(start+y*.5+Math.sin(y/h*22+t*.55+line)*w*.009,y);
      ctx.strokeStyle="rgba(255,238,125,.42)";ctx.lineWidth=Math.max(2,w*.003);ctx.stroke();
      ctx.strokeStyle="rgba(255,181,38,.19)";ctx.lineWidth=Math.max(5,w*.008);ctx.stroke();
     }
     // Small translucent smoke curls originate at several river junctions, never covering dry terrain.
     const vents=[[31.5,33],[43.5,38],[21.7,55],[34.5,72],[50.5,72],[63,44],[68.5,55],[72,33],[89,67]];
     vents.forEach(([sx,sy],i)=>{for(let j=0;j<5;j++){
      const progress=(t*.13+j*.2+i*.093)%1,r=w*(.006+progress*.012),x=w*(sx/100+Math.sin(progress*4+i)*.004),y=h*(sy/100-progress*.047);
      const smoke=ctx.createRadialGradient(x,y,0,x,y,r);smoke.addColorStop(0,`rgba(99,83,88,${Math.sin(progress*Math.PI)*.36})`);smoke.addColorStop(1,"rgba(70,59,63,0)");ctx.fillStyle=smoke;ctx.fillRect(x-r,y-r,r*2,r*2);
     }});
    }
    ctx.globalCompositeOperation="destination-in";ctx.drawImage(mask,0,0,w,h);ctx.globalCompositeOperation="source-over";
    return;
   }
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
  if(mode==="map"){mask.onload=()=>{ready=true;if(alive)restart();};mask.src=assetUrl("/infernal-assets/map-lava-mask.png");}
  const observer=new ResizeObserver(()=>{resize();if(reduce.matches)paint(performance.now());});observer.observe(el);
  const reducedSizing=window.setInterval(()=>{if(reduce.matches){const before=el.width;resize();if(before!==el.width)paint(performance.now());}},500);
  reduce.addEventListener("change",restart);restart();
  return()=>{alive=false;window.clearInterval(reducedSizing);mask.onload=null;cancelAnimationFrame(frame);observer.disconnect();reduce.removeEventListener("change",restart);};
 },[hotspots,mode]);
 return <canvas className="infernal-ambient" ref={canvas} aria-hidden="true"/>;
}
