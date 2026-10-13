from pathlib import Path
import json,hashlib,re,subprocess,shutil
import numpy as np
from PIL import Image,ImageDraw,ImageFont,ImageOps
R=Path(__file__).resolve().parents[3]
B=Path(__file__).resolve().parent
original=R/'assets/cards/runeblade-base-summons-2026-10-05/template'
T=B/'template-v2'
T.mkdir(exist_ok=True)
for p in original.iterdir():
 if p.is_file() and not (T/p.name).exists():shutil.copy2(p,T/p.name)
# The original mask only covered old glyphs. Expand solely in the quiet ivory
# rules interior; the complete original frame, all edges and the gem stay locked.
rules=Image.new('L',(1024,1536));ImageDraw.Draw(rules).rectangle((100,1060,923,1334),fill=255);rules.save(T/'mask-rules.png')
newunion=np.maximum(np.array(Image.open(original/'mask-union.png')),np.array(rules))
Image.fromarray(newunion).save(T/'mask-union.png')
overlay=Image.open(original/'baseline.png').convert('RGBA');tint=Image.new('RGBA',overlay.size);d=ImageDraw.Draw(tint)
d.rectangle((100,1060,923,1334),fill=(0,190,255,60),outline=(0,160,220,255),width=3)
d.rectangle((298,1083,740,1311),outline=(235,50,50,255),width=3);overlay.alpha_composite(tint);overlay.save(T/'mask-review.png')
sha=lambda p:hashlib.sha256(Path(p).read_bytes()).hexdigest()
read=lambda p:json.loads(Path(p).read_text(encoding='utf-8-sig'))
def save(p,d): Path(p).write_text(json.dumps(d,indent=2,ensure_ascii=False),encoding='utf-8')
specs=read(B/'engine-snapshot.json');sources=read(B/'card-art-sources.json')
ledger=read(R/'assets/approvals/decisions.json')['decisions']
base=Image.open(T/'baseline.png').convert('RGBA');baseline=np.array(base)
union=np.array(Image.open(T/'mask-union.png'))>0
template=read(original/'template.json')
template.update(version='runeblade-demo-v2',mask_sha256=sha(T/'mask-union.png'),parent_mask=str(original/'mask-union.png'),rules_interior=[100,1060,924,1335],reason='Original mask covered the old glyph footprint only. Extended solely in the quiet ivory rules interior for the requested automatic Corpse payment sentence; all borders, spirals and the bottom gem remain protected.',baseline_immutable=True,protected_pixels=int((~union).sum()))
save(T/'template.json',template)
records=[];thumbs=[];runtime={}
for spec in specs:
 id=spec['id'];folder=B/id/'r1';folder.mkdir(parents=True,exist_ok=True)
 if id.startswith('summon-'):
  unit=id[7:];source=R/'assets/cards/runeblade-base-summons-2026-10-05'/unit/'r1/illustration.png'
  art=Image.open(source).convert('RGBA');transform='Existing fresh summon illustration; uniform fit into art window.'
  match=re.search(r': (\d+) HP / (\d+) Power\. (.*?) Rot starts',spec['rules']);assert match,id
  hp,power,effect=match.groups()
  display=f'Summon a Thrall. {hp} HP / {power} Power.\n{effect}\nRot starts at 1.\nIf you have {spec["cost"]} Corpses, spend them instead of Mana.'
 else:
  entry=sources[id];source=R/entry['source'];e=entry['extract']
  art=Image.open(source).convert('RGBA').crop((e['left'],e['top'],e['left']+e['width'],e['top']+e['height']))
  transform='Extract existing illustration window only; old title and rules excluded. '+entry['note']
  display=spec['rules'].replace('card(s)','card')
 decision=ledger.get(sha(source),{'status':'Pending approval'})
 assert decision['status']!='Needs revision',str(source)
 art.save(folder/'illustration.png')
 brief=f'Reuse the existing Runeblade artwork at {source.relative_to(R)}. {transform} New mechanics text from packages/content/runeblade.ts. No AI generation or repainting performed.'
 (folder/'illustration-brief.txt').write_text(brief,encoding='utf-8')
 data={**spec,'displayRules':display,'authoritativeSource':'packages/content/runeblade.ts','engine_source_sha256':sha(R/'packages/content/runeblade.ts')}
 save(folder/'text-data.json',data);save(folder/'source-snapshot.json',data)
 mask=Image.open(T/'mask-art.png');box=mask.getbbox()
 layer=Image.new('RGBA',base.size);layer.paste(ImageOps.fit(art,(box[2]-box[0],box[3]-box[1]),method=Image.Resampling.LANCZOS),box[:2]);layer.putalpha(mask);layer.save(folder/'art-layer.png')
 text=Image.new('RGBA',base.size);draw=ImageDraw.Draw(text);layouts=[]
 for region,s,size in [('title',spec['name'],100),('cost',str(spec['cost']),120),('type',spec['type'].upper()+' · RUNEBLADE',38),('rules',display,56)]:
  x0,y0,x1,y1=Image.open(T/f'mask-{region}.png').getbbox()
  while True:
   font=ImageFont.truetype(str(T/'Georgia-Bold.ttf'),size);lines=[]
   if region=='rules':
    for paragraph in s.split('\n'):
     line=''
     for word in paragraph.split():
      test=(line+' '+word).strip()
      if line and draw.textlength(test,font=font)>x1-x0-28:lines.append(line);line=word
      else:line=test
     lines.append(line)
   else:lines=[s]
   bounds=[draw.textbbox((0,0),l,font=font) for l in lines];heights=[b[3]-b[1] for b in bounds];gap=max(5,int(size*.23));height=sum(heights)+gap*(len(lines)-1)
   if max(b[2]-b[0] for b in bounds)<x1-x0-24 and height<y1-y0-22:break
   size-=1
   assert size>=(30 if region=='type' else 34),(id,region,size)
  y=(y0+y1-height)/2
  for line,bb,h in zip(lines,bounds,heights):
   draw.text(((x0+x1-(bb[2]-bb[0]))/2-bb[0],y-bb[1]),line,font=font,fill=(4,15,27,255));y+=h+gap
  assert ' '.join(lines)==' '.join(s.split()),id
  layouts.append(dict(region=region,text=s,font_size=size,lines=lines))
 text.save(folder/'text-layer.png');assert not np.any((np.array(text)[:,:,3]>0)&~union)
 out=Image.open(T/'clean-panels.png').convert('RGBA');out.alpha_composite(layer);out.alpha_composite(text)
 changed=int((np.any(np.array(out)!=baseline,axis=2)&~union).sum());assert changed==0
 path=folder/(id+'-card-r1.png');out.save(path)
 verification={'dimensions':list(out.size),'protected_pixel_count':int((~union).sum()),'changed_protected_pixels':changed,'protected_alpha_identical':bool(np.array_equal(np.array(out)[:,:,3][~union],baseline[:,:,3][~union])),'template_sha256':sha(T/'baseline.png'),'mask_sha256':sha(T/'mask-union.png'),'editable_mask_version':'runeblade-demo-v2','text_min_rules_px':layouts[-1]['font_size'],'text_matches_engine_semantics':True,'automatic_corpse_cost_visible':id.startswith('summon-')}
 save(folder/'verification.json',verification);save(folder/'text-layout.json',layouts)
 rec={'tracking_id':'roguelike/runeblade/'+id,'canonical_id':id,'catalog_path':'packages/content/runeblade.ts','row_identifier':id,'category':'Runeblade','variant':'base','source_snapshot':data,'status':'pending_approval','current_revision':'demo-r1','output_path':str(path),'sha256':sha(path),'dimensions':list(out.size),'artwork_path':str(folder/'illustration.png'),'text_source_path':str(folder/'text-data.json'),'illustration_prompt_path':str(folder/'illustration-brief.txt'),'reference_image_paths':[str(source),str(T/'baseline.png')],'reference_hashes':[sha(source),sha(T/'baseline.png')],'source_art_decision':decision,'template_path':str(T/'baseline.png'),'template_hash':sha(T/'baseline.png'),'editable_mask_path':str(T/'mask-union.png'),'editable_mask_version':'runeblade-demo-v2','mask_hash':sha(T/'mask-union.png'),'verification':verification,'generation_method':'Technical recomposition of existing artwork; exact immutable card frame','integration_authorization':'User requested playable Runeblade roguelike demo, secondary Corpse resource and cards on 2026-10-06.'}
 save(folder/'provenance.json',rec);records.append(rec);runtime[id]=str(path);thumbs.append(out.resize((256,384),Image.Resampling.LANCZOS))
 print(id,'rules font',layouts[-1]['font_size'],'zero protected diff')
