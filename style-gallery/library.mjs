import fs from 'node:fs';
import path from 'node:path';

const ignored=new Set(['node_modules','.git','.venv','venv','__pycache__','frames','parts','layers','masks','source','templates','spritesheets']);
// Read only directory entries for excluded frame trees, never each individual frame.
export function galleryFiles(root){
 const out=[];
 function visit(dir){
  let entries;try{entries=fs.readdirSync(dir,{withFileTypes:true})}catch{return}
  const stateDirs=new Set();
  if(entries.some(e=>e.name==='manifest.json'))try{
   const m=JSON.parse(fs.readFileSync(path.join(dir,'manifest.json'),'utf8'));
   for(const [name,state] of Object.entries(m.states||{})){
    stateDirs.add(name);
    for(const frame of Array.isArray(state.frames)?state.frames:[]){if(typeof frame==='string'&&frame.includes('/'))stateDirs.add(frame.split('/')[0])}
   }
  }catch{}
  for(const e of entries){
   if(e.isSymbolicLink())continue;
   if(e.isDirectory()){if(!ignored.has(e.name.toLowerCase())&&!stateDirs.has(e.name))visit(path.join(dir,e.name))}
   else if(/\.(?:png|jpe?g|webp|gif|svg|mp4|webm|json)$/i.test(e.name))out.push(path.join(dir,e.name));
  }
 }
 visit(root);return out;
}
const brief=a=>({id:a.id,name:a.name,subject:a.subject,group:a.group,status:a.status,format:a.format,url:a.url,modified:a.modified,video:a.video,inbox:a.inbox,source:a.source,path:a.path,duration:a.duration||4000});
export function buildLibrary(items){
 const animated=new Set(items.filter(a=>a.group==='Animations').map(a=>a.subject.toLowerCase()));
 const families=new Map(),result=[];
 for(const a of items){
  if(a.group==='Production assets')continue;
  if(animated.has(a.subject.toLowerCase())&&['Characters','Heroes','Objects','Environments','Animations'].includes(a.group)){
   const key=a.subject.toLowerCase();if(!families.has(key))families.set(key,[]);families.get(key).push(a);
  }else result.push(a);
 }
 for(const members of families.values()){
  const designs=members.filter(a=>a.group!=='Animations').sort((a,b)=>b.modified-a.modified);
  const states=members.filter(a=>a.group==='Animations').sort((a,b)=>b.path.localeCompare(a.path,undefined,{numeric:true}));
  const base=designs.find(a=>/base/i.test(a.name))||designs[0]||states[0];
  result.push({...base,name:base.subject,states:states.map(brief),designs:designs.map(brief),inbox:members.some(a=>a.inbox),needsReview:members.some(a=>a.status!=='Approved'),searchText:members.map(a=>a.name+' '+a.path).join(' ')});
 }
 return result.sort((a,b)=>a.group.localeCompare(b.group)||a.subject.localeCompare(b.subject)||a.name.localeCompare(b.name,undefined,{numeric:true}));
}
