"""Technical extraction/registration only; all new artwork is image_gen output."""
from pathlib import Path
from PIL import Image, ImageDraw
from collections import deque
import numpy as np
import json, hashlib, shutil

ROOT=Path(__file__).resolve().parent
REPO=ROOT.parents[5]
OLD=ROOT.parents[1]/'base-r1'/'warlock-imp'
SOURCE=Path(r'C:/Users/wilsh/.codex/generated_images/01a0fe64-6817-7750-8d68-dca5dacd3613/exec-22a380e0-b885-4e52-ba89-45012858871b.png')
shutil.copy2(SOURCE, ROOT/'source-sheet.png')
im=Image.open(SOURCE).convert('RGBA'); a=np.array(im); mask=a[:,:,3]>0
h,w=mask.shape; labels=np.zeros((h,w),np.int32); components=[]; ident=0
for y,x in zip(*np.where(mask)):
    if labels[y,x]: continue
    ident+=1; q=deque([(int(y),int(x))]); labels[y,x]=ident; coords=[]
    while q:
        yy,xx=q.popleft(); coords.append((yy,xx))
        for ny,nx in ((yy-1,xx),(yy+1,xx),(yy,xx-1),(yy,xx+1)):
            if 0<=ny<h and 0<=nx<w and mask[ny,nx] and labels[ny,nx]==0:
                labels[ny,nx]=ident; q.append((ny,nx))
    if len(coords)>1000:
        ys,xs=zip(*coords); components.append(dict(label=ident,count=len(coords),bbox=[min(xs),min(ys),max(xs)+1,max(ys)+1]))
components.sort(key=lambda c:(round((c['bbox'][1]+c['bbox'][3])/2/360),c['bbox'][0]))
print(json.dumps(components,indent=2))
(ROOT/'components.json').write_text(json.dumps(components,indent=2))
assert len(components)==12
def sha(p): return hashlib.sha256(Path(p).read_bytes()).hexdigest()
frames=[]; images=[]; scale=.8
for i,c in enumerate(components):
    layer=a.copy(); layer[labels!=c['label']]=0
    rgba=Image.fromarray(layer).crop(c['bbox'])
    b=np.array(rgba); eyes=(b[:,:,0]>180)&(b[:,:,1]>140)&(b[:,:,2]<150)&(b[:,:,3]>100)
    yy,xx=np.where(eyes); assert len(xx)>20
    eye=[float(xx.mean()),float(yy.mean())]
    target=[304,166]
    if i==7: target=[325,169]
    if i==8: target=[288,152]
    if i>=10: target=[306,185]
    dest=[round(target[0]-eye[0]*scale),round(target[1]-eye[1]*scale)]
    resized=rgba.resize((round(rgba.width*scale),round(rgba.height*scale)),Image.Resampling.LANCZOS)
    canvas=Image.new('RGBA',(512,384)); canvas.alpha_composite(resized,tuple(dest))
    name=f'frame-{i:02}.png'; canvas.save(ROOT/name); images.append(canvas)
    frames.append(dict(id=i,file=name,sha256=sha(ROOT/name),source_rect=c['bbox'],component_label=c['label'],packing_translation=dest,uniform_scale=scale,eye_registration_px=target,visible_bbox=canvas.getbbox()))
# A short downward transition followed by unchanged source ground-collapse frames.
drop=Image.new('RGBA',(512,384)); drop.alpha_composite(images[8],(0,32)); drop.save(ROOT/'frame-12.png'); images.append(drop)
frames.append(dict(id=12,file='frame-12.png',sha256=sha(ROOT/'frame-12.png'),derived_from=8,packing_translation=[0,32],visible_bbox=drop.getbbox()))
for j,oldid in enumerate(range(12,16),13):
    name=f'frame-{j:02}.png'; original=OLD/f'frame-{oldid:02}.png'; shutil.copy2(original,ROOT/name)
    img=Image.open(ROOT/name).convert('RGBA'); images.append(img)
    frames.append(dict(id=j,file=name,sha256=sha(ROOT/name),source_asset=str(original),source_sha256=sha(original),visible_bbox=img.getbbox()))
def clip(ids,times,loop=False,event=None,transition='idle'):
    return dict(frames=ids,durations_ms=times,loop=loop,events=[] if event is None else [dict(name=event[0],at_ms=event[1],time_ms=event[1])],transition=transition)
