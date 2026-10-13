from pathlib import Path
p=Path('work/export_vanguard_fire.py');s=p.read_text().replace('tile=sheet.crop(box)','''
 if i==2:box=(0,768,538,1536)
 tile=sheet.crop(box)
 if i==3:tile.paste((0,0,0,0),(0,0,26,280))
 if i>=2:tile.paste((0,0,0,0),(0,0,200,20))''');p.write_text(s)
