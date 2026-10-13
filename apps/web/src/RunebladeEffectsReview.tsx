import {useEffect,useRef,useState} from 'react';
import type {Assets} from './assets';
import {arrangeWarband} from './warbandLayout';
import {drawRunebladeSummon,drawIceShield} from './runebladeSpellEffects';
import {burialReveal,reversedDeathFrame,RUNEBLADE_SUMMON as timing} from './runebladeSummonTiming';
export function RunebladeEffectsReview({assets}:{assets:Assets}){
 const canvas=useRef<HTMLCanvasElement>(null),fixed=useRef<number|null>(null),countRef=useRef(5),[count,setCount]=useState(5);
 useEffect(()=>{let raf=0,alive=true;const cache=new Map<string,HTMLImageElement>();
 const kinds=['rime-seer','rune-revenant','frost-thrall','bone-defender','shattered-queen'];
 const srcs=kinds.flatMap(k=>Object.values(assets.actors['summon-'+k].states).flatMap(s=>s.frames.map(f=>f.src)));
 Promise.all([...new Set(srcs)].map(src=>new Promise<void>(resolve=>{const img=new Image();img.onload=()=>resolve();img.onerror=()=>resolve();img.src=src;cache.set(src,img);}))).then(()=>{
 if(!alive)return;const c=canvas.current!.getContext('2d')!,start=performance.now();
 const tick=(now:number)=>{if(!alive)return;const t=fixed.current??(now-start)%4200;c.fillStyle='#152330';c.fillRect(0,0,1000,590);c.fillStyle='#353a3c';c.fillRect(0,475,1000,115);
 const units=kinds.slice(0,countRef.current).map((kind,id)=>({kind,id})),layout=arrangeWarband(units,assets);
 const effects=units.map(u=>{const s=layout.slots.get(u.id)!;return {id:u.id,kind:'summon' as const,frost:true,start:0,duration:timing.duration,release:timing.release,travel:timing.travel,from:{x:65,y:220},targets:[{x:170+s.x+s.width/2,y:100+(s.airborne?376:s.root)}],height:250,scale:1};});
 effects.forEach(e=>drawRunebladeSummon(c,e,t,true));
 [...units].sort((a,b)=>layout.slots.get(a.id)!.depth-layout.slots.get(b.id)!.depth).forEach(u=>{const s=layout.slots.get(u.id)!,a=assets.actors[s.art],clip=a.states.idle;const frame=t<timing.riseEnd?reversedDeathFrame(a.states.die.frames,a.states.die.duration,t)!:clip.frames[Math.max(0,clip.frames.findLastIndex(f=>f.time<=(t-timing.riseEnd)%clip.duration))];const img=cache.get(frame.src),scale=s.worldUnit/a.geometry!.source_pixels_per_world_unit!,rise=Math.max(0,Math.min(1,(t-timing.riseStart)/(timing.riseEnd-timing.riseStart)));
 c.save();const top=100+s.root-a.anchor[1]*scale+(s.airborne?(376-s.root)*(1-rise):0);c.beginPath();c.rect(0,top,1000,a.size[1]*scale*burialReveal(t));c.clip();
 if(t>=timing.riseStart&&img?.complete&&img.naturalWidth)c.drawImage(img,170+s.x+s.width/2-a.anchor[0]*scale,100+s.root-a.anchor[1]*scale+(s.airborne?(376-s.root)*(1-rise):0),a.size[0]*scale,a.size[1]*scale);
 c.restore();});effects.forEach(e=>drawRunebladeSummon(c,e,t,false));drawIceShield(c,{x:925,y:300},.6,1,t);
 c.fillStyle='#d9f5ff';c.font='16px sans-serif';c.fillText('Runeblade - fixed-size formation / reversed death poses',25,30);c.fillText(Math.round(t)+' ms',25,55);raf=requestAnimationFrame(tick);};raf=requestAnimationFrame(tick);});return()=>{alive=false;cancelAnimationFrame(raf);};},[assets]);
 return <main style={{padding:24,color:'#d9f5ff',background:'#10202c',minHeight:'100vh'}}><h1>Runeblade effects review - burial revision 3</h1><p>Ground strike, burial mound, resurrection, idle. Compare fixed-size formations below.</p><canvas ref={canvas} width={1000} height={590} style={{width:'min(100%, 1100px)'}}/><div><button onClick={()=>fixed.current=null}>Play loop</button>{[300,700,1000,1650,2300,3000].map(t=><button key={t} onClick={()=>fixed.current=t}>{t} ms</button>)}<label> Summons <select value={count} onChange={e=>{const n=Number(e.target.value);setCount(n);countRef.current=n;}}>{[1,2,3,4,5].map(n=><option key={n}>{n}</option>)}</select></label></div></main>;
}
