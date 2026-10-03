type Bank = { cues: Record<string,{url:string}> };
class EffectsPlayer {
  private ctx?:AudioContext;
  private master?:GainNode;
  private bank?:Promise<Bank>;
  private cache=new Map<string,Promise<AudioBuffer>>();
  private voices=new Set<AudioBufferSourceNode>();
  private last=new Map<string,number>();
  private generation=0;
  volume=(()=>{try {const v=localStorage.getItem('runelord-sfx-volume');return v===null?.6:Math.max(0,Math.min(1,Number(v)||0));}catch{return .6;}})();
  async unlock() {
    try {
      if(!this.ctx) {
        this.ctx=new AudioContext();this.master=this.ctx.createGain();this.master.gain.value=this.volume*.65;
        const limiter=this.ctx.createDynamicsCompressor();limiter.threshold.value=-14;limiter.knee.value=12;limiter.ratio.value=8;limiter.attack.value=.003;limiter.release.value=.16;
        this.master.connect(limiter);limiter.connect(this.ctx.destination);
        this.bank=fetch('/audio/sfx/r1/manifest.json').then(r=>{if(!r.ok)throw Error('SFX manifest unavailable');return r.json();});
        void this.bank.then(bank=>Promise.allSettled(Object.keys(bank.cues).map(id=>this.buffer(id)))).catch(()=>{});
      }
      if(this.ctx.state==='suspended')await this.ctx.resume();
    }catch { /* Audio failure never interrupts combat. */ }
  }
  private async buffer(id:string) {
    if(!this.cache.has(id))this.cache.set(id,(async()=>{
      const bank=await this.bank, cue=bank?.cues[id];if(!cue||!this.ctx)throw Error(`Missing sound ${id}`);
      const r=await fetch(cue.url);if(!r.ok)throw Error(`Missing sound ${id}`);
      return this.ctx.decodeAudioData(await r.arrayBuffer());
    })().catch(e=>{this.cache.delete(id);throw e;}));
    return this.cache.get(id)!;
  }
  play(id:string,delay=0,pan=0) {
    if(!this.ctx||this.ctx.state!=='running'||!this.volume||document.hidden)return;
    const now=performance.now();if(now-(this.last.get(id)??-Infinity)<45)return;
    this.last.set(id,now);const generation=this.generation, scheduled=this.ctx.currentTime+delay;
    void this.buffer(id).then(buffer=>{
      if(generation!==this.generation||!this.ctx||!this.master||!this.volume||document.hidden||this.ctx.currentTime>scheduled+.18)return;
      if(this.voices.size>=12){const oldest=this.voices.values().next().value;oldest?.stop();if(oldest)this.voices.delete(oldest);}
      const voice=this.ctx.createBufferSource(),panner=this.ctx.createStereoPanner();voice.buffer=buffer;
      voice.playbackRate.value=id.startsWith('hit-')?.97+Math.random()*.06:1;panner.pan.value=Math.max(-.6,Math.min(.6,pan));
      voice.connect(panner);panner.connect(this.master);this.voices.add(voice);
      voice.onended=()=>{this.voices.delete(voice);voice.disconnect();panner.disconnect();};voice.start(Math.max(scheduled,this.ctx.currentTime));
    }).catch(()=>{});
  }
  setVolume(value:number) {this.volume=Math.max(0,Math.min(1,value));try{localStorage.setItem('runelord-sfx-volume',String(this.volume));}catch{}if(this.ctx&&this.master)this.master.gain.setTargetAtTime(this.volume*.65,this.ctx.currentTime,.02);if(!this.volume)this.stop();}
  stop() {this.generation++;for(const voice of this.voices)voice.stop();this.voices.clear();}
}
export const sfx=new EffectsPlayer();
