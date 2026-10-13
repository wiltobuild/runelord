from PIL import Image,ImageDraw,ImageFilter,ImageChops
from pathlib import Path
from collections import deque
import numpy as np,json,shutil,hashlib,math
root=Path(r'C:/Users/Wil/Documents/Codex/2026-10-09/sp-2');out=root/'outputs/ironhorn-bulwark-states-r1';out.mkdir(exist_ok=True)
gen=Path(r'C:/Users/Wil/.codex/generated_images/01a11efa-7397-7560-9504-70188201352c')
files={'attack':'48669415-5423-4c7c-b905-d4dd441c0679','reaction':'92716dd0-9892-43de-bc0f-404cc8cb768d','spawn':'23c7e5fa-70b1-40dd-b528-85edb210e6c1','death':'54808f43-3aee-40e1-b962-d40561a4c451'}
W,H=1400,1200;offset=(300,100);ground=1104;anchor=(700,ground)
def component(im,seed):
 a=np.array(im.getchannel('A'));h,w=a.shape;seen=np.zeros((h,w),dtype=np.uint8);q=deque([seed]);seen[seed[1],seed[0]]=255
 while q:
  x,y=q.popleft()
  for nx,ny in ((x-1,y),(x+1,y),(x,y-1),(x,y+1)):
   if 0<=nx<w and 0<=ny<h and not seen[ny,nx] and a[ny,nx]>16:seen[ny,nx]=255;q.append((nx,ny))
 mask=Image.fromarray(seen).filter(ImageFilter.MaxFilter(3));copy=im.copy();copy.putalpha(ImageChops.multiply(im.getchannel('A'),mask));bb=copy.getbbox();return copy.crop(bb),bb
# Coordinates register stance centers and ground; one constant scale per authored sheet.
settings={'attack':(1.57,[(320,250),(920,250),(340,850),(940,850)],[(330,617),(937,617),(337,1217),(967,1217)]),'reaction':(1.77,[(320,260),(940,260),(330,850),(940,850)],[(365,600),(952,603),(363,1186),(976,1186)]),'spawn':(1.61,[(310,290),(925,280),(330,850),(960,850)],[(327,575),(929,566),(346,1210),(970,1215)]),'death':(1.52,[(300,280),(920,410),(320,950),(960,1050)],[(293,652),(931,660),(322,1177),(950,1190)])}
poses={};reg={}
for name,key in files.items():
 p=out/(name+'-source.png');shutil.copy2(gen/('exec-'+key+'.png'),p);im=Image.open(p).convert('RGBA');scale,seeds,anchors=settings[name];poses[name]=[];reg[name]=[]
 for i,(seed,(ax,ay)) in enumerate(zip(seeds,anchors)):
  tile,bb=component(im,seed);tile=tile.resize((round(tile.width*scale),round(tile.height*scale)),Image.Resampling.LANCZOS);x=round(anchor[0]-(ax-bb[0])*scale);y=round(ground-(ay-bb[1])*scale);f=Image.new('RGBA',(W,H));f.alpha_composite(tile,(x,y));f.save(out/f'{name}-pose-{i}.png');poses[name].append(f);reg[name].append({'source_bounds':bb,'scale':scale,'source_anchor':[ax,ay],'destination_offset':[x,y]})
idle=[]
for i in range(8):
 original=Image.open(root/'outputs/ironhorn-bulwark-idle-r3/frames'/f'frame-{i:02d}.png').convert('RGBA');f=Image.new('RGBA',(W,H));f.paste(original,offset);assert f.crop((300,100,1100,1156)).tobytes()==original.tobytes();idle.append(f)
