from pathlib import Path
p=Path('work/imp-preview.config.mjs');s=p.read_text()
s=s.replace("const frames=", "const bundle='C:/Users/Wil/Documents/Codex/2026-10-09/sp-2/outputs/imp-states-r1';\nconst frames=")
s=s.replace(" if(url==='/game-assets/manifest.json'){", """ if(url==='/imp-animation-review'){res.setHeader('Content-Type','text/html');res.end(fs.readFileSync(bundle+'/review.html'));return;}
 if(url==='/__concepts/summon-samples-r1.png'){res.setHeader('Content-Type','image/png');res.end(fs.readFileSync('C:/Users/Wil/Documents/Codex/2026-10-09/sp-2/outputs/summon-samples-r1.png'));return;}
 if(url==='/__imp-states/animation.json' || /^\\/__imp-states\\/(idle|attack|hit|wounded_idle|spawn|die)\\/frame-0[0-7]\\.png$/.test(url)){res.setHeader('Content-Type',url.endsWith('.json')?'application/json':'image/png');res.end(fs.readFileSync(bundle+'/'+url.slice('/__imp-states/'.length)));return;}
 if(url==='/game-assets/manifest.json'){""")
start=s.index(' a.states.idle=');end=s.index(" res.setHeader('Content-Type','application/json')",start)
s=s[:start]+" const states=JSON.parse(fs.readFileSync(bundle+'/animation.json','utf8')).states;\n for(const [key,state] of Object.entries(states))a.states[key]={...state,frames:state.frames.map(f=>({...f,src:'/__imp-states/'+f.src}))};\n"+s[end:]
p.write_text(s)
