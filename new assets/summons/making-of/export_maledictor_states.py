from pathlib import Path
from PIL import Image,ImageDraw,ImageFilter
import numpy as np,json,hashlib,shutil
root=Path.cwd();out=root/'outputs/maledictor-states-r1';idlepath=root/'outputs/maledictor-idle-r1';W,H=1280,1100;offset=(280,48);anchor=[640,1038]
source=Image.open(out/'action-source.png').convert('RGBA');scale=1.78
boxes=[(0,0,360,538),(325,0,744,538),(740,0,1024,538),(0,538,385,1015),(380,538,717,1013),(731,538,1024,1013),(0,985,342,1536),(366,1014,628,1536),(620,1190,1024,1536)]
feet=[(198,526),(516,524),(877,521),(241,1007),(552,1005),(860,1009),(184,1489),(495,1476),(827,1480)]
def clean_component(tile):
 a=np.array(tile.getchannel('A'));h,w=a.shape;seen=np.zeros_like(a,dtype=bool);best=[]
 for yy,xx in zip(*np.where(a>16)):
  if seen[yy,xx]:continue
  q=[(int(xx),int(yy))];seen[yy,xx]=True;pts=[]
  while q:
   x,y=q.pop();pts.append((x,y))
   for nx,ny in [(x-1,y),(x+1,y),(x,y-1),(x,y+1)]:
    if 0<=nx<w and 0<=ny<h and not seen[ny,nx] and a[ny,nx]>16:seen[ny,nx]=True;q.append((nx,ny))
  if len(pts)>len(best):best=pts
 mask=Image.new('L',tile.size);pix=mask.load()
 for x,y in best:pix[x,y]=255
 mask=mask.filter(ImageFilter.MaxFilter(9));tile.putalpha(Image.fromarray(np.minimum(a,np.array(mask))));return tile
poses=[]
for i,(box,(ax,ay)) in enumerate(zip(boxes,feet)):
 tile=clean_component(source.crop(box));tile=tile.resize((round(tile.width*scale),round(tile.height*scale)),Image.Resampling.LANCZOS);layer=Image.new('RGBA',(W,H));layer.alpha_composite(tile,(round(680-(ax-box[0])*scale),round(1038-(ay-box[1])*scale)));layer.save(out/f'pose-{i:02d}.png');poses.append(layer)
idle=[]
for i in range(8):
 f=Image.new('RGBA',(W,H));f.paste(Image.open(idlepath/'frames'/f'frame-{i:02d}.png').convert('RGBA'),offset);idle.append(f)
def breathe(im,i):
 # Small wounded upper-body breath, settled at ground; no cyclic character scale.
 dy=2*np.sin(2*np.pi*i/8);mesh=[]
 for t in range(0,H,16):
  b=min(t+16,H)
  def v(y):return dy*max(0,min(1,(1010-y)/340))
  mesh.append(((0,t,W,b),(0,t-v(t),0,b-v(b),W,b-v(b),W,t-v(t))))
 return im.transform((W,H),Image.Transform.MESH,mesh,Image.Resampling.BICUBIC)
def fade(im,a):
 f=im.copy();f.putalpha(f.getchannel('A').point(lambda v:round(v*a)));return f
states={
'idle':(idle,[180]*8,True,None),
'cast':([idle[0],poses[0],poses[0],poses[1],poses[1],poses[2],idle[0],idle[1]],[100,140,110,100,110,150,100,90],False,350),
'hit':([idle[0],poses[3],poses[3],idle[0]],[60,100,120,150],False,None),
'wounded_idle':([breathe(poses[4],i) for i in range(8)],[180]*8,True,None),
'spawn':([fade(poses[5],.12),fade(poses[5],.55),poses[5],poses[6],idle[0]],[100,130,170,180,160],False,None),
'die':([idle[0],poses[3],poses[7],poses[7],poses[8]],[80,140,190,170,700],False,None)}
manifest={'schema':1,'name':'Maledictor','canvas':[W,H],'size':[W,H],'anchor':anchor,'idle_offset':list(offset),'reference_visible_height_px':950,'layout_bounds_px':[360,78,900,1040],'method':'Authored whole-character action keyposes; accepted eight-frame breathing idle padded without scaling; common1.78 action sheet scale. One-shot cast/hit/spawn; terminal collapsed death.','states':{},'source':{'path':'action-source.png','sha256':hashlib.sha256((out/'action-source.png').read_bytes()).hexdigest()},'qa':{'status':'self-check'}}
reviews=[];alltimes=[]
def dark(f):
 bg=Image.new('RGB',(W,H),(24,26,33));bg.paste(f,mask=f.getchannel('A'));return bg.resize((640,550),Image.Resampling.LANCZOS)
for name,(frames,times,loop,impact) in states.items():
 d=out/name;d.mkdir(exist_ok=True);entries=[];elapsed=0;previews=[]
 for i,(f,dt) in enumerate(zip(frames,times)):
  f.save(d/f'frame-{i:02d}.png');entries.append({'time':elapsed,'src':f'{name}/frame-{i:02d}.png','duration_ms':dt});elapsed+=dt;previews.append(dark(f))
  bg=Image.new('RGB',(640,580),(24,26,33));bg.paste(previews[-1],(0,30));ImageDraw.Draw(bg).text((20,10),name.upper(),fill='white');reviews.append(bg);alltimes.append(dt)
 contact=Image.new('RGB',(640*4,550*((len(frames)+3)//4)),(24,26,33))
 for i,f in enumerate(previews):contact.paste(f,((i%4)*640,(i//4)*550))
 contact.save(d/'contact-sheet.png');pal=contact.quantize(colors=255);seq=[f.quantize(palette=pal,dither=Image.Dither.NONE) for f in previews];seq[0].save(d/'preview.gif',save_all=True,append_images=seq[1:],duration=times,loop=0,disposal=2,optimize=False)
 frames[0].save(d/'animation.webp',save_all=True,append_images=frames[1:],duration=times,loop=0 if loop else 1,lossless=True)
 manifest['states'][name]={'frames':entries,'duration':elapsed,'loop':loop,'impact':impact,'events':([{'name':'release','time_ms':impact}] if impact is not None else [{'name':'terminal','time_ms':sum(times[:-1])}] if name=='die' else [])}
manifest['states']['attack']={**manifest['states']['cast'],'sourceState':'cast'};manifest['states']['act']={**manifest['states']['cast'],'sourceState':'cast'}
(out/'animation.json').write_text(json.dumps(manifest,indent=2))
# Repeated only in review GIF; runtime die is a terminal hold.
atlas=Image.new('RGB',(640*len(reviews),580))
for i,f in enumerate(reviews):atlas.paste(f,(i*640,0))
pal=atlas.quantize(colors=255);seq=[f.quantize(palette=pal,dither=Image.Dither.NONE) for f in reviews];seq[0].save(out/'all-states.gif',save_all=True,append_images=seq[1:],duration=alltimes,loop=0,disposal=2,optimize=False)
contact=Image.new('RGB',(640*3,550*3),(24,26,33))
for i,f in enumerate(poses):contact.paste(dark(f),((i%3)*640,(i//3)*550))
contact.save(out/'action-contact-sheet.png');print('Exported',len(reviews),'frames')
