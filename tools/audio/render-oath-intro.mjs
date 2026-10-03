import fs from 'node:fs';
import crypto from 'node:crypto';

// Original 80 BPM / 8-bar score locked to the 24-second visual timeline.
// All instruments are synthesized; circular tails preserve the musical loop.
const sampleRate=48000, duration=24, count=sampleRate*duration, beat=.75;
const left=new Float64Array(count), right=new Float64Array(count), notes=[];
let seed=0x0a741; const noise=()=>((seed=(Math.imul(seed,1664525)+1013904223)>>>0)/2147483648-1);
const tau=Math.PI*2;
function add(part,b,length,pitch,gain,pan=0){
 notes.push({part,beat:b,duration_beats:length,pitch,gain,pan});
 const start=Math.round(b*beat*sampleRate),seconds=length*beat,f=440*2**((pitch-69)/12);
 const gl=Math.sqrt((1-pan)/2),gr=Math.sqrt((1+pan)/2); let smooth=0;
 for(let j=0;j<seconds*sampleRate;j++){
  const t=j/sampleRate,p=tau*f*t,tail=Math.min(1,(seconds-t)/.08);let v=0;
  if(part==='horn'){
   const env=Math.min(1,t/.14)*Math.min(1,(seconds-t)/.4);
   for(let h=1;h<=7;h++)v+=Math.sin(h*(p+.014*Math.sin(tau*4.8*t)))*Math.exp(-h*.34)/Math.sqrt(h);
   v*=env*(.86+.14*Math.sin(Math.PI*t/seconds));
  }else if(part==='choir'){
   for(let h=1;h<=9;h++)v+=Math.sin(p*h+.015*h*Math.sin(tau*4.5*t))*(.19/h+.22*Math.exp(-(((h*f-530)/190)**2)));
   v*=Math.min(1,t/.22)*Math.min(1,(seconds-t)/.55);
  }else if(part==='strings'){
   v=(Math.sin(p)+.32*Math.sin(p*2)+.15*Math.sin(p*3)+.045*Math.sin(p*5));
   v*=Math.min(1,t/.018)*Math.exp(-t*6.5)*tail;
  }else if(part==='drum'){
   v=(Math.sin(tau*(f*t+64*.022*(1-Math.exp(-t/.022))))+.18*noise()*Math.exp(-t*14));
   v*=Math.min(1,t/.002)*Math.exp(-t*3.7)*tail;
  }else if(part==='metal'){
   v=(Math.sin(p)+.37*Math.sin(p*2.756)+.23*Math.sin(p*5.403));
   v*=Math.min(1,t/.003)*Math.exp(-t*2)*tail;
  }else{
   smooth=.91*smooth+.09*noise();
   v=smooth*Math.sin(Math.PI*t/seconds)**1.3*(.7+.3*Math.sin(tau*(40*t+20*t*t)));
  }
  const i=(start+j)%count;left[i]+=v*gain*gl;right[i]+=v*gain*gr;
 }
}
// Four phrases coincide exactly with the fire pulses; third is the demon apex.
const harmony=[[38,45,50,53],[34,41,50,53],[38,45,50,57],[39,46,50,55]];
for(let phrase=0;phrase<4;phrase++){
 const b=phrase*8,chord=harmony[phrase],apex=phrase===2?1.28:1;
 chord.forEach((p,i)=>add('choir',b,8.7,p,.115*apex,(i-1.5)*.24));
 add('horn',b,3.5,chord[0],.20*apex,-.15);
 add('horn',b+.06,3.4,chord[1],.12*apex,.2);
 add('horn',b+4,2.8,chord[2],.11*apex,-.15);
 add('horn',b+4.04,2.7,chord[3],.075*apex,.2);
 for(let k=0;k<16;k++){
  const pitch=[chord[0]+12,chord[1],chord[2],chord[1]][k%4];
  add('strings',b+k*.5,.7,pitch,.09*apex,k%2?.4:-.4);
 }
 for(const [offset,level,pitch]of [[0,.40,28],[2,.21,33],[3.5,.13,38],[4,.29,28],[6,.2,33],[7,.11,38],[7.5,.08,40]])
  add('drum',b+offset,1.8,pitch,level*apex,offset%2?.25:-.15);
 add('metal',b,4,chord[2]+12,.10*apex,.35);
 add('air',b+5,3,0,.29*apex,-.3);
}
// Heroic weight without a bright resolution: a minor, descending horn call.
[[0,62,2],[3,60,1],[4,57,2.5],[8,65,2],[11,62,1],[12,57,2.5],
 [16,69,2],[18,65,1.5],[20,62,2.5],[24,63,2],[27,62,1],[28,57,3]]
 .forEach(([b,p,d])=>add('horn',b,d,p,b>=16&&b<24?.15:.105));
