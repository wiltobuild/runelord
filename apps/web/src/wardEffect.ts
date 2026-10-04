import type { SpellEffect } from './SpellEffects';
const clamp = (n:number) => Math.max(0,Math.min(1,n));

export function drawWard(c:CanvasRenderingContext2D,e:SpellEffect,time:number) {
  const t=time-e.start, after=t-e.release;
  if(t<0||t>e.duration)return;
  c.save();c.globalCompositeOperation='lighter';
  // The cast gathers at the authored extended-hand socket before reaching the shield.
  const charge=clamp(t/Math.max(1,e.release))*clamp((e.release+420-t)/300);
  c.save();c.translate(e.from.x,e.from.y);c.rotate(t*.003);
  c.globalAlpha=charge;c.strokeStyle='#ff9b55';c.shadowColor='#ff382c';c.shadowBlur=15;c.lineWidth=1.7;
  c.beginPath();c.arc(0,0,17,0,Math.PI*2);c.stroke();c.beginPath();
  for(let i=0;i<=5;i++){const a=i*4*Math.PI/5;c.lineTo(Math.cos(a)*13,Math.sin(a)*13);}c.stroke();c.restore();
  if(after<0){c.restore();return;}
  for(const [index,target] of e.targets.entries()) {
    const size=(index===0?1:.55)*(e.scale ?? 1), grow=1-Math.pow(1-clamp(after/380),3);
    const fade=clamp(after/160)*clamp((e.duration-t)/850);
    const pulse=.86+.14*Math.sin(after*.005);
    // A brief ember filament visually carries the ward out of the casting hand.
    if(after<500){c.globalAlpha=clamp(1-after/500);c.strokeStyle='#ffc07d';c.shadowColor='#ff442c';c.shadowBlur=12;c.lineWidth=2;
      c.beginPath();c.moveTo(e.from.x,e.from.y);c.quadraticCurveTo(target.x-35,target.y-85,target.x,target.y);c.stroke();}
    c.save();c.translate(target.x,target.y);c.scale(size*(.25+.75*grow),size*(.2+.8*grow));
    c.globalAlpha=fade*pulse;c.shadowColor='#ff462d';c.shadowBlur=17;
    // Horned, pointed shield with a translucent crimson interior.
    const shield=()=>{c.beginPath();c.moveTo(0,-95);c.lineTo(31,-78);c.lineTo(49,-112);c.lineTo(47,-45);c.lineTo(57,-18);c.lineTo(39,66);c.lineTo(0,111);c.lineTo(-39,66);c.lineTo(-57,-18);c.lineTo(-47,-45);c.lineTo(-49,-112);c.lineTo(-31,-78);c.closePath();};
    const fill=c.createLinearGradient(-55,0,55,0);fill.addColorStop(0,'#ff71252b');fill.addColorStop(.5,'#8c164643');fill.addColorStop(1,'#ff712539');
    shield();c.fillStyle=fill;c.fill();c.strokeStyle='#ff9860';c.lineWidth=2.6;c.stroke();
    c.save();c.scale(.86,.89);shield();c.strokeStyle='#ffc78b';c.lineWidth=1;c.stroke();c.restore();
    // Central infernal seal and flanking angular glyphs.
    c.strokeStyle='#ffbd83';c.lineWidth=1.5;c.beginPath();c.ellipse(0,0,30,53,0,0,Math.PI*2);c.stroke();
    c.beginPath();for(let i=0;i<=5;i++){const a=-Math.PI/2+i*4*Math.PI/5;c.lineTo(Math.cos(a)*25,Math.sin(a)*45);}c.stroke();
    for(const side of [-1,1])for(let i=0;i<5;i++){const y=-55+i*25,x=side*(36-Math.abs(i-2)*3);c.beginPath();c.moveTo(x-4,y-5);c.lineTo(x+3,y);c.lineTo(x-4,y+5);c.moveTo(x,y-7);c.lineTo(x,y+7);c.stroke();}
    for(let i=0;i<24;i++){const f=(after/1600+i/24)%1,x=Math.sin(i*2.4)*52;
      c.globalAlpha=fade*Math.sin(f*Math.PI)*.65;c.fillStyle=i%3?'#ff6b36':'#ffe0a0';c.fillRect(x,85-f*190,1.5,3+i%4);}
    c.restore();
  }
  c.restore();
}
