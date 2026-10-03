from PIL import Image,ImageDraw,ImageFilter
from pathlib import Path
import numpy as np
import json,hashlib,sys
ROOT=Path('C:/Users/wilsh/Projects/runelord/assets/characters/cinderhook-marauder/animation-nine-2026-10-02')
vid=sys.argv[1];d=ROOT/vid;src=d/'source'/('poses-r2.png' if (d/'source/poses-r2.png').exists() and not vid.startswith('v03') else 'poses-r1.png');im=Image.open(src).convert('RGBA'); data=np.array(im);a=data[:,:,3];solid=a>30;h,w=solid.shape; labels=np.zeros((h,w),dtype=np.int32); comps=[];n=0
for yy,xx in zip(*np.where(solid)):
 if labels[yy,xx]:continue
 n+=1;q=[(int(xx),int(yy))];labels[yy,xx]=n;pts=[]
 while q:
  x,y=q.pop();pts.append((x,y))
  for u,v in [(x-1,y),(x+1,y),(x,y-1),(x,y+1)]:
   if 0<=u<w and 0<=v<h and solid[v,u] and not labels[v,u]:labels[v,u]=n;q.append((u,v))
 if len(pts)>500:
  xs,ys=zip(*pts);comps.append({'id':n,'count':len(pts),'box':[min(xs),min(ys),max(xs)+1,max(ys)+1]})
rowcount=6 if vid.startswith('v02') else 5
assert len(comps)==rowcount*4,(vid,len(comps),comps)
comps.sort(key=lambda c:(c['box'][1]+c['box'][3])/2)
# Group by y bands then x; complete poses may extend across nominal grid lines.
ordered=[]
for r in range(rowcount):ordered.extend(sorted(comps[r*4:(r+1)*4],key=lambda c:(c['box'][0]+c['box'][2])/2))
W=448;H=384;ground=320;state_names=['idle','attack','hit','wounded_idle','die']+(['guard'] if rowcount==6 else []);allframes={};source_rects={}
for r,st in enumerate(state_names):
 allframes[st]=[];source_rects[st]=[]
 for c in range(4):
  co=ordered[r*4+c];x0,y0,x1,y1=co['box'];box=(max(0,x0-4),max(0,y0-4),min(w,x1+4),min(h,y1+4));crop=im.crop(box)
  # Deterministic connected-component cell slicing isolates neighboring poses,
  # retaining the generated RGBA pixels and antialias fringe within 4px.
  mask=Image.fromarray(((labels[box[1]:box[3],box[0]:box[2]]==co['id'])*255).astype('uint8')).filter(ImageFilter.MaxFilter(9));ca=np.array(crop);ca[:,:,3]=np.where(np.array(mask)>0,ca[:,:,3],0);crop=Image.fromarray(ca)
  # Uniform scale 1; register nominal column origin and source ground contact.
  ox=round(box[0]-c*w/4+72);oy=ground-y1+box[1]
  f=Image.new('RGBA',(W,H));f.alpha_composite(crop,(ox,oy));allframes[st].append(f);source_rects[st].append({'source':str(src),'box':list(box),'offset':[ox,oy],'scale':1,'sliceComponent':co['id'],'alphaSlicingThreshold':30,'antialiasPadding':4})
if vid.startswith('v03'):
 repair=d/'source/poses-r2.png';box=[325,287,530,571];offset=[117,40];crop=Image.open(repair).convert('RGBA').crop(box);ca=np.array(crop);sm=ca[:,:,3]>30;seen=np.zeros_like(sm);best=[]
 for yy,xx in zip(*np.where(sm)):
  if seen[yy,xx]:continue
  q=[(int(xx),int(yy))];seen[yy,xx]=1;pts=[]
  while q:
   x,y=q.pop();pts.append((x,y))
   for u,v in [(x-1,y),(x+1,y),(x,y-1),(x,y+1)]:
    if 0<=u<crop.width and 0<=v<crop.height and sm[v,u] and not seen[v,u]:seen[v,u]=1;q.append((u,v))
  if len(pts)>len(best):best=pts
 cm=np.zeros_like(sm,dtype='uint8')
 for x,y in best:cm[y,x]=255
 cm=np.array(Image.fromarray(cm).filter(ImageFilter.MaxFilter(9)));ca[:,:,3]=np.where(cm>0,ca[:,:,3],0);crop=Image.fromarray(ca)
 f=Image.new('RGBA',(W,H));f.alpha_composite(crop,offset);allframes['attack'][1]=f;source_rects['attack'][1]={'source':str(repair),'box':box,'offset':offset,'scale':1,'sha256':hashlib.sha256(repair.read_bytes()).hexdigest(),'slicing':'largest connected character component plus4px antialias margin'}
