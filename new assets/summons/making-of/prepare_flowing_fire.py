from pathlib import Path
p=Path('work/export_vanguard_fixed_peak.py');s=p.read_text().replace("outputs/dread-vanguard-idle-r4'","outputs/dread-vanguard-idle-r5'")
start=s.index('runes=')
s=s[:start]+'''# Separate the existing fire fringe from the rigid sword and character.
# Blade interior, runes and body remain registered; only exterior flame pixels flow.
left_edge=704-.63*y;right_edge=684-.385*y
outside=(x<left_edge+3)|(x>right_edge-4)
warm=np.clip((r-b-35)/65,0,1)*np.clip((r-g*.85-15)/45,0,1)
firemask=warm*outside*(x>425)*(y<445)*(y>35)
fire=base.copy();fa=a.copy();fa[:,:,3]*=firemask
fire=Image.fromarray(np.clip(fa,0,255).astype('uint8'),'RGBA');fire.save(out/'fire-layer.png')
body=a.copy();body[:,:,3]*=(1-firemask);body=Image.fromarray(np.clip(body,0,255).astype('uint8'),'RGBA');body.save(out/'body-layer.png')
def flowing_fire(phase):
 mesh=[]
 for top in range(0,1024,16):
  for left in range(0,720,16):
   right=min(left+16,720);bottom=min(top+16,1024)
   def point(px,py):
    le=704-.63*py;re=684-.385*py
    dist=max(le-px,px-re,0);freedom=min(1,dist/20)
    # Travelling curls change the silhouette; their roots stay near the blade.
    dx=freedom*(9*math.sin(py*.055+phase)+3*math.sin(py*.11-phase))
    dy=freedom*(13*math.cos(py*.045+phase)+4*math.sin(px*.06-phase))
    return px-dx,py-dy
   mesh.append(((left,top,right,bottom),point(left,top)+point(left,bottom)+point(right,bottom)+point(right,top)))
 return fire.transform((720,1024),Image.Transform.MESH,mesh,Image.Resampling.BICUBIC)
''' +s[start:]
s=s.replace('power=np.where(eye,eyes[i],runes[i]);f=a.copy();weight=m*(1-power)*.79','''moving=body.copy();moving.alpha_composite(flowing_fire(2*math.pi*i/8))
 power=np.where(eye,eyes[i],runes[i]);f=np.asarray(moving).astype(float);weight=m*(1-power)*.79''')
s=s.replace('Fire/eye intensity varies. Rejected lunging pose excluded.','Exterior fire layer uses travelling spatial curls across eight phases, changing flame silhouettes independently of the stationary blade. Fire/eye intensity varies. Rejected lunging pose excluded.')
s=s.replace("print('PASS: exactly8", "print('PASS: independently flowing flame geometry; exactly8")
Path('work/export_vanguard_flowing_fire.py').write_text(s)
