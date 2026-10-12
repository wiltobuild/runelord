from pathlib import Path
p=Path('work/export_ironhorn_subtle.py');s=p.read_text().replace('ironhorn-bulwark-idle-r1','ironhorn-bulwark-idle-r3').replace('goatmen-expansion-r2/ironhorn-bulwark.png','ironhorn-bulwark-source-r3/ironhorn-bulwark.png');Path('work/export_ironhorn_subtle_r3.py').write_text(s)
p=Path('work/imp-preview.config.mjs');s=p.read_text().replace("?'-idle-r2/idle.webp'","?'-idle-r3/idle.webp'");p.write_text(s)
p=Path('outputs/summon-idle-review-r1/review.html');s=p.read_text(encoding='utf8').replace('revision=rigid-weapons-r2','revision=source-and-sword-r3');p.write_text(s,encoding='utf8')
