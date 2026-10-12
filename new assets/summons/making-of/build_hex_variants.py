from pathlib import Path
from PIL import Image, ImageDraw, ImageFont
import hashlib,json,shutil
root=Path(r'C:/Users/Wil/Documents/Codex/2026-10-09/sp-2')
out=root/'outputs/hex-votary-variants-r1'; out.mkdir(parents=True,exist_ok=True)
data=json.loads((root/'work/hex-generation-input.json').read_text())
ref=root/'outputs/demon-command-robes-r1/hex-votary.png'
sha=lambda p:hashlib.sha256(p.read_bytes()).hexdigest()
data['reference']={'path':str(ref),'sha256':sha(ref),'ledger_status':None,'basis':'Explicit current user-requested edit reference'}
board=Image.new('RGB',(1800,1060),(27,29,36)); d=ImageDraw.Draw(board)
font=ImageFont.truetype('C:/Windows/Fonts/segoeuib.ttf',30)
small=ImageFont.truetype('C:/Windows/Fonts/segoeui.ttf',20)
labels=['Dread Cowl','Gallows Veil','Widows Shroud']
for i,v in enumerate(data['variants']):
    dest=out/(v['name']+'.png');shutil.copy2(v['source'],dest)
    im=Image.open(dest).convert('RGBA')
    v['output_path']=str(dest);v['sha256']=sha(dest);v['size']=im.size;v['alpha_extrema']=im.getchannel('A').getextrema()
    box=im.getchannel('A').point(lambda a:255 if a>8 else 0).getbbox()
    if box:im=im.crop(box)
    im.thumbnail((570,925),Image.Resampling.LANCZOS)
    board.paste(im,(i*600+(600-im.width)//2,10+(925-im.height)//2),im)
    d.text((i*600+300,965),labels[i],font=font,anchor='mm',fill=(244,235,225))
    d.text((i*600+300,1008),'Hex Votary robe variant',font=small,anchor='mm',fill=(175,177,189))
board.save(out/'review-board.png')
(out/'generation.json').write_text(json.dumps(data,indent=2))
print(json.dumps([{'name':v['name'],'size':v['size'],'alpha':v['alpha_extrema'],'sha256':v['sha256']} for v in data['variants']],indent=2))

