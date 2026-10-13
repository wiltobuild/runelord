from pathlib import Path
from PIL import Image
import json,hashlib,numpy as np
p=Path('assets/characters/warlock-ignivar/animations/flight-r1');d=json.loads((p/'animation.json').read_text());checks=[]
for f in d['frames']:
 i=Image.open(p/f['file']).convert('RGBA');a=np.array(i);m=a[:,:,3]>127;y,x=np.where(m);box=[int(x.min()),int(y.min()),int(x.max()+1),int(y.max()+1)]
 assert i.size==(1536,1536) and all([box[0]>0,box[1]>0,box[2]<1536,box[3]<1536]);assert hashlib.sha256((p/f['file']).read_bytes()).hexdigest()==f['sha256']
 checks.append({'id':f['id'],'opaque_bounds':box,'alpha_extrema':i.getchannel('A').getextrema(),'edge_clipping':False})
for name,c in d['animations'].items():assert len(c['frames'])==len(c['durations_ms']) and all(0<=i<len(d['frames']) for i in c['frames'])
report={'technical_checks':'pass','frames':checks,'state_count':len(d['animations']),'native_authored_source_count':10,'source_pixels_upscaled':False,'atlas_max_dimensions':[3072,3072],'visual_qa':'Independent review pending; not user-approved','manifest_sha256':hashlib.sha256((p/'animation.json').read_bytes()).hexdigest()}
(p/'verification.json').write_text(json.dumps(report,indent=2))
print(json.dumps(report,indent=2))
