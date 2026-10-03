import fs from 'node:fs';
import crypto from 'node:crypto';
const rate=48000;
// Original layered synthesis. No third-party samples; parameters are retained as masters.
const recipes={
 'card-play':[.24,440,100,.65,.10,0],
 'firebolt':[.65,230,65,.85,.35,1], 'immolate':[1.1,155,48,.95,.30,2],
 'smoldering-brand':[.85,420,95,.55,.45,3], 'conflagrate':[1.35,110,32,1,.65,4],
 'searing-lash':[.5,1150,80,.85,.18,5], 'ward-of-ash':[1.35,115,38,.65,.70,6],
 'sinister-veil':[1.65,95,31,.55,.75,7], 'ashen-ward':[1.5,135,42,.80,.70,8],
 'blood-pact':[.9,90,46,.35,.65,9], 'feed-the-pit':[1.1,160,36,.60,.65,10],
 'kindle':[.7,380,1050,.50,.30,11],
 'summon-imp':[.9,540,220,.5,.35,12], 'summon-hellhound':[1.15,125,54,.65,.65,13],
 'summon-pit-brute':[1.4,72,28,.75,.8,14],
 'attack-imp':[.38,680,120,.75,.3,15], 'attack-hellhound':[.48,190,62,.65,.5,16],
 'attack-pit-brute':[.6,90,30,.75,.8,17],
 'enemy-goblin':[.4,740,140,.8,.25,18], 'enemy-skirmisher':[.3,1450,260,.8,.2,19],
 'enemy-briarjaw':[.6,130,45,.65,.6,20], 'enemy-tollbell':[.8,195,92,.3,.7,21],
 'hit-flesh':[.28,170,48,.9,.55,22], 'hit-armor':[.42,950,180,.65,.45,23],
 'hit-block':[.48,1500,410,.4,.4,24], 'hit-fire':[.45,300,72,1,.4,25],
 'item-potion':[1.15,520,1400,.25,.5,26], 'item-brand':[.55,290,580,.2,.45,27],
 'fire-death':[1.8,100,32,1,.65,28], 'ascend':[1.4,75,360,.55,.7,29],
};
// Expansion spells retain individual deterministic timbres rather than silent IDs.
const expansionSpells=['hellish-command','ritual-cut','chain-of-flame','dark-bargain','fiendish-feast','infernal-whip','burning-hatred','cinder-shield','smoke-and-mirrors','hellfire','infernal-pact','masters-of-the-pit','burning-soul','demonic-resilience','sacrificial-rite','corrupting-touch','fire-and-brimstone','ember-storm','unholy-frenzy','pyroclasm','shadowflame-barrier','void-gaze','rend-flesh','combust','blood-price','wreathed-in-flame','dread-aura','feast-of-embers','abyssal-gaze','infernal-transformation'];
expansionSpells.forEach((id,i)=>{recipes[id]=[.7+(i%6)*.12,90+(i%9)*37,30+(i%7)*9,.45+(i%4)*.1,.45+(i%3)*.1,40+i];});
const extraEnemies=['spear-guard','twinaxe-reaver','crossbow-scout','emberbow-hunter','forgehammer-sapper','coalhex-shaman','scarblade-captain','cindermaw-salamander','slagheart-juggernaut'];
extraEnemies.forEach((id,i)=>{recipes[`enemy-${id}`]=[.45+i*.065,i>6?95:230+i*63,i>6?32:65+i*11,.65,.5+i*.025,80+i];});
['healing-draught','mana-potion','barkskin-tonic','shrapnel-jar','banner-draught','bonesetters-salve','warhorn-oil'].forEach((id,i)=>{recipes[`item-${id}`]=[.5+i*.075,180+i*60,65+i*20,.6,.5,100+i];});
recipes['enemy-coalhorn-ram']=[.64,115,34,.8,.8,121];
recipes['enemy-furnace-beetle']=[.8,180,44,.9,.65,122];
recipes['enemy-demon-lord']=[1.3,170,25,.95,.95,130];
recipes['enemy-boss-imp']=[.6,630,110,.7,.55,131];
recipes['enemy-boss-hellhound']=[.85,130,32,.85,.8,132];
recipes['boss-summon']=[1.5,140,24,.9,.85,133];
recipes['boss-phase']=[1.9,220,22,1,.95,134];
recipes['boss-shield']=[1.4,125,28,.85,.9,135];
const defensive=new Set(['boss-shield','ward-of-ash','sinister-veil','ashen-ward','cinder-shield','smoke-and-mirrors','demonic-resilience','shadowflame-barrier','wreathed-in-flame']);
const root='assets/audio/sfx/r1',out='apps/web/public/audio/sfx/r1';
fs.mkdirSync(root,{recursive:true});fs.mkdirSync(out,{recursive:true});
const manifest={schema:1,license:'Original project-authored synthesis; no external samples',sampleRate:rate,cues:{}};
for(const [id,r] of Object.entries(recipes)) {
 const [duration,start,end,air,body,seed]=r, count=Math.ceil((duration+.2)*rate);
 const dry=new Float64Array(count),left=new Float64Array(count),right=new Float64Array(count);
 let rng=seed+12345, low=0, mid=0, phase=0;
 const rand=()=>{rng=(Math.imul(rng,1664525)+1013904223)>>>0;return rng/2147483648-1;};
 for(let i=0;i<count;i++) {
  const t=i/rate, p=Math.min(1,t/duration), attack=Math.min(1,t/.008);
  const tail=Math.max(0,1-p), n=rand(); low+=.025*(n-low);mid+=.16*(n-mid);
  const sweep=start*Math.pow(end/start,p);
  phase+=2*Math.PI*sweep/rate;
  const env=attack*Math.pow(tail,id.startsWith('hit')?4:1.7);
  const modulation=Math.sin(2*Math.PI*(12+seed%11)*t);
  const harmonic=Math.sin(phase+modulation*(seed%4)*.8)+.3*Math.sin(phase*1.503)+.14*Math.sin(phase*2.71);
  const gust=(mid-low)*2.5*(.55+.45*Math.sin(p*Math.PI));
  const crack=rand()>.993?(rand()*.9):0;
  let sample=env*(body*harmonic*.4+air*(gust+low*1.7+crack*.25));
  if(id.includes('summon')||id.includes('hellhound'))sample+=env*.13*Math.sin(phase*.51+6*Math.sin(phase*.12));
  if(id==='item-potion'||id==='kindle') {
   for(let k=0;k<4;k++){const age=t-k*.105;if(age>0)sample+=.12*Math.sin(2*Math.PI*(440+seed*13)*[1,1.25,1.5,2][k]*age)*Math.exp(-age*8)*Math.min(1,age*180);}
  }
  if(defensive.has(id)) {
   // No rising triads: a sub impact seals a rough, dissonant infernal membrane.
   const seal=Math.min(1,t/.004)*Math.exp(-t*14);
   const growl=Math.sin(phase*.53+2.8*Math.sin(phase*.173));
   const dissonance=Math.sin(phase*1.414)+.45*Math.sin(phase*2.093);
   const scrape=(mid-low)*Math.exp(-t*5)*Math.min(1,t/.012);
   const shudder=.72+.28*Math.sin(2*Math.PI*(19+seed)*t);
   sample=env*(.38*growl+.14*dissonance+.85*low+.24*gust)*shudder
     +seal*(.62*Math.sin(2*Math.PI*(53+seed)*t)+.55*low)
     +scrape*.8+crack*.24*env;
  }
  if(id==='blood-pact'||id==='feed-the-pit')sample+=Math.sin(2*Math.PI*48*t)*Math.exp(-(((t%.28)/.035)**2))*tail*.3;
  if(id==='fire-death')sample+=env*(low*2.8+crack*.7)+Math.sin(2*Math.PI*42*t)*Math.exp(-t*11)*.45;
  dry[i]=Math.tanh(sample*1.3);
 }
 // Short, asymmetric early reflections give size without washing out impact timing.
 for(let i=0;i<count;i++) {
  left[i]=dry[i];right[i]=dry[i];
  for(const [delay,gain]of [[.031,.17],[.067,.12],[.113,.07]]) {
   const a=i-Math.round((delay+(seed%3)*.002)*rate),b=i-Math.round((delay+.009)*rate);
   if(a>=0)left[i]+=dry[a]*gain;if(b>=0)right[i]+=dry[b]*gain;
  }
 }
 const peak=Math.max(...[left,right].map(a=>a.reduce((m,v)=>Math.max(m,Math.abs(v)),0)));
 const gain=.72/Math.max(.001,peak),buf=Buffer.alloc(44+count*4);
 buf.write('RIFF');buf.writeUInt32LE(buf.length-8,4);buf.write('WAVEfmt ',8);buf.writeUInt32LE(16,16);buf.writeUInt16LE(1,20);buf.writeUInt16LE(2,22);buf.writeUInt32LE(rate,24);buf.writeUInt32LE(rate*4,28);buf.writeUInt16LE(4,32);buf.writeUInt16LE(16,34);buf.write('data',36);buf.writeUInt32LE(count*4,40);
 let squares=0;for(let i=0;i<count;i++)for(let c=0;c<2;c++){const v=[left,right][c][i]*gain*Math.min(1,(count-i)/240);squares+=v*v;buf.writeInt16LE(Math.round(v*32767),44+i*4+c*2);}
 fs.writeFileSync(`${root}/${id}.wav`,buf);fs.writeFileSync(`${out}/${id}.wav`,buf);
 manifest.cues[id]={url:`/audio/sfx/r1/${id}.wav`,duration:count/rate,peak:.72,rms:Math.sqrt(squares/count/2),recipe:r,sha256:crypto.createHash('sha256').update(buf).digest('hex')};
}
fs.writeFileSync(`${root}/manifest.json`,JSON.stringify(manifest,null,2));fs.writeFileSync(`${out}/manifest.json`,JSON.stringify(manifest,null,2));
console.log(`Rendered ${Object.keys(recipes).length} stereo cues at ${rate} Hz.`);
