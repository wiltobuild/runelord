from pathlib import Path
import json,hashlib,shutil,zipfile
repo=Path(r'C:/Users/Wil/Documents/Codex/2026-10-09/i-x20/runelord');out=Path(r'C:/Users/Wil/Documents/Codex/2026-10-09/sp-2/outputs/imp-states-r1')
p=repo/'design/production/packets/imp-states-summon-samples-r1.json';d=json.loads(p.read_text());d['animation']['method']='whole-character-frames';dest=repo/'work/production/imp-states-summon-samples-r1';dest.mkdir(parents=True,exist_ok=True)
for name in ['qa.json','independent-review.md']:shutil.copy2(out/name,dest/name)
for a in d['acceptance']:
 source=Path(a['evidence'][0]);target=dest/source.name;a['evidence']=[{'path':target.relative_to(repo).as_posix(),'sha256':hashlib.sha256(target.read_bytes()).hexdigest()}]
p.write_text(json.dumps(d,indent=2))
with zipfile.ZipFile(out.parent/'imp-states-r1.zip','w',zipfile.ZIP_DEFLATED) as z:
 for f in out.rglob('*'):
  if f.is_file():z.write(f,f.relative_to(out))
