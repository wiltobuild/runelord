from pathlib import Path
from PIL import Image,ImageDraw,ImageChops
import json,shutil
w=Path.cwd();old=w/'outputs/dread-vanguard-states-r1';out=w/'outputs/dread-vanguard-states-r2';(out/'runtime').mkdir(parents=True,exist_ok=True)
m=json.loads((old/'runtime/animation.json').read_text());S=(2000,1200);root=(1000,1080)
scales={'attack':[1,.84,.80,.80,.88,1],'cast':[1,.95,.95,.95,1],'hit':[1,.96,.96,.94,1,1],'block':[1,.94,.98,.98,.94,1],'wounded_idle':[.94]*8,'spawn':[.92,.92,.92,.92,1],'die':[1,.90,.90,.82,.82]}
def xf(im,s,dy=0):
 return im.transform(S,Image.Transform.AFFINE,(1/s,0,root[0]*(1-1/s),0,1/s,root[1]*(1-1/s)-dy/s),Image.Resampling.BICUBIC)
polys={3:[(590,885),(695,890),(755,867),(830,879),(863,908),(1020,920),(1180,975),(1320,1105),(575,1110)],4:[(580,805),(670,808),(740,840),(790,848),(857,866),(916,901),(1030,940),(1320,1098),(560,1110)]}
records=[]
for name,state in m['states'].items():
 d=out/'runtime'/name;d.mkdir(exist_ok=True);previews=[]
 for i,f in enumerate(state['frames']):
  im=Image.open(old/'runtime'/f['src']).convert('RGBA');s=scales.get(name,[1]*len(state['frames']))[i]
  if name=='die' and i>=3:
   mask=Image.new('L',S);ImageDraw.Draw(mask).polygon(polys[i],fill=255)
   sword=im.copy();sword.putalpha(ImageChops.multiply(im.getchannel('A'),mask));body=im.copy();body.putalpha(ImageChops.subtract(im.getchannel('A'),mask));clean=body.getchannel('A');ImageDraw.Draw(clean).rectangle((0,980 if i==3 else 920,2000,1200),fill=0);body.putalpha(clean);body=xf(body,s);b=body.getchannel('A').point(lambda v:255 if v>128 else 0).getbbox();dy=1080-b[3];body=xf(body,1,dy);im=body;im.alpha_composite(xf(sword,s));records.append({'state':name,'frame':i,'scale':s,'body_ground_shift':dy})
  else:im=xf(im,s) if s!=1 else im;records.append({'state':name,'frame':i,'scale':s})
  im.save(d/Path(f['src']).name)
  bg=Image.new('RGBA',S,(30,31,38));bg.alpha_composite(im);bg=bg.convert('RGB').resize((700,420));draw=ImageDraw.Draw(bg);draw.line((50,378,650,378),fill=(93,92,87));previews.append(bg)
 times=[(state['frames'][j+1]['time'] if j+1<len(state['frames']) else state['duration'])-f['time'] for j,f in enumerate(state['frames'])]
 previews[0].save(out/f'{name}.gif',save_all=True,append_images=previews[1:],duration=times,loop=0,disposal=2)
 board=Image.new('RGB',(350*len(previews),230),(30,31,38));draw=ImageDraw.Draw(board)
 for j,im in enumerate(previews):board.paste(im.resize((350,210)),(350*j,0));draw.text((350*j+5,213),f'{name} {j}',fill='white')
 board.save(out/f'{name}-contact.png')
(out/'runtime/animation.json').write_text(json.dumps(m,indent=2));(out/'registration.json').write_text(json.dumps({'method':'Offline anatomical-scale corrections around fixed floor anchor; no runtime per-frame auto-fitting. Death body contact separately registered from dropped sword.','corrections':records},indent=2))
shutil.copy2(old/'review.html',out/'review.html')
p=w/'work/imp-preview.config.mjs';text=p.read_text().replace("outputs/dread-vanguard-states-r1'","outputs/dread-vanguard-states-r2'");p.write_text(text)
print('Saved corrected r2; r1 retained')

