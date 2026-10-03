from pathlib import Path
import json, hashlib, shutil, sys, re, subprocess
import numpy as np
from PIL import Image, ImageDraw, ImageFont, ImageOps
R=Path('C:/Users/wilsh/Projects/runelord'); A=R/'assets/cards'; T=A/'templates/warlock-v1'; B=A/'warlock-2026-10-02'
OUT=Path('C:/Users/wilsh/Documents/Codex/2026-10-02/c/outputs/warlock-cards')
sha=lambda p:hashlib.sha256(p.read_bytes()).hexdigest()
def save(p,d): p.write_text(json.dumps(d,indent=2,ensure_ascii=False),encoding='utf-8')
def setup():
 T.mkdir(parents=True,exist_ok=True); B.mkdir(exist_ok=True); OUT.mkdir(parents=True,exist_ok=True)
 src=Path('C:/Users/wilsh/.codex/skills/hd-card-creator/references/cards/warlock-summon-imp.png')
 shutil.copy2(src,T/'baseline.png'); shutil.copy2(A/'templates/runeblade-v1/Georgia-Bold.ttf',T/'Georgia-Bold.ttf')
 base=Image.open(src).convert('RGBA'); a=np.array(base); clean=a.copy(); masks={}
 # Inspected Warlock interiors. Rectangles deliberately stop before bevels and ornaments.
 boxes={'title':(308,76,844,183),'cost':(87,76,158,178),'type':(300,969,726,1011),'rules':(263,1168,768,1243)}
 for name,box in boxes.items():
  m=Image.new('L',base.size); ImageDraw.Draw(m).rectangle((box[0],box[1],box[2]-1,box[3]-1),fill=255); masks[name]=np.array(m)>0
 # Rules and title expansion allows long catalog text; extends only across quiet panel interior.
 boxes['title']=(273,75,881,184); boxes['rules']=(110,1070,915,1353)
 for name,box in boxes.items():
  m=Image.new('L',base.size); ImageDraw.Draw(m).rectangle((box[0],box[1],box[2]-1,box[3]-1),fill=255); masks[name]=np.array(m)>0
  x0,y0,x1,y1=box; u=np.linspace(0,1,x1-x0+2)[1:-1][None,:,None];v=np.linspace(0,1,y1-y0+2)[1:-1][:,None,None]
  left=a[y0:y1,x0-1,:3].astype(float)[:,None,:];right=a[y0:y1,x1,:3].astype(float)[:,None,:]
  top=a[y0-1,x0:x1,:3].astype(float)[None,:,:];bottom=a[y1,x0:x1,:3].astype(float)[None,:,:]
  corners=(1-u)*(1-v)*a[y0-1,x0-1,:3]+u*(1-v)*a[y0-1,x1,:3]+(1-u)*v*a[y1,x0-1,:3]+u*v*a[y1,x1,:3]
  fill=left*(1-u)+right*u
  edge=np.minimum(np.arange(y1-y0)+1,np.arange(y1-y0)[::-1]+1)
  blend=np.clip(edge/12,0,1)[:,None,None]
  vertical=top*(1-v)+bottom*v
  fill=fill*blend+vertical*(1-blend)
  clean[y0:y1,x0:x1,:3]=np.clip(np.rint(fill),0,255).astype('uint8')
 # Safe circular interior gives secondary costs room without touching the rim.
 clean[76:178,87:158]=a[76:178,87:158]
 m=Image.new('L',base.size);ImageDraw.Draw(m).ellipse((64,68,184,188),fill=255);masks['cost']=np.array(m)>0
 for y in range(68,189):
  xs=np.where(masks['cost'][y])[0]
  if len(xs):
   x0,x1=xs[0],xs[-1];u=np.linspace(0,1,len(xs))[:,None]
   clean[y,xs,:3]=np.rint(a[y,x0-1,:3]*(1-u)+a[y,x1+1,:3]*u).astype('uint8')
 art=Image.new('L',base.size);ImageDraw.Draw(art).polygon([(57,260),(78,240),(124,243),(169,236),(201,223),(935,223),(967,258),(967,895),(936,937),(84,937),(57,910)],fill=255)
 masks['art']=np.array(art)>0
 union=np.logical_or.reduce(list(masks.values()))
 for n,m in masks.items():Image.fromarray(m.astype('uint8')*255).save(T/f'mask-{n}.png')
 Image.fromarray(union.astype('uint8')*255).save(T/'mask-union.png');Image.fromarray(clean).save(T/'clean-panels.png')
 fixed=a.copy();fixed[union,3]=0;Image.fromarray(fixed).save(T/'fixed-frame.png')
 review=a.copy();review[union,:3]=(review[union,:3]*.4+np.array([20,220,130])*.6).astype('uint8');Image.fromarray(review).save(T/'mask-review.png')
 save(T/'template.json',{'version':'warlock-v1','source':str(src),'source_sha256':sha(src),'mask_sha256':sha(T/'mask-union.png'),'protected_pixels':int((~union).sum()),'font_note':'Georgia Bold is an available serif match, original raster font unidentified.','rarity_note':'Original gem remains ornament; rarity saved in metadata.'})
 rows=[]
 for line in (R/'catalog/cards-warlock.md').read_text(encoding='utf-8').splitlines():
  c=[x.strip() for x in line.split('|')[1:-1]]
  if c and c[0].isdigit():
   no,name,cost,typ,rarity,rules,up=c[:7];rows.append({'tracking_id':'catalog/cards-warlock.md#'+no,'row_identifier':no,'category':'warlock','variant':'base','source_snapshot':dict(name=name.replace('**',''),cost=cost,type=typ,rarity=rarity.replace('**',''),rules=rules,upgrade=up),'status':'reference_only' if no=='3' else 'missing'})
 if not (B/'manifest.json').exists():save(B/'manifest.json',{'schema_version':1,'project_root':str(R),'scope':'70 base Warlock cards','review_gate_override':{'quote':'Create warlock cards. The 3 limit review is lifted','date':'2026-10-02'},'cards':rows})
 print('Prepared Warlock template and 70-card manifest')
