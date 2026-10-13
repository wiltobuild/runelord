from PIL import Image,ImageDraw,ImageFilter
from pathlib import Path
import numpy as np,json,hashlib,shutil,importlib.util
sp=importlib.util.spec_from_file_location('components',str(Path(__file__).with_name('frontline-components.py')));mod=importlib.util.module_from_spec(sp);sp.loader.exec_module(mod)
B=mod.B.parent/'animation-r2'; W=768
spec={'idle':(4,2,[450]*8),'attack':(3,2,[140,140,110,100,160,200]),'hit':(2,2,[100,130,170,200]),'wounded_idle':(2,2,[500]*4),'cast':(2,2,[220,250,160,270]),'die':(3,2,[180,200,250,260,350,800])}
scales={'rime-seer':{'idle':1.28,'attack':.90,'hit':.69,'wounded_idle':.685,'cast':.865,'die':.815},'rune-revenant':{'idle':1.16,'attack':.87,'hit':.652,'wounded_idle':.764,'cast':.752,'die':.821},'shattered-queen':{'idle':1,'attack':1,'hit':.72,'wounded_idle':.72,'cast':.72,'die':1}}
def sha(p):return hashlib.sha256(p.read_bytes()).hexdigest()
def dump(p,v):p.write_text(json.dumps(v,indent=2),encoding='utf8')
for id in scales:
 out=B/id
 old=mod.B/id
 (out/'source').mkdir(parents=True,exist_ok=True)
 oldman=json.loads((old/'manifest.json').read_text())
 for state in spec:
  name={'idle':'idle-scale-r2','cast':'cast-bounds-r2'}.get(state,state) if id=='shattered-queen' else state
  srcdir='sources' if id=='shattered-queen' else 'source'
  shutil.copyfile(old/srcdir/(name+'.png'),out/'source'/(state+'.png'))
 if (old/srcdir/'prompts.json').exists():shutil.copyfile(old/srcdir/'prompts.json',out/'source/prompts.json')
 for d in ['frames','atlases','preview','review']:(out/d).mkdir(exist_ok=True)
 index=[];states={};audits=[];allpreview=[];alldurs=[]
 for state,(cols,rows,durations) in spec.items():
  p=out/'source'/f'{state}.png';src=Image.open(p).convert('RGBA');a=np.array(src.getchannel('A'));labels,comps=mod.components(a);large=sorted(comps,key=lambda c:c['count'],reverse=True)[:cols*rows]
  large=sorted(large,key=lambda c:(int((c['box'][1]+c['box'][3])/2)//(src.height//2),c['box'][0]))
  # Row membership follows sheet rows, then horizontal ordering. Large disconnected props join nearest character.
  top=sorted(large,key=lambda c:(c['box'][1]+c['box'][3])/2)[:cols];bot=[c for c in large if c not in top];large=sorted(top,key=lambda c:c['box'][0])+sorted(bot,key=lambda c:c['box'][0])
  owners={c['label']:i for i,c in enumerate(large)}
  for c in comps:
   if c['label'] not in owners:
    x=(c['box'][0]+c['box'][2])/2;y=(c['box'][1]+c['box'][3])/2
    owners[c['label']]=min(range(len(large)),key=lambda i:(x-(large[i]['box'][0]+large[i]['box'][2])/2)**2+(y-(large[i]['box'][1]+large[i]['box'][3])/2)**2)
  # Include all small non-noise connected components with nearest major sprite in same row.
  for k in np.unique(labels):
   if k and k not in owners:
    yy,xx=np.where(labels==k);x=float(xx.mean());y=float(yy.mean());owners[int(k)]=min(range(len(large)),key=lambda i:(x-(large[i]['box'][0]+large[i]['box'][2])/2)**2+(y-(large[i]['box'][1]+large[i]['box'][3])/2)**2)
  if id=='shattered-queen' and state=='die':
   large=[{'label':10000+i,'box':[512*(i%3),0 if i<3 else 560,512*(i%3+1),560 if i<3 else src.height]} for i in range(6)]
  fs=[];t=0
  for i,c in enumerate(large):
   core=np.isin(labels,[k for k,v in owners.items() if v==i]);
   if id=='shattered-queen' and state=='die':
    core=np.zeros_like(labels,dtype=bool);box=c['box'];core[box[1]:box[3],box[0]:box[2]]=True
   mask=Image.fromarray((core*255).astype('uint8')).filter(ImageFilter.MaxFilter(5));ma=np.array(mask)>0;part=np.array(src);part[:,:,3]=np.where(ma,a,0);im=Image.fromarray(part);bb=im.getchannel('A').getbbox();crop=im.crop(bb);scale=scales[id][state]
   # Alpha-owned registration uses front planted foot; avoids weapon centroid shifts.
   body=c['box'];ground=body[3];left=body[0]
   if state!='die':
    band=core[max(body[1],ground-10):ground,:];ys,xs=np.where(band)
    footx=float(xs.min()+25) if len(xs) else left+45
   else:footx=left+45
   root=[footx,ground]
   if id=='shattered-queen':
    oldrec=oldman['states'][state]['frames'][i];rr=oldrec['source_rect'];sr=oldrec['source_root'];root=[rr[0]+sr[0],rr[1]+sr[1]]
   size=(round(crop.width*scale),round(crop.height*scale));crop=crop.resize(size,Image.Resampling.LANCZOS)
   pos=[round((384 if id=='shattered-queen' else 280)+(bb[0]-root[0])*scale),round((350 if id=='shattered-queen' else 650)+(bb[1]-root[1])*scale)];frame=Image.new('RGBA',(W,W));frame.alpha_composite(crop,pos)
   file=f'frames/{state}-{i:02d}.png';frame.save(out/file);rec={'hero':id,'form':'base','state':state,'frame':i,'time_ms':t,'duration_ms':durations[i],'file':file,'sha256':sha(out/file),'source_sheet':f'source/{state}.png','source_sha256':sha(p),'source_rect':list(bb),'source_component_label':c['label'],'source_root':root,'source_scale':scale,'translation':pos};index.append(rec);fs.append(frame);t+=durations[i]
   edge=max(frame.getchannel('A').crop(r).getextrema()[1] for r in [(0,0,1,W),(W-1,0,W,W),(0,0,W,1),(0,W-1,W,W)])
   audits.append({'state':state,'frame':i,'output_edge_alpha_max':edge,'source_border_candidate':bb[0]<=1 or bb[1]<=1 or bb[2]>=src.width-1 or bb[3]>=src.height-1,'opaque_bbox':frame.getchannel('A').point(lambda v:255 if v>180 else 0).getbbox()})
  atlas=Image.new('RGBA',(W*cols,W*rows))
  for i,f in enumerate(fs):atlas.alpha_composite(f,((i%cols)*W,(i//cols)*W))
  atlas.save(out/'atlases'/f'{state}.png')
  for bgname,bg in [('dark','#161d28'),('light','#e8e5de')]:
   rendered=[]
   for f in fs:
    r=Image.new('RGBA',(W,W),bg);r.alpha_composite(f);rendered.append(r.convert('RGB'))
   for label,tile in [('full',768),('96px',round(768*96/(497 if id=='shattered-queen' else 440)))]:
    cs=Image.new('RGB',(cols*tile,rows*(tile+24)),bg);d=ImageDraw.Draw(cs)
    for i,r in enumerate(rendered):x=(i%cols)*tile;y=(i//cols)*(tile+24);cs.paste(r.resize((tile,tile)),(x,y));d.text((x+3,y+tile+4),f'{state} {i:02d}',fill='#b77939')
    cs.save(out/'review'/f'{state}-{label}-{bgname}.png')
    imgs=[r.resize((tile,tile)) for r in rendered];kw={'loop':0} if state in ['idle','wounded_idle'] else {};imgs[0].save(out/'preview'/f'{state}-{label}-{bgname}.gif',save_all=True,append_images=imgs[1:],duration=durations,disposal=2,**kw)
   if bgname=='dark':
    for i,r in enumerate(rendered):
     r=r.resize((512,512));ImageDraw.Draw(r).text((12,12),f'{id} / {state} / {i:02d}',fill='white');allpreview.append(r);alldurs.append(durations[i])
  events=[{'name':'impact','frame':3,'time_ms':sum(durations[:3])}] if state=='attack' else [{'name':'release','frame':2,'time_ms':sum(durations[:2])}] if state=='cast' else [{'name':'terminal','frame':5,'time_ms':sum(durations[:5])}] if state=='die' else []
  states[state]={'frames':[f for f in index if f['state']==state],'frame_count':len(fs),'duration_ms':t,'loop':state in ['idle','wounded_idle'],'terminal_hold':state=='die','events':events,'atlas':f'atlases/{state}.png','transition':'hold terminal' if state=='die' else 'idle'}
 allpreview[0].save(out/'preview/all-states.gif',save_all=True,append_images=allpreview[1:],duration=alldurs,loop=0,disposal=2)
 master=B.parent/'selected-r1'/id/'master.png';issues=['Baked magic cannot be disabled independently.','Frame-based 32-pose source; no 60Hz interpolation asserted.','Generated equipment/cloth variation and planted foot spacing require independent review.','Fixed per-state source scale calibration compensates sheet generation resolution; no per-pose resizing.','Connected sprite extraction preserves interiors and two-pixel alpha fringe; low-alpha disconnected background noise outside fringe excluded.']
 manifest={'hero':id,'revision':'animation-r2','status':'review_pending','format':'numbered RGBA PNG and PNG atlases','source':str(master),'source_sha256':sha(master),'frame_count':32,'geometry':{'canvas':[768,768],'ground_y':650,'front_foot_anchor_x':280,'source_scale_by_state':scales[id],'scale_policy':'one scale per generated sheet; identical within clip','camera':'three-quarter right'},'states':states,'issues':issues,'runtime_compatibility':'Generic PNG frames and atlases; custom bundled HTML Canvas playback; no game integration'}
 dump(out/'manifest.json',manifest);dump(out/'frames/index.json',{'frames':index});dump(out/'review/technical-checks.json',{'frame_count':len(index),'unique_hashes':len(set(f['sha256'] for f in index)),'frames':audits});dump(out/'completion.json',{'status':'review_pending','states':{s:{'status':'review_pending','frame_count':v['frame_count']} for s,v in states.items()},'unresolved':issues})
 shutil.copyfile(__file__,out/'pack.py');shutil.copyfile(Path(__file__).with_name('frontline-components.py'),out/'frontline-components.py')
 html='''<!doctype html><meta charset="utf-8"><title>Summon review</title><style>body{background:#161d28;color:#eef;font:16px system-ui}canvas{width:512px;height:512px}button,select{padding:8px;margin:4px}.small{width:166px;height:166px}</style><h1>TITLE — review pending</h1><select id="state"></select><button id="play" disabled>Play</button><button id="step" disabled>Step</button><select id="speed"><option value="1">1×</option><option value=".5">0.5×</option><option value=".25">0.25×</option></select><p id="label">Loading</p><canvas id="dark" width="768" height="768"></canvas><canvas id="light" width="768" height="768"></canvas><canvas class="small" id="tiny" width="768" height="768"></canvas><script>const clips=CLIPS;let images={},state='idle',frame=0,elapsed=0,last=0,playing=false;const sel=document.querySelector('#state'),play=document.querySelector('#play'),step=document.querySelector('#step');for(const k in clips)sel.add(new Option(k,k));function draw(){const f=clips[state].frames[frame];for(const [id,bg] of [['dark','#161d28'],['light','#e8e5de'],['tiny','#161d28']]){let c=document.getElementById(id),x=c.getContext('2d');x.fillStyle=bg;x.fillRect(0,0,768,768);x.drawImage(images[f.file],0,0)}document.querySelector('#label').textContent=state+' '+frame+' / '+(clips[state].frames.length-1)+' · '+f.time_ms+'ms';play.textContent=playing?'Pause':'Play'}sel.onchange=()=>{state=sel.value;frame=0;elapsed=0;draw()};play.onclick=()=>{playing=!playing;draw()};step.onclick=()=>{playing=false;frame=(frame+1)%clips[state].frames.length;elapsed=0;draw()};async function init(){await Promise.all(Object.values(clips).flatMap(s=>s.frames).map(async f=>{let i=new Image;i.src='../'+f.file;await i.decode();images[f.file]=i}));play.disabled=step.disabled=false;playing=true;draw();requestAnimationFrame(tick)}function tick(t){let dt=last?t-last:0;last=t;if(playing){elapsed+=Math.min(dt,100)*Number(document.querySelector('#speed').value);let s=clips[state];while(elapsed>=s.frames[frame].duration_ms){elapsed-=s.frames[frame].duration_ms;if(frame==s.frames.length-1&&!s.loop){playing=false;break}frame=(frame+1)%s.frames.length}draw()}requestAnimationFrame(tick)}init();</script>'''.replace('TITLE',id).replace('CLIPS',json.dumps(states))
 (out/'preview/player.html').write_text(html,encoding='utf8');dump(out/'review-pending-freeze.json',{'status':'review_pending','master_sha256':sha(master),'manifest_sha256':sha(out/'manifest.json'),'index_sha256':sha(out/'frames/index.json'),'preview_sha256':sha(out/'preview/all-states.gif'),'frame_count':len(index),'independent_review':'required'});print(id,'32 frames exported')
 issues=json.loads((old/'review/independent/issues.json').read_text());issues=issues['issues'] if isinstance(issues,dict) else issues
 dump(out/'review/repair-log.json',{'repair_agent':'finish_frontline','pass':1,'prior_package':str(old),'status':'independent_recheck_required','issues':[{'id':issue['id'],'change':'Re-extracted source alpha using connected-component ownership, repaired grid spill and state scale, delivered preloaded localhost player and GIFs. Baked effects limitation retained.','status':'recheck_required','affected_frames':[e['file'] for e in index]} for issue in issues]})
