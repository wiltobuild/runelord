from PIL import Image
from pathlib import Path
import numpy as np,json
p=Path('outputs/maledictor-states-r1');manifest=json.loads((p/'animation.json').read_text());checks=[]
for state,s in manifest['states'].items():
 assert s['duration']==sum(f['duration_ms'] for f in s['frames'])
 for entry in s['frames']:
  im=Image.open(p/entry['src']);a=np.array(im.getchannel('A'));assert not (a[0]>16).any() and not (a[-1]>16).any() and not(a[:,0]>16).any() and not(a[:,-1]>16).any(),entry
 checks.append({'state':state,'slots':len(s['frames']),'duration':s['duration'],'loop':s['loop'],'no_canvas_clipping':True})
for i in range(8):
 f=Image.open(p/'idle'/f'frame-{i:02d}.png');src=Image.open(Path('outputs/maledictor-idle-r1/frames')/f'frame-{i:02d}.png');assert np.array_equal(np.array(f.crop((280,48,1000,1072))),np.array(src))
(p/'verification.json').write_text(json.dumps({'checks':checks,'idle_pixels_exact':True,'death_terminal':not manifest['states']['die']['loop']},indent=2));print('PASS maledictor timing, margins, exact idle, terminaldeath')
