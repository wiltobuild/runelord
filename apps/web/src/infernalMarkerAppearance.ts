/** Artwork ranks are decorative and deterministic; they never consume encounter RNG. */
export function infernalMarkerAppearance(kind:string, seed:number, id:string, depthTier:number) {
 let hash=seed>>>0;
 for(const character of id)hash=Math.imul(hash^character.charCodeAt(0),16777619)>>>0;
 const roll=hash%100;
 return { atlas:kind==='combat'?'elite':kind==='elite'?'combat':kind, tier:kind==='combat'?(roll<45?0:roll<90?1:2):depthTier };
}
