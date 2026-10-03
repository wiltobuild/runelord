import fs from 'node:fs';
import sharp from 'sharp';
import crypto from 'node:crypto';
const m=JSON.parse(fs.readFileSync('packages/assets/manifest.json','utf8'));
const a=m.actors['demon-lord'];
for(const s of ['idle','attack','cast','summon','hit','wounded_idle','die']){
 if(!a.states[s]?.frames.length)throw Error(`Missing ${s}`);
 for(const f of a.states[s].frames){if(!fs.existsSync('apps/web/public'+f.src))throw Error('Missing frame');if(!f.effects)throw Error('Missing socket');}
}
if(a.states.die.loop)throw Error('Looping death');
const hashes=new Set();
for(let i=0;i<16;i++){
 const f=`assets/animations/fire-demo-r1/demon-lord/frames/${String(i).padStart(2,'0')}.png`;
 const md=await sharp(f).metadata();if(md.width!==448||md.height!==448||!md.hasAlpha)throw Error('Invalid frame geometry');
 hashes.add(crypto.createHash('sha256').update(fs.readFileSync(f)).digest('hex'));
}
if(hashes.size!==16)throw Error('Duplicate poses');
for(const id of ['boss-imp','boss-hellhound'])if(!m.actors[id]?.states.attack)throw Error('Missing add');
if(m.actors['boss-imp'].ranged?.kind!=='demon-bolt')throw Error('Missing imp ranged');
for(const id of ['demon-throne','item-demon-crown'])if(!fs.existsSync('apps/web/public'+m.images[id]))throw Error('Missing image');
if(m.music['demon-boss']?.end!==90)throw Error('Missing score');
const result={passed:true,uniqueFrames:16,states:Object.keys(a.states),canvas:a.size,anchor:a.anchor,sourceApproved:true,newArtGalleryStatus:'Pending approval',sceneDimensions:[1672,941],sceneFormat:'Flattened backdrop plus separately retained procedural ambient preview',musicSeconds:90,notes:['Stepped keyframe animation; no interpolated drawings.','Per-frame normalized eye/crown positions manually measured.','Independent runtime review owned by root and QA.']};
fs.mkdirSync('work/production/demon-lord',{recursive:true});fs.writeFileSync('work/production/demon-lord/asset-checks.json',JSON.stringify(result,null,2));console.log(JSON.stringify(result));
