import fs from 'node:fs';
import {drawSummon} from '../../apps/web/src/summonEffect.ts';
import {createRequire} from 'node:module';
import {spawn} from 'node:child_process';
import {once} from 'node:events';
const require=createRequire(import.meta.url);
const {createCanvas,loadImage}=require('../../work/cinematic-tools/node_modules/@napi-rs/canvas');
const W=1920,H=1080,FPS=24,DURATION=24;
const out='assets/cinematics/oath-intro/r4/oath-intro-silent.mp4';
const ffmpeg=spawn('work/promo-tools/node_modules/ffmpeg-static/ffmpeg.exe',['-y','-f','image2pipe','-vcodec','mjpeg','-framerate',String(FPS),'-i','pipe:0','-an','-c:v','libx264','-preset','fast','-crf','20','-pix_fmt','yuv420p','-movflags','+faststart',out],{stdio:['pipe','ignore','pipe']});
let log='';ffmpeg.stderr.on('data',b=>{log+=b.toString();});
const canvas=createCanvas(W,H),c=canvas.getContext('2d');
const bg=await loadImage('assets/environments/menu-infernal-court/r1/source.png');
const hero=await loadImage('assets/cinematics/oath-intro/r2/demon-warlock.png');
const summons=Object.fromEntries(await Promise.all(['imp-flight','imp-ground','hellhound','pit-brute'].map(async id=>[id,await loadImage(`assets/cinematics/oath-intro/${id==='imp-flight'?'r4':'r3'}/${id}.png`)])));
let seed=1703;const rnd=()=>((seed=(Math.imul(seed,1664525)+1013904223)>>>0)/4294967296);
const particles=Array.from({length:150},()=>({x:rnd()*W,y:rnd()*H,s:1+rnd()*3,phase:rnd()*Math.PI*2,depth:rnd()}));
const tau=Math.PI*2;
function glow(x,y,r,color,alpha){c.save();c.globalAlpha=alpha;let g=c.createRadialGradient(x,y,0,x,y,r);g.addColorStop(0,color);g.addColorStop(1,'transparent');c.fillStyle=g;c.fillRect(x-r,y-r,r*2,r*2);c.restore();}
for(let frame=0;frame<FPS*DURATION;frame++){
 const t=frame/FPS,p=t/DURATION*tau; c.clearRect(0,0,W,H);
 const zoom=1.065+.018*Math.sin(p-Math.PI/2),bw=W*zoom,bh=H*zoom;
 c.drawImage(bg,(W-bw)/2+13*Math.sin(p),(H-bh)/2+7*Math.cos(p),bw,bh);
 c.fillStyle='#100c1644';c.fillRect(0,0,W,H);
 // User-selected Abyssal Seraph still gently levitates; aura is composited separately.

 glow(350,650,320,'#c82816',.24+.045*Math.sin(p*4));
 const hover=12*Math.sin(p*4);
 const heroHeight=920,heroWidth=hero.width/hero.height*heroHeight;
 c.save();c.shadowColor='#e95826';c.shadowBlur=12+3*Math.sin(p*4);
 c.drawImage(hero,350-heroWidth/2,65+hover,heroWidth,heroHeight);c.restore();

 // Use the combat renderer's actual demonic floor seals, at a cyclic rotation.
 function seal(x,y,r) { drawSummon(c,{id:1,start:0,duration:60000,release:0,targets:[{x,y}],scale:r/78},2000+p/.00018,true); }
 function summon(id,x,bottom,height,phase=0,flying=false,flip=false) {
   const im=summons[id],width=im.width/im.height*height;
   const bob=flying?7*Math.sin(p*4+phase):0;
   c.save();c.translate(x+width/2,bottom+bob);if(flip)c.scale(-1,1);
   c.shadowColor='#e45224';c.shadowBlur=flying?7:3;
   const breath=flying?1:1+.003*Math.sin(p*4+phase);
   c.scale(1,breath);c.drawImage(im,-width/2,-height,width,height);c.restore();
 }

 seal(350,970,185);
 // A front-facing hovering companion stays completely outside Seraph's wing bounds.
 summon('imp-flight',680,335,220,Math.PI,true);
 // Eight-second summon/advance cycles tile exactly across the24-second film.
 // Each actor exits completely below frame before its next portal opens.
 const lanes=[
   {id:'imp-ground',x:725,y:855,h:180,offset:0,r:75},
   {id:'hellhound',x:880,y:865,h:235,offset:2.65,r:135},
   {id:'pit-brute',x:1040,y:825,h:310,offset:5.3,r:140}
 ];
 const actors=[];
 for(const lane of lanes){
   const age=(t+lane.offset)%8;
   const portal={id:lanes.indexOf(lane)+10,start:0,duration:2400,release:250,targets:[{x:lane.x,y:lane.y}],scale:lane.r/78,height:lane.h};
   if(age<2.4)drawSummon(c,portal,age*1000,true);
   if(age>=7)continue;
   const emerge=Math.min(1,Math.max(0,(age-.25)/1.35));
   const walk=Math.min(1,Math.max(0,(age-1.9)/5.1));
   const scale=1+walk*.8;
   const height=lane.h*scale;
   const bottom=lane.y+walk*(H+height+90-lane.y);
   actors.push({lane,age,emerge,walk,height,bottom,portal});
 }
 actors.sort((a,b)=>a.bottom-b.bottom);
 for(const a of actors){
   const {lane,age,emerge,walk,height,bottom,portal}=a;
   const im=summons[lane.id],width=height*im.width/im.height;
   const stride=walk>0?Math.sin((age-1.9)*10):0;
   c.save();
   // Reveal upward from below the floor, never fade a complete floating sprite in.
   if(emerge<1){c.beginPath();c.rect(0,0,W,lane.y+3);c.clip();}
   c.translate(lane.x,bottom+(1-emerge)*height+Math.abs(stride)*4);
   c.rotate(stride*.012);c.globalAlpha=Math.min(1,emerge*3);
   c.drawImage(im,-width/2,-height,width,height);c.restore();
   // Foreground ribbons and sparks conceal the initial floor intersection.
   if(age<2.4)drawSummon(c,portal,age*1000,false);
 }
 // Broad, dark atmosphere drifts independently of the still art.
 for(let i=0;i<5;i++){const x=(i*480+170*Math.sin(p+i));glow(x,900+60*Math.sin(p*2+i),420,'#281d2e',.25);}
 const beat=t%6;const flare=beat<1.3?Math.sin(beat/1.3*Math.PI)**2:0;
 glow(110,680,480,'#ff7424',.11+flare*.16);glow(1800,800,440,'#ea461c',.12+flare*.12);
 for(const e of particles){let y=(e.y-t*(H/DURATION)*(e.depth>.6?2:1)+H*3)%H;let x=e.x+22*Math.sin(p*2+e.phase);let fade=Math.sin(y/H*Math.PI)**2;
 c.globalAlpha=(.2+e.depth*.65)*fade;c.fillStyle=e.depth>.65?'#ffbd66':'#a75831';c.beginPath();c.ellipse(x,y,e.s*.6,e.s*(1+e.depth),-.35,0,tau);c.fill();}
 c.globalAlpha=1;
 // Center remains quiet for the title and start prompt.
 let shade=c.createLinearGradient(0,0,W,0);shade.addColorStop(0,'#09070c22');shade.addColorStop(.38,'#09070c44');shade.addColorStop(.52,'#09070c55');shade.addColorStop(.75,'#09070c22');shade.addColorStop(1,'#09070c66');c.fillStyle=shade;c.fillRect(0,0,W,H);
 let vignette=c.createRadialGradient(W*.52,H*.48,200,W*.52,H*.48,1100);vignette.addColorStop(0,'transparent');vignette.addColorStop(1,'#030208aa');c.fillStyle=vignette;c.fillRect(0,0,W,H);
 c.fillStyle='#050408';c.fillRect(0,0,W,46);c.fillRect(0,H-46,W,46);
 if([0,36,72,120,168,288].includes(frame))fs.writeFileSync(`assets/cinematics/oath-intro/r4/still-${frame}.jpg`,canvas.toBuffer('image/jpeg',90));
 if(!ffmpeg.stdin.write(canvas.toBuffer('image/jpeg',91)))await once(ffmpeg.stdin,'drain');
 if(frame%144===0)console.log(`Rendered ${frame}/${FPS*DURATION} frames`);
}
ffmpeg.stdin.end();const [code]=await once(ffmpeg,'close');if(code!==0)throw Error(log);
fs.writeFileSync('assets/cinematics/oath-intro/r4/timeline.json',JSON.stringify({duration:24,fps:24,size:[W,H],loop:true,method:'Layered still artwork, selected Abyssal Seraph still with a 6-second gentle vertical hover, cyclic camera/parallax, procedural fog, embers, perspective seal and light pulses; no generated full-motion footage.',beats:[{time:0,visual:'Fortress and Warlock reveal; first fire pulse'},{time:6,visual:'Ember ascent and second fire pulse'},{time:12,visual:'Staggered portal emergence and forward advance; apex fire pulse'},{time:18,visual:'Return phrase; smoke recedes into loop'}],sourceArt:['assets/environments/menu-infernal-court/r1/source.png','assets/cinematics/oath-intro/r2/demon-warlock.png',...['imp-flight','imp-ground','hellhound','pit-brute'].map(id=>`assets/cinematics/oath-intro/${id==='imp-flight'?'r4':'r3'}/${id}.png`)],runtime:out},null,2));console.log('Cinematic video complete',out);
