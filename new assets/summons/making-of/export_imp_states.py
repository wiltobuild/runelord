from PIL import Image,ImageDraw,ImageFilter,ImageChops
from pathlib import Path
from collections import deque
import json,math,shutil,zipfile,hashlib
root=Path(r'C:/Users/Wil/Documents/Codex/2026-10-09/sp-2');out=root/'outputs/imp-states-r1';out.mkdir(exist_ok=True)
base=root/'outputs/imp-idle-8-r5';gen=Path(r'C:/Users/Wil/.codex/generated_images/01a11ef8-d768-7f21-86bf-77a410275895')
sources={'attack':'exec-fc4bf964-ac90-42fc-93cc-f72ec698eebe.png','reactions':'exec-8b969d42-829f-4993-a481-1be96d151d7a.png','death':'exec-b542bbbc-2f88-4107-8c86-abc0ceaaaeb3.png','spawn':'exec-82b22e33-d692-46bf-b878-9c06d10574b6.png'}
for name,file in sources.items():shutil.copy2(gen/file,out/(name+'-source.png'))
fixed=Image.open(base/'body-pose-00.png').convert('RGBA')
wings=Image.open(base/'wings-source.png').convert('RGBA');roots=[(292,282),(725,282),(1148,282),(1580,280),(243,696),(700,704),(1150,704),(1595,704)]
winglayers=[]
for i,(rx,ry) in enumerate(roots):
 c,r=i%4,i//4;w,h=wings.size
 box=(max(0,round(c*w/4)-18),max(0,round(r*h/2)-18),min(w,round((c+1)*w/4)+18),min(h,round((r+1)*h/2)+18))
 if i==2:box=(910,box[1],box[2],box[3])
 tile=wings.crop(box);a=tile.getchannel('A');px=a.load();tw,th=tile.size;seen=set()
 q=deque((x,y) for x in range(max(0,rx-box[0]-45),min(tw,rx-box[0]+46),3) for y in range(max(0,ry-box[1]-60),min(th,ry-box[1]+6),3) if px[x,y]>32)
 while q:
  x,y=q.popleft()
  if (x,y) in seen or x<0 or y<0 or x>=tw or y>=th or px[x,y]<16:continue
  seen.add((x,y));q.extend(((x-1,y),(x+1,y),(x,y-1),(x,y+1),(x-1,y-1),(x+1,y-1),(x-1,y+1),(x+1,y+1)))
 mask=Image.new('L',tile.size);mp=mask.load()
 for x,y in seen:mp[x,y]=255
 tile.putalpha(ImageChops.multiply(a,mask.filter(ImageFilter.MaxFilter(3))))
 layer=Image.new('RGBA',(560,520));layer.alpha_composite(tile,(302-(rx-box[0]),267-(ry-box[1])));winglayers.append(layer)
lower=Image.new('L',(560,520));ImageDraw.Draw(lower).polygon([(248,325),(329,325),(348,350),(365,520),(160,520),(160,375),(245,375)],fill=255)
def register(name,boxes,anchors,scale,dests=None,legs=False):
 im=Image.open(out/(name+'-source.png')).convert('RGBA');layers=[]
 for i,(box,(ax,ay)) in enumerate(zip(boxes,anchors)):
  tile=im.crop(box);tile=tile.resize((round(tile.width*scale),round(tile.height*scale)),Image.Resampling.LANCZOS)
  dx,dy=(dests[i] if dests else (300,332));layer=Image.new('RGBA',(560,520));layer.alpha_composite(tile,(round(dx-(ax-box[0])*scale),round(dy-(ay-box[1])*scale)))
  if legs:layer=Image.composite(fixed,layer,lower)
  layer.save(out/f'{name}-pose-{i}.png');layers.append(layer)
 return layers
attack=register('attack',[(0,0,650,604),(650,0,1302,604),(0,604,727,1208),(730,604,1302,1208)],[(310,368),(954,374),(315,944),(963,941)],.58,legs=True)
reaction=register('reactions',[(0,0,651,635),(651,0,1302,635),(0,635,651,1208),(651,635,1302,1208)],[(435,396),(959,398),(394,938),(973,942)],.58)
death=register('death',[(0,0,680,747),(680,0,1302,747),(0,748,631,1208),(635,748,1302,1208)],[(370,405),(929,473),(311,976),(912,1050)],.56,[(300,332),(300,368),(300,394),(300,447)])
spawn=register('spawn',[(0,0,580,600),(585,0,1230,600),(0,602,613,1278),(615,602,1230,1278)],[(359,387),(917,416),(334,1037),(965,1057)],.72)
idle=[Image.open(base/'frames'/f'frame-{i:02d}.png').convert('RGBA') for i in range(8)]
def comp(body,wing,dy=0):
 f=winglayers[wing].copy();f.alpha_composite(body)
 if dy:f=f.transform(f.size,Image.Transform.AFFINE,(1,0,0,0,1,-dy),Image.Resampling.BICUBIC)
 return f
