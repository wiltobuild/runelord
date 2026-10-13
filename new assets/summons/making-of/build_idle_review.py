from pathlib import Path
import json,hashlib
root=Path.cwd();p=root/'work/export_maledictor_idle.py';s=p.read_text().replace('Source concept background retained; review art, not transparent runtime sprite.','Source transparency retained; animation review export, not yet runtime-integrated.');p.write_text(s)
p=root/'outputs/maledictor-idle-r1/animation.json';s=p.read_text().replace('Source concept background retained; review art, not transparent runtime sprite.','Source transparency retained; animation review export, not yet runtime-integrated.');p.write_text(s)
ledger=json.loads(Path('C:/Users/Wil/Documents/Codex/2026-10-09/i-x20/runelord/assets/approvals/decisions.json').read_text())['decisions']
for path in ['demon-family-expansion-r1/maledictor.png','demon-soldier-samples-r2/iron-legionary-r2.png','demon-soldier-samples-r2/ash-pikeman-r2.png','goatmen-expansion-r2/ironhorn-bulwark.png']:
 h=hashlib.sha256((root/'outputs'/path).read_bytes()).hexdigest();print(path,ledger.get(h,{'status':'No ledger override; user chat selection'}))
models=[('maledictor','Maledictor'),('ironhorn-bulwark','Ironhorn Bulwark'),('iron-legionary','Iron Legionary'),('ash-pikeman','Ash Pikeman')]
html='''<!doctype html><meta charset="utf-8"><title>Runelord — summon idle review</title><style>body{margin:0;background:#15151b;color:#e8d9c3;font:16px system-ui}header{padding:20px 28px}h1{font-size:24px;margin:0}p{color:#ac9f96}.grid{display:grid;grid-template-columns:repeat(4,1fr);gap:12px;padding:0 24px}article{background:#202026;border:1px solid #42342c;border-radius:8px;overflow:hidden;text-align:center}h2{font-size:18px;margin:16px 0 6px}img{width:100%;max-height:76vh;object-fit:contain} @media(max-width:850px){.grid{grid-template-columns:repeat(2,1fr)}}</style><header><h1>Summon idle studies</h1><p>Eight frames each · subtle breathing · planted feet · original artwork preserved</p></header><div class="grid">'''
for slug,name in models:html+=f'<article><h2>{name}</h2><img src="/__summon-idles/{slug}/idle.webp" alt="{name} animated idle"></article>'
html+='</div>';folder=root/'outputs/summon-idle-review-r1';folder.mkdir(exist_ok=True);(folder/'review.html').write_text(html,encoding='utf8')
p=root/'work/imp-preview.config.mjs';s=p.read_text();marker=" const url=(req.url||'').split('?')[0];"
addition="""
 if(url==='/summon-idle-review'){res.setHeader('Content-Type','text/html');res.end(fs.readFileSync('C:/Users/Wil/Documents/Codex/2026-10-09/sp-2/outputs/summon-idle-review-r1/review.html'));return;}
 if(/^\\/__summon-idles\\/(maledictor|ironhorn-bulwark|iron-legionary|ash-pikeman)\\/idle\\.webp$/.test(url)){res.setHeader('Content-Type','image/webp');res.end(fs.readFileSync('C:/Users/Wil/Documents/Codex/2026-10-09/sp-2/outputs/'+url.split('/')[2]+'-idle-r1/idle.webp'));return;}
"""
if '/summon-idle-review' not in s:p.write_text(s.replace(marker,marker+addition))
