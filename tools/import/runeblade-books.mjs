import fs from 'node:fs/promises';
import path from 'node:path';
import crypto from 'node:crypto';
import sharp from 'sharp';
const root=path.resolve(import.meta.dirname,'../..');
const hash=b=>crypto.createHash('sha256').update(b).digest('hex');
for(const id of ['gravehost','rimebound','runewarden']){
 const dir=path.join(root,'assets/objects',`tome-${id}`,'r1'),source=path.join(dir,'source.png');
 const raw=await fs.readFile(source),meta=await sharp(raw).metadata(),stats=await sharp(raw).stats();
 if(!meta.hasAlpha||stats.channels[3].min!==0)throw Error('Book needs genuine transparency: '+id);
 const out=path.join(root,'apps/web/public/opening-assets',`tome-${id}.webp`);
 await sharp(raw).resize(640,640,{fit:'contain',background:{r:0,g:0,b:0,alpha:0}}).webp({quality:92,alphaQuality:100}).toFile(out);
 await fs.writeFile(path.join(dir,'manifest.json'),JSON.stringify({id:`tome-${id}`,name:id,source,output:out,source_sha256:hash(raw),output_sha256:hash(await fs.readFile(out)),source_dimensions:[meta.width,meta.height],dimensions:[640,640],alpha:true,approval:'pending',integration_authorization:'User requested3Runeblade starterbooks in playable demo.',tool:'built-in imagegen',prompt:'prompt.txt'},null,2));
 console.log(id,meta.width,meta.height,'alpha',stats.channels[3].min,stats.channels[3].max);
}
