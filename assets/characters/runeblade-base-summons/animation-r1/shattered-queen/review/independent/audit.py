from pathlib import Path
from PIL import Image
import json, hashlib
p=Path(r'C:/Users/wilsh/Projects/runelord/assets/characters/runeblade-base-summons/animation-r1/shattered-queen'); out=p/'review/independent'
idx=json.loads((p/'frames/index.json').read_text()); m=json.loads((p/'manifest.json').read_text()); checks=[]
for e in idx:
 im=Image.open(p/e['file']); a=im.getchannel('A'); checks.append({'state':e['state'],'frame':e['frame'],'hash_match':hashlib.sha256((p/e['file']).read_bytes()).hexdigest()==e['sha256'],'size':im.size,'alpha_extrema':a.getextrema(),'bbox':a.getbbox()})
for st in m['states']:
 es=[e for e in idx if e['state']==st]
 for j in range(0,len(es),2):
  dst=Image.new('RGB',(1200,600),'#e6e8eb')
  for z,e in enumerate(es[j:j+2]):
   im=Image.open(p/e['file']); bg=Image.new('RGBA',im.size,'#e6e8eb'); bg.alpha_composite(im); crop=bg.crop((80,70,680,670)); dst.paste(crop,(z*600,0))
  dst.save(out/f'{st}-detail-{j:02d}.png')
(out/'technical.json').write_text(json.dumps({'frames':checks,'unique_hashes':len(set(e['sha256'] for e in idx)),'total':len(idx),'timing_sums':{st:sum(e['duration_ms'] for e in v['frames'])==v['duration_ms'] for st,v in m['states'].items()}},indent=2))
print('Technical checks saved, 32 frames')
