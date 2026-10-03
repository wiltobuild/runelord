import fs from 'node:fs';
import crypto from 'node:crypto';
import { spawnSync } from 'node:child_process';

// Original, sample-free score. Circular accumulation retains reverb tails across
// the loop; all note positions are musical beats at 60 BPM in a 16-bar phrase.
const rate = 48000, seconds = 64, count = rate * seconds;
const left = new Float64Array(count), right = new Float64Array(count);
const notes = [];
let seed = 0x5a17;
const noise = () => ((seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0) / 2147483648 - 1);
const sine = Math.sin, tau = 2 * Math.PI;
function note(part, beat, duration, pitch, level, pan = 0) {
  notes.push({ part, beat, duration, pitch, level, pan });
  const f = 440 * 2 ** ((pitch - 69) / 12), start = Math.round(beat * rate);
  const l = Math.sqrt((1 - pan) / 2), r = Math.sqrt((1 + pan) / 2);
  let breath = 0;
  for (let i = 0; i < duration * rate; i++) {
    const t = i / rate, p = tau * f * t;
    const sustain = Math.min(1, t / .8) * Math.min(1, (duration - t) / 1.5);
    let v;
    if (part === 'choir') {
      // Low vowel-like harmonic formants, with breath and slow human vibrato.
      const vibrato = .021 * sine(tau * 4.6 * t) + .008 * sine(tau * .21 * t);
      v = 0;
      for (let h = 1; h <= 10; h++) {
        const formant = .17 / h + .32 * Math.exp(-(((f * h - 460) / 160) ** 2)) + .15 * Math.exp(-(((f * h - 920) / 190) ** 2));
        v += sine(p * h + vibrato * h) * formant;
      }
      breath = breath * .94 + noise() * .06;
      v = (v + breath * .08) * sustain;
    } else if (part === 'strings') {
      v = (sine(p + .016 * sine(tau * 5.1 * t)) + .24 * sine(2 * p) + .11 * sine(3 * p) + .045 * sine(5 * p));
      v *= sustain * (.85 + .15 * sine(tau * .17 * t));
    } else if (part === 'bell') {
      v = (sine(p) * Math.exp(-t / 2.7) + .33 * sine(p * 2.006) * Math.exp(-t / 1.7) + .12 * sine(p * 3.97) * Math.exp(-t / .7));
      v *= Math.min(1, t / .012) * Math.min(1, (duration - t) / .3);
    } else if (part === 'drum') {
      v = (sine(tau * (f * t + 42 * .035 * (1 - Math.exp(-t / .035)))) + noise() * .13 * Math.exp(-t * 10));
      v *= Math.min(1, t / .004) * Math.exp(-t * 3.8) * Math.min(1, (duration - t) / .1);
    } else {
      breath = breath * .98 + noise() * .02;
      v = breath * sine(Math.PI * t / duration) ** 2;
    }
    const pos = (start + i) % count;
    left[pos] += v * level * l;
    right[pos] += v * level * r;
  }
}
// D minor pedal, B-flat shadow, C suspended, then Phrygian E-flat tension.
const chords = [[38,45,50,53], [34,41,50,53], [36,43,50,55], [39,46,50,57]];
for (let phrase = 0; phrase < 8; phrase++) {
  const chord = chords[phrase % 4], start = phrase * 8;
  chord.forEach((pitch, i) => note('choir', start, 9.5, pitch, i ? .10 : .14, (i - 1.5) * .24));
  note('strings', start + .2, 9.2, chord[2] + 12, .041, -.55);
  note('strings', start + .4, 9, chord[3] + 12, .035, .55);
  note('drum', start, 2, 31, .24);
  note('drum', start + 3, 1.5, 38, .095, -.25);
  note('drum', start + 6, 1.5, 33, .13, .25);
  if (phrase >= 4) note('drum', start + 7.5, 1, 41, .055, -.3);
  note('air', start + 5, 4.5, 0, .13, phrase % 2 ? -.4 : .4);
}
// Spacious, descending tolls; no triumphant major cadence.
[[2,62],[6,57],[11,65],[15,62],[19,62],[22,60],[27,63],[30,57],
 [34,69],[38,65],[42,62],[46,57],[50,67],[54,62],[58,63],[62,57]]
  .forEach(([beat,pitch],i)=>note('bell',beat,6,pitch,i>7?.12:.095,i%2?.35:-.35));

