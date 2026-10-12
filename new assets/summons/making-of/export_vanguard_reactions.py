from pathlib import Path
from PIL import Image, ImageDraw, ImageFilter, ImageChops
import numpy as np, math, json, shutil, hashlib
R=Path('C:/Users/Wil/Documents/Codex/2026-10-09/sp-2')
O=R/'outputs/dread-vanguard-states-r1'
G=Path('C:/Users/Wil/.codex/generated_images/01a12879-78b0-7db3-a8ee-a824c25599bc')
S=(1200,1100)
sources={'reaction':'exec-d1ed608c-32e6-47ef-9dcd-627a188e269a.png','block':'exec-11729d63-5268-4bc7-8e83-e37ab5bdc6fa.png','hit':'exec-bb360cc5-f119-424b-a809-3f97f2984a3f.png'}
def pack(name,box,scale,pivot):
 im=Image.open(G/sources[name]).convert('RGBA').crop(box)
 im=im.resize((round(im.width*scale),round(im.height*scale)),Image.Resampling.LANCZOS)
 xy=(round(600-(pivot[0]-box[0])*scale),round(1020-(pivot[1]-box[1])*scale))
 out=Image.new('RGBA',S);out.alpha_composite(im,xy)
 return out,lambda p:(xy[0]+(p[0]-box[0])*scale,xy[1]+(p[1]-box[1])*scale)
hit,hp=pack('hit',(0,0,1052,1495),.695,(475,1344))
wa,ap=pack('reaction',(0,698,526,1495),1.32,(265,1440))
wb,bp=pack('reaction',(526,698,1052,1495),1.32,(783,1440))
block,cp=pack('block',(0,0,887,887),1.176,(400,866))
release,dp=pack('block',(887,0,1774,887),1.176,(1290,866))
def idle(i):
 out=Image.new('RGBA',S);out.alpha_composite(Image.open(R/f'outputs/dread-vanguard-idle-r5/frames/frame-{i%8:02d}.png').convert('RGBA'),(240,40));return out
# Regional VFX masks exclude blade metal, blade inscriptions, body and hands.
# Painted flame fringe is isolated by warm hue outside the blade quadrilateral.
def flame_layers(base,tf,region,blade):
 a=np.asarray(base).astype(float); r,g,b=a[:,:,0],a[:,:,1],a[:,:,2]
 reg=Image.new('L',S);ImageDraw.Draw(reg).polygon([tf(p) for p in region],fill=255)
 solid=Image.new('L',S);ImageDraw.Draw(solid).polygon([tf(p) for p in blade],fill=255)
 m=np.asarray(ImageChops.subtract(reg,solid)).astype(float)/255
 m*=np.clip((r-b-35)/65,0,1)*np.clip((r-g*.85-15)/45,0,1)
 f=a.copy();f[:,:,3]*=m;bdy=a.copy();bdy[:,:,3]*=1-m
 return Image.fromarray(bdy.astype('uint8')),Image.fromarray(f.astype('uint8'))
specs=[
 (hit,hp,[(604,715),(1052,850),(1052,1260),(830,1180),(580,870)],[(620,811),(670,813),(999,1137),(830,1000)]),
 (wa,ap,[(325,700),(526,698),(526,1040),(325,1075),(290,960)],[(350,1008),(485,771),(408,966),(366,1024)]),
 (wb,bp,[(862,698),(1052,698),(1052,1080),(836,1090),(790,990)],[(891,1013),(994,778),(947,971),(901,1043)]),
 (block,cp,[(441,8),(740,8),(740,341),(525,388),(425,290)],[(470,284),(677,78),(575,249),(501,318)]),
 (release,dp,[(1376,9),(1690,9),(1690,455),(1380,460)],[(1420,400),(1650,80),(1540,337),(1440,428)])
]
layers=[flame_layers(*s) for s in specs]
def vfx(k,phase):
 body,fire=layers[k];mesh=[]
 for y in range(0,S[1],22):
  for x in range(0,S[0],24):
   ex=min(x+24,S[0]);ey=min(y+22,S[1])
   def p(xx,yy):return(xx-6*math.sin(yy*.051+phase),yy-8*math.cos(xx*.047+phase))
   mesh.append(((x,y,ex,ey),p(x,y)+p(x,ey)+p(ex,ey)+p(ex,y)))
 out=body.copy();out.alpha_composite(fire.transform(S,Image.Transform.MESH,mesh,Image.Resampling.BICUBIC));return out
def export(state,frames,durations,loop,notes):
 d=O/state;(d/'frames').mkdir(parents=True,exist_ok=True)
 for i,f in enumerate(frames):f.save(d/'frames'/f'frame-{i:02d}.png')
 thumbs=[]
 for f in frames:
  bg=Image.new('RGB',S,(24,26,33));bg.paste(f,mask=f.getchannel('A'));bg.thumbnail((480,440));thumbs.append(bg)
 board=Image.new('RGB',(480*4,440*math.ceil(len(thumbs)/4)),(24,26,33))
 for i,t in enumerate(thumbs):board.paste(t,((i%4)*480,(i//4)*440))
 board.save(d/'contact-sheet.png');pal=board.quantize(colors=255)
 seq=[f.quantize(palette=pal,dither=Image.Dither.NONE) for f in thumbs]
 seq[0].save(d/f'{state}.gif',save_all=True,append_images=seq[1:],duration=durations,loop=0,disposal=2,optimize=False)
 frames[0].save(d/f'{state}.webp',save_all=True,append_images=frames[1:],duration=durations,loop=0,lossless=True)
 entries=[];t=0
 for i,ms in enumerate(durations):entries.append({'time':t,'file':f'frames/frame-{i:02d}.png','duration_ms':ms});t+=ms
 data={'state':state,'canvas':list(S),'anchor':[600,1020],'frame_count':len(frames),'duration':t,'duration_ms':t,'loop':loop,'impact':None,'frames':entries,'method':notes,'preview_note':'GIF loops for inspection; runtime loop flag is authoritative.'}
 (d/'animation.json').write_text(json.dumps(data,indent=2))
 shutil.copy2(R/'work/vanguard-reactions-provenance.json',d/'generation.json')
 for key in (['hit','block'] if state=='hit' else ['reaction'] if state=='wounded_idle' else ['block']):shutil.copy2(G/sources[key],d/f'{key}-source.png')
 with Image.open(d/f'{state}.gif') as im:assert im.n_frames==len(frames)
 assert all(f.size==S for f in frames)
 print(state,len(frames),t)
export('hit',[idle(0),vfx(0,0),vfx(0,1.1),vfx(4,2.2),idle(4),idle(5)],[60,90,90,110,100,130],False,'Authored recoil and recovery keyposes, constant source-sheet anatomy scale; independent moving sword fire; exact approved idle endpoint.')
export('block',[idle(0),vfx(4,0),vfx(3,.8),vfx(3,1.8),vfx(4,2.6),idle(5)],[60,80,130,130,100,150],False,'Authored raised two-handed sword block and release poses; independent curling sword fire; exact approved idle endpoint.')
export('wounded_idle',[vfx(1 if i<3 or i==7 else 2,2*math.pi*i/8) for i in range(8)],[160]*8,True,'Two authored hunched guard poses at one fixed source-sheet scale, eight independent fire flow phases. No per-frame rescaling. Pose transitions are stepped.')
