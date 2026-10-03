// Export only the existing four idle poses; retain the source sequence and timing.
import fs from 'node:fs/promises';
import crypto from 'node:crypto';
import sharp from 'sharp';
// Register the lower body/feet to pose 0, not the moving weapon/cape bounds.
// Source-pixel translations measured by lower-body image registration and
// checked against the four-pose contact sheet. No per-frame scaling or repaint.
const idleRootOffsets = {
 runeblade: [0, -4, 1, 10],
 runesmith: [0, -1, 20, 19],
 ranger: [0, 9, 28, 37],
};
const records=[];
for(const hero of ['runeblade','runesmith','ranger']) {
 const root=`assets/heroes/animations/${hero}/frames32-r1`;
 const manifest=JSON.parse(await fs.readFile(`${root}/manifest.json`,'utf8'));
 const index=JSON.parse(await fs.readFile(`${root}/frames/index.json`,'utf8'));
 const state=manifest.states.idle;
 const offsets=state.frames.map(id=>idleRootOffsets[hero][id]);
 const frames=state.frames.map(id=>index.find(f=>f.file===`frames/${String(id).padStart(2,'0')}.png`));
 // Frame metadata includes nearly transparent sheet residue. Frame all visible
 // pixels at one shared scale/translation, with fixed horizontal root registration across all poses.
 const bounds=[];
 for(const f of frames){
  const {data,info}=await sharp(`${root}/${f.file}`).ensureAlpha().raw().toBuffer({resolveWithObject:true});
  let l=info.width,t=info.height,r=0,b=0;
  for(let y=0;y<info.height;y++)for(let x=0;x<info.width;x++)if(data[(y*info.width+x)*4+3]>64){l=Math.min(l,x);r=Math.max(r,x+1);t=Math.min(t,y);b=Math.max(b,y+1);}
  const dx=offsets[bounds.length];
  bounds.push([l+dx,t,r+dx,b]);
 }
 const left=Math.max(0,Math.min(...bounds.map(b=>b[0]))-12);
 const top=Math.max(0,Math.min(...bounds.map(b=>b[1]))-12);
 const right=Math.min(576,Math.max(...bounds.map(b=>b[2]))+12);
 const bottom=Math.min(576,Math.max(...bounds.map(b=>b[3]))+12);
 const inputs=[];const hashes=[];
 for(let i=0;i<frames.length;i++) {
  const path=`${root}/${frames[i].file}`;const source=await fs.readFile(path);
  hashes.push({path,sha256:crypto.createHash('sha256').update(source).digest('hex')});
  inputs.push({input:await sharp(source).extract({left:left-offsets[i],top,width:right-left,height:bottom-top}).resize(320,320,{fit:'contain',background:'#00000000'}).png().toBuffer(),left:i*320,top:0});
 }
 const output=`apps/web/public/opening-assets/hero-${hero}-idle.webp`;
 await sharp({create:{width:320*frames.length,height:320,channels:4,background:'#00000000'}}).composite(inputs).webp({quality:90}).toFile(output);
 records.push({hero,sourceRevision:'frames32-r1',sequence:state.frames,durationMs:state.duration_ms,cellSize:320,uniformCrop:[left,top,right,bottom],rootRegistrationX:offsets,inputs:hashes,output,sha256:crypto.createHash('sha256').update(await fs.readFile(output)).digest('hex')});
 console.log(hero,(await fs.stat(output)).size,'bytes');
}
await fs.writeFile('apps/web/public/opening-assets/hero-idle-provenance.json',JSON.stringify(records,null,2)+'\n');
