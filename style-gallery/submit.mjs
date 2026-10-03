import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {digest,readLedger} from './approvals.mjs';
const here=path.dirname(fileURLToPath(import.meta.url));
const [source,subject,revision,group='Characters',label]=process.argv.slice(2);
if(!source||!subject||!revision){console.error('Usage: node style-gallery/submit.mjs <image-or-video> <subject-slug> <revision> [Heroes|Characters|Cards|Card artwork|Animation studies|Animations|Environments|Objects|Other art] [display-name]');process.exit(1)}
if(![subject,revision].every(s=>/^[a-z0-9][a-z0-9_-]*$/i.test(s))||!['Heroes','Characters','Cards','Card artwork','Animation studies','Animations','Environments','Objects','Other art'].includes(group))throw Error('Use safe subject/revision slugs and a supported group');
const src=path.resolve(source), ext=path.extname(src).toLowerCase();
if(!['.png','.jpg','.jpeg','.gif','.webp','.svg','.mp4','.webm'].includes(ext))throw Error('Submit an image or video preview');
const dir=path.resolve(here,'../assets/approvals/inbox',subject,revision), dest=path.join(dir,path.basename(src));
const sha256=digest(src);
const blocked=JSON.parse(fs.readFileSync(path.join(here,'excluded-art.json'),'utf8'));
if(blocked.hashes.includes(sha256))throw Error('This retired reference is excluded from Runelord');
fs.mkdirSync(dir,{recursive:true});
if(fs.existsSync(dest)){if(digest(dest)!==sha256)throw Error('This revision already contains different art; use a new revision')}else fs.copyFileSync(src,dest,fs.constants.COPYFILE_EXCL);
const metadata={asset:path.basename(dest),name:label||path.basename(src,ext),subject:subject.replace(/[-_]/g,' ').replace(/\b\w/g,c=>c.toUpperCase()),revision,group,sha256,source:src,submittedAt:new Date().toISOString()};
fs.writeFileSync(dest+'.art.json',JSON.stringify(metadata,null,2));
const decision=readLedger(path.resolve(here,'../assets/approvals/decisions.json')).decisions[sha256];
console.log(JSON.stringify({path:dest,sha256,status:decision?.status||'Pending approval',gallery:'http://localhost:4317'},null,2));

