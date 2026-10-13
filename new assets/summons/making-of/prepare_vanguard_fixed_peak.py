from pathlib import Path
p=Path('work/export_vanguard_subtle.py');s=p.read_text().replace("outputs/dread-vanguard-idle-r3'","outputs/dread-vanguard-idle-r4'")
s=s.replace('dy=4.0*math.sin(2*math.pi*i/8)','dy=4.0*math.sin(2*math.pi*i/8)\n if i in (2,6):\n  dx=math.copysign(1.3/math.sqrt(2),dx);dy=math.copysign(4/math.sqrt(2),dy)')
s=s.replace('limited to 4px vertical and 1.3px lateral','limited to 2.83px vertical and 0.92px lateral; third-frame and return peak clamped to neighboring poses').replace('maximum body lift4px','maximum body lift2.83px')
Path('work/export_vanguard_fixed_peak.py').write_text(s)
