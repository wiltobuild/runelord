from PIL import Image,ImageDraw,ImageFilter
from pathlib import Path
import numpy as np
import json,hashlib,sys
ROOT=Path('C:/Users/wilsh/Projects/runelord/assets/animations/fire-monsters-2026-10-02')
vid=sys.argv[1];d=ROOT/vid;hand=json.loads((ROOT/'handoff.json').read_text());identity=next(m for m in hand['monsters'] if m['id']==vid)
W,H,G=640,512,448;allframes={};rects={};srcs=[]
for st in identity['required_states']:
 candidates=sorted((d/'source').glob(st+'-r*.png'))
 if not candidates:continue
 src=candidates[-1];im=Image.open(src).convert('RGBA');data=np.array(im);a=data[:,:,3];solid=a>128;h,w=solid.shape;labels=np.zeros((h,w),dtype=np.int32);comps=[];n=0
 for yy,xx in zip(*np.where(solid)):
  if labels[yy,xx]:continue
  n+=1;q=[(int(xx),int(yy))];labels[yy,xx]=n;pts=[]
  while q:
   x,y=q.pop();pts.append((x,y))
   for u,v in [(x-1,y),(x+1,y),(x,y-1),(x,y+1)]:
    if 0<=u<w and 0<=v<h and solid[v,u] and not labels[v,u]:labels[v,u]=n;q.append((u,v))
  if len(pts)>500:
   xs,ys=zip(*pts);comps.append({'id':n,'count':len(pts),'box':[min(xs),min(ys),max(xs)+1,max(ys)+1]})
 majors=sorted(comps,key=lambda c:c['count'],reverse=True)[:6]
 assert len(majors)==6,(vid,st,len(majors))
 majors.sort(key=lambda c:(c['box'][1]+c['box'][3])/2);ordered=[]
 for r in range(2):ordered.extend(sorted(majors[r*3:(r+1)*3],key=lambda c:(c['box'][0]+c['box'][2])/2))
 allframes[st]=[];rects[st]=[]
 for i,co in enumerate(ordered):
  r,c=divmod(i,3);x0,y0,x1,y1=co['box'];box=(max(0,x0-4),max(0,y0-4),min(w,x1+4),min(h,y1+4));crop=im.crop(box)
  mask=Image.fromarray(((labels[box[1]:box[3],box[0]:box[2]]==co['id'])*255).astype('uint8')).filter(ImageFilter.MaxFilter(9));ca=np.array(crop);ca[:,:,3]=np.where(np.array(mask)>0,ca[:,:,3],0);crop=Image.fromarray(ca)
  # Source sheet entire canvas standardized to1536x1024 if provider varies.
  scale=1536/w
  if scale!=1:crop=crop.resize((round(crop.width*scale),round(crop.height*scale)),Image.Resampling.LANCZOS)
  off=(round((box[0]-c*w/3)*scale+64),round(G-(y1-box[1])*scale));f=Image.new('RGBA',(W,H));f.alpha_composite(crop,off)
  assert f.getchannel('A').getbbox()[0]>0 and f.getchannel('A').getbbox()[2]<W,(vid,st,i,'horizontal clipping')
  allframes[st].append(f);rects[st].append({'source':src.relative_to(d).as_posix(),'box':list(box),'offset':list(off),'scale':scale,'component':co['id'],'slicing':'connected component threshold128 plus4px antialias padding; source RGBA retained'})
 srcs.append({'file':src.relative_to(d).as_posix(),'sha256':hashlib.sha256(src.read_bytes()).hexdigest(),'dimensions':[w,h],'bodyBounds':[c['box'] for c in ordered]})