def assemble(no,src,promptfile):
 idx=json.loads((B/'manifest.json').read_text(encoding='utf-8'));c=next(c for c in idx['cards'] if c['row_identifier']==no);d=c['source_snapshot'];slug=re.sub('[^a-z0-9]+','-',d['name'].lower()).strip('-');folder=B/slug/'r1';folder.mkdir(parents=True,exist_ok=True)
 shutil.copy2(src,folder/'illustration.png');shutil.copy2(promptfile,folder/'illustration-prompt.txt');save(folder/'source-snapshot.json',d);save(folder/'text-data.json',d)
 base=Image.open(T/'baseline.png').convert('RGBA');a=np.array(base);mask=np.array(Image.open(T/'mask-union.png'))>0
 artmask=Image.open(T/'mask-art.png');box=artmask.getbbox();art=ImageOps.fit(Image.open(src).convert('RGBA'),(box[2]-box[0],box[3]-box[1]),method=Image.Resampling.LANCZOS)
 layer=Image.new('RGBA',base.size);layer.paste(art,box[:2]);layer.putalpha(artmask);layer.save(folder/'art-layer.png')
 text=Image.new('RGBA',base.size);draw=ImageDraw.Draw(text);layouts=[]
 specs=[('title',d['name'],94),('cost',d['cost'].replace('🔥',' Cinders').replace(' +','\n+'),110),('type',d['type'].upper()+' · WARLOCK',35),('rules',d['rules'].replace('**',''),54)]
 for region,s,size in specs:
  x0,y0,x1,y1=Image.open(T/f'mask-{region}.png').getbbox()
  if region=='cost' and '\n' in s:
   rows=s.split('\n')
   for label,sz,cy in [(rows[0],76,111),(rows[1],15,154)]:
    f=ImageFont.truetype(str(T/'Georgia-Bold.ttf'),sz);bb=draw.textbbox((0,0),label,font=f)
    draw.text((124-(bb[2]-bb[0])/2-bb[0],cy-(bb[3]-bb[1])/2-bb[1]),label,font=f,fill=(24,5,4,255))
   layouts.append({'region':region,'text':s,'lines':rows,'font_sizes':[76,15]});continue
  while True:
   f=ImageFont.truetype(str(T/'Georgia-Bold.ttf'),size);lines=s.split('\n')
   if region=='rules':
    lines=[]
    for sentence in re.split(r'(?<=[.!?])\s+',s):
     segment=['']
     for word in re.findall(r'\d+\+?\s+\S+|\S+',sentence):
      candidate=(segment[-1]+' '+word).strip()
      if draw.textlength(candidate,font=f)>x1-x0-24 and segment[-1]:segment.append(word)
      else:segment[-1]=candidate
     lines.extend(segment)
   bbs=[draw.textbbox((0,0),v,font=f) for v in lines];heights=[b[3]-b[1] for b in bbs];gap=int(size*.28);height=sum(heights)+gap*(len(lines)-1)
   if max(b[2]-b[0] for b in bbs)<x1-x0-12 and height<y1-y0-12:break
   size-=1
  cy=(y0+y1-height)/2
  for line,bb,h in zip(lines,bbs,heights):draw.text(((x0+x1-bb[2]+bb[0])/2-bb[0],cy-bb[1]),line,font=f,fill=(24,5,4,255));cy+=h+gap
  assert ' '.join(lines)==s.replace('\n',' '),(s,lines)
  layouts.append({'region':region,'text':s,'lines':lines,'font_size':size})
 text.save(folder/'text-layer.png');out=Image.open(T/'clean-panels.png').convert('RGBA');out.alpha_composite(layer);out.alpha_composite(text)
 diff=np.any(np.array(out)!=a,axis=2);changed=int((diff&~mask).sum());assert changed==0,changed
 path=folder/(slug+'-r1.png');out.save(path);shutil.copy2(path,OUT/path.name)
 verification={'dimensions':list(out.size),'protected_pixels':int((~mask).sum()),'changed_protected_pixels':changed,'template_sha256':sha(T/'baseline.png'),'mask_sha256':sha(T/'mask-union.png'),'mask_version':'warlock-v1','text_matches_catalog':True,'visual_inspection':'pending'};save(folder/'verification.json',verification);save(folder/'text-layout.json',layouts)
 c.update(status='draft',current_revision='r1',output_path=str(path),revision_directory=str(folder),artwork_path=str(folder/'illustration.png'),prompt_path=str(folder/'illustration-prompt.txt'),verification=verification);save(B/'manifest.json',idx)
 print(json.dumps({'name':d['name'],'path':str(path),'layout':layouts,'protected_changed':changed}))
if __name__=='__main__':
 if sys.argv[1]=='setup':setup()
 else:assemble(*sys.argv[1:])
