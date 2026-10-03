// Deterministic particles keep replay and simultaneous enemy deaths stable.
const noise = (n: number) => { const v = Math.sin(n * 127.1 + 311.7) * 43758.5453; return v - Math.floor(v); };
export function drawFireBurst(ctx: CanvasRenderingContext2D, w: number, h: number, t: number) {
  const heat = Math.min(1, t / .08) * Math.max(0, 1 - Math.max(0, t - .36) / .48);
  ctx.save();
  // Broad ground illumination, with a white-hot ignition that decays into orange.
  ctx.globalCompositeOperation = "screen";
  const glow = ctx.createRadialGradient(w*.5,h*.56,0,w*.5,h*.56,w*.46);
  glow.addColorStop(0, `rgba(255,239,158,${heat*.82})`);
  glow.addColorStop(.3, `rgba(255,112,13,${heat*.62})`);
  glow.addColorStop(1,"rgba(205,35,4,0)");
  ctx.fillStyle=glow; ctx.fillRect(0,0,w,h);
  ctx.globalCompositeOperation="source-over";
  // Rolling charcoal smoke is behind the flame silhouette, not over its hot core.
  for(let i=0;i<18;i++) {
    const age=Math.max(0,t-.13-noise(i)*.13), r=(.028+age*.065)*w;
    const x=w*(.27+noise(i+20)*.46+Math.sin(i+age*5)*age*.055);
    const y=h*(.58-age*(.25+noise(i+40)*.23));
    ctx.globalAlpha=Math.sin(Math.PI*Math.min(1,age/.85))*.42;
    ctx.fillStyle=i%2?"#302522":"#574036";
    ctx.beginPath();ctx.ellipse(x,y,r,r*.7,noise(i)*2,0,Math.PI*2);ctx.fill();
  }
  // Irregular, nested cel-shaded tongues: dark red contour, orange body, gold core.
  for(let i=0;i<27;i++) {
    const x=w*(.245+noise(i+80)*.51), y=h*(.59+noise(i+110)*.055);
    const flicker=.82+.18*Math.sin(t*34+i*2.7);
    const width=w*(.025+noise(i+140)*.048)*heat;
    const height=h*(.13+noise(i+170)*.28)*heat*flicker;
    const bend=Math.sin(i*1.7+t*19)*width*.8;
    for(let layer=0;layer<3;layer++) {
      const q=1-layer*.24, rw=width*q, rh=height*q;
      ctx.globalAlpha=Math.min(1,heat*2);
      ctx.fillStyle=["#a92b13","#fa6015","#ffc34b"][layer];
      ctx.beginPath();ctx.moveTo(x-rw,y);
      ctx.bezierCurveTo(x-rw*1.3,y-rh*.35,x+ bend-rw*.5,y-rh*.63,x+bend,y-rh);
      ctx.lineTo(x+bend+rw*.23,y-rh*.61);
      ctx.lineTo(x+rw*.7,y-rh*.77);
      ctx.bezierCurveTo(x+rw*.35,y-rh*.35,x+rw*1.3,y-rh*.22,x+rw,y);
      ctx.quadraticCurveTo(x,y+rw*.4,x-rw,y);ctx.fill();
    }
  }
  ctx.globalCompositeOperation="screen";
  // Brief hot bed conceals the entire fallen model before the husk is revealed.
  const core=ctx.createRadialGradient(w*.5,h*.59,0,w*.5,h*.59,w*.3);
  core.addColorStop(0,`rgba(255,249,192,${heat})`);
  core.addColorStop(.6,`rgba(255,137,28,${heat*.75})`);core.addColorStop(1,"rgba(255,65,8,0)");
  ctx.globalAlpha=1;ctx.fillStyle=core;ctx.fillRect(w*.15,h*.3,w*.7,h*.5);
  // Ballistic sparks plus slower drifting embers, each with its own birth and trail.
  for(let i=0;i<96;i++) {
    const birth=noise(i+210)*.28, age=t-birth;
    if(age<0)continue;
    const life=.35+noise(i+240)*.5, fade=Math.max(0,1-age/life);
    const vx=(noise(i+270)-.5)*.8, vy=-.32-noise(i+300)*.6;
    const x=w*(.26+noise(i+330)*.48+vx*age);
    const y=h*(.58+vy*age+.35*age*age);
    const size=(1+noise(i+360)*2.8)*fade;
    ctx.globalAlpha=fade;ctx.strokeStyle=i%3?"#ffb543":"#fff1b0";ctx.lineWidth=size;
    ctx.shadowColor="#ff6a13";ctx.shadowBlur=9;
    ctx.beginPath();ctx.moveTo(x-vx*w*.025,y-(vy+.7*age)*h*.025);ctx.lineTo(x,y);ctx.stroke();
  }
  ctx.restore();
}
