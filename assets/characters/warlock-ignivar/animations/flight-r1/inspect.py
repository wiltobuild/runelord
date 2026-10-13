from pathlib import Path
from PIL import Image
import numpy as np
P=Path(r'C:/Users/wilsh/.codex/generated_images/01a109bc-768f-74d2-aee7-f98820875f9f')
for p in P.glob('*.png'):
 i=Image.open(p).convert('RGBA'); a=np.array(i)
 if i.width>1300: continue
 m=(a[:,:,0]>215)&(a[:,:,1]>110)&(a[:,:,2]<125)&(a[:,:,3]>200)
 m[:int(i.height*.42)]=False;m[int(i.height*.62):]=False
 ys,xs=np.where(m)
 print(p.name,i.size,'bbox',i.getbbox(),'chest',int(np.median(xs)),int(np.median(ys)), 'edge alpha',int(a[:,-1,3].max()))
