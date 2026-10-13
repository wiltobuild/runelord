from pathlib import Path
import json, shutil, hashlib, subprocess
from PIL import Image, ImageOps
import numpy as np
B=Path(__file__).resolve().parent
R=B.parents[2]
OLD=R/'assets/cards/hellbound-legion-r1'
T=OLD/'template'
EXPORT=Path('C:/Users/wilsh/Documents/Codex/2026-10-13/us/outputs/infernal-soldiers')
EXPORT.mkdir(parents=True,exist_ok=True)
read=lambda p:json.loads(p.read_text(encoding='utf-8-sig'))
sha=lambda p:hashlib.sha256(p.read_bytes()).hexdigest()
def save(p,obj):p.write_text(json.dumps(obj,indent=2,ensure_ascii=False),encoding='utf-8')
jobs={j['id']:j for j in read(B/'generated-sources.json')}
data=read(B/'current-content.json')
assert data==read(OLD/'card-data.json'),'Live rules changed; reconcile before assembly'
prior={c['canonical_id']:c for c in read(OLD/'manifest.json')['cards']}
ledger=read(R/'assets/approvals/decisions.json')['decisions']
mask=Image.open(T/'mask-art.png').convert('L')
box=mask.getbbox()
mask_array=np.array(mask)>0
cards=[]
for d in data:
    old=prior[d['id']]
    original=R/old['output_path']
    if d['id'] in jobs:
        j=jobs[d['id']]
        folder=B/d['id']/'r3';folder.mkdir(parents=True,exist_ok=True)
        source=Path(j['generated_path'])
        shutil.copy2(source,folder/'illustration.png')
        art=ImageOps.fit(Image.open(source).convert('RGBA'),(box[2]-box[0],box[3]-box[1]),Image.Resampling.LANCZOS)
        layer=Image.new('RGBA',(1024,1536));layer.paste(art,box[:2]);layer.putalpha(mask)
        layer.save(folder/'art-layer.png')
        out=Image.open(original).convert('RGBA');before=np.array(out)
        out.alpha_composite(layer)
        assert not np.any(np.array(out)[~mask_array]!=before[~mask_array]),'Changed outside illustration'
        p=folder/(d['id']+'-r3.png');out.save(p)
        for name in ['text-layer.png','text-layout.json','text-data.json']:
            shutil.copy2(original.parent/name,folder/name)
        save(folder/'source-snapshot.json',d)
        (folder/'illustration-prompt.txt').write_text(j['prompt'],encoding='utf-8')
        refs=[dict(path=q,sha256=sha(Path(q)),gallery=ledger.get(sha(Path(q)))) for q in j['refs']]
        save(folder/'provenance.json',dict(tool='built-in image_gen',prompt=j['prompt'],references=refs,generated_source=str(source),generated_sha256=sha(source),identity_approval_context=old['source'].get('authorization'),template=str(T),previous_card=str(original)))
        check=json.loads(subprocess.check_output(['node','tools/production/art.mjs','compare',str(T/'baseline.png'),str(p),str(T/'mask-union.png')],cwd=R,text=True))
        assert check['passed']
        check.update(text_matches_live_content=True,changed_outside_art_mask=0,output_sha256=sha(p),dimensions=[1024,1536],changed_protected_pixels=check['changedPixels'],protected_pixels=check['protectedPixels'])
        save(folder/'verification.json',check)
        rec={**old,'current_revision':'r3','status':'pending_approval','output_path':p.relative_to(R).as_posix(),'artwork_path':(folder/'illustration.png').relative_to(R).as_posix(),'verification':check,'illustration_prompt_path':str(folder/'illustration-prompt.txt'),'reference_image_paths':j['refs'],'template_path':str(T/'baseline.png'),'editable_mask_path':str(T/'mask-union.png'),'prior_revisions':[*old.get('prior_revisions',[]),dict(revision=old['current_revision'],path=old['output_path'],sha256=sha(original),gallery=ledger.get(sha(original)),reason='New scene illustration requested by user')],'integration_status':'review_only; runtime still uses previous revision'}
        rec.pop('runtime',None)
        cards.append(rec)
        shutil.copy2(p,EXPORT/p.name)
        print(d['id'],check['changedPixels'],'changed protected pixels')
    else:
        rec=dict(old);h=sha(original);rec['gallery_decision']=ledger.get(h);rec['status']={'Approved':'approved','Needs revision':'needs_revision'}.get(ledger.get(h,{}).get('status'),'pending_approval');cards.append(rec)
save(B/'manifest.json',dict(schema_version=1,project_root=str(R),cards=cards,active_batch=dict(id='infernal-soldiers-2026-10-13',status='awaiting_approval',card_ids=list(jobs))))
for name,selected,columns in [('new-art-review', [c for c in cards if c['canonical_id'] in jobs],4),('full-set-review',cards,5)]:
    w,h=320,480;sheet=Image.new('RGB',(columns*(w+16),((len(selected)+columns-1)//columns)*(h+16)),(29,17,20))
    for i,c in enumerate(selected):
        im=Image.open(R/c['output_path']).convert('RGBA').resize((w,h),Image.Resampling.LANCZOS)
        sheet.paste(im,((i%columns)*(w+16)+8,(i//columns)*(h+16)+8),im)
    sheet.save(B/(name+'.png'));shutil.copy2(B/(name+'.png'),EXPORT/(name+'.png'))
shutil.copy2(B/'generation.json',EXPORT/'prompts.json')
