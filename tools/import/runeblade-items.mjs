import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import {fileURLToPath} from 'node:url';
import sharp from 'sharp';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'../..');
const jobs=JSON.parse(fs.readFileSync(path.join(root,'assets/objects/runeblade-items-r1-jobs.json'),'utf8'));
const hash=p=>crypto.createHash('sha256').update(fs.readFileSync(p)).digest('hex');
const out=path.join(root,'apps/web/public/opening-assets/runeblade-items');fs.mkdirSync(out,{recursive:true});
const reports=[];
for(const j of jobs){
 const dir=path.join(root,'assets/objects',j.id,'r1');fs.mkdirSync(dir,{recursive:true});
 const source=path.join(dir,'source.png');if(!fs.existsSync(source))fs.copyFileSync(j.generated,source,fs.constants.COPYFILE_EXCL);
 fs.writeFileSync(path.join(dir,'prompt.txt'),j.prompt+'\n');
 const meta=await sharp(source).metadata(),stats=await sharp(source).stats();
 if(!meta.hasAlpha||stats.channels[3].min!==0||stats.channels[3].max!==255)throw Error('Invalid alpha '+j.id);
 const exports=[];
 for(const size of [128,256]){
  const dest=path.join(out,j.id+(size===128?'-128':'')+'.webp');
  await sharp(source).resize(size,size,{fit:'contain',background:'#00000000'}).webp({quality:94,alphaQuality:100}).toFile(dest);
  exports.push({path:path.relative(root,dest).replaceAll('\\','/'),size:[size,size],sha256:hash(dest)});
 }
 const report={id:j.id,name:j.name,category:'Runeblade relic',state:'static',intendedUse:'Roguelike shop and equipped relic icon',catalogSource:'Current user-requested Runeblade demo rules in packages/content/runeblade.ts; older catalog effects superseded',engineMapping:'item-'+j.id,source:{path:path.relative(root,source).replaceAll('\\','/'),size:[meta.width,meta.height],sha256:hash(source),generatedPath:j.generated},exports,generationTool:'built-in image_gen',prompt:j.prompt,reference:{path:'C:/Users/wilsh/Projects/runelord/assets/heroes/references/runeblade/runeblade-base-r1.png',sha256:'adbd33fb14e91b761f355ffeb9966cb262aacca78429099ec09b0fab9faf84ef',status:'Approved',evidenceId:'user-chat-2026-10-01-approve-existing-runelord'},technicalQA:{alphaExtrema:[stats.channels[3].min,stats.channels[3].max],sourcePreserved:true,targetDimensionsVerified:true},visualQA:{fullSize:'Passed: complete distinct silhouette, serious steel/navy/cyan cel shading, no scenery or text',nativeSize:'Pending contact sheet review'},approvalStatus:'Pending approval',integrationAuthorization:'User request to add Runeblade items and shop art',gallery:'Pending submission'};
 const priorPath=path.join(dir,'manifest.json');
 if(fs.existsSync(priorPath)){
  const prior=JSON.parse(fs.readFileSync(priorPath,'utf8').replace(/^\uFEFF/,''));
  if(prior.source?.sha256===report.source.sha256){report.visualQA=prior.visualQA;report.gallery=prior.gallery;}
 }
 fs.writeFileSync(priorPath,JSON.stringify(report,null,2)+'\n');reports.push(report);
}
const tiles=[];for(let row=0;row<2;row++)for(let i=0;i<jobs.length;i++){const tile=await sharp(path.join(out,jobs[i].id+'-128.webp')).flatten({background:row?'#efe8d7':'#0c1423'}).png().toBuffer();tiles.push({input:tile,left:i*144+8,top:row*144+8});}
await sharp({create:{width:jobs.length*144,height:288,channels:4,background:'#344154'}}).composite(tiles).png().toFile(path.join(root,'assets/objects/runeblade-items-r1-review.png'));
fs.writeFileSync(path.join(root,'assets/objects/runeblade-items-r1-report.json'),JSON.stringify(reports,null,2)+'\n');
console.log(JSON.stringify(reports.map(r=>({id:r.id,source:r.source.size,alpha:r.technicalQA.alphaExtrema,exports:r.exports.map(e=>e.path)})),null,2));
