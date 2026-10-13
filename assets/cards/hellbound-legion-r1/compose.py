"""Deterministic Hellbound cards: immutable Warlock frame, approved actor inserts, live rules."""
from pathlib import Path
import json, hashlib, shutil, re, sys, subprocess
import numpy as np
from PIL import Image, ImageDraw, ImageFont, ImageOps
R=Path(__file__).resolve().parents[3]; B=Path(__file__).resolve().parent; T=B/'template'
REV=sys.argv[1] if len(sys.argv)>1 else 'r1'
SRC=Path('C:/Users/wilsh/Projects/runelord-remote-assets-2026-10-12/new assets/summons/assets')
sha=lambda p:hashlib.sha256(p.read_bytes()).hexdigest()
def save(p,d):p.write_text(json.dumps(d,indent=2,ensure_ascii=False),encoding='utf-8')
def setup():
 # Reuse the established Warlock template construction and inspected mask geometry.
 original=(R/'assets/cards/warlock-2026-10-02/assembly-source.py').read_text()
 code=original[original.index('def setup():'):original.index(' rows=[]')]
 code=code.replace("A/'templates/runeblade-v1/Georgia-Bold.ttf'", "R/'assets/cards/runeblade-refinement-2026-10-12/template-v2/Georgia-Bold.ttf'")
 env=dict(globals(),OUT=B/'review',A=R/'assets/cards');exec(code,env);env['setup']()
def portrait(card):
 kind=card['id'].removeprefix('summon-')
 sources={'iron-legionary':'iron-legionary-idle-r1/idle-master.png','ash-pikeman':'ash-pikeman-idle-r1/registered.png','ironhorn-bulwark':'ironhorn-bulwark-source-r3/ironhorn-bulwark.png','maledictor':'maledictor-idle-r1/idle-master.png','dread-vanguard':'dread-vanguard-idle-r5/battle-stance-source.png','muster-legion':'iron-legionary-idle-r1/idle-master.png','pike-detail':'ash-pikeman-idle-r1/registered.png'}
 source=SRC/sources[kind]
 if not source.exists():source=B/card['id']/'r1/identity-source.png'
 out=ImageOps.fit(Image.open(B/'backdrop.png').convert('RGBA'),(1200,950))
 actor=Image.open(source).convert('RGBA');actor=actor.crop(actor.getbbox())
 count=2 if kind in ['muster-legion','pike-detail'] else 1
 for i in range(count):
  height=845 if count==1 else 760
  fitted=ImageOps.contain(actor,(950 if count==1 else 550,height),Image.Resampling.LANCZOS)
  x=(1200-fitted.width)//2 if count==1 else (65 if i==0 else 620)
  out.alpha_composite(fitted,(x,930-fitted.height))
 return out,source
