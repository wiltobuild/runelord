import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import sharp from 'sharp';
import {pathToFileURL} from 'node:url';
const hash=p=>crypto.createHash('sha256').update(fs.readFileSync(p)).digest('hex');
export async function integrateHellboundCards(manifest){
 const inventory=JSON.parse(fs.readFileSync('assets/cards/infernal-soldiers-2026-10-13/manifest.json','utf8'));
 const ledger=JSON.parse(fs.readFileSync('assets/approvals/decisions.json','utf8'));
 manifest.cards??={};manifest.provenance??=[];
 for(const card of inventory.cards){
  const source=card.output_path,sha256=hash(source),decision=ledger.decisions[sha256];
  if(sha256!==card.verification.output_sha256||card.verification.changed_protected_pixels!==0)throw Error(`Unverified Hellbound card: ${card.canonical_id}`);
  if(decision?.status==='Needs revision')throw Error(`Card revision requested: ${card.canonical_id}`);
  const output=`cards/${card.canonical_id}.webp`,dest=`apps/web/public/game-assets/${output}`;
  fs.mkdirSync(path.dirname(dest),{recursive:true});
  await sharp(source).resize(512,768).webp({lossless:true,effort:6}).toFile(dest);
  manifest.cards[card.canonical_id]=`/game-assets/${output}?v=${sha256.slice(0,12)}`;
  manifest.provenance=manifest.provenance.filter(p=>p.output!==output);
  manifest.provenance.push({source,sha256,output,outputSha256:hash(dest),status:decision?.status??'Pending approval',evidenceId:decision?.evidenceId??null,authorization:'User requested creation and game integration of Hellbound Legion summon and utility cards. New card art remains pending gallery approval.',transform:{width:512,height:768,format:'webp',lossless:true},template:card.verification.template_sha256,changedProtectedPixels:0});
 }
 return inventory.cards.length;
}
if(process.argv[1]&&import.meta.url===pathToFileURL(path.resolve(process.argv[1])).href){
 const p='packages/assets/manifest.json',manifest=JSON.parse(fs.readFileSync(p,'utf8'));
 const count=await integrateHellboundCards(manifest),text=JSON.stringify(manifest,null,2)+'\n';
 fs.writeFileSync(p,text);const {provenance,integration,...runtime}=manifest;fs.writeFileSync('apps/web/public/game-assets/manifest.json',JSON.stringify(runtime));
 console.log(`Integrated ${count} Hellbound cards; unrelated bindings preserved.`);
}