states={
 'idle':(idle,[120]*8,True,None),
 'attack':([idle[0],comp(attack[1],1),comp(attack[2],3),comp(attack[2],4),comp(attack[3],5),idle[6],idle[7]],[90,120,90,90,110,90,90],False,210),
 'hit':([comp(reaction[0],3),comp(reaction[0],4),comp(reaction[1],5),idle[6],idle[7]],[80,100,100,100,100],False,None),
 'wounded_idle':([comp(reaction[2 if i<4 else 3],i,2*math.cos(i*math.pi/4)) for i in range(8)],[150]*8,True,None),
 'spawn':(spawn+[idle[6],idle[7]],[130,130,130,130,120,120],False,None),
 'die':([idle[3]]+death,[90,150,170,210,700],False,None)
}
def dark(f,color=(27,29,36)):
 bg=Image.new('RGB',f.size,color);bg.paste(f,mask=f.getchannel('A'));return bg
manifest={'schema':1,'canvas':[560,520],'anchor':[300,475],'approved_idle':'imp-idle-8-r5','method':'Drawn body action poses with existing wing phases; authored full-character arrival/death; constant scale within each source sheet. Fixed neutral legs during attack.','states':{},'sources':{},'qa':{'status':'pending-independent-review'}}
for name,(frames,times,loop,impact) in states.items():
 d=out/name;d.mkdir(exist_ok=True);entries=[];time=0
 for i,(f,duration) in enumerate(zip(frames,times)):
  p=d/f'frame-{i:02d}.png';f.save(p);bb=f.getchannel('A').point(lambda a: 255 if a>16 else 0).getbbox();assert bb and bb[0]>0 and bb[1]>0 and bb[2]<560 and bb[3]<520,(name,i,bb)
  entries.append({'time':time,'src':f'{name}/frame-{i:02d}.png','duration_ms':duration});time+=duration
 contact=Image.new('RGB',(560*4,520*math.ceil(len(frames)/4)),(27,29,36))
 for i,f in enumerate(frames):contact.paste(dark(f),((i%4)*560,(i//4)*520))
 contact.save(d/'contact-sheet.png');palette=contact.quantize(colors=255)
 seq=[dark(f).quantize(palette=palette,dither=Image.Dither.NONE) for f in frames]
 # GIF previews repeat for review; manifest defines actual one-shot behavior.
 seq[0].save(d/'preview.gif',save_all=True,append_images=seq[1:],duration=times,loop=0,disposal=2,optimize=False)
 frames[0].save(d/'animation.webp',save_all=True,append_images=frames[1:],duration=times,loop=0 if loop else 1,lossless=True)
 manifest['states'][name]={'frames':entries,'duration':time,'loop':loop,'impact':impact,'events':([{'name':'release','time_ms':impact}] if impact else ([{'name':'terminal','time_ms':sum(times[:-1])}] if name=='die' else []))}
manifest['states']['act']={**manifest['states']['attack'],'sourceState':'attack'}
manifest['states']['cast']={**manifest['states']['attack'],'sourceState':'attack'}
for name in sources:
 p=out/(name+'-source.png');manifest['sources'][name]={'path':p.name,'sha256':hashlib.sha256(p.read_bytes()).hexdigest()}
(out/'animation.json').write_text(json.dumps(manifest,indent=2))
# All-state labeled preview (one-shot states shown with terminal hold before reset).
review=[];durations=[]
for name,(frames,times,loop,impact) in states.items():
 for f,dt in zip(frames,times):
  bg=Image.new('RGB',(560,550),(27,29,36));bg.paste(dark(f),(0,30));ImageDraw.Draw(bg).text((18,10),name.replace('_',' ').upper(),fill='white');review.append(bg);durations.append(dt)
 review.append(review[-1].copy());durations.append(600)
pal=Image.new('RGB',(560*len(review),550))
for i,f in enumerate(review):pal.paste(f,(i*560,0))
palette=pal.quantize(colors=255);seq=[f.quantize(palette=palette,dither=Image.Dither.NONE) for f in review]
seq[0].save(out/'all-states.gif',save_all=True,append_images=seq[1:],duration=durations,loop=0,disposal=2,optimize=False)
with zipfile.ZipFile(out.parent/'imp-states-r1.zip','w',zipfile.ZIP_DEFLATED) as z:
 for p in out.rglob('*'):
  if p.is_file():z.write(p,p.relative_to(out))
print('PASS: all frames exported; alpha retained; no clipping;',sum(len(s[0]) for s in states.values()),'state frame slots')


