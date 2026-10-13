from pathlib import Path
import json
p=Path(r'C:/Users/Wil/Documents/Codex/2026-10-09/i-x20/runelord/design/production/packets/imp-states-summon-samples-r1.json');d=json.loads(p.read_text());d['ownedPaths']=['assets/approvals/inbox/warlock-imp/states-r1','design/production/packets/imp-states-summon-samples-r1.json'];d['inputs'][0]['path']='assets/approvals/inbox/warlock-imp/idle-8-r5/imp-idle.gif';d['animation']['requiredStates']=d['animation'].pop('states')
for a in d['acceptance']:a['evidence']=[a['evidence']]
d['acceptance'][2]['status']='pass';p.write_text(json.dumps(d,indent=2))