states={'idle':(idle,[160]*8,True,None),'attack':([idle[0],poses['attack'][1],poses['attack'][2],poses['attack'][3],idle[7]],[120,180,140,150,160],False,300),'hit':([poses['reaction'][0],poses['reaction'][1],idle[7]],[130,170,160],False,None),'wounded_idle':(poses['reaction'][2:],[600,600],True,None),'spawn':(poses['spawn']+[idle[7]],[170,150,150,150,160],False,None),'die':([idle[0]]+poses['death'],[100,180,200,220,1000],False,None)}
def dark(f):
 b=Image.new('RGB',f.size,(27,29,36));b.paste(f,mask=f.getchannel('A'));return b
manifest={'schema':1,'canvas':[W,H],'anchor':list(anchor),'layout_bounds':{'x':300,'y':100,'width':800,'height':1056},'approved_idle':'ironhorn-bulwark-idle-r3','idle_pixel_preservation':{'offset':list(offset),'exact_rgba':True},'method':'Authored whole-character action poses; constant scale within each source sheet. Exact accepted idle pixels padded at constant offset. No per-pose fit-to-box scaling.','states':{},'registration':reg,'sources':{},'qa':{'status':'pending-independent-review','canvas_edges':'pass','idle_exact_pixels':'pass'}}
review=[];reviewtime=[];bounds={}
for name,(frames,times,loop,impact) in states.items():
 d=out/name;d.mkdir(exist_ok=True);entries=[];elapsed=0;bounds[name]=[];thumbs=[]
 for i,(f,dt) in enumerate(zip(frames,times)):
  bb=f.getchannel('A').point(lambda a:255 if a>16 else 0).getbbox();assert bb and bb[0]>0 and bb[1]>0 and bb[2]<W and bb[3]<H,(name,i,bb);bounds[name].append(bb);f.save(d/f'frame-{i:02d}.png');entries.append({'time':elapsed,'src':f'{name}/frame-{i:02d}.png','duration_ms':dt});elapsed+=dt
  thumb=dark(f).resize((466,400));ImageDraw.Draw(thumb).text((12,10),f'{name} {i:02d}',fill='white');thumbs.append(thumb);review.append(thumb);reviewtime.append(dt)
 contact=Image.new('RGB',(466*4,400*math.ceil(len(frames)/4)),(27,29,36))
 for i,f in enumerate(thumbs):contact.paste(f,((i%4)*466,(i//4)*400))
 contact.save(d/'contact-sheet.png');pal=contact.quantize(colors=255);seq=[dark(f).resize((700,600)).quantize(palette=pal,dither=Image.Dither.NONE) for f in frames];seq[0].save(d/'preview.gif',save_all=True,append_images=seq[1:],duration=times,loop=0,disposal=2,optimize=False)
 frames[0].save(d/'animation.webp',save_all=True,append_images=frames[1:],duration=times,loop=0 if loop else 1,lossless=True)
 manifest['states'][name]={'frames':entries,'duration':elapsed,'loop':loop,'impact':impact,'events':[{'name':'release','time_ms':impact}] if impact else ([{'name':'terminal','time_ms':sum(times[:-1])}] if name=='die' else [])};review.append(review[-1].copy());reviewtime.append(650)
for alias in ['act','cast']:manifest['states'][alias]={**manifest['states']['attack'],'sourceState':'attack'}
for name in files:
 p=out/(name+'-source.png');manifest['sources'][name]={'path':p.name,'sha256':hashlib.sha256(p.read_bytes()).hexdigest()}
manifest['qa']['frame_bounds']=bounds;(out/'animation.json').write_text(json.dumps(manifest,indent=2));palboard=Image.new('RGB',(466*len(review),400))
for i,f in enumerate(review):palboard.paste(f,(i*466,0))
pal=palboard.quantize(colors=255);seq=[f.quantize(palette=pal,dither=Image.Dither.NONE) for f in review];seq[0].save(out/'all-states.gif',save_all=True,append_images=seq[1:],duration=reviewtime,loop=0,disposal=2,optimize=False)
print('PASS',sum(len(v[0]) for v in states.values()),'frame slots, exact padded idle, no frame clipping');print(json.dumps(reg,indent=2))
