import type { Assets } from "./assets";
import { assetUrl } from "./baseUrl";
export class ScorePlayer {
  private ctx: AudioContext | null = null;
  private gain: GainNode | null = null;
  private source: AudioBufferSourceNode | null = null;
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
    if (this.track === id && this.source) return;
    this.track = id;
    const serial = ++this.serial,
      track = assets.music[id];
    let buffer = this.cache.get(id);
    if (!buffer) {
      const response = await fetch(assetUrl(track.url));
      if (!response.ok) throw Error("Score unavailable");
      buffer = await this.ctx.decodeAudioData(await response.arrayBuffer());
      this.cache.set(id, buffer);
    }
    if (serial !== this.serial) return;
    this.source?.stop();
    this.source?.disconnect();
    const source = this.ctx.createBufferSource();
    source.buffer = buffer;
    source.loop = true;
    source.loopStart = track.start;
    source.loopEnd = track.end;
    source.connect(this.gain);
    source.start();
    this.source = source;
  }
  setVolume(value: number) {
    this.volume = value;
    if (this.ctx && this.gain)
      this.gain.gain.setTargetAtTime(value, this.ctx.currentTime, 0.08);
  }
}
export const score = new ScorePlayer();
