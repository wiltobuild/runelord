from pathlib import Path
p=Path('work/export_vanguard_subtle.py');s=p.read_text().replace('outputs/dread-vanguard-idle-r3','outputs/dread-vanguard-aligned-fire-r1').replace("src=root/'outputs/dread-vanguard-idle-r2/pose-0.png'", "src=Path(r'C:/Users/Wil/.codex/generated_images/01a11ef8-d768-7f21-86bf-77a410275895/exec-2b1081dc-7ade-4c79-9fa4-0a939befc424.png')")
s=s.replace("base=Image.open(src).convert('RGBA');base.save(out/'battle-stance.png')", """render=Image.open(src).convert('RGBA').resize((720,1024),Image.Resampling.LANCZOS)
base=Image.open(root/'outputs/dread-vanguard-empowerment-r1/unlit-registered.png').convert('RGBA')
# Use the new blade-bound effect only in the weapon region; body stays identical to unlit master.
region=Image.new('L',(720,1024));ImageDraw.Draw(region).polygon([(448,373),(547,143),(655,40),(710,40),(710,440),(544,470),(499,463),(453,444),(458,420)],fill=255)
base=Image.composite(render,base,region);base.save(out/'battle-stance.png')""")
s=s.replace("power=np.where(eye,eyes[i],runes[i]);f=a.copy();weight=m*(1-power)*.79", "power=np.where(eye,eyes[i],runes[i]);power=power*(.94+.08*np.sin(y*.065-i*math.pi/2));f=a.copy();weight=m*(1-power)*.79")
s=s.replace('Neutral fiery guard pose reused for eight small breathing steps.', 'Blade-bound fire drawn directly on weapon; original unlit body retained, eight small breathing steps with traveling fire intensity.')
Path('work/export_aligned_fire.py').write_text(s)
