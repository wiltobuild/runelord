from pathlib import Path
from PIL import Image,ImageDraw,ImageFont
root=Path(__file__).resolve().parents[1]/'outputs/infernal-captain-alternates-r1'
items=[('obsidian-marshal.png','Obsidian Marshal','Broad armor / rune execution sword'),('dread-vanguard.png','Dread Vanguard','Blade armor / rune greatsword'),('hellforge-commandant.png','Hellforge Commandant','Layered mantle / rune poleaxe')]
c=Image.new('RGB',(1800,1000),(27,29,36)); d=ImageDraw.Draw(c)
f=ImageFont.truetype('C:/Windows/Fonts/segoeuib.ttf',31); s=ImageFont.truetype('C:/Windows/Fonts/segoeui.ttf',23)
for i,(name,title,desc) in enumerate(items):
 im=Image.open(root/name).convert('RGBA'); im.thumbnail((570,840),Image.Resampling.LANCZOS)
 c.paste(im,(i*600+(600-im.width)//2,20+(840-im.height)//2),im)
 d.text((i*600+300,904),title,font=f,fill=(241,235,229),anchor='mm'); d.text((i*600+300,947),desc,font=s,fill=(171,174,185),anchor='mm')
 if i:d.line((i*600,20,i*600,980),fill=(55,57,66),width=2)
c.save(root/'review-board.png')

