import fs from 'node:fs';
import {createRequire} from 'node:module';
import {spawn} from 'node:child_process';
import {once} from 'node:events';
const require=createRequire(import.meta.url);
const {createCanvas,loadImage}=require('../../work/cinematic-tools/node_modules/@napi-rs/canvas');
const W=1920,H=1080,FPS=24,DURATION=24;
const out='assets/cinematics/oath-intro/r1/oath-intro-silent.mp4';
const ffmpeg=spawn('work/promo-tools/node_modules/ffmpeg-static/ffmpeg.exe',['-y','-f','image2pipe','-vcodec','mjpeg','-framerate',String(FPS),'-i','pipe:0','-an','-c:v','libx264','-preset','fast','-crf','20','-pix_fmt','yuv420p','-movflags','+faststart',out],{stdio:['pipe','ignore','pipe']});
let log='';ffmpeg.stderr.on('data',b=>{log+=b.toString();});
const canvas=createCanvas(W,H),c=canvas.getContext('2d');
const bg=await loadImage('assets/environments/menu-infernal-court/r1/source.png');
const hero=await Promise.all([0,1,2,3].map(i=>loadImage(`apps/web/public/game-assets/warlock/frames32-r1/${i}.webp`)));
const demon=await loadImage('apps/web/public/game-assets/actors/demon-lord/fire-null/frames/00.webp');
let seed=1703;const rnd=()=>((seed=(Math.imul(seed,1664525)+1013904223)>>>0)/4294967296);
const particles=Array.from({length:150},()=>({x:rnd()*W,y:rnd()*H,s:1+rnd()*3,phase:rnd()*Math.PI*2,depth:rnd()}));
const tau=Math.PI*2,sequence=[0,1,2,3,2,1];
function glow(x,y,r,color,alpha){c.save();c.globalAlpha=alpha;let g=c.createRadialGradient(x,y,0,x,y,r);g.addColorStop(0,color);g.addColorStop(1,'transparent');c.fillStyle=g;c.fillRect(x-r,y-r,r*2,r*2);c.restore();}
for(let frame=0;frame<FPS*DURATION;frame++){
 const t=frame/FPS,p=t/DURATION*tau; c.clearRect(0,0,W,H);
 const zoom=1.065+.018*Math.sin(p-Math.PI/2),bw=W*zoom,bh=H*zoom;
 c.drawImage(bg,(W-bw)/2+13*Math.sin(p),(H-bh)/2+7*Math.cos(p),bw,bh);
 c.fillStyle='#100c1644';c.fillRect(0,0,W,H);
 // Distant adversary emerges from smoke on the third six-second phrase.
 c.save();c.globalAlpha=.25+.16*(.5+.5*Math.cos(p-Math.PI));c.drawImage(demon,1200+9*Math.sin(p),65+7*Math.cos(p*2),880,880);c.restore();
 glow(1620,430,320,'#d44221',.13+.08*Math.sin(p-Math.PI/2));
 // The existing lightweight whole-character poses provide real body movement.
 const pose=sequence[Math.floor(t*4)%sequence.length];
 glow(360,755,320,'#c82816',.24+.045*Math.sin(p*4));
 c.drawImage(hero[pose],-150,105,1060,1060);
 // Foreground magic seal has two counter-rotating, perspective rings.
 c.save();c.translate(350,950);c.scale(1,.22);c.rotate(p/2);c.strokeStyle='#d97031';c.globalAlpha=.36;c.lineWidth=3;
 for(const radius of [250,280]){c.beginPath();c.arc(0,0,radius,0,tau);c.stroke();}
 for(let i=0;i<16;i++){const a=i*tau/16;c.beginPath();c.moveTo(Math.cos(a)*250,Math.sin(a)*250);c.lineTo(Math.cos(a)*277,Math.sin(a)*277);c.stroke();}c.restore();
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
 if(frame===0||frame===288)fs.writeFileSync(`assets/cinematics/oath-intro/r1/still-${frame}.jpg`,canvas.toBuffer('image/jpeg',90));
 if(!ffmpeg.stdin.write(canvas.toBuffer('image/jpeg',91)))await once(ffmpeg.stdin,'drain');
 if(frame%144===0)console.log(`Rendered ${frame}/${FPS*DURATION} frames`);
}
ffmpeg.stdin.end();const [code]=await once(ffmpeg,'close');if(code!==0)throw Error(log);
fs.writeFileSync('assets/cinematics/oath-intro/r1/timeline.json',JSON.stringify({duration:24,fps:24,size:[W,H],loop:true,method:'Layered still artwork, source character idle poses, cyclic camera/parallax, procedural fog, embers, perspective seal and light pulses; no generated full-motion footage.',beats:[{time:0,visual:'Fortress and Warlock reveal; first fire pulse'},{time:6,visual:'Ember ascent and second fire pulse'},{time:12,visual:'Distant demon reaches maximum visibility; apex fire pulse'},{time:18,visual:'Return phrase; smoke recedes into loop'}],sourceArt:['assets/environments/menu-infernal-court/r1/source.png','apps/web/public/game-assets/warlock/frames32-r1/0.webp','apps/web/public/game-assets/actors/demon-lord/fire-null/frames/00.webp'],runtime:out},null,2));console.log('Cinematic video complete',out);
