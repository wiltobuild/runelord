import type { SpellEffect } from './SpellEffects';
const clamp = (n:number) => Math.max(0,Math.min(1,n));
const noise = (i:number) => { const n=Math.sin(i*127.1+311.7)*43758.5453; return n-Math.floor(n); };

// Separate floor sigil and foreground embers keep the demon inside the portal.
export function drawSummon(c:CanvasRenderingContext2D,e:SpellEffect,time:number,ground:boolean) {
  const t=time-e.start;if(t<0||t>e.duration)return;
  const p=e.targets[0];if(!p)return;
  const size=e.scale??1, radius=78*size, height=e.height??170;
  const fade=clamp(t/140)*clamp((e.duration-t)/450);
  const emergence=clamp((t-e.release)/800);
  c.save();c.translate(p.x,p.y);c.globalCompositeOperation='lighter';
  if(ground) {
    c.scale(1,.3);c.globalAlpha=fade;
    const glow=c.createRadialGradient(0,0,5,0,0,radius*1.5);
    glow.addColorStop(0,'#75152a99');glow.addColorStop(.55,'#f4482580');glow.addColorStop(1,'#ff682000');
    c.fillStyle=glow;c.beginPath();c.arc(0,0,radius*1.5,0,Math.PI*2);c.fill();
    c.rotate(t*.00018);c.shadowColor='#ff451c';c.shadowBlur=16;
    for(const [r,w,color] of [[1,2.5,'#ffbd72'],[.88,1.2,'#e94539'],[.65,1.5,'#ff8251']] as const) {
      c.strokeStyle=color;c.lineWidth=w;c.beginPath();c.arc(0,0,radius*r,0,Math.PI*2);c.stroke();
    }
    // Interlaced five-point seal, with individual angular infernal glyphs.
    c.strokeStyle='#ffc88a';c.lineWidth=1.7;c.beginPath();
    for(let i=0;i<=5;i++){const a=-Math.PI/2+i*4*Math.PI/5;c.lineTo(Math.cos(a)*radius*.63,Math.sin(a)*radius*.63);}c.stroke();
    for(let i=0;i<18;i++) {
      c.save();c.rotate(i*Math.PI/9);c.translate(radius*.75,0);
      c.strokeStyle=i%3?'#ff975f':'#ffe2ac';c.lineWidth=1.4;
      c.beginPath();c.moveTo(-4,-5);c.lineTo(1,0);c.lineTo(-4,5);c.moveTo(1,-7);c.lineTo(1,7);
      c.moveTo(1,i%2?3:-3);c.lineTo(5,i%2?0:3);c.stroke();c.restore();
    }
    for(let i=0;i<5;i++) {
      c.save();c.rotate(i*Math.PI*2/5-Math.PI/2);c.strokeStyle='#ffac69';c.beginPath();
      c.moveTo(radius*.94,-7);c.lineTo(radius*1.15,0);c.lineTo(radius*.94,7);c.stroke();c.restore();
    }
  } else {
    // Ember ribbons climb the silhouette while it resolves, then disperse.
    const veil=fade*(1-emergence*.75);
    for(let i=0;i<9;i++) {
      const x=(i-4)*radius*.19;
      const g=c.createLinearGradient(x,0,x,-height);
      g.addColorStop(0,'#ff702900');g.addColorStop(.15,'#ff732f');g.addColorStop(.65,'#b12e4b');g.addColorStop(1,'#a5337500');
      c.globalAlpha=veil*.2;c.strokeStyle=g;c.lineWidth=9*size;c.beginPath();c.moveTo(x,0);
      c.bezierCurveTo(x-20*size,-height*.35,x+24*size,-height*.6,x,-height);c.stroke();
    }
    c.shadowColor='#ff642f';c.shadowBlur=9;
    for(let i=0;i<76;i++) {
      const n=noise(i+e.id*3),progress=(t/1000*(.5+n*.4)+noise(i+91))%1;
      const angle=i*2.4+t*.002*(i%2?1:-1);
      const spread=radius*(.2+noise(i+17)*.65)*(1-progress*.35);
      const x=Math.cos(angle)*spread,y=-progress*height+Math.sin(angle)*radius*.15;
      c.globalAlpha=fade*Math.sin(progress*Math.PI)*(.45+n*.5);
      c.strokeStyle=i%4?'#ff964e':'#ffe7b4';c.lineWidth=1+n*1.6;
      c.beginPath();c.moveTo(x,y);c.lineTo(x-Math.sin(angle)*4,y+5+n*8);c.stroke();
    }
    const pulse=Math.max(0,1-Math.abs(t-e.release-100)/230);
    c.globalAlpha=pulse*.65;c.strokeStyle='#ffdeb0';c.lineWidth=2;c.beginPath();
    c.ellipse(0,0,radius*(.7+emergence*.6),radius*.25,0,0,Math.PI*2);c.stroke();
  }
  c.restore();
}
