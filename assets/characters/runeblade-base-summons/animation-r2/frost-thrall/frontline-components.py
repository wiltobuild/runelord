from PIL import Image
from pathlib import Path
import numpy as np,json
B=Path('C:/Users/wilsh/Projects/runelord/assets/characters/runeblade-base-summons/animation-r1')
def components(a):
    labels=np.zeros(a.shape,dtype=np.int32); parent=[0];prev=[]
    def root(n):
        while parent[n]!=n: parent[n]=parent[parent[n]];n=parent[n]
        return n
    for y,row in enumerate(a>12):
        z=np.diff(np.r_[False,row,False].astype(np.int8));starts=np.where(z==1)[0];ends=np.where(z==-1)[0];cur=[]
        for x,e in zip(starts,ends):
            hits=[root(k) for l,r,k in prev if l<=e and r>=x]
            if hits:
                k=min(hits)
                for h in hits:parent[h]=k
            else:k=len(parent);parent.append(k)
            labels[y,x:e]=k;cur.append((x,e,k))
        prev=cur
    lut=np.array([root(i) for i in range(len(parent))]);labels=lut[labels];ids,counts=np.unique(labels,return_counts=True)
    boxes=[]
    for k,c in zip(ids,counts):
        if k and c>200:
            ys,xs=np.where(labels==k);boxes.append({'label':int(k),'count':int(c),'box':[int(xs.min()),int(ys.min()),int(xs.max()+1),int(ys.max()+1)]})
    return labels,boxes
if __name__=='__main__':
 for id in ['frost-thrall','bone-defender']:
    out={}
    for st in ['idle','attack','hit','wounded_idle','cast','die']:
        a=np.array(Image.open(B/id/'source'/f'{st}.png').getchannel('A'));labels,boxes=components(a);out[st]=boxes
    (B/id/'component-audit.json').write_text(json.dumps(out,indent=2));print(id,json.dumps(out))
