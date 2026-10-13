from pathlib import Path
p=Path('work/check_full_summons.cjs');s=p.read_text();a=s.index('await p.locator(`[data-state=');b=s.index(';await p.waitForTimeout(210)',a);s=s[:a]+'await p.locator(`button[data-state="${state}"]`).click()'+s[b:];p.write_text(s)
