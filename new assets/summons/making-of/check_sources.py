from PIL import Image
from pathlib import Path
for n in ['exec-fc4bf964-ac90-42fc-93cc-f72ec698eebe.png','exec-8b969d42-829f-4993-a481-1be96d151d7a.png','exec-b542bbbc-2f88-4107-8c86-abc0ceaaaeb3.png','exec-82b22e33-d692-46bf-b878-9c06d10574b6.png']:
 p=Path(r'C:/Users/Wil/.codex/generated_images/01a11ef8-d768-7f21-86bf-77a410275895')/n
 im=Image.open(p);print(n,im.size)
