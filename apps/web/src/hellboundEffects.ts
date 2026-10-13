import type { SpellEffect } from './SpellEffects';
import { glowTexture } from './effectTextures';
const clamp=(v:number)=>Math.max(0,Math.min(1,v));

/** Continuous-time ornament/VFX; authored character frames remain untouched. */
export function drawHellboundEffect(c:CanvasRenderingContext2D,e:SpellEffect,time:number){
 const age=time-e.start,progress=clamp(age/e.duration);
 if(age<0||progress>=1)return;
 const fade=Math.min(1,age/180,(e.duration-age)/350);
 c.save();c.globalAlpha=fade;c.globalCompositeOperation='lighter';
 if(e.kind==='promotion'){
  const p=e.targets[0]??e.from;
  c.drawImage(glowTexture('#bc002b'),p.x-105,p.y-150,210,230);
  // A rising blood seal and inward horns replace the old golden rank chevrons.
  c.save();c.translate(p.x,p.y+24);c.scale(1,.32);c.rotate(age*.001);
  for(let ring=0;ring<2;ring++){
   c.strokeStyle=ring?'#ff294d':'#850020';c.lineWidth=3;
   c.beginPath();c.arc(0,0,48+ring*10,0,Math.PI*2);c.stroke();
  }
  c.strokeStyle='#ff3158';c.lineWidth=2;c.beginPath();
  for(let i=0;i<=5;i++){const angle=-Math.PI/2+i*4*Math.PI/5;const x=Math.cos(angle)*43,y=Math.sin(angle)*43;if(i===0)c.moveTo(x,y);else c.lineTo(x,y);}
  c.stroke();c.restore();
  for(const side of [-1,1]){
   c.strokeStyle='#e91b3d';c.lineWidth=4;c.beginPath();
   c.moveTo(p.x+side*12,p.y-40-progress*30);
   c.bezierCurveTo(p.x+side*55,p.y-50,p.x+side*50,p.y-100,p.x+side*28,p.y-125-progress*22);c.stroke();
  }
  for(let i=0;i<24;i++){
   const phase=(progress+i/24)%1,angle=i*2.399+age*.003;
   c.fillStyle=i%3?'#ff183e':'#ff735a';
   c.fillRect(p.x+Math.cos(angle)*(45-phase*20),p.y+35-phase*185,2,6);
  }
 }else{
  const p=e.from,opening=Math.sin(Math.PI*clamp(progress*1.3))*.15+.85;
  c.save();c.translate(p.x,p.y-80);c.scale(opening,opening);
  c.globalCompositeOperation='source-over';c.fillStyle=`rgba(22,3,31,${fade*.9})`;
  c.beginPath();c.ellipse(0,0,48,102,0,0,Math.PI*2);c.fill();
  c.globalCompositeOperation='lighter';
  c.drawImage(glowTexture('#ff5438'),-100,-140,200,280);
  for(let ring=0;ring<3;ring++){
   c.strokeStyle=['#ff512e','#ffc276','#b477ef'][ring];c.lineWidth=3-ring*.6;
   c.beginPath();c.ellipse(0,0,48+ring*5,102+ring*7,0,0,Math.PI*2);c.stroke();
  }
  for(let i=0;i<36;i++){
   const a=i/36*Math.PI*2+age*.0005,x=Math.cos(a)*56,y=Math.sin(a)*113;
   const flicker=9+Math.sin(age*.018+i*3)*5;
   c.strokeStyle=i%3?'#ff953c':'#fff0b2';c.lineWidth=2;
   c.beginPath();c.moveTo(x,y);c.lineTo(x+Math.cos(a)*flicker,y+Math.sin(a)*flicker-8);c.stroke();
  }
  c.restore();
 }
 c.restore();
}
