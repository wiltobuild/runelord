import json,pathlib,sys,math,hashlib,shutil
from PIL import Image,ImageDraw,ImageFont
cfg=json.load(open(sys.argv[1],encoding='utf-8-sig')); dest=pathlib.Path(cfg['output']);dest.mkdir(parents=True,exist_ok=True)
src=pathlib.Path(cfg['source']); im=Image.open(src).convert('RGBA'); cols=cfg.get('cols',4);rows=cfg.get('rows',4)
xs=cfg.get('xbounds',[round(i*im.width/cols) for i in range(cols+1)]);ys=cfg.get('ybounds',[round(i*im.height/rows) for i in range(rows+1)])
pad=cfg.get('padding',24);cw=max(xs[i+1]-xs[i] for i in range(cols));ch=max(ys[i+1]-ys[i] for i in range(rows));W=cw+pad*2;H=ch+pad*2
frames=[];qa=[];(dest/'frames').mkdir(exist_ok=True)
for i in range(cols*rows):
 c=i%cols;r=i//cols;box=cfg.get('boxes',{}).get(str(i),[xs[c],ys[r],xs[c+1],ys[r+1]])
 part=im.crop(box);a=part.getchannel('A');solid=a.point(lambda x:255 if x>32 else 0);bounds=solid.getbbox()
 frame=Image.new('RGBA',(W,H)); offset=(pad+box[0]-xs[c],H-pad-bounds[3]) if bounds else (pad,pad);frame.alpha_composite(part,offset);frames.append(frame);frame.save(dest/'frames'/f'{i:02}.png')
 qa.append({'frame':i,'source_rect':box,'solid_bounds':bounds,'edge_contact': bool(bounds and (bounds[0]<2 or bounds[1]<2 or bounds[2]>part.width-2 or bounds[3]>part.height-2))})
atlas=Image.new('RGBA',(W*cols,H*rows))
for i,f in enumerate(frames):atlas.alpha_composite(f,((i%cols)*W,(i//cols)*H))
atlas.save(dest/'atlas.png');shutil.copy2(src,dest/'source-sheet.png')
states=cfg['states'];manifest={'character_id':cfg['slug'],'format':'generated-frame-sprites','source':'source-sheet.png','atlas':'atlas.png','source_dimensions':list(im.size),'frame_canvas':[W,H],'coordinate_system':'pixels, top-left, x right y down','anchor':cfg.get('anchor',[W//2,H-pad]),'scale':'one source pixel per frame pixel; no per-frame scaling','states':{},'frames':[{'index':i,'file':f'frames/{i:02}.png','rect':[(i%cols)*W,(i//cols)*H,W,H]} for i in range(len(frames))],'limitations':cfg.get('limitations',[]),'status':'animation_review_pending'}
bb=frames[0].getchannel('A').point(lambda x:255 if x>32 else 0).getbbox();manifest['reference_character_height']=bb[3]-bb[1]
font=ImageFont.truetype('C:/Windows/Fonts/segoeui.ttf',18)
allseq=[];alldur=[]
for name,s in states.items():
 seq=s['frames'];dur=s.get('durations',[120]*len(seq));assert len(seq)==len(dur)
 manifest['states'][name]={**s,'durations_ms':dur,'duration_ms':sum(dur),'loop':s.get('loop',False),'transition':s.get('transition','idle' if name not in ['idle','wounded_idle','die'] else ('hold_terminal' if name=='die' else name))}
 display=[]
 for idx,ms in zip(seq,dur):
  f=frames[idx];bg=Image.new('RGBA',(W,H+34),'#23382f');bg.alpha_composite(f,(0,34));ImageDraw.Draw(bg).text((10,6),name,font=font,fill='#e8dbc1');display.append(bg.convert('RGB'));allseq.append(bg.convert('RGB'));alldur.append(ms)
 kwargs={'save_all':True,'append_images':display[1:],'duration':dur,'disposal':2,'optimize':False}
 if s.get('loop',False):kwargs['loop']=0
 display[0].save(dest/(name+'.gif'),**kwargs)
 allseq.extend([display[-1]]*1);alldur.extend([350 if name!='die' else 900])
allseq[0].save(dest/'review.gif',save_all=True,append_images=allseq[1:],duration=alldur,loop=0,disposal=2,optimize=False)
(dest/'manifest.json').write_text(json.dumps(manifest,indent=2),encoding='utf-8');(dest/'packing-qa.json').write_text(json.dumps(qa,indent=2),encoding='utf-8')
contact=Image.new('RGB',(cols*260,rows*280),'#e9e6da');d=ImageDraw.Draw(contact)
for i,f in enumerate(frames):
 t=f.copy();t.thumbnail((245,245));x=(i%cols)*260;y=(i//cols)*280;contact.paste(t,(x+(260-t.width)//2,y),t);d.text((x+10,y+251),str(i),font=font,fill='black')
contact.save(dest/'contact.png')
html='''<!doctype html><meta charset="utf-8"><title>Animation review</title><style>body{background:#16231e;color:#eee;font:16px system-ui}canvas{background:#dcd8cd;margin:8px}button,select{font:inherit;margin:10px}p{max-width:900px}</style><h1 id="title"></h1><select id="state"></select><button onclick="start()">Replay</button><button onclick="paused=!paused">Pause</button><span id="info"></span><p>Generated frame animation review. Full-size and 96px playback share the same timing. Death plays once and holds; choose Replay to restart. Artwork and temporal QA limitations are in manifest.json.</p><canvas id="full"></canvas><canvas id="small"></canvas><script>
let m,imgs=[],name,at=0,t=0,paused=false;const full=document.querySelector('#full'),small=document.querySelector('#small'),sel=document.querySelector('#state');
function start(){name=sel.value;at=0;t=performance.now();paused=false;draw()}
function draw(){const s=m.states[name],idx=s.frames[at];for(const [cv,scale] of [[full,1],[small,96/m.frame_canvas[1]]]){let c=cv.getContext('2d');c.clearRect(0,0,cv.width,cv.height);c.drawImage(imgs[idx],0,0,cv.width,cv.height)}document.querySelector('#info').textContent=name+' frame '+idx+' / '+at}
function tick(now){if(m&&!paused){const s=m.states[name];if(now-t>=s.durations_ms[at]){t=now;if(at<s.frames.length-1)at++;else if(s.loop)at=0;else paused=true;draw()}}requestAnimationFrame(tick)}
fetch('manifest.json').then(r=>r.json()).then(async data=>{m=data;document.querySelector('#title').textContent=m.character_id;full.width=m.frame_canvas[0];full.height=m.frame_canvas[1];small.width=Math.round(m.frame_canvas[0]*96/m.frame_canvas[1]);small.height=96;imgs=await Promise.all(m.frames.map(f=>new Promise(ok=>{let i=new Image;i.onload=()=>ok(i);i.src=f.file})));sel.innerHTML=Object.keys(m.states).map(n=>'<option>'+n+'</option>').join('');sel.onchange=start;start();requestAnimationFrame(tick)});
</script>'''
html=html.replace('small.width=Math.round(m.frame_canvas[0]*96/m.frame_canvas[1]);small.height=96','small.width=Math.round(m.frame_canvas[0]*96/m.reference_character_height);small.height=Math.round(m.frame_canvas[1]*96/m.reference_character_height)')
(dest/'preview.html').write_text(html,encoding='utf-8')
print(json.dumps({'output':str(dest),'frames':len(frames),'canvas':[W,H],'states':list(states),'edge_contact_frames':[x['frame'] for x in qa if x['edge_contact']]}))
