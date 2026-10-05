"""Compose current card text with existing character art and immutable Warlock frame."""
from pathlib import Path
import json, shutil, hashlib, subprocess
from PIL import Image, ImageOps
R=Path(__file__).resolve().parents[2]
B=R/'assets/cards/arch-summons-2026-10-04'
T=R/'assets/cards/templates/warlock-v1'
B.mkdir(parents=True,exist_ok=True)
# Reuse the project's exact, audited mask and text layout procedure.
code=(R/'assets/cards/warlock-2026-10-02/assembly-source.py').read_text(encoding='utf-8')
code=code.replace("shutil.copy2(A/'templates/runeblade-v1/Georgia-Bold.ttf',T/'Georgia-Bold.ttf')", "shutil.copy2(Path('C:/Windows/Fonts/georgiab.ttf'),T/'Georgia-Bold.ttf')")
ns={'__name__':'card_assembly'};exec(compile(code,'existing-card-assembly','exec'),ns)
ns.update(R=R,A=R/'assets/cards',T=T,B=B,OUT=B/'previews')
ns['setup']()
ids=['empower-demon','summon-ignivar','summon-cerberax','summon-nightmaw','summon-gorthak','summon-hollow-saint','summon-pyre-colossus','summon-pit-brute','summon-pyre-warden']
catalog={c['id']:c for c in json.loads((R/'packages/content/warlock-catalog.json').read_text(encoding='utf-8'))}
rows=[]
for id in ids:
 c=catalog[id];rows.append({'row_identifier':id,'source_snapshot':{'name':c['name'],'cost':c['cost'],'type':c['type'],'rarity':c['rarity'],'rules':c['text'],'upgrade':c['upgrade']}})
(B/'manifest.json').write_text(json.dumps({'cards':rows},indent=2),encoding='utf-8')
masters=Path('C:/Users/wilsh/Documents/Codex/2026-10-02/new-chat-2/outputs/warlock-summons')
ledger=json.loads((R/'assets/approvals/decisions.json').read_text())['decisions']
for id in ids:
 folder=B/id/'r1';folder.mkdir(parents=True,exist_ok=True)
 if id=='empower-demon': src=R/'assets/cards/warlock-2026-10-02/greater-summoning/r1/illustration.png'
 elif id in ['summon-pit-brute','summon-pyre-warden']: src=R/f'assets/cards/warlock-2026-10-02/{id}/r1/illustration.png'
 else: src=masters/f"warlock-{id.removeprefix('summon-')}-base-r1.png"
 digest=hashlib.sha256(src.read_bytes()).hexdigest()
 assert ledger.get(digest,{}).get('status')!='Needs revision',str(src)
 # Technical placement of an existing whole-character master. No redrawing or species swaps.
 source=Image.open(src).convert('RGBA')
 if id not in ['empower-demon','summon-pit-brute','summon-pyre-warden']:
  source=source.crop(source.getbbox());subject=ImageOps.contain(source,(1280,980),Image.Resampling.LANCZOS)
  source=Image.new('RGBA',(1428,1100),(45,25,30,255));source.alpha_composite(subject,((1428-subject.width)//2,(1100-subject.height)//2))
 technical=folder/'source-composition.png';source.save(technical)
 prompt=folder/'provenance.txt';prompt.write_text(f'Existing artwork reused by deterministic composition. Source: {src}\nSHA256: {digest}\nApproval: {ledger.get(digest,{}).get("status","Pending approval")}\nNew card integration authorized by user; approval ledger unchanged.\n',encoding='utf-8')
 ns['assemble'](id,technical,prompt)
 shutil.copy2(src,folder/'identity-source.png')
 subprocess.run(['node','C:/Users/wilsh/Projects/runelord/style-gallery/submit.mjs',str(folder/f'{id}-r1.png'),f'warlock-card-{id}','summon-system-r2','Cards',catalog[id]['name']],check=True,capture_output=True)
print('Nine exact-frame cards composed and submitted for review.')
