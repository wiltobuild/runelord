import fs from 'node:fs/promises';
import crypto from 'node:crypto';
import sharp from 'sharp';
const source='assets/heroes/animations/warlock/frames32-r1';
const out='assets/heroes/animations/warlock/frames32-vibrant-r1';
const publicDir='apps/web/public/warlock-color-preview';
const hash=b=>crypto.createHash('sha256').update(b).digest('hex');
const original=JSON.parse(await fs.readFile(`${source}/manifest.json`));
const index=JSON.parse(await fs.readFile(`${source}/frames/index.json`));
await fs.mkdir(`${out}/frames`,{recursive:true});await fs.mkdir(`${out}/previews`,{recursive:true});
await fs.mkdir(publicDir,{recursive:true});
function hsv(r,g,b){const mx=Math.max(r,g,b),mn=Math.min(r,g,b),d=mx-mn;let h=d===0?0:mx===r?((g-b)/d)%6:mx===g?(b-r)/d+2:(r-g)/d+4;return [(h*60+360)%360,mx?d/mx:0,mx/255];}
function rgb(h,s,v){const c=v*s,x=c*(1-Math.abs((h/60)%2-1)),m=v-c;let a=h<60?[c,x,0]:h<120?[x,c,0]:h<180?[0,c,x]:h<240?[0,x,c]:h<300?[x,0,c]:[c,0,x];return a.map(n=>Math.round((n+m)*255));}
const smooth=(a,b,x)=>{const t=Math.max(0,Math.min(1,(x-a)/(b-a)));return t*t*(3-2*t);};
const audit=[],before=[],after=[];
const hands=[[[155,312],[388,206]],[[155,312],[388,206]],[[155,312],[388,206]],[[155,312],[388,206]],[[208,250],[380,197]],[[240,230],[324,200]],[[162,250],[370,275]],[[155,312],[388,206]],[[155,312],[388,206]],[[225,221],[391,220]],[[219,232],[345,321]],[[158,312],[432,180]],[[158,312],[432,180]],[[230,231],[385,215]],[[215,251],[392,217]],[[155,312],[388,206]],[[180,337],[248,250]],[[180,337],[248,250]],[[165,340],[225,270]],[[180,337],[248,250]],[[155,312],[388,206]],[[230,209],[300,200]],[[210,215],[355,190]],[[155,312],[388,206]],[[180,340],[336,341]],[[209,363],[320,348]],[[228,404],[352,427]],[[242,432],[374,449]],[[121,461],[274,461]],[[90,466],[250,461]],[[115,460],[330,460]],[[143,461],[355,461]]];
for(const f of index){
 const path=`${source}/${f.file}`,bytes=await fs.readFile(path);
 if(hash(bytes)!==f.sha256)throw Error(`Original source mismatch ${path}`);
 const {data,info}=await sharp(bytes).ensureAlpha().raw().toBuffer({resolveWithObject:true});
 const target=Buffer.from(data);let changed=0,protectedSkin=0;
 for(let p=0;p<data.length;p+=4){
  if(!data[p+3])continue;
  let [h,s,v]=hsv(...data.subarray(p,p+3));
  // Pale flesh and warm desaturated flesh shadows are deliberately excluded.
  const x=(p/4)%info.width,y=Math.floor(p/4/info.width);
  const inHand=hands[f.frame].some(([hx,hy])=>Math.abs(x-hx)<35&&Math.abs(y-hy)<40);
  const skin=h>=10&&h<=42&&(inHand||(v>.82&&s<.48));
  if(skin){protectedSkin++;continue;}
  let next=null;
  const redDistance=Math.min(h,360-h);
  if(redDistance<22&&s>.20&&v>.10){
   const strength=(1-smooth(12,22,redDistance))*smooth(.20,.38,s);
   const nh=h>180?Math.max(h,352):Math.min(h,4);
   const nv=Math.min(.90,v*(1+1.12*smooth(.16,.54,v)));
   const ns=Math.min(.90,s+.17*smooth(.18,.55,s));
   const mapped=rgb(nh,ns,nv);next=mapped.map((n,i)=>Math.round(data[p+i]+(n-data[p+i])*strength));
  }else if(h>=18&&h<=52&&s>.24&&s<.78&&v>.44&&v<.88){
   const strength=smooth(.24,.38,s)*(1-smooth(.80,.88,v));
   const mapped=rgb(38,Math.min(.78,s+.24),Math.min(.77,v*1.02));
   next=mapped.map((n,i)=>Math.round(data[p+i]+(n-data[p+i])*strength));
  }
  if(next){for(let k=0;k<3;k++)target[p+k]=next[k];if(next.some((n,k)=>n!==data[p+k]))changed++;}
 }
 let alphaDiff=0;for(let p=3;p<data.length;p+=4)if(data[p]!==target[p])alphaDiff++;
 if(alphaDiff)throw Error('Alpha changed');
 const result=await sharp(target,{raw:{width:info.width,height:info.height,channels:4}}).png().toBuffer();
 await fs.writeFile(`${out}/${f.file}`,result);
 before.push(data);after.push(target);
 await sharp(bytes).webp({lossless:true}).toFile(`${publicDir}/before-${f.frame}.webp`);
 await sharp(result).webp({lossless:true}).toFile(`${publicDir}/after-${f.frame}.webp`);
 audit.push({frame:f.frame,source_sha256:hash(bytes),sha256:hash(result),alphaDifferences:alphaDiff,changedPixels:changed,protectedSkinPixels:protectedSkin,dimensions:[info.width,info.height]});
}
const manifest={...original,revision:'frames32-vibrant-r1',status:'pending_user_review',derived_from:source,palette_reference:'assets/heroes/color-studies/warlock-vibrant-r2/after.png',authorization:'User requested deterministic recoloring of existing frames, preserving originals, with animated preview.',review:{approval:'pending user review'},limitations:[...original.limitations,'Deterministic hue-family recolor approximates the accepted palette; no poses regenerated. Existing source drawing variation remains.']};
await fs.writeFile(`${out}/manifest.json`,JSON.stringify(manifest,null,2));
await fs.writeFile(`${out}/frames/index.json`,JSON.stringify(index.map((f,i)=>({...f,source_frame_sha256:f.sha256,sha256:audit[i].sha256,status:'recolor_review_pending'})),null,2));
await fs.writeFile(`${out}/technical-check.json`,JSON.stringify({method:'Fixed hue-family mapping across every frame, with pale skin exclusion. Alpha untouched.',frames:audit,timingUnchanged:true,geometryUnchanged:true,originalFilesHashVerified:true},null,2));
await fs.writeFile(`${publicDir}/manifest.json`,JSON.stringify(manifest));
const tiles=await Promise.all(after.map((data,i)=>({input:sharp(data,{raw:{width:512,height:512,channels:4}}).png().toBuffer(),left:(i%8)*512,top:Math.floor(i/8)*512})).map(async a=>({...a,input:await a.input})));
await sharp({create:{width:4096,height:2048,channels:4,background:'#00000000'}}).composite(tiles).png().toFile(`${out}/atlas.png`);
for(const [name,clip] of Object.entries(original.states)){
 const frames=[];
 for(const i of clip.frames){frames.push(await sharp({create:{width:1024,height:512,channels:4,background:'#28242d'}}).composite([{input:await sharp(before[i],{raw:{width:512,height:512,channels:4}}).png().toBuffer(),left:0,top:0},{input:await sharp(after[i],{raw:{width:512,height:512,channels:4}}).png().toBuffer(),left:512,top:0}]).raw().toBuffer());}
 await sharp(Buffer.concat(frames),{raw:{width:1024,height:512*frames.length,channels:4,pageHeight:512}}).gif({delay:clip.durations_ms,loop:0}).toFile(`${out}/previews/${name}-comparison.gif`);
}
console.log(JSON.stringify({out,frameCount:audit.length,states:Object.keys(original.states),alphaDifferences:0}));
