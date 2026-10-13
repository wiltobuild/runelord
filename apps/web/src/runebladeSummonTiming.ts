/** Shared timeline for hero bolt, disturbed earth, authored resurrection and final rune seal. */
export const RUNEBLADE_SUMMON = {release:120,travel:360,groundImpact:480,riseStart:850,riseEnd:2450,duration:2750} as const;
export const RUNEBLADE_SUMMON_MS=RUNEBLADE_SUMMON.duration;
export const isRunebladeSummon=(art:string)=>['frost-thrall','shattered-queen','rime-seer','rune-revenant','bone-defender'].includes(art.replace(/^summon-/,''));
export function runebladeSummonPhase(elapsed:number){return {visible:elapsed>=RUNEBLADE_SUMMON.riseStart,rising:elapsed>=RUNEBLADE_SUMMON.riseStart&&elapsed<RUNEBLADE_SUMMON.riseEnd,complete:elapsed>=RUNEBLADE_SUMMON.duration,rise:Math.max(0,Math.min(1,(elapsed-RUNEBLADE_SUMMON.riseStart)/(RUNEBLADE_SUMMON.riseEnd-RUNEBLADE_SUMMON.riseStart))),energy:elapsed<RUNEBLADE_SUMMON.groundImpact?0:elapsed<RUNEBLADE_SUMMON.riseEnd?1:Math.max(0,1-(elapsed-RUNEBLADE_SUMMON.riseEnd)/(RUNEBLADE_SUMMON.duration-RUNEBLADE_SUMMON.riseEnd))};}
/** Reverse authored poses, including their relative timing; death-only opacity is intentionally ignored by the caller. */
export function reversedDeathFrame<T extends {time:number}>(frames:readonly T[],duration:number,elapsed:number):T|undefined{
 const rise=runebladeSummonPhase(elapsed).rise;
 const time=Math.max(0,Math.min(duration-0.001,duration*(1-rise)));
 return frames[Math.max(0,frames.findLastIndex(frame=>frame.time<=time))];
}

/** Queen begins on the shared floor and rises to her unchanged full-size hover anchor. */
export function resurrectionHoverOffset(groundDrop:number,elapsed:number){const t=runebladeSummonPhase(elapsed).rise;return Math.max(0,groundDrop)*(1-t*t*(3-2*t));}

/** Collapsed frames remain buried; die-03 is the first seated/rising pose. */
export const BURIAL_EMERGE_MS=1755;
export function burialReveal(elapsed:number){return elapsed>=BURIAL_EMERGE_MS?1:0;}
