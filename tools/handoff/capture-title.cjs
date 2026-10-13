const {chromium}=require('C:/Users/wilsh/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const fs=require('node:fs'),path=require('node:path'),cp=require('node:child_process');
const root=path.resolve('handoffs/claude-design/02-promo-video');
(async()=>{
 const browser=await chromium.launch({headless:true});
 const ctx=await browser.newContext({viewport:{width:1920,height:1080},deviceScaleFactor:1,recordVideo:{dir:path.resolve('work/promo-capture'),size:{width:1920,height:1080}}});
 const p=await ctx.newPage(),began=Date.now(),errors=[];
 p.on('pageerror',e=>errors.push(e.message));
 await p.goto('http://127.0.0.1:4320/',{waitUntil:'networkidle'});
 await p.getByRole('button',{name:'Begin the pact'}).waitFor();
 await p.locator('input[value=warband]').check(); await p.mouse.move(1100,180); await p.waitForTimeout(3500);
 console.log((await p.locator('body').innerText()).slice(0,1200));
 const start=(Date.now()-began)/1000;
 await p.screenshot({path:path.join(root,'stills/01-starter-pacts.png')});
 await p.waitForTimeout(7000);
 const duration=(Date.now()-began)/1000-start;
 const video=p.video();await ctx.close();await video.saveAs(path.resolve('work/promo-capture/01-starter-pacts-raw.webm'));await browser.close();
 const ffmpeg=path.resolve('work/promo-tools/node_modules/ffmpeg-static/ffmpeg.exe');
 cp.execFileSync(ffmpeg,['-y','-ss',String(start),'-i',path.resolve('work/promo-capture/01-starter-pacts-raw.webm'),'-t',String(duration),'-c:v','libx264','-preset','fast','-crf','18','-pix_fmt','yuv420p','-movflags','+faststart',path.join(root,'footage/01-starter-pacts.mp4')],{stdio:'pipe'});
 fs.writeFileSync(path.join(root,'title-capture.json'),JSON.stringify({start,duration,errors,viewport:[1920,1080],audio:'silent video; music and SFX delivered separately'},null,2));
 console.log('Title capture completed',duration);
})().catch(e=>{console.error(e);process.exit(1)});

