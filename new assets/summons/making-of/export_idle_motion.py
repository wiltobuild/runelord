from PIL import Image, ImageDraw
from pathlib import Path
import math,json,hashlib,zipfile
root=Path(r'C:/Users/Wil/Documents/Codex/2026-10-09/sp-2/outputs')
base=root/'imp-idle-8-r2'; out=root/'imp-idle-8-r3';(out/'frames').mkdir(parents=True,exist_ok=True)
def hashes():return {str(p.relative_to(base)):hashlib.sha256(p.read_bytes()).hexdigest() for p in base.rglob('*') if p.is_file()}
before=hashes(); frames=[];originals=[]; entries=[]
for i in range(8):
 src=base/'frames'/f'frame-{i:02d}.png';im=Image.open(src).convert('RGBA');originals.append(im)
 phase=2*math.pi*i/8
 angle=0.7*math.sin(phase)
 dx=1.5*math.sin(phase)
 dy=5*math.cos(phase)
 # Rigid transform only: no scale, deformation, or redrawing. Wings move with their roots.
 f=im.rotate(angle,Image.Resampling.BICUBIC,center=(302,267),translate=(dx,dy),expand=False)
 b=f.getbbox();assert b and b[0]>0 and b[1]>0 and b[2]<560 and b[3]<520,b
 f.save(out/'frames'/f'frame-{i:02d}.png');frames.append(f)
 entries.append({'file':f'frames/frame-{i:02d}.png','duration_ms':120,'rotation_degrees':angle,'translation_px':[dx,dy],'scale':1.0})
frames[0].save(out/'imp-idle.webp',save_all=True,append_images=frames[1:],duration=120,loop=0,lossless=True)
def dark(f):
 bg=Image.new('RGB',f.size,(27,29,36));bg.paste(f,mask=f.getchannel('A'));return bg
def gif(images,path):
 atlas=Image.new('RGB',(images[0].width*4,images[0].height*2))
 for i,f in enumerate(images):atlas.paste(f,((i%4)*f.width,(i//4)*f.height))
 palette=atlas.quantize(colors=255)
 seq=[f.quantize(palette=palette,dither=Image.Dither.NONE) for f in images]
 seq[0].save(path,save_all=True,append_images=seq[1:],duration=120,loop=0,disposal=2,optimize=False)
 return atlas
contact=gif([dark(f) for f in frames],out/'imp-idle.gif');contact.save(out/'contact-sheet.png')
comparisons=[]
for old,new in zip(originals,frames):
 pair=Image.new('RGB',(1120,552),(27,29,36));pair.paste(dark(old),(0,32));pair.paste(dark(new),(560,32))
 d=ImageDraw.Draw(pair);d.text((18,10),'R2 - saved wing-only version',fill='white');d.text((578,10),'R3 - subtle bob and sway',fill='white');comparisons.append(pair)
gif(comparisons,out/'comparison.gif')
manifest={'frame_count':8,'canvas':[560,520],'loop':True,'duration_ms':960,'base_revision':'imp-idle-8-r2','method':'Existing wing-only animation plus a rigid 5px vertical bob, 1.5px lateral drift, and 0.7 degree sway. Body is never rescaled or redrawn.','frames':entries,'base_hashes':before}
(out/'animation.json').write_text(json.dumps(manifest,indent=2))
assert before==hashes(),'Baseline changed'
with Image.open(out/'imp-idle.gif') as g:assert g.n_frames==8
with zipfile.ZipFile(root/'imp-idle-8-r3.zip','w',zipfile.ZIP_DEFLATED) as z:
 for p in out.rglob('*'):
  if p.is_file():z.write(p,p.relative_to(out))
print('PASS: eight frames; scale=1; no clipping; baseline hashes unchanged')
