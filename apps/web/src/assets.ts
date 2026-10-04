import type { DemonGlowSockets } from "./DemonLordGlow";
import { normalizeAssetUrls } from "./baseUrl";
export type Clip = {
  duration: number;
  loop: boolean;
  size?: number[];
  anchor?: number[];
  releaseOrigin?: [number, number];
  events?: {name:string;time_ms:number}[];
  frames: { time: number; body: string; fx?: string }[];
};
export type Assets = {
  images: Record<string, string>;
  cards: Record<string, string>;
  animations: Record<string, Clip>;
  actors: Record<string, {spawnReveal?:"authored";deathEffect?:"fire";effects?:DemonGlowSockets;ranged?:{kind:"flaming-arrow"|"crossbow-bolt"|"demon-bolt";origin:number[];travelMs:number};size:number[];anchor:number[];geometry?:{source_pixels_per_world_unit:number;standing_height_world:number;reference_visible_height_px:number;layout_bounds_px?:number[]};states:Record<string, {duration:number;loop:boolean;impact:number|null;frames:{time:number;src:string;opacity?:number;offsetX?:number;effects?:DemonGlowSockets}[]}>}>;
  music: Record<
    string,
    { url: string; title: string; start: number; end: number }
  >;
};
export async function loadAssets(): Promise<Assets> {
  const response = await fetch(`${import.meta.env.BASE_URL}game-assets/manifest.json`);
  if (!response.ok)
    throw Error("Asset manifest is missing. Run npm run import:assets.");
  return normalizeAssetUrls(await response.json());
}
