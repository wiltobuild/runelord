from PIL import Image
from pathlib import Path
import json
p=Path(__file__).parent;frames=[];records=[]
for i in range(4):
 im=Image.open(p/f'source/idle-{i:02}.png');b=im.getchannel('A').point(lambda v:255 if v>127 else 0).getbbox();off=(768-(b[0]+b[2])//2,1400-b[3]);fr=Image.new('RGBA',(1536,1536));fr.alpha_composite(im,off);fr.save(p/f'frame-{i:02}.png');bg=Image.new('RGB',(768,768),'#242630');pic=fr.resize((768,768));bg.paste(pic,(0,0),pic);frames.append(bg);records.append({'id':i,'file':f'frame-{i:02}.png','source':f'source/idle-{i:02}.png','source_dimensions':list(im.size)})
frames[0].save(p/'idle-proof.gif',save_all=True,append_images=frames[1:],duration=[350]*4,loop=0)
(p/'animation.json').write_text(json.dumps({'frames':records,'animations':{'idle':{'frames':[0,1,2,3],'durations_ms':[350]*4,'loop':True}},'geometry':{'canvas_px':[1536,1536],'root_px':[768,1400]}}))
