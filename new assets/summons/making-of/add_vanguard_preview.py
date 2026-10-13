from pathlib import Path
p=Path('work/imp-preview.config.mjs');s=p.read_text();Path('work/imp-preview.before-vanguard.mjs').write_text(s)
s=s.replace("plugins:[{name:'isolated-imp-art-preview',configureServer", """plugins:[{name:'isolated-imp-art-preview',transform(code,id){
 if(id.endsWith('/summonReview.ts'))return code.replace('state.events = [];', 'if(params.has("vanguard"))for(const unit of state.units)if(unit.kind === "pit-brute")unit.name = "Dread Vanguard"; state.events = [];');
 },configureServer""")
s=s.replace(" if(url==='/game-assets/manifest.json'){", """ if(/^\\/__vanguard-preview\\/frame-0[0-7]\\.png$/.test(url)){res.setHeader('Content-Type','image/png');res.end(fs.readFileSync('C:/Users/Wil/Documents/Codex/2026-10-09/sp-2/outputs/dread-vanguard-idle-r1/frames/'+url.split('/').pop()));return;}
 if(url==='/game-assets/manifest.json'){""")
s=s.replace(" res.setHeader('Content-Type','application/json');res.end(JSON.stringify(m));return;", """ if((req.headers.referer||'').includes('vanguard')){
 const v=m.actors['summon-pit-brute'];v.size=[720,1024];v.anchor=[360,980];
 v.geometry={...v.geometry,source_pixels_per_world_unit:820,reference_visible_height_px:960,layout_bounds_px:[45,32,700,990]};
 const idle={duration:1120,loop:true,impact:null,events:[],frames:Array.from({length:8},(_,i)=>({time:i*140,src:'/__vanguard-preview/frame-'+String(i).padStart(2,'0')+'.png'}))};
 for(const key of Object.keys(v.states))v.states[key]=key==='idle'?idle:{...idle,loop:false};
 }
 res.setHeader('Content-Type','application/json');res.end(JSON.stringify(m));return;""")
p.write_text(s)
