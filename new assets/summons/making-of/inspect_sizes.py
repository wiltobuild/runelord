from PIL import Image,ImageDraw
from pathlib import Path
p=Path('outputs/dread-vanguard-states-r1/runtime');names=['idle','attack','cast','hit','block','wounded_idle','spawn','die'];b=Image.new('RGB',(1600,8*210),(35,35,40));d=ImageDraw.Draw(b)
for row,n in enumerate(names):
 fs=list((p/n).glob('*.png'))
 for i,f in enumerate(fs):
  im=Image.open(f);im.thumbnail((200,180));x=i*200;y=row*210;b.paste(im,(x,y),im);d.line((x,y+162,x+200,y+162),fill=(100,140,100));d.text((x+3,y+182),n+str(i),fill='white')
b.save('work/states-sizing.png')
