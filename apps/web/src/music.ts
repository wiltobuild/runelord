import type { Assets } from "./assets";
import { assetUrl } from "./baseUrl";
export const OPENING_SCORE_ID = "pact-sanctum";
export const OPENING_SCORE_TITLE = "The Pact Sanctum";
const openingScore = {
  url: "/opening-assets/pact-sanctum.ogg",
  title: OPENING_SCORE_TITLE,
  start: 0,
  end: 64,
};
export const INFERNAL_SCORES: Record<string, {url:string;title:string;start:number;end:number}> = {
  "infernal-map": {url:"/audio/music/infernal-scenes-r1/infernal-map.ogg",title:"Paths Beneath the Ember Sky",start:0,end:48},
  "cinder-vault": {url:"/audio/music/infernal-scenes-r1/cinder-vault.ogg",title:"Gold Beneath the Cinders",start:0,end:48},
  "chain-bazaar": {url:"/audio/music/infernal-scenes-r1/chain-bazaar.ogg",title:"The Price of Chains",start:0,end:42},
  "infernal-scriptorium": {url:"/audio/music/infernal-scenes-r1/infernal-scriptorium.ogg",title:"Ink of the Unspoken",start:0,end:54},
};
export class ScorePlayer {
  private ctx: AudioContext | null = null;
  private gain: GainNode | null = null;
  private source: AudioBufferSourceNode | null = null;
  private sourceGain: GainNode | null = null;
  private cache = new Map<string, AudioBuffer>();
  private serial = 0;
  private track = "";
  private volume = 0.35;
  async play(assets: Assets, id: string) {
    const serial = ++this.serial;
    this.ctx ??= new AudioContext();
    await this.ctx.resume();
    if (serial !== this.serial) return;
    if (!this.gain) {
      this.gain = this.ctx.createGain();
      this.gain.gain.value = this.volume;
      this.gain.connect(this.ctx.destination);
    }
    if (this.track === id && this.source) {
      // Returning to the current scene also invalidates another scene's load.
      return;
    }
    const track = id === OPENING_SCORE_ID ? openingScore : INFERNAL_SCORES[id] ?? assets.music[id];
    if (!track) throw Error("Unknown score");
    let buffer = this.cache.get(id);
    if (!buffer) {
      const response = await fetch(assetUrl(track.url));
      if (!response.ok) throw Error("Score unavailable");
      buffer = await this.ctx.decodeAudioData(await response.arrayBuffer());
      if (INFERNAL_SCORES[id]) {
        // Vorbis can introduce tiny endpoint offsets after the master taper.
        const edge = Math.round(buffer.sampleRate * .004);
        for (let channel = 0; channel < buffer.numberOfChannels; channel++) {
          const samples = buffer.getChannelData(channel);
          for (let i = 0; i < edge; i++) {
            const fade = i / edge;
            samples[i] *= fade;
            samples[samples.length - 1 - i] *= fade;
          }
        }
      }
      this.cache.set(id, buffer);
    }
    if (serial !== this.serial) return;
    const now = this.ctx.currentTime;
    const oldSource = this.source, oldGain = this.sourceGain;
    if (oldSource && oldGain) {
      oldGain.gain.cancelAndHoldAtTime(now);
      oldGain.gain.linearRampToValueAtTime(0, now + 0.4);
      oldSource.stop(now + 0.41);
      oldSource.onended = () => { oldSource.disconnect(); oldGain.disconnect(); };
    }
    const source = this.ctx.createBufferSource();
    const voiceGain = this.ctx.createGain();
    source.buffer = buffer;
    source.loop = true;
    source.loopStart = track.start;
    source.loopEnd = track.end;
    voiceGain.gain.setValueAtTime(0, now);
    voiceGain.gain.linearRampToValueAtTime(1, now + 0.5);
    source.connect(voiceGain);
    voiceGain.connect(this.gain);
    source.start();
    this.source = source;
    this.sourceGain = voiceGain;
    this.track = id;
  }
  stop() {
    this.serial++;
    this.source?.stop();
    this.source?.disconnect();
    this.sourceGain?.disconnect();
    this.source = null;
    this.sourceGain = null;
    this.track = "";
  }
  setVolume(value: number) {
    this.volume = value;
    if (this.ctx && this.gain)
      this.gain.gain.setTargetAtTime(value, this.ctx.currentTime, 0.08);
  }
}
export const score = new ScorePlayer();
