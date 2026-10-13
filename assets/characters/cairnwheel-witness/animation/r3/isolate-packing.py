import pathlib,shutil,json,hashlib
from PIL import Image,ImageDraw,ImageFont,ImageFilter
import numpy as np
from collections import deque
parent=pathlib.Path('C:/Users/wilsh/Projects/runelord/assets/characters/cairnwheel-witness/animation');d=parent/'r3';shutil.copytree(parent/'r2',d,dirs_exist_ok=True);counts={}
for p in sorted((d/'frames').glob('*.png')):
 im=Image.open(p).convert('RGBA');a=np.array(im.getchannel('A'));on=a>32;seen=np.zeros_like(on);h,w=on.shape;groups=[]
 for y in range(h):
  for x in range(w):
   if not on[y,x] or seen[y,x]:continue
   q=deque([(x,y)]);seen[y,x]=True;pts=[]
   while q:
    xx,yy=q.popleft();pts.append((xx,yy))
    for nx,ny in ((xx-1,yy),(xx+1,yy),(xx,yy-1),(xx,yy+1)):
     if 0<=nx<w and 0<=ny<h and on[ny,nx] and not seen[ny,nx]:seen[ny,nx]=True;q.append((nx,ny))
   groups.append(pts)
 groups.sort(key=len,reverse=True);mask=Image.new('L',im.size);pix=mask.load()
 for x,y in groups[0]:pix[x,y]=255
 mask=mask.filter(ImageFilter.MaxFilter(5));keep=np.array(mask)>0;out=np.array(im);out[~keep,3]=0;Image.fromarray(out).save(p);counts[p.stem]=list(map(len,groups))
m=json.loads((d/'manifest.json').read_text());W,H=m['frame_canvas'];frames=[Image.open(d/f['file']).convert('RGBA') for f in m['frames']];atlas=Image.new('RGBA',(W*4,H*6))
for i,f in enumerate(frames):atlas.alpha_composite(f,((i%4)*W,(i//4)*H))
atlas.save(d/'atlas.png');font=ImageFont.truetype('C:/Windows/Fonts/segoeui.ttf',18);allseq=[];alldur=[]
for name,s in m['states'].items():
 display=[];dur=s['durations_ms']
 for i,ms in zip(s['frames'],dur):
  bg=Image.new('RGBA',(W,H+34),'#23382f');bg.alpha_composite(frames[i],(0,34));ImageDraw.Draw(bg).text((10,6),name,font=font,fill='#e8dbc1');display.append(bg.convert('RGB'));allseq.append(bg.convert('RGB'));alldur.append(ms)
 kw={'save_all':True,'append_images':display[1:],'duration':dur,'disposal':2,'optimize':False}
 if s['loop']:kw['loop']=0
 display[0].save(d/(name+'.gif'),**kw);allseq.append(display[-1]);alldur.append(900 if name=='die' else 350)
allseq[0].save(d/'review.gif',save_all=True,append_images=allseq[1:],duration=alldur,loop=0,disposal=2,optimize=False)
m['revision']='r3';m['packing_repair']={'frames':'all24','method':'isolate largest connected sprite component plus2px original antialias fringe; source analysis proves each intended pose is one major connected component','component_sizes':counts};(d/'manifest.json').write_text(json.dumps(m,indent=2));q=json.loads((d/'qa.json').read_text());q['packing_repair']=m['packing_repair'];(d/'qa.json').write_text(json.dumps(q,indent=2));shutil.copy2(__file__,d/'isolate-packing.py')
contact=Image.new('RGB',(1040,1680),'#e9e6da');dr=ImageDraw.Draw(contact)
for i,f in enumerate(frames):
 f.thumbnail((245,245));contact.paste(f,((i%4)*260+(260-f.width)//2,(i//4)*280),f);dr.text(((i%4)*260+10,(i//4)*280+251),str(i),font=font,fill='black')
contact.save(d/'contact.png');print(json.dumps({'sha256':hashlib.sha256((d/'review.gif').read_bytes()).hexdigest(),'components':counts}))
