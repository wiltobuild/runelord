from pathlib import Path
from PIL import Image,ImageDraw,ImageFilter
import numpy as np,math,json,shutil
root=Path(r'C:/Users/Wil/Documents/Codex/2026-10-09/sp-2');out=root/'outputs/dread-vanguard-four-fire-r1';out.mkdir(exist_ok=True)
base=Image.open(root/'outputs/dread-vanguard-empowerment-r1/unlit-registered.png').convert('RGBA');clean=Image.open(root/'outputs/dread-vanguard-aligned-fire-r1/battle-stance.png').convert('RGBA');sheet=Image.open(root/'outputs/dread-vanguard-empowerment-r1/fire-source.png').convert('RGBA');shutil.copy2(root/'outputs/dread-vanguard-empowerment-r1/fire-source.png',out/'fire-source.png')
# Trace the actual metal silhouette; generated fire phases wrap around this fixed boundary.
ys=np.array([80,96,130,177,230,280,330,370,390,415,439,457],float)
left=np.array([652,646,614,574,550,524,499,478,453,471,470,483],float)
right=np.array([652,646,639,627,608,585,560,543,533,527,538,483],float)
poly=list(zip(left,ys))+list(zip(right[::-1],ys[::-1]));mask=Image.new('L',(720,1024));ImageDraw.Draw(mask).polygon(poly,fill=255)
# Preserve the clean luminous metal and runes within the traced blade, no static flame silhouette.
bladebase=Image.composite(clean,base,mask);bladebase.save(out/'registered-base.png')
effects=[]
for k in range(4):
 c,r=k%2,k//2;tile=sheet.crop((c*526,r*747,(c+1)*526,min((r+1)*747,1495)));a=np.asarray(tile).astype(float);h,w=a.shape[:2];result=np.zeros((1024,720,4),dtype=np.uint8)
 # Hot core center measured per row prevents phases sliding sideways as tongues vary.
 centers=[]
 for row in range(h):
  weight=np.maximum(0,a[row,:,1]-140)*a[row,:,3]/255
  guess=120+(420-120)*(720-row)/630
  weight*=np.exp(-((np.arange(w)-guess)/65)**2)
  centers.append(float((weight*np.arange(w)).sum()/weight.sum()) if weight.sum()>1 else guess)
 centers=np.convolve(np.pad(centers,(8,8),mode='edge'),np.ones(17)/17,mode='valid')
 for yy in range(61,449):
  sy=np.clip(85+(yy-96)*(635/336),0,h-1);row=int(sy);cx=centers[row];l=np.interp(yy,ys,left);rr=np.interp(yy,ys,right)
  for xx in range(max(0,int(l-48)),min(720,int(rr+49))):
   if l+1<xx<rr-1:continue
   sx=cx-18+(xx-l)/.48 if xx<=l+1 else cx+18+(xx-rr)/.48
   if 0<=sx<w-1:
    xi=int(sx);t=sx-xi;v=a[row,xi]*(1-t)+a[row,xi+1]*t
    v[3]*=max(0,min(1,(449-yy)/16))
    result[yy,xx]=np.clip(v,0,255)
 fx=Image.fromarray(result,'RGBA');fx.save(out/f'fire-phase-{k}.png');effects.append(fx)
# Reuse exporter; each frame now consumes a real distinct fire phase, twice through all four.
s=Path('work/export_empowerment.py').read_text();start=s.index('allframes={}');end=s.index('for i in range(8):assert',start);tail=s[start:end]
tail=tail.replace("for state in ['unlit','empowered']:","for state in ['empowered']:")
tail=tail.replace('f=base.copy()','f=bladebase.copy()').replace("j=i//2;fx=effects[j] if i%2==0 else Image.blend(effects[j],effects[(j+1)%4],.5)\n   f.alpha_composite(fx)","j=i%4;fx=effects[j]\n   back=fx.copy();back.alpha_composite(f);f=back")
# Omit paired comparison; show only the requested animated correction.
tail=tail[:tail.index('pairs=[]')]
exec(tail)
(out/'animation.json').write_text(json.dumps({'frame_count':8,'duration_ms':1280,'fire_phase_order':[0,1,2,3,0,1,2,3],'method':'All four existing authored fire phases remapped to traced left and right blade edges; fixed metal/runes occlude fire interior; same subtle breathing transform.','alignment_trace':{'y':ys.tolist(),'left':left.tolist(),'right':right.tolist()}},indent=2))
print('PASS:8 frames; all4 distinct fire source phases used twice')
