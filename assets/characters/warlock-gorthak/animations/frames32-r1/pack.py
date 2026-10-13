from pathlib import Path
from PIL import Image,ImageDraw
import hashlib,json
P=Path(__file__).parent
spec={'idle':([350]*4,True),'attack':([65,65,70,40,60,60,70,70],False),'hit':([70,100,90,90],False),'wounded_idle':([400]*4,True),'spawn':([180]*4,False),'die':([100,110,130,140,170,190,220,500],False)}
sha=lambda p:hashlib.sha256(p.read_bytes()).hexdigest()
m={'contract_version':2,'character_id':'warlock-gorthak','revision':'frames32-r1','status':'Pending approval','method':'32 distinct authored whole-character poses, nine reused sources; native pixels preserved, no synthetic interpolation','base':{'asset':'../hd-r2/source/neutral.png','sha256':'5e5700db391d6b020f31307d1af113102eb81f5d80575eef2c01777119f5c191','approval_evidence':'60fd264d-616b-4049-b781-ca8acf21506a'},'geometry':{'canvas_px':[1536,1536],'root_px':[768,1400],'anchor_normalized':[.5,1400/1536],'source_pixels_per_world_unit':1185/1.65,'standing_height_world':1.65,'facing':'right','root_motion':'in-place translation registration; no rescaling'},'frames':[],'animations':{},'aliases':{'act':'attack'}}
images=[]
for state,(durations,loop) in spec.items():
 ids=[]
 for index in range(len(durations)):
  source=P/'source'/f'{state}-{index:02}.png';im=Image.open(source).convert('RGBA');box=im.getchannel('A').point(lambda v:255 if v>127 else 0).getbbox();offset=(768-(box[0]+box[2])//2,1400-box[3]);out=Image.new('RGBA',(1536,1536));out.alpha_composite(im,offset);i=len(images);name=f'frame-{i:02}.png';out.save(P/name);images.append(out);ids.append(i);b=out.getchannel('A').point(lambda v:255 if v>127 else 0).getbbox();assert b[0]>0 and b[1]>0 and b[2]<1536 and b[3]<1536;assert sum(out.getchannel('A').histogram()[128:])==sum(im.getchannel('A').histogram()[128:]);m['frames'].append({'id':i,'file':name,'sha256':sha(P/name),'source':'source/'+source.name,'source_sha256':sha(source),'source_dimensions':list(im.size),'translation':list(offset),'visible_bbox':list(b),'source_scale':1})
 m['animations'][state]={'frames':ids,'durations_ms':durations,'loop':loop,'transition':'hold-last' if state=='die' else 'self' if loop else 'idle','events':[{'name':'impact','at_ms':240}] if state=='attack' else [{'name':'arrival','at_ms':540}] if state=='spawn' else []}
 previews=[]
 for i in ids:
  pic=images[i].resize((1024,1024),Image.Resampling.LANCZOS);bg=Image.new('RGB',(1024,1024),'#242630');bg.paste(pic,(0,0),pic);ImageDraw.Draw(bg).text((12,12),'Gorthak frames32 / '+state,fill='white');previews.append(bg)
 previews[0].save(P/(state+'.gif'),save_all=True,append_images=previews[1:],duration=durations,disposal=2,**({'loop':0} if loop else {}))
m['animations']['act']=m['animations']['attack']
assert len(images)==32 and len(set(f['source_sha256'] for f in m['frames']))==32
m['frame_count']=32
(P/'animation.json').write_text(json.dumps(m,indent=2));(P/'manifest.json').write_text(json.dumps(m,indent=2))
for mode,color in [('dark','#242630'),('light','#e2dbcb')]:
 sheet=Image.new('RGB',(1600,3200),color)
 for f,im in zip(m['frames'],images):
  i=f['id'];pic=im.resize((400,400),Image.Resampling.LANCZOS);xy=((i%4)*400,(i//4)*400);sheet.paste(pic,xy,pic);ImageDraw.Draw(sheet).text((xy[0]+10,xy[1]+10),f['source'][7:],fill='white' if mode=='dark' else 'black')
 sheet.save(P/f'contact-{mode}.jpg')
(P/'packing-checks.json').write_text(json.dumps({'status':'pass','frames':32,'unique_native_sources':32,'checks':['native source pixel scale1','all opaque pixels preserved','1536RGBA output','padded silhouette bounds','valid frame references','six states plus act alias','death one-shot hold-last']},indent=2))
print('Packed32 native-source frames and six previews')
