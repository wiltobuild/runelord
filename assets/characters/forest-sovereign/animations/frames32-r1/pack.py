from PIL import Image, ImageDraw
from pathlib import Path
import json, shutil, hashlib
import numpy as np

BASE=Path(r'C:/Users/wilsh/Projects/runelord/assets/characters/forest-sovereign/animations/frames32-r1')
ROOT=Path(r'C:/Users/wilsh/Projects/runelord/assets/characters/sovereign-root/animations/r1')
VFX=BASE/'vfx'
OUT=Path(r'C:/Users/wilsh/Documents/Codex/2026-10-05/giv/outputs/forest-sovereign-animation')
SPECS=json.loads(Path('work/forest-animation/sources.json').read_text())
W,H,G=640,560,510

def hashfile(p): return hashlib.sha256(p.read_bytes()).hexdigest()
def boundaries(im,cols,rows):
    a=np.array(im)[:,:,3]>40; hh,ww=a.shape
    # Locate sheet gutters near expected row/column divisions, preserving full source poses.
    ys=[0]
    for r in range(1,rows):
        nominal=round(hh*r/rows); radius=round(hh/rows*.2)
        scores=a.sum(axis=1); lo=max(ys[-1]+1,nominal-radius); hi=min(hh,nominal+radius)
        candidates=np.where(scores[lo:hi]==scores[lo:hi].min())[0]+lo
        ys.append(int(min(candidates,key=lambda y:abs(y-nominal))))
    ys.append(hh)
    boxes=[]
    for r in range(rows):
        # Each row gets separate column gutters because action poses are wider than idle.
        scores=a[ys[r]:ys[r+1]].sum(axis=0); xs=[0]
        for c in range(1,cols):
            nominal=round(ww*c/cols); rad=round(ww/cols*.10)
            lo=max(xs[-1]+1,nominal-rad); hi=min(ww,nominal+rad)
            candidates=np.where(scores[lo:hi]==scores[lo:hi].min())[0]+lo
            xs.append(int(min(candidates,key=lambda x:abs(x-nominal))))
        xs.append(ww)
        boxes.extend([(xs[c],ys[r],xs[c+1],ys[r+1]) for c in range(cols)])
    return boxes

