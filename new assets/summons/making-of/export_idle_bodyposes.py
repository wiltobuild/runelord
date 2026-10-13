from PIL import Image, ImageDraw, ImageFilter, ImageChops
from pathlib import Path
from collections import deque
import json,zipfile,hashlib
out=Path(r'C:/Users/Wil/Documents/Codex/2026-10-09/sp-2/outputs/imp-idle-8-r4');(out/'frames').mkdir(parents=True,exist_ok=True)
body=Image.open(r'C:/Users/Wil/.codex/generated_images/01a11ef8-d768-7f21-86bf-77a410275895/exec-a2f84ce7-5beb-49f2-84b0-7625c7fc126b.png').convert('RGBA')
wings=Image.open(r'C:/Users/Wil/.codex/generated_images/01a11ef8-d768-7f21-86bf-77a410275895/exec-dfc90f9d-28b1-4960-83be-79a9fec60f65.png').convert('RGBA')
body.save(out/'body-source.png');wings.save(out/'wings-source.png')
print('sources',body.size,wings.size)
# Constant body scale/translation, identical RGBA pixels on all eight frames.
body=body.resize((round(body.width*.32),round(body.height*.32)),Image.Resampling.LANCZOS)
fixed=Image.new('RGBA',(560,520));fixed.alpha_composite(body,(92,89));fixed.save(out/'body-layer.png')
roots=[(292,282),(725,282),(1148,282),(1580,280),(243,696),(700,704),(1150,704),(1595,704)]
poses=Image.open(r'C:/Users/Wil/.codex/generated_images/01a11ef8-d768-7f21-86bf-77a410275895/exec-17b5f76f-3ba3-4af8-95ca-50e60378da4c.png').convert('RGBA')
poses.save(out/'body-poses-source.png')
pw,ph=poses.size
print('pose sheet',poses.size)
belts=[(282,391),(840,393),(286,1017),(839,1013)]
body_layers=[]
for j,(bx,by) in enumerate(belts):
 pc,pr=j%2,j//2
 bounds=(round(pc*pw/2),round(pr*ph/2),round((pc+1)*pw/2),round((pr+1)*ph/2))
 pose=poses.crop(bounds)
 scale=.53
 pose=pose.resize((round(pose.width*scale),round(pose.height*scale)),Image.Resampling.LANCZOS)
 layer=Image.new('RGBA',(560,520))
 layer.alpha_composite(pose,(round(300-(bx-bounds[0])*scale),round(332-(by-bounds[1])*scale)))
 layer.save(out/f'body-pose-{j:02d}.png');body_layers.append(layer)
pose_order=[0,1,2,3,3,2,1,0]
frames=[]; entries=[]
for i,(rx,ry) in enumerate(roots):
 c,r=i%4,i//4;w,h=wings.size
 box=(max(0,round(c*w/4)-18),max(0,round(r*h/2)-18),min(w,round((c+1)*w/4)+18),min(h,round((r+1)*h/2)+18))
 if i==2:box=(910,box[1],box[2],box[3])
 tile=wings.crop(box);a=tile.getchannel('A');px=a.load();tw,th=tile.size
 sx,sy=rx-box[0],ry-box[1]
 # Find closest nontransparent pixel to selected wing-pair root.
 candidates=[(dx*dx+dy*dy,sx+dx,sy+dy) for dx in range(-25,26) for dy in range(-25,26) if 0<=sx+dx<tw and 0<=sy+dy<th and px[sx+dx,sy+dy]>32]
 _,sx,sy=min(candidates)
 seen=set();q=deque((x,y) for x in range(max(0,rx-box[0]-45),min(tw,rx-box[0]+46),3) for y in range(max(0,ry-box[1]-60),min(th,ry-box[1]+6),3) if px[x,y]>32)
 while q:
  x,y=q.popleft()
  if (x,y) in seen or x<0 or y<0 or x>=tw or y>=th or px[x,y]<16:continue
  seen.add((x,y));q.extend(((x-1,y),(x+1,y),(x,y-1),(x,y+1),(x-1,y-1),(x+1,y-1),(x-1,y+1),(x+1,y+1)))
 mask=Image.new('L',tile.size);mp=mask.load()
 for x,y in seen:mp[x,y]=255
 tile.putalpha(ImageChops.multiply(a,mask.filter(ImageFilter.MaxFilter(3))))
 frame=Image.new('RGBA',(560,520));frame.alpha_composite(tile,(302-(rx-box[0]),267-(ry-box[1])));frame.alpha_composite(body_layers[pose_order[i]])
 frame.save(out/'frames'/f'frame-{i:02d}.png');frames.append(frame)
 entries.append({'file':f'frames/frame-{i:02d}.png','duration_ms':120,'wing_root_source':[rx,ry],'wing_root_destination':[302,267],'body_pose':pose_order[i],'body_scale':.53})
frames[0].save(out/'imp-idle.webp',save_all=True,append_images=frames[1:],duration=120,loop=0,lossless=True)
previews=[]
for f in frames:
 bg=Image.new('RGB',f.size,(27,29,36));bg.paste(f,mask=f.getchannel('A'));previews.append(bg)
contact=Image.new('RGB',(2240,1040))
for i,f in enumerate(previews):contact.paste(f,((i%4)*560,(i//4)*520))
pal=contact.quantize(colors=255);gifs=[f.quantize(palette=pal,dither=Image.Dither.NONE) for f in previews]
gifs[0].save(out/'imp-idle.gif',save_all=True,append_images=gifs[1:],duration=120,loop=0,disposal=2,optimize=False)
ImageDraw.Draw(contact).text((12,12),'Four body poses - constant scale',fill='white');contact.save(out/'contact-sheet.png')
manifest={'frame_count':8,'canvas':[560,520],'duration_ms':960,'loop':True,'method':'Four authored body poses registered at constant scale and waist anchor, combined with the unchanged eight wing poses. No cyclic body scaling.','registration':{'body_scale':.53,'waist_anchor':[300,332],'pose_order':pose_order},'frames':entries}
(out/'animation.json').write_text(json.dumps(manifest,indent=2))
with zipfile.ZipFile(out.parent/'imp-idle-8-r4.zip','w',zipfile.ZIP_DEFLATED) as z:
 for p in out.rglob('*'):
  if p.is_file():z.write(p,p.relative_to(out))
print('8 frames; four body poses; constant body scale')



