"""Technical packing only: preserve generated pixels; translation registration, no raster repainting."""
from pathlib import Path
from PIL import Image,ImageDraw
import numpy as np,json,hashlib,shutil
ROOT=Path(__file__).resolve().parent
REPO=ROOT.parents[4]
GEN=Path(r'C:/Users/wilsh/.codex/generated_images/01a109bc-768f-74d2-aee7-f98820875f9f')
SOURCES=[('up','daa316a6-b1f0-4c6f-82cb-c64fd96c1dc7'),('mid','ea8615d9-83f3-48e4-b276-b0a4bf3b581a'),('down','bf2cd32d-d63c-4d02-942a-74aeb517fc5a'),('anticipation','e820147e-5131-46f5-a789-b2fed79e754e'),('release','d11d84b2-1b76-4b6b-9bce-d49bb3d05238'),('hit','20569c9e-5cd7-4b0a-a479-f9c3b3a4a9ad'),('wounded-up','75b85213-d6c6-4dff-a842-7ef359969b60'),('wounded-down','f7e3b671-70db-489c-8bfe-0cd7bd80992a'),('fall','6017384d-3a1c-4a19-9f4d-0cd3ec9eeb19')]
def sha(p): return hashlib.sha256(Path(p).read_bytes()).hexdigest()
frames=[];images=[]
for idx,(name,uid) in enumerate(SOURCES):
 source=GEN/f'exec-{uid}.png'; out=ROOT/'source'/f'{name}.png'
 if not out.exists(): shutil.copy2(source,out)
 im=Image.open(out).convert('RGBA');a=np.array(im)
 m=(a[:,:,0]>215)&(a[:,:,1]>110)&(a[:,:,2]<125)&(a[:,:,3]>200)
 m[:int(im.height*.42)]=False;m[int(im.height*.62):]=False
 ys,xs=np.where(m);chest=[int(np.median(xs)),int(np.median(ys))]
 target=[930,660]
 if name=='release':target=[965,680]
 if name=='hit':target=[905,640]
 if name.startswith('wounded'):target=[930,695]
 if name=='fall':target=[930,795]
 dest=[target[0]-chest[0],target[1]-chest[1]]
 canvas=Image.new('RGBA',(1536,1536));canvas.alpha_composite(im,tuple(dest)); file=f'frame-{idx:02}.png';canvas.save(ROOT/file);images.append(canvas)
 opaque=(a[:,:,3]>127);ys,xs=np.where(opaque)
 frames.append(dict(id=idx,file=file,sha256=sha(ROOT/file),source=f'source/{name}.png',source_sha256=sha(out),source_dimensions=list(im.size),source_opaque_bbox=[int(xs.min()),int(ys.min()),int(xs.max()+1),int(ys.max()+1)],registration_translation_px=dest,uniform_scale=1,visible_bbox=canvas.getbbox()))
