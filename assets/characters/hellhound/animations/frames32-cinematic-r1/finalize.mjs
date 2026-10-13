import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import {fileURLToPath} from 'node:url';
import {createRequire} from 'node:module';
import sharp from 'sharp';
const root=path.dirname(fileURLToPath(import.meta.url)),require=createRequire(import.meta.url);
const {createCanvas,loadImage}=require('../../../../../work/cinematic-tools/node_modules/@napi-rs/canvas');
const hash=p=>crypto.createHash('sha256').update(fs.readFileSync(p)).digest('hex');
const m=JSON.parse(fs.readFileSync(root+'/manifest.json','utf8'));
m.status='32-authored-frames-awaiting-independent-final-QA-and-user-review';
m.geometry={coordinateSystem:'top-left pixels; x right; y down',frameCanvas:m.canvas,root:m.root,rootMeaning:'shared visual ground registration; body-relative rear-quarter horizontal reference',scalePolicy:'Uniform scale per complete source sheet, recorded per frame; no isolated pose rescaling. Original1254x1254 sources preserved; not represented as1024px-per-pose native artwork.',mirrorSafe:false,decodedFrameBytes:32*m.canvas[0]*m.canvas[1]*4};
m.runtimeIntegration=false;
m.limitations=['Authored animation export, not integrated into live game.','Source sheets requested2048px but delivered1254px; approximately627px nominal cells, actual extracted rectangles recorded.','Small red alpha fringe retained from generation rather than repainted.','Four source-boundary pixels on attack03 retained with complete silhouette; independent visual review required.'];
const animation={schema:1,id:m.id,revision:m.revision,frame_canvas:m.canvas,anchor:m.root,frames:[],states:{}};
const checks=[];
let bytes=0;
for(const [state,s] of Object.entries(m.states)){
 const start=animation.frames.length;
 animation.frames.push(...s.frames.map(f=>({file:f.file,sha256:f.sha256})));
 animation.states[state]={frames:s.frames.map((_,i)=>start+i),durations_ms:s.durationsMs,loop:s.loop,terminalHold:s.terminalHold,transition:s.transition,events:s.events.map(e=>({name:e.name,time_ms:e.timeMs}))};
 for(const f of s.frames){const file=root+'/'+f.file,{data,info}=await sharp(file).ensureAlpha().raw().toBuffer({resolveWithObject:true});let alpha0=0,alpha255=0,edge=0,l=info.width,t=info.height,r=0,b=0;for(let y=0;y<info.height;y++)for(let x=0;x<info.width;x++){const a=data[(y*info.width+x)*4+3];if(a===0)alpha0++;if(a===255)alpha255++;if(a>32){l=Math.min(l,x);r=Math.max(r,x);t=Math.min(t,y);b=Math.max(b,y);if(x===0||y===0||x===info.width-1||y===info.height-1)edge++;}}bytes+=fs.statSync(file).size;checks.push({file:f.file,size:[info.width,info.height],sha256:hash(file),alpha0,alpha255,visibleBounds:[l,t,r,b],outputEdgePixels:edge});}
}
m.encodedFrameBytes=bytes;m.encodedAtlasBytes=Object.values(m.states).reduce((n,s)=>n+fs.statSync(root+'/'+s.atlas.file).size,0);
fs.writeFileSync(root+'/manifest.json',JSON.stringify(m,null,2));fs.writeFileSync(root+'/animation.json',JSON.stringify(animation,null,2));
const technical={frameCount:checks.length,uniqueHashes:new Set(checks.map(c=>c.sha256)).size,allHaveTransparentPixels:checks.every(c=>c.alpha0>0),allHaveOpaquePixels:checks.every(c=>c.alpha255>0),outputEdgePixels:checks.reduce((n,c)=>n+c.outputEdgePixels,0),checks,previews:{mp4:hash(root+'/motion-proof.mp4'),gif:hash(root+'/motion-proof.gif')},limitation:'Pixel/metadata checks are not substituted for independent art or live playback review.'};fs.writeFileSync(root+'/technical-check.json',JSON.stringify(technical,null,2));
const referenceHeight=checks[0].visibleBounds[3]-checks[0].visibleBounds[1]+1,scale=96/referenceHeight;
for(const [bg,color] of [['light','#e5ddd0'],['dark','#17131d']]){const c=createCanvas(800,Math.ceil(checks.length/4)*190),ctx=c.getContext('2d');ctx.fillStyle=color;ctx.fillRect(0,0,c.width,c.height);for(let i=0;i<checks.length;i++){const x=i%4*200,y=Math.floor(i/4)*190;ctx.drawImage(await loadImage(root+'/'+checks[i].file),x,y+10,m.canvas[0]*scale,m.canvas[1]*scale);ctx.fillStyle=bg==='light'?'#241a20':'#eed5b1';ctx.font='13px sans-serif';ctx.fillText(checks[i].file.replace('frames/',''),x+8,y+183);}fs.writeFileSync(root+'/evidence/96px-'+bg+'.png',c.toBuffer('image/png'));}
console.log(JSON.stringify({count:technical.frameCount,unique:technical.uniqueHashes,alpha:technical.allHaveTransparentPixels,edgePixels:technical.outputEdgePixels,bytes}));
