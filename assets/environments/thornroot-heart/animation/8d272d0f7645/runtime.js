/* Runelord ambient scene renderer. Original art is a fixed layer. */
window.RunelordWeather = {
  shapes(c,t) {
    const p=((t%c.duration)+c.duration)%c.duration/c.duration, tau=Math.PI*2, out=[];
    for(const s of c.particles){
      const q=(p+s.phase)%1;
      let x=s.x+s.sway*Math.sin(tau*q), y=s.y, a=s.alpha;
      if(s.kind==='snow'){y=.03+q*.48;a*=Math.sin(Math.PI*q)**2;}
      else if(s.kind==='ember'){y=.5-q*.4;a*=Math.sin(Math.PI*q)**2;}
      else {y+=.012*Math.sin(tau*q);a*=.65+.35*Math.sin(tau*q)**2;}
      if(y+s.ry>=c.protected_lane[0]&&y-s.ry<=c.protected_lane[1])continue;
      out.push({...s,x,y,alpha:a});
    }
    return out;
  },
  draw(ctx,img,c,t){
    const w=ctx.canvas.width,h=ctx.canvas.height;ctx.clearRect(0,0,w,h);ctx.drawImage(img,0,0,w,h);
    for(const s of this.shapes(c,t)){
      ctx.globalAlpha=s.alpha;ctx.fillStyle=s.color;ctx.beginPath();
      if(s.kind==='leaf'){ctx.moveTo((s.x-s.rx)*w,s.y*h);ctx.lineTo(s.x*w,(s.y-s.ry)*h);ctx.lineTo((s.x+s.rx)*w,s.y*h);ctx.lineTo(s.x*w,(s.y+s.ry)*h);ctx.closePath();}
      else ctx.ellipse(s.x*w,s.y*h,s.rx*w,s.ry*h,0,0,Math.PI*2);
      ctx.fill();
    }
    ctx.globalAlpha=1;
  }
};
