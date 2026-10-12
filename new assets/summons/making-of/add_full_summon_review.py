from pathlib import Path
p=Path('work/imp-preview.config.mjs');s=p.read_text();marker=" const url=(req.url||'').split('?')[0];"
route="""
 if(url==='/summon-animation-review'){res.setHeader('Content-Type','text/html');res.end(fs.readFileSync('C:/Users/Wil/Documents/Codex/2026-10-09/sp-2/outputs/summon-full-review-r1/review.html'));return;}
 if(/^\\/__summon-states\\/(maledictor|ironhorn-bulwark|iron-legionary|ash-pikeman)\\/(animation\\.json|(idle|attack|cast|act|hit|block|wounded_idle|spawn|die)\\/frame-[0-9]+\\.png)$/.test(url)){const parts=url.split('/');const file='C:/Users/Wil/Documents/Codex/2026-10-09/sp-2/outputs/'+parts[2]+'-states-r1/'+parts.slice(3).join('/');if(!fs.existsSync(file)){res.statusCode=404;res.end('Not exported yet');return;}res.setHeader('Content-Type',url.endsWith('.json')?'application/json':'image/png');res.end(fs.readFileSync(file));return;}
"""
if "url==='/summon-animation-review'" not in s:p.write_text(s.replace(marker,marker+route))
