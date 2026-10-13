import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import sharp from 'sharp';
import {fileURLToPath} from 'node:url';

const hash=p=>crypto.createHash('sha256').update(fs.readFileSync(p)).digest('hex');
const read=p=>JSON.parse(fs.readFileSync(p,'utf8'));
const ids=['frost-thrall','shattered-queen','rime-seer','rune-revenant','bone-defender'];
// An additive importer: no old actor, music, card or Warlock mappings are regenerated.
export async function integrateRuneblade(manifest){
 const out='apps/web/public/game-assets',ledger=read('assets/approvals/decisions.json');
 manifest.provenance??=[]; manifest.heroAnimations??={};
 async function pack(source,output,width,extra={}){
  const sha256=hash(source),decision=ledger.decisions[sha256];
  if(decision?.status==='Needs revision')throw Error(`Requested art revision: ${source}`);
  const dest=path.join(out,output),transform={width,withoutEnlargement:true,format:'webp',quality:90,alphaQuality:100,...extra};
  const old=manifest.provenance.find(p=>p.output===output);
  if(!fs.existsSync(dest)||old?.sha256!==sha256||JSON.stringify(old.transform)!==JSON.stringify(transform)||old.outputSha256!==hash(dest)){
   fs.mkdirSync(path.dirname(dest),{recursive:true});
   await sharp(source).resize({width,withoutEnlargement:true}).webp({quality:90,alphaQuality:100}).toFile(dest);
  }
  const meta=await sharp(dest).metadata();
  manifest.provenance=manifest.provenance.filter(p=>p.output!==output);
  manifest.provenance.push({source,sha256,output,outputSha256:hash(dest),transform,status:decision?.status??'Pending approval',evidenceId:decision?.evidenceId??null,authorization:'User explicitly requested Runeblade integration into the roguelike demo on 2026-10-06; this is not art approval.',encodedBytes:fs.statSync(dest).size,decodedBytes:meta.width*meta.height*4});
  return '/game-assets/'+output;
 }
 for(const id of ids){
  const revision=id==='bone-defender'?'animation-r1':'animation-r2';
  const dir=`assets/characters/runeblade-base-summons/${revision}/${id}`,m=read(`${dir}/manifest.json`),states={};
  for(const [state,s] of Object.entries(m.states)){
   const frames=[];
   for(const f of s.frames){
    const source=`${dir}/${f.file}`;
    if(hash(source)!==f.sha256)throw Error(`Stale authored frame: ${source}`);
    frames.push({time:f.time_ms,src:await pack(source,`runeblade/${revision}/${id}/${state}-${String(f.frame).padStart(2,'0')}.webp`,512)});
   }
   states[state]={duration:s.duration_ms,loop:s.loop,impact:s.events?.find(e=>e.name==='impact'||e.name==='release')?.time_ms??null,frames};
  }
  // Canvas-wide uniform resize preserves every authored pose and its registration.
  // Queen uses a torso registration in authoring; its ground projection is y=650.
  const scale=512/768,ground=650,rootX=id==='bone-defender'?285:id==='shattered-queen'?384:384;
  const bounds=[512,512,0,0],idleBounds=[512,512,0,0];
  for(const [state,clip] of Object.entries(states))for(const frame of clip.frames){
   const {data,info}=await sharp(`apps/web/public${frame.src}`).ensureAlpha().raw().toBuffer({resolveWithObject:true});
   const box=[info.width,info.height,0,0];
   for(let y=0;y<info.height;y++)for(let x=0;x<info.width;x++)if(data[(y*info.width+x)*4+3]>16){
    box[0]=Math.min(box[0],x);box[1]=Math.min(box[1],y);box[2]=Math.max(box[2],x+1);box[3]=Math.max(box[3],y+1);
   }
   for(const target of state==='idle'?[bounds,idleBounds]:[bounds]){
    target[0]=Math.min(target[0],box[0]);target[1]=Math.min(target[1],box[1]);target[2]=Math.max(target[2],box[2]);target[3]=Math.max(target[3],box[3]);
   }
  }
  const visibleHeight=idleBounds[3]-idleBounds[1];
  const actor={size:[512,512],anchor:[rootX*scale,ground*scale],geometry:{source_pixels_per_world_unit:300,standing_height_world:visibleHeight/300,reference_visible_height_px:visibleHeight,layout_bounds_px:bounds,idle_bounds_px:idleBounds,bounds_policy:'Union of all32 encoded frames with alpha >16; exclusive right/bottom. Authoring ground retained.'},states};
  manifest.actors[id]=actor;manifest.actors[`summon-${id}`]=actor;
  manifest.images[id]=states.idle.frames[0].src;manifest.images[`summon-${id}`]=states.idle.frames[0].src;
 }
 const heroDir='assets/heroes/animations/runeblade/frames32-r2',hero=read(`${heroDir}/manifest.json`),clips={};
 for(const [name,s] of Object.entries(hero.states)){
  const scale=640/hero.canvas.width,frames=[];
  for(const [i,f] of s.frames.entries()){
   const source=`${heroDir}/${f.file}`;if(hash(source)!==f.sha256)throw Error(`Stale hero frame: ${source}`);
   frames.push({time:i*s.frameDurationMs,body:await pack(source,`runeblade/hero-frames32-r2/${name}-${String(i).padStart(2,'0')}.webp`,640)});
  }
  const events=(s.events??[]).map(e=>({name:e.name,time_ms:e.timeMs}));
  clips[name]={duration:s.durationMs,loop:s.loop,size:[640,hero.canvas.height*scale],anchor:[hero.root.x*scale,hero.root.y*scale],events,frames};
  const socket=s.events?.find(e=>e.attachment)?.attachment;
  if(socket)clips[name].releaseOrigin=[socket.x*scale,socket.y*scale];
 }
 manifest.heroAnimations.runeblade=clips;manifest.images.runeblade=clips.idle.frames[0].body;
 const inputs='assets/cards/runeblade-demo-runtime-inputs.json';
 manifest.legacyRunebladeCards??={};
 const legacyRoot='assets/cards/runeblade-demo-2026-10-06';
 if(fs.existsSync(legacyRoot))for(const id of fs.readdirSync(legacyRoot)) {
  const source=`${legacyRoot}/${id}/r1/${id}-card-r1.png`;
  if(fs.existsSync(source))manifest.legacyRunebladeCards[id]=await pack(source,`runeblade/cards-legacy/${id}.webp`,600);
 }
 if(fs.existsSync(inputs))for(const [id,source] of Object.entries(read(inputs).cards??{}))manifest.cards[id]=await pack(source,`runeblade/cards-r2/${id}.webp`,600);
 for(const id of ['gravekeepers-seal','gravebound-sigil','hoarfrost-whetstone','suture-standard','icebound-phylactery','gravewardens-bell','crown-of-rime']) {
  const url=`/opening-assets/runeblade-items/${id}.webp`;
  if(fs.existsSync(`apps/web/public${url}`)) {
   manifest.images[`item-${id}`]=url;
   manifest.images[`relic-${id}`]=url;
  }
 }
 manifest.integration??={};manifest.integration.runeblade={date:'2026-10-06',sourceManifests:[...ids.map(id=>`assets/characters/runeblade-base-summons/${id==='bone-defender'?'animation-r1':'animation-r2'}/${id}/manifest.json`),`${heroDir}/manifest.json`].map(source=>({source,sha256:hash(source)})),notes:['192 authored whole-character frames; 160 summon frames plus 32 hero frames.','All source-to-runtime scaling is uniform per actor; no per-frame crop or rescale.','Terminal deaths remain single-play; baked magic retained.','User authorized pending art integration; independent art issues remain in source manifests.']};
 return manifest;
}
if(process.argv[1]&&path.resolve(process.argv[1])===fileURLToPath(import.meta.url)){
 const manifest=await integrateRuneblade(read('packages/assets/manifest.json'));
 fs.writeFileSync('packages/assets/manifest.json',JSON.stringify(manifest,null,2)+'\n');
 const {provenance,integration,...runtime}=manifest;
 fs.writeFileSync('apps/web/public/game-assets/manifest.json',JSON.stringify(runtime));
 const records=manifest.provenance.filter(p=>p.output.startsWith('runeblade/'));
 console.log(JSON.stringify({runtimeFiles:records.length,encodedBytes:records.reduce((s,p)=>s+p.encodedBytes,0),decodedBytes:records.reduce((s,p)=>s+p.decodedBytes,0),heroStates:Object.keys(manifest.heroAnimations.runeblade),summons:ids}));
}
