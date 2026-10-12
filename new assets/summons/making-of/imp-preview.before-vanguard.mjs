import fs from 'node:fs';
const repo='C:/Users/Wil/Documents/Codex/2026-10-09/i-x20/runelord';
const bundle='C:/Users/Wil/Documents/Codex/2026-10-09/sp-2/outputs/imp-states-r1';
const frames='C:/Users/Wil/Documents/Codex/2026-10-09/sp-2/outputs/imp-idle-8-r5/frames';
export default {
 root:repo+'/apps/web', server:{host:'127.0.0.1',port:4321,strictPort:true},
 plugins:[{name:'isolated-imp-art-preview',configureServer(server){server.middlewares.use((req,res,next)=>{
 const url=(req.url||'').split('?')[0];
 if(url==='/imp-animation-review'){res.setHeader('Content-Type','text/html');res.end(fs.readFileSync(bundle+'/review.html'));return;}
 if(url==='/__concepts/summon-samples-r2.png'){res.setHeader('Content-Type','image/png');res.end(fs.readFileSync('C:/Users/Wil/Documents/Codex/2026-10-09/sp-2/outputs/summon-samples-r2.png'));return;}
 if(url==='/__imp-states/animation.json' || /^\/__imp-states\/(idle|attack|hit|wounded_idle|spawn|die)\/frame-0[0-7]\.png$/.test(url)){res.setHeader('Content-Type',url.endsWith('.json')?'application/json':'image/png');res.end(fs.readFileSync(bundle+'/'+url.slice('/__imp-states/'.length)));return;}
 if(url==='/game-assets/manifest.json'){
 const m=JSON.parse(fs.readFileSync(repo+'/apps/web/public/game-assets/manifest.json','utf8'));
 const a=m.actors['summon-imp-flight'];
 a.size=[560,520];a.anchor=[300,475];
 a.geometry={...a.geometry,source_pixels_per_world_unit:700,layout_bounds_px:[55,35,520,490],reference_visible_height_px:430};
 const states=JSON.parse(fs.readFileSync(bundle+'/animation.json','utf8')).states;
 for(const [key,state] of Object.entries(states))a.states[key]={...state,frames:state.frames.map(f=>({...f,src:'/__imp-states/'+f.src}))};
 res.setHeader('Content-Type','application/json');res.end(JSON.stringify(m));return;
 }
 if(/^\/__imp-preview\/frame-0[0-7]\.png$/.test(url)){res.setHeader('Content-Type','image/png');res.end(fs.readFileSync(frames+'/'+url.split('/').pop()));return;}
 next();
 });}}]
};





