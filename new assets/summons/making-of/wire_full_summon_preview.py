from pathlib import Path
p=Path('work/imp-preview.config.mjs');s=p.read_text()
s=s.replace('unit.name = "Dread Vanguard"; state.events = [];','unit.name = "Dread Vanguard"; const artNames={"maledictor":"Maledictor","ironhorn-bulwark":"Ironhorn Bulwark","iron-legionary":"Iron Legionary","ash-pikeman":"Ash Pikeman"}; for(const unit of state.units)if(unit.kind==="pit-brute"&&artNames[params.get("summonArt")])unit.name=artNames[params.get("summonArt")]; state.events = [];')
marker=" res.setHeader('Content-Type','application/json');res.end(JSON.stringify(m));return;"
addition="""
 const summonArt=new URL(req.headers.referer||'http://localhost').searchParams.get('summonArt');
 if(['maledictor','ironhorn-bulwark','iron-legionary','ash-pikeman'].includes(summonArt)){
 const pack=JSON.parse(fs.readFileSync('C:/Users/Wil/Documents/Codex/2026-10-09/sp-2/outputs/'+summonArt+'-states-r1/animation.json','utf8'));const actor=m.actors['summon-pit-brute'];actor.size=pack.canvas||pack.size;actor.anchor=pack.anchor;actor.geometry={...actor.geometry,source_pixels_per_world_unit:600,reference_visible_height_px:pack.reference_visible_height_px||960,layout_bounds_px:pack.layout_bounds_px||[pack.anchor[0]-340,pack.anchor[1]-960,pack.anchor[0]+360,pack.anchor[1]+10]};for(const [key,state] of Object.entries(pack.states))actor.states[key]={...state,frames:state.frames.map(f=>({...f,src:'/__summon-states/'+summonArt+'/'+f.src}))};
 }
"""
if "const summonArt=new URL" not in s:s=s.replace(marker,addition+marker)
p.write_text(s)
p=Path('outputs/summon-full-review-r1/review.html');s=p.read_text();s=s.replace('<h2>${name}</h2><div','<h2>${name}</h2><a href="/summon-review?units=pit-brute&summonArt=${slug}" target="_blank">View in arena</a><div');s=s.replace('These are local animation previews.','These are local animation previews. Arena links use the existing Pit Brute gameplay slot to review artwork.');p.write_text(s)
