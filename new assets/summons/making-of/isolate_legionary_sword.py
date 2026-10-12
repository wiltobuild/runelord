from pathlib import Path
p=Path('work/export_legionary_idle.py');s=p.read_text().replace('Image,ImageFilter','Image,ImageFilter,ImageDraw').replace('iron-legionary-idle-r1','iron-legionary-idle-r3')
s=s.replace("power=[",'''# Explicit sword silhouette: blade/crossguard plus exposed pommel, excluding torso and legs.
sword=Image.new('L',base.size);d=ImageDraw.Draw(sword)
d.polygon([(176,533),(188,523),(211,511),(223,485),(243,498),(258,518),(247,530),(238,532),(241,549),(270,564),(293,560),(311,581),(344,599),(346,615),(434,677),(505,816),(353,742),(229,652),(200,638),(194,616),(176,633),(176,610),(166,596),(180,576)],fill=255)
d.polygon([(87,474),(113,459),(124,461),(113,480),(134,492),(120,520),(105,512),(97,490)],fill=255)
sword.save(out/'sword-isolation-mask.png')
# Broad enough rigid interior for all mesh vertices; narrow blend only around its exterior.
rigid=sword.filter(ImageFilter.MaxFilter(25)).filter(ImageFilter.GaussianBlur(3));weight=np.asarray(rigid).astype(float)/255
power=[''')
start=s.index(' for top in range(0,1024,16):');end=s.index(' f=f.transform',start)
s=s[:start]+''' grip_shift=shift(520)
 for top in range(0,1024,8):
  bottom=min(1024,top+8)
  for left in range(0,720,8):
   right=min(720,left+8);coords=[]
   for xx,yy in [(left,top),(left,bottom),(right,bottom),(right,top)]:
    w=weight[min(yy,1023),min(xx,719)];v=(1-w)*shift(yy)+w*grip_shift;coords.extend((xx,yy-v))
   mesh.append(((left,top,right,bottom),tuple(coords)))
'''+s[end:]
s=s.replace('No lateral wobble.','Sword isolated by silhouette mask and translated rigidly with its grip; all other original breathing restored. No lateral wobble.')
Path('work/export_legionary_idle_r3.py').write_text(s)
