from pathlib import Path
from PIL import Image,ImageFilter
import numpy as np,json,shutil,zipfile
root=Path(r'C:/Users/Wil/Documents/Codex/2026-10-09/sp-2');out=root/'outputs/dread-vanguard-idle-r2';(out/'frames').mkdir(parents=True,exist_ok=True)
src=Path(r'C:/Users/Wil/.codex/generated_images/01a11ef8-d768-7f21-86bf-77a410275895/exec-ca0af95d-568e-4008-8a1f-3319403beb2b.png');shutil.copy2(src,out/'pose-source.png');sheet=Image.open(src).convert('RGBA');print(sheet.size)
w,h=sheet.size;poses=[]
for i in range(4):
 c,r=i%2,i//2;box=(round(c*w/2),round(r*h/2),round((c+1)*w/2),round((r+1)*h/2));
 if i==2:box=(0,768,538,1536)
 tile=sheet.crop(box)
 if i==2:tile.paste((0,0,0,0),(512,280,538,768))
 if i==3:tile.paste((0,0,0,0),(0,0,26,280))
 if i>=2:tile.paste((0,0,0,0),(0,0,200,20))
 tile=tile.resize((round(tile.width*1.22),round(tile.height*1.22)),Image.Resampling.LANCZOS);layer=Image.new('RGBA',(720,1024));layer.alpha_composite(tile,(48,43));poses.append(layer);layer.save(out/f'pose-{i}.png')
order=[0,1,2,3,3,2,1,0];powers=[1,.78,1.12,.86,1.15,.92,.76,1.06];frames=[]
for i,j in enumerate(order):
 a=np.asarray(poses[j]).astype(float);r,g,b=a[:,:,0],a[:,:,1],a[:,:,2];m=np.clip((g-70)/60,0,1)*np.clip((r-b-65)/70,0,1)*np.clip((r-140)/70,0,1)*(a[:,:,3]/255)
 a[:,:,:3]*=(1+m[:,:,None]*(powers[i]-1)*.8);f=Image.fromarray(np.clip(a,0,255).astype('uint8'),'RGBA');f.save(out/'frames'/f'frame-{i:02d}.png');frames.append(f)
frames[0].save(out/'idle.webp',save_all=True,append_images=frames[1:],duration=160,loop=0,lossless=True)
previews=[]
for f in frames:
 bg=Image.new('RGB',f.size,(24,26,33));bg.paste(f,mask=f.getchannel('A'));bg.thumbnail((504,717),Image.Resampling.LANCZOS);previews.append(bg)
atlas=Image.new('RGB',(2016,1434),(24,26,33))
for i,f in enumerate(previews):atlas.paste(f,((i%4)*504,(i//4)*717))
atlas.save(out/'contact-sheet.png');pal=atlas.quantize(colors=255);seq=[f.quantize(palette=pal,dither=Image.Dither.NONE) for f in previews];seq[0].save(out/'idle.gif',save_all=True,append_images=seq[1:],duration=160,loop=0,disposal=2,optimize=False)
with Image.open(out/'idle.gif') as g:assert g.n_frames==8
(out/'animation.json').write_text(json.dumps({'frame_count':8,'duration_ms':1280,'canvas':[720,1024],'loop':True,'method':'Four drawn guard/breathing poses, fixed sheet scale and placement, eight fire-intensity frames; ping-pong body pose order','pose_order':order,'fire_intensity':powers},indent=2))
print('8 frames exported; originals untouched')

