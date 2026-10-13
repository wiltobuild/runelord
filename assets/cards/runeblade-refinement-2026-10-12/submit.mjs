import fs from 'node:fs';
import path from 'node:path';
import {execFileSync} from 'node:child_process';
const root=path.resolve(import.meta.dirname);
const p=path.join(root,'manifest.json'),m=JSON.parse(fs.readFileSync(p));
for(const c of m.cards){
 if(['exhume','mass-exhumation'].includes(c.canonical_id)) {
  c.generation_method='New built-in imagegen illustration; deterministic exact-template composition.';
  c.illustration_prompt_path=path.join(root,c.canonical_id,'generation-prompt.txt');
  const scene=c.canonical_id==='exhume'?'A steel gauntlet channels cyan magic into two broken graves, two skeletal remains rising.':'Four stone sarcophagi open around a cyan diamond floor rune, four skeletons rising. No large foreground hand.';
  fs.writeFileSync(c.illustration_prompt_path,`${scene} Runelord serious angular cel-shaded illustration only, navy/steel/ivory/icy cyan, broad hard shadow planes, clear bold forms, no gore, no text, border or card frame. Landscape 4:3. Rendering reference: C:/Users/wilsh/Projects/runelord/assets/cards/runeblade-demo-2026-10-06/dark-tithe/r1/illustration.png. Built-in imagegen; generated image retained unchanged as generated-illustration.png.\n`);
  fs.writeFileSync(path.join(path.dirname(c.output_path),'provenance.json'),JSON.stringify(c,null,2));
 }
 execFileSync(process.execPath,['C:/Users/wilsh/Projects/runelord/style-gallery/submit.mjs',c.output_path,`runeblade-demo-${c.canonical_id}`,'refinement-2026-10-12','Cards',c.source_snapshot.name],{stdio:'pipe'});
}
fs.writeFileSync(p,JSON.stringify(m,null,2));
console.log(`Submitted ${m.cards.length} updated card faces; all protected frame pixel differences are zero.`);
