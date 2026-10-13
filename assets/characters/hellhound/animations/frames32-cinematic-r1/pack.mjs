import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import {createRequire} from 'node:module';
import {spawn} from 'node:child_process';
import {once} from 'node:events';
import sharp from 'sharp';
const require=createRequire(import.meta.url);
const {createCanvas,loadImage}=require('../../../../../work/cinematic-tools/node_modules/@napi-rs/canvas');
const root=path.dirname(new URL(import.meta.url).pathname.replace(/^\/(?:([A-Z]):)/i,'$1:'));
const W=768,H=640,R=[170,560];
const hash=p=>crypto.createHash('sha256').update(fs.readFileSync(p)).digest('hex');
const groups={
 idle:{source:'idle-repair1',scale:1,rects:[[40,100,550,440],[660,100,550,440],[40,730,550,440],[660,730,550,440]],ms:[350,350,350,350]},
 attack:{source:'attack-a',scale:.82,rects:[[0,0,618,650],[618,0,636,650],[0,650,642,604],[642,650,612,604]],extra:{source:'attack-b-repair1',scale:.96,rects:[[40,150,560,440],[665,130,550,450],[40,690,560,500],[660,690,555,500]]},ms:[140,100,90,100,100,110,120,160]},
 hit:{source:'hit',scale:.82,rects:[[0,0,678,650],[678,0,576,650],[0,650,651,604],[651,650,603,604]],ms:[100,140,130,180]},
 wounded_idle:{source:'wounded-repair1',scale:1,rects:[[45,150,550,400],[675,145,545,410],[45,730,550,440],[665,750,555,420]],ms:[400,400,400,400]},
 spawn:{source:'spawn',scale:.9,rects:[[25,120,585,480],[650,90,582,515],[25,690,587,510],[645,680,590,520]],ms:[180,180,220,260]},
 die:{source:'die-a-repair1',scale:1,rects:[[35,160,560,435],[660,280,555,315],[30,830,570,310],[655,855,565,300]],extra:{source:'die-b',scale:.96,rects:[[25,190,580,420],[650,300,575,300],[25,850,580,300],[645,870,585,280]]},order:[0,4,1,5,2,6,7,3],ms:[180,140,160,160,180,180,200,600]},
};
fs.mkdirSync(root+'/frames',{recursive:true});fs.mkdirSync(root+'/evidence',{recursive:true});
const m={schema:1,id:'hellhound-cinematic-32',revision:'repair-r2',status:'32-authored-frames-awaiting-independent-final-QA-and-user-review',method:'authored whole-character frames; technical extraction and uniform sheet scaling only',identity:{source:'../../../../../assets/cinematics/oath-intro/r3/hellhound.png',sha256:'f42e103c244b550e770f3a2d5bff02cc12d10f9532d545fe13ac5ea287c572f4',galleryStatus:'Unreviewed',authorization:'Current explicit user request to animate existing battle-facing cinematic summon master; no gallery approval claimed'},canvas:[W,H],root:R,facing:'right-three-quarter',sources:[],states:{},issues:[]};
for(const [state,g] of Object.entries(groups)){
 const frames=[],sheets=[g,...(g.extra?[g.extra]:[])],specs=[];
 for(const sheet of sheets){const p=root+'/source/'+sheet.source+'.png',meta=await sharp(p).metadata();m.sources.push({file:'source/'+sheet.source+'.png',sha256:hash(p),size:[meta.width,meta.height],uniformScale:sheet.scale});for(let cell=0;cell<4;cell++)specs.push({...sheet,cell});}
 const order=g.order??specs.map((_,i)=>i);
 for(let i=0;i<order.length;i++){
  const sheet=specs[order[i]],src=root+'/source/'+sheet.source+'.png';
  const [left,top,width,height]=sheet.rects[sheet.cell],rect={left,top,width,height};
  const buf=await sharp(src).extract(rect).ensureAlpha().png().toBuffer();
  const raw=await sharp(buf).raw().toBuffer();let l=width,r=0,t=height,b=0,edge=0;
  for(let y=0;y<height;y++)for(let x=0;x<width;x++)if(raw[(y*width+x)*4+3]>32){l=Math.min(l,x);r=Math.max(r,x);t=Math.min(t,y);b=Math.max(b,y);if(x===0||y===0||x===width-1||y===height-1)edge++;}
  const sourceRoot=[l+80,b],offset=[Math.round(R[0]-sourceRoot[0]*sheet.scale),Math.round(R[1]-sourceRoot[1]*sheet.scale)];
  const c=createCanvas(W,H),ctx=c.getContext('2d');ctx.drawImage(await loadImage(buf),...offset,width*sheet.scale,height*sheet.scale);
  const file=`frames/${state}-${String(i).padStart(2,'0')}.png`;fs.writeFileSync(root+'/'+file,c.toBuffer('image/png'));
  frames.push({file,source:sheet.source,cell:sheet.cell,sourceRect:rect,sourceAlphaBounds:[l,t,r,b],sourceRoot,translation:offset,scale:sheet.scale,edgePixels:edge,sha256:hash(root+'/'+file)});
  if(edge)m.issues.push({file,edgePixels:edge,issue:'Review source extraction boundary'});
 }
 const atlas=createCanvas(W*4,H*Math.ceil(frames.length/4)),ac=atlas.getContext('2d');for(let i=0;i<frames.length;i++)ac.drawImage(await loadImage(root+'/'+frames[i].file),(i%4)*W,Math.floor(i/4)*H);fs.writeFileSync(root+'/'+state+'-atlas.png',atlas.toBuffer('image/png'));
 m.states[state]={frames,durationsMs:g.ms,durationMs:g.ms.reduce((a,b)=>a+b,0),loop:['idle','wounded_idle'].includes(state),terminalHold:state==='die',transition:state==='die'?'terminal-hold':'idle',events:state==='attack'?[{name:'impact',timeMs:240}]:state==='spawn'?[{name:'arrival',timeMs:360}]:[],atlas:{file:state+'-atlas.png',width:atlas.width,height:atlas.height,columns:4,sha256:hash(root+'/'+state+'-atlas.png')}};
}
m.frameCount=Object.values(m.states).reduce((n,s)=>n+s.frames.length,0);fs.writeFileSync(root+'/manifest.json',JSON.stringify(m,null,2));
const html=`<!doctype html><meta charset="utf-8"><title>Hellhound Cinematic 32</title><style>body{margin:24px;background:#15111a;color:#eddcc1;font:16px system-ui}h1{font-family:Georgia}button{padding:10px;margin:4px;background:#392229;color:#ffe3b8;border:1px solid #a46d42;cursor:pointer}.views{display:flex;flex-wrap:wrap;gap:12px}canvas{width:min(43vw,640px);height:auto;background:#16121c;border:1px solid #705246}.light{background:#e4ddd1}.small{width:205px}p{max-width:900px}</style><h1>Hellhound · Cinematic 32</h1><p>Authored whole-character poses • right-facing battle view • ${m.frameCount} frames currently packaged. Separate animation asset preview; no game integration or gallery approval implied.</p><nav id="states"></nav><button id="pause">Pause</button><button id="step">Next frame</button><div id="readout"></div><div class="views"><canvas width="768" height="640"></canvas><canvas class="light" width="768" height="640"></canvas><canvas class="small" width="768" height="640"></canvas></div><p>Idle/wounded loop; actions return to idle; death plays once and holds. Small preview displays approximately96px standing character height. Production frames retain true alpha.</p><script>const m=${JSON.stringify(m)},images={};let state='idle',start=performance.now(),paused=false,held=0;for(const s of Object.values(m.states))for(const f of s.frames){const img=new Image;img.src=f.file;images[f.file]=img;}const choose=k=>{state=k;start=performance.now();held=0;paused=false;document.getElementById('pause').textContent='Pause'};for(const k of Object.keys(m.states)){const b=document.createElement('button');b.textContent=k;b.onclick=()=>choose(k);document.getElementById('states').append(b)}document.getElementById('pause').onclick=()=>{if(paused)start=performance.now()-held;else held=performance.now()-start;paused=!paused;document.getElementById('pause').textContent=paused?'Play':'Pause'};document.getElementById('step').onclick=()=>{const s=m.states[state];paused=true;let t=held%s.durationMs,n=0;while(n<s.frames.length-1&&t>=s.durationsMs[n]){t-=s.durationsMs[n];n++}held=s.durationsMs.slice(0,(n+1)%s.frames.length).reduce((a,b)=>a+b,0);document.getElementById('pause').textContent='Play'};function tick(now){const s=m.states[state],elapsed=paused?held:now-start;if(!paused&&!s.loop&&!s.terminalHold&&elapsed>s.durationMs+150){choose('idle');requestAnimationFrame(tick);return}let t=s.loop?elapsed%s.durationMs:Math.min(elapsed,s.durationMs-1),i=0;while(i<s.frames.length-1&&t>=s.durationsMs[i]){t-=s.durationsMs[i];i++}for(const c of document.querySelectorAll('canvas')){const ctx=c.getContext('2d');ctx.clearRect(0,0,c.width,c.height);const img=images[s.frames[i].file];if(img.complete)ctx.drawImage(img,0,0)}document.getElementById('readout').textContent=state+' · frame '+(i+1)+'/'+s.frames.length+(s.terminalHold&&i===s.frames.length-1?' · terminal hold':'');requestAnimationFrame(tick)}requestAnimationFrame(tick)</script>`;
fs.writeFileSync(root+'/preview.html',html);
const contact=createCanvas(1024,Math.ceil(m.frameCount/4)*230),cx=contact.getContext('2d');cx.fillStyle='#ded8ce';cx.fillRect(0,0,contact.width,contact.height);let index=0;
for(const [state,s] of Object.entries(m.states)){for(let i=0;i<s.frames.length;i++){const x=index%4*256,y=Math.floor(index/4)*230;cx.drawImage(await loadImage(root+'/'+s.frames[i].file),x,y,256,213);cx.fillStyle='#221820';cx.font='14px sans-serif';cx.fillText(state+' '+i,x+12,y+224);index++;}}fs.writeFileSync(root+'/contact-sheet.png',contact.toBuffer('image/png'));
const images={};for(const s of Object.values(m.states))for(const f of s.frames)images[f.file]=await loadImage(root+'/'+f.file);
const cw=1100,ch=640,c=createCanvas(cw,ch),ctx=c.getContext('2d'),fps=20;
const ff=spawn(path.resolve('work/promo-tools/node_modules/ffmpeg-static/ffmpeg.exe'),['-y','-f','image2pipe','-vcodec','mjpeg','-framerate',String(fps),'-i','pipe:0','-an','-c:v','libx264','-crf','19','-pix_fmt','yuv420p',root+'/motion-proof.mp4'],{stdio:['pipe','ignore','pipe']});let log='';ff.stderr.on('data',b=>log+=b);
for(const [state,s] of Object.entries(m.states)){const length=state==='idle'?4200:s.durationMs+1300;for(let k=0;k<Math.ceil(length*fps/1000);k++){const elapsed=k*1000/fps;let t=s.loop?elapsed%s.durationMs:Math.min(elapsed,s.durationMs-1),ix=0;while(ix<s.frames.length-1&&t>=s.durationsMs[ix]){t-=s.durationsMs[ix];ix++;}ctx.fillStyle='#16131d';ctx.fillRect(0,0,cw/2,ch);ctx.fillStyle='#e4ddd1';ctx.fillRect(cw/2,0,cw/2,ch);for(let side=0;side<2;side++)ctx.drawImage(images[s.frames[ix].file],side*cw/2-10,60,576,480);ctx.fillStyle='#c48749';ctx.font='22px sans-serif';ctx.fillText('HELLHOUND / '+state.toUpperCase()+' / '+(ix+1)+' — motion proof',20,34);ctx.drawImage(images[s.frames[ix].file],30,475,192,160);ctx.fillStyle='#d6be9d';ctx.font='14px sans-serif';ctx.fillText('~96px character • pending QA',20,622);if(!ff.stdin.write(c.toBuffer('image/jpeg')))await once(ff.stdin,'drain');}}
ff.stdin.end();const [code]=await once(ff,'close');if(code)throw Error(log);
console.log(JSON.stringify({frameCount:m.frameCount,issues:m.issues,root}));


