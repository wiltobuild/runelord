from pathlib import Path
import json,hashlib
import numpy as np
from PIL import Image,ImageDraw,ImageFont,ImageOps
R=Path(__file__).resolve().parent
T=R/'templates/runeblade-v1';B=R/'batch-002'
base=Image.open(T/'baseline.png').convert('RGBA');a=np.array(base)
clean=Image.open(T/'clean-panels.png').convert('RGBA')
mask=np.array(Image.open(T/'mask-union.png'))>0
idx=json.loads((R/'card-art-index.json').read_text(encoding='utf-8-sig'))
assert idx['active_batch']['batch_id']=='batch-002'
lines={'Rimecleave':['Deal 5 damage and','apply 1 Chill to','ALL enemies.'],'Pommel Crack':['Deal 8 damage.','Draw 1 card.'],'Iron Rime':['Gain 5 Guard.','Deal 5 damage.','Apply 1 Chill.']}
sha=lambda p:hashlib.sha256(p.read_bytes()).hexdigest()
previews=[]
for c in idx['cards']:
    if c['tracking_id'] not in idx['active_batch']['card_ids']:continue
    folder=Path(c['revision_directory']);data=c['source_snapshot'];name=data['name']
    assert ' '.join(lines[name])==data['rules']
    art=Image.open(folder/'illustration.png').convert('RGBA')
    fitted=ImageOps.fit(art,(911,701),method=Image.Resampling.LANCZOS)
    artlayer=Image.new('RGBA',base.size);artlayer.paste(fitted,(57,225));artlayer.putalpha(Image.open(T/'mask-art.png'))
    artlayer.save(folder/'art-layer.png')
    textlayer=Image.new('RGBA',base.size);draw=ImageDraw.Draw(textlayer);layout=[]
    specs=[('title',[name],110,(8,18,30,255)),('cost',[data['cost']],120,(3,18,36,255)),('type',[data['type'].upper()+' · RUNEBLADE'],38,(0,0,0,255)),('rules',lines[name],54,(3,3,3,255))]
    for region,rows,size,color in specs:
        box=Image.open(T/f'mask-{region}.png').getbbox();x0,y0,x1,y1=box
        while True:
            f=ImageFont.truetype(str(T/'Georgia-Bold.ttf'),size)
            boxes=[draw.textbbox((0,0),s,font=f) for s in rows]
            heights=[b[3]-b[1] for b in boxes];gap=18 if region=='rules' else 0
            total=sum(heights)+gap*(len(rows)-1)
            if max(b[2]-b[0] for b in boxes)<=x1-x0-12 and total<=y1-y0-12:break
            size-=1
        cy=(y0+y1-total)/2
        for text,bb,h in zip(rows,boxes,heights):
            draw.text(((x0+x1-(bb[2]-bb[0]))/2-bb[0],cy-bb[1]),text,font=f,fill=color);cy+=h+gap
        layout.append({'region':region,'lines':rows,'font':'Georgia Bold','font_size':size,'bounds':box,'line_gap':gap})
    textlayer.save(folder/'text-layer.png')
    out=clean.copy();out.alpha_composite(artlayer);out.alpha_composite(textlayer)
    arr=np.array(out);diff=np.any(arr!=a,axis=2)
    assert int((diff&~mask).sum())==0
    assert not (np.array(textlayer)[:,:,3][~mask]>0).any()
    slug=name.lower().replace(' ','-');path=folder/f'{slug}-r1.png';out.save(path)
    verification={'dimensions':list(out.size),'protected_pixels':int((~mask).sum()),'changed_protected_pixels':0,'protected_alpha_identical_to_baseline':True,'template_sha256':sha(T/'baseline.png'),'mask_sha256':sha(T/'mask-union.png'),'text_matches_catalog':True,'all_text_within_masks':True,'mask_version':'runeblade-v1','inspection':'Reused previously inspected immutable masks; no changes to geometry, corners or ornaments.'}
    (folder/'verification.json').write_text(json.dumps(verification,indent=2))
    (folder/'text-layout.json').write_text(json.dumps(layout,indent=2))
    c.update({'status':'pending_approval','output_path':str(path),'artwork_path':str(folder/'illustration.png'),'text_source_path':str(folder/'text-data.json'),'text_layer_path':str(folder/'text-layer.png'),'art_layer_path':str(folder/'art-layer.png'),'dimensions':[1024,1536],'template_hash':verification['template_sha256'],'mask_hash':verification['mask_sha256'],'verification':verification})
    idx['active_batch']['reviewed_revision_ids'][c['tracking_id']]='r1';idx['active_batch']['individual_decisions'][c['tracking_id']]='pending'
    (R/'card-art-index.json').write_text(json.dumps(idx,indent=2),encoding='utf-8')
    previews.append(out.resize((400,600),Image.Resampling.LANCZOS))
    print(name+': protected pixels identical; '+str([(l['region'],l['font_size']) for l in layout]))
sheet=Image.new('RGB',(1248,632),(15,25,38))
for i,im in enumerate(previews):sheet.paste(im,(16+i*408,16))
sheet.save(B/'batch-002-review.png')
idx['active_batch']['status']='awaiting_approval'
(R/'card-art-index.json').write_text(json.dumps(idx,indent=2),encoding='utf-8')

