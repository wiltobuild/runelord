import fs from 'node:fs';
const repo='C:/Users/Wil/Documents/Codex/2026-10-09/i-x20/runelord';
const bundle='C:/Users/Wil/Documents/Codex/2026-10-09/sp-2/outputs/imp-states-r1';
const vanguard='C:/Users/Wil/Documents/Codex/2026-10-09/sp-2/outputs/dread-vanguard-states-r2';
const frames='C:/Users/Wil/Documents/Codex/2026-10-09/sp-2/outputs/imp-idle-8-r5/frames';
export default {
 root:repo+'/apps/web', server:{host:'127.0.0.1',port:4321,strictPort:true},
 plugins:[{name:'isolated-imp-art-preview',transform(code,id){
 if(id.endsWith('/summonReview.ts'))return code.replace('state.events = [];', 'if(params.has("vanguard"))for(const unit of state.units)if(unit.kind === "pit-brute")unit.name = "Dread Vanguard"; const artNames={"maledictor":"Maledictor","ironhorn-bulwark":"Ironhorn Bulwark","iron-legionary":"Iron Legionary","ash-pikeman":"Ash Pikeman"}; for(const unit of state.units)if(unit.kind==="pit-brute"&&artNames[params.get("summonArt")])unit.name=artNames[params.get("summonArt")]; state.events = [];');
 },configureServer(server){server.middlewares.use((req,res,next)=>{
 const url=(req.url||'').split('?')[0];
 if(url==='/summon-animation-review'){res.setHeader('Content-Type','text/html');res.end(fs.readFileSync('C:/Users/Wil/Documents/Codex/2026-10-09/sp-2/outputs/summon-full-review-r1/review.html'));return;}
 if(/^\/__summon-states\/(maledictor|ironhorn-bulwark|iron-legionary|ash-pikeman)\/(animation\.json|(idle|attack|cast|act|hit|block|wounded_idle|spawn|die)\/frame-[0-9]+\.png)$/.test(url)){const parts=url.split('/');const file='C:/Users/Wil/Documents/Codex/2026-10-09/sp-2/outputs/'+parts[2]+'-states-r1/'+parts.slice(3).join('/');if(!fs.existsSync(file)){res.statusCode=404;res.end('Not exported yet');return;}res.setHeader('Content-Type',url.endsWith('.json')?'application/json':'image/png');res.end(fs.readFileSync(file));return;}

 if(url==='/summon-idle-review'){res.setHeader('Content-Type','text/html');res.end(fs.readFileSync('C:/Users/Wil/Documents/Codex/2026-10-09/sp-2/outputs/summon-idle-review-r1/review.html'));return;}
 if(/^\/__summon-idles\/(maledictor|ironhorn-bulwark|iron-legionary|ash-pikeman)\/idle\.webp$/.test(url)){res.setHeader('Content-Type','image/webp');res.end(fs.readFileSync('C:/Users/Wil/Documents/Codex/2026-10-09/sp-2/outputs/'+url.split('/')[2]+(['ironhorn-bulwark','iron-legionary'].includes(url.split('/')[2])?'-idle-r3/idle.webp':'-idle-r1/idle.webp')));return;}

 if(url==='/vanguard-animation-review'){res.setHeader('Content-Type','text/html');res.end(fs.readFileSync(vanguard+'/review.html'));return;}
 if(/^\/__vanguard-states\/(animation\.json|(idle|attack|cast|hit|block|wounded_idle|spawn|die)\/frame-0[0-7]\.png)$/.test(url)){res.setHeader('Content-Type',url.endsWith('.json')?'application/json':'image/png');res.end(fs.readFileSync(vanguard+'/runtime/'+url.slice('/__vanguard-states/'.length)));return;}
 if(url==='/imp-animation-review'){res.setHeader('Content-Type','text/html');res.end(fs.readFileSync(bundle+'/review.html'));return;}
 if(url==='/__concepts/summon-samples-r2.png'){res.setHeader('Content-Type','image/png');res.end(fs.readFileSync('C:/Users/Wil/Documents/Codex/2026-10-09/sp-2/outputs/summon-samples-r2.png'));return;}
 if(url==='/__imp-states/animation.json' || /^\/__imp-states\/(idle|attack|hit|wounded_idle|spawn|die)\/frame-0[0-7]\.png$/.test(url)){res.setHeader('Content-Type',url.endsWith('.json')?'application/json':'image/png');res.end(fs.readFileSync(bundle+'/'+url.slice('/__imp-states/'.length)));return;}
 if(/^\/__vanguard-preview\/frame-0[0-7]\.png$/.test(url)){res.setHeader('Content-Type','image/png');res.end(fs.readFileSync('C:/Users/Wil/Documents/Codex/2026-10-09/sp-2/outputs/dread-vanguard-idle-r5/frames/'+url.split('/').pop()));return;}
 if(/^\/__vanguard-empowerment\/(unlit|empowered)\/frame-0[0-7]\.png$/.test(url)){const parts=url.split('/');res.setHeader('Content-Type','image/png');res.end(fs.readFileSync((parts[2]==='empowered'?'C:/Users/Wil/Documents/Codex/2026-10-09/sp-2/outputs/dread-vanguard-four-fire-r1/empowered/frames/':'C:/Users/Wil/Documents/Codex/2026-10-09/sp-2/outputs/dread-vanguard-empowerment-r1/unlit/frames/')+parts[3]));return;}
 if(url==='/game-assets/manifest.json'){
 const m=JSON.parse(fs.readFileSync(repo+'/apps/web/public/game-assets/manifest.json','utf8'));
 const a=m.actors['summon-imp-flight'];
 a.size=[560,520];a.anchor=[300,475];
 a.geometry={...a.geometry,source_pixels_per_world_unit:700,layout_bounds_px:[55,35,520,490],reference_visible_height_px:430};
 const states=JSON.parse(fs.readFileSync(bundle+'/animation.json','utf8')).states;
 for(const [key,state] of Object.entries(states))a.states[key]={...state,frames:state.frames.map(f=>({...f,src:'/__imp-states/'+f.src}))};
 if((req.headers.referer||'').includes('vanguard')){
 const v=m.actors['summon-pit-brute'];v.size=[720,1024];v.anchor=[360,980];
 v.geometry={...v.geometry,source_pixels_per_world_unit:573.4265734265734,reference_visible_height_px:960,layout_bounds_px:[45,32,700,990]};
 const idle={duration:1280,loop:true,impact:null,events:[],frames:Array.from({length:8},(_,i)=>({time:i*160,src:'/__vanguard-preview/frame-'+String(i).padStart(2,'0')+'.png'}))};
 const choice=new URL(req.headers.referer||'http://localhost').searchParams.get('vanguard');
 if(choice==='unlit'||choice==='empowered')idle.frames=idle.frames.map((f,i)=>({...f,src:'/__vanguard-empowerment/'+choice+'/frame-'+String(i).padStart(2,'0')+'.png'}));
 for(const key of Object.keys(v.states))v.states[key]=key==='idle'?idle:{...idle,loop:false};
 if(choice!=='unlit'&&choice!=='empowered'){const pack=JSON.parse(fs.readFileSync(vanguard+'/runtime/animation.json','utf8'));v.size=pack.size;v.anchor=pack.anchor;v.geometry.layout_bounds_px=[685,132,1340,1090];for(const [key,state] of Object.entries(pack.states))v.states[key]={...state,frames:state.frames.map(f=>({...f,src:'/__vanguard-states/'+f.src}))};v.states.act=v.states.attack;}
 }

 const summonArt=new URL(req.headers.referer||'http://localhost').searchParams.get('summonArt');
 if(['maledictor','ironhorn-bulwark','iron-legionary','ash-pikeman'].includes(summonArt)){
 const pack=JSON.parse(fs.readFileSync('C:/Users/Wil/Documents/Codex/2026-10-09/sp-2/outputs/'+summonArt+'-states-r1/animation.json','utf8'));const actor=m.actors['summon-pit-brute'];actor.size=pack.canvas||pack.size;actor.anchor=pack.anchor;actor.geometry={...actor.geometry,source_pixels_per_world_unit:600,reference_visible_height_px:pack.reference_visible_height_px||960,layout_bounds_px:pack.layout_bounds_px||[pack.anchor[0]-340,pack.anchor[1]-960,pack.anchor[0]+360,pack.anchor[1]+10]};for(const [key,state] of Object.entries(pack.states))actor.states[key]={...state,frames:state.frames.map(f=>({...f,src:'/__summon-states/'+summonArt+'/'+f.src}))};
 }
 res.setHeader('Content-Type','application/json');res.end(JSON.stringify(m));return;
 }
 if(/^\/__imp-preview\/frame-0[0-7]\.png$/.test(url)){res.setHeader('Content-Type','image/png');res.end(fs.readFileSync(frames+'/'+url.split('/').pop()));return;}
 next();
 });}}]
};












