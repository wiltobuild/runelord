from pathlib import Path
from PIL import Image,ImageDraw,ImageFilter,ImageChops
from collections import deque
import numpy as np,math,json,hashlib,shutil
root=Path(r'C:/Users/Wil/Documents/Codex/2026-10-09/sp-2');out=root/'outputs/ash-pikeman-states-r1';out.mkdir(exist_ok=True)
base=root/'outputs/ash-pikeman-idle-r1';canvas=(1400,1200);offset=(340,120);anchor=(700,1093)
gen=Path(r'C:/Users/Wil/.codex/generated_images/01a121ae-43ee-7ee3-a606-b0a167e32e45')
sources={'combat':'exec-3b37408e-4593-4b09-8b41-fb2dc803b344.png','lifecycle':'exec-8686ce2e-427f-48bc-8df0-7120af1c7b1c.png'}
for n,f in sources.items():shutil.copy2(gen/f,out/(n+'-source.png'))
shutil.copy2(root/'work/pikeman-state-prompts.json',out/'generation-prompts.json')
shutil.copytree(base,out/'accepted-idle-original',dirs_exist_ok=True)
def extract(name,box,seed,point,scale,index):
 im=Image.open(out/(name+'-source.png')).convert('RGBA');tile=im.crop(box);a=np.asarray(tile.getchannel('A'));h,w=a.shape
 seen=np.zeros((h,w),np.uint8);q=deque([(seed[0]-box[0],seed[1]-box[1])])
 while q:
  x,y=q.popleft()
  if x<0 or y<0 or x>=w or y>=h or seen[y,x] or a[y,x]<48:continue
  seen[y,x]=255;q.extend(((x-1,y),(x+1,y),(x,y-1),(x,y+1)))
 mask=Image.fromarray(seen).filter(ImageFilter.MaxFilter(7));tile.putalpha(ImageChops.multiply(tile.getchannel('A'),mask))
 tile=tile.resize((round(w*scale),round(h*scale)),Image.Resampling.LANCZOS)
 layer=Image.new('RGBA',canvas);pos=(round(anchor[0]-(point[0]-box[0])*scale),round(anchor[1]-(point[1]-box[1])*scale));layer.alpha_composite(tile,pos)
 layer.save(out/f'{name}-pose-{index}.png');return layer
# Uniform scale within each authored sheet. Anchor points are ground projections, not content bounds.
combat=[]
for i,(box,seed,pt) in enumerate([
 ((0,0,540,792),(237,371),(275,772)),
 ((535,0,1024,792),(725,375),(750,784)),
 ((0,752,530,1536),(260,1100),(273,1524)),
 ((535,746,1024,1536),(750,1150),(790,1515))]):
 combat.append(extract('combat',box,seed,pt,1.25,i))
life=[]
for i,(box,seed,pt) in enumerate([
 ((0,0,494,882),(260,400),(260,863)),
 ((423,112,1024,890),(743,466),(737,867)),
 ((0,947,601,1500),(294,1240),(265,1458)),
 ((442,1120,1024,1490),(800,1280),(735,1448))]):
 life.append(extract('lifecycle',box,seed,pt,1.18,i))
idle=[]
for i in range(8):
 f=Image.open(base/'frames'/f'frame-{i:02d}.png').convert('RGBA');l=Image.new('RGBA',canvas);l.paste(f,offset);assert np.array_equal(np.asarray(l.crop((340,120,1060,1144))),np.asarray(f));idle.append(l)
def breath(f,i):
 mesh=[];dy=1.6*math.sin(i*math.pi/4)
 for top in range(0,1200,16):
  bottom=min(1200,top+16)
  def lift(y):return dy*max(0,min(1,(1040-y)/500))
  mesh.append(((0,top,1400,bottom),(0,top-lift(top),0,bottom-lift(bottom),1400,bottom-lift(bottom),1400,top-lift(top))))
 return f.transform(canvas,Image.Transform.MESH,mesh,Image.Resampling.BICUBIC)
def opacity(f,k):
 r=f.copy();r.putalpha(r.getchannel('A').point(lambda a:round(a*k)));return r
