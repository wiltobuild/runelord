import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import {fileURLToPath} from 'node:url';
const hash=p=>crypto.createHash('sha256').update(fs.readFileSync(p)).digest('hex');
export function integrateForestSovereign(manifest){
 const out='apps/web/public/game-assets',ledger=JSON.parse(fs.readFileSync('assets/approvals/decisions.json','utf8'));
 const base='assets/characters/forest-sovereign/animations/frames32-r1';
 manifest.provenance??=[];
 const copy=(source,id,file)=>{
  const sha256=hash(source),decision=ledger.decisions[sha256];
  if(decision?.status==='Needs revision')throw Error(`Requested revision: ${source}`);
  const output=`forest-sovereign-r1/${id}/${file}`,dest=path.join(out,output);fs.mkdirSync(path.dirname(dest),{recursive:true});fs.copyFileSync(source,dest);
  manifest.provenance=manifest.provenance.filter(p=>p.output!==output);
  manifest.provenance.push({source,sha256,output,outputSha256:hash(dest),transform:'exact PNG copy; authored registration retained',status:decision?.status??'Pending approval',authorization:'User explicitly requested game integration on 2026-10-05.'});
  return `/game-assets/${output}`;
 };
 for(const [id,dir] of [['forest-sovereign',base],['sovereign-root','assets/characters/sovereign-root/animations/r1']]){
  const m=JSON.parse(fs.readFileSync(`${dir}/animation.json`,'utf8'));const states={};
  for(const [name,s] of Object.entries(m.states)){
   const files=s.files.map(f=>copy(`${dir}/${f}`,id,f));let time=0;
   const frames=s.sequence.map((i,k)=>{const frame={time,src:files[i]};time+=s.durationsMs[k];return frame});
   states[name]={duration:time,loop:s.loop,impact:s.events?.[0]?.timeMs??null,frames};
  }
  if(id==='sovereign-root'){states.hit={duration:180,loop:false,impact:null,frames:[{time:0,src:states.idle.frames[0].src}]};states.wounded_idle=states.idle;states.spawn={duration:650,loop:false,impact:null,frames:[{time:0,src:states.idle.frames[0].src}]};}
  manifest.actors[id]={size:m.canvas,anchor:m.anchor,states};manifest.images[id]=states.idle.frames[0].src;
 }
 const fx=JSON.parse(fs.readFileSync(`${base}/vfx/animation.json`,'utf8'));
 manifest.forestSpells={};
 for(const [name,s] of Object.entries(fx.states)){
  // Rootwake's visible fissure plane is above the opaque bottom fringe. Anchor that plane to the ground.
  const anchor=name==='rootwake'?[320,450]:[320,510];let time=0;
  const durations=name==='rootwake'?[160,140,160,220]:[160,190,220,250];
  const frames=s.files.map((f,i)=>{const src=copy(`${base}/vfx/${f}`,name,f);const frame={src,time};time+=durations[i];return frame});
  manifest.forestSpells[name]={size:fx.canvas,anchor,duration:time,frames};
 }
 return manifest;
}
if(process.argv[1]&&path.resolve(process.argv[1])===fileURLToPath(import.meta.url)){
 const m=integrateForestSovereign(JSON.parse(fs.readFileSync('packages/assets/manifest.json','utf8')));
 fs.writeFileSync('packages/assets/manifest.json',JSON.stringify(m,null,2)+'\n');const {provenance,integration,...runtime}=m;
 fs.writeFileSync('apps/web/public/game-assets/manifest.json',JSON.stringify(runtime));console.log('Integrated Sovereign, roots, and grounded spells.');
}
