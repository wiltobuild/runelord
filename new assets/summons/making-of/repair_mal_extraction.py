from pathlib import Path
p=Path('work/export_maledictor_states.py');s=p.read_text().replace('(0,0,349,537),(350,0,735,537),(735,0,1024,537)','(0,0,360,538),(325,0,744,538),(740,0,1024,538)').replace('(0,538,380,1013)','(0,538,385,1015)').replace('(0,1000,342,1536)','(0,985,342,1536)').replace('(630,1190,1024,1536)','(620,1190,1024,1536)')
s=s.replace('poses=[]','''def clean_component(tile):
 a=np.array(tile.getchannel('A'));h,w=a.shape;seen=np.zeros_like(a,dtype=bool);best=[]
 for yy,xx in zip(*np.where(a>16)):
  if seen[yy,xx]:continue
  q=[(int(xx),int(yy))];seen[yy,xx]=True;pts=[]
  while q:
   x,y=q.pop();pts.append((x,y))
   for nx,ny in [(x-1,y),(x+1,y),(x,y-1),(x,y+1)]:
    if 0<=nx<w and 0<=ny<h and not seen[ny,nx] and a[ny,nx]>16:seen[ny,nx]=True;q.append((nx,ny))
  if len(pts)>len(best):best=pts
 mask=Image.new('L',tile.size);pix=mask.load()
 for x,y in best:pix[x,y]=255
 mask=mask.filter(ImageFilter.MaxFilter(9));tile.putalpha(Image.fromarray(np.minimum(a,np.array(mask))));return tile
poses=[]''').replace('tile=source.crop(box);tile=tile.resize','tile=clean_component(source.crop(box));tile=tile.resize')
p.write_text(s)
