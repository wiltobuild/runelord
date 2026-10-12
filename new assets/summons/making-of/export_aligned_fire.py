from pathlib import Path
from PIL import Image,ImageFilter,ImageDraw
import numpy as np,math,json,shutil,zipfile,hashlib
root=Path(r'C:/Users/Wil/Documents/Codex/2026-10-09/sp-2');out=root/'outputs/dread-vanguard-aligned-fire-r1';(out/'frames').mkdir(parents=True,exist_ok=True)
src=Path(r'C:/Users/Wil/.codex/generated_images/01a11ef8-d768-7f21-86bf-77a410275895/exec-2b1081dc-7ade-4c79-9fa4-0a939befc424.png');shutil.copy2(src,out/'battle-stance-source.png')
render=Image.open(src).convert('RGBA').resize((720,1024),Image.Resampling.LANCZOS)
base=Image.open(root/'outputs/dread-vanguard-empowerment-r1/unlit-registered.png').convert('RGBA')
# Use the new blade-bound effect only in the weapon region; body stays identical to unlit master.
region=Image.new('L',(720,1024));ImageDraw.Draw(region).polygon([(448,373),(547,143),(655,40),(710,40),(710,440),(544,470),(499,463),(453,444),(458,420)],fill=255)
base=Image.composite(render,base,region);base.save(out/'battle-stance.png')
a=np.asarray(base).astype(float);r,g,b=a[:,:,0],a[:,:,1],a[:,:,2]
# Isolate existing warm emissive paint; do not change rune geometry or armor color.
m=np.clip((g-65)/60,0,1)*np.clip((r-b-65)/70,0,1)*np.clip((r-140)/70,0,1)*(a[:,:,3]/255)
y,x=np.indices(m.shape);eye=((x>320)&(x<390)&(y>230)&(y<305))
mask=Image.fromarray((m*255).astype('uint8'));mask.save(out/'emission-mask.png')
bloom=np.asarray(mask.filter(ImageFilter.GaussianBlur(5))).astype(float)/255
runes=[.92,.8,1.0,.86,.97,.82,.96,.88];eyes=[.9,1.0,.8,.95,.85,1.0,.82,.92];frames=[];entries=[]
for i in range(8):
 power=np.where(eye,eyes[i],runes[i]);power=power*(.94+.08*np.sin(y*.065-i*math.pi/2));f=a.copy();weight=m*(1-power)*.79
 f[:,:,:3]*=(1-weight[:,:,None]);glow=bloom*(.12+.24*runes[i])
 f[:,:,:3]+=glow[:,:,None]*np.array([255,80,5])[None,None,:]
 # Keep the source alpha and apply a tiny continuous sway tapering to zero at planted feet.
 f=Image.fromarray(np.clip(f,0,255).astype('uint8'),'RGBA');mesh=[];dx=1.3*math.sin(2*math.pi*i/8)
 dy=4.0*math.sin(2*math.pi*i/8)
 def displacement(y):
  t=min(1,max(0,(y-510)/370));blend=1-(t*t*(3-2*t))
  return dx*blend,dy*blend
 for top in range(0,1024,16):
  bottom=min(1024,top+16);x0,y0=displacement(top);x1,y1=displacement(bottom)
  mesh.append(((0,top,720,bottom),(-x0,top-y0,-x1,bottom-y1,720-x1,bottom-y1,720-x0,top-y0)))
 f=f.transform((720,1024),Image.Transform.MESH,mesh,Image.Resampling.BICUBIC);f.paste(base.crop((0,885,720,1024)),(0,885));f.save(out/'frames'/f'frame-{i:02d}.png');frames.append(f)
 entries.append({'file':f'frames/frame-{i:02d}.png','duration_ms':160,'rune_intensity':runes[i],'eye_intensity':eyes[i],'upper_sway_px':dx,'breathing_lift_px':dy})
frames[0].save(out/'idle.webp',save_all=True,append_images=frames[1:],duration=160,loop=0,lossless=True)
previews=[]
for f in frames:
 bg=Image.new('RGB',f.size,(24,26,33));bg.paste(f,mask=f.getchannel('A'));bg.thumbnail((504,717),Image.Resampling.LANCZOS);previews.append(bg)
atlas=Image.new('RGB',(previews[0].width*4,previews[0].height*2),(24,26,33))
for i,f in enumerate(previews):atlas.paste(f,((i%4)*f.width,(i//4)*f.height))
atlas.save(out/'contact-sheet.png');palette=atlas.quantize(colors=255);seq=[f.quantize(palette=palette,dither=Image.Dither.NONE) for f in previews]
seq[0].save(out/'idle.gif',save_all=True,append_images=seq[1:],duration=160,loop=0,disposal=2,optimize=False)
with Image.open(out/'idle.gif') as g:assert g.n_frames==8
manifest={'frame_count':8,'canvas':[720,1024],'duration_ms':1280,'loop':True,'method':'Blade-bound fire drawn directly on weapon; original unlit body retained, eight small breathing steps with traveling fire intensity. Upper-body displacement limited to 4px vertical and 1.3px lateral; displacement eases to zero below knees. Fire/eye intensity varies. Rejected lunging pose excluded.','source_sha256':hashlib.sha256(src.read_bytes()).hexdigest(),'frames':entries}
(out/'animation.json').write_text(json.dumps(manifest,indent=2))
assert all(np.array_equal(np.asarray(f)[885:],np.asarray(base)[885:]) for f in frames), 'Feet changed'
print('PASS: exactly8 frames;1280ms; stationary feet; maximum body lift4px; no lunging keypose')


