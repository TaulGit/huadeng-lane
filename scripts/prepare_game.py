import json,shutil
from pathlib import Path
for a in json.loads(Path('output/asset-manifest.json').read_text()):
 shutil.copyfile(a['source'],Path('public/models')/(a['name']+'.glb'))
shutil.copyfile('output/street.png','cover.png')
