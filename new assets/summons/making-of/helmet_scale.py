from PIL import Image,ImageDraw
from pathlib import Path
p=Path('outputs/dread-vanguard-states-r1/runtime');b=Image.new('RGB',(1600,900),(45,45,50));d=ImageDraw.Draw(b)
items=[('idle',0,(850,250,1080,470)),('attack',1,(850,240,1100,490)),('attack',2,(1000,260,1250,520)),('attack',3,(1000,240,1250,510)),('attack',4,(890,250,1170,530)),('cast',1,(890,260,1160,520)),('hit',1,(750,220,1020,490)),('block',2,(850,250,1100,500)),('wounded_idle',0,(850,380,1110,640)),('spawn',2,(850,270,1130,550)),('die',1,(750,200,1040,480)),('die',4,(610,665,890,860))]
for j,(n,i,box) in enumerate(items):
 im=Image.open(p/n/f'frame-{i:02}.png').crop(box);x=j%4*400;y=j//4*300;b.paste(im,(x,y),im);d.text((x,y+280),f'{n}{i} crop{box}',fill='white')
b.save('work/helmet-scale.png')
