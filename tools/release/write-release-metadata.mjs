import {execFileSync} from 'node:child_process';
import {mkdirSync,writeFileSync} from 'node:fs';

const revision=process.env.GITHUB_SHA || execFileSync('git',['rev-parse','HEAD'],{encoding:'utf8'}).trim();
const metadata={
  revision,
  branch:process.env.GITHUB_REF_NAME || execFileSync('git',['branch','--show-current'],{encoding:'utf8'}).trim(),
  builtAt:new Date().toISOString(),
  canonicalSource:'main',
};
mkdirSync('dist',{recursive:true});
writeFileSync('dist/release.json',`${JSON.stringify(metadata,null,2)}\n`);
console.log(`Wrote release metadata for ${revision}.`);