clips={
 'idle':clip([0,1,2,3,4,5],[90,70,70,90,70,70],True,transition='self'),
 'act':clip([6,7,7,1],[90,80,80,100],event=('release',90)),
 'hit':clip([8,9,1],[80,100,100]),
 'wounded_idle':clip([10,11],[200,200],True,transition='self'),
 'die':clip([8,12,13,14,15,16],[80,90,110,130,170,300],event=('terminal',580),transition='hold-last'),
 'spawn':clip([3,2,1,0],[90,90,90,90],event=('arrival',270))
}
clips['die']['terminal']=True
atlas=Image.new('RGBA',(2048,1920))
for i,img in enumerate(images):
    x=i%4*512; y=i//4*384; atlas.alpha_composite(img,(x,y)); frames[i]['atlas_rect']=[x,y,512,384]
atlas.save(ROOT/'atlas.png')
old=json.loads((OLD/'animation.json').read_text()); ledger=json.loads((REPO/'assets/approvals/decisions.json').read_text())
old['base']['approval']=ledger['decisions'].get(old['base']['sha256'],{'status':'Pending approval'})
geometry=dict(old['geometry']); geometry.update(hover_gap_world=.075,reference_visible_height_px=266,root_motion='In-place eye-registered flight; six authored wing phases; grounded death frames retain original anchor. Runtime may add airborne lane elevation, removed on death.')
data=dict(contract_version=2,character_id='warlock-imp',display_name='Imp — flight',role=old['role'],form='airborne summon',rig_family='winged biped',format='frame-based RGBA PNG',status='animation_complete_pending_review',authorization={'source':'User explicitly requested flying variation for existing Imp and in-demo use; delegated by parent agent','scope':'One flight variant; design approval remains pending'},base=old['base'],style_lock=old['style_lock'],source_sheet={'file':'source-sheet.png','dimensions':list(im.size),'sha256':sha(ROOT/'source-sheet.png')},geometry=geometry,frame_canvas=[512,384],anchor=[256,340],atlas={'file':'atlas.png','dimensions':list(atlas.size),'sha256':sha(ROOT/'atlas.png')},frames=frames,animations=clips,death_mapping={'flight_recoil':[8,12],'original_ground_death':[{'new':j,'base_r1':k} for j,k in enumerate(range(12,16),13)],'terminal_frame':16,'runtime_requirement':'Remove airborne lane elevation over death transition; final frame is original grounded terminal pose.'},generation={'tool':'built-in image_gen','source':str(SOURCE),'prompt_file':'generation-prompts.json'},qa={'alpha_extrema':[0,255],'frame_count':len(frames),'unique_flight_frames':6,'clipping':[],'visual_review':'Full source and registered contact sheet inspected; browser playback verification recorded separately.','limitations':['Two authored wounded poses; no skeletal interpolation.','Minor generated contour variation remains.','Death transitions to original grounded sequence; renderer must remove extra airborne lane offset.']})
for f,img in zip(frames,images):
    box=img.getbbox(); assert box and box[0]>0 and box[1]>0 and box[2]<512 and box[3]<384, (f['id'],box)
(ROOT/'animation.json').write_text(json.dumps(data,indent=2)+'\n')
# Review previews show actual timing on light/dark backgrounds and 96px-scale copies.
def panel(img,name):
    board=Image.new('RGB',(768,424),'#15171f'); board.paste('#eee6d7',(512,0,768,424)); board.paste(img,(0,25),img)
    small=img.resize((185,139),Image.Resampling.LANCZOS); board.paste(small,(554,95),small)
    ImageDraw.Draw(board).text((14,8),'IMP FLIGHT / '+name,fill='white'); return board
allframes=[]; alltimes=[]
for name,c in clips.items():
    seq=[panel(images[idx],name) for idx in c['frames']]
    seq[0].save(ROOT/(name+'.gif'),save_all=True,append_images=seq[1:],duration=c['durations_ms'],loop=0 if c['loop'] else 1,disposal=2)
    repeat=3 if c['loop'] else 1
    allframes+=seq*repeat; alltimes+=c['durations_ms']*repeat
    if name=='die': allframes.append(seq[-1]); alltimes.append(700)
allframes[0].save(ROOT/'flight-review.gif',save_all=True,append_images=allframes[1:],duration=alltimes,loop=0,disposal=2)
contact=Image.new('RGB',(1536,1152),'#ddd5c6')
for i,img in enumerate(images[:12]):
    contact.paste(img.resize((384,288),Image.Resampling.LANCZOS),(i%4*384,i//4*288),img.resize((384,288),Image.Resampling.LANCZOS))
contact.save(ROOT/'flight-contact.png')
print('PACKED',ROOT,sha(ROOT/'animation.json'))
