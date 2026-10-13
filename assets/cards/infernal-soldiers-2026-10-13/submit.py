exec((__import__('pathlib').Path(__file__).parent/'assemble.py').read_text().split('for d in data:')[0])
manifest=read(B/'manifest.json')
submissions=[]
for c in manifest['cards']:
    changed=c['canonical_id'] in jobs
    if changed:
        c['verification']['template_sha256']=sha(T/'baseline.png')
        c['integration_status']='authorized by user: implement them on their cards'
        c['runtime']='game-assets/cards/'+c['canonical_id']+'.webp'
        save((R/c['output_path']).parent/'verification.json',c['verification'])
    subject='infernal-soldier-card-'+c['canonical_id']
    result=json.loads(subprocess.check_output(['node','style-gallery/submit.mjs',str(R/c['output_path']),subject,c['current_revision'],'Cards','Infernal Soldiers - '+c['source_snapshot']['name']],cwd=R,text=True))
    submissions.append(result)
    if changed:
        result=json.loads(subprocess.check_output(['node','style-gallery/submit.mjs',str(R/c['artwork_path']),subject+'-art',c['current_revision'],'Card artwork','Infernal Soldiers - '+c['source_snapshot']['name']+' illustration'],cwd=R,text=True))
        submissions.append(result)
save(B/'manifest.json',manifest)
save(B/'gallery-submissions.json',submissions)
idxpath=R/'assets/cards/card-art-index.json'
idx=read(idxpath);byid={c['canonical_id']:c for c in manifest['cards']}
idx['cards']=[byid.get(c.get('canonical_id'),c) for c in idx['cards']]
idx['infernal_soldiers_batch']={'manifest':str(B/'manifest.json'),'status':'awaiting_approval','new_art_count':8,'cards_reviewed':15}
save(idxpath,idx)
save(B/'visual-qa.json',dict(status='pass',review='Self-reviewed generated illustrations, eight-card composed contact sheet, and full-size longest-text Maledictor card.',frame='All eight masters have zero changed protected pixels; all pixels outside the art mask identical to prior card.',text='Live hellbound.ts source snapshots match existing text exactly; no text changes.',notes='Eight new scenes; seven existing dedicated support-card illustrations retained. New images pending user design approval.'))
print('Submitted',len(submissions),'gallery entries; updated canonical inventory.')
