import test from 'node:test';
import assert from 'node:assert/strict';
import manifest from '../../../packages/assets/manifest.json';
import {RUNEBLADE_SUMMON as timing,runebladeSummonPhase,reversedDeathFrame,isRunebladeSummon,resurrectionHoverOffset} from './runebladeSummonTiming';
test('ice resurrection timeline keeps body hidden until bolt hits and mound opens, then opaque authored rise',()=>{
 assert.equal(timing.release+timing.travel,timing.groundImpact);
 assert.equal(runebladeSummonPhase(timing.groundImpact-1).visible,false);
 assert.equal(runebladeSummonPhase(timing.riseStart-1).visible,false);
 assert.equal(runebladeSummonPhase(timing.riseStart).visible,true);
 assert.equal(runebladeSummonPhase(timing.riseStart).rise,0);
 assert.equal(runebladeSummonPhase(timing.riseEnd).rise,1);
 assert.equal(runebladeSummonPhase(timing.riseEnd-1).energy,1);
 assert.equal(runebladeSummonPhase(timing.duration).complete,true);
 assert.equal(runebladeSummonPhase(timing.duration).energy,0);
});
for(const id of ['frost-thrall','shattered-queen','rime-seer','rune-revenant','bone-defender'])test(`${id} rises through all real collapse frames backwards at the existing source root`,()=>{
 const a=manifest.actors[`summon-${id}` as keyof typeof manifest.actors];const die=a.states.die;
 assert.ok(die.frames.length>=4);assert.equal(reversedDeathFrame(die.frames,die.duration,timing.riseStart)?.src,die.frames.at(-1)!.src);
 assert.equal(reversedDeathFrame(die.frames,die.duration,timing.riseEnd)?.src,die.frames[0].src);
 const observed:string[]=[];for(let t=timing.riseStart;t<=timing.riseEnd;t++){const src=reversedDeathFrame(die.frames,die.duration,t)!.src;if(src!==observed.at(-1))observed.push(src);}
 assert.deepEqual(observed,die.frames.map(f=>f.src).reverse());
 assert.ok(a.anchor[0]>0&&a.anchor[1]>0);assert.ok(a.size[0]>a.anchor[0]&&a.size[1]>=a.anchor[1]);
 assert.ok(isRunebladeSummon(`summon-${id}`));
});
test('Warlock and enemy units are excluded from resurrection clip routing',()=>{for(const id of ['imp','summon-imp','hellhound','demon-lord','sovereign-root','goblin'])assert.equal(isRunebladeSummon(id),false);});

test('Queen rises 76 pixels from ground to unchanged hover while the mound remains fixed',()=>{const hoverRoot=300,groundDrop=76;assert.equal(resurrectionHoverOffset(groundDrop,timing.riseStart),76);assert.equal(resurrectionHoverOffset(groundDrop,timing.riseEnd),0);let previous=Infinity;for(let time=0;time<=timing.duration;time+=10){const offset=resurrectionHoverOffset(groundDrop,time);assert.ok(offset<=previous);previous=offset;const bodyRoot=hoverRoot+offset;const floorCorrection=groundDrop-offset;assert.equal(bodyRoot+floorCorrection,376);}assert.equal(resurrectionHoverOffset(0,1200),0);});

 test('burial hides every collapsed pose then reveals the complete rising body',async()=>{
 const {burialReveal,BURIAL_EMERGE_MS}=await import('./runebladeSummonTiming');
 for(const t of [0,850,1000,1400,1650,BURIAL_EMERGE_MS-1])assert.equal(burialReveal(t),0);
 for(const t of [BURIAL_EMERGE_MS,2000,2450,3000])assert.equal(burialReveal(t),1);
 });
