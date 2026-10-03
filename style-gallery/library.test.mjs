import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import {galleryFiles,buildLibrary} from './library.mjs';
test('frame trees are skipped while previews and new artwork are discovered',()=>{
 const root=fs.mkdtempSync(path.join(os.tmpdir(),'gallery-scan-'));
 try{
  for(const file of ['characters/bellows/animation/r1/idle/00.png','characters/bellows/animation/r1/frames/01.png','characters/bellows/animation/r1/idle.gif','characters/bellows/base.png','cards/templates/layer.png']){fs.mkdirSync(path.dirname(path.join(root,file)),{recursive:true});fs.writeFileSync(path.join(root,file),'')}
  fs.writeFileSync(path.join(root,'characters/bellows/animation/r1/manifest.json'),JSON.stringify({states:{idle:{frames:['idle/00.png']}}}));
  const files=galleryFiles(root).map(p=>path.relative(root,p).replaceAll('\\','/'));
  assert(files.includes('characters/bellows/animation/r1/idle.gif'));assert(files.includes('characters/bellows/base.png'));
  assert(!files.some(p=>p.includes('/frames/')||p.includes('/idle/')||p.includes('/templates/')));
 }finally{fs.rmSync(root,{recursive:true,force:true})}
});
test('one animated design retains each state, revision and review status',()=>{
 const base={id:'base',subject:'Bellows Nautiloid',name:'Base',group:'Characters',status:'Approved',path:'characters/bellows/base.png',modified:1};
 const state={...base,id:'idle',name:'Idle',group:'Animations',status:'Pending approval',inbox:true,path:'characters/bellows/animation/r1/idle.gif'};
 const result=buildLibrary([base,state,{...state,id:'attack',name:'Attack'}, {...base,id:'frame',group:'Production assets'}]);
 assert.equal(result.length,1);assert.equal(result[0].states.length,2);assert.equal(result[0].designs.length,1);assert(result[0].needsReview);assert(result[0].inbox);assert.equal(result[0].status,'Approved');
 assert.equal(buildLibrary([{...state,subject:'Standalone'}])[0].states.length,1);
});
