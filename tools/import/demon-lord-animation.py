"""Pack authored imagegen boss poses; no synthesized anatomy or pose transforms."""
from PIL import Image
from pathlib import Path
import json,hashlib,shutil
ROOT=Path(__file__).resolve().parents[2]
GEN=Path('C:/Users/wilsh/.codex/generated_images/01a0ffee-2ad9-7fe3-b60c-6c841e54aa99')
out=ROOT/'assets/animations/fire-demo-r1/demon-lord'; (out/'frames').mkdir(parents=True,exist_ok=True)
shutil.copyfile(GEN/'exec-df10d3e8-f886-43bd-8660-08ad66173b07.png',out/'poses.png')
sha=lambda p:hashlib.sha256(p.read_bytes()).hexdigest()
im=Image.open(out/'poses.png').convert('RGBA'); frames=[]; effects=[]
# Manual face centers on the authored sheet, normalized to each cell before registration.
face=[(.48,.19),(.48,.18),(.55,.24),(.69,.22),(.50,.23),(.47,.23),(.53,.24),(.63,.22),(.50,.24),(.48,.23),(.59,.22),(.45,.24),(.38,.21),(.39,.22),(.30,.35),(.90,.53)]
for i in range(16):
 c=i%4;r=i//4; cell=im.crop((round(c*im.width/4),round(r*im.height/4),round((c+1)*im.width/4),round((r+1)*im.height/4)))
 bbox=cell.getchannel('A').point(lambda a:255 if a>16 else 0).getbbox(); dx=(448-cell.width)//2;dy=414-bbox[3]
 canvas=Image.new('RGBA',(448,448));canvas.alpha_composite(cell,(dx,dy));canvas.save(out/f'frames/{i:02}.png');frames.append(canvas)
 x=face[i][0]*cell.width+dx;y=face[i][1]*cell.height+dy
 effects.append({'eyes':[[round(x/448,4),round(y/448,4)]],'crown':[round(x/448,4),round((y-38)/448,4)]} if i<14 else {'eyes':[],'crown':[0,0]})
clips={'idle':([0,1,0],[450,450,450],True),'attack':([2,3,4,5],[200,200,170,130],False),'cast':([6,7,5],[280,400,180],False),'summon':([8,9,5],[350,500,200],False),'hit':([10,11,0],[170,170,120],False),'wounded_idle':([12,13,12],[500,500,500],True),'die':([12,14,15],[250,400,800],False)}
states={}; previews=[];durations=[]
for name,(indices,times,loop) in clips.items():
 states[name]={'frames':[{'file':f'frames/{i:02}.png','durationMs':t,'effects':effects[i]} for i,t in zip(indices,times)],'loop':loop,'events':[{'name':'impact','timeMs':{'attack':200,'cast':280,'summon':350}[name]}] if name in ['attack','cast','summon'] else []}
 for i,t in zip(indices,times):
  bg=Image.new('RGBA',(448,448),'#20191f');bg.alpha_composite(frames[i]);previews.append(bg.convert('RGB'));durations.append(t)
previews[0].save(out/'preview.gif',save_all=True,append_images=previews[1:],duration=durations,loop=0,disposal=2)
master=ROOT/'assets/concepts/fire-monsters-20-2026-10-02/crown-of-cinders/base-r1.png';h=sha(master)
manifest={'id':'demon-lord','method':'16 authored whole-character imagegen key poses','canvas':{'width':448,'height':448},'anchor':{'x':224,'y':414},'facing':'left','master':{'path':str(master.relative_to(ROOT)),'sha256':h,'approval':json.loads((ROOT/'assets/approvals/decisions.json').read_text())['decisions'].get(h)},'source':{'path':str((out/'poses.png').relative_to(ROOT)),'sha256':sha(out/'poses.png')},'states':states,'authorization':'User requested crowned Demon Lord animated and integrated, 2026-10-03; new art pending gallery approval.','limitations':['Stepped authored keyframes, no generated in-between frames.','One visible eye socket in three-quarter view; manually measured effect sockets.','Builder contact-sheet review complete; independent playback pending.']}
(out/'manifest.json').write_text(json.dumps(manifest,indent=2)+'\n')
for folder,file,name in [('assets/environments/demon-throne/r1','exec-76de519e-4f4e-4045-a8f2-334ace1dccca.png','demon-throne-r1.png'),('assets/objects/demon-crown/r1','exec-eaa4f827-b11b-4022-82a0-66e63cab45f0.png','source.png')]:
 dest=ROOT/folder;dest.mkdir(parents=True,exist_ok=True);shutil.copyfile(GEN/file,dest/name)
 art=Image.open(dest/name)
 (dest/'manifest.json').write_text(json.dumps({'id':dest.parent.name,'revision':'r1','source':name,'sha256':sha(dest/name),'dimensions':art.size,'status':'Pending approval','authorization':'User requested new Demon Lord arena and crown loot integrated.','references':[manifest['master']],'format':'flattened backdrop' if 'environments' in folder else 'transparent icon source'},indent=2)+'\n')
 if 'objects' in folder: art.thumbnail((128,128));art.save(dest/'icon-128.png')
(ROOT/'assets/environments/demon-throne/r1/animation-settings.json').write_text(json.dumps({'biome':'volcanic','density':0.25,'protected_lane':[0.52,0.80]}))
print('16 boss frames, 7 states, scene and crown exported')
