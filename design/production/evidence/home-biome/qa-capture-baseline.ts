import fs from 'node:fs';
import path from 'node:path';
import {pathToFileURL} from 'node:url';
const results=[];
for(const [index,root] of ['C:/Users/wilsh/Projects/runelord','C:/Users/wilsh/Projects/runelord-roguelike-pages-recovery'].entries()){
 const e=await import(pathToFileURL(path.join(root,'packages/engine/index.ts')).href);
 for(const deck of ['gravehost','rimebound','runewarden','warband']){
  let s=index?e.newRoguelikeRun(42,deck):e.newInfernalRun(42,deck);
  if(!index){const n=e.mapDestinations(s).find((n:any)=>n.kind==='combat');s=e.dispatch(e.dispatch(s,{type:'arrive',node:n.id}),{type:'enter-location'});}
  s=e.dispatch(s,{type:'end'});
  results.push({root,deck,save:JSON.parse(e.save(s)),state:s});
 }
}
fs.writeFileSync(new URL('./baseline-saves.json',import.meta.url),JSON.stringify(results,null,2));
console.log(results.map(r=>({root:r.root,deck:r.deck,actions:r.state.history.length,realm:r.state.journey?.realm,room:r.state.room})));
