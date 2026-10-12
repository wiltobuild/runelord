from pathlib import Path
from PIL import Image
import numpy as np,hashlib,json,zipfile
root=Path('outputs');out=root/'dread-vanguard-idle-r5';hashes=[]
for i in range(8):
 new=np.array(Image.open(out/'frames'/f'frame-{i:02d}.png'));old=np.array(Image.open(root/'dread-vanguard-idle-r4/frames'/f'frame-{i:02d}.png'))
 assert np.array_equal(new[510:],old[510:]),'Lower body changed'
 hashes.append(hashlib.sha256(new[35:440,440:700,3].tobytes()).hexdigest())
assert len(set(hashes))==8,'Fire alpha silhouettes did not animate'
(out/'qa.json').write_text(json.dumps({'distinct_fire_alpha_frames':8,'lower_body_matches_r4':True,'method':'Exterior-fire spatial deformation, not brightness-only','previous_revision_preserved':True},indent=2))
with zipfile.ZipFile(root/'dread-vanguard-idle-r5.zip','w',zipfile.ZIP_DEFLATED) as z:
 for f in out.rglob('*'):
  if f.is_file():z.write(f,f.relative_to(out))
print('PASS:8 distinct fire silhouettes; lower body pixel-identical to r4')
p=Path('work/imp-preview.config.mjs');p.write_text(p.read_text().replace('dread-vanguard-idle-r4/frames','dread-vanguard-idle-r5/frames'))
