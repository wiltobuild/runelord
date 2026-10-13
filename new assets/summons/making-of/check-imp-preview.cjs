const {chromium}=require('C:/Users/Wil/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
(async()=>{
 const browser=await chromium.launch({channel:'msedge',headless:true});
 const page=await browser.newPage({viewport:{width:1440,height:900},deviceScaleFactor:1});
 const errors=[];page.on('pageerror',e=>errors.push(e.message));
 await page.goto('http://127.0.0.1:4321/summon-review?units=imp,hellhound,pit-brute');
 await page.waitForTimeout(6000);
 console.log((await page.locator('body').innerText()).slice(0,3500));
 console.log('Errors:',errors);
 await page.screenshot({path:'C:/Users/Wil/Documents/Codex/2026-10-09/sp-2/outputs/imp-in-game.png'});
 await browser.close();
})();
