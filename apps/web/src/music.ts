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
    this.ctx ??= new AudioContext();
    await this.ctx.resume();
    if (!this.gain) {
      this.gain = this.ctx.createGain();
      this.gain.gain.value = this.volume;
      this.gain.connect(this.ctx.destination);
    }
    if (this.track === id && this.source) {
      // Returning to the current scene also invalidates another scene's load.
      ++this.serial;
      return;
    }
    const serial = ++this.serial,
      track = id === OPENING_SCORE_ID ? openingScore : assets.music[id];
    if (!track) throw Error("Unknown score");
    let buffer = this.cache.get(id);
    if (!buffer) {
      const response = await fetch(assetUrl(track.url));
      if (!response.ok) throw Error("Score unavailable");
      buffer = await this.ctx.decodeAudioData(await response.arrayBuffer());
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
  setVolume(value: number) {
    this.volume = value;
    if (this.ctx && this.gain)
      this.gain.gain.setTargetAtTime(value, this.ctx.currentTime, 0.08);
  }
}
export const score = new ScorePlayer();
