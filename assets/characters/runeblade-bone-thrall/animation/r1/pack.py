from PIL import Image,ImageDraw
from pathlib import Path
import json,hashlib
ROOT=Path(__file__).parent
def pack(id,source,rects,anchors):
 d=ROOT/id; (d/'frames').mkdir(exist_ok=True,parents=True); (d/'previews').mkdir(exist_ok=True)
 im=Image.open(d/source).convert('RGBA'); frames=[]; meta=[]
 for i,(rect,a) in enumerate(zip(rects,anchors)):
  source_name=source; source_scale=1
  if id=='bone-thrall-v1-r1' and i in [2,5,6,7,10,11,14,15]:
   source_name='source-supplement-r1.png'; sup=Image.open(d/source_name).convert('RGBA'); source_scale=0.83
   si={2:2,5:1,6:2,7:3,10:4,11:5,14:6,15:7}[i]; sx=[0,449,900,1345,1774]; sy=[0,475,887]; sr=si//4; sc=si%4
   rect=[sx[sc],sy[sr],sx[sc+1],sy[sr+1]]
   a=([199,687,1091,1504,199,646,1056,1505][si],[474,474,474,474,872,872,872,872][si])
   crop=sup.crop(rect); crop=crop.resize((round(crop.width*source_scale),round(crop.height*source_scale)),Image.Resampling.LANCZOS)
  else: crop=im.crop(rect)
  if id=='bone-thrall-v1-r1' and i==4:
   # A disconnected tip from adjacent cell's sword intrudes here; this is cell extraction only.
   crop.paste((0,0,0,0),(305,224,337,314))
  f=Image.new('RGBA',(512,512)); offset=(round(256+(rect[0]-a[0])*source_scale),round(460+(rect[1]-a[1])*source_scale)); f.alpha_composite(crop,offset); f.save(d/'frames'/f'{i:02}.png'); frames.append(f)
  meta.append(dict(file=f'frames/{i:02}.png',source=source_name,source_uniform_scale=source_scale,source_rect=rect,source_ground_anchor=a,packing_translation=[256-a[0]*source_scale,460-a[1]*source_scale],alpha_bounds=f.getbbox(),atlas_rect=[(i%4)*512,(i//4)*512,512,512],trim_offset=[0,0],exclusion_rects=([[305,570,326,660]] if id=='bone-thrall-v1-r1' and i==4 else [])))
 states={
 'idle':dict(frames=[0,1,0],durations=[350,450,350],loop=True),
 'attack':dict(frames=[2,3,4,0],durations=[90,70,100,90],loop=False,events=[dict(name='impact',time_ms=90)],next='idle'),
 'hit':dict(frames=[5,6,0],durations=[100,140,100],loop=False,next='idle'),
 'die':dict(frames=[6,7,8,9],durations=[100,160,150,500],loop=False,terminal='hold_last'),
 'wounded_idle':dict(frames=[10,11,10],durations=[450,400,450],loop=True),
 'guard':dict(frames=[12,13],durations=[120,400],loop=False,terminal='hold_last',exit='idle'),
 'spawn':dict(frames=[14,15,0],durations=[180,160,140],loop=False,next='idle',events=[dict(name='arrival',time_ms=340)])}
 atlas=Image.new('RGBA',(2048,2048))
 for i,f in enumerate(frames): atlas.alpha_composite(f,((i%4)*512,(i//4)*512))
 atlas.save(d/'atlas.png')
 manifest=dict(id=id,format='transparent-frame-animation',source=source,source_sha256=hashlib.sha256((d/source).read_bytes()).hexdigest(),source_dimensions=list(im.size),canvas=[512,512],anchor=[256,460],coordinate_system='top-left; x right, y down',facing='right',scale='1 native source pixel = 1 packed pixel; no per-frame resizing',root_motion='in-place; measured planted ground normalized to y460, death remains lying at ground',frames=meta,states=states,aliases={'act':'attack'},limitations=['Sparse generated keyframe animation; no interpolation','Generated poses may exhibit silhouette/gear jitter; review pending','Native character height approximately 300px, not 1024px per frame'])
 (d/'manifest.json').write_text(json.dumps(manifest,indent=2))
 for name,s in states.items():
  gifs=[]
  for n in s['frames']:
   bg=Image.new('RGBA',(640,550),(27,35,44,255)); bg.alpha_composite(frames[n],(0,0)); small=frames[n].resize((164,164),Image.Resampling.LANCZOS); bg.alpha_composite(small,(468,324)); draw=ImageDraw.Draw(bg);draw.text((12,15),id+' / '+name,fill='white');draw.text((477,510),'96px scale',fill='white');gifs.append(bg.convert('RGB'))
  kw={'loop':0} if s['loop'] else {}
  gifs[0].save(d/'previews'/f'{name}.gif',save_all=True,append_images=gifs[1:],duration=s['durations'],disposal=2,**kw)
 html='''<!doctype html><meta charset="utf-8"><title>Animation review</title><style>body{background:#1b232c;color:white;font:16px system-ui} .states{display:flex;gap:8px;flex-wrap:wrap}canvas{background:#273545;max-width:100%} .light{background:#ded7c7}button{padding:8px}</style><h1>'''+id+'''</h1><p>Native transparent frames. Choose state; death holds terminal pose. Sparse keyframes; review pending.</p><div class="states"></div><button id="replay">Replay</button><button id="bg">Light / dark</button><br><canvas width="512" height="512"></canvas><canvas id="small" width="164" height="164"></canvas><p id="info"></p><script>fetch('manifest.json').then(r=>r.json()).then(async m=>{let imgs=await Promise.all(m.frames.map(f=>new Promise(ok=>{let i=new Image;i.onload=()=>ok(i);i.src=f.file})));let state='idle',start=performance.now(),c=document.querySelector('canvas'),sm=document.querySelector('#small');for(let n in m.states){let b=document.createElement('button');b.textContent=n;b.onclick=()=>{state=n;start=performance.now()};document.querySelector('.states').append(b)}replay.onclick=()=>start=performance.now();bg.onclick=()=>{c.classList.toggle('light');sm.classList.toggle('light')};function tick(t){let s=m.states[state],sum=s.durations.reduce((a,b)=>a+b),elapsed=t-start,v=s.loop?elapsed%sum:Math.min(elapsed,sum-1),k=0;while(v>=s.durations[k]&&k<s.frames.length-1)v-=s.durations[k++];for(let cv of[c,sm]){let x=cv.getContext('2d');x.clearRect(0,0,cv.width,cv.height);x.drawImage(imgs[s.frames[k]],0,0,cv.width,cv.height)}info.textContent=state+' · frame '+s.frames[k]+' · '+sum+' ms';requestAnimationFrame(tick)}requestAnimationFrame(tick)})</script>'''
 (d/'preview.html').write_text(html)
 return manifest
if __name__=='__main__':
 rects=[]
 ys=[0,346,660,940,1254]; xs=[[0,326,636,888,1254],[0,326,625,937,1254],[0,314,651,942,1254],[0,315,633,949,1254]]
 for r in range(4):
  for c in range(4):rects.append([xs[r][c],ys[r],xs[r][c+1],ys[r+1]])
 anchors=list(zip([154,472,753,1030,151,483,775,1069,150,484,782,1097,162,477,766,1079],[340,340,338,337,650,646,648,644,924,937,934,935,1234,1234,1235,1235]))
 rects[4][2]=337; rects[8][3]=929
 pack('bone-thrall-v1-r1','source-sheet-r3.png',rects,anchors)

