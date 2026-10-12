from PIL import Image
from collections import deque
from pathlib import Path
src=Path('C:/Users/Wil/.codex/generated_images/01a12879-1103-70f1-a295-d4a28af7e6a2')
for n in ['exec-02d09f7a-02de-4d45-84f2-aead79f7e365.png','exec-8898c5ad-0f82-4381-812c-a641203849fe.png']:
 im=Image.open(src/n).convert('RGBA'); a=im.getchannel('A'); pix=a.load(); w,h=im.size; seen=set(); comps=[]
 for y in range(h):
  for x in range(w):
   if pix[x,y]<50 or (x,y) in seen: continue
   q=deque([(x,y)]); seen.add((x,y)); pts=[]
   while q:
    xx,yy=q.popleft();pts.append((xx,yy))
    for nx,ny in [(xx-1,yy),(xx+1,yy),(xx,yy-1),(xx,yy+1)]:
     if 0<=nx<w and 0<=ny<h and (nx,ny) not in seen and pix[nx,ny]>=50:seen.add((nx,ny));q.append((nx,ny))
   if len(pts)>1000: comps.append((len(pts),(min(p[0] for p in pts),min(p[1] for p in pts),max(p[0] for p in pts)+1,max(p[1] for p in pts)+1)))
 print(n,im.size,sorted(comps,reverse=True))
