from pathlib import Path
import json,hashlib,shutil,re
import numpy as np
from PIL import Image,ImageDraw,ImageFont,ImageOps
R=Path('C:/Users/wilsh/Projects/runelord'); A=R/'assets/cards'; T=A/'templates/ranger-v1'; B=A/'ranger-batch-001'
O=Path('C:/Users/wilsh/Documents/Codex/2026-10-02/c-2/outputs/ranger-cards')
sha=lambda p:hashlib.sha256(p.read_bytes()).hexdigest()
def save(p,d):p.write_text(json.dumps(d,indent=2,ensure_ascii=False),encoding='utf-8')
for p in [T,B,O]:p.mkdir(parents=True,exist_ok=True)
src=A/'reference-samples/ranger-hunters-mark.png'
shutil.copy2(src,T/'baseline.png');shutil.copy2(A/'templates/runeblade-v1/Georgia-Bold.ttf',T/'Georgia-Bold.ttf')
base=Image.open(src).convert('RGBA');a=np.array(base);clean=a.copy();masks={}
boxes={'title':(274,81,885,178),'cost':(84,80,164,178),'type':(300,963,730,1013),'rules':(110,1070,915,1353)}
for name,(x0,y0,x1,y1) in boxes.items():
 m=Image.new('L',base.size);ImageDraw.Draw(m).rectangle((x0,y0,x1-1,y1-1),fill=255);masks[name]=np.array(m)>0
 u=np.linspace(0,1,x1-x0+2)[1:-1][None,:,None];v=np.linspace(0,1,y1-y0+2)[1:-1][:,None,None]
 left=a[y0:y1,x0-1,:3].astype(float)[:,None,:];right=a[y0:y1,x1,:3].astype(float)[:,None,:]
 top=a[y0-1,x0:x1,:3].astype(float)[None,:,:];bottom=a[y1,x0:x1,:3].astype(float)[None,:,:]
 edge=np.minimum(np.arange(y1-y0)+1,np.arange(y1-y0)[::-1]+1);blend=np.clip(edge/12,0,1)[:,None,None]
 fill=(left*(1-u)+right*u)*blend+(top*(1-v)+bottom*v)*(1-blend)
 clean[y0:y1,x0:x1,:3]=np.clip(np.rint(fill),0,255).astype('uint8')
art=Image.new('L',base.size);ImageDraw.Draw(art).polygon([(57,270),(79,246),(124,244),(172,237),(202,223),(934,223),(967,258),(967,892),(935,937),(85,937),(57,912)],fill=255);masks['art']=np.array(art)>0
union=np.logical_or.reduce(list(masks.values()))
for n,m in masks.items():Image.fromarray(m.astype('uint8')*255).save(T/f'mask-{n}.png')
Image.fromarray(union.astype('uint8')*255).save(T/'mask-union.png');Image.fromarray(clean).save(T/'clean-panels.png')
fixed=a.copy();fixed[union,3]=0;Image.fromarray(fixed).save(T/'fixed-frame.png')
review=a.copy();review[union,:3]=(review[union,:3]*.4+np.array([20,220,130])*.6).astype('uint8');Image.fromarray(review).save(T/'mask-review.png')
save(T/'template.json',{'version':'ranger-v1','source':str(src),'source_sha256':sha(src),'mask_sha256':sha(T/'mask-union.png'),'protected_pixels':int((~union).sum()),'font_note':'Georgia Bold is a serif match; original raster typeface unidentified.','rarity_note':'Original gem preserved as ornament; rarity in metadata.','regions':boxes})
idxpath=A/'card-art-index.json';idx=json.loads(idxpath.read_text(encoding='utf-8-sig'));ledger=json.loads((R/'assets/approvals/decisions.json').read_text(encoding='utf-8-sig'))['decisions']
for c in idx['cards']:
 p=Path(c.get('output_path','__missing__'))
 if p.is_file():
  h=sha(p);decision=ledger.get(h)
  if decision:
   c['gallery_decision']={'sha256':h,**decision};c['status']={'Approved':'approved','Needs revision':'needs_revision','Pending approval':'pending_approval'}[decision['status']]
for batch in idx.get('parallel_round',{}).get('batches',[]):
 batch['individual_decisions']={cid:next(c['status'] for c in idx['cards'] if c['tracking_id']==cid) for cid in batch['card_ids']}
 if all(s=='approved' for s in batch['individual_decisions'].values()):batch['status']='approved'
if all(b['status']=='approved' for b in idx.get('parallel_round',{}).get('batches',[])):
 idx['parallel_round']['status']='approved';idx['pending_parallel_batches']=[]
 if idx.get('active_batch'):idx['batch_history'].append({**idx['active_batch'],'status':'approved'})
