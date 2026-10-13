from PIL import Image,ImageFilter,ImageChops,ImageDraw
from collections import deque
from pathlib import Path
import json,hashlib,shutil
W=Path('C:/Users/Wil/Documents/Codex/2026-10-09/sp-2'); out=W/'outputs/dread-vanguard-states-r1'; gen=Path('C:/Users/Wil/.codex/generated_images/01a12879-1103-70f1-a295-d4a28af7e6a2'); size=(1200,1100)
files={'spawn':'exec-02d09f7a-02de-4d45-84f2-aead79f7e365.png','die':'exec-8898c5ad-0f82-4381-812c-a641203849fe.png'}
anchors={'spawn':[(337,604),(862,594),(337,1215),(924,1220)],'die':[(378,652),(997,618),(356,1152),(958,1207)]}
for state,fn in files.items():
 d=out/state; shutil.copy2(gen/fn,d/'source-sheet.png'); im=Image.open(gen/fn).convert('RGBA'); a=im.getchannel('A'); pix=a.load(); w,h=im.size; seen=set(); groups=[[] for _ in range(4)]
 for y in range(h):
  for x in range(w):
   if pix[x,y]<50 or (x,y) in seen:continue
   q=deque([(x,y)]); seen.add((x,y)); pts=[]
   while q:
    xx,yy=q.popleft();pts.append((xx,yy))
    for nx,ny in [(xx-1,yy),(xx+1,yy),(xx,yy-1),(xx,yy+1)]:
     if 0<=nx<w and 0<=ny<h and (nx,ny) not in seen and pix[nx,ny]>=50:seen.add((nx,ny));q.append((nx,ny))
   if len(pts)>1000:
    mx=sum(p[0] for p in pts)/len(pts);my=sum(p[1] for p in pts)/len(pts); group=(2 if my>680 else 0)+(1 if mx>680 else 0);groups[group].extend(pts)
 frames=[]
 for i,pts in enumerate(groups):
  mask=Image.new('L',im.size);mp=mask.load()
  for p in pts:mp[p]=255
  mask=mask.filter(ImageFilter.MaxFilter(5)); layer=im.copy();layer.putalpha(ImageChops.multiply(a,mask)); box=layer.getbbox();crop=layer.crop(box); scale=1.5; crop=crop.resize((round(crop.width*scale),round(crop.height*scale)),Image.Resampling.LANCZOS); ax,ay=anchors[state][i]; x=600+round((box[0]-ax)*scale);y=1020+round((box[1]-ay)*scale)
  assert x>=0 and y>=0 and x+crop.width<=1200 and y+crop.height<=1100,(state,i,(x,y),crop.size)
  fr=Image.new('RGBA',size);fr.alpha_composite(crop,(x,y));frames.append(fr)
 idle=Image.new('RGBA',size);idle.alpha_composite(Image.open(W/'outputs/dread-vanguard-idle-r5/frames/frame-00.png').convert('RGBA'),(240,40))
 if state=='spawn':frames.append(idle);times=[180,200,180,160,160]
 else: frames.insert(0,idle);times=[100,180,220,220,700]
 for i,fr in enumerate(frames):fr.save(d/f'frame-{i:02}.png')
 previews=[]
 for fr in frames:
  bg=Image.new('RGBA',size,(24,26,33,255));bg.alpha_composite(fr);previews.append(bg.convert('RGB').resize((600,550),Image.Resampling.LANCZOS))
 previews[0].save(d/'animation.gif',save_all=True,append_images=previews[1:],duration=times,disposal=2,optimize=False)
 board=Image.new('RGB',(1500,550),(24,26,33));draw=ImageDraw.Draw(board)
 for i,fr in enumerate(previews):board.paste(fr.resize((300,275)),(i*300,0));draw.text((i*300+10,285),f'{state} {i+1} / {times[i]} ms',fill='white')
 board=board.crop((0,0,1500,320));board.save(d/'contact-sheet.png')
 meta={'state':state,'canvas':list(size),'anchor':[600,1020],'duration':sum(times),'loop':False,'impact':None,'terminal_hold':state=='die','frames':[{'file':f'frame-{i:02}.png','time':sum(times[:i]),'duration_ms':t} for i,t in enumerate(times)],'method':'Four authored whole-character poses, constant 1.5 source scale registered to ground; approved idle transition. No per-frame automatic fit.','source_sha256':hashlib.sha256((d/'source-sheet.png').read_bytes()).hexdigest(),'master':'../dread-vanguard-idle-r5/battle-stance.png','tool':'built-in image_gen'}
 (d/'animation.json').write_text(json.dumps(meta,indent=2));print(state,len(frames),sum(times),'ms', [f.getbbox() for f in frames])
