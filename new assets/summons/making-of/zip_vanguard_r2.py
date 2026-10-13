from pathlib import Path
import zipfile
p=Path('outputs/dread-vanguard-idle-r2')
with zipfile.ZipFile('outputs/dread-vanguard-idle-r2.zip','w',zipfile.ZIP_DEFLATED) as z:
 for f in p.rglob('*'):
  if f.is_file():z.write(f,f.relative_to(p))

