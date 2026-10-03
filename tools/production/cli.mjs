import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {hashFile,readJson,validatePacket,validateRecord,validateEncounter,validateAnimation,validateAudio} from './core.mjs';
import {scanStatus} from './status.mjs';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'../..');
const [command,file,...rest]=process.argv.slice(2);
const help=`Runelord production helpers (read-only unless --out is explicit)
status [--repo PATH] [--out PATH] : catalog/runtime report; errors exit 1; unknown is not missing
hash FILE : SHA-256
packet FILE : packet contract + input/evidence hashes (repo-relative paths)
record FILE : seven independent stages + current exact-hash approval
encounter FILE : draft {id,tier,hp,ai:{type},moves:[{id,kind,damage,targeting,telegraph}],corpse:{raisable,thrall_move,thrall_hp_pct},tame:{tameable,instinct_move,companion_hp_pct,bond_perk},animations:[...]}
animation FILE : frames:[{file}], states/animations:{name:{frames:[indices],durations_ms:[ms],loop,events:[{time_ms}]} plus frame_canvas:[w,h],anchor:[x,y]; variants supported. File and timing checks only; pixels/playback not audited.
audio FILE : loop manifest array, checks sample bounds only; does not decode or listen
Packet inputs and passed-check evidence: [{path:'repo/relative/file',sha256:'64 lowercase hex'}].
Record stages: design,art,approval,animation,gameplay,integration,qa; each {status,evidence:[{path,sha256}]}.
Statuses: unknown,pending,blocked,stale,complete,not-applicable. Approval complete also needs asset path.
Templates and workflow: design/production/.`;
try {
  if(!command || command==='help') console.log(help);
  else if(command==='status') {
    const args=process.argv.slice(3);let repo=root,out=null;
    for(let i=0;i<args.length;i++) {if(!['--repo','--out'].includes(args[i])||!args[i+1])throw Error('status expects --repo PATH or --out PATH');const k=args[i++];if(k==='--repo')repo=path.resolve(args[i]);else out=path.resolve(args[i]);}
    const report=scanStatus(repo), data=JSON.stringify(report,null,2)+'\n';
    if(out){fs.mkdirSync(path.dirname(out),{recursive:true});fs.writeFileSync(out,data);console.log(JSON.stringify({out,summary:report.summary,coverage:report.coverage,errors:report.errors},null,2));}else console.log(data);
    if(report.errors.length)process.exitCode=1;
  } else {
    if(!file || rest.length)throw Error('Expected one file argument');
    if(command==='hash')console.log(JSON.stringify({path:file,sha256:hashFile(file)}));
    else {
      const validators={packet:x=>validatePacket(x,root),record:x=>validateRecord(x,root),encounter:validateEncounter,animation:x=>validateAnimation(x,path.dirname(path.resolve(file))),audio:validateAudio};
      if(!validators[command])throw Error(`Unknown command ${command}`);
      const errors=validators[command](readJson(file));console.log(JSON.stringify({command,file,valid:errors.length===0,errors},null,2));if(errors.length)process.exitCode=1;
    }
  }
}catch(e){console.error(e.message);process.exitCode=1;}
