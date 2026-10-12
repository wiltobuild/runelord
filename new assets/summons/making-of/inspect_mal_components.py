from PIL import Image
from collections import deque
import numpy as np
im=Image.open('outputs/maledictor-states-r1/action-source.png');boxes=[(0,0,349,537),(350,0,735,537),(735,0,1024,537),(0,538,380,1013),(380,538,717,1013),(731,538,1024,1013),(0,1000,342,1536),(366,1014,628,1536),(630,1190,1024,1536)]
for k,box in enumerate(boxes):
 a=np.array(im.crop(box).getchannel('A'));h,w=a.shape;seen=np.zeros_like(a,dtype=bool);comps=[]
 for yy,xx in zip(*np.where(a>16)):
  if seen[yy,xx]:continue
  q=[(int(xx),int(yy))];seen[yy,xx]=True;pts=[]
  while q:
   x,y=q.pop();pts.append((x,y))
   for nx,ny in [(x-1,y),(x+1,y),(x,y-1),(x,y+1)]:
    if 0<=nx<w and 0<=ny<h and not seen[ny,nx] and a[ny,nx]>16:seen[ny,nx]=True;q.append((nx,ny))
  if len(pts)>20:comps.append((len(pts),min(x for x,y in pts),min(y for x,y in pts),max(x for x,y in pts),max(y for x,y in pts)))
 print(k,sorted(comps,reverse=True)[:10])
