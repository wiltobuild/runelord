"""Pack whole connected sprite islands; never assume generated poses fit equal grid cells.
Raster repair for wounded pose is authored separately by image_gen, not this packer.
"""
from PIL import Image, ImageFilter
from pathlib import Path
import json,hashlib,shutil
ROOT=Path(__file__).resolve().parents[2]
old=ROOT/'assets/animations/fire-demo-r1/coalhorn-ram'
out=ROOT/'assets/animations/fire-demo-r2/coalhorn-ram'
(out/'frames').mkdir(parents=True,exist_ok=True)
im=Image.open(old/'poses.png').convert('RGBA'); w,h=im.size; alpha=im.getchannel('A').tobytes();seen=bytearray(w*h);groups=[]
for p,a in enumerate(alpha):
 if a<=16 or seen[p]:continue
 queue=[p];seen[p]=1
 for v in queue:
  x,y=v%w,v//w
  for z in ([v-1] if x else [])+([v+1] if x<w-1 else [])+([v-w] if y else [])+([v+w] if y<h-1 else []):
   if not seen[z] and alpha[z]>16:seen[z]=1;queue.append(z)
 if len(queue)>10000:groups.append(queue)
assert len(groups)==12, len(groups)
groups.sort(key=lambda g:(round((min(v//w for v in g))/362),min(v%w for v in g)))
frames=[]; bounds=[]
for i,g in enumerate(groups):
 mask=bytearray(w*h)
 for v in g:mask[v]=255
 # Preserve anti-aliased edges around each identified island, excluding neighbours.
 mask=Image.frombytes('L',(w,h),bytes(mask)).filter(ImageFilter.MaxFilter(3))
 from PIL import ImageChops
 sprite=im.copy();sprite.putalpha(ImageChops.multiply(im.getchannel('A'),mask));box=sprite.getbbox();sprite=sprite.crop(box)
 if i==9 and (out/'wounded-repair.png').exists():
  sprite=Image.open(out/'wounded-repair.png').convert('RGBA');sprite=sprite.crop(sprite.getchannel('A').point(lambda a:255 if a>16 else 0).getbbox());sprite.thumbnail((334,259),Image.Resampling.LANCZOS)
 canvas=Image.new('RGBA',(448,448));canvas.alpha_composite(sprite,((448-sprite.width)//2,414-sprite.height));canvas.save(out/f'frames/{i:02}.png');frames.append(canvas);bounds.append(canvas.getbbox())
manifest=json.loads((old/'manifest.json').read_text());manifest['source']={'path':str((old/'poses.png').relative_to(ROOT)),'sha256':hashlib.sha256((old/'poses.png').read_bytes()).hexdigest()};manifest['frameBounds']=bounds
manifest['repair']={'method':'Connected-island sprite extraction with preserved alpha; wounded frame09 image_gen repair','authorization':'User requested detached tail/hoof and missing collar gems fixed. 2026-10-03','approval':'Pending approval; user authorized integration','sourceRevision':'fire-demo-r1'}
manifest['repair']['woundedSource']={'path':str((out/'wounded-repair.png').relative_to(ROOT)), 'sha256':hashlib.sha256((out/'wounded-repair.png').read_bytes()).hexdigest()} if (out/'wounded-repair.png').exists() else None
manifest['limitations']=['12 authored stepped poses; no interpolated inbetweens.']
(out/'manifest.json').write_text(json.dumps(manifest,indent=2))
review=Image.new('RGBA',(448*4,448*3),'#29232b')
for i,f in enumerate(frames):review.alpha_composite(f,(i%4*448,i//4*448))
review.convert('RGB').save(out/'review.png')
preview=[];times=[]
for state in manifest['states'].values():
 for f in state['frames']:
  bg=Image.new('RGBA',(448,448),'#29232b');bg.alpha_composite(frames[int(Path(f['file']).stem)]);preview.append(bg.convert('RGB'));times.append(f['durationMs'])
preview[0].save(out/'preview.gif',save_all=True,append_images=preview[1:],duration=times,loop=0,disposal=2)
print('Packed 12 complete sprites',out)
