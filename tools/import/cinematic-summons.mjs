import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { pathToFileURL } from 'node:url';
import sharp from 'sharp';
const hash=p=>crypto.createHash('sha256').update(fs.readFileSync(p)).digest('hex');
const evidence=p=>({path:p,sha256:hash(p)});
const specs=[
  {kind:'hellhound',folder:'hellhound',revision:'cinematic32-repair-r2',height:140,worldUnit:225.8064515,masterHash:'f42e103c244b550e770f3a2d5bff02cc12d10f9532d545fe13ac5ea287c572f4'},
  {kind:'pit-brute',folder:'warlock-pit-brute',revision:'cinematic32-r1',height:230,worldUnit:200,masterHash:'0f8dc36570fd588701342dd9a89359bf1af59bf139fb2441ddf14f960b5a50b9'},
];
const counts={idle:4,attack:8,hit:4,wounded_idle:4,spawn:4,die:8};

// Run after enemy aliases are captured: only player summons change.
export async function integrateCinematicSummons(manifest) {
  const ledger=JSON.parse(fs.readFileSync('assets/approvals/decisions.json','utf8'));
  for(const spec of specs) {
    const dir=`assets/characters/${spec.folder}/animations/frames32-cinematic-r1`;
    const source=JSON.parse(fs.readFileSync(`${dir}/animation.json`,'utf8'));
    const master=`assets/cinematics/oath-intro/r3/${spec.kind}.png`;
    if(hash(master)!==spec.masterHash)throw Error(`Cinematic master mismatch: ${spec.kind}`);
    const clips=source.states??source.animations;
    if(source.frames.length!==32)throw Error(`Expected32 authored frames: ${spec.kind}`);
    const scale=.5,size=source.frame_canvas.map(n=>n*scale),anchor=source.anchor.map(n=>n*scale);
    const files=[],boxes=[];
    let encodedBytes=0;
    for(const [i,frame] of source.frames.entries()) {
      const input=`${dir}/${frame.file}`,sha256=hash(input);
      if(sha256!==frame.sha256)throw Error(`Cinematic frame mismatch: ${input}`);
      const decision=ledger.decisions[sha256];
      if(decision?.status==='Needs revision')throw Error(`Cinematic frame needs revision: ${input}`);
      const {data,info}=await sharp(input).ensureAlpha().raw().toBuffer({resolveWithObject:true});
      if(info.width!==source.frame_canvas[0]||info.height!==source.frame_canvas[1])throw Error(`Frame geometry mismatch: ${input}`);
      let left=info.width,top=info.height,right=0,bottom=0;
      for(let y=0;y<info.height;y++)for(let x=0;x<info.width;x++)if(data[(y*info.width+x)*4+3]>0){left=Math.min(left,x);top=Math.min(top,y);right=Math.max(right,x+1);bottom=Math.max(bottom,y+1);}
      boxes.push([left,top,right,bottom].map(n=>n*scale));
      const output=`summons/${spec.kind}/${spec.revision}/${i}.webp`,dest=`apps/web/public/game-assets/${output}`;
      fs.mkdirSync(path.dirname(dest),{recursive:true});
      await sharp(input).resize({width:size[0],height:size[1]}).webp({lossless:true,alphaQuality:100}).toFile(dest);
      encodedBytes+=fs.statSync(dest).size;
      manifest.provenance=manifest.provenance.filter(p=>p.output!==output);
      manifest.provenance.push({source:input,sha256,output,outputSha256:hash(dest),status:decision?.status??'Pending approval',transform:{uniformScale:scale,format:'webp',lossless:true},authorization:'User requested game integration of new cinematic32 summons2026-10-04'});
      files.push(`/game-assets/${output}`);
    }
    const states={};
    for(const [name,count] of Object.entries(counts)) {
      const clip=clips[name];
      if(!clip||clip.frames.length!==count||clip.durations_ms.length!==count)throw Error(`Invalid state: ${spec.kind}/${name}`);
      let time=0;
      const frames=clip.frames.map((index,i)=>{if(!files[index]||!(clip.durations_ms[i]>0))throw Error('Invalid frame timing');const f={time,src:files[index]};time+=clip.durations_ms[i];return f;});
      states[name]={frames,duration:time,loop:clip.loop,impact:clip.events?.find(e=>e.name==='impact')?.time_ms??null,terminalHold:clip.terminalHold,events:clip.events??[]};
    }
    states.act={...states.attack,sourceState:'attack'};
    const layout_bounds_px=[Math.min(...boxes.map(b=>b[0])),Math.min(...boxes.map(b=>b[1])),Math.max(...boxes.map(b=>b[2])),Math.max(...boxes.map(b=>b[3]))];
    const idleBox=boxes[clips.idle.frames[0]],referenceHeight=idleBox[3]-idleBox[1];
    manifest.actors[`summon-${spec.kind}`]={states,size,anchor,spawnReveal:'authored',geometry:{source_pixels_per_world_unit:spec.worldUnit*referenceHeight/spec.height,standing_height_world:spec.height/spec.worldUnit,reference_visible_height_px:referenceHeight,layout_bounds_px},sourceManifest:evidence(`${dir}/animation.json`)};
    manifest.images[`summon-${spec.kind}`]=states.idle.frames[0].src;
    manifest.integration.summons[spec.kind]={revision:spec.revision,manifest:evidence(`${dir}/animation.json`),master:evidence(master),frames:source.frames.map(f=>evidence(`${dir}/${f.file}`)),facing:'right',frameCount:32,aliases:{act:'attack'},uniformScale:scale,encodedBytes,decodedBytes:32*size[0]*size[1]*4,authorization:'User requested pending assets installed in game2026-10-04; approval ledger unchanged'};
  }
}

// Scoped re-export without rebuilding unrelated art/music collections.
if(process.argv[1]&&import.meta.url===pathToFileURL(path.resolve(process.argv[1])).href) {
  const file='packages/assets/manifest.json',manifest=JSON.parse(fs.readFileSync(file,'utf8'));
  await integrateCinematicSummons(manifest);
  fs.writeFileSync(file,JSON.stringify(manifest,null,2)+'\n');
  const {provenance,integration,...runtime}=manifest;
  fs.writeFileSync('apps/web/public/game-assets/manifest.json',JSON.stringify(runtime));
  console.log(JSON.stringify(specs.map(s=>({kind:s.kind,...manifest.integration.summons[s.kind],frames:32})),null,2));
}
