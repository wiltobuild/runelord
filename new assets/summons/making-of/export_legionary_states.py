from pathlib import Path
from PIL import Image,ImageDraw
import json,hashlib,shutil,math
r=Path(__file__).resolve().parents[1];o=r/'outputs/iron-legionary-states-r1';o.mkdir(exist_ok=True);g=Path('C:/Users/Wil/.codex/generated_images/01a120ad-47e8-7212-bcd1-774451b556ed')
files={'attack':'exec-1a4196d2-f4e0-4c7d-9487-ec6679900738.png','reaction':'exec-e7fdf91f-6631-412f-b94e-5e53478fb21c.png','death':'exec-d3ab34ce-87a1-4990-b0dd-681636a1c7ed.png'}
for k,v in files.items():shutil.copy2(g/v,o/f'{k}-source.png')
W,H=1280,1100;offset=(280,36);ground=1030
def pose(kind,box,scale,center,baseline,poly=None):
 im=Image.open(o/f'{kind}-source.png').convert('RGBA')
 if poly:
  mask=Image.new('L',im.size);ImageDraw.Draw(mask).polygon(poly,fill=255);from PIL import ImageChops;im.putalpha(ImageChops.multiply(im.getchannel('A'),mask))
 tile=im.crop(box);tile=tile.resize((round(tile.width*scale),round(tile.height*scale)),Image.Resampling.LANCZOS);f=Image.new('RGBA',(W,H));f.alpha_composite(tile,(round(640-(center-box[0])*scale),round(ground-(baseline-box[1])*scale)));return f
# One constant scale per sheet, anatomical baselines rather than fit-to-box scaling.
A=[pose('attack',(0,0,512,768),1.34,258,740),pose('attack',(512,0,1024,768),1.34,777,740),pose('attack',(0,768,645,1536),1.34,295,1485,[(0,768),(580,768),(580,1160),(645,1375),(585,1536),(0,1536)]),pose('attack',(600,768,1024,1536),1.34,800,1485,[(610,768),(1024,768),(1024,1536),(600,1536),(650,1360),(620,1160)])]
R=[pose('reaction',(0,0,768,520),1.55,470,510),pose('reaction',(768,0,1536,520),1.55,1160,510),pose('reaction',(0,520,800,1024),1.55,470,990),pose('reaction',(800,520,1536,1024),1.55,1170,995)]
D=[pose('death',(0,0,768,610),1.65,400,553),pose('death',(768,0,1536,610),1.65,1160,575),pose('death',(0,610,768,1024),1.65,385,975),pose('death',(768,610,1536,1024),1.65,1150,990)]
for k,arr in [('attack',A),('reaction',R),('death',D)]:
 for i,f in enumerate(arr):f.save(o/f'{k}-pose-{i}.png')
idle=[];idir=r/'outputs/iron-legionary-idle-r3'
for i in range(8):
 f=Image.new('RGBA',(W,H));im=Image.open(idir/'frames'/f'frame-{i:02d}.png').convert('RGBA');f.paste(im,offset);idle.append(f)
states={'idle':(idle,[180]*8,True,None),'attack':([idle[0],A[0],A[1],A[2],idle[0]],[100,180,100,170,180],False,280),'hit':([idle[0],A[3],A[3],idle[0]],[70,110,140,180],False,None),'wounded_idle':([R[0],R[1],R[0],R[1]],[350]*4,True,None),'spawn':([R[2],R[3],idle[0]],[220,220,220],False,None),'die':([idle[0]]+D,[100,170,190,230,900],False,None)}
manifest={'schema':1,'canvas':[W,H],'anchor':[640,1030],'idle_offset':list(offset),'idle_layout_bounds_px':[280,36,1000,1060],'reference_visible_height_px':960,'approved_idle':'iron-legionary-idle-r3','method':'Authored whole-character action poses, constant per-sheet registration. Accepted idle copied pixel-exact at fixed padding offset. Sparse keyframe animation; cast and act alias melee attack.','states':{},'sources':{},'qa':{'status':'pending-independent-review'}};review=[];rtime=[]
def dark(f):
 b=Image.new('RGB',f.size,(27,29,36));b.paste(f,mask=f.getchannel('A'));return b
for name,(fs,times,loop,impact) in states.items():
 d=o/name;d.mkdir(exist_ok=True);entries=[];tm=0;thumbs=[]
 for i,(f,dt) in enumerate(zip(fs,times)):
  f.save(d/f'frame-{i:02d}.png');bb=f.getchannel('A').point(lambda a:255 if a>16 else 0).getbbox();assert bb and bb[0]>0 and bb[1]>0 and bb[2]<W and bb[3]<H,(name,i,bb)
  entries.append({'time':tm,'src':f'{name}/frame-{i:02d}.png','duration_ms':dt});tm+=dt;b=dark(f);b.thumbnail((512,440));thumbs.append(b);rv=Image.new('RGB',(512,470),(27,29,36));rv.paste(b,(0,30));ImageDraw.Draw(rv).text((15,10),name.upper(),fill='white');review.append(rv);rtime.append(dt)
 atlas=Image.new('RGB',(512*min(4,len(fs)),440*math.ceil(len(fs)/4)),(27,29,36))
 for i,b in enumerate(thumbs):atlas.paste(b,((i%4)*512,(i//4)*440))
 atlas.save(d/'contact-sheet.png');pal=atlas.quantize(colors=255);seq=[b.quantize(palette=pal,dither=Image.Dither.NONE) for b in thumbs];seq[0].save(d/'preview.gif',save_all=True,append_images=seq[1:],duration=times,loop=0,disposal=2,optimize=False);fs[0].save(d/'animation.webp',save_all=True,append_images=fs[1:],duration=times,loop=0 if loop else 1,lossless=True)
 manifest['states'][name]={'frames':entries,'duration':tm,'loop':loop,'impact':impact,'events':[{'name':'impact','time_ms':impact}] if impact else ([{'name':'terminal','time_ms':sum(times[:-1])}] if name=='die' else [])}
 review.append(review[-1]);rtime.append(600)
for alias in ['act','cast']:manifest['states'][alias]={**manifest['states']['attack'],'sourceState':'attack'}
for k in files:manifest['sources'][k]={'path':f'{k}-source.png','sha256':hashlib.sha256((o/f'{k}-source.png').read_bytes()).hexdigest()}
for i,f in enumerate(idle):assert f.crop((280,36,1000,1060)).tobytes()==Image.open(idir/'frames'/f'frame-{i:02d}.png').convert('RGBA').tobytes()
(o/'animation.json').write_text(json.dumps(manifest,indent=2));pal=Image.new('RGB',(512*len(review),470))
for i,b in enumerate(review):pal.paste(b,(i*512,0))
palette=pal.quantize(colors=255);seq=[b.quantize(palette=palette,dither=Image.Dither.NONE) for b in review];seq[0].save(o/'all-states.gif',save_all=True,append_images=seq[1:],duration=rtime,loop=0,disposal=2,optimize=False)
print('PASS: padded accepted idle pixels exact, no clipping; all states exported')