idx['ranger_art_direction']={'user_quote':'Make sure the ranger is only fully feature in about 5 of them and have her not in or only partially in the rest','full_feature_rows':['3','24','51','64','70'],'full_feature_names':["Hunter\u0027s Mark",'Whisper of the Wild','Beastmaster Form','Wind Runner','Heart of the Wild'],'scope':'70 base cards; five hero-focused illustrations, including existing Hunter\u0027s Mark reference. All others absent or cropped detail only.'}
ids=['catalog/cards-ranger.md#'+s for s in ['1','2','4']]
idx['active_batch']={'batch_id':'ranger-batch-001','card_ids':ids,'reviewed_revision_ids':{},'individual_decisions':{},'status':'generating'}
save(idxpath,idx)
refs=[A/'reference-samples/ranger-hunters-mark.png',A/'reference-samples/runeblade-frostbite-master.png',R/'assets/heroes/references/ranger/ranger-base-r1.png']
save(B/'reference-provenance.json',[{'path':str(p),'sha256':sha(p),'decision':ledger.get(sha(p))} for p in refs])
inputs=json.loads((B/'generation-inputs.json').read_text(encoding='utf-8'))
previews=[]
for no,spec in inputs.items():
 c=next(c for c in idx['cards'] if c['tracking_id']=='catalog/cards-ranger.md#'+no);d=c['source_snapshot'];slug=re.sub('[^a-z0-9]+','-',d['name'].lower()).strip('-');folder=B/slug/'r1';folder.mkdir(parents=True,exist_ok=True)
 shutil.copy2(spec['path'],folder/'illustration.png');(folder/'illustration-prompt.txt').write_text(spec['prompt'],encoding='utf-8');save(folder/'source-snapshot.json',d);save(folder/'text-data.json',d)
 artmask=Image.open(T/'mask-art.png');box=artmask.getbbox();im=ImageOps.fit(Image.open(spec['path']).convert('RGBA'),(box[2]-box[0],box[3]-box[1]),method=Image.Resampling.LANCZOS)
 layer=Image.new('RGBA',base.size);layer.paste(im,box[:2]);layer.putalpha(artmask);layer.save(folder/'art-layer.png')
 text=Image.new('RGBA',base.size);draw=ImageDraw.Draw(text);layout=[]
 for region,s,size in [('title',d['name'],100),('cost',d['cost'],120),('type',d['type'].upper()+' · RANGER',38),('rules',d['rules'].replace('**',''),56)]:
  x0,y0,x1,y1=boxes[region]
  while True:
   f=ImageFont.truetype(str(T/'Georgia-Bold.ttf'),size);lines=[s]
   if region=='rules':
    lines=[]
    for sentence in re.split(r'(?<=[.!?])\s+',s):
     seg=['']
     for word in sentence.split():
      candidate=(seg[-1]+' '+word).strip()
      if draw.textlength(candidate,font=f)>x1-x0-24 and seg[-1]:seg.append(word)
      else:seg[-1]=candidate
     lines.extend(seg)
   bbs=[draw.textbbox((0,0),line,font=f) for line in lines];hs=[b[3]-b[1] for b in bbs];gap=int(size*.32);height=sum(hs)+gap*(len(lines)-1)
   if max(b[2]-b[0] for b in bbs)<x1-x0-12 and height<y1-y0-12:break
   size-=1
  y=(y0+y1-height)/2
  for line,bb,h in zip(lines,bbs,hs):draw.text(((x0+x1-bb[2]+bb[0])/2-bb[0],y-bb[1]),line,font=f,fill=(4,15,8,255));y+=h+gap
  assert ' '.join(lines)==s
  layout.append({'region':region,'text':s,'lines':lines,'font_size':size})
 text.save(folder/'text-layer.png');assert not np.any((np.array(text)[:,:,3]>0)&~union)
 composed=Image.fromarray(clean);composed.alpha_composite(layer);composed.alpha_composite(text);out=np.array(composed);changed=int((np.any(out!=a,axis=2)&~union).sum());assert changed==0
 path=folder/(slug+'-r1.png');composed.save(path);shutil.copy2(path,O/path.name)
 v={'dimensions':list(composed.size),'protected_pixels':int((~union).sum()),'changed_protected_pixels':changed,'protected_alpha_identical':bool(np.array_equal(out[:,:,3][~union],a[:,:,3][~union])),'template_sha256':sha(T/'baseline.png'),'mask_sha256':sha(T/'mask-union.png'),'text_matches_catalog':True,'visual_inspection':'pending','mask_version':'ranger-v1'}
 save(folder/'verification.json',v);save(folder/'text-layout.json',layout)
 c.update(status='draft',current_revision='r1',assigned_batch='ranger-batch-001',output_path=str(path),revision_directory=str(folder),artwork_path=str(folder/'illustration.png'),text_source_path=str(folder/'text-data.json'),text_layer_path=str(folder/'text-layer.png'),art_layer_path=str(folder/'art-layer.png'),illustration_prompt_path=str(folder/'illustration-prompt.txt'),reference_image_paths=[str(p) for p in refs],template_path=str(T/'baseline.png'),template_hash=sha(T/'baseline.png'),editable_mask_path=str(T/'mask-union.png'),editable_mask_version='ranger-v1',mask_hash=sha(T/'mask-union.png'),dimensions=list(base.size),verification=v,generation_method='built-in imagegen',ranger_presence=spec['presence'])
 idx['active_batch']['reviewed_revision_ids'][c['tracking_id']]='r1';idx['active_batch']['individual_decisions'][c['tracking_id']]='pending';save(idxpath,idx)
 previews.append(composed.resize((400,600),Image.Resampling.LANCZOS));print(d['name'],changed,'changed protected pixels')
sheet=Image.new('RGB',(1248,632),(16,30,22))
for i,im in enumerate(previews):sheet.paste(im,(16+i*408,16))
sheet.save(O/'ranger-batch-001-review.png');sheet.save(B/'ranger-batch-001-review.png')
shutil.copy2(__file__,B/'assembly-source.py')