// Stereo cathedral diffusion: circular, decorrelated multi-tap wet field.
const dryL = left.slice(), dryR = right.slice();
for (let tap = 1; tap <= 18; tap++) {
  const dl = Math.round((.093 * tap + .011 * (tap % 3)) * rate);
  const dr = Math.round((.101 * tap + .007 * (tap % 4)) * rate);
  const gain = .12 * Math.exp(-tap / 7);
  for (let i = 0; i < count; i++) {
    left[i] += dryR[(i - dl + count) % count] * gain;
    right[i] += dryL[(i - dr + count) % count] * gain;
  }
}
let peak = 0;
for (let i = 0; i < count; i++) peak = Math.max(peak, Math.abs(left[i]), Math.abs(right[i]));
const gain = .72 / peak;
const wav = Buffer.alloc(44 + count * 4);
wav.write('RIFF'); wav.writeUInt32LE(wav.length - 8, 4); wav.write('WAVEfmt ',8);
wav.writeUInt32LE(16,16); wav.writeUInt16LE(1,20); wav.writeUInt16LE(2,22);
wav.writeUInt32LE(rate,24); wav.writeUInt32LE(rate*4,28); wav.writeUInt16LE(4,32); wav.writeUInt16LE(16,34);
wav.write('data',36); wav.writeUInt32LE(count*4,40);
let squares=0, clipped=0;
for(let i=0;i<count;i++) for(let c=0;c<2;c++) {
  // Four milliseconds removes residual oscillator phase discontinuity without a musical pause.
  const value=[left,right][c][i]*gain*Math.min(1,i/192,(count-1-i)/192);
  if(!Number.isFinite(value)) throw Error('Nonfinite sample');
  if(Math.abs(value)>=1) clipped++;
  squares+=value*value; wav.writeInt16LE(Math.round(value*32767),44+i*4+c*2);
}
const dir='assets/audio/music/pact-sanctum-r1', runtime='apps/web/public/opening-assets';
fs.mkdirSync(dir,{recursive:true}); fs.mkdirSync(runtime,{recursive:true});
fs.writeFileSync(`${dir}/pact-sanctum.wav`,wav);
fs.writeFileSync(`${dir}/composition.json`,JSON.stringify({title:'The Pact Sanctum',bpm:60,meter:'4/4',bars:16,seed:0x5a17,notes,license:'Original project composition and sample-free procedural synthesis. No third-party recordings or SoundFonts.'},null,2));
const ffmpeg=process.env.FFMPEG_PATH || 'work/promo-tools/node_modules/ffmpeg-static/ffmpeg.exe';
const encoded=spawnSync(ffmpeg,['-y','-i',`${dir}/pact-sanctum.wav`,'-c:a','libvorbis','-q:a','5',`${runtime}/pact-sanctum.ogg`],{encoding:'utf8'});
if(encoded.status!==0)throw Error(encoded.stderr);
const manifest=[{slug:'pact-sanctum',title:'The Pact Sanctum',bpm:60,meter:'4/4',bars:16,duration_seconds:seconds,sample_rate:rate,channels:2,loop_start_sample:0,loop_end_sample_exclusive:count,sha256:crypto.createHash('sha256').update(wav).digest('hex'),runtime_sha256:crypto.createHash('sha256').update(fs.readFileSync(`${runtime}/pact-sanctum.ogg`)).digest('hex'),verification:{peak_dbfs:20*Math.log10(.72),rms_dbfs:20*Math.log10(Math.sqrt(squares/count/2)),clipped_samples:clipped,seam_delta:0,finite:true},description:'Dedicated opening-screen score: dark vowel choir, bowed harmonic layers, descending bronze tolls, low ritual drums, circular stereo cathedral reverb. Subjective listening approval pending.'}];
fs.writeFileSync(`${dir}/loop_manifest.json`,JSON.stringify(manifest,null,2));
console.log(JSON.stringify(manifest,null,2));
