// Cache only the existing procedural artwork; motion is still sampled every RAF.
const glows = new Map<string, HTMLCanvasElement>();
export function glowTexture(color: string) {
  let texture = glows.get(color);
  if (!texture) {
    texture = document.createElement('canvas');
    texture.width = texture.height = 128;
    const c = texture.getContext('2d')!;
    const g = c.createRadialGradient(64,64,0,64,64,64);
    g.addColorStop(0,color);g.addColorStop(.25,color+'bb');g.addColorStop(1,color+'00');
    c.fillStyle=g;c.fillRect(0,0,128,128);
    if(glows.size>=32)glows.delete(glows.keys().next().value!);
    glows.set(color,texture);
  }
  return texture;
}