states={
'idle':(idle,[160]*8,True,None),
'attack':([idle[0],combat[0],combat[1],combat[1],combat[2],idle[0]],[100,170,90,90,170,140],False,270),
'hit':([idle[0],combat[3],combat[3],combat[2],idle[0]],[70,90,140,150,160],False,None),
'wounded_idle':([breath(life[0],i) for i in range(8)],[170]*8,True,None),
'spawn':([opacity(life[1],.25),opacity(life[1],.65),life[1],combat[2],idle[0]],[130,130,170,150,180],False,None),
'die':([combat[3],life[0],life[2],life[3]],[140,170,240,850],False,None)}
manifest={'schema':1,'canvas':list(canvas),'anchor':list(anchor),'layout_bounds_px':[260,50,1150,1135],'approved_idle':'ash-pikeman-idle-r1','idle_padding_offset':list(offset),'method':'Authored whole-character combat and lifecycle poses. Uniform registration scale per source sheet; no per-frame fit scaling. Accepted idle retained byte-for-byte in accepted-idle-original and pixel-for-pixel with fixed padding in state frames. Wounded breathing is restrained deformation of authored wounded pose.','states':{},'sources':{},'qa':{'status':'pending-independent-review','idle_pixels_preserved':True,'source_sheet_scale':{'combat':1.25,'lifecycle':1.18}}}
review=[];rd=[]
def dark(f):
 b=Image.new('RGB',canvas,(27,29,36));b.paste(f,mask=f.getchannel('A'));b.thumbnail((560,480),Image.Resampling.LANCZOS);return b
for name,(frames,times,loop,impact) in states.items():
 d=out/name;d.mkdir(exist_ok=True);entries=[];time=0;pre=[]
 for i,(f,dt) in enumerate(zip(frames,times)):
  f.save(d/f'frame-{i:02d}.png');bb=f.getchannel('A').point(lambda a:255 if a>16 else 0).getbbox()
  assert bb and bb[0]>3 and bb[1]>3 and bb[2]<1397 and bb[3]<1197,(name,i,bb)
  entries.append({'time':time,'src':f'{name}/frame-{i:02d}.png','duration_ms':dt});time+=dt;pre.append(dark(f))
  b=Image.new('RGB',(560,510),(27,29,36));b.paste(pre[-1],(0,30));ImageDraw.Draw(b).text((15,8),name.upper(),fill='white');review.append(b);rd.append(dt)
 review.append(review[-1].copy());rd.append(550)
 contact=Image.new('RGB',(2240,480*math.ceil(len(pre)/4)),(27,29,36))
 for i,f in enumerate(pre):contact.paste(f,((i%4)*560,(i//4)*480))
 contact.save(d/'contact-sheet.png');pal=contact.quantize(colors=255);seq=[f.quantize(palette=pal,dither=Image.Dither.NONE) for f in pre]
 seq[0].save(d/'preview.gif',save_all=True,append_images=seq[1:],duration=times,loop=0,disposal=2,optimize=False)
 frames[0].save(d/'animation.webp',save_all=True,append_images=frames[1:],duration=times,loop=0 if loop else 1,lossless=True)
 manifest['states'][name]={'frames':entries,'duration':time,'loop':loop,'impact':impact,'events':([{'name':'impact','time_ms':impact}] if impact else [{'name':'terminal','time_ms':sum(times[:-1])}] if name=='die' else [])}
manifest['states']['act']={**manifest['states']['attack'],'sourceState':'attack'};manifest['states']['cast']={**manifest['states']['attack'],'sourceState':'attack'}
for n in sources:
 p=out/(n+'-source.png');manifest['sources'][n]={'path':p.name,'sha256':hashlib.sha256(p.read_bytes()).hexdigest()}
(out/'animation.json').write_text(json.dumps(manifest,indent=2))
pal=Image.new('RGB',(560*len(review),510))
for i,f in enumerate(review):pal.paste(f,(i*560,0))
palette=pal.quantize(colors=255);seq=[f.quantize(palette=palette,dither=Image.Dither.NONE) for f in review]
seq[0].save(out/'all-states.gif',save_all=True,append_images=seq[1:],duration=rd,loop=0,disposal=2,optimize=False)
print('PASS: state export, margin checks, idle exact pixels; canvas1400x1200 anchor700,1093')

