"""Deterministic source-preserving registration and animation preview packing."""
from pathlib import Path
from PIL import Image, ImageDraw
import hashlib,json
ROOT=Path(__file__).parent
names=['neutral','idle-inhale','attack-windup','attack-impact','hit','wounded','die-fall','die-terminal','wounded-exhale','attack-recovery']
frames=[]; records=[]
for i,name in enumerate(names):
    path=ROOT/'source'/f'{name}.png'; im=Image.open(path).convert('RGBA')
    box=im.getchannel('A').point(lambda v:255 if v>127 else 0).getbbox()
    # Preserve native source pixels; common ground root. No tight-fit rescaling.
    anchor=((box[0]+box[2])//2,box[3]); offset=(768-anchor[0],1400-anchor[1])
    out=Image.new('RGBA',(1536,1536));out.alpha_composite(im,offset)
    out.save(ROOT/f'frame-{i:02}.png');frames.append(out)
    records.append(dict(id=i,file=f'frame-{i:02}.png',source=f'source/{name}.png',source_dimensions=list(im.size),source_sha256=hashlib.sha256(path.read_bytes()).hexdigest(),source_anchor=list(anchor),translation=list(offset),visible_bbox=list(out.getchannel('A').point(lambda v:255 if v>127 else 0).getbbox())))
def state(indices,durations,loop=False,**kw):return dict(frames=indices,durations_ms=durations,loop=loop,transition='self' if loop else 'idle',**kw)
states={'idle':state([0,1,0],[700,700,700],True),'act':state([0,2,3,9,0],[80,160,110,100,120],events=[dict(name='impact',at_ms=240)]),'hit':state([0,4,0],[70,130,100]),'wounded_idle':state([5,8,5],[850,1000,450],True),'die':state([5,6,7],[180,220,900],terminal=True),'spawn':state([0,0,1,0],[100,100,150,150],opacity=[0,.35,.75,1],events=[dict(name='arrival',at_ms=350)])}
states['die']['transition']='hold-last'
for name,s in states.items():
    preview=[]
    for j,index in enumerate(s['frames']):
        bg=Image.new('RGB',(1024,1024),'#22252d');pic=frames[index].resize((1024,1024),Image.Resampling.LANCZOS)
        if 'opacity' in s:pic.putalpha(pic.getchannel('A').point(lambda v:round(v*s['opacity'][j])))
        bg.paste(pic,(0,0),pic);ImageDraw.Draw(bg).text((15,15),f'Gorthak HD r2 / {name}',fill='white');preview.append(bg)
    kw={'loop':0} if s['loop'] else {}
    preview[0].save(ROOT/f'{name}.gif',save_all=True,append_images=preview[1:],duration=s['durations_ms'],disposal=2,**kw)
manifest=dict(contract_version=2,character_id='warlock-gorthak',display_name='Gorthak, the Pit Lord',revision='hd-r2',status='Pending approval',format='whole-character RGBA PNG keyframes',base={'file':'source/neutral.png','sha256':records[0]['source_sha256'],'approval_evidence':'60fd264d-616b-4049-b781-ca8acf21506a'},geometry={'canvas_px':[1536,1536],'root_px':[768,1400],'anchor_normalized':[.5,1400/1536],'source_pixels_per_world_unit':1185/1.65,'standing_height_world':1.65,'facing':'right','root_motion':'in-place ground registration, no per-frame scaling'},frames=records,animations=states,aliases={'attack':'act'},limitations=['Ten full-resolution key poses; stepped limited animation, no interpolation.','Idle and wounded each use two authored breathing poses; changes are deliberately held, not smooth interpolation.','Generated proportions and foot placement require visual QA; not claimed frame-perfect.','GIF previews downsample to1024px; transparent1536px runtime frames retain native source pixels.','New revision is pending user approval and is not runtime-integrated.'])
(ROOT/'animation.json').write_text(json.dumps(manifest,indent=2))
sheet=Image.new('RGB',(1600,1200),'#ddd8ce')
for i,im in enumerate(frames):
    thumb=im.resize((400,400),Image.Resampling.LANCZOS);sheet.paste(thumb,((i%4)*400,(i//4)*400),thumb);ImageDraw.Draw(sheet).text(((i%4)*400+10,(i//4)*400+10),names[i],fill='black')
sheet.save(ROOT/'key-poses.jpg')
print(json.dumps({'frames':len(frames),'native_dimensions':[r['source_dimensions'] for r in records],'states':list(states)},indent=2))
