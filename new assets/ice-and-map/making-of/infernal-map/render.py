from pathlib import Path
import subprocess,re,json,io
from PIL import Image,ImageDraw,ImageFont
repo=r'C:/Users/Wil/Documents/Codex/2026-10-09/i-x20/runelord'
git=r'C:/Program Files/Git/cmd/git.exe'
def blob(p):return subprocess.check_output([git,'show','origin/conquer-mode:'+p],cwd=repo)
a='apps/web/public/infernal-assets/'
im=Image.open(io.BytesIO(blob(a+'map-detail-r2.webp'))).convert('RGB')
im.save('work/infernal-map/base.png')
layout=blob('apps/web/src/infernalMapLayout.ts').decode()
pos=json.loads(re.search(r'const CIRCUIT_GROUND_POSITIONS:number\[\]\[\]\[\]=\s*(\[.*?\]);',layout,re.S).group(1).replace(',\n]', '\n]'))
kinds=['combat','combat','combat','shop','combat','treasure','elite','combat','shop','combat','treasure','combat','elite','boss']
W,H=3344,1882
canvas=im.resize((W,H),Image.Resampling.LANCZOS)
d=ImageDraw.Draw(canvas)
font=ImageFont.truetype('C:/Windows/Fonts/segoeuib.ttf',25)
title=ImageFont.truetype('C:/Windows/Fonts/segoeuib.ttf',48)
colors={'combat':'#ffcf91','shop':'#81e9cd','treasure':'#ffe278','elite':'#ff8b63','boss':'#ff5464'}
labels={'combat':'Combat','shop':'Shop','treasure':'Treasure','elite':'Elite','boss':'Sovereign'}
d.rectangle((0,0,W,112),fill='#140e15');d.text((55,24),'INFERNAL PLANE — ALL MAP POINTS',font=title,fill='#ffe4b2')
i=0
for row,points in enumerate(pos):
 for lane,(x,y) in enumerate(points):
  i+=1;x*=2;y*=2;k=kinds[row];c=colors[k]
  d.ellipse((x-24,y-24,x+24,y+24),fill='#20131b',outline=c,width=4)
  number=str(i);bb=d.textbbox((0,0),number,font=font);d.text((x-(bb[2]-bb[0])/2,y-19),number,font=font,fill=c)
  text=labels[k];bb=d.textbbox((0,0),text,font=font);tw=bb[2]-bb[0]
  d.rounded_rectangle((x-tw/2-10,y+28,x+tw/2+10,y+66),radius=6,fill='#1b1019',outline=c,width=1)
  d.text((x-tw/2,y+29),text,font=font,fill=c)
d.rectangle((0,H-95,W,H),fill='#140e15')
d.text((55,H-70),f'{i} authored locations • all revealed • numbered in route order • conquest branch layout',font=font,fill='#edd7b6')
Path('outputs').mkdir(exist_ok=True)
canvas.save('outputs/infernal-plane-all-points.png')
print({'points':i,'size':canvas.size,'output':'outputs/infernal-plane-all-points.png'})