def register(crops,scale,anchor='feet'):
    result=[]; provenance=[]
    for crop in crops:
        aa=np.array(crop)[:,:,3]; yy,xx=np.where(aa>40)
        b=(int(xx.min()),int(yy.min()),int(xx.max()+1),int(yy.max()+1))
        # Feet/base registration uses bottom contact span, not changing arm width.
        by,bx=np.where((aa>80)&(np.indices(aa.shape)[0]>=b[3]-round((b[3]-b[1])*.14)))
        ax=float((bx.min()+bx.max())/2) if len(bx) else (b[0]+b[2])/2
        cr=crop.crop(b)
        size=(round(cr.width*scale),round(cr.height*scale)); cr=cr.resize(size,Image.Resampling.LANCZOS)
        ox=round(W/2-(ax-b[0])*scale); oy=G-size[1]
        f=Image.new('RGBA',(W,H));f.alpha_composite(cr,(ox,oy)); result.append(f)
        provenance.append({'trim':b,'scale':scale,'offset':[ox,oy],'sourceAnchor':[ax,b[3]],'exportAnchor':[W//2,G]})
    return result,provenance

def preview_frame(f,title):
    panel=Image.new('RGB',(W*2,H+40),'#202a29'); light=Image.new('RGB',(W,H),'#e8e0cf')
    panel.paste(f,(0,40),f);light.paste(f,(0,0),f);panel.paste(light,(W,40))
    d=ImageDraw.Draw(panel);d.text((16,12),title,fill='white')
    small=f.resize((110,round(H*110/W)),Image.Resampling.LANCZOS)
    panel.paste(small,(W-115,45),small)
    return panel

def package(dest,ident,states,provenance):
    dest.mkdir(parents=True,exist_ok=True);(dest/'frames').mkdir(exist_ok=True)
    m={'schema':1,'id':ident,'method':'reference-conditioned whole-character frames','canvas':[W,H],'anchor':[W//2,G],'facing':'left','coordinateSystem':'top-left pixels; x right, y down','states':{},'sourceRects':provenance,'limitations':['Generated non-idle pose variation accepted by user; original proof preserved.','Whole-frame source art, no separated rig.','Game integration not requested.'],'review':'pending playback and independent idle review'}
    combined=[];combined_ms=[];contact=Image.new('RGB',(4*240,len(states)*230),'#26302b')
    for ri,(st,frames) in enumerate(states.items()):
        loop=st in ['idle','wounded_idle']; n=len(frames)
        seq=list(range(n))+list(range(n-2,0,-1)) if loop else list(range(n))
        ms=[210 if st=='idle' else 260]*len(seq) if loop else [100]*len(seq)
        if ident=='sovereign-root' and st=='idle': seq=list(range(n)); ms=[320]*n
        if st=='attack': ms=[110,130,150,70,80,100,120,170][:n] if n==8 else [160,100,100,180]
        if st=='cast': ms=[150,200,180,180]
        if st=='hit': ms=[50,90,100,140]
        if st=='die': ms=[180]*(len(seq)-1)+[1100]
        files=[];atlas=Image.new('RGBA',(W*n,H));gifs=[]
        for i,f in enumerate(frames):
            path=dest/'frames'/f'{st}-{i:02d}.png';f.save(path);files.append(path.relative_to(dest).as_posix());atlas.alpha_composite(f,(i*W,0))
        atlas.save(dest/f'{st}-atlas.png')
        for j,i in enumerate(seq):
            panel=preview_frame(frames[i],f'{ident} / {st} / pose {i+1}');gifs.append(panel);combined.append(panel);combined_ms.append(ms[j])
        kwargs={'loop':0} if loop else {}
        gifs[0].save(dest/f'{st}.gif',save_all=True,append_images=gifs[1:],duration=ms,disposal=2,**kwargs)
        m['states'][st]={'files':files,'sequence':seq,'durationsMs':ms,'loop':loop,'holdLastFrame':st=='die','nextState':st if loop else ('terminal' if st=='die' else ('hidden' if ident.endswith('-vfx') else 'idle')),'atlas':f'{st}-atlas.png','frameRects':[[i*W,0,W,H] for i in range(n)],'events':([{'name':'impact','timeMs':sum(ms[:4 if n==8 else 1])}] if st=='attack' else [{'name':'release','timeMs':350}] if st=='cast' else [])}
        for c,i in enumerate(np.linspace(0,n-1,4).astype(int)):
            thumb=frames[i].resize((240,210),Image.Resampling.LANCZOS);contact.paste(thumb,(c*240,ri*230+20),thumb)
        ImageDraw.Draw(contact).text((8,ri*230+3),st,fill='white')
    contact.save(dest/'contact-sheet.png')
    combined[0].save(dest/'animation-review.gif',save_all=True,append_images=combined[1:],duration=combined_ms,disposal=2,loop=0)
    m['frameCount']=sum(len(x) for x in states.values());m['hashes']={p.relative_to(dest).as_posix():hashfile(p) for p in (dest/'frames').glob('*.png')}
    (dest/'animation.json').write_text(json.dumps(m,indent=2))
    return m

states={};prov={};all_sources=[]
for s in SPECS:
    name=s['name']; dest=ROOT if name=='root' else VFX if name=='vfx' else BASE
    (dest/'source').mkdir(parents=True,exist_ok=True);src=dest/'source'/f'{name}-sheet.png';shutil.copy2(s['source'],src)
    im=Image.open(src).convert('RGBA');boxes=boundaries(im,s['cols'],s['rows']);crops=[im.crop(b) for b in boxes]
    solid=crops[0].getchannel('A').point(lambda x:255 if x>40 else 0).getbbox()
    scale=(300 if name=='root' else 420)/(solid[3]-solid[1]) if name!='vfx' else .95
    fs,pr=register(crops,scale)
    for q,b in zip(pr,boxes):q.update({'sheet':str(src),'cell':b,'sha256':hashfile(src)})
    all_sources.append({**s,'storedSource':str(src),'dimensions':list(im.size),'sha256':hashfile(src)})
    if name=='root':
        root_states={st:fs[r*4:r*4+4] for r,st in enumerate(['idle','attack','die'])}
        package(ROOT,'sovereign-root',root_states,{st:pr[r*4:r*4+4] for r,st in enumerate(root_states)})
    elif name=='vfx':
        package(VFX,'forest-sovereign-vfx',{st:fs[r*4:r*4+4] for r,st in enumerate(['rootwake','verdant_cyclone','crownfall'])},{st:pr[r*4:r*4+4] for r,st in enumerate(['rootwake','verdant_cyclone','crownfall'])})
    else:states[name]=fs;prov[name]=pr

# Keep the exact previously accepted attack contact and hit recoil poses in the final set.
for st,idx in [('attack',4),('hit',1)]:
    im=Image.open(BASE/f'proof-{st}.png').convert('RGBA')
    master=Image.open(BASE/'proof-idle.png').getchannel('A').point(lambda x:255 if x>40 else 0).getbbox()
    fs,pr=register([im],420/(master[3]-master[1])); states[st][idx]=fs[0];prov[st][idx]={**pr[0],'source':f'proof-{st}.png','preservedAcceptedProof':True}
package(BASE,'forest-sovereign',{st:states[st] for st in ['idle','attack','hit','wounded_idle','cast','die']},prov)
(BASE/'generation-prompts.json').write_text(json.dumps(all_sources,indent=2))
OUT.mkdir(parents=True,exist_ok=True)
for name,path in [('sovereign',BASE),('root',ROOT)]:
    target=OUT/name;target.mkdir(exist_ok=True)
    for f in ['animation.json','contact-sheet.png','animation-review.gif','idle.gif','die.gif']:
        shutil.copy2(path/f,target/f)
    shutil.copytree(path/'frames',target/'frames',dirs_exist_ok=True)
shutil.copytree(VFX,OUT/'vfx',dirs_exist_ok=True)
print(json.dumps({'bossFrames':len(list((BASE/'frames').glob('*.png'))),'rootFrames':len(list((ROOT/'frames').glob('*.png'))),'vfxFrames':len(list((VFX/'frames').glob('*.png'))),'output':str(OUT)}))


