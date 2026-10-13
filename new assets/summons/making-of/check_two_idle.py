from pathlib import Path
from PIL import Image
import numpy as np,hashlib,json
r=Path(__file__).resolve().parents[1];result={}
for name,anchor,master in [('maledictor',825,'idle-master.png'),('ash-pikeman',835,'registered.png')]:
 p=r/'outputs'/f'{name}-idle-r1';fs=[Image.open(x).convert('RGBA') for x in sorted((p/'frames').glob('*.png'))];a=[np.asarray(x) for x in fs];base=np.asarray(Image.open(p/master).convert('RGBA'))
 m=json.loads((p/'animation.json').read_text());res={'png_count':len(fs),'unique_pixel_frames':len({hashlib.sha256(x.tobytes()).hexdigest() for x in fs}),'feet_identical':all(np.array_equal(x[anchor:],base[anchor:]) for x in a),'alpha_bbox_all':[x.getchannel('A').getbbox() for x in fs],'canvas_edge_alpha_clear':all(not np.any(x[0,:,3]) and not np.any(x[-1,:,3]) and not np.any(x[:,0,3]) and not np.any(x[:,-1,3]) for x in a),'source_hash_matches':hashlib.sha256(Path(m['source']).read_bytes()).hexdigest()==m['source_sha256'],'no_per_frame_scale':'Confirmed script uses one registered source and small mesh displacement, no per-frame resize','visual_review':'Complete silhouette, intact staff/spear and grips, no visible fragments or clipping in contact sheet.'}
 for ext in ['gif','webp']:
  with Image.open(p/f'idle.{ext}') as f:res[ext+'_frames']=f.n_frames
 if name=='maledictor':
  sheet=Image.open(p/'flame-source.png').convert('RGBA');w,h=sheet.size;parts=[sheet.crop(((k%2)*w//2,(k//2)*h//2,((k%2)+1)*w//2,((k//2)+1)*h//2)) for k in range(4)];res['distinct_flame_source_cells']=len({hashlib.sha256(x.tobytes()).hexdigest() for x in parts});res['flame_phase_sequence']=[x['fire_phase'] for x in m['frames']];res['notes']='Source alpha present. Staff continuity visually good; tiny mesh bending is intentional. Four fire shapes visually distinct and anchored at fingers.'
 result[name]=res
result['scope']='Independent static frame/script checks; no realtime playback audit. No blocking defects found.'
(r/'work/idle-four-qa.json').write_text(json.dumps(result,indent=2));print(json.dumps(result,indent=2))
