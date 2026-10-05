import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { pathToFileURL } from 'node:url';
import sharp from 'sharp';
const kinds=['gloomstalker','soul-leech','pyre-warden','ignivar','cerberax','nightmaw','gorthak','hollow-saint','pyre-colossus'];
const hash=p=>crypto.createHash('sha256').update(fs.readFileSync(p)).digest('hex');
export async function integrateArchSummons(manifest, { onlyKinds = kinds, includeCards = true } = {}) {
 const ledger=JSON.parse(fs.readFileSync('assets/approvals/decisions.json','utf8'));
 manifest.integration??={};manifest.integration.summons??={};
 for(const kind of onlyKinds){
  const revision = kind === 'gorthak' ? 'idle-review-r3' : kind === 'ignivar' ? 'flight-r1' : 'base-r1';
  const dir=revision === 'base-r1' ? `assets/characters/warlock-summons/animations/base-r1/warlock-${kind}` : `assets/characters/warlock-${kind}/animations/${revision}`;
  const source=JSON.parse(fs.readFileSync(`${dir}/animation.json`,'utf8'));
  const canvas = source.geometry.canvas_px ?? source.frame_canvas;
  const geometry = {...source.geometry, canvas_px:canvas,
   reference_visible_height_px:source.geometry.reference_visible_height_px ?? source.frames[0].visible_bbox[3]-source.frames[0].visible_bbox[1],
   source_pixels_per_world_unit:source.geometry.source_pixels_per_world_unit ?? source.geometry.reference_visible_height_px/source.geometry.standing_height_world};
  const approvalPath = `${dir}/integration-approval.json`;
  const approval = fs.existsSync(approvalPath) ? JSON.parse(fs.readFileSync(approvalPath,'utf8')) : null;
  if(revision !== 'base-r1' && (!approval || approval.manifestSha256 !== hash(`${dir}/animation.json`))) throw Error(`Missing current revision authorization: ${kind}`);
  const files=[],evidence=[]; let encodedBytes=0;
  for(const frame of source.frames){
   const input=`${dir}/${frame.file}`,sha256=hash(input),decision=ledger.decisions[sha256];
   if(decision?.status==='Needs revision')throw Error(`Needs revision: ${input}`);
   if(frame.sha256&&frame.sha256!==sha256)throw Error(`Frame hash mismatch: ${input}`);
   if(approval && approval.frames.find(f=>f.file===frame.file)?.sha256!==sha256)throw Error(`Authorized frame changed: ${input}`);
   const metadata=await sharp(input).metadata();
   if(metadata.width!==canvas[0]||metadata.height!==canvas[1]||!metadata.hasAlpha)throw Error(`Invalid frame geometry/alpha: ${input}`);
   const output=`summons/${kind}/${revision}/${frame.id}.webp`,dest=`apps/web/public/game-assets/${output}`;
   fs.mkdirSync(path.dirname(dest),{recursive:true});
   await sharp(input).webp({lossless:true,alphaQuality:100}).toFile(dest);
   encodedBytes+=fs.statSync(dest).size;files[frame.id]=`/game-assets/${output}`;
   const record={source:input,sha256,output,outputSha256:hash(dest),status:decision?.status??'Pending approval',transform:{format:'webp',lossless:true},authorization:approval?.authorization ?? 'User requested full summon implementation 2026-10-04; approval status unchanged'};
   manifest.provenance=manifest.provenance.filter(p=>p.output!==output);manifest.provenance.push(record);evidence.push({path:input,sha256});
  }
  const states={};
  for(const [name,clip] of Object.entries(source.animations)){
   let time=0;const frames=clip.frames.map((i,j)=>{if(!files[i]||!(clip.durations_ms[j]>0))throw Error(`Invalid animation ${kind}/${name}`);const f={time,src:files[i],...(clip.opacity?{opacity:clip.opacity[j]}:{})};time+=clip.durations_ms[j];return f;});
   states[name]={frames,duration:time,loop:clip.loop,impact:clip.events?.find(e=>['impact','release'].includes(e.name))?.at_ms??null,terminalHold:clip.terminal||clip.transition==='hold-last',events:clip.events??[]};
  }
  for(const required of ['idle','act','hit','wounded_idle','spawn','die'])if(!states[required])throw Error(`Missing ${kind}/${required}`);
  states.attack={...states.act,sourceState:'act'};
  const boxes=source.frames.map(f=>f.visible_bbox),layout_bounds_px=[Math.min(...boxes.map(b=>b[0])),Math.min(...boxes.map(b=>b[1])),Math.max(...boxes.map(b=>b[2])),Math.max(...boxes.map(b=>b[3]))];
  manifest.actors[`summon-${kind}`]={states,size:canvas,anchor:geometry.root_px,geometry:{...geometry,layout_bounds_px},...(approval ? {spawnReveal:'authored'} : {}),...(kind==='ignivar' ? {flightLandingMs:290} : {})};
  manifest.images[`summon-${kind}`]=files[0];
  manifest.integration.summons[kind]={revision,manifest:{path:`${dir}/animation.json`,sha256:hash(`${dir}/animation.json`)},frames:evidence,encodedBytes,decodedBytes:canvas[0]*canvas[1]*4*source.frames.length,limitations:source.limitations,approval:approval ?? 'Pending approval; integration authorized by user'};
 }
 if(includeCards)
 for(const id of ['empower-demon',...kinds.filter(k=>!['gloomstalker','soul-leech','pyre-warden'].includes(k)).map(k=>`summon-${k}`),'summon-pit-brute','summon-pyre-warden']){
  const cardRoot='assets/cards/arch-summons-2026-10-04';
  const cardIndex=JSON.parse(fs.readFileSync(`${cardRoot}/manifest.json`,'utf8'));
  const revision=cardIndex.cards.find(card=>card.row_identifier===id)?.current_revision ?? 'r1';
  const input=`${cardRoot}/${id}/${revision}/${id}-${revision}.png`;
  if(!fs.existsSync(input))continue;
  const output=`cards/${id}.webp`,dest=`apps/web/public/game-assets/${output}`;
  fs.mkdirSync(path.dirname(dest),{recursive:true});await sharp(input).resize({width:600}).webp({quality:92}).toFile(dest);
  manifest.cards[id]=`/game-assets/${output}`;manifest.provenance=manifest.provenance.filter(p=>p.output!==output);
  manifest.provenance.push({source:input,sha256:hash(input),output,outputSha256:hash(dest),status:ledger.decisions[hash(input)]?.status??'Pending approval',transform:{width:600,format:'webp',quality:92}});
 }
}
if(process.argv[1]&&import.meta.url===pathToFileURL(path.resolve(process.argv[1])).href){
 const file='packages/assets/manifest.json',manifest=JSON.parse(fs.readFileSync(file,'utf8'));await integrateArchSummons(manifest);fs.writeFileSync(file,JSON.stringify(manifest,null,2)+'\n');const {provenance,integration,...runtime}=manifest;fs.writeFileSync('apps/web/public/game-assets/manifest.json',JSON.stringify(runtime));console.log(`Integrated ${kinds.length} additional summon animation sets`);
}
