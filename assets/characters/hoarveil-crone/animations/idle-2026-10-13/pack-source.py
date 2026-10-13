from PIL import Image, ImageDraw
from pathlib import Path
import json, hashlib, shutil
import numpy as np
ROOT=Path('C:/Users/wilsh/Projects/runelord')
GEN=Path('C:/Users/wilsh/.codex/generated_images/01a133ac-0771-75f0-a997-885e91955e7b')
inventory=json.loads((ROOT/'work/production/ice-idle-2026-10-13/approved-inventory.json').read_text(encoding='utf-8-sig'))
jobs=[('hoarveil-crone','exec-69823429-3a7e-4a41-ad53-0cbdfcb1fa4e.png',666,599,320,'Hunched breathing with cloak and charm sway'),('avalanche-colossus','exec-cf597347-3303-4634-a8e5-2cd791c8ea25.png',707,579,400,'Heavy chest expansion and stone shoulder settling'),('abomination-rime-hauler','exec-8b92e293-66e1-4f21-b067-ce0f0ac38b04.png',599,687,350,'Heavy breathing with attached bell and hook sway')]
for cid,filename,sx,sy,ms,motion in jobs:
    out=ROOT/f'assets/characters/{cid}/animations/idle-2026-10-13'
    out.mkdir(parents=True,exist_ok=True)
    shutil.copy2(GEN/filename,out/'source-sheet.png')
    sheet=Image.open(out/'source-sheet.png').convert('RGBA'); w,h=sheet.size
    rects=[(0,0,sx,sy),(sx,0,w,sy),(0,sy,sx,h),(sx,sy,w,h)]
    frames=[]; metadata=[]
    for i,rect in enumerate(rects):
        crop=sheet.crop(rect); bbox=crop.getchannel('A').getbbox(); body=crop.crop(bbox)
        frame=Image.new('RGBA',(768,704)); xy=((768-body.width)//2,672-body.height)
        frame.alpha_composite(body,xy)
        opaque=np.array(frame)[:,:,3]>200
        ys,xs=np.where(opaque); bottom=int(ys.max()); contact=int(np.median(xs[ys>=bottom-4]))
        target=500 if cid=='hoarveil-crone' else 340
        correction=(target-contact,672-bottom)
        registered=Image.new('RGBA',frame.size); registered.alpha_composite(frame,correction); frame=registered
        frame.save(out/f'idle-{i:02}.png'); frames.append(frame)
        metadata.append({'file':f'idle-{i:02}.png','sourceRectangle':list(rect),'sourceAlphaBounds':list(bbox),'placement':list(xy),'registrationTranslation':list(correction),'contactAnchor':[target,672],'size':[768,704]})
    atlas=Image.new('RGBA',(1536,1408))
    for i,frame in enumerate(frames): atlas.alpha_composite(frame,((i%2)*768,(i//2)*704))
    atlas.save(out/'atlas.png')
    order=[0,1,2,3,2,1]
    previews=[]
    for idx in order:
        im=Image.new('RGB',(1100,760),'#152537'); d=ImageDraw.Draw(im)
        d.rectangle((550,0,1100,760),fill='#e7edf3')
        d.text((20,15),cid+' / idle / 4 authored poses',fill='white')
        for x in [0,550]:
            big=frames[idx].resize((550,504),Image.Resampling.LANCZOS)
            im.paste(big,(x,55),big)
            small=frames[idx].resize((105,96),Image.Resampling.LANCZOS)
            im.paste(small,(x+215,615),small)
        previews.append(im)
    previews[0].save(out/'review.gif',save_all=True,append_images=previews[1:],duration=ms,loop=0,disposal=2)
    previews[0].save(out/'review.png')
    source=next(x for x in inventory if x['id']==cid)
    manifest={'id':cid,'state':'idle','status':'pending_visual_qa','method':'four generated whole-character poses, six-step forward/reverse playback','motion':motion,'canvas':[768,704],'anchor':[384,672],'coordinateSystem':'pixels top-left, x right y down','frames':metadata,'sequence':order,'frameDurationsMs':[ms]*6,'durationMs':ms*6,'loop':True,'atlas':{'file':'atlas.png','columns':2,'rows':2,'cell':[768,704]},'sourceApproval':source,'generation':'built-in image_gen','limitations':['Idle only; attack, hit, wounded_idle and die not produced.','Generated pose details require visual approval; no game integration performed.','Frame canvas is export padding; no resolution upscaling.'],'preview':'review.gif'}
    (out/'manifest.json').write_text(json.dumps(manifest,indent=2))
    a=np.array(sheet)[:,:,3]
    print(cid, sheet.size, 'split alpha max',int(a[:,sx].max()),int(a[sy,:].max()),'frames',len(frames))
