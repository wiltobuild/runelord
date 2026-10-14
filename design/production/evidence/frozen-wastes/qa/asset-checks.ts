import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';
import sharp from 'sharp';
import {createHash} from 'node:crypto';
import {FROZEN_WASTES_ENEMY_IDS} from '../../../../packages/engine/frozenWastes';
const results:any[]=[];
for(const root of ['C:/Users/wilsh/Projects/runelord','C:/Users/wilsh/Projects/runelord-roguelike-pages-recovery']){
 const m=JSON.parse(fs.readFileSync(path.join(root,'apps/web/public/game-assets/manifest.json'),'utf8'));
 const urls=new Set<string>();const actors=[];
 for(const id of FROZEN_WASTES_ENEMY_IDS){
  const a=m.actors[id];assert.ok(a,id);assert.ok(m.images[id],id+' image');urls.add(m.images[id]);const summary:any={id,states:{}};
  for(const state of ['idle','wounded_idle','attack','cast','hit','guard','spawn','die']){
   const clip=a.states[state];assert.ok(clip?.frames.length,id+':'+state);assert.ok(clip.duration>0);
   let t=-1;for(const frame of clip.frames){assert.ok(frame.time>=t&&frame.time<=clip.duration,id+':'+state+' times');t=frame.time;urls.add(frame.src);}
   summary.states[state]={uniqueImages:new Set(clip.frames.map((f:any)=>f.src)).size,duration:clip.duration};
  }
  actors.push(summary);
 }
 for(const id of ['frozen-wastes','frozen-heart']){assert.ok(m.images[id]);urls.add(m.images[id]);}
 const files=[];
 for(const url of urls){assert.ok(url.startsWith('/game-assets/frozen-wastes/'),url);const file=path.join(root,'apps/web/public',url);assert.ok(fs.existsSync(file),file);const bytes=fs.readFileSync(file),meta=await sharp(bytes).metadata();assert.ok(meta.width&&meta.height);files.push({url,width:meta.width,height:meta.height,sha256:createHash('sha256').update(bytes).digest('hex')});}
 results.push({root,status:'pass',actors,files,uniqueFiles:files.length,manifestSha256:createHash('sha256').update(fs.readFileSync(path.join(root,'apps/web/public/game-assets/manifest.json'))).digest('hex')});
}
assert.deepEqual(results[0].files,results[1].files,'both modes ship identical Frozen source bytes');
fs.writeFileSync(new URL('./asset-results.json',import.meta.url),JSON.stringify({timestamp:new Date().toISOString(),results,limitations:['Existence, decode, state/timing and matching identity keys only. Does not establish visual identity, animation quality or art approval.']},null,2));
console.log(results.map(r=>({root:r.root,status:r.status,actors:r.actors.length,uniqueFiles:r.uniqueFiles})));
