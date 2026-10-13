from pathlib import Path
from PIL import Image,ImageFilter,ImageDraw
import numpy as np,math,json,hashlib,shutil
root=Path(r'C:/Users/Wil/Documents/Codex/2026-10-09/sp-2');out=root/'outputs/ironhorn-bulwark-idle-r2';(out/'frames').mkdir(parents=True,exist_ok=True)
src=root/'outputs/goatmen-expansion-r2/ironhorn-bulwark.png';shutil.copy2(src,out/'source.png')
W,H=800,1056
raw=Image.open(src).convert('RGBA');raw.thumbnail((740,976),Image.Resampling.LANCZOS)
base=Image.new('RGBA',(W,H));offset=((W-raw.width)//2,H-40-raw.height);base.alpha_composite(raw,offset);base.save(out/'registered-source.png')
a=np.asarray(base).astype(float);r,g,b=a[:,:,0],a[:,:,1],a[:,:,2];Y,X=np.indices((H,W))
# Existing warm emissive paint only, restricted to shield/cudgel regions. Never add new runes.
region=((X>435)&(Y>230)&(Y<900))|((X<185)&(Y>555)&(Y<900))
m=np.clip((g-70)/65,0,1)*np.clip((r-b-70)/70,0,1)*np.clip((r-150)/75,0,1)*(a[:,:,3]/255)*region
mask=Image.fromarray((m*255).astype('uint8'));mask.save(out/'emission-mask.png')
frames=[];entries=[]
def smooth(t):
 t=max(0,min(1,t));return t*t*(3-2*t)
def disp(x,y,theta):
 # Breathing settles above forearm and grip. Cudgel and hand never enter the mesh deformation.
 body=1-smooth((y-300)/132)
 return .6*math.sin(theta)*body,-2.5*math.sin(theta)*body
for i in range(8):
 theta=2*math.pi*i/8;power=1+.08*math.sin(theta+.4)+.025*math.sin(2*theta)
 f=a.copy();f[:,:,:3]*=(1+m[:,:,None]*(power-1));f=Image.fromarray(np.clip(f,0,255).astype('uint8'),'RGBA')
 unwarped=f.copy();mesh=[]
 for top in range(0,H,24):
  bottom=min(H,top+24)
  for left in range(0,W,24):
   right=min(W,left+24);coords=[]
   for x,y in [(left,top),(left,bottom),(right,bottom),(right,top)]:
    dx,dy=disp(x,y,theta);coords.extend((x-dx,y-dy))
   mesh.append(((left,top,right,bottom),tuple(coords)))
 f=f.transform((W,H),Image.Transform.MESH,mesh,Image.Resampling.BICUBIC)
 f.paste(unwarped.crop((0,432,W,H)),(0,432))
 f.paste(base.crop((0,900,W,H)),(0,900));f.save(out/'frames'/f'frame-{i:02d}.png');frames.append(f)
 entries.append({'file':f'frames/frame-{i:02d}.png','duration_ms':160,'phase':i/8,'emission_multiplier':power,'body_lift_px':-2.5*math.sin(theta),'body_sway_px':.6*math.sin(theta)})
frames[0].save(out/'idle.webp',save_all=True,append_images=frames[1:],duration=160,loop=0,lossless=True)
previews=[]
for i,f in enumerate(frames):
 bg=Image.new('RGB',f.size,(24,26,33));bg.paste(f,mask=f.getchannel('A'));bg.thumbnail((400,528),Image.Resampling.LANCZOS);previews.append(bg)
contact=Image.new('RGB',(1600,1100),(24,26,33));d=ImageDraw.Draw(contact)
for i,f in enumerate(previews):
 x=(i%4)*400;y=(i//4)*550;contact.paste(f,(x,y+20));d.text((x+12,y+5),f'FRAME {i+1}',fill='#dddddd')
contact.save(out/'contact-sheet.png');pal=contact.quantize(colors=255);seq=[f.quantize(palette=pal,dither=Image.Dither.NONE) for f in previews]
seq[0].save(out/'idle.gif',save_all=True,append_images=seq[1:],duration=160,loop=0,disposal=2,optimize=False)
assert all(np.array_equal(np.asarray(f)[900:],np.asarray(base)[900:]) for f in frames),'feet changed'
clip=[];bounds=[]
for i,f in enumerate(frames):
 al=np.asarray(f.getchannel('A'));ys,xs=np.where(al>16);bounds.append([int(xs.min()),int(ys.min()),int(xs.max()),int(ys.max())]);clip.append(bool((al[0]>16).any() or (al[-1]>16).any() or (al[:,0]>16).any() or (al[:,-1]>16).any()))
assert not any(clip),'clipping'
with Image.open(out/'idle.gif') as g: assert g.n_frames==8
with Image.open(out/'idle.webp') as g: assert g.n_frames==8
loop_error=max(abs(v-w) for x,y in [(0,0),(500,300),(100,700),(650,750),(400,1000)] for v,w in zip(disp(x,y,0),disp(x,y,2*math.pi)))
assert loop_error<1e-9
manifest={'frame_count':8,'canvas':[W,H],'duration_ms':1280,'loop':True,'source':str(src),'source_sha256':hashlib.sha256(src.read_bytes()).hexdigest(),'source_scale':raw.width/Image.open(src).width,'offset':offset,'fixed_feet_y':900,'method':'Technical subtle mesh-deformation idle using existing whole character artwork; continuous periodic breathing, head/chest motion tapering to zero by y432; rigid fixed hand and entire cudgel, restrained existing-emission intensity. Not newly drawn or articulated character frames. No body scaling or lunging.','limits':{'max_body_lift_px':2.5,'max_body_sway_px':.6,'shield_follow_px':[0,0],'cudgel_follow_px':[0,0]},'frames':entries,'approval':'Pending exact-hash review; source explicitly selected by user; no ledger entry at export'}
(out/'animation.json').write_text(json.dumps(manifest,indent=2))
qa={'gif_frames':8,'webp_frames':8,'planted_feet_exact_pixels':True,'alpha16_border_clipping':clip,'alpha16_bounds':bounds,'periodic_transform_endpoint_error':loop_error,'last_to_first_is_one_regular_phase_step':True,'static_self_review_required':True,'runtime_integration':False}
(out/'verification.json').write_text(json.dumps(qa,indent=2));print(json.dumps(qa))
