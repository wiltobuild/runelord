from PIL import Image, ImageDraw
from pathlib import Path
import json, hashlib, zipfile
from collections import deque
from PIL import ImageFilter, ImageChops
src=Path(r'C:/Users/Wil/.codex/generated_images/01a11ef8-d768-7f21-86bf-77a410275895/exec-3e133a06-006e-4fa8-a4a4-d78310812c39.png')
out=Path(r'C:/Users/Wil/Documents/Codex/2026-10-09/sp-2/outputs/imp-idle-8')
im=Image.open(src).convert('RGBA'); im.save(out/'source-sheet.png')
w,h=im.size
# Belt-center registration measured on the authored sheet; translation only.
anchors=[(255,295),(694,292),(1128,292),(1571,296),(245,735),(686,735),(1127,738),(1576,744)]
bob=[0,-2,-4,-3,0,2,4,2]
frames=[]; entries=[]
for i in range(8):
 c,r=i%4,i//4
 box=(round(c*w/4),round(r*h/2),round((c+1)*w/4),round((r+1)*h/2))
 # Padded extraction recovers tips crossing nominal grid lines.
 box=(max(0,box[0]-24),max(0,box[1]-24),min(w,box[2]+24),min(h,box[3]+24))
 tile=im.crop(box)
 ax,ay=anchors[i]
 alpha=tile.getchannel('A'); px=alpha.load(); tw,th=tile.size
 sx,sy=ax-box[0],ay-box[1]
 seen=set(); queue=deque([(sx,sy)])
 while queue:
  x,y=queue.popleft()
  if (x,y) in seen or x<0 or y<0 or x>=tw or y>=th or px[x,y]<16: continue
  seen.add((x,y))
  queue.extend(((x-1,y),(x+1,y),(x,y-1),(x,y+1),(x-1,y-1),(x+1,y-1),(x-1,y+1),(x+1,y+1)))
 keep=Image.new('L',tile.size); kp=keep.load()
 for x,y in seen: kp[x,y]=255
 keep=keep.filter(ImageFilter.MaxFilter(3))
 tile.putalpha(ImageChops.multiply(alpha,keep))
 dx=300-(ax-box[0]); dy=332+bob[i]-(ay-box[1])
 frame=Image.new('RGBA',(560,520)); frame.alpha_composite(tile,(dx,dy))
 name=f'frame-{i:02d}.png'; frame.save(out/'frames'/name); frames.append(frame)
 entries.append({'file':'frames/'+name,'duration_ms':120,'source_rect':box,'translation':[dx,dy],'alpha_bounds':frame.getbbox()})
frames[0].save(out/'imp-idle.webp',save_all=True,append_images=frames[1:],duration=120,loop=0,lossless=True)
previews=[]
for f in frames:
 bg=Image.new('RGB',f.size,(27,29,36)); bg.paste(f,mask=f.getchannel('A')); previews.append(bg)
palette=Image.new('RGB',(560*4,520*2))
for i,f in enumerate(previews): palette.paste(f,((i%4)*560,(i//4)*520))
pal=palette.quantize(colors=255)
gifs=[f.quantize(palette=pal,dither=Image.Dither.NONE) for f in previews]
gifs[0].save(out/'imp-idle.gif',save_all=True,append_images=gifs[1:],duration=120,loop=0,disposal=2,optimize=False)
contact=palette.copy(); draw=ImageDraw.Draw(contact)
for i in range(8): draw.text(((i%4)*560+12,(i//4)*520+12),f'FRAME {i+1}',fill='white')
contact.save(out/'contact-sheet.png')
manifest={'name':'Imp flying idle','frame_count':8,'canvas':[560,520],'loop':True,'duration_ms':960,'fps':8.333333,'method':'Eight image-generated whole-character wing poses, cropped and registered by translation; no rigging or synthetic in-between frames.','source_sha256':hashlib.sha256(src.read_bytes()).hexdigest(),'frames':entries,'status':'Pending art review'}
(out/'animation.json').write_text(json.dumps(manifest,indent=2))
with Image.open(out/'imp-idle.gif') as gif:
 assert gif.n_frames==8
 assert all(Image.open(out/e['file']).getbbox() is not None for e in entries)
 print(json.dumps({'frame_count':gif.n_frames,'canvas':gif.size,'durations':[gif.seek(i) or gif.info.get('duration') for i in range(gif.n_frames)]}))
with zipfile.ZipFile(out.parent/'imp-idle-8.zip','w',zipfile.ZIP_DEFLATED) as z:
 for p in out.rglob('*'):
  if p.is_file(): z.write(p,p.relative_to(out))

