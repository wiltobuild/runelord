import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {readJson} from './core.mjs';

function index(runs) {
  if(!Array.isArray(runs)||!runs.length)throw Error('Expected nonempty per-run array');
  const map=new Map();
  for(const r of runs) {
    if(!Number.isInteger(r.seed)||typeof r.strategy!=='string'||!r.strategy.trim()||typeof r.variant!=='string'||!r.variant.trim()||!['win','loss','crash','timeout'].includes(r.outcome))throw Error('Invalid run identity/outcome');
    for(const key of ['turns','hpRemaining'])if(r[key]!==undefined && (!Number.isFinite(r[key])||r[key]<0))throw Error(`Invalid ${key}`);
    const key=JSON.stringify([r.seed,r.strategy]);if(map.has(key))throw Error(`Duplicate seed/strategy ${key}`);map.set(key,r);
  }
  if(new Set(runs.map(r=>r.variant)).size!==1)throw Error('Each input must contain exactly one variant');
  return map;
}
function summarize(runs) {
  const n=runs.length, wins=runs.filter(r=>r.outcome==='win').length, p=wins/n, z=1.96;
  const center=(p+z*z/(2*n))/(1+z*z/n), margin=z*Math.sqrt((p*(1-p)+z*z/(4*n))/n)/(1+z*z/n);
  return {runs:n,wins,losses:runs.filter(r=>r.outcome==='loss').length,crashes:runs.filter(r=>r.outcome==='crash').length,timeouts:runs.filter(r=>r.outcome==='timeout').length,winRate:p,wilson95:[Math.max(0,center-margin),Math.min(1,center+margin)],denominator:'all scheduled outcomes including crash/timeout'};
}
export function compareRuns(base,candidate) {
  const a=index(base),b=index(candidate);
  if(a.size!==b.size||[...a.keys()].some(k=>!b.has(k)))throw Error('Seed/strategy pairs must match exactly');
  const groups=[];
  for(const strategy of [...new Set(base.map(r=>r.strategy))].sort()) {
    const x=base.filter(r=>r.strategy===strategy),y=candidate.filter(r=>r.strategy===strategy);let improved=0,regressed=0;
    for(const r of x){const c=b.get(JSON.stringify([r.seed,strategy]));if(r.outcome!=='win'&&c.outcome==='win')improved++;if(r.outcome==='win'&&c.outcome!=='win')regressed++;}
    groups.push({strategy,baseline:summarize(x),candidate:summarize(y),pairedWinDelta:(improved-regressed)/x.length,improved,regressed});
  }
  return {schema:1,baselineVariant:base[0].variant,candidateVariant:candidate[0].variant,groups,limitations:['Intervals describe each bot strategy, not human difficulty.','Paired win delta includes crashes/timeouts as non-wins; inspect failures separately.','Matching seeds does not establish equivalent decks/rules; retain experiment configuration.','This report does not compute causal card strength or a paired-difference confidence interval.']};
}
if(process.argv[1] && path.resolve(process.argv[1])===fileURLToPath(import.meta.url)) {
  try{if(process.argv.length!==4)throw Error('Usage: balance.mjs BASELINE.json CANDIDATE.json');console.log(JSON.stringify(compareRuns(readJson(process.argv[2]),readJson(process.argv[3])),null,2));}
  catch(e){console.error(e.message);process.exitCode=1;}
}
