import type { SpellEffect } from './SpellEffects';
const clamp = (n:number) => Math.max(0,Math.min(1,n));

/** Approved nature design, fitted independently to each target's visible body. */
export function drawNatureWard(c:CanvasRenderingContext2D,e:SpellEffect,time:number) {
  const t=time-e.start, after=t-e.release;
  if(t<0||t>e.duration)return;
  c.save();c.globalCompositeOperation='lighter';
  const charge=clamp(t/Math.max(1,e.release))*clamp((e.release+420-t)/300);
  c.save();c.translate(e.from.x,e.from.y);c.rotate(t*.0015);
  c.globalAlpha=charge;c.strokeStyle='#adffd5';c.shadowColor='#37d98a';c.shadowBlur=15;c.lineWidth=1.7;
  for(let i=0;i<3;i++){c.rotate(Math.PI*2/3);c.beginPath();c.moveTo(0,0);c.bezierCurveTo(-12,-8,-10,-21,0,-24);c.bezierCurveTo(10,-16,8,-5,0,0);c.stroke();}
  c.restore();
  if(after<0){c.restore();return;}
  for(const target of e.targets) {
    const sx=target.width!=null?target.width/114:(e.scale??1);
    const sy=target.height!=null?target.height/215:(e.scale??1);
    const grow=1-Math.pow(1-clamp(after/380),3);
    const fade=clamp(after/160)*clamp((e.duration-t)/850), pulse=.86+.14*Math.sin(after*.005);
    if(after<500){c.globalAlpha=clamp(1-after/500);c.strokeStyle='#c5ffe0';c.shadowColor='#3dd78f';c.shadowBlur=12;c.lineWidth=2;
      c.beginPath();c.moveTo(e.from.x,e.from.y);c.quadraticCurveTo(target.x-35,target.y-85,target.x,target.y);c.stroke();}
    c.save();c.translate(target.x,target.y);c.scale(sx*(.25+.75*grow),sy*(.2+.8*grow));
    c.globalAlpha=fade*pulse;c.shadowColor='#39d58c';c.shadowBlur=17;
    // A single rounded seed-leaf shell. No horns, face, or infernal seal.
    const shell=()=>{c.beginPath();c.moveTo(0,-104);c.bezierCurveTo(40,-98,59,-67,57,-25);c.bezierCurveTo(56,33,29,85,0,111);c.bezierCurveTo(-29,85,-56,33,-57,-25);c.bezierCurveTo(-59,-67,-40,-98,0,-104);c.closePath();};
    const fill=c.createLinearGradient(-55,0,55,0);fill.addColorStop(0,'#57eaaa2b');fill.addColorStop(.5,'#12593843');fill.addColorStop(1,'#8df5bb39');
    shell();c.fillStyle=fill;c.fill();c.strokeStyle='#91f5be';c.lineWidth=2.6;c.stroke();
    c.save();c.scale(.86,.89);shell();c.strokeStyle='#d0ffdf';c.lineWidth=1;c.stroke();c.restore();
    c.strokeStyle='#aaffcd';c.lineWidth=1.5;
    c.beginPath();c.moveTo(0,84);c.bezierCurveTo(-6,33,7,-32,0,-81);c.stroke();
    for(const side of [-1,1])for(let i=0;i<4;i++){
      const y=-47+i*32, x=side*(31-Math.abs(i-1)*5);
      c.beginPath();c.moveTo(0,y+24);c.quadraticCurveTo(x*.55,y+8,x,y-10);c.stroke();
      c.beginPath();c.moveTo(x,y-10);c.quadraticCurveTo(x-side*16,y-11,x-side*12,y+4);c.quadraticCurveTo(x-side*1,y+1,x,y-10);c.fillStyle='#90f3b738';c.fill();c.stroke();
    }
    for(let i=0;i<24;i++){const f=(after/1600+i/24)%1,x=Math.sin(i*2.4)*52+Math.sin(f*Math.PI*2+i)*3;
      c.globalAlpha=fade*Math.sin(f*Math.PI)*.65;c.fillStyle=i%3?'#77edb1':'#e8ffb6';c.beginPath();c.ellipse(x,85-f*190,1.2,1.8,Math.sin(i),0,Math.PI*2);c.fill();}
    c.restore();
  }
  c.restore();
}
