from pathlib import Path
from PIL import Image,ImageDraw,ImageFont
import math,json,zipfile,shutil,numpy as np
root=Path(r'C:/Users/Wil/Documents/Codex/2026-10-09/sp-2');out=root/'outputs/dread-vanguard-empowerment-r1';base=Image.open(out/'unlit-master.png').convert('RGBA').resize((720,1024),Image.Resampling.LANCZOS);base.save(out/'unlit-registered.png')
src=Path(r'C:/Users/Wil/.codex/generated_images/01a11ef8-d768-7f21-86bf-77a410275895/exec-8e0f0b1b-6283-40fd-b2ae-a53daa91d3d6.png');shutil.copy2(src,out/'fire-source.png');sheet=Image.open(src).convert('RGBA');effects=[]
roots=[(120,720),(100,720),(120,710),(120,715)];tips=[(420,85),(420,95),(415,100),(420,110)]
for i,(sp,tp) in enumerate(zip(roots,tips)):
 c,r=i%2,i//2;tile=sheet.crop((c*526,r*747,(c+1)*526,min((r+1)*747,1495)))
 u=np.array(tp)-sp;v=np.array([645,96])-np.array([490,432]);a=float(np.dot(u,v)/np.dot(u,u));b=float((u[0]*v[1]-u[1]*v[0])/np.dot(u,u));tx=490-a*sp[0]+b*sp[1];ty=432-b*sp[0]-a*sp[1];den=a*a+b*b
 inv=(a/den,b/den,(-a*tx-b*ty)/den,-b/den,a/den,(b*tx-a*ty)/den)
 fx=tile.transform((720,1024),Image.Transform.AFFINE,inv,Image.Resampling.BICUBIC);effects.append(fx);fx.save(out/f'fire-phase-{i}.png')
allframes={}
for state in ['unlit','empowered']:
 d=out/state;(d/'frames').mkdir(parents=True,exist_ok=True);frames=[]
 for i in range(8):
  f=base.copy()
  if state=='empowered':
   j=i//2;fx=effects[j] if i%2==0 else Image.blend(effects[j],effects[(j+1)%4],.5)
   f.alpha_composite(fx)
  mesh=[];dx=1.3*math.sin(2*math.pi*i/8);dy=4*math.sin(2*math.pi*i/8)
  def disp(y):
   t=min(1,max(0,(y-510)/370));blend=1-t*t*(3-2*t);return dx*blend,dy*blend
  for top in range(0,1024,16):
   bottom=min(1024,top+16);x0,y0=disp(top);x1,y1=disp(bottom);mesh.append(((0,top,720,bottom),(-x0,top-y0,-x1,bottom-y1,720-x1,bottom-y1,720-x0,top-y0)))
  f=f.transform((720,1024),Image.Transform.MESH,mesh,Image.Resampling.BICUBIC);f.paste(base.crop((0,885,720,1024)),(0,885));f.save(d/'frames'/f'frame-{i:02d}.png');frames.append(f)
 allframes[state]=frames
 frames[0].save(d/'idle.webp',save_all=True,append_images=frames[1:],duration=160,loop=0,lossless=True)
 def dark(f):
  bg=Image.new('RGB',f.size,(24,26,33));bg.paste(f,mask=f.getchannel('A'));bg.thumbnail((432,614),Image.Resampling.LANCZOS);return bg
 ims=[dark(f) for f in frames];atlas=Image.new('RGB',(1728,1228),(24,26,33))
 for i,im in enumerate(ims):atlas.paste(im,((i%4)*432,(i//4)*614))
 atlas.save(d/'contact-sheet.png');pal=atlas.quantize(colors=255);seq=[im.quantize(palette=pal,dither=Image.Dither.NONE) for im in ims];seq[0].save(d/'idle.gif',save_all=True,append_images=seq[1:],duration=160,loop=0,disposal=2,optimize=False)
 with Image.open(d/'idle.gif') as g:assert g.n_frames==8
pairs=[]
for i in range(8):
 pair=Image.new('RGB',(864,650),(24,26,33));pair.paste(dark(allframes['unlit'][i]),(0,36));pair.paste(dark(allframes['empowered'][i]),(432,36));draw=ImageDraw.Draw(pair);font=ImageFont.truetype('C:/Windows/Fonts/segoeuib.ttf',20);draw.text((216,17),'Unempowered',font=font,fill='white',anchor='mm');draw.text((648,17),'Empowered',font=font,fill='white',anchor='mm');pairs.append(pair)
pal=Image.new('RGB',(864*8,650))
for i,f in enumerate(pairs):pal.paste(f,(864*i,0))
palette=pal.quantize(colors=255);seq=[f.quantize(palette=palette,dither=Image.Dither.NONE) for f in pairs];seq[0].save(out/'comparison.gif',save_all=True,append_images=seq[1:],duration=160,loop=0,disposal=2,optimize=False);pairs[0].save(out/'comparison.png')
for i in range(8):assert np.array_equal(np.asarray(allframes['unlit'][i])[550:],np.asarray(allframes['empowered'][i])[550:])
(out/'animation.json').write_text(json.dumps({'frame_count_each':8,'canvas':[720,1024],'duration_ms':1280,'states':['unlit','empowered'],'method':'Same unlit body and identical subtle breathing in both states. Empowered adds four authored fire VFX phases with in-between blends sampled into eight frames. Lower body byte-identical between paired frames. No attack/lunge.'},indent=2))
print('PASS:8 frames per state; matching body motion;4 animated fire phases plus4 inbetweens')
