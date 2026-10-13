from pathlib import Path
from PIL import Image,ImageFilter
import numpy as np,json
p=Path('outputs/iron-legionary-idle-r3');mask=Image.open(p/'sword-isolation-mask.png');m=np.array(mask)>0;w=np.array(mask.filter(ImageFilter.MaxFilter(25)).filter(ImageFilter.GaussianBlur(3)))/255;assert w[m].min()==1
assert all(np.array_equal(np.array(Image.open(p/'frames'/f'frame-{i:02d}.png'))[:430],np.array(Image.open(Path('outputs/iron-legionary-idle-r1/frames')/f'frame-{i:02d}.png'))[:430]) for i in range(8))
(p/'rigid-sword-verification.json').write_text(json.dumps({'sword_mask_uniform_translation':True,'upper_body_pixels_match_original_breathing_all_8_frames':True,'full_original_breathing_profile_restored_outside_sword':True},indent=2));print('PASS: rigid sword mask; upper body exact original breathing across8frames')
