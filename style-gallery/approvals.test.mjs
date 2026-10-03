import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import {digest,recordDecision,readLedger} from './approvals.mjs';
// Test artifacts stay in the task's scratch directory, away from the real approval ledger.
const scratch=process.env.GALLERY_TEST_DIR;
if(!scratch)throw Error('Set GALLERY_TEST_DIR to a scratch directory');
fs.mkdirSync(scratch,{recursive:true});
test('decisions persist, can be reset, and preserve history and all known copies',()=>{
 const assetPath=path.join(scratch,'approval-test.svg'),copy=path.join(scratch,'copy.svg'),ledgerPath=path.join(scratch,'decisions-test.json');
 fs.writeFileSync(assetPath,'<svg xmlns="http://www.w3.org/2000/svg"/>');fs.copyFileSync(assetPath,copy);const sha256=digest(assetPath);
 recordDecision(ledgerPath,{assetPath,sha256,status:'Approved',note:'Exact revision accepted',actor:'automated-test'});
 assert.equal(readLedger(ledgerPath).decisions[sha256].status,'Approved');
 recordDecision(ledgerPath,{assetPath:copy,sha256,status:'Needs revision',note:'Revise silhouette',actor:'automated-test'});
 let saved=readLedger(ledgerPath);assert.equal(saved.decisions[sha256].status,'Needs revision');assert.equal(saved.decisions[sha256].paths.length,2);assert.equal(saved.evidence[saved.decisions[sha256].evidenceId].note,'Revise silhouette');
 recordDecision(ledgerPath,{assetPath,sha256,status:'Pending approval',actor:'automated-test'});
 assert.equal(readLedger(ledgerPath).decisions[sha256].status,'Pending approval');assert.ok(readLedger(ledgerPath).history.length>=3);
 const before=fs.readFileSync(ledgerPath,'utf8');fs.writeFileSync(assetPath,'<svg xmlns="http://www.w3.org/2000/svg"><path/></svg>');
 assert.throws(()=>recordDecision(ledgerPath,{assetPath,sha256,status:'Approved'}),e=>e.status===409);
 assert.equal(fs.readFileSync(ledgerPath,'utf8'),before);assert.equal(readLedger(ledgerPath).decisions[digest(assetPath)],undefined);
});
test('invalid decisions and damaged ledgers cannot silently overwrite approval history',()=>{
 const assetPath=path.join(scratch,'invalid-test.png'),ledgerPath=path.join(scratch,'invalid-ledger.json');fs.writeFileSync(assetPath,'fixture');const sha256=digest(assetPath);
 assert.throws(()=>recordDecision(ledgerPath,{assetPath,sha256,status:'Anything'}),/Invalid decision/);
 fs.writeFileSync(ledgerPath,'not json');assert.throws(()=>recordDecision(ledgerPath,{assetPath,sha256,status:'Approved'}));assert.equal(fs.readFileSync(ledgerPath,'utf8'),'not json');
});
