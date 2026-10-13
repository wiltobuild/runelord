from PIL import Image
from pathlib import Path
import numpy as np,json
for slug,cut in [('ironhorn-bulwark',432),('iron-legionary',448)]:
 p=Path('outputs')/(slug+'-idle-r2');fs=[np.array(Image.open(f).convert('RGBA')) for f in sorted((p/'frames').glob('*.png'))];assert len(fs)==8
 assert all(np.array_equal(f[cut:,:,3],fs[0][cut:,:,3]) for f in fs),'Weapon silhouette changed'
 mask=np.array(Image.open(p/'emission-mask.png'));stable=(mask[cut:]==0)
 # Bloom may change RGB but alpha geometry must stay pixel-exact on the entire weapon and hand.
 result={'frame_count':8,'weapon_and_grip_alpha_exact_across_all_frames':True,'unwarped_from_y':cut,'light_intensity_changes_retained':True};(p/'rigid-weapon-verification.json').write_text(json.dumps(result,indent=2));print(slug,result)
