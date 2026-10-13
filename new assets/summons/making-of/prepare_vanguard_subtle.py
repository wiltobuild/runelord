from pathlib import Path
p=Path('work/export_vanguard_idle.py');s=p.read_text().replace('outputs/dread-vanguard-idle-r1','outputs/dread-vanguard-idle-r3')
s=s.replace("src=Path(r'C:/Users/Wil/.codex/generated_images/01a11ef8-d768-7f21-86bf-77a410275895/exec-5d77510e-0bc6-4855-988a-5944f635988a.png')", "src=root/'outputs/dread-vanguard-idle-r2/pose-0.png'")
a=s.index("im=Image.open(src)");b=s.index('a=np.asarray(base)',a)
s=s[:a]+"base=Image.open(src).convert('RGBA');base.save(out/'battle-stance.png')\n"+s[b:]
a=s.index('y,x=np.indices');b=s.index("mask=Image.fromarray",a)
s=s[:a]+"y,x=np.indices(m.shape);eye=((x>320)&(x<390)&(y>230)&(y<305))\n"+s[b:]
s=s.replace('runes=[.38,.72,1.0,.58,.84,.48,.95,.63];eyes=[.65,.94,.55,.82,1.0,.60,.78,.47]', 'runes=[.92,.8,1.0,.86,.97,.82,.96,.88];eyes=[.9,1.0,.8,.95,.85,1.0,.82,.92]')
a=s.index(' for top in range');b=s.index(' f=f.transform',a)
s=s[:a]+''' dy=4.0*math.sin(2*math.pi*i/8)
 def displacement(y):
  t=min(1,max(0,(y-510)/370));blend=1-(t*t*(3-2*t))
  return dx*blend,dy*blend
 for top in range(0,1024,16):
  bottom=min(1024,top+16);x0,y0=displacement(top);x1,y1=displacement(bottom)
  mesh.append(((0,top,720,bottom),(-x0,top-y0,-x1,bottom-y1,720-x1,bottom-y1,720-x0,top-y0)))
'''+s[b:]
s=s.replace('duration_ms\':140','duration_ms\':160').replace('duration=140','duration=160').replace("'duration_ms':1120", "'duration_ms':1280").replace('Single imagegen battle-stance master; technical emission-intensity animation and 1.3px upper-body sway tapered to stationary feet. No pose redrawing or cyclic scale change.','Neutral fiery guard pose reused for eight small breathing steps. Upper-body displacement limited to 4px vertical and 1.3px lateral; displacement eases to zero below knees. Fire/eye intensity varies. Rejected lunging pose excluded.').replace("'upper_sway_px':dx", "'upper_sway_px':dx,'breathing_lift_px':dy")
s=s.replace("print('PASS: 8 frames; 1120ms loop; separate eye/rune curves; no cyclic scaling')", "assert all(np.array_equal(np.asarray(f)[885:],np.asarray(base)[885:]) for f in frames), 'Feet changed'\nprint('PASS: exactly8 frames;1280ms; stationary feet; maximum body lift4px; no lunging keypose')")
Path('work/export_vanguard_subtle.py').write_text(s)