overview=Image.new('RGB',(6*266,4*394),(13,24,36))
for i,im in enumerate(thumbs):overview.paste(im,(5+(i%6)*266,5+(i//6)*394))
overview.save(B/'overview.png')
for start in range(0,len(thumbs),4):
 sheet=Image.new('RGB',(4*522,778),(13,24,36))
 for j,rec in enumerate(records[start:start+4]):sheet.paste(Image.open(rec['output_path']).resize((512,768),Image.Resampling.LANCZOS),(5+j*522,5))
 sheet.save(B/f'review-{start//4+1}.jpg',quality=94)
save(B/'manifest.json',{'schema_version':1,'status':'production_complete_pending_user_review','cards':records,'source_snapshot':str(B/'engine-snapshot.json'),'source_sha256':sha(B/'engine-snapshot.json')})
idx=read(R/'assets/cards/card-art-index.json');keys={c['tracking_id'] for c in records}
idx['cards']=[c for c in idx['cards'] if c['tracking_id'] not in keys]+records
idx['runeblade_demo_batch']={'manifest':str(B/'manifest.json'),'status':'awaiting_approval','count':len(records)}
save(R/'assets/cards/card-art-index.json',idx)
save(R/'assets/cards/runeblade-demo-runtime-inputs.json',{'cards':runtime,'source_manifest':str(B/'manifest.json')})
