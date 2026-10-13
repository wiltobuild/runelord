from pathlib import Path
p=Path('work/export_idle_bodyposes.py')
s=p.read_text().replace('import json,zipfile,hashlib','import json,zipfile,hashlib,math').replace("outputs/imp-idle-8-r4'","outputs/imp-idle-8-r5'").replace("imp-idle-8-r4.zip","imp-idle-8-r5.zip")
s=s.replace('pose_order=[0,1,2,3,3,2,1,0]', '''# Reuse the neutral lower-body layer so knees and feet cannot jitter between drawings.
lower_mask=Image.new('L',(560,520))
ImageDraw.Draw(lower_mask).polygon([(248,325),(329,325),(348,350),(365,520),(160,520),(160,350),(242,350)],fill=255)
for j in range(1,4):
 body_layers[j]=Image.composite(body_layers[0],body_layers[j],lower_mask)
 body_layers[j].save(out/f'body-pose-{j:02d}.png')
pose_order=[0,1,2,3,3,2,1,0]''')
s=s.replace(" frame.save(out/'frames'", " phase=2*math.pi*i/8\n dx=0.6*math.sin(phase);dy=3*math.cos(phase)\n frame=frame.transform(frame.size,Image.Transform.AFFINE,(1,0,-dx,0,1,-dy),Image.Resampling.BICUBIC)\n bounds=frame.getbbox();assert bounds and bounds[0]>0 and bounds[1]>0 and bounds[2]<560 and bounds[3]<520\n frame.save(out/'frames'")
s=s.replace("'body_scale':.53}","'body_scale':.53,'hover_offset_px':[dx,dy]}")
s=s.replace('Four body poses - constant scale','Stable legs - subtle hover').replace('Four authored body poses registered at constant scale and waist anchor, combined with the unchanged eight wing poses. No cyclic body scaling.','Upper-body poses with a fixed neutral lower body, unchanged wing poses, and a gentle 3px vertical / 0.6px lateral hover. No scaling.').replace("print('8 frames; four body poses; constant body scale')","with Image.open(out/'imp-idle.gif') as g:assert g.n_frames==8\nprint('PASS: 8 frames; stable lower body; no scaling; no clipping')")
Path('work/export_idle_float.py').write_text(s)
