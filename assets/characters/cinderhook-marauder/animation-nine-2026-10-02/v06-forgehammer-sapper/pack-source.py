from PIL import Image,ImageDraw,ImageFilter,ImageChops
from pathlib import Path
import json,hashlib,sys
root=Path('C:/Users/wilsh/Projects/runelord/assets/characters/cinderhook-marauder/animation-nine-2026-10-02')
vid=sys.argv[1]; d=root/vid; src=d/'source-sheet-r1.png'
im=Image.open(src).convert('RGBA'); w,h=im.size
alpha=bytearray(im.getchannel('A').tobytes()); components=[]; componentPixels={}
for p in range(w*h):
 if alpha[p]==0:continue
 stack=[p];alpha[p]=0;count=0;x0=w;y0=h;x1=0;y1=0; pixels=[]
 while stack:
  q=stack.pop();pixels.append(q);y,x=divmod(q,w);count+=1;x0=min(x0,x);x1=max(x1,x);y0=min(y0,y);y1=max(y1,y)
  for v in (q-1 if x else -1,q+1 if x+1<w else -1,q-w if y else -1,q+w if y+1<h else -1):
   if v>=0 and alpha[v]:alpha[v]=0;stack.append(v)
 if count>500:
  box=(x0,y0,x1+1,y1+1);components.append(box);componentPixels[box]=pixels
if vid.startswith('v08') and len(components)==17:
 last=[b for b in components if b[0]>920 and b[1]>1000]
 merged=(min(b[0] for b in last),min(b[1] for b in last),max(b[2] for b in last),max(b[3] for b in last))
 componentPixels[merged]=sum([componentPixels[b] for b in last],[])
 components=[b for b in components if b not in last]+[merged]
