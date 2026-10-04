export type WardBox = { x:number; y:number; width:number; height:number };
export type WardRect = { left:number; top:number; width:number; height:number };
export type NatureWardTarget = { x:number; y:number; width:number; height:number };

// Measured from existing first idle frames at alpha >=32/255. Stable rest-body
// registration avoids having shield dimensions jitter with attack poses.
export const NATURE_WARD_ACTORS: Record<string,{size:[number,number];alpha:[number,number,number,number]}> = {
  'cairnback-hermit': { size: [448,448], alpha: [0.25,0.401785714,0.783482143,0.908482143] },
  'cairnwheel-witness': { size: [512,312], alpha: [0.2734375,0.224358974,0.814453125,0.794871795] },
  'gallows-orchard': { size: [369,362], alpha: [0.149051491,0.179558011,0.859078591,0.933701657] },
  'inkvein-adjudicator': { size: [440,400], alpha: [0.143181818,0.225,0.856818182,0.9325] },
  'ironfan-isopod': { size: [448,448], alpha: [0.238839286,0.616071429,0.792410714,0.915178571] },
  'pleatcap-matriarch': { size: [362,373], alpha: [0.154696133,0.144772118,0.870165746,0.935656836] },
  'reedstep-ferryman': { size: [440,400], alpha: [0.211363636,0.19,0.875,0.9325] },
  'siltglass-colony': { size: [376,398], alpha: [0.175531915,0.301507538,0.872340426,0.939698492] },
  'spindleback-threadwarden': { size: [440,400], alpha: [0.215909091,0.1825,0.736363636,0.9375] },
  'tithe-mantis': { size: [448,448], alpha: [0.279017857,0.261160714,0.761160714,0.908482143] },
  'briarjaw-ambusher': { size: [370,362], alpha: [0.191891892,0.325966851,0.875675676,0.933701657] },
  'tollbell-penitent': { size: [376,268], alpha: [0.204787234,0.205223881,0.787234043,0.910447761] },
};

/** box is the source image's drawn content rectangle, after object-fit. */
export function natureWardTarget(art:string, box:WardBox):NatureWardTarget {
  const alpha=NATURE_WARD_ACTORS[art]?.alpha ?? [.15,.15,.85,.93];
  const x=box.x+alpha[0]*box.width, y=box.y+alpha[1]*box.height;
  const width=(alpha[2]-alpha[0])*box.width, height=(alpha[3]-alpha[1])*box.height;
  // Preserve the user's accepted mushroom placement and dimensions, expressed
  // relative to its measured opaque body rather than its position in a list.
  if(art==='pleatcap-matriarch')return {
    x:x+width*.505168763233279,
    y:y+height*.46608656174334157,
    width:width*.504808462181734,
    height:height*.8343532460653754,
  };
  return {
    x:x+width*.5,
    y:y+height*.51,
    width:Math.min(width*.72,height*.64),
    height:height*1.04,
  };
}

/** Accepts the transformed <img> element rect and battlefield rect in CSS px.
 * The image uses object-fit:contain/object-position:center. Transform/zoom is
 * already reflected in DOM bounds; dividing once restores effect coordinates. */
export function natureWardTargetForImage(art:string,image:WardRect,arena:WardRect,zoom=1):NatureWardTarget {
  const size=NATURE_WARD_ACTORS[art]?.size ?? [image.width,image.height];
  const fit=Math.min(image.width/size[0],image.height/size[1]);
  const width=size[0]*fit, height=size[1]*fit, scale=zoom>0?zoom:1;
  return natureWardTarget(art,{
    x:(image.left+(image.width-width)/2-arena.left)/scale,
    y:(image.top+(image.height-height)/2-arena.top)/scale,
    width:width/scale,height:height/scale,
  });
}