if vid.startswith('v05') and (d/'source/poses-r3.png').exists():
 repair=d/'source/poses-r3.png';raw=Image.open(repair).convert('RGBA')
 for ci,box,offset in [(1,[256,293,534,571],[48,46]),(2,[577,295,834,571],[88,48])]:
  f=Image.new('RGBA',(W,H));f.alpha_composite(raw.crop(box),offset);allframes['attack'][ci]=f;source_rects['attack'][ci]={'source':str(repair),'box':box,'offset':offset,'scale':1,'sha256':hashlib.sha256(repair.read_bytes()).hexdigest()}
if vid.startswith('v04') and (d/'source/release-r3.png').exists():
 repair=d/'source/release-r3.png';raw=Image.open(repair).convert('RGBA');allframes['attack'][2]=raw.resize((W,H),Image.Resampling.LANCZOS);source_rects['attack'][2]={'source':str(repair),'box':[0,0,raw.width,raw.height],'offset':[0,0],'scale':W/raw.width,'sha256':hashlib.sha256(repair.read_bytes()).hexdigest(),'note':'Uniform full-canvas downsampling of generated release correction; projectile baked in.'}
seqs={'idle':([0,1,2,3,2,1],[200]*6),'attack':([0,1,2,3,0],[90,110,60,80,90]),'hit':([0,1,2,3,0],[40,80,100,90,70]),'wounded_idle':([0,1,2,3,2,1],[230]*6),'die':([0,1,2,3],[130,160,150,600]),'guard':([0,1,2,3],[100,130,200,110])}
manifest={'variantId':vid,'source':{'path':str(src),'sha256':hashlib.sha256(src.read_bytes()).hexdigest()},'approvedIdentity':str(ROOT.parent/'variants-nine-2026-10-02'/f'{vid}-r1.png'),'canvas':{'width':W,'height':H},'anchor':{'x':245,'y':ground},'coordinateSystem':'top-left pixels; x right, y down','facing':'left','states':{},'sourceRects':source_rects,'previews':{},'limitations':['Coarse hand-drawn whole-frame animation; 4 authored poses per state.','Native pose resolution ~250-280px; not upscaled to claim HD.','Awaiting independent visual playback QA; generated stance jitter may be visible.'],'method':'reference-conditioned whole-character frames'}
atlas=Image.new('RGBA',(4*W,rowcount*H));combined=[];cd=[]
for ri,st in enumerate(state_names):
 fd=d/'frames'/st;fd.mkdir(parents=True,exist_ok=True);files=[]
 for i,f in enumerate(allframes[st]):
  path=fd/f'{i:02d}.png';f.save(path);files.append(path.relative_to(d).as_posix());atlas.alpha_composite(f,(i*W,ri*H))
 seq,durations=seqs[st];loop=st in ['idle','wounded_idle'];frames=[{'file':files[i],'durationMs':durations[j],'atlasRect':[i*W,ri*H,W,H],'sourceSize':[W,H],'trimOffset':[0,0]} for j,i in enumerate(seq)]
 event='release' if vid.startswith(('v04','v05')) else 'impact'
 manifest['states'][st]={'frames':frames,'loop':loop,'events':[{'name':event,'timeMs':200}] if st=='attack' else ([{'name':'brace','timeMs':100},{'name':'exit','timeMs':430}] if st=='guard' else []),'nextState':st if loop else ('terminal' if st=='die' else 'idle'),'terminal':st=='die','holdLastFrame':st=='die','durationMs':sum(durations)}
 gif=[]
 for j,i in enumerate(seq):
  f=allframes[st][i];bg=Image.new('RGB',(W*2,H+36),'#232830');bg.paste(f,(0,36),f);light=Image.new('RGB',(W,H),'#e2d9cd');light.paste(f,(0,0),f);bg.paste(light,(W,36));ImageDraw.Draw(bg).text((12,10),vid+' / '+st,fill='white');gif.append(bg);combined.append(bg);cd.append(durations[j])
 preview=d/f'{st}.gif';kwargs={'loop':0} if loop else {};gif[0].save(preview,save_all=True,append_images=gif[1:],duration=durations,disposal=2,**kwargs);manifest['previews'][st]=preview.name
atlas.save(d/'atlas.png');manifest['atlas']='atlas.png';manifest['atlasSha256']=hashlib.sha256((d/'atlas.png').read_bytes()).hexdigest();combined[0].save(d/'preview.gif',save_all=True,append_images=combined[1:],duration=cd,disposal=2);(d/'manifest.json').write_text(json.dumps(manifest,indent=2))
html=(ROOT/'v01-cleaver-bruiser/preview.html').read_text().replace('v01-cleaver-bruiser',vid).replace('width="384"','width="448"').replace('x.drawImage(im,0,0,150,150)','x.drawImage(im,0,0,150,150*im.height/im.width)');(d/'preview.html').write_text(html)
print(json.dumps({'variant':vid,'atlasHash':manifest['atlasSha256'],'components':len(comps),'states':state_names}))
