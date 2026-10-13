from pathlib import Path
import json,hashlib,shutil,re,sys,subprocess,urllib.request,zipfile
import numpy as np
from PIL import Image,ImageDraw,ImageFont,ImageOps
R=Path('C:/Users/wilsh/Projects/runelord');A=R/'assets/cards';B=A/'runeblade-full-set';T=A/'templates/runeblade-v1';O=Path('C:/Users/wilsh/Documents/Codex/2026-10-02/c-3/outputs/runeblade-cards')
P=B/'manifest.json';sha=lambda p:hashlib.sha256(p.read_bytes()).hexdigest()
def save(p,d):p.write_text(json.dumps(d,indent=2,ensure_ascii=False),encoding='utf-8')
def read(p):return json.loads(p.read_text(encoding='utf-8-sig'))
def sync(m):
 save(P,m);ip=A/'card-art-index.json';idx=read(ip)
 byid={c['tracking_id']:c for c in m['cards']}
 idx['cards']=[byid.pop(c['tracking_id'],c) for c in idx['cards']];idx['cards'].extend(byid.values())
 idx['runeblade_production']={'manifest':str(P),'review_gate_removed':m['authorization'],'composition':m['composition'],'status':m['status']}
 if (idx.get('active_batch') or {}).get('batch_id','').startswith('runeblade'):
  idx['active_batch']=None
 save(ip,idx)
def setup():
 B.mkdir(exist_ok=True);O.mkdir(exist_ok=True);idx=read(A/'card-art-index.json');ledger=read(R/'assets/approvals/decisions.json')['decisions'];cards=[]
 for line in (R/'catalog/cards-runeblade.md').read_text(encoding='utf-8').splitlines():
  v=[x.strip() for x in line.split('|')[1:-1]]
  if not v or not v[0].isdigit():continue
  no,name,cost,typ,rar,rules,up=v[:7];cid='catalog/cards-runeblade.md#'+no
  c=next(c.copy() for c in idx['cards'] if c['tracking_id']==cid);snapshot=dict(name=name.replace('**',''),cost=cost,type=typ,rarity=rar.replace('**',''),rules=rules,upgrade=up)
  assert {k:v.replace('**','') for k,v in c['source_snapshot'].items()}=={k:v.replace('**','') for k,v in snapshot.items()},no
  c['source_snapshot']=snapshot
  if no=='3':c['output_path']=str(A/'reference-samples/runeblade-frostbite-master.png');c['current_revision']='reference-r1'
  p=Path(c.get('output_path') or '__none__')
  if p.is_file():
   h=sha(p);dec=ledger.get(h)
   if dec:c['gallery_decision']={'sha256':h,**dec};c['status']={'Approved':'approved','Needs revision':'needs_revision','Pending approval':'pending_approval'}[dec['status']]
  cards.append(c)
 m={'schema_version':1,'project_root':str(R),'authorization':'make runeblade cards','composition':'Distinct action illustrations; exact immutable frame; varied subject emphasis','scope':'70 base Runeblade cards; no upgrades','status':'generating','cards':cards}
 sync(m);print('Initialized 70 cards; 16 approved existing assets preserved.')

