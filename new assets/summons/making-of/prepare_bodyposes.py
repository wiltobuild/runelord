from pathlib import Path
p=Path('work/export_fixed_idle.py')
s=p.read_text(encoding='utf-8-sig').replace('imp-idle-8-r2','imp-idle-8-r4')
s=s.replace("frames=[]; entries=[]",'''poses=Image.open(r'C:/Users/Wil/.codex/generated_images/01a11ef8-d768-7f21-86bf-77a410275895/exec-17b5f76f-3ba3-4af8-95ca-50e60378da4c.png').convert('RGBA')
poses.save(out/'body-poses-source.png')
pw,ph=poses.size
print('pose sheet',poses.size)
belts=[(282,391),(840,393),(286,1017),(839,1013)]
body_layers=[]
for j,(bx,by) in enumerate(belts):
 pc,pr=j%2,j//2
 bounds=(round(pc*pw/2),round(pr*ph/2),round((pc+1)*pw/2),round((pr+1)*ph/2))
 pose=poses.crop(bounds)
 scale=.53
 pose=pose.resize((round(pose.width*scale),round(pose.height*scale)),Image.Resampling.LANCZOS)
 layer=Image.new('RGBA',(560,520))
 layer.alpha_composite(pose,(round(300-(bx-bounds[0])*scale),round(332-(by-bounds[1])*scale)))
 layer.save(out/f'body-pose-{j:02d}.png');body_layers.append(layer)
pose_order=[0,1,2,2,3,3,1,0]
frames=[]; entries=[]''')
s=s.replace('frame.alpha_composite(fixed)','frame.alpha_composite(body_layers[pose_order[i]])')
s=s.replace("'wing_root_destination':[302,267]","'wing_root_destination':[302,267],'body_pose':pose_order[i],'body_scale':.53")
start=s.index('# Verify every opaque body pixel')
end=s.index("manifest=",start)
s=s[:start]+s[end:]
s=s.replace('One fixed body layer, eight separately authored wing poses composited behind it. No body translation, scaling, or bob.','Four authored body poses registered at constant scale and waist anchor, combined with the unchanged eight wing poses. No cyclic body scaling.')
s=s.replace("'body_pixel_verification':'PASS: opaque body pixels identical across all 8 PNG frames',","'registration':{'body_scale':.53,'waist_anchor':[300,332],'pose_order':pose_order},")
s=s.replace('Fixed body - wing-only idle','Four body poses - constant scale')
s=s.replace('8 frames; body invariant verified','8 frames; four body poses; constant body scale')
Path('work/export_idle_bodyposes.py').write_text(s,encoding='utf-8')
