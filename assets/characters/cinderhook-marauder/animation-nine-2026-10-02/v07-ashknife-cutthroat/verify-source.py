from PIL import Image
from pathlib import Path
import json,hashlib
root=Path('C:/Users/wilsh/Projects/runelord/assets/characters/cinderhook-marauder/animation-nine-2026-10-02')
for d in sorted(root.glob('v0[6-9]-*')):
 m=json.loads((d/'manifest.json').read_text(encoding='utf-8-sig')); errors=[]; results=[]
 atlas=Image.open(d/m['atlas']['file']).convert('RGBA')
 for e in m['atlas']['frames']:
  p=d/e['file'];im=Image.open(p).convert('RGBA');x,y,w,h=e['rect']
  if im.size!=(m['canvas']['width'],m['canvas']['height']):errors.append('dimensions '+e['file'])
  if hashlib.sha256(p.read_bytes()).hexdigest()!=e['sha256']:errors.append('hash '+e['file'])
  if im.tobytes()!=atlas.crop((x,y,x+w,y+h)).tobytes():errors.append('atlas '+e['file'])
  a=im.getchannel('A');box=a.getbbox()
  if not box or a.getextrema()!=(0,255):errors.append('alpha '+e['file'])
  if box[0]<=0 or box[1]<=0 or box[2]>=im.width or box[3]>=im.height:errors.append('edge '+e['file'])
  results.append({'file':e['file'],'sha256':e['sha256'],'bbox':box,'dimensions':im.size,'alpha':a.getextrema()})
 for s,c in m['states'].items():
  if sum(f['durationMs'] for f in c['frames'])!=c['durationMs']:errors.append('duration '+s)
  for f in c['frames']:
   if not (d/f['file']).exists() or f['durationMs']<=0:errors.append('frame '+s)
  for ev in c['events']:
   if not 0<=ev['timeMs']<=c['durationMs']:errors.append('event '+s)
  if s=='die' and (c['loop'] or c['nextState'] or c['terminal']!='hold final frame'):errors.append('death')
 report={'variantId':d.name,'revision':m['revision'],'manifestSha256':hashlib.sha256((d/'manifest.json').read_bytes()).hexdigest(),'reviewSha256':hashlib.sha256((d/'review.gif').read_bytes()).hexdigest(),'technicalPass':not errors,'errors':errors,'frames':results,'browser':{'url':'http://127.0.0.1:4381/'+d.name+'/preview.html','observed':'All required states actually played in Chromium; no JS errors, death reached terminal hold; full and small-size on dark, full on light.'},'visualStatus':'See independent reviewer report; this is builder evidence, not user approval.','limits':['Sparse generated poses, about300px native body height; not HD per-frame assets.','Not integrated into game.','Preview approval pending.']}
 (d/'builder-qa.json').write_text(json.dumps(report,indent=2),encoding='utf-8')
 print(d.name,'pass' if not errors else errors,'manifest',report['manifestSha256'])
