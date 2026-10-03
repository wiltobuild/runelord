import test from 'node:test';
import assert from 'node:assert/strict';
import {classify} from './catalog.mjs';
test('finished cards, standalone illustrations, layers and reviews are separate',()=>{
 assert.equal(classify('cards/warlock/firebolt/r1/firebolt-r1.png').group,'Cards');
 assert.deepEqual(classify('cards/warlock/firebolt/r1/illustration.png'),{group:'Card artwork',kind:'Card illustration',subject:'Warlock',name:'Firebolt',format:'PNG',inbox:false});
 assert.equal(classify('cards/warlock/firebolt/r1/art-layer.png').group,'Production assets');
 assert.equal(classify('cards/batch-001-review.png').group,'Review sheets');
 assert.equal(classify('cards/reference-samples/ranger-hunters-mark.png').group,'Cards');
});
test('inbox copies inherit content type from the production source, not broad legacy groups',()=>{
 const a=classify('approvals/inbox/warlock-firebolt/r1/illustration.png',{group:'Cards',subject:'Warlock Card Firebolt',origin:'C:\\repo\\assets\\cards\\warlock\\firebolt\\r1\\illustration.png'});
 assert.equal(a.group,'Card artwork');assert.equal(a.subject,'Warlock');assert.equal(a.name,'Firebolt');assert.equal(a.inbox,true);
 assert.equal(classify('approvals/inbox/potion/r1/source.png',{group:'Other art',origin:'C:/repo/assets/objects/potion/r1/source.png'}).group,'Objects');
});
test('animation previews stay browsable while frames and templates stay in production',()=>{
 assert.equal(classify('heroes/animations/warlock/r1/idle/001.png').group,'Production assets');
 assert.equal(classify('characters/lich/animation/proof-r1/review.gif').group,'Animations');
 assert.equal(classify('environments/forest/r1/background.png').group,'Environments');
 assert.equal(classify('cards/templates/runeblade/baseline.png').group,'Production assets');
});