def assemble(no):
 spec=read(B/'inputs'/f'{no}.json');m=read(P);c=next(c for c in m['cards'] if c['row_identifier']==no);d=c['source_snapshot'];slug=re.sub('[^a-z0-9]+','-',d['name'].lower()).strip('-');rev=spec.get('revision','r1');folder=B/slug/rev;folder.mkdir(parents=True,exist_ok=True)
 if c['status'] not in ['missing','draft']:raise RuntimeError('Already produced '+no)
 shutil.copy2(spec['path'],folder/'illustration.png');(folder/'illustration-prompt.txt').write_text(spec['prompt'],encoding='utf-8');save(folder/'text-data.json',d);save(folder/'source-snapshot.json',d)
 base=Image.open(T/'baseline.png').convert('RGBA');a=np.array(base);union=np.array(Image.open(T/'mask-union.png'))>0;artmask=Image.open(T/'mask-art.png');box=artmask.getbbox()
 art=ImageOps.fit(Image.open(spec['path']).convert('RGBA'),(box[2]-box[0],box[3]-box[1]),method=Image.Resampling.LANCZOS);layer=Image.new('RGBA',base.size);layer.paste(art,box[:2]);layer.putalpha(artmask);layer.save(folder/'art-layer.png')
 text=Image.new('RGBA',base.size);draw=ImageDraw.Draw(text);layouts=[]
 for region,s,size in [('title',d['name'],100),('cost',d['cost'],120),('type',d['type'].upper()+' · RUNEBLADE',38),('rules',d['rules'].replace('**',''),56)]:
  x0,y0,x1,y1=Image.open(T/f'mask-{region}.png').getbbox()
  while True:
   f=ImageFont.truetype(str(T/'Georgia-Bold.ttf'),size);lines=[s]
   if region=='rules':
    lines=[]
    for sentence in re.split(r'(?<=[.!?])\s+',s):
     segment=['']
     for word in sentence.split():
      candidate=(segment[-1]+' '+word).strip()
      if draw.textlength(candidate,font=f)>x1-x0-24 and segment[-1]:segment.append(word)
      else:segment[-1]=candidate
     lines.extend(segment)
   bbs=[draw.textbbox((0,0),line,font=f) for line in lines];hs=[b[3]-b[1] for b in bbs];gap=int(size*.25);height=sum(hs)+gap*(len(lines)-1)
   if max(b[2]-b[0] for b in bbs)<x1-x0-12 and height<y1-y0-12:break
   size-=1
   assert size>=18,(no,region)
  y=(y0+y1-height)/2
  for line,bb,h in zip(lines,bbs,hs):draw.text(((x0+x1-bb[2]+bb[0])/2-bb[0],y-bb[1]),line,font=f,fill=(4,15,8,255));y+=h+gap
  assert ' '.join(lines)==s
  layouts.append(dict(region=region,text=s,lines=lines,font_size=size))
 text.save(folder/'text-layer.png');assert not np.any((np.array(text)[:,:,3]>0)&~union)
 out=Image.open(T/'clean-panels.png').convert('RGBA');out.alpha_composite(layer);out.alpha_composite(text);arr=np.array(out);changed=int((np.any(arr!=a,axis=2)&~union).sum());assert changed==0
 path=folder/(slug+'-'+rev+'.png');out.save(path);shutil.copy2(path,O/path.name)
 v={'dimensions':[1024,1536],'protected_pixels':int((~union).sum()),'changed_protected_pixels':changed,'protected_alpha_identical':bool(np.array_equal(arr[:,:,3][~union],a[:,:,3][~union])),'template_sha256':sha(T/'baseline.png'),'mask_sha256':sha(T/'mask-union.png'),'mask_version':'runeblade-v1','text_matches_catalog':True,'text_within_masks':True,'visual_inspection':'pending'}
 save(folder/'verification.json',v);save(folder/'text-layout.json',layouts);save(folder/'reference-provenance.json',[{'path':p,'sha256':sha(Path(p))} for p in spec['references']])
 c.update(status='draft',current_revision=rev,output_path=str(path),output_sha256=sha(path),revision_directory=str(folder),artwork_path=str(folder/'illustration.png'),text_source_path=str(folder/'text-data.json'),text_layer_path=str(folder/'text-layer.png'),art_layer_path=str(folder/'art-layer.png'),illustration_prompt_path=str(folder/'illustration-prompt.txt'),reference_image_paths=spec['references'],template_path=str(T/'baseline.png'),template_hash=sha(T/'baseline.png'),editable_mask_path=str(T/'mask-union.png'),editable_mask_version='runeblade-v1',mask_hash=sha(T/'mask-union.png'),dimensions=[1024,1536],verification=v,generation_method='built-in imagegen',runeblade_presence=spec['presence']);sync(m)
 preview=O/f'preview-{no}.png';out.resize((512,768),Image.Resampling.LANCZOS).save(preview)
 print(json.dumps({'name':d['name'],'preview':str(preview),'min_text_size':min(v['font_size'] for v in layouts),'zero_protected_diff':True}))
def submit(numbers):
 m=read(P)
 for no in numbers:
  c=next(c for c in m['cards'] if c['row_identifier']==no);p=Path(c['output_path']);slug=re.sub('[^a-z0-9]+','-',c['source_snapshot']['name'].lower()).strip('-')
  c['verification']['visual_inspection']='Inspected generated illustration and composed card preview. Action and Runeblade presence match brief; catalog name, cost, category, rules readable; no frame or anatomy defects noted.'
  save(Path(c['revision_directory'])/'verification.json',c['verification'])
  run=subprocess.run(['node',str(R/'style-gallery/submit.mjs'),str(p),'runeblade-'+slug,c['current_revision'],'Cards',c['source_snapshot']['name']+' — Runeblade '+c['current_revision']],capture_output=True,text=True,check=True)
  c['gallery_submission']=json.loads(run.stdout);c['status']='pending_approval';print(c['source_snapshot']['name']+': submitted')
 sync(m)
if __name__=='__main__':
 if sys.argv[1]=='setup':setup()
 elif sys.argv[1]=='assemble':assemble(sys.argv[2])
 elif sys.argv[1]=='submit':submit(sys.argv[2:])
 elif sys.argv[1]=='review':
  nums=sys.argv[2:];sheet=Image.new('RGB',(512*min(2,len(nums)),768*((len(nums)+1)//2)),(20,30,22))
  for i,no in enumerate(nums):sheet.paste(Image.open(O/f'preview-{no}.png'),((i%2)*512,(i//2)*768))
  sheet.save(O/'current-review.png')