assert len(components)==16,components
components.sort(key=lambda b:((b[1]+b[3])//2//(h//4),b[0]))
margin=20 if vid.startswith('v06') else 90
cols=4; rows=4; size=max(round(w/4),round(h/4))+margin*2; ground=size-20
frames=[]; rects=[]; hashes=[]
(d/'frames').mkdir(exist_ok=True)
for i in range(16):
 c=i%4;r=i//4;box=components[i]
 tile=im.crop(box)
 if not vid.startswith('v06'):
  # Sprite extraction: isolate the disconnected source pose, preserving original RGBA.
  mask=Image.new('L',tile.size);mp=mask.load()
  for q in componentPixels[box]:
   py,px=divmod(q,w);mp[px-box[0],py-box[1]]=255
  mask=mask.filter(ImageFilter.MaxFilter(5))
  tile.putalpha(ImageChops.multiply(tile.getchannel('A'),mask))
 if vid=='v06-forgehammer-sapper' and (d/'source-sheet-r2.png').exists() and i in [8,15]:
  repair=Image.open(d/'source-sheet-r2.png').convert('RGBA')
  box=(23,642,290,931) if i==8 else (943,1080,1245,1247)
  tile=repair.crop(box)
 if vid.startswith('v07') and (d/'source-sheet-r3.png').exists() and i in [10,11]:
  repair=Image.open(d/'source-sheet-r3.png').convert('RGBA')
  box=(678,651,938,953) if i==10 else (980,680,1242,953)
  tile=repair.crop(box)
 bbox=tile.getchannel('A').getbbox()
 # Deterministic canvas registration only. No drawn pixels altered; no scale/warp.
 dx=margin+box[0]-round(c*w/4);dy=ground-bbox[3]
 out=Image.new('RGBA',(size,size));out.alpha_composite(tile,(dx,dy))
 name=f'frames/{i:02}.png';out.save(d/name);frames.append(out)
 rects.append({'file':name,'sourceRect':box,'registrationOffset':[dx,dy],'bbox':out.getchannel('A').getbbox()})
 hashes.append(hashlib.sha256((d/name).read_bytes()).hexdigest())
states={
 'idle':([0,1,2,3,2,1],[230]*6,True,[],'idle'),
 'attack':([0,4,5,6,7,9,0],[70,160,100,90,100,100,80],False,[{'name':'impact','timeMs':330}],'idle'),
 'hit':([0,8,9,0],[40,100,100,80],False,[],'idle'),
 'wounded_idle':([10,11,10],[300,400,300],True,[],'wounded_idle'),
 'die':([0,12,13,14,15],[80,130,150,160,1200],False,[{'name':'death','timeMs':520}],None)}
if not vid.startswith('v06'):
 states['attack']=([0,4,5,6,7,0],[40,80,50,60,60,60],False,[{'name':'impact','timeMs':170}],'idle')
if vid.startswith(('v08','v09')):
 states['idle']=([0,1,0],[300,400,300],True,[],'idle')
if vid.startswith('v08'):
 states['hit']=([0,8,0],[40,170,110],False,[],'idle')
 states['cast']=([0,2,3,2,0],[50,140,140,110,80],False,[{'name':'release','timeMs':190}],'idle')
if vid.startswith('v09'):
 states['guard']=([0,2,3,2,0],[80,120,400,120,80],False,[{'name':'guard_on','timeMs':200},{'name':'guard_off','timeMs':600}],'idle')
atlas=Image.new('RGBA',(size*4,size*4))
for i,f in enumerate(frames):atlas.alpha_composite(f,((i%4)*size,(i//4)*size))
atlas.save(d/'atlas.png')
master=root.parent/'variants-nine-2026-10-02'/f'{vid}-r1.png'
m={'variantId':vid,'revision':'r2' if src.name.endswith('r2.png') else 'r1','method':'whole-character-frames','source':{'path':str(master),'sha256':hashlib.sha256(master.read_bytes()).hexdigest()},'generatedSource':{'file':src.name,'sha256':hashlib.sha256(src.read_bytes()).hexdigest(),'dimensions':[w,h]},'canvas':{'width':size,'height':size},'anchor':{'x':size//2,'y':ground},'coordinateSystem':'top-left pixels, x right y down','states':{},'atlas':{'file':'atlas.png','width':size*4,'height':size*4,'frames':[]},'registration':rects,'previews':['preview.html','review.gif'],'limitations':['Sparse authored pose proof; not interpolated high-frame-rate animation.','Frame identity and contact stability require independent review.','Native cropped frame resolution is about 314px; not an HD 1024px per-frame master.','Action timing is role-specific; heavy hammer700ms; light attacks350ms.']}
for i in range(16):m['atlas']['frames'].append({'file':f'frames/{i:02}.png','rect':[i%4*size,i//4*size,size,size],'sourceSize':[size,size],'trimOffset':[0,0],'sha256':hashes[i]})
for name,(ids,times,loop,events,nxt) in states.items():
 m['states'][name]={'frames':[{'file':f'frames/{i:02}.png','durationMs':t} for i,t in zip(ids,times)],'loop':loop,'events':events,'nextState':nxt,'terminal':'hold final frame' if name=='die' else None,'durationMs':sum(times)}
 gif=[]
 for i in ids:
  bg=Image.new('RGB',(size,size),(32,34,39));bg.paste(frames[i],(0,0),frames[i]);gif.append(bg)
 kw={'loop':0} if loop else {}
 gif[0].save(d/f'{name}.gif',save_all=True,append_images=gif[1:],duration=times,disposal=2,**kw)
review=[];timings=[]
for name,(ids,times,loop,events,nxt) in states.items():
 for i,t in zip(ids,times):
  bg=Image.new('RGB',(size*2,size+38),(31,33,38));bg.paste((236,232,219),(size,0,size*2,size+38))
  bg.paste(frames[i],(0,30),frames[i]);small=frames[i].resize((round(size*.34),round(size*.34)),Image.Resampling.LANCZOS)
  bg.paste(small,(size+32,size-small.height+28),small)
  draw=ImageDraw.Draw(bg);draw.text((10,8),vid+' / '+name,fill='white');draw.text((size+10,8),'~96px scale',fill='black')
  review.append(bg);timings.append(t)
review[0].save(d/'review.gif',save_all=True,append_images=review[1:],duration=timings,disposal=2)
if (d/'source-sheet-r2.png').exists():
 m['revision']='r2';m['repairedSource']={'file':'source-sheet-r2.png','sha256':hashlib.sha256((d/'source-sheet-r2.png').read_bytes()).hexdigest(),'usedFrames':[8,15]}
if (d/'source-sheet-r3.png').exists():
 m['revision']='r3';m['repairedSource']={'file':'source-sheet-r3.png','sha256':hashlib.sha256((d/'source-sheet-r3.png').read_bytes()).hexdigest(),'usedFrames':[10,11]}
if vid.startswith('v08'):
 m['excludedFrames']=[{'file':'frames/09.png','reason':'Generated recovery pose loses staff; deliberately not referenced by runtime states.'}]
(d/'manifest.json').write_text(json.dumps(m,indent=2))
html='''<!doctype html><meta charset="utf-8"><title>Goblin animation review</title><style>body{background:#222;color:#eee;font:16px system-ui}canvas{border:1px solid #777;margin:12px}button,select{font:inherit;padding:8px} .row{display:flex;flex-wrap:wrap;align-items:flex-start}</style><h1>VARIANT</h1><p>Sparse whole-character animation proof • exact generated poses • death holds terminal frame.</p><select id="state"></select><button id="play">Replay</button><button id="pause">Pause</button><button id="step">Step frame</button><span id="info"></span><div class="row"><canvas id="dark"></canvas><canvas id="light"></canvas><canvas id="small" width="160" height="160"></canvas></div><script>const M=MANIFEST;const imgs={};let key='idle',index=0,last=performance.now(),paused=false;for(const s of Object.values(M.states))for(const f of s.frames){if(!imgs[f.file]){let i=new Image;i.src=f.file;imgs[f.file]=i}}const select=document.querySelector('#state');for(const k of Object.keys(M.states))select.add(new Option(k,k));function reset(){key=select.value;index=0;last=performance.now();paused=false}select.onchange=reset;play.onclick=reset;pause.onclick=()=>paused=!paused;step.onclick=()=>{paused=true;index=(index+1)%M.states[key].frames.length};for(const id of ['dark','light']){let c=document.getElementById(id);c.width=M.canvas.width;c.height=M.canvas.height}function tick(t){let s=M.states[key];if(!paused&&t-last>=s.frames[index].durationMs){last=t;if(index<s.frames.length-1)index++;else if(s.loop)index=0;else if(s.nextState){key=s.nextState;select.value=key;index=0;s=M.states[key]}else paused=true}let f=s.frames[index];for(const id of ['dark','light','small']){let c=document.getElementById(id),x=c.getContext('2d');x.fillStyle=id==='light'?'#ece8db':'#22252a';x.fillRect(0,0,c.width,c.height);if(imgs[f.file].complete){if(id==='small'){let q=Math.round(M.canvas.height*96/(M.registration[0].bbox[3]-M.registration[0].bbox[1]));x.drawImage(imgs[f.file],(160-q)/2,145-M.anchor.y/M.canvas.height*q,q,q)}else x.drawImage(imgs[f.file],0,0)}}info.textContent=key+' frame '+index+' / '+f.file+' '+(paused?'paused':'playing');requestAnimationFrame(tick)}requestAnimationFrame(tick)</script>'''
(d/'preview.html').write_text(html.replace('VARIANT',vid).replace('MANIFEST',json.dumps(m)))
print(json.dumps({'variant':vid,'canvas':size,'source':[w,h],'frameHashes':hashes,'sheetAlphaExtrema':im.getchannel('A').getextrema(),'bounds':rects},indent=2))