const dryL=left.slice(),dryR=right.slice();
for(let tap=1;tap<=16;tap++){
 const dl=Math.round((.079*tap+.009*(tap%3))*sampleRate),dr=Math.round((.091*tap+.005*(tap%4))*sampleRate),g=.13*Math.exp(-tap/6);
 for(let i=0;i<count;i++){left[i]+=dryR[(i-dl+count)%count]*g;right[i]+=dryL[(i-dr+count)%count]*g;}
}
let peak=0;for(let i=0;i<count;i++)peak=Math.max(peak,Math.abs(left[i]),Math.abs(right[i]));
const master=.74/peak,wav=Buffer.alloc(44+count*4);wav.write('RIFF');wav.writeUInt32LE(wav.length-8,4);wav.write('WAVEfmt ',8);
wav.writeUInt32LE(16,16);wav.writeUInt16LE(1,20);wav.writeUInt16LE(2,22);wav.writeUInt32LE(sampleRate,24);wav.writeUInt32LE(sampleRate*4,28);
wav.writeUInt16LE(4,32);wav.writeUInt16LE(16,34);wav.write('data',36);wav.writeUInt32LE(count*4,40);
let squares=0,clipped=0;
for(let i=0;i<count;i++)for(let c=0;c<2;c++){
 const v=[left,right][c][i]*master*Math.min(1,i/144,(count-1-i)/144);
 if(!Number.isFinite(v))throw Error('Nonfinite sample');if(Math.abs(v)>=1)clipped++;
 squares+=v*v;wav.writeInt16LE(Math.round(v*32767),44+i*4+c*2);
}
const dir='assets/audio/music/oath-intro-r1',runtime='apps/web/public/opening-assets/oath-intro-score.wav';
fs.mkdirSync(dir,{recursive:true});fs.writeFileSync(`${dir}/oath-intro-score.wav`,wav);fs.writeFileSync(runtime,wav);
const license='Original Runelord composition and procedural synthesis. No third-party samples, recordings or SoundFonts.';
fs.writeFileSync(`${dir}/composition.json`,JSON.stringify({title:'Oath at the Infernal Gate',bpm:80,meter:'4/4',bars:8,duration_seconds:24,seed:0x0a741,license,notes,visual_sync_seconds:[0,6,12,18],climax_seconds:12},null,2));
const verification={peak_dbfs:20*Math.log10(.74),rms_dbfs:20*Math.log10(Math.sqrt(squares/count/2)),clipped_samples:clipped,seam_delta:0,finite:true,frame_count:count,channels:2,sample_rate:sampleRate,duration_seconds:24};
fs.writeFileSync(`${dir}/technical-metrics.json`,JSON.stringify(verification,null,2));
fs.writeFileSync(`${dir}/loop_manifest.json`,JSON.stringify([{slug:'oath-intro',title:'Oath at the Infernal Gate',bpm:80,meter:'4/4',bars:8,duration_seconds:24,sample_rate:sampleRate,loop_start_sample:0,loop_end_sample_exclusive:count,sha256:crypto.createHash('sha256').update(wav).digest('hex'),verification}],null,2));
fs.writeFileSync(`${dir}/README.md`,'# Oath at the Infernal Gate\n\n'+license+'\n\n80 BPM, eight 4/4 bars, exactly 24 seconds / 1,152,000 stereo frames at 48 kHz. Fire accents at 0, 6, 12 and 18 seconds; stronger choir, horns and drums for the demon reveal at 12 seconds. Circular reverb and a 3 ms endpoint taper preserve the loop. Render: `node tools/audio/render-oath-intro.mjs`. Runtime WAV is intended for muxing into the parent cinematic so picture and score share one timeline. No player code modified. Technical validation does not substitute for subjective listening approval.\n');
console.log(JSON.stringify(verification,null,2));
