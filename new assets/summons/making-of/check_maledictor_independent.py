from pathlib import Path
from PIL import Image
import numpy as np,json
root=Path(r'C:/Users/Wil/Documents/Codex/2026-10-09/sp-2')
r={'scope':'Independent static source/contact and exported-frame checks. Not real-time playback certification.','blocking_findings':[],'assets':{}}
for name,base in [('maledictor','maledictor-idle-r1'),('iron-legionary','iron-legionary-idle-r3')]:
 p=root/'outputs'/f'{name}-states-r1';m=json.loads((p/'animation.json').read_text());x,y=m['idle_offset'];equals=[];edge=[];bounds=[]
 for i in range(8):
  a=Image.open(root/'outputs'/base/'frames'/f'frame-{i:02d}.png').convert('RGBA');b=Image.open(p/'idle'/f'frame-{i:02d}.png').convert('RGBA');equals.append(np.array_equal(np.array(a),np.array(b.crop((x,y,x+a.width,y+a.height)))))
 for f in p.glob('*/frame-*.png'):
  im=Image.open(f);bb=im.getchannel('A').point(lambda a:255 if a>16 else 0).getbbox()
  if bb and (bb[0]==0 or bb[1]==0 or bb[2]==im.width or bb[3]==im.height):edge.append(str(f))
  if bb:bounds.append(bb)
 d=m['states']['die'];r['assets'][name]={'idle_exact_all_8':all(equals),'clipped_frame_edges':edge,'exported_frame_count':len(bounds),'death_loop':d['loop'],'death_events':d.get('events'),'visual':'No obvious neighbor fragments or detached weapons; terminal frame visibly collapsed. Identity and equipment readable.','notes':(['Action poses have a broader torso/head impression than the slender accepted idle; noticeable shape drift, not an extracted-neighbor or clipping defect.'] if name=='maledictor' else ['Sparse attack keyframes jump from overhead anticipation to downward follow-through; readable action but no continuous swing in-betweens.'])}
 if not all(equals):r['blocking_findings'].append(name+': idle pixel mismatch')
 if edge:r['blocking_findings'].append(name+': edge clipping')
 if d['loop']:r['blocking_findings'].append(name+': looping terminal death')
(root/'work/maledictor-full-independent-qa.json').write_text(json.dumps(r,indent=2))
print(json.dumps(r,indent=2))

