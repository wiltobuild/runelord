from PIL import Image,ImageFilter,ImageDraw
from pathlib import Path
import numpy as np,json,sys,hashlib
slug=sys.argv[1]; root=Path('C:/Users/wilsh/Projects/runelord/assets/characters')/slug/'animation/r1'
im=Image.open(root/'source-sheet.png').convert('RGBA');W,H=im.size
m=np.array(im.getchannel('A').point(lambda x:255 if x>60 else 0).filter(ImageFilter.MaxFilter(3)))>0
objects=[]
for y in range(H):
 for x in range(W):
  if not m[y,x]:continue
  todo=[(x,y)];m[y,x]=False;coords=[]
  while todo:
   xx,yy=todo.pop();coords.append((xx,yy))
   for nx,ny in [(xx-1,yy),(xx+1,yy),(xx,yy-1),(xx,yy+1)]:
    if 0<=nx<W and 0<=ny<H and m[ny,nx]:m[ny,nx]=False;todo.append((nx,ny))
  if len(coords)>2000:
   a=np.array(coords);objects.append({'coords':a,'box':(int(a[:,0].min()),int(a[:,1].min()),int(a[:,0].max()+1),int(a[:,1].max()+1))})
states=['idle','attack','hit','wounded_idle','die']+(['guard'] if slug in ['cairnback-hermit','ironfan-isopod'] else [])
assert len(objects)==len(states)*4,(len(objects),len(states)*4)
objects.sort(key=lambda o:o['box'][1]); rows=[sorted(objects[i:i+4],key=lambda o:o['box'][0]) for i in range(0,len(objects),4)]
cw=max(int(W/4)+150,448);ch=max(int(H/len(states))+140,448);anchor=[cw//2,ch-40]
durations={'idle':[220,250,220,250],'attack':[100,80,100,120],'hit':[70,100,100,80],'wounded_idle':[280,260,280,260],'die':[120,140,160,700],'guard':[100,200,200,120]}
manifest={'schema_version':1,'character_id':slug,'format':'numbered RGBA frames','canvas':[cw,ch],'anchor':anchor,'source':'source-sheet.png','source_dimensions':[W,H],'approval':'Pending approval','status':'animation_study_pending_review','states':{},'limitations':['Four generated keyframes per state; stepped timing rather than interpolated full-rate animation.','Generated sheet preserves general identity but fine line/mark and foot placement variation remains.','No separated rig or VFX layers. Runtime game integration not performed.']}
allpreview=[];allduration=[]; contact=Image.new('RGB',(cw*4,ch*len(states)),'#b9bcc3')
for row,state in zip(rows,states):
 ground=max(o['box'][3] for o in row)-3;frames=[]
 for col,obj in enumerate(row):
  b=obj['box']; pts=obj['coords']; mask=Image.new('L',(W,H),0);aa=np.zeros((H,W),dtype='uint8');aa[pts[:,1],pts[:,0]]=255;mask=Image.fromarray(aa)
  part=im.copy();part.putalpha(Image.fromarray(np.minimum(np.array(im.getchannel('A')),aa)))
  # Component isolation is technical extraction; preserve source pixels and one uniform scale.
  piece=part.crop(b);out=Image.new('RGBA',(cw,ch));dx=anchor[0]+b[0]-round(W*(col+.5)/4);dy=anchor[1]+b[1]-ground;out.alpha_composite(piece,(dx,dy));frames.append(out)
  folder=root/state;folder.mkdir(exist_ok=True);out.save(folder/f'{col:02}.png')
  tile=Image.new('RGBA',(cw,ch),'#b9bcc3');tile.alpha_composite(out);contact.paste(tile.convert('RGB'),(col*cw,states.index(state)*ch))
 previews=[]
 for f in frames:
  tile=Image.new('RGBA',(cw,ch+30),'#242936');tile.alpha_composite(f,(0,30));ImageDraw.Draw(tile).text((12,10),slug+' / '+state,fill='white');previews.append(tile.convert('RGB'))
 kw={'loop':0} if state in ['idle','wounded_idle','guard'] else {}
 previews[0].save(root/f'{state}.gif',save_all=True,append_images=previews[1:],duration=durations[state],disposal=2,**kw)
 manifest['states'][state]={'frames':[f'{state}/{i:02}.png' for i in range(4)],'duration_ms':durations[state],'loop':state in ['idle','wounded_idle','guard'],'events':[{'frame':2,'name':'impact'}] if state=='attack' else [],'next':'hold_terminal' if state=='die' else ('self' if state in ['idle','wounded_idle','guard'] else 'idle')}
 for _ in range(2 if state in ['idle','wounded_idle'] else 1):allpreview.extend(previews);allduration.extend(durations[state])
allpreview[0].save(root/'review.gif',save_all=True,append_images=allpreview[1:],duration=allduration,loop=0,disposal=2)
contact.thumbnail((1600,2400));contact.save(root/'contact.png');(root/'manifest.json').write_text(json.dumps(manifest,indent=2))
html='<!doctype html><title>'+slug+' motion study</title><style>body{background:#242936;color:white;font:18px sans-serif}.row{display:flex;align-items:end;gap:20px}img{image-rendering:auto}</style><h1>'+slug+'</h1><p>Four generated articulated keyframes per state. Runtime death is one shot; review montage repeats.</p>'
for state in states:html+='<h2>'+state+'</h2><div class="row"><img src="'+state+'.gif"><img height="126" src="'+state+'.gif"></div>'
(root/'review.html').write_text(html);print(json.dumps({'slug':slug,'canvas':[cw,ch],'states':states,'frames':len(objects)}))
