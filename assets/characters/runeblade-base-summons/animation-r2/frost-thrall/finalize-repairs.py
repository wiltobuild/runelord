from pathlib import Path
from PIL import Image,ImageDraw
import shutil,json,hashlib
B=Path('C:/Users/wilsh/Projects/runelord/assets/characters/runeblade-base-summons')
def sha(p):return hashlib.sha256(p.read_bytes()).hexdigest()
def dump(p,v):p.write_text(json.dumps(v,indent=2),encoding='utf8')
old=B/'animation-r1/frost-thrall';out=B/'animation-r2/frost-thrall'
shutil.copytree(old,out,dirs_exist_ok=True)
source=Path('C:/Users/wilsh/.codex/generated_images/01a10efa-479d-7f00-8bc7-37de97d4dc69/exec-dccd6fbf-464e-4f20-8ba7-a1194eb06bc3.png')
shutil.copyfile(source,out/'source/cast-02-hand-repair.png')
im=Image.open(source).convert('RGBA');im.resize((768,768),Image.Resampling.LANCZOS).save(out/'frames/cast-02.png')
m=json.loads((out/'manifest.json').read_text());m['revision']='animation-r2';m['status']='review_pending';idx=json.loads((out/'frames/index.json').read_text())['frames']
for e in idx:
 if e['state']=='cast' and e['frame']==2:
  e.update({'sha256':sha(out/e['file']),'source_sheet':'source/cast-02-hand-repair.png','source_sha256':sha(source),'source_rect':[0,0,im.width,im.height],'source_scale':768/im.width,'source_root':None,'translation':[0,0],'repair':'Generated single-canvas replacement retains right-hand axe; left iced arm casts. Canvas resolution normalization only.'})
allgif=[];alldur=[]
for state,clip in m['states'].items():
 clip['frames']=[e for e in idx if e['state']==state];fs=[Image.open(out/e['file']).convert('RGBA') for e in clip['frames']];times=[e['duration_ms'] for e in clip['frames']];cols=4 if state=='idle' else 3 if state in ['attack','die'] else 2
 atlas=Image.new('RGBA',(768*cols,1536))
 for i,f in enumerate(fs):atlas.alpha_composite(f,((i%cols)*768,(i//cols)*768))
 atlas.save(out/clip['atlas'])
 for name,bg in [('dark','#161d28'),('light','#e8e5de')]:
  render=[]
  for f in fs:r=Image.new('RGBA',(768,768),bg);r.alpha_composite(f);render.append(r.convert('RGB'))
  for label,tile in [('full',768),('96px',177)]:
   cs=Image.new('RGB',(cols*tile,2*(tile+24)),bg);d=ImageDraw.Draw(cs);images=[]
   for i,r in enumerate(render):
    r=r.resize((tile,tile));images.append(r);x=(i%cols)*tile;y=(i//cols)*(tile+24);cs.paste(r,(x,y));d.text((x+3,y+tile+4),f'{state} {i:02d}',fill='#b77939')
   cs.save(out/'review'/f'{state}-{label}-{name}.png');images[0].save(out/'preview'/f'{state}-{label}-{name}.gif',save_all=True,append_images=images[1:],duration=times,disposal=2,**({'loop':0} if clip['loop'] else {}))
  if name=='dark':
   for i,r in enumerate(render):r=r.resize((512,512));ImageDraw.Draw(r).text((12,12),f'frost-thrall / {state} / {i:02d}',fill='white');allgif.append(r);alldur.append(times[i])
allgif[0].save(out/'preview/all-states.gif',save_all=True,append_images=allgif[1:],duration=alldur,loop=0,disposal=2)
dump(out/'manifest.json',m);dump(out/'frames/index.json',{'frames':idx});dump(out/'review/repair-log.json',{'repair_agent':'finish_frontline','pass':1,'prior_package':str(old),'status':'independent_recheck_required','changes':[{'state':'cast','frame':2,'repair':'Built-in imagegen redraw from original cast01 preserves axe in right hand and removes erroneous right ice bracer; left iced hand casts','changed_files':['frames/cast-02.png','atlases/cast.png','preview/cast-full-dark.gif','preview/all-states.gif']}],'unchanged_frame_count':31})
checks=[]
for e in idx:
 f=Image.open(out/e['file']);a=f.getchannel('A');checks.append({'state':e['state'],'frame':e['frame'],'output_edge_alpha_max':max(a.crop(r).getextrema()[1] for r in [(0,0,1,768),(767,0,768,768),(0,0,768,1),(0,767,768,768)])})
dump(out/'review/technical-checks.json',{'frame_count':32,'unique_hashes':len(set(e['sha256'] for e in idx)),'frames':checks})
for root in [out,B/'animation-r1/bone-defender',B/'animation-r2/shattered-queen']:
 manifest=json.loads((root/'manifest.json').read_text())
 if root.name=='bone-defender':manifest['geometry']['front_foot_anchor_x']=160
 if root.name=='shattered-queen':manifest['geometry']={'canvas':[768,768],'root_anchor':[384,350],'anchor_kind':'belt diamond floating torso','source_scale_by_state':manifest['geometry']['source_scale_by_state'],'scale_policy':'fixed per generated source sheet; no per-pose scaling','camera':'three-quarter right'}
 dump(root/'manifest.json',manifest);dump(root/'review-pending-freeze.json',{'status':'review_pending','manifest_sha256':sha(root/'manifest.json'),'index_sha256':sha(root/'frames/index.json'),'preview_sha256':sha(root/'preview/all-states.gif'),'frame_count':32,'independent_review':'required'})
print('Frost cast02 repair exported; 31 prior frame hashes retained. Bone/queen metadata corrected.')
