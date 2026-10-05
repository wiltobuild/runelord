import {execFileSync} from 'node:child_process';

const branch=process.env.GITHUB_REF_NAME;
if(branch !== 'main') {
  throw new Error(`Refusing Pages deployment from ${branch || 'an unknown ref'}; only main is canonical production.`);
}

execFileSync('git',['fetch','origin','main','--depth=1'],{stdio:'inherit'});
const deployed=execFileSync('git',['rev-parse','HEAD'],{encoding:'utf8'}).trim();
const canonical=execFileSync('git',['rev-parse','origin/main'],{encoding:'utf8'}).trim();
if(deployed !== canonical) {
  throw new Error(`Refusing stale Pages build ${deployed}; canonical origin/main is ${canonical}.`);
}
console.log(`Pages release guard passed for canonical main ${deployed}.`);
