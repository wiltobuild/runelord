import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';

export const digest = file => crypto.createHash('sha256').update(fs.readFileSync(file)).digest('hex');
export function readLedger(file) {
  if (!fs.existsSync(file)) return {schema_version:1, decisions:{}, evidence:{}, history:[]};
  const value=JSON.parse(fs.readFileSync(file,'utf8').replace(/^\uFEFF/,''));
  if(value.schema_version!==1 || !value.decisions || !value.evidence || !Array.isArray(value.history)) throw Error('Invalid approval ledger; refusing to overwrite it');
  return value;
}
export function writeLedger(file, ledger) {
  fs.mkdirSync(path.dirname(file),{recursive:true});
  const temp=`${file}.${crypto.randomUUID()}.tmp`;
  fs.writeFileSync(temp,JSON.stringify(ledger,null,2));
  fs.renameSync(temp,file);
}
export function recordDecision(file,{assetPath,sha256,status,note='',actor='gallery-user'}) {
  if(!['Approved','Needs revision','Pending approval'].includes(status)) throw Error('Invalid decision');
  if(!/^[a-f0-9]{64}$/.test(sha256)||digest(assetPath)!==sha256) {
    const error=Error('This artwork changed since you opened it. Refresh and review the new revision.');error.status=409;throw error;
  }
  const ledger=readLedger(file), id=crypto.randomUUID(), at=new Date().toISOString();
  const event={id,sha256,status,note:String(note).slice(0,2000),actor,at,assetPath};
  ledger.evidence[id]={actor,at,note:event.note,action:status};
  ledger.decisions[sha256]={status,at,evidenceId:id,paths:[...new Set([...(ledger.decisions[sha256]?.paths||[]),assetPath])]};
  ledger.history.push(event);
  writeLedger(file,ledger);
  return event;
}
