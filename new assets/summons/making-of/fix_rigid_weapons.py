from pathlib import Path
p=Path('work/export_legionary_idle.py');s=p.read_text().replace('iron-legionary-idle-r1','iron-legionary-idle-r2').replace('(yy-490)/380','(yy-300)/148')
s=s.replace("f=f.transform((720,1024)","unwarped=f.copy();f=f.transform((720,1024)")
s=s.replace(";f.paste(base.crop((0,875", ";f.paste(unwarped.crop((0,448,720,1024)),(0,448));f.paste(base.crop((0,875")
s=s.replace('3px maximum upper body vertical displacement tapers to zero at legs.','3px maximum head/chest breathing tapers to zero by y448, above the sword and gripping hand. Whole sword and grip excluded from deformation; lighting flicker only.')
Path('work/export_legionary_idle_r2.py').write_text(s)
p=Path('work/export_ironhorn_subtle.py');s=p.read_text().replace('ironhorn-bulwark-idle-r1','ironhorn-bulwark-idle-r2')
start=s.index(' # All movement');end=s.index('for i in range(8):',start)
s=s[:start]+''' # Breathing settles above forearm and grip. Cudgel and hand never enter the mesh deformation.
 body=1-smooth((y-300)/132)
 return .6*math.sin(theta)*body,-2.5*math.sin(theta)*body
'''+s[end:]
s=s.replace(' mesh=[]',' unwarped=f.copy();mesh=[]').replace(' f.paste(base.crop((0,900',' f.paste(unwarped.crop((0,432,W,H)),(0,432))\n f.paste(base.crop((0,900')
s=s.replace('tiny hand-equipment following','head/chest motion tapering to zero by y432; rigid fixed hand and entire cudgel').replace("'shield_follow_px':[.45,.65],'cudgel_follow_px':[.55,.8]","'shield_follow_px':[0,0],'cudgel_follow_px':[0,0]")
Path('work/export_ironhorn_subtle_r2.py').write_text(s)
