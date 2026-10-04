"""Technical packing of imagegen-authored poses; no painted/generated anatomy."""
from PIL import Image, ImageDraw
from pathlib import Path
import json, hashlib
ROOT=Path(__file__).resolve().parents[2]
OUT=ROOT/'assets/heroes/animations/runesmith/elite-select-idle-r1'
SRC=ROOT/'assets/characters/runesmith-storm-crown/approved-master.png'
def sha(p): return hashlib.sha256(p.read_bytes()).hexdigest()
def write(p,x): p.write_text(json.dumps(x,indent=2)+'\n',encoding='utf8')
im=Image.open(OUT/'source/idle-authored-sheet.png').convert('RGBA')
frames=[]
entries=[]
for i in range(8):
    x0=round((i%4)*im.width/4); x1=round((i%4+1)*im.width/4)
    y0=round((i//4)*im.height/2); y1=round((i//4+1)*im.height/2)
    cell=im.crop((x0,y0,x1,y1))
    frame=Image.new('RGBA',(480,480))
    frame.alpha_composite(cell,(18,18))
    path=OUT/f'frames/idle-{i:03}.png';frame.save(path)
    frames.append(frame)
    entries.append(dict(hero='runesmith',form='storm-crown',state='select_idle',frame=i,time_ms=i*220,file=str(path.relative_to(OUT)).replace('\\','/'),sha256=sha(path),authored_cell=[x0,y0,x1,y1]))
write(OUT/'frames/index.json',entries)
sequence=list(range(8))+list(range(6,0,-1))
atlas=Image.new('RGBA',(480*len(sequence),480))
for step,i in enumerate(sequence): atlas.alpha_composite(frames[i],(step*480,0))
atlas.save(OUT/'idle-atlas.png')
contact=Image.new('RGB',(480*4,510*2),'#202632'); d=ImageDraw.Draw(contact)
for i,f in enumerate(frames):
    x=i%4*480;y=i//4*510
    contact.paste(f,(x,y),f); d.text((x+15,y+480),f'Runesmith / idle-{i:03} / {i*220}ms',fill='white')
contact.save(OUT/'contact-sheet.png')
for bg,name in [('#171d29','dark'),('#e6e1d8','light')]:
    preview=[]
    for i in sequence:
        canvas=Image.new('RGB',(480,512),bg);canvas.paste(frames[i],(0,0),frames[i])
        ImageDraw.Draw(canvas).text((20,485),'STORM CROWN / SELECT IDLE',fill='#d79d43')
        preview.append(canvas)
    preview[0].save(OUT/f'idle-{name}.gif',save_all=True,append_images=preview[1:],duration=220,loop=0,disposal=2)
    preview[0].save(OUT/f'idle-{name}.webp',save_all=True,append_images=preview[1:],duration=220,loop=0,lossless=True)
small=[]
for i in sequence:
    canvas=Image.new('RGB',(240,140),'#171d29');ImageDraw.Draw(canvas).rectangle((120,0,240,140),fill='#e6e1d8')
    f=frames[i].resize((106,106),Image.Resampling.LANCZOS)
    canvas.paste(f,(7,12),f);canvas.paste(f,(127,12),f);small.append(canvas)
small[0].save(OUT/'idle-96px.gif',save_all=True,append_images=small[1:],duration=220,loop=0,disposal=2)
write(OUT/'manifest.json',dict(hero='runesmith',revision='elite-select-idle-r1',status='review_pending',approved_source=str(SRC.relative_to(ROOT)).replace('\\','/'),approved_source_sha256=sha(SRC),method='reference-conditioned whole-character raster frames',required_states=['select_idle'],required_forms=['storm-crown'],geometry=dict(width=480,height=480,ground_y=454,root=[240,454],scale='one common source scale, no per-frame scale or recenter'),assets=dict(atlas='idle-atlas.png',frame_index='frames/index.json',contact_sheet='contact-sheet.png'),states=dict(select_idle=dict(loop=True,duration_ms=3080,frame_duration_ms=220,authored_pose_count=8,sequence=sequence,events=[])),compatibility='horizontal 14-cell RGBA PNG atlas; CSS steps(14) at 3080ms',effects='Coil and hammer glow baked in authored frames. No separate effects-off track available.',limitations=['8 authored poses sampled at 220ms, not 60fps interpolated animation','Independent visual review pending','Baked effects prevent separate VFX-off review']))
write(OUT/'completion.json',dict(status='review_pending',states={'storm-crown/select_idle':{'status':'review_pending','manifest':'manifest.json','review':None}}))
write(OUT/'technical-check.json',dict(frame_count=len(entries),unique_hashes=len(set(e['sha256'] for e in entries)),dimensions=[480,480],alpha=True,boundary_clear=all(f.getchannel('A').crop((0,0,480,1)).getbbox() is None and f.getchannel('A').crop((0,479,480,480)).getbbox() is None and f.getchannel('A').crop((0,0,1,480)).getbbox() is None and f.getchannel('A').crop((479,0,480,480)).getbbox() is None for f in frames),loop_sequence=sequence,loop_duration_ms=3080))
print(json.dumps({'out':str(OUT),'frames':len(frames),'sequence':sequence,'duration_ms':3080}))
