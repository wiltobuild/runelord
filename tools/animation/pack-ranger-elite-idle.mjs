import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import sharp from 'sharp';
import {createRequire} from 'node:module';
import {spawnSync} from 'node:child_process';
const require=createRequire(import.meta.url);
const {createCanvas,loadImage}=require('../../work/cinematic-tools/node_modules/@napi-rs/canvas');
const root='assets/heroes/animations/ranger/elite-select-idle-r1';
const master='assets/heroes/concepts/ranger-runesmith-elite/2026-10-04-r1/ranger-02-nightfang.png';
const hash=p=>crypto.createHash('sha256').update(fs.readFileSync(p)).digest('hex');
const source=root+'/source/idle-sheet.png';
const W=512,H=768,sequence=[0,1,2,3,4,5,4,3,2,1],dt=220;
for(const d of ['frames','evidence'])fs.mkdirSync(root+'/'+d,{recursive:true});
const meta=await sharp(source).metadata();
const frames=[],images=[];
for(let i=0;i<6;i++){
 const x0=Math.round(i%3*meta.width/3),x1=Math.round((i%3+1)*meta.width/3),y0=Math.round(Math.floor(i/3)*meta.height/2),y1=Math.round((Math.floor(i/3)+1)*meta.height/2);
 const rect={left:x0,top:y0,width:x1-x0,height:y1-y0};
 const buf=await sharp(source).extract(rect).png().toBuffer(),{data,info}=await sharp(buf).ensureAlpha().raw().toBuffer({resolveWithObject:true});
 const b={left:info.width,top:info.height,right:0,bottom:0},feet={left:info.width,right:0},edge={left:0,right:0,top:0,bottom:0};
 for(let y=0;y<info.height;y++)for(let x=0;x<info.width;x++)if(data[(y*info.width+x)*4+3]>32){b.left=Math.min(b.left,x);b.right=Math.max(b.right,x);b.top=Math.min(b.top,y);b.bottom=Math.max(b.bottom,y);if(x<2)edge.left++;if(x>=info.width-2)edge.right++;if(y<2)edge.top++;if(y>=info.height-2)edge.bottom++;}
 for(let y=Math.floor(b.bottom-50);y<=b.bottom;y++)for(let x=0;x<info.width;x++)if(data[(y*info.width+x)*4+3]>64){feet.left=Math.min(feet.left,x);feet.right=Math.max(feet.right,x);}
 const ox=Math.round(W/2-(feet.left+feet.right)/2),oy=H-35-b.bottom;
 const c=createCanvas(W,H),ctx=c.getContext('2d');ctx.drawImage(await loadImage(buf),ox,oy);
 const file='frames/idle-'+String(i).padStart(2,'0')+'.png';fs.writeFileSync(root+'/'+file,c.toBuffer('image/png'));
 frames.push({hero:'ranger',form:'nightfang',state:'idle',frame:i,index:i,time_ms:i*dt,file,sha256:hash(root+'/'+file),sourceRect:rect,sourceAlphaBounds:b,sourceEdgePixels:edge,translation:[ox,oy],scale:1});images.push(await loadImage(root+'/'+file));
}
const atlas=createCanvas(W*sequence.length,H),ac=atlas.getContext('2d');sequence.forEach((ix,j)=>ac.drawImage(images[ix],j*W,0));fs.writeFileSync(root+'/idle-atlas.png',atlas.toBuffer('image/png'));
const maxCharacterHeight=Math.max(...frames.map(f=>f.sourceAlphaBounds.bottom-f.sourceAlphaBounds.top+1));
for(const [name,scale] of [['contact-sheet',0.5],['full-size',1],['96px',96/maxCharacterHeight]]){
 const cw=Math.ceil(W*scale)+20,ch=Math.ceil(H*scale)+32,c=createCanvas(cw*6,ch*2),ctx=c.getContext('2d');
 for(let row=0;row<2;row++){ctx.fillStyle=row?'#eee7dc':'#151821';ctx.fillRect(0,row*ch,c.width,ch);for(let i=0;i<6;i++){ctx.fillStyle=row?'#192023':'#f0dfbf';ctx.font='12px sans-serif';ctx.fillText('idle-'+i,i*cw+10,row*ch+17);ctx.drawImage(images[i],i*cw+10,row*ch+25,W*scale,H*scale);}}
 fs.writeFileSync(root+'/evidence/'+name+'.png',c.toBuffer('image/png'));
}
for(let j=0;j<sequence.length;j++){
 const c=createCanvas(W,H),ctx=c.getContext('2d');ctx.fillStyle='#171b23';ctx.fillRect(0,0,W,H);ctx.drawImage(images[sequence[j]],0,0);fs.writeFileSync(root+'/evidence/play-'+String(j).padStart(2,'0')+'.png',c.toBuffer('image/png'));
}
const ff='work/promo-tools/node_modules/ffmpeg-static/ffmpeg.exe';
const result=spawnSync(ff,['-y','-framerate',String(1000/dt),'-i',root+'/evidence/play-%02d.png','-filter_complex','split[s0][s1];[s0]palettegen[p];[s1][p]paletteuse=dither=sierra2_4a','-loop','0',root+'/idle-preview.gif'],{encoding:'utf8'});if(result.status)throw Error(result.stderr);
const webp=spawnSync(ff,['-y','-framerate',String(1000/dt),'-i',root+'/evidence/play-%02d.png','-loop','0','-lossless','1',root+'/idle-preview.webp'],{encoding:'utf8'});if(webp.status)throw Error(webp.stderr);
fs.writeFileSync(root+'/frames/index.json',JSON.stringify({frames},null,2));
const manifest={hero:'ranger',identity:'Nightfang',revision:'elite-select-idle-r1',status:'review_pending',method:'Six reference-conditioned whole-character raster idle poses; translation-only fixed ground alignment; ten-step ping-pong loop.',approvedSource:{file:master,sha256:hash(master),evidence:'User selected middle Ranger and requested only character-select idle, 2026-10-04. No hash-specific gallery override at build.'},format:'RGBA PNG numbered frames and horizontal PNG atlas',geometry:{width:W,height:H,scale:1,root:[W/2,H-35],ground_y:H-35},requiredStates:['idle'],requiredForms:['nightfang'],states:{idle:{loop:true,frameDurationMs:dt,durationMs:sequence.length*dt,sequence,uniqueFrames:6,frames,atlas:{file:'idle-atlas.png',columns:sequence.length,width:W*sequence.length,height:H},events:[],transitions:['idle']}},assets:{preview:'idle-preview.gif',contactSheet:'evidence/contact-sheet.png',fullSizeReview:'evidence/full-size.png',tinyReview:'evidence/96px.png'},vfx:{separate:false,note:'No added effects; fixed equipment emissive runes intrinsic to approved drawing.'},technical:{sourceSize:[meta.width,meta.height],clippingFindings:frames.filter(f=>Object.values(f.sourceEdgePixels).some(Boolean)),artReview:'pending independent reviewer'},limitations:['Six authored raster poses; not 60Hz continuously interpolated rig.','Small generated texture variation requires independent visual review.']};
fs.writeFileSync(root+'/manifest.json',JSON.stringify(manifest,null,2));
fs.writeFileSync(root+'/completion.json',JSON.stringify({hero:'ranger',revision:manifest.revision,status:'review_pending',states:{idle:{form:'nightfang',status:'review_pending',frameIndex:'frames/index.json',preview:'idle-preview.gif'}},coverage:{uniqueFrames:6,loopSamples:10},otherStates:'Out of scope: user requested character-select idle only.'},null,2));
console.log(JSON.stringify({root,geometry:manifest.geometry,sequence,dt,clipping:manifest.technical.clippingFindings},null,2));
