from pathlib import Path
p=Path('work/imp-preview.config.mjs');s=p.read_text();s=s.replace("+url.split('/')[2]+'-idle-r1/idle.webp'","+url.split('/')[2]+(['ironhorn-bulwark','iron-legionary'].includes(url.split('/')[2])?'-idle-r2/idle.webp':'-idle-r1/idle.webp')");p.write_text(s)
p=Path('outputs/summon-idle-review-r1/review.html');s=p.read_text(encoding='utf8').replace('/idle.webp"','/idle.webp?revision=rigid-weapons-r2"');p.write_text(s,encoding='utf8')
