from PIL import Image,ImageDraw,ImageChops
from pathlib import Path
import json,shutil,hashlib
W=Path.cwd();out=W/'outputs/dread-vanguard-states-r1';gen=Path('C:/Users/Wil/.codex/generated_images/01a121e0-56af-7a60-ab35-aca1dfa8c499');size=(2000,1200)
def pad(im,xy):
 f=Image.new('RGBA',size);f.alpha_composite(im,xy);return f
idle=[pad(Image.open(W/f'outputs/dread-vanguard-idle-r5/frames/frame-{i:02}.png').convert('RGBA'),(640,100)) for i in range(8)]
def export(name,frames,times,loop=False,impact=None):
 d=out/name; (d/'frames').mkdir(parents=True,exist_ok=True)
 for i,f in enumerate(frames):f.save(d/f'frames/frame-{i:02}.png')
 meta={'state':name,'canvas':list(size),'anchor':[1000,1080],'duration':sum(times),'loop':loop,'impact':impact,'events':[],'frames':[{'time':sum(times[:i]),'file':f'frames/frame-{i:02}.png','duration_ms':t} for i,t in enumerate(times)]}
 (d/'animation.json').write_text(json.dumps(meta,indent=2))
 previews=[]
 for f in frames:
  bg=Image.new('RGBA',size,(24,26,33,255));bg.alpha_composite(f);previews.append(bg.convert('RGB').resize((750,500)))
 previews[0].save(d/'animation.gif',save_all=True,append_images=previews[1:],duration=times,loop=0,disposal=2)
 board=Image.new('RGB',(300*len(frames),225),(24,26,33));draw=ImageDraw.Draw(board)
 for i,f in enumerate(previews):board.paste(f.resize((300,200)),(i*300,0));draw.text((i*300+8,204),f'{name} {i+1}: {times[i]} ms',fill='white')
 board.save(d/'contact-sheet.png')
 return meta
specs={
 'attack':('exec-13d457b9-d5c2-46e8-9bfb-885e41b6e64d.png',[(0,0,768,495),(768,0,1536,495),(0,512,840,1000),(850,512,1536,1000)],[(428,480),(1068,489),(379,980),(1094,980)],2.1,[80,170,90,110,140,160],250),
 'cast':('exec-8486939a-5dd6-4892-ba79-5dc0b4e56778.png',[(0,0,887,887),(887,0,1774,887)],[(539,833),(1295,833)],1.12,[100,220,260,140,160],320)}
for name,(fn,boxes,anchors,scale,times,impact) in specs.items():
 d=out/name;d.mkdir(exist_ok=True);shutil.copy2(gen/fn,d/'source-sheet.png');im=Image.open(gen/fn).convert('RGBA');poses=[]
 for box,(ax,ay) in zip(boxes,anchors):
  crop=im.crop(box); crop=crop.resize((round(crop.width*scale),round(crop.height*scale)),Image.Resampling.LANCZOS)
  poses.append(pad(crop,(1000+round((box[0]-ax)*scale),1080+round((box[1]-ay)*scale))))
 frames=[idle[0]]+poses+[idle[0]] if name=='attack' else [idle[0],poses[0],poses[1],poses[0],idle[0]]
 export(name,frames,times,impact=impact)
 (d/'generation.json').write_text(json.dumps({'tool':'image_gen','source':fn,'source_sha256':hashlib.sha256((d/'source-sheet.png').read_bytes()).hexdigest(),'fixed_scale':scale,'source_anchors':anchors,'method':'Authored whole-character keyposes; fixed anatomical scale and ground registration, approved idle endpoints.'},indent=2))
manifest={'name':'Dread Vanguard','size':list(size),'anchor':[1000,1080],'states':{}}
for name in ['idle','attack','cast','hit','block','wounded_idle','spawn','die']:
 rd=out/'runtime'/name;rd.mkdir(parents=True,exist_ok=True)
 if name=='idle':frames=idle;meta={'duration':1280,'loop':True,'impact':None,'events':[],'frames':[{'time':i*160} for i in range(8)]}
 else:
  meta=json.loads((out/name/'animation.json').read_text());frames=[Image.open(out/name/f['file']).convert('RGBA') for f in meta['frames']]
  if frames[0].size==(1200,1100):frames=[pad(f,(400,60)) for f in frames]
 for i,f in enumerate(frames):f.save(rd/f'frame-{i:02}.png')
 manifest['states'][name]={'duration':meta['duration'],'loop':meta['loop'],'impact':meta.get('impact'),'events':[],'frames':[{'time':f['time'],'src':f'{name}/frame-{i:02}.png'} for i,f in enumerate(meta['frames'])]}
(out/'runtime/animation.json').write_text(json.dumps(manifest,indent=2))
print('Exported',list(manifest['states']))


