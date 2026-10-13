import fs from 'node:fs/promises';import sharp from 'sharp';import crypto from 'node:crypto';
const ledger=JSON.parse(await fs.readFile('assets/approvals/decisions.json','utf8')).decisions;
const digest=b=>crypto.createHash('sha256').update(b).digest('hex');
const source='assets/objects/infernal-map-props/r1',out='apps/web/public/infernal-assets';
const manifest=JSON.parse(await fs.readFile(`${source}/manifest.json`));const records=[];
for(const item of manifest.objects){
 const file=`${source}/${item.slug}/source.png`,bytes=await fs.readFile(file),sha256=digest(bytes);if(ledger[sha256]?.status==='Needs revision')throw Error(`Revision requested ${file}`);
 const crop=await sharp(bytes).trim({threshold:16}).png().toBuffer();const exports=[];
 for(const size of [512,1024]){const pad=size/16,target=`${out}/props/${item.slug}-${size}.webp`;await sharp(crop).resize(size-pad*2,size-pad*2,{fit:'contain',background:'#00000000'}).extend({top:pad,bottom:pad,left:pad,right:pad,background:'#00000000'}).webp({quality:96,alphaQuality:100}).toFile(target);exports.push({path:target,size,sha256:digest(await fs.readFile(target))});}
 records.push({slug:item.slug,source:file,sha256,ledger:ledger[sha256]??null,exports});
}
// Extract a conservative material mask from the unchanged terrain. Never include neutral ground or the frame.
const terrain='assets/concepts/infernal-map-navigation/r1/map-hd.png';const {data,info}=await sharp(terrain).resize(1920,1080).removeAlpha().raw().toBuffer({resolveWithObject:true});
const mask=Buffer.alloc(info.width*info.height*4);let covered=0;for(let y=0;y<info.height;y++)for(let x=0;x<info.width;x++){const i=(y*info.width+x)*3,p=(y*info.width+x)*4;const r=data[i],g=data[i+1],b=data[i+2];const ny=y/info.height,nx=x/info.width,edge=.125-(ny-.23)*.18;const region=((ny>.235&&ny<.785)||(ny>.185&&ny<=.235&&nx>.475&&nx<.54))&&nx>edge&&nx<1-edge;const lava=region&&r>185&&g>73&&r>g*1.08&&g>b*1.7&&b<105;mask[p]=mask[p+1]=mask[p+2]=255;mask[p+3]=lava?255:0;if(lava)covered++;}
await sharp(mask,{raw:{width:info.width,height:info.height,channels:4}}).png().toFile(`${out}/map-lava-mask.png`);
const throne=[];for(const file of ['assets/concepts/infernal-production/r2/infernal-grand-throne.png',`${out}/infernal-grand-throne-512.webp`,`${out}/infernal-grand-throne-1024.webp`]){const {data,info}=await sharp(file).ensureAlpha().raw().toBuffer({resolveWithObject:true});let solid=0,partial=0,visible=0,interiorPartial=0,nearOpaque=0;for(let y=1;y<info.height-1;y++)for(let x=1;x<info.width-1;x++){const i=(y*info.width+x)*4,a=data[i+3];if(a){visible++;if(a>=250)nearOpaque++;if(a===255)solid++;else partial++;if(a<250&&a>0&&[-info.width,info.width,-1,1].every(n=>data[i+n*4+3]>0))interiorPartial++;}}throne.push({file,sha256:digest(await fs.readFile(file)),visible,solid,partial,interiorPartial,solidPercent:100*solid/visible,nearOpaquePercent:100*nearOpaque/visible});}
await fs.writeFile(`${source}/lod-and-alpha-report.json`,JSON.stringify({method:'Existing source art, alpha trim; LOD padding ratios identical to 256px originals. No source repainting or alpha threshold changes.',records,throne,lava:{source:terrain,sha256:digest(await fs.readFile(terrain)),coveredPixels:covered,total:info.width*info.height,mask:'map-lava-mask.png',note:'Lava VFX are destination-in clipped to material mask. Smoke also clipped to prevent land spill.'}},null,2));console.log(JSON.stringify({props:records.length,throne,covered}));

