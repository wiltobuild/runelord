from pathlib import Path
from PIL import Image,ImageFilter,ImageDraw
import numpy as np,math,json,shutil,zipfile,hashlib
root=Path(r'C:/Users/Wil/Documents/Codex/2026-10-09/sp-2');out=root/'outputs/dread-vanguard-idle-r1';(out/'frames').mkdir(parents=True,exist_ok=True)
src=Path(r'C:/Users/Wil/.codex/generated_images/01a11ef8-d768-7f21-86bf-77a410275895/exec-5d77510e-0bc6-4855-988a-5944f635988a.png');shutil.copy2(src,out/'battle-stance-source.png')
im=Image.open(src).convert('RGBA');im.thumbnail((660,960),Image.Resampling.LANCZOS);base=Image.new('RGBA',(720,1024));offset=((720-im.width)//2,32);base.alpha_composite(im,offset);base.save(out/'battle-stance.png')
a=np.asarray(base).astype(float);r,g,b=a[:,:,0],a[:,:,1],a[:,:,2]
# Isolate existing warm emissive paint; do not change rune geometry or armor color.
m=np.clip((g-65)/60,0,1)*np.clip((r-b-65)/70,0,1)*np.clip((r-140)/70,0,1)*(a[:,:,3]/255)
y,x=np.indices(m.shape);eye=((x>offset[0]+460*im.width/1024)&(x<offset[0]+550*im.width/1024)&(y>offset[1]+235*im.height/1536)&(y<offset[1]+310*im.height/1536))
mask=Image.fromarray((m*255).astype('uint8'));mask.save(out/'emission-mask.png')
bloom=np.asarray(mask.filter(ImageFilter.GaussianBlur(5))).astype(float)/255
runes=[.38,.72,1.0,.58,.84,.48,.95,.63];eyes=[.65,.94,.55,.82,1.0,.60,.78,.47];frames=[];entries=[]
for i in range(8):
 power=np.where(eye,eyes[i],runes[i]);f=a.copy();weight=m*(1-power)*.79
 f[:,:,:3]*=(1-weight[:,:,None]);glow=bloom*(.12+.24*runes[i])
 f[:,:,:3]+=glow[:,:,None]*np.array([255,80,5])[None,None,:]
 # Keep the source alpha and apply a tiny continuous sway tapering to zero at planted feet.
 f=Image.fromarray(np.clip(f,0,255).astype('uint8'),'RGBA');mesh=[];dx=1.3*math.sin(2*math.pi*i/8)
 for top in range(0,1024,32):
  bottom=min(1024,top+32);d0=dx*max(0,1-top/900);d1=dx*max(0,1-bottom/900)
  mesh.append(((0,top,720,bottom),(-d0,top,-d1,bottom,720-d1,bottom,720-d0,top)))
 f=f.transform((720,1024),Image.Transform.MESH,mesh,Image.Resampling.BICUBIC);f.save(out/'frames'/f'frame-{i:02d}.png');frames.append(f)
 entries.append({'file':f'frames/frame-{i:02d}.png','duration_ms':140,'rune_intensity':runes[i],'eye_intensity':eyes[i],'upper_sway_px':dx})
frames[0].save(out/'idle.webp',save_all=True,append_images=frames[1:],duration=140,loop=0,lossless=True)
previews=[]
for f in frames:
 bg=Image.new('RGB',f.size,(24,26,33));bg.paste(f,mask=f.getchannel('A'));bg.thumbnail((504,717),Image.Resampling.LANCZOS);previews.append(bg)
atlas=Image.new('RGB',(previews[0].width*4,previews[0].height*2),(24,26,33))
for i,f in enumerate(previews):atlas.paste(f,((i%4)*f.width,(i//4)*f.height))
atlas.save(out/'contact-sheet.png');palette=atlas.quantize(colors=255);seq=[f.quantize(palette=palette,dither=Image.Dither.NONE) for f in previews]
seq[0].save(out/'idle.gif',save_all=True,append_images=seq[1:],duration=140,loop=0,disposal=2,optimize=False)
with Image.open(out/'idle.gif') as g:assert g.n_frames==8
manifest={'frame_count':8,'canvas':[720,1024],'duration_ms':1120,'loop':True,'method':'Single imagegen battle-stance master; technical emission-intensity animation and 1.3px upper-body sway tapered to stationary feet. No pose redrawing or cyclic scale change.','source_sha256':hashlib.sha256(src.read_bytes()).hexdigest(),'frames':entries}
(out/'animation.json').write_text(json.dumps(manifest,indent=2))
print('PASS: 8 frames; 1120ms loop; separate eye/rune curves; no cyclic scaling')

