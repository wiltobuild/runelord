from PIL import Image,ImageDraw
from pathlib import Path
import json,hashlib,sys
root=Path(sys.argv[1]); out=root.parent/'qa'/root.name;out.mkdir(parents=True,exist_ok=True)
m=json.loads((root/'manifest.json').read_text(encoding='utf-8-sig')); atlasfile=m['atlas'] if isinstance(m['atlas'],str) else m['atlas']['file']; atlas=Image.open(root/atlasfile).convert('RGBA'); results={'variant':root.name,'manifest_sha256':hashlib.sha256((root/'manifest.json').read_bytes()).hexdigest(),'atlas_sha256':hashlib.sha256((root/atlasfile).read_bytes()).hexdigest(),'states':{}}
for state, anim in m['states'].items():
    files=list(dict.fromkeys(f['file'] for f in anim['frames'])); canvas=Image.new('RGB',(2*m['canvas']['width'],(m['canvas']['height']+20)*((len(files)+1)//2)),'#e2d9cd');d=ImageDraw.Draw(canvas); checks=[]
    for i,p in enumerate(files):
        im=Image.open(root/p).convert('RGBA');a=im.getchannel('A');bbox=a.getbbox(); rect=(next(f['atlasRect'] for f in anim['frames'] if f['file']==p) if isinstance(m['atlas'],str) else next(f['rect'] for f in m['atlas']['frames'] if f['file']==p));x,y,w,h=rect; region=atlas.crop((x,y,x+w,y+h));checks.append({'file':p,'sha256':hashlib.sha256((root/p).read_bytes()).hexdigest(),'size':im.size,'alpha_extrema':a.getextrema(),'bbox':bbox,'atlas_equal':region.tobytes()==im.tobytes(),'edge_opaque':any(a.crop(z).getextrema()[1]>0 for z in [(0,0,1,im.height),(im.width-1,0,im.width,im.height),(0,0,im.width,1),(0,im.height-1,im.width,im.height)]),'bottom_band_bbox':a.crop((0,300,384,330)).getbbox()})
        checks[-1]['atlas_visible_equal']=all(pa==pb or (pa[3]==0 and pb[3]==0) for pa,pb in zip(region.getdata(),im.getdata()))
        px=(i%2)*m['canvas']['width'];py=(i//2)*(m['canvas']['height']+20);canvas.paste(im,(px,py+20),im);d.text((px+4,py+4),p,fill='#111111')
    canvas.save(out/(state+'-light.png'));duration=sum(f['durationMs'] for f in anim['frames']); results['states'][state]={'frames':checks,'duration_sum':duration,'duration_agrees':duration==anim['durationMs'],'events_in_bounds':all(0<=e['timeMs']<=duration for e in anim['events']),'loop':anim['loop'],'terminal':anim['terminal'],'holdLastFrame':anim.get('holdLastFrame',bool(anim['terminal'])),'nextState':anim['nextState']}
(out/'metadata-audit.json').write_text(json.dumps(results,indent=2));print(root.name, 'audited', sum(len(s['frames']) for s in results['states'].values()), 'state-frame references')


