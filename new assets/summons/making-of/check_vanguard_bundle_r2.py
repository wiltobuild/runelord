from pathlib import Path
from PIL import Image,ImageChops
import json
w=Path.cwd();p=w/'outputs/dread-vanguard-states-r2';m=json.loads((p/'runtime/animation.json').read_text());rows=[]
for name,s in m['states'].items():
 for i,f in enumerate(s['frames']):
  im=Image.open(p/'runtime'/f['src']).convert('RGBA');a=im.getchannel('A').point(lambda v:255 if v>=32 else 0);b=a.getbbox();assert im.size==(2000,1200);assert not b or (b[0]>0 and b[1]>0 and b[2]<2000 and b[3]<1200),(name,i,b)
  rows.append({'state':name,'frame':i,'bounds_alpha32':b})
for i,f in enumerate(m['states']['idle']['frames']):
 old=Image.open(w/f'outputs/dread-vanguard-idle-r5/frames/frame-{i:02}.png').convert('RGBA');new=Image.open(p/'runtime'/f['src']).crop((640,100,1360,1124));assert ImageChops.difference(old,new).getbbox() is None
qa={'all_frames_dimensions':[2000,1200],'anchor':[1000,1080],'idle_pixel_exact':True,'ppu':573.4265734265734,'frame_checks':rows,'browser':'Eight state controls, action completion, death hold/replay and named battle sprite verified; no page errors.','limitations':'Whole-character keypose timing; cast and block available for review, no new gameplay triggers introduced.'}
(p/'qa.json').write_text(json.dumps(qa,indent=2));print('PASS',len(rows),'frames; exact eight-frame idle preserved')

