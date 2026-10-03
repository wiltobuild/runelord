"""Technical sprite-sheet extraction only; all poses authored by image_gen.
Shared cell scale is preserved. Alpha bounding boxes register each pose to ground.
"""
from PIL import Image
from pathlib import Path
import json, hashlib, shutil

ROOT=Path(__file__).resolve().parents[2]
GEN=Path('C:/Users/wilsh/.codex/generated_images/01a0ffee-2ad9-7fe3-b60c-6c841e54aa99')
def sha(p): return hashlib.sha256(p.read_bytes()).hexdigest()
ledger=json.loads((ROOT/'assets/approvals/decisions.json').read_text())['decisions']
for identity, filename, revision in [('slagheart-juggernaut','exec-670efb7f-8424-447b-a9e2-996b37bf552e.png','r1'),('cindermaw-salamander','exec-076f85cb-7e5a-4511-8103-8ef660e1e3b4.png','r2')]:
    directory=ROOT/'assets/animations/fire-demo-r1'/identity
    (directory/'frames').mkdir(parents=True,exist_ok=True)
    sheet=directory/'poses.png'; shutil.copyfile(GEN/filename,sheet)
    im=Image.open(sheet).convert('RGBA'); frames=[]; bounds=[]
    for i in range(12):
        col=i%4; row=i//4
        cell=im.crop((round(col*im.width/4),round(row*im.height/3),round((col+1)*im.width/4),round((row+1)*im.height/3)))
        bbox=cell.getchannel('A').point(lambda a:255 if a>16 else 0).getbbox()
        # Retain all cell pixels and one common scale, translating only registration.
        canvas=Image.new('RGBA',(448,448)); dx=(448-cell.width)//2; dy=414-bbox[3]
        canvas.alpha_composite(cell,(dx,dy)); canvas.save(directory/f'frames/{i:02}.png')
        frames.append(canvas); bounds.append([bbox[0]+dx,bbox[1]+dy,bbox[2]+dx,bbox[3]+dy])
    clips={'idle':([0,1,0],[380,380,380],True),'attack':([2,3,4,5],[150,170,140,140],False),'hit':([6,7,0],[140,140,100],False),'wounded_idle':([8,9,8],[400,400,400],True),'die':([8,10,11],[180,280,550],False)}
    states={}
    preview=[]; durations=[]
    for name,(indices,times,loop) in clips.items():
        states[name]={'frames':[{'file':f'frames/{i:02}.png','durationMs':t} for i,t in zip(indices,times)],'loop':loop,'events':[{'name':'impact','timeMs':150}] if name=='attack' else []}
        for i,t in zip(indices,times):
            bg=Image.new('RGBA',(448,448),'#211b20'); bg.alpha_composite(frames[i]); preview.append(bg.convert('RGB')); durations.append(t)
    preview[0].save(directory/'preview.gif',save_all=True,append_images=preview[1:],duration=durations,loop=0,disposal=2)
    master=ROOT/f'assets/concepts/fire-monsters-20-2026-10-02/{identity}/base-{revision}.png'
    h=sha(master)
    manifest={'id':identity,'method':'whole-character generated keyframes','canvas':{'width':448,'height':448},'anchor':{'x':224,'y':414},'facing':'left','master':{'path':str(master.relative_to(ROOT)),'sha256':h,'approval':ledger.get(h)},'source':{'path':str(sheet.relative_to(ROOT)),'sha256':sha(sheet)},'authorization':'User requested existing fire monster art animated and integrated into demo, 2026-10-03. New animation pending gallery review; not self-approved.','states':states,'frameBounds':bounds,'limitations':['12 authored key poses; intentionally stepped sprite animation, no interpolated in-between drawings.','Fire breath is baked into attack pose.','Self-review completed; independent playback review requested.']}
    (directory/'manifest.json').write_text(json.dumps(manifest,indent=2)+'\n')
    print(identity,len(frames),'frames',list(states))
