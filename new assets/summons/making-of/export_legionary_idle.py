from pathlib import Path
from PIL import Image,ImageFilter
import numpy as np,math,json,hashlib,shutil
root=Path(__file__).resolve().parents[1];out=root/'outputs/iron-legionary-idle-r1';(out/'frames').mkdir(parents=True,exist_ok=True)
src=root/'outputs/demon-soldier-samples-r2/iron-legionary-r2.png';original_hash=hashlib.sha256(src.read_bytes()).hexdigest();shutil.copy2(src,out/'source.png')
im=Image.open(src).convert('RGBA');im.thumbnail((650,960),Image.Resampling.LANCZOS)
base=Image.new('RGBA',(720,1024));base.alpha_composite(im,((720-im.width)//2,1024-30-im.height));base.save(out/'idle-master.png')
a=np.asarray(base).astype(float);r,g,b=a[:,:,0],a[:,:,1],a[:,:,2];y,x=np.indices(a.shape[:2])
m=np.clip((g-65)/60,0,1)*np.clip((r-b-65)/70,0,1)*np.clip((r-140)/70,0,1)*(a[:,:,3]/255)
# Source paint selects existing sword/shield emissions, while face is kept steady.
m*=y>400
mask=Image.fromarray((m*255).astype('uint8'));mask.save(out/'emission-mask.png');bloom=np.asarray(mask.filter(ImageFilter.GaussianBlur(3))).astype(float)/255
power=[.9,.83,.97,.88,1,.85,.94,.87];frames=[];entries=[]
for i in range(8):
 f=a.copy();f[:,:,:3]*=1-(m*(1-power[i])*.65)[:,:,None];f[:,:,:3]+=bloom[:,:,None]*np.array([255,80,5])[None,None,:]*(.1+.16*power[i])
 f=Image.fromarray(np.clip(f,0,255).astype('uint8'),'RGBA');mesh=[];dy=3*math.sin(2*math.pi*i/8)
 def shift(yy):
  t=min(1,max(0,(yy-490)/380));return dy*(1-t*t*(3-2*t))
 for top in range(0,1024,16):
  bottom=min(1024,top+16);v0=shift(top);v1=shift(bottom)
  mesh.append(((0,top,720,bottom),(0,top-v0,0,bottom-v1,720,bottom-v1,720,top-v0)))
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
manifest={'frame_count':8,'canvas':[720,1024],'duration_ms':1440,'loop':True,'source':str(src),'source_sha256':original_hash,'method':'Single source image technical breathing animation. Constant source scale; 3px maximum upper body vertical displacement tapers to zero at legs. No lateral wobble. Feet pixels fixed below y875. Existing warm sword/shield inlays flicker; face steady. Not eight authored poses.','checks':{'gif_frames':8,'webp_frames':8,'stationary_feet':True,'source_unchanged':True,'no_clipping':True},'frames':entries}
(out/'animation.json').write_text(json.dumps(manifest,indent=2));print('PASS 8 GIF/WebP frames; fixed feet; unchanged source; no clipping; max3px lift')
