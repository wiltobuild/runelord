from pathlib import Path
from PIL import Image,ImageDraw
import hashlib,json
P=Path(__file__).parent;OLD=P.parent/'frames32-r1';sha=lambda p:hashlib.sha256(p.read_bytes()).hexdigest()
m=json.loads((OLD/'animation.json').read_text());m['revision']='frames32-r2';m['status']='Idle repair pending independent QA and user approval'
for i in [1,2,3]:
 f=m['frames'][i];src=P/f['source'];im=Image.open(src).convert('RGBA');b=im.getchannel('A').point(lambda v:255 if v>127 else 0).getbbox();off=m['frames'][0]['translation'];fr=Image.new('RGBA',(1536,1536));fr.alpha_composite(im,off);fr.save(P/f['file']);f.update(sha256=sha(P/f['file']),source_sha256=sha(src),source_dimensions=list(im.size),translation=off,visible_bbox=list(fr.getchannel('A').point(lambda v:255 if v>127 else 0).getbbox()))
for i in [0]+list(range(4,32)):
 assert sha(P/m['frames'][i]['file'])==sha(OLD/m['frames'][i]['file']);assert sha(P/m['frames'][i]['source'])==sha(OLD/m['frames'][i]['source'])
old=json.loads((OLD/'animation.json').read_text());assert m['animations']==old['animations'] and m['geometry']==old['geometry']
assert len(set(f['source_sha256'] for f in m['frames']))==32
pre=[]
for i in range(4):
 pic=Image.open(P/m['frames'][i]['file']).resize((1024,1024),Image.Resampling.LANCZOS);bg=Image.new('RGB',(1024,1024),'#242630');bg.paste(pic,(0,0),pic);ImageDraw.Draw(bg).text((12,12),'Gorthak frames32-r2 / restrained idle',fill='white');pre.append(bg)
pre[0].save(P/'idle.gif',save_all=True,append_images=pre[1:],duration=m['animations']['idle']['durations_ms'],loop=0,disposal=2)
(P/'animation.json').write_text(json.dumps(m,indent=2));(P/'manifest.json').write_text(json.dumps(m,indent=2));(P/'idle-repair-checks.json').write_text(json.dumps({'unchanged_nonidle_frames':28,'unchanged_neutral':True,'unchanged_all_timing_and_geometry':True,'source_registration':'all idle use exact neutral translation, not silhouette fit','unique_frames':32},indent=2));print(sha(P/'animation.json'))