def assemble():
 setup(); base=Image.open(T/'baseline.png').convert('RGBA');a=np.array(base);mask=np.array(Image.open(T/'mask-union.png'))>0
 data=json.loads((B/'card-data.json').read_text()); records=[]; thumbs=[]
 previous=json.loads((B/'manifest.json').read_text()) if (B/'manifest.json').exists() else {'cards':[]}
 prior={c['canonical_id']:c for c in previous['cards']}
 if REV!='r1' and not (B/'manifest-r1.json').exists():save(B/'manifest-r1.json',previous)
 ledger=json.loads((R/'assets/approvals/decisions.json').read_text())['decisions']
 for d in data:
  old=prior.get(d['id'])
  if REV!='r1' and old and old['source_snapshot']==d:
   records.append(old);thumbs.append(Image.open(R/old['output_path']).convert('RGBA').resize((256,384),Image.Resampling.LANCZOS));continue
  revision=REV if old else 'r1'
  folder=B/d['id']/revision;folder.mkdir(parents=True,exist_ok=True)
  if d['type']=='Summon':
   art,source=portrait(d);art.save(folder/'illustration.png')
   if source.resolve()!=(folder/'identity-source.png').resolve():shutil.copy2(source,folder/'identity-source.png')
   prompt='Exact approved soldier master composited without identity edits over generated infernal parade-ground backdrop; '+('two soldiers for double summon.' if d['id'] in ['muster-legion','pike-detail'] else 'one summon portrait.')
  else:
   source=B/'generated'/f"{d['id']}.png";shutil.copy2(source,folder/'illustration.png');art=Image.open(source).convert('RGBA');prompt=json.loads((B/'generation.json').read_text())[d['id']]['prompt']
  (folder/'illustration-prompt.txt').write_text(prompt,encoding='utf-8');save(folder/'source-snapshot.json',d);save(folder/'text-data.json',d)
  artmask=Image.open(T/'mask-art.png');box=artmask.getbbox();art=ImageOps.fit(art,(box[2]-box[0],box[3]-box[1]),Image.Resampling.LANCZOS)
  layer=Image.new('RGBA',base.size);layer.paste(art,box[:2]);layer.putalpha(artmask);layer.save(folder/'art-layer.png')
  text=Image.new('RGBA',base.size);draw=ImageDraw.Draw(text);layouts=[]
  for region,s,size in [('title',d['name'],94),('cost',d['cost'],110),('type',d['type'].upper()+' · WARLOCK',35),('rules',d['rules'],54)]:
   x0,y0,x1,y1=Image.open(T/f'mask-{region}.png').getbbox()
   while True:
    f=ImageFont.truetype(str(T/'Georgia-Bold.ttf'),size);lines=[s]
    if region=='rules':
     lines=['']
     for word in s.split():
      candidate=(lines[-1]+' '+word).strip()
      if draw.textlength(candidate,font=f)>x1-x0-24 and lines[-1]:lines.append(word)
      else:lines[-1]=candidate
    bbs=[draw.textbbox((0,0),v,font=f) for v in lines];heights=[b[3]-b[1] for b in bbs];gap=int(size*.28);height=sum(heights)+gap*(len(lines)-1)
    if max(b[2]-b[0] for b in bbs)<x1-x0-12 and height<y1-y0-12:break
    size-=1
   cy=(y0+y1-height)/2
   for line,bb,h in zip(lines,bbs,heights):draw.text(((x0+x1-bb[2]+bb[0])/2-bb[0],cy-bb[1]),line,font=f,fill=(24,5,4,255));cy+=h+gap
   assert ' '.join(lines)==s
   layouts.append(dict(region=region,text=s,lines=lines,font_size=size))
  text.save(folder/'text-layer.png');out=Image.open(T/'clean-panels.png').convert('RGBA');out.alpha_composite(layer);out.alpha_composite(text)
  diff=np.any(np.array(out)!=a,axis=2);changed=int((diff&~mask).sum());assert changed==0,changed
  p=folder/f"{d['id']}-{revision}.png";out.save(p)
  runtime=R/'apps/web/public/game-assets/cards'/f"{d['id']}.webp";runtime.parent.mkdir(parents=True,exist_ok=True);out.resize((512,768),Image.Resampling.LANCZOS).save(runtime,lossless=True,method=6)
  verification=dict(dimensions=list(out.size),protected_pixels=int((~mask).sum()),changed_protected_pixels=changed,template_sha256=sha(T/'baseline.png'),mask_sha256=sha(T/'mask-union.png'),output_sha256=sha(p),mask_version='warlock-v1',text_matches_live_content=True)
  save(folder/'verification.json',verification);save(folder/'text-layout.json',layouts)
  rec=dict(canonical_id=d['id'],tracking_id=d['id'],category='warlock',variant='base',source_snapshot=d,status='pending_approval',current_revision=revision,output_path=p.relative_to(R).as_posix(),artwork_path=(folder/'illustration.png').relative_to(R).as_posix(),runtime=runtime.relative_to(R/'apps/web/public').as_posix(),verification=verification,source=dict(path=str(source),sha256=sha(source),gallery=ledger.get(sha(source)),authorization='User approved six-summon preview and requested Hellbound Legion cards; integration authorized, new cards pending review'))
  if old:rec['prior_revisions']=[*old.get('prior_revisions',[]),dict(revision=old['current_revision'],path=old['output_path'],sha256=old['verification']['output_sha256'],status='stale',reason='User revised promotion inheritance and summon lifetime rules.')]
  records.append(rec);thumbs.append(out.resize((256,384),Image.Resampling.LANCZOS));print(d['id'],changed,'protected pixel changes',layouts[-1]['font_size'],'rules font')
 columns=5 if len(thumbs)==15 else 7
 sheet=Image.new('RGB',(columns*272,((len(thumbs)+columns-1)//columns)*410),(30,14,16))
 for i,im in enumerate(thumbs):sheet.paste(im,((i%columns)*272+8,(i//columns)*410+8))
 sheet.save(B/f'hellbound-legion-review-{REV}.png')
 save(B/'manifest.json',dict(schema_version=1,project_root=str(R),template='template',cards=records,active_batch=dict(id='hellbound-legion-'+REV,status='awaiting_approval',card_ids=[d['id'] for d in data])))
if __name__=='__main__':assemble()
