import sharp from 'sharp';
import fs from 'node:fs/promises';
import crypto from 'node:crypto';
const root='assets/concepts/infernal-map-navigation/r1';
const out='apps/web/public/infernal-assets';
const records=[];
async function record(source,dest,method){records.push({source,dest,method,sha256:crypto.createHash('sha256').update(await fs.readFile(dest)).digest('hex')});}
for(const [index,name] of ['header','footer'].entries()){
 const source=`${root}/map-ui.png`, meta=await sharp(source).metadata();
 const half=Math.floor(meta.height/2);
 const dest=`${out}/map-ui-${name}.webp`;
 const crop=await sharp(source).extract({left:0,top:index*half,width:meta.width,height:half}).png().toBuffer();
 await sharp(crop).trim({threshold:16}).webp({quality:95,alphaQuality:100}).toFile(dest);
 await record(source,dest,'Split generated two-panel sheet into equal rows; trim transparent margin.');
}
for(const [index,name] of ['combat','elite','shop','treasure','boss'].entries()){
 const source=`${root}/map-icons.png`,meta=await sharp(source).metadata();
 const left=Math.round(index*meta.width/5),right=Math.round((index+1)*meta.width/5);
 const dest=`${out}/map-icon-${name}.webp`;
 const crop=await sharp(source).extract({left,top:0,width:right-left,height:meta.height}).png().toBuffer();
 await sharp(crop).trim({threshold:16}).resize(256,256,{fit:'contain',background:'#00000000'}).webp({quality:96,alphaQuality:100}).toFile(dest);
 await record(source,dest,'Split generated five-icon sheet into equal columns; trim alpha and contain at 256px.');
}
const source=`${root}/map-hd.png`,dest=`${out}/map-hd.webp`;
await sharp(source).resize(3840,2160).sharpen({sigma:.5}).webp({quality:96}).toFile(dest);
await record(source,dest,'Clean generated 1672x941 master technically resized to 3840x2160 with mild export sharpening; generator returned 1672px despite requested 4K. Not native 4K detail.');
await fs.writeFile(`${root}/exports.json`,JSON.stringify({records,approval:'User explicitly requested integration; generated derivatives remain pending gallery approval.'},null,2));
console.log(records);

