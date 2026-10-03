import fs from 'node:fs';
import path from 'node:path';
import {readJson,hashFile,parseCatalog,slug,validateRecord,inside} from './core.mjs';

export function scanStatus(root) {
  root=path.resolve(root);
  const errors=[], items=[], read=(p,fallback) => { try{return readJson(path.join(root,p));}catch(e){errors.push(`${p}: ${e.message}`);return fallback;} };
  const dir=path.join(root,'catalog');
  for(const file of fs.readdirSync(dir).filter(f => /^(cards-|units|potions|runestones).*\.md$/.test(f)).sort()) {
    const relative=`catalog/${file}`, result=parseCatalog(fs.readFileSync(path.join(dir,file),'utf8'),relative);
    items.push(...result.rows);errors.push(...result.errors);
  }
  const runtime=read('packages/assets/manifest.json',{}), ledger=read('assets/approvals/decisions.json',{});
  let implemented=null;
  try {
    const code=fs.readFileSync(path.join(root,'packages/content/index.ts'),'utf8');
    const block=code.match(/export const implemented\s*=\s*\[([\s\S]*?)\]\s*as const/);
    if(!block) throw Error('unsupported implementation registry syntax');
    const body=block[1].replace(/\/\/[^\n]*/g,'');
    if(body.replace(/"[^"]+"|'[^']+'|\s|,/g,'')) throw Error('nonliteral implementation registry; adapter required');
    implemented=new Set([...body.matchAll(/["']([^"']+)["']/g)].map(m => m[1]));
  }catch(e){errors.push(`Warlock implementation adapter: ${e.message}`);}
  const provenance=new Map((runtime.provenance||[]).map(p => [p.output,p]));
  const hashes=new Map(); const cachedHash=p => {if(!hashes.has(p))hashes.set(p,hashFile(p));return hashes.get(p);};
  for(const item of items) {
    item.design='catalog-row'; item.gameplay='unknown';item.art='unknown';item.approval='unknown';item.integration='unknown';item.animation='unknown';item.qa='unknown';
    item.engineId=null;
    if(item.source === 'catalog/cards-warlock.md') {
      const id=slug(item.name);item.engineId=id;
      item.gameplay=implemented ? (implemented.has(id)?'registered':'not-registered'):'unknown';
      const url=runtime.cards?.[id];
      if(url) {
        item.runtimeUrl=url;
        try {
          if(!url.startsWith('/game-assets/')) throw Error('unsupported runtime URL');
          const output=url.slice('/game-assets/'.length), p=provenance.get(output);
          const dest=inside(root,`apps/web/public/game-assets/${output}`);
          if(!fs.existsSync(dest)){item.integration='missing-runtime-file';continue;}
          item.integration='bound-unverified';
          if(!p){errors.push(`${item.catalogKey}: runtime provenance absent`);continue;}
          item.integration=cachedHash(dest) === p.outputSha256?'bound-hash-verified':'stale-runtime';
          // Legacy importer stores absolute sources; those are read-only provenance, never mutation targets.
          const source=path.isAbsolute(p.source)?p.source:inside(root,p.source);
          if(!fs.existsSync(source)){item.art='source-unavailable';continue;}
          const h=cachedHash(source);item.sourceAsset=source;item.sourceSha256=h;
          item.art=h===p.sha256?'source-hash-verified':'changed-source';
          if(h!==p.sha256)item.integration='stale-source';
          item.approval=ledger.decisions?.[h]?.status || 'Unreviewed';
        }catch(e){errors.push(`${item.catalogKey}: ${e.message}`);}
      }
    }
  }
  const records=[], recordsDir=path.join(root,'design/production/records'), recordIds=new Set();
  if(fs.existsSync(recordsDir))for(const file of fs.readdirSync(recordsDir).filter(f=>f.endsWith('.json')).sort()) {
    try {
      const r=readJson(path.join(recordsDir,file)), issues=validateRecord(r,root);
      if(recordIds.has(r.contentId))issues.push('duplicate contentId');recordIds.add(r.contentId);
      records.push({file:`design/production/records/${file}`,contentId:r.contentId,catalogKey:r.catalogKey,valid:issues.length===0,errors:issues,stages:r.stages});
      errors.push(...issues.map(e=>`${file}: ${e}`));
    }catch(e){errors.push(`${file}: ${e.message}`);}
  }
  const byCatalog={}; for(const item of items)byCatalog[item.source]=(byCatalog[item.source]||0)+1;
  return {schema:1,generatedAt:new Date().toISOString(),root,coverage:{catalogs:byCatalog,art:'Only explicit Warlock runtime-card provenance; unbound assets unknown',gameplay:'Warlock literal registry membership only; no handler/test certification',otherDomains:'Explicit content records are reported separately, not silently merged into automatic facts',animation:'Evidence records only; no recursive frame scan',approval:'Current SHA-256 ledger for mapped source bytes',qa:'Unknown unless separately recorded and inspected'},summary:{catalogRows:items.length,warlockRegistered:items.filter(i=>i.gameplay==='registered').length,verifiedRuntimeBindings:items.filter(i=>i.integration==='bound-hash-verified').length,records:records.length,errors:errors.length},items,records,errors};
}
