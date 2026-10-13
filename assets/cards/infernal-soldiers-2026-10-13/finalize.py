from pathlib import Path
import json,hashlib
B=Path(__file__).parent;R=B.parents[2]
def read(p):return json.loads(p.read_text(encoding='utf-8-sig'))
def save(p,v):p.parent.mkdir(parents=True,exist_ok=True);p.write_text(json.dumps(v,indent=2),encoding='utf-8')
m=read(B/'manifest.json');runtime=read(R/'packages/assets/manifest.json')
for c in m['cards']:
    if c['current_revision']=='r3':
        c['integration_status']='implemented; user requested implement them on their cards'
        c['runtime_url']=runtime['cards'][c['canonical_id']]
m['verification_summary']={'build':'npm run build passed','presentation_tests':'8 passed','browser':'No page errors; visible card images loaded; all 8 new assets HTTP 200','gallery':'23 submissions found in /api/art','approval':'Pending user review'}
save(B/'manifest.json',m)
idxpath=R/'assets/cards/card-art-index.json';idx=read(idxpath);byid={c['canonical_id']:c for c in m['cards']};idx['cards']=[byid.get(c.get('canonical_id'),c) for c in idx['cards']];save(idxpath,idx)
inputs=[]
for p in [R/'packages/content/hellbound.ts',B/'manifest.json',B/'runtime-qa.json',B/'gallery-verification.json']:
    inputs.append({'path':p.relative_to(R).as_posix(),'sha256':hashlib.sha256(p.read_bytes()).hexdigest()})
packet={'schema':1,'id':'infernal-soldier-card-art-2026-10-13','status':'complete','outcome':'Eight new illustrations on the in-game Hellbound Legion cards, with fixed frames and review gallery entries.','authorization':'User requested proper Infernal Soldier card art and review, then: implement them on their cards.','contentIds':list(byid),'owner':'runelord-art-director','integrationOwner':'runelord-technical-artist','reviewer':'self-reviewed; user design approval pending','ownedPaths':['assets/cards/infernal-soldiers-2026-10-13','assets/cards/card-art-index.json','tools/import/hellbound-cards.mjs','apps/web/public/game-assets/cards','packages/assets/manifest.json','apps/web/public/game-assets/manifest.json'],'dependencies':[],'exclusions':['Gameplay changes','Animation','Deployment'],'inputs':inputs,'animation':None,'acceptance':[{'name':'Fixed frames','status':'pass','evidence':'Eight verification.json records: zero changed protected pixels.'},{'name':'Integration','status':'pass','evidence':'runtime-qa.json; 8 presentation tests pass; npm run build passes.'},{'name':'Gallery submission','status':'pass','evidence':'gallery-verification.json; 23 entries present.'},{'name':'User design approval','status':'pending','evidence':'Exact hashes submitted for review; integration explicitly authorized.'}],'checkpoint':{'completed':['Eight new illustrations','Eight fixed-frame revisions','Runtime integration','Browser and build verification','Gallery submission'],'remaining':['User review'],'blockers':[],'nextAction':'User reviews the current exact revisions in gallery.'}}
save(R/'design/production/packets/infernal-soldier-card-art-2026-10-13.json',packet)
save(Path('C:/Users/wilsh/Documents/Codex/2026-10-13/us/outputs/infernal-soldiers/delivery.json'),{'production_folder':str(B),'generation_tool':'built-in image_gen','prompt_set':'prompts.json','cards':[{ 'name':c['source_snapshot']['name'],'path':str(R/c['output_path']),'status':c['status']} for c in m['cards']],'verification':m['verification_summary']})
