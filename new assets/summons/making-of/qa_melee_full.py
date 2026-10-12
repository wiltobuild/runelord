import json
from pathlib import Path
import numpy as np
from PIL import Image

root=Path(__file__).resolve().parents[1]
results={}
for name, idle_name, offset in [('ash-pikeman','ash-pikeman-idle-r1',(340,120)),('ironhorn-bulwark','ironhorn-bulwark-idle-r3',(300,100))]:
    base=root/'outputs'/f'{name}-states-r1'
    manifest=json.loads((base/'animation.json').read_text())
    issues=[]
    states={}
    for state, entry in manifest['states'].items():
        elapsed=0
        edge_hits=[]
        for frame in entry['frames']:
            if frame['time']!=elapsed: issues.append(f'{state}: noncontiguous timestamp')
            elapsed+=frame['duration_ms']
            im=Image.open(base/frame['src']).convert('RGBA')
            if list(im.size)!=manifest['canvas']: issues.append(f'{state}: canvas mismatch')
            a=np.array(im.getchannel('A'))
            if max(a[0,:].max(),a[-1,:].max(),a[:,0].max(),a[:,-1].max())>16: edge_hits.append(frame['src'])
        if elapsed!=entry['duration']: issues.append(f'{state}: total duration mismatch')
        for event in entry.get('events',[]):
            if not 0<=event['time_ms']<=elapsed: issues.append(f'{state}: event out of range')
        if edge_hits: issues.append(f'{state}: opaque canvas border pixels')
        states[state]={'frames':len(entry['frames']),'duration_ms':elapsed,'loop':entry.get('loop'), 'border_clipping':edge_hits,'events':entry.get('events',[])}
    exact=[]
    for i, frame in enumerate(manifest['states']['idle']['frames']):
        old=Image.open(root/'outputs'/idle_name/'frames'/f'frame-{i:02}.png').convert('RGBA')
        new=Image.open(base/frame['src']).convert('RGBA')
        x,y=offset
        same=np.array_equal(np.array(old),np.array(new.crop((x,y,x+old.width,y+old.height))))
        exact.append(same)
    if not all(exact): issues.append('Accepted idle pixels changed')
    results[name]={'status':'pass' if not issues else 'issues','issues':issues,'canvas':manifest['canvas'],'anchor':manifest['anchor'],'accepted_idle':idle_name,'idle_rgba_exact_each_frame':exact,'idle_offset':offset,'states':states,'visual_review':{'reviewed':'Attack, hit, wounded idle, spawn, and death contact sheets; first/last and maximum extension poses.','findings':'No obvious clipping, neighbor-cell fragments, or broken weapon grips. Authored action silhouettes vary mildly, but no gross scale jump observed. Collapsed pose changes apparent silhouette size through curling/foreshortening.','limits':'Contact-sheet and manifest QA; parent separately reviews timed playback. Sparse authored key poses are not a smooth inbetweened motion sequence.'}}
(root/'work'/'melee-full-independent-qa.json').write_text(json.dumps(results,indent=2))
print(json.dumps({k:{'status':v['status'],'issues':v['issues'],'idle_exact':all(v['idle_rgba_exact_each_frame'])} for k,v in results.items()},indent=2))
