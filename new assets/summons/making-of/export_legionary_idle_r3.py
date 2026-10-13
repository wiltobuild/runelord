from pathlib import Path
from PIL import Image,ImageFilter,ImageDraw
import numpy as np,math,json,hashlib,shutil
root=Path(__file__).resolve().parents[1];out=root/'outputs/iron-legionary-idle-r3';(out/'frames').mkdir(parents=True,exist_ok=True)
src=root/'outputs/demon-soldier-samples-r2/iron-legionary-r2.png';original_hash=hashlib.sha256(src.read_bytes()).hexdigest();shutil.copy2(src,out/'source.png')
im=Image.open(src).convert('RGBA');im.thumbnail((650,960),Image.Resampling.LANCZOS)
base=Image.new('RGBA',(720,1024));base.alpha_composite(im,((720-im.width)//2,1024-30-im.height));base.save(out/'idle-master.png')
a=np.asarray(base).astype(float);r,g,b=a[:,:,0],a[:,:,1],a[:,:,2];y,x=np.indices(a.shape[:2])
m=np.clip((g-65)/60,0,1)*np.clip((r-b-65)/70,0,1)*np.clip((r-140)/70,0,1)*(a[:,:,3]/255)
# Source paint selects existing sword/shield emissions, while face is kept steady.
m*=y>400
mask=Image.fromarray((m*255).astype('uint8'));mask.save(out/'emission-mask.png');bloom=np.asarray(mask.filter(ImageFilter.GaussianBlur(3))).astype(float)/255
# Explicit sword silhouette: blade/crossguard plus exposed pommel, excluding torso and legs.
sword=Image.new('L',base.size);d=ImageDraw.Draw(sword)
d.polygon([(176,533),(188,523),(211,511),(223,485),(243,498),(258,518),(247,530),(238,532),(241,549),(270,564),(293,560),(311,581),(344,599),(346,615),(434,677),(505,816),(353,742),(229,652),(200,638),(194,616),(176,633),(176,610),(166,596),(180,576)],fill=255)
d.polygon([(87,474),(113,459),(124,461),(113,480),(134,492),(120,520),(105,512),(97,490)],fill=255)
sword.save(out/'sword-isolation-mask.png')
# Broad enough rigid interior for all mesh vertices; narrow blend only around its exterior.
rigid=sword.filter(ImageFilter.MaxFilter(25)).filter(ImageFilter.GaussianBlur(3));weight=np.asarray(rigid).astype(float)/255
power=[.9,.83,.97,.88,1,.85,.94,.87];frames=[];entries=[]
for i in range(8):
 f=a.copy();f[:,:,:3]*=1-(m*(1-power[i])*.65)[:,:,None];f[:,:,:3]+=bloom[:,:,None]*np.array([255,80,5])[None,None,:]*(.1+.16*power[i])
 f=Image.fromarray(np.clip(f,0,255).astype('uint8'),'RGBA');mesh=[];dy=3*math.sin(2*math.pi*i/8)
 def shift(yy):
  t=min(1,max(0,(yy-490)/380));return dy*(1-t*t*(3-2*t))
 grip_shift=shift(520)
 for top in range(0,1024,8):
  bottom=min(1024,top+8)
  for left in range(0,720,8):
   right=min(720,left+8);coords=[]
   for xx,yy in [(left,top),(left,bottom),(right,bottom),(right,top)]:
    w=weight[min(yy,1023),min(xx,719)];v=(1-w)*shift(yy)+w*grip_shift;coords.extend((xx,yy-v))
   mesh.append(((left,top,right,bottom),tuple(coords)))
 f=f.transform((720,1024),Image.Transform.MESH,mesh,Image.Resampling.BICUBIC);f.paste(base.crop((0,875,720,1024)),(0,875));f.save(out/'frames'/f'frame-{i:02d}.png');frames.append(f)
 entries.append({'file':f'frames/frame-{i:02d}.png','duration_ms':180,'breathing_lift_px':dy,'emission_intensity':power[i]})
frames[0].save(out/'idle.webp',save_all=True,append_images=frames[1:],duration=180,loop=0,lossless=True)
previews=[]
for f in frames:
 bg=Image.new('RGB',f.size,(24,26,33));bg.paste(f,mask=f.getchannel('A'));bg.thumbnail((360,512),Image.Resampling.LANCZOS);previews.append(bg)
atlas=Image.new('RGB',(1440,1024),(24,26,33))
for i,f in enumerate(previews):atlas.paste(f,((i%4)*360,(i//4)*512))
atlas.save(out/'contact-sheet.png');palette=atlas.quantize(colors=255);seq=[f.quantize(palette=palette,dither=Image.Dither.NONE) for f in previews]
seq[0].save(out/'idle.gif',save_all=True,append_images=seq[1:],duration=180,loop=0,disposal=2,optimize=False)
with Image.open(out/'idle.gif') as g:assert g.n_frames==8
with Image.open(out/'idle.webp') as g:assert g.n_frames==8
assert all(np.array_equal(np.asarray(f)[875:],np.asarray(base)[875:]) for f in frames)
assert all(f.getchannel('A').getbbox()[0]>0 and f.getchannel('A').getbbox()[1]>0 and f.getchannel('A').getbbox()[2]<720 and f.getchannel('A').getbbox()[3]<1024 for f in frames)
assert hashlib.sha256(src.read_bytes()).hexdigest()==original_hash
manifest={'frame_count':8,'canvas':[720,1024],'duration_ms':1440,'loop':True,'source':str(src),'source_sha256':original_hash,'method':'Single source image technical breathing animation. Constant source scale; 3px maximum upper body vertical displacement tapers to zero at legs. Sword isolated by silhouette mask and translated rigidly with its grip; all other original breathing restored. No lateral wobble. Feet pixels fixed below y875. Existing warm sword/shield inlays flicker; face steady. Not eight authored poses.','checks':{'gif_frames':8,'webp_frames':8,'stationary_feet':True,'source_unchanged':True,'no_clipping':True},'frames':entries}
(out/'animation.json').write_text(json.dumps(manifest,indent=2));print('PASS 8 GIF/WebP frames; fixed feet; unchanged source; no clipping; max3px lift')
