from pathlib import Path
p=Path('work/imp-preview.config.mjs');s=p.read_text();s=s.replace(" if(url==='/game-assets/manifest.json'){", """ if(/^\\/__vanguard-empowerment\\/(unlit|empowered)\\/frame-0[0-7]\\.png$/.test(url)){const parts=url.split('/');res.setHeader('Content-Type','image/png');res.end(fs.readFileSync('C:/Users/Wil/Documents/Codex/2026-10-09/sp-2/outputs/dread-vanguard-empowerment-r1/'+parts[2]+'/frames/'+parts[3]));return;}
 if(url==='/game-assets/manifest.json'){""")
s=s.replace("for(const key of Object.keys(v.states))v.states[key]=", """const choice=new URL(req.headers.referer||'http://localhost').searchParams.get('vanguard');
 if(choice==='unlit'||choice==='empowered')idle.frames=idle.frames.map((f,i)=>({...f,src:'/__vanguard-empowerment/'+choice+'/frame-'+String(i).padStart(2,'0')+'.png'}));
 for(const key of Object.keys(v.states))v.states[key]=""")
p.write_text(s)
import zipfile
out=Path('outputs/dread-vanguard-empowerment-r1')
with zipfile.ZipFile('outputs/dread-vanguard-empowerment-r1.zip','w',zipfile.ZIP_DEFLATED) as z:
 for f in out.rglob('*'):
  if f.is_file():z.write(f,f.relative_to(out))
