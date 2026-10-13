from pathlib import Path
from PIL import Image, ImageDraw, ImageFont
root=Path(__file__).resolve().parents[1]
items=[('goatmen-samples-r1/cinderhorn-reaver.png','Cinderhorn Reaver','Goatman cleaver fighter'),('goatmen-samples-r1/blackhorn-cantor.png','Blackhorn Cantor','Goatman spellcaster'),('demon-soldier-samples-r2/iron-legionary-r2.png','Iron Legionary','Demon sword and shield infantry'),('demon-soldier-samples-r2/ash-pikeman-r2.png','Ash Pikeman','Demon spear infantry')]
board=Image.new('RGB',(1400,1720),(27,29,36))
draw=ImageDraw.Draw(board)
font=ImageFont.truetype('C:/Windows/Fonts/segoeuib.ttf',34)
small=ImageFont.truetype('C:/Windows/Fonts/segoeui.ttf',24)
for i,(src,label,desc) in enumerate(items):
    x=(i%2)*700; y=(i//2)*860
    im=Image.open(root/'outputs'/src).convert('RGBA')
    # Bound by meaningful alpha, retaining a soft edge and all character pixels.
    box=im.getchannel('A').point(lambda p:255 if p>8 else 0).getbbox()
    if box:
        box=(max(0,box[0]-5),max(0,box[1]-5),min(im.width,box[2]+5),min(im.height,box[3]+5))
        im=im.crop(box)
    im.thumbnail((610,720),Image.Resampling.LANCZOS)
    board.paste(im,(x+(700-im.width)//2,y+22+(720-im.height)//2),im)
    draw.text((x+350,y+760),label,font=font,fill=(240,232,224),anchor='mm')
    draw.text((x+350,y+804),desc,font=small,fill=(171,174,185),anchor='mm')
draw.line((700,24,700,1696),fill=(55,57,66),width=2)
draw.line((24,860,1376,860),fill=(55,57,66),width=2)
board.save(root/'outputs/summon-samples-r2.png')

