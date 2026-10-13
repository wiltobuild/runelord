const {chromium}=require('C:/Users/wilsh/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const fs=require('node:fs'),path=require('node:path'),cp=require('node:child_process');
const root=path.resolve('handoffs/claude-design/02-promo-video');
const plans=require(path.join(root,'replay-data/capture-plan.json'));
const ffmpeg=path.resolve('work/promo-tools/node_modules/ffmpeg-static/ffmpeg.exe');
(async()=>{
 const browser=await chromium.launch({headless:true});
 for(const plan of plans.filter(x=>x.id!=='07-reinforcement'&&(!process.argv[2]||x.id===process.argv[2]))){
  const out=path.join(root,'footage',plan.id+'.mp4');if(fs.existsSync(out))continue;
  const ctx=await browser.newContext({viewport:{width:1920,height:1080},deviceScaleFactor:1,recordVideo:{dir:path.resolve('work/promo-capture'),size:{width:1920,height:1080}}});
  await ctx.addInitScript(value=>localStorage.setItem('runelord-warlock-demo-v1',value),JSON.stringify(plan.checkpoint));
  const p=await ctx.newPage(),began=Date.now(),errors=[],marks=[];p.on('pageerror',e=>errors.push(e.message));
  await p.goto('http://127.0.0.1:4320/',{waitUntil:'networkidle'});await p.getByRole('button',{name:'Resume journey'}).click();await p.waitForTimeout(4000);await p.mouse.move(1100,180);
  const start=(Date.now()-began)/1000;await p.screenshot({path:path.join(root,'stills',plan.id+'-before.png')});await p.waitForTimeout(2000);
  for(const step of plan.steps){
   const a=step.action;marks.push({time:(Date.now()-began)/1000-start,label:step.label,events:step.events});
   if(a.type==='play'){
    if(step.dismissSelector)await p.locator(step.dismissSelector).click();
    await p.locator('.hand button.card').filter({hasText:step.label}).first().click();
    if(step.targetSelector)await p.locator(step.targetSelector).click();
   }else if(a.type==='end')await p.getByRole('button',{name:'End turn',exact:true}).click();
   else if(a.type==='reward'){await p.waitForTimeout(2500);await p.locator('.reward-cards button.card').filter({hasText:step.label.replace('Choose ','')}).click();}
   else if(a.type==='continue'){await p.waitForTimeout(5000);await p.getByRole('button',{name:/Continue your journey|Claim your victory/}).click();}
   else if(a.type==='item'){await p.getByRole('button',{name:/All supplies/}).click();await p.locator('.item-list').getByRole('button',{name:new RegExp(step.label)}).click();}
   else if(a.type==='camp')await p.getByRole('button',{name:/Rest, then continue/}).click(); else throw new Error('Unsupported '+a.type);
   await p.mouse.move(1100,180);await p.waitForTimeout(700);
   await p.waitForFunction(()=>!document.querySelector('.end-turn-button[aria-busy="true"]'),{},{timeout:90000});
   await p.waitForTimeout(a.type==='end'?3500:1800);
  }
  await p.screenshot({path:path.join(root,'stills',plan.id+'-after.png')});await p.waitForTimeout(3500);
  const duration=(Date.now()-began)/1000-start;const video=p.video();await ctx.close();const raw=path.resolve('work/promo-capture',plan.id+'.webm');await video.saveAs(raw);
  cp.execFileSync(ffmpeg,['-y','-ss',String(start),'-i',raw,'-t',String(duration),'-c:v','libx264','-preset','fast','-crf','18','-pix_fmt','yuv420p','-movflags','+faststart',out],{stdio:'pipe'});
  fs.writeFileSync(path.join(root,'footage',plan.id+'.json'),JSON.stringify({title:plan.title,expectedBeat:plan.expectedBeat,duration,marks,errors,viewport:[1920,1080],audio:'Silent capture. Separate music and SFX supplied.',source:'Actual UI interaction from valid engine replay checkpoint.'},null,2));console.log('CAPTURED',plan.id,duration,errors);
 }
 await browser.close();
})().catch(e=>{console.error(e);process.exit(1)});



