import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import {hashFile,inside,parseCatalog,validatePacket,validateRecord,validateEncounter,validateAnimation,validateAudio,stages} from './core.mjs';
import {scanStatus} from './status.mjs';
import {compareProtected,approval} from './art.mjs';
import {compareRuns} from './balance.mjs';

function fixture(t){const dir=fs.mkdtempSync(path.join(os.tmpdir(),'runelord-production-'));t.after(()=>fs.rmSync(dir,{recursive:true,force:true}));return dir;}
function write(root,file,value){const p=path.join(root,file);fs.mkdirSync(path.dirname(p),{recursive:true});fs.writeFileSync(p,typeof value==='string'?value:JSON.stringify(value));return p;}
function ref(root,file){return {path:file,sha256:hashFile(path.join(root,file))};}
test('catalog parser handles neutral nonnumeric IDs and unnumbered curses; skips prose tables',()=>{
 const result=parseCatalog('# Neutral\n| # | Card | Effect |\n|---|---|---|\n| N1 | **War Banner** | A \\| B |\n\n## Curses\n| Curse | Effect |\n|---|---|\n| Rust | Unplayable |\n\n| Count | Amount |\n|---|---|\n| cards | 30 |','catalog/cards-neutral.md');
 assert.equal(result.rows.length,2);assert.equal(result.rows[0].fields.effect,'A | B');assert.deepEqual(result.errors,[]);
});
test('path traversal is rejected',()=>{assert.throws(()=>inside('/repo','../elsewhere'));assert.throws(()=>inside('/repo','C:/secret'));});
test('packet refuses fake completion, self-review and changed sources',t=>{
 const root=fixture(t);write(root,'source','original');write(root,'report','observed test report');
 const p={schema:1,id:'slice',status:'complete',outcome:'summon works',authorization:'user requested summon',owner:'builder',integrationOwner:'builder',reviewer:'qa',contentIds:['imp'],ownedPaths:['source'],dependencies:[],exclusions:[],inputs:[ref(root,'source')],acceptance:[{check:'summon appears',status:'pass',evidence:[ref(root,'report')]}],checkpoint:{completed:['summon'],remaining:[],blockers:[],nextAction:'none'}};
 assert.deepEqual(validatePacket(p,root),[]);p.reviewer='builder';assert.ok(validatePacket(p,root).some(x=>x.includes('independence')));p.reviewer='qa';
 p.integrationOwner='qa';assert.ok(validatePacket(p,root).some(x=>x.includes('independence')));p.integrationOwner='builder';
 write(root,'source','changed');assert.ok(validatePacket(p,root).some(x=>x.includes('stale')));
 p.inputs=[ref(root,'source')];p.acceptance[0].evidence=[];assert.ok(validatePacket(p,root).some(x=>x.includes('evidence')));
});
test('record approval follows exact current bytes and reset decisions',t=>{
 const root=fixture(t);write(root,'art.png','bytes');const h=hashFile(path.join(root,'art.png'));write(root,'assets/approvals/decisions.json',{decisions:{[h]:{status:'Approved'}}});
 const r={schema:1,contentId:'imp',inputs:[ref(root,'art.png')],stages:Object.fromEntries(stages.map(k=>[k,{status:'unknown',evidence:[]}]))};
 r.stages.approval={status:'complete',asset:'art.png',evidence:[ref(root,'art.png')]};assert.deepEqual(validateRecord(r,root),[]);
 write(root,'assets/approvals/decisions.json',{decisions:{[h]:{status:'Pending approval'}}});assert.ok(validateRecord(r,root).some(x=>x.includes('not Approved')));
 assert.equal(approval(path.join(root,'art.png'),path.join(root,'assets/approvals/decisions.json')).status,'Pending approval');
});
test('status distinguishes imported, registered, stale and unmapped without scanning assets',t=>{
 const root=fixture(t);write(root,'catalog/cards-warlock.md','| # | Card | Effect |\n|---|---|---|\n| 1 | Firebolt | Damage |\n| 2 | Kindle | Cinders |');
 write(root,'catalog/cards-ranger.md','| # | Card | Effect |\n|---|---|---|\n| 1 | Aim | Damage |');
 write(root,'packages/content/index.ts','export const implemented = ["firebolt"] as const;');
 const source=write(root,'art.png','art'),out=write(root,'apps/web/public/game-assets/cards/firebolt.webp','runtime');
 write(root,'packages/assets/manifest.json',{cards:{firebolt:'/game-assets/cards/firebolt.webp'},provenance:[{source,sha256:hashFile(source),output:'cards/firebolt.webp',outputSha256:hashFile(out)}]});
 write(root,'assets/approvals/decisions.json',{decisions:{[hashFile(source)]:{status:'Approved'}}});
 let report=scanStatus(root);assert.equal(report.summary.warlockRegistered,1);assert.equal(report.summary.verifiedRuntimeBindings,1);assert.equal(report.items.find(i=>i.name==='Aim').gameplay,'unknown');assert.equal(report.items.find(i=>i.name==='Kindle').art,'unknown');
 write(root,'art.png','changed');report=scanStatus(root);assert.equal(report.items.find(i=>i.name==='Firebolt').integration,'stale-source');assert.equal(report.items.find(i=>i.name==='Firebolt').approval,'Unreviewed');
});
test('encounter catches absent targeting, invalid tame and missing boss sweep',()=>{
 const e={id:'boss',tier:'boss',hp:80,ai:{type:'cycle'},moves:[{id:'slam',kind:'attack',damage:8,targeting:'sweep',telegraph:'Raises hammer'}],corpse:{raisable:false},tame:{tameable:false},animations:['idle','attack','hit','die']};
 assert.deepEqual(validateEncounter(e),[]);delete e.moves[0].targeting;e.tame.tameable=true;const errors=validateEncounter(e);assert.ok(errors.some(x=>x.includes('targeting')));assert.ok(errors.some(x=>x.includes('sweep')));assert.ok(errors.some(x=>x.includes('tameable')));
});
test('animation rejects missing frames, bad index and looping death',t=>{
 const root=fixture(t);write(root,'frame.png','frame');const m={frames:[{file:'frame.png'}],frame_canvas:[96,96],anchor:[48,90],states:{idle:{frames:[0],durations_ms:[100],loop:true},die:{frames:[0],durations_ms:[100],loop:false}}};
 assert.deepEqual(validateAnimation(m,root),[]);m.states.die.loop=true;m.states.idle.frames=[1];m.frames[0].file='absent.png';assert.ok(validateAnimation(m,root).length>=3);
});
test('audio detects end beyond duration and invalid ranges',()=>{
 const good={slug:'cue',sample_rate:48000,loop_start_sample:0,loop_end_sample_exclusive:48000,duration_seconds:1};assert.deepEqual(validateAudio([good]),[]);assert.ok(validateAudio([{...good,loop_end_sample_exclusive:96000}]).length);assert.ok(validateAudio([{...good,loop_start_sample:-1}]).length);
});
test('empty animation deliverables cannot pass structural verification',()=>{
 assert.ok(validateAnimation({variants:{}},'.').length);
 assert.ok(validateAnimation({frames:[],states:{},frame_canvas:[96,96],anchor:[48,90]},'.').length);
});
test('protected pixel comparison catches alpha changes and unsafe mask',()=>{
 const a=Buffer.from([1,2,3,255,4,5,6,255]),b=Buffer.from(a),mask=Buffer.from([0,0,0,255,255,255,255,255]);b[4]=99;
 assert.equal(compareProtected(a,b,mask,2,1).passed,true);b[3]=0;assert.equal(compareProtected(a,b,mask,2,1).changedPixels,1);mask[0]=128;assert.throws(()=>compareProtected(a,b,mask,2,1));
});
test('paired balance retains failures and rejects duplicate or mismatched seeds',()=>{
 const a=[{seed:1,strategy:'greedy',variant:'base',outcome:'loss'},{seed:2,strategy:'greedy',variant:'base',outcome:'win'}],b=[{seed:1,strategy:'greedy',variant:'new',outcome:'win'},{seed:2,strategy:'greedy',variant:'new',outcome:'crash'}];
 const r=compareRuns(a,b).groups[0];assert.equal(r.pairedWinDelta,0);assert.equal(r.candidate.crashes,1);assert.equal(r.candidate.winRate,.5);assert.throws(()=>compareRuns(a,[b[0],b[0]]));assert.throws(()=>compareRuns(a,[{...b[0],seed:3},b[1]]));
});
