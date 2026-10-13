import fs from 'node:fs';
import sharp from 'sharp';
const dir='assets/cinematics/oath-intro/r7';
await sharp(`${dir}/soul-leech-front.png`).trim({threshold:8}).resize({height:900}).png().toFile(`${dir}/soul-leech-front-export.png`);
let code=fs.readFileSync('tools/cinematic/render-oath-intro-r6.mjs','utf8');
// Retain unchanged r6 pose exports and r5 airborne imps; version only outputs.
code=code.replaceAll('r6/oath-intro-silent','r7/oath-intro-silent').replaceAll('r6/still-','r7/still-').replaceAll('r6/timeline','r7/timeline');
code=code.replace("let seed=1703;",`fronts['soul-leech']=await loadImage('${dir}/soul-leech-front-export.png');\nlet seed=1703;`);
code=code.replace('x:1080,y:685,h:155','distant:true,x:1080,y:685,h:155').replace('x:910,y:735,h:175','distant:true,x:910,y:735,h:175');
code=code.replace('const height=lane.h*(1+walk*.8);\n   const bottom=lane.y+walk*(H+height+90-lane.y);',`// Distant actors start with low screen velocity and accelerate as they approach.
   // Reach foreground size at halfway along the path, then retain that size.
   const travel=lane.distant?Math.pow(walk,1.8):walk;
   const fullHeight=({gloomstalker:255,'soul-leech':255,cerberax:300,'pyre-warden':310,'pit-brute':310})[id]??255;
   const growth=clamp(travel/.5);
   const height=lane.distant?lane.h+(fullHeight-lane.h)*growth:lane.h*(1+walk*.8);
   const bottom=lane.y+travel*(H+(lane.distant?fullHeight:height)+90-lane.y);`);
code=code.replace('depth-scaled forward procession.','accelerating distant approach reaching full size at half path. Single-body frontal Soul Leech.');
code=code.replace('actors.push({lane,id,age,emerge,walk,height,bottom,portal});','actors.push({lane,id,age,emerge,walk,height,bottom,portal,approachX:lane.x+(lane.distant?(lane.x===910?500:300)*travel:0)});');
code=code.replace('const {lane,id,age,emerge,walk,height,bottom,portal}=a;','const {lane,id,age,emerge,walk,height,bottom,portal,approachX}=a;');
code=code.replace('c.translate(lane.x,bottom+','c.translate(approachX,bottom+');
code=code.replace('runtime:out}',`correctedFront:'${dir}/soul-leech-front-export.png',runtime:out}`);
fs.writeFileSync('tools/cinematic/render-oath-intro-r7.mjs',code);
fs.writeFileSync('tools/cinematic/mux-oath-intro-r7.mjs',fs.readFileSync('tools/cinematic/mux-oath-intro-r6.mjs','utf8').replaceAll('/r6/','/r7/').replaceAll('intro-r6','intro-r7'));

