from pathlib import Path
import json,zipfile
repo=Path(r'C:/Users/Wil/Documents/Codex/2026-10-09/i-x20/runelord');p=repo/'design/production/packets/imp-states-summon-samples-r1.json';d=json.loads(p.read_text());d['checkpoint']={'completed':['Five new Imp state previews with unchanged approved idle','Independent static review and spawn scale correction','Browser state controls, completion, death hold/replay verified','Two goatman concepts','Two revised aggressive demon soldiers with glowing weapon runes','All previews submitted pending user design review'],'remaining':[],'blockers':[],'nextAction':'User reviews animation and concept previews'};p.write_text(json.dumps(d,indent=2))
out=Path(r'C:/Users/Wil/Documents/Codex/2026-10-09/sp-2/outputs/imp-states-r1')
with zipfile.ZipFile(out.parent/'imp-states-r1.zip','w',zipfile.ZIP_DEFLATED) as z:
 for f in out.rglob('*'):
  if f.is_file():z.write(f,f.relative_to(out))
