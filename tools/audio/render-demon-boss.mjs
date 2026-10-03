import fs from 'node:fs';import crypto from 'node:crypto';
const source='assets/audio/music/03_the_crown_beneath/03_the_crown_beneath.wav';
const composition=JSON.parse(fs.readFileSync('assets/audio/music/03_the_crown_beneath/composition.json','utf8'));
const b=fs.readFileSync(source);let fmt,pcm;
for(let p=12;p+8<b.length;){const id=b.toString('ascii',p,p+4),n=b.readUInt32LE(p+4);if(id==='fmt ')fmt=b.subarray(p+8,p+8+n);if(id==='data')pcm=b.subarray(p+8,p+8+n);p+=8+n+(n%2);}
const rate=fmt.readUInt32LE(4),channels=fmt.readUInt16LE(2),bits=fmt.readUInt16LE(14),bytes=bits/8;
if(rate!==48000||channels!==2||![16,24].includes(bits))throw Error('Unexpected source PCM');
const count=pcm.length/(channels*bytes),left=new Float64Array(count),right=new Float64Array(count),overlay=new Float64Array(count);
for(let i=0;i<count;i++){left[i]=pcm.readIntLE(i*2*bytes,bytes)/2**(bits-1)*.86;right[i]=pcm.readIntLE((i*2+1)*bytes,bytes)/2**(bits-1)*.86;}
let rng=135791;const noise=()=>{rng=(Math.imul(rng,1664525)+1013904223)>>>0;return rng/2147483648-1;};
const beat=60/96;
// A heavy three-beat procession, with alternating toms and rising final-section density.
for(let n=0;n<144;n++){
 const start=Math.round(n*beat*rate),down=n%3===0,bar=Math.floor(n/3),duration=down?.8:.32;
 for(let j=0;j<duration*rate;j++){const t=j/rate,env=Math.min(1,t/.003)*Math.exp(-t*(down?6:13));
  const phase=2*Math.PI*((down?48:78)*t+(down?65:90)*.025*(1-Math.exp(-t/.025)));
  const strike=env*(Math.sin(phase)*.14+noise()*.025*Math.exp(-t*18));
  overlay[(start+j)%count]+=strike*(bar>=32?1.15:1);
 }
 if(down&&bar%4===0)for(let j=0;j<rate*1.8;j++){const t=j/rate;overlay[(start+j)%count]+=.018*noise()*Math.exp(-t*2)*Math.min(1,t/.025);}
}
// Sub-octave choir/organ doubles the authored harmony, not an unrelated chord loop.
for(const note of composition.notes.filter(n=>n.part==='choir'&&n.pitch<64)){
 const start=Math.round(note.beat*beat*rate),dur=note.duration*beat,f=440*2**((note.pitch-12-69)/12);
 for(let j=0;j<dur*rate;j++){const t=j/rate,env=Math.min(1,t/.12)*Math.min(1,(dur-t)/.22);const p=2*Math.PI*f*t;
  overlay[(start+j)%count]+=.023*env*(Math.sin(p)+.22*Math.sin(p*2)+.13*Math.sin(p*3))*(.94+.06*Math.sin(2*Math.PI*4.7*t));}
}
for(let i=0;i<count;i++){
 left[i]+=overlay[i];
 right[i]+=overlay[i];
 for(const [delay,gain]of [[.087,.16],[.173,.09],[.281,.045]]){left[i]+=overlay[(i-Math.round(delay*rate)+count)%count]*gain;right[i]+=overlay[(i-Math.round((delay+.013)*rate)+count)%count]*gain;}
}
let peak=0;for(let i=0;i<count;i++)peak=Math.max(peak,Math.abs(left[i]),Math.abs(right[i]));const gain=.82/peak;
const wav=Buffer.alloc(44+count*4);wav.write('RIFF');wav.writeUInt32LE(wav.length-8,4);wav.write('WAVEfmt ',8);wav.writeUInt32LE(16,16);wav.writeUInt16LE(1,20);wav.writeUInt16LE(2,22);wav.writeUInt32LE(rate,24);wav.writeUInt32LE(rate*4,28);wav.writeUInt16LE(4,32);wav.writeUInt16LE(16,34);wav.write('data',36);wav.writeUInt32LE(count*4,40);
let squares=0;for(let i=0;i<count;i++)for(let c=0;c<2;c++){const v=[left,right][c][i]*gain*Math.min(1,i/120,(count-1-i)/120);if(!Number.isFinite(v))throw Error('Nonfinite');squares+=v*v;wav.writeInt16LE(Math.round(v*32767),44+i*4+c*2);}
const dir='assets/audio/music/demon-lord-r1';fs.mkdirSync(dir,{recursive:true});fs.writeFileSync(dir+'/demon-lord.wav',wav);
const metadata={slug:'demon-lord',title:'Crown of the Ninth Pit',bpm:96,meter:'3/4',bars:48,duration_seconds:count/rate,sample_rate:rate,loop_start_sample:0,loop_end_sample_exclusive:count,source,source_sha256:crypto.createHash('sha256').update(b).digest('hex'),sha256:crypto.createHash('sha256').update(wav).digest('hex'),verification:{peak_dbfs:20*Math.log10(.82),rms_dbfs:20*Math.log10(Math.sqrt(squares/count/2)),seam_delta:0,finite:true},description:'Original project boss arrangement: existing licensed orchestral full mix plus newly synthesized low choir/organ and heavy procession percussion. Subjective listening approval pending.'};
fs.writeFileSync(dir+'/loop_manifest.json',JSON.stringify([metadata],null,2));fs.writeFileSync(dir+'/composition.json',JSON.stringify({base:composition,arrangement:'render-demon-boss.mjs: original96BPM heavy percussion and suboctave harmony',license:'Base retains Runelord music and GeneralUser GS credits; new layers original synthesis, no external samples.'},null,2));console.log(metadata);
