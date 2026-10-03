import http from 'node:http';
import {Worker} from 'node:worker_threads';
import {galleryFiles,buildLibrary} from './library.mjs';
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import {fileURLToPath} from 'node:url';
import {readLedger,recordDecision,digest} from './approvals.mjs';
import {classify} from './catalog.mjs';
const here=path.dirname(fileURLToPath(import.meta.url));
const ledgerPath=path.resolve(here,'../assets/approvals/decisions.json');
const csrfToken=crypto.randomBytes(32).toString('hex');
const port=Number(process.env.PORT||4317), cache=new Map();
const types={'.png':'image/png','.jpg':'image/jpeg','.jpeg':'image/jpeg','.webp':'image/webp','.gif':'image/gif','.svg':'image/svg+xml','.mp4':'video/mp4','.webm':'video/webm'};
const read=p=>{try{return JSON.parse(fs.readFileSync(p,'utf8').replace(/^\uFEFF/,''))}catch{return null}};
const title=s=>s.replace(/[-_]/g,' ').replace(/\b\w/g,c=>c.toUpperCase());
export function scan(){
 const ledger=readLedger(ledgerPath);
 const excluded=new Set(read(path.join(here,'excluded-art.json'))?.hashes||[]);
 const decidedPaths=new Set(Object.values(ledger.decisions).flatMap(d=>d.paths||[]));
 const sources=(read(path.join(here,'sources.json'))||[]).map(s=>({...s,path:path.resolve(here,s.path)}));
 const items=new Map(), files=new Map(), warnings=[];
 for(const [i,s] of sources.entries()){
  if(!fs.existsSync(s.path)){warnings.push(`${s.name} is unavailable`);continue}
  const all=galleryFiles(s.path), metadata=new Map();
  for(const p of all.filter(p=>p.endsWith('.art.json'))){const a=read(p);if(a?.asset)metadata.set(path.resolve(path.dirname(p),a.asset),{status:'Pending approval',subject:a.subject,name:a.name,group:a.group,origin:a.source,notes:a.notes||''})}
  for(const p of all.filter(p=>p.endsWith('approval.json'))){const a=read(p);if(a){const f=a.asset||a.approved_asset;if(f)metadata.set(path.resolve(path.dirname(p),f),{status:a.approved||String(a.status).includes('approved')?'Approved':'Unreviewed',hash:a.sha256,notes:a.limitations||''})}}
  const cards=read(path.join(s.path,'cards/card-art-index.json'));
  for(const c of cards?.cards||[]){for(const key of ['output_path','artwork_path'])if(c[key])metadata.set(path.resolve(c[key]),{status:c.status==='approved'?'Approved':title(c.status||'Unreviewed'),subject:title(c.category||'Cards'),name:c.source_snapshot?.name,role:key==='artwork_path'?'illustration':'card'})}
  for(const p of all){const ext=path.extname(p).toLowerCase();if(!types[ext])continue;
   try{
    const rel=path.relative(s.path,p).split(path.sep).join('/'), parts=rel.split('/'), stem=path.basename(p,ext);
    const m=metadata.get(p)||{}, classification=classify(rel,m);
    if(classification.group==='Production assets')continue;
    const stat=fs.statSync(p), deferred=false;
    const key=`${stat.size}:${stat.mtimeMs}`;let h=cache.get(p);if(!h||h.key!==key){h={key,hash:deferred?null:digest(p)};cache.set(p,h)}
    if(excluded.has(h.hash))continue;
    const id=crypto.createHash('sha256').update(p).digest('hex').slice(0,24);files.set(id,p);
    let group=m.group||(parts[0]==='heroes'?'Heroes':parts[0]==='characters'?'Characters':parts[0]==='cards'?'Cards':parts[0]==='style-references'?'Style references':'Other art');
    const production=/\/animation\/|\/animations\/|\/templates\/|\/source\/|(?:^|\/)(?:mask-|text-layer|art-layer|clean-panels|fixed-frame)/i.test('/'+rel);
    if(production)group=/animation/i.test(rel)?'Animation studies':'Production assets';
    let subject=m.subject||title(parts[0]==='characters'?parts[1]:parts[0]==='heroes'?(['references','animations'].includes(parts[1])?parts[2]:parts[1]):parts[0]==='style-references'?parts[1]:'Runelord');
    if(subject==='Runelord'){const match=rel.match(/runeblade|warlock|runesmith|ranger|neutral|quest/i);if(match)subject=title(match[0])}
    let status=m.status||'Pending approval';
    if(m.hash&&m.hash.toLowerCase()!==h.hash)status='Changed since approval';
    const decision=ledger.decisions[h.hash];
    if(decision)status=decision.status;
    else if(decidedPaths.has(p))status='Changed since approval';
    if(!h.hash)status='Open to verify';
    const entry={id,sha256:h.hash,url:`/asset/${id}`,name:m.name?`${m.name}${stem==='illustration'?' · Illustration':''}`:title(stem),subject,group,status,decision:decision?{...decision,note:ledger.evidence[decision.evidenceId]?.note||'',actor:ledger.evidence[decision.evidenceId]?.actor}:null,notes:m.notes||'',path:rel,source:s.name,modified:stat.mtimeMs,bytes:stat.size,video:ext==='.mp4'||ext==='.webm',copies:[]};
    Object.assign(entry,classification);
    if(entry.group==='Animations'){
     const origin=m.origin||p, folder=path.dirname(origin), manifest=read(path.join(folder,'manifest.json'))||read(path.join(folder,'../manifest.json'));
     const state=manifest?.states?.[path.basename(origin,path.extname(origin))];
     if(state){const d=state.duration_ms;entry.duration=Array.isArray(d)?d.reduce((a,b)=>a+b,0):typeof d==='number'?d:4000}
    }
    const itemKey=h.hash||id;
    if(items.has(itemKey)){const prior=items.get(itemKey);prior.copies.push(`${s.name}: ${rel}`);prior.inbox ||= entry.inbox;}else items.set(itemKey,entry);
   }catch{warnings.push(`Could not read ${s.name}: ${path.relative(s.path,p)}`)}
  }
 }
 const assets=[...items.values()].sort((a,b)=>a.group.localeCompare(b.group)||a.subject.localeCompare(b.subject)||a.name.localeCompare(b.name,undefined,{numeric:true}));
 return {assets:buildLibrary(assets),entries:new Map(assets.map(a=>[a.id,a])),files,warnings,sources:sources.map(s=>s.name)};
}
function reconcileDecisions(state){
 const ledger=readLedger(ledgerPath);
 for(const a of state.entries.values()){const d=ledger.decisions[a.sha256];if(d){a.status=d.status;a.decision={...d,note:ledger.evidence[d.evidenceId]?.note||''}}}
 state.assets=buildLibrary([...state.entries.values()]);return state;
}
let latest=null, scannedAt=0, scanning=null, worker=null;
function current(){
 if(!scanning&&(!latest||Date.now()-scannedAt>8000)){
  if(!worker)worker=new Worker(new URL('./scan-worker.mjs',import.meta.url));
  scanning=new Promise((resolve,reject)=>{
   const done=message=>{cleanup();if(message.error){reject(Error(message.error));return}latest=reconcileDecisions(message.state);scannedAt=Date.now();resolve(latest)};
   const failed=error=>{cleanup();worker=null;reject(error)};
   const cleanup=()=>{worker.off('message',done);worker.off('error',failed)};
   worker.once('message',done);worker.once('error',failed);worker.postMessage('scan');
  }).finally(()=>{scanning=null});
  // Keep serving the last complete catalogue while the worker refreshes it.
  scanning.catch(error=>console.error('Gallery refresh:',error.message));
 }
 return latest||scanning;
}
const server=http.createServer(async (req,res)=>{
 try{const u=new URL(req.url,'http://localhost');
  if(u.pathname==='/api/decision'&&req.method==='POST'){
   const origin=req.headers.origin;
   if(!['localhost:'+port,'127.0.0.1:'+port].includes(req.headers.host)||origin!==`http://${req.headers.host}`||req.headers['x-gallery-token']!==csrfToken||!String(req.headers['content-type']).startsWith('application/json')){res.writeHead(403);res.end(JSON.stringify({error:'Open the gallery locally to save decisions.'}));return}
   let body='',length=0;req.on('data',chunk=>{length+=chunk.length;if(length>16384){req.destroy();return}body+=chunk});
   req.on('end',async ()=>{try{const data=JSON.parse(body);const assetPath=(latest||await current()).files.get(data.id);if(!assetPath){res.writeHead(404);res.end(JSON.stringify({error:'Artwork no longer exists'}));return}
    const decision=recordDecision(ledgerPath,{assetPath,sha256:data.sha256,status:data.status,note:data.note});
    if(latest)reconcileDecisions(latest);scannedAt=0;res.writeHead(200,{'Content-Type':'application/json'});res.end(JSON.stringify({decision}));
   }catch(error){res.writeHead(error.status||400,{'Content-Type':'application/json'});res.end(JSON.stringify({error:error.message}))}});return;
  }
  if(req.method!=='GET'){res.writeHead(405);res.end();return}
  if(u.pathname==='/gallery.css'){res.writeHead(200,{'Content-Type':'text/css; charset=utf-8','Cache-Control':'no-cache'});res.end(fs.readFileSync(path.join(here,'gallery.css')));return}
  if(u.pathname==='/app.js'){res.writeHead(200,{'Content-Type':'text/javascript; charset=utf-8','Cache-Control':'no-cache'});res.end(fs.readFileSync(path.join(here,'app.js')));return}
  if(u.pathname.startsWith('/api/item/')){const state=latest||await current(),id=u.pathname.slice(10),p=state.files.get(id),a=state.entries.get(id);if(!p||!a){res.writeHead(404);res.end();return}const hash=digest(p),stat=fs.statSync(p),ledger=readLedger(ledgerPath),d=ledger.decisions[hash];cache.set(p,{key:`${stat.size}:${stat.mtimeMs}`,hash});const item={...a,sha256:hash,status:d?.status||(Object.values(ledger.decisions).some(v=>v.paths?.includes(p))?'Changed since approval':'Pending approval'),decision:d?{...d,note:ledger.evidence[d.evidenceId]?.note||''}:null};res.writeHead(200,{'Content-Type':'application/json','Cache-Control':'no-store'});res.end(JSON.stringify(item));return}
  if(u.pathname==='/api/art'){const {assets,warnings,sources}=await current();const groupCounts={};for(const a of assets)groupCounts[a.group]=(groupCounts[a.group]||0)+1;res.writeHead(200,{'Content-Type':'application/json','Cache-Control':'no-store'});res.end(JSON.stringify({assets,warnings,sources,groupCounts,total:assets.length,csrfToken}));return}
  if(u.pathname.startsWith('/asset/')){const p=(latest||await current()).files.get(u.pathname.slice(7));if(!p){res.writeHead(404);res.end();return}res.writeHead(200,{'Content-Type':types[path.extname(p).toLowerCase()],'Cache-Control':u.searchParams.has('v')?'public, max-age=3600':'no-cache','X-Content-Type-Options':'nosniff'});fs.createReadStream(p).on('error',()=>res.destroy()).pipe(res);return}
  if(u.pathname==='/'||u.pathname==='/index.html'){res.writeHead(200,{'Content-Type':'text/html; charset=utf-8'});res.end(fs.readFileSync(path.join(here,'index.html')));return}
  res.writeHead(404);res.end('Not found');
 }catch(e){res.writeHead(500);res.end('Gallery temporarily unavailable')}
});
if(process.argv[1]&&path.resolve(process.argv[1])===fileURLToPath(import.meta.url))server.listen(port,'127.0.0.1',()=>console.log(`Runelord art gallery: http://localhost:${port}`));
