from PIL import Image,ImageDraw
from pathlib import Path
import json,hashlib,sys,math
ROOT=Path('C:/Users/wilsh/Projects/runelord/assets/characters/cinderhook-marauder/animation-nine-2026-10-02')
vid=sys.argv[1]; d=ROOT/vid; src=d/'source/poses-r2.png'; im=Image.open(src).convert('RGBA')
W=384; H=384; ground=320
rows=[(0,270),(270,550),(550,830),(830,1110)]
bounds=[[0,263,546,831,1122],[0,284,552,828,1122],[0,263,546,832,1122],[0,277,552,831,1122]]
baselines=[265,540,817,1095]
state_names=['idle','attack','hit','wounded_idle','die']; allframes={}; source_rects={}
for r,st in enumerate(state_names[:4]):
    fs=[]; rects=[]
    for c in range(4):
        box=(bounds[r][c],rows[r][0],bounds[r][c+1],rows[r][1]); crop=im.crop(box)
        f=Image.new('RGBA',(W,H)); offset=(round(box[0]-c*280.5+52),ground-baselines[r]+box[1]); f.alpha_composite(crop,offset); fs.append(f);rects.append({'source':str(src),'box':list(box),'offset':list(offset),'scale':1})
    allframes[st]=fs;source_rects[st]=rects
deathsrc=d/'source/death-r3.png'; death=Image.open(deathsrc).convert('RGBA'); dw,dh=death.size; scale=.55
allframes['die']=[];source_rects['die']=[]
for c in range(4):
    box=(round(c*dw/4),0,round((c+1)*dw/4),dh); crop=death.crop(box);crop=crop.resize((round(crop.width*scale),round(crop.height*scale)),Image.Resampling.LANCZOS)
    f=Image.new('RGBA',(W,H)); offset=(35,ground-round(614*scale));f.alpha_composite(crop,offset);allframes['die'].append(f);source_rects['die'].append({'source':str(deathsrc),'box':list(box),'offset':list(offset),'scale':scale})
# Playback sequences use authored complete poses; no interpolation, warps, or generated pixels.
seqs={'idle':([0,1,2,3,2,1],[200]*6),'attack':([0,1,2,3,0],[90,110,60,80,90]),'hit':([0,1,2,3,0],[40,80,100,90,70]),'wounded_idle':([0,1,2,3,2,1],[230]*6),'die':([0,1,2,3],[130,160,150,600])}
manifest={'variantId':vid,'source':{'path':str(src),'sha256':hashlib.sha256(src.read_bytes()).hexdigest()},'approvedIdentity':str(ROOT.parent/'variants-nine-2026-10-02'/f'{vid}-r1.png'),'canvas':{'width':W,'height':H},'anchor':{'x':225,'y':ground},'coordinateSystem':'top-left pixels; x right, y down','facing':'left','states':{},'sourceRects':source_rects,'previews':{},'limitations':['Coarse hand-drawn whole-frame animation; 4 authored poses per state.','Generated native pose resolution approx 280px; not upscaled to claim HD.','Awaiting independent visual playback QA.'],'method':'reference-conditioned whole-character frames'}
atlas=Image.new('RGBA',(4*W,5*H)); combined=[]; cd=[]
for ri,st in enumerate(state_names):
    fd=d/'frames'/st;fd.mkdir(parents=True,exist_ok=True); files=[]
    for i,f in enumerate(allframes[st]):
        path=fd/f'{i:02d}.png';f.save(path);files.append(path.relative_to(d).as_posix());atlas.alpha_composite(f,(i*W,ri*H))
    seq,durations=seqs[st]; loop=st in ['idle','wounded_idle']; frames=[{'file':files[i],'durationMs':durations[j],'atlasRect':[i*W,ri*H,W,H],'sourceSize':[W,H],'trimOffset':[0,0]} for j,i in enumerate(seq)]
    manifest['states'][st]={'frames':frames,'loop':loop,'events':[{'name':'impact','timeMs':200}] if st=='attack' else [],'nextState':st if loop else ('terminal' if st=='die' else 'idle'),'terminal':st=='die','holdLastFrame':st=='die','durationMs':sum(durations)}
    gif=[]
    for j,i in enumerate(seq):
        f=allframes[st][i]; bg=Image.new('RGB',(W*2,H+36),'#232830');bg.paste(f,(0,36),f); light=Image.new('RGB',(W,H),'#e2d9cd');light.paste(f,(0,0),f);bg.paste(light,(W,36));dr=ImageDraw.Draw(bg);dr.text((12,10),vid+' / '+st,fill='white');gif.append(bg)
        combined.append(bg);cd.append(durations[j])
    preview=d/f'{st}.gif'; kwargs={'loop':0} if loop else {}; gif[0].save(preview,save_all=True,append_images=gif[1:],duration=durations,disposal=2,**kwargs);manifest['previews'][st]=preview.name
atlas.save(d/'atlas.png');manifest['atlas']='atlas.png';manifest['atlasSha256']=hashlib.sha256((d/'atlas.png').read_bytes()).hexdigest()
combined[0].save(d/'preview.gif',save_all=True,append_images=combined[1:],duration=cd,disposal=2)
(d/'manifest.json').write_text(json.dumps(manifest,indent=2))
html='''<!doctype html><meta charset="utf-8"><title>Goblin animation proof</title><style>body{background:#222;color:#fff;font:16px system-ui}canvas{border:1px solid #aaa;margin:10px}button{padding:8px;margin:4px}</style><h1>'''+vid+'''</h1><div id="buttons"></div><button onclick="start(state)">Replay</button><p id="label"></p><canvas id="dark" width="384" height="384"></canvas><canvas id="light" width="384" height="384"></canvas><canvas id="small" width="150" height="150"></canvas><script>let m,imgs={},state='idle',index=0,timer;const canvases=[dark,light,small];function draw(){let f=m.states[state].frames[index],im=imgs[f.file];canvases.forEach((c,k)=>{let x=c.getContext('2d');x.fillStyle=k===1?'#e2d9cd':'#232830';x.fillRect(0,0,c.width,c.height);if(k===2)x.drawImage(im,0,0,150,150);else x.drawImage(im,0,0);});label.textContent=state+' — frame '+index+' — '+f.durationMs+'ms';}function tick(){draw();let a=m.states[state];timer=setTimeout(()=>{if(index<a.frames.length-1){index++;tick()}else if(a.loop){index=0;tick()}else if(!a.terminal){start('idle')}},a.frames[index].durationMs)}function start(s){clearTimeout(timer);state=s;index=0;tick()}fetch('manifest.json').then(r=>r.json()).then(async x=>{m=x;for(let [s,a]of Object.entries(m.states)){let b=document.createElement('button');b.textContent=s;b.onclick=()=>start(s);buttons.append(b);for(let f of a.frames)if(!imgs[f.file]){let im=new Image;im.src=f.file;await im.decode();imgs[f.file]=im;}}start('idle')});</script>'''
(d/'preview.html').write_text(html)
print(json.dumps({'variant':vid,'atlasHash':manifest['atlasSha256'],'files':len(list(d.rglob('*.png'))),'states':list(manifest['states'])}))
