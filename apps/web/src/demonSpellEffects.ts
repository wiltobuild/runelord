import type { Point, SpellEffect } from "./SpellEffects";
const clamp = (x: number) => Math.max(0, Math.min(1, x));
const noise = (n: number) => { const x = Math.sin(n * 127.1) * 43758.5; return x - Math.floor(x); };
function spark(c: CanvasRenderingContext2D, x: number, y: number, r: number, color: string, alpha: number) {
  c.globalAlpha = clamp(alpha); c.fillStyle = color; c.shadowColor = color; c.shadowBlur = 10;
  c.beginPath(); c.arc(x, y, r, 0, Math.PI * 2); c.fill();
}
function seal(c: CanvasRenderingContext2D, p: Point, radius: number, rotation: number, color: string, alpha: number) {
  c.save(); c.translate(p.x, p.y); c.rotate(rotation); c.globalAlpha = clamp(alpha);
  c.strokeStyle = color; c.shadowColor = color; c.shadowBlur = 15; c.lineWidth = 2.5;
  c.beginPath(); c.arc(0, 0, radius, 0, Math.PI * 2); c.arc(0, 0, radius * .76, 0, Math.PI * 2); c.stroke();
  c.beginPath();
  for (let i = 0; i <= 5; i++) { const a = -Math.PI/2+i*Math.PI*4/5; c.lineTo(Math.cos(a)*radius*.64, Math.sin(a)*radius*.64); }
  c.stroke();
  for (let i = 0; i < 8; i++) { c.rotate(Math.PI/4); c.beginPath(); c.moveTo(radius*.84,-4);c.lineTo(radius*.95,0);c.lineTo(radius*.84,4);c.stroke(); }
  // Broken counter-rotating rings and radial rune cuts add detail without
  // filling the center or covering the character beneath the sigil.
  c.rotate(-rotation*2);c.lineWidth=1.2;
  for(let i=0;i<12;i++) {
    const a=i*Math.PI/6;
    c.beginPath();c.arc(0,0,radius*1.15,a,a+.16);c.stroke();
    const x=Math.cos(a)*radius*1.3,y=Math.sin(a)*radius*1.3;
    c.beginPath();c.moveTo(x-2,y);c.lineTo(x,y-3);c.lineTo(x+2,y);c.lineTo(x,y+3);c.closePath();c.stroke();
  }
  c.restore();
}

function wisps(c:CanvasRenderingContext2D,p:Point,t:number,h:number,alpha:number) {
  c.strokeStyle="#e31b17";c.shadowColor="#ff1c12";c.shadowBlur=8;
  for(let i=0;i<36;i++) {
    const q=(t/(550+noise(i)*700)+noise(i+60))%1;
    const a=i*2.4+t*.002,x=p.x+Math.cos(a)*(25+noise(i+9)*35)*(1-q*.5),y=p.y+h*.45-q*h;
    c.globalAlpha=alpha*Math.sin(q*Math.PI)*.75;c.lineWidth=1+noise(i)*1.3;
    c.beginPath();c.moveTo(x,y);c.lineTo(x-Math.sin(a)*5,y+7+noise(i+2)*8);c.stroke();
  }
}

