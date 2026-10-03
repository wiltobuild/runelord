"""Validate the checked-in native agent/skill package; Python 3.11+, PyYAML."""
from pathlib import Path
import re
import sys
import tomllib
import yaml

root = Path(__file__).resolve().parents[2]
errors = []
agents = sorted((root / '.codex/agents').glob('runelord-*.toml'))
skills = sorted((root / '.agents/skills').glob('runelord-*/SKILL.md'))
if len(agents) != 6:
    errors.append(f'Expected six project agents, got {len(agents)}')
if len(skills) != 8:
    errors.append(f'Expected eight project skills, got {len(skills)}')
names = set()
for file in agents:
    try:
        data = tomllib.loads(file.read_text(encoding='utf-8'))
        for key in ('name', 'description', 'developer_instructions'):
            if not isinstance(data.get(key), str) or not data[key].strip():
                errors.append(f'{file.name}: missing {key}')
        if data['name'] in names or data['name'] != file.stem:
            errors.append(f'{file.name}: duplicate/mismatched name')
        names.add(data['name'])
    except Exception as exc:
        errors.append(f'{file}: {exc}')
for file in skills:
    try:
        source = file.read_text(encoding='utf-8')
        match = re.match(r'^---\n(.*?)\n---\n', source, re.S)
        if not match:
            raise ValueError('Missing YAML frontmatter')
        data = yaml.safe_load(match.group(1))
        if data.get('name') != file.parent.name or not data.get('description'):
            errors.append(f'{file}: invalid name/description')
        meta = yaml.safe_load((file.parent/'agents/openai.yaml').read_text(encoding='utf-8'))
        if '$'+data['name'] not in meta['interface']['default_prompt']:
            errors.append(f'{file}: default prompt must name skill')
        if not 25 <= len(meta['interface']['short_description']) <= 64:
            errors.append(f'{file}: short description length')
        for link in re.findall(r'\]\(([^)]+)\)', source):
            if '://' not in link and not (file.parent/link.split('#')[0]).exists():
                errors.append(f'{file}: broken reference {link}')
    except Exception as exc:
        errors.append(f'{file}: {exc}')
for file in (root/'design/production').glob('*.md'):
    for link in re.findall(r'\]\(([^)]+)\)', file.read_text(encoding='utf-8')):
        if '://' not in link and not (file.parent/link.split('#')[0]).exists():
            errors.append(f'{file}: broken reference {link}')
print(f'Checked {len(agents)} agent TOMLs and {len(skills)} skill packages.')
for error in errors:
    print(error, file=sys.stderr)
sys.exit(bool(errors))