# Terminal is generated separately; never recycle the small old sheet.
terminal=ROOT/'source'/'terminal.png'
if terminal.exists():
 im=Image.open(terminal).convert('RGBA');bbox=im.getchannel('A').point(lambda x:255 if x>127 else 0).getbbox();dest=[768-(bbox[0]+bbox[2])//2,1400-bbox[3]]
 canvas=Image.new('RGBA',(1536,1536));canvas.alpha_composite(im,tuple(dest));file='frame-09.png';canvas.save(ROOT/file);images.append(canvas)
 frames.append(dict(id=9,file=file,sha256=sha(ROOT/file),source='source/terminal.png',source_sha256=sha(terminal),source_dimensions=list(im.size),registration_translation_px=dest,uniform_scale=1,visible_bbox=canvas.getbbox()))
else: raise RuntimeError('Terminal source not ready')
# Spawn entry is a documented displacement of drawn downstroke; no fake articulation.
canvas=Image.new('RGBA',(1536,1536));canvas.alpha_composite(images[2],(0,110));canvas.save(ROOT/'frame-10.png');images.append(canvas)
frames.append(dict(id=10,file='frame-10.png',sha256=sha(ROOT/'frame-10.png'),derived_from=2,registration_translation_px=[0,110],visible_bbox=canvas.getbbox()))
def clip(ids,times,loop=False,events=[],transition='idle'):return dict(frames=ids,durations_ms=times,loop=loop,events=events,transition=transition)
clips={'idle':clip([0,1,2,1],[140,90,140,90],True,transition='self'),'act':clip([3,4,4,1],[100,70,80,100],events=[{'name':'release','at_ms':100}]),'hit':clip([5,1,0],[100,100,100]),'wounded_idle':clip([6,7],[230,230],True,transition='self'),'die':clip([5,8,9],[110,180,850],events=[{'name':'terminal','at_ms':290}],transition='hold-last'),'spawn':clip([10,2,1,0],[100,100,100,120],events=[{'name':'arrival','at_ms':300}])}
# Separate state atlases avoid a single texture exceeding common GPU dimensions.
atlases={}
for name,c in clips.items():
 ids=list(dict.fromkeys(c['frames']));atlas=Image.new('RGBA',(1536*2,1536*((len(ids)+1)//2))); rects={}
 for j,i in enumerate(ids):
  x=j%2*1536;y=j//2*1536;atlas.alpha_composite(images[i],(x,y));rects[str(i)]=[x,y,1536,1536]
 file=name+'-atlas.png';atlas.save(ROOT/file);atlases[name]=dict(file=file,dimensions=list(atlas.size),rects=rects,sha256=sha(ROOT/file))
master=REPO/'assets/approvals/inbox/warlock-ignivar/base-r1/warlock-ignivar-base-r1.png';ledger=json.loads((REPO/'assets/approvals/decisions.json').read_text())
data=dict(contract_version=2,character_id='warlock-ignivar',display_name='Ignivar — flying revision',status='animation_complete_pending_review',format='whole-character generated RGBA frames',base={'asset':str(master),'sha256':sha(master),'approval':ledger['decisions'].get(sha(master))},authorization='User requested redo Igvar flying using current imps as motion reference, 2026-10-04; one character not variants.',frame_canvas=[1536,1536],anchor=[850,1400],geometry={'coordinate_system':'pixels top-left x-right y-down','facing':'right','mirror_safe':False,'root_px':[850,1400],'anchor_normalized':[850/1536,1400/1536],'reference_visible_height_px':1213,'standing_height_world':.8,'hover_gap_world':.18,'root_motion':'In-place chest-registered flight; folded knees remain airborne. Renderer adds flight-lane elevation .18 world, removing over death first290ms; terminal grounded bbox bottom1400. Spawn frame10 has +110px entry displacement. No automatic bounding-box normalization.'},frames=frames,atlases=atlases,animations=clips,generation={'tool':'built-in image_gen','method':'Individual native master-scale poses then integer translation-only registration; all RGB/alpha kept. No upscaling.','motion_reference':'assets/characters/warlock-summons/animations/flight-r1/warlock-imp','unique_authored_poses':10},limitations=['Limited-animation timing: three authored idle wing phases, two wounded phases. No skeletal interpolation.','Generated contours vary slightly, chiefly claws and spikes; user review pending.','Runtime integration is not part of this package; use documented flight lane and death offset removal.'])
(ROOT/'animation.json').write_text(json.dumps(data,indent=2)+'\n')
def panel(img,name):
 board=Image.new('RGB',(1050,740),'#171820');board.paste('#eee6d7',(740,0,1050,740));large=img.resize((700,700),Image.Resampling.LANCZOS);board.paste(large,(10,28),large)
 small=img.resize((122,122),Image.Resampling.LANCZOS);board.paste(small,(826,255),small); d=ImageDraw.Draw(board);d.text((15,10),'IGNIVAR FLIGHT / '+name,fill='white');d.text((780,205),'~96px character height',fill='#222222');return board
allframes=[];alltimes=[]
for name,c in clips.items():
 seq=[panel(images[i],name) for i in c['frames']];kwargs={'loop':0} if c['loop'] else {}
 seq[0].save(ROOT/(name+'.gif'),save_all=True,append_images=seq[1:],duration=c['durations_ms'],disposal=2,**kwargs)
 reps=3 if c['loop'] else 1;allframes+=seq*reps;alltimes+=c['durations_ms']*reps
allframes[0].save(ROOT/'flight-review.gif',save_all=True,append_images=allframes[1:],duration=alltimes,loop=0,disposal=2)
contact=Image.new('RGB',(1536,1152),'#eee6d7')
for i,img in enumerate(images[:10]):
 small=img.resize((384,384),Image.Resampling.LANCZOS);contact.paste(small,(i%4*384,i//4*384),small);ImageDraw.Draw(contact).text((i%4*384+10,i//4*384+10),str(i),fill='#222222')
contact.save(ROOT/'flight-contact.png')
print(json.dumps({'frames':len(frames),'canvas':[1536,1536],'manifest':str(ROOT/'animation.json'),'bounds':[f['visible_bbox'] for f in frames]},indent=2))

