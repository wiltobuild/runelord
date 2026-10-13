import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import {pathToFileURL} from 'node:url';
import sharp from 'sharp';
const specs=[['imp','imp-states-r1',.6272844827586207,384],['dread-vanguard','dread-vanguard-states-r2/runtime',1.2075,768],['maledictor','maledictor-states-r1',1.05,640],['iron-legionary','iron-legionary-states-r1',1.05,640],['ironhorn-bulwark','ironhorn-bulwark-states-r1',1.05,640],['ash-pikeman','ash-pikeman-states-r1',1.05,640]];
const hash=p=>crypto.createHash('sha256').update(fs.readFileSync(p)).digest('hex');
const authorization='User approved the six-summon battle preview and requested Hellbound Legion integration, with Vanguard 15% taller than Legionary and Imp about 10% taller than the former flight model. Approval ledger statuses are preserved.';
export async function integrateHellbound(manifest){
 const ledger=JSON.parse(fs.readFileSync('assets/approvals/decisions.json','utf8'));
 manifest.integration??={};manifest.integration.summons??={};
 const report=[];
 for(const [kind,revision,height,maxWidth] of specs){
  const dir=`assets/characters/hellbound-legion/${kind}/r1`,src=JSON.parse(fs.readFileSync(`${dir}/animation.json`,'utf8'));
  const lock=JSON.parse(fs.readFileSync(`${dir}/source-lock.json`,'utf8'));
  if(hash(`${dir}/animation.json`)!==lock.manifestSha256)throw Error(`Source manifest changed: ${kind}`);
  const canvas=src.size||src.canvas,scale=Math.min(1,maxWidth/canvas[0]),size=canvas.map(n=>Math.round(n*scale)),anchor=src.anchor.map(n=>n*scale);
  const unique=[...new Set(Object.values(src.states).flatMap(c=>c.frames.map(f=>f.src)))],urls=new Map();
  let encodedBytes=0,alphaEdges=0,idleBox;
  for(const file of unique){
   const input=`${dir}/${file}`,sourceHash=hash(input),decision=ledger.decisions[sourceHash];
   if(sourceHash!==lock.frames[file])throw Error(`Source frame changed: ${kind}/${file}`);
   if(decision?.status==='Needs revision')throw Error(`Source needs revision: ${input}`);
   const {data,info}=await sharp(input).ensureAlpha().raw().toBuffer({resolveWithObject:true});
   if(info.width!==canvas[0]||info.height!==canvas[1])throw Error(`Canvas mismatch: ${input}`);
   let l=info.width,t=info.height,r=0,b=0;
   for(let y=0;y<info.height;y++)for(let x=0;x<info.width;x++)if(data[(y*info.width+x)*4+3]>32){l=Math.min(l,x);r=Math.max(r,x+1);t=Math.min(t,y);b=Math.max(b,y+1);}
   if(l===0||t===0||r===info.width||b===info.height)alphaEdges++;
   if(file===src.states.idle.frames[0].src)idleBox=[l,t,r,b].map(n=>n*scale);
   const output=`summons/${kind}/hellbound-r1/${file.replace(/\.png$/,'.webp')}`,dest=`apps/web/public/game-assets/${output}`;
   fs.mkdirSync(path.dirname(dest),{recursive:true});
   await sharp(input).resize(size[0],size[1],{fit:'fill'}).webp({quality:90,alphaQuality:100,effort:5}).toFile(dest);
   encodedBytes+=fs.statSync(dest).size;urls.set(file,`/game-assets/${output}`);
   manifest.provenance=manifest.provenance.filter(p=>p.output!==output);
   manifest.provenance.push({source:input,sha256:sourceHash,output,outputSha256:hash(dest),status:decision?.status??'Pending approval',authorization,transform:{format:'webp',quality:90,alphaQuality:100,size,scale,anchor:'fixed source anchor; no per-frame trimming'}});
  }
  const states={};
  for(const [name,clip]of Object.entries(src.states)){
   if(!clip.frames.length||clip.frames[0].time!==0||clip.frames.some((f,i)=>f.time<0||f.time>=clip.duration||(i&&f.time<=clip.frames[i-1].time)))throw Error(`Invalid clip timing ${kind}/${name}`);
   states[name]={...clip,frames:clip.frames.map(f=>({...f,src:urls.get(f.src)})),...(name==='die'?{loop:false,terminalHold:true}:{})};
  }
  states.act??={...states.attack,sourceState:'attack'};
  states.attack??={...states.act,sourceState:'act'};
  states.cast??={...states.act,sourceState:'act'};
  for(const required of ['idle','act','hit','wounded_idle','spawn','die'])if(!states[required])throw Error(`Missing ${kind}/${required}`);
  const visibleHeight=anchor[1]-idleBox[1],ppu=visibleHeight/height;
  const actor={size,anchor,states,spawnReveal:'authored',geometry:{coordinate_system:'pixels; top-left; x right, y down',facing:'right',canvas_px:size,root_px:anchor,source_pixels_per_world_unit:ppu,reference_visible_height_px:visibleHeight,standing_height_world:height,layout_bounds_px:idleBox,root_motion:'authored fixed canvas and source anchor, uniformly scaled; layout bounds use idle silhouette',mirror_safe:false}};
  manifest.actors[`summon-${kind}`]=actor;manifest.images[`summon-${kind}`]=states.idle.frames[0].src;
  // The presentation resolver prefers this alias for Imps; both refer to identical art.
  if(kind==='imp'){manifest.actors['summon-imp-flight']=actor;manifest.images['summon-imp-flight']=states.idle.frames[0].src;}
  const evidence={revision:`hellbound-r1 (${revision})`,manifest:{path:`${dir}/animation.json`,sha256:hash(`${dir}/animation.json`)},sourceLock:{path:`${dir}/source-lock.json`,sha256:hash(`${dir}/source-lock.json`)},authorization,encodedBytes,decodedBytes:size[0]*size[1]*4*unique.length,frameCount:unique.length,sourceFramesTouchingEdge:alphaEdges,geometry:actor.geometry,limitations:'Preserves approved preview source poses and timings; sparse authored clips are not newly generated high-frame-count animation.'};
  manifest.integration.summons[kind]=evidence;report.push({kind,...evidence});
 }
 return report;
}
if(process.argv[1]&&import.meta.url===pathToFileURL(path.resolve(process.argv[1])).href){
 const manifest=JSON.parse(fs.readFileSync('packages/assets/manifest.json','utf8'));
 const report=await integrateHellbound(manifest);
 fs.writeFileSync('packages/assets/manifest.json',JSON.stringify(manifest,null,2)+'\n');
 const {provenance,integration,...runtime}=manifest;
 fs.writeFileSync('apps/web/public/game-assets/manifest.json',JSON.stringify(runtime));
 fs.mkdirSync('design/production/evidence/hellbound-legion',{recursive:true});
 fs.writeFileSync('design/production/evidence/hellbound-legion/runtime-assets.json',JSON.stringify(report,null,2)+'\n');
 console.log(JSON.stringify(report.map(({kind,frameCount,encodedBytes,decodedBytes,sourceFramesTouchingEdge,geometry})=>({kind,frameCount,encodedBytes,decodedBytes,sourceFramesTouchingEdge,height:geometry.standing_height_world*200})),null,2));
}
