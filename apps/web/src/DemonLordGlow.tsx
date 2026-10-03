import { useEffect, useRef, type RefObject } from "react";
export type DemonGlowSockets = { eyes:number[][]; crown:number[] };

export function DemonLordGlow({ image, active, enraged, sockets }: {image:RefObject<HTMLImageElement|null>;active:boolean;enraged:boolean;sockets?:DemonGlowSockets}) {
  const canvas=useRef<HTMLCanvasElement>(null);
  useEffect(()=>{
    const el=canvas.current!,c=el.getContext("2d");if(!c)return;
    let raf=0,last=0;
    const draw=(time:number)=>{
      raf=requestAnimationFrame(draw);if(time-last<33)return;last=time;
      const img=image.current;if(!img)return;
      const w=img.clientWidth,h=img.clientHeight,dpr=Math.min(devicePixelRatio,2);
      if(el.width!==Math.round(w*dpr)||el.height!==Math.round(h*dpr)){el.width=Math.round(w*dpr);el.height=Math.round(h*dpr);}
      const css=getComputedStyle(img);el.style.transform=css.transform;el.style.transformOrigin=css.transformOrigin;el.style.translate=img.style.translate;
      c.setTransform(dpr,0,0,dpr,0,0);c.clearRect(0,0,w,h);if(!active||document.hidden)return;
      const source=img.dataset.glow?JSON.parse(img.dataset.glow) as DemonGlowSockets:sockets;if(!source)return;
      const fit=Math.min(w/(img.naturalWidth||1),h/(img.naturalHeight||1));
      const iw=img.naturalWidth*fit,ih=img.naturalHeight*fit,ox=(w-iw)/2,oy=(h-ih)/2;
      const reduced=matchMedia('(prefers-reduced-motion: reduce)').matches,t=reduced?0:time*.001;
      c.globalCompositeOperation='lighter';
      const glow=(x:number,y:number,r:number,color:string,alpha:number)=>{const g=c.createRadialGradient(x,y,0,x,y,r);g.addColorStop(0,color);g.addColorStop(1,color+'00');c.globalAlpha=alpha;c.fillStyle=g;c.beginPath();c.arc(x,y,r,0,Math.PI*2);c.fill();};
      const cx=ox+source.crown[0]*iw,cy=oy+source.crown[1]*ih;
      glow(cx,cy,iw*.10,'#ff5422',.28);
      for(let i=0;i<9;i++){
        const x=cx+(i-4)*iw*.012,y=cy+Math.abs(i-4)*ih*.004;
        const length=ih*(.032+.022*(.5+.5*Math.sin(t*8+i*1.7)))*(enraged?1.4:1),half=iw*.007;
        const g=c.createLinearGradient(x,y,x,y-length);g.addColorStop(0,'#fff0a4');g.addColorStop(.3,'#ff8b24');g.addColorStop(1,'#e32a3800');c.fillStyle=g;c.globalAlpha=.8;
        c.beginPath();c.moveTo(x-half,y);c.quadraticCurveTo(x-half*2,y-length*.5,x+Math.sin(t*5+i)*half,y-length);c.quadraticCurveTo(x+half*2,y-length*.4,x+half,y);c.fill();
      }
      for(let i=0;i<12;i++){const p=(t*.35+i/12)%1;c.globalAlpha=Math.sin(p*Math.PI)*.65;c.fillStyle='#ffd48b';c.fillRect(cx+Math.sin(i*2.4+t)*iw*.065,cy-p*ih*.16,1.3,2.5);}
      c.globalAlpha=1;
    };
    raf=requestAnimationFrame(draw);return()=>cancelAnimationFrame(raf);
  },[image,active,enraged,sockets]);
  return <canvas className="demon-lord-glow" ref={canvas} aria-hidden="true" style={{position:'absolute',inset:0,width:'100%',height:'100%',pointerEvents:'none'}}/>;
}
