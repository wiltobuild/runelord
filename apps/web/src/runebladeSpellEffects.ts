import type {Point,SpellEffect} from './SpellEffects';
import {BURIAL_EMERGE_MS, RUNEBLADE_SUMMON as timing} from './runebladeSummonTiming';
const clamp=(n:number)=>Math.max(0,Math.min(1,n));
const cyan='#8ceaff',white='#edfcff',blue='#328ab8';
function crystal(c:CanvasRenderingContext2D,x:number,y:number,r:number,angle=0){
 c.save();c.translate(x,y);c.rotate(angle);c.beginPath();c.moveTo(0,-r);c.lineTo(r*.34,0);c.lineTo(0,r*.5);c.lineTo(-r*.34,0);c.closePath();c.fillStyle=blue;c.fill();
 c.beginPath();c.moveTo(0,-r);c.lineTo(0,r*.5);c.lineTo(-r*.34,0);c.closePath();c.fillStyle=cyan;c.fill();c.strokeStyle=white;c.lineWidth=.7;c.beginPath();c.moveTo(0,-r);c.lineTo(-r*.34,0);c.stroke();c.restore();
}
function frostBurst(c:CanvasRenderingContext2D,p:Point,t:number,size=1){
 if(t<0||t>650)return;const q=t/650;c.save();c.globalAlpha=(1-q)*.9;
 for(let i=0;i<14;i++){const a=i*2.399,r=(14+q*(40+i%4*11))*size;crystal(c,p.x+Math.cos(a)*r,p.y+Math.sin(a)*r*.65+q*q*20, (9+i%3*4)*(1-q*.65)*size,a+q);}
 c.strokeStyle=cyan;c.lineWidth=2*(1-q);c.beginPath();c.ellipse(p.x,p.y,(10+q*85)*size,(6+q*42)*size,0,0,Math.PI*2);c.stroke();c.restore();
}
export function drawIceShield(c:CanvasRenderingContext2D,p:Point,size=1,strength=1,clock=0){
 c.save();c.translate(p.x,p.y);c.scale(size,size);c.globalAlpha=clamp(strength);
 c.beginPath();c.moveTo(0,-104);c.lineTo(49,-70);c.lineTo(58,5);c.lineTo(30,68);c.lineTo(0,92);c.lineTo(-30,68);c.lineTo(-58,5);c.lineTo(-49,-70);c.closePath();
 c.fillStyle='#27618542';c.fill();c.strokeStyle=cyan;c.lineWidth=2.5;c.stroke();
 c.beginPath();c.moveTo(0,-104);c.lineTo(-28,-42);c.lineTo(-58,5);c.lineTo(0,92);c.lineTo(28,-42);c.closePath();c.fillStyle='#b5f3ff20';c.fill();c.strokeStyle='#a6e9ff70';c.lineWidth=1;c.stroke();
 for(let i=0;i<6;i++){const a=i*Math.PI/3;crystal(c,Math.cos(a)*45,Math.sin(a)*76,13,a);}
 c.strokeStyle=white;c.lineWidth=2;c.beginPath();c.moveTo(0,-28);c.lineTo(17,0);c.lineTo(0,28);c.lineTo(-17,0);c.closePath();c.moveTo(0,-38);c.lineTo(0,38);c.stroke();
 c.globalAlpha=clamp(strength)*(.35+.15*Math.sin(clock*.003));c.strokeStyle=white;c.beginPath();c.moveTo(-45,-65);c.lineTo(-50,-5);c.stroke();c.restore();
}
/** Runeblade owns its geometry and palette; never delegates to infernal fire. */
export function drawRunebladeSpell(c:CanvasRenderingContext2D,e:SpellEffect,time:number){
 const t=time-e.start;if(t<0||t>e.duration)return;
 if(e.kind==='summon'){drawRunebladeSummon(c,e,time,false);return;}
 const after=t-e.release,impact=after-e.travel,s=e.scale??1;c.save();
 if(t<e.release){c.globalAlpha=clamp(t/Math.max(1,e.release));crystal(c,e.from.x,e.from.y,13+s*5,t*.003);}
 for(const p of e.targets){
  if(e.kind==='ward'||e.kind==='nature-ward'){
   if(after>=0)drawIceShield(c,p,s*clamp(after/230),clamp(after/120)*clamp((e.duration-t)/650),t);
   continue;
  }
  if(['command','kindle','pact','ascend','sacrifice-rite','sacrifice-feast','ember-feast'].includes(e.kind)){
   if(after<0)continue;const q=clamp(after/700),fade=clamp((e.duration-t)/350);c.globalAlpha=fade;
   for(let n=0;n<5;n++){const a=n*1.257+t*.001;crystal(c,p.x+Math.cos(a)*(30+q*16)*s,p.y+Math.sin(a)*35*s,12*s,a);}
   if(e.kind==='pact'||e.kind.startsWith('sacrifice')){c.strokeStyle=cyan;c.lineWidth=2;c.beginPath();c.moveTo(p.x,p.y);c.quadraticCurveTo((p.x+e.from.x)/2,p.y-70,e.from.x,e.from.y);c.stroke();}
   continue;
  }
  if(after>=0&&after<e.travel){const q=clamp(after/Math.max(1,e.travel)),x=e.from.x+(p.x-e.from.x)*q,y=e.from.y+(p.y-e.from.y)*q;const a=Math.atan2(p.y-e.from.y,p.x-e.from.x)+Math.PI/2;
   for(let j=3;j>=0;j--){c.globalAlpha=1-j*.22;crystal(c,x-(p.x-e.from.x)*j*.025,y-(p.y-e.from.y)*j*.025,(19-j*3)*s,a);}
  }
  if(e.kind==='frost-slash'||e.kind==='lash'){
   if(impact>=0&&impact<500){const q=impact/500;c.globalAlpha=1-q;c.strokeStyle=white;c.lineWidth=4*(1-q);c.beginPath();c.moveTo(p.x-45*s,p.y+60*s);c.lineTo(p.x+40*s,p.y-60*s);c.stroke();crystal(c,p.x+25*s,p.y-20*s,45*s,.55);}
  }
  frostBurst(c,p,impact,s*(e.kind==='conflagrate'?1.4:1));
 }
 c.restore();
}
/** Two-layer burial mound: soil behind the actor and a low foreground lip. */
export function drawRunebladeSummon(c:CanvasRenderingContext2D,e:SpellEffect,time:number,ground:boolean){
 const t=time-e.start,p=e.targets[0];if(!p||t<0||t>timing.duration)return;
 const s=Math.min(1.4,Math.max(.65,e.scale??1)),r=Math.max(155*s,(e.height??200)*.68);
 const grow=clamp((t-timing.groundImpact)/(timing.riseStart-timing.groundImpact)),fade=clamp((timing.duration-t)/(timing.duration-timing.riseEnd)),rise=clamp((t-timing.riseStart)/(timing.riseEnd-timing.riseStart));c.save();
 // Switch the complete mound behind the actor precisely when its first rising pose appears.
 const mound=()=>{c.save();c.globalAlpha=fade;
  // A solid, broad cap covers the collapsed pose, then breaks down around the rising body.
  const emerge=clamp((t-BURIAL_EMERGE_MS)/500);const cap=(115-70*emerge)*grow*s;
  c.fillStyle='#493f37';c.beginPath();c.moveTo(p.x-r,p.y+4);c.lineTo(p.x-r*.82,p.y-cap*.6);c.lineTo(p.x-r*.42,p.y-cap);c.lineTo(p.x+r*.15,p.y-cap*.94);c.lineTo(p.x+r*.65,p.y-cap*.72);c.lineTo(p.x+r,p.y+4);c.lineTo(p.x+r*.5,p.y+15*s);c.lineTo(p.x-r*.6,p.y+13*s);c.closePath();c.fill();
  c.fillStyle='#756352';c.beginPath();c.moveTo(p.x-r*.82,p.y-cap*.6);c.lineTo(p.x-r*.42,p.y-cap);c.lineTo(p.x+r*.15,p.y-cap*.94);c.lineTo(p.x-r*.1,p.y-cap*.55);c.closePath();c.fill();
  for(let i=0;i<8;i++){const x=p.x+(i-3.5)*r*.21,y=p.y-cap*(.3+(i%3)*.18);c.fillStyle=i%2?'#302e2b':'#8a7560';c.fillRect(x,y,9*s,5*s);}
 c.restore();};
 if(t>=timing.groundImpact && ground===(t>=BURIAL_EMERGE_MS))mound();
 if(ground){
  if(t>=timing.release&&t<timing.groundImpact){const q=(t-timing.release)/timing.travel,x=e.from.x+(p.x-e.from.x)*q,y=e.from.y+(p.y-e.from.y)*q; c.strokeStyle=cyan;c.lineWidth=4;c.beginPath();c.moveTo(e.from.x,e.from.y);c.lineTo(x,y);c.stroke();crystal(c,x,y,21,Math.atan2(p.y-e.from.y,p.x-e.from.x)+Math.PI/2);}
  if(t>=timing.groundImpact){c.globalAlpha=fade;c.fillStyle='#273038';c.beginPath();c.ellipse(p.x,p.y+4,r*1.13,17*s,0,0,Math.PI*2);c.fill();
   c.fillStyle='#615447';c.beginPath();c.moveTo(p.x-r,p.y);c.lineTo(p.x-r*.65,p.y-18*grow*s);c.lineTo(p.x-r*.25,p.y-32*grow*s);c.lineTo(p.x+r*.35,p.y-27*grow*s);c.lineTo(p.x+r*.8,p.y-12*grow*s);c.lineTo(p.x+r,p.y+4);c.closePath();c.fill();
   for(let i=0;i<7;i++)crystal(c,p.x+(i-3)*r*.27,p.y-8*s,8*s*(i%2+1),i*.5);
  }
 }else if(t>=timing.groundImpact){
  frostBurst(c,p,t-timing.groundImpact,s);c.globalAlpha=fade;
  const h=e.height??200;
  // Staggered expanding wavefronts erupt from the earth and dissipate upward.
  c.globalCompositeOperation='lighter';
  for(let i=0;i<5;i++){
   const age=t-timing.groundImpact-i*190;if(age<0)continue;
   const q=(age%950)/950,life=Math.sin(Math.PI*q)*fade;
   const y=p.y-q*h*.95,rx=r*(.25+q*.68),ry=(7+q*17)*s;
   const glow=c.createRadialGradient(p.x,y,0,p.x,y,rx);glow.addColorStop(0,'#59ceff00');glow.addColorStop(.65,'#40baff26');glow.addColorStop(1,'#8eeaff00');
   c.globalAlpha=life;c.fillStyle=glow;c.beginPath();c.ellipse(p.x,y,rx,ry*2.2,0,0,Math.PI*2);c.fill();
   c.strokeStyle=cyan;c.lineWidth=(16-9*q)*s;c.globalAlpha=life*.65;c.beginPath();c.ellipse(p.x,y,rx,ry,0,Math.PI*.08,Math.PI*.92);c.stroke();
   c.strokeStyle=white;c.lineWidth=3*s;c.globalAlpha=life*.8;c.beginPath();c.ellipse(p.x,y-2*s,rx*.87,ry,0,Math.PI*1.12,Math.PI*1.85);c.stroke();
  }
  for(let i=0;i<18;i++){const q=((t-timing.groundImpact)/850+i*.071)%1,a=i*2.4;c.globalAlpha=fade*Math.sin(Math.PI*q)*.6;crystal(c,p.x+Math.cos(a)*r*q*.85,p.y-q*h*.8,3+3*(1-q),a);}
 }
 c.restore();
}
