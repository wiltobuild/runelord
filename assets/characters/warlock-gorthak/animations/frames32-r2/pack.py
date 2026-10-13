# Idle-only revision: do not repack nonidle frames.
import runpy
from pathlib import Path
runpy.run_path(str(Path(__file__).parent/'repair-idle.py'))
