import fs from 'node:fs';
import crypto from 'node:crypto';
import sharp from 'sharp';
const manifest=JSON.parse(fs.readFileSync('packages/assets/manifest.json','utf8'));
const ids=[...fs.readFileSync('packages/content/index.ts','utf8').split('] as const')[0].matchAll(/"([a-z-]+)"/g)].map(m=>m[1]);
const missing=ids.filter(id=>!manifest.cards[id]);
if(missing.length)throw Error(`Missing card art: ${missing}`);
const keys=['goblin','skirmisher','spear-guard','twinaxe-reaver','crossbow-scout','emberbow-hunter','forgehammer-sapper','coalhex-shaman','scarblade-captain','cindermaw-salamander','slagheart-juggernaut','coalhorn-ram','furnace-beetle'];
const checks=[];
for(const key of keys){
 const actor=manifest.actors[key];
 for(const state of ['idle','attack','hit','wounded_idle','die']){
  const clip=actor.states[state]; if(!clip?.frames.length||!(clip.duration>0))throw Error(`Missing clip ${key}/${state}`);
  if(state==='die'&&clip.loop)throw Error('Death must not loop');
  for(const frame of clip.frames){const file='apps/web/public'+frame.src; if(!fs.existsSync(file))throw Error(`Missing ${file}`);}
 }
 checks.push({actor:key,states:Object.keys(actor.states),deathDuration:actor.states.die.duration});
}
for(const id of ['cindermaw-salamander','slagheart-juggernaut','coalhorn-ram','furnace-beetle']){
 const hashes=new Set();
 for(let i=0;i<12;i++){
  const file=`assets/animations/fire-demo-r1/${id}/frames/${String(i).padStart(2,'0')}.png`;
  const meta=await sharp(file).metadata(); if(!meta.hasAlpha||meta.width!==448||meta.height!==448)throw Error('Bad geometry');
  hashes.add(crypto.createHash('sha256').update(fs.readFileSync(file)).digest('hex'));
 }
 if(hashes.size!==12)throw Error('Repeated whole poses');
}
fs.mkdirSync('work/production/demo-expansion',{recursive:true});
const result={cardsMapped:ids.length,actors:checks,newMonsterFrames:48,requiredClipsPass:true,geometryAlphaPass:true,review:'Builder viewed original sheets, verified distinct articulation and terminal death; independent playback still required. New animations pending gallery review with explicit user integration authorization.'};
fs.writeFileSync('work/production/demo-expansion/asset-checks.json',JSON.stringify(result,null,2)+'\n');
console.log(JSON.stringify(result));

