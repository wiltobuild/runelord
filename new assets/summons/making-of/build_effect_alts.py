from PIL import Image,ImageDraw,ImageFont
from pathlib import Path
p=Path(__file__).resolve().parents[1]/'outputs/dread-vanguard-effect-alternatives-r1'
c=Image.new('RGB',(1200,1000),(27,29,36)); d=ImageDraw.Draw(c)
f=ImageFont.truetype('C:/Windows/Fonts/segoeuib.ttf',31); s=ImageFont.truetype('C:/Windows/Fonts/segoeui.ttf',23)
for i,(name,title,desc) in enumerate([('molten-cutting-edges.png','A — Molten Cutting Edges','Hot blade outline + engraved runes'),('rune-ignition.png','B — Rune Ignition','Dark blade + runes and sparse embers')]):
 im=Image.open(p/name).convert('RGBA'); im.thumbnail((570,840),Image.Resampling.LANCZOS); c.paste(im,(i*600+(600-im.width)//2,20+(840-im.height)//2),im)
 d.text((i*600+300,904),title,font=f,fill=(240,234,228),anchor='mm'); d.text((i*600+300,947),desc,font=s,fill=(171,174,185),anchor='mm')
d.line((600,20,600,980),fill=(55,57,66),width=2); c.save(p/'review-board.png')
