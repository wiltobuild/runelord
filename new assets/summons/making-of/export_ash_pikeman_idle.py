from pathlib import Path
from PIL import Image,ImageFilter
import numpy as np,math,json,hashlib,shutil
root=Path(r'C:/Users/Wil/Documents/Codex/2026-10-09/sp-2');out=root/'outputs/ash-pikeman-idle-r1';(out/'frames').mkdir(parents=True,exist_ok=True)
src=root/'outputs/demon-soldier-samples-r2/ash-pikeman-r2.png';shutil.copy2(src,out/'source.png')
original=Image.open(src).convert('RGBA');scaled=original.resize((614,922),Image.Resampling.LANCZOS)
base=Image.new('RGBA',(720,1024));base.paste(scaled,(53,51));base.save(out/'registered.png')
a=np.asarray(base).astype(float);r,g,b=a[:,:,0],a[:,:,1],a[:,:,2];y,x=np.indices(r.shape)
m=np.clip((g-75)/65,0,1)*np.clip((r-b-100)/75,0,1)*np.clip((r-160)/60,0,1)*(a[:,:,3]/255)
# Only existing spear-head runes; exclude skin, eyes, leg seams.
m*=((x>500)&(y<270))
Image.fromarray((m*255).astype('uint8')).save(out/'emission-mask.png')
frames=[];entries=[]
for i in range(8):
 phase=2*math.pi*i/8;dx=.8*math.sin(phase);dy=2.0*math.sin(phase);power=.9+.1*math.sin(phase+.4)
 f=a.copy();f[:,:,:3]*=(1-m[:,:,None]*(1-power)*.60);f=Image.fromarray(np.clip(f,0,255).astype('uint8'),'RGBA')
 def displacement(v):
  t=min(1,max(0,(v-390)/440));blend=1-t*t*(3-2*t)
  return dx*blend,dy*blend
 mesh=[]
 for top in range(0,1024,8):
  bottom=min(1024,top+8);x0,y0=displacement(top);x1,y1=displacement(bottom)
  mesh.append(((0,top,720,bottom),(-x0,top-y0,-x1,bottom-y1,720-x1,bottom-y1,720-x0,top-y0)))
 f=f.transform((720,1024),Image.Transform.MESH,mesh,Image.Resampling.BICUBIC)
 f.paste(base.crop((0,835,720,1024)),(0,835));f.save(out/'frames'/f'frame-{i:02d}.png');frames.append(f)
 entries.append({'file':f'frames/frame-{i:02d}.png','duration_ms':160,'upper_sway_px':dx,'breathing_lift_px':dy,'rune_intensity':power})
frames[0].save(out/'idle.webp',save_all=True,append_images=frames[1:],duration=160,loop=0,lossless=True)
previews=[]
for f in frames:
 bg=Image.new('RGB',f.size,(24,26,33));bg.paste(f,mask=f.getchannel('A'));bg.thumbnail((360,512),Image.Resampling.LANCZOS);previews.append(bg)
atlas=Image.new('RGB',(1440,1024),(24,26,33))
for i,f in enumerate(previews):atlas.paste(f,((i%4)*360,(i//4)*512))
atlas.save(out/'contact-sheet.png');pal=atlas.quantize(colors=255);seq=[f.quantize(palette=pal,dither=Image.Dither.NONE) for f in previews]
seq[0].save(out/'idle.gif',save_all=True,append_images=seq[1:],duration=160,loop=0,disposal=2,optimize=False)
assert all(np.array_equal(np.asarray(f)[835:],np.asarray(base)[835:]) for f in frames)
for f in frames:
 alpha=np.asarray(f)[:,:,3];assert not np.any(alpha[:8]) and not np.any(alpha[-8:]) and not np.any(alpha[:,:8]) and not np.any(alpha[:,-8:])
for name in ['idle.gif','idle.webp']:
 with Image.open(out/name) as im:assert im.n_frames==8 and im.info['loop']==0
sha=lambda p:hashlib.sha256(p.read_bytes()).hexdigest()
ledger=json.loads(Path(r'C:/Users/Wil/Documents/Codex/2026-10-09/i-x20/runelord/assets/approvals/decisions.json').read_text())
manifest={'source':str(src),'source_sha256':sha(src),'source_ledger_decision':ledger['decisions'].get(sha(src)),'frame_count':8,'canvas':[720,1024],'duration_ms':1280,'loop':True,'method':'Source artwork registered once with padding; continuous tiny upper-body breathing and sway easing to zero above feet, spear follows restrained upper movement. Only existing spear runes modulate. No per-frame scaling.','qa':{'feet_identical':True,'edge_clipping':False,'png_count':8,'gif_frames':8,'webp_frames':8,'periodic_motion':'8 evenly spaced sine phases; wrap displacement no greater than adjacent step'},'frames':entries}
(out/'animation.json').write_text(json.dumps(manifest,indent=2))
print('PASS: 8 PNG/GIF/WebP frames; 1280 ms seamless phase loop; fixed feet; no edge clipping; max lift 2px sway 0.8px')

