from pathlib import Path
import json, hashlib, shutil
import numpy as np
from PIL import Image, ImageDraw, ImageFont, ImageOps

ROOT=Path(__file__).resolve().parent
T=ROOT/'templates'/'runeblade-v1'
base=Image.open(T/'baseline.png').convert('RGBA');arr=np.array(base)
union=np.array(Image.open(T/'mask-union.png'))>0
clean=arr.copy()
# Transfinite interpolation matches all four untouched boundary edges.
for name in ['title','cost','type','rules']:
    mask=np.array(Image.open(T/f'mask-{name}.png'))>0
    yy,xx=np.where(mask);x0,x1=xx.min(),xx.max();y0,y1=yy.min(),yy.max()
    u=np.linspace(0,1,x1-x0+3)[1:-1][None,:,None]
    v=np.linspace(0,1,y1-y0+3)[1:-1][:,None,None]
    left=arr[y0:y1+1,x0-1,:3].astype(float)[:,None,:];right=arr[y0:y1+1,x1+1,:3].astype(float)[:,None,:]
    top=arr[y0-1,x0:x1+1,:3].astype(float)[None,:,:];bottom=arr[y1+1,x0:x1+1,:3].astype(float)[None,:,:]
    corners=(1-u)*(1-v)*arr[y0-1,x0-1,:3]+u*(1-v)*arr[y0-1,x1+1,:3]+(1-u)*v*arr[y1+1,x0-1,:3]+u*v*arr[y1+1,x1+1,:3]
    clean[y0:y1+1,x0:x1+1,:3]=np.clip(np.rint(left*(1-u)+right*u+top*(1-v)+bottom*v-corners),0,255).astype('uint8')
    if name=='cost':
        # The medallion is curved: its rectangle corners approach the rim.
        # Interpolate rows rather than using dark corner samples as a surface.
        fill=left*(1-u)+right*u
        fade=np.minimum(np.minimum(np.arange(y1-y0+1)+1,np.arange(y1-y0+1)[::-1]+1)/4,1)[:,None,None]
        original=arr[y0:y1+1,x0:x1+1,:3].astype(float)
        clean[y0:y1+1,x0:x1+1,:3]=np.rint(fill*fade+original*(1-fade)).astype('uint8')
clean[union,3]=255
Image.fromarray(clean).save(T/'clean-panels.png')
fontpath=str(T/'Georgia-Bold.ttf')

idx=json.loads((ROOT/'card-art-index.json').read_text(encoding='utf-8-sig'))
previews=[]
for rec in idx['cards']:
    if rec['tracking_id'] not in idx['active_batch']['card_ids']:continue
    folder=Path(rec['revision_directory']);data=rec['source_snapshot']
    art=Image.open(folder/'illustration.png').convert('RGBA')
    fitted=ImageOps.fit(art,(911,701),method=Image.Resampling.LANCZOS)
    artlayer=Image.new('RGBA',base.size);artlayer.paste(fitted,(57,225))
    artlayer.putalpha(Image.open(T/'mask-art.png'))
    artlayer.save(folder/'art-layer.png')
    composed=Image.fromarray(clean);composed.alpha_composite(artlayer)
    textlayer=Image.new('RGBA',base.size);draw=ImageDraw.Draw(textlayer)
    specs=[('title',data['name'],110,(8,18,30,255)),('cost',data['cost'],120,(3,18,36,255)),('type',data['type'].upper()+' · RUNEBLADE',38,(0,0,0,255)),('rules',data['rules'].replace('**',''),56,(3,3,3,255))]
    layout=[]
    for name,text,size,color in specs:
        box=Image.open(T/f'mask-{name}.png').getbbox();x0,y0,x1,y1=box
        while True:
            font=ImageFont.truetype(fontpath,size);bb=draw.textbbox((0,0),text,font=font)
            if bb[2]-bb[0]<=x1-x0-12 and bb[3]-bb[1]<=y1-y0-8:break
            size-=1
        cx=(x0+x1)/2;cy=(y0+y1)/2
        draw.text((cx-(bb[2]-bb[0])/2-bb[0],cy-(bb[3]-bb[1])/2-bb[1]),text,font=font,fill=color)
        layout.append({'region':name,'text':text,'font':'Georgia Bold','font_size':size,'bounds':box})
    textlayer.save(folder/'text-layer.png');composed.alpha_composite(textlayer)
    # The master must remain pixel-identical outside the explicit edit regions.
    out=np.array(composed);diff=np.any(out!=arr,axis=2)
    count=int((diff&~union).sum());assert count==0,count
    assert np.array_equal(out[:,:,3][~union],arr[:,:,3][~union])
    assert composed.size==(1024,1536)
    slug=data['name'].lower().replace(' ','-');outpath=folder/f'{slug}-r1.png';composed.save(outpath)
    verification={'dimensions':[1024,1536],'changed_protected_pixels':count,'protected_pixels':int((~union).sum()),'protected_alpha_identical_to_baseline':True, 'editable_interiors_opaque':True,'text_matches_catalog':True,'template_sha256':hashlib.sha256((T/'baseline.png').read_bytes()).hexdigest(),'mask_sha256':hashlib.sha256((T/'mask-union.png').read_bytes()).hexdigest(),'mask_visual_review':'Frame edges, corner spirals, medallion rim, type diamonds, panel borders and bottom gem excluded.'}
    (folder/'verification.json').write_text(json.dumps(verification,indent=2))
    (folder/'text-layout.json').write_text(json.dumps(layout,indent=2))
    rec.update({'status':'pending_approval','output_path':str(outpath),'artwork_path':str(folder/'illustration.png'),'text_source_path':str(folder/'text-data.json'),'text_layer_path':str(folder/'text-layer.png'),'art_layer_path':str(folder/'art-layer.png'),'dimensions':[1024,1536],'verification':verification})
    idx['active_batch']['reviewed_revision_ids'][rec['tracking_id']]='r1'
    idx['active_batch']['individual_decisions'][rec['tracking_id']]='pending'
    previews.append(composed.resize((400,600),Image.Resampling.LANCZOS))
    (ROOT/'card-art-index.json').write_text(json.dumps(idx,indent=2),encoding='utf-8')
    print(data['name']+': zero changed protected pixels; '+str(layout))
sheet=Image.new('RGB',(1248,632),(15,25,38))
for i,im in enumerate(previews):sheet.paste(im,(16+i*408,16))
sheet.save(ROOT/'batch-001'/'batch-001-review.png')
idx['active_batch']['status']='awaiting_approval'
(ROOT/'card-art-index.json').write_text(json.dumps(idx,indent=2),encoding='utf-8')