timings={'idle':[180]*6,'attack':[50,60,60,50,60,70],'hit':[40,50,70,70,60,60],'wounded_idle':[220]*6,'die':[100,120,130,150,200,700],'guard':[90,100,150,150,100,90],'charge':[80,80,90,90,80,80],'cast':[90,90,100,100,90,90],'broodfire_sweep':[100,110,120,100,100,120]}
m={'variantId':vid,'source':{'path':identity['asset_path'],'sha256':identity['sha256']},'identitySource':identity,'canvas':{'width':W,'height':H},'anchor':{'x':320,'y':G},'coordinateSystem':'top-left pixels;x right,y down','facing':'left','method':'reference-conditioned whole-character frames','states':{},'sourceRects':rects,'generation':{'tool':'built-in image_gen','sources':srcs,'prompts':[p.relative_to(d).as_posix() for p in sorted((d/'source').glob('prompt-*.txt'))]},'previews':{},'limitations':['Six authored poses per state; generated pose/shape jitter may remain.','Transparent native sprite artwork, no rig layers or game integration.'],'visualQA':{'status':'independent_review_pending'},'status':'review_candidate'}
atlas=Image.new('RGBA',(W*6,H*len(allframes)));combined=[];cd=[];checks=[]
for ri,(st,frames) in enumerate(allframes.items()):
 fd=d/'frames'/st;fd.mkdir(parents=True,exist_ok=True);dur=timings[st];files=[];gif=[]
 for i,f in enumerate(frames):
  p=fd/f'{i:02d}.png';f.save(p);files.append({'file':p.relative_to(d).as_posix(),'durationMs':dur[i],'atlasRect':[i*W,ri*H,W,H],'sourceSize':[W,H],'trimOffset':[0,0]});atlas.paste(f,(i*W,ri*H));bbox=f.getchannel('A').getbbox();checks.append({'file':files[-1]['file'],'sha256':hashlib.sha256(p.read_bytes()).hexdigest(),'size':[W,H],'alpha':f.getchannel('A').getextrema(),'bounds':bbox,'paddingPass':bbox[0]>0 and bbox[1]>0 and bbox[2]<W and bbox[3]<H})
  bg=Image.new('RGB',(W*2,H+36),'#20252d');bg.paste(f,(0,36),f);light=Image.new('RGB',(W,H),'#e2dbcf');light.paste(f,(0,0),f);bg.paste(light,(W,36));ImageDraw.Draw(bg).text((12,10),vid+' / '+st,fill='white');gif.append(bg);combined.append(bg);cd.append(dur[i])
 loop=st in ['idle','wounded_idle'];terminal=st in ['die','guard'];event='release' if st in ['cast','broodfire_sweep'] or vid=='slagjaw-toad' else 'impact';events=[{'name':event,'timeMs':sum(dur[:3])}] if st in ['attack','cast','charge','broodfire_sweep'] else ([{'name':'brace','timeMs':sum(dur[:2])},{'name':'exit','timeMs':sum(dur[:4])}] if st=='guard' else [])
 m['states'][st]={'frames':files,'loop':loop,'events':events,'durationMs':sum(dur),'nextState':st if loop else ('terminal' if terminal else 'idle'),'terminal':terminal,'holdLastFrame':terminal,'description':identity.get('state_actions',{}).get(st,st)};m['previews'][st]=st+'.gif';kwargs={'loop':0} if loop else {};gif[0].save(d/(st+'.gif'),save_all=True,append_images=gif[1:],duration=dur,disposal=2,**kwargs)
atlas.save(d/'atlas.png');m['atlas']='atlas.png';m['atlasSha256']=hashlib.sha256((d/'atlas.png').read_bytes()).hexdigest();combined[0].save(d/'preview.gif',save_all=True,append_images=combined[1:],duration=cd,disposal=2);m['previewPackageAssociation']={'preview':'preview.gif','sha256':hashlib.sha256((d/'preview.gif').read_bytes()).hexdigest(),'atlasSha256':m['atlasSha256']};m['missingStates']=[s for s in identity['required_states'] if s not in allframes];m['technicalQA']={'status':'pass' if all(c['paddingPass'] for c in checks) else 'fail','report':'technical-qa.json','authoredFrames':len(checks)};(d/'technical-qa.json').write_text(json.dumps({'variant':vid,'atlasSha256':m['atlasSha256'],'checks':checks},indent=2));(d/'manifest.json').write_text(json.dumps(m,indent=2))
html='''<!doctype html><meta charset="utf-8"><title>MONSTER animation</title><style>body{background:#222;color:white;font:16px system-ui}canvas{border:1px solid #777;margin:8px;max-width:46vw}button{padding:8px;margin:3px}</style><h1>MONSTER</h1><div id="buttons"></div><button onclick="start(state)">Replay</button><p id="label"></p><canvas id="dark" width="640" height="512"></canvas><canvas id="light" width="640" height="512"></canvas><canvas id="small" width="192" height="154"></canvas><script>let m,imgs={},state='idle',index=0,timer;function draw(){let f=m.states[state].frames[index],im=imgs[f.file];[dark,light,small].forEach((c,k)=>{let x=c.getContext('2d');x.fillStyle=k===1?'#e2dbcf':'#20252d';x.fillRect(0,0,c.width,c.height);x.drawImage(im,0,0,c.width,c.width*im.height/im.width)});label.textContent=state+' — '+index+' / '+m.states[state].frames.length;}function tick(){draw();let a=m.states[state];timer=setTimeout(()=>{if(index<a.frames.length-1){index++;tick()}else if(a.loop){index=0;tick()}else if(!a.terminal){start('idle')}},a.frames[index].durationMs)}function start(s){clearTimeout(timer);state=s;index=0;tick()}fetch('manifest.json').then(r=>r.json()).then(async x=>{m=x;for(let[s,a]of Object.entries(m.states)){let b=document.createElement('button');b.textContent=s;b.onclick=()=>start(s);buttons.append(b);for(let f of a.frames){let im=new Image;im.src=f.file;await im.decode();imgs[f.file]=im;}}start('idle')});</script>'''.replace('MONSTER',vid);(d/'preview.html').write_text(html);print(json.dumps({'id':vid,'atlasHash':m['atlasSha256'],'states':list(allframes),'missing':m['missingStates'],'frames':len(checks),'technicalQA':m['technicalQA']['status']}))


