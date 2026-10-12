from pathlib import Path
from PIL import Image,ImageFilter
import numpy as np,math,json,hashlib,shutil
root=Path(__file__).resolve().parents[1];out=root/'outputs/maledictor-idle-r1';(out/'frames').mkdir(parents=True,exist_ok=True)
src=root/'outputs/demon-family-expansion-r1/maledictor.png';base=Image.new('RGBA',(720,1024));im=Image.open(src).convert('RGBA').resize((640,960),Image.Resampling.LANCZOS);base.alpha_composite(im,(40,32));base.save(out/'idle-master.png');shutil.copy2(src,out/'source.png')
a=np.asarray(base).astype(float);r,g,b=a[:,:,0],a[:,:,1],a[:,:,2];y,x=np.indices(a.shape[:2]);m=np.clip((g-75)/65,0,1)*np.clip((r-b-70)/70,0,1)*np.clip((r-150)/70,0,1)*(a[:,:,3]/255)
crystal=(x>186)&(x<221)&(y<182);staff=(x<285)&(y<380);hand=(x>527)&(y<228)
powers=[.95,.70,1,.79,.93,.73,1,.84];cp=[.74,1,.82,.94,.68,.9,1,.8]
flamefile=out/'flame-source.png';flames=[]
if flamefile.exists():
 sheet=Image.open(flamefile).convert('RGBA');sw,sh=sheet.size
 for k in range(4):
  f=sheet.crop(((k%2)*sw//2,(k//2)*sh//2,((k%2)+1)*sw//2,((k//2)+1)*sh//2));bbox=f.getchannel('A').point(lambda v:255 if v>15 else 0).getbbox();f=f.crop(bbox);f.thumbnail((53,88),Image.Resampling.LANCZOS);flames.append(f)
frames=[];entries=[]
for i in range(8):
 phase=2*math.pi*i/8;power=np.where(crystal,cp[i],np.where(staff,powers[i],powers[(i+3)%8]));f=a.copy();f[:,:,:3]*=1-(m*(1-power)*.8)[:,:,None]
 bloom=np.asarray(Image.fromarray((m*power*255).astype('uint8')).filter(ImageFilter.GaussianBlur(4)))/255
 f[:,:,:3]+=bloom[:,:,None]*np.array([140,58,5])[None,None,:]*.35
 f=Image.fromarray(np.clip(f,0,255).astype('uint8'),'RGBA')
 if flames:
  flame=flames[i%4];f.alpha_composite(flame,(550-flame.width//2,204-flame.height))
 def displacement(xx,yy):
  t=min(1,max(0,(yy-370)/450));body=1-t*t*(3-2*t)
  # Staff sways about its planted lower tip, with the gripping wrist following continuously.
  staffweight=math.exp(-((xx-203)/78)**4)*max(0,1-yy/905)
  dx=1.5*math.sin(phase)*staffweight
  dy=2.8*math.sin(phase)*body
  return dx,dy
 mesh=[]
 for top in range(0,1024,16):
  bot=min(top+16,1024)
  for left in range(0,720,16):
   right=min(left+16,720);quad=[]
   for xx,yy in [(left,top),(left,bot),(right,bot),(right,top)]:
    dx,dy=displacement(xx,yy);quad.extend([xx-dx,yy-dy])
   mesh.append(((left,top,right,bot),tuple(quad)))
 f=f.transform(base.size,Image.Transform.MESH,mesh,Image.Resampling.BICUBIC);f.paste(base.crop((0,825,720,1024)),(0,825));f.save(out/'frames'/f'frame-{i:02d}.png');frames.append(f);entries.append({'file':f'frames/frame-{i:02d}.png','duration_ms':180,'fire_phase':i%4,'rune_power':powers[i],'crystal_power':cp[i]})
frames[0].save(out/'idle.webp',save_all=True,append_images=frames[1:],duration=180,loop=0,lossless=True)
previews=[]
for f in frames:
 bg=Image.new('RGB',f.size,(24,26,33));bg.paste(f,mask=f.getchannel('A'));bg=bg.resize((360,512),Image.Resampling.LANCZOS);previews.append(bg)
atlas=Image.new('RGB',(1440,1024))
for i,f in enumerate(previews):atlas.paste(f,((i%4)*360,(i//4)*512))
atlas.save(out/'contact-sheet.png');palette=atlas.quantize(colors=255);seq=[f.quantize(palette=palette,dither=Image.Dither.NONE) for f in previews];seq[0].save(out/'idle.gif',save_all=True,append_images=seq[1:],duration=180,loop=0,disposal=2,optimize=False)
assert all(np.array_equal(np.asarray(f)[825:],np.asarray(base)[825:]) for f in frames)
with Image.open(out/'idle.gif') as g:assert g.n_frames==8
(out/'animation.json').write_text(json.dumps({'frame_count':8,'duration_ms':1440,'canvas':[720,1024],'source':str(src),'source_sha256':hashlib.sha256(src.read_bytes()).hexdigest(),'method':'Technical subtle breathing deformation of preserved master, maximum 2.8px lift. Staff sway anchored low. Separate crystal/rune intensity patterns; four distinct generated hand-fire shapes repeated across eight frames. Source transparency retained; animation review export, not yet runtime-integrated.','flame_source':str(flamefile),'frames':entries,'checks':{'fixed_feet':True,'unique_frames':len(set(hashlib.sha256(f.tobytes()).hexdigest() for f in frames))}},indent=2))
print('PASS 8 frames, planted feet, preserved source; flame phases',len(flames))
