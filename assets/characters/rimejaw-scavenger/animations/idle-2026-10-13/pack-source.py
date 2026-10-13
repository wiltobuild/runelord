"""Technical packing only. New poses come exclusively from built-in image_gen."""
from pathlib import Path
from PIL import Image, ImageDraw
import numpy as np
import json, shutil, hashlib, sys
ROOT=Path(r'C:/Users/wilsh/Projects/runelord')
def sha(p): return hashlib.sha256(Path(p).read_bytes()).hexdigest()
ident,src,promptfile=sys.argv[1:]
out=ROOT/'assets/characters'/ident/'animations/idle-2026-10-13';out.mkdir(parents=True,exist_ok=True)
shutil.copy2(src,out/'source-sheet.png');shutil.copy2(promptfile,out/'prompt.txt')
im=Image.open(src).convert('RGBA');w,h=im.size;cw=ch=800
sx=615 if ident=='dragon-frost-mammoth' else w//2;sy=h//2
rects=[[0,0,sx,sy],[sx,0,w,sy],[0,sy,sx,h],[sx,sy,w,h]]
if ident=='dragon-rime-antler':rects=[[40,40,620,610],[670,40,1225,610],[40,630,620,1210],[670,630,1225,1210]]
if ident=='rimejaw-scavenger':rects=[[0,100,620,600],[620,100,w,600],[0,690,620,1190],[620,690,w,1190]]
if ident=='cairnfrost-ursine':rects=[[0,45,640,615],[640,45,w,615],[0,630,640,1210],[640,630,w,1210]]
frames=[];records=[]
for i in range(4):
 rect=rects[i];frame=im.crop(rect);a=np.array(frame)[:,:,3];yy,xx=np.where(a>128);bb=[int(xx.min()),int(yy.min()),int(xx.max())+1,int(yy.max())+1]
 assert bb[0]>0 and bb[1]>0 and bb[2]<frame.width and bb[3]<frame.height, (i,bb,'source clipping')
 # Translate whole pose for shared ground. No anatomy editing, scaling or deformation.
 a=np.array(frame)[:,:,3]; yy,xx=np.where(a>200);bottom=int(yy.max());ground=int(ch*.91)
 dy=ground-bottom; footx=int(np.median(xx[yy>=bottom-3]));dx=350-footx
 canvas=Image.new('RGBA',(cw,ch));canvas.alpha_composite(frame,(dx,dy))
 box=canvas.getbbox();assert box[1]>0 and box[3]<ch
 name=f'frame-{i:02}.png';canvas.save(out/name);frames.append(canvas)
 records.append(dict(id=i,file=name,source_rect=rect,packing_translation=[dx,dy],sha256=sha(out/name),bbox=list(box),atlas_rect=[i%2*cw,i//2*ch,cw,ch],duration_ms=0))
atlas=Image.new('RGBA',(cw*2,ch*2))
for i,f in enumerate(frames):atlas.alpha_composite(f,(i%2*cw,i//2*ch))
atlas.save(out/'atlas.png')
seq=[0,1,2,3,2,1];times=[420,260,260,420,260,260]
if ident=='rimejaw-scavenger':times=[280,180,180,300,180,180]
if ident=='cairnfrost-ursine':times=[500,320,320,500,320,320]
preview=[]
for f in frames:
 board=Image.new('RGB',(cw*2,ch+170),'#152033');board.paste('#eee6d7',(cw,0,cw*2,ch+170))
 board.paste(f,(0,0),f);board.paste(f,(cw,0),f)
 box=f.getbbox();scale=96/(max(z.getbbox()[3]-z.getbbox()[1] for z in frames));small=f.resize((round(cw*scale),round(ch*scale)),Image.Resampling.LANCZOS)
 board.paste(small,(cw//2-small.width//2,ch),small);board.paste(small,(cw+cw//2-small.width//2,ch),small)
 ImageDraw.Draw(board).text((12,ch+140),ident+' | idle | full size + 96px | pending review',fill='white');preview.append(board)
preview[0].save(out/'idle-review.gif',save_all=True,append_images=[preview[i] for i in seq[1:]],duration=times,loop=0,disposal=2,optimize=False)
contact=Image.new('RGB',atlas.size,'#e6ded0')
for i,f in enumerate(frames):contact.paste(f,(i%2*cw,i//2*ch),f)
contact.save(out/'keyposes.png')
source=next(v for v in json.loads((ROOT/'work/production/ice-idle-2026-10-13/approved-inventory.json').read_text()) if v['id']==ident)
ledger=json.loads((ROOT/'assets/approvals/decisions.json').read_text())['decisions'];assert sha(source['path'])==source['sha256'];assert ledger[source['sha256']]['status']=='Approved'
manifest=dict(character_id=ident,status='idle_exported_pending_visual_review',format='whole-character RGBA frames',source_approval=source,generation=dict(tool='built-in image_gen',source=str(src),prompt='prompt.txt',source_sheet_sha256=sha(out/'source-sheet.png')),geometry=dict(frame_canvas=[cw,ch],coordinate_system='pixels; top-left origin; x right y down',ground_anchor=[350,int(ch*.91)],registration='integer front-paw ground registration; no pose scaling',facing='left',root_motion='in-place'),atlas=dict(file='atlas.png',dimensions=list(atlas.size),sha256=sha(out/'atlas.png')),frames=records,animations=dict(idle=dict(frames=seq,durations_ms=times,duration_ms=sum(times),loop=True,events=[],transition='self',method='four authored progressive inhale poses, six-step forward/reverse breath cycle')),unproduced_states=['attack','hit','wounded_idle','die','cast','guard','spawn','victory'],scope='Idle only per current request; combat states not produced.',preview=dict(file='idle-review.gif',sha256=sha(out/'idle-review.gif'),views='full size and 96px, light and dark backgrounds'),qa=dict(alpha_extrema=list(im.getchannel('A').getextrema()),unique_frames=len({r['sha256'] for r in records}),source_clipping=False,visual_playback='pending',limitations=['Four authored key poses, no interpolation; minor generated contour variation requires review.']),approval='Pending approval')
(out/'manifest.json').write_text(json.dumps(manifest,indent=2)+'\n')
shutil.copy2(__file__,out/'pack-source.py')
print(json.dumps(dict(output=str(out),dimensions=im.size,bboxes=[r['bbox'] for r in records],duration=sum(times))))

