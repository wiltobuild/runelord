import json, hashlib, pathlib
from PIL import Image, ImageDraw
P=pathlib.Path(__file__).parent
MASTER=P.parents[1]/'selected-r1/shattered-queen/master.png'
SPECS={
 'idle':('idle-scale-r2.png',4,2,1, [500]*8,[(244,232),(244,233),(241,233),(245,232),(244,240),(239,243),(241,242),(239,240)]),
 'attack':('attack.png',3,2,1,[160,140,110,150,150,190],[(309,274),(267,273),(263,280),(291,307),(285,290),(280,289)]),
 'hit':('hit.png',2,2,.72,[100,160,160,180],[(364,320),(368,307),(385,340),(368,336)]),
 'wounded_idle':('wounded_idle.png',2,2,.72,[600]*4,[(342,348),(368,351),(366,342),(372,355)]),
 'cast':('cast-bounds-r2.png',2,2,.72,[220,220,160,240],[(354,386),(361,405),(304,339),(359,341)]),
 'die':('die.png',3,2,1,[180,220,230,280,350,700],[(270,272)]*6)
}
def sha(p): return hashlib.sha256(p.read_bytes()).hexdigest()
def dump(p,o): p.write_text(json.dumps(o,indent=2),encoding='utf-8')
for d in ['frames','atlases','preview','review']: (P/d).mkdir(exist_ok=True)
index=[]; states={}; allframes=[]; audit=[]; gid=0
for st,(src,cols,rows,scale,times,anchors) in SPECS.items():
 sheet=Image.open(P/'sources'/src).convert('RGBA'); fs=[]; t=0
 for i in range(cols*rows):
  x0=round(i%cols*sheet.width/cols); x1=round((i%cols+1)*sheet.width/cols)
  y0=round(i//cols*sheet.height/rows); y1=round((i//cols+1)*sheet.height/rows)
  crop=sheet.crop((x0,y0,x1,y1)); raw=crop.getchannel('A'); w,h=crop.size
  edges={k:raw.crop(box).getextrema()[1] for k,box in {'left':(0,0,1,h),'right':(w-1,0,w,h),'top':(0,0,w,1),'bottom':(0,h-1,w,h)}.items()}
  if scale!=1: crop=crop.resize((round(w*scale),round(h*scale)),Image.Resampling.LANCZOS)
  root=anchors[i]; hover=([0,-2,-4,-2,0,2,4,2][i] if st=='idle' else 0)
  pos=(round(384-root[0]*scale),round(350-root[1]*scale+hover))
  im=Image.new('RGBA',(768,768),(0,0,0,0)); im.alpha_composite(crop,pos)
  file=f'frames/{st}-{i:02d}.png'; im.save(P/file)
  ent={'hero':'shattered-queen','form':'base','state':st,'frame':i,'time_ms':t,'duration_ms':times[i],'file':file,'sha256':sha(P/file),'source_sheet':f'sources/{src}','source_rect':[x0,y0,x1,y1],'source_scale':scale,'source_root':root,'translation':pos}
  index.append(ent); audit.append({'state':st,'frame':i,'source_boundary_alpha_max':edges,'candidate_source_clipping':any(v>32 for v in edges.values()),'output_boundary_alpha_max':max(im.getchannel('A').crop(b).getextrema()[1] for b in [(0,0,1,768),(767,0,768,768),(0,0,768,1),(0,767,768,768)])})
  fs.append(im); allframes.append((st,i,im)); gid+=1;t+=times[i]
 atlas=Image.new('RGBA',(768*cols,768*rows));
 for i,im in enumerate(fs): atlas.alpha_composite(im,((i%cols)*768,(i//cols)*768))
 atlas.save(P/f'atlases/{st}.png')
 for name,bg in [('dark',(24,27,35,255)),('light',(230,232,235,255))]:
  previews=[]; small=[]
  for im in fs:
   b=Image.new('RGBA',im.size,bg);b.alpha_composite(im); previews.append(b.convert('RGB').resize((512,512)));small.append(b.convert('RGB').resize((160,160)))
  looping={'loop':0} if st in ['idle','wounded_idle'] else {}
  previews[0].save(P/f'preview/{st}-{name}.gif',save_all=True,append_images=previews[1:],duration=times,disposal=2,**looping)
  small[0].save(P/f'preview/{st}-96px-{name}.gif',save_all=True,append_images=small[1:],duration=times,disposal=2,**looping)
  for label,tile in [('full',768),('96px',160)]:
   cs=Image.new('RGB',(cols*tile,rows*(tile+24)),bg[:3]);dr=ImageDraw.Draw(cs)
   for i,im in enumerate(fs):
    b=Image.new('RGBA',im.size,bg);b.alpha_composite(im);b=b.convert('RGB').resize((tile,tile));xy=((i%cols)*tile,(i//cols)*(tile+24));cs.paste(b,xy);dr.text((xy[0]+5,xy[1]+tile+4),f'{st} {i:02d}',fill=(120,150,170))
   cs.save(P/f'review/{st}-{label}-{name}.jpg',quality=92)
 states[st]={'frame_count':len(fs),'duration_ms':t,'loop':st in ['idle','wounded_idle'],'frames':[e for e in index if e['state']==st],'atlas':f'atlases/{st}.png','events':([{'name':'vocal-impact','time_ms':300}] if st=='attack' else [{'name':'rune-release','time_ms':440}] if st=='cast' else [{'name':'terminal-dissolution','time_ms':1260}] if st=='die' else []),'transition':'hold terminal' if st=='die' else 'idle'}
dump(P/'frames/index.json',index)
dump(P/'manifest.json',{'hero':'shattered-queen','revision':'animation-r1','format':'numbered-alpha-frames','source':str(MASTER),'source_sha256':sha(MASTER),'geometry':{'canvas':[768,768],'root_anchor':[384,350],'anchor_kind':'belt diamond floating torso','camera':'three-quarter right','source_scale':'per-sheet constant; no per-frame resize'},'states':states,'effects':'cast/death baked into authored frames; no separable effects-off track exists','status':'review_pending','required_frame_count':32,'runtime_compatibility':'generic PNG atlas/frames only, HTML player tested separately; no game integration'})
dump(P/'completion.json',{'status':'review_pending','states':{k:{'status':'review_pending','frame_count':v['frame_count'],'preview':f'preview/{k}-dark.gif'} for k,v in states.items()},'unresolved':['Source boundary alpha candidates need independent visual review; packing cannot repair lost source art.','Generated crown/cloth topology variation requires independent identity review.','Authored cast/death VFX baked; effects-off review is unavailable.','Builder has not claimed independent frame passes.']})
dump(P/'review/technical-checks.json',{'frame_count':len(index),'unique_hashes':len(set(e['sha256'] for e in index)),'frames':audit,'source_clipping_candidates':[f"{a['state']}-{a['frame']:02d}" for a in audit if a['candidate_source_clipping']]})
html='''<!doctype html><meta charset="utf-8"><title>Shattered Queen animation review</title><style>body{font:16px system-ui;color:#dae6f4;background:#181b23}canvas{width:512px;height:512px;background:#181b23}button,select{padding:8px;margin:4px}pre{white-space:pre-wrap}</style><h1>Shattered Queen — 32 authored frames</h1><select id="state"></select><button id="play">Pause</button><button id="step">Step</button><select id="speed"><option value="1">1×</option><option value=".5">0.5×</option><option value=".25">0.25×</option></select><button id="bg">Light/Dark</button><canvas width="768" height="768"></canvas><pre id="label"></pre><script>
const clips=CLIPS,c=document.querySelector('canvas'),ctx=c.getContext('2d'),s=document.querySelector('#state');let f=0,playing=false,last=0,elapsed=0,token=0,imgs=[],light=false;for(const k in clips)s.add(new Option(k,k));async function load(){let n=++token;playing=false;document.querySelector('#play').disabled=true;f=0;elapsed=0;imgs=await Promise.all(clips[s.value].frames.map(e=>new Promise(r=>{let im=new Image;im.onload=()=>r(im);im.src='../'+e.file})));if(n!==token)return;document.querySelector('#play').disabled=false;playing=true;draw()}function draw(){ctx.fillStyle=light?'#e6e8eb':'#181b23';ctx.fillRect(0,0,768,768);if(imgs[f])ctx.drawImage(imgs[f],0,0);document.querySelector('#label').textContent=s.value+' frame '+f+' time '+clips[s.value].frames[f].time_ms+'ms | review_pending'}s.onchange=load;document.querySelector('#play').onclick=()=>playing=!playing;document.querySelector('#step').onclick=()=>{playing=false;f=(f+1)%imgs.length;elapsed=0;draw()};document.querySelector('#bg').onclick=()=>{light=!light;draw()};function tick(t){let dt=t-last;last=t;if(playing&&imgs.length){elapsed+=Math.min(dt,200)*Number(document.querySelector('#speed').value);const clip=clips[s.value];while(elapsed>=clip.frames[f].duration_ms){elapsed-=clip.frames[f].duration_ms;if(f===imgs.length-1&&!clip.loop){playing=false;break}f=(f+1)%imgs.length}draw()}requestAnimationFrame(tick)}load();requestAnimationFrame(tick);
</script>'''.replace('CLIPS',json.dumps(states))
(P/'preview/player.html').write_text(html,encoding='utf-8')
print(json.dumps({'package':str(P),'frames':len(index),'unique_hashes':len(set(e['sha256'] for e in index)),'source_clipping_candidates':sum(a['candidate_source_clipping'] for a in audit)}))
