from pathlib import Path
p=Path('work/export_maledictor_states.py');s=p.read_text().replace("f.alpha_composite(Image.open(idlepath/'frames'/f'frame-{i:02d}.png').convert('RGBA'),offset)","f.paste(Image.open(idlepath/'frames'/f'frame-{i:02d}.png').convert('RGBA'),offset)");p.write_text(s)