/** Dedicated selected-demon effects, using the battle director's measured actor centers. */
export function drawDemonSpell(c: CanvasRenderingContext2D, e: SpellEffect, time: number) {
  const t = time-e.start, u = clamp(t/e.duration), target = e.targets[0];
  if (!target || t < 0 || t > e.duration) return;
  const fade = clamp(t/120)*clamp((e.duration-t)/300), h = Math.min(240, e.height ?? 150);
  c.save(); c.globalCompositeOperation = "source-over";
  if (e.kind.startsWith("sacrifice-")) {
    const feast = e.kind === "sacrifice-feast", color = feast ? "#ff2014" : "#db101b";
    seal(c,e.from,38*(1-clamp((u-.25)/.65))+.1,-t*.002,color,fade);
    wisps(c,e.from,t,h,fade*(1-u));
    // Braided red filaments carry smaller fragments beside the main stream.
    for(let strand=0;strand<3;strand++) {
      c.globalAlpha=fade*.45;c.strokeStyle=strand===1?"#ff4438":"#b90b19";c.lineWidth=1.4;c.shadowColor="#ff2014";c.shadowBlur=8;c.beginPath();
      for(let j=0;j<=40;j++) {
        const q=j/40,a=q*Math.PI*5-t*.009+strand*2.1;
        const x=e.from.x+(target.x-e.from.x)*q;
        const y=e.from.y+(target.y-e.from.y)*q-Math.sin(q*Math.PI)*80+Math.sin(a)*Math.sin(q*Math.PI)*10;
        if(j===0)c.moveTo(x,y);else c.lineTo(x,y);
      }c.stroke();
    }
    // A visible tether and staggered souls carry the dissolved body to the caster.
    c.globalAlpha=fade*.4;c.strokeStyle=color;c.lineWidth=3;c.shadowColor=color;c.shadowBlur=16;
    c.beginPath();c.moveTo(e.from.x,e.from.y);c.quadraticCurveTo((e.from.x+target.x)/2,Math.min(e.from.y,target.y)-80,target.x,target.y);c.stroke();
    for(let i=0;i<150;i++) {
      const q=clamp((u-noise(i)*.36)/.55);if(q<=0||q>=1)continue;
      const sx=e.from.x+(noise(i+1)-.5)*85, sy=e.from.y+(noise(i+2)-.5)*h;
      const x=sx+(target.x-sx)*q, y=sy+(target.y-sy)*q-Math.sin(q*Math.PI)*80;
      spark(c,x,y,1.3+noise(i+4)*3,i%5?color:"#ff635b",fade*Math.sin(q*Math.PI));
      c.strokeStyle=color;c.lineWidth=1.5;c.beginPath();c.moveTo(x,y);c.lineTo(x+(sx-target.x)*.025,y+8);c.stroke();
    }
    const arrival=clamp((u-.45)/.2)*(1-clamp((u-.8)/.2));
    seal(c,target,24+u*32,t*.001,feast?"#ff392b":"#cf1525",arrival);
    for(let i=0;i<18;i++){const a=i*2.4+t*.006;spark(c,target.x+Math.cos(a)*30,target.y+Math.sin(a)*45,2,color,arrival);}
  } else if (e.kind === "command") {
    c.globalCompositeOperation = "source-over";
    const head={x:target.x,y:Math.max(145,target.y-h*.48-22)};
    const q=clamp(t/300);
    for(let i=0;i<18;i++) {
      const v=clamp(q-i*.025);spark(c,e.from.x+(head.x-e.from.x)*v,e.from.y+(head.y-e.from.y)*v,4-i*.16,"#ff1808",fade*(1-i/18));
    }
    wisps(c,target,t,h,fade);
    seal(c,head,25+clamp(t/300)*12,-t*.001,"#ff1808",fade*q);
    for(let i=0;i<48;i++){const a=i*2.4+t*.009,r=60*(1-u)+10;spark(c,target.x+Math.cos(a)*r,target.y+Math.sin(a)*r,2,"#e91b0c",fade);}
  } else {
    wisps(c,target,t,h,fade);
    // Two narrow helixes wrap the body as the red embers are absorbed.
    for(let strand=0;strand<2;strand++) {
      c.strokeStyle=strand?"#a80a14":"#f82a1b";c.shadowColor="#ff1d14";c.shadowBlur=8;c.lineWidth=1.7;c.globalAlpha=fade*.65;c.beginPath();
      for(let j=0;j<=45;j++) {
        const q=j/45,a=q*Math.PI*3+t*.006+strand*Math.PI;
        const x=target.x+Math.cos(a)*(38-12*q),y=target.y+h*.45-q*h*.85;
        if(j===0)c.moveTo(x,y);else c.lineTo(x,y);
      }c.stroke();
    }
    // Embers converge from around the selected demon, then rise through its body.
    for(let i=0;i<140;i++) {
      const q=clamp((u-noise(i)*.25)/.65),a=i*2.4+t*.003;
      const r=(1-q)*(65+noise(i+8)*50)+8;
      spark(c,target.x+Math.cos(a)*r,target.y+Math.sin(a)*r*.7-q*h*.25,1.4+noise(i)*3,i%4?"#ec1d12":"#ff5144",fade*Math.sin(q*Math.PI));
    }
    c.save();c.translate(target.x,target.y+h*.42);c.scale(1,.3);
    seal(c,{x:0,y:0},55+Math.sin(u*Math.PI)*15,t*.001,"#ed2019",fade*.85);c.restore();
    for(let i=0;i<28;i++){const q=(u*1.5+i/28)%1;spark(c,target.x+Math.sin(i*2.4+t*.004)*22,target.y+h*.45-q*h,2.5,"#ff4034",fade*Math.sin(q*Math.PI));}
  }
  c.restore();
}
