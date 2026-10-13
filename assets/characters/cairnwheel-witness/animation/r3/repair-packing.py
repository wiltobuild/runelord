import pathlib,shutil,json,hashlib
from PIL import Image,ImageDraw,ImageFont,ImageFilter
import numpy as np
from collections import deque
parent=pathlib.Path('C:/Users/wilsh/Projects/runelord/assets/characters/cairnwheel-witness/animation');d=parent/'r2';shutil.copytree(parent/'r1',d,dirs_exist_ok=True)
p=d/'frames/19.png';im=Image.open(p).convert('RGBA');a=np.array(im.getchannel('A'));on=a>32;seen=np.zeros_like(on);h,w=on.shape;groups=[]
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
mask=mask.filter(ImageFilter.MaxFilter(5));keep=np.array(mask)>0;out=np.array(im);out[~keep,3]=0;Image.fromarray(out).save(p)
m=json.loads((d/'manifest.json').read_text(encoding='utf-8-sig'));W,H=m['frame_canvas'];frames=[Image.open(d/f['file']).convert('RGBA') for f in m['frames']];atlas=Image.open(d/'atlas.png').convert('RGBA');idx=19;x=(idx%4)*W;y=(idx//4)*H;atlas.paste((0,0,0,0),(x,y,x+W,y+H));atlas.alpha_composite(frames[idx],(x,y));atlas.save(d/'atlas.png')
font=ImageFont.truetype('C:/Windows/Fonts/segoeui.ttf',18);allseq=[];alldur=[]
for name,s in m['states'].items():
 display=[];dur=s['durations_ms']
 for i,ms in zip(s['frames'],dur):
  bg=Image.new('RGBA',(W,H+34),'#23382f');bg.alpha_composite(frames[i],(0,34));ImageDraw.Draw(bg).text((10,6),name,font=font,fill='#e8dbc1');display.append(bg.convert('RGB'));allseq.append(bg.convert('RGB'));alldur.append(ms)
 kw={'save_all':True,'append_images':display[1:],'duration':dur,'disposal':2,'optimize':False}
 if s['loop']:kw['loop']=0
 display[0].save(d/(name+'.gif'),**kw);allseq.append(display[-1]);alldur.append(900 if name=='die' else 350)
allseq[0].save(d/'review.gif',save_all=True,append_images=allseq[1:],duration=alldur,loop=0,disposal=2,optimize=False)
m['limitations']=[x for x in m['limitations'] if 'tiny adjacent-source fragment' not in x];m['revision']='r2';m['packing_repair']={'frame':19,'method':'isolate largest connected sprite component; preserve source pixels and 2px antialias fringe; remove disconnected neighboring-frame fragment','component_sizes':list(map(len,groups))};(d/'manifest.json').write_text(json.dumps(m,indent=2))
qa=json.loads((d/'qa.json').read_text(encoding='utf-8-sig'));qa['limitations']=m['limitations'];qa['packing_repair']=m['packing_repair'];(d/'qa.json').write_text(json.dumps(qa,indent=2));shutil.copy2(__file__,d/'repair-packing.py')
print(json.dumps({'folder':str(d),'sha256':hashlib.sha256((d/'review.gif').read_bytes()).hexdigest(),'components':list(map(len,groups))}))
