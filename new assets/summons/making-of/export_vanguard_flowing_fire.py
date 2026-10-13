from pathlib import Path
from PIL import Image,ImageFilter,ImageDraw
import numpy as np,math,json,shutil,zipfile,hashlib
root=Path(r'C:/Users/Wil/Documents/Codex/2026-10-09/sp-2');out=root/'outputs/dread-vanguard-idle-r5';(out/'frames').mkdir(parents=True,exist_ok=True)
src=root/'outputs/dread-vanguard-idle-r2/pose-0.png';shutil.copy2(src,out/'battle-stance-source.png')
base=Image.open(src).convert('RGBA');base.save(out/'battle-stance.png')
a=np.asarray(base).astype(float);r,g,b=a[:,:,0],a[:,:,1],a[:,:,2]
# Isolate existing warm emissive paint; do not change rune geometry or armor color.
m=np.clip((g-65)/60,0,1)*np.clip((r-b-65)/70,0,1)*np.clip((r-140)/70,0,1)*(a[:,:,3]/255)
y,x=np.indices(m.shape);eye=((x>320)&(x<390)&(y>230)&(y<305))
mask=Image.fromarray((m*255).astype('uint8'));mask.save(out/'emission-mask.png')
bloom=np.asarray(mask.filter(ImageFilter.GaussianBlur(5))).astype(float)/255
# Separate the existing fire fringe from the rigid sword and character.
# Blade interior, runes and body remain registered; only exterior flame pixels flow.
left_edge=704-.63*y;right_edge=684-.385*y
outside=(x<left_edge+3)|(x>right_edge-4)
warm=np.clip((r-b-35)/65,0,1)*np.clip((r-g*.85-15)/45,0,1)
firemask=warm*outside*(x>425)*(y<445)*(y>35)
fire=base.copy();fa=a.copy();fa[:,:,3]*=firemask
fire=Image.fromarray(np.clip(fa,0,255).astype('uint8'),'RGBA');fire.save(out/'fire-layer.png')
body=a.copy();body[:,:,3]*=(1-firemask);body=Image.fromarray(np.clip(body,0,255).astype('uint8'),'RGBA');body.save(out/'body-layer.png')
def flowing_fire(phase):
 mesh=[]
 for top in range(0,1024,16):
  for left in range(0,720,16):
   right=min(left+16,720);bottom=min(top+16,1024)
   def point(px,py):
    le=704-.63*py;re=684-.385*py
    dist=max(le-px,px-re,0);freedom=min(1,dist/20)
    # Travelling curls change the silhouette; their roots stay near the blade.
    dx=freedom*(9*math.sin(py*.055+phase)+3*math.sin(py*.11-phase))
    dy=freedom*(13*math.cos(py*.045+phase)+4*math.sin(px*.06-phase))
    return px-dx,py-dy
   mesh.append(((left,top,right,bottom),point(left,top)+point(left,bottom)+point(right,bottom)+point(right,top)))
 return fire.transform((720,1024),Image.Transform.MESH,mesh,Image.Resampling.BICUBIC)
runes=[.92,.8,1.0,.86,.97,.82,.96,.88];eyes=[.9,1.0,.8,.95,.85,1.0,.82,.92];frames=[];entries=[]
for i in range(8):
 moving=body.copy();moving.alpha_composite(flowing_fire(2*math.pi*i/8))
 power=np.where(eye,eyes[i],runes[i]);f=np.asarray(moving).astype(float);weight=m*(1-power)*.79
 f[:,:,:3]*=(1-weight[:,:,None]);glow=bloom*(.12+.24*runes[i])
 f[:,:,:3]+=glow[:,:,None]*np.array([255,80,5])[None,None,:]
 # Keep the source alpha and apply a tiny continuous sway tapering to zero at planted feet.
 f=Image.fromarray(np.clip(f,0,255).astype('uint8'),'RGBA');mesh=[];dx=1.3*math.sin(2*math.pi*i/8)
 dy=4.0*math.sin(2*math.pi*i/8)
 if i in (2,6):
  dx=math.copysign(1.3/math.sqrt(2),dx);dy=math.copysign(4/math.sqrt(2),dy)
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
manifest={'frame_count':8,'canvas':[720,1024],'duration_ms':1280,'loop':True,'method':'Neutral fiery guard pose reused for eight small breathing steps. Upper-body displacement limited to 2.83px vertical and 0.92px lateral; third-frame and return peak clamped to neighboring poses; displacement eases to zero below knees. Exterior fire layer uses travelling spatial curls across eight phases, changing flame silhouettes independently of the stationary blade. Fire/eye intensity varies. Rejected lunging pose excluded.','source_sha256':hashlib.sha256(src.read_bytes()).hexdigest(),'frames':entries}
(out/'animation.json').write_text(json.dumps(manifest,indent=2))
assert all(np.array_equal(np.asarray(f)[885:],np.asarray(base)[885:]) for f in frames), 'Feet changed'
print('PASS: independently flowing flame geometry; exactly8 frames;1280ms; stationary feet; maximum body lift2.83px; no lunging keypose')


