import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {hashFile,readJson} from './core.mjs';

export function approval(file,ledgerPath) {
  const sha256=hashFile(file), ledger=readJson(ledgerPath), decision=ledger.decisions?.[sha256];
  return {file,sha256,status:decision?.status || 'Unreviewed',evidenceId:decision?.evidenceId || null,decision:decision || null};
}
export function compareProtected(a,b,mask,width,height) {
  if(a.length!==width*height*4 || b.length!==a.length || mask.length!==a.length)throw Error('RGBA buffer size mismatch');
  let protectedPixels=0,changedPixels=0,editablePixels=0;
  for(let i=0;i<a.length;i+=4) {
    const rgb=[mask[i],mask[i+1],mask[i+2]];
    if(mask[i+3]!==255 || !rgb.every(v=>v===rgb[0]) || ![0,255].includes(rgb[0]))throw Error('Mask must be opaque binary black/white: white editable, black protected');
    if(rgb[0]===255){editablePixels++;continue;}
    protectedPixels++;
    if(a[i]!==b[i]||a[i+1]!==b[i+1]||a[i+2]!==b[i+2]||a[i+3]!==b[i+3])changedPixels++;
  }
  if(!protectedPixels)throw Error('Mask protects no pixels');
  return {width,height,protectedPixels,editablePixels,changedPixels,passed:changedPixels===0};
}
async function main() {
  const [command,...args]=process.argv.slice(2), root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'../..');
  if(command==='approval' && args.length===1)console.log(JSON.stringify(approval(args[0],path.join(root,'assets/approvals/decisions.json')),null,2));
  else if(command==='compare' && args.length===3) {
    const {default:sharp}=await import('sharp');
    const images=await Promise.all(args.map(p=>sharp(p).toColourspace('srgb').ensureAlpha().raw().toBuffer({resolveWithObject:true})));
    const [a,b,m]=images;
    if(images.some(x=>x.info.width!==a.info.width||x.info.height!==a.info.height||x.info.channels!==4))throw Error('Dimensions must match and decode as RGBA');
    const result=compareProtected(a.data,b.data,m.data,a.info.width,a.info.height);
    console.log(JSON.stringify({...result,files:args.map(p=>({path:p,sha256:hashFile(p)}))},null,2));if(!result.passed)process.exitCode=1;
  }else throw Error('Usage: art.mjs approval FILE | compare MASTER CANDIDATE MASK. Mask: opaque white editable, black protected. Approve mask geometry separately.');
}
if(process.argv[1] && path.resolve(process.argv[1])===fileURLToPath(import.meta.url))main().catch(e=>{console.error(e.message);process.exitCode=1;});
